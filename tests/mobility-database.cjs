process.chdir(require('path').join(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),assert=require('assert'),source=fs.readFileSync('index.html','utf8');
function fn(name){const start=source.indexOf('function '+name+'(');assert.ok(start>=0);const line=source.slice(start,source.indexOf('\n',start));return line.endsWith('}')?line:source.slice(start,source.indexOf('\n}',start)+2)}
let language='en';
const c={window:null,document:{addEventListener(){}},lang:()=>language,LIBRARY:[],state:{customExercises:[]},CATEGORIES:{quads:{en:'Quads'},hamstrings:{en:'Hamstrings'},back:{en:'Back'},chest:{en:'Chest'}},
 databaseQuery:'',databaseCategoryFilter:'all',database:{innerHTML:''},esc:x=>String(x??''),t:x=>x,itemName:x=>x.en,targetText:x=>x.range||'',categoryGlyph:()=>'',categoryVisualImage:()=>'',categorySubtitle:(cat,count)=>cat+' '+count};
c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('v200-mobility.js','utf8'),c);c.GymV200.registerLibrary(c.LIBRARY);
for(const id of ['cat_cow','quadruped_thoracic_rotation','wall_angels','scapular_squeeze','wall_push_up_plus','bird_dog','doorway_chest_stretch'])c.LIBRARY.push({id,cs:id,en:id,category:'back',dailyRoutine:true});
c.LIBRARY.push({id:'bench',cs:'Bench',en:'Bench',category:'chest'});
for(const name of ['allLibrary','isMobilityExercise','databaseCategories','matchesDatabaseCategory','categoryName','renderDatabase'])vm.runInContext(fn(name),c);
c.renderDatabase();assert.ok(c.database.innerHTML.includes('Mobility &amp; Stretching')||c.database.innerHTML.includes('Mobility & Stretching'));assert.ok(c.database.innerHTML.includes('mobility 11'));
c.databaseCategoryFilter='mobility';c.renderDatabase();
assert.equal((c.database.innerHTML.match(/<article /g)||[]).length,11);
for(const x of c.GymV200.definitions){assert.ok(c.database.innerHTML.includes("openVideo('"+x.id+"')"));assert.ok(c.database.innerHTML.includes(x.guideThumb))}
assert.ok(!c.database.innerHTML.includes("openVideo('bench')"));
c.databaseQuery='popruhem';c.renderDatabase();assert.equal((c.database.innerHTML.match(/<article /g)||[]).length,1);assert.ok(c.database.innerHTML.includes('supine_hamstring_stretch'));
c.databaseQuery='';c.databaseCategoryFilter='hamstrings';c.renderDatabase();assert.equal((c.database.innerHTML.match(/<article /g)||[]).length,2,'Keep anatomical groups');
language='cs';assert.equal(c.categoryName('mobility'),'Mobilita a protažení');assert.equal(c.databaseCategories().filter(x=>x==='mobility').length,1);
console.log('PASS: visible mobility category and 11 cards, four new images/detail links, combined search, bilingual name and preserved muscle-group filters.');
