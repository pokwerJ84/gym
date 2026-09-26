/* Gym Tracker v129 detail: image first, big Play, collapsed technique + video URL */
(()=>{
'use strict';const G=window.GymV129;if(!G)return;const q=G.q,qa=G.qa,cs=G.cs,safe=G.safe;
let detailId='';
const localized=v=>{if(Array.isArray(v))return v.filter(Boolean).map(String);if(v&&typeof v==='object'){const x=v[cs()?'cs':'en']??v.en??v.cs;return Array.isArray(x)?x.filter(Boolean).map(String):(typeof x==='string'&&x.trim()?[x.trim()]:[])}return typeof v==='string'&&v.trim()?[v.trim()]:[]};
const ex=id=>{try{return EX?.[id]||null}catch(_){return null}};
function store(id){try{state.exerciseMedia=state.exerciseMedia||{};state.exerciseMedia[id]=state.exerciseMedia[id]||{files:[],links:[]};return state.exerciseMedia[id]}catch(_){return {files:[],links:[]}}}G.mediaStore=store;
function videoUrl(id){const x=ex(id),s=store(id),custom=String(s.preferredVideoUrl||'').trim();if(custom)return custom;const linked=[...(s.links||[])].reverse().find(v=>String(v?.url||'').trim());if(linked)return String(linked.url).trim();const builtin=String(x?.videoUrl||'').trim();if(builtin)return builtin;const name=x?.en||x?.cs||id;return `https://www.youtube.com/results?search_query=${encodeURIComponent(name+' proper form tutorial')}`}
async function playableVideoUrl(id){
 const s=store(id),preferred=String(s.preferredVideoUrl||'').trim();
 if(preferred)return preferred;
 const uploaded=[...(s.files||[])].reverse().find(v=>v?.kind==='video'&&v?.path);
 if(uploaded){
   try{if(typeof v124SignedMediaUrl==='function')return await v124SignedMediaUrl(uploaded.path)}catch(e){console.warn('[v129 uploaded video]',e)}
 }
 return videoUrl(id);
}
async function playVideo(id){
 let popup=null;
 try{popup=window.open('about:blank','_blank')}catch(_){}
 try{
   const url=await playableVideoUrl(id);
   if(popup){popup.opener=null;popup.location.href=url}
   else window.location.href=url;
 }catch(e){
   try{popup?.close()}catch(_){}
   console.warn('[v129 play video]',e);
   G.toast(cs()?'Video se nepodařilo otevřít.':'Could not open video.');
 }
}
G.videoUrl=videoUrl;G.playableVideoUrl=playableVideoUrl;G.playVideo=playVideo;
function detailData(id){const x=ex(id)||{},tips=localized(x.technique||x.steps||x.instructions||x.howTo||x.tips),mistakes=localized(x.commonMistakes||x.mistakes),primary=localized(x.primaryMuscles||x.primaryMuscle||x.muscles),secondary=localized(x.secondaryMuscles||x.secondaryMuscle);let group='';try{group=typeof categoryName==='function'?categoryName(x.category):String(x.category||'')}catch(_){group=String(x.category||'')}return{focus:localized(x.focusToday||x.focus||x.cue)[0]||tips[0]||'',primary:primary.length?primary:(group?[group]:[]),secondary,tips,mistakes,pro:localized(x.proTip||x.tip)[0]||''}}
function techniqueHtml(id){const d=detailData(id),rows=[];if(d.focus)rows.push(`<div><b>🎯 Focus today</b><p>${safe(d.focus)}</p></div>`);if(d.primary.length||d.secondary.length)rows.push(`<div><b>💪 ${cs()?'Svaly':'Muscles'}</b><p>${safe([d.primary.length?`${cs()?'Hlavní':'Primary'}: ${d.primary.join(', ')}`:'',d.secondary.length?`${cs()?'Vedlejší':'Secondary'}: ${d.secondary.join(', ')}`:''].filter(Boolean).join(' · '))}</p></div>`);if(d.tips.length)rows.push(`<div><b>📋 ${cs()?'Technika':'Technique'}</b><ul>${d.tips.slice(0,6).map(v=>`<li>${safe(v)}</li>`).join('')}</ul></div>`);if(d.mistakes.length)rows.push(`<div><b>⚠ ${cs()?'Časté chyby':'Common mistakes'}</b><ul>${d.mistakes.slice(0,5).map(v=>`<li>${safe(v)}</li>`).join('')}</ul></div>`);if(d.pro)rows.push(`<div><b>💡 Pro tip</b><p>${safe(d.pro)}</p></div>`);return rows.length?`<details class="v129-technique"><summary><span>ⓘ</span><strong>${cs()?'Technika & tipy':'Technique & tips'}</strong><i>›</i></summary><div class="v129-technique-body">${rows.join('')}</div></details>`:''}
function currentSavedLinkId(id){
 const s=store(id),preferred=String(s.preferredVideoUrl||'').trim();
 if(!preferred)return '';
 return String((s.links||[]).find(x=>String(x?.url||'').trim()===preferred)?.id||'');
}
async function persistVideoStore(id){
 try{saveState()}catch(_){}
 try{if(typeof cloudUser!=='undefined'&&cloudUser&&typeof saveCloud==='function')await saveCloud()}catch(e){console.warn('[v176 cloud]',e)}
 try{if(typeof renderExerciseMedia==='function')await renderExerciseMedia(id)}catch(_){}
}
async function selectSavedVideoLink(id,linkId){
 const s=store(id),link=(s.links||[]).find(x=>String(x?.id)===String(linkId));if(!link?.url)return;
 s.preferredVideoUrl=String(link.url).trim();s.preferredVideoLinkId=link.id;delete s.preferredVideoClearedAt;
 await persistVideoStore(id);rebuild(id);G.toast(cs()?'Hlavní video změněno ✓':'Default video changed ✓');
}
async function addQuickVideoLink(id,raw){
 const value=String(raw||'').trim();let u;
 try{u=new URL(value);if(!['http:','https:'].includes(u.protocol))throw new Error()}catch(_){G.toast(cs()?'Vlož platný http/https odkaz.':'Enter a valid http/https link.');return false}
 const s=store(id);s.links=s.links||[];
 let link=s.links.find(x=>String(x?.url||'').trim()===u.href);
 if(!link){link={id:(typeof uid==='function'?uid():String(Date.now())),url:u.href,label:u.hostname.replace(/^www\./,''),createdAt:Date.now()};s.links.push(link)}
 if(!String(s.preferredVideoUrl||'').trim()){s.preferredVideoUrl=link.url;s.preferredVideoLinkId=link.id}
 await persistVideoStore(id);rebuild(id);G.toast(cs()?'Video odkaz uložen ✓':'Video link saved ✓');return true;
}
async function removeQuickVideoLink(id,linkId){
 const s=store(id),link=(s.links||[]).find(x=>String(x?.id)===String(linkId));if(!link)return;
 s.links=(s.links||[]).filter(x=>String(x?.id)!==String(linkId));
 if(String(s.preferredVideoUrl||'').trim()===String(link.url||'').trim()){delete s.preferredVideoUrl;delete s.preferredVideoLinkId;s.preferredVideoClearedAt=Date.now()}
 await persistVideoStore(id);rebuild(id);
}
window.v176SelectSavedVideoLink=selectSavedVideoLink;window.v176AddQuickVideoLink=addQuickVideoLink;window.v176RemoveQuickVideoLink=removeQuickVideoLink;
function hero(id){
 const modal=q('#videoDialog .modal');if(!modal)return;q('.v129-video-hero',modal)?.remove();
 const guide=q('#videoGuideWrap',modal),title=q('#videoTitle',modal),x=ex(id),img=q('#videoGuideImage',modal);
 if(guide){guide.hidden=false;guide.classList.add('v129-guide-top');if(img&&(x?.guideImage||x?.guideThumb))img.src=x.guideImage||x.guideThumb;if(title&&guide.previousElementSibling!==title)title.insertAdjacentElement('afterend',guide)}
 const s=store(id),links=(s.links||[]).filter(v=>String(v?.url||'').trim()),active=currentSavedLinkId(id),box=document.createElement('div');
 box.className='v129-video-hero';
 let html='<div class="v176-video-top-actions"><button type="button" class="v129-play-video">▶ '+(cs()?'Přehrát video':'Play video')+'</button><button type="button" class="v176-add-link-toggle">＋ Link</button></div>';
 html+='<div class="v176-quick-link-editor" hidden><input class="v176-quick-link-input" type="url" inputmode="url" placeholder="https://youtube.com/…"><button type="button" class="v176-quick-link-save">'+(cs()?'Uložit':'Save')+'</button></div>';
 if(links.length){html+='<div class="v176-saved-links"><small>'+(cs()?'ULOŽENÁ VIDEA':'SAVED VIDEOS')+'</small>';links.forEach((link,i)=>{const isActive=String(link.id)===String(active);html+='<div class="v176-saved-link '+(isActive?'active':'')+'"><button type="button" class="v176-link-use" data-link-id="'+safe(link.id)+'"><span>▶</span><div><strong>'+safe(link.label||('Video '+(i+1)))+'</strong><em>'+(isActive?(cs()?'✓ Hlavní video':'✓ Default video'):(cs()?'Použít pro Play Video':'Use for Play Video'))+'</em></div></button><button type="button" class="v176-link-delete" data-delete-link="'+safe(link.id)+'" aria-label="Delete link">×</button></div>'});html+='</div>'}
 box.innerHTML=html;
 q('.v129-play-video',box)?.addEventListener('click',()=>playVideo(id));
 q('.v176-add-link-toggle',box)?.addEventListener('click',()=>{const ed=q('.v176-quick-link-editor',box);if(!ed)return;ed.hidden=!ed.hidden;if(!ed.hidden)setTimeout(()=>q('.v176-quick-link-input',ed)?.focus(),0)});
 q('.v176-quick-link-save',box)?.addEventListener('click',async()=>{const input=q('.v176-quick-link-input',box);if(await addQuickVideoLink(id,input?.value||'')){if(input)input.value=''}});
 q('.v176-quick-link-input',box)?.addEventListener('keydown',async e=>{if(e.key==='Enter'){e.preventDefault();if(await addQuickVideoLink(id,e.currentTarget.value||''))e.currentTarget.value=''}});
 qa('.v176-link-use',box).forEach(btn=>btn.addEventListener('click',()=>selectSavedVideoLink(id,btn.dataset.linkId)));
 qa('[data-delete-link]',box).forEach(btn=>btn.addEventListener('click',()=>removeQuickVideoLink(id,btn.dataset.deleteLink)));
 (guide||title)?.insertAdjacentElement('afterend',box);
}
async function savePreferred(id,raw){const value=String(raw||'').trim();if(value){try{const u=new URL(value);if(!['http:','https:'].includes(u.protocol))throw new Error()}catch(_){G.toast(cs()?'Vlož platný odkaz na video.':'Enter a valid video URL.');return}}const s=store(id);if(value){s.preferredVideoUrl=value;delete s.preferredVideoClearedAt}else{delete s.preferredVideoUrl;s.preferredVideoClearedAt=Date.now()}try{saveState()}catch(_){}try{if(typeof cloudUser!=='undefined'&&cloudUser&&typeof saveCloud==='function')await saveCloud()}catch(_){}try{if(typeof renderExerciseMedia==='function')await renderExerciseMedia(id)}catch(_){}rebuild(id);G.toast(cs()?'Video uloženo ✓':'Video saved ✓')}
async function resetPreferred(id){const s=store(id);delete s.preferredVideoUrl;s.preferredVideoClearedAt=Date.now();try{saveState()}catch(_){}try{if(typeof cloudUser!=='undefined'&&cloudUser&&typeof saveCloud==='function')await saveCloud()}catch(_){}try{if(typeof renderExerciseMedia==='function')await renderExerciseMedia(id)}catch(_){}rebuild(id);G.toast(cs()?'Obnoveno výchozí video.':'Default video restored.')}
window.v129SavePreferredVideo=savePreferred;window.v129ResetPreferredVideo=resetPreferred;
function editor(id){const panel=q('#exerciseMediaPanel');if(!panel)return;q('.v127-guide-slide',panel)?.remove();let e=q('.v127-video-editor',panel);if(!e){const s=store(id),x=ex(id),current=String(s.preferredVideoUrl||x?.videoUrl||'').trim();e=document.createElement('section');e.className='v127-video-editor';e.innerHTML=`<div class="v127-video-editor-head"><strong>Video</strong></div><div class="v127-video-editor-row"><input id="v129VideoUrl" type="url" inputmode="url" value="${safe(current)}" placeholder="https://youtube.com/…"><button type="button" class="primary v129-save-video">${cs()?'Uložit':'Save'}</button></div><div class="v127-video-editor-actions">${String(s.preferredVideoUrl||'').trim()?`<button type="button" class="v129-reset-video">↺ ${cs()?'Výchozí':'Default'}</button>`:''}</div>`;(q('.v124-media-head',panel)||panel.firstElementChild)?.insertAdjacentElement('afterend',e);q('.v129-save-video',e)?.addEventListener('click',()=>savePreferred(id,q('#v129VideoUrl',e)?.value||''));q('.v129-reset-video',e)?.addEventListener('click',()=>resetPreferred(id))}if(!e.closest('.v129-edit-video')){q('.v127-video-editor-actions .open',e)?.remove();const d=document.createElement('details');d.className='v129-edit-video';d.innerHTML=`<summary><span>⚙</span><strong>${cs()?'Upravit video':'Edit video'}</strong><i>›</i></summary>`;e.before(d);d.appendChild(e)}const linkForm=q('.v124-link-form',panel),links=q('.v124-links',panel);if(linkForm&&!linkForm.closest('.v129-extra-links')){const d=document.createElement('details');d.className='v129-extra-links';d.innerHTML=`<summary><span>🔗</span><strong>${cs()?'Další odkazy':'Extra links'}</strong><i>›</i></summary><div class="v129-extra-links-body"></div>`;linkForm.before(d);const body=q('.v129-extra-links-body',d);body.appendChild(linkForm);if(links)body.appendChild(links)}const head=q('.v124-media-head h3',panel);if(head)head.textContent=cs()?'Moje obrázky a videa':'My images & videos'}
function rebuild(id){detailId=id;requestAnimationFrame(()=>{hero(id);const tips=q('#videoTips');if(tips)tips.innerHTML=techniqueHtml(id);editor(id);q('#videoDialog .modal')?.classList.add('v129-detail-modal')})}G.rebuildDetail=rebuild;
function start(){try{const native=typeof openVideo==='function'?openVideo:null;if(native&&!native.__v129){const f=function(id,...args){const r=native.call(this,id,...args);rebuild(String(id||''));return r};f.__v129=true;openVideo=f;window.openVideo=f}}catch(e){console.warn('[v129 open video]',e)}try{const native=typeof renderExerciseMedia==='function'?renderExerciseMedia:null;if(native&&!native.__v129){const f=async function(id,...args){const r=await native.call(this,id,...args);editor(String(id||''));if(detailId===String(id||''))hero(detailId);return r};f.__v129=true;renderExerciseMedia=f;window.renderExerciseMedia=f}}catch(e){console.warn('[v129 media render]',e)}}
start();
})();
