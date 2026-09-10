/* Gym Tracker v145: completed calendar day always opens the workout actually performed on that date */
(()=>{
'use strict';

const latestCompletedWorkoutForDate=iso=>{
  try{
    return (state.workouts||[])
      .filter(w=>w.type!=='cardio'&&w.date===iso)
      .sort((a,b)=>(b.savedAt||0)-(a.savedAt||0))[0]||null;
  }catch(_){return null}
};

function resolveDayForDate(requestedDay,iso){
  if(state?.activeWorkout)return state.activeWorkout.day;
  const finished=latestCompletedWorkoutForDate(iso);
  return finished?.day||requestedDay;
}

function hookShowToday(){
  try{
    const native=window.showToday||(typeof showToday==='function'?showToday:null);
    if(typeof native!=='function'||native.__v145)return;
    const wrapped=function(day,date,...rest){
      let iso=date;
      try{iso=iso||selectedWorkoutDate||today()}catch(_){iso=date}
      const resolved=resolveDayForDate(day,iso);
      return native.call(this,resolved,iso,...rest);
    };
    wrapped.__v145=true;wrapped.__native=native;
    window.showToday=wrapped;
    try{showToday=wrapped}catch(_){}
  }catch(e){console.warn('v145 showToday hook failed',e)}
}

function forceCurrentCompletedDate(){
  try{
    if(state?.activeWorkout)return;
    const iso=selectedWorkoutDate||today();
    const finished=latestCompletedWorkoutForDate(iso);
    if(!finished)return;
    if(selectedTodayDay!==finished.day){
      selectedTodayDay=finished.day;
      localStorage.setItem('gymTodayDay',finished.day);
    }
    if(typeof showToday==='function')showToday(finished.day,iso);
  }catch(e){console.warn('v145 completed-date selection failed',e)}
}

function diagnostics(){
  let iso='';
  try{iso=selectedWorkoutDate||today()}catch(_){}
  const workout=latestCompletedWorkoutForDate(iso);
  let visible='';
  try{visible=document.querySelector('.screen.active')?.id||''}catch(_){}
  const cards=Array.from(document.querySelectorAll('.screen.active .modern-exercise-card'));
  const doneCards=cards.filter(c=>c.classList.contains('exercise-done')).length;
  const completedCards=document.querySelectorAll('.screen.active .v144-completed-card').length;
  return {
    release:'v145',
    selectedDate:iso,
    completedWorkoutFound:!!workout,
    completedWorkoutDay:workout?.day||'',
    visibleDay:visible,
    correctCompletedDayVisible:!workout||visible===workout.day,
    ordinaryCards:cards.length,
    ordinaryDoneCards:doneCards,
    completedHistoryCards:completedCards
  };
}

function start(){
  hookShowToday();
  setTimeout(forceCurrentCompletedDate,0);
  setTimeout(forceCurrentCompletedDate,700);
}

window.GymV145={release:'v145',latestCompletedWorkoutForDate,resolveDayForDate,forceCurrentCompletedDate,diagnostics};
window.gymV145Diagnostics=diagnostics;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
