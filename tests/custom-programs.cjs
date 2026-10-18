process.chdir(require('path').join(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('index.html','utf8');
function fn(name){const start=source.indexOf('function '+name+'(');const line=source.slice(start,source.indexOf('\n',start));return line.endsWith('}')?line:source.slice(start,source.indexOf('\n}',start)+2)}
const c={window:null,console,Date,JSON,Number,String,Array,Object,Math,Map,Set,Promise,structuredClone,document:{readyState:'loading',addEventListener(){},querySelectorAll:()=>[],getElementById:()=>null},
 state:{settings:{workoutStyle:'balanced'},programJourney:{programId:'balanced',sessionIndex:0},days:{},customPrograms:{}},
 PLAN_PRESETS:{balanced:{name_cs:'Built-in',plans:{}}},PROGRAM_META:{balanced:{label_cs:'Built-in'}},EX:{row:{id:'row',cs:'Přítahy',en:'Row'}},LIBRARY:[],lang:()=> 'en',
 renderDay(){},currentProgramDay:()=> 'monday',localStorage:{getItem:()=>null,setItem(){}},saveState(){},showToast(){},today:()=> '2026-10-18',itemName:x=>x.en,
 cloudUser:null,VERSION:198,defaultState:()=>({}),migrateState:x=>structuredClone(x),cloneState:structuredClone};c.window=c;vm.createContext(c);
for(const f of ['v190-programs.js','v198-custom-programs.js','v165-core.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const g=c.GymV198;
for(let count=1;count<=7;count++){
 const id='custom_program_test'+count,p={name:'My '+count,description:'Personal rotation',updatedAt:count,sessions:Array.from({length:count},(_,i)=>({title:'Session '+(i+1),items:[{id:'row',sets:i+1,range:'8–12',slotId:'slot-'+i}]}))};
 assert.ok(g.valid(p));c.state.customPrograms[id]=p;g.registerCurrent();
 assert.equal(c.PLAN_PRESETS[id].plans.friday.title_en,'Session '+(2%count+1));
 assert.equal(c.PROGRAM_META[id].label_en,p.name);assert.equal(c.PLAN_PRESETS.balanced.name_cs,'Built-in');
 c.state.programJourney={programId:id,sessionIndex:0};
 assert.ok(c.GymV190.isFourDay(id));assert.equal(c.GymV190.sessionsFor(id).length,count);
 for(let step=0;step<count*2;step++){c.state.programJourney.sessionIndex=step;assert.equal(c.GymV165.busySession().titleEn,'Session '+(step%count+1));assert.equal(c.GymV165.layoutKey(),'cycle_'+step%count)}
 assert.ok(c.GymV190.guideMarkup(id).includes('Personal rotation'));
}
assert.equal(g.valid({name:'Empty',sessions:[]}),false);assert.equal(g.valid({name:'Empty',sessions:[{title:'A',items:[]}]}),false);
assert.equal(g.isCustom('balanced'),false);assert.equal(g.isCustom('__proto__'),false);
// Real state merge keeps distinct custom programs and saved workout records from both sides.
for(const name of ['stateActivityTimestamp','uniqueRecords','applySetEdits','mergeStates'])vm.runInContext(fn(name),c);
const base={meta:{modifiedAt:1},history:{},workouts:[],progress:[],customExercises:[],days:{},programSessionLayouts:{},sessionFinalizations:{}};
const a={...base,customPrograms:{custom_program_a:c.state.customPrograms.custom_program_test1},workouts:[{sessionKey:'old-session',date:'2026-10-01'}]};
const b={...base,meta:{modifiedAt:2},customPrograms:{custom_program_b:c.state.customPrograms.custom_program_test2}};
const merged=c.mergeStates(a,b);assert.ok(merged.customPrograms.custom_program_a&&merged.customPrograms.custom_program_b);assert.equal(merged.workouts[0].sessionKey,'old-session');
const reloaded=JSON.parse(JSON.stringify(merged));c.state=reloaded;g.registerCurrent();assert.equal(c.PLAN_PRESETS.custom_program_b.plans.wednesday.title_en,'Session 2');assert.equal(c.PLAN_PRESETS.custom_program_test7,undefined,'Other account programs must not remain in the picker');
assert.ok(source.indexOf('GymV198?.registerPresets(raw?.customPrograms)')>source.indexOf('function migrateState(raw)'));
const sw=fs.readFileSync('sw.js','utf8');assert.ok(sw.includes('v198-custom-programs.js')&&sw.includes('hotfix-v198.css'));
console.log('PASS: custom 1–7 session rotations, exact chooser labels, preset reload, validation, built-in preservation, custom-program merge and account isolation.');
