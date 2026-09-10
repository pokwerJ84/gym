/* Gym Tracker v139: collapsible workout overview card */
(()=>{
'use strict';
const KEY='gymWorkoutOverviewCollapsedV139';
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const read=()=>{try{return localStorage.getItem(KEY)!=='0'}catch(_){return true}};
const write=v=>{try{localStorage.setItem(KEY,v?'1':'0')}catch(_){}};
function currentDay(){try{return window.GymV138?.resolvedDayForDate?.()||window.GymV137?.resolvedDayForDate?.()||selectedTodayDay||'monday'}catch(_){return 'monday'}}
function sessionName(day){return({monday:'Strength',wednesday:'Stability',friday:'Control'})[day]||day}
function sessionIndex(day){return({monday:1,wednesday:2,friday:3})[day]||1}
function planName(){try{const key=state?.settings?.workoutStyle||'balanced';const p=PLAN_PRESETS?.[key];return p?.['name_'+(cs()?'cs':'en')]||p?.name_en||'Balanced plan'}catch(_){return 'Balanced plan'}}
function decorate(){
 const root=q('.screen.active')||document;
 const hero=q('.workout-hero.unified-workout-card,.unified-workout-card.workout-hero,.workout-hero',root);
 if(!hero)return;
 let toggle=q('.v139-overview-toggle',hero);
 let compact=q('.v139-overview-compact',hero);
 if(!toggle){
   toggle=document.createElement('button');
   toggle.type='button';
   toggle.className='v139-overview-toggle';
   toggle.addEventListener('click',e=>{e.stopPropagation();setCollapsed(!hero.classList.contains('v139-collapsed'));});
   hero.prepend(toggle);
 }
 if(!compact){
   compact=document.createElement('button');
   compact.type='button';
   compact.className='v139-overview-compact';
   compact.addEventListener('click',()=>setCollapsed(false));
   hero.prepend(compact);
 }
 const day=currentDay(),idx=sessionIndex(day),name=sessionName(day);
 compact.innerHTML=`<span><small>${cs()?'TRÉNINK':'WORKOUT'}</small><strong>${planName()} · ${name} ${idx}/3</strong></span><b>${cs()?'Zobrazit':'Show'}⌄</b>`;
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
function start(){['renderDay','showToday'].forEach(hook);decorate();document.addEventListener('click',()=>requestAnimationFrame(decorate),true)}
window.GymV139={release:'v139',decorate,setCollapsed};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
