/* User-owned program builder. Built-ins and workout records are never rewritten. */
(()=>{
'use strict';
const cs=()=>lang()==='cs',clone=x=>structuredClone(x);
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isCustom=id=>/^custom_program_[a-z0-9_-]+$/i.test(String(id));
let draft=null,dialog=null,chooser=null;
function valid(p){return !!p&&typeof p.name==='string'&&p.name.trim().length>0&&p.name.length<=60&&Array.isArray(p.sessions)&&p.sessions.length>=1&&p.sessions.length<=7&&p.sessions.every(s=>typeof s.title==='string'&&s.title.trim()&&s.title.length<=60&&Array.isArray(s.items)&&s.items.length>0&&s.items.every(x=>typeof x.id==='string'&&Number.isInteger(x.sets)&&x.sets>=1&&x.sets<=20&&typeof x.range==='string'&&x.range.trim()&&x.range.length<=40))}
function registerPresets(programs={}){
 for(const [id,p]of Object.entries(programs||{}))if(isCustom(id)&&valid(p)){
  PLAN_PRESETS[id]={name_cs:p.name,name_en:p.name,plans:Object.fromEntries(['monday','wednesday','friday'].map((day,i)=>{const s=p.sessions[i%p.sessions.length];return [day,{title_cs:s.title,title_en:s.title,sub_cs:p.description||'',sub_en:p.description||'',items:clone(s.items)}]}))};
 }
}
function registerMeta(programs={}){
 for(const [id,p]of Object.entries(programs||{}))if(isCustom(id)&&valid(p))PROGRAM_META[id]={icon:'✎',sessions:0,label_cs:p.name,label_en:p.name,detail_cs:'Vlastní program · '+p.sessions.length+' tréninků v rotaci'+(p.description?' · '+p.description:''),detail_en:'Custom program · '+p.sessions.length+' sessions in rotation'+(p.description?' · '+p.description:'')};
}
function sessionsFor(id){
 try{const p=state.customPrograms?.[id];if(!isCustom(id)||!valid(p))return null;return p.sessions.map(s=>({titleCs:s.title,titleEn:s.title,subCs:p.description||'',subEn:p.description||'',items:s.items}))}catch(_){return null}
}
function registerCurrent(){
 const programs=state.customPrograms||{};
 for(const id of Object.keys(PLAN_PRESETS))if(isCustom(id)&&!programs[id]){delete PLAN_PRESETS[id];delete PROGRAM_META[id]}
 registerPresets(programs);registerMeta(programs);
}
function newSession(i){return {title:(cs()?'Trénink ':'Workout ')+(i+1),items:[]}}
function openBuilder(id=''){
 registerCurrent();
 const p=state.customPrograms?.[id];
 draft=p?{...clone(p),id,sessions:p.sessions.map((s,i)=>({...clone(s),items:clone(state.programSessionLayouts?.[id]?.['cycle_'+i]||s.items)}))}:{id:'',name:'',description:'',sessions:[newSession(0),newSession(1),newSession(2)]};
 if(!dialog){dialog=document.createElement('dialog');dialog.id='v198ProgramBuilder';dialog.innerHTML='<div class="modal"><div class="v198-builder-head"><h2></h2><button type="button" class="iconbtn" data-close>✕</button></div><p class="v198-builder-intro"></p><div class="v198-builder-body"></div></div>';document.body.appendChild(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close()}
 document.getElementById('programDialog')?.close();render();if(!dialog.open)dialog.showModal();
}
function render(){
 dialog.querySelector('h2').textContent=cs()?(draft.id?'Upravit vlastní program':'Vytvořit vlastní program'):(draft.id?'Edit custom program':'Create custom program');
 dialog.querySelector('.v198-builder-intro').textContent=cs()?'Sestav vlastní rotaci 1–7 tréninků. Uložení nepřepíše ostatní programy ani historii.':'Build a rotation of 1–7 sessions. Saving does not overwrite other programs or history.';
 const root=dialog.querySelector('.v198-builder-body');
 const save='<button type="button" class="primary full" data-save>'+(cs()?'Uložit program':'Save program')+'</button>';
 root.innerHTML=save+'<label>'+(cs()?'Název programu':'Program name')+'<input data-name maxlength="60" value="'+safe(draft.name)+'" placeholder="'+(cs()?'Např. Můj trénink':'E.g. My training')+'"></label><label>'+(cs()?'Popis (volitelné)':'Description (optional)')+'<textarea data-description maxlength="400" rows="2">'+safe(draft.description)+'</textarea></label><label>'+(cs()?'Počet tréninků v rotaci':'Sessions in rotation')+'<select data-count>'+Array.from({length:7},(_,i)=>'<option value="'+(i+1)+'" '+(draft.sessions.length===i+1?'selected':'')+'>'+(i+1)+'</option>').join('')+'</select></label>'+draft.sessions.map((s,i)=>'<section class="v198-session"><label>'+(cs()?'Název tréninku':'Session title')+'<input data-title="'+i+'" maxlength="60" value="'+safe(s.title)+'"></label><div class="v198-exercises">'+s.items.map((x,j)=>{
  const ex=EX[x.id],name=ex?itemName(ex):x.id;
  return '<div class="v198-exercise"><button class="v198-thumb" type="button" data-preview="'+safe(x.id)+'" aria-label="'+safe((cs()?'Zobrazit cvik: ':'View exercise: ')+name)+'">'+(ex?.guideThumb?'<img src="'+safe(ex.guideThumb)+'" alt="">':'🏋️')+'</button><strong>'+safe(name)+'</strong><div class="v198-prescription"><label>'+(cs()?'Série':'Sets')+'<input type="number" min="1" max="20" inputmode="numeric" data-sets="'+i+':'+j+'" value="'+x.sets+'"></label><label>'+(cs()?'Opakování / čas':'Reps / time')+'<input maxlength="40" data-range="'+i+':'+j+'" value="'+safe(x.range)+'"></label></div><div class="v198-row-actions"><button type="button" data-move="'+i+':'+j+':-1" '+(j===0?'disabled':'')+' aria-label="'+(cs()?'Posunout nahoru':'Move up')+'">↑</button><button type="button" data-move="'+i+':'+j+':1" '+(j===s.items.length-1?'disabled':'')+' aria-label="'+(cs()?'Posunout dolů':'Move down')+'">↓</button><button type="button" data-replace="'+i+':'+j+'">'+(cs()?'Změnit':'Replace')+'</button><button type="button" class="danger" data-remove="'+i+':'+j+'">'+(cs()?'Odebrat':'Remove')+'</button></div></div>';
 }).join('')+'</div>'+(!s.items.length?'<p>'+(cs()?'Zatím žádné cviky. Přidej alespoň jeden.':'No exercises yet. Add at least one.')+'</p>':'')+'<button type="button" class="secondary full" data-add="'+i+'">＋ '+(cs()?'Přidat cvik':'Add exercise')+'</button></section>').join('')+save;
 root.querySelector('[data-name]').oninput=e=>draft.name=e.target.value;
 root.querySelector('[data-description]').oninput=e=>draft.description=e.target.value;
 root.querySelector('[data-count]').onchange=e=>{const n=Number(e.target.value);if(n<draft.sessions.length&&!confirm(cs()?'Odebrat poslední tréninky z tohoto návrhu? Změna platí až po uložení.':'Remove the last sessions from this draft? Changes apply only after saving.')){e.target.value=draft.sessions.length;return}while(draft.sessions.length<n)draft.sessions.push(newSession(draft.sessions.length));draft.sessions.length=n;render()};
 root.querySelectorAll('[data-title]').forEach(b=>b.oninput=()=>draft.sessions[Number(b.dataset.title)].title=b.value);
 for(const key of ['sets','range'])root.querySelectorAll('[data-'+key+']').forEach(b=>b.oninput=()=>{const [i,j]=b.dataset[key].split(':').map(Number);draft.sessions[i].items[j][key]=key==='sets'?Number(b.value):b.value});
 root.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.add)));
 root.querySelectorAll('[data-replace]').forEach(b=>b.onclick=()=>choose(...b.dataset.replace.split(':').map(Number)));
 root.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{const [i,j]=b.dataset.remove.split(':').map(Number);draft.sessions[i].items.splice(j,1);render()});
 root.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{const [i,j,delta]=b.dataset.move.split(':').map(Number);const a=draft.sessions[i].items,k=j+delta;if(k<0||k>=a.length)return;[a[j],a[k]]=[a[k],a[j]];render()});
 root.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>openVideo(b.dataset.preview));
 root.querySelectorAll('[data-save]').forEach(b=>b.onclick=save);
}
function choose(i,j=-1){
 if(!chooser){chooser=document.createElement('dialog');chooser.id='v198ExerciseChooser';chooser.innerHTML='<div class="modal"><button type="button" class="iconbtn close">✕</button><h2></h2><input type="search"><div class="v198-picker-list"></div></div>';document.body.appendChild(chooser);chooser.querySelector('button').onclick=()=>chooser.close()}
 chooser.querySelector('h2').textContent=cs()?'Vyber cvik':'Choose exercise';const search=chooser.querySelector('input');search.placeholder=cs()?'Hledat cvik…':'Search exercise…';search.value='';
 const draw=()=>{const q=search.value.trim().toLocaleLowerCase(),list=allLibrary().filter(x=>(x.cs+' '+x.en).toLocaleLowerCase().includes(q));const box=chooser.querySelector('.v198-picker-list');box.innerHTML=list.map(x=>'<button type="button" data-id="'+safe(x.id)+'">'+(x.guideThumb?'<img src="'+safe(x.guideThumb)+'" alt="" loading="lazy">':'')+'<span><strong>'+safe(itemName(x))+'</strong><small>'+safe(categoryName(x.category))+'</small></span></button>').join('');box.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{const x=EX[b.dataset.id];if(!x)return;const prior=j>=0?draft.sessions[i].items[j]:null,item={id:x.id,sets:x.sets||3,range:x.range||'8–12',slotId:prior?.slotId||'custom-'+uid()};if(prior)draft.sessions[i].items[j]=item;else draft.sessions[i].items.push(item);chooser.close();render()})};search.oninput=draw;draw();if(!chooser.open)chooser.showModal();
}
function save(){
 draft.name=draft.name.trim();draft.description=draft.description.trim();draft.sessions.forEach(s=>s.title=s.title.trim());
 if(!valid(draft)){alert(cs()?'Vyplň název programu i tréninků, přidej do každého alespoň jeden cvik a nastav 1–20 sérií a rozsah opakování nebo času.':'Enter a program and session name, add at least one exercise to every session, and set 1–20 sets plus a rep or time range.');return}
 if(draft.id&&state.activeWorkout?.programId===draft.id){alert(cs()?'Nejdřív dokonči nebo zruš rozpracovaný trénink tohoto programu. Tvoje zapsané série zůstanou zachované.':'Finish or cancel this program’s active workout before editing it. Your logged sets remain intact.');return}
 const id=draft.id||'custom_program_'+uid();const p={name:draft.name,description:draft.description,sessions:clone(draft.sessions),updatedAt:Date.now()};
 state.customPrograms=state.customPrograms||{};state.customPrograms[id]=p;
 state.programSessionLayouts=state.programSessionLayouts||{};state.programSessionLayouts[id]=Object.fromEntries(p.sessions.map((s,i)=>['cycle_'+i,clone(s.items)]));
 registerCurrent();saveState();dialog.close();openProgramPicker();showToast(cs()?'Vlastní program uložen. Aktivuj ho výběrem v seznamu.':'Custom program saved. Select it in the list to activate it.');
}
function decoratePicker(){
 const d=document.getElementById('programDialog'),list=document.getElementById('programDialogList');if(!d||!list)return;
 let panel=d.querySelector('.v198-program-actions');if(!panel){panel=document.createElement('div');panel.className='v198-program-actions';list.before(panel)}
 panel.innerHTML='<button type="button" class="primary full" data-create>＋ '+(cs()?'Vytvořit vlastní program':'Create custom program')+'</button>';
 panel.querySelector('[data-create]').onclick=()=>openBuilder();
 for(const [id,p]of Object.entries(state.customPrograms||{}))if(valid(p)){const b=document.createElement('button');b.type='button';b.className='secondary full';b.textContent=(cs()?'Upravit: ':'Edit: ')+p.name;b.onclick=()=>openBuilder(id);panel.appendChild(b)}
}
function install(){
 registerCurrent();const native=openProgramPicker;openProgramPicker=function(...args){registerCurrent();const r=native.apply(this,args);decoratePicker();return r};window.openProgramPicker=openProgramPicker;
 const normal=normalizeProgramJourney;normalizeProgramJourney=function(...args){registerCurrent();return normal.apply(this,args)};window.normalizeProgramJourney=normalizeProgramJourney;
}
window.GymV198={isCustom,valid,registerPresets,registerMeta,sessionsFor,registerCurrent,openBuilder};
document.addEventListener('DOMContentLoaded',install,{once:true});
})();
