process.chdir(require('path').join(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync('index.html','utf8');
function fn(name){const start=source.indexOf('function '+name+'(');assert.ok(start>=0);const line=source.slice(start,source.indexOf('\n',start));return line.endsWith('}')?line:source.slice(start,source.indexOf('\n}',start)+2)}
let language='en';
const history={existing:[{sessionKey:'saved-session',sets:[{kg:'40',reps:'6'}]}]};
const c={window:null,document:{addEventListener(){}},LIBRARY:[],state:{customExercises:[],history,programSessionLayouts:{existing:{monday:[{id:'bench',sets:3}]}}},lang:()=>language,
 CATEGORIES:JSON.parse(source.match(/const CATEGORIES=(\{[^\n]+\});/)[1]),databaseQuery:'',databaseCategoryFilter:'mobility',mobilityRegionFilter:'all',database:{innerHTML:''},esc:x=>String(x??''),t:x=>x,itemName:x=>x.en,targetText:x=>x.range||'',categoryGlyph:()=>'',categoryVisualImage:()=>'',categorySubtitle:()=>''};
c.window=c;vm.createContext(c);const before=JSON.stringify(c.state);
for(const file of ['v200-mobility.js','v205-stretches.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c);
c.GymV200.registerLibrary(c.LIBRARY);c.GymV205.registerLibrary(c.LIBRARY);c.GymV205.registerLibrary(c.LIBRARY);
assert.equal(c.LIBRARY.length,24);assert.equal(JSON.stringify(c.state),before,'Registering a library must not mutate user data');
for(const id of Object.keys({cat_cow:1,quadruped_thoracic_rotation:1,wall_angels:1,scapular_squeeze:1,wall_push_up_plus:1,bird_dog:1,doorway_chest_stretch:1}))c.LIBRARY.push({id,cs:id,en:id,category:'back',dailyRoutine:true});
const g=c.GymV205;assert.equal(g.definitions.length,20);assert.equal(new Set(g.definitions.map(x=>x.id)).size,20);
const covered=new Set();
for(const x of g.definitions){
 assert.ok(!source.includes('"id":"'+x.id+'"'),'Must not duplicate an existing exercise ID');
 assert.ok(c.CATEGORIES[x.category],x.id+' category');assert.ok(['reps','time','sidetime'].includes(x.mode));assert.equal(x.sets,1);assert.ok(x.mobility);
 for(const code of ['cs','en']){assert.ok(x[code]);assert.ok(x.tips[code].length>=5);assert.ok(x.mistakes[code].length>=2);assert.ok(x.primaryMuscles[code].length)}
 for(const r of x.mobilityRegions){assert.ok(g.regions[r]);covered.add(r)}
 assert.equal(x.guideImage,x.guideThumb);assert.ok(fs.existsSync(x.guideImage),x.id+' missing image');
 const imageBytes=fs.readFileSync(x.guideImage);assert.ok(imageBytes.length>10000,x.id+' empty/truncated image');assert.equal(imageBytes.toString('ascii',0,4),'RIFF');assert.equal(imageBytes.toString('ascii',8,12),'WEBP');
}
assert.equal(covered.size,9);assert.ok(g.matchesQuery(g.definitions.find(x=>x.id==='wrist_flexor_stretch'),'zapesti'));
assert.ok(g.matchesQuery({id:'supine_figure_four'},'kycle'),'Existing hip exercises searchable without diacritics');
assert.ok(!g.matchesRegion(g.definitions[0],'neck'));
for(const name of ['allLibrary','isMobilityExercise','databaseCategories','matchesDatabaseCategory','categoryName','renderDatabase','setMobilityRegionFilter','setDatabaseCategoryFilter'])vm.runInContext(fn(name),c);
c.renderDatabase();assert.equal((c.database.innerHTML.match(/<article /g)||[]).length,31);assert.ok(c.database.innerHTML.includes('mobilityRegionSelect'));assert.ok(c.database.innerHTML.includes('Forearms & Wrists'));
c.setMobilityRegionFilter('ankles');assert.equal((c.database.innerHTML.match(/<article /g)||[]).length,3);
c.databaseQuery='koleno';c.renderDatabase();assert.equal((c.database.innerHTML.match(/<article /g)||[]).length,2,'Combine region and search');
c.databaseQuery='';c.setMobilityRegionFilter('neck');assert.equal((c.database.innerHTML.match(/<article /g)||[]).length,1);
c.setMobilityRegionFilter('__proto__');assert.equal(c.mobilityRegionFilter,'all');
c.setDatabaseCategoryFilter('forearms');assert.equal((c.database.innerHTML.match(/<article /g)||[]).length,2);assert.equal(c.mobilityRegionFilter,'all');
language='cs';c.setDatabaseCategoryFilter('mobility');assert.ok(c.database.innerHTML.includes('Oblast těla'));
assert.equal(JSON.stringify(c.state),before,'Filtering must not mutate history or program layouts');
const sw=fs.readFileSync('sw.js','utf8');assert.ok(sw.includes('v205-stretches.js')&&sw.includes('hotfix-v205.css'));for(const x of g.definitions)assert.ok(sw.includes(x.guideImage));
assert.ok(source.indexOf('GymV205?.registerLibrary(LIBRARY)')<source.indexOf('let EX='));
console.log('PASS: 20 unique additions, 31 mobility entries, all nine body regions, real image/cache references, bilingual technique, combined region/search, diacritics, forearm classification, history and program preservation.');
(async()=>{
 const cachedImage={from:'precache'},cache={match:async(request,options)=>options?.ignoreSearch?cachedImage:null};
 const offline={CORE_CACHE:'test',caches:{open:async()=>cache},fetch:async()=>{throw Error('Offline')}};
 vm.createContext(offline);const start=sw.indexOf('async function sameOriginCacheFirst(');vm.runInContext(sw.slice(start,sw.indexOf('\n',start)),offline);
 const result=await offline.sameOriginCacheFirst({url:'https://example.test/gym/exercise-guides/v205/calf_wall_straight.webp'});assert.equal(result,cachedImage);
 await assert.rejects(offline.sameOriginCacheFirst({url:'https://example.test/gym/v205-stretches.js?v=205'}),/Offline/,'Never ignore JS version queries');
 console.log('PASS: offline exercise images resolve versioned precache entries; JS cache versions remain strict.');
})().catch(error=>{console.error(error);process.exitCode=1});
