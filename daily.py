"""Daily Challenge loop: make sure ONE (or N) qualifying alpha is submitted every EST day.

Run once per day (cron/launchd at ~05:00 EST, after the 03:00 board refresh), or in a while-loop with --loop.
Needs ~/.brain_credentials (created by Udit). Logs to db.sqlite + log/daily.log.

Decision flow
  1. snapshot leaderboard (measures leader rate) and my score.
  2. if an alpha was already submitted today (EST) -> exit (unless --n > count).
  3. build candidate batch from FAMILIES (families measured to work, see .claude/STATE.md), rotating parameters
     so successive days differ; run through 3 simulation slots.
  4. keep candidates with zero failed IS checks; for each, fetch /correlations/self and require max < SELF_CORR_MAX.
  5. submit the highest-fitness survivor; poll until ACTIVE; log. Repeat up to --n per day.
  6. if nothing passes after the batch, run the EXPLORE batch (new templates) — never end a day without trying.
"""
import argparse, datetime as dt, json, random, sys, time, pathlib, zoneinfo
from brain import Brain, DEFAULT_SETTINGS, db, snapshot_board, save_result

EST = zoneinfo.ZoneInfo("America/New_York")
LOG = pathlib.Path(__file__).parent / "log"; LOG.mkdir(exist_ok=True)
SELF_CORR_MAX = 0.65          # platform limit is 0.70; keep margin
SLOTS = 3


def log(msg):
    line = f"{dt.datetime.now(EST):%Y-%m-%d %H:%M:%S} EST  {msg}"
    print(line, flush=True)
    with open(LOG / "daily.log", "a") as f: f.write(line + "\n")


def S(universe="TOP3000", neut="SUBINDUSTRY", decay=0, trunc=0.08):
    s = dict(DEFAULT_SETTINGS); s.update(universe=universe, neutralization=neut, decay=decay, truncation=trunc); return s


# ---- families measured to pass (2026-10-01). Each entry: tag, expr, settings. Parameters rotate daily. ----
def family_reversal_volume(day):
    rw = [3, 5, 7][day % 3]; vw = [(5, 60), (5, 40), (3, 60), (10, 60)][day % 4]; dec = [8, 10, 6, 12][day % 4]
    neut = ["SUBINDUSTRY", "INDUSTRY"][day % 2]
    out = []
    out.append((f"RV:r{rw}_v{vw[0]}_{vw[1]}_d{dec}", f"rank(-ts_delta(close,{rw}))*rank(ts_mean(volume,{vw[0]})/ts_mean(volume,{vw[1]}))", S(neut=neut, decay=dec)))
    out.append((f"RV:r{rw}rel_d{dec}", f"rank(-ts_delta(close,{rw})/close)*rank(ts_mean(volume,{vw[0]})/ts_mean(volume,{vw[1]}))", S(neut=neut, decay=dec)))
    out.append((f"RV:vwap_d{dec+2}", f"rank(-(close/vwap-1))*rank(ts_mean(volume,{vw[0]})/ts_mean(volume,{vw[1]}))", S(neut=neut, decay=dec + 2)))
    out.append((f"RV:r{rw}_adv_d{dec}", f"rank(-ts_delta(close,{rw}))*rank(ts_mean(volume,{vw[0]})/adv20)", S(neut=neut, decay=dec)))
    return out


def family_options(day):
    m = [60, 30, 90][day % 3]; w = [10, 20][day % 2]
    cp = f"(implied_volatility_call_{m}-implied_volatility_put_{m})"
    return [
        (f"OP:cp{m}m{w}", f"group_rank(ts_mean({cp},{w}), subindustry)", S(decay=10)),
        (f"OP:cp{m}m{w}_xvol", f"group_rank(ts_mean({cp},{w}), subindustry)*rank(ts_mean(volume,5)/ts_mean(volume,60))", S(decay=10)),
    ]


def family_explore(day):
    """Templates not yet measured to pass — one or two per day so the library grows."""
    pool = [
        ("EX:skew60", "rank(-ts_mean(power(returns,3),60)/power(ts_std_dev(returns,60),3))*rank(ts_mean(volume,5)/ts_mean(volume,60))", S(decay=10)),
        ("EX:fwdey_ind", "group_rank(est_eps/close, industry)*rank(-ts_delta(close,5))", S(neut="INDUSTRY", decay=8)),
        ("EX:pvcorr", "group_rank(-ts_corr(close,volume,20), subindustry)*rank(ts_mean(volume,5)/ts_mean(volume,60))", S(decay=8)),
        ("EX:news", "group_rank(ts_sum(ts_backfill(mean_composite_sentiment_score,5),10), subindustry)*rank(ts_mean(volume,5)/ts_mean(volume,60))", S(decay=8)),
        # ---- volume-FREE lane (self-corr anchor risk: every submitted alpha so far shares the vol5/vol60 factor) ----
        ("EXV:divchg", "group_rank(ts_mean(ts_delta(implied_volatility_mean_30,5),5), subindustry)", S(decay=12)),
        ("EXV:fwdey_ind", "group_rank(est_eps/close, industry)", S(neut="INDUSTRY", decay=5)),
        ("EXV:rev3_ind", "group_rank(-ts_delta(close,3), industry)", S(neut="INDUSTRY", decay=10)),
        ("EXV:cp60_ind", "group_rank(ts_mean((implied_volatility_call_60-implied_volatility_put_60),10), industry)", S(neut="INDUSTRY", decay=10)),
    ]
    random.Random(day).shuffle(pool)
    vol_free = [p for p in pool if p[0].startswith('EXV:')]
    return pool[:2] + vol_free[:1]


def candidates(day):
    return family_reversal_volume(day) + family_options(day) + family_explore(day)


def submitted_today(b):
    today = dt.datetime.now(EST).date()
    r = b.get("/users/self/alphas?status=ACTIVE&limit=50&order=-dateSubmitted").json()
    n = 0
    for a in r.get("results", []):
        ds = a.get("dateSubmitted")
        if ds and dt.datetime.fromisoformat(ds).astimezone(EST).date() == today: n += 1
    return n


def self_corr_max(b, aid, timeout=300):
    t0 = time.time()
    while time.time() - t0 < timeout:
        r = b.get(f"/alphas/{aid}/correlations/self")
        if r.status_code == 200 and r.text.strip():
            j = r.json()
            if j.get("records") is not None: return j.get("max") or 0.0
        time.sleep(float(r.headers.get("Retry-After", 3)))
    return None


def run_day(b, n_target=1, dry=False):
    me = snapshot_board(b); log(f"board: rank {me['rank']} score {me['score']} alphas {me['alphas']}")
    have = submitted_today(b); log(f"submitted today: {have} / target {n_target}")
    if have >= n_target: return
    day = (dt.datetime.now(EST).date() - dt.date(2026, 10, 1)).days
    items = [dict(tag=t, expr=e, settings=s) for t, e, s in candidates(day)]
    log(f"day {day}: {len(items)} candidates")
    passing = []
    for rec in b.run_batch(items, slots=SLOTS):
        log(f"  {rec['tag']}: sh {rec.get('sharpe')} fit {rec.get('fitness')} to {rec.get('turnover')} fails {rec.get('fails')} {rec.get('msg','')}")
        if rec.get("id") and not rec.get("fails"): passing.append(rec)
    passing.sort(key=lambda r: -(r["fitness"] or 0))
    for rec in passing:
        if have >= n_target: break
        sc = self_corr_max(b, rec["id"]); log(f"  self-corr {rec['tag']} = {sc}")
        if sc is None or sc >= SELF_CORR_MAX: continue
        if dry: log(f"  DRY: would submit {rec['id']} {rec['expr']}"); have += 1; continue
        res = b.submit(rec["id"]); a = b.alpha(rec["id"])
        ok = a.get("status") == "ACTIVE"
        log(f"  SUBMIT {rec['id']} -> {a.get('status')} :: {json.dumps(res)[:300]}")
        c = db(); c.execute("insert into submissions values(?,?,?,?,?)", (dt.datetime.utcnow().isoformat(), rec["id"], rec["expr"], json.dumps(rec["settings"]), json.dumps(res)[:2000])); c.commit(); c.close()
        if ok: have += 1
    if have == 0: log("!! NO SUBMISSION TODAY — all candidates failed. Extend families.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); ap.add_argument("--n", type=int, default=1); ap.add_argument("--dry", action="store_true"); ap.add_argument("--loop", action="store_true")
    a = ap.parse_args()
    b = Brain()
    while True:
        try: run_day(b, a.n, a.dry)
        except Exception as e: log(f"ERROR {type(e).__name__}: {e}")
        if not a.loop: break
        # sleep until 05:00 EST next day
        now = dt.datetime.now(EST); nxt = (now + dt.timedelta(days=1)).replace(hour=5, minute=0, second=0, microsecond=0)
        log(f"sleeping until {nxt}"); time.sleep((nxt - now).total_seconds())
