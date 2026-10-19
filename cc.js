// pnl-corr helpers; inject with tick.js after every navigation. Cache in localStorage so reloads keep it.
window.__ACT=['XgJ5e7w5','A1vMp7Al','QPKq3a2Q','vR2xOrRz','3qVAPoYQ','786zkWWv','d51bjNxX','QPKbbpbG','KPrr6rr8','9qWW69M9','d51v5wpJ','VkdvzZa5','LL5Vgolv','RRAL7X6b','kqJb5XOL','bl8VV5Qq','3qj3WJgX','npAo5KkE','xA1PJpWl'];
window.__getpnl = async id => { const c=localStorage.getItem('wq_pnl_'+id); if (c) return JSON.parse(c);
  let j=null; for (let i=0;i<6;i++){ const r=await fetch('https://api.worldquantbrain.com/alphas/'+id+'/recordsets/pnl',{credentials:'include'}); const t=await r.text(); if(t.length>20){ j=JSON.parse(t); break;} await new Promise(res=>setTimeout(res,2000)); }
  if(!j) return null;
  const names=(j.schema&&j.schema.properties||[]).map(p=>p.name); const di=names.indexOf('date'), pi=names.indexOf('pnl');
  const m={}; let prev=null; for (const r of (j.records||[])) { const d=r[di], v=r[pi]; if(prev!==null) m[d]=+(v-prev).toFixed(1); prev=v; }
  localStorage.setItem('wq_pnl_'+id, JSON.stringify(m)); return m; };
window.__corr = (a,b) => { const ks=Object.keys(a).filter(k=>k in b); const n=ks.length; if(n<50) return NaN;
  let sa=0,sb=0; for(const k of ks){sa+=a[k];sb+=b[k];} const ma=sa/n, mb=sb/n; let num=0,da=0,db=0; for(const k of ks){const x=a[k]-ma,y=b[k]-mb; num+=x*y; da+=x*x; db+=y*y;} return num/Math.sqrt(da*db); };
window.__cc = async id => { const p=await window.__getpnl(id); if(!p) return 'no pnl'; const out=[]; for (const o of window.__ACT){ const q=await window.__getpnl(o); if(q) out.push([o, +window.__corr(p,q).toFixed(3)]); } out.sort((x,y)=>Math.abs(y[1])-Math.abs(x[1])); return out; };
window.__cache = async (budgetMs=18000) => { const t0=Date.now(); for (const id of window.__ACT) { if (Date.now()-t0>budgetMs) break; await window.__getpnl(id); } return window.__ACT.filter(id=>localStorage.getItem('wq_pnl_'+id)).length; };
