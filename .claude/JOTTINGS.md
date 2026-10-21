# JOTTINGS — worldquant (ideas and hunches; not a log)
- p5 field is 1,233-stock coverage: TOP1000 version may be denser → better fitness. Queued.
- "Strong anti-book" candidate: nothing with S>1 and book corr<−0.1 yet. Try p5 × sign(book-heavy factor)?
- Fitness wall: R ≈ 0.04 for diversified mixes. Return per dollar needs concentrated winners → try trade_when gating on p5 extremes.
- OS test never run (G7). Should run before 11-06 claims.
- G7 proxy found: IS = 2019-2023, BRAIN OS starts 2024 but all OS checks PENDING. 9 of 26 actives decayed in 2023 (L12m < 0.8). Gate new submissions at L12m >= 1.0.
- Pool frontier depleted after 5 submissions: t0.23 now S2.07 (was 2.68). New sources are the only lever; 83 single-field probes gave 1 clean (p5).
- Industry-level legs under MARKET neutralization are orthogonal by construction: ind_epsrev S0.70 (mx 0.27, book 0.04), ind_recchg S0.51 (mx 0.13, book -0.08), ind_p5 0.16, sec_ivc3 ~0. Weak alone, but they are the first legs whose correlation with the book is ~0 AND whose return is not the short of a held premium. Blends anchored on them (IB:) predicted S1.35-1.97 at mx 0.10-0.18.
- Agent's anti-book tilts: every one is the short of a held premium (P1 -0.85, P3 -1.55, rows 1-3 ~0 or flipped-reversal). Rule: 'anti-book' must come from a different ORGANISATION of the cross-section (industry level, large-cap), not from reversing a signal.
- 10-21 17:40: delay-0 is an untried axis on a USA-only account: same signal at delay 0 is a different return stream (positions on today's close). Queued D0:rev1/cvwap/rev3/p5/p5d3. If p5 at delay 0 is strong and uncorrelated, build the whole factory at delay 0.
- 10-21 17:35: OLS-hedging against actives is dead: S 2.02 -> 0.52 by the 3rd hedge, max corr still 0.26. The blend's return IS the book factor; only new return streams move the max.
- Within-sector-between-subindustry components (group_mean(x,subindustry) - group_mean(x,sector)) are orthogonal to our subindustry-neutral actives by construction; tried only for revisions/recchg/p5. Untried: industry-level reversal, industry-level volume shocks.
- 12-1 month momentum vs our short-term reversal book: a different premium, usually low or negative PnL correlation; weak Sharpe 2019-23 -> blend leg only.

## 10-21 21:45 — board metric hypotheses (from uniqueness_lawyer.md; unverified until the zero-submission test runs)
- Board uniqueness is NOT own self-corr (F1 fits 1 of 4 steps; five 0.19-0.22 blends moved it 0.00). Survivors: F2 per-alpha crowding vs the POOL recomputed daily; F3 book-level |corr(sum of own PnL, pool reference)|.
- ZERO-SUBMISSION TEST (first thing after login): GET /competitions/challenge/boards/leader?limit=100&offset=0 WITHOUT aggregate=user (and with aggregate=alpha) → per-alpha isScore/uniquenessScore rows settle sum-vs-mean and permanent-vs-recomputed.
- Discriminating one-alpha test: a single-source passer from a never-used dataset (socialmedia12/model16/model51): F2 predicts 0.72, F3 0.74. For isScore: a low-Sharpe (~1.3) passer NEGATIVELY correlated with the book: mean model → −130, Sharpe-of-sum → rises.
- If F2/F3 hold, the lever for top-decile uniqueness (≤0.58 from 0.74) is ~8-10 alphas new vs the POOL or anti-book, not orthogonal to our own 28. The ≤0.10 bar stays the QCAP-sheet lever (mean submit-time self-corr).
