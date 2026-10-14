/* Gym Tracker v139: collapsible workout overview card */
(()=>{
'use strict';
const KEY='gymWorkoutOverviewCollapsedV139';
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const read=()=>{try{return localStorage.getItem(KEY)!=='0'}catch(_){return true}};
const write=v=>{try{localStorage.setItem(KEY,v?'1':'0')}catch(_){}};
function currentDay(){try{return window.GymV138?.resolve?.(selectedWorkoutDate)||window.GymV137?.resolvedDayForDate?.()||selectedTodayDay||'monday'}catch(_){return 'monday'}}
function programId(){try{return state?.programJourney?.programId||state?.settings?.workoutStyle||'balanced'}catch(_){return 'balanced'}}
function sessionName(day){
 if(programId()==='busy_week'&&window.GymV165){const s=window.GymV165.busySession();return cs()?s.titleCs:s.titleEn}
 try{const p=PLAN_PRESETS?.[programId()]?.plans?.[day];return (p?.[cs()?'title_cs':'title_en']||p?.title_en||day).replace(/^[^\p{L}\p{N}]+/u,'')}catch(_){return day}
}
function sessionIndex(day){if(programId()==='busy_week'&&window.GymV165)return window.GymV165.busyStep()+1;try{return Object.keys(PLAN_PRESETS?.[programId()]?.plans||{}).indexOf(day)+1}catch(_){return 1}}
function sessionCount(){return programId()==='busy_week'?5:Object.keys(PLAN_PRESETS?.[programId()]?.plans||{}).length||3}
function planName(){try{const p=PLAN_PRESETS?.[programId()];return p?.['name_'+(cs()?'cs':'en')]||p?.name_en||'Balanced plan'}catch(_){return 'Balanced plan'}}
function decorate(){
 const root=q('.screen.active')||document;
 const hero=q('.workout-hero.unified-workout-card,.unified-workout-card.workout-hero,.workout-hero',root);
 if(!hero)return;
 let toggle=q('.v139-overview-toggle',hero),compact=q('.v139-overview-compact',hero);
 if(!toggle){toggle=document.createElement('button');toggle.type='button';toggle.className='v139-overview-toggle';toggle.addEventListener('click',e=>{e.stopPropagation();setCollapsed(!hero.classList.contains('v139-collapsed'))});hero.prepend(toggle)}
 const programLine=q('.v123-program-line',hero);
 if(programLine&&toggle.parentElement!==programLine){
   toggle.classList.add('v139-inline-toggle');
   programLine.appendChild(toggle);
 }
 if(!compact){compact=document.createElement('button');compact.type='button';compact.className='v139-overview-compact';compact.addEventListener('click',()=>setCollapsed(false));hero.prepend(compact)}
 const day=currentDay(),idx=sessionIndex(day),name=sessionName(day);
 compact.innerHTML=`<span><small>${cs()?'TRÉNINK':'WORKOUT'}</small><strong>${planName()} · ${name} ${idx}/${sessionCount()}</strong></span><b>${cs()?'Zobrazit':'Show'}⌄</b>`;
 setCollapsed(read(),false);
}
function setCollapsed(value,persist=true){
 const root=q('.screen.active')||document;
 const hero=q('.workout-hero.unified-workout-card,.unified-workout-card.workout-hero,.workout-hero',root);
 if(!hero)return;
 hero.classList.toggle('v139-collapsed',!!value);
 const toggle=q('.v139-overview-toggle',hero);
 if(toggle){toggle.textContent=value?'⌄':'×';toggle.setAttribute('aria-label',value?(cs()?'Zobrazit přehled':'Show overview'):(cs()?'Sbalit přehled':'Collapse overview'))}
 if(persist)write(!!value);
}
window.v139ToggleWorkoutOverview=()=>{const hero=q('.workout-hero',q('.screen.active')||document);setCollapsed(!hero?.classList.contains('v139-collapsed'))};
function hook(name){try{const native=window[name]||eval(`typeof ${name}==='function'?${name}:null`);if(typeof native!=='function'||native.__v139)return;const f=function(...a){const r=native.apply(this,a);requestAnimationFrame(decorate);return r};f.__v139=true;f.__native=native;try{eval(`${name}=f`)}catch(_){}window[name]=f}catch(_){}}
function start(){['renderDay','showToday'].forEach(hook);decorate()}
window.GymV139={release:'v139-optimized',decorate,setCollapsed};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

