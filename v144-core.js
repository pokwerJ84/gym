/* Gym Tracker v144: completed-day snapshot + delete button for compact set rows */
(()=>{
'use strict';

const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const isCs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const escHtml=value=>String(value??'').replace(/[&<>\"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]));

function setIndexFromCompactRow(row,rowIndex){
  const edit=row.querySelector('.v123-edit-set');
  const raw=edit?.getAttribute('onclick')||'';
  const match=raw.match(/editSavedSet\((\d+)\)/);
  return match?Number(match[1]):rowIndex;
}

function enhanceCompactDeleteButtons(){
  qa('.v123-set-row.complete').forEach((row,rowIndex)=>{
    if(row.querySelector('.v144-delete-set'))return;
    const number=row.querySelector('.v123-set-number');
    if(!number)return;
    const setIndex=setIndexFromCompactRow(row,rowIndex);
    const btn=document.createElement('button');
    btn.type='button';
    btn.className='v144-delete-set';
    btn.textContent='×';
    btn.setAttribute('aria-label',isCs()?'Smazat sérii':'Delete set');
    btn.setAttribute('title',isCs()?'Smazat sérii':'Delete set');
    btn.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      if(typeof deleteSavedSet==='function')deleteSavedSet(setIndex);
    });
    number.replaceWith(btn);
  });
}

function latestCompletedWorkout(iso){
  try{
    return (state.workouts||[])
      .filter(w=>w.type!=='cardio'&&w.date===iso)
      .sort((a,b)=>(b.savedAt||0)-(a.savedAt||0))[0]||null;
  }catch(_){return null}
}

function recordsForWorkout(workout){
  if(!workout)return[];
  try{
    if(typeof historyRecordsForWorkout==='function'){
      const records=historyRecordsForWorkout(workout)||[];
      if(records.length)return records;
    }
  }catch(_){}
  const out=[];
  try{
    Object.entries(state.history||{}).forEach(([exerciseId,items])=>{
      (items||[]).forEach(record=>{
        if(record.date===workout.date&&(!workout.day||record.day===workout.day))out.push({...record,exerciseId:record.exerciseId||exerciseId});
      });
    });
  }catch(_){}
  return out;
}

function recordSummary(record){
  try{if(typeof formatRecord==='function')return formatRecord(record)}catch(_){}
  if(Array.isArray(record.sets)&&record.sets.length){
    return record.sets.map(set=>{
      if(set.kg!=null&&set.reps!=null)return `${set.kg} kg × ${set.reps}`;
      if(set.reps!=null)return `${set.reps} reps`;
      if(set.seconds!=null)return `${set.seconds} s`;
      if(set.kg!=null&&(set.left!=null||set.right!=null))return `${set.kg} kg · L ${set.left??'–'} / R ${set.right??'–'}`;
      return '';
    }).filter(Boolean).join(' · ');
  }
  if(record.minutes)return `${record.minutes} min${record.speed?` · ${record.speed} km/h`:''}`;
  return isCs()?'Uloženo':'Saved';
}

function exerciseForRecord(record){
  try{return EX?.[record.exerciseId]||LIBRARY?.find?.(x=>x.id===record.exerciseId)||null}catch(_){return null}
}

function decorateCompletedDay(){
  let iso='';
  try{iso=selectedWorkoutDate||today()}catch(_){return}
  const workout=latestCompletedWorkout(iso);
  if(!workout)return;
  const records=recordsForWorkout(workout);
  if(!records.length)return;

  const root=document.getElementById(workout.day)||q('.screen.active');
  if(!root)return;
  const section=q('.unified-exercise-list',root);
  if(!section)return;
  if(section.dataset.v144Date===iso)return;

  const heroTitle=q('.workout-hero h2',root);
  const heroSub=q('.workout-hero p',root);
  if(heroTitle)heroTitle.textContent=isCs()?'✓ Dokončený trénink':'✓ Completed workout';
  if(heroSub)heroSub.textContent=isCs()?`${records.length} skutečně odcvičených cviků`:`${records.length} exercises actually completed`;

  section.dataset.v144Date=iso;
  section.innerHTML=`
    <div class="v120-exercise-heading v144-completed-heading">
      <h3>${isCs()?'Hotovo tento den':'Completed this day'}</h3>
      <span>${records.length} ${isCs()?'cviků':'exercises'}</span>
    </div>
    <div class="v144-completed-list">
      ${records.map((record,index)=>{
        const x=exerciseForRecord(record);
        const name=x?(typeof itemName==='function'?itemName(x):(isCs()?x.cs:x.en)||x.en||x.cs):record.exerciseId;
        const thumb=x?.guideThumb||x?.guideImage||'';
        const summary=recordSummary(record);
        return `<button type="button" class="v144-completed-card" data-exercise-id="${escHtml(record.exerciseId)}">
          <span class="v144-check">✓</span>
          ${thumb?`<img src="${escHtml(thumb)}" alt="" loading="lazy">`:'<span class="v144-thumb-fallback">✓</span>'}
          <span class="v144-completed-main"><strong>${escHtml(name)}</strong><small>${escHtml(summary)}</small><b>${isCs()?'✓ Hotovo':'✓ Complete'}</b></span>
          <span class="v144-chevron">›</span>
        </button>`;
      }).join('')}
    </div>`;

  qa('.v144-completed-card',section).forEach(card=>{
    card.addEventListener('click',()=>{
      const id=card.dataset.exerciseId;
      try{if(typeof openHistory==='function')openHistory(id)}catch(_){}
    });
  });
}

function afterRender(){
  requestAnimationFrame(()=>{
    enhanceCompactDeleteButtons();
    decorateCompletedDay();
  });
}

function hookRenderDay(){
  try{
    const native=window.renderDay||(typeof renderDay==='function'?renderDay:null);
    if(typeof native!=='function'||native.__v144)return;
    const wrapped=function(...args){const result=native.apply(this,args);afterRender();return result};
    wrapped.__v144=true;wrapped.__native=native;
    window.renderDay=wrapped;try{renderDay=wrapped}catch(_){}
  }catch(e){console.warn('v144 render hook failed',e)}
}

function diagnostics(){
  const compactRows=qa('.v123-set-row.complete');
  const deleteButtons=qa('.v123-set-row.complete .v144-delete-set');
  let iso='';try{iso=selectedWorkoutDate||today()}catch(_){}
  const workout=latestCompletedWorkout(iso);
  const records=recordsForWorkout(workout);
  const completedCards=qa('.v144-completed-card');
  return {
    release:'v144',
    compactDeleteButtons:compactRows.length===deleteButtons.length,
    compactRows:compactRows.length,
    deleteButtons:deleteButtons.length,
    completedWorkoutFound:!!workout,
    historyRecords:records.length,
    completedCards:completedCards.length,
    completedDayRendered:!workout||!records.length||completedCards.length===records.length
  };
}

const observer=new MutationObserver(()=>{enhanceCompactDeleteButtons();decorateCompletedDay()});
function start(){
  hookRenderDay();
  afterRender();
  observer.observe(document.body,{childList:true,subtree:true});
}
window.GymV144={release:'v144',enhanceCompactDeleteButtons,decorateCompletedDay,diagnostics};
window.gymV144Diagnostics=diagnostics;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
