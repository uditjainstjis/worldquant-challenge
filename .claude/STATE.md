# STATE — worldquant Challenge. Canonical, current. Rewritten 2026-10-01.

## Objective (Udit, 2026-10-01): rank 1 on the WorldQuant BRAIN Challenge leaderboard. Autonomous.
## Governing numbers (2026-10-03)
- Me: 10-07: score 7,663 (day 6 = 1,875), rank 21,622, SILVER; day 7 alpha 786zkWWv ACTIVE. #1 992,568/688 (+7,644 in 6 days = 1,274/day). Shelf EMPTY.
- Me: 10-06: score 5,788, rank 22,997, SILVER; day 6 alpha 3qVAPoYQ ACTIVE. SHELF NOW EMPTY (tangibility burnt) -> next session = research day.
- (older) Me: UJ82561, score 3,910 on 10-05 (day1 2,000 + day3 1,910), rank 24,984, BRONZE. Missed days: 10-02, 10-04 (0 each). Day 5: 1 alpha ACTIVE (skew lane).
- #1 JY12161 (JP) 984,924 / 684 on 10-03 (982,924 / 683 on 10-01) => leader rate ~1,000/day => catch-up ~983 days at 2,000/day. #2 EC33137 745,952 / 396.
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
| 2026-10-02 | — | NO SUBMISSION (session ended) | | | | | 0 points |
| 2026-10-03 | QPKq3a2Q | group_rank(est_eps/close, industry)*rank(ts_mean(volume,5)/ts_mean(volume,60))*rank(adv20) | USA TOP3000 D1 INDUSTRY decay 8 | 1.30 | 1.14 | 0.10 | ACTIVE (self-corr 0.41) -> scored 1,910 |
| 2026-10-04 | — | NO SUBMISSION (extension down, no creds, env unconfigured) | | | | | 0 points |
| 2026-10-07 | 786zkWWv | group_rank(debt/assets, subindustry)*rank(ts_mean(volume,5)/ts_mean(volume,60))*rank(adv20) | USA TOP3000 D1 SUBINDUSTRY decay 10 | 1.50 | 1.21 | 0.10 | ACTIVE (self-corr 0.69) |
| 2026-10-06 | 3qVAPoYQ | group_rank(sales/assets, subindustry)*rank(ts_mean(volume,5)/ts_mean(volume,60))*rank(adv20) | USA TOP3000 D1 SUBINDUSTRY decay 10 | 1.61 | 1.22 | 0.10 | ACTIVE (self-corr 0.62) |
| 2026-10-05 | vR2xOrRz | group_rank(-ts_mean(power(returns,3),60)/power(ts_std_dev(returns,60),3), subindustry)*rank(ts_mean(volume,5)/ts_mean(volume,60))*rank(adv20) | USA TOP3000 D1 SUBINDUSTRY decay 10 | 1.29 | 1.00 | 0.11 | ACTIVE (self-corr 0.55) |
## Families measured (TOP3000 D1 unless noted) — what works in this IS window (2019-)
- WORKS (lanes, all TOP3000 D1 x rank(vol5/vol60) x rank(adv20)): (4) return SKEWNESS 60d, subindustry, d10: 1.29/1.00, self-corr 0.55 (submitted 10-05). (5) ASSET TURNOVER sales/assets, subindustry, d10: 1.61/1.22, self-corr 0.62 -> SHELF for 10-06. (6) TANGIBILITY ppent/assets, subindustry, d10: 1.41/1.08, self-corr 0.59 vs board BUT 0.67 PnL-corr with (5). Self-corr is checked against EVERY prior submission, so once (5) is on the board (6) faces 0.67 permanently -> treat (6) as BURNT unless a variant measures < 0.65 against 3qVAPoYQ (INDUSTRY grouping did not help: 0.668). Blocked by self-corr: every reversal costume (1-day, intraday, range-position, vol-scaled: 0.80-0.95 vs #1), sales/cap 0.80 vs #3, fwdEY+cp60 0.88, skew+cp60 0.78, cp60 INDUSTRY 0.95 vs #2.
- WORKS: (3) forward earnings yield group_rank(est_eps/close, industry) x volume burst x rank(adv20) liquidity tilt, decay 8: Sharpe 1.30 fit 1.14 TO 0.10 (without adv20: 1.21/1.08 fails Sharpe; trailing EY added HURTS 0.76; sector neutralization 1.02). (1) short-term reversal x abnormal volume (rev3/rev5 * vol5/vol60), decay 6-10: Sharpe 1.9-2.1, fit 1.2-1.4. Smaller universes FAIL fitness (TOP1000 0.81). (2) option call-put IV spread (60d) 10-day mean x abnormal volume, decay 10-12: Sharpe 1.6-1.7, fit 1.02-1.06; without the volume factor it fails sub-universe Sharpe (0.32 vs 0.76) because the spread signal lives in small caps.
- NEAR MISS (next targets): return skewness x volume 1.23/0.81; fwd earnings yield est_eps/close 1.07/0.84 (TO 0.04); IV 5-day CHANGE positive 1.36 (TO 0.59); vwap reversal 1.86 at TO 1.29. Abnormal-volume factor rank(vol5/vol60) is the universal fitness booster here.
- Self-correlation between the two submitted families: 0.45. Same-family variants (vwap/rel reversal) are 0.76 vs #1 -> blocked.
- DEAD (10-05, all x vol x adv): PEAD/abnormal_return_earnings_release 0.94, eps surprise chg 0.97, estimate dispersion 0.35, consensus rating 0.74, distress (weak, below 0.9), torpedo 0.93, fwd CF/price 0.93, earnings-momentum score 0.48, customer/partner/competitor lead-lag momentum 0.87-1.10, peer gap 1.39/0.97 (reversal-ish), seasonality 0.27, attention-only 0.70, ROA 0.48, gross profitability 0.90, CFO/assets 0.69, margin chg 0.47, SGA 1.15/0.82, cash conversion 1.22/0.82, inventory chg 1.07, goodwill, cash/assets, employee growth, interest coverage, share turnover, low-beta/idio/systematic (model51). Regions other than USA: not available to this account.
- DEAD (|Sharpe|<0.7): value ratios, model16 scores, low-volatility (~0), size/amihud (liquid wins), leverage/capex, analyst EPS revisions (ts_delta(est_eps,20)/close -0.09), news/social sentiment sums (all <0.7), momentum 12-1 (~0), PCR / IV term structure / VRP / IV skew level (~0).
- Plain reversal rev5 without volume: Sharpe 1.2-1.6 but fitness 0.77-0.91 -> fails. vwap reversal Sharpe 1.86 at turnover 1.29.
## Live (as of 2026-10-05 16:10 EDT)
- Day 5 submitted via browser (vR2xOrRz). SHELF (shelf.json): asset_turn READY for 10-06 (3qVAPoYQ already simulated: submit = self-corr check + POST /alphas/3qVAPoYQ/submit), tangibility READY-but-borderline. TOMORROW NEEDS AN OPERATOR: cloud env still unconfigured (all routine runs = NO CREDENTIALS), browser session may expire (it did after ~2 days), Mac has no creds. Routine cron now 0 3,9,20 UTC.
## Live (older, 2026-10-03 09:00 EDT)
- CLOUD ROUTINE created: "WorldQuant Challenge daily alpha", id trig_01LgLcSGdbdf3vjBbXv55YnQ, cron `0 9,20 * * *` UTC (05:00 + 16:00 EDT retry), model Opus 5.5, env env_011ymAdCoHhzXYV4xpqmmVrq, no MCP connectors. https://claude.ai/code/routines/trig_01LgLcSGdbdf3vjBbXv55YnQ . It clones the PUBLIC repo github.com/uditjainstjis/worldquant-challenge and runs daily.py --n 1.
- BLOCKED until Udit sets, in the cloud environment (claude.ai/code -> environment "Default" -> edit): Network access = Custom + `api.worldquantbrain.com`; Environment variables `BRAIN_EMAIL`, `BRAIN_PASSWORD`, `BASH_DEFAULT_TIMEOUT_MS=600000`. Claude must never enter these.
- Repo is PUBLIC (needed for an unauthenticated clone; GitHub App not installed). Pushes from the cloud will fail until Udit installs the Claude GitHub App; then flip the repo private. Alpha expressions are therefore visible publicly for now.
- 2026-10-03 EST: DONE via browser (QPKq3a2Q ACTIVE 09:30 EDT). Browser session was alive after all (/users/self 200; /sign-up redirects are transient). Mac has no credentials; GPU box unreachable. Routine fires 20:06 UTC today and will no-op if env configured (already submitted) or fail NO CREDENTIALS otherwise.
- Wave D/F2 (10-03): IV-change x vol 0.86-1.15 (weak), rev7 MARKET x vol10 1.07/0.85, skew x vol10 1.18/0.80 — none pass; fwd-EY family is the 3rd passer.
- LEARN.md = Udit's zero-to-submission course (he asked 2026-10-03 to be taught); keep it current, one lesson per real alpha.
- Debug a run: RemoteTrigger list_runs -> get_run_log.
## Design risks / plan
- #1 RISK: both submitted alphas and every daily.py candidate share rank(ts_mean(volume,5)/ts_mean(volume,60)). Self-corr is checked against EVERY prior submission (max), so it climbs daily; daily.py likely runs dry within ~a week without volume-free lanes. Seeds for volume-free families: IV 5-day change (+1.36 Sharpe, TO 0.59, needs decay), fwd EY with industry neutralization (1.06/0.92), reversal with INDUSTRY/MARKET neutralization, other regions (EUR/ASI/CHN universes untested).
- CALIBRATION DONE: day 1 (2 alphas, fit 1.42+1.06) = 2,000; day 3 (1 alpha, fit 1.14) = 1,910. => one alpha ~ 95% of the cap; a second alpha is worth ~90 pts/day. Standing target: 1/day guaranteed, 2nd only if a low-self-corr passer is already on the shelf.
- OPEN FORK (Udit's call): Gold (10,000 pts, ~5 days) may trigger a consultant invitation; whether accepting removes him from the Challenge board is unresolved (leader kept scoring past Gold, so probably not).
## Data quirks
- `dateSubmitted` on alphas reads 1-3 h EARLIER than the real submit time (XgJ5e7w5 13:32 vs real 14:41 EDT; QPKq3a2Q 09:30 vs real 09:53). daily.py's submitted_today keys off it: safe at 05:00/16:00 EDT fires, NEVER schedule a run within 3 h of midnight Eastern.
