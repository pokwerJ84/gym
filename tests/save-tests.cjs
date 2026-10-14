process.chdir(require('path').join(__dirname,'..'));
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync('index.html','utf8');
function fn(name){const start=src.indexOf('function '+name+'(');const line=src.slice(start,src.indexOf('\n',start));return line.endsWith('}')?line:src.slice(start,src.indexOf('\n}',start)+2)}
const storage=new Map([['gymV166RestPending','timer'],['gymManualSessionByDateV137','{"2026-10-14":"monday"}']]);
const e={sets:[{kg:'20',reps:'10',_complete:true}],done:false,skipped:false};
let saves=0,feedback='',nextRendered='';
const c={console,Date,JSON,Number,String,Object,Array,Math,Set,Map,Promise,clearInterval(){},clearTimeout(){},setTimeout(){},
state:{days:{monday:{date:'2026-10-14',programSessionKey:'q:0',programSessionIndex:0}},programJourney:{programId:'quick',sessionIndex:0,completedSessions:0},sessionOverrides:{'2026-10-14':{day:'monday'}},workouts:[],history:{},activeWorkout:{day:'monday',sessionKey:'q:0',restEndAt:123}},
localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},window:{},document:{querySelector:()=>null},
v182SaveQuery:()=>null,lang:()=> 'en',today:()=> '2026-10-14',showToast:s=>feedback=s,activeInstances:()=>[{instanceId:'x'}],
metaFor:()=>({id:'x',mode:'weight',sets:3,range:'8–12',category:'chest'}),entry:()=>e,EX:{x:{mode:'weight'}},confirm:()=>true,
currentProgramLabel:()=> 'Quick Workout',currentProgramMeta:()=>({sessions:12}),currentProgramDay:()=> 'wednesday',
clearWorkoutReminder(){},stopPostRestAlarm(){},workoutTick:null,restTick:null,saveState(){saves++},renderHistoryScreen(){},renderProgress(){},prepareProgramSession(){},showToday:day=>nextRendered=day
};
vm.createContext(c);
vm.runInContext(['hasSetData','removeHistoryForSession','clearFinishedSessionUI'].map(fn).join('\n')+'\nasync '+fn('manualSaveSession'),c);
(async()=>{
 await c.manualSaveSession('monday','bad');assert.equal(c.state.workouts.length,0);assert.match(feedback,/valid date/);
 e.sets=[];await c.manualSaveSession('monday','2026-10-01');assert.equal(c.state.workouts.length,0);assert.match(feedback,/at least one set/);
 e.sets=[{kg:'20',reps:'10',_complete:true}];await c.manualSaveSession('monday','2026-10-01');
 assert.equal(c.state.workouts.length,1);assert.equal(c.state.workouts[0].date,'2026-10-01');
 assert.equal(c.state.history.x[0].sets.length,1);assert.equal(c.state.history.x[0].sets[0]._complete,undefined);
 assert.equal(c.state.activeWorkout,null);assert.equal(storage.has('gymV166RestPending'),false);
 assert.equal(c.state.sessionOverrides['2026-10-14'],undefined);assert.equal(c.state.programJourney.sessionIndex,1);
 assert.equal(nextRendered,'wednesday');
 await c.manualSaveSession('monday','2026-10-02');assert.equal(c.state.workouts.length,1);assert.equal(c.state.workouts[0].date,'2026-10-02');assert.equal(c.state.history.x.length,1);
 console.log('PASS manual save: date validation, empty-progress rejection, selected date, logged sets, rest and override cleanup, next session, update without duplicates.');
})().catch(e=>{console.error(e);process.exit(1)});
