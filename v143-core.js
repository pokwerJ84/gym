/* Gym Tracker v143: keep completed workout visible + reliable left-side delete set button */
(()=>{
'use strict';

function isCs(){try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}}

function enhanceDeleteButtons(){
  document.querySelectorAll('.saved-set-row').forEach((row,rowIndex)=>{
    if(row.querySelector('.v143-left-delete'))return;
    const number=row.querySelector('.saved-set-number');
    if(!number)return;
    const raw=String(number.textContent||'').trim();
    const parsed=parseInt(raw,10);
    const setIndex=Number.isFinite(parsed)?Math.max(0,parsed-1):rowIndex;

    const oldDelete=row.querySelector('.saved-set-actions .delete-set-btn');
    if(oldDelete)oldDelete.remove();

    const btn=document.createElement('button');
    btn.type='button';
    btn.className='v143-left-delete';
    btn.textContent='×';
    btn.setAttribute('aria-label',isCs()?'Smazat sérii':'Delete set');
    btn.setAttribute('title',isCs()?'Smazat sérii':'Delete set');
    btn.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      try{if(typeof deleteSavedSet==='function')deleteSavedSet(setIndex)}catch(e){console.warn('v143 delete set failed',e)}
    });
    number.replaceWith(btn);
  });
}

function hookFinishedWorkout(){
  try{
    const native=window.saveFinishedWorkout || (typeof saveFinishedWorkout==='function'?saveFinishedWorkout:null);
    if(typeof native!=='function'||native.__v143)return;
    const wrapped=async function(...args){
      let finishedDay='';
      let finishedDate='';
      let daySnapshot=null;
      try{
        finishedDay=state?.activeWorkout?.day||selectedTodayDay||'';
        finishedDate=state?.activeWorkout?.date||state?.days?.[finishedDay]?.date||selectedWorkoutDate||today();
        if(finishedDay&&state?.days?.[finishedDay])daySnapshot=structuredClone(state.days[finishedDay]);
      }catch(_){}

      const result=await native.apply(this,args);

      try{
        if(finishedDay&&finishedDate){
          if(daySnapshot){
            daySnapshot.date=finishedDate;
            daySnapshot.completed=true;
            state.days[finishedDay]=daySnapshot;
          }
          selectedTodayDay=finishedDay;
          selectedWorkoutDate=finishedDate;
          calendarViewDate=finishedDate;
          localStorage.setItem('gymSelectedWorkoutDate',finishedDate);
          if(typeof saveState==='function')saveState(false);
          if(typeof showToday==='function')showToday(finishedDay,finishedDate);
          requestAnimationFrame(()=>{
            document.querySelectorAll(`#${finishedDay} .modern-exercise-card`).forEach(card=>{
              const status=card.querySelector('.exercise-set-status');
              if(card.classList.contains('exercise-done')&&status)status.textContent=isCs()?'✓ Hotovo':'✓ Complete';
            });
          });
        }
      }catch(e){console.warn('v143 completed-day restore failed',e)}
      return result;
    };
    wrapped.__v143=true;
    wrapped.__native=native;
    window.saveFinishedWorkout=wrapped;
    try{saveFinishedWorkout=wrapped}catch(_){}
  }catch(e){console.warn('v143 finish hook failed',e)}
}

const observer=new MutationObserver(()=>enhanceDeleteButtons());
function start(){
  hookFinishedWorkout();
  enhanceDeleteButtons();
  observer.observe(document.body,{childList:true,subtree:true});
}

window.GymV143={release:'v143',enhanceDeleteButtons};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
