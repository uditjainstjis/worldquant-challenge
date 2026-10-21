# PRATIKRAMAN — worldquant
interval: 60m

## Goal (Udit's words)
"i need rank one it, u wokr autonomsly and get me" (10-01) · "make todays submissions, into 0.0 something" (10-19) · "submit today's alpha, it only goes in negative, u can do it" (10-20) · "set goals which are unreasonable ... not move below that" (10-21) · "hard hooks ... to not submit below our target" (10-21) → today's result: an ACTIVE alpha with platform self-corr ≤ 0.10 (hook-enforced), stretch ≤ −0.15.

## Factor map (counts from wq_results2 tags, 656 sims as of 10-21 17:20; "0" = untried)
| factor | tried | best | untried cells |
|---|---|---|---|
| single new fields: news12 rare (R1–R6, RF) | 54 + 36 running | p5 S0.91 mx0.05; minutes_to_3pct_loss S0.48 | ~40 RF still in queue |
| single fields: fundamentals/analyst/option/social (N, A, O, F, S, X tags) | 179 | tax_z250 S0.48; option9 singles dead | fundamental6 newq*/newa*/pnc* all EMPTY (S0) — stop |
| p5 / news variants (P, PV tags) | 56 | p5 TOP3000 S0.91; TOP1000/500 0.5–0.6 | p5 at delay 0 (queued) |
| blends from the pool, positive weights (B, C, D, E, G, H, W tags) | ~145 | d5KjAzlK S2.14 F1.15 sc0.19; frontier at mx≤0.20 EMPTY on 10-21 17:30 (28 actives) | — (exhausted for this pool) |
| universe variants (U, L tags) | 38 | S1.42 but corr 0.84 with originals | TOP200 (likely same) |
| industry-level MARKET-neutral legs (IG/IB/IM/IO) | 23 | A1QvJJ2e S1.90 F1.36 sc0.31 (ACTIVE) | industry REVERSAL, industry volume shock; 2+ industry legs with no stock-level reversal |
| hedging against actives in PnL space | 2 (greedy 10-20, k-path 10-21) | S falls faster than corr: dead | — |
| anti-book tilts / agent constructions | 19 | every one = short of a held premium | — |
| regime gating | 3 | dead (book and p5 both high-vol earners) | — |
| delay 0 | 0 → 5 queued 17:40 | — | everything |
| neutralization NONE/MARKET/SECTOR at stock level | 0 | — | SECTOR-neutral copies: between-subindustry bets, orthogonal by construction |
| momentum 12-1 (different premium) | 0 (M tags = 3, unclear) | — | as blend leg with p5 + industry legs |

Most repeated choice since 13:00: positive-weight blend from the pool (fitSearch) — 17 of 60 outputs on 10-21; frontier now empty → stop repeating it. Next block: 3 of 5 outputs on untried rows (delay 0, SECTOR-neutral, industry reversal).

## Rules from corrections (source · kill-if)
- Submit bar sc ≤ 0.10 is MECHANICAL (wq-gate, Udit 10-21) · kill-if Udit raises it in words.
- Self-corr = SIGNED max (submit check 2rj7GQk8) · kill-if a check reports |min|.
- Blend transfer: dense legs cov≥2300, add(filter=true), decay 0; settings neutralization = coarsest leg · kill-if pred–real gap > 0.3 S twice.
- Fitness model is optimistic on low-R legs (pred 1.18 → real 0.84) · require pred F ≥ 1.2.
- Never git add LEDGER (public repo) · never touch his password · no tabs/waves outside runs unless Udit says go.
