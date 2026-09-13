/* Gym Tracker v153: historical dates render saved workout directly as normal green exercise cards */
(()=>{
'use strict';
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DAYS=['monday','wednesday','friday'];
const sessionName=d=>({monday:'Strength',wednesday:'Stability',friday:'Control'}[d]||d||'Workout');
const sessionIndex=d=>Math.max(1,DAYS.indexOf(d)+1);

function completedWorkout(iso){
  try{return (state?.workouts||[]).filter(w=>w&&w.type!=='cardio'&&w.date===iso).sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]||null}catch(_){return null}
}
function recordsFor(workout){
  if(!workout)return[];
  const out=[];
  try{
    Object.entries(state?.history||{}).forEach(([exerciseId,items])=>{
      (items||[]).forEach(record=>{
        const match=workout.sessionKey?record.sessionKey===workout.sessionKey:(record.date===workout.date&&(!workout.day||record.day===workout.day));
        if(match)out.push({...record,exerciseId:record.exerciseId||exerciseId});
      });
    });
  }catch(_){}
  return out;
}
function exerciseFor(id){try{return EX?.[id]||null}catch(_){return null}}
function exerciseName(record){
  const x=exerciseFor(record.exerciseId);
  try{return x&&typeof itemName==='function'?itemName(x):(x?.[cs()?'cs':'en']||x?.en||x?.cs||record.exerciseId)}catch(_){return x?.en||x?.cs||record.exerciseId}
}
function categoryFor(x){try{return x&&typeof categoryName==='function'?categoryName(x.category):String(x?.category||'')}catch(_){return String(x?.category||'')}}
function summaryFor(record){
  try{if(typeof formatRecord==='function')return formatRecord(record)}catch(_){}
  if(Array.isArray(record?.sets)&&record.sets.length){
    return record.sets.map(s=>{
      if(s.kg!=null&&s.reps!=null)return `${s.kg}×${s.reps}`;
      if(s.reps!=null)return `${s.reps}×`;
      if(s.seconds!=null)return `${s.seconds}s`;
      return '';
    }).filter(Boolean).join(' / ');
  }
  return record?.minutes?`${record.minutes} min`:'';
}
function orderedRecords(workout){
  const rows=recordsFor(workout);
  let order=[];
  try{if(typeof dayInstances==='function'&&typeof metaFor==='function')order=dayInstances(workout.day).map(inst=>metaFor(workout.day,inst)?.id).filter(Boolean)}catch(_){}
  return rows.slice().sort((a,b)=>{
    const ai=order.indexOf(a.exerciseId),bi=order.indexOf(b.exerciseId);
    if(ai<0&&bi<0)return 0;if(ai<0)return 1;if(bi<0)return-1;return ai-bi;
  });
}
function cardHtml(record,index){
  const x=exerciseFor(record.exerciseId)||{};
  const thumb=x.guideThumb||x.guideImage||'';
  const target=[x.range,categoryFor(x)].filter(Boolean).join(' · ');
  const saved=summaryFor(record);
  return `<details class="preview-accordion modern-exercise-card exercise-done v153-history-card" data-exercise-id="${esc(record.exerciseId)}">
    <summary class="exercise-summary">
      <span class="preview-card-number v153-check">✓</span>
      ${thumb?`<img class="exercise-guide-thumb" src="${esc(thumb)}" alt="" loading="lazy">`:`<span class="v153-thumb-fallback">✓</span>`}
      <span class="preview-card-main">
        <strong><span class="preview-card-name">${esc(exerciseName(record))}</span></strong>
        ${target?`<small class="v153-target">${esc(target)}</small>`:''}
        ${saved?`<span class="v153-saved-performance">${esc(saved)}</span>`:''}
        <span class="exercise-set-status">✓ ${cs()?'Hotovo':'Complete'}</span>
      </span>
      <span class="preview-card-chevron">›</span>
    </summary>
  </details>`;
}
function ensureSection(root){
  let section=q('.unified-exercise-list',root);
  if(section)return section;
  try{if(typeof renderDay==='function')renderDay(root.id)}catch(_){}
  return q('.unified-exercise-list',root);
}
function renderHistorical(iso){
  const workout=completedWorkout(iso);if(!workout)return false;
  const records=orderedRecords(workout);if(!records.length)return false;
  try{selectedWorkoutDate=iso;calendarViewDate=iso;selectedTodayDay=workout.day;localStorage.setItem('gymSelectedWorkoutDate',iso);localStorage.setItem('gymTodayDay',workout.day)}catch(_){}
  try{q('#calendarDayDialog')?.close()}catch(_){}
  const root=document.getElementById(workout.day);if(!root)return false;
  qa('.screen').forEach(el=>el.classList.toggle('active',el===root));
  root.classList.add('v153-history-mode');
  const section=ensureSection(root);if(!section)return false;
  section.innerHTML=`<div class="v120-exercise-heading"><h3>${records.length} ${cs()?'cviků':'exercises'}</h3><span>${cs()?'Hotovo':'Completed'}</span></div><div class="plan-preview-list today-preview-list v153-history-list">${records.map(cardHtml).join('')}</div>`;
  qa('.v153-history-card',section).forEach(card=>card.addEventListener('click',ev=>{
    ev.preventDefault();
    const id=card.dataset.exerciseId;
    try{if(typeof openHistory==='function')openHistory(id)}catch(_){}
  }));
  const plan=workout.programTitle||'Balanced plan',sName=sessionName(workout.day),sIdx=sessionIndex(workout.day);
  const compact=q('.v139-overview-compact strong',root);if(compact)compact.textContent=`${plan} · ${sName} ${sIdx}/3`;
  const heroTitle=q('.workout-hero h2',root);if(heroTitle)heroTitle.textContent=`${sName}`;
  const heroNum=q('.hero-plan-number',root);if(heroNum)heroNum.textContent=`${sIdx}/3`;
  const sessionStrong=q('.v137-session-control strong',root);if(sessionStrong)sessionStrong.textContent=`✓ ${sName} ${sIdx}/3`;
  const sessionSource=q('.v137-session-control em',root);if(sessionSource)sessionSource.textContent=cs()?`Dokončeno ${iso}`:`Completed ${iso}`;
  qa('.v129-completed-tools,.history-based-recommendation,.v136-recommendation,.recommendation-card',root).forEach(el=>el.style.display='none');
  try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(_){}
  return true;
}
function clearHistorical(){
  qa('.v153-history-mode').forEach(root=>root.classList.remove('v153-history-mode'));
}
const nativeCalendar=(()=>{try{return typeof v124OpenCalendarDay==='function'?v124OpenCalendarDay:null}catch(_){return null}})();
const nativeSelect=(()=>{try{return typeof selectScheduleDate==='function'?selectScheduleDate:null}catch(_){return null}})();
function calendarRoute(iso,...args){const date=String(iso||'');if(completedWorkout(date))return renderHistorical(date);clearHistorical();return nativeCalendar?nativeCalendar.call(this,date,...args):undefined}
function selectRoute(iso,...args){const date=String(iso||'');if(completedWorkout(date))return renderHistorical(date);clearHistorical();return nativeSelect?nativeSelect.call(this,date,...args):undefined}
function install(){
  try{v124OpenCalendarDay=calendarRoute;window.v124OpenCalendarDay=calendarRoute}catch(_){}
  try{selectScheduleDate=selectRoute;window.selectScheduleDate=selectRoute}catch(_){}
  try{
    const nativeToday=window.goToTodayDate||(typeof goToTodayDate==='function'?goToTodayDate:null);
    if(typeof nativeToday==='function'){
      const f=function(...a){clearHistorical();return nativeToday.apply(this,a)};
      goToTodayDate=f;window.goToTodayDate=f;
    }
  }catch(_){}
}
window.GymV153={release:'v153',completedWorkout,recordsFor,renderHistorical,clearHistorical};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
