process.chdir(require('path').join(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),assert=require('assert');
let now=1000,position='hip',setIndex=0,language='cs',saved=0,intervalCallback;
const input={value:'',dispatchEvent(){}};
const output={},fill={hidden:true};
const timer={querySelector:s=>s==='[data-clock]'?output:fill};
const c={window:null,console,Math,Number,String,Object,Array,Date:{now:()=>now},navigator:{vibrate(){}},Event:class{},
 document:{addEventListener(){},getElementById:id=>id==='v200HoldTimer'?timer:id.startsWith('live')?input:null},
 setInterval:f=>(intervalCallback=f,1),clearInterval:()=>intervalCallback=null,
 state:{activeWorkout:{sessionKey:'mobility-1',day:'monday',programId:'back_hips_mobility'},programJourney:{programId:'back_hips_mobility',sessionIndex:0},programSessionLayouts:{}},
 currentLive:()=>({instanceId:position}),firstIncompleteSet:()=>setIndex,entry:()=>({}),metaFor:()=>({id:'hip_flexor_stretch',mode:'sidetime'}),
 lang:()=>language,saveState(){saved++},PLAN_PRESETS:{balanced:{name_cs:'Original',plans:{}}},PROGRAM_META:{balanced:{label_cs:'Original'}},
 LIBRARY:[],EX:{},itemName:x=>x.cs,requestAnimationFrame(){},renderLive(){},renderDay(){},backToExerciseList(){}};
c.window=c;vm.createContext(c);
for(const f of ['v200-mobility.js','v190-programs.js','v165-core.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const m=c.GymV200,before=c.LIBRARY.length;m.registerLibrary(c.LIBRARY);m.registerLibrary(c.LIBRARY);assert.equal(c.LIBRARY.length,before+4);
const source=fs.readFileSync('index.html','utf8');const known=new Set([...source.matchAll(/id["']?\s*:\s*["']([^"']+)["']/g)].map(x=>x[1]));
for(const x of m.definitions){known.add(x.id);assert.ok(x.tips.cs.length>=4&&x.tips.en.length>=4);assert.ok(x.primaryMuscles.cs.length);assert.ok(x.guideExact);assert.equal(x.sets,1);assert.ok(['hamstrings','quads'].includes(x.category),'Use existing category IDs');assert.ok(x.mode==='reps'||x.mode==='sidetime');assert.ok(fs.existsSync(x.guideImage))}
c.GymV190.registerPresets();c.GymV190.registerMeta();
for(const id of [m.LONG,m.DAILY]){
 const n=m.programs[id].sessions.length;
 assert.equal(n,id===m.LONG?3:1);assert.ok(c.GymV190.isFourDay(id));
 c.state.programJourney.programId=id;
 for(let step=0;step<n*3;step++){
  c.state.programJourney.sessionIndex=step;
  assert.equal(c.GymV165.busySession().titleCs,m.programs[id].sessions[step%n].titleCs);
  assert.equal(c.GymV165.layoutKey(),'cycle_'+step%n);
 }
 for(const s of m.programs[id].sessions)for(const item of s.items){assert.ok(known.has(item.id),item.id);assert.equal(item.sets,1)}
 for(const code of ['cs','en']){language=code;const html=c.GymV190.guideMarkup(id);assert.ok(html.includes(code==='cs'?'Zahřátí':'Warm-up'));assert.ok(!html.includes('1–2 clean reps'));assert.ok(html.includes(code==='cs'?'Časovač':'Timer'))}
}
assert.equal(c.PLAN_PRESETS.balanced.name_cs,'Original');assert.equal(c.PROGRAM_META.balanced.label_cs,'Original');
const active=c.state.activeWorkout;
assert.equal(m.applyDose(m.LONG,2),false,'Do not rewrite prescriptions during a session');
c.state.activeWorkout=null;
c.state.programSessionLayouts[m.LONG]={cycle_0:[{id:'custom',sets:5,range:'8',slotId:'custom-slot'},{id:'hip_flexor_stretch',sets:1,range:'20',slotId:'hold-slot'}]};
const old=c.state.programSessionLayouts[m.LONG].cycle_0;
assert.ok(m.applyDose(m.LONG,2));
const updated=c.state.programSessionLayouts[m.LONG].cycle_0;
assert.equal(updated[0].id,'custom');assert.equal(updated[0].sets,5);assert.equal(updated[1].slotId,'hold-slot');assert.equal(updated[1].sets,2);assert.equal(updated[1].range,'30');assert.equal(old[1].sets,1);
assert.ok(m.applyDose(m.LONG,1));assert.equal(c.state.programSessionLayouts[m.LONG].cycle_0[1].sets,1);
assert.equal(m.applyDose(m.LONG,3),false);assert.equal(m.applyDose('balanced',2),false);
for(const s of m.programs[m.LONG].sessions)for(const id of ['hip_flexor_stretch','supine_hamstring_stretch','supine_figure_four'])assert.ok(s.items.some(x=>x.id===id),'Priority hold missing from session');
assert.ok(m.applyDose(m.DAILY,2));assert.equal(c.state.programSessionLayouts[m.DAILY].cycle_0.find(x=>x.id==='supine_hamstring_stretch').sets,2);
c.state.activeWorkout=active;saved=0;
assert.equal(m.startClock('left',0),false);assert.equal(m.startClock('left',2.5),false);assert.equal(m.startClock('left',181),false);
assert.ok(m.startClock('left',20));assert.equal(m.remaining(),20);assert.equal(m.fillTime(),false);assert.equal(saved,0);
now+=20000;intervalCallback();assert.equal(m.remaining(),0);assert.equal(fill.hidden,false);assert.equal(input.value,'');assert.equal(saved,0);
assert.ok(m.fillTime());assert.equal(input.value,'20');assert.equal(saved,0,'Filling must not save or complete a set');
assert.ok(m.startClock('right',30));position='other';intervalCallback();assert.equal(m.remaining(),0);assert.equal(m.fillTime(),false,'Switching exercise invalidates timer');
position='hip';assert.ok(m.startClock('left',20));setIndex=1;assert.equal(m.fillTime(),false);intervalCallback();assert.equal(m.remaining(),0);
const sw=fs.readFileSync('sw.js','utf8');assert.ok(sw.includes('v200-mobility.js'));assert.ok(sw.includes('hotfix-v200.css'));
for(const x of m.definitions)assert.ok(sw.includes(x.guideImage));
assert.ok(source.indexOf('v200-mobility.js')<source.indexOf('v190-programs.js'));assert.ok(source.includes('GymV200?.registerLibrary(LIBRARY)'));
console.log('PASS: mobility 3/1-session cycles, bilingual instructions, preserved built-ins, known exercise IDs, beginner doses, images/cache, explicit timer fill, no automatic saving, stale timer cancellation.');
console.log('PASS: explicit 1×20 / 2×30 prescriptions, active-session guard, priority holds in every gym template, preserved custom exercise choice/order/slots and immutable previous layouts.');
