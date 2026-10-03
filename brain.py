"""WorldQuant BRAIN API client — minimal, robust, session-cached.
Credentials: ~/.brain_credentials = ["email", "password"] (created by Udit, never by Claude).
"""
import json, os, time, sqlite3, pathlib, datetime as dt
import requests

API = "https://api.worldquantbrain.com"
HOME = pathlib.Path.home()
CRED = HOME / ".brain_credentials"
DB = pathlib.Path(__file__).parent / "db.sqlite"
(pathlib.Path(__file__).parent / "log").mkdir(exist_ok=True)

DEFAULT_SETTINGS = dict(instrumentType="EQUITY", region="USA", universe="TOP1000", delay=1, decay=0,
                        neutralization="SUBINDUSTRY", truncation=0.08, pasteurization="ON", unitHandling="VERIFY",
                        nanHandling="OFF", language="FASTEXPR", visualization=False)


class Brain:
    def __init__(self):
        self.s = requests.Session()
        self.login()

    def login(self):
        if os.environ.get("BRAIN_EMAIL") and os.environ.get("BRAIN_PASSWORD"):
            email, pw = os.environ["BRAIN_EMAIL"], os.environ["BRAIN_PASSWORD"]   # cloud routine: env vars
        else:
            email, pw = json.load(open(CRED))                                      # Mac: ~/.brain_credentials
        r = self.s.post(API + "/authentication", auth=(email, pw), timeout=30)
        if r.status_code == 401 and "WWW-Authenticate" in r.headers and "persona" in r.headers["WWW-Authenticate"]:
            raise RuntimeError("Biometric/persona re-auth required: " + r.headers["WWW-Authenticate"])
        r.raise_for_status()
        self.auth_time = time.time()

    def _req(self, method, path, **kw):
        for attempt in range(3):
            r = self.s.request(method, API + path if path.startswith("/") else path, timeout=60, **kw)
            if r.status_code == 401:
                self.login(); continue
            if r.status_code == 429 and method == "GET":
                time.sleep(float(r.headers.get("Retry-After", 2))); continue
            return r
        return r

    def get(self, path, **kw): return self._req("GET", path, **kw)
    def post(self, path, **kw): return self._req("POST", path, **kw)
    def patch(self, path, **kw): return self._req("PATCH", path, **kw)

    # ---- data ----
    def fields(self, dataset, region="USA", universe="TOP3000", delay=1):
        out, off = [], 0
        while True:
            r = self.get(f"/data-fields?instrumentType=EQUITY&region={region}&delay={delay}&universe={universe}&dataset.id={dataset}&limit=50&offset={off}").json()
            out += r.get("results", [])
            if len(r.get("results", [])) < 50: break
            off += 50
        return out

    def datasets(self, region="USA", universe="TOP3000", delay=1):
        return self.get(f"/data-sets?instrumentType=EQUITY&region={region}&delay={delay}&universe={universe}&limit=50").json()["results"]

    # ---- simulation ----
    def start_sim(self, expr, settings):
        body = {"type": "REGULAR", "settings": settings, "regular": expr}
        r = self.post("/simulations", json=body)
        if r.status_code == 201: return r.headers["Location"]
        if r.status_code == 429: return None            # CONCURRENT_SIMULATION_LIMIT_EXCEEDED
        raise RuntimeError(f"POST /simulations {r.status_code}: {r.text[:200]}")

    def poll_sim(self, loc):
        r = self.get(loc)
        if r.status_code == 429: return None
        j = r.json()
        if j.get("status") in (None, "RUNNING") and "alpha" not in j: return None
        return j

    def alpha(self, aid): return self.get(f"/alphas/{aid}").json()

    def run_batch(self, items, slots=3, on_result=None, tick=5.0):
        """items: list of dict(expr, settings, tag). Yields result records as they finish."""
        queue = list(items); running = []
        while queue or running:
            for run in list(running):
                j = self.poll_sim(run["loc"])
                if j is None: continue
                rec = dict(tag=run["tag"], expr=run["expr"], settings=run["settings"], status=j.get("status"),
                           secs=round(time.time() - run["t0"]))
                if j.get("alpha"):
                    a = self.alpha(j["alpha"]); rec.update(summarize(a))
                else:
                    rec["msg"] = (j.get("message") or "")[:200]
                running.remove(run); save_result(rec)
                if on_result: on_result(rec)
                yield rec
            while queue and len(running) < slots:
                it = queue[0]
                try: loc = self.start_sim(it["expr"], it["settings"])
                except RuntimeError as e:
                    queue.pop(0); rec = dict(tag=it["tag"], expr=it["expr"], settings=it["settings"], status="POSTERR", msg=str(e)[:200]); save_result(rec); yield rec; continue
                if loc is None: break
                queue.pop(0); running.append(dict(loc=loc, t0=time.time(), **it))
            time.sleep(tick)

    # ---- submission ----
    def submit(self, aid, timeout=1800):
        r = self.post(f"/alphas/{aid}/submit")
        t0 = time.time()
        while time.time() - t0 < timeout:
            r = self.get(f"/alphas/{aid}/submit")
            if r.status_code == 200 and r.text.strip():
                return r.json()
            if r.status_code not in (200, 429): return dict(status=r.status_code, text=r.text[:300])
            time.sleep(float(r.headers.get("Retry-After", 5)))
        return dict(status="TIMEOUT")

    def set_properties(self, aid, name=None, color=None, tags=None, description=None):
        body = {}
        if name: body["name"] = name
        if color: body["color"] = color
        if tags is not None: body["tags"] = tags
        if description: body["regular"] = {"description": description}
        return self.patch(f"/alphas/{aid}", json=body).json()

    def leaderboard(self, limit=100, offset=0):
        return self.get(f"/competitions/challenge/boards/leader?limit={limit}&offset={offset}&aggregate=user").json()

    def me(self): return self.get("/competitions/challenge").json()


def summarize(a):
    is_ = a.get("is") or {}
    checks = {c["name"]: c for c in is_.get("checks", [])}
    return dict(id=a["id"], sharpe=is_.get("sharpe"), fitness=is_.get("fitness"), turnover=is_.get("turnover"),
                returns=is_.get("returns"), drawdown=is_.get("drawdown"), margin=is_.get("margin"),
                fails=[n for n, c in checks.items() if c["result"] == "FAIL"],
                subuni=checks.get("LOW_SUB_UNIVERSE_SHARPE", {}).get("value"),
                conc=checks.get("CONCENTRATED_WEIGHT", {}).get("value"))


def db():
    c = sqlite3.connect(DB)
    c.execute("""create table if not exists results(ts text, tag text, expr text, settings text, status text, id text,
                 sharpe real, fitness real, turnover real, returns real, drawdown real, margin real, fails text, subuni real, conc real, secs int, msg text)""")
    c.execute("create table if not exists board(ts text, rank int, user text, score int, alphas int)")
    c.execute("create table if not exists submissions(ts text, id text, expr text, settings text, result text)")
    return c


def save_result(rec):
    with open(pathlib.Path(__file__).parent / "log" / "results.jsonl", "a") as f:
        f.write(json.dumps(dict(rec, ts=dt.datetime.utcnow().isoformat()), default=str) + "\n")
    c = db()
    c.execute("insert into results values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
              (dt.datetime.utcnow().isoformat(), rec.get("tag"), rec.get("expr"), json.dumps(rec.get("settings")), rec.get("status"),
               rec.get("id"), rec.get("sharpe"), rec.get("fitness"), rec.get("turnover"), rec.get("returns"), rec.get("drawdown"),
               rec.get("margin"), json.dumps(rec.get("fails")), rec.get("subuni"), rec.get("conc"), rec.get("secs"), rec.get("msg")))
    c.commit(); c.close()


def snapshot_board(b, n=300):
    c = db(); ts = dt.datetime.utcnow().isoformat()
    for off in range(0, n, 100):
        for r in b.leaderboard(100, off)["results"]:
            c.execute("insert into board values(?,?,?,?,?)", (ts, r["rank"], r["user"]["id"], r["score"], r["alphas"]))
    me = b.me()["leaderboard"]
    c.execute("insert into board values(?,?,?,?,?)", (ts, me["rank"], me["user"]["id"], me["score"], me["alphas"]))
    c.commit(); c.close()
    return me


if __name__ == "__main__":
    b = Brain()
    print(json.dumps(b.me()["leaderboard"], indent=1))
