/* Gym Tracker v168: optional focused sessions + 5-step Busy Week program */
(()=>{
'use strict';

const V={release:'v168'};
const TEMPLATE_KEY='gymOptionalSessionByDateV168';
const LEGACY_ARMS_KEY='gymArmsSessionByDateV165';
const CUSTOM_KEY='gymCustomWorkoutsV130';
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const currentIso=()=>{try{return String(selectedWorkoutDate||today())}catch(_){return new Date().toISOString().slice(0,10)}};
const clone=x=>JSON.parse(JSON.stringify(x));
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return {}}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v||{}))}catch(_){}};

const OPTIONAL={
 arms:{
  icon:'💪',title:'Arms',
  noteCs:'cca 35–45 min · ramena, biceps, triceps',
  noteEn:'about 35–45 min · shoulders, biceps, triceps',
  items:[
   {id:'machine_shoulder_press',sets:3,range:'8–12'},
   {id:'lateral_raise',sets:2,range:'12–15'},
   {id:'rear_delt_fly',sets:2,range:'12–15'},
   {id:'dumbbell_curl',sets:3,range:'8–12'},
   {id:'hammer_curl',sets:2,range:'10–12'},
   {id:'triceps_pushdown',sets:3,range:'10–15'},
   {id:'overhead_triceps_extension',sets:2,range:'10–15'},
   {id:'face_pull',sets:2,range:'12–15'}
  ]
 },
 abs:{
  icon:'🔥',title:'Abs + Obliques',
  noteCs:'cca 25–35 min · břicho, šikmé svaly, anti-rotace',
  noteEn:'about 25–35 min · abs, obliques, anti-rotation',
  items:[
   {id:'cable_crunch',sets:3,range:'10–15'},
   {id:'hanging_knee_raise',sets:3,range:'8–15'},
   {id:'torso_rotation_machine',sets:3,range:'10–12 / strana'},
   {id:'side_plank',sets:3,range:'25–45 / strana'},
   {id:'pallof_press',sets:3,range:'10–12 / strana'}
  ]
 }
};

const BUSY=[
 {titleCs:'Push',titleEn:'Push',subCs:'Hrudník, ramena, triceps',subEn:'Chest, shoulders, triceps',items:[
  {id:'machine_chest_press',sets:3,range:'8–12'},
  {id:'incline_dumbbell_press',sets:3,range:'8–10'},
  {id:'machine_shoulder_press',sets:3,range:'8–12'},
  {id:'lateral_raise',sets:2,range:'12–15'},
  {id:'triceps_pushdown',sets:3,range:'10–15'},
  {id:'treadmill',sets:1,range:'20 min'}
 ]},
 {titleCs:'Legs A',titleEn:'Legs A',subCs:'Kvadricepsy, hamstringy, hýždě, lýtka',subEn:'Quads, hamstrings, glutes, calves',items:[
  {id:'hack_squat',sets:3,range:'8–10'},
  {id:'seated_leg_curl',sets:3,range:'10–15'},
  {id:'glute_drive_machine',sets:3,range:'8–12'},
  {id:'calf_press_machine',sets:3,range:'10–15'},
  {id:'treadmill',sets:1,range:'20 min'}
 ]},
 {titleCs:'Pull',titleEn:'Pull',subCs:'Záda, zadní ramena, biceps',subEn:'Back, rear delts, biceps',items:[
  {id:'lat_pulldown',sets:3,range:'8–12'},
  {id:'seated_row',sets:3,range:'8–12'},
  {id:'chest_supported_row',sets:2,range:'8–12'},
  {id:'face_pull',sets:2,range:'12–15'},
  {id:'dumbbell_curl',sets:3,range:'8–12'},
  {id:'treadmill',sets:1,range:'20 min'}
 ]},
 {titleCs:'Legs B + Core',titleEn:'Legs B + Core',subCs:'Zadní řetězec, stehna a core',subEn:'Posterior chain, legs and core',items:[
  {id:'leg_press',sets:3,range:'10–12'},
  {id:'romanian_deadlift',sets:3,range:'8–12'},
  {id:'leg_extension',sets:2,range:'10–15'},
  {id:'cable_crunch',sets:3,range:'10–15'},
  {id:'pallof_press',sets:2,range:'10–12 / strana'},
  {id:'treadmill',sets:1,range:'20 min'}
 ]},
 {titleCs:'Arms + Abs',titleEn:'Arms + Abs',subCs:'Ruce, ramena a břicho',subEn:'Arms, shoulders and abs',items:[
  {id:'lateral_raise',sets:2,range:'12–15'},
  {id:'dumbbell_curl',sets:3,range:'8–12'},
  {id:'hammer_curl',sets:2,range:'10–12'},
  {id:'triceps_pushdown',sets:3,range:'10–15'},
  {id:'overhead_triceps_extension',sets:2,range:'10–15'},
  {id:'hanging_knee_raise',sets:2,range:'8–15'},
  {id:'side_plank',sets:2,range:'25–45 / strana'},
  {id:'treadmill',sets:1,range:'20 min'}
 ]}
];

function exercise(id){try{return EX?.[id]||null}catch(_){return null}}
function ensureAssistedDips(){
 try{
  if(EX?.assisted_dips)return;
  const item={
   id:'assisted_dips',cs:'Dipy s dopomocí',en:'Assisted Dips',category:'triceps',mode:'weight',sets:3,range:'8–12',rest:90,topPick:true,
   tips:{cs:['Ramena drž stažená dolů','Spouštěj se kontrolovaně','Nastav dopomoc tak, aby technika zůstala čistá'],en:['Keep shoulders down','Lower under control','Use enough assistance to keep technique clean']},
   mistakes:{cs:['Krčení ramen','Rychlý pád dolů','Příliš malá dopomoc a ztráta techniky'],en:['Shrugging the shoulders','Dropping too quickly','Too little assistance and losing technique']},
   guideImage:'./exercise-guides/v169/assisted_dips.svg',guideThumb:'./exercise-guides/v169/assisted_dips.svg',guideExact:true
  };
  if(Array.isArray(LIBRARY))LIBRARY.push(item);
  try{refreshExerciseIndex()}catch(_){try{EX.assisted_dips=item}catch(__){}}
 }catch(e){console.warn('[v168 assisted dips]',e)}
}
function validateItems(items){return items.filter(x=>exercise(x.id))}
function busyActive(){try{return state?.programJourney?.programId==='busy_week'}catch(_){return false}}
function busyStep(){
 try{
  const w=state?.activeWorkout;
  const raw=(w?.programId==='busy_week'&&Number.isFinite(Number(w.programSessionIndex)))?Number(w.programSessionIndex):Number(state?.programJourney?.sessionIndex||0);
  return ((raw%BUSY.length)+BUSY.length)%BUSY.length;
 }catch(_){return 0}
}
function busySession(step=busyStep()){return BUSY[step]||BUSY[0]}
function layoutKey(){return `busy_${busyStep()}`}

function ensureBusyProgram(){
 try{
  if(!PLAN_PRESETS.busy_week){
   const shell=items=>({title_cs:'⏱️ Every Day – Busy Week',title_en:'⏱️ Every Day – Busy Week',sub_cs:'4–5× týdně · cca 40 min síla + 20 min pás',sub_en:'4–5× weekly · about 40 min lifting + 20 min treadmill',items:clone(items)});
   PLAN_PRESETS.busy_week={name_cs:'Every Day – Busy Week',name_en:'Every Day – Busy Week',plans:{
    monday:shell(BUSY[0].items),wednesday:shell(BUSY[1].items),friday:shell(BUSY[2].items)
   }};
  }
  if(typeof PROGRAM_META!=='undefined'&&!PROGRAM_META.busy_week){
   PROGRAM_META.busy_week={icon:'⏱️',sessions:0,label_cs:'Every Day – Busy Week',label_en:'Every Day – Busy Week',detail_cs:'5-session cyklus · 4–5× týdně · 40 min síla + 20 min pás',detail_en:'5-session cycle · 4–5× weekly · 40 min lifting + 20 min treadmill'};
  }
 }catch(e){console.warn('[v168 busy program]',e)}
}

function migrateLegacy(){
 const old=read(LEGACY_ARMS_KEY),next=read(TEMPLATE_KEY);let changed=false;
 Object.entries(old).forEach(([date,on])=>{if(on&&!next[date]){next[date]='arms';changed=true}});
 if(changed)write(TEMPLATE_KEY,next);
}
function templateFor(iso=currentIso()){const id=read(TEMPLATE_KEY)[iso];return OPTIONAL[id]?id:''}
function markTemplate(iso,id){const m=read(TEMPLATE_KEY);if(OPTIONAL[id])m[iso]=id;else delete m[iso];write(TEMPLATE_KEY,m)}
function customMap(){return read(CUSTOM_KEY)}
function customFor(iso=currentIso()){const x=customMap()[iso];return x&&Array.isArray(x.exerciseIds)&&x.exerciseIds.length?x:null}
function writeCustom(all){write(CUSTOM_KEY,all)}
function clearOptional(iso=currentIso()){
 if(!templateFor(iso))return;
 const all=customMap();delete all[iso];writeCustom(all);markTemplate(iso,'');
}
function applyOptional(id,iso=currentIso()){
 const t=OPTIONAL[id];if(!t)return false;
 const items=validateItems(t.items),missing=t.items.filter(x=>!exercise(x.id)).map(x=>x.id);
 if(missing.length){alert((cs()?'V databázi chybí: ':'Missing: ')+missing.join(', '));return false}
 const all=customMap();
 all[iso]={exerciseIds:items.map(x=>x.id),updatedAt:Date.now(),template:id,title:t.title};
 writeCustom(all);markTemplate(iso,id);
 try{selectedWorkoutDate=iso;calendarViewDate=iso;localStorage.setItem('gymSelectedWorkoutDate',iso)}catch(_){}
 const day=window.GymV137?.resolvedDayForDate?.(iso)||'monday';
 try{showToday(day,iso)}catch(_){try{renderDay(day)}catch(__){}}
 setTimeout(decorate,0);
 try{showToast(cs()?`${t.title} nastavena ✓`:`${t.title} selected ✓`)}catch(_){}
 return true;
}

/* Busy Week session layouts are editable per one of the five cycle steps. */
function sessionLayout(){
 if(!busyActive())return null;
 try{
  state.programSessionLayouts=state.programSessionLayouts||{};
  state.programSessionLayouts.busy_week=state.programSessionLayouts.busy_week||{};
  const key=layoutKey();
  if(!Array.isArray(state.programSessionLayouts.busy_week[key])||!state.programSessionLayouts.busy_week[key].length){
   state.programSessionLayouts.busy_week[key]=busySession().items.map((x,i)=>({slotId:`slot-${i}-${x.id}`,...clone(x)}));
  }
  return state.programSessionLayouts.busy_week[key];
 }catch(_){return null}
}
V.sessionLayout=sessionLayout;V.layoutKey=layoutKey;

function installBusyInstances(){
 try{
  const native=typeof dayInstances==='function'?dayInstances:null;
  if(!native||native.__v168Busy)return;
  const f=function(day,...args){
   if(!busyActive()||customFor(currentIso()))return native.call(this,day,...args);
   prepareDay(day);
   const step=busyStep(),items=sessionLayout()||[];
   const bases=items.filter(x=>exercise(x.id)).map((x,index)=>({
    instanceId:`busy:${step}:${x.slotId||x.id||index}`,exerciseId:x.id,recommendedId:x.id,
    sets:x.sets||exercise(x.id)?.sets||3,range:x.range||exercise(x.id)?.range||'8–12',added:false
   }));
   const extras=(state.days?.[day]?.extras||[]).map(x=>({...x,added:true}));
   const all=[...bases,...extras],map=Object.fromEntries(all.map(x=>[x.instanceId,x]));
   const d=state.days[day],order=[...(d.order||[])].filter(id=>map[id]);
   all.forEach(x=>{if(!order.includes(x.instanceId))order.push(x.instanceId)});
   d.order=order;
   return order.map(id=>map[id]);
  };
  f.__v168Busy=true;f.__native=native;dayInstances=f;window.dayInstances=f;
 }catch(e){console.warn('[v168 busy instances]',e)}
}

function decorateChooser(){
 const d=q('#v137SessionDialog');if(!d?.open)return;
 const list=q('.v137-session-list',d);if(!list)return;
 qa('[data-day]',list).forEach(b=>{
  if(b.dataset.v168Clear!=='1'){
   b.dataset.v168Clear='1';b.addEventListener('click',()=>clearOptional(currentIso()),{capture:true});
  }
 });
 const auto=q('.v137-session-auto',d);
 if(auto&&auto.dataset.v168Clear!=='1'){auto.dataset.v168Clear='1';auto.addEventListener('click',()=>clearOptional(currentIso()),{capture:true})}
 Object.entries(OPTIONAL).forEach(([id,t])=>{
  let btn=q(`.v168-template-${id}`,list);
  if(!btn){
   btn=document.createElement('button');btn.type='button';btn.className=`v168-template-${id}`;
   btn.addEventListener('click',()=>{if(applyOptional(id,currentIso()))d.close()});list.appendChild(btn);
  }
  const selected=templateFor(currentIso())===id;
  btn.classList.toggle('selected',selected);
  btn.innerHTML=`<span>${t.icon}</span><div><strong>${t.title}</strong><small>${cs()?t.noteCs:t.noteEn}</small></div><b>${selected?'✓':''}</b>`;
 });
}

function decorate(){
 const iso=currentIso(),tid=templateFor(iso),root=q('.screen.active')||document.getElementById(state?.activeWorkout?.day||window.GymV137?.resolvedDayForDate?.(iso)||'monday');
 if(!root)return;
 const hero=q('.workout-hero,.unified-workout-card',root);
 const title=q('.workout-hero-top h2',hero),num=q('.hero-plan-number',hero),box=q('.v137-session-control',root);
 if(tid){
  const t=OPTIONAL[tid];
  if(title)title.textContent=t.title;if(num)num.textContent=t.icon;
  if(box){const strong=q('strong',box),em=q('em',box);if(strong)strong.innerHTML=`${t.icon} ${t.title} <span>Custom</span>`;if(em)em.textContent=cs()?t.noteCs:t.noteEn}
  return;
 }
 if(busyActive()){
  const step=busyStep(),s=busySession(step);
  if(title)title.textContent=cs()?s.titleCs:s.titleEn;
  if(num)num.textContent=`${step+1}/5`;
  if(box){
   const strong=q('strong',box),em=q('em',box);
   if(strong)strong.innerHTML=`⏱️ ${cs()?s.titleCs:s.titleEn} <span>${step+1}/5</span>`;
   if(em)em.textContent=cs()?s.subCs:s.subEn;
  }
  const kicker=q('.hero-kicker',hero);if(kicker)kicker.textContent=cs()?'DALŠÍ KRÁTKÁ SESSION':'NEXT SHORT SESSION';
 }
}

function hookRender(){
 try{
  const native=window.renderDay||(typeof renderDay==='function'?renderDay:null);
  if(typeof native!=='function'||native.__v168)return;
  const f=function(...a){const r=native.apply(this,a);requestAnimationFrame(decorate);return r};
  f.__v168=true;f.__native=native;renderDay=f;window.renderDay=f;
 }catch(_){}
}

function install(){
 ensureAssistedDips();ensureBusyProgram();migrateLegacy();installBusyInstances();hookRender();
 document.addEventListener('click',ev=>{if(ev.target?.closest?.('.v137-session-control button'))setTimeout(decorateChooser,0)},true);
 requestAnimationFrame(decorate);
}

V.applyOptional=applyOptional;V.templateFor=templateFor;V.busyStep=busyStep;V.busySession=busySession;V.busySessions=BUSY;
window.GymV165=V;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();