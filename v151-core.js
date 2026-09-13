/* Gym Tracker v151: completed calendar dates always open normal green workout cards */
(()=>{
'use strict';
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
let openingHistorical=false;
let lastHistoricalIso='';

function completedWorkout(iso){
  try{return (state?.workouts||[]).filter(w=>w&&w.type!=='cardio'&&w.date===iso).sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]||null}catch(_){return null}
}
function openHistorical(iso){
  const workout=completedWorkout(iso);if(!workout)return false;
  lastHistoricalIso=iso;
  if(openingHistorical)return true;
  openingHistorical=true;
  try{q('#calendarDayDialog')?.close()}catch(_){}
  try{
    if(window.GymV150?.openHistoricalDay)window.GymV150.openHistoricalDay(iso);
    else if(window.GymV148?.openCompleted)window.GymV148.openCompleted(iso);
  }catch(e){console.warn('[v151 historical open]',e)}
  requestAnimationFrame(()=>{
    try{window.GymV150?.renderHistoricalCards?.(workout)}catch(_){}
    try{q('#calendarDayDialog')?.close()}catch(_){}
    openingHistorical=false;
  });
  setTimeout(()=>{
    try{window.GymV150?.renderHistoricalCards?.(workout)}catch(_){}
    try{q('#calendarDayDialog')?.close()}catch(_){}
    openingHistorical=false;
  },120);
  return true;
}

function patchCalendarFunction(){
  try{
    const current=window.v124OpenCalendarDay||(typeof v124OpenCalendarDay==='function'?v124OpenCalendarDay:null);
    if(typeof current!=='function'||current.__v151)return;
    const wrapped=function(iso,...args){
      if(completedWorkout(String(iso||'')))return openHistorical(String(iso));
      return current.apply(this,[iso,...args]);
    };
    wrapped.__v151=true;wrapped.__native=current;
    window.v124OpenCalendarDay=wrapped;
    try{v124OpenCalendarDay=wrapped}catch(_){}
  }catch(e){console.warn('[v151 patch calendar]',e)}
}

function dateFromTarget(target){
  const el=target?.closest?.('[data-date]');
  if(!el)return'';
  const iso=String(el.dataset?.date||'');
  return /^\d{4}-\d{2}-\d{2}$/.test(iso)?iso:'';
}
function captureCalendar(ev){
  const iso=dateFromTarget(ev.target);if(!iso||!completedWorkout(iso))return;
  ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();
  openHistorical(iso);
}

function guardOldModal(){
  const dialog=q('#calendarDayDialog');if(!dialog||dialog.dataset.v151Guard==='1')return;
  dialog.dataset.v151Guard='1';
  const nativeShow=dialog.showModal?.bind(dialog);
  if(nativeShow){
    dialog.showModal=function(){
      const iso=lastHistoricalIso||(()=>{try{return String(selectedWorkoutDate||'')}catch(_){return''}})();
      if(iso&&completedWorkout(iso)){openHistorical(iso);return;}
      return nativeShow();
    };
  }
  new MutationObserver(()=>{
    if(!dialog.open)return;
    const iso=lastHistoricalIso||(()=>{try{return String(selectedWorkoutDate||'')}catch(_){return''}})();
    if(iso&&completedWorkout(iso)){
      try{dialog.close()}catch(_){}
      openHistorical(iso);
    }
  }).observe(dialog,{attributes:true,attributeFilter:['open']});
}

function reinforceHistoricalCards(){
  if(!lastHistoricalIso)return;
  const workout=completedWorkout(lastHistoricalIso);if(!workout)return;
  try{window.GymV150?.renderHistoricalCards?.(workout)}catch(_){}
}

function start(){
  patchCalendarFunction();
  guardOldModal();
  window.addEventListener('pointerup',captureCalendar,true);
  window.addEventListener('touchend',captureCalendar,true);
  window.addEventListener('click',captureCalendar,true);
  new MutationObserver(()=>{
    patchCalendarFunction();
    guardOldModal();
    reinforceHistoricalCards();
  }).observe(document.body,{childList:true,subtree:true});
}
window.GymV151={release:'v151',completedWorkout,openHistorical,patchCalendarFunction};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
