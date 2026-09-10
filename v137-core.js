/* Gym Tracker v137: history-driven session rotation + per-date manual session choice */
(()=>{
'use strict';
const V={release:'v137'},DAYS=['monday','wednesday','friday'],KEY='gymManualSessionByDateV137';
const q=(s,r=document)=>r?.querySelector?.(s)||null,qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const todayIso=()=>{try{return typeof today==='function'?today():new Date().toISOString().slice(0,10)}catch(_){return new Date().toISOString().slice(0,10)}};
const currentIso=()=>{try{return String(selectedWorkoutDate||todayIso())}catch(_){return todayIso()}};
const esc2=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){return {}}}function write(v){try{localStorage.setItem(KEY,JSON.stringify(v||{}))}catch(_){}}
function planned(iso){try{return window.GymV129?.readPlans?.()?.[iso]||''}catch(_){return ''}}
function wt(w){const s=Number(w?.savedAt)||0;if(s)return s;const d=Date.parse(`${w?.date||''}T23:59:59`);return Number.isFinite(d)?d:0}
function completed(){try{return (state?.workouts||[]).filter(w=>w&&w.type!=='cardio'&&DAYS.includes(w.day)).slice().sort((a,b)=>wt(a)-wt(b))}catch(_){return []}}
function next(day){const i=DAYS.indexOf(day);return i<0?'monday':DAYS[(i+1)%3]}
function auto(){const last=completed().at(-1);return last?next(last.day):'monday'}
function doneOn(iso){return completed().filter(w=>w.date===iso).at(-1)||null}
function resolve(iso=currentIso()){
 const date=String(iso||currentIso());
 try{const a=state?.activeWorkout,ad=a?.date||state?.days?.[a?.day]?.date||'';if(a&&DAYS.includes(a.day)&&(!ad||ad===date))return a.day}catch(_){}
 const m=read()[date];if(DAYS.includes(m))return m;
 const p=planned(date);if(DAYS.includes(p))return p;
 if(date<todayIso()){const w=doneOn(date);if(w)return w.day}
 return auto();
}
V.automaticNextDay=auto;V.resolvedDayForDate=resolve;
const name=d=>({monday:'Strength',wednesday:'Stability',friday:'Control'}[d]||d),icon=d=>({monday:'🏋️',wednesday:'🛡️',friday:'⚡'}[d]||'🏋️'),idx=d=>Math.max(0,DAYS.indexOf(d))+1;
let nativeShowToday=null;
function installShow(){try{nativeShowToday=typeof showToday==='function'?showToday:null;if(!nativeShowToday||nativeShowToday.__v137)return;const f=function(day,date,...args){const iso=String(date||currentIso());return nativeShowToday.call(this,resolve(iso),iso,...args)};f.__v137=true;f.__native=nativeShowToday;showToday=f;window.showToday=f}catch(e){console.warn('[v137 showToday]',e)}}
function installCurrent(){try{const native=typeof currentProgramDay==='function'?currentProgramDay:null;const f=function(){return resolve(currentIso())};f.__v137=true;f.__native=native;currentProgramDay=f;window.currentProgramDay=f}catch(e){console.warn('[v137 currentProgramDay]',e)}}
function ensureDialog(){let d=q('#v137SessionDialog');if(d)return d;d=document.createElement('dialog');d.id='v137SessionDialog';d.className='v137-session-dialog';d.innerHTML=`<div class="v137-session-shell"><div class="v137-session-head"><div><small>${cs()?'TRÉNINK PRO TENTO DEN':'SESSION FOR THIS DAY'}</small><h3>${cs()?'Vybrat session':'Choose session'}</h3></div><button type="button" data-close>✕</button></div><p class="v137-session-date"></p><div class="v137-session-list"></div><button type="button" class="v137-session-auto secondary full">${cs()?'Použít automatické pořadí':'Use automatic rotation'}</button></div>`;document.body.appendChild(d);q('[data-close]',d)?.addEventListener('click',()=>d.close());q('.v137-session-auto',d)?.addEventListener('click',()=>setManual(currentIso(),''));return d}
function openChooser(){const iso=currentIso(),d=ensureDialog(),cur=resolve(iso),manual=read()[iso]||'';q('.v137-session-date',d).textContent=iso;q('.v137-session-list',d).innerHTML=DAYS.map(day=>`<button type="button" data-day="${day}" class="${cur===day?'selected':''}"><span>${icon(day)}</span><div><strong>${name(day)}</strong><small>${cs()?`Session ${idx(day)} z 3`:`Session ${idx(day)} of 3`}</small></div><b>${cur===day?'✓':''}</b></button>`).join('');qa('[data-day]',d).forEach(b=>b.addEventListener('click',()=>setManual(iso,b.dataset.day||'')));const a=q('.v137-session-auto',d);if(a)a.hidden=!manual;if(!d.open)d.showModal()}
window.v137OpenSessionChooser=openChooser;
function setManual(iso,day){const map=read();if(DAYS.includes(day))map[iso]=day;else delete map[iso];write(map);q('#v137SessionDialog')?.close();const target=resolve(iso);try{selectedWorkoutDate=iso;calendarViewDate=iso;localStorage.setItem('gymSelectedWorkoutDate',iso)}catch(_){};if(nativeShowToday)nativeShowToday(target,iso);setTimeout(decorate,0);try{showToast(DAYS.includes(day)?(cs()?`Session změněna na ${name(day)} ✓`:`Session changed to ${name(day)} ✓`):(cs()?'Automatické pořadí obnoveno ✓':'Automatic rotation restored ✓'))}catch(_){}}
V.setManualSession=setManual;
function source(iso){if(read()[iso])return cs()?'Ručně vybráno':'Manual';if(planned(iso))return cs()?'Naplánováno v kalendáři':'Planned in calendar';return cs()?'Automaticky podle posledního dokončeného tréninku':'Automatic from last completed workout'}
function decorate(){const iso=currentIso(),day=resolve(iso),root=document.getElementById(day)||q('.screen.active');if(!root)return;q('.v137-session-control',root)?.remove();const hero=q('.workout-hero,.unified-workout-card',root);if(!hero)return;const anchor=q('.hero-meta',hero)||q('.workout-hero-top',hero);if(!anchor)return;const box=document.createElement('div');box.className='v137-session-control';box.innerHTML=`<div><small>SESSION</small><strong>${icon(day)} ${name(day)} <span>${idx(day)}/3</span></strong><em>${esc2(source(iso))}</em></div><button type="button">${cs()?'Změnit session':'Change session'}</button>`;q('button',box)?.addEventListener('click',openChooser);anchor.insertAdjacentElement('afterend',box);const title=q('.workout-hero-top h2',hero),num=q('.hero-plan-number',hero);if(title)title.textContent=name(day);if(num)num.textContent=`${idx(day)}/3`}
function hooks(){try{const native=typeof renderDay==='function'?renderDay:null;if(native&&!native.__v137){const f=function(...a){const r=native.apply(this,a);requestAnimationFrame(decorate);return r};f.__v137=true;f.__native=native;renderDay=f;window.renderDay=f}}catch(e){console.warn('[v137 renderDay]',e)};try{const native=typeof saveCloud==='function'?saveCloud:null;if(native&&!native.__v137){const f=async function(...a){const r=await native.apply(this,a);requestAnimationFrame(()=>{const iso=currentIso(),target=resolve(iso);try{if(!state?.activeWorkout&&nativeShowToday)nativeShowToday(target,iso)}catch(_){}decorate()});return r};f.__v137=true;f.__native=native;saveCloud=f;window.saveCloud=f}}catch(e){console.warn('[v137 saveCloud]',e)}}
V.diagnostics=()=>({release:V.release,date:currentIso(),automaticNext:auto(),resolved:resolve(currentIso()),manual:read()[currentIso()]||'',planned:planned(currentIso()),lastCompleted:completed().at(-1)||null});window.GymV137=V;window.gymV137Diagnostics=V.diagnostics;
function start(){installCurrent();installShow();hooks();const iso=currentIso(),target=resolve(iso);try{if(!state?.activeWorkout&&nativeShowToday)nativeShowToday(target,iso)}catch(_){}requestAnimationFrame(decorate)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
