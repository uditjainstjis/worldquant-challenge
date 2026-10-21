# ALIEN 10-21: 15 anti-book constructions (agent_alien_1021)

Target: SELF_CORRELATION <= -0.15, S >= 2.5, F >= 1.5, TO 0.1-0.5, TOP1000 subU >= 0.435xS. All 15 + 5 probes parsed by a FASTEXPR checker (arity, nesting, names); op counts below are that checker's (BRAIN counts ~3 more). Settings for every row: USA, delay 1, truncation 0.08, nanHandling OFF, pasteurization ON.

## Read first (5 lines)
1. **What would have to be true.** K unrelated unit-risk legs with Sharpes S_k and correlation rho_k,i to active i blend to Sharpe sqrt(K)*mean(S) AND correlation sqrt(K)*mean(rho_i). So the target needs **mean(rho_i)/mean(S) <= -0.06 against EVERY one of the 26**: about -0.06 of correlation per unit of leg Sharpe. npA7J7r3/Vkd7961V had legs averaging rho ~0, so sqrt(K) amplified nothing. Check each leg probe for that ratio per active.
2. **Reversed booster (the anti-PC1 instrument).** 10+ actives are gr(s)*rank(AV)[*rank(adv20)], which carries a +0.5x AV/size tilt. (gr(s)-c)*rank(AV) with c=1 carries -0.5x the same tilt; c is a dial (0.5 = no tilt). Evidence: PC1 loads on XgJ5e7w5 (reversal x AV) but 0.00 on RRAL7X6b (untilted reversal), and ens_iv_loud = (non-positive signal) x rank(AV) measured -0.21 vs the actives sum. Probe P1 alone prices this lever.
3. **Attacked facts.** (a) The 10-19 kill-line regression (median R2 0.15, "correlation is content") used mkt/beta/vol/mom only, with NO AV and NO size regressor, which are the two multipliers the actives share. (b) The anti-book list is stale: share_turnover and brd_adxqfv110 are inside gJWjzbPO, and ens_iv_small (a sibling of ens_iv_loud) is inside npA70JqM; the -0.17/-0.21 figures were vs the SUM of actives before 10-20 #4/#5, not the signed max vs each of the 26. (c) "fundamental6 never used" is probably wrong: sales/assets/debt/ppent are likely fundamental6 ids (verify in Data Explorer).
4. **Honest prior.** Lead-lag momentum measured 0.87-1.10 WITH the +booster (booster alone 0.93), so the signals under the reversed booster are weak and those singles are predicted low. The likeliest yield is legs that clear the -0.06 ratio and feed your __fitSearch, not finished passers. Rows 1-3 are the shots at the full target.
5. **Syntax fallbacks.** If `not(x)` is rejected, use `equal(is_nan(x),0)`. If the scalar weight in `group_mean(x,1,g)` is rejected, use `cap`. trade_when exit has precedence over trigger (BRAIN doc order).

## Price the levers first (5 cheap sims, TOP3000 SUBINDUSTRY decay 0): load their PnLs, then let the predictor weight everything
- **P1 reversed AV tilt alone** (ops 5): `-rank(ts_mean(volume,5)/ts_mean(volume,60))`
- **P2 reversed size tilt alone** (ops 2): `-rank(adv20)`
- **P3 pure 5d continuation** (ops 2): `rank(ts_sum(returns,5))`
- **P4 linked-firm momentum, no tilt** (ops 2): `ts_mean(ts_backfill(rel_ret_all,5),20)`
- **P5 news reaction held 40d, no tilt** (ops 6): `trade_when(not(is_nan(news_pct_5min)),rank(news_pct_5min),ts_count_nans(news_pct_5min,40)>39)`

Kill/keep rule per leg: keep if rho/S <= -0.06 vs the binding active, or if rho <= -0.25 vs a whole cluster at S >= -0.6 (a cheap hedge).

## The 15 (ordered by my confidence of hitting the FULL target)

### 1. measured anti-book legs + continuation legs (sqrt-K blend) (P(all checks) 7%)
```
add(0.25*scale(group_neutralize(-(group_rank(close/open-1,subindustry)+group_rank(close/vwap-1,subindustry))*rank(ts_mean(volume,5)/ts_mean(volume,60)),subindustry)),0.2*scale(group_neutralize(trade_when(not(is_nan(news_pct_5min)),rank(returns),ts_count_nans(news_pct_5min,20)>19),subindustry)),0.2*scale(group_neutralize(trade_when(not(is_nan(news_pct_5min)),rank(news_pct_5min),ts_count_nans(news_pct_5min,40)>39),subindustry)),0.2*scale(group_neutralize(ts_rank(close,250),subindustry)),0.15*scale(group_neutralize(-rank(ts_mean(volume,5)/ts_mean(volume,60)),subindustry)),filter=true)
```
- **Settings:** TOP3000 · SUBINDUSTRY · decay 2 · trunc 0.08 · ops 47
- **Mechanism:** positive-weight blend of legs that each lean against the book: ens_iv_loud (rebuilt; measured -0.21 vs the actives sum), news-day continuation, held news drift, 52-week-high anchoring, and the bare reversed AV tilt
- **Anti-book:** math note: K unrelated legs averaging rho to an active land at sqrt(K)*rho against it (five at -0.08 -> -0.18); every leg is continuation-type, or reversal with a reversed AV tilt (the rebuilt ens_iv_loud leg)
- **Predicted:** S 1.6 (1.1-2.2) · TO 0.30 · SC -0.08 (-0.20..+0.05)
- **Repair ladder:** 1) re-measure the ens_iv_loud leg vs npA70JqM and RRAL7X6b FIRST (its sibling ens_iv_small is in npA70JqM; it is intraday reversal); if positive, drop it and move its 0.25 to the P1 tilt leg; 2) append your bl82wYxZ (rec_chg21), omowdKP5 (buy_share_chg21), 78oqp86b (rec_chg63) legs and refit with __fitSearch, after re-measuring each vs all 26 (their -0.17 was vs the SUM, before 10-20); 3) fitness: hump(x,hump=0.0001) and/or decay 2 -> 6; subU: TOP1000 copy (shrinks a negative corr toward 0 too)
- **Fields:** news_pct_5min [U: use the id of your S0.91 probe; alts news_pct_5, news_pct_5_min]

### 2. five-leg anti-book blend (P(all checks) 6%)
```
add(0.35*scale(group_neutralize((group_rank(ts_mean(ts_backfill(rel_ret_all,5),20),subindustry)-0.75)*rank(ts_mean(volume,5)/ts_mean(volume,60)),subindustry)),0.2*scale(group_neutralize(trade_when(not(is_nan(news_pct_5min)),rank(news_pct_5min),ts_count_nans(news_pct_5min,40)>39),subindustry)),0.2*scale(group_neutralize(ts_rank(close,250),subindustry)),0.1*scale(group_neutralize(-ts_delta(ts_backfill(pcr_oi_30,5),10),subindustry)),0.15*scale(group_neutralize(ts_delta(ts_backfill(cashflow_op,60),250)/assets,subindustry)),filter=true)
```
- **Settings:** TOP3000 · SUBINDUSTRY · decay 4 · trunc 0.08 · ops 38
- **Mechanism:** five unrelated premia (linked-firm diffusion, news drift, 52-week-high anchoring, put-call OI change, cash-flow momentum); one carries a reversed volume tilt
- **Anti-book:** sqrt(K) amplifies a mildly negative correlation the same way it amplifies Sharpe (math note); leg 1 is short the AV tilt, legs 1-3 are continuation-type (anti-reversal), legs 3 and 5 are anti-value
- **Predicted:** S 1.9 (1.4-2.4) · TO 0.20 · SC -0.06 (-0.18..+0.05)
- **Repair ladder:** 1) refit weights with __fitSearch on the five leg PnLs (probes P4/P5 + legs) instead of these hand weights; 2) drop any leg whose corr with the binding active is > 0; 3) swap leg 4 for your rec_chg21 or buy_share_chg21 leg (re-measured vs the 26, not the sum)
- **Fields:** news_pct_5min [U: use the id of your S0.91 probe; alts news_pct_5, news_pct_5_min]; pcr_oi_30 [U: alts pcr_oi_all, pcr_oi_270]; cashflow_op [U: my guess at the BRAIN id, never recorded in notes; alt operating_income]; rel_ret_all [V-ledger 10-03 pv13 list]

### 3. slow fitness-first blend (P(all checks) 5%)
```
add(0.4*scale(group_neutralize(ts_decay_linear((group_rank(ts_mean(ts_backfill(rel_ret_cust,5),60),subindustry)-1)*rank(ts_mean(volume,20)/ts_mean(volume,120)),10),subindustry)),0.3*scale(group_neutralize(ts_decay_linear(ts_rank(close,250),10),subindustry)),0.3*scale(group_neutralize(trade_when(not(is_nan(news_pct_5min)),rank(news_pct_5min),ts_count_nans(news_pct_5min,60)>59),subindustry)),filter=true)
```
- **Settings:** TOP3000 · SUBINDUSTRY · decay 0 · trunc 0.08 · ops 28
- **Mechanism:** same anti-book thesis built only from slow legs, so the fitness check is met at low turnover (F needs R >= 4.5% at TO <= 0.125 for S 2.5)
- **Anti-book:** reversed slow-AV tilt (anti-PC1) + customer-momentum and 52wh continuation (anti-reversal) + news drift held 60d
- **Predicted:** S 1.7 · TO 0.09 · SC -0.05
- **Repair ladder:** 1) customer coverage thin -> rel_ret_cust -> rel_ret_all; 2) decay 10 -> 20 on legs 1-2 if TO > 0.15; 3) hold window 60 -> 40
- **Fields:** news_pct_5min [U: use the id of your S0.91 probe; alts news_pct_5, news_pct_5_min]; rel_ret_cust [V-ledger]

### 4. industry momentum spread + reversed-booster link (P(all checks) 4%)
```
add(0.5*scale(group_neutralize(rank(group_mean(ts_sum(returns,60),1,industry)),sector)),0.5*scale(group_neutralize((group_rank(ts_mean(ts_backfill(rel_ret_all,5),20),subindustry)-1)*rank(ts_mean(volume,5)/ts_mean(volume,60)),subindustry)),filter=true)
```
- **Settings:** TOP3000 · SECTOR · decay 5 · trunc 0.08 · ops 19
- **Mechanism:** industry-level 60d momentum (Moskowitz-Grinblatt) inside sectors + linked-firm diffusion; SECTOR neutralization keeps the industry leg alive
- **Anti-book:** a subindustry-neutral book holds zero industry exposure, so leg 1 is orthogonal by construction; leg 2 supplies the negative correlation (reversed AV tilt + continuation)
- **Predicted:** S 1.5 · TO 0.18 · SC -0.03
- **Repair ladder:** 1) horizon 60 -> 120 -> 20; 2) group industry -> sector (and neut MARKET); 3) weights 0.5/0.5 -> 0.3/0.7
- **Fields:** rel_ret_all [V-ledger 10-03 pv13 list]

### 5. reversed booster on held news reaction (P(all checks) 4%)
```
(group_rank(trade_when(not(is_nan(news_pct_5min)),rank(news_pct_5min),ts_count_nans(news_pct_5min,40)>39),subindustry)-1)*rank(ts_mean(volume,5)/ts_mean(volume,60))
```
- **Settings:** TOP3000 · SUBINDUSTRY · decay 3 · trunc 0.08 · ops 13
- **Mechanism:** post-news drift: on each news day set position = rank of the 5-min post-news move, hold up to 40 days; bet concentrated on the short side of loud names
- **Anti-book:** reversed AV tilt (anti-PC1) + multi-week continuation of news moves, against the 3-8 day news-vwap / intraday reversal in LL5Vgolv, KPmbm0X8, 3qj3WJgX, RRAL7X6b
- **Predicted:** S 0.9 · TO 0.15 · SC -0.05
- **Repair ladder:** 1) sign = sign of your S0.91 probe (expression assumes continuation); 2) hold 40 -> 20 -> 60; 3) gate only big reactions: abs(news_pct_5min) > ts_mean(abs(news_pct_5min),60)
- **Fields:** news_pct_5min [U: use the id of your S0.91 probe; alts news_pct_5, news_pct_5_min]

### 6. news-day continuation, event-held (Chan 2003) (P(all checks) 3%)
```
trade_when(not(is_nan(news_pct_5min)),rank(returns),ts_count_nans(news_pct_5min,20)>19)
```
- **Settings:** TOP3000 · SUBINDUSTRY · decay 2 · trunc 0.08 · ops 6
- **Mechanism:** news-driven moves continue while no-news moves reverse: take the news-day return as the position, hold 20 days after the last news
- **Anti-book:** the book reverses every move, news or not; this is long exactly the news-day moves the reversal legs short, so it wins where they lose
- **Predicted:** S 1.0 · TO 0.20 · SC -0.02 (reversal actives -0.2)
- **Repair ladder:** 1) hold 20 -> 10 -> 40; 2) wrap as (group_rank(.,subindustry)-1)*rank(AV) for the anti-PC1 tilt; 3) use ts_sum(returns,2) to include the post-news day
- **Fields:** news_pct_5min [U: use the id of your S0.91 probe; alts news_pct_5, news_pct_5_min]

### 7. industry 52wh spread + stock 52wh reversed booster (P(all checks) 3%)
```
add(0.5*scale(group_neutralize(rank(group_mean(ts_rank(close,250),1,industry)),sector)),0.5*scale(group_neutralize((group_rank(ts_rank(close,250),subindustry)-1)*rank(ts_mean(volume,5)/ts_mean(volume,60)),subindustry)),filter=true)
```
- **Settings:** TOP3000 · SECTOR · decay 5 · trunc 0.08 · ops 18
- **Mechanism:** George-Hwang 52-week-high anchoring at two levels: industries near their highs (between-industry) and stocks near their highs within subindustry
- **Anti-book:** industry leg orthogonal to the subindustry book; stock leg = continuation (anti-reversal, anti-EY value) with reversed AV tilt
- **Predicted:** S 1.2 · TO 0.12 · SC -0.03
- **Repair ladder:** 1) 250 -> 120 window; 2) group industry -> sector; 3) stock leg c 1 -> 0.75

### 8. sector momentum spread + reversed-booster news (P(all checks) 3%)
```
add(0.4*scale(group_neutralize(rank(group_mean(ts_sum(returns,20),1,sector)),market)),0.6*scale(group_neutralize((group_rank(trade_when(not(is_nan(news_pct_5min)),rank(news_pct_5min),ts_count_nans(news_pct_5min,40)>39),subindustry)-1)*rank(ts_mean(volume,5)/ts_mean(volume,60)),subindustry)),filter=true)
```
- **Settings:** TOP3000 · MARKET · decay 3 · trunc 0.08 · ops 23
- **Mechanism:** 1-month sector momentum (no reversal at the group level) + held news drift
- **Anti-book:** sector bets are invisible to a subindustry-neutral book (orthogonal); leg 2 supplies negative correlation
- **Predicted:** S 1.3 · TO 0.20 · SC -0.02
- **Repair ladder:** 1) 20 -> 60 day sector window; 2) sector -> industry with neut SECTOR; 3) weight 0.4 -> 0.25
- **Fields:** news_pct_5min [U: use the id of your S0.91 probe; alts news_pct_5, news_pct_5_min]

### 9. reversed AV booster on linked-firm momentum [TOP1000] (P(all checks) 2%)
```
(group_rank(ts_mean(ts_backfill(rel_ret_all,5),20),subindustry)-1)*rank(ts_mean(volume,5)/ts_mean(volume,60))
```
- **Settings:** TOP1000 · SUBINDUSTRY · decay 6 · trunc 0.08 · ops 9
- **Mechanism:** short the loud, large names whose economic neighbours (customers/suppliers/peers) fell; long the quiet rest (Cohen-Frazzini slow diffusion)
- **Anti-book:** (gr(s)-1)*rank(AV)*rank(adv) carries -0.5x the booster tilt that 10+ actives carry at +0.5x (gr(s)*rank(AV)*rank(adv)); linked returns co-move with own returns, so it leans against the reversal legs
- **Predicted:** S 0.6 · TO 0.20 · SC -0.03 (AV-boosted actives -0.10..-0.25)
- **Repair ladder:** 1) offset c 1 -> 0.8 -> 0.65 (less tilt cost, less anti-PC1); 2) tilt rank(AV)*rank(adv20) -> rank(AV) only; 3) field rel_ret_all -> rel_ret_part / rel_ret_comp, window 20 -> 60
- **Fields:** rel_ret_all [V-ledger 10-03 pv13 list]

### 10. reversed AV booster on 52wh [TOP1000] (P(all checks) 2%)
```
(group_rank(ts_rank(close,250),subindustry)-1)*rank(ts_mean(volume,5)/ts_mean(volume,60))
```
- **Settings:** TOP1000 · SUBINDUSTRY · decay 6 · trunc 0.08 · ops 8
- **Mechanism:** short loud, large names far below their 52-week high; long the quiet rest
- **Anti-book:** full reversed booster (anti-PC1) + anchoring continuation (anti-reversal, anti-value)
- **Predicted:** S 0.6 · TO 0.15 · SC -0.04
- **Repair ladder:** 1) c 1 -> 0.8; 2) 250 -> 120; 3) tilt AV only

### 11. regime switch: continuation in continuation regimes, 52wh otherwise (P(all checks) 2%)
```
if_else(ts_mean(group_mean((rank(returns)-0.5)*(rank(ts_delay(returns,1))-0.5),1,market),20)>0,scale(group_neutralize((group_rank(ts_sum(returns,5),subindustry)-1)*rank(ts_mean(volume,5)/ts_mean(volume,60)),subindustry)),scale(group_neutralize(ts_rank(close,250),subindustry)))
```
- **Settings:** TOP3000 · SUBINDUSTRY · decay 4 · trunc 0.08 · ops 23
- **Mechanism:** market-wide rank autocorrelation of daily returns (20d mean) flags continuation regimes, when the reversal book is weak; hold continuation then, 52wh otherwise
- **Anti-book:** in continuation regimes the leg is the mirror of the reversal cluster on the days it loses most; elsewhere an anti-value continuation leg
- **Predicted:** S 1.2 · TO 0.35 · SC -0.03
- **Repair ladder:** 1) regime window 20 -> 40; 2) hysteresis: >0.002 / <-0.002; 3) continuation leg -> linked-firm momentum

### 12. regime-gated continuation (trade_when, flat otherwise) (P(all checks) 2%)
```
trade_when(ts_mean(group_mean((rank(returns)-0.5)*(rank(ts_delay(returns,1))-0.5),1,market),10)>0,(group_rank(ts_sum(returns,5),subindustry)-1)*rank(ts_mean(volume,5)/ts_mean(volume,60)),ts_mean(group_mean((rank(returns)-0.5)*(rank(ts_delay(returns,1))-0.5),1,market),10)<0)
```
- **Settings:** TOP3000 · SUBINDUSTRY · decay 4 · trunc 0.08 · ops 27
- **Mechanism:** trade 5d continuation with reversed AV tilt only while the market is in a continuation regime; exit (flat) in reversal regimes
- **Anti-book:** active only when the reversal legs bleed, so its covariance with them sits on their worst days
- **Predicted:** S 1.0 · TO 0.45 · SC -0.08
- **Repair ladder:** 1) window 10 -> 20; 2) decay 4 -> 8 if TO > 0.5; 3) signal ts_sum(returns,5) -> ts_sum(returns,10)

### 13. reversed size booster on cash-flow momentum (fundamental6) (P(all checks) 2%)
```
(group_rank(ts_delta(ts_backfill(cashflow_op,60),250)/assets,subindustry)-1)*rank(adv20)
```
- **Settings:** TOP3000 · SUBINDUSTRY · decay 10 · trunc 0.08 · ops 7
- **Mechanism:** year-on-year operating cash-flow change (fundamental momentum); short large names whose cash flow fell, long small rest
- **Anti-book:** reversed size tilt against the slow factor that every flag and slow-fundamental active shares (measured 0.4-0.7); fundamental momentum is anti-value
- **Predicted:** S 0.5 · TO 0.05 · SC +0.02
- **Repair ladder:** 1) tilt rank(adv20) -> rank(AV); 2) 250 -> 63 (QoQ); 3) c 1 -> 0.7
- **Fields:** cashflow_op [U: my guess at the BRAIN id, never recorded in notes; alt operating_income]

### 14. reversed social-attention booster on linked momentum (P(all checks) 2%)
```
(group_rank(ts_mean(ts_backfill(rel_ret_all,5),20),subindustry)-1)*rank(ts_backfill(scl12_buzz,5))
```
- **Settings:** TOP3000 · SUBINDUSTRY · decay 6 · trunc 0.08 · ops 7
- **Mechanism:** diffusion is slow where attention is low: short high-buzz names whose neighbours fell, long the low-buzz rest
- **Anti-book:** social buzz is a second attention proxy that is correlated with, but not equal to, the AV tilt the book is long
- **Predicted:** S 0.5 · TO 0.15 · SC -0.02
- **Repair ladder:** 1) buzz level -> abnormal buzz ts_zscore(ts_backfill(scl12_buzz,5),60); 2) c 1 -> 0.8; 3) add *rank(AV) for a double attention tilt
- **Fields:** scl12_buzz [U: alt scl12_sentiment (V)]; rel_ret_all [V-ledger 10-03 pv13 list]

### 15. reversed booster on put-call OI change (option9) (P(all checks) 2%)
```
(group_rank(-ts_delta(ts_backfill(pcr_oi_30,5),10),subindustry)-1)*rank(ts_mean(volume,5)/ts_mean(volume,60))
```
- **Settings:** TOP3000 · SUBINDUSTRY · decay 5 · trunc 0.08 · ops 10
- **Mechanism:** rising put/call open interest = informed bearish positioning (Pan-Poteshman); short loud names where puts are being added
- **Anti-book:** reversed AV tilt; OI flow, not IV level, so less overlap with the IV-skew actives
- **Predicted:** S 0.5 · TO 0.25 · SC -0.03
- **Repair ladder:** 1) pcr_oi_30 -> pcr_oi_all / pcr_vol_30; 2) 10d -> 20d change; 3) if corr with A1vMp7Al > 0, flip the sign of the inner signal (contrarian)
- **Fields:** pcr_oi_30 [U: alts pcr_oi_all, pcr_oi_270]

## Requirement check
- Never-used fields (pv13 rel_ret_*, option9 pcr, socialmedia scl12, fundamental6 cashflow_op): rows 2, 3, 4, 9, 13, 14, 15 = 7 (>= 5).
- trade_when event gating: rows 1, 2, 3, 5, 6, 8, 12 = 7 (>= 3).
- group_mean sector/industry spreads: rows 4, 7, 8 (>= 3); rows 11-12 use group_mean at market level for the regime.
- TOP1000: rows 9-10 (adv tilt dropped there, since it is pointless inside TOP1000).

## Suggested sim order for the hour (3 slots)
Wave 1: P1, P3, row 1. Wave 2: rows 2, 3, 4. Wave 3: rows 5, 6, P5. If P1 shows rho <= -0.25 vs the AV cluster at S >= -0.6, re-run rows 1-3 with the P1 leg weight raised before touching rows 7-15.
