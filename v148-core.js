/* Gym Tracker v148: repeated taps on a completed calendar date must stay on that completed workout */
(()=>{
'use strict';

function completedWorkoutForDate(iso){
  try{return (state.workouts||[]).filter(w=>w&&w.type!=='cardio'&&w.date===iso).sort((a,b)=>(Number(b.savedAt)||0)-(Number(a.savedAt)||0))[0]||null}catch(_){return null}
}

function openCompleted(iso){
  const w=completedWorkoutForDate(iso); if(!w)return false;
  try{
    selectedWorkoutDate=iso;
    calendarViewDate=iso;
    selectedTodayDay=w.day;
    localStorage.setItem('gymSelectedWorkoutDate',iso);
    localStorage.setItem('gymTodayDay',w.day);
  }catch(_){}
  try{
    if(typeof showTodayV122==='function') showTodayV122(w.day,iso);
    else if(window.GymV146?.showDateCorrectly) window.GymV146.showDateCorrectly(w.day,iso);
  }catch(e){console.warn('v148 render failed',e)}
  requestAnimationFrame(()=>{
    try{document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===w.day))}catch(_){}
    try{window.GymV144?.decorateCompletedDay?.()}catch(_){}
  });
  return true;
}

function patchCompletedButtons(){
  document.querySelectorAll('.v120-day[data-date]').forEach(btn=>{
    const iso=btn.dataset.date;
    if(!iso||!completedWorkoutForDate(iso))return;
    if(btn.dataset.v148Patched==='1')return;
    btn.dataset.v148Patched='1';
    btn.removeAttribute('onclick');
    btn.onclick=function(ev){
      ev?.preventDefault?.();ev?.stopPropagation?.();ev?.stopImmediatePropagation?.();
      openCompleted(iso);
      return false;
    };
  });
}

function captureTap(ev){
  const btn=ev.target?.closest?.('.v120-day[data-date]');
  if(!btn)return;
  const iso=btn.dataset.date;
  if(!iso||!completedWorkoutForDate(iso))return;
  ev.preventDefault();
  ev.stopPropagation();
  ev.stopImmediatePropagation();
  openCompleted(iso);
}

let lastTouch=0;
function captureTouch(ev){
  const btn=ev.target?.closest?.('.v120-day[data-date]');
  if(!btn)return;
  const iso=btn.dataset.date;
  if(!iso||!completedWorkoutForDate(iso))return;
  lastTouch=Date.now();
  ev.preventDefault();
  ev.stopPropagation();
  ev.stopImmediatePropagation();
  openCompleted(iso);
}

function captureClick(ev){
  if(Date.now()-lastTouch<700){ev.preventDefault();ev.stopPropagation();ev.stopImmediatePropagation();return}
  captureTap(ev);
}

const observer=new MutationObserver(()=>patchCompletedButtons());
function install(){
  patchCompletedButtons();
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('touchend',captureTouch,true);
  document.addEventListener('click',captureClick,true);
}

window.GymV148={release:'v148',completedWorkoutForDate,openCompleted,patchCompletedButtons};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
