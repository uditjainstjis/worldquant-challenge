# ON LOGIN ("in") — procedure for 10-21 night (tab 834044144, no navigation)
1. fetch /users/self → must be 200.
2. ZERO-SUBMISSION BOARD TEST: GET https://api.worldquantbrain.com/competitions/challenge/boards/leader?limit=100&offset=0 (no aggregate) and ...&aggregate=alpha; store raw to localStorage wq_board_raw; print keys of first row, whether rows are per-alpha, and for our user: n rows, sum and mean of isScore, uniquenessScore values. Also ...&aggregate=user&limit=100 for our row (score, isScore, uniquenessScore, days).
3. Recover the 3 sims posted at 20:45: GET /users/self/alphas?order=-dateCreated&limit=12 → match regular.code to HA:assetgrowth / HA:netissue / HA:turnover250 exprs (requeue.json); record S/F/TO into wq_results2 rows; drop them from the requeue if found.
4. Requeue scratchpad requeue.json (36 items, regression_neut→vector_neut): clearInterval(window.__auto); sleep 6 s; wq_queue = items; restart interval (30 s, __tick(3)).
5. Harvest rule unchanged: S≥1.25, F≥1.0, no CONCENTRATED/subU fail, ccp≤0.12 → canonical probe → POST only if SELF_CORRELATION ≤ 0.10 (hook). Repair briefs to the heretic forks otherwise.
