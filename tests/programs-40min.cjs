process.chdir(require('path').join(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),assert=require('assert');
class El{
 constructor(){this.dataset={};this.handlers={};this.open=true;this.classList={remove(){},toggle(){}};this.style={}}
 addEventListener(k,f){(this.handlers[k]??=[]).push(f)} click(){for(const f of this.handlers.click||[])f()}
 close(){this.open=false} showModal(){this.open=true}
 set innerHTML(s){this.html=s;this.children=[...s.matchAll(/data-busy-step="(\d+)"/g)].map(m=>{const e=new El;e.dataset.busyStep=m[1];return e})}
 get innerHTML(){return this.html}
 querySelectorAll(s){return s==='[data-busy-step]'?this.children||[]:[]}
}
const dlg=new El,list=new El,auto=new El;
dlg.querySelector=s=>s==='.v137-session-list'?list:s==='.v137-session-auto'?auto:null;
const nodes=Object.fromEntries(['programSessionsDialog','programSessionsList','programSessionsTitle','programSessionsSubtitle','libraryDialog'].map(id=>[id,new El]));
const callbacks=[],local=new Map();let language='en',manualDay='';
const c={console,Date,JSON,Number,String,Array,Object,Math,Map,Set,Promise,structuredClone,
 document:{readyState:'loading',addEventListener:(k,f)=>{if(k==='DOMContentLoaded')callbacks.push(f)},querySelector:s=>s==='#v137SessionDialog'?dlg:null,querySelectorAll:()=>[],getElementById:id=>nodes[id]||null},
localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)},requestAnimationFrame(){},setTimeout(){},
state:{programJourney:{programId:'upper_lower_4_40',sessionIndex:0},programSessionLayouts:{},days:{monday:{order:[],entries:{}}},activeWorkout:null},
PLAN_PRESETS:{},PROGRAM_META:{},EX:{assisted_dips:{}},LIBRARY:[],lang:()=>language,today:()=> '2026-10-14',selectedWorkoutDate:'2026-10-14',
v124ProgramId:()=>c.state.programJourney.programId,showToast(){},saveState(){},clearWorkoutReminder(){},prepareDay(){},dayInstances(){return []},
renderDay(){},renderLive(){},addExercise(){},replaceExercise(){},deleteSavedSet(){},currentLive:()=>null,currentProgramDay:()=> 'monday',
itemName:x=>x.en||x.id,uid:()=> 'test',confirm:()=>true,openLibrary(){},openProgramSessions(){},
GymV137:{setManualSession:(iso,day)=>manualDay=day},entry:(day,id)=>c.state.days[day].entries[id]||(c.state.days[day].entries[id]={sets:[]})
};
c.window=c;vm.createContext(c);
vm.runInContext(fs.readFileSync('v190-programs.js','utf8'),c);
c.GymV190.registerPresets();c.GymV190.registerMeta();
for(const p of Object.values(c.GymV190.programs))for(const s of p.sessions)for(const x of s.items)c.EX[x.id]={id:x.id,en:x.id,sets:x.sets,range:x.range};
const three=c.GymV190.THREE,four=c.GymV190.FOUR;
assert.deepEqual(c.GymV190.sessionsFor(three).map(s=>s.items.reduce((a,x)=>a+x.sets,0)),[14,12,14]);
assert.deepEqual(c.GymV190.sessionsFor(four).map(s=>s.items.reduce((a,x)=>a+x.sets,0)),[14,13,14,13]);
const source=fs.readFileSync('index.html','utf8');
const libraryIds=new Set([...source.matchAll(/"id":"([a-z0-9_]+)"/g)].map(x=>x[1]));
for(const p of Object.values(c.GymV190.programs))for(const s of p.sessions)for(const x of s.items)assert.ok(libraryIds.has(x.id),'Missing exercise '+x.id);
vm.runInContext(fs.readFileSync('v165-core.js','utf8'),c);
vm.runInContext(fs.readFileSync('v187-editor.js','utf8'),c);
callbacks.forEach(f=>f());
for(let i=0;i<12;i++){c.state.programJourney.sessionIndex=i;assert.equal(c.GymV165.busySession().titleEn,c.GymV190.sessionsFor(four)[i%4].titleEn);assert.equal(c.GymV165.layoutKey(),'cycle_'+i%4)}
c.state.programJourney.sessionIndex=8;dlg.open=true;c.GymV165.decorateChooser();
assert.equal(list.children.length,4);assert.ok(list.innerHTML.includes('Lower Body B'));list.children[3].click();
assert.equal(c.state.programJourney.sessionIndex,11);assert.equal(manualDay,'friday');
const fourth=c.dayInstances('monday');
assert.deepEqual(fourth.map(x=>x.exerciseId),['hack_squat','seated_leg_curl','hip_thrust','standing_calf_raise','pallof_press']);
c.GymV187.openEditor();assert.equal(c.GymV187.sessions().length,4);
const items=c.GymV187.layout(four,'cycle_3'),oldLength=items.length,slot=items[0].slotId;
c.GymV187.remove(four,'cycle_3',slot);assert.equal(c.GymV165.sessionLayout().length,oldLength-1);
assert.equal(c.GymV187.layout(four,'cycle_0').length,6);
c.GymV187.choose('cycle_3');c.addExercise('monday','machine_chest_press');assert.equal(c.GymV165.sessionLayout().at(-1).id,'machine_chest_press');
assert.ok(c.GymV190.guideMarkup(three).includes('Progress the load'));
language='cs';assert.ok(c.GymV190.guideMarkup(four).includes('Přidávání váhy'));
c.state.programJourney.programId='busy_week';c.state.programJourney.sessionIndex=6;assert.equal(c.GymV165.busySession().titleEn,'Legs A');
assert.equal(c.GymV190.sessionFor(four,7).titleEn,'Lower Body B');
assert.equal(c.GymV190.sessionFor('busy_week',7).titleEn,'Pull');
assert.ok(source.indexOf('GymV190?.registerPresets()')<source.indexOf('BASE_PLANS=PLAN_PRESETS[state.settings.workoutStyle]'));
console.log('PASS: approved exercise lists and set totals, known exercise IDs, 4-step cycling, fourth-session picker, persistent edits to fourth session, plan isolation, bilingual guides, persisted program registration and Busy Week compatibility.');
