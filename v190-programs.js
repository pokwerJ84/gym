/* Two user-approved 40-minute programs, definitions and training guides. */
(()=>{
'use strict';
const item=(id,sets,range)=>({id,sets,range});
const session=(titleCs,titleEn,subCs,subEn,items)=>({titleCs,titleEn,subCs,subEn,items});
const THREE='upper_lower_full_40',FOUR='upper_lower_4_40';
const PROGRAMS={
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
   const s=p.sessions[i];return [day,{title_cs:s.titleCs,title_en:s.titleEn,sub_cs:s.subCs,sub_en:s.subEn,items:s.items.map(x=>({...x}))}];
  }))};
 });
}
function registerMeta(){
 Object.entries(PROGRAMS).forEach(([id,p])=>{
  PROGRAM_META[id]={icon:id===THREE?'③':'④',sessions:0,label_cs:p.nameCs,label_en:p.nameEn,detail_cs:p.sessions.length+' sessions v pořadí · cca 40 min · návod k tréninku',detail_en:p.sessions.length+' sessions in rotation · about 40 min · training guide'};
 });
}
function sessionsFor(id){return PROGRAMS[id]?.sessions||null}
function sessionFor(id,index=0){
 if(id===THREE)return null;
 const list=sessionsFor(id)||(id==='busy_week'?window.GymV165?.busySessions:null);
 if(!list?.length)return null;return list[((Number(index)||0)%list.length+list.length)%list.length];
}
const cs=()=>lang()==='cs';
function guideMarkup(id){
 const p=PROGRAMS[id];if(!p)return '';
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
 return '<p>'+ (cs()?p.scheduleCs:p.scheduleEn)+'</p><div class="v190-session-totals">'+p.sessions.map(s=>'<p><strong>'+(cs()?s.titleCs:s.titleEn)+'</strong> · '+s.items.reduce((n,x)=>n+x.sets,0)+' '+(cs()?'pracovních sérií':'working sets')+'</p>').join('')+'</div>'+(cs()?cz:en).map(([title,body])=>'<section style="margin-top:18px"><h3 style="margin:0 0 6px">'+title+'</h3><p style="margin:0;line-height:1.5">'+body+'</p></section>').join('')+'<p style="margin-top:20px">'+(cs()?'U Pallof pressu platí počet opakování pro každou stranu. Cviky můžeš upravovat přes Zobrazit sessions.':'Pallof press reps apply to each side. Edit exercises through View sessions.')+'</p>';
}
function openGuide(){
 const id=state.programJourney?.programId,p=PROGRAMS[id];if(!p)return;
 let d=document.getElementById('v190GuideDialog');
 if(!d){d=document.createElement('dialog');d.id='v190GuideDialog';d.innerHTML='<div class="modal"><button type="button" class="iconbtn close">✕</button><h2></h2><div class="v190-guide-body"></div></div>';document.body.appendChild(d);d.querySelector('button').onclick=()=>d.close()}
 d.querySelector('h2').textContent=cs()?p.nameCs:p.nameEn;d.querySelector('.v190-guide-body').innerHTML=guideMarkup(id);if(!d.open)d.showModal();
}
function decorateGuide(){
 document.querySelectorAll('.screen .workout-hero').forEach(hero=>{
  let b=hero.querySelector('.v190-guide-button');
  if(!PROGRAMS[state.programJourney?.programId]){b?.remove();return}
  if(!b){b=document.createElement('button');b.type='button';b.className='secondary v190-guide-button';b.style.cssText='margin-top:10px;width:100%';b.onclick=openGuide;hero.appendChild(b)}
  b.textContent=cs()?'ⓘ Jak trénovat tento program':'ⓘ How to train this program';
 });
}
function installGuide(){
 const native=renderDay;renderDay=function(...args){const r=native.apply(this,args);requestAnimationFrame(decorateGuide);return r};window.renderDay=renderDay;
 requestAnimationFrame(decorateGuide);
}
window.GymV190={THREE,FOUR,programs:PROGRAMS,registerPresets,registerMeta,sessionsFor,sessionFor,isFourDay:id=>id===FOUR,guideMarkup,openGuide};
document.addEventListener('DOMContentLoaded',installGuide,{once:true});
})();
