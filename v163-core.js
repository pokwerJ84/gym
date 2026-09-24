/* Gym Tracker v163: editable workout + skipped exercise history */
(()=>{
'use strict';
const V={release:'v163'};
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=msg=>{try{if(typeof showToast==='function')showToast(msg)}catch(_){}};
const programId=()=>{try{return state?.programJourney?.programId||state?.settings?.workoutStyle||'balanced'}catch(_){return'balanced'}};

function persist(){try{saveState()}catch(_){}try{if(typeof saveCloud==='function')saveCloud()}catch(_){} }
function exerciseObj(id){try{return EX?.[id]||null}catch(_){return null}}
function exerciseLabel(id){const x=exerciseObj(id);try{return x&&typeof itemName==='function'?itemName(x):(x?.[cs()?'cs':'en']||x?.en||x?.cs||id)}catch(_){return x?.en||x?.cs||id}}
function workoutDate(){try{return state?.activeWorkout?.date||state?.days?.[state?.activeWorkout?.day]?.date||selectedWorkoutDate||today()}catch(_){return''}}

function ensureDialog(){
 let d=q('#v163ActionDialog');if(d)return d;
 d=document.createElement('dialog');d.id='v163ActionDialog';
 d.innerHTML=`<div class="modal v163-modal"><button type="button" class="iconbtn close v163-close">✕</button><div class="v163-modal-head"><span>WORKOUT</span><h2></h2></div><div class="v163-actions"></div></div>`;
 document.body.appendChild(d);q('.v163-close',d).onclick=()=>d.close();return d;
}
function openChoice(title,actions){
 const d=ensureDialog();q('.v163-modal-head h2',d).textContent=title;const box=q('.v163-actions',d);box.innerHTML='';
 actions.forEach(a=>{const b=document.createElement('button');b.type='button';b.className=`${a.danger?'danger':'secondary'} v163-action`;b.innerHTML=`<strong>${esc(a.label)}</strong>${a.note?`<small>${esc(a.note)}</small>`:''}`;b.onclick=()=>{d.close();a.run?.()};box.appendChild(b)});d.showModal();
}

function sessionLayout(day){
 try{if(programId()==='busy_week'&&window.GymV165?.sessionLayout){const x=window.GymV165.sessionLayout(day);if(Array.isArray(x))return x}}catch(_){}
 try{if(typeof v124EnsureSessionLayout==='function')return v124EnsureSessionLayout(programId(),day)}catch(_){}
 state.programSessionLayouts=state.programSessionLayouts||{};state.programSessionLayouts[programId()]=state.programSessionLayouts[programId()]||{};
 return state.programSessionLayouts[programId()][day]=state.programSessionLayouts[programId()][day]||[];
}
function instanceSlot(instanceId){const p=String(instanceId||'').split(':');if(p[0]==='base')return p.slice(2).join(':');if(p[0]==='busy')return p.slice(2).join(':');return''}

function addPermanent(day,exerciseId){
 const x=exerciseObj(exerciseId);if(!x)return;
 const items=sessionLayout(day);
 if(items.some(i=>i.id===exerciseId)){toast(cs()?'Tento cvik už v session je.':'This exercise is already in this session.');return}
 const slotId=`custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
 items.push({slotId,id:exerciseId,sets:x.sets||3,range:x.range||'8–12'});
 if(programId()!=='busy_week'){try{ensureOrder(day)}catch(_){}}persist();try{renderDay(day)}catch(_){};toast(cs()?'Cvik byl přidán natrvalo do této session.':'Exercise added permanently to this session.');
}
function removePermanent(day,instanceId){
 const slotId=instanceSlot(instanceId);if(!slotId){
  try{if(String(instanceId).startsWith('extra:')&&typeof removeExtra==='function')return removeExtra(day,instanceId)}catch(_){}
  return;
 }
 const items=sessionLayout(day),idx=items.findIndex(i=>String(i.slotId||i.id)===slotId);if(idx<0)return;
 const item=items[idx];
 if(!confirm(cs()?`Odebrat ${exerciseLabel(item.id)} z této session i do budoucna?`:`Remove ${exerciseLabel(item.id)} from this session permanently?`))return;
 items.splice(idx,1);
 try{delete state.days?.[day]?.entries?.[instanceId];state.days[day].order=(state.days[day].order||[]).filter(id=>id!==instanceId);if(programId()!=='busy_week')ensureOrder(day)}catch(_){}
 persist();try{renderDay(day)}catch(_){};toast(cs()?'Cvik byl odebrán z této session.':'Exercise removed from this session.');
}

const nativeAdd=(()=>{try{return typeof addExercise==='function'?addExercise:null}catch(_){return null}})();
function scopedAdd(day,exerciseId){
 const x=exerciseObj(exerciseId);if(!x)return;
 try{q('#libraryDialog')?.close()}catch(_){}
 openChoice(exerciseLabel(exerciseId),[
  {label:cs()?'Jen dnes':'Today only',note:cs()?'Přidá se jen do tohoto workoutu.':'Only this workout.',run:()=>{if(nativeAdd)nativeAdd(day,exerciseId)}},
  {label:cs()?'Natrvalo do této session':'Keep in this session',note:cs()?'Bude tu i při příštím opakování této session.':'It stays for future repeats of this session.',run:()=>addPermanent(day,exerciseId)}
 ]);
}

function skipToday(day,instanceId){
 try{
  const e=entry(day,instanceId);clearExerciseEntry(e);e.skipped=true;e.done=true;
  if(state.activeWorkout){state.activeWorkout.awaitingFinish=false;state.activeWorkout.workoutReminderAt=0}
  try{clearWorkoutReminder()}catch(_){}persist();renderDay(day);toast(cs()?'Cvik zůstane pro dnešek označený jako vynechaný.':'Exercise marked skipped for today.');
 }catch(e){console.warn('[v163 skip]',e)}
}
function openCardMenu(day,instanceId){
 let inst=null;try{inst=dayInstances(day).find(x=>x.instanceId===instanceId)}catch(_){}
 if(!inst)return;let m=null;try{m=metaFor(day,inst)}catch(_){};const name=m?exerciseLabel(m.id):instanceId;
 openChoice(name,[
  {label:cs()?'Změnit cvik':'Change exercise',note:cs()?'Vybereš jiný cvik; existující volba rozsahu zůstane dostupná.':'Choose another exercise.',run:()=>{try{openLibrary(day,'replace',instanceId)}catch(_){}}},
  {label:cs()?'Přeskočit jen dnes':'Skip today',note:cs()?'Po dokončení zůstane v historii šedý.':'It will remain gray in today’s history.',run:()=>skipToday(day,instanceId)},
  {label:cs()?'Odebrat z této session':'Remove from session',note:cs()?'Zmizí i při příštím opakování této session.':'Removes it from future repeats too.',danger:true,run:()=>removePermanent(day,instanceId)}
 ]);
}

function decorateCards(day){
 const root=document.getElementById(day);if(!root||root.classList.contains('v153-history-mode'))return;
 qa('.modern-exercise-card[data-instance-id]',root).forEach(card=>{
  if(q('.v163-card-menu',card))return;const id=card.dataset.instanceId;
  const btn=document.createElement('button');btn.type='button';btn.className='v163-card-menu';btn.textContent='•••';btn.setAttribute('aria-label',cs()?'Upravit cvik':'Edit exercise');
  btn.onclick=ev=>{ev.preventDefault();ev.stopPropagation();openCardMenu(day,id)};card.appendChild(btn);
 });
}
function hookRender(){
 try{
  const native=window.renderDay||(typeof renderDay==='function'?renderDay:null);if(typeof native!=='function'||native.__v163)return;
  const f=function(day,...args){const r=native.call(this,day,...args);requestAnimationFrame(()=>decorateCards(day));return r};f.__v163=true;f.__native=native;renderDay=f;window.renderDay=f;
 }catch(_){}
}

function captureSnapshot(){
 try{
  const w=state?.activeWorkout;if(!w)return null;const day=w.day,date=w.date||state.days?.[day]?.date||workoutDate();
  const items=activeInstances(day).map((inst,index)=>{const m=metaFor(day,inst),e=entry(day,inst.instanceId);const completeSets=(e.sets||[]).filter(s=>s?._complete===true).map(({_complete,...set})=>({...set}));return {order:index,instanceId:inst.instanceId,exerciseId:m.id,skipped:!!e.skipped,done:!!e.done&&!e.skipped,sets:completeSets,minutes:e.minutes||'',speed:e.speed||'',incline:e.incline||'',setsTarget:m.sets||inst.sets||3,range:m.range||inst.range||'',category:m.category||'',guideThumb:m.guideThumb||''}});
  return {day,date,sessionKey:w.sessionKey||'',items};
 }catch(e){console.warn('[v163 snapshot capture]',e);return null}
}
function attachSnapshot(snap){
 if(!snap)return;try{
  const candidates=(state.workouts||[]).filter(w=>w&&w.type!=='cardio'&&w.date===snap.date&&(w.day===snap.day||!w.day));
  const workout=candidates.sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0];if(!workout)return;workout.exerciseSnapshot=snap.items;workout.exerciseSnapshotVersion=163;persist();
 }catch(e){console.warn('[v163 snapshot attach]',e)}
}
function wrapFinish(name){
 try{
  const native=window[name]||eval(`typeof ${name}==='function'?${name}:null`);if(typeof native!=='function'||native.__v163)return;
  const f=async function(...args){const snap=captureSnapshot();const r=await native.apply(this,args);attachSnapshot(snap);if(snap?.date)setTimeout(()=>window.GymV163?.renderHistorical?.(snap.date),0);return r};f.__v163=true;f.__native=native;try{eval(`${name}=f`)}catch(_){}window[name]=f;
 }catch(_){}
}

function formatSnapshot(item){
 if(item.skipped)return cs()?'Vynecháno':'Skipped';
 if(item.sets?.length)return item.sets.map(s=>s.kg!=null&&s.reps!=null?`${s.kg}×${s.reps}`:s.reps!=null?`${s.reps}×`:s.seconds!=null?`${s.seconds}s`:'').filter(Boolean).join(' / ');
 if(item.minutes)return `${item.minutes} min`;return cs()?'Bez záznamu':'No logged sets';
}
function snapshotCard(item){
 const x=exerciseObj(item.exerciseId)||{},thumb=item.guideThumb||x.guideThumb||x.guideImage||'',name=exerciseLabel(item.exerciseId),target=[item.range||x.range,item.category||(x.category||'')].filter(Boolean).join(' · '),skipped=!!item.skipped,done=!skipped&&!!item.done;
 return `<details class="preview-accordion modern-exercise-card ${skipped?'exercise-skipped v163-history-skipped':done?'exercise-done':'v163-history-incomplete'} v153-history-card" data-exercise-id="${esc(item.exerciseId)}"><summary class="exercise-summary"><span class="preview-card-number">${skipped?'–':done?'✓':'!'}</span>${thumb?`<img class="exercise-guide-thumb" src="${esc(thumb)}" alt="" loading="lazy">`:`<span class="v153-thumb-fallback">${skipped?'–':'✓'}</span>`}<span class="preview-card-main"><strong><span class="preview-card-name">${esc(name)}</span></strong>${target?`<small class="v153-target">${esc(target)}</small>`:''}<span class="v153-saved-performance">${esc(formatSnapshot(item))}</span><span class="exercise-set-status">${skipped?(cs()?'Vynecháno':'Skipped'):done?(cs()?'✓ Hotovo':'✓ Complete'):(cs()?'Nedokončeno':'Incomplete')}</span></span><span class="preview-card-chevron">›</span></summary></details>`;
}
const baseHistorical=window.GymV153?.renderHistorical?.bind(window.GymV153);
function renderHistorical(iso){
 let workout=null;try{workout=window.GymV153?.completedWorkout?.(iso)||(state.workouts||[]).filter(w=>w&&w.type!=='cardio'&&w.date===iso).sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]}catch(_){}
 if(!workout||!Array.isArray(workout.exerciseSnapshot)||!workout.exerciseSnapshot.length)return baseHistorical?baseHistorical(iso):false;
 try{selectedWorkoutDate=iso;calendarViewDate=iso;selectedTodayDay=workout.day;localStorage.setItem('gymSelectedWorkoutDate',iso);localStorage.setItem('gymTodayDay',workout.day)}catch(_){}
 const root=document.getElementById(workout.day);if(!root)return false;qa('.screen').forEach(el=>el.classList.toggle('active',el===root));root.classList.add('v153-history-mode');
 let section=q('.unified-exercise-list',root);if(!section){try{renderDay(workout.day)}catch(_){}section=q('.unified-exercise-list',root)}if(!section)return false;
 const items=workout.exerciseSnapshot.slice().sort((a,b)=>(a.order||0)-(b.order||0));section.innerHTML=`<div class="v120-exercise-heading"><h3>${items.length} ${cs()?'cviků':'exercises'}</h3><span>${cs()?'Výsledek dne':'Day result'}</span></div><div class="plan-preview-list today-preview-list v153-history-list">${items.map(snapshotCard).join('')}</div>`;
 qa('.v153-history-card',section).forEach(card=>card.addEventListener('click',ev=>{ev.preventDefault();try{openHistory(card.dataset.exerciseId)}catch(_){}}));return true;
}

function install(){
 try{addExercise=scopedAdd;window.addExercise=scopedAdd}catch(_){}
 hookRender();wrapFinish('saveFinishedWorkout');wrapFinish('autoFinalizeWorkout');
 if(window.GymV153)window.GymV153.renderHistorical=renderHistorical;
 V.renderHistorical=renderHistorical;V.openCardMenu=openCardMenu;V.decorateCards=decorateCards;
 try{decorateCards(selectedTodayDay||state?.activeWorkout?.day||'monday')}catch(_){}
}
window.GymV163=V;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
