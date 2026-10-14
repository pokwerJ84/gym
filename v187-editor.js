/* Persistent program exercise editor and deletable accidental extra sets. */
(()=>{
'use strict';
const cs=()=>lang()==='cs',q=(s,r=document)=>r.querySelector(s);
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let pending=null,editingProgram='';
const pid=()=>v124ProgramId();
function sessions(program=pid()){
 if(program==='busy_week')return (window.GymV165?.busySessions||[]).map((s,i)=>({key:'busy_'+i,title:cs()?s.titleCs:s.titleEn,items:s.items}));
 return Object.entries(PLAN_PRESETS[program]?.plans||{}).map(([key,p])=>({key,title:p[cs()?'title_cs':'title_en']||p.title_en||key,items:p.items||[]}));
}
function layout(program,key){
 state.programSessionLayouts=state.programSessionLayouts||{};
 const saved=state.programSessionLayouts[program]||(state.programSessionLayouts[program]={});
 if(!Array.isArray(saved[key])){
  const s=sessions(program).find(x=>x.key===key);
  saved[key]=(s?.items||[]).map((x,i)=>({...x,slotId:x.slotId||(program==='busy_week'?'slot-'+i+'-'+x.id:x.id)}));
 }
 return saved[key];
}
function persist(){
 saveState();
 if(typeof cloudUser!=='undefined'&&cloudUser&&typeof saveCloud==='function')Promise.resolve(saveCloud()).catch(e=>console.warn('[program editor sync]',e));
 if(typeof renderDay==='function')renderDay(currentProgramDay());
}
function openEditor(){
 editingProgram=pid();pending=null;
 const d=document.getElementById('programSessionsDialog'),list=document.getElementById('programSessionsList');
 if(!d||!list)return;
 document.getElementById('programSessionsTitle').textContent=cs()?'Upravit cviky programu':'Edit program exercises';
 document.getElementById('programSessionsSubtitle').textContent=cs()?'Změny se ukládají do tohoto programu a platí i pro další tréninky.':'Changes are saved to this program for future workouts.';
 list.innerHTML=sessions(editingProgram).map(s=>'<section class="v124-session-card"><div class="v124-session-head"><strong>'+safe(s.title)+'</strong></div><div class="v124-session-exercises">'+layout(editingProgram,s.key).map(item=>{
  const x=EX[item.id];
  return '<div class="v124-session-exercise"><span class="program-picker-icon">🏋️</span><div><strong>'+safe(x?itemName(x):item.id)+'</strong><small>'+safe((item.sets||x?.sets||3)+' × '+(item.range||x?.range||''))+'</small></div><div class="v124-session-tools"><button type="button" data-change="'+safe(item.slotId)+'" data-session="'+safe(s.key)+'">'+(cs()?'Změnit':'Change')+'</button><button type="button" class="remove" data-remove="'+safe(item.slotId)+'" data-session="'+safe(s.key)+'">'+(cs()?'Odebrat':'Remove')+'</button></div></div>';
 }).join('')+'</div><div class="v124-session-footer"><button type="button" class="add" data-add="'+safe(s.key)+'">＋ '+(cs()?'Přidat cvik':'Add exercise')+'</button></div></section>').join('');
 list.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>choose(b.dataset.add));
 list.querySelectorAll('[data-change]').forEach(b=>b.onclick=()=>choose(b.dataset.session,b.dataset.change));
 list.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>remove(editingProgram,b.dataset.session,b.dataset.remove));
 if(!d.open)d.showModal();
}
function choose(key,slot=''){
 pending={program:editingProgram,key,slot};
 try{v124SessionEditTarget=null}catch(_){}
 document.getElementById('programSessionsDialog')?.close();
 openLibrary(currentProgramDay(),'add');
}
function apply(id){
 const p=pending,x=EX[id];if(!p||!x)return;
 const items=layout(p.program,p.key);
 if(p.slot){
  const i=items.findIndex(v=>v.slotId===p.slot);if(i<0)return;
  if(!confirm(cs()?'Nahradit tento cvik v programu? Jeho aktuální zápis se vymaže.':'Replace this exercise in the program? Its current log will be cleared.'))return;
  clearEntry(p.program,p.key,p.slot);
  items[i]={...items[i],id,sets:x.sets||3,range:x.range||'8–12'};
 }
 else items.push({slotId:'custom-'+uid(),id,sets:x.sets||3,range:x.range||'8–12'});
 pending=null;document.getElementById('libraryDialog')?.close();persist();openEditor();
}
function remove(program,key,slot){
 const items=layout(program,key),i=items.findIndex(x=>x.slotId===slot);if(i<0)return;
 if(items.length<=1)return showToast(cs()?'V session musí zůstat alespoň jeden cvik.':'Keep at least one exercise in the session.');
 if(!confirm(cs()?'Odebrat tento cvik z programu?':'Remove this exercise from the program?'))return;
 items.splice(i,1);clearEntry(program,key,slot);persist();openEditor();
}
function clearEntry(program,key,slot){
 if(program!==pid())return;
 const id=program==='busy_week'?'busy:'+Number(key.slice(5))+':'+slot:'base:'+key+':'+slot;
 const days=program==='busy_week'?Object.values(state.days||{}):[state.days?.[key]];
 days.filter(Boolean).forEach(day=>{
  if(day.entries)delete day.entries[id];
  if(day.order)day.order=day.order.filter(x=>x!==id);
 });
}
function deleteSet(index){
 const inst=currentLive(),w=state.activeWorkout;if(!inst||!w)return;
 const e=entry(w.day,inst.instanceId),m=metaFor(w.day,inst),target=targetSetCount(m,e);
 if(!Number.isInteger(index)||index<0||index>=target)return;
 if(e.sets?.[index]?._complete)return deleteSavedSet(index);
 /* Only added, unfinished sets reduce the target. Default sets are retained. */
 if(index<(Number(m.sets)||1))return;
 if(!confirm(cs()?'Smazat tuto přidanou sérii?':'Delete this added set?'))return;
 (e.sets||[]).splice(index,1);e.extraTargetSets=Math.max(Number(m.sets)||1,target-1);
 e.done=(e.sets||[]).slice(0,e.extraTargetSets).filter(s=>s?._complete).length>=e.extraTargetSets;
 w.awaitingFinish=false;w.workoutReminderAt=0;
 if(typeof clearWorkoutReminder==='function')clearWorkoutReminder();
 try{lastSetUndo=null}catch(_){}
 saveState();if(typeof syncCurrentExerciseHistory==='function')syncCurrentExerciseHistory();
 refreshTodayPreviewStatus(w.day,inst.instanceId);renderLive();
 showToast(cs()?'Série smazána.':'Set deleted.');
}
function enhanceSets(){
 const inst=currentLive(),w=state.activeWorkout;if(!inst||!w)return;
 const e=entry(w.day,inst.instanceId),m=metaFor(w.day,inst);if(m.mode==='cardio')return;
 document.querySelectorAll('#liveContent .v123-set-row').forEach(row=>{
  const n=parseInt(q('.v123-set-number',row)?.textContent||'',10),index=n-1;
  if(!Number.isFinite(index)||index<0)return;
  if(!e.sets?.[index]?._complete&&index<(Number(m.sets)||1))return;
  /* Replace older terse delete controls with one explicit action per row. */
  row.querySelectorAll('.v123-set-actions button,.v184-delete-set,.v187-delete-set').forEach(b=>{
   if(/deleteSavedSet|delete.?set/i.test(b.getAttribute('onclick')||'')||b.classList.contains('v187-delete-set'))b.remove();
  });
  const b=document.createElement('button');b.type='button';b.className='danger v187-delete-set';
  b.textContent=cs()?'Smazat sérii':'Delete set';
  b.style.cssText='grid-column:1/-1;justify-self:end;padding:8px 12px;font-size:12px';
  b.onclick=()=>deleteSet(index);row.appendChild(b);
 });
}
function addEditorAction(){
 document.querySelectorAll('.v137-session-control').forEach(box=>{
  if(q('.v187-edit-program',box))return;
  const b=document.createElement('button');b.type='button';b.className='v187-edit-program';
  b.textContent=cs()?'Upravit cviky':'Edit exercises';b.onclick=openEditor;box.appendChild(b);
 });
 const chooser=q('#v137SessionDialog .v137-session-shell');
 if(chooser&&!q('.v187-edit-program',chooser)){
  const b=document.createElement('button');b.type='button';b.className='secondary full v187-edit-program';b.style.marginTop='12px';
  b.textContent=cs()?'Upravit cviky programu':'Edit program exercises';
  b.onclick=()=>{document.getElementById('v137SessionDialog')?.close();openEditor()};chooser.appendChild(b);
 }
}
function install(){
const nativeOpen=openProgramSessions;
openProgramSessions=openEditor;window.openProgramSessions=openEditor;
const nativeAdd=addExercise,nativeReplace=replaceExercise;
addExercise=function(day,id){return pending?apply(id):nativeAdd.apply(this,arguments)};
replaceExercise=function(day,slot,id){return pending?apply(id):nativeReplace.apply(this,arguments)};
window.addExercise=addExercise;window.replaceExercise=replaceExercise;
const nativeRender=renderLive;
renderLive=function(){const result=nativeRender.apply(this,arguments);enhanceSets();return result};window.renderLive=renderLive;
const nativeDay=renderDay;
renderDay=function(){const result=nativeDay.apply(this,arguments);requestAnimationFrame(addEditorAction);return result};window.renderDay=renderDay;
document.addEventListener('click',ev=>{
 const b=ev.target?.closest?.('button');
 if(b?.onclick===nativeOpen){ev.preventDefault();ev.stopImmediatePropagation();openEditor()}
 if(b?.closest?.('.v137-session-control'))setTimeout(addEditorAction,0);
},true);
document.getElementById('libraryDialog')?.addEventListener('close',()=>{pending=null});
window.GymV187={sessions,layout,choose,apply,remove,deleteSet,enhanceSets,openEditor,addEditorAction};
requestAnimationFrame(addEditorAction);enhanceSets();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
