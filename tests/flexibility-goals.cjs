process.chdir(require('path').join(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('index.html','utf8');
function fn(name){const start=source.indexOf('function '+name+'(');assert.ok(start>=0);const line=source.slice(start,source.indexOf('\n',start));return line.endsWith('}')?line:source.slice(start,source.indexOf('\n}',start)+2)}
let language='cs';
const state={activeWorkout:{sessionKey:'keep-me',sets:[{kg:'20',reps:'8'}]},history:{saved:[{sets:[{kg:'40',reps:'6'}]}]},programSessionLayouts:{balanced:{cycle_0:[{id:'bench',sets:3}]}}};
const c={window:null,document:{addEventListener(){}},LIBRARY:[],state,lang:()=>language,PLAN_PRESETS:{balanced:{name_cs:'Keep original'}},PROGRAM_META:{balanced:{label_cs:'Keep original'}},
 CATEGORIES:JSON.parse(source.match(/const CATEGORIES=(\{[^\n]+\});/)[1]),databaseQuery:'',databaseCategoryFilter:'mobility',mobilityRegionFilter:'all',database:{innerHTML:''},esc:x=>String(x??''),t:x=>x,itemName:x=>x.cs,targetText:x=>x.range||'',categoryGlyph:()=>'',categoryVisualImage:()=>'',categorySubtitle:()=>'',requestAnimationFrame(){}};
c.window=c;vm.createContext(c);const before=JSON.stringify(state);
for(const f of ['v200-mobility.js','v205-stretches.js','v207-flexibility.js','v190-programs.js','v165-core.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
for(const g of [c.GymV200,c.GymV205,c.GymV207]){g.registerLibrary(c.LIBRARY);g.registerLibrary(c.LIBRARY)}
for(const id of ['cat_cow','quadruped_thoracic_rotation','wall_angels','scapular_squeeze','wall_push_up_plus','bird_dog','doorway_chest_stretch'])c.LIBRARY.push({id,cs:id,en:id,category:'back',dailyRoutine:true});
assert.equal(c.LIBRARY.length,43);const g=c.GymV207;
assert.equal(g.definitions.length,12);assert.equal(g.definitions.filter(x=>x.flexibilityLevel==='advanced').length,6);assert.equal(g.definitions.filter(x=>x.flexibilityLevel==='expert').length,6);
assert.equal(new Set(c.LIBRARY.map(x=>x.id)).size,43);
const sw=fs.readFileSync('sw.js','utf8');
for(const x of g.definitions){
 assert.ok(c.CATEGORIES[x.category]);assert.ok(['reps','time','sidetime'].includes(x.mode));assert.equal(x.sets,1);assert.ok(x.mobility);
 for(const code of ['cs','en']){assert.ok(x.tips[code].length===6);assert.ok(x.mistakes[code].length>=2);assert.ok(x.primaryMuscles[code].length);assert.ok(x[code]);}
 assert.ok(x.tips.cs.slice(0,6).join(' ').includes('Ostrá bolest'));assert.ok(x.tips.en.slice(0,6).join(' ').includes('Warm up'));
 assert.ok(x.flexibilityGoals.length);assert.ok(x.mobilityRegions.every(r=>c.GymV205.regions[r]));assert.ok(x.guideExact);assert.equal(x.guideImage,x.guideThumb);
 const bytes=fs.readFileSync(x.guideImage);assert.ok(bytes.length>10000,x.id+' missing or empty image');assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert.ok(sw.includes(x.guideImage));
}
for(const n of ['allLibrary','isMobilityExercise','databaseCategories','matchesDatabaseCategory','categoryName','renderDatabase','setMobilityRegionFilter','setDatabaseCategoryFilter'])vm.runInContext(fn(n),c);
const count=()=> (c.database.innerHTML.match(/<article /g)||[]).length;
c.renderDatabase();assert.equal(count(),43);assert.ok(c.database.innerHTML.includes('flexibility-level'));assert.ok(c.database.innerHTML.includes('flexibility-goal'));
g.setFilter('level','expert');assert.equal(count(),6);g.setFilter('goal','bridge');assert.equal(count(),1);assert.ok(c.database.innerHTML.includes('bridge_elevated'));
c.setMobilityRegionFilter('neck');assert.equal(count(),0,'Region, level and goal must combine');
c.setMobilityRegionFilter('all');g.setFilter('goal','front');assert.equal(count(),2);c.databaseQuery='Provaz';c.renderDatabase();assert.equal(count(),1);c.databaseQuery='';
g.setFilter('level','advanced');g.setFilter('goal','middle');assert.equal(count(),4);
g.setFilter('level','__proto__');g.setFilter('goal','__proto__');c.renderDatabase();assert.equal(count(),43,'Reject invalid filter values');
g.setFilter('level','base');assert.equal(count(),31);g.setFilter('level','all');
c.GymV190.registerPresets();c.GymV190.registerMeta();assert.equal(c.PLAN_PRESETS.balanced.name_cs,'Keep original');assert.equal(c.PROGRAM_META.balanced.label_cs,'Keep original');
assert.ok(c.GymV190.isFourDay(g.PROGRAM));const p=g.programs[g.PROGRAM];assert.equal(p.sessions.length,3);
const known=new Set(c.LIBRARY.map(x=>x.id));known.add('treadmill');
for(const s of p.sessions){assert.equal(s.items[0].id,'treadmill');for(const x of s.items){assert.ok(known.has(x.id),x.id);assert.ok(!g.definitions.find(d=>d.id===x.id&&d.flexibilityLevel==='expert'),'No Expert exercises in foundation program');}}
c.state.programJourney={programId:g.PROGRAM,sessionIndex:0};
for(let i=0;i<9;i++){c.state.programJourney.sessionIndex=i;assert.equal(c.GymV165.layoutKey(),'cycle_'+i%3);assert.equal(c.GymV165.busySession().titleCs,p.sessions[i%3].titleCs);}
delete c.state.programJourney;
for(const code of ['cs','en']){language=code;const html=c.GymV190.guideMarkup(g.PROGRAM);assert.ok(html.includes(code==='cs'?'Zahřátí':'Warm-up'));assert.ok(html.includes(code==='cs'?'fyzioterapeut':'physiotherapist'));assert.ok(html.includes(code==='cs'?'Uložit session':'Save Session'));assert.ok(html.includes('Advanced'));assert.ok(html.includes('Expert'));}
assert.equal(JSON.stringify(state),before,'Library, filters and preset registration must not mutate saved data or active session');
assert.ok(sw.includes('v207-flexibility.js'));assert.ok(source.indexOf('GymV207?.registerLibrary(LIBRARY)')<source.indexOf('let EX='));
console.log('PASS: 12 illustrated additions, 43 mobility entries, 6 Advanced/6 Expert, combined goal/level/area/search filters, bilingual prerequisites, foundation A/B/C rotation, preserved existing presets/history/active session, no default Expert exercise, offline assets.');

// The live hold timer must honor short exercise prescriptions, including bridges.
const mobilitySource=fs.readFileSync('v200-mobility.js','utf8');
const timerLine=mobilitySource.match(/const side=m\.mode==='sidetime',seconds=[^;]+;/)[0];
for(const [id,mode,range,want] of [['bridge_elevated','time','5–10',5],['puppy_supported','time','20–30',20],['front_split_blocks','sidetime','15–20',15],['cat_cow','time','60 s',45]]){assert.equal(vm.runInNewContext(timerLine+'seconds',{m:{id,mode,range}}),want,id+' timer dose');}
console.log('PASS: live timer defaults to prescribed short bridge and unilateral hold doses.');
