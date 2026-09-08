/* Gym Tracker v128 – consolidated compatibility + usability layer (local draft, not deployed) */
(()=>{
  'use strict';
  const V='v128';
  const q=(s,r=document)=>r?.querySelector?.(s)||null;
  const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
  const escHtml=v=>String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const getState=()=>{try{return typeof state!=='undefined'?state:window.state}catch(_){return window.state}};
  const getEX=()=>{try{return typeof EX!=='undefined'?EX:window.EX}catch(_){return window.EX}};
  const getLang=()=>{try{return typeof lang==='function'?lang():(getState()?.settings?.language||'cs')}catch(_){return 'cs'}};
  const cs=()=>getLang()==='cs';
  const safeCall=(names,...args)=>{
    for(const n of names){
      try{
        const fn=typeof window[n]==='function'?window[n]:(typeof globalThis[n]==='function'?globalThis[n]:null);
        if(fn)return fn(...args);
      }catch(e){console.warn('[v128]',n,e)}
    }
  };
  const localized=v=>{
    if(Array.isArray(v))return v.filter(Boolean).map(String);
    if(v&&typeof v==='object'){
      const chosen=v[getLang()]??v.en??v.cs;
      return Array.isArray(chosen)?chosen.filter(Boolean).map(String):(typeof chosen==='string'&&chosen.trim()?[chosen.trim()]:[]);
    }
    return typeof v==='string'&&v.trim()?[v.trim()]:[];
  };
  const exerciseById=id=>getEX()?.[id]||null;
  const mediaStore=id=>{
    const s=getState();if(!s)return {files:[],links:[]};
    s.exerciseMedia=s.exerciseMedia||{};
    s.exerciseMedia[id]=s.exerciseMedia[id]||{files:[],links:[]};
    const store=s.exerciseMedia[id];
    store.files=Array.isArray(store.files)?store.files:[];
    store.links=Array.isArray(store.links)?store.links:[];
    return store;
  };
  const fallbackVideoUrl=id=>{
    const x=exerciseById(id);if(!x)return '';
    const store=mediaStore(id);
    if(String(store.preferredVideoUrl||'').trim())return String(store.preferredVideoUrl).trim();
    if(String(x.videoUrl||'').trim())return String(x.videoUrl).trim();
    const name=x.en||x.cs||id;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(name+' proper form tutorial')}`;
  };

  /* ---------- Phase 1/2: exercise detail + media integration ---------- */
  let currentExerciseId='';
  function categoryLabel(x){
    if(!x?.category)return '';
    try{if(typeof categoryName==='function')return categoryName(x.category)}catch(_){ }
    return String(x.category).replace(/_/g,' ');
  }
  function guideData(id){
    const x=exerciseById(id)||{};
    const tips=localized(x.technique||x.steps||x.instructions||x.howTo||x.tips);
    const mistakes=localized(x.commonMistakes||x.mistakes);
    const explicitFocus=localized(x.focusToday||x.focus||x.cue)[0]||'';
    const primary=localized(x.primaryMuscles||x.primaryMuscle||x.muscles);
    const secondary=localized(x.secondaryMuscles||x.secondaryMuscle);
    const group=categoryLabel(x);
    return {focus:explicitFocus||tips[0]||'',primary:primary.length?primary:(group?[group]:[]),secondary,technique:tips,mistakes,tip:localized(x.proTip||x.tip)[0]||''};
  }
  function guideMarkup(id){
    const g=guideData(id),parts=[];
    if(g.focus)parts.push(`<section class="v128-guide-card v128-focus"><h4>🎯 ${cs()?'Dnešní fokus':'Focus today'}</h4><p>${escHtml(g.focus)}</p></section>`);
    if(g.primary.length||g.secondary.length){
      const text=[g.primary.length?`${cs()?'Hlavní':'Primary'}: ${g.primary.join(', ')}`:'',g.secondary.length?`${cs()?'Vedlejší':'Secondary'}: ${g.secondary.join(', ')}`:''].filter(Boolean).join(' · ');
      parts.push(`<section class="v128-guide-card"><h4>💪 ${cs()?'Svaly':'Muscles'}</h4><p>${escHtml(text)}</p></section>`);
    }
    if(g.technique.length)parts.push(`<section class="v128-guide-card"><h4>📋 ${cs()?'Technika':'Technique'}</h4><ul>${g.technique.slice(0,6).map(v=>`<li>${escHtml(v)}</li>`).join('')}</ul></section>`);
    if(g.mistakes.length)parts.push(`<section class="v128-guide-card v128-mistakes"><h4>⚠ ${cs()?'Časté chyby':'Common mistakes'}</h4><ul>${g.mistakes.slice(0,5).map(v=>`<li>${escHtml(v)}</li>`).join('')}</ul></section>`);
    if(g.tip)parts.push(`<section class="v128-guide-card"><h4>💡 Pro tip</h4><p>${escHtml(g.tip)}</p></section>`);
    return parts.length?`<div class="v128-guide" data-v128-guide="${escHtml(id)}">${parts.join('')}</div>`:'';
  }
  function renderGuideIntoDialog(id){
    if(!id)return;const target=q('#videoTips');if(!target)return;const key=`${id}|${getLang()}`;
    if(target.dataset.v128GuideKey===key&&q('.v128-guide',target))return;
    const html=guideMarkup(id);if(html){target.innerHTML=html;target.dataset.v128GuideKey=key}
  }
  function removeDuplicateV127Buttons(){qa('.v127-video-btn').forEach(el=>el.remove())}
  function polishMediaDialog(id){
    const x=exerciseById(id);if(!x)return;const panel=q('#exerciseMediaPanel');const slide=q('.v127-guide-slide',panel);const slideImg=q('img',slide);
    if(slideImg&&(x.guideImage||x.guideThumb))slideImg.src=x.guideImage||x.guideThumb;
    const topGuide=q('#videoGuideWrap');if(slide&&topGuide)topGuide.hidden=true;
    const store=mediaStore(id),url=fallbackVideoUrl(id),editor=q('.v127-video-editor',panel);
    if(editor){
      const input=q('#v127VideoUrl',editor);if(input&&!input.value)input.value=url;
      const actions=q('.v127-video-editor-actions',editor);
      if(actions&&url&&!q('.v128-open-video',actions)){
        const open=document.createElement('button');open.type='button';open.className='open v128-open-video';open.textContent=`▶ ${cs()?'Přehrát video':'Play video'}`;
        open.addEventListener('click',()=>window.open(fallbackVideoUrl(id),'_blank','noopener'));actions.prepend(open);
      }
      if(actions&&Object.prototype.hasOwnProperty.call(store,'preferredVideoUrl')&&!q('.v128-reset-video',actions)){
        const reset=document.createElement('button');reset.type='button';reset.className='v128-reset-video';reset.textContent=`↺ ${cs()?'Výchozí':'Default'}`;
        reset.addEventListener('click',async()=>{
          const store=mediaStore(id);delete store.preferredVideoUrl;store.preferredVideoClearedAt=Date.now();
          try{if(typeof saveState==='function')saveState()}catch(_){ }
          try{if(typeof cloudUser!=='undefined'&&cloudUser&&typeof saveCloud==='function')await saveCloud()}catch(_){ }
          try{if(typeof renderExerciseMedia==='function')await renderExerciseMedia(id)}catch(_){ }
          renderGuideIntoDialog(id);polishMediaDialog(id);
        });actions.appendChild(reset);
      }
    }
    const actionVideo=q('#exerciseDetailActions .detail-video');if(actionVideo&&url)actionVideo.href=url;
  }
  function installExerciseDetailHook(){
    try{
      if(typeof openVideo==='function'&&!openVideo.__v128Wrapped){
        const nativeOpenVideo=openVideo;
        const wrapped=function(exerciseId,...args){
          currentExerciseId=String(exerciseId||'');const result=nativeOpenVideo.call(this,exerciseId,...args);renderGuideIntoDialog(currentExerciseId);
          if(typeof renderExerciseMedia==='function')Promise.resolve(renderExerciseMedia(currentExerciseId)).then(()=>polishMediaDialog(currentExerciseId)).catch(e=>console.warn('[v128 media]',e));
          return result;
        };
        wrapped.__v128Wrapped=true;openVideo=wrapped;window.openVideo=wrapped;
      }
    }catch(e){console.warn('[v128 openVideo hook]',e)}
    window.v127OpenExerciseVideo=function(id){const url=fallbackVideoUrl(id);if(!url)return safeCall(['showToast'],cs()?'Pro tento cvik není video.':'No video is set for this exercise.');window.open(url,'_blank','noopener')};
  }

  function installMediaDeleteHooks(){
    try{
      if(typeof window.v127SaveExerciseVideo==='function'&&!window.v127SaveExerciseVideo.__v128Wrapped){
        const native=window.v127SaveExerciseVideo;
        const wrapped=async function(id){const raw=String(q('#v127VideoUrl')?.value||'').trim();const result=await native.call(this,id);const store=mediaStore(id);if(raw)delete store.preferredVideoClearedAt;else{delete store.preferredVideoUrl;store.preferredVideoClearedAt=Date.now()}try{if(typeof saveState==='function')saveState()}catch(_){ }return result};wrapped.__v128Wrapped=true;window.v127SaveExerciseVideo=wrapped;
      }
      if(typeof window.v127ResetExerciseVideo==='function'&&!window.v127ResetExerciseVideo.__v128Wrapped){
        const wrapped=async function(id){const store=mediaStore(id);delete store.preferredVideoUrl;store.preferredVideoClearedAt=Date.now();try{if(typeof saveState==='function')saveState()}catch(_){ }try{if(typeof cloudUser!=='undefined'&&cloudUser&&typeof saveCloud==='function')await saveCloud()}catch(_){ }try{if(typeof renderExerciseMedia==='function')await renderExerciseMedia(id)}catch(_){ }polishMediaDialog(id)};wrapped.__v128Wrapped=true;window.v127ResetExerciseVideo=wrapped;
      }
      if(typeof v124DeleteExerciseMedia==='function'&&!v124DeleteExerciseMedia.__v128Wrapped){
        const native=v124DeleteExerciseMedia;
        const wrapped=async function(exerciseId,itemId){const before=(mediaStore(exerciseId).files||[]).find(item=>item?.id===itemId);const result=await native.call(this,exerciseId,itemId);const store=mediaStore(exerciseId);if(before&&!store.files.some(item=>item?.id===itemId)){store.deletedFiles=[...(store.deletedFiles||[]).filter(x=>x?.id!==itemId),{id:itemId,path:before.path||'',at:Date.now()}].slice(-100);try{if(typeof saveState==='function')saveState()}catch(_){ }}return result};wrapped.__v128Wrapped=true;v124DeleteExerciseMedia=wrapped;window.v124DeleteExerciseMedia=wrapped;
      }
      if(typeof v124RemoveExerciseLink==='function'&&!v124RemoveExerciseLink.__v128Wrapped){
        const native=v124RemoveExerciseLink;
        const wrapped=function(exerciseId,itemId){const before=(mediaStore(exerciseId).links||[]).find(item=>item?.id===itemId);const result=native.call(this,exerciseId,itemId);const store=mediaStore(exerciseId);if(before&&!store.links.some(item=>item?.id===itemId)){store.deletedLinks=[...(store.deletedLinks||[]).filter(x=>x?.id!==itemId),{id:itemId,url:before.url||'',at:Date.now()}].slice(-100);try{if(typeof saveState==='function')saveState()}catch(_){ }}return result};wrapped.__v128Wrapped=true;v124RemoveExerciseLink=wrapped;window.v124RemoveExerciseLink=wrapped;
      }
    }catch(e){console.warn('[v128 media delete hooks]',e)}
  }

  function mediaMeaningful(s){if((s?.customExercises||[]).length)return true;return Object.values(s?.exerciseMedia||{}).some(store=>(store?.files||[]).length||(store?.links||[]).length||String(store?.preferredVideoUrl||'').trim())}
  function mergeMediaStores(a={},b={},preferA=true){
    const out={},ids=new Set([...Object.keys(a||{}),...Object.keys(b||{})]);
    for(const id of ids){
      const first=preferA?(a?.[id]||{}):(b?.[id]||{}),second=preferA?(b?.[id]||{}):(a?.[id]||{}),clone=item=>{try{return JSON.parse(JSON.stringify(item))}catch(_){return item}};
      const deletedFiles=[...(first.deletedFiles||[]),...(second.deletedFiles||[])],deletedFileKeys=new Set(deletedFiles.flatMap(x=>[x?.id,x?.path].filter(Boolean))),files=[],fileKeys=new Set();
      [...(first.files||[]),...(second.files||[])].forEach(item=>{const key=item?.id||item?.path||JSON.stringify(item);if(deletedFileKeys.has(item?.id)||deletedFileKeys.has(item?.path)||fileKeys.has(key))return;fileKeys.add(key);files.push(clone(item))});
      const deletedLinks=[...(first.deletedLinks||[]),...(second.deletedLinks||[])],deletedLinkKeys=new Set(deletedLinks.flatMap(x=>[x?.id,x?.url].filter(Boolean))),links=[],linkKeys=new Set();
      [...(first.links||[]),...(second.links||[])].forEach(item=>{const key=item?.id||item?.url||JSON.stringify(item);if(deletedLinkKeys.has(item?.id)||deletedLinkKeys.has(item?.url)||linkKeys.has(key))return;linkKeys.add(key);links.push(clone(item))});
      const store={files,links,deletedFiles:deletedFiles.slice(-100),deletedLinks:deletedLinks.slice(-100)};
      if(Number(first.preferredVideoClearedAt)||0)store.preferredVideoClearedAt=Number(first.preferredVideoClearedAt);
      else if(Object.prototype.hasOwnProperty.call(first,'preferredVideoUrl'))store.preferredVideoUrl=first.preferredVideoUrl;
      else if(Object.prototype.hasOwnProperty.call(second,'preferredVideoUrl')&&!(Number(second.preferredVideoClearedAt)||0))store.preferredVideoUrl=second.preferredVideoUrl;
      if(!Object.prototype.hasOwnProperty.call(first,'preferredVideoUrl')&&!store.preferredVideoClearedAt&&(Number(second.preferredVideoClearedAt)||0))store.preferredVideoClearedAt=Number(second.preferredVideoClearedAt);
      out[id]=store;
    }
    return out;
  }
  function installCloudSafetyHooks(){
    try{if(typeof hasMeaningfulLocalData==='function'&&!hasMeaningfulLocalData.__v128Wrapped){const native=hasMeaningfulLocalData;const wrapped=function(){return native()||mediaMeaningful(getState())};wrapped.__v128Wrapped=true;hasMeaningfulLocalData=wrapped;window.hasMeaningfulLocalData=wrapped}}catch(e){console.warn('[v128 local-data hook]',e)}
    try{if(typeof mergeStates==='function'&&!mergeStates.__v128Wrapped){const native=mergeStates;const wrapped=function(localValue,remoteValue){const merged=native(localValue,remoteValue),lt=Number(localValue?.meta?.modifiedAt)||0,rt=Number(remoteValue?.meta?.modifiedAt)||0;merged.exerciseMedia=mergeMediaStores(localValue?.exerciseMedia||{},remoteValue?.exerciseMedia||{},lt>=rt);return merged};wrapped.__v128Wrapped=true;mergeStates=wrapped;window.mergeStates=wrapped}}catch(e){console.warn('[v128 merge hook]',e)}
  }

  let completedHidden=false;
  function currentTodayScreen(){const bySelected=(()=>{try{return document.getElementById(String(selectedTodayDay||''))}catch(_){return null}})();if(bySelected)return bySelected;return ['monday','wednesday','friday'].map(id=>document.getElementById(id)).find(el=>el?.classList.contains('active'))||null}
  const isCompletedCard=el=>el?.classList.contains('exercise-done')||el?.classList.contains('completed')||el?.classList.contains('done')||el?.classList.contains('is-done')||el?.getAttribute('data-completed')==='true';
  function todayCleanup(){
    const screen=currentTodayScreen();if(!screen)return;const list=q('.today-preview-list,.plan-preview-list',screen);if(!list)return;
    const cards=qa('.modern-exercise-card,.exercise-card,[data-instance-id]',list).filter(el=>el.parentElement===list),completed=cards.filter(isCompletedCard),unfinished=cards.filter(el=>!isCompletedCard(el));
    if(completed.length){const desired=[...unfinished,...completed],differs=desired.some((el,i)=>cards[i]!==el);if(differs){const frag=document.createDocumentFragment();desired.forEach(el=>frag.appendChild(el));list.appendChild(frag)}completed.forEach(el=>el.classList.toggle('v128-hide-completed',completedHidden))}
    let tools=q('.v128-today-tools',screen);if(!completed.length){tools?.remove();return}
    if(!tools){tools=document.createElement('div');tools.className='v128-today-tools';const b=document.createElement('button');b.type='button';b.addEventListener('click',()=>{completedHidden=!completedHidden;todayCleanup()});tools.appendChild(b);(q('.v120-exercise-heading',screen)||list).insertAdjacentElement('afterend',tools)}
    const b=q('button',tools);if(b)b.textContent=completedHidden?(cs()?'Ukázat hotové':'Show completed'):(cs()?'Skrýt hotové':'Hide completed');
  }

  const PLAN_KEY='gymPlannedWorkoutsV126';
  const readPlans=()=>{try{return JSON.parse(localStorage.getItem(PLAN_KEY)||'{}')||{}}catch(_){return {}}};
  const writePlans=v=>{try{localStorage.setItem(PLAN_KEY,JSON.stringify(v||{}))}catch(_){}};
  const getTodayIso=()=>{try{return typeof today==='function'?today():new Date().toISOString().slice(0,10)}catch(_){return new Date().toISOString().slice(0,10)}};
  const getSelectedIso=()=>{try{return String((typeof selectedWorkoutDate!=='undefined'&&selectedWorkoutDate)||'')}catch(_){return ''}};
  function planTitle(day){try{const p=typeof BASE_PLANS!=='undefined'?BASE_PLANS?.[day]:null;return p?.['title_'+getLang()]||p?.title_en||day}catch(_){return day}}
  function fallbackPlanMarkup(iso){const chosen=readPlans()[iso]||'',days=['monday','wednesday','friday'];return `<section class="v128-future-planner" data-date="${escHtml(iso)}" data-plan="${escHtml(chosen)}"><h3>${chosen?(cs()?'Naplánovaný trénink':'Planned workout'):(cs()?'Naplánovat trénink':'Plan workout')}</h3><p>${cs()?'Vyber trénink pro tento den.':'Choose the workout for this date.'}</p><div class="v128-plan-grid">${days.map((d,i)=>`<button type="button" data-plan-day="${d}" class="${chosen===d?'selected':''}">${escHtml(planTitle(d))}<small>Session ${i+1}</small></button>`).join('')}</div>${chosen?`<button type="button" class="v128-plan-clear">${cs()?'Zrušit plán':'Remove plan'}</button>`:''}</section>`}
  function bindFallbackPlanner(root,iso){
    if(!root||root.dataset.bound==='1')return;root.dataset.bound='1';
    qa('[data-plan-day]',root).forEach(btn=>btn.addEventListener('click',()=>{const plans=readPlans();plans[iso]=btn.dataset.planDay;writePlans(plans);try{selectedTodayDay=btn.dataset.planDay}catch(_){ }try{if(typeof showToday==='function')showToday(btn.dataset.planDay,iso);else if(typeof renderDay==='function')renderDay(btn.dataset.planDay)}catch(e){console.warn('[v128 planner]',e)}safeCall(['showToast'],cs()?'Trénink naplánován ✓':'Workout planned ✓');setTimeout(refresh,0)}));
    q('.v128-plan-clear',root)?.addEventListener('click',()=>{const plans=readPlans();delete plans[iso];writePlans(plans);root.remove();let fallback='monday';try{if(typeof recommendedDay==='function')fallback=recommendedDay()}catch(_){ }try{if(typeof showToday==='function')showToday(fallback,iso)}catch(_){ }setTimeout(refresh,0)});
  }
  function calendarGuard(){
    const screen=currentTodayScreen();if(!screen)return;const iso=getSelectedIso();if(!iso)return;
    qa('.v120-day',screen).forEach(btn=>{const raw=btn.getAttribute?.('onclick')||'',match=raw.match(/v124OpenCalendarDay\(['\"](\d{4}-\d{2}-\d{2})['\"]\)/);if(match)btn.classList.toggle('selected',match[1]===iso)});
    const own=q('.v128-future-planner',screen);if(iso<=getTodayIso()){own?.remove();return}if(q('.v126-future-planner',screen)){own?.remove();return}
    const chosen=readPlans()[iso]||'';if(own&&own.dataset.date===iso&&own.dataset.plan===chosen){bindFallbackPlanner(own,iso);return}own?.remove();
    const anchor=q('.v120-calendar',screen)||q('.modern-today-head',screen)||screen.firstElementChild;if(!anchor)return;anchor.insertAdjacentHTML('afterend',fallbackPlanMarkup(iso));bindFallbackPlanner(q('.v128-future-planner',screen),iso);
  }
  function installCalendarHook(){
    try{if(typeof v124OpenCalendarDay==='function'&&!v124OpenCalendarDay.__v128Wrapped){const native=v124OpenCalendarDay;const wrapped=function(iso){const date=String(iso||'');if(!date)return;const now=getTodayIso();if(date<now)return native.call(this,date);try{selectedWorkoutDate=date;calendarViewDate=date;localStorage.setItem('gymSelectedWorkoutDate',date)}catch(_){ }let day=readPlans()[date]||'';if(!day){try{day=typeof trainingDayForIso==='function'?trainingDayForIso(date):''}catch(_){ }}if(!day){try{day=typeof recommendedDay==='function'?recommendedDay():'monday'}catch(_){day='monday'}}try{selectedTodayDay=day}catch(_){ }if(typeof showToday==='function')showToday(day,date);else if(typeof renderDay==='function')renderDay(day);setTimeout(refresh,0)};wrapped.__v128Wrapped=true;v124OpenCalendarDay=wrapped;window.v124OpenCalendarDay=wrapped}}catch(e){console.warn('[v128 calendar hook]',e)}
  }

  function progressHealth(){const s=getState();return {measurements:Array.isArray(s?.progress)?s.progress.length:0,workouts:Array.isArray(s?.workouts)?s.workouts.length:0}}
  function mobilePolish(){if(typeof getComputedStyle==='function')qa('input,select,textarea').forEach(el=>{const px=parseFloat(getComputedStyle(el).fontSize)||16;el.classList.toggle('v128-no-zoom',px<16)});removeDuplicateV127Buttons()}
  async function swHealth(){if(!('serviceWorker' in navigator))return {supported:false};const reg=await navigator.serviceWorker.getRegistration().catch(()=>null);return {supported:true,controller:!!navigator.serviceWorker.controller,waiting:!!reg?.waiting,installing:!!reg?.installing}}
  window.gymV128Diagnostics=async function(){
    const sw=await swHealth(),s=getState(),ex=getEX(),progress=progressHealth();
    const report={version:V,exDatabase:!!ex&&Object.keys(ex).length>0,state:!!s,videoMedia:typeof renderExerciseMedia==='function'&&!!q('#exerciseMediaPanel'),calendar:typeof showToday==='function'&&typeof v124OpenCalendarDay==='function',save:typeof saveState==='function',cloudMediaMerge:typeof mergeStates==='function'&&!!mergeStates.__v128Wrapped,localMediaProtection:typeof hasMeaningfulLocalData==='function'&&!!hasMeaningfulLocalData.__v128Wrapped,finishFlow:typeof allWorkoutExercisesDone==='function'&&typeof openFinishDialog==='function'&&typeof saveFinishedWorkout==='function',measurements:progress.measurements,workouts:progress.workouts,serviceWorker:sw,selectedDate:getSelectedIso()||getTodayIso()};
    console.table(report);return report;
  };

  let queued=false;
  function refresh(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;try{installExerciseDetailHook();installMediaDeleteHooks();installCloudSafetyHooks();installCalendarHook();todayCleanup();calendarGuard();mobilePolish();if(currentExerciseId&&q('#videoDialog')?.open){renderGuideIntoDialog(currentExerciseId);polishMediaDialog(currentExerciseId)}}catch(e){console.warn('[v128 refresh]',e)}})}
  const start=()=>{installExerciseDetailHook();installMediaDeleteHooks();installCloudSafetyHooks();installCalendarHook();new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true});refresh();window.gymV128Diagnostics().catch(()=>{})};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
