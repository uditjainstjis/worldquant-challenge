// BRAIN tab Worker scheduler. Paste via javascript_tool, then window.__W.postMessage({type:'enqueue',items}). Results: window.__R2 / localStorage wq_results2.
const src = `
let Q=[], running={}, R=[];
const API='https://api.worldquantbrain.com';
async function tick(){
  for (const [loc,it] of Object.entries(running)) {
    try {
      const r = await fetch(loc,{credentials:'include'});
      if (r.status===200){
        const j = await r.json();
        if (j.status==='COMPLETE' || j.status==='ERROR' || j.status==='FAIL' || j.alpha){
          delete running[loc];
          let rec={tag:it.tag, expr:it.expr, settings:it.settings, status:j.status, msg:(j.message||'').slice(0,160)};
          if (j.alpha){
            const a = await fetch(API+'/alphas/'+j.alpha,{credentials:'include'}).then(r=>r.json());
            rec.id=j.alpha; rec.sharpe=a.is.sharpe; rec.fitness=a.is.fitness; rec.turnover=a.is.turnover; rec.returns=a.is.returns;
            rec.fails=(a.is.checks||[]).filter(c=>c.result==='FAIL').map(c=>c.name+(c.value!=null?':'+c.value:''));
          }
          R.push(rec); postMessage({type:'result', rec});
        }
      } else if (r.status>=400) { delete running[loc]; const rec={tag:it.tag,status:'HTTP'+r.status}; R.push(rec); postMessage({type:'result', rec}); }
    } catch(e){}
  }
  while (Object.keys(running).length<3 && Q.length){
    const it=Q.shift();
    try{
      const r = await fetch(API+'/simulations',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'REGULAR',settings:it.settings,regular:it.expr})});
      if (r.status===201){ running[r.headers.get('Location')]=it; }
      else if (r.status===429){ Q.unshift(it); break; }
      else { const t=await r.text(); const rec={tag:it.tag,expr:it.expr,status:'POST'+r.status,msg:t.slice(0,200)}; R.push(rec); postMessage({type:'result',rec}); }
    }catch(e){ Q.unshift(it); break; }
  }
  postMessage({type:'state', q:Q.length, Q, running:Object.values(running).map(i=>i.tag), done:R.length, t:Date.now()});
}
onmessage = e => { const m=e.data; if(m.type==='enqueue') Q.push(...m.items); if(m.type==='front') Q.unshift(...m.items); if(m.type==='clear') Q=[]; };
setInterval(tick, 7000);
`;
window.__install = (resume) => {
  if (window.__W) window.__W.terminate();
  window.__R2 = JSON.parse(localStorage.getItem('wq_results2')||'[]');
  const w = new Worker(URL.createObjectURL(new Blob([src],{type:'application/javascript'})));
  w.onmessage = e => { const m=e.data;
    if(m.type==='result'){ window.__R2.push(m.rec); localStorage.setItem('wq_results2', JSON.stringify(window.__R2)); }
    if(m.type==='state'){ window.__WS=m; localStorage.setItem('wq_queue', JSON.stringify(m.Q)); } };
  window.__W = w;
  if (resume) { const q=JSON.parse(localStorage.getItem('wq_queue')||'[]'); if(q.length) w.postMessage({type:'enqueue', items:q}); return 'resumed '+q.length; }
  return 'installed';
};
window.__install(false);
