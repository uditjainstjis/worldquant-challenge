# Uniqueness lawyer — what the Challenge-India board's `uniquenessScore` and `isScore` can and cannot be (2026-10-21, 25-min box)

Scope: no browser, no simulations. Inputs = STATE.md board series, milestone CSV, inspection reports (hypotheses), web (most official pages 403/429 from this agent — gaps marked).

## 0. Two arithmetic facts that decide more than any web quote

Board series (board date reflects the previous EST day; n = ACTIVE alphas at that refresh):

| board | n | days | isScore | uniq | what was added |
|---|---|---|---|---|---|
| 10-14 | 11 | 7 | 7041 | 0.64 | — |
| 10-15 | 12 | 8 | 6888 | 0.61 | VkdvzZa5 (news, submit self-corr 0.233) |
| 10-16 | 13 | 9 | 6935 | 0.61 | LL5Vgolv (news, 0.571) |
| 10-17 | 16 | 10 | 6910 | 0.71 | RRAL7X6b 0.537, kqJb5XOL 0.454, bl8VV5Qq 0.300 (price-volume composites) |
| 10-18 | 18 | 11 | 7088 | 0.73 | 3qj3WJgX 0.568, npAo5KkE 0.299 (uncrowded data) |
| 10-19 | 19 | 12 | 7298 | 0.74 | xA1PJpWl 0.406 |
| 10-20 | 21 | 13 | 7924 | 0.74 | KPmbm0X8 0.200, 2rj7GQk8 0.126 |
| 10-21 | 26 | 14 | 8731 | 0.74 | five blends at 0.190–0.222 |
| 10-22 | 28+ | 15 | ? | ? | akVxYxZw 0.222, A1QvJJ2e 0.310 (+ anything else submitted 10-21) |

**Fact A — the 10-16 step kills every "permanent per-alpha mean" model, whatever the per-alpha quantity is.** 13 alphas at 0.61 -> 16 at 0.71 needs the three new alphas to average (16x0.71 - 13x0.61)/3 = **1.14**; worst-case rounding (0.705 / 0.615) still 1.095 > 1. No correlation-bounded value does that. So at least one of: (i) old alphas' values are RECOMPUTED every refresh, (ii) the aggregate is not a mean, (iii) the quantity is not a correlation. Every candidate below is checked against this.

**Fact B — the 10-20 -> 10-21 step kills "mean of max own-PnL correlation" on its own.** Five alphas at signed max 0.19–0.22 onto n=21 at 0.74: predicted (21x0.74 + 5x0.21)/26 = **0.64**; board **0.74** (delta 0.00). The lag escape is weak: the 10-15 and 10-17 steps both moved the morning after submission (same-day inclusion), and isScore moved +807 on this same refresh.

Honest accounting: the own-self-corr model fit **1 of 4** steps (0.64 -> 0.61 at n=12, "exactly as predicted"), and that one coincidence anchored the session for a week.

## 1. Verbatim definitions found (with source status)

Official, fetched this session:
- IQC Guidelines, https://www.worldquant.com/brain/iqc-guidelines/ (item 8): "Alphas are considered for scoring if they qualify for out-of-sample testing." / "Each qualifying alpha is scored based on its performance against other alphas submitted by the other participants in the IQC." / "the scores for each individual on a team are aggregated to produce a team score." (item 12, team mergers): "A correlation test will then be run on the new team pool" ... alphas "that fail the correlation test will be removed from the aggregated pool." (item 9): "The scoring methodology for the IQC may vary in each stage of the IQC, at the sole discretion of WorldQuant." -> **An official WorldQuant board already scores alphas RELATIVE TO OTHER PARTICIPANTS' alphas and runs pool-level correlation tests.** Different competition, same organiser, same instinct.
- IQC page, https://www.worldquant.com/brain/iqc/: "participants are evaluated on both the quality and the quantity of your alpha submissions."

Official, recorded in STATE.md on 10-20 from support.worldquantbrain.com ("WQ Challenge Country" FAQ; direct fetch = HTTP 403 from this agent, URL not re-verified): components = IS Performance + Uniqueness ("Diversify your alpha ideas - explore different datasets, regions, and approaches rather than submitting variations of the same alpha") + Submission Days ("Regular daily activity is weighted positively"); "ongoing submissions matter more than a single burst"; refresh daily. -> The uniqueness sentence names datasets/regions/approaches, i.e. a metadata/crowding notion is legal under the wording, not only PnL correlation. Regions are unavailable on this account (STATE 10-05), so only datasets and approaches are open levers.

Third-party:
- Scribd "WorldQuant Challenge Overview and Scoring", https://www.scribd.com/document/870788462/WorldQuant-Challenge-WorldQuant-BRAIN: "Scoring is based on the quantity and quality of submitted Alphas, calculated daily, with a maximum score of 2,000 points." / "scores refresh daily at 3 AM EST." (user-uploaded; the 2,000-point figure contradicts the live board, treat as stale/unreliable).
- quantt.co.uk review, https://www.quantt.co.uk/resources/worldquant-brain: "Community sources also describe a self-correlation limit of 0.7 against your own submitted alphas, and stricter tests for delay-0 alphas and for China." / "None of those is confirmed in official material." Consultant pay depends on "how correlated they are with alphas already in WorldQuant's pool".
- QuantML-Research/wq-alpha-research, https://github.com/QuantML-Research/wq-alpha-research: "Self-correlation must be measured on daily PnL changes, not cumulative PnL curves." / "low correlation usually needs a different data source or economic logic."
- AgonAlpha (arXiv 2608.11250): flags submitted alphas "with reported self-correlation above 0.70" on "BRAIN OS tracking".
- Not reachable this session (403/429): platform.worldquantbrain.com/learn/documentation/.../alpha-submission-criteria, support.worldquantbrain.com search, deepwiki summaries, Medium "Top-0.04%" article.

Platform facts already measured in STATE (first-hand): submit-check SELF_CORRELATION is a **signed max** over own actives (10-19); `/correlations/prod` = HTTP 403, `is.prodCorrelation` = 0 for this account; board endpoint `/competitions/challenge/boards/leader?limit=100&offset=N&aggregate=user` returns rank, score, isScore, uniquenessScore, days.

## 2. Board uniqueness — three structurally different candidates

### F1. Own-PnL mean of max |corr| (the session's working assumption; signed / abs / lagged variants)
uniq = mean_i max_{j != i} |corr(dPnL_i, dPnL_j)| over own ACTIVE alphas, recomputed each refresh.
- Predicted vs board: n=13 0.60 vs 0.61 (hit); n=16 0.57 vs 0.71 (miss by +0.14, wrong direction); n=21 0.51 vs 0.74 (miss); n=26 0.64 vs 0.74 (miss, Fact B). Abs-value variant needs the 10-20 five to have |min| ~0.7; recorded mins were -0.175/-0.178. **Refuted unless the uniqueness component lags >= 2 refreshes.**
- Survives Fact A? Only via recomputation (old reversal alphas' max rises when a new reversal alpha lands) — but the session's own recomputation FELL on 10-16, so no.
- 10-22 one-alpha test (lag check, costs nothing): if the 10-22 board shows ~0.64–0.66 with no new near-zero alpha, lag was the escape and F1 lives; if it stays 0.73–0.74, F1 is dead for good.

### F2. Per-alpha crowding vs the POOL (Challenge participants and/or WorldQuant production), mean over own alphas, recomputed daily
uniq = mean_i c_i, c_i = max_k |corr(dPnL_i, dPnL_k)| over k in the pool (or a dataset/approach-overlap share — legal under the FAQ wording), recomputed as the pool grows.
- Why it fits the stickiness: a blend of our own legs is exactly as crowded as its legs (~0.74), so the 10-20 five move nothing (predicted 0.74, board 0.74). News alpha at n=12 was genuinely uncommon (c ~0.3 -> 0.64 -> 0.61, hit).
- Fact A: as a permanent mean it fails the 10-16 step (needs 1.14); it survives only if old values were recomputed upward on 10-16 (pool growth in the reversal direction that day) — a coincidence to carry.
- Flag: if c_i were production correlation, 0.74 > the 0.7 prod-corr limit community sources cite, so either Challenge accounts skip that check (consistent with `/correlations/prod` 403) or it is not prod-corr.
- 10-22 one-alpha test: submit ONE single-source passer from a never-used dataset (STATE: socialmedia12, model16, model51 untouched). Predicted under F2: (28x0.74 + u)/29 with u ~0.1–0.2 -> **0.72**. A blend of existing legs predicts 0.74 (useless as a test).

### F3. Book-level correlation: one number per user
uniq = |corr(sum_i dPnL_i over own actives, R)|, R = the pool's aggregate PnL (or a dominant common factor such as the reversal/quiet-volume tilt that our own PC1 = 29.5% with all actives loading positive).
- Fits every step in direction and roughly in size: n=12 news alpha dilutes the book (-0.03); n=16 three reversal alphas tilt the book onto the common factor (+0.10, and Fact A is not a problem because nothing per-alpha is averaged); n >= 19 saturates because one alpha is < 5% of the book (+0.02, +0.01, 0, 0).
- Arithmetic at n=28 (mean off-diag corr 0.23 -> sd(book) ~14 alpha-units): adding one alpha with corr -0.4 to the book and -0.3 to R moves the number from 0.740 to ~0.737. **One alpha cannot move it; ~8–10 anti-book alphas (corr <= -0.3 with the book) are needed for -0.05 to -0.10.**
- 10-22 one-alpha test: the same never-used-dataset alpha as F2. Predicted under F3: **0.74 +/- 0.01**. So the single-source alpha discriminates F2 (0.72) from F3 (0.74); the 10-22 board also runs the F1 lag check for free.

### Zero-submission test that beats all three (do this first, logged in, via the session's injected JS)
The LEDGER endpoint carries `aggregate=user`. GET the same path WITHOUT it (or with `aggregate=alpha`, or add `&user=UJ82561`) and look for per-alpha rows. If per-alpha `isScore` / `uniquenessScore` exist: (a) sum vs mean is read directly (do the 28 rows sum to 8,731x28 or average to 8,731?); (b) per-alpha uniqueness values > 0.70 => not own self-corr (bounded 0.7 by the check); (c) re-read next day: values that change for OLD alphas => recomputed (F2/F3), fixed => permanent. This replaces a week of one-alpha probes.

## 3. isScore — mean or sum?

Implied per-alpha values under the permanent-mean model M (total = n x isScore): n=12 5,205; n=13 7,499; n=14–16 avg 6,802; n=17–18 avg 8,512; n=19 11,078; n=20–21 avg 13,871; n=22–26 avg 12,120. Later alphas (S 1.4–2.1, same as early ones) would have to be worth ~2x the early ones -> M is strained, not dead.
Plain additive sum P (sum of v_i >= 0): dead on 11 -> 12 (7041 -> 6888 with a positive-Sharpe alpha added).
Sharpe-of-sum S (isScore ~ 2350 x Sharpe(sum of active dPnL)): ratio 2304–2377 at n=14/18/19/21, pre-registered 8,700 +/- 250 and got 8,731 at n=26. Explains the n=12 drop (a S1.65 alpha added to an equal-weight sum of a S~3 book can lower the sum's Sharpe). Strain: #1's 33,545 at 10 days = combined Sharpe 14.3 (needs ~100 near-independent alphas, e.g. multi-region); under M it is a per-alpha mean 4x ours. Both survivors are strained by #1; S has five numeric hits, M has one.

10-22 predictions (two 10-21 alphas: akVxYxZw S1.91 F1.01 sc 0.22; A1QvJJ2e S1.90 F1.36 sc 0.31):
- M with recent implied values (~12k): (227,006 + 24,000)/28 = **~8,970**; with early-style values (~7k): **~8,600** (a drop).
- S at +0.05–0.07 combined-Sharpe per alpha (10-20's five: 3.343 -> 3.697): 3.70 + 0.10 -> 2350 x 3.80–3.84 = **~8,930–9,020**.
- Ranges overlap: the 10-22 refresh does NOT discriminate M from S. Clean one-alpha discriminator: a LOW-Sharpe passer (~1.3) that is NEGATIVELY correlated with the book (anti-book; STATE 10-19 cancellers rec_chg21 bl82wYxZ, buy_share_chg21 omowdKP5 are the seeds). M -> isScore falls ~ (8,731 - 5,000)/29 = **-130**; S -> isScore RISES (sum vol drops, return roughly held). Opposite signs; one refresh settles it.
- Do not fit isScore on `milestone_lb_2026-10-16.csv` `brain_score`: it is the platform BRAIN points (corr 0.996 with days, ~1,880/alpha median; our row 17,467.9 vs board isScore 6,935 that day). Different quantity.

## 4. Verdict on the self-corr <= 0.10 bar

Split the two boards. (a) QCAP milestone sheet "Avg. Self-Correlation" = mean of submit-time SELF_CORRELATION, first alpha excluded (pinned in STATE, reproduces 0.5404 exactly): there, every alpha under the current 0.406 average helps and <= 0.10 is the right lever. (b) Challenge-India `uniquenessScore`: five alphas at 0.19–0.22 moved it 0.00 where an own-self-corr mean predicted -0.10, and the 10-16 step cannot be produced by any permanent per-alpha mean at all (needs 1.14). Both surviving constructions (F2 pool crowding, F3 book-level correlation) make per-alpha self-correlation vs our 28 actives neither necessary nor sufficient: a <= 0.10 blend of existing legs is predicted to leave the board at 0.74 under both. Target arithmetic: uniq pct 0.42 -> top decile needs <= 0.58 (board P10), min on board 0.30; under F2 that is ~10 single-source alphas on never-used datasets at c ~0.2 ((28x0.74 + 10x0.2)/38 = 0.60); under F3 ~8–10 anti-book alphas at corr <= -0.3 with the book. Either way the unit of work is "new vs the pool / against the book", not "orthogonal to ourselves". Recommendation: keep <= 0.10 as the JBL-sheet bar only; for the main board run the zero-submission per-alpha endpoint read tonight and the one single-source alpha tomorrow (F2 0.72 vs F3 0.74), and the anti-book low-Sharpe alpha for isScore (M -130 vs S rise).
