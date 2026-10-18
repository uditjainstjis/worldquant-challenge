// wave_1019.js — factor-neutral construction (2026-10-19). Inject AFTER tick.js + cc.js + hedge.js.
// Hypothesis: our alphas' daily PnL variance is mostly STYLE-FACTOR exposure (beta/vol, size, momentum,
// short-term reversal) that subindustry neutralization leaves in; shared exposure is why different lanes
// correlate 0.3-0.7. Stripping it should cut correlation with every active and cut vol more than mean.
// A factor-neutral "twin" of an active then correlates with its parent ~sqrt(idio share of parent variance).
// CONFOUND RULE (advisor 05:40): never neutralize an alpha against a factor that IS its content
// (reversal alphas vs STR/ID buckets) - that removes the signal, not the exposure. Twins use FAC (no STR/ID).
// KILL LINE (pre-registered 05:45 IST): OLS of each active's PnL on {mkt, beta, vol, size, mom} proxies.
//   median R^2 > 0.5 -> factor story real, build twins all day; < 0.3 -> correlation is content -> hedge screen.
// PRE-REGISTERED: pwv_FNfac (beta,size,mom) max corr <= 0.25 (from 0.43) with Sharpe >= 1.4;
//   falsifier corr >= 0.35 or Sharpe < 1.0. Twins of news/IV/flag actives: corr with parent <= 0.5.
(function () {
  const gr = x => 'group_rank(' + x + ',subindustry)';
  const N = (x, f, q) => 'group_neutralize(' + x + ',bucket(rank(' + f + '),range="0,1,' + (q || 0.1) + '"))';
  const F = {
    BETA: 'ts_regression(returns,group_mean(returns,1,market),120,lag=0,rettype=2)', // 'market' group may not exist -> VOL fallback
    VOL: 'ts_std_dev(returns,60)',
    SIZE: 'cap',
    STR: 'ts_sum(returns,5)',
    MOM: 'ts_sum(returns,252)-ts_sum(returns,21)',
    ID: 'close/open'
  };
  window.__F = F;
  window.__FAC = (x, risk) => N(N(N(x, risk || F.BETA), F.SIZE), F.MOM);            // style factors, no reversal content
  window.__FULL = (x, risk) => N(N(window.__FAC(x, risk), F.STR), F.ID);             // only for non-reversal content
  const PW = gr('ts_backfill(news_eod_vwap/close,20)') + '+' + gr('ts_mean(implied_volatility_call_30-implied_volatility_put_30,10)');
  const mk = (tag, expr, decay, extra) => ({ tag, expr, settings: Object.assign({}, window.__S, { decay }, extra || {}) });
  window.__mk1019 = mk;
  // build the wave; risk = F.BETA or F.VOL (fallback when 'market' is not a valid group)
  window.__buildWave1019 = (risk) => {
    const codes = JSON.parse(localStorage.getItem('wq_act_code') || '{}');
    const twin = id => codes[id] ? mk('X3:twin_' + id, window.__FAC(codes[id].code, risk), codes[id].decay || 10) : null;
    return [
      mk('X1:mkt_proxy', 'close/close', 0, { neutralization: 'NONE' }),
      mk('X1:beta_proxy', gr(risk || F.BETA), 1),
      mk('X1:vol_proxy', gr(F.VOL), 1),
      mk('X2:pwv_FNfac_d25', window.__FAC(PW, risk), 25),
      twin('VkdvzZa5'), twin('A1vMp7Al'),
      mk('X1:size_proxy', gr('-' + F.SIZE), 1),
      twin('QPKbbpbG'), twin('LL5Vgolv'),
      mk('X2:pwv_FNfull_d25', window.__FULL(PW, risk), 25),
      codes['RRAL7X6b'] ? mk('X3:twinctl_RRAL7X6b', window.__FAC(codes['RRAL7X6b'].code, risk), 5) : null // control: reversal twin without STR/ID
    ].filter(Boolean);
  };
  window.__queueFront = items => { const Q = JSON.parse(localStorage.getItem('wq_queue') || '[]');
    localStorage.setItem('wq_queue', JSON.stringify(items.concat(Q))); return items.length + Q.length; };
  // R^2 of each active's PnL on factor-proxy PnLs (ids of the simulated proxies)
  window.__r2 = (proxyIds) => {
    const ids = window.__ACT.concat(proxyIds); const A = window.__arr(ids);
    const X = proxyIds.map(p => A[p]); const out = [];
    for (const id of window.__ACT) { const y = A[id]; const b = window.__H.ols(y, X); const h = window.__H.resid(y, X, b);
      const vy = window.__H.sd(y) ** 2, vh = window.__H.sd(h) ** 2; out.push([id, +(1 - vh / vy).toFixed(2)]); }
    out.sort((p, q) => q[1] - p[1]); const med = out.map(o => o[1]).sort((a, b) => a - b)[Math.floor(out.length / 2)];
    return { median: med, per: out };
  };
})();
