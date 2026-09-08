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

/* v127: editable exercise video + swipeable personal media */
(()=>{
  const css=`
    .v127-video-btn{white-space:nowrap}
    .v127-video-editor{margin:12px 0;padding:12px;border:1px solid var(--line);border-radius:15px;background:var(--surface2)}
    .v127-video-editor-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
    .v127-video-editor-head strong{font-size:13px}.v127-video-editor-head small{font-size:10px;color:var(--muted)}
    .v127-video-editor-row{display:grid;grid-template-columns:1fr auto;gap:7px}.v127-video-editor-row input{min-width:0}
    .v127-video-editor-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
    .v127-video-editor-actions button{border:0;border-radius:11px;padding:9px 11px;font-weight:900;background:var(--surface3);color:var(--primary-dark)}
    .v127-video-editor-actions .open{background:linear-gradient(135deg,var(--primary),var(--primary2));color:#fff}
    .v127-media-label{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:13px 0 7px}.v127-media-label strong{font-size:13px}.v127-media-label small{font-size:10px;color:var(--muted)}
    .v124-media-grid{display:flex!important;grid-template-columns:none!important;gap:10px!important;overflow-x:auto!important;overflow-y:hidden;padding:2px 2px 9px!important;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    .v124-media-grid::-webkit-scrollbar{display:none}
    .v124-media-item{position:relative;flex:0 0 min(84vw,360px)!important;width:min(84vw,360px)!important;min-height:220px;scroll-snap-align:center;border-radius:16px;overflow:hidden;background:var(--surface3);display:flex;align-items:center;justify-content:center}
    .v124-media-item img,.v124-media-item video{width:100%!important;height:100%!important;max-height:420px;object-fit:contain;background:#000}
    .v127-guide-slide{flex:0 0 min(84vw,360px);width:min(84vw,360px);min-height:220px;scroll-snap-align:center;border-radius:16px;overflow:hidden;background:var(--surface3);display:flex;align-items:center;justify-content:center;position:relative}
    .v127-guide-slide img{width:100%;height:100%;max-height:420px;object-fit:contain}.v127-guide-slide span{position:absolute;left:8px;bottom:8px;padding:5px 8px;border-radius:999px;background:rgba(0,0,0,.62);color:#fff;font-size:9px;font-weight:900}
    @media(max-width:460px){.v127-video-editor-row{grid-template-columns:1fr}.v127-video-editor-row button{width:100%}.v124-media-item,.v127-guide-slide{flex-basis:88vw!important;width:88vw!important}}
  `;
  const style=document.createElement('style');style.id='v127ExerciseMediaStyle';style.textContent=css;document.head.appendChild(style);

  const isCs=()=>typeof lang==='function'&&lang()==='cs';
  const mediaStore=id=>{
    if(typeof normalizeV124State==='function')normalizeV124State();
    state.exerciseMedia=state.exerciseMedia||{};
    state.exerciseMedia[id]=state.exerciseMedia[id]||{files:[],links:[]};
    state.exerciseMedia[id].files=Array.isArray(state.exerciseMedia[id].files)?state.exerciseMedia[id].files:[];
    state.exerciseMedia[id].links=Array.isArray(state.exerciseMedia[id].links)?state.exerciseMedia[id].links:[];
    return state.exerciseMedia[id];
  };
  const currentUrl=id=>String(mediaStore(id).preferredVideoUrl||EX?.[id]?.videoUrl||'').trim();
  const safe=value=>typeof esc==='function'?esc(String(value||'')):String(value||'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));

  window.v127SaveExerciseVideo=async function(id){
    const input=document.getElementById('v127VideoUrl');
    const raw=String(input?.value||'').trim();
    if(raw){try{const u=new URL(raw);if(!['http:','https:'].includes(u.protocol))throw new Error()}catch(_){return typeof showToast==='function'&&showToast(isCs()?'Vlož platný odkaz na video.':'Enter a valid video URL.')}}
    mediaStore(id).preferredVideoUrl=raw;
    if(typeof saveState==='function')saveState();
    if(typeof cloudUser!=='undefined'&&cloudUser&&typeof saveCloud==='function'){try{await saveCloud()}catch(_){}}
    if(typeof showToast==='function')showToast(isCs()?'Video uloženo ✓':'Video saved ✓');
    await renderExerciseMedia(id);
  };
  window.v127ResetExerciseVideo=async function(id){
    delete mediaStore(id).preferredVideoUrl;
    if(typeof saveState==='function')saveState();
    if(typeof cloudUser!=='undefined'&&cloudUser&&typeof saveCloud==='function'){try{await saveCloud()}catch(_){}}
    await renderExerciseMedia(id);
    if(typeof showToast==='function')showToast(isCs()?'Obnoveno výchozí video.':'Default video restored.');
  };
  window.v127OpenExerciseVideo=function(id){
    const url=currentUrl(id);
    if(!url)return typeof showToast==='function'&&showToast(isCs()?'Pro tento cvik zatím není nastavené video.':'No video is set for this exercise yet.');
    window.open(url,'_blank','noopener');
  };
  function addEditor(id){
    const panel=document.getElementById('exerciseMediaPanel');if(!panel||panel.querySelector('.v127-video-editor'))return;
    const x=EX?.[id]||{},store=mediaStore(id),url=currentUrl(id),hasDefault=!!x.videoUrl,custom=Object.prototype.hasOwnProperty.call(store,'preferredVideoUrl');
    const box=document.createElement('section');box.className='v127-video-editor';
    box.innerHTML=`<div class="v127-video-editor-head"><strong>▶ ${isCs()?'Video':'Video'}</strong><small>${custom?(isCs()?'vlastní odkaz':'custom link'):(hasDefault?(isCs()?'výchozí pro tento cvik':'default for this exercise'):(isCs()?'nastav odkaz':'set a link'))}</small></div><div class="v127-video-editor-row"><input id="v127VideoUrl" type="url" inputmode="url" value="${safe(url)}" placeholder="https://youtube.com/…"><button type="button" class="primary" onclick="v127SaveExerciseVideo('${id}')">${isCs()?'Uložit':'Save'}</button></div><div class="v127-video-editor-actions">${url?`<button type="button" class="open" onclick="v127OpenExerciseVideo('${id}')">▶ ${isCs()?'Přehrát video':'Play video'}</button>`:''}${custom&&hasDefault?`<button type="button" onclick="v127ResetExerciseVideo('${id}')">↺ ${isCs()?'Výchozí':'Default'}</button>`:''}</div>`;
    const head=panel.querySelector('.v124-media-head');head?.insertAdjacentElement('afterend',box);
  }
  function addGuideSlide(id){
    const grid=document.getElementById('exerciseMediaGrid'),x=EX?.[id];if(!grid||!x?.guideThumb||grid.querySelector('.v127-guide-slide'))return;
    const slide=document.createElement('div');slide.className='v127-guide-slide';slide.innerHTML=`<img src="${safe(x.guideThumb)}" alt=""><span>${isCs()?'Výchozí obrázek':'Default image'}</span>`;grid.prepend(slide);
  }
  const nativeRender=typeof renderExerciseMedia==='function'?renderExerciseMedia:null;
  if(nativeRender){
    renderExerciseMedia=async function(id){
      await nativeRender(id);
      addEditor(id);
      addGuideSlide(id);
      const grid=document.getElementById('exerciseMediaGrid');
      if(grid&&!grid.previousElementSibling?.classList?.contains('v127-media-label')){
        const label=document.createElement('div');label.className='v127-media-label';label.innerHTML=`<strong>${isCs()?'Obrázky a videa':'Images & videos'}</strong><small>↔ ${isCs()?'swipe / scroll':'swipe / scroll'}</small>`;grid.before(label);
      }
    };
  }

  function addVideoButtons(root=document){
    root.querySelectorAll('button[onclick*="openVideo("]').forEach(btn=>{
      if(btn.dataset.v127VideoSource==='1'||btn.nextElementSibling?.classList?.contains('v127-video-btn'))return;
      const raw=btn.getAttribute('onclick')||'';
      const match=raw.match(/openVideo\(\s*['\"]([^'\"]+)['\"]/);if(!match)return;
      btn.dataset.v127VideoSource='1';
      const id=match[1],video=document.createElement('button');
      video.type='button';video.className=(btn.className?btn.className+' ':'')+'v127-video-btn';video.innerHTML='▶ Video';
      video.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();try{openVideo(id)}catch(_){return}setTimeout(()=>{document.querySelector('.v127-video-editor')?.scrollIntoView({behavior:'smooth',block:'center'})},80)});
      btn.insertAdjacentElement('afterend',video);
    });
  }
  let queued=false;const refresh=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;addVideoButtons()})};
  const observer=new MutationObserver(refresh);observer.observe(document.body,{childList:true,subtree:true});refresh();
})();
