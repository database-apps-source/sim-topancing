// API + outbox offline-first (gas-instant-ux: optimistic UI, sinkron latar belakang, retry idempoten)
const LS={g:(k,v)=>{try{const x=JSON.parse(localStorage.getItem(k));return x==null?v:x}catch{return v}},s:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2);
async function call(action,data,idem){
  const r=await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,data,token:S.token,idem})});
  return r.json();
}
let busy=false;
function enqueue(action,data,label){const q=LS.g('q',[]);q.push({action,data,label,idem:uid()});LS.s('q',q);setSync();flush();}
async function flush(){
  if(busy)return;busy=true;let did=false;
  try{for(let q=LS.g('q',[]);q.length;q=LS.g('q',[])){
    let r;try{r=await call(q[0].action,q[0].data,q[0].idem)}catch(e){setSync('off');return}
    const j=q.shift();LS.s('q',q);did=true;
    if(!r.success){if(r.code==='AUTH'){logout();return}toast(j.label+': '+r.message,'err')}
  }}finally{busy=false}
  if(did)await boot(true);setSync();
}
function setSync(m){const n=LS.g('q',[]).length,e=document.getElementById('sync');if(!e)return;
  e.className='chip '+(m==='off'?'no':n?'lo':'ok');e.textContent=m==='off'?'● Offline ('+n+' antre)':n?'● Menyinkronkan ('+n+')':'● Tersinkron'}
async function boot(silent){
  if(LS.g('q',[]).length)return;
  try{const r=await call('boot');if(!r.success){if(r.code==='AUTH')return logout();throw new Error(r.message)}
    S.d=r.data;LS.s('d',S.d);render();setSync()}catch(e){if(!silent)toast('Mode offline: memakai data tersimpan','err');setSync('off')}
}
addEventListener('online',flush);
