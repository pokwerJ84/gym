/* Gym Tracker v147: completed calendar date click must always show completed workout and never reset to next session */
(()=>{
'use strict';

function completedWorkoutForDate(iso){
  try{return (state.workouts||[]).filter(w=>w&&w.type!=='cardio'&&w.date===iso).sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]||null}catch(_){return null}
}

function showCompletedDate(iso){
  const w=completedWorkoutForDate(iso); if(!w)return false;
  try{
    selectedWorkoutDate=iso; calendarViewDate=iso; selectedTodayDay=w.day;
    localStorage.setItem('gymSelectedWorkoutDate',iso); localStorage.setItem('gymTodayDay',w.day);
  }catch(_){}
  try{
    if(typeof showTodayV122==='function') showTodayV122(w.day,iso);
    else if(typeof window.GymV146?.showDateCorrectly==='function') window.GymV146.showDateCorrectly(w.day,iso);
  }catch(e){console.warn('v147 base render failed',e)}
  try{
    document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===w.day));
    if(typeof renderDay==='function') renderDay(w.day);
  }catch(e){console.warn('v147 force day render failed',e)}
  requestAnimationFrame(()=>{
    try{window.GymV144?.decorateCompletedDay?.()}catch(_){}
    try{document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===w.day))}catch(_){}
  });
  return true;
}

function captureCompletedDateClick(event){
  const btn=event.target?.closest?.('.v120-day[data-date]');
  if(!btn)return;
  const iso=btn.dataset.date; if(!iso||!completedWorkoutForDate(iso))return;
  event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
  showCompletedDate(iso);
  try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(_){}
}

function install(){
  document.addEventListener('click',captureCompletedDateClick,true);
  const iso=(()=>{try{return selectedWorkoutDate||today()}catch(_){return ''}})();
  if(iso&&completedWorkoutForDate(iso)) setTimeout(()=>showCompletedDate(iso),50);
}

window.GymV147={release:'v147',completedWorkoutForDate,showCompletedDate};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
