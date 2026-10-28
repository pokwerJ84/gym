/* Two user-approved 40-minute programs, definitions and training guides. */
(()=>{
'use strict';
const item=(id,sets,range)=>({id,sets,range});
const session=(titleCs,titleEn,subCs,subEn,items)=>({titleCs,titleEn,subCs,subEn,items});
const THREE='upper_lower_full_40',FOUR='upper_lower_4_40';
const PROGRAMS={
 ...(window.GymV200?.programs||{}),
 ...(window.GymV207?.programs||{}),
 [THREE]:{nameCs:'3 dny – Horní / Nohy / Kombinovaný · 40 min',nameEn:'3 Days – Upper / Lower / Combined · 40 min',scheduleCs:'Pondělí: horní tělo · středa: nohy a břicho · pátek: kombinovaný',scheduleEn:'Monday: upper body · Wednesday: legs and core · Friday: combined',sessions:[
  session('Horní tělo','Upper Body','Hrudník, záda, ramena a ruce','Chest, back, shoulders and arms',[
   item('machine_chest_press',3,'8–12'),item('lat_pulldown',3,'8–12'),item('seated_row',2,'8–12'),item('lateral_raise',2,'12–20'),item('dumbbell_curl',2,'10–15'),item('triceps_pushdown',2,'10–15')]),
  session('Nohy a břicho','Legs and Core','Stehna, hýždě, lýtka a břicho','Quads, hamstrings, glutes, calves and core',[
   item('leg_press',3,'8–12'),item('seated_leg_curl',3,'10–15'),item('hip_thrust',2,'8–12'),item('standing_calf_raise',2,'10–15'),item('cable_crunch',2,'10–15')]),
  session('Kombinovaný','Combined','Druhý trénink horního i dolního těla','Second upper- and lower-body stimulus',[
   item('incline_dumbbell_press',3,'8–12'),item('seated_row',3,'8–12'),item('leg_press',2,'10–15'),item('seated_leg_curl',2,'10–15'),item('lateral_raise',2,'12–20'),item('standing_calf_raise',2,'10–15')])
 ]},
 [FOUR]:{nameCs:'4 dny – Horní / Nohy A–B · 40 min',nameEn:'4 Days – Upper / Lower A–B · 40 min',scheduleCs:'Pondělí: horní A · úterý: nohy A · čtvrtek: horní B · pátek: nohy B',scheduleEn:'Monday: upper A · Tuesday: lower A · Thursday: upper B · Friday: lower B',sessions:[
  session('Horní tělo A','Upper Body A','Hrudník, záda, ramena a ruce','Chest, back, shoulders and arms',[
   item('machine_chest_press',3,'8–12'),item('lat_pulldown',3,'8–12'),item('seated_row',2,'10–12'),item('lateral_raise',2,'12–20'),item('dumbbell_curl',2,'10–15'),item('triceps_pushdown',2,'10–15')]),
  session('Nohy A','Lower Body A','Stehna, hýždě, lýtka a břicho','Quads, hamstrings, glutes, calves and core',[
   item('leg_press',3,'8–12'),item('seated_leg_curl',3,'10–15'),item('hip_thrust',2,'8–12'),item('standing_calf_raise',3,'10–15'),item('cable_crunch',2,'10–15')]),
  session('Horní tělo B','Upper Body B','Šikmé tlaky, přítahy, ramena a ruce','Incline press, rows, shoulders and arms',[
   item('incline_dumbbell_press',3,'8–12'),item('seated_row',3,'8–12'),item('machine_shoulder_press',2,'8–12'),item('lateral_raise',2,'12–20'),item('hammer_curl',2,'10–15'),item('triceps_pushdown',2,'10–15')]),
  session('Nohy B','Lower Body B','Hack squat, zadní stehna, hýždě a stabilita','Hack squat, hamstrings, glutes and stability',[
   item('hack_squat',3,'8–12'),item('seated_leg_curl',3,'10–15'),item('hip_thrust',2,'10–15'),item('standing_calf_raise',3,'10–15'),item('pallof_press',2,'10 / strana')])
 ]}
};
function registerPresets(){
 Object.entries(PROGRAMS).forEach(([id,p])=>{
  PLAN_PRESETS[id]={name_cs:p.nameCs,name_en:p.nameEn,plans:Object.fromEntries(['monday','wednesday','friday'].map((day,i)=>{
   const s=p.sessions[i%p.sessions.length];return [day,{title_cs:s.titleCs,title_en:s.titleEn,sub_cs:s.subCs,sub_en:s.subEn,items:s.items.map(x=>({...x}))}];
  }))};
 });
}
function registerMeta(){
 Object.entries(PROGRAMS).forEach(([id,p])=>{
  PROGRAM_META[id]={icon:id===THREE?'③':'④',sessions:0,label_cs:p.nameCs,label_en:p.nameEn,detail_cs:p.sessions.length+' sessions v pořadí · cca 40 min · návod k tréninku',detail_en:p.sessions.length+' sessions in rotation · about 40 min · training guide'};
  if(window.GymV207?.programs[id])Object.assign(PROGRAM_META[id],{icon:'↔',detail_cs:'3 sestavy · provaz, rozštěp a příprava mostu · 25–40 min',detail_en:'3 sessions · front splits, middle splits & bridge preparation · 25–40 min'});
  if(window.GymV200?.programs[id])Object.assign(PROGRAM_META[id],{icon:'↔',detail_cs:id===window.GymV200.DAILY?'Lehce doma · 10–15 min · záda a kyčle':'3 sestavy · pozvolný začátek · plán na 6 týdnů',detail_en:id===window.GymV200.DAILY?'Easy daily · 10–15 min · back and hips':'3 sessions · gradual start · six-week plan'});
 });
}
function sessionsFor(id){return PROGRAMS[id]?.sessions||window.GymV198?.sessionsFor(id)||null}
function sessionFor(id,index=0){
 if(id===THREE)return null;
 const list=sessionsFor(id)||(id==='busy_week'?window.GymV165?.busySessions:null);
 if(!list?.length)return null;return list[((Number(index)||0)%list.length+list.length)%list.length];
}
const cs=()=>lang()==='cs';
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Descriptions do not alter the session registry or existing program rotation.
const DESCRIPTIONS={
 balanced:['Celé tělo ve třech variantách: základní síla, stabilita a kontrola pohybu. Součástí jsou ruce, core i lehké kardio.','Three full-body variations for strength, stability and movement control, including arms, core and light cardio.'],
 full_body:['Tři různé tréninky celého těla kombinují nohy, tlaky, tahy a core. Vhodné pro pravidelné procvičení hlavních svalových skupin.','Three full-body sessions combine legs, presses, pulls and core for regular training of the main muscle groups.'],
 hypertrophy:['Trénink pro růst svalů rozdělený na Push (hrudník, ramena, triceps), Pull (záda, biceps) a Legs (nohy).','Muscle-building split: Push trains chest, shoulders and triceps; Pull trains back and biceps; Legs trains the lower body.'],
 machines:['Tři varianty celého těla na strojích a kladkách. Před každým cvikem nastav sedadlo, opěrky a rozsah pohybu podle sebe.','Three full-body variations using machines and cables. Adjust seats, supports and movement range to fit you before each exercise.'],
 quick:['Krátké tréninky s menším počtem cviků pro dny, kdy máš málo času. Projdi všechny varianty v pořadí; délka závisí i na pauzách a dostupnosti vybavení.','Shorter sessions with fewer exercises for busy days. Rotate through all sessions; duration also depends on rest and equipment availability.'],
 sixpack_starter:['Krátký úvod do tréninku břicha a stability středu těla. Důraz je na kontrolovaný pohyb, dýchání a zvládnutí techniky. Samotné cviky nezaručí viditelný six-pack.','A short introduction to abs and core stability, focused on controlled movement, breathing and technique. Exercises alone do not guarantee visible abs.'],
 sixpack_builder:['Navazující program pro sílu břicha a kontrolu středu těla. Zvyšuj obtížnost postupně a udržuj klidný trup. Viditelnost břicha závisí i na množství tělesného tuku.','A progression for abdominal strength and core control. Increase difficulty gradually while keeping the torso steady. Visible abs also depend on body fat.'],
 get_ripped:['Kombinuje posilování celého těla, core a kardio. Kondiční část dělej po silové. Program sám nezaručuje úbytek tuku; záleží i na stravě a regeneraci.','Combines full-body lifting, core and cardio. Do conditioning after lifting. Fat loss also depends on nutrition and recovery.'],
 arms:['Specializace na biceps a triceps doplněná tlaky a tahy. Tento plán neobsahuje trénink nohou; pro celé tělo zvol jiný program nebo přidej samostatný trénink nohou.','Biceps and triceps specialization with presses and pulls. This plan has no leg training; choose another program or add a separate leg session for full-body coverage.'],
 busy_week:['Pět tréninků v průběžné rotaci: Push, Legs A, Pull, Legs B + Core, Arms + Abs. Počítej přibližně se 40 minutami posilování a 20 minutami pásu.','Five rotating sessions: Push, Legs A, Pull, Legs B + Core, Arms + Abs. Allow about 40 minutes of lifting plus 20 minutes on the treadmill.'],
 strength_builder:['Silový program s těžšími hlavními cviky a nižšími rozsahy opakování. Důraz je na čistou techniku, delší pauzy a postupné přidávání zátěže.','Strength-focused training with heavier main lifts and lower rep ranges. Prioritize clean technique, longer rests and gradual load increases.']
};
function guideProgram(id){
 if(PROGRAMS[id])return PROGRAMS[id];
 const p=PLAN_PRESETS[id];if(!p)return null;
 const list=id==='busy_week'?window.GymV165?.busySessions:window.GymV198?.sessionsFor(id);
 return {nameCs:PROGRAM_META[id]?.label_cs||p.name_cs,nameEn:PROGRAM_META[id]?.label_en||p.name_en,
  sessions:list||Object.values(p.plans).map(s=>({titleCs:s.title_cs,titleEn:s.title_en,subCs:s.sub_cs,subEn:s.sub_en,items:s.items}))};
}
function sessionOverview(id,p){
 const edited=window.GymV187?.sessions(id);
 return (edited||p.sessions.map((s,i)=>({key:String(i),title:cs()?s.titleCs:s.titleEn,items:s.items}))).map(s=>{
  const items=state.programSessionLayouts?.[id]?.[s.key]||s.items;
  return '<section style="margin-top:16px"><h3>'+escape(s.title)+'</h3><p style="line-height:1.5">'+items.map(x=>{
   const exercise=typeof EX!=='undefined'?EX[x.id]:null;
   return escape(exercise?itemName(exercise):x.id)+' · '+escape(x.sets||exercise?.sets||3)+' × '+escape(x.range||exercise?.range||'');
  }).join('<br>')+'</p></section>';
 }).join('');
}
function legacyGuide(id,p){
 const core=id==='sixpack_starter'||id==='sixpack_builder',strength=id==='strength_builder';
 const limit=PROGRAM_META[id]?.sessions;
 const sections=cs()?[
  ['Zaměření',DESCRIPTIONS[id]?.[0]||p.nameCs],
  ['Pořadí a rozvrh',id==='busy_week'?'Cvič 4–5× týdně podle regenerace. Pokračuj další session v pětikrokovém cyklu i po volném dni; vynechaný den nedoháněj dvěma tréninky. Názvy dnů nejsou pevný kalendář.':'Střídej uvedené sessions v pořadí, například pondělí, středa a pátek. Mezi tréninky nech den volna. '+(limit?'Program má '+limit+' tréninků; při třech týdně trvá '+(limit/3)+' týdnů.':'Rotaci můžeš opakovat podle potřeby.')],
  ['Zahřátí','Začni 4–5 minutami lehkého pohybu. '+(core?'První cvik nejprve vyzkoušej v lehké variantě.':'Před prvním hlavním cvikem udělej 1–2 lehčí přípravné série; u těžších cviků přidej další postupně.')+' Přípravné série nepočítej jako pracovní.'],
  ['Jak cvičit',core?'Pohyb veď bez švihu a průběžně dýchej. U výdrží konči, jakmile ztrácíš polohu; u opakování nech přibližně 2 čistá v rezervě.':'Dodržuj série a rozsahy uvedené u cviku. Zvol váhu s přibližně 1–2 čistými opakováními v rezervě, první týden 2–3. Technika má přednost před váhou.'],
  ['Pauzy',strength?'U těžkých hlavních cviků odpočívej 2–3 minuty, u doplňků 60–90 sekund.':core?'Mezi sériemi odpočívej přibližně 45–90 sekund; déle, pokud se ještě nevrátila kontrola dechu a techniky.':'U hlavních cviků odpočívej 90–120 sekund, u menších 60–90 sekund. Pauzu prodluž, pokud ji potřebuješ pro čisté opakování.'],
  ['Postupné zlepšování','Když všechny série zvládneš na horní hranici rozsahu se stejnou rezervou a technikou, příště přidej nejmenší krok váhy. U cviku bez zátěže nejprve přidávej opakování nebo čas v předepsaném rozsahu. Výsledky porovnávej v historii.'],
  ['Regenerace','Bolest svalů druhý den není měřítkem růstu. Pokud únava zhoršuje techniku, uber zátěž nebo zařaď volno. Při ostré bolesti kloubu, krku nebo zad cvik zastav.']
 ]:[
  ['Focus',DESCRIPTIONS[id]?.[1]||p.nameEn],
  ['Order and schedule',id==='busy_week'?'Train 4–5 times weekly as recovery allows. Continue the five-session cycle after rest days; do not make up a missed day with two workouts. Session names are not fixed weekdays.':'Rotate through the sessions in order, for example Monday, Wednesday and Friday, with a rest day between workouts. '+(limit?'The program contains '+limit+' workouts, taking '+(limit/3)+' weeks at three per week.':'Repeat the rotation as needed.')],
  ['Warm-up','Start with 4–5 minutes of easy movement. '+(core?'Try an easy version of the first exercise.':'Use 1–2 lighter preparation sets before the first main lift; add more gradual steps for heavier lifts.')+' Preparation sets do not count as working sets.'],
  ['How to train',core?'Move without swinging and breathe throughout. End holds when you lose position; leave about two clean reps in reserve for repetitions.':'Follow the listed sets and rep ranges. Leave about 1–2 clean reps in reserve, or 2–3 in the first week. Prioritize technique over load.'],
  ['Rest',strength?'Rest 2–3 minutes for heavy main lifts and 60–90 seconds for accessories.':core?'Rest about 45–90 seconds between sets, longer if needed to regain breathing and technique.':'Rest 90–120 seconds for main lifts and 60–90 seconds for smaller exercises. Take longer when needed for clean reps.'],
  ['Progression','When all sets reach the top of the range with consistent technique and effort, add the smallest load increment next time. For unweighted exercises, first increase reps or time within the prescribed range. Compare your results in History.'],
  ['Recovery','Next-day soreness is not a measure of growth. Reduce the load or take a rest day when fatigue affects technique. Stop if an exercise causes sharp joint, neck or back pain.']
 ];
 return sections.map(([title,body])=>'<section style="margin-top:18px"><h3>'+escape(title)+'</h3><p style="line-height:1.5">'+escape(body)+'</p></section>').join('')+sessionOverview(id,p)+'<p>'+(cs()?'Výdrže jsou v sekundách, kardio v minutách a rozsah / strana platí pro každou stranu. Cviky upravíš přes Zobrazit sessions. Klepnutím na ikonu cviku otevřeš jeho detail.':'Holds use seconds, cardio uses minutes, and / side applies to each side. Edit exercises through View sessions. Tap an exercise icon to open its details.')+'</p>';
}
function guideMarkup(id){
 const p=guideProgram(id);if(!p)return '';
 if(window.GymV207?.programs[id])return window.GymV207.guideMarkup(id)+sessionOverview(id,p);
 if(window.GymV200?.programs[id])return window.GymV200.guideMarkup(id)+sessionOverview(id,p);
 if(window.GymV198?.isCustom(id))return '<p>'+escape(state.customPrograms[id]?.description||'')+'</p><p>'+(cs()?'Pokračuj tréninky v uvedeném pořadí. Rozvrh a dny volna si zvol podle svého programu a regenerace. Před cvičením se zahřej; dodržuj kontrolovanou techniku. Cviky, jejich pořadí a předpis upravíš přes Změnit program → Upravit.':'Follow the sessions in the listed order. Choose training and rest days to suit your program and recovery. Warm up and use controlled technique. Edit exercises, their order and prescriptions through Change program → Edit.')+'</p>'+sessionOverview(id,p);
 if(!PROGRAMS[id])return legacyGuide(id,p);
 const en=[
  ['Session order',p.scheduleEn+'. The weekdays are suggestions. Follow the session order even if you train on different days. Leave a rest day between the 3-day sessions; for the 4-day plan, leave about 48 hours between sessions for the same body region.'],
  ['Warm-up','Start with 4–5 minutes of easy movement and 1–2 lighter preparation sets for the first main exercise. Preparation sets do not count as working sets.'],
  ['Effort','Use a load that makes the final reps challenging while leaving about 1–2 clean reps in reserve. Start with 2–3 reps in reserve during the first week. No need to fail every set.'],
  ['Rest','Rest 90–120 seconds after main exercises and 60–90 seconds after smaller exercises. Take longer if needed to keep good technique.'],
  ['Stay near 40 minutes','Pair biceps with triceps, or calves with core, when equipment is available. You can also alternate chest press and rows. Keep technique controlled. Waiting for machines can extend the session.'],
  ['Progress the load','When every working set reaches the top of its rep range with good technique and the same effort, add the smallest available weight increment next time. If reps fall below the range, reduce the load.'],
  ['Keep it consistent','Keep the program for 6–8 weeks and compare reps and loads in History. Soreness is not a measure of muscle growth. Stop an exercise if it causes sharp joint, neck or back pain.']
 ];
 const cz=[
  ['Pořadí sessions',p.scheduleCs+'. Dny jsou příklad. Dodržuj pořadí sessions, i když jdeš do gymu jiný den. U 3denního plánu nech mezi tréninky den volna; u 4denního plánu nech přibližně 48 hodin mezi tréninky stejné části těla.'],
  ['Zahřátí','Začni 4–5 minutami lehkého pohybu a 1–2 lehčími přípravnými sériemi prvního hlavního cviku. Přípravné série se nepočítají do pracovních sérií.'],
  ['Náročnost','Zvol váhu, se kterou jsou poslední opakování náročná a zbývají asi 1–2 čistá opakování v rezervě. První týden nech 2–3 opakování v rezervě. Nemusíš každou sérii cvičit do selhání.'],
  ['Pauzy','Po hlavních cvicích odpočívej 90–120 sekund, po menších cvicích 60–90 sekund. Pokud potřebuješ delší pauzu pro dobrou techniku, prodluž ji.'],
  ['Jak se přiblížit 40 minutám','Pokud jsou stanoviště dostupná, střídej biceps s tricepsem nebo lýtka s břichem. Můžeš také střídat tlaky na hrudník a přítahy. Drž kontrolovanou techniku. Čekání na stroje může trénink prodloužit.'],
  ['Přidávání váhy','Jakmile ve všech pracovních sériích dosáhneš horní hranice opakování s dobrou technikou a stejnou rezervou, příště přidej nejmenší dostupný krok váhy. Pokud opakování klesnou pod rozsah, váhu sniž.'],
  ['Pravidelnost','Drž program 6–8 týdnů a porovnávej opakování a váhy v historii. Bolest svalů není měřítkem růstu. Při ostré bolesti kloubu, krku nebo zad cvik zastav.']
 ];
 return '<p>'+escape(cs()?p.scheduleCs:p.scheduleEn)+'</p><p>'+(cs()?'Program pro růst svalů s rozdělením horního a dolního těla. Tréninky mají přibližně 40 minut; skutečná délka závisí na pauzách a vybavení.':'A muscle-building program split between upper and lower body. Sessions target about 40 minutes; actual duration depends on rest and equipment.')+'</p>'+sessionOverview(id,p)+(cs()?cz:en).map(([title,body])=>'<section style="margin-top:18px"><h3 style="margin:0 0 6px">'+title+'</h3><p style="margin:0;line-height:1.5">'+body+'</p></section>').join('')+'<p style="margin-top:20px">'+(cs()?'Rozsah / strana platí pro každou stranu; výdrže jsou v sekundách a kardio v minutách. Cviky můžeš upravovat přes Zobrazit sessions. Klepnutím na ikonu otevřeš detail cviku.':'Ranges marked / side apply to each side; holds are in seconds and cardio in minutes. Edit exercises through View sessions. Tap an icon to open exercise details.')+'</p>';
}
function openGuide(){
 const id=state.programJourney?.programId,p=guideProgram(id);if(!p)return;
 let d=document.getElementById('v190GuideDialog');
 if(!d){d=document.createElement('dialog');d.id='v190GuideDialog';d.innerHTML='<div class="modal"><button type="button" class="iconbtn close">✕</button><h2></h2><div class="v190-guide-body"></div></div>';document.body.appendChild(d);d.querySelector('button').onclick=()=>d.close()}
 d.querySelector('h2').textContent=cs()?p.nameCs:p.nameEn;d.querySelector('.v190-guide-body').innerHTML=guideMarkup(id);window.GymV200?.bindGuide(d,id);if(!d.open)d.showModal();
}
function decorateGuide(){
 document.querySelectorAll('.screen .workout-hero').forEach(hero=>{
  let b=hero.querySelector('.v190-guide-button');
  if(!guideProgram(state.programJourney?.programId)){b?.remove();return}
  if(!b){b=document.createElement('button');b.type='button';b.className='secondary v190-guide-button';b.style.cssText='margin-top:10px;width:100%';hero.appendChild(b)}
  b.textContent=cs()?'ⓘ Jak trénovat tento program':'ⓘ How to train this program';
 });
}
function installGuide(){
 // Session rendering can clone hero markup, so use delegation rather than a lost onclick property.
 document.addEventListener('click',event=>{if(event.target?.closest?.('.v190-guide-button')){event.preventDefault();openGuide()}});
 const native=renderDay;renderDay=function(...args){const r=native.apply(this,args);requestAnimationFrame(decorateGuide);return r};window.renderDay=renderDay;
 requestAnimationFrame(decorateGuide);
}
window.GymV190={THREE,FOUR,programs:PROGRAMS,registerPresets,registerMeta,sessionsFor,sessionFor,isFourDay:id=>id===FOUR||!!window.GymV207?.programs[id]||!!window.GymV200?.programs[id]||!!window.GymV198?.sessionsFor(id),guideMarkup,openGuide};
document.addEventListener('DOMContentLoaded',installGuide,{once:true});
})();

