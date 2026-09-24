/* Gym Tracker v166: consolidated runtime foundation
   - one silent rest timer loop
   - one completed-day router
   - legacy skipped-history reconstruction
   - lightweight set-delete UI hook
*/
(()=>{
'use strict';

const V={release:'v166'};
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const todayIso=()=>{try{return typeof today==='function'?today():new Date().toISOString().slice(0,10)}catch(_){return new Date().toISOString().slice(0,10)}};
const validIso=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));

/* ---------- history / calendar ---------- */
function completedWorkout(iso){
  try{
    return (state?.workouts||[])
      .filter(w=>w&&w.type!=='cardio'&&w.date===iso)
      .sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]||null;
  }catch(_){return null}
}
function recordsFor(workout){
  if(!workout)return[];
  const out=[];
  try{
    Object.entries(state?.history||{}).forEach(([exerciseId,items])=>{
      (items||[]).forEach(record=>{
        const sameSession=!!(workout.sessionKey&&record.sessionKey&&record.sessionKey===workout.sessionKey);
        const sameDateDay=record.date===workout.date&&(!workout.day||!record.day||record.day===workout.day);
        if(sameSession||sameDateDay)out.push({...record,exerciseId:record.exerciseId||exerciseId});
      });
    });
  }catch(_){}
  return out;
}
function ex(id){try{return EX?.[id]||null}catch(_){return null}}
function label(id){
  const x=ex(id);
  try{return x&&typeof itemName==='function'?itemName(x):(x?.[cs()?'cs':'en']||x?.en||x?.cs||id)}
  catch(_){return x?.en||x?.cs||id}
}
function categoryText(x){
  try{return x&&typeof categoryName==='function'?categoryName(x.category):String(x?.category||'')}
  catch(_){return String(x?.category||'')}
}
function baseItems(workout){
  const pid=workout?.programId||'balanced',day=workout?.day;
  let items=[];
  try{
    const saved=state?.programSessionLayouts?.[pid]?.[day];
    if(Array.isArray(saved)&&saved.length)items=saved.map(x=>({...x}));
  }catch(_){}
  if(!items.length){
    try{items=(PLAN_PRESETS?.[pid]?.plans?.[day]?.items||[]).map(x=>({...x}))}catch(_){}
  }
  if(!items.length){
    try{items=(BASE_PLANS?.[day]?.items||[]).map(x=>({...x}))}catch(_){}
  }
  return items.filter(x=>x?.id&&ex(x.id));
}
function recordSummary(r){
  if(Array.isArray(r?.sets)&&r.sets.length){
    const simple=r.sets.map(s=>{
      if(s.kg!=null&&s.reps!=null)return `${s.kg}×${s.reps}`;
      if(s.reps!=null)return `${s.reps}×`;
      if(s.seconds!=null)return `${s.seconds}s`;
      if(s.leftSeconds!=null||s.rightSeconds!=null)return `L ${s.leftSeconds||'–'}s / ${cs()?'P':'R'} ${s.rightSeconds||'–'}s`;
      if(s.left!=null||s.right!=null)return `${s.kg||'–'} kg · L ${s.left||'–'} / ${cs()?'P':'R'} ${s.right||'–'}`;
      return '';
    }).filter(Boolean).join(' / ');
    if(simple)return simple;
  }
  try{if(typeof formatRecord==='function')return formatRecord(r)}catch(_){}
  return r?.minutes?`${r.minutes} min`:'';
}
function reconstructedItems(workout){
  if(Array.isArray(workout?.exerciseSnapshot)&&workout.exerciseSnapshot.length)return workout.exerciseSnapshot.slice();
  const recs=recordsFor(workout),used=new Set(),out=[];
  baseItems(workout).forEach((item,index)=>{
    const ri=recs.findIndex((r,i)=>!used.has(i)&&String(r.exerciseId||'')===String(item.id));
    const x=ex(item.id)||{};
    if(ri>=0){
      used.add(ri);
      const r=recs[ri];
      out.push({
        order:index,exerciseId:item.id,skipped:false,done:true,
        sets:Array.isArray(r.sets)?r.sets:[],minutes:r.minutes||'',speed:r.speed||'',incline:r.incline||'',
        range:item.range||x.range||'',category:x.category||'',guideThumb:x.guideThumb||x.guideImage||''
      });
    }else{
      out.push({
        order:index,exerciseId:item.id,skipped:true,done:false,sets:[],minutes:'',
        range:item.range||x.range||'',category:x.category||'',guideThumb:x.guideThumb||x.guideImage||''
      });
    }
  });
  recs.forEach((r,i)=>{
    if(used.has(i))return;
    const x=ex(r.exerciseId)||{};
    out.push({
      order:out.length,exerciseId:r.exerciseId,skipped:false,done:true,
      sets:Array.isArray(r.sets)?r.sets:[],minutes:r.minutes||'',speed:r.speed||'',incline:r.incline||'',
      range:x.range||'',category:x.category||'',guideThumb:x.guideThumb||x.guideImage||''
    });
  });
  return out;
}
function historyCard(item){
  const x=ex(item.exerciseId)||{};
  const thumb=item.guideThumb||x.guideThumb||x.guideImage||'';
  const target=[item.range||x.range,categoryText(x)].filter(Boolean).join(' · ');
  const skipped=!!item.skipped,done=!skipped&&!!item.done;
  const saved=skipped?(cs()?'Vynecháno':'Skipped'):recordSummary(item);
  return `<details class="preview-accordion modern-exercise-card ${skipped?'exercise-skipped v163-history-skipped':done?'exercise-done':'v163-history-incomplete'} v153-history-card" data-exercise-id="${esc(item.exerciseId)}">
    <summary class="exercise-summary">
      <span class="preview-card-number">${skipped?'–':done?'✓':'!'}</span>
      ${thumb?`<img class="exercise-guide-thumb" src="${esc(thumb)}" alt="" loading="lazy">`:`<span class="v153-thumb-fallback">${skipped?'–':'✓'}</span>`}
      <span class="preview-card-main">
        <strong><span class="preview-card-name">${esc(label(item.exerciseId))}</span></strong>
        ${target?`<small class="v153-target">${esc(target)}</small>`:''}
        ${saved?`<span class="v153-saved-performance">${esc(saved)}</span>`:''}
        <span class="exercise-set-status">${skipped?(cs()?'Vynecháno':'Skipped'):done?(cs()?'✓ Hotovo':'✓ Complete'):(cs()?'Nedokončeno':'Incomplete')}</span>
      </span>
      <span class="preview-card-chevron">›</span>
    </summary>
  </details>`;
}
function sessionTitle(workout){
  try{
    if(workout?.programId==='busy_week'&&window.GymV165?.busySession){
      const s=window.GymV165.busySession(Number(workout.programSessionIndex)||0);
      if(s)return cs()?s.titleCs:s.titleEn;
    }
    const plan=PLAN_PRESETS?.[workout?.programId]?.plans?.[workout?.day];
    return plan?.[cs()?'title_cs':'title_en']||plan?.title_en||({monday:'Strength',wednesday:'Stability',friday:'Control'}[workout?.day]||'Workout');
  }catch(_){return 'Workout'}
}
function renderHistorical(iso){
  const workout=completedWorkout(iso);if(!workout)return false;
  const items=reconstructedItems(workout).sort((a,b)=>(a.order||0)-(b.order||0));if(!items.length)return false;
  try{
    selectedWorkoutDate=iso;calendarViewDate=iso;selectedTodayDay=workout.day;
    localStorage.setItem('gymSelectedWorkoutDate',iso);localStorage.setItem('gymTodayDay',workout.day);
  }catch(_){}
  try{q('#calendarDayDialog')?.close()}catch(_){}
  const root=document.getElementById(workout.day);if(!root)return false;
  qa('.screen').forEach(el=>el.classList.toggle('active',el===root));
  root.classList.add('v153-history-mode');
  let section=q('.unified-exercise-list',root);
  if(!section){try{renderDay(workout.day)}catch(_){}section=q('.unified-exercise-list',root)}
  if(!section)return false;
  section.innerHTML=`<div class="v120-exercise-heading"><h3>${items.length} ${cs()?'cviků':'exercises'}</h3><span>${cs()?'Výsledek dne':'Day result'}</span></div><div class="plan-preview-list today-preview-list v153-history-list">${items.map(historyCard).join('')}</div>`;
  qa('.v153-history-card',section).forEach(card=>card.addEventListener('click',ev=>{
    ev.preventDefault();try{openHistory(card.dataset.exerciseId)}catch(_){}
  }));
  const title=sessionTitle(workout);
  const heroTitle=q('.workout-hero h2',root);if(heroTitle)heroTitle.textContent=title.replace(/^[^A-Za-zÀ-ž0-9]+\s*/,'');
  const sessionStrong=q('.v137-session-control strong',root);if(sessionStrong)sessionStrong.textContent=`✓ ${title}`;
  const sessionSource=q('.v137-session-control em',root);if(sessionSource)sessionSource.textContent=cs()?`Dokončeno ${iso}`:`Completed ${iso}`;
  qa('.v129-completed-tools,.history-based-recommendation,.v136-recommendation,.recommendation-card',root).forEach(el=>el.style.display='none');
  try{window.scrollTo({top:0,left:0,behavior:'auto'})}catch(_){}
  return true;
}
function clearHistorical(){qa('.v153-history-mode').forEach(root=>root.classList.remove('v153-history-mode'))}

const nativeSelect=(()=>{try{return typeof selectScheduleDate==='function'?selectScheduleDate:null}catch(_){return null}})();
const nativeCalendar=(()=>{try{return typeof v124OpenCalendarDay==='function'?v124OpenCalendarDay:null}catch(_){return null}})();
const nativeToday=(()=>{try{return typeof goToTodayDate==='function'?goToTodayDate:null}catch(_){return null}})();

function routeDate(iso,...args){
  const date=String(iso||'');if(!validIso(date))return;
  if(!state?.activeWorkout&&completedWorkout(date))return renderHistorical(date);
  clearHistorical();
  if(typeof nativeSelect==='function')return nativeSelect.call(this,date,...args);
  if(typeof nativeCalendar==='function')return nativeCalendar.call(this,date,...args);
}
function todayRoute(...args){
  const date=todayIso();
  if(!state?.activeWorkout&&completedWorkout(date))return renderHistorical(date);
  clearHistorical();
  return typeof nativeToday==='function'?nativeToday.apply(this,args):routeDate(date);
}
function restoreSelectedCompleted(){
  try{
    if(state?.activeWorkout)return;
    const selected=String(selectedWorkoutDate||localStorage.getItem('gymSelectedWorkoutDate')||todayIso());
    if(completedWorkout(selected))renderHistorical(selected);
  }catch(_){}
}

/* ---------- saved-set delete button ---------- */
function enhanceDeleteButtons(){
  qa('.saved-set-row').forEach((row,rowIndex)=>{
    if(q('.v143-left-delete',row))return;
    const number=q('.saved-set-number',row);if(!number)return;
    const parsed=parseInt(String(number.textContent||'').trim(),10);
    const setIndex=Number.isFinite(parsed)?Math.max(0,parsed-1):rowIndex;
    q('.saved-set-actions .delete-set-btn',row)?.remove();
    const btn=document.createElement('button');
    btn.type='button';btn.className='v143-left-delete';btn.textContent='×';
    btn.setAttribute('aria-label',cs()?'Smazat sérii':'Delete set');
    btn.addEventListener('click',ev=>{
      ev.preventDefault();ev.stopPropagation();
      try{if(typeof deleteSavedSet==='function')deleteSavedSet(setIndex)}catch(_){}
    });
    number.replaceWith(btn);
  });
}
function hookAfter(name,fn){
  try{
    const native=window[name]||eval(`typeof ${name}==='function'?${name}:null`);
    if(typeof native!=='function'||native.__v166After)return;
    const wrapped=function(...args){const r=native.apply(this,args);requestAnimationFrame(fn);return r};
    wrapped.__v166After=true;wrapped.__native=native;
    try{eval(`${name}=wrapped`)}catch(_){}
    window[name]=wrapped;
  }catch(_){}
}

/* ---------- silent rest timer: one loop ---------- */
const REST_KEY='gymV166RestPending';
let restTick=null,lastPulseAt=0,lastReminder=0,finalVibratedFor=0;

function pendingRest(){try{const x=JSON.parse(localStorage.getItem(REST_KEY)||'null');return x&&Number(x.end)>0?x:null}catch(_){return null}}
function writePending(x){try{x?localStorage.setItem(REST_KEY,JSON.stringify(x)):localStorage.removeItem(REST_KEY)}catch(_){}}
function runningRest(){
  try{
    const w=state?.activeWorkout,end=Number(w?.restEndAt)||0;
    return w&&end>Date.now()?{w,end,left:end-Date.now()}:null;
  }catch(_){return null}
}
function captureRest(){
  const r=runningRest();if(!r)return;
  const cur=pendingRest();
  if(!cur||Number(cur.end)!==r.end)writePending({end:r.end,exercise:String(r.w.restExercise||'')});
}
function finishedRest(){const p=pendingRest();return p&&Date.now()>=Number(p.end)?p:null}
function fmtMs(ms){const total=Math.max(0,Math.ceil(ms/1000)),m=Math.floor(total/60),s=total%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
function ensureRestMini(){
  let el=document.getElementById('v133GlobalRest');if(el)return el;
  el=document.createElement('button');el.id='v133GlobalRest';el.type='button';el.className='v133-global-rest';
  el.innerHTML='<span class="v133-global-rest-label"></span><strong class="v133-global-rest-time">00:00</strong><span class="v133-global-rest-arrow">›</span>';
  document.body.appendChild(el);return el;
}
function topDialog(){const open=qa('dialog[open]').filter(d=>d.id!=='finishDialog');return open.length?open[open.length-1]:null}
function placeRestMini(el){const d=topDialog();if(d){if(el.parentElement!==d)d.appendChild(el);el.classList.add('in-dialog')}else{if(el.parentElement!==document.body)document.body.appendChild(el);el.classList.remove('in-dialog')}}
function flashRest(on,leftMs=5000){
  const interval=Math.max(160,Math.round(760-(590*Math.max(0,Math.min(1,(5000-leftMs)/5000)))));
  [document.getElementById('v133GlobalRest'),document.getElementById('restOverlay')].filter(Boolean).forEach(el=>{
    el.classList.toggle('v134-alarm-flash',on);
    if(on)el.style.setProperty('--v134-flash-ms',`${interval}ms`);else el.style.removeProperty('--v134-flash-ms');
  });
}
function clearRestDecor(){
  document.getElementById('v133GlobalRest')?.classList.remove('v135-finished');
  document.getElementById('restOverlay')?.classList.remove('v135-rest-finished');
  flashRest(false);
}
function returnToWorkout(){
  qa('dialog[open]').forEach(d=>{try{d.close()}catch(_){}});
  try{if(typeof openLiveWorkout==='function')openLiveWorkout();else document.getElementById('liveOverlay')?.classList.add('show')}catch(_){}
  if(runningRest()){
    document.getElementById('restOverlay')?.classList.add('show');
    try{if(typeof updateRest==='function')updateRest()}catch(_){}
  }
}
function acknowledgeRest(returnWorkout=true){
  writePending(null);clearRestDecor();lastReminder=0;finalVibratedFor=0;
  try{if(typeof stopPostRestAlarm==='function')stopPostRestAlarm()}catch(_){}
  if(returnWorkout)returnToWorkout();
}
function updateRestMini(){
  captureRest();
  const el=ensureRestMini();placeRestMini(el);
  const r=runningRest(),overlay=document.getElementById('restOverlay'),dialogOpen=!!topDialog();
  if(r){
    el.classList.remove('v135-finished');
    const time=q('.v133-global-rest-time',el),labelEl=q('.v133-global-rest-label',el);
    if(time)time.textContent=fmtMs(r.left);
    if(labelEl)labelEl.textContent=cs()?'ODPOČINEK':'REST';
    const largeVisible=!!overlay?.classList?.contains('show');
    el.classList.toggle('show',!(largeVisible&&!dialogOpen));
    el.setAttribute('aria-hidden',largeVisible&&!dialogOpen?'true':'false');
    if(r.left<=5000){
      flashRest(true,r.left);
      const now=performance.now(),gap=Math.max(160,Math.round(760-(590*Math.max(0,Math.min(1,(5000-r.left)/5000)))));
      if(!lastPulseAt||now-lastPulseAt>=gap){lastPulseAt=now;try{navigator.vibrate?.(r.left<1000?100:45)}catch(_){}}
    }else{flashRest(false);lastPulseAt=0}
    return;
  }
  flashRest(false);lastPulseAt=0;
  const p=finishedRest();
  if(!p){el.classList.remove('show','v135-finished');el.setAttribute('aria-hidden','true');clearRestDecor();return}
  el.classList.add('show','v135-finished');el.setAttribute('aria-hidden','false');
  const time=q('.v133-global-rest-time',el),labelEl=q('.v133-global-rest-label',el);
  if(time)time.textContent='00:00';if(labelEl)labelEl.textContent=cs()?'PAUZA HOTOVÁ':'REST DONE';
  overlay?.classList.add('v135-rest-finished');const rt=document.getElementById('restTime');if(rt)rt.textContent='00:00';
  const id=Number(p.end);
  if(finalVibratedFor!==id){finalVibratedFor=id;lastReminder=Date.now();try{navigator.vibrate?.([160,80,160,80,260])}catch(_){}}
  else if(Date.now()-lastReminder>=8000){lastReminder=Date.now();try{navigator.vibrate?.([90,55,130])}catch(_){}}
}
function wrapRest(name,before,after){
  try{
    const native=window[name]||eval(`typeof ${name}==='function'?${name}:null`);
    if(typeof native!=='function'||native.__v166Rest)return;
    const f=function(...args){before?.(...args);const r=native.apply(this,args);after?.(...args);return r};
    f.__v166Rest=true;f.__native=native;
    try{eval(`${name}=f`)}catch(_){}
    window[name]=f;
  }catch(_){}
}
function installRest(){
  ensureRestMini();
  wrapRest('startRest',()=>{writePending(null);clearRestDecor()},()=>captureRest());
  wrapRest('extendRest',null,()=>captureRest());
  wrapRest('skipRest',()=>acknowledgeRest(false));
  wrapRest('returnFromRest',()=>acknowledgeRest(false));
  document.addEventListener('click',ev=>{
    const mini=ev.target?.closest?.('#v133GlobalRest');if(!mini)return;
    ev.preventDefault();ev.stopImmediatePropagation();
    if(finishedRest())acknowledgeRest(true);else returnToWorkout();
  },true);
  clearInterval(restTick);restTick=setInterval(updateRestMini,250);
  updateRestMini();
}

/* ---------- install ---------- */
function install(){
  try{selectScheduleDate=routeDate;window.selectScheduleDate=routeDate}catch(_){}
  try{v124OpenCalendarDay=routeDate;window.v124OpenCalendarDay=routeDate}catch(_){}
  try{goToTodayDate=todayRoute;window.goToTodayDate=todayRoute}catch(_){}
  ['renderLive','openHistory','renderDay'].forEach(name=>hookAfter(name,enhanceDeleteButtons));
  enhanceDeleteButtons();
  installRest();
  [80,350,900].forEach(ms=>setTimeout(restoreSelectedCompleted,ms));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){setTimeout(restoreSelectedCompleted,50);updateRestMini()}});
}
window.GymV153={release:'v166-compat',completedWorkout,recordsFor,renderHistorical,clearHistorical};
V.completedWorkout=completedWorkout;V.recordsFor=recordsFor;V.renderHistorical=renderHistorical;V.routeDate=routeDate;V.updateRest=updateRestMini;
V.diagnostics=()=>({release:V.release,active:!!state?.activeWorkout,selected:(()=>{try{return selectedWorkoutDate}catch(_){return''}})(),restPending:pendingRest(),timerLoops:1});
window.GymV166=V;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();