// Main-thread scheduler for hidden tabs: state lives in localStorage (wq_queue, wq_running, wq_results2).
// Re-inject after every page navigation, then call: await window.__tick(3). Each call = one tick (poll running, fill 3 slots).
// Use when the Worker in scheduler.js is throttled (state age > 60 s). Navigate the tab before a tick if fetch() hangs.
const API='https://api.worldquantbrain.com';
const L=k=>JSON.parse(localStorage.getItem(k)||'null');
window.__tick = async (maxPost=3) => {
  const Q=L('wq_queue')||[], running=L('wq_running')||{}, R2=L('wq_results2')||[]; const out=[];
  for (const [loc,it] of Object.entries(running)) {
    try { const r=await fetch(loc,{credentials:'include'}); if(r.status===200){ const j=await r.json();
      if(j.status==='COMPLETE'||j.status==='ERROR'||j.status==='FAIL'||j.alpha){ delete running[loc]; const rec={tag:it.tag,expr:it.expr,settings:it.settings,status:j.status,msg:(j.message||'').slice(0,160)};
        if(j.alpha){ const a=await (await fetch(API+'/alphas/'+j.alpha,{credentials:'include'})).json(); rec.id=j.alpha; rec.sharpe=a.is.sharpe; rec.fitness=a.is.fitness; rec.turnover=a.is.turnover; rec.returns=a.is.returns; rec.fails=(a.is.checks||[]).filter(c=>c.result==='FAIL').map(c=>c.name+(c.value!=null?':'+c.value:'')); }
        R2.push(rec); out.push(rec); } }
      else if(r.status>=400){ delete running[loc]; const rec={tag:it.tag,status:'HTTP'+r.status}; R2.push(rec); out.push(rec); } } catch(e){}
  }
  let posted=0;
  while (Object.keys(running).length<3 && Q.length && posted<maxPost) { const it=Q.shift();
    try { const r=await fetch(API+'/simulations',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'REGULAR',settings:it.settings,regular:it.expr})});
      if(r.status===201){ running[r.headers.get('Location')]=it; posted++; } else if(r.status===429){ Q.unshift(it); break; } else { const t=await r.text(); const rec={tag:it.tag,expr:it.expr,status:'POST'+r.status,msg:t.slice(0,200)}; R2.push(rec); out.push(rec); } } catch(e){ Q.unshift(it); break; } }
  localStorage.setItem('wq_results2', JSON.stringify(R2)); localStorage.setItem('wq_queue', JSON.stringify(Q)); localStorage.setItem('wq_running', JSON.stringify(running));
  return 'q='+Q.length+' running='+Object.values(running).map(i=>i.tag.slice(3)).join(',')+' || '+out.map(r=>r.tag.slice(3)+' '+(r.id||'')+' S'+r.sharpe+' F'+r.fitness+' TO'+r.turnover+' '+(r.fails||[]).map(f=>f.split(':')[0].slice(0,6)).join('/')+' '+(r.msg||'').slice(0,60)).join(' | ');
};
