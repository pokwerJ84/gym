/* Gym Tracker v152: single-path completed calendar routing, no observers */
(()=>{
'use strict';
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const todayIso=()=>{try{return typeof today==='function'?today():new Date().toISOString().slice(0,10)}catch(_){return new Date().toISOString().slice(0,10)}};

function completedWorkout(iso){
  try{return (state?.workouts||[]).filter(w=>w&&w.type!=='cardio'&&w.date===iso).sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]||null}catch(_){return null}
}
function recordsFor(workout){
  if(!workout)return[];
  try{if(typeof historyRecordsForWorkout==='function'){const rows=historyRecordsForWorkout(workout)||[];if(rows.length)return rows}}catch(_){}
  try{if(typeof v124WorkoutRecords==='function'){const rows=v124WorkoutRecords(workout)||[];if(rows.length)return rows}}catch(_){}
  const out=[];
  try{Object.entries(state?.history||{}).forEach(([exerciseId,items])=>(items||[]).forEach(record=>{if(workout.sessionKey?record.sessionKey===workout.sessionKey:(record.date===workout.date&&record.day===workout.day))out.push({...record,exerciseId:record.exerciseId||exerciseId})}))}catch(_){}
  return out;
}
function summary(record){try{return typeof formatRecord==='function'?formatRecord(record):''}catch(_){return ''}}
function idForCard(card,day){
  const instance=card.dataset.instanceId||'';
  try{if(instance&&typeof metaFor==='function')return metaFor(day,instance)?.id||''}catch(_){}
  return card.dataset.exerciseId||'';
}
function paintHistorical(workout){
  const root=document.getElementById(workout.day)||q('.screen.active');
  if(!root)return false;
  root.classList.add('v152-history-mode');
  const records=recordsFor(workout),byId=new Map(records.map(r=>[String(r.exerciseId),r]));
  const cards=qa('.modern-exercise-card',root);
  let matched=0;
  cards.forEach(card=>{
    const id=String(idForCard(card,workout.day)||'');
    const record=byId.get(id);
    if(!record){card.hidden=true;return}
    matched++;
    card.hidden=false;
    card.classList.add('exercise-done','v129-state-done','v152-history-card');
    card.classList.remove('exercise-in-progress','exercise-skipped','v129-completed-hidden');
    const badge=q('.exercise-set-status',card);
    if(badge)badge.textContent='✓ '+(cs()?'Hotovo':'Complete');
    const old=q('.v152-saved-performance',card);if(old)old.remove();
    const main=q('.preview-card-main',card)||q('.modern-exercise-main',card);
    if(main){const saved=document.createElement('span');saved.className='v152-saved-performance';saved.textContent=summary(record);main.appendChild(saved)}
    const num=q('.preview-card-number',card);if(num)num.textContent='✓';
  });
  const heading=q('.v120-exercise-heading h3',root);if(heading)heading.textContent=`${matched||records.length} ${cs()?'cviků':'exercises'}`;
  qa('.v129-completed-tools',root).forEach(x=>x.remove());
  try{q('#calendarDayDialog')?.close()}catch(_){}
  return matched>0;
}
function openHistorical(iso){
  const workout=completedWorkout(iso);if(!workout)return false;
  try{selectedWorkoutDate=iso;calendarViewDate=iso;selectedTodayDay=workout.day;localStorage.setItem('gymSelectedWorkoutDate',iso);localStorage.setItem('gymTodayDay',workout.day)}catch(_){}
  try{if(typeof showTodayV122==='function')showTodayV122(workout.day,iso);else if(typeof showToday==='function')showToday(workout.day,iso)}catch(e){console.warn('[v152 render]',e)}
  try{qa('.screen').forEach(el=>el.classList.toggle('active',el.id===workout.day))}catch(_){}
  requestAnimationFrame(()=>paintHistorical(workout));
  setTimeout(()=>paintHistorical(workout),80);
  try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(_){}
  return true;
}

const nativeCalendar=(()=>{try{return typeof v124OpenCalendarDay==='function'?v124OpenCalendarDay:null}catch(_){return null}})();
const nativeSelect=(()=>{try{return typeof selectScheduleDate==='function'?selectScheduleDate:null}catch(_){return null}})();
function calendarRoute(iso,...args){const date=String(iso||'');if(date&&completedWorkout(date))return openHistorical(date);return nativeCalendar?nativeCalendar.call(this,date,...args):undefined}
function selectRoute(iso,...args){const date=String(iso||'');if(date&&completedWorkout(date))return openHistorical(date);return nativeSelect?nativeSelect.call(this,date,...args):undefined}

function clearHistoryMode(){qa('.v152-history-mode').forEach(root=>{root.classList.remove('v152-history-mode');qa('.v152-history-card',root).forEach(card=>{card.hidden=false;card.classList.remove('v152-history-card');q('.v152-saved-performance',card)?.remove()})})}
function install(){
  try{v124OpenCalendarDay=calendarRoute;window.v124OpenCalendarDay=calendarRoute}catch(e){console.warn('[v152 calendar install]',e)}
  try{selectScheduleDate=selectRoute;window.selectScheduleDate=selectRoute}catch(e){console.warn('[v152 select install]',e)}
  try{
    const nativeToday=window.goToTodayDate||(typeof goToTodayDate==='function'?goToTodayDate:null);
    if(typeof nativeToday==='function'){
      const f=function(...a){clearHistoryMode();return nativeToday.apply(this,a)};
      goToTodayDate=f;window.goToTodayDate=f;
    }
  }catch(_){}
}
window.GymV152={release:'v152',completedWorkout,recordsFor,openHistorical,paintHistorical,clearHistoryMode};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
