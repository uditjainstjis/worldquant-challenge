# LEARN — WorldQuant BRAIN from zero, for Udit. Hands-on, one idea per lesson. Everything here was measured on this account.

## Lesson 1 — the game
- Each day, for ~3,000 US stocks, your formula outputs one number per stock. High = "will beat the others tomorrow", low = "will lag".
- The platform subtracts the cross-sectional mean (per neutralization group), scales longs and shorts to $1 each, holds one day, repeats for 2019→today. The formula is an **alpha**. You never pick a stock; you write a rule that *orders* all of them.
- Why a rule beats a pick: thousands of tiny bets per day average out noise, so a slight edge shows.

## Lesson 2 — the four judges (every alpha is scored on these)
| number | meaning | pass line |
|---|---|---|
| Sharpe | yearly return / yearly volatility (smoothness of profit) | ≥ 1.25 |
| Turnover | fraction of the book replaced each day (trading cost) | 1%–70% |
| Fitness | Sharpe × sqrt(return / max(turnover, 0.125)) — "profit per unit of trading" | ≥ 1.0 |
| Self-correlation | similarity to your own earlier submissions (forces variety) | < 0.7 |
Also checked: sub-universe Sharpe (the alpha must also work on the larger stocks only, limit ≈ 0.43 × your Sharpe), concentrated weight (no single stock > ~10%).
Beginners fail **fitness** most: a great Sharpe with 60% turnover is worthless after costs.

## Lesson 3 — reading a formula as a sentence
`rank(-ts_delta(close,3)) * rank(ts_mean(volume,5)/ts_mean(volume,60))`
- `ts_delta(close,3)` = today's close minus 3 days ago → **ts_** = time-series op, looks back per stock.
- the minus flips it: fallers score high → a **reversal** bet.
- `rank(x)` = percentile across all stocks today → **cross-sectional** op, kills outliers.
- `ts_mean(volume,5)/ts_mean(volume,60)` = this week's volume vs the quarter's → "unusually busy" = attention.
- product of ranks = "both must hold to sit at the top". Products never go negative; the mean-subtraction makes the book long-short anyway.
Result: Sharpe 2.14, turnover 27%, fitness 1.42 (submitted 2026-10-01).

## Lesson 4 — the operator vocabulary that matters (66 exist; these 15 do 95% of the work)
| op | what | typical use |
|---|---|---|
| `rank(x)` | cross-sectional percentile 0..1 | wrap almost everything |
| `group_rank(x, g)` | rank within group g (subindustry / industry / sector / market) | kills sector bets |
| `group_neutralize(x,g)`, `group_zscore(x,g)` | subtract group mean / z-score within group | alternatives to group_rank |
| `ts_delta(x,d)` | x − x d days ago | momentum / reversal |
| `ts_mean(x,d)`, `ts_sum(x,d)` | rolling average / sum | smooth, de-noise |
| `ts_std_dev(x,d)` | rolling volatility | risk features |
| `ts_rank(x,d)`, `ts_zscore(x,d)` | where today sits in its own history | "is this unusual for THIS stock" |
| `ts_decay_linear(x,d)` | linearly weighted rolling mean | lowers turnover |
| `ts_backfill(x,d)` | fill missing values from the past | sparse fundamentals |
| `ts_corr(x,y,d)`, `ts_regression(y,x,d)` | rolling relation | price–volume relations |
| `signed_power`, `sqrt`, `log`, `abs`, `min`, `max` | arithmetic | shaping |
| `trade_when(cond, alpha, exit)` | only update positions when cond | turnover control |
| `vec_avg(x)`, `vec_sum(x)` | collapse VECTOR fields (news etc.) | required for vector data |
NOT available (error "inaccessible operator"): `ts_max`, `ts_min`. Use `ts_arg_max`, `kth_element`, `ts_quantile`.

## Lesson 5 — settings (the knobs beside the formula)
- **Universe**: TOP3000 (measured: easiest to pass; TOP1000/500/200 cut Sharpe by ~30% and fail fitness). The Challenge scores smaller universes higher, but a failing alpha scores 0.
- **Delay 1**: you trade tomorrow on today's close. D0 (same day) is harder and scores less. Always D1.
- **Neutralization**: SUBINDUSTRY (default, bet within industries) / INDUSTRY / SECTOR / MARKET. Pair it with the matching `group_rank`.
- **Decay N**: average your signal over N days → lower turnover, slightly lower Sharpe, usually HIGHER fitness. 6–12 is the sweet spot for daily signals.
- **Truncation 0.08**: max weight per stock 8%. Lower (0.05) = less concentration.

## Lesson 6 — what is alive and dead in THIS window (2019→now), measured day 1
- ALIVE: short-term reversal (3–5 day) × volume burst; option call–put implied-vol spread × volume burst; forward earnings yield × volume burst × liquidity.
- DEAD (|Sharpe| < 0.7): plain value ratios (EV/EBITDA, B/M, FCF yield), low-volatility, small-cap/illiquidity (liquid WINS now), analyst EPS revisions, news/social sentiment sums, 12-1 momentum, put/call ratios, IV term structure.
- The universal fixer: multiply a weak-but-real signal by `rank(ts_mean(volume,5)/ts_mean(volume,60))`. Attention makes a signal trade.
- Rule: the textbook tells you WHICH variables matter; only the data tells you the SIGN. Simulate the raw signal first, read the sign of its Sharpe, then build.

## Lesson 7 — the loop (how every alpha here was found)
hypothesis → formula → simulate (≈2.5 min) → read the four numbers → name the ONE failing check → change ONE thing → repeat. Never change two things at once.
Fix table: low Sharpe → add a conditioning factor (volume), change group; low fitness → raise decay, smooth with ts_mean; high turnover → decay / ts_decay_linear / trade_when; concentrated weight → use rank/group_rank; sub-universe fail → the signal lives in small caps, add a liquidity factor `rank(adv20)`.

## Lesson 8 — submitting on the platform (UI)
1. Simulate → paste formula → Settings (USA, TOP3000, D1, neutralization, decay) → Simulate.
2. Results: Sharpe, Turnover, Fitness, Returns, Drawdown; the **checks** list shows PASS/FAIL per rule.
3. All PASS → click **Submit**. The platform then runs self-correlation (vs your submissions) and confirms ACTIVE. 2–3 minutes.
4. Challenge score posts at 03:00 EST (12:30 IST). Max 2,000/day; 1–2 good alphas reach it. A day with nothing submitted scores 0 forever.

## Lesson 9 — the Challenge arithmetic (why this is a marathon)
Cap 2,000/day, never decreases. #1 holds ~985k from ~684 alphas and adds ~1,000/day. Catch-up at 2,000/day ≈ 980 days. Gold (10,000) ≈ 5 days → consultant-program eligibility (paid). The lever is never a single alpha; it is **never missing a day** and keeping self-correlation low across families.

## Exercises (do them on the platform; tell me the numbers)
1. Run Lesson 3's formula with `3` → `10`. Explain the Sharpe drop (hint: reversal fades with horizon).
2. Take `group_rank(est_eps/close, industry)` and add `* rank(ts_mean(volume,5)/ts_mean(volume,60))`. Watch Sharpe move 1.06 → ~1.21.
3. Invent one new conditioning factor (not volume) and test it on the reversal alpha. Report sign and Sharpe.

## Lesson 10 — the calibration (measured 10-01 vs 10-03)
Two alphas in one day scored 2,000 (the cap). One alpha scored 1,910. So one good alpha is 95% of the day; the second is worth ~90 points. Never risk tomorrow's lane for today's 90.

## Lesson 11 — self-correlation measures WHEN you make money, not what the formula says
Five different-looking formulas (1-day reversal, intraday reversal, close-position-in-range, volatility-scaled reversal, reversal x value) all correlated 0.80–0.95 with the submitted 3-day reversal: same bet, different costume. The option-spread, forward-earnings, skewness and asset-turnover alphas correlated 0.41–0.62 with it: different reasons the money arrives. Pre-check: GET /alphas/{id}/correlations/self (needs ~60 s to compute). For two alphas that are not yet submitted, pull /recordsets/pnl for both and correlate the daily PnL differences yourself.

## Lesson 12 — the shelf
A measured, uncorrelated, not-yet-submitted alpha is the scarcest asset in this game. shelf.json holds them with their measured numbers; the daily loop submits from the shelf first and explores only when the shelf runs low. Research days fill the shelf; submission days spend it. Today's research (≈60 simulations) found 2 lanes (asset turnover, tangibility) and killed ~45 ideas. Slow information (earnings drift, analyst surprise, customer momentum, quality ratios) is priced in this window; what survives is fast noise (reversal), positioning (options), forecasts relative to price, and behavioural tilts (skewness), each needing the attention factor rank(vol5/vol60) and the liquidity tilt rank(adv20) to clear fitness.
