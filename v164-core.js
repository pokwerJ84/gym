/* Gym Tracker v164: reconstruct skipped exercises for pre-v163 completed workouts */
(()=>{
'use strict';
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function workoutFor(iso){try{return window.GymV153?.completedWorkout?.(iso)||(state?.workouts||[]).filter(w=>w&&w.type!=='cardio'&&w.date===iso).sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]||null}catch(_){return null}}
function ex(id){try{return EX?.[id]||null}catch(_){return null}}
function label(id){const x=ex(id);try{return x&&typeof itemName==='function'?itemName(x):(x?.[cs()?'cs':'en']||x?.en||x?.cs||id)}catch(_){return x?.en||x?.cs||id}}
function records(workout){try{return window.GymV153?.recordsFor?.(workout)||[]}catch(_){return[]}}
function baseItems(workout){
 const pid=workout?.programId||'balanced',day=workout?.day;let items=[];
 try{const saved=state?.programSessionLayouts?.[pid]?.[day];if(Array.isArray(saved)&&saved.length)items=saved.map(x=>({...x}))}catch(_){}
 if(!items.length){try{items=(PLAN_PRESETS?.[pid]?.plans?.[day]?.items||[]).map(x=>({...x}))}catch(_){} }
 if(!items.length){try{items=(BASE_PLANS?.[day]?.items||[]).map(x=>({...x}))}catch(_){} }
 return items.filter(x=>x?.id&&ex(x.id));
}
function formatRecord(r){try{if(typeof formatRecord==='function')return formatRecord(r)}catch(_){} if(Array.isArray(r?.sets)&&r.sets.length)return r.sets.map(s=>s.kg!=null&&s.reps!=null?`${s.kg}×${s.reps}`:s.reps!=null?`${s.reps}×`:s.seconds!=null?`${s.seconds}s`:'').filter(Boolean).join(' / ');return r?.minutes?`${r.minutes} min`:''}
function reconstructedItems(workout){
 if(Array.isArray(workout?.exerciseSnapshot)&&workout.exerciseSnapshot.length)return workout.exerciseSnapshot;
 const recs=records(workout),used=new Set(),out=[];
 baseItems(workout).forEach((item,index)=>{
   const ri=recs.findIndex((r,i)=>!used.has(i)&&String(r.exerciseId||'')===String(item.id));
   if(ri>=0){used.add(ri);const r=recs[ri];out.push({order:index,exerciseId:item.id,skipped:false,done:true,sets:Array.isArray(r.sets)?r.sets:[],minutes:r.minutes||'',speed:r.speed||'',incline:r.incline||'',setsTarget:item.sets||ex(item.id)?.sets||3,range:item.range||ex(item.id)?.range||'',category:ex(item.id)?.category||'',guideThumb:ex(item.id)?.guideThumb||'',legacyReconstructed:true});}
   else out.push({order:index,exerciseId:item.id,skipped:true,done:false,sets:[],minutes:'',setsTarget:item.sets||ex(item.id)?.sets||3,range:item.range||ex(item.id)?.range||'',category:ex(item.id)?.category||'',guideThumb:ex(item.id)?.guideThumb||'',legacyReconstructed:true});
 });
 recs.forEach((r,i)=>{if(used.has(i))return;out.push({order:out.length,exerciseId:r.exerciseId,skipped:false,done:true,sets:Array.isArray(r.sets)?r.sets:[],minutes:r.minutes||'',speed:r.speed||'',incline:r.incline||'',range:ex(r.exerciseId)?.range||'',category:ex(r.exerciseId)?.category||'',guideThumb:ex(r.exerciseId)?.guideThumb||'',legacyReconstructed:true})});
 return out;
}
function card(item){
 const x=ex(item.exerciseId)||{},thumb=item.guideThumb||x.guideThumb||x.guideImage||'',target=[item.range||x.range,item.category||x.category||''].filter(Boolean).join(' · '),sk=!!item.skipped,done=!sk&&!!item.done,saved=sk?(cs()?'Vynecháno':'Skipped'):(item.sets?.length?item.sets.map(s=>s.kg!=null&&s.reps!=null?`${s.kg}×${s.reps}`:s.reps!=null?`${s.reps}×`:s.seconds!=null?`${s.seconds}s`:'').filter(Boolean).join(' / '):item.minutes?`${item.minutes} min`:'');
 return `<details class="preview-accordion modern-exercise-card ${sk?'exercise-skipped v163-history-skipped':done?'exercise-done':'v163-history-incomplete'} v153-history-card" data-exercise-id="${esc(item.exerciseId)}"><summary class="exercise-summary"><span class="preview-card-number">${sk?'–':done?'✓':'!'}</span>${thumb?`<img class="exercise-guide-thumb" src="${esc(thumb)}" alt="" loading="lazy">`:`<span class="v153-thumb-fallback">${sk?'–':'✓'}</span>`}<span class="preview-card-main"><strong><span class="preview-card-name">${esc(label(item.exerciseId))}</span></strong>${target?`<small class="v153-target">${esc(target)}</small>`:''}${saved?`<span class="v153-saved-performance">${esc(saved)}</span>`:''}<span class="exercise-set-status">${sk?(cs()?'Vynecháno':'Skipped'):done?(cs()?'✓ Hotovo':'✓ Complete'):(cs()?'Nedokončeno':'Incomplete')}</span></span><span class="preview-card-chevron">›</span></summary></details>`;
}
const fallback=window.GymV163?.renderHistorical?.bind(window.GymV163)||window.GymV153?.renderHistorical?.bind(window.GymV153);
function renderHistorical(iso){
 const workout=workoutFor(iso);if(!workout)return fallback?fallback(iso):false;
 const items=reconstructedItems(workout);if(!items.length)return fallback?fallback(iso):false;
 try{selectedWorkoutDate=iso;calendarViewDate=iso;selectedTodayDay=workout.day;localStorage.setItem('gymSelectedWorkoutDate',iso);localStorage.setItem('gymTodayDay',workout.day)}catch(_){}
 const root=document.getElementById(workout.day);if(!root)return false;qa('.screen').forEach(el=>el.classList.toggle('active',el===root));root.classList.add('v153-history-mode');
 let section=q('.unified-exercise-list',root);if(!section){try{renderDay(workout.day)}catch(_){}section=q('.unified-exercise-list',root)}if(!section)return false;
 section.innerHTML=`<div class="v120-exercise-heading"><h3>${items.length} ${cs()?'cviků':'exercises'}</h3><span>${cs()?'Výsledek dne':'Day result'}</span></div><div class="plan-preview-list today-preview-list v153-history-list">${items.sort((a,b)=>(a.order||0)-(b.order||0)).map(card).join('')}</div>`;
 qa('.v153-history-card',section).forEach(c=>c.addEventListener('click',ev=>{ev.preventDefault();try{openHistory(c.dataset.exerciseId)}catch(_){}}));
 return true;
}
function install(){if(window.GymV153)window.GymV153.renderHistorical=renderHistorical;if(window.GymV163)window.GymV163.renderHistorical=renderHistorical;window.GymV164={release:'v164',renderHistorical,reconstructedItems};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
