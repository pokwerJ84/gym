/* Gym Tracker v154: calendar past logging + future planning */
(()=>{
'use strict';
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const todayIso=()=>{try{return typeof today==='function'?today():new Date().toISOString().slice(0,10)}catch(_){return new Date().toISOString().slice(0,10)}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=msg=>{try{if(typeof showToast==='function')showToast(msg)}catch(_){}};

function allExercises(){try{if(Array.isArray(LIBRARY)&&LIBRARY.length)return LIBRARY}catch(_){}try{return Object.values(EX||{})}catch(_){return []}}
function exerciseName(x){try{return typeof itemName==='function'?itemName(x):(cs()?x.cs:x.en)||x.en||x.cs||x.id}catch(_){return x?.en||x?.cs||x?.id||''}}
function completedWorkout(iso){try{return window.GymV153?.completedWorkout?.(iso)||(state?.workouts||[]).filter(w=>w&&w.type!=='cardio'&&w.date===iso).sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]||null}catch(_){return null}}
function ensureState(){state.history=state.history||{};state.workouts=Array.isArray(state.workouts)?state.workouts:[]}
function persist(){try{saveState()}catch(_){}try{if(typeof saveCloud==='function')saveCloud()}catch(_){} }

function ensurePastRoot(iso){
  let workout=completedWorkout(iso);
  const day=workout?.day||'monday';
  try{selectedWorkoutDate=iso;calendarViewDate=iso;selectedTodayDay=day;localStorage.setItem('gymSelectedWorkoutDate',iso);localStorage.setItem('gymTodayDay',day)}catch(_){}
  let root=document.getElementById(day);
  if(!root)return null;
  try{if(typeof renderDay==='function')renderDay(day)}catch(_){}
  qa('.screen').forEach(el=>el.classList.toggle('active',el===root));
  return {root,day,workout};
}
function addPastControls(root,iso){
  const section=q('.unified-exercise-list',root);if(!section)return;
  let tools=q('.v154-past-tools',section);
  if(!tools){
    tools=document.createElement('div');tools.className='v154-past-tools';
    tools.innerHTML=`<button type="button" class="primary v154-add-past">＋ ${cs()?'Přidat cvik':'Add exercise'}</button><span>${cs()?'Můžeš zpětně doplnit cviky a série.':'You can add exercises and sets to this past day.'}</span>`;
    section.prepend(tools);
  }
  q('.v154-add-past',tools).onclick=()=>openPastLogDialog(iso);
}
function renderPastDate(iso){
  const workout=completedWorkout(iso);
  if(workout&&window.GymV153?.renderHistorical){
    window.GymV153.renderHistorical(iso);
    requestAnimationFrame(()=>{const root=document.getElementById(workout.day);if(root)addPastControls(root,iso)});
    return true;
  }
  const ctx=ensurePastRoot(iso);if(!ctx)return false;
  const {root}=ctx;root.classList.add('v154-past-empty');
  const section=q('.unified-exercise-list',root);if(!section)return false;
  section.innerHTML=`<div class="v120-exercise-heading"><h3>${cs()?'Žádné zapsané cviky':'No logged exercises'}</h3><span>${iso}</span></div><div class="v154-empty-past">${cs()?'Tento den zatím nemá workout. Můžeš ho doplnit ručně.':'This day has no workout yet. You can add it manually.'}</div>`;
  addPastControls(root,iso);
  try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(_){}
  return true;
}

let editDate='',selectedExercise='';
function ensureLogDialog(){
  let d=q('#v154PastLogDialog');if(d)return d;
  d=document.createElement('dialog');d.id='v154PastLogDialog';
  d.innerHTML=`<div class="modal v154-log-modal"><button type="button" class="iconbtn close v154-close">✕</button><div class="v154-log-head"><span>${cs()?'DOPLNIT MINULÝ DEN':'LOG PAST WORKOUT'}</span><h2>${cs()?'Přidat cvik':'Add exercise'}</h2></div><input class="v154-search" type="search" placeholder="${cs()?'Hledat cvik…':'Search exercise…'}"><div class="v154-exercises"></div><div class="v154-selected"></div><div class="v154-sets"></div><button type="button" class="secondary v154-add-set">＋ ${cs()?'Přidat sérii':'Add set'}</button><div class="v154-actions"><button type="button" class="secondary v154-cancel">${cs()?'Zrušit':'Cancel'}</button><button type="button" class="primary v154-save">${cs()?'Uložit':'Save'}</button></div></div>`;
  document.body.appendChild(d);
  q('.v154-close',d).onclick=()=>d.close();q('.v154-cancel',d).onclick=()=>d.close();
  q('.v154-add-set',d).onclick=()=>addSetRow(d);
  q('.v154-save',d).onclick=savePastExercise;
  return d;
}
function renderExerciseList(filter=''){
  const d=ensureLogDialog(),list=q('.v154-exercises',d),needle=String(filter||'').trim().toLowerCase();
  const items=allExercises().filter(x=>!needle||`${x.id} ${x.cs||''} ${x.en||''} ${x.category||''}`.toLowerCase().includes(needle)).slice(0,80);
  list.innerHTML=items.map(x=>`<button type="button" class="v154-ex-pick ${selectedExercise===x.id?'selected':''}" data-id="${esc(x.id)}">${esc(exerciseName(x))}</button>`).join('')||`<div class="empty">${cs()?'Nic nenalezeno':'Nothing found'}</div>`;
  qa('.v154-ex-pick',list).forEach(btn=>btn.onclick=()=>{selectedExercise=btn.dataset.id;renderExerciseList(q('.v154-search',d).value);renderSelected(d)});
}
function renderSelected(d){
  const x=allExercises().find(e=>e.id===selectedExercise);q('.v154-selected',d).innerHTML=x?`<strong>${esc(exerciseName(x))}</strong>`:'';
}
function addSetRow(d,kg='',reps=''){
  const box=q('.v154-sets',d),row=document.createElement('div');row.className='v154-set-row';
  row.innerHTML=`<label><span>KG</span><input class="v154-kg" inputmode="decimal" type="number" step="0.5" min="0" value="${esc(kg)}"></label><label><span>${cs()?'OPAK.':'REPS'}</span><input class="v154-reps" inputmode="numeric" type="number" step="1" min="0" value="${esc(reps)}"></label><button type="button" class="v154-remove-set">×</button>`;
  q('.v154-remove-set',row).onclick=()=>row.remove();box.appendChild(row);
}
function openPastLogDialog(iso){
  editDate=iso;selectedExercise='';const d=ensureLogDialog();const search=q('.v154-search',d);search.value='';q('.v154-sets',d).innerHTML='';addSetRow(d);addSetRow(d);addSetRow(d);renderExerciseList();renderSelected(d);search.oninput=()=>renderExerciseList(search.value);d.showModal();
}
function ensureManualWorkout(iso){
  ensureState();let w=completedWorkout(iso);if(w)return w;
  w={type:'strength',date:iso,day:'monday',programId:'manual',programTitle:cs()?'Ruční workout':'Manual workout',sessionKey:`manual:${iso}:${Date.now()}`,savedAt:Date.now()};state.workouts.push(w);return w;
}
function savePastExercise(){
  const d=ensureLogDialog();if(!editDate||!selectedExercise){toast(cs()?'Vyber cvik':'Choose an exercise');return}
  const sets=qa('.v154-set-row',d).map(row=>{const kg=q('.v154-kg',row).value,reps=q('.v154-reps',row).value;return {kg:kg===''?null:Number(kg),reps:reps===''?null:Number(reps)}}).filter(s=>s.kg!=null||s.reps!=null);
  if(!sets.length){toast(cs()?'Zadej alespoň jednu sérii':'Enter at least one set');return}
  ensureState();const workout=ensureManualWorkout(editDate);const list=state.history[selectedExercise]=Array.isArray(state.history[selectedExercise])?state.history[selectedExercise]:[];
  const record={exerciseId:selectedExercise,date:editDate,day:workout.day,sessionKey:workout.sessionKey,sets,savedAt:Date.now()};
  const idx=list.findIndex(r=>r&&r.date===editDate&&r.sessionKey===workout.sessionKey&&String(r.exerciseId||selectedExercise)===selectedExercise);
  if(idx>=0)list[idx]=record;else list.push(record);
  workout.savedAt=Date.now();persist();d.close();renderPastDate(editDate);toast(cs()?'Cvik uložen ✓':'Exercise saved ✓');
}

const nativeSelect=(()=>{try{return typeof selectScheduleDate==='function'?selectScheduleDate:null}catch(_){return null}})();
const nativeCalendar=(()=>{try{return typeof v124OpenCalendarDay==='function'?v124OpenCalendarDay:null}catch(_){return null}})();
function openFuture(iso){
  try{window.GymV153?.clearHistorical?.()}catch(_){}
  let result;try{result=nativeSelect?nativeSelect.call(this,iso):undefined}catch(_){}
  setTimeout(()=>{
    const root=q('.screen.active');
    if(!root)return;
    let bar=q('.v154-future-tools',root);
    if(!bar){bar=document.createElement('div');bar.className='v154-future-tools';bar.innerHTML=`<button type="button" class="primary v154-custom">＋ ${cs()?'Naplánovat vlastní workout':'Plan custom workout'}</button>`;const section=q('.unified-exercise-list',root);(section||root).prepend(bar)}
    q('.v154-custom',bar).onclick=()=>{try{window.GymV130?.openCustomDialog?.(iso)}catch(_){}};
  },50);
  return result;
}
function routeDate(iso,...args){
  const date=String(iso||'');if(!date)return;
  const t=todayIso();
  if(date<t)return renderPastDate(date);
  if(date>t)return openFuture(date);
  try{window.GymV153?.clearHistorical?.()}catch(_){}
  return nativeSelect?nativeSelect.call(this,date,...args):(nativeCalendar?nativeCalendar.call(this,date,...args):undefined);
}
function install(){
  try{selectScheduleDate=routeDate;window.selectScheduleDate=routeDate}catch(_){}
  try{v124OpenCalendarDay=routeDate;window.v124OpenCalendarDay=routeDate}catch(_){}
}
window.GymV154={release:'v154',renderPastDate,openPastLogDialog,savePastExercise,openFuture,routeDate};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
