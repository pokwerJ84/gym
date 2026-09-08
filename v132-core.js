/* Gym Tracker v132: prefill each new set from the last completed set */
(()=>{
'use strict';
const V={release:'v132'};
const fieldsFor=mode=>{
  if(mode==='weight')return ['kg','reps'];
  if(mode==='reps')return ['reps'];
  if(mode==='time')return ['seconds'];
  if(mode==='sideweight')return ['kg','left','right'];
  if(mode==='sidetime')return ['leftSeconds','rightSeconds'];
  return [];
};
const hasValue=(set,fields)=>!!set&&fields.some(k=>String(set?.[k]??'').trim()!=='');
const copyFields=(target,source,fields)=>{
  fields.forEach(k=>{const v=source?.[k];if(v!==undefined&&v!==null&&String(v).trim()!=='')target[k]=String(v)});
};
function latestHistorySet(exerciseId,fields){
  try{
    const record=typeof lastRecord==='function'?lastRecord(exerciseId):null;
    const sets=Array.isArray(record?.sets)?record.sets:[];
    for(let i=sets.length-1;i>=0;i--)if(hasValue(sets[i],fields))return sets[i];
  }catch(_){}
  return null;
}
function previousCompletedSet(e,index,fields){
  const sets=Array.isArray(e?.sets)?e.sets:[];
  for(let i=index-1;i>=0;i--){const s=sets[i];if(s?._complete===true&&hasValue(s,fields))return s}
  return null;
}
function install(){
  try{
    const native=typeof ensurePrefill==='function'?ensurePrefill:null;
    if(!native||native.__v132)return;
    const f=function(day,inst,m,e,index=0){
      const fields=fieldsFor(m?.mode);
      if(!fields.length||m?.mode==='cardio')return native.call(this,day,inst,m,e,index);
      e.sets=Array.isArray(e.sets)?e.sets:[];
      const existing=e.sets[index]||{};
      if(hasValue(existing,fields))return native.call(this,day,inst,m,e,index);
      const source=previousCompletedSet(e,index,fields)||latestHistorySet(m?.id,fields);
      if(!source)return native.call(this,day,inst,m,e,index);
      const next={...existing};
      copyFields(next,source,fields);
      next._complete=false;
      e.sets[index]=next;
      return next;
    };
    f.__v132=true;f.__native=native;
    ensurePrefill=f;window.ensurePrefill=f;
  }catch(e){console.warn('[v132 prefill]',e)}
}
V.diagnostics=()=>({release:V.release,prefillHook:typeof ensurePrefill==='function'&&!!ensurePrefill.__v132});
window.GymV132=V;window.gymV132Diagnostics=V.diagnostics;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
