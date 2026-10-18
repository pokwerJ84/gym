process.chdir(require('path').join(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync('index.html','utf8');
function fn(name){const start=src.indexOf('function '+name+'(');const line=src.slice(start,src.indexOf('\n',start));return line.endsWith('}')?line:src.slice(start,src.indexOf('\n}',start)+2)}
const completed=()=>({kg:'20',reps:'10',_complete:true});
const inst={instanceId:'base:monday:row',exerciseId:'row'},meta={id:'row',mode:'weight',sets:4};
const initial=()=>({version:197,meta:{modifiedAt:1},activeWorkout:{sessionKey:'s',date:'2026-10-18',day:'monday',programId:'balanced',restEndAt:999},days:{monday:{date:'2026-10-18',programSessionKey:'s',entries:{[inst.instanceId]:{sets:Array.from({length:4},completed),done:true,notes:''}}}},history:{row:[{sessionKey:'s',date:'2026-10-18',day:'monday',mode:'weight',sets:Array.from({length:4},()=>({kg:'20',reps:'10'}))},{sessionKey:'old',date:'2026-10-10',sets:[{kg:'10',reps:'8'}]}]},workouts:[],progress:[],customExercises:[],sessionFinalizations:{}});
let stored,allow=true,restStops=0;
const c={console,Date,JSON,Number,String,Object,Array,Map,Set,Math,Promise,structuredClone,state:initial(),VERSION:197,cloudUser:null,
 document:{readyState:'loading',addEventListener(){},getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]},
 currentLive:()=>inst,entry:(d,id)=>c.state.days[d].entries[id],metaFor:()=>meta,t:x=>x,lang:()=> 'en',confirm:()=>allow,today:()=> '2026-10-18',
 saveState(){stored=JSON.stringify(c.state)},renderLive(){},renderDay(){},refreshTodayPreviewStatus(){},showToast(){},clearWorkoutReminder(){},
 skipRest(){restStops++;c.state.activeWorkout.restEndAt=0},openProgramSessions(){},addExercise(){},replaceExercise(){},requestAnimationFrame(){},lastSetUndo:null,
 defaultState:()=>({}),migrateState:x=>structuredClone(x),cloneState:structuredClone,
 lastRecord:()=>({sets:[{kg:'20',reps:'10'}]}),prefillFieldsForMode:()=>['kg','reps']
};c.window=c;vm.createContext(c);
for(const name of ['normalizeActiveSetFlags','targetSetCount','recordSetEdit','applySetEdits','deleteSavedSet','addExtraSetCurrent','upsertCurrentExerciseHistory','syncCurrentExerciseHistory','ensurePrefill','stateActivityTimestamp','uniqueRecords','mergeStates'])vm.runInContext(fn(name),c);
vm.runInContext('const deleteSavedSetV122=deleteSavedSet;deleteSavedSet=function(index){deleteSavedSetV122(index);syncCurrentExerciseHistory()};',c);
vm.runInContext(fs.readFileSync('v187-editor.js','utf8').replace("if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();",'install();'),c);
const e=()=>c.entry('monday',inst.instanceId),stale=structuredClone(c.state);
for(let remaining=3;remaining>=0;remaining--){
 c.deleteSavedSet(0);
 assert.equal(c.targetSetCount(meta,e()),remaining);assert.equal(e().sets.length,remaining);
 c.state=JSON.parse(stored);c.normalizeActiveSetFlags(c.state);c.applySetEdits(c.state,c.state,{});
 assert.equal(e().sets.filter(x=>x._complete).length,remaining,'Restart restored deleted set');
 const remote=structuredClone(stale);remote.meta.modifiedAt=9999999999999;
 c.state=c.mergeStates(c.state,remote);
 assert.equal(e().sets.length,remaining,'Cloud restored deleted set');
 assert.equal(c.state.history.row.find(r=>r.sessionKey==='s')?.sets.length||0,remaining);
 assert.ok(c.state.history.row.some(r=>r.sessionKey==='old'),'Unrelated history lost');
}
assert.equal(restStops,4);assert.equal(e().done,false);c.addExtraSetCurrent();assert.equal(c.targetSetCount(meta,e()),1);assert.equal(e().sets[0]._complete,false);
c.normalizeActiveSetFlags(c.state);assert.equal(e().sets[0]._complete,false);
// Previous weights are draft input only, not saved training.
c.ensurePrefill('monday',inst,meta,e(),0);assert.equal(e().sets[0].kg,'20');assert.equal(e().sets[0]._complete,false);
e().sets[0]=completed();e().done=true;c.recordSetEdit('monday',inst,meta,e());c.syncCurrentExerciseHistory();
c.state=c.mergeStates(stale,c.state);assert.equal(e().sets.length,1);assert.equal(e().sets[0]._complete,true);
// Explicit flags survive startup even if a stale exercise-level done flag is present.
e().sets.push({kg:'20',reps:'10',_complete:false});e().done=true;c.normalizeActiveSetFlags(c.state);assert.equal(e().sets[1]._complete,false);
// Cancelling does not remove data or stop rest.
allow=false;const before=JSON.stringify(e()),stops=restStops;c.deleteSavedSet(0);assert.equal(JSON.stringify(e()),before);assert.equal(restStops,stops);allow=true;
// Saved snapshots and history are corrected together without altering other sessions.
c.state=initial();c.state.workouts=[{sessionKey:'s',date:'2026-10-18',exerciseSnapshot:[{instanceId:inst.instanceId,sets:Array.from({length:4},completed),done:true}]}];
c.deleteSavedSet(0);const merged=c.mergeStates(c.state,stale);assert.equal(merged.workouts[0].exerciseSnapshot[0].sets.length,3);assert.equal(merged.history.row.find(r=>r.sessionKey==='s').sets.length,3);
// Default unfinished sets can also be removed and the row remains removed after restart.
e().sets=[{_complete:false}];e().targetSetsOverride=1;e().done=false;c.GymV187.deleteSet(0);assert.equal(c.targetSetCount(meta,e()),0);assert.equal(e().sets.length,0);
console.log('PASS: delete 4→0, restart, stale cloud in both merge directions, historical snapshots, cancel/rest, add after deleting all, editable base targets and prefills never marked complete.');
