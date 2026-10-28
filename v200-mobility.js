/* Back and hip mobility: additive programs, beginner doses and an explicit hold timer. */
(()=>{
'use strict';
const cs=()=>lang()==='cs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LONG='back_hips_mobility',DAILY='back_hips_daily';
const HOLDS=new Set(['hip_flexor_stretch','supine_hamstring_stretch','supine_figure_four']);
const item=(id,range)=>({id,sets:1,range});
const session=(titleCs,titleEn,items)=>({titleCs,titleEn,subCs:'Pomalý pohyb · bez bolesti · první týden 1 série',subEn:'Slow movement · pain-free · one set in week one',items});
const programs={
 [LONG]:{nameCs:'Záda a kyčle – mobilita',nameEn:'Back & Hips – Mobility',sessions:[
  session('A · Kyčle a zadní strana nohou','A · Hips & Hamstrings',[item('treadmill','5–8 min'),item('cat_cow','45–60'),item('hip_flexor_stretch','20–30'),item('supine_hamstring_stretch','20–30'),item('supine_figure_four','20–30'),item('adductor_rockback','6–8 / strana'),item('quadruped_thoracic_rotation','6 / strana')]),
  session('B · Záda, hrudník a kontrola kyčlí','B · Back, Chest & Hip Control',[item('treadmill','5–8 min'),item('cat_cow','45–60'),item('quadruped_thoracic_rotation','6–8 / strana'),item('wall_angels','6–8'),item('scapular_squeeze','8 × 3 s'),item('hip_flexor_stretch','20–30'),item('supine_figure_four','20–30'),item('bird_dog','4–6 / strana')]),
  session('C · Celé tělo se zaměřením na kyčle','C · Full Body, Hip Focus',[item('treadmill','5–8 min'),item('cat_cow','45–60'),item('adductor_rockback','6–8 / strana'),item('hip_flexor_stretch','20–30'),item('supine_hamstring_stretch','20–30'),item('supine_figure_four','20–30'),item('quadruped_thoracic_rotation','6–8 / strana'),item('wall_angels','6–8')])]},
 [DAILY]:{nameCs:'Záda a kyčle – lehce doma',nameEn:'Back & Hips – Easy Daily',sessions:[session('Lehké rozhýbání · 10–15 min','Easy Mobility · 10–15 min',[item('cat_cow','30–45'),item('hip_flexor_stretch','20'),item('supine_figure_four','20'),item('supine_hamstring_stretch','20'),item('quadruped_thoracic_rotation','4–6 / strana')])]}
};
// These three priority stretches now occur in every gym session, after movement work.
for(const s of programs[LONG].sessions){
 if(!s.items.some(x=>x.id==='supine_hamstring_stretch'))s.items.push(item('supine_hamstring_stretch','20–30'));
 s.items.sort((a,b)=>Number(HOLDS.has(a.id))-Number(HOLDS.has(b.id)));
}
const safetyCs='Dýchej klidně, nepruž a zůstaň u mírného tahu. Ostrá bolest, štípání v kloubu, brnění nebo vystřelování do nohy znamená cvik ukončit. Rozsah nemusí odpovídat obrázku.';
const safetyEn='Breathe normally, do not bounce, and use only a mild stretch. Stop for sharp pain, joint pinching, tingling or radiating leg symptoms. Your range need not match the image.';
const definitions=[
 {id:'hip_flexor_stretch',cs:'Protažení přední strany kyčle v kleku',en:'Half-Kneeling Hip Flexor Stretch',category:'legs',mode:'sidetime',range:'20–30',
  primaryMuscles:{cs:['Ohybače kyčle'],en:['Hip flexors']},secondaryMuscles:{cs:['Přímý sval stehenní'],en:['Rectus femoris']},
  tips:{cs:['Klekni jedním kolenem na měkkou podložku, druhé chodidlo postav před sebe. Přidrž se opory, pokud potřebuješ.','Lehce podsadit pánev a zatnout hýždi zadní nohy. Trup drž vzpřímeně, bez prohnutí v bedrech.','Posuň pánev o kousek dopředu, dokud ucítíš jemný tah před kyčlí klečící nohy. Levá/pravá označuje protahovanou zadní nohu.','Vydrž 20–30 sekund, pak vyměň strany. Při citlivém koleni použij vyšší podložku nebo cvik vynech.',safetyCs],en:['Kneel on a padded mat with the other foot flat in front. Hold a support if needed.','Gently tuck the pelvis and squeeze the rear-leg glute. Stay upright without arching the lower back.','Shift your pelvis slightly forward until you feel a mild stretch in front of the kneeling-side hip. Left/right identifies the rear leg being stretched.','Hold 20–30 seconds, then change sides. Add knee padding or skip if kneeling hurts.',safetyEn]},
  mistakes:{cs:['Prohnutí beder místo pohybu v kyčli','Velký výpad a tlak do třísla','Zadržování dechu'],en:['Arching the back instead of moving at the hip','A deep lunge or groin pinching','Holding the breath']}},
 {id:'supine_hamstring_stretch',cs:'Zadní stehna vleže s popruhem',en:'Supine Hamstring Stretch with Strap',category:'legs',mode:'sidetime',range:'20–30',
  primaryMuscles:{cs:['Zadní strana stehen'],en:['Hamstrings']},secondaryMuscles:{cs:[],en:[]},
  tips:{cs:['Lehni na záda, jednu nohu pokrč a chodidlo nech na zemi. Popruh nebo ručník dej kolem chodidla druhé nohy.','Zvedej nohu s mírně pokrčeným kolenem. Hlava i pánev zůstávají opřené, ramena uvolněná.','Zastav u mírného tahu vzadu ve stehně. Není potřeba propnout koleno ani dostat nohu kolmo.','Vydrž 20–30 sekund na každou stranu. Při brnění nebo vystřelování cvik ukonči.',safetyCs],en:['Lie on your back with one knee bent and foot flat. Loop a strap or towel around the other foot.','Raise the leg with a slightly bent knee. Keep head and pelvis supported and shoulders relaxed.','Stop at a mild pull in the back of the thigh. A straight knee or vertical leg is unnecessary.','Hold 20–30 seconds per side. Stop if you feel tingling or radiating symptoms.',safetyEn]},
  mistakes:{cs:['Tahání silou za chodidlo','Zvedání pánve a hlavy','Nucené propínání kolene'],en:['Pulling hard on the foot','Lifting the pelvis or head','Forcing a locked knee']}},
 {id:'supine_figure_four',cs:'Protažení hýždí vleže – čtyřka',en:'Supine Figure-Four Glute Stretch',category:'glutes',mode:'sidetime',range:'20–30',
  primaryMuscles:{cs:['Hýžďové svaly'],en:['Gluteal muscles']},secondaryMuscles:{cs:['Zevní rotátory kyčle'],en:['Hip external rotators']},
  tips:{cs:['Lehni na záda s pokrčenými koleny. Kotník polož nad koleno opačné nohy, ne přímo na čéšku.','Pokud už cítíš tah v hýždi překřížené nohy, zůstaň zde. Jinak uchop podpěrnou nohu zezadu za stehno a jemně ji přibliž.','Hlavu nech na podložce. Na koleno netlač; udržuj pohodlnou polohu kotníku. Levá/pravá je překřížená noha.','Vydrž 20–30 sekund na každou stranu. Při bolesti kolene nebo štípání kyčle cvik vynech.',safetyCs],en:['Lie on your back with knees bent. Rest one ankle above the opposite knee, not on its kneecap.','If this already stretches the crossed-leg glute, stay there. Otherwise hold behind the supporting thigh and gently bring it closer.','Keep the head supported. Do not push on the knee; keep the ankle comfortable. Left/right identifies the crossed leg.','Hold 20–30 seconds per side. Skip for knee pain or hip pinching.',safetyEn]},
  mistakes:{cs:['Tlačení na koleno','Zvedání hlavy a napínání krku','Přitahování do bolesti v třísle'],en:['Pressing down on the knee','Lifting the head and straining the neck','Pulling into groin pain']}},
 {id:'adductor_rockback',cs:'Vnitřní stehna – posun boků dozadu',en:'Quadruped Adductor Rock-Back',category:'legs',mode:'reps',range:'6–8 / strana',
  primaryMuscles:{cs:['Přitahovače stehna'],en:['Hip adductors']},secondaryMuscles:{cs:[],en:[]},
  tips:{cs:['Na čtyřech opři dlaně pod ramena. Jednu nohu vysuň do strany a opři chodidlo, druhé koleno nech na měkké podložce.','S klidnými zády posouvej boky pomalu dozadu do jemného tahu na vnitřním stehně natažené nohy.','Plynule se vrať. Udělej 6–8 pomalých pohybů a potom vyměň strany. Do záznamu napiš počet na jednu stranu po dokončení obou.','Zmenši rozsah nebo lehce pokrč boční koleno. Není cílem sednout na patu ani dělat rozštěp.',safetyCs],en:['Start on all fours, hands under shoulders. Extend one leg sideways with the foot supported; pad the supporting knee.','Keep the spine comfortable and slowly move hips backward until a mild stretch develops in the extended inner thigh.','Return smoothly. Perform 6–8 slow movements, then switch sides. Log reps per side after completing both sides.','Reduce the range or slightly bend the side knee. Do not force your hips to the heel or into a split.',safetyEn]},
  mistakes:{cs:['Pružení a švihání','Zakulatění beder do krajní polohy','Tlačení do štípání v kyčli'],en:['Bouncing or swinging','Forcing lumbar rounding','Pushing into hip pinching']}}
].map(x=>({...x,category:['supine_hamstring_stretch','supine_figure_four'].includes(x.id)?'hamstrings':'quads',sets:1,rest:20,mobility:true,focus:{cs:'Jemný tah a kontrola rozsahu; nepřidávej váhu.',en:'Mild tension and controlled range; do not add weight.'},guideImage:'./exercise-guides/v200/'+x.id+'.webp',guideThumb:'./exercise-guides/v200/'+x.id+'.webp',guideExact:true}));
function registerLibrary(library){for(const x of definitions)if(!library.some(y=>y.id===x.id))library.push(x)}
function applyDose(id,level){
 if(!programs[id]||![1,2].includes(level)||state.activeWorkout)return false;
 const current=state.programSessionLayouts?.[id]||{},layouts={};
 programs[id].sessions.forEach((s,i)=>{
  const key='cycle_'+i;
  layouts[key]=(current[key]||s.items).map(x=>HOLDS.has(x.id)?{...x,sets:level,range:level===1?'20':'30'}:{...x});
 });
 state.programSessionLayouts={...(state.programSessionLayouts||{}),[id]:{...current,...layouts}};
 saveState();return true;
}
function bindGuide(root,id){
 root.querySelectorAll('[data-mobility-dose]').forEach(b=>b.onclick=()=>{
  if(!applyDose(id,Number(b.dataset.mobilityDose))){showToast(cs()?'Nejprve dokonči nebo zruš rozpracovanou session.':'Finish or cancel the current session first.');return}
  renderDay(currentProgramDay());window.GymV190.openGuide();showToast(cs()?'Dávka výdrží nastavena. Historie a ostatní cviky zůstaly zachované.':'Hold prescription updated. History and other exercises preserved.');
 });
}
function guideMarkup(id){
 const easy=id===DAILY;
 const sections=cs()?[
  ['Rozvrh',easy?'Lehká sestava pro úterý, čtvrtek a víkend; jeden průchod asi 10–15 minut včetně krátkého zahřátí. Pokud jsi citlivý po delší lekci, dej jen chůzi a pár jemných pohybů.':'Střídej A, B a C například pondělí, středa a pátek. První týden počítej asi 20–30 minut, později podle počtu sérií přibližně 30–40 minut. Ostatní dny použij samostatný program Záda a kyčle – lehce doma.'],
  ['Zahřátí','Začni 5–8 minutami pohodlné chůze nebo lehkého kola. V gymu je chůze první položkou; doma se před sestavou několik minut projdi.'],
  ['První týden','Zvol níže Začátek: 1 × 20 s na každou stranu u tří hlavních výdrží. Pohybové cviky dělej na spodní hranici opakování. Cat–Cow je pomalý pohyb, nikoli nehybná výdrž.'],
  ['Týdny 2–6','Pokud se další den cítíš stejně nebo lépe, zvol Rozvoj: 2 × 30 s na každou stranu u přední kyčle, zadních stehen a hýždí. Platí i pro krátkou domácí sestavu, ale u ní ponech menší tah. Pokud je tato dávka příliš, vrať se na Začátek. Při sedmi lekcích je to asi 7 minut výdrží týdně na každou cílovou oblast a stranu. Nic se nezvyšuje samo.'],
  ['Proč takto','ACSM doporučuje pro flexibilitu souhrnně asi 60 sekund na protahovací cvik alespoň dvakrát týdně. Proto po úvodním týdnu používáme 2 × 30 s, pravidelně opakované. Cat–Cow a rotace slouží k rozhýbání; hlavní výdrže zvětšují rozsah kyčlí. Jde o vlastní sestavu opřenou o doporučení, nikoli program schválený ACSM.'],
  ['Kontrola výsledků','Jednou za dva týdny ve stejnou denní dobu a po stejném zahřátí porovnej pohodlný předklon a stejnou polohu kyčle. Zapiš vzdálenost, polohu nebo přidej poznámku ke cviku. Netlač test do bolesti. Po 6 týdnech vyhodnoť rozsah i pohodlí při běžném pohybu; při stagnaci nejprve zkontroluj pravidelnost a techniku.'],
  ['Jak cvičit',safetyCs+' Mezi sériemi se uvolni přibližně na 20 sekund. U pohybových cviků / strana udělej obě strany a zapiš počet na jednu stranu. Bird Dog je lehký nácvik kontroly, nikoli protahování.'],
  ['Časovač a ukládání','U časových cviků otevři kartu a zvol časovač. U stranových výdrží spusť levou a pravou zvlášť. Po doběhnutí použij Zapsat čas a dokončení potvrď tlačítkem Hotovo. Časovač sám nic neukládá. Celý trénink uložíš běžným Uložit session.'],
  ['Kdy ubrat','Svalová bolest druhý den není cílem. Pokud jsi po lekci výrazně ztuhlejší, uber série a rozsah. Při přetrvávajících nebo zhoršujících se potížích se poraď s fyzioterapeutem; tento plán není diagnóza ani léčba příčiny bolesti. Krk násilně neprotahuj.']
 ]:[
  ['Schedule',easy?'Use this easy 10–15 minute routine on Tuesday, Thursday and weekends, including a short warm-up. If sore after a longer session, choose walking and a few gentle movements.':'Rotate A, B and C, for example Monday, Wednesday and Friday. Allow about 20–30 minutes in week one and 30–40 minutes later as sets increase. Use the separate Easy Daily program on other days.'],
  ['Warm-up','Start with 5–8 minutes of easy walking or cycling. Walking is the first gym item; walk for a few minutes before the home routine.'],
  ['Week one','Choose Start below: 1 × 20 seconds per side for the three priority holds. Use the bottom of the rep range for movements. Cat–Cow is slow movement, not a static hold.'],
  ['Weeks 2–6','If you feel the same or better the next day, choose Develop: 2 × 30 seconds per side for the hip flexor, hamstring and glute holds. Use the same dose with gentler tension on easy home days. Return to Start if needed. Seven sessions accumulate about 7 minutes of holds per target area and side each week. Nothing increases automatically.'],
  ['Why this dose','ACSM recommends accumulating about 60 seconds per stretching exercise at least twice weekly. We therefore use 2 × 30 seconds after the introductory week, repeated regularly. Cat–Cow and rotations provide movement practice; the priority holds target hip range. This is our own routine informed by guidance, not an ACSM-approved program.'],
  ['Check progress','Every two weeks, at the same time of day and after the same warm-up, compare a comfortable forward bend and the same hip position. Record distance, position or a note on the exercise. Do not force tests into pain. Review range and everyday comfort after six weeks; if progress stalls, check consistency and technique first.'],
  ['Technique',safetyEn+' Relax for about 20 seconds between sets. For movements marked / side, complete both sides and log reps per side. Bird Dog trains gentle control rather than stretching.'],
  ['Timer and saving','Open a timed exercise and use its timer. Time left and right separately for bilateral holds. After finishing, choose Fill time, then confirm the set with Done. The timer never saves automatically. Save the complete session with the normal Save Session button.'],
  ['When to reduce','Next-day soreness is not the goal. Reduce sets and range if you feel markedly stiffer afterward. Ask a physiotherapist about persistent or worsening symptoms; this plan does not diagnose or treat the cause of pain. Do not force neck stretches.']
 ];
 return '<div class="v200-mobility-note"><strong>'+(cs()?'Nastavit dávku tří hlavních výdrží':'Set the three priority hold prescriptions')+'</strong><p>'+(cs()?'Upraví pouze počet sérií a čas u přední kyčle, zadních stehen a hýždí v tomto programu. Vlastní výběr a pořadí cviků zůstane. Nastavuj mimo rozpracovanou session.':'Changes only sets and duration of hip flexor, hamstring and glute holds in this program. Your exercise choices and order are preserved. Set this outside an active session.')+'</p><div class="v200-timer-actions"><button type="button" data-mobility-dose="1">'+(cs()?'Začátek · 1 × 20 s':'Start · 1 × 20 s')+'</button><button type="button" data-mobility-dose="2">'+(cs()?'Rozvoj · 2 × 30 s':'Develop · 2 × 30 s')+'</button></div></div>'+sections.map(([h,p])=>'<section style="margin:16px 0"><h3>'+esc(h)+'</h3><p style="line-height:1.6">'+esc(p)+'</p></section>').join('')+'<p><a href="https://pubmed.ncbi.nlm.nih.gov/21694556/" target="_blank" rel="noopener">ACSM · Position stand (2011)</a> · <a href="https://pubmed.ncbi.nlm.nih.gov/39614059/" target="_blank" rel="noopener">Ingram et al. · Sports Medicine (2025)</a> · <a href="https://www.cuh.nhs.uk/patient-information/stretches-for-the-hip/" target="_blank" rel="noopener">CUH NHS · Hip stretches</a></p>';
}
let clock=null,interval=null;
function liveKey(){const w=state.activeWorkout,i=w&&currentLive();if(!i)return null;const e=entry(w.day,i.instanceId);return e.done||e.skipped?null:[w.sessionKey,i.instanceId,firstIncompleteSet(metaFor(w.day,i),e),e.setsRevision||'',e.targetSetsOverride??''].join('|')}
function cancelClock(){if(interval)clearInterval(interval);interval=null;clock=null}
function remaining(now=Date.now()){return clock?Math.max(0,Math.ceil((clock.endAt-now)/1000)):0}
function paintClock(){
 const root=document.getElementById('v200HoldTimer');if(!root||clock?.key!==liveKey()){cancelClock();return}
 const output=root.querySelector('[data-clock]'),fill=root.querySelector('[data-fill]');
 if(!clock){output.textContent=cs()?'Připraveno':'Ready';fill.hidden=true;return}
 const left=remaining();output.textContent=(clock.side==='left'?(cs()?'Levá · ':'Left · '):clock.side==='right'?(cs()?'Pravá · ':'Right · '):'')+(left?left+' s':(cs()?'Hotovo':'Finished'));
 fill.hidden=left>0;
 if(!left&&interval){clearInterval(interval);interval=null;navigator.vibrate?.(120)}
}
function startClock(side,seconds){
 if(!['left','right','both'].includes(side)||!Number.isInteger(seconds)||seconds<5||seconds>180)return false;
 const key=liveKey();if(!key)return false;
 cancelClock();clock={key,side,seconds,endAt:Date.now()+seconds*1000};interval=setInterval(paintClock,250);paintClock();return true;
}
function fillTime(){
 if(!clock||remaining()>0||clock.key!==liveKey())return false;
 const id=clock.side==='left'?'liveLeftSeconds':clock.side==='right'?'liveRightSeconds':'liveSeconds';
 const input=document.getElementById(id);if(!input)return false;
 input.value=String(clock.seconds);input.dispatchEvent(new Event('input',{bubbles:true}));return true;
}
function decorateLive(){
 const w=state.activeWorkout,i=w&&currentLive();if(!i)return cancelClock();
 const m=metaFor(w.day,i),isProgram=!!programs[w.programId||state.programJourney?.programId];
 if(!m.mobility&&!isProgram)return cancelClock();
 const root=document.querySelector('#liveContent .v123-exercise-page');if(!root)return;
 if(clock&&clock.key!==liveKey())cancelClock();
 if(root.querySelector('.v200-mobility-note'))return;
 const box=document.createElement('section');box.className='v200-mobility-note';
 box.innerHTML='<strong>'+(cs()?'Mobilita · jemně a bez bolesti':'Mobility · gentle and pain-free')+'</strong><p>'+(cs()?'První týden jedna série. Rozsah zvětšuj postupně; nepřidávej váhu. U cviků / strana dokonči obě strany.':'One set in week one. Increase range gradually; do not add weight. Complete both sides for exercises marked / side.')+'</p>';
 if(['time','sidetime'].includes(m.mode)){
  const side=m.mode==='sidetime',seconds=m.id==='cat_cow'?45:Math.min(180,Math.max(5,Number(String(m.range).match(/\d+/)?.[0])||20));
  box.innerHTML+='<div id="v200HoldTimer"><label>'+(cs()?'Délka časovače (sekundy)':'Timer length (seconds)')+'<input data-duration type="number" min="5" max="180" step="1" value="'+seconds+'" inputmode="numeric"></label><output data-clock aria-live="off">'+(cs()?'Připraveno':'Ready')+'</output><div class="v200-timer-actions">'+(side?'<button type="button" data-start="left">'+(cs()?'▶ Levá':'▶ Left')+'</button><button type="button" data-start="right">'+(cs()?'▶ Pravá':'▶ Right')+'</button>':'<button type="button" data-start="both">'+(cs()?'▶ Spustit':'▶ Start')+'</button>')+'<button type="button" data-stop>'+(cs()?'Zastavit':'Stop')+'</button><button type="button" data-fill hidden>'+(cs()?'Zapsat čas do pole':'Fill time field')+'</button></div><small>'+(cs()?'Dokončení série potvrď tlačítkem Hotovo. Časovač nic neukládá automaticky.':'Confirm the set with Done. The timer never saves automatically.')+'</small></div>';
 }
 const before=root.querySelector('.v123-set-list');root.insertBefore(box,before);
 box.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>{
  const input=box.querySelector('[data-duration]'),value=Number(input.value);
  input.setCustomValidity(Number.isInteger(value)&&value>=5&&value<=180?'':(cs()?'Zadej celé číslo 5–180.':'Enter an integer from 5 to 180.'));
  if(input.reportValidity())startClock(b.dataset.start,value);
 });
 const stop=box.querySelector('[data-stop]');if(stop)stop.onclick=()=>{cancelClock();const out=box.querySelector('[data-clock]');out.textContent=cs()?'Zastaveno':'Stopped';box.querySelector('[data-fill]').hidden=true};
 const fill=box.querySelector('[data-fill]');if(fill)fill.onclick=fillTime;
 if(clock)paintClock();
}
function install(){
 const native=renderLive;renderLive=function(...args){const r=native.apply(this,args);decorateLive();return r};window.renderLive=renderLive;
 const back=backToExerciseList;backToExerciseList=function(...args){cancelClock();return back.apply(this,args)};window.backToExerciseList=backToExerciseList;
 document.addEventListener('visibilitychange',()=>{if(clock)paintClock()});
}
window.GymV200={LONG,DAILY,programs,definitions,registerLibrary,guideMarkup,applyDose,bindGuide,startClock,cancelClock,remaining,fillTime};
document.addEventListener('DOMContentLoaded',install,{once:true});
})();
