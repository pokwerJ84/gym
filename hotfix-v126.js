/* v126 mobile UX hotfix */
(()=>{
  const PLAN_KEY="gymPlannedWorkoutsV126";
  const readPlans=()=>{try{return JSON.parse(localStorage.getItem(PLAN_KEY)||"{}")||{}}catch(_){return {}}};
  const writePlans=value=>localStorage.setItem(PLAN_KEY,JSON.stringify(value||{}));
  const futureIso=iso=>String(iso||"")>String(typeof today==="function"?today():new Date().toISOString().slice(0,10));

  const nativeTrainingDayForIso=typeof trainingDayForIso==="function"?trainingDayForIso:null;
  const nativeIsPlannedStrengthDate=typeof isPlannedStrengthDate==="function"?isPlannedStrengthDate:null;

  if(nativeTrainingDayForIso){
    trainingDayForIso=function(iso){
      const custom=readPlans()[iso];
      return custom||nativeTrainingDayForIso(iso);
    };
  }
  if(nativeIsPlannedStrengthDate){
    isPlannedStrengthDate=function(iso){return !!readPlans()[iso]||nativeIsPlannedStrengthDate(iso)};
  }

  function sessionLabel(day){
    try{
      const plan=BASE_PLANS?.[day];
      if(!plan)return day;
      return plan["title_"+(typeof lang==="function"?lang():"en")]||plan.title_en||day;
    }catch(_){return day}
  }

  function plannerMarkup(iso){
    const cs=typeof lang==="function"&&lang()==="cs";
    const plans=readPlans();
    const chosen=plans[iso]||"";
    const days=["monday","wednesday","friday"];
    return `<section class="v126-future-planner" data-v126-date="${iso}" data-v126-plan="${chosen}">
      <h3>${chosen?(cs?"Naplánovaný trénink":"Planned workout"):(cs?"Naplánovat trénink":"Plan workout")}</h3>
      <p>${cs?"Vyber session pro tento den. Plán zůstane uložený i po zavření aplikace.":"Choose a session for this date. The plan stays saved after you close the app."}</p>
      <div class="v126-plan-grid">${days.map((day,index)=>`<button type="button" class="${chosen===day?"selected":""}" data-v126-day="${day}">${sessionLabel(day)}<small>Session ${index+1}</small></button>`).join("")}</div>
      ${chosen?`<button type="button" class="v126-plan-clear">${cs?"Zrušit plán pro tento den":"Remove plan for this day"}</button>`:""}
    </section>`;
  }

  function moveSavedMeasurement(){
    const screen=document.getElementById("today");
    const card=screen?.querySelector(".monday-measurement-card.measurement-saved");
    if(!screen||!card)return;
    card.removeAttribute("open");
    card.classList.add("v126-measurement-bottom");
    if(screen.lastElementChild!==card)screen.appendChild(card);
  }

  function bindPlanner(planner,iso){
    if(!planner||planner.dataset.v126Bound==="1")return;
    planner.dataset.v126Bound="1";
    planner.querySelectorAll("[data-v126-day]").forEach(button=>button.addEventListener("click",()=>{
      const plans=readPlans();
      plans[iso]=button.dataset.v126Day;
      writePlans(plans);
      try{
        selectedTodayDay=button.dataset.v126Day;
        if(typeof showToday==="function")showToday(button.dataset.v126Day,iso);
        else if(typeof renderDay==="function")renderDay(button.dataset.v126Day);
        if(typeof showToast==="function")showToast((typeof lang==="function"&&lang()==="cs")?"Trénink naplánován ✓":"Workout planned ✓");
      }catch(_){refresh()}
    }));
    planner.querySelector(".v126-plan-clear")?.addEventListener("click",()=>{
      const plans=readPlans();delete plans[iso];writePlans(plans);
      const fallback=nativeTrainingDayForIso?.(iso)||((typeof recommendedDay==="function")?recommendedDay():"monday");
      try{if(typeof showToday==="function")showToday(fallback,iso);else refresh()}catch(_){refresh()}
    });
  }

  function injectFuturePlanner(){
    const screen=document.getElementById("today");
    if(!screen)return;
    const iso=typeof selectedWorkoutDate!=="undefined"?selectedWorkoutDate:"";
    const existing=screen.querySelector(".v126-future-planner");
    if(!futureIso(iso)){
      if(existing)existing.remove();
      return;
    }
    const chosen=readPlans()[iso]||"";
    if(existing&&existing.dataset.v126Date===iso&&existing.dataset.v126Plan===chosen){bindPlanner(existing,iso);return}
    if(existing)existing.remove();
    const calendar=screen.querySelector(".v120-calendar")||screen.querySelector(".modern-week-strip")?.parentElement;
    if(!calendar)return;
    calendar.insertAdjacentHTML("afterend",plannerMarkup(iso));
    bindPlanner(screen.querySelector(`.v126-future-planner[data-v126-date="${iso}"]`),iso);
  }

  let scheduled=false;
  function refresh(){
    if(scheduled)return;scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      moveSavedMeasurement();
      injectFuturePlanner();
    });
  }

  const observer=new MutationObserver(refresh);
  const start=()=>{
    observer.observe(document.body,{childList:true,subtree:true});
    refresh();
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
