// wave_1019.js — factor-neutral construction (2026-10-19). Inject AFTER tick.js + cc.js + hedge.js.
// Hypothesis: our alphas' daily PnL variance is mostly STYLE-FACTOR exposure (beta/vol, size, short-term
// reversal, momentum) that subindustry neutralization does not remove. Shared factor exposure is what makes
// different lanes correlate 0.3-0.7. Stripping it should (a) cut correlation with every active and
// (b) cut volatility far more than mean return -> Sharpe up. A factor-neutral "twin" of an active then
// correlates with its parent only ~sqrt(idio share of the parent's variance).
// PRE-REGISTERED (05:30 IST 10-19, before any sim): FN_full(pwvEkoAo) -> max corr <= 0.25 (from 0.43) and
// Sharpe >= 1.4. Falsifier: corr >= 0.35 or Sharpe < 1.0. Twin(RRAL7X6b): corr with RRAL <= 0.5.
(function () {
  const gr = x => 'group_rank(' + x + ',subindustry)';
  const N = (x, f, q) => 'group_neutralize(' + x + ',bucket(rank(' + f + '),range="0,1,' + (q || 0.1) + '"))';
  const F = {
    BETA: 'ts_regression(returns,group_mean(returns,1,market),120,lag=0,rettype=2)',
    VOL: 'ts_std_dev(returns,60)',
    SIZE: 'cap',
    STR: 'ts_sum(returns,5)',
    MOM: 'ts_sum(returns,252)-ts_sum(returns,21)',
    ID: 'close/open'
  };
  const full = x => N(N(N(N(N(x, F.BETA), F.SIZE), F.STR), F.MOM), F.ID);
  const PW = gr('ts_backfill(news_eod_vwap/close,20)') + '+' + gr('ts_mean(implied_volatility_call_30-implied_volatility_put_30,10)');
  const RRAL = '-(group_rank(close/open-1,subindustry)+group_rank(ts_sum(returns,3)/ts_std_dev(returns,20),subindustry))';
  const XGJ = 'rank(-ts_delta(close,3))*rank(ts_mean(volume,5)/ts_mean(volume,60))';
  const mk = (tag, expr, decay, extra) => ({ tag, expr, settings: Object.assign({}, window.__S, { decay }, extra || {}) });
  window.__F = F; window.__FN = { N, full, PW, RRAL, XGJ, gr };
  window.__wave1019 = [
    // factor proxies: diagnostics + zero-cost hedges
    mk('X1:mkt_proxy', 'close/close', 0, { neutralization: 'NONE' }),
    mk('X1:beta_proxy', gr(F.BETA), 1),
    mk('X1:vol_proxy', gr(F.VOL), 1),
    // factor-neutral pwvEkoAo
    mk('X2:pwv_FNbeta_d25', N(PW, F.BETA), 25),
    mk('X2:pwv_FNfull_d25', full(PW), 25),
    mk('X2:pwv_FNvol_size_str_d25', N(N(N(PW, F.VOL), F.SIZE), F.STR), 25),
    // factor-neutral twins of two actives (reversal lane)
    mk('X3:twin_RRAL_d5', full(RRAL), 5),
    mk('X3:twin_XGJ_d8', full(XGJ), 8),
    mk('X1:size_proxy', gr('-' + F.SIZE), 1)
  ];
  window.__queueFront = items => { const Q = JSON.parse(localStorage.getItem('wq_queue') || '[]');
    localStorage.setItem('wq_queue', JSON.stringify(items.concat(Q))); return items.length + Q.length; };
})();
