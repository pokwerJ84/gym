/* Gym Tracker v157: keep completed workout visible after manual OR automatic finish */
(()=>{
'use strict';
const V={release:'v157',KEY:'gymV157LastFinishedDate'};
const todayIso=()=>{try{return typeof today==='function'?today():new Date().toISOString().slice(0,10)}catch(_){return new Date().toISOString().slice(0,10)}};
function completed(iso){
  try{
    if(window.GymV153?.completedWorkout)return window.GymV153.completedWorkout(iso);
    return (state?.workouts||[]).filter(w=>w&&w.type!=='cardio'&&w.date===iso).sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]||null;
  }catch(_){return null}
}
function remember(iso){try{localStorage.setItem(V.KEY,String(iso||''))}catch(_){}}
function remembered(){try{return localStorage.getItem(V.KEY)||''}catch(_){return ''}}
function showFinished(iso){
  if(!iso||!completed(iso)||state?.activeWorkout)return false;
  try{selectedWorkoutDate=iso;calendarViewDate=iso;localStorage.setItem('gymSelectedWorkoutDate',iso)}catch(_){}
  try{return !!window.GymV153?.renderHistorical?.(iso)}catch(e){console.warn('[v157 historical render]',e);return false}
}
function captureActiveDate(){
  try{const w=state?.activeWorkout;return w?.date||state?.days?.[w?.day]?.date||todayIso()}catch(_){return todayIso()}
}
function finishAndShow(iso){
  if(!iso||!completed(iso))return;
  remember(iso);
  const repaint=()=>showFinished(iso);
  repaint();requestAnimationFrame(repaint);setTimeout(repaint,80);setTimeout(repaint,250);
}
function wrapAsync(name){
  try{
    const native=window[name]||eval(`typeof ${name}==='function'?${name}:null`);
    if(typeof native!=='function'||native.__v157)return;
    const wrapped=async function(...args){
      const iso=captureActiveDate();
      const result=await native.apply(this,args);
      finishAndShow(iso);
      return result;
    };
    wrapped.__v157=true;wrapped.__native=native;
    try{eval(`${name}=wrapped`)}catch(_){}
    window[name]=wrapped;
  }catch(e){console.warn('[v157 wrap]',name,e)}
}
function restoreTodayCompleted(){
  try{
    if(state?.activeWorkout)return;
    const iso=todayIso();
    if(completed(iso)){remember(iso);showFinished(iso)}
  }catch(_){}
}
function install(){
  wrapAsync('saveFinishedWorkout');
  wrapAsync('autoFinalizeWorkout');
  [120,700,1800,3500].forEach(ms=>setTimeout(restoreTodayCompleted,ms));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(restoreTodayCompleted,50)});
}
V.showFinished=showFinished;V.restoreTodayCompleted=restoreTodayCompleted;
V.diagnostics=()=>({release:V.release,today:todayIso(),remembered:remembered(),todayCompleted:!!completed(todayIso()),active:!!state?.activeWorkout});
window.GymV157=V;window.gymV157Diagnostics=V.diagnostics;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
