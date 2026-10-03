# STATE — worldquant Challenge. Canonical, current. Rewritten 2026-10-01.

## Objective (Udit, 2026-10-01): rank 1 on the WorldQuant BRAIN Challenge leaderboard. Autonomous.
## Governing numbers (2026-10-01)
- Me: UJ82561, score 0, rank 64,290 of 169,651. 6 UNSUBMITTED alphas (Apr 2026), none pass checks.
- #1 JY12161 (JP) 982,924 pts / 683 alphas. #2 742,130 / 394. #3 411,467 / 325. #100 150,749 / 106.
- Scoring: PER DAY (EST), cap 2,000/day, never decreases, 1-2 alphas/day typically hits cap.
  Quality factor: smaller universe ↑, self-corr ↓, fitness ↑, D1 > D0. Quantity factor: more alphas/day ↑.
  Both normalized across users submitting that day. Board refresh 03:00 EST.
- Arithmetic: 982,924 / 2,000 = 492 perfect days minimum, leader still active. (bound under adversarial test — see LEDGER)
- Levels: Bronze >1k, Silver >5k, Gold >10k (Gold -> consultant invitation eligibility).
- Submission checks (USA TOP3000 D1): Sharpe>=1.25, fitness>=1, turnover 0.01-0.70, sub-universe Sharpe>=0.79, concentrated weight, self-corr<0.7 (at submit), prod-corr (at submit).
- API: api.worldquantbrain.com; works from the logged-in Chrome tab via fetch(credentials:'include').
  Leaderboard: /competitions/challenge/boards/leader?limit=100&offset=N&aggregate=user
  66 operators (/operators). USA D1: 16 datasets, 7,642 fields (TOP3000); same 16 datasets on TOP200/TOP500.
## Measured limits (2026-10-01, first-hand)
- 3 concurrent simulation slots (4th POST -> 429 CONCURRENT_SIMULATION_LIMIT_EXCEEDED). Multi-sim (array POST) -> 403. ~2.5 min/sim => ~70 sims/hour.
- USA universes: TOP3000, TOP1000, TOP500, TOP200, TOPSP500. (MINVOL1M / ILLIQUID_MINVOL1M not available for USA.)
- Checks seen on every universe: LOW_SHARPE 1.25, LOW_FITNESS 1, turnover 0.01-0.70, CONCENTRATED_WEIGHT 0.1, LOW_SUB_UNIVERSE_SHARPE (limit ~= 0.43 x alpha's own Sharpe), SELF_CORRELATION, MATCHES_COMPETITION.
- JS tool output truncates ~1,500 chars; bulk reads = inject <pre> into page, read with get_page_text.
- Price-reversal probes (rank(-ts_delta(close,5))): TOP3000 Sharpe 1.45 fit 0.78; TOP500 1.23/0.66; TOPSP500 1.19/0.59. Fitness is the binding check.
## Submitted alphas (Challenge)
| date (EST) | id | expr | settings | Sharpe | fit | TO | status |
|---|---|---|---|---|---|---|---|
| 2026-10-01 | XgJ5e7w5 | rank(-ts_delta(close,3))*rank(ts_mean(volume,5)/ts_mean(volume,60)) | USA TOP3000 D1 SUBINDUSTRY decay 8 trunc 0.08 | 2.14 | 1.42 | 0.27 | ACTIVE |
| 2026-10-01 | A1vMp7Al | group_rank(ts_mean((implied_volatility_call_60-implied_volatility_put_60),10), subindustry)*rank(ts_mean(volume,5)/ts_mean(volume,60)) | USA TOP3000 D1 SUBINDUSTRY decay 12 | 1.66 | 1.06 | 0.14 | ACTIVE (self-corr 0.45) |
## Families measured (TOP3000 D1 unless noted) — what works in this IS window (2019-)
- WORKS: (1) short-term reversal x abnormal volume (rev3/rev5 * vol5/vol60), decay 6-10: Sharpe 1.9-2.1, fit 1.2-1.4. Smaller universes FAIL fitness (TOP1000 0.81). (2) option call-put IV spread (60d) 10-day mean x abnormal volume, decay 10-12: Sharpe 1.6-1.7, fit 1.02-1.06; without the volume factor it fails sub-universe Sharpe (0.32 vs 0.76) because the spread signal lives in small caps.
- NEAR MISS (next targets): return skewness x volume 1.23/0.81; fwd earnings yield est_eps/close 1.07/0.84 (TO 0.04); IV 5-day CHANGE positive 1.36 (TO 0.59); vwap reversal 1.86 at TO 1.29. Abnormal-volume factor rank(vol5/vol60) is the universal fitness booster here.
- Self-correlation between the two submitted families: 0.45. Same-family variants (vwap/rel reversal) are 0.76 vs #1 -> blocked.
- DEAD (|Sharpe|<0.7): value ratios, model16 scores, low-volatility (~0), size/amihud (liquid wins), leverage/capex, analyst EPS revisions (ts_delta(est_eps,20)/close -0.09), news/social sentiment sums (all <0.7), momentum 12-1 (~0), PCR / IV term structure / VRP / IV skew level (~0).
- Plain reversal rev5 without volume: Sharpe 1.2-1.6 but fitness 0.77-0.91 -> fails. vwap reversal Sharpe 1.86 at turnover 1.29.
## Live (as of 17:35 EDT 2026-10-01 / 03:05 IST 2026-10-02)
- NOTHING running. Browser session closed; keep_visible.sh and caffeinate killed. All ~150 simulations done; 2 alphas ACTIVE (table above). Score posts 03:00 EST 2026-10-02 = 12:30 IST.
- brain.py (API client) + daily.py (daily loop) written and syntax-checked, NOT yet run: needs ~/.brain_credentials = ["email","password"] created by Udit (never by Claude). GPU box unreachable (ssh timeout) -> loop host = Mac via launchd (with caffeinate) or a cloud VM.
- Browser-driven path is FRAGILE: Chrome freezes hidden/occluded tabs (timers+fetch pause) — cost ~1 hour today. Use it only when the screen shows Chrome.
## Design risks / plan
- #1 RISK: both submitted alphas and every daily.py candidate share rank(ts_mean(volume,5)/ts_mean(volume,60)). Self-corr is checked against EVERY prior submission (max), so it climbs daily; daily.py likely runs dry within ~a week without volume-free lanes. Seeds for volume-free families: IV 5-day change (+1.36 Sharpe, TO 0.59, needs decay), fwd EY with industry neutralization (1.06/0.92), reversal with INDUSTRY/MARKET neutralization, other regions (EUR/ASI/CHN universes untested).
- CALIBRATION: day 1 (10-01) = 2 alphas. Day 2 target = 1 alpha. Compare the two daily scores (board 03:00 EST) before fixing the standing daily target.
- OPEN FORK (Udit's call): Gold (10,000 pts, ~5 days) may trigger a consultant invitation; whether accepting removes him from the Challenge board is unresolved (leader kept scoring past Gold, so probably not).
