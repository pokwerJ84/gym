/* Gym Tracker v146: completed calendar dates show the workout actually performed */
(()=>{
'use strict';

function latestStrengthWorkoutForDate(iso){
  try{
    return (state.workouts||[])
      .filter(w=>w&&w.type!=='cardio'&&w.date===iso)
      .sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]||null;
  }catch(_){return null}
}

function safeBaseShowToday(day,iso){
  // v122 introduced a wrapper that always forced today's NEXT program session.
  // Call the pre-v122 implementation directly when available.
  try{
    if(typeof showTodayV122==='function') return showTodayV122(day,iso);
  }catch(e){console.warn('v146 showTodayV122 unavailable',e)}
  try{
    const candidate=window.showToday?.__native?.__native||window.showToday?.__native;
    if(typeof candidate==='function') return candidate(day,iso);
  }catch(_){}
}

function showDateCorrectly(requestedDay,iso){
  iso=iso||today();
  if(state.activeWorkout){
    return safeBaseShowToday(state.activeWorkout.day,state.activeWorkout.date||iso);
  }
  const completed=latestStrengthWorkoutForDate(iso);
  const day=completed?.day||requestedDay||currentProgramDay();
  selectedWorkoutDate=iso;
  calendarViewDate=iso;
  selectedTodayDay=day;
  localStorage.setItem('gymSelectedWorkoutDate',iso);
  localStorage.setItem('gymTodayDay',day);
  return safeBaseShowToday(day,iso);
}

function showTodayV146(day,date){
  return showDateCorrectly(day,date||selectedWorkoutDate||today());
}

function selectScheduleDateV146(iso){
  if(state.activeWorkout&&iso!==(state.activeWorkout.date||today())){
    try{
      const from=localizedFullDate(state.activeWorkout.date||today());
      showToast((typeof lang==='function'&&lang()==='cs')
        ?`Stále běží trénink z ${from}. Nejdřív ho dokonči nebo zruš.`
        :`A workout from ${from} is still running. Finish or delete it first.`);
    }catch(_){}
    try{openLiveWorkout()}catch(_){}
    return;
  }
  showDateCorrectly(null,iso);
  try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(_){}
}

function goToTodayDateV146(){
  const iso=today();
  showDateCorrectly(null,iso);
  try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(_){}
}

function diagnostics(){
  const iso=selectedWorkoutDate||today();
  const workout=latestStrengthWorkoutForDate(iso);
  const visible=document.querySelector('.screen.active')?.id||'';
  const cards=Array.from(document.querySelectorAll('.screen.active .modern-exercise-card'));
  return {
    release:'v146',
    selectedDate:iso,
    completedWorkoutDay:workout?.day||'',
    visibleDay:visible,
    correctDay:!workout||visible===workout.day,
    doneCards:cards.filter(c=>c.classList.contains('exercise-done')).length,
    totalCards:cards.length
  };
}

function install(){
  try{showToday=showTodayV146;window.showToday=showTodayV146}catch(e){console.warn('v146 showToday install failed',e)}
  try{selectScheduleDate=selectScheduleDateV146;window.selectScheduleDate=selectScheduleDateV146}catch(e){console.warn('v146 select date install failed',e)}
  try{goToTodayDate=goToTodayDateV146;window.goToTodayDate=goToTodayDateV146}catch(e){console.warn('v146 today install failed',e)}

  // Re-apply after cloud restore/login because those flows can rerender the screen.
  setTimeout(()=>showDateCorrectly(null,selectedWorkoutDate||today()),0);
  setTimeout(()=>showDateCorrectly(null,selectedWorkoutDate||today()),800);
  setTimeout(()=>showDateCorrectly(null,selectedWorkoutDate||today()),2200);
}

window.GymV146={release:'v146',latestStrengthWorkoutForDate,showDateCorrectly,diagnostics};
window.gymV146Diagnostics=diagnostics;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
