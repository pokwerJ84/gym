/* Gym Tracker v150: completed calendar days reuse normal exercise cards */
(()=>{
'use strict';
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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
function exercise(id){try{return EX?.[id]||null}catch(_){return null}}
function nameFor(record){const x=exercise(record.exerciseId);try{return x&&typeof itemName==='function'?itemName(x):(x?.[cs()?'cs':'en']||x?.en||x?.cs||record.exerciseId)}catch(_){return x?.en||x?.cs||record.exerciseId}}
function categoryFor(x){try{return x&&typeof categoryName==='function'?categoryName(x.category):String(x?.category||'')}catch(_){return String(x?.category||'')}}
function summaryFor(record){try{return typeof formatRecord==='function'?formatRecord(record):''}catch(_){return ''}}
function orderRecords(workout,records){
  let order=[];
  try{order=dayInstances(workout.day).map(inst=>metaFor(workout.day,inst)?.id).filter(Boolean)}catch(_){}
  return records.slice().sort((a,b)=>{
    const ai=order.indexOf(a.exerciseId),bi=order.indexOf(b.exerciseId);
    if(ai<0&&bi<0)return 0;if(ai<0)return 1;if(bi<0)return-1;return ai-bi;
  });
}
function cardHtml(record,index){
  const x=exercise(record.exerciseId)||{};
  const thumb=x.guideThumb||x.guideImage||'';
  const saved=summaryFor(record);
  const target=[x.range,categoryFor(x)].filter(Boolean).join(' · ');
  return `<details class="preview-accordion modern-exercise-card exercise-done v150-history-card" data-exercise-id="${safe(record.exerciseId)}" data-card-number="${index+1}">
    <summary>
      <span class="preview-card-number">✓</span>
      ${thumb?`<img class="exercise-guide-thumb" src="${safe(thumb)}" alt="" loading="lazy">`:`<span class="exercise-category-icon">✓</span>`}
      <div class="preview-card-main">
        <strong><span class="preview-card-name">${safe(nameFor(record))}</span></strong>
        ${target?`<small>${safe(target)}</small>`:''}
        ${saved?`<span class="v150-saved-performance">${safe(saved)}</span>`:''}
        <span class="exercise-set-status">✓ ${cs()?'Hotovo':'Complete'}</span>
      </div>
      <span class="preview-card-chevron">›</span>
    </summary>
  </details>`;
}
function renderHistoricalCards(workout){
  if(!workout)return false;
  const records=orderRecords(workout,recordsFor(workout));
  const root=document.getElementById(workout.day)||q('.screen.active');
  const section=q('.unified-exercise-list',root);
  if(!root||!section||!records.length)return false;
  section.dataset.v150HistoryDate=workout.date;
  section.dataset.v144Date=workout.date;
  section.innerHTML=`<div class="v120-exercise-heading"><h3>${records.length} ${cs()?'cviků':'exercises'}</h3><span>${cs()?'Hotovo':'Completed'}</span></div>
    <div class="plan-preview-list today-preview-list v150-history-list">${records.map(cardHtml).join('')}</div>`;
  qa('.v150-history-card',section).forEach(card=>{
    card.addEventListener('click',ev=>{
      ev.preventDefault();
      const id=card.dataset.exerciseId;
      try{if(typeof openHistory==='function')openHistory(id)}catch(_){}
    });
  });
  qa('.v129-completed-tools',root).forEach(el=>el.remove());
  qa('.v129-completed-hidden',section).forEach(el=>el.classList.remove('v129-completed-hidden'));
  const heroTitle=q('.workout-hero h2',root);
  const heroSub=q('.workout-hero p',root);
  if(heroTitle)heroTitle.textContent=cs()?'✓ Dokončený trénink':'✓ Completed workout';
  if(heroSub)heroSub.textContent=cs()?`${records.length} odcvičených cviků`:`${records.length} completed exercises`;
  return true;
}
function openHistoricalDay(iso){
  const workout=completedWorkout(iso);if(!workout)return false;
  try{selectedWorkoutDate=iso;calendarViewDate=iso;selectedTodayDay=workout.day;localStorage.setItem('gymSelectedWorkoutDate',iso);localStorage.setItem('gymTodayDay',workout.day)}catch(_){}
  try{q('#calendarDayDialog')?.close()}catch(_){}
  try{
    if(typeof showTodayV122==='function')showTodayV122(workout.day,iso);
    else if(window.GymV146?.showDateCorrectly)window.GymV146.showDateCorrectly(workout.day,iso);
    else if(typeof showToday==='function')showToday(workout.day,iso);
  }catch(e){console.warn('[v150 show historical]',e)}
  try{qa('.screen').forEach(el=>el.classList.toggle('active',el.id===workout.day))}catch(_){}
  const paint=()=>renderHistoricalCards(workout);
  requestAnimationFrame(()=>{paint();setTimeout(paint,40);setTimeout(paint,160)});
  return true;
}
function calendarTap(ev){
  const btn=ev.target?.closest?.('.v120-day[data-date]');if(!btn)return;
  const iso=btn.dataset.date;if(!iso||!completedWorkout(iso))return;
  ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
  openHistoricalDay(iso);
}
let lastTouch=0;
function onTouch(ev){lastTouch=Date.now();calendarTap(ev)}
function onClick(ev){if(Date.now()-lastTouch<700){const btn=ev.target?.closest?.('.v120-day[data-date]');if(btn&&completedWorkout(btn.dataset.date)){ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation()}return}calendarTap(ev)}
function repairVisibleHistoricalDay(){
  let iso='';try{iso=String(selectedWorkoutDate||'')}catch(_){}
  if(!iso||iso>=todayIso())return;
  const workout=completedWorkout(iso);if(!workout)return;
  const active=q('.screen.active');if(active?.id!==workout.day)return;
  renderHistoricalCards(workout);
}
function start(){
  window.addEventListener('touchend',onTouch,true);
  window.addEventListener('click',onClick,true);
  const obs=new MutationObserver(()=>repairVisibleHistoricalDay());
  obs.observe(document.body,{childList:true,subtree:true});
  repairVisibleHistoricalDay();
}
window.GymV150={release:'v150',completedWorkout,recordsFor,renderHistoricalCards,openHistoricalDay};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
