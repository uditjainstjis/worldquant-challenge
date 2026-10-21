# PRATIKRAMAN — worldquant
interval: 60m

## A. Udit's asks — VERBATIM, status, evidence
- 10-01 "i need rank one it, u wokr autonomsly and get me" — partly: rank 249→184 (10-21 board), score 0.52, 14 days.
- 10-19 "make todays submissions, into 0.0 something , so low such we straighttly average out win" — partly: lowest real 0.0428 (npA7J7r3) and 0.0961 (6XAKX98K) but both fail fitness; submitted 0.1255–0.22.
- 10-20 "submit today's alpha, it only goes in negative, u can do it" — not yet: no negative passer. Floor −0.387 computed; best passer 0.1897.
- 10-20 "what's lowest thoeritically correlation can go? what do we have to do to make it negative?" — done (answered with numbers).
- 10-20 "what is total score, IS score, uniqueness, what matters for what, what is proportional?" — done (board refit R² 0.998, told him).
- 10-20 "to dominate like a god boss ... what we wud have to score" — done (answered: 30 days, isScore ≥15k, uniq ≤0.30).
- 10-20 "dont get fooled by the leaderboard ... u can kill the score of 1st rank in 1alpha" — parked: tested via board delta (isScore +807 from 5 alphas on 10-21 board: 7,924→8,731; pre-reg 8,700 ✓).
- 10-20 "take it bud [creds file] and make me proud" — declined (never handle password). Told him to delete it.
- 10-20 "how many alpha's can we submit in a day ... 20alpha's by today of score 0" — partly: no cap found (FAQ), did 5 in one day; 20 at score 0 not possible yet (fitness wall).
- 10-21 "people scoring -0.15 ... not about jbl ... win the quant thing being super awesome guy into quant ... can a single alien alpha make the founder of worldquant contact us?" — done (answered: machine > single alpha; consultant path = #1 India).
- 10-21 "logged in bro, 1. consultant income, research role, title ... set goals which are unreasonable ... not move below that or push things (unless last hour if day dies for streak)" — goal board written to STATE; NOT told to Udit until now (missed — fixing in this reply).
- 10-21 "u didn't tell what ambition u set" — doing now.

## B. My plan — neutral view
Doing: (1) today's first alpha from the fitness-aware blend loop; (2) factory of rare news12 fields nobody uses (60 probes) to find independent return sources; (3) p5 (pct_change_5min_post_news) is the first clean one (S0.91, max corr 0.05).
Why: negative/near-zero needs independent return; the old pool has none left (frontier at 0 = S1.07, fails fitness).
Would prove it wrong: if 60 rare probes give 0 fields with S≥0.8 and |book corr|<0.15 → raw fields are not the lever; need constructions (sector splits, event-conditioned, regime) instead.

## C. Exploration map (counted from wq_results2 on 10-21 12:30)
| dimension | options | times used | best result | untried |
|---|---|---|---|---|
| single new fields (N1/A1/FX/RF/P5) | option9, pv13, analyst4 revisions, fundamental2 misc, news12 rare | 83 sims | p5 S0.91 corr0.05; tax_z250 S0.48 | news12 ~90 more rare fields queued; fundamental6 (886 f) never touched; socialmedia8 |
| blends TOP3000 (F/G/H) | 2–7 legs, hump, cube, decay | 70 sims, 13 pass | d5KjAzlK S2.14 F1.15 sc0.19 | TOP1000-native blends (L1 library 16/30 done) |
| between-group (BG) | subindustry/industry means | 6 | S0.74 | sector-level with real factor fields |
| universe (U1) | TOP1000/500/SP500 | 3 queued | — | TOP200 |
| negative construction | anti-book tilt, hedges | ~8 | 0.0428 (fails F) | strong-leg anti-book (needs S≥2 independent source) |
| OS/hold-out test (G7) | — | 0 | — | everything |

## D. Rules I've learned
- Self-corr = SIGNED max (evidence: 2rj7GQk8 check 0.1255 vs |min| 0.1753). kill-if: a submit check ever reports |min| as value.
- Blend transfer needs dense legs (cov≥2300), add(filter=true), decay 0 (evidence: S pred 2.12 / real 2.09). kill-if: pred-real gap > 0.3 S twice.
- Fitness model runs optimistic; today 1.18 pred → 0.84 real on the p5 mix (my assumption of 0.85√K return boost is WRONG for low-R legs). kill-if: already killed for low-R legs — recalibrate.
- isScore ≈ 2350 × Sharpe(sum of actives) (evidence: 4 points + pre-reg 8,700 vs real 8,731). kill-if: next delta off by >400.
- Uniqueness ≠ our own corr (evidence: own max-corr fell, board uniq rose) — HYPOTHESIS, not fact.
- Never git add LEDGER (Udit; public repo). Never touch his password (Udit).

## E. Jottings
- p5 field is 1,233-stock coverage: TOP1000 version may be denser → better fitness. Queued.
- "Strong anti-book" candidate: nothing with S>1 and book corr<−0.1 yet. Try p5 × sign(book-heavy factor)?
- Fitness wall: R ≈ 0.04 for diversified mixes. Return per dollar needs concentrated winners → try trade_when gating on p5 extremes.
- OS test never run (G7). Should run before 11-06 claims.

- G7 proxy found: IS = 2019-2023, BRAIN OS starts 2024 but all OS checks PENDING. 9 of 26 actives decayed in 2023 (L12m < 0.8). Gate new submissions at L12m >= 1.0.
- Pool frontier depleted after 5 submissions: t0.23 now S2.07 (was 2.68). New sources are the only lever; 83 single-field probes gave 1 clean (p5).

## F. Reflection log
- 10-21 12:50 · Found: agent launched on G2 (committed-heretic brief); frontier depleted; fitness model wrong for low-R legs · Changed: L12m gate added; stop expecting ≤0.1 from the old pool.
- 10-21 12:30 · Found: told Udit nothing about the goal board I wrote; fitness model badly optimistic on low-return legs · Changed: reply with goals now; stop trusting F~ above 1.2 for low-R mixes.
