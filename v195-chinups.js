/* Bodyweight pulling exercises with separately logged assistance and setup. */
(()=>{
'use strict';
const cs=()=>lang()==='cs';
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asset=id=>'./exercise-guides/v195/'+id+'.webp';
const muscles={primaryMuscles:{cs:['Široký sval zádový'],en:['Latissimus dorsi']},secondaryMuscles:{cs:['Biceps','Svaly kolem lopatek'],en:['Biceps','Scapular muscles']}};
const gripCs='Podhmat přibližně na šířku ramen: dlaně směřují k tobě. Zpevni břicho a táhni lokty dolů k bokům.';
const gripEn='Use a shoulder-width underhand grip, palms facing you. Brace your trunk and drive elbows down toward your sides.';
const neckCs='Bradu dostaň nad hrazdu pohybem těla, bez zaklánění krku. Dolů se vracej kontrolovaně, bez houpání a kopání.';
const neckEn='Raise your chin above the bar by lifting your body, without craning your neck. Lower under control, without swinging or kicking.';
const definitions=[
 {id:'inverted_row',cs:'Australský shyb – přítahy pod hrazdou',en:'Australian Pull-Up / Inverted Row',sets:3,range:'6–10',rest:120,
  primaryMuscles:{cs:['Střední trapéz','Mezilopatkové svaly'],en:['Middle trapezius','Rhomboids']},secondaryMuscles:{cs:['Široký sval zádový','Biceps','Zadní ramena'],en:['Latissimus dorsi','Biceps','Rear deltoids']},
  focus:{cs:'Přitahuj hrudník k pevné hrazdě a drž tělo v jedné linii.',en:'Pull your chest toward the fixed bar while keeping your body straight.'},
  tips:{cs:['Použij pevně zajištěnou nízkou hrazdu nebo bezpečně uzamčenou osu Multipressu; ověř, že se při tahu neuvolní.','Lehni pod hrazdu obličejem vzhůru. Uchop ji přibližně na šířku ramen, zpevni břicho a hýždě.','Přitahuj hrudník k tyči, lokty veď dozadu. Hlava zůstává v prodloužení trupu; dolů se vracej pomalu.','Lehčí: vyšší hrazda a pokrčená kolena. Těžší: natažené nohy s oporou o paty a postupně nižší hrazda.','Začni 3×6–10 dvakrát týdně, s rezervou asi dvou opakování. Po čistých 3×10 mírně ztěž polohu. Zapisuj výšku hrazdy a variantu nohou.','V programu může nahradit přítahy vsedě. Pro první chin-up ponech také přímý nácvik shybů s dopomocí; jde o jiný směr tahu.'],en:['Use a securely fixed low bar or a safely locked Smith bar; check it cannot release under your pulling direction.','Lie face up beneath the bar. Grip around shoulder width and brace your abs and glutes.','Pull your chest toward the bar, driving elbows back. Keep your neck aligned with your torso and lower slowly.','Easier: raise the bar and bend your knees. Harder: straighten your legs, rest on your heels and gradually lower the bar.','Start with 3×6–10 twice weekly, leaving about two clean reps in reserve. Make the position slightly harder after clean 3×10. Record bar height and leg position.','This can replace seated rows. Also practice assisted chin-ups for your first chin-up; the direction of pull differs.']},
  mistakes:{cs:['Prohýbání beder a propadlé boky','Vysouvání brady nebo krčení ramen','Pohyb švihem a nezajištěná hrazda'],en:['Sagging hips or arching the lower back','Jutting the chin or shrugging','Using momentum or an unsecured bar']}},
 {id:'chin_up',cs:'Chin-up – shyb podhmatem',en:'Chin-Up – Underhand',sets:3,range:'1–5',rest:180,...muscles,
  focus:{cs:'Podhmat, pevný trup a plynulý přítah bez švihu.',en:'Underhand grip, braced torso and a smooth pull without momentum.'},
  tips:{cs:[gripCs,neckCs,'Pokud zatím nezvládneš čisté opakování, zvol samostatný cvik Chin-up s dopomocí nohou nebo Chin-up s gumou.','Po prvním zvládnutém shybu začni jednotlivými čistými opakováními s plnou pauzou. Přidávej opakování postupně; nechoď každou sérii do selhání.','Cvič na začátku tréninku po zahřátí, zpravidla dvakrát týdně s alespoň dvěma dny mezi nácviky. Zapisuj pouze čistá opakování bez dopomoci.'],en:[gripEn,neckEn,'If you cannot perform a clean rep yet, choose the separate Foot-Assisted Chin-Up or Band-Assisted Chin-Up exercise.','After your first chin-up, start with clean single repetitions and full rests. Build reps gradually rather than failing every set.','Practice after warming up, near the start of training, usually twice weekly with at least two days between practices. Log only clean unassisted reps here.']},
  mistakes:{cs:['Záměna za široký shyb nadhmatem','Kopání nohama a houpání','Zaklánění krku a nekontrolovaný pád'],en:['Using a wide overhand grip instead','Kicking or swinging','Craning the neck or dropping uncontrolled']}},
 {id:'chin_up_foot_assisted',cs:'Chin-up s dopomocí nohou',en:'Foot-Assisted Chin-Up',sets:3,range:'5–8',rest:150,...muscles,
  focus:{cs:'Nohy na stabilním stupínku pomáhají jen tolik, aby byl pohyb čistý.',en:'Feet on a stable box provide only enough help to keep the movement clean.'},
  tips:{cs:[gripCs,'Použij široký stabilní stupínek pod hrazdou. Jeho výšku zvol tak, aby nohy zůstaly opřené a kolena měla prostor se ohýbat v celém pohybu.','Táhni pažemi a zády; tlakem nohou pomáhej pouze podle potřeby. Neodrážej se a neskákej do horní polohy.',neckCs,'Začni 3×5–8 s rezervou asi dvou opakování, dvakrát týdně. Po čistých 3×8 postupně omez pomoc nohou. Zapisuj výšku stupínku a přibližnou míru pomoci, nikoli vymyšlené kilogramy.','Na dvou vybraných trénincích může nahradit stahování horní kladky. Jednou za dva týdny můžeš po zahřátí zkusit jeden shyb bez pomoci.'],en:[gripEn,'Use a broad stable box under the bar. Set its height so your feet stay supported and your knees can bend throughout the movement.','Pull with your arms and back, using only the leg pressure you need. Do not jump or bounce into the top position.',neckEn,'Start with 3×5–8, about two reps in reserve, twice weekly. After clean 3×8, gradually reduce leg help. Record box height and approximate assistance rather than invented kilograms.','This can replace lat pulldowns in two selected sessions. Every two weeks, you can try one unassisted rep after warming up.']},
  mistakes:{cs:['Nestabilní stupínek','Odraz nohama místo plynulé dopomoci','Porovnávání výsledků s různou pomocí jako stejných výkonů'],en:['An unstable box','Jumping instead of applying smooth assistance','Comparing different assistance levels as equivalent performances']}},
 {id:'chin_up_band_assisted',cs:'Chin-up s odporovou gumou',en:'Band-Assisted Chin-Up',sets:3,range:'5–8',rest:150,...muscles,
  focus:{cs:'Zapisuj konkrétní gumu; barva sama neudává univerzální dopomoc v kg.',en:'Record the actual band; its color does not define a universal assistance in kg.'},
  tips:{cs:[gripCs,'Zkontroluj nepoškozenou gumu a upevni ji podle pokynů výrobce k pevné hrazdě. K nastoupení a vystoupení použij stabilní stupínek; natažená guma nesmí vystřelit.','Použij bezpečné opření gumy podle jejího návodu. Nech ji pomáhat, ale neodrážej se a nehoupej se.',neckCs,'Zvol gumu, se kterou zvládneš 3×5–8 čistě s rezervou přibližně dvou opakování. Pokud jediná dostupná guma nestačí, použij dopomoc nohou na stupínku.','Po čistých 3×8 přejdi na slabší pomoc, pokud je dostupná. Zapisuj popis stejné gumy a stejné opření. Dopomoc se během pohybu mění; nepřeváděj ji na pevné kg.'],en:[gripEn,'Check the band for damage and attach it to a secure bar following its manufacturer instructions. Use a stable box to enter and exit; prevent a stretched band from snapping back.','Use a secure band support position following its instructions. Let it assist without bouncing or swinging.',neckEn,'Choose assistance that allows clean 3×5–8 with about two reps in reserve. If the only available band is insufficient, use foot assistance on a stable box.','After clean 3×8, use less assistance when available. Record the same band and support position. Assistance changes through the movement; do not convert it into fixed kilograms.']},
  mistakes:{cs:['Poškozená nebo špatně upevněná guma','Neopatrné nastupování a vystupování','Houpání a používání gumy jako trampolíny'],en:['A damaged or poorly anchored band','Entering or exiting carelessly','Swinging or bouncing on the band']}}
].map(x=>({category:'back',mode:'reps',topPick:true,...x,guideImage:asset(x.id),guideThumb:asset(x.id),guideExact:true}));
function registerLibrary(library){for(const x of definitions)if(!library.some(i=>i.id===x.id))library.push(x)}
function practiceText(id,p){
 const parts=[];
 if(id==='inverted_row'){
  if(p.barHeight)parts.push((cs()?'Hrazda: ':'Bar: ')+p.barHeight+' cm');
  if(p.legs)parts.push((cs()?'Nohy: ':'Legs: ')+(p.legs==='bent'?(cs()?'pokrčené':'bent'):(cs()?'natažené':'straight')));
 }else if(id==='chin_up_foot_assisted'){
  if(p.boxHeight)parts.push((cs()?'Stupínek: ':'Box: ')+p.boxHeight+' cm');
  if(p.assistance)parts.push((cs()?'Pomoc nohou: ':'Foot assistance: ')+({light:cs()?'malá':'light',medium:cs()?'střední':'moderate',strong:cs()?'velká':'strong'}[p.assistance]||''));
 }else if(id==='chin_up_band_assisted'&&p.band)parts.push((cs()?'Guma: ':'Band: ')+p.band);
 return parts.join(' · ');
}
function storePractice(id,e,key,value){
 const valid={inverted_row:['barHeight','legs'],chin_up_foot_assisted:['boxHeight','assistance'],chin_up_band_assisted:['band']};
 if(!valid[id]?.includes(key))return false;
 if(key.endsWith('Height')&&value!==''&&(!Number.isFinite(Number(value))||Number(value)<1||Number(value)>300))return false;
 if(key==='legs'&&!['','bent','straight'].includes(value))return false;
 if(key==='assistance'&&!['','light','medium','strong'].includes(value))return false;
 e.practice={...(e.practice||{}),[key]:String(value).slice(0,120)};
 // Keep ordinary notes separate so editing the setup does not erase user text.
 const prior=e.practiceNote||'';
 let note=e.notes||'';if(prior&&note.endsWith(prior))note=note.slice(0,-prior.length).trimEnd();
 e.practiceNote=practiceText(id,e.practice);e.notes=[note,e.practiceNote].filter(Boolean).join('\n');return true;
}
function decorateLive(){
 const w=state.activeWorkout,inst=w&&currentLive();if(!inst)return;
 const m=metaFor(w.day,inst),id=m.id,root=document.querySelector('#liveContent .v123-exercise-page');
 if(!root||root.querySelector('.v195-practice-fields')||!definitions.some(x=>x.id===id)||id==='chin_up')return;
 const e=entry(w.day,inst.instanceId),p=e.practice||lastRecord(id)?.practice||{};
 const field=(key,label,value)=>'<label style="display:block;margin:10px 0">'+label+'<input data-practice="'+key+'" type="number" min="1" max="300" inputmode="decimal" value="'+safe(value||'')+'" placeholder="cm" style="width:100%;margin-top:5px"></label>';
 const select=(key,label,options)=>'<label style="display:block;margin:10px 0">'+label+'<select data-practice="'+key+'" style="width:100%;margin-top:5px"><option value="">'+(cs()?'Vyber':'Choose')+'</option>'+options.map(([v,t])=>'<option value="'+v+'" '+(p[key]===v?'selected':'')+'>'+t+'</option>').join('')+'</select></label>';
 const box=document.createElement('div');box.className='v195-practice-fields';box.style.cssText='padding:12px;margin:12px 0;border:1px solid var(--line);border-radius:14px;background:var(--surface2)';
 box.innerHTML='<strong>'+(cs()?'Nastavení pro porovnání pokroku':'Setup for comparing progress')+'</strong>'+(id==='inverted_row'?field('barHeight',cs()?'Výška hrazdy od podlahy (cm)':'Bar height from floor (cm)',p.barHeight)+select('legs',cs()?'Poloha nohou':'Leg position',[['bent',cs()?'Pokrčené – lehčí':'Bent – easier'],['straight',cs()?'Natažené, opora o paty':'Straight, heels on floor']]):id==='chin_up_foot_assisted'?field('boxHeight',cs()?'Výška stupínku (cm)':'Box height (cm)',p.boxHeight)+select('assistance',cs()?'Přibližná pomoc nohou':'Approximate foot assistance',[['light',cs()?'Malá':'Light'],['medium',cs()?'Střední':'Moderate'],['strong',cs()?'Velká':'Strong']]):'<label style="display:block;margin:10px 0">'+(cs()?'Popis gumy a opření':'Band and support position')+'<input data-practice="band" maxlength="120" value="'+safe(p.band||'')+'" placeholder="'+(cs()?'Např. fialová, chodidlo':'E.g. purple, foot')+'" style="width:100%;margin-top:5px"></label>')+'<small>'+(cs()?'Porovnávej opakování při stejném nastavení. Menší pomoc nebo těžší poloha znamená jinou obtížnost, ne zhoršení.':'Compare reps with the same setup. Less help or a harder position changes difficulty; fewer reps do not necessarily mean regression.')+'</small>';
 const before=root.querySelector('.v123-set-list');root.insertBefore(box,before);
 box.querySelectorAll('[data-practice]').forEach(input=>input.onchange=()=>{
  if(!storePractice(id,e,input.dataset.practice,input.value)){input.setCustomValidity(cs()?'Zadej výšku 1–300 cm.':'Enter a height from 1–300 cm.');input.reportValidity();return}
  input.setCustomValidity('');if(e.done)syncCurrentExerciseHistory();else saveState(false);
 });
 // Prefilled settings also belong to this session when the user accepts them unchanged.
 for(const [key,value]of Object.entries(p))storePractice(id,e,key,value);
}
function install(){const native=renderLive;renderLive=function(...args){const r=native.apply(this,args);decorateLive();return r};window.renderLive=renderLive}
window.GymV195={definitions,registerLibrary,storePractice,practiceText,decorateLive};
document.addEventListener('DOMContentLoaded',install,{once:true});
})();
