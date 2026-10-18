// hedge.js — near-zero self-correlation toolkit (2026-10-19). Inject AFTER tick.js + cc.js.
// Idea: PnL correlation with an active can be removed by subtracting a scaled copy of a hedge alpha.
//   PnL space : h = y - sum_j b_j x_j   (b = OLS slopes of candidate PnL y on hedge PnLs x_j)
//               corr(h, x_j) = 0 for every hedge used; cost = b_j * mean(x_j)  -> cheap hedges have Sharpe ~ 0.
//   Signal    : H(c,dc) - sum_j b_j H(a_j,da_j),  H(x,d) = scale(group_neutralize(ts_decay_linear(x,d),subindustry)),
//               simulated with decay 0. scale() puts every component at unit GMV, so b carries over unchanged.
// Platform SELF_CORRELATION is (to be verified) the SIGNED max over actives -> negative correlations are free.
(function (root) {
  const mean = v => { let s = 0; for (const x of v) s += x; return s / v.length; };
  const sd = v => { const m = mean(v); let s = 0; for (const x of v) s += (x - m) * (x - m); return Math.sqrt(s / (v.length - 1)); };
  const sharpe = v => mean(v) / sd(v) * Math.sqrt(252);
  const corr = (a, b) => { const ma = mean(a), mb = mean(b); let n = 0, da = 0, db = 0;
    for (let i = 0; i < a.length; i++) { const x = a[i] - ma, y = b[i] - mb; n += x * y; da += x * x; db += y * y; }
    return n / Math.sqrt(da * db); };
  // OLS of y on columns X with intercept; returns slopes only
  function ols(y, X) {
    const k = X.length, N = k + 1, T = y.length;
    const A = [...Array(N)].map(() => Array(N + 1).fill(0));
    for (let t = 0; t < T; t++) {
      const r = [1]; for (let j = 0; j < k; j++) r.push(X[j][t]);
      for (let i = 0; i < N; i++) { A[i][N] += r[i] * y[t]; for (let j = 0; j < N; j++) A[i][j] += r[i] * r[j]; }
    }
    for (let c = 0; c < N; c++) {
      let p = c; for (let r = c + 1; r < N; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]];
      for (let r = 0; r < N; r++) { if (r === c) continue; const f = A[r][c] / A[c][c]; for (let j = c; j <= N; j++) A[r][j] -= f * A[c][j]; }
    }
    return A.slice(1).map((r, i) => r[N] / r[i + 1]);
  }
  const resid = (y, X, b) => y.map((v, t) => { let s = v; for (let j = 0; j < X.length; j++) s -= b[j] * X[j][t]; return s; });
  // greedy: add the hedge that most lowers the max SIGNED corr vs all actives; stop at target or maxK
  function greedy(y, acts, hedges, opt) {
    opt = opt || {}; const target = opt.target ?? 0.05, maxK = opt.maxK ?? 3, absMode = !!opt.abs;
    const ids = Object.keys(acts), A = ids.map(i => acts[i]);
    const score = h => { const cs = ids.map((id, i) => [id, +corr(h, A[i]).toFixed(3)]);
      cs.sort((p, q) => (absMode ? Math.abs(q[1]) - Math.abs(p[1]) : q[1] - p[1])); return cs; };
    const evalSet = S => { const X = S.map(j => hedges[j]); const b = S.length ? ols(y, X) : [];
      const h = S.length ? resid(y, X, b) : y; const cs = score(h);
      return { S: [...S], b: b.map(x => +x.toFixed(3)), sharpe: +sharpe(h).toFixed(2), max: absMode ? Math.abs(cs[0][1]) : cs[0][1], top: cs.slice(0, 3) }; };
    let cur = evalSet([]); const path = [cur];
    while (cur.max > target && cur.S.length < maxK) {
      let best = null;
      for (const j of Object.keys(hedges)) {
        if (cur.S.includes(j)) continue;
        const e = evalSet([...cur.S, j]);
        const s = e.max + 0.08 * Math.max(0, cur.sharpe - e.sharpe); // corr first, Sharpe loss as tie-break
        if (!best || s < best.s) best = { ...e, s };
      }
      if (!best || best.max >= cur.max - 0.005) break;
      delete best.s; cur = best; path.push(cur);
    }
    return path;
  }
  // rough FASTEXPR operator count (function calls + binary arithmetic)
  const opCount = e => (e.match(/[a-z_][a-z0-9_]*\s*\(/gi) || []).length + (e.match(/[+*\/]|(?<=[\w)\s])-(?=[\s\w(])/g) || []).length;
  const H = (expr, d) => 'scale(group_neutralize(ts_decay_linear(' + expr + ',' + Math.max(1, d) + '),subindustry))';
  function hedgedExpr(c, hs) { // c,hs: {expr,decay}, hs[j].b
    let e = H(c.expr, c.decay);
    for (const h of hs) { const b = h.b; e += (b >= 0 ? '-' : '+') + Math.abs(b).toFixed(3) + '*' + H(h.expr, h.decay); }
    return e;
  }
  root.__H = { mean, sd, sharpe, corr, ols, resid, greedy, opCount, H, hedgedExpr };
})(typeof window !== 'undefined' ? window : globalThis);

// ---------- browser side ----------
if (typeof window !== 'undefined') {
  const API = 'https://api.worldquantbrain.com';
  window.__mem = window.__mem || {};          // id -> {date: pnl diff}, in memory (localStorage quota is tight)
  window.__pnlMem = async id => {
    if (window.__mem[id]) return window.__mem[id];
    const c = localStorage.getItem('wq_pnl_' + id); if (c) return (window.__mem[id] = JSON.parse(c));
    let j = null;
    for (let i = 0; i < 6; i++) { const r = await fetch(API + '/alphas/' + id + '/recordsets/pnl', { credentials: 'include' });
      const t = await r.text(); if (t.length > 20) { j = JSON.parse(t); break; } await new Promise(res => setTimeout(res, 1500)); }
    if (!j) return null;
    const names = (j.schema && j.schema.properties || []).map(p => p.name), di = names.indexOf('date'), pi = names.indexOf('pnl');
    const m = {}; let prev = null; for (const r of (j.records || [])) { if (prev !== null) m[r[di]] = +(r[pi] - prev).toFixed(1); prev = r[pi]; }
    return (window.__mem[id] = m);
  };
  // load series for ids within a time budget; returns how many are loaded
  window.__load = async (ids, budgetMs = 22000) => { const t0 = Date.now(); for (const id of ids) { if (Date.now() - t0 > budgetMs) break; await window.__pnlMem(id); } return ids.filter(i => window.__mem[i]).length; };
  window.__arr = ids => { // align on common dates
    const ss = ids.map(i => window.__mem[i]); const keys = Object.keys(ss[0]).filter(k => ss.every(s => s && k in s)).sort();
    const o = {}; ids.forEach((id, n) => { o[id] = keys.map(k => ss[n][k]); }); return o; };
  // platform self-correlation (signed max?) for any alpha id
  window.__selfcorr = async (id, waitMs = 24000) => { const t0 = Date.now();
    while (Date.now() - t0 < waitMs) { const r = await fetch(API + '/alphas/' + id + '/correlations/self', { credentials: 'include' }); const t = await r.text();
      if (t.length > 2) { try { const j = JSON.parse(t); const nm = (j.schema && j.schema.properties || []).map(p => p.name);
          const ci = nm.indexOf('correlation'), ii = nm.indexOf('id'); return { max: j.max, min: j.min, top: (j.records || []).slice(0, 6).map(r => [r[ii], r[ci]]) }; }
        catch (e) { return { err: t.slice(0, 120) }; } }
      await new Promise(res => setTimeout(res, 3000)); }
    return { pending: true }; };
  window.__opts = async () => { const r = await fetch(API + '/simulations', { method: 'OPTIONS', credentials: 'include' }); const t = await r.text();
    let j = null; try { j = JSON.parse(t); } catch (e) { return { raw: t.slice(0, 600) }; }
    const s = j.actions && j.actions.POST && j.actions.POST.settings && j.actions.POST.settings.children; const out = {};
    if (s) for (const [k, v] of Object.entries(s)) out[k] = (v.choices || []).map(c => (c && c.value !== undefined) ? c.value : c).slice(0, 40);
    if (!Object.keys(out).length) { localStorage.setItem('wq_opts_raw', t.slice(0, 20000)); return { raw: t.slice(0, 600) }; }
    return out; };
}
