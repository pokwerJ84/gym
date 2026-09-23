/* Gym Tracker v165: optional Arms session + session audit fixes */
(()=>{
'use strict';
const V={release:'v165'};
const ARMS_KEY='gymArmsSessionByDateV165';
const CUSTOM_KEY='gymCustomWorkoutsV130';
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const currentIso=()=>{try{return String(selectedWorkoutDate||today())}catch(_){return new Date().toISOString().slice(0,10)}};
const ARMS_IDS=['machine_shoulder_press','lateral_raise','rear_delt_fly','dumbbell_curl','hammer_curl','cable_curl','triceps_pushdown','overhead_triceps_extension','assisted_dips','face_pull'];
function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){return {}}}
function write(key,v){try{localStorage.setItem(key,JSON.stringify(v||{}))}catch(_){}}
function ensureAssistedDips(){
 try{
  if(EX?.assisted_dips)return;
  const item={id:'assisted_dips',cs:'Dipy s dopomocí',en:'Assisted Dips',category:'triceps',mode:'weight',sets:3,range:'8–12',rest:90,topPick:true,
   tips:{cs:['Drž trup stabilní','Spouštěj se kontrolovaně','Použij takovou dopomoc, abys udržel čistý pohyb'],en:['Keep your torso stable','Lower under control','Use enough assistance to keep the movement clean']},
   mistakes:{cs:['Propadání ramen','Příliš rychlé spouštění','Příliš malá dopomoc a ztráta techniky'],en:['Letting the shoulders collapse','Dropping too quickly','Using too little assistance and losing form']}};
  if(Array.isArray(LIBRARY))LIBRARY.push(item);
  try{refreshExerciseIndex()}catch(_){try{EX.assisted_dips=item}catch(__){}}
 }catch(e){console.warn('[v165 assisted dips]',e)}
}
function auditPlanFixes(){
 try{
  const machines=PLAN_PRESETS?.machines?.plans;if(!machines)return;
  const wed=machines.wednesday?.items;if(Array.isArray(wed)){const i=wed.findIndex(x=>x.id==='back_extension');if(i>=0)wed[i]={id:'glute_drive_machine',sets:3,range:'8–12'}}
  const fri=machines.friday?.items;if(Array.isArray(fri)){const i=fri.findIndex(x=>x.id==='standing_calf_raise');if(i>=0)fri[i]={id:'calf_press_machine',sets:3,range:'10–15'}}
  if(state?.settings?.workoutStyle==='machines')BASE_PLANS=machines;
 }catch(e){console.warn('[v165 plan audit]',e)}
}
function isArms(iso=currentIso()){return !!read(ARMS_KEY)[iso]}
function markArms(iso,on){const m=read(ARMS_KEY);if(on)m[iso]=true;else delete m[iso];write(ARMS_KEY,m)}
function clearCustom(iso){const all=read(CUSTOM_KEY);delete all[iso];write(CUSTOM_KEY,all)}
function applyArms(iso=currentIso()){
 ensureAssistedDips();
 const missing=ARMS_IDS.filter(id=>!EX?.[id]);
 if(missing.length){alert((cs()?'V databázi chybí cviky: ':'Missing exercises: ')+missing.join(', '));return false}
 const all=read(CUSTOM_KEY);all[iso]={exerciseIds:[...ARMS_IDS],updatedAt:Date.now(),template:'arms',title:'Arms'};write(CUSTOM_KEY,all);markArms(iso,true);
 try{selectedWorkoutDate=iso;calendarViewDate=iso;localStorage.setItem('gymSelectedWorkoutDate',iso)}catch(_){}
 const day=window.GymV137?.resolvedDayForDate?.(iso)||'monday';
 try{showToday(day,iso)}catch(_){try{renderDay(day)}catch(__){}}
 setTimeout(decorate,0);
 try{showToast(cs()?'Arms session nastavena ✓':'Arms session selected ✓')}catch(_){}
 return true;
}
function leaveArms(iso=currentIso()){if(!isArms(iso))return;markArms(iso,false);clearCustom(iso)}
function decorateChooser(){
 const d=q('#v137SessionDialog');if(!d?.open)return;
 const list=q('.v137-session-list',d);if(!list)return;
 qa('[data-day]',list).forEach(b=>{if(b.dataset.v165Clear!=='1'){b.dataset.v165Clear='1';b.addEventListener('click',()=>leaveArms(currentIso()),{capture:true})}});
 const auto=q('.v137-session-auto',d);if(auto&&auto.dataset.v165Clear!=='1'){auto.dataset.v165Clear='1';auto.addEventListener('click',()=>leaveArms(currentIso()),{capture:true})}
 let btn=q('.v165-arms-session',list);
 if(!btn){btn=document.createElement('button');btn.type='button';btn.className='v165-arms-session';btn.innerHTML=`<span>💪</span><div><strong>Arms</strong><small>${cs()?'10 cviků · ramena, biceps, triceps':'10 exercises · shoulders, biceps, triceps'}</small></div><b></b>`;btn.addEventListener('click',()=>{if(applyArms(currentIso()))d.close()});list.appendChild(btn)}
 btn.classList.toggle('selected',isArms(currentIso()));q('b',btn).textContent=isArms(currentIso())?'✓':'';
}
function decorate(){
 const iso=currentIso();if(!isArms(iso))return;
 const root=q('.screen.active')||document.getElementById(window.GymV137?.resolvedDayForDate?.(iso)||'monday');if(!root)return;
 const hero=q('.workout-hero,.unified-workout-card',root);if(hero){const title=q('.workout-hero-top h2',hero)||q('h2',hero);if(title)title.textContent='Arms';const num=q('.hero-plan-number',hero);if(num)num.textContent='💪'}
 const box=q('.v137-session-control',root);if(box){const strong=q('strong',box),em=q('em',box);if(strong)strong.innerHTML='💪 Arms <span>Custom</span>';if(em)em.textContent=cs()?'Volitelná session':'Optional session'}
}
function install(){
 ensureAssistedDips();auditPlanFixes();
 document.addEventListener('click',ev=>{if(ev.target?.closest?.('.v137-session-control button'))setTimeout(decorateChooser,0)},true);
 try{const nativeRender=window.renderDay||(typeof renderDay==='function'?renderDay:null);if(typeof nativeRender==='function'&&!nativeRender.__v165){const f=function(...a){const r=nativeRender.apply(this,a);requestAnimationFrame(decorate);return r};f.__v165=true;f.__native=nativeRender;window.renderDay=f;try{renderDay=f}catch(_){}}}catch(_){}
 requestAnimationFrame(decorate);
}
V.applyArms=applyArms;V.isArms=isArms;V.audit={machinesFixed:true,armsIds:[...ARMS_IDS]};window.GymV165=V;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
