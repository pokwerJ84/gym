/* Gym Tracker v131: cloud-safe calendar selection + undo via green check */
(()=>{
'use strict';
const V={release:'v131',LOCK_KEY:'gymV131CalendarSelection'};
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const todayIso=()=>{try{return typeof today==='function'?today():new Date().toISOString().slice(0,10)}catch(_){return new Date().toISOString().slice(0,10)}};
const validIso=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));
const readLock=()=>{try{const v=localStorage.getItem(V.LOCK_KEY)||'';return validIso(v)&&v>todayIso()?v:''}catch(_){return ''}};
const writeLock=iso=>{try{if(validIso(iso)&&iso>todayIso())localStorage.setItem(V.LOCK_KEY,iso);else localStorage.removeItem(V.LOCK_KEY)}catch(_){}};
const clearLock=()=>writeLock('');
function forceSelectedDate(iso){if(!validIso(iso))return;try{selectedWorkoutDate=iso}catch(_){}try{calendarViewDate=iso}catch(_){}try{localStorage.setItem('gymSelectedWorkoutDate',iso)}catch(_){}}
function restoreFutureSelection(){const iso=readLock();if(!iso)return '';forceSelectedDate(iso);return iso}
V.readLock=readLock;V.restoreFutureSelection=restoreFutureSelection;
function installCalendarProtection(){
 try{const native=typeof v124OpenCalendarDay==='function'?v124OpenCalendarDay:null;if(native&&!native.__v131){const f=function(iso,...args){const date=String(iso||'');if(!validIso(date))return native.call(this,iso,...args);if(date>todayIso()){writeLock(date);forceSelectedDate(date)}else clearLock();return native.call(this,date,...args)};f.__v131=true;f.__native=native;v124OpenCalendarDay=f;window.v124OpenCalendarDay=f}}catch(e){console.warn('[v131 calendar click]',e)}
 try{const native=typeof renderDay==='function'?renderDay:null;if(native&&!native.__v131){const f=function(day,...args){restoreFutureSelection();return native.call(this,day,...args)};f.__v131=true;f.__native=native;renderDay=f;window.renderDay=f}}catch(e){console.warn('[v131 render lock]',e)}
 try{const native=typeof showToday==='function'?showToday:null;if(native&&!native.__v131){const f=function(day,date,...args){const locked=readLock();let target=date;if(locked&&(!target||String(target)===todayIso())){target=locked;forceSelectedDate(locked)}return native.call(this,day,target,...args)};f.__v131=true;f.__native=native;showToday=f;window.showToday=f}}catch(e){console.warn('[v131 showToday lock]',e)}
 try{const native=typeof goToTodayDate==='function'?goToTodayDate:null;if(native&&!native.__v131){const f=function(...args){clearLock();return native.apply(this,args)};f.__v131=true;goToTodayDate=f;window.goToTodayDate=f}}catch(e){console.warn('[v131 today]',e)}
 document.addEventListener('click',ev=>{const nav=ev.target?.closest?.('[data-screen="today"]');if(nav)clearLock()},{capture:true});
}
function askUndo(day,id){const text=cs()?'Zrušit hotový cvik?':'Undo completed exercise?';if(!confirm(text))return;try{if(typeof v130UndoExercise==='function')return v130UndoExercise(day,id);const e=entry(day,id);if(!e)return;e.done=false;e.skipped=false;if(Array.isArray(e.sets))e.sets.forEach(set=>{if(set&&typeof set==='object')set._complete=false});if(state?.days?.[day])state.days[day].completed=false;saveState();renderDay(day)}catch(err){console.warn('[v131 undo]',err)}}
function decorateChecks(day){const root=document.getElementById(day)||q('.screen.active');if(!root)return;qa('.v130-undo-complete',root).forEach(x=>x.remove());qa('.today-preview-list .modern-exercise-card.exercise-done',root).forEach(card=>{const id=card.dataset.instanceId,check=q('.preview-card-number',card);if(!id||!check)return;check.classList.add('v131-undo-check');check.setAttribute('role','button');check.setAttribute('tabindex','0');check.setAttribute('aria-label',cs()?'Zrušit hotový cvik':'Undo completed exercise');if(check.dataset.v131Bound==='1')return;check.dataset.v131Bound='1';const run=ev=>{ev.preventDefault();ev.stopPropagation();askUndo(day,id)};check.addEventListener('click',run);check.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){run(ev)}})})}
function installUndoHooks(){try{const native=typeof renderDay==='function'?renderDay:null;if(native&&!native.__v131Undo){const f=function(day,...args){const r=native.call(this,day,...args);requestAnimationFrame(()=>decorateChecks(day));return r};f.__v131Undo=true;renderDay=f;window.renderDay=f}}catch(e){console.warn('[v131 undo render]',e)}try{const native=typeof refreshTodayPreviewStatus==='function'?refreshTodayPreviewStatus:null;if(native&&!native.__v131){const f=function(day,id,...args){const r=native.call(this,day,id,...args);requestAnimationFrame(()=>decorateChecks(day));return r};f.__v131=true;refreshTodayPreviewStatus=f;window.refreshTodayPreviewStatus=f}}catch(e){console.warn('[v131 undo status]',e)}}
V.diagnostics=()=>({release:V.release,lockedDate:readLock(),selectedDate:(()=>{try{return selectedWorkoutDate}catch(_){return ''}})(),undoChecks:qa('.v131-undo-check').length,cloudUser:!!(()=>{try{return cloudUser}catch(_){return null}})()});window.GymV131=V;window.gymV131Diagnostics=V.diagnostics;
function start(){installCalendarProtection();installUndoHooks();restoreFutureSelection();let day='monday';try{day=selectedTodayDay||window.GymV129?.resolveDay?.(readLock()||todayIso(),'')||day}catch(_){}requestAnimationFrame(()=>decorateChecks(day))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
