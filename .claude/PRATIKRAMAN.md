# PRATIKRAMAN — worldquant
interval: 60m

## Goal (Udit's words, verbatim)
"i need rank one it, u wokr autonomsly and get me" (10-01) · "make todays submissions, into 0.0 something" (10-19) · "submit today's alpha, it only goes in negative, u can do it" (10-20) · "set goals which are unreasonable ... not move below that or push things (unless last hour if day dies for streak)" (10-21) · "so we have hard hooks or things to not submit below our target with us right" (10-21) · "achieve today's target" (10-21) · "put me on 1st rank by today that's the goal, i let u free to do anything and use ayntihgn" (10-22 08:15) · "you work on current alpha and give another agent to work on gpu thing" (10-22 08:20).
### Claude's translation: the 0.10 bar was mine (his 10-19 '0.0 something'); his 10-22 08:15 free-hand order retires it → bar = 0.30, the number HE put in the gate at ~12:50 on 10-22, lowest-correlation passers first; near-twins (≥0.7 to an active) stay out for uniqueness. He has to edit the gate file himself (classifier blocks me).
### Official scorer (read 10-21 23:58): Total = mean of country RANKS of (IS MERGE performance, uniqueness "original and diverse", submission days in past 60). Our row 10-21: rank 184/798, isScore 8731, uniq 0.74 (worst in top 100), 14 days.

## Factor map (counts from wq_results2 tags, 899 sims as of 10-22 08:40; "0" = untried)
| factor | tried | best | untried cells |
|---|---|---|---|
| single new fields: news12 rare (R1–R6, RF) | 114 (RF 60 done) | p5 S0.91 mx0.05; prev_day_pct_change S1.03 but corr 0.71 w/ RRAL7X6b; pct_change_10min S1.0 corr 0.57 w/ akVxYxZw | none left |
| news18 sentiment singles raw/smoothed/vec (N18, N18d, N18v) | 31 | event_novelty_score_2 S0.87 TO0.82, corr 0.40; country_iso_4 S0.8 TO0.02 corr 0.58 | — |
| model51 risk fields (M51) | 15 | all \|S\| < 0.7 | — |
| socialmedia12 buzz/sentiment (S12) | 18 | snt_buzz_ret S0.84 TO0.32 max+corr 0.12 (clean, weak); snt_buzz_bfl S0.84 corr 0.18 | — |
| single fields: fundamentals/analyst/option/social (N, A, O, F, S, X tags) | 179 | tax_z250 S0.48; option9 singles dead | fundamental6 newq*/newa*/pnc* all EMPTY (S0) — stop |
| p5 / news variants (P, PV tags) | 56 | p5 TOP3000 S0.91; TOP1000/500 0.5–0.6 | p5 at delay 0 (queued) |
| blends from the pool, positive weights (B, C, D, E, G, H, W tags) | ~145 | d5KjAzlK S2.14 F1.15 sc0.19; frontier at mx≤0.20 EMPTY on 10-21 17:30 (28 actives) | — (exhausted for this pool) |
| universe variants (U, L tags) | 38 | S1.42 but corr 0.84 with originals | TOP200 (likely same) |
| industry-level MARKET-neutral legs (IG/IB/IM/IO) | 23 | A1QvJJ2e S1.90 F1.36 sc0.31 (ACTIVE) | industry REVERSAL, industry volume shock; 2+ industry legs with no stock-level reversal |
| hedging against actives in PnL space | 2 (greedy 10-20, k-path 10-21) | S falls faster than corr: dead | — |
| anti-book tilts / agent constructions | 19 | every one = short of a held premium | — |
| regime gating | 3 | dead (book and p5 both high-vol earners) | — |
| heretic forks (HA slow fundamentals / HB trade_when event-gated / HC between-group, MARKET/INDUSTRY neutral) | 32 (21 complete, 11 errors: regression_neut+vector_neut inaccessible) | ovn_vs_intra20 S1.20 ccp0.55; btw_ind_sector_epsy S1.15 ccp0.43; slow fundamentals |S|<=0.64; event gates |S|<=0.66 | SECTOR-neutral still 0; single-source alpha from a never-used dataset (uniqueness test) |
| delay 0 | 5 | S0.18–0.65, TO>0.75; news12 absent at delay 0 — DEAD | — |
| neutralization NONE/MARKET/SECTOR at stock level | 8 (SEC: 10-22) | all \|S\| ≤ 0.5 (btw_* sector-minus-subindustry legs ~0; sector-neutral hv/pk ratios 0.05–0.5) — DEAD | SECTOR-neutral copies: between-subindustry bets, orthogonal by construction |
| momentum 12/6/3-1 | 3 | S −0.02/−0.02/−0.52 — DEAD in 2019-23 | — |
| concentration (signed_power 2/3) | 4 | fitness FELL (0.66→0.55) — DEAD | — |
| model16 derivative ranks | 5 | one source S0.80 TO0.12, corr 0.80 with 9qWW69M9 — consumed | fscore_bfl_* (38% cov) |
| option8 skew/term/vrp/ivchg/hv/parkinson | 24 (hv/pk 10: best pk_term S1.03 F0.5, hv_chg5 S0.93; vrp_z/term ~0) | sk90m S1.81 F1.04 TO0.20 passes S+F, fails subU; corr 0.64 with A1vMp7Al | subU fix (TOP1000 run queued); skew × large-cap tilt |
| GPU local screener (box, yfinance, calibrated Spearman 0.889 vs BRAIN on 119) → template/GP search for price-volume legs with book-corr ≤ 0.10 | 0 on BRAIN (1 local passer at 10:25: pred S2.05 F1.55 TO0.04 corr0.084 OS1.07) | — | simulate every local passer on BRAIN; pv13 custom-sector grouping |
| slow fundamentals (value/accruals/investment) | 10 (HA forks) | all \|S\| <= 0.64 at TOP3000/SUBINDUSTRY | in LOW-vol regime; SECTOR-neutral |

Most repeated choice since 13:00: positive-weight blend from the pool (fitSearch) — 17 of 60 outputs on 10-21; frontier now empty → stop repeating it. Next block: 3 of 5 outputs on untried rows (delay 0, SECTOR-neutral, industry reversal).

## Rules from corrections (source · kill-if)
- Submit bar: 0.30 — set by UDIT himself in the gate on 10-22 ~12:50 (log: 'bar=0.3'); platform limit 0.7 · kill-if he names another number. Measured 10-22: MP03l9Za 0.6994, vROjgQQv 0.9636, RRA7X3Ag 0.9862, P0M7eWNJ 0.9959, mLYJM1p2 0.8524 (all twins of actives); j2e8W6EE 0.26 clean.
- Self-corr = SIGNED max (submit check 2rj7GQk8) · kill-if a check reports |min|.
- Blend transfer: dense legs cov≥2300, add(filter=true), decay 0; settings neutralization = coarsest leg · kill-if pred–real gap > 0.3 S twice.
- Fitness model is optimistic on low-R legs (pred 1.18 → real 0.84) · require pred F ≥ 1.2.
- Never git add LEDGER (public repo) · never touch his password · no tabs/waves outside runs unless Udit says go.
