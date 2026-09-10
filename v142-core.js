/* Gym Tracker v142: Technogym Rotary Torso + built-in machine photos */
(()=>{
'use strict';

const ID='technogym_rotary_torso';
const PHOTOS=[
  './exercise-guides/v142/technogym_rotary_torso_1.svg',
  './exercise-guides/v142/technogym_rotary_torso_2.svg',
  './exercise-guides/v142/technogym_rotary_torso_3.svg'
];

function addExercise(){
  try{
    if(!Array.isArray(LIBRARY)) return;
    if(!LIBRARY.some(x=>x.id===ID)){
      LIBRARY.push({
        id:ID,
        cs:'Technogym Rotary Torso',
        en:'Technogym Rotary Torso',
        category:'core',
        mode:'sideweight',
        sets:3,
        range:'10–15 / strana',
        rest:60,
        topPick:true,
        guideImage:PHOTOS[0],
        guideThumb:PHOTOS[0],
        guideExact:true,
        tips:{
          cs:[
            'Podle štítku na tomto stroji nastav polohu C na 3 a ramena vlož pod horní polštáře',
            'Chodidla opři o přední opěrku, trup drž vzpřímeně a pánev stabilně na sedadle',
            'Otáčej trup plynule proti odporu, bez švihu; návrat brzdi a potom vystřídej stranu'
          ],
          en:[
            'According to this machine’s label, set position C to 3 and place your shoulders under the upper pads',
            'Brace your feet on the front support, keep your torso tall, and keep your pelvis stable on the seat',
            'Rotate smoothly against resistance without momentum; control the return, then switch sides'
          ]
        },
        mistakes:{
          cs:[
            'Švihání do krajní polohy',
            'Příliš těžká váha a zkrácený rozsah',
            'Zvedání chodidel nebo ztráta pevné pozice na sedadle'
          ],
          en:[
            'Swinging into the end position',
            'Using too much weight and shortening the range',
            'Lifting the feet or losing a stable seated position'
          ]
        }
      });
    }
    if(typeof refreshExerciseIndex==='function') refreshExerciseIndex();
  }catch(e){console.warn('v142 add exercise failed',e)}
}

function renderBuiltInPhotos(exerciseId){
  const panel=document.getElementById('exerciseMediaPanel');
  if(!panel) return;
  panel.querySelector('.v142-machine-photos')?.remove();
  if(exerciseId!==ID) return;
  const section=document.createElement('section');
  section.className='v142-machine-photos';
  const isCs=typeof lang==='function'&&lang()==='cs';
  section.innerHTML=`
    <div class="v142-machine-photos-head">
      <h3>${isCs?'Fotky stroje':'Machine photos'}</h3>
      <small>${isCs?'Technogym Rotary Torso – tvoje fotky':'Technogym Rotary Torso – your photos'}</small>
    </div>
    <div class="v142-machine-photo-strip">
      ${PHOTOS.map((src,i)=>`<button type="button" class="v142-machine-photo" aria-label="${isCs?'Zvětšit fotku':'Open photo'} ${i+1}">
        <img src="${src}" alt="Technogym Rotary Torso ${i+1}" loading="${i===0?'eager':'lazy'}">
      </button>`).join('')}
    </div>`;
  panel.prepend(section);
  section.querySelectorAll('.v142-machine-photo').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const img=btn.querySelector('img');
      if(!img) return;
      let viewer=document.getElementById('v142PhotoViewer');
      if(!viewer){
        viewer=document.createElement('dialog');
        viewer.id='v142PhotoViewer';
        viewer.className='v142-photo-viewer';
        viewer.innerHTML='<button type="button" class="v142-photo-close">×</button><img alt="">';
        document.body.appendChild(viewer);
        viewer.querySelector('.v142-photo-close').onclick=()=>viewer.close();
        viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});
      }
      viewer.querySelector('img').src=img.src;
      viewer.showModal();
    });
  });
}

function hookOpenVideo(){
  try{
    const native=window.openVideo || (typeof openVideo==='function'?openVideo:null);
    if(typeof native!=='function'||native.__v142) return;
    const wrapped=function(exerciseId,...args){
      const result=native.call(this,exerciseId,...args);
      requestAnimationFrame(()=>renderBuiltInPhotos(exerciseId));
      return result;
    };
    wrapped.__v142=true;
    window.openVideo=wrapped;
    try{openVideo=wrapped}catch(_){}
  }catch(e){console.warn('v142 hook failed',e)}
}

function start(){
  addExercise();
  hookOpenVideo();
}
window.GymV142={release:'v142',addExercise,renderBuiltInPhotos};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
