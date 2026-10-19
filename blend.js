// blend.js — near-zero self-correlation via BLENDS (2026-10-19). Inject AFTER the boot code (tick/cc/hedge).
// Recipe that produced KPmbm0X8 (0.2004) and 2rj7GQk8 (0.1255) on 10-19:
//   1. Platform SELF_CORRELATION = SIGNED max over actives (confirmed on the submit check): negative corr is free.
//   2. Blend 2-3 components with POSITIVE weights (sign-adjusted); never deep hedges (b~0.8 on a near-twin) —
//      the platform re-scales the total to booksize daily, so small unstable residual GMV blows up (S 1.6 -> 0.78).
//   3. Wrap each sparse component as G(H(x,d)): H = scale(group_neutralize(ts_decay_linear(x,d),subindustry)),
//      G = if_else(is_nan(.),0,.). Without G a NaN in one leg kills the stock for all legs (pair S 0.99 vs 1.43).
//      G doubles op count (64-op limit): guard only sparse legs (news/analyst/short-interest), not price legs.
//   4. Weights: a_k = w_k / sd(PnL_k) (sd from the component's own sim, same universe). Settings decay 0.
//   5. Fitness is the binding check: F = S*sqrt(R/max(TO,0.125)); the estimate below runs ~0.1-0.4 LOW.
//   6. Sub-universe check = TOP1000 for TOP3000 alphas, limit 0.435*S. Small-cap legs (rank(-adv20)) fail it;
//      run the blend in TOP1000 instead (also cuts corr with TOP3000 actives).
(function () {
  const API = 'https://api.worldquantbrain.com';
  window.__loadP = async (list, budget = 20000, par = 6) => { const t0 = Date.now(); const todo = list.filter(i => !window.__mem[i]);
    for (let i = 0; i < todo.length && Date.now() - t0 < budget; i += par) await Promise.all(todo.slice(i, i + par).map(id => window.__pnlMem(id)));
    return list.filter(i => window.__mem[i]).length; };
  window.__meta = (() => { const m = {}; for (const r of JSON.parse(localStorage.getItem('wq_results2') || '[]')) if (r.id) m[r.id] = r; return m; })();
  // covariance of every loaded series aligned on the actives' dates; rows 0..nA-1 are the actives
  window.__buildG = () => {
    const act = window.__ACT, am = act.map(a => window.__mem[a]);
    const keys = Object.keys(am[0]).filter(k => am.every(m => m && k in m)).sort(), T = keys.length;
    const ids = act.slice(); for (const id of Object.keys(window.__mem)) if (!act.includes(id) && keys.every(k => k in window.__mem[id])) ids.push(id);
    const X = ids.map(id => Float64Array.from(keys, k => window.__mem[id][k]));
    const mu = X.map(v => v.reduce((s, x) => s + x, 0) / T); X.forEach((v, i) => { for (let t = 0; t < T; t++) v[t] -= mu[i]; });
    const N = ids.length, G = Array.from({ length: N }, () => new Float64Array(N));
    for (let i = 0; i < N; i++) for (let j = 0; j <= i; j++) { let s = 0; for (let t = 0; t < T; t++) s += X[i][t] * X[j][t]; G[i][j] = G[j][i] = s / (T - 1); }
    const s = ids.map((_, k) => Math.sqrt(G[k][k])), m = ids.map((_, k) => mu[k] / s[k]), nA = act.length;
    const rho = ids.map((_, k) => Float64Array.from({ length: nA }, (_, i) => G[k][i] / (s[k] * s[i])));
    window.__G = { ids, G, mu, T, nA, idx: Object.fromEntries(ids.map((id, i) => [id, i])) };
    window.__Z = { s, m, rho, R: (k, l) => G[k][l] / (s[k] * s[l]) };
    return N; };
  // comps: [{k (row in G), sg (+1/-1), ret, TO}], w: standardized weights >= 0 -> {S, mx (signed max corr), arg, F (estimate), TO}
  window.__evalC = (C, w) => { const { s, m, rho, R } = window.__Z, nA = window.__G.nA; let mean = 0, v = 0;
    for (let i = 0; i < C.length; i++) { mean += w[i] * C[i].sg * m[C[i].k]; for (let j = 0; j < C.length; j++) v += w[i] * w[j] * C[i].sg * C[j].sg * R(C[i].k, C[j].k); }
    const sd = Math.sqrt(v); let mx = -9, arg = 0; for (let q = 0; q < nA; q++) { let c = 0; for (let i = 0; i < C.length; i++) c += w[i] * C[i].sg * rho[C[i].k][q]; c /= sd; if (c > mx) { mx = c; arg = q; } }
    let a = 0, rr = 0, tt = 0; C.forEach((c, i) => { const ak = w[i] / s[c.k]; a += ak; rr += ak * c.ret; tt += ak * c.TO; });
    const S = mean / sd * Math.sqrt(252); return { S, mx, arg, F: S * Math.sqrt((rr / a) / Math.max(tt / a, 0.125)), TO: tt / a }; };
  window.__Hn = (x, d, n) => { const inner = 'ts_decay_linear(' + x + ',' + Math.max(1, d) + ')'; return 'scale(' + (n === 'NONE' ? inner : 'group_neutralize(' + inner + ',' + n.toLowerCase() + ')') + ')'; };
  window.__Gd = x => 'if_else(is_nan(' + x + '),0,' + x + ')';
  // parts: [{id, sg, w, d, guard, mask}] -> expression with a_k = w/sd normalized to max 1
  window.__blend = parts => { const { s } = window.__Z, { idx } = window.__G; const a = parts.map(p => p.w / s[idx[p.id]]), mx = Math.max(...a);
    return parts.map((p, i) => { let h = window.__Hn(window.__meta[p.id].expr, p.d, 'SUBINDUSTRY'); if (p.guard) h = window.__Gd(h); if (p.mask) h = '(' + h + '*' + p.mask + ')';
      return (p.sg < 0 ? '-' : (i ? '+' : '')) + (a[i] / mx).toFixed(3) + '*' + h; }).join(''); };
  window.__addAct = window.__addAct || (id => { const x = JSON.parse(localStorage.getItem('wq_act_extra') || '[]'); if (!x.includes(id)) x.push(id); localStorage.setItem('wq_act_extra', JSON.stringify(x)); if (!window.__ACT.includes(id)) window.__ACT.push(id); return window.__ACT.length; });
})();
