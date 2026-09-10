/* Gym Tracker v149: completed exercises are green in both calendar-detail paths */
(()=>{
'use strict';
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function workoutsFor(iso){try{return (state?.workouts||[]).filter(w=>w?.date===iso)}catch(_){return []}}
function recordsFor(workout){
  try{if(typeof v124WorkoutRecords==='function')return v124WorkoutRecords(workout)||[]}catch(_){}
  const out=[];try{Object.entries(state?.history||{}).forEach(([exerciseId,items])=>(items||[]).forEach(record=>{if(workout.sessionKey?record.sessionKey===workout.sessionKey:(record.date===workout.date&&record.day===workout.day))out.push({...record,exerciseId:record.exerciseId||exerciseId})}))}catch(_){}return out;
}
function exerciseName(record){try{const x=EX?.[record.exerciseId];return x?(typeof itemName==='function'?itemName(x):(x.en||x.cs||record.exerciseId)):record.exerciseId}catch(_){return record.exerciseId}}
function summary(record){try{return typeof formatRecord==='function'?formatRecord(record):''}catch(_){return ''}}
function sessionTitle(workout){try{return workout.programTitle||v124SessionTitle(workout.programId||v124ProgramId(),workout.day)}catch(_){return workout.programTitle||workout.day||''}}
function renderOldDialog(iso){
  const workouts=workoutsFor(iso),title=q('#calendarDayTitle'),sub=q('#calendarDaySubtitle'),content=q('#calendarDayContent');
  if(!title||!sub||!content)return false;
  try{title.textContent=typeof localizedFullDate==='function'?localizedFullDate(iso):iso}catch(_){title.textContent=iso}
  sub.textContent=workouts.length?(cs()?`${workouts.length} uložených tréninků`:`${workouts.length} saved workouts`):(cs()?'V tento den není uložený žádný trénink.':'No workout is saved for this day.');
  content.innerHTML=workouts.map(workout=>{
    if(workout.type==='cardio')return `<section class="v149-day-workout v149-cardio"><h3>♥ ${safe(typeof cardioTypeLabel==='function'?cardioTypeLabel(workout.cardioType):'Cardio')}</h3><div class="v149-cardio-row"><span>${cs()?'Délka':'Duration'}</span><strong>${safe(`${workout.minutes||'–'} min`)}</strong></div></section>`;
    const records=recordsFor(workout);
    return `<section class="v149-day-workout"><h3>✓ ${safe(sessionTitle(workout))}</h3><div class="v149-completed-list">${records.map(record=>`<button type="button" class="v149-completed-exercise" data-exercise-id="${safe(record.exerciseId)}"><span class="v149-check">✓</span><span class="v149-ex-copy"><strong>${safe(exerciseName(record))}</strong><small>${safe(summary(record))}</small></span></button>`).join('')||`<p class="subtitle">${cs()?'Trénink je uložený.':'Workout saved.'}</p>`}</div></section>`;
  }).join('');
  content.querySelectorAll('.v149-completed-exercise').forEach(btn=>btn.addEventListener('click',()=>{try{if(typeof openHistory==='function'){q('#calendarDayDialog')?.close();openHistory(btn.dataset.exerciseId)}}catch(_){}}));
  q('#calendarDayDialog')?.showModal();return true;
}
function patchOldCalendar(){
  try{
    const native=window.v124OpenCalendarDay||(typeof v124OpenCalendarDay==='function'?v124OpenCalendarDay:null);
    if(typeof native!=='function'||native.__v149)return;
    const wrapped=function(iso){
      const completed=workoutsFor(iso).some(w=>w&&w.type!=='cardio');
      if(completed&&renderOldDialog(iso))return;
      return native.call(this,iso);
    };
    wrapped.__v149=true;wrapped.__native=native;window.v124OpenCalendarDay=wrapped;try{v124OpenCalendarDay=wrapped}catch(_){}
  }catch(e){console.warn('[v149 calendar]',e)}
}
function reinforceMainCards(){document.querySelectorAll('.v144-completed-card').forEach(card=>card.classList.add('v149-green-completed'))}
function start(){patchOldCalendar();reinforceMainCards();new MutationObserver(reinforceMainCards).observe(document.body,{childList:true,subtree:true})}
window.GymV149={release:'v149',renderOldDialog,reinforceMainCards};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
