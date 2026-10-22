# WQ LOCAL ENGINE — GPU screener for WorldQuant BRAIN Challenge alphas (brief for the build agent)

## Goal (asserted reachable; work backwards from it)
By tonight: a local, GPU-vectorised backtester that reproduces BRAIN's in-sample numbers for price/volume alphas well enough
to RANK candidates (Spearman >= 0.5 vs BRAIN Sharpe on the ~120 known expressions in calib.json), then a search that emits
>= 30 FASTEXPR expressions/day which BRAIN later confirms at: Sharpe >= 1.25, fitness >= 1.0, turnover 0.01-0.70,
sub-universe (TOP1000) Sharpe >= 0.435 x Sharpe, and max PnL correlation with the 28 active alphas <= 0.10.
Why believe it: formulaic alpha mining on US daily data (Alpha101 2016; AlphaGen, Yu et al. KDD 2023) routinely yields dozens
of low-mutual-correlation formulas with IS Sharpe > 1.5. Our 28-alpha book was found BY HAND at 70 simulations/hour on BRAIN;
you have ~10^4 x that throughput. Every "ceiling" in this project so far fell to a wrong INPUT, not a wrong search
(~/.claude/CEILING_BREAKS.md). Attack any constraint below if you measure it wrong — say so with the number.

## What you get (files on this Mac, copy them to the box)
- /Users/uditjain/worldquant/.claude/gpu/book_pnl.csv  — daily PnL (units: $1,000, integers, BRAIN book $20M) of the 28
  ACTIVE alphas, 2019-01-03..2023-12-29, columns = alpha ids. THE objective: a candidate's daily PnL must have
  max_i corr(sign * PnL, active_i) <= 0.10 after choosing sign so its Sharpe is positive (negative correlation is free).
- /Users/uditjain/worldquant/.claude/gpu/calib.json — price-only expressions already simulated on BRAIN with the platform's
  own numbers: S Sharpe, F fitness, TO turnover, R annual return, DD drawdown, M margin, L/Sh long/short counts; settings
  u universe, d decay, n neutralization, dl delay. This is your calibration set. Nothing else on BRAIN is reachable to you
  (no credentials; do not try; never ask for a password).

## BRAIN semantics to reproduce (USA EQUITY, delay 1, IS window 2019-01-03..2023-12-29, 1235 trading days)
- Universe TOP3000 = ~3000 most liquid US stocks (rank by 20d average dollar volume, refresh monthly). TOP1000 = top 1000 of them
  (the sub-universe check runs the same expression there). Also TOP500/TOP200.
- Daily alpha vector a_t from the expression; NaN -> no position. Neutralization: subtract the group mean within
  subindustry/industry/sector/market (groups: use SIC 4-digit as subindustry, 3-digit industry, 2-digit sector; SEC
  company_tickers.json + submissions API give SIC; any free mapping is fine — note which).
- Truncation 0.08: cap |w_i| at 8% of the book after normalising sum|w| = 1 (iterate once). Decay N: linear-decay the
  alpha over the last N days before neutralisation (BRAIN: decay applied to the alpha, weights 1..N newest heaviest).
- Positions w_t sized to $20M gross ($10M long/short), returns applied next day (delay 1: alpha from close t, PnL from
  close t -> close t+1). Daily PnL_t = sum_i w_{i,t-1} * ret_{i,t} * 20e6.
- Sharpe = mean/std of daily PnL x sqrt(252). Annual return R = mean daily PnL x 252 / 20e6 (book 20M? BRAIN divides by
  half the book; CALIBRATE: fit the constant on calib.json). Turnover = mean_t sum_i |w_{i,t}-w_{i,t-1}| / 2 (CALIBRATE
  the factor the same way). Fitness F = Sharpe x sqrt(|R| / max(TO, 0.125)). Margin = PnL per dollar traded (bps).
- Operators (FASTEXPR): rank, group_rank(x,g), group_neutralize(x,g), group_mean(x,w,g), group_zscore, zscore, scale, winsorize(x,std=4),
  signed_power(x,p), power, abs, log, sign, add(...,filter=true) = NaN-safe sum, if_else, is_nan, hump(x,hump=h), trade_when(c,x,exit),
  ts_mean, ts_sum, ts_delta(x,n)=x-x[n], ts_std_dev, ts_zscore, ts_rank, ts_backfill(x,n), ts_corr(x,y,n), ts_decay_linear,
  ts_max, ts_min, ts_arg_max, ts_regression(y,x,n,rettype), ts_delay. rank is cross-sectional in [0,1]. adv20 = 20d avg dollar
  volume. returns = close/close[1]-1. vwap available in Stooq? If not, approximate (O+H+L+C)/4 and SAY SO.
- Count operators <= 60 per expression; depth is free.

## Data (approved by Udit for download, ~600 MB): Stooq daily US bulk, https://stooq.com/db/h/ -> "d_us_txt.zip" (all US
stocks+ETFs daily OHLCV, split-adjusted). Keep every downloaded/extracted file in its own empty dir (~/wq_local/raw/); your code
lives in ~/wq_local/src/; read raw files only with scripts run as `python3 -I`. Filter to common stocks (drop ETFs/warrants/
units by name pattern + price/volume sanity), 2018-06..2026-10 so you have warm-up and 2024-2026 out-of-sample.
Fallback if Stooq is down: yfinance on the ~3,500 names you can list (survivorship bias: NOTE it in the report).
Dividends: Stooq is not dividend-adjusted; BRAIN returns are total returns. Measure the effect on calibration before fixing.

## Plan with kill lines (pre-registered; report raw numbers at each gate)
1. Data + universe + groups + backtester (torch, GPU, batch of expressions evaluated as tensors [days x stocks]). Unit test:
   rank(-ts_delta(close,5)) TOP3000 subindustry decay 10 must give Sharpe in [1.0, 1.9] (BRAIN: 1.45) and TO ~0.3-0.5.
2. CALIBRATION on calib.json (run each expression with ITS settings). Report: Spearman and Pearson of local vs BRAIN Sharpe,
   same for turnover and return; the regression slope; the 10 worst residuals with their expressions.
   KILL LINE 1: Spearman(Sharpe) < 0.5 after THREE genuine repairs (universe rule, grouping, decay/truncation order, returns
   adjustment, date alignment) -> stop, write the diagnosis, do not search. If >= 0.5: continue. (Prior: 15-25%
   that it fails; the common cause would be a wrong input such as universe membership or dividend adjustment.)
3. SEARCH: random + genetic programming over the operator set with the fields {open,high,low,close,vwap,volume,returns,adv20,
   cap if available}, constants from {3,5,10,20,60,120,250}, groups {subindustry,industry,sector,market}, settings
   decay in {0,5,10,20}, neutralisation subindustry/market. Evaluate >= 10^5 expressions on GPU. Objective: IS Sharpe
   (sign chosen free) subject to max corr with book <= 0.10, TO <= 0.5, R such that F >= 1.0, TOP1000 Sharpe >= 0.45 x S.
   Robustness: 2024-01..2026-09 OS Sharpe >= 0.5 x IS Sharpe (we want alphas that still pay; BRAIN only scores IS).
   Dedupe survivors at pairwise PnL corr > 0.7 (keep the higher Sharpe). KILL LINE 2: fewer than 10 survivors with local
   IS Sharpe >= 1.5 at corr <= 0.10 after 10^5 evaluations -> report the frontier (best Sharpe at corr 0.0/0.1/0.2/0.3) and stop.
4. OUTPUT: /Users/uditjain/worldquant/.claude/gpu/candidates.json = list of {expr, settings:{universe,decay,neutralization},
   S, F, TO, R, OS_S, maxcorr, with, sub_S} sorted by S, top 60; and REPORT.md (<= 40 lines: calibration table, frontier,
   what you repaired, what is still wrong). Update PROGRESS.md (5 lines: step, numbers so far, blockers) every hour.

## Box rules (hard)
- Everything heavy runs on the GPU box: ssh learner@100.106.165.23 (uptime 21 d; RTX 5090 32 GB, 1.3 GB in use; 62 GB RAM,
  45 GB free; torch 2.12+cu130 OK; 471 GB disk). The box runs a production voice bot: wrap every python run longer than a
  minute in `systemd-run --user --scope -p MemoryMax=28G ...` and set torch.set_num_threads(8) — sustained 100% all-core CPU
  has caused machine-check freezes on this box; keep the work on the GPU. Use nohup/tmux for long jobs; the Mac-side Bash
  dies at 10 minutes, so poll from the Mac, never block.
- Never touch the Mac's Chrome, the BRAIN platform, or any credentials. Never download anything other than the Stooq bulk
  (and pip packages). Do not modify files under /Users/uditjain/worldquant outside .claude/gpu/.
- Report RAW figures (tables), then a 10-line interpretation; no invented numbers; if blocked, say what you tried (3 attempts).
