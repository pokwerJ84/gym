/* Gym Tracker v159: consolidated completed-day routing + lightweight UI hooks */
(()=>{
'use strict';
const V={release:'v159'};
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const todayIso=()=>{try{return typeof today==='function'?today():new Date().toISOString().slice(0,10)}catch(_){return new Date().toISOString().slice(0,10)}};
const validIso=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));

function completedWorkout(iso){
  try{
    if(window.GymV153?.completedWorkout)return window.GymV153.completedWorkout(iso);
    return (state?.workouts||[]).filter(w=>w&&w.type!=='cardio'&&w.date===iso).sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]||null;
  }catch(_){return null}
}
function activeDate(){
  try{const w=state?.activeWorkout;return w?.date||state?.days?.[w?.day]?.date||todayIso()}catch(_){return todayIso()}
}
function showCompleted(iso){
  const date=String(iso||'');
  if(!validIso(date)||state?.activeWorkout||!completedWorkout(date))return false;
  try{selectedWorkoutDate=date;calendarViewDate=date;localStorage.setItem('gymSelectedWorkoutDate',date)}catch(_){}
  try{return !!window.GymV153?.renderHistorical?.(date)}catch(e){console.warn('[v159 completed render]',e);return false}
}
V.showCompleted=showCompleted;

function installCalendarRouter(){
  const nativeSelect=(()=>{try{return typeof selectScheduleDate==='function'?selectScheduleDate:null}catch(_){return null}})();
  const nativeCalendar=(()=>{try{return typeof v124OpenCalendarDay==='function'?v124OpenCalendarDay:null}catch(_){return null}})();
  const nativeToday=(()=>{try{return typeof goToTodayDate==='function'?goToTodayDate:null}catch(_){return null}})();

  const route=function(iso,...args){
    const date=String(iso||'');
    if(validIso(date)&&!state?.activeWorkout&&completedWorkout(date))return showCompleted(date);
    if(typeof nativeSelect==='function')return nativeSelect.call(this,date,...args);
    if(typeof nativeCalendar==='function')return nativeCalendar.call(this,date,...args);
  };
  route.__v159=true;
  try{selectScheduleDate=route;window.selectScheduleDate=route}catch(_){}
  try{v124OpenCalendarDay=route;window.v124OpenCalendarDay=route}catch(_){}

  if(typeof nativeToday==='function'){
    const todayRoute=function(...args){
      const date=todayIso();
      if(!state?.activeWorkout&&completedWorkout(date))return showCompleted(date);
      return nativeToday.apply(this,args);
    };
    todayRoute.__v159=true;todayRoute.__native=nativeToday;
    try{goToTodayDate=todayRoute;window.goToTodayDate=todayRoute}catch(_){}
  }
}

function wrapFinish(name){
  try{
    const native=window[name]||eval(`typeof ${name}==='function'?${name}:null`);
    if(typeof native!=='function'||native.__v159)return;
    const wrapped=async function(...args){
      const date=activeDate();
      const result=await native.apply(this,args);
      if(completedWorkout(date)){
        showCompleted(date);
        requestAnimationFrame(()=>showCompleted(date));
      }
      return result;
    };
    wrapped.__v159=true;wrapped.__native=native;
    try{eval(`${name}=wrapped`)}catch(_){}
    window[name]=wrapped;
  }catch(e){console.warn('[v159 finish hook]',name,e)}
}

function enhanceDeleteButtons(){
  qa('.saved-set-row').forEach((row,rowIndex)=>{
    if(q('.v143-left-delete',row))return;
    const number=q('.saved-set-number',row);
    if(!number)return;
    const raw=String(number.textContent||'').trim();
    const parsed=parseInt(raw,10);
    const setIndex=Number.isFinite(parsed)?Math.max(0,parsed-1):rowIndex;
    q('.saved-set-actions .delete-set-btn',row)?.remove();
    const btn=document.createElement('button');
    btn.type='button';btn.className='v143-left-delete';btn.textContent='×';
    btn.setAttribute('aria-label',cs()?'Smazat sérii':'Delete set');
    btn.setAttribute('title',cs()?'Smazat sérii':'Delete set');
    btn.addEventListener('click',ev=>{
      ev.preventDefault();ev.stopPropagation();
      try{if(typeof deleteSavedSet==='function')deleteSavedSet(setIndex)}catch(e){console.warn('[v159 delete set]',e)}
    });
    number.replaceWith(btn);
  });
}
V.enhanceDeleteButtons=enhanceDeleteButtons;

function hookAfter(name,fn){
  try{
    const native=window[name]||eval(`typeof ${name}==='function'?${name}:null`);
    if(typeof native!=='function'||native.__v159After)return;
    const wrapped=function(...args){
      const result=native.apply(this,args);
      requestAnimationFrame(fn);
      return result;
    };
    wrapped.__v159After=true;wrapped.__native=native;
    try{eval(`${name}=wrapped`)}catch(_){}
    window[name]=wrapped;
  }catch(_){}
}

function restoreSelectedCompleted(){
  try{
    if(state?.activeWorkout)return;
    const selected=String(selectedWorkoutDate||localStorage.getItem('gymSelectedWorkoutDate')||todayIso());
    if(completedWorkout(selected))showCompleted(selected);
  }catch(_){}
}

function install(){
  installCalendarRouter();
  wrapFinish('saveFinishedWorkout');
  wrapFinish('autoFinalizeWorkout');
  ['renderLive','openHistory','renderDay'].forEach(name=>hookAfter(name,enhanceDeleteButtons));
  enhanceDeleteButtons();
  [80,350,900].forEach(ms=>setTimeout(restoreSelectedCompleted,ms));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(restoreSelectedCompleted,50)});
}

V.diagnostics=()=>({
  release:V.release,
  today:todayIso(),
  selected:(()=>{try{return selectedWorkoutDate}catch(_){return ''}})(),
  selectedCompleted:!!completedWorkout((()=>{try{return selectedWorkoutDate}catch(_){return ''}})()),
  todayCompleted:!!completedWorkout(todayIso()),
  active:!!state?.activeWorkout,
  deleteButtons:qa('.v143-left-delete').length,
  observersRemoved:true
});
window.GymV159=V;window.gymV159Diagnostics=V.diagnostics;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
