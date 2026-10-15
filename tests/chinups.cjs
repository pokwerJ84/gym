process.chdir(require('path').join(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),assert=require('assert');
let language='en';
const c={window:null,document:{addEventListener(){}},lang:()=>language,structuredClone,
 state:{history:{},activeWorkout:{sessionKey:'session-test',date:'2026-10-15',programId:'balanced'},programJourney:{programId:'balanced'}},today:()=> '2026-10-15'};
c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('v195-chinups.js','utf8'),c);
const g=c.GymV195,library=[];g.registerLibrary(library);g.registerLibrary(library);assert.equal(library.length,4);
for(const x of library){assert.equal(x.mode,'reps');assert.ok(x.tips.cs.length>=5&&x.tips.en.length>=5);assert.ok(fs.existsSync(x.guideImage));assert.equal(x.guideImage,x.guideThumb);assert.ok(x.primaryMuscles.cs.length)}
assert.equal(new Set(library.map(x=>x.id)).size,4);
const e={notes:'My existing note',sets:[{reps:'8',_complete:true}]};
assert.ok(g.storePractice('inverted_row',e,'barHeight','95'));
assert.ok(g.storePractice('inverted_row',e,'legs','bent'));
assert.equal(e.notes,'My existing note\nBar: 95 cm · Legs: bent');
g.storePractice('inverted_row',e,'legs','straight');assert.equal(e.notes,'My existing note\nBar: 95 cm · Legs: straight');
assert.equal(g.storePractice('inverted_row',e,'barHeight','-1'),false);
assert.equal(g.storePractice('inverted_row',e,'barHeight','NaN'),false);
assert.equal(g.storePractice('inverted_row',e,'legs','invalid'),false);
assert.equal(g.storePractice('chin_up',e,'legs','bent'),false);
language='cs';g.storePractice('inverted_row',e,'legs','straight');assert.equal(e.notes,'My existing note\nHrazda: 95 cm · Nohy: natažené');
language='en';const foot={},band={};
g.storePractice('chin_up_foot_assisted',foot,'assistance','light');assert.ok(foot.notes.includes('light'));
g.storePractice('chin_up_band_assisted',band,'band','Purple, foot');assert.ok(band.notes.includes('Purple, foot'));
// Completed history retains setup and notes separately; later setup edits cannot mutate old history.
const source=fs.readFileSync('index.html','utf8'),start=source.indexOf('function upsertCurrentExerciseHistory('),end=source.indexOf('function syncCurrentExerciseHistory()',start);
vm.runInContext(source.slice(start,end),c);c.upsertCurrentExerciseHistory('monday',{},library[0],e);
const record=c.state.history.inverted_row[0];assert.equal(record.practice.barHeight,'95');assert.equal(record.sets[0].reps,'8');assert.equal(record.sets[0]._complete,undefined);assert.ok(record.notes.includes('My existing note'));
e.practice.barHeight='80';assert.equal(record.practice.barHeight,'95');assert.equal(c.state.history.chin_up,undefined);
assert.ok(source.indexOf('v195-chinups.js')<source.indexOf('GymV195?.registerLibrary(LIBRARY)'));
const sw=fs.readFileSync('sw.js','utf8');for(const x of library)assert.ok(sw.includes(x.guideImage),'Missing offline image '+x.id);assert.ok(sw.includes('v195-chinups.js'));assert.ok(sw.includes('v194/technogym-vertical-traction.webp'));
console.log('PASS: four distinct bodyweight exercises, bilingual technique, real cached images, idempotent registration, setup validation, preserved notes, independent history and existing image preservation.');
