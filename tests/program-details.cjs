process.chdir(require('path').join(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),assert=require('assert');
let language='en',opened='';const callbacks=[],clickHandlers=[];
const buttons=[];
const list={set innerHTML(html){this.html=html;buttons.length=0;for(const m of html.matchAll(/data-exercise-detail="([^"]+)"/g))buttons.push({dataset:{exerciseDetail:m[1]}})},get innerHTML(){return this.html},querySelectorAll:s=>s==='[data-exercise-detail]'?buttons:[]};
const dialog={open:false,showModal(){this.open=true}};
const nodes={programSessionsDialog:dialog,programSessionsList:list,programSessionsTitle:{},programSessionsSubtitle:{}};
const c={console,lang:()=>language,window:null,document:{readyState:'loading',addEventListener:(event,f)=>{if(event==='DOMContentLoaded')callbacks.push(f);if(event==='click')clickHandlers.push(f)},getElementById:id=>nodes[id]},
 state:{programJourney:{programId:'strength_builder'},programSessionLayouts:{}},EX:{},
 openProgramSessions(){},addExercise(){},replaceExercise(){},deleteSavedSet(){},renderLive(){},renderDay(){},requestAnimationFrame(){},currentLive:()=>null,
 itemName:x=>x.name||x.id,v124ProgramId:()=>c.state.programJourney.programId,openVideo:id=>opened=id};
c.window=c;vm.createContext(c);
const source=fs.readFileSync('index.html','utf8');
vm.runInContext(source.slice(source.indexOf('const PLAN_PRESETS='),source.indexOf('let BASE_PLANS='))+'\nthis.PLAN_PRESETS=PLAN_PRESETS;',c);
vm.runInContext(source.slice(source.indexOf('const PROGRAM_META='),source.indexOf('function normalizeProgramJourney()'))+'\nthis.PROGRAM_META=PROGRAM_META;',c);
vm.runInContext(fs.readFileSync('v190-programs.js','utf8'),c);
c.GymV190.registerPresets();c.GymV190.registerMeta();
vm.runInContext(fs.readFileSync('v187-editor.js','utf8'),c);callbacks.forEach(f=>f());
// The five-session guide must use the actual cyclic sessions rather than its three legacy shells.
c.GymV165={busySessions:['Push','Legs A','Pull','Legs B + Core','Arms + Abs'].map(title=>({titleCs:title,titleEn:title,items:[{id:'plank',sets:2,range:'30–45'}]}))};
for(const languageCode of ['en','cs']){
 language=languageCode;
 for(const id of Object.keys(c.PROGRAM_META)){
  const html=c.GymV190.guideMarkup(id);
  assert.ok(html.length>1000,'Missing guide '+id);
  assert.ok(html.includes(language==='en'?'Warm-up':'Zahřátí'),'Missing instructions '+id);
 }
}
language='en';assert.ok(c.GymV190.guideMarkup('busy_week').includes('Arms + Abs'));
assert.ok(c.GymV190.guideMarkup('strength_builder').includes('2–3 minutes'));
assert.ok(c.GymV190.guideMarkup('arms').includes('no leg training'));
assert.equal(c.GymV190.sessionsFor('balanced'),null,'Legacy rotations must remain unchanged');
c.EX.hack_squat={id:'hack_squat',name:'Hack Squat'};
c.GymV187.openEditor();assert.ok(dialog.open);assert.ok(list.innerHTML.includes('aria-label="View exercise: Hack Squat"'));
buttons[0].onclick();assert.equal(opened,'hack_squat');assert.ok(dialog.open,'Opening detail must preserve the editor');
// A replaced exercise and its name are reflected in both the button and the guide, with safe HTML.
c.EX.custom={id:'custom',name:'Custom <press>'};
c.state.programSessionLayouts.strength_builder.monday[0]={id:'custom',sets:2,range:'8–12',slotId:'hack_squat'};
c.GymV187.openEditor();buttons[0].onclick();assert.equal(opened,'custom');
assert.ok(c.GymV190.guideMarkup('strength_builder').includes('Custom &lt;press&gt;'));
assert.ok(!c.GymV190.guideMarkup('strength_builder').includes('Custom <press>'));
// Heroes can be cloned by session renderers: a new button without onclick still opens the guide.
const guideTitle={},guideBody={};
nodes.v190GuideDialog={open:false,querySelector:s=>s==='h2'?guideTitle:guideBody,showModal(){this.open=true}};
let prevented=false;
clickHandlers.forEach(f=>f({target:{closest:s=>s==='.v190-guide-button'?{}:null},preventDefault(){prevented=true}}));
assert.ok(prevented&&nodes.v190GuideDialog.open);assert.ok(guideBody.innerHTML.includes('Warm-up'));
console.log('PASS: all 13 bilingual program guides, real Busy Week rotation, strength/core instructions, preserved legacy behavior, clickable exercise details and edited exercise descriptions.');

