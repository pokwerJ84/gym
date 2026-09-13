/* Gym Tracker v156: keep today's completed workout visible after Finish Workout */
(()=>{
'use strict';
const V={release:'v156',KEY:'gymV156LastFinishedDate'};

function todayIso(){try{return typeof today==='function'?today():new Date().toISOString().slice(0,10)}catch(_){return new Date().toISOString().slice(0,10)}}
function completed(iso){
  try{
    if(window.GymV153?.completedWorkout)return window.GymV153.completedWorkout(iso);
    return (state?.workouts||[]).filter(w=>w&&w.type!=='cardio'&&w.date===iso).sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]||null;
  }catch(_){return null}
}
function remember(iso){try{localStorage.setItem(V.KEY,String(iso||''))}catch(_){}}
function remembered(){try{return localStorage.getItem(V.KEY)||''}catch(_){return ''}}
function showFinished(iso){
  if(!iso||!completed(iso))return false;
  try{
    selectedWorkoutDate=iso;
    calendarViewDate=iso;
    localStorage.setItem('gymSelectedWorkoutDate',iso);
  }catch(_){}
  try{
    if(window.GymV153?.renderHistorical)return !!window.GymV153.renderHistorical(iso);
  }catch(e){console.warn('[v156 historical render]',e)}
  return false;
}

function wrapFinish(){
  try{
    const native=window.saveFinishedWorkout||(typeof saveFinishedWorkout==='function'?saveFinishedWorkout:null);
    if(typeof native!=='function'||native.__v156)return;
    const wrapped=async function(...args){
      let iso='';
      try{
        const w=state?.activeWorkout;
        iso=w?.date||state?.days?.[w?.day]?.date||todayIso();
      }catch(_){iso=todayIso()}
      const result=await native.apply(this,args);
      if(iso&&completed(iso)){
        remember(iso);
        showFinished(iso);
        requestAnimationFrame(()=>showFinished(iso));
        setTimeout(()=>showFinished(iso),120);
      }
      return result;
    };
    wrapped.__v156=true;wrapped.__native=native;
    try{saveFinishedWorkout=wrapped}catch(_){}
    window.saveFinishedWorkout=wrapped;
  }catch(e){console.warn('[v156 finish hook]',e)}
}

function restoreTodayCompleted(){
  try{
    if(state?.activeWorkout)return;
    const iso=todayIso();
    const last=remembered();
    if((last===iso||completed(iso))&&completed(iso))showFinished(iso);
  }catch(_){}
}

function install(){
  wrapFinish();
  setTimeout(restoreTodayCompleted,120);
  setTimeout(restoreTodayCompleted,900);
}

V.showFinished=showFinished;
V.restoreTodayCompleted=restoreTodayCompleted;
V.diagnostics=()=>({release:V.release,today:todayIso(),remembered:remembered(),todayCompleted:!!completed(todayIso()),active:!!state?.activeWorkout});
window.GymV156=V;
window.gymV156Diagnostics=V.diagnostics;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
