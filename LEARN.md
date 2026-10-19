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

## Lesson 13 — the booster becomes the anchor (measured 10-07)
`rank(ts_mean(volume,5)/ts_mean(volume,60)) * rank(adv20)` ALONE scores Sharpe 0.93, fitness 0.62. It is half an alpha. Multiply six unrelated signals by it and their profit streams correlate 0.6–0.77 with each other through the shared half, so new lanes get blocked by self-correlation even when the base signal is new (book-value flag × booster: 0.74 vs asset turnover; the same flag × rank(adv20) only: 0.57; alone: 0.39). Rule: once a booster sits in several submitted alphas, stop using it; find signals that pass with a weaker tilt or none. The analyst "forecast type" flags (anl4_*_flag) are strong enough alone: bvps 1.26/1.14, totassets 1.27/1.25 at 2–3% turnover.

## Lesson 14 — the free lever in fitness, and why flags are one family (measured 10-08/10-10)
Fitness = Sharpe x sqrt(return / max(turnover, 0.125)). Below 12.5% turnover the denominator is FROZEN at 0.125, so a 3%-turnover alpha gains nothing from decay (decay only lowers turnover). The net-debt flag failed fitness at decay 10 (1.09 needed, got ~1.0) and passed at decay 2 (1.27/1.09): less smoothing = more Sharpe, and the turnover rise from 2% to 2.3% cost nothing. Rule: if turnover < 12.5%, set decay to 0-2 and take the Sharpe.
What did NOT work: tilting a flag by volatility (rank(ts_std_dev(returns,20))) or by implied vol destroyed it (1.27 -> 0.39). A tilt is a bet on WHERE the signal pays; these flags pay evenly, so the tilt only adds noise.
Self-correlation lives in the data process, not the formula: the total-assets, cash-flow-from-financing and cash-flow-from-investing flags correlate 0.90 with each other (analysts revise the cash-flow statement in one go), while pre-tax-profit vs total-assets is 0.60 and net-debt vs pre-tax-profit is 0.36. One flag per day is sustainable; two flags a day is not. Measure correlation from daily PnL (GET /alphas/{id}/recordsets/pnl) before spending simulations on a variant.
Operations lesson, the expensive one: 10-08 and 10-09 scored 0 because the session ended while waiting on a question and nobody was logged in. Submissions now run on timers inside this chat (12:47 IST daily, 3-hourly retry, 21:41 login check); the only human step left is logging in when the platform session expires (every 1-2 days).

## Lesson 15 (2026-10-12, 02:00 IST) — the browser is a flaky wire; treat every submit as "already executed until proven otherwise"
- A POST /alphas/{id}/submit can take 60-120 s to answer because the server runs the checks inline. The CDP tool gives up at 45 s and reports "renderer frozen" — but the POST HAD executed. Twice tonight a "timed out" submit was found ACTIVE on readback. Rule: after any timeout, READ before re-posting (GET /alphas/{id} status, GET /alphas/{id}/submit 404 = not started).
- While a submission is being processed, other fetches from the same session stall too (the API serializes per user). Don't fire parallel GETs during a submit; wait and read back.
- Reliable readback that never hangs: navigate the tab to the api URL (https://api.worldquantbrain.com/alphas/{id}) and read document.body.innerText. Cookies ride along on top-level navigation. Use this for GETs; fetch only for POSTs.
- Hidden-tab timers (setTimeout) are throttled; keep each JS call to one or two fetches and no sleep loops. The Worker scheduler is immune (worker timers), which is why waves still run in a hidden tab.
- Calibration: platform SELF_CORRELATION = my pnl-corr + 0.00..0.02 (0.605->0.6247, 0.674->0.6752). So the honest acceptance bar for "will pass 0.70" is pnl-corr < 0.68; for comfort use < 0.65.

## Lesson 16 (2026-10-13) — read the scorer every day; it can change under you
- On 10-12/13 the board silently became "Challenge - India" with a composite score. Twelve days of work had been optimised for a 2,000/day cap that no longer exists. The day-1 metric autopsy has to be re-run whenever a number on the board looks "wrong" (score 0.46, rank 238 — that was the alarm).
- How the formula was recovered in 30 min: pull every board row (653), compute percentile ranks of each component, OLS the score on candidate transforms, pick the one whose RMSE equals the rounding noise (0.004). Weighted percentiles with min(days,~26) saturation. Top-3 predictions 0.93/0.73/0.72 vs actual 0.92/0.73/0.72.
- What it changes: (1) uniqueness is the mean of each alpha's max correlation with your own alphas -> a 0.69 passer that was "free" under the gate is now a permanent tax; (2) days saturate near 26 -> a missed day costs ~0.013 forever until saturation; (3) no daily cap -> volume of uncorrelated passers matters again, and the question "is per-alpha value quality-weighted?" is pre-registered in STATE for tomorrow's readback.
- Data access is part of the scorer: regions unavailable, model77 dataset vanished overnight (an ACTIVE alpha still uses it). Catalog what you can simulate at the start of each run, not what you remember.

## Lesson 17 (2026-10-15) — know what is already on your board before you "discover" a family
- 48 sims rebuilt short-horizon reversal from scratch (intraday close/open, close/vwap, close-location, vol-scaled 3-day, quiet-name tilt) and found seven passers up to 2.19/1.11 — every one 0.70-0.84 correlated with XgJ5e7w5, our own 10-01 alpha, which IS a 3-day reversal x volume. One GET of its expression before the wave would have redirected an hour. Rule: before a wave, print the expression of every active alpha and name its family; search only outside that list.
- The quiet tilt rank(-abnormal volume) was the fitness lever (0.94 -> 1.08-1.25) AND the correlation lever (0.42 -> 0.70+ vs XgJ). A multiplier that boosts Sharpe is not free: it can be the very factor that makes you a clone. Measure pnl-corr on the untilted and tilted versions separately.
- Under the composite scorer a second-of-day alpha pays only if it is BOTH uncorrelated (< 0.50) AND high quality (fitness >= ~1.25): isScore fell when a 1.65/1.14 alpha was added, so it behaves like a quality mean. "Do today's submissions" means secure the day, then add only an alpha that raises both dials; a forced second lowers the score.
- Vendor "would a long or short have been profitable" flags in news12 are lagged labels: -0.2 Sharpe at 120% turnover. Coverage 1.0 and a seductive description are not a signal.

## Lesson 18 (2026-10-16) — when every lane is taken, add lanes instead of tuning one
- 60 sims across eight "new" families gave nothing that passed alone outside the lanes already on the board (earnings surprise, analyst recs, revisions, seasonality, beta, turnover, dividend yield: all dead; price-volume correlation real but fitness 0.5). The alpha that finally cleared both second-of-day bars was a SUM of group_ranks from three lanes: an analyst flag (1.27 alone), price-volume correlation (1.05 alone, fails fitness), intraday reversal (1.92 alone, fails turnover). Together: 1.78 Sharpe, fitness 1.30, turnover 0.21, max correlation 0.456.
- Why it works: Sharpe of uncorrelated signals adds, turnover averages, and correlation with any ONE active is diluted by the other two terms. Weights are a steering wheel: raise the term that correlates with the active you are closest to and the number moves. Measure every weight variant separately; the sweet spot was one simulation away from two failures (0.519 and 0.503).
- Limit: composites of the same lane-triple are 0.87 with each other, so each triple yields one submission. Keep a list of lanes with a passer-grade signal; the next alpha is a new triple, not a re-weight.

## Lesson 19 (2026-10-17) — two scoreboards, two correlations
- The campus "Self-Correlation Challenge" averages each alpha's SELF_CORRELATION check value at submit time (first alpha excluded); eligibility is 15+ alphas. Reproduced the sheet's 0.5404 exactly from the pairwise matrix. One record-low alpha does nothing to an average of 15+; only volume of near-zero alphas moves it.
- The BRAIN Challenge board's "uniqueness" is NOT your own self-correlation: ours rose 0.61 -> 0.71 while every own-PnL statistic fell. It is measured against alphas outside your account. Textbook price-volume composites hurt it; uncrowded data (news, estimates changes, options) did not.
- Untilted composites of uncrowded lanes fail on FITNESS, not Sharpe; decay 20-30 fixes it. The IV term structure (call60-call30) is a lane with ~0.29 max correlation to everything we hold. Subtracting 0.7x a copy of an active's signal cuts the correlation to it by ~0.3 (manual orthogonalization) at a fitness cost.

## Lesson 20 (2026-10-18) — where correlation actually lives, and the deferred-tax lane

Today's ask was the lowest possible self-correlation. About 100 simulations later, here is what the platform's SELF_CORRELATION check turned out to measure, in practice:

1. **PnL correlation is shared signal CONTENT, not shared factor exposure.** Demeaning a candidate inside deciles of the volume-burst factor (the factor ten of our actives are tilted by) changed its correlation to them by 0.00. Demeaning it inside deciles of an active that shares a term killed the Sharpe instead. Subtracting 0.4x the factor, moving to TOP1000/TOP500, or tilting to illiquid names all destroyed the alpha before they moved the correlation. So you cannot "orthogonalize" your way to zero; you need a lane none of your actives hold.
2. **Slow fundamentals all look alike to the check.** Every low-turnover accounting signal (page rank, operating income, gross profit, deferred-tax assets, estimate staleness) correlates 0.4-0.7 with the analyst-flag alphas, which are also slow. Their daily PnL is dominated by the same slow factor drift, whatever the accounting line is.
3. **The cleanest content found so far is option-implied-volatility CHANGE.** `ts_delta(implied_volatility_mean_30, 5)` has a max correlation of 0.21 against all 18 actives, and the term-structure change `-ts_delta(iv_call_60 - iv_call_30, 5)` is 0.13. Both are too weak alone (Sharpe 1.1 and 0.7) and both are turnover-heavy, so adding them to a composite costs fitness.
4. **Deferred tax assets / total assets is a real untilted fundamental lane** (Sharpe 1.26 alone at 1.5% turnover). It sat in a 10-13 wave with a minus sign and a -1.27 Sharpe and nobody flipped it. Rule: a strongly NEGATIVE Sharpe is a positive alpha with the wrong sign; always re-read the discard pile for |Sharpe| > 1.
5. **Today's alpha**: `group_rank(ts_backfill(deferred_tax_assets_net_value,60)/assets) + group_rank(ts_zscore(ts_backfill(implied_volatility_mean_30,5),20))`, decay 20, subindustry. Sharpe 1.54, fitness 1.03, self-correlation 0.4055. The two terms are from datasets no active combines, and the pair passes where either alone fails fitness.

Open question for the next lesson: the board's uniquenessScore rose again (0.71 -> 0.73) after two uncrowded-data submissions, so it is not our own self-correlation and not "textbook data". Treat it as unknown until a controlled test isolates it.

## Lesson 21 (2026-10-19) — mixing beats hedging: how we got self-correlation down to 0.20 and 0.13

Udit asked for submissions "into 0.0 something". About 70 simulations later we have two new alphas: **0.2004 and 0.1255**, our lowest ever (the previous best was 0.2331). What happened:

1. **The self-correlation check takes the SIGNED maximum.** Our alpha 2rj7GQk8 is -0.175 correlated with one alpha and +0.1255 with another; the submit check printed 0.1255. Strong negative correlation costs nothing, so a component that moves *against* our existing alphas is a free gift.
2. **Style factors were not the cause (bet lost).** Market, beta, volatility and momentum explain only 15% (median) of our alphas' daily PnL. Stripping them from an alpha left it 0.94 correlated with the original. The overlap is in what the signals *say*, not in their risk factors.
3. **Subtracting look-alike alphas ("hedging") does not survive the simulator.** On paper, alpha minus 0.8 x its near-twin had Sharpe 1.6 and correlation 0.17. Simulated: Sharpe 0.78 and concentrated weights. The platform rescales your total position to full size every day; when two near-identical signals cancel, the small leftover gets blown up by noise.
4. **Adding unrelated signals (a "blend") does survive the simulator.** The blend's real PnL matched the paper prediction at 0.96 correlation, but only after one fix: wrap each sparse piece in `if_else(is_nan(x), 0, x)`. Without that, a missing value in one piece deletes the stock for every piece (Sharpe 0.99 instead of 1.43).
5. **Today's two alphas:**
   - **KPmbm0X8**: the news/implied-vol signal plus *minus* two-year seasonality. Seasonality reversed in 2019-23, and that reversed version runs against our implied-vol alphas, so it cancels their correlation. Sharpe 1.43, fitness 1.01, correlation 0.2004.
   - **2rj7GQk8**: small-cap intraday reversal plus a news-minutes change signal, run in TOP1000 instead of TOP3000. Sharpe 2.03, fitness 1.31, correlation 0.1255.
6. **The checks that bite are fitness and sub-universe Sharpe, not plain Sharpe.**
   - Fitness = Sharpe x sqrt(returns / turnover), so fast signals such as implied-vol change fail it even with Sharpe 1.5.
   - The sub-universe check re-scores the alpha on the 1000 biggest stocks. Small-cap signals fail it; running the alpha in TOP1000 both passes it and roughly halves the correlation with our TOP3000 alphas.
   - Dropping the short-interest piece lifted the TOP1000 blend from Sharpe 1.57 to 2.03.

Next for near-zero: blends only work with **new** pieces. Each new alpha "uses up" its components, because any later blend containing them correlates with it. So the factory has to keep producing fresh, weakly-correlated components, in 2-3 families per day.
