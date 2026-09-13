/* Gym Tracker v155: silent rest alerts so external music keeps playing */
(()=>{
'use strict';
const V={release:'v155',KEY:'gymV155RestFinishedPending'};
let tick=null,lastPulseAt=0,lastReminder=0,finalVibratedFor=0;
const q=id=>document.getElementById(id);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
function read(){try{const x=JSON.parse(localStorage.getItem(V.KEY)||'null');return x&&Number(x.end)>0?x:null}catch(_){return null}}
function write(x){try{x?localStorage.setItem(V.KEY,JSON.stringify(x)):localStorage.removeItem(V.KEY)}catch(_){}}
function capture(){
 try{
  const w=state?.activeWorkout,end=Number(w?.restEndAt)||0;
  if(w&&end>Date.now()){
   const cur=read();
   if(!cur||Number(cur.end)!==end)write({end,exercise:String(w.restExercise||''),ack:false});
  }
 }catch(_){}
}
function running(){
 try{
  const w=state?.activeWorkout,end=Number(w?.restEndAt)||0;
  if(!w||!end||end<=Date.now())return null;
  return {w,end,left:end-Date.now()};
 }catch(_){return null}
}
function finished(){const p=read();return p&&Date.now()>=Number(p.end)?p:null}
function intervalFor(leftMs){const p=Math.max(0,Math.min(1,(5000-leftMs)/5000));return Math.round(760-(590*p))}
function flashTargets(on,leftMs=5000){
 [q('v133GlobalRest'),q('restOverlay')].filter(Boolean).forEach(el=>{
  el.classList.toggle('v134-alarm-flash',on);
  if(on)el.style.setProperty('--v134-flash-ms',`${Math.max(160,intervalFor(leftMs))}ms`);else el.style.removeProperty('--v134-flash-ms');
 });
}
function decorateFinished(){
 const mini=q('v133GlobalRest'),overlay=q('restOverlay'),time=mini?.querySelector('.v133-global-rest-time'),label=mini?.querySelector('.v133-global-rest-label');
 if(mini){mini.classList.add('v135-finished','show');mini.setAttribute('aria-hidden','false');if(time)time.textContent='00:00';if(label)label.textContent=cs()?'PAUZA HOTOVÁ':'REST DONE';mini.setAttribute('aria-label',cs()?'Pauza hotová. Klepni pro potvrzení.':'Rest finished. Tap to acknowledge.');}
 if(overlay){overlay.classList.add('v135-rest-finished');const rt=q('restTime');if(rt)rt.textContent='00:00';}
}
function clearDecor(){q('v133GlobalRest')?.classList.remove('v135-finished');q('restOverlay')?.classList.remove('v135-rest-finished');flashTargets(false)}
function acknowledge(returnWorkout=true){
 write(null);clearDecor();lastReminder=0;finalVibratedFor=0;
 try{if(typeof stopPostRestAlarm==='function')stopPostRestAlarm()}catch(_){}
 if(returnWorkout){try{if(typeof returnFromRest==='function')returnFromRest();else if(typeof openLiveWorkout==='function')openLiveWorkout();else q('liveOverlay')?.classList.add('show')}catch(_){q('liveOverlay')?.classList.add('show')}}
}
function update(){
 capture();
 const r=running();
 if(r){
  q('v133GlobalRest')?.classList.remove('v135-finished');q('restOverlay')?.classList.remove('v135-rest-finished');
  if(r.left<=5000){
   flashTargets(true,r.left);
   const now=performance.now(),gap=intervalFor(r.left);
   if(!lastPulseAt||now-lastPulseAt>=gap){lastPulseAt=now;try{navigator.vibrate?.(r.left<1000?100:45)}catch(_){}}
  }else{flashTargets(false);lastPulseAt=0;}
  return;
 }
 flashTargets(false);lastPulseAt=0;
 const p=finished();if(!p){clearDecor();return}
 decorateFinished();
 const id=Number(p.end);
 if(finalVibratedFor!==id){finalVibratedFor=id;lastReminder=Date.now();try{navigator.vibrate?.([160,80,160,80,260])}catch(_){};return}
 if(Date.now()-lastReminder>=8000){lastReminder=Date.now();try{navigator.vibrate?.([90,55,130])}catch(_){}}
}
function wrap(name,before,after){
 try{
  const native=window[name]||eval(`typeof ${name}==='function'?${name}:null`);
  if(typeof native!=='function'||native.__v155)return;
  const f=function(...args){before?.(...args);const r=native.apply(this,args);after?.(...args);return r};
  f.__v155=true;f.__native=native;try{eval(`${name}=f`)}catch(_){}window[name]=f;
 }catch(_){}
}
function install(){
 wrap('startRest',()=>{write(null);clearDecor()},()=>capture());
 wrap('extendRest',null,()=>capture());
 wrap('skipRest',()=>acknowledge(false));
 wrap('returnFromRest',()=>acknowledge(false));
 document.addEventListener('click',ev=>{const mini=ev.target?.closest?.('#v133GlobalRest');if(mini&&finished()){ev.preventDefault();ev.stopImmediatePropagation();acknowledge(true)}},true);
}
function start(){install();capture();clearInterval(tick);tick=setInterval(update,100);update()}
V.finishedState=finished;V.acknowledge=acknowledge;V.update=update;
V.diagnostics=()=>({release:'v155',pending:read(),finished:!!finished(),audio:false});
window.GymV155=V;window.gymV155Diagnostics=V.diagnostics;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
