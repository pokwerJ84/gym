/* Gym Tracker v135: rest-finished alarm persists until acknowledged */
(()=>{
'use strict';
const V={release:'v135',KEY:'gymV135RestFinishedPending'};
let tick=null,audio=null,lastReminder=0,finalPlayedFor=0;
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
function finished(){const p=read();return p&&Date.now()>=Number(p.end)?p:null}
function ctx(){
 try{
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
  audio=audio||new C();if(audio.state==='suspended')audio.resume().catch(()=>{});return audio
 }catch(_){return null}
}
function tone(freq=1100,dur=.13,g=.3,type='square',delay=0){
 const a=ctx();if(!a||a.state!=='running')return;
 const t=a.currentTime+delay,o=a.createOscillator(),gain=a.createGain();
 o.type=type;o.frequency.setValueAtTime(freq,t);
 gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(g,t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(gain);gain.connect(a.destination);o.start(t);o.stop(t+dur+.02);
}
function finalAlarm(){
 tone(1050,.16,.42,'sawtooth',0);tone(1380,.16,.42,'sawtooth',.2);tone(1050,.28,.46,'sawtooth',.4);
 try{navigator.vibrate?.([160,80,160,80,260])}catch(_){}
}
function reminder(){
 tone(1180,.11,.30,'square',0);tone(1450,.11,.32,'square',.16);
 try{navigator.vibrate?.([90,55,130])}catch(_){}
}
function decorate(){
 const mini=q('v133GlobalRest'),overlay=q('restOverlay'),time=mini?.querySelector('.v133-global-rest-time'),label=mini?.querySelector('.v133-global-rest-label');
 if(mini){
   mini.classList.add('v135-finished','show');mini.setAttribute('aria-hidden','false');
   if(time)time.textContent='00:00';
   if(label)label.textContent=cs()?'PAUZA HOTOVÁ':'REST DONE';
   mini.setAttribute('aria-label',cs()?'Pauza hotová. Klepni pro potvrzení.':'Rest finished. Tap to acknowledge.');
 }
 if(overlay){
   overlay.classList.add('v135-rest-finished');
   const rt=q('restTime');if(rt)rt.textContent='00:00';
 }
}
function clearDecor(){q('v133GlobalRest')?.classList.remove('v135-finished');q('restOverlay')?.classList.remove('v135-rest-finished')}
function acknowledge(returnWorkout=true){
 write(null);clearDecor();lastReminder=0;finalPlayedFor=0;
 try{if(typeof stopPostRestAlarm==='function')stopPostRestAlarm()}catch(_){}
 if(returnWorkout){
   try{
     if(typeof returnFromRest==='function')returnFromRest();
     else if(typeof openLiveWorkout==='function')openLiveWorkout();
     else q('liveOverlay')?.classList.add('show');
   }catch(_){q('liveOverlay')?.classList.add('show')}
 }
}
function update(){
 capture();const p=finished();
 if(!p){clearDecor();return}
 decorate();const id=Number(p.end);
 if(finalPlayedFor!==id){finalPlayedFor=id;lastReminder=Date.now();finalAlarm();return}
 if(Date.now()-lastReminder>=6000){lastReminder=Date.now();reminder()}
}
function wrap(name,before,after){
 try{
  const native=window[name]||eval(`typeof ${name}==='function'?${name}:null`);
  if(typeof native!=='function'||native.__v135)return;
  const f=function(...args){before?.(...args);const r=native.apply(this,args);after?.(...args);return r};
  f.__v135=true;f.__native=native;
  try{eval(`${name}=f`)}catch(_){}window[name]=f;
 }catch(_){}
}
function install(){
 wrap('startRest',()=>{write(null);clearDecor()},()=>capture());
 wrap('extendRest',null,()=>capture());
 wrap('skipRest',()=>acknowledge(false));
 wrap('returnFromRest',()=>acknowledge(false));
 document.addEventListener('click',ev=>{
   const mini=ev.target?.closest?.('#v133GlobalRest');
   if(mini&&finished()){ev.preventDefault();ev.stopImmediatePropagation();acknowledge(true)}
 },true);
 document.addEventListener('pointerdown',()=>ctx(),{passive:true});
 document.addEventListener('touchstart',()=>ctx(),{passive:true});
}
function start(){install();capture();clearInterval(tick);tick=setInterval(update,120);update()}
V.finishedState=finished;V.acknowledge=acknowledge;V.update=update;
V.diagnostics=()=>({release:V.release,pending:read(),finished:!!finished(),audioState:audio?.state||'none'});
window.GymV135=V;window.gymV135Diagnostics=V.diagnostics;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
