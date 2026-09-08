/* Gym Tracker v133: persistent rest mini timer across dialogs/screens */
(()=>{
'use strict';
const V={release:'v133'};
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const byIdSafe=id=>document.getElementById(id);
let tick=null;

function activeRest(){
  try{
    const w=state?.activeWorkout;
    if(!w)return null;
    const end=Number(w.restEndAt)||0;
    if(end<=Date.now())return null;
    return {w,end,left:Math.max(0,end-Date.now())};
  }catch(_){return null}
}
function fmtMs(ms){
  const total=Math.max(0,Math.ceil(ms/1000));
  const m=Math.floor(total/60),s=total%60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function ensureTimer(){
  let el=byIdSafe('v133GlobalRest');
  if(el)return el;
  el=document.createElement('button');
  el.id='v133GlobalRest';
  el.type='button';
  el.className='v133-global-rest';
  el.innerHTML=`<span class="v133-global-rest-label"></span><strong class="v133-global-rest-time">00:00</strong><span class="v133-global-rest-arrow">›</span>`;
  el.addEventListener('click',returnToWorkout);
  document.body.appendChild(el);
  return el;
}
function topDialog(){
  const open=qa('dialog[open]').filter(d=>d.id!=='finishDialog');
  return open.length?open[open.length-1]:null;
}
function placeTimer(el){
  const d=topDialog();
  if(d){
    if(el.parentElement!==d)d.appendChild(el);
    el.classList.add('in-dialog');
  }else{
    if(el.parentElement!==document.body)document.body.appendChild(el);
    el.classList.remove('in-dialog');
  }
}
function update(){
  const el=ensureTimer();
  placeTimer(el);
  const rest=activeRest();
  const restOverlay=byIdSafe('restOverlay');
  const largeVisible=!!restOverlay?.classList?.contains('show');
  const dialogOpen=!!topDialog();
  if(!rest){
    el.classList.remove('show');
    el.setAttribute('aria-hidden','true');
    return;
  }
  if(largeVisible&&!dialogOpen){
    el.classList.remove('show');
    el.setAttribute('aria-hidden','true');
    return;
  }
  const label=q('.v133-global-rest-label',el);
  const time=q('.v133-global-rest-time',el);
  if(label)label.textContent=cs()?'ODPOČINEK':'REST';
  if(time)time.textContent=fmtMs(rest.left);
  el.setAttribute('aria-label',cs()?`Odpočinek ${fmtMs(rest.left)}. Zpět do tréninku.`:`Rest ${fmtMs(rest.left)}. Return to workout.`);
  el.setAttribute('aria-hidden','false');
  el.classList.add('show');
}
function closeDialogs(){
  qa('dialog[open]').forEach(d=>{try{d.close()}catch(_){}});
}
function returnToWorkout(){
  const rest=activeRest();
  closeDialogs();
  try{
    if(typeof openLiveWorkout==='function')openLiveWorkout();
    else byIdSafe('liveOverlay')?.classList.add('show');
  }catch(_){byIdSafe('liveOverlay')?.classList.add('show')}
  if(rest){
    try{
      byIdSafe('liveOverlay')?.classList.add('show');
      byIdSafe('restOverlay')?.classList.add('show');
      if(typeof applyRestDock==='function')applyRestDock();
      if(typeof updateRest==='function')updateRest();
    }catch(_){}
  }
  update();
}
function installHooks(){
  const names=['startRest','extendRest','skipRest','returnFromRest','openVideo','openHistory','openCloud','showScreen','renderMore','renderDatabase'];
  names.forEach(name=>{
    try{
      const native=window[name]||eval(`typeof ${name}==='function'?${name}:null`);
      if(typeof native!=='function'||native.__v133)return;
      const f=function(...args){
        const r=native.apply(this,args);
        requestAnimationFrame(update);
        return r;
      };
      f.__v133=true;f.__native=native;
      try{eval(`${name}=f`)}catch(_){}
      window[name]=f;
    }catch(_){}
  });
}
function start(){
  ensureTimer();
  installHooks();
  clearInterval(tick);
  tick=setInterval(update,250);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});
  document.addEventListener('click',()=>requestAnimationFrame(update),true);
  update();
}
V.update=update;
V.diagnostics=()=>{const r=activeRest(),el=byIdSafe('v133GlobalRest');return {release:V.release,active:!!r,remainingMs:r?.left||0,visible:!!el?.classList.contains('show'),inDialog:!!el?.classList.contains('in-dialog')}};
window.GymV133=V;
window.gymV133Diagnostics=V.diagnostics;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
