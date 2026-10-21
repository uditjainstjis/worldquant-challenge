#!/usr/bin/python3
"""wq-gate: HARD submit gate for WorldQuant BRAIN.
Udit 2026-10-21: "so we have hard hooks or things to not submit below our target with us right and to improve".
BAR = platform self-correlation <= 0.10. Sources: Udit 10-19 "make todays submissions, into 0.0 something";
goal board G3 "10 passing/day at <= 0.10". Never looser. gate/BAR may hold a TIGHTER number (ratchet).
PostToolUse: writes gate/<id>.json ONLY from a canonical probe = a tool call whose input names exactly one
  literal /alphas/<id>/check URL and whose response is the platform's check JSON (SELF_CORRELATION value).
PreToolUse : blocks every POST /alphas/<id>/submit unless that id has a record newer than the last allowed
  submit (every ACTIVE changes everyone's self-corr), younger than 12h, sc <= bar, no IS check FAIL.
Blackout 06:30-12:30 IST always (platform day flips inside it; STATE 10-19).
Exception "unless last hour if day dies for streak" (Udit 10-21): 05:30-06:30 IST, no allowed submit yet for
  that ET day, no FAIL -> allowed above the bar, logged EXCEPTION.
Chrome tool inputs: the word "submit" may appear ONLY inside the literal URL (dynamic API+'/submit', helpers, UI clicks -> blocked).
The probe must poll until SELF_CORRELATION carries a numeric value: a PENDING entry has none (verified 10-21 transcript) -> no record.
NOT covered: a Submit button clicked through the UI via coordinates. Rule: never submit by UI click.
Test: python3 wq-gate.py selftest"""
import json, os, re, sys
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

BAR = 0.10
D = os.environ.get("WQ_GATE_DIR", os.path.expanduser("~/worldquant/.claude/gate"))
IST = timezone(timedelta(hours=5, minutes=30))
now = datetime.fromisoformat(os.environ["WQ_GATE_NOW"]) if os.environ.get("WQ_GATE_NOW") else datetime.now(timezone.utc)
ist = now.astimezone(IST); hm = ist.hour * 60 + ist.minute
et_day = now.astimezone(ZoneInfo("America/New_York")).date().isoformat()
stamp = ist.strftime("%Y-%m-%d %H:%M IST")
P = lambda n: os.path.join(D, n)

def bar():
    try: return min(float(open(P("BAR")).read()), BAR)   # never looser than BAR
    except Exception: return BAR

def block(msg):
    sys.stderr.write("BLOCKED by wq-gate: " + msg + "\n"); sys.exit(2)

def post(d):   # record the platform's own check response
    inp = json.dumps(d.get("tool_input", {}))
    ids = set(re.findall(r"/alphas/([A-Za-z0-9]{6,12})/check", inp))
    if len(ids) != 1: return
    aid = ids.pop(); raw = json.dumps(d.get("tool_response", "")).replace("\\", "")
    i = raw.find('"is"'); seg = raw[i:] if i >= 0 else raw
    j = seg.find('"os"', 4)
    if j > 0: seg = seg[:j]
    checks = {}
    for m in re.finditer(r"\{[^{}]*\}", seg):
        o = m.group(0); n = re.search(r'"name"\s*:\s*"([A-Z_]+)"', o)
        if not n: continue
        r = re.search(r'"result"\s*:\s*"([A-Z]+)"', o); v = re.search(r'"value"\s*:\s*(-?[0-9.]+)', o)
        checks[n.group(1)] = {"result": r.group(1) if r else None, "value": float(v.group(1)) if v else None}
    sc = checks.get("SELF_CORRELATION", {}).get("value")
    if sc is None: return
    fails = [k for k, c in checks.items() if c["result"] == "FAIL"]
    json.dump({"id": aid, "sc": sc, "fails": fails, "checks": checks, "ts": now.timestamp(), "at": stamp}, open(P(aid + ".json"), "w"))
    open(P("measured.log"), "a").write(f"{stamp} {aid} sc={sc} fails={fails} bar={bar()}\n")

def pre(d):
    tool = d.get("tool_name", ""); ti = d.get("tool_input", {})
    inp = ti.get("command", "") if tool == "Bash" else json.dumps(ti)
    lit = re.findall(r"https://api\.worldquantbrain\.com/alphas/([A-Za-z0-9]{6,12})/submit", inp)
    if tool != "Bash" and len(re.findall(r"(?<![A-Za-z])submit", inp, re.I)) > len(lit):   # fail closed: no dynamic URLs, helpers or UI clicks
        block("'submit' appears outside the literal https://api.worldquantbrain.com/alphas/<id>/submit URL; only that literal form is allowed")
    ids = set(lit) if tool != "Bash" else set(re.findall(r"/alphas/([A-Za-z0-9]{6,12})/submit", inp))
    if not ids or "post" not in inp.lower(): return
    if tool == "Bash" and "worldquantbrain" not in inp.lower(): return
    if 390 <= hm < 750: block(f"blackout 06:30-12:30 IST (now {stamp}); the platform day flips inside it")
    try: st = json.load(open(P("state.json")))
    except Exception: st = {"last_submit_ts": 0}
    log = open(P("submits.log")).read() if os.path.exists(P("submits.log")) else ""
    exc_window = 330 <= hm < 390 and (" et=" + et_day + " ") not in log
    b = bar(); lines = []
    for aid in sorted(ids):
        try: rec = json.load(open(P(aid + ".json")))
        except Exception: block(f"{aid} has no gate record. Probe https://api.worldquantbrain.com/alphas/{aid}/check first (literal URL, response returned verbatim)")
        age = now.timestamp() - rec["ts"]
        if rec["ts"] <= st.get("last_submit_ts", 0) or age > 12 * 3600:
            block(f"{aid} record from {rec['at']} is stale (older than the last allowed submit or >12h); re-probe /check")
        if rec["fails"]: block(f"{aid} fails platform checks {rec['fails']}")
        tag = "ok"
        if rec["sc"] > b:
            if not exc_window: block(f"{aid} self-corr {rec['sc']} > bar {b}. Bar never moves; find a better alpha (last-hour streak exception only 05:30-06:30 IST with nothing ACTIVE for ET day {et_day})")
            tag = "EXCEPTION"
        lines.append(f"{stamp} et={et_day} {aid} sc={rec['sc']} bar={b} {tag}\n")
    open(P("submits.log"), "a").write("".join(lines))
    json.dump({"last_submit_ts": now.timestamp(), "last_ids": sorted(ids)}, open(P("state.json"), "w"))

def selftest():
    import subprocess, tempfile
    me = os.path.abspath(__file__); tmp = tempfile.mkdtemp(); res = []
    def run(ev, payload, when="2026-10-22T13:00:00+05:30"):
        e = dict(os.environ, WQ_GATE_DIR=tmp, WQ_GATE_NOW=when)
        p = subprocess.run([sys.executable, me, ev], input=json.dumps(payload), capture_output=True, text=True, env=e)
        return p.returncode, p.stderr.strip()
    js = lambda code: {"tool_name": "mcp__claude-in-chrome__javascript_tool", "tool_input": {"text": code}}
    sub = lambda aid: js(f"fetch('https://api.worldquantbrain.com/alphas/{aid}/submit',{{method:'POST',credentials:'include'}})")
    chk = lambda aid, sc, res="PASS": dict(js(f"fetch('https://api.worldquantbrain.com/alphas/{aid}/check')"),
        tool_response={"content": [{"type": "text", "text": json.dumps({"is": {"checks": [
            {"name": "LOW_SHARPE", "result": "PASS", "limit": 1.25, "value": 2.1},
            {"name": "SELF_CORRELATION", "result": res, "limit": 0.7, "value": sc}]},
            "os": {"checks": [{"name": "SELF_CORRELATION", "result": "PENDING"}]}})}]})
    t = lambda name, got, want: res.append((name, "ok" if got == want else "FAIL", got, want))
    t("1 submit, no record -> block", run("pre", sub("AAAAAAAA"))[0], 2)
    t("2 home-made GATE{} line -> no record", (run("post", dict(js("x"), tool_response='GATE{"id":"AAAAAAAA","sc":0.01}GATE'))[0], os.path.exists(f"{tmp}/AAAAAAAA.json")), (0, False))
    t("3 canonical probe -> record", (run("post", chk("AAAAAAAA", 0.05))[0], os.path.exists(f"{tmp}/AAAAAAAA.json")), (0, True))
    t("4 sc 0.05 -> allow + log", (run("pre", sub("AAAAAAAA"))[0], "AAAAAAAA sc=0.05" in open(f"{tmp}/submits.log").read()), (0, True))
    t("5 same record again (older than last submit) -> block", run("pre", sub("AAAAAAAA"))[0], 2)
    run("post", chk("BBBBBBBB", 0.22, "PASS"), "2026-10-22T13:05:00+05:30")
    t("6 sc 0.22 -> block", run("pre", sub("BBBBBBBB"), "2026-10-22T13:06:00+05:30")[0], 2)
    t("7 blackout 09:00 IST -> block", run("pre", sub("BBBBBBBB"), "2026-10-22T09:00:00+05:30")[0], 2)
    run("post", chk("CCCCCCCC", 0.3), "2026-10-24T05:40:00+05:30")
    t("8 05:45 IST, ET day unsubmitted, sc 0.3 -> EXCEPTION", (run("pre", sub("CCCCCCCC"), "2026-10-24T05:45:00+05:30")[0], "EXCEPTION" in open(f"{tmp}/submits.log").read()), (0, True))
    run("post", chk("DDDDDDDD", 0.3), "2026-10-24T05:50:00+05:30")
    t("9 05:55 IST, ET day already has one -> block", run("pre", sub("DDDDDDDD"), "2026-10-24T05:55:00+05:30")[0], 2)
    run("post", chk("EEEEEEEE", 0.05, "FAIL"), "2026-10-23T14:00:00+05:30")
    t("10 FAIL check -> block", run("pre", sub("EEEEEEEE"), "2026-10-23T14:01:00+05:30")[0], 2)
    t("11 GET poll of /submit (no POST) -> pass through", run("pre", js("fetch('https://api.worldquantbrain.com/alphas/EEEEEEEE/submit')"))[0], 0)
    t("12 dynamic URL POST -> block", run("pre", js("fetch(API+'/alphas/'+id+'/submit',{method:'POST'})"))[0], 2)
    t("13 helper __submit(id) -> block", run("pre", js("__submit('AAAAAAAA')"))[0], 2)
    t("14 field name dateSubmitted -> pass", run("pre", js("fetch('https://api.worldquantbrain.com/users/self/alphas?order=-dateSubmitted').then(r=>r.json()).then(j=>j.results.map(a=>a.dateSubmitted))"))[0], 0)
    for r in res: print(*r)
    sys.exit(1 if any(r[1] == "FAIL" for r in res) else 0)

if __name__ == "__main__":
    ev = (sys.argv[1:] or [""])[0].lower()
    if ev == "selftest": selftest()
    d = json.load(sys.stdin); ev = ev or d.get("hook_event_name", "").lower()
    os.makedirs(D, exist_ok=True)
    (post if ev.startswith("post") else pre)(d)
