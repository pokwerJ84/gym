/* Gym Tracker v165: optional reusable Arms session */
(()=>{
'use strict';
const V={release:'v165'};
const ARMS_KEY='gymArmsSessionByDateV165';
const CUSTOM_KEY='gymCustomWorkoutsV130';
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const currentIso=()=>{try{return String(selectedWorkoutDate||today())}catch(_){return new Date().toISOString().slice(0,10)}};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const TARGETS=[
 {label:'Shoulder Press',aliases:['shoulder press','tlaky na ramena','seated shoulder press','machine shoulder press']},
 {label:'Lateral Raise',aliases:['lateral raise','upazovani','dumbbell lateral raise','machine lateral raise']},
 {label:'Rear Delt Fly',aliases:['rear delt fly','reverse fly','reverse pec deck','obracene rozpazky']},
 {label:'Dumbbell Curl',aliases:['dumbbell curl','biceps curl','bicepsovy zdvih']},
 {label:'Hammer Curl',aliases:['hammer curl','kladivovy zdvih']},
 {label:'Cable Curl',aliases:['cable curl','bicepsovy zdvih na kladce','cable biceps curl']},
 {label:'Triceps Pushdown',aliases:['triceps pushdown','cable triceps pushdown','stlacovani kladky na triceps']},
 {label:'Overhead Triceps Extension',aliases:['overhead triceps extension','triceps extension overhead','triceps nad hlavou']},
 {label:'Assisted Dips',aliases:['assisted dips','assisted dip','dipy s dopomoci']},
 {label:'Face Pull',aliases:['face pull','face pulls','pritahy k obliceji']}
];
function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(_){return {}}}
function write(key,v){try{localStorage.setItem(key,JSON.stringify(v||{}))}catch(_){}}
function allExercises(){try{if(Array.isArray(LIBRARY)&&LIBRARY.length)return LIBRARY}catch(_){}try{return Object.values(EX||{})}catch(_){return []}}
function names(x){return [x?.id,x?.en,x?.cs,x?.name,x?.title].filter(Boolean).map(norm)}
function resolveTarget(t){
 const all=allExercises();
 for(const a of t.aliases){const n=norm(a);const exact=all.find(x=>names(x).includes(n));if(exact)return exact}
 for(const a of t.aliases){const n=norm(a);const partial=all.find(x=>names(x).some(v=>v.includes(n)||n.includes(v)));if(partial)return partial}
 return null;
}
function resolveArms(){return TARGETS.map(t=>({target:t,exercise:resolveTarget(t)}))}
function isArms(iso=currentIso()){return !!read(ARMS_KEY)[iso]}
function markArms(iso,on){const m=read(ARMS_KEY);if(on)m[iso]=true;else delete m[iso];write(ARMS_KEY,m)}
function clearCustom(iso){const all=read(CUSTOM_KEY);delete all[iso];write(CUSTOM_KEY,all)}
function applyArms(iso=currentIso()){
 const resolved=resolveArms(),missing=resolved.filter(x=>!x.exercise);
 if(missing.length){alert((cs()?'V databázi chybí tyto cviky:\n':'Missing exercises in the database:\n')+missing.map(x=>'• '+x.target.label).join('\n'));return false}
 const ids=resolved.map(x=>x.exercise.id);
 const all=read(CUSTOM_KEY);all[iso]={exerciseIds:ids,updatedAt:Date.now(),template:'arms',title:'Arms'};write(CUSTOM_KEY,all);markArms(iso,true);
 try{selectedWorkoutDate=iso;calendarViewDate=iso;localStorage.setItem('gymSelectedWorkoutDate',iso)}catch(_){}
 const day=window.GymV137?.resolvedDayForDate?.(iso)||'monday';
 try{showToday(day,iso)}catch(_){try{renderDay(day)}catch(__){}}
 setTimeout(()=>decorate(),0);
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
 if(!btn){btn=document.createElement('button');btn.type='button';btn.className='v165-arms-session';btn.innerHTML='<span>💪</span><div><strong>Arms</strong><small>10 exercises · Shoulders, biceps, triceps</small></div><b></b>';btn.addEventListener('click',()=>{applyArms(currentIso());d.close()});list.appendChild(btn)}
 btn.classList.toggle('selected',isArms(currentIso()));q('b',btn).textContent=isArms(currentIso())?'✓':'';
}
function decorate(){
 const iso=currentIso();if(!isArms(iso))return;
 const root=q('.screen.active')||document.getElementById(window.GymV137?.resolvedDayForDate?.(iso)||'monday');if(!root)return;
 const hero=q('.workout-hero,.unified-workout-card',root);if(hero){const title=q('.workout-hero-top h2',hero)||q('h2',hero);if(title)title.textContent='Arms';const num=q('.hero-plan-number',hero);if(num)num.textContent='💪'}
 const box=q('.v137-session-control',root);if(box){const strong=q('strong',box),em=q('em',box);if(strong)strong.innerHTML='💪 Arms <span>Custom</span>';if(em)em.textContent=cs()?'Volitelná session':'Optional session'}
}
function install(){
 const native=window.v137OpenSessionChooser;if(typeof native==='function'&&!native.__v165){const f=function(...a){const r=native.apply(this,a);setTimeout(decorateChooser,0);return r};f.__v165=true;f.__native=native;window.v137OpenSessionChooser=f;try{v137OpenSessionChooser=f}catch(_){}}
 try{const nativeRender=window.renderDay||(typeof renderDay==='function'?renderDay:null);if(typeof nativeRender==='function'&&!nativeRender.__v165){const f=function(...a){const r=nativeRender.apply(this,a);requestAnimationFrame(decorate);return r};f.__v165=true;f.__native=nativeRender;window.renderDay=f;try{renderDay=f}catch(_){}}}catch(_){}
 requestAnimationFrame(decorate);
}
V.applyArms=applyArms;V.resolveArms=resolveArms;V.isArms=isArms;window.GymV165=V;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
