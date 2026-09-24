/* Gym Tracker v170: exercise, session and dashboard progress */
(()=>{
'use strict';
const V={release:'v170'};
const q=(s,r=document)=>r?.querySelector?.(s)||null;
const qa=(s,r=document)=>Array.from(r?.querySelectorAll?.(s)||[]);
const cs=()=>{try{return typeof lang==='function'&&lang()==='cs'}catch(_){return true}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const fmt=(v,d=1)=>Number.isFinite(v)?(Math.abs(v-Math.round(v))<.001?String(Math.round(v)):v.toFixed(d)):'–';
const dateLabel=iso=>{try{return new Intl.DateTimeFormat(cs()?'cs-CZ':'en-GB',{month:'short',day:'numeric'}).format(new Date(iso+'T12:00:00'))}catch(_){return iso||''}};
function exercise(id){try{return EX?.[id]||null}catch(_){return null}}
function records(id){try{return [...(state?.history?.[id]||[])].filter(r=>r&&r.date).sort((a,b)=>String(a.date).localeCompare(String(b.date)))}catch(_){return []}}
function defs(id){
 const x=exercise(id),mode=x?.mode||records(id).at(-1)?.mode||'weight';
 if(mode==='weight'||mode==='sideweight')return [{key:'weight',label:cs()?'Váha':'Weight',unit:'kg'},{key:'volume',label:cs()?'Objem':'Volume',unit:'kg'},{key:'reps',label:'Reps',unit:''}];
 if(mode==='reps')return [{key:'reps',label:'Reps',unit:''}];
 if(mode==='time'||mode==='sidetime')return [{key:'time',label:cs()?'Čas':'Time',unit:'s'}];
 if(mode==='cardio')return [{key:'minutes',label:cs()?'Minuty':'Minutes',unit:'min'},{key:'speed',label:cs()?'Rychlost':'Speed',unit:'km/h'}];
 return [{key:'reps',label:'Reps',unit:''}];
}
function valueOf(r,key){
 const sets=Array.isArray(r?.sets)?r.sets:[];
 if(key==='weight')return Math.max(0,...sets.map(s=>num(s.kg)||0));
 if(key==='reps')return r?.mode==='sideweight'?Math.max(0,...sets.map(s=>Math.max(num(s.left)||0,num(s.right)||0))):Math.max(0,...sets.map(s=>num(s.reps)||0));
 if(key==='volume')return r?.mode==='sideweight'?sets.reduce((sum,s)=>sum+(num(s.kg)||0)*((num(s.left)||0)+(num(s.right)||0)),0):sets.reduce((sum,s)=>sum+(num(s.kg)||0)*(num(s.reps)||0),0);
 if(key==='time')return r?.mode==='sidetime'?Math.max(0,...sets.map(s=>Math.max(num(s.leftSeconds)||0,num(s.rightSeconds)||0))):Math.max(0,...sets.map(s=>num(s.seconds)||0));
 if(key==='minutes')return num(r.minutes)||0;
 if(key==='speed')return num(r.speed)||0;
 return 0;
}
function series(id,key){return records(id).map(r=>({date:r.date,value:valueOf(r,key)})).filter(p=>Number.isFinite(p.value)&&p.value>0)}
function trend(rows){if(rows.length<2)return null;const first=rows[0].value,last=rows.at(-1).value;if(!first)return null;return{delta:last-first,pct:(last-first)/first*100}}
function pathFor(points){
 if(!points.length)return '';
 if(points.length===1)return 'M '+points[0][0]+' '+points[0][1];
 let d='M '+points[0][0]+' '+points[0][1];
 for(let i=0;i<points.length-1;i++){
  const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
  const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
  d+=' C '+c1x.toFixed(1)+' '+c1y.toFixed(1)+', '+c2x.toFixed(1)+' '+c2y.toFixed(1)+', '+p2[0]+' '+p2[1];
 }
 return d;
}
function chart(rows,unit){
 if(!rows.length)return '<div class="v170-chart-empty">'+(cs()?'Zatím není dost dat.':'Not enough data yet.')+'</div>';
 const data=rows.slice(-16),W=720,H=260,l=54,r=22,t=24,b=46,vals=data.map(x=>x.value);
 let min=Math.min(...vals),max=Math.max(...vals);if(min===max){min=Math.max(0,min*.85);max=max*1.15||1}
 const range=max-min||1,pts=data.map((row,i)=>{const x=l+(W-l-r)*(data.length===1?.5:i/(data.length-1)),y=t+(H-t-b)*(1-(row.value-min)/range);return[+x.toFixed(1),+y.toFixed(1)]});
 const line=pathFor(pts),base=H-b,area=pts.length>1?line+' L '+pts.at(-1)[0]+' '+base+' L '+pts[0][0]+' '+base+' Z':'';
 let grid='';[0,.25,.5,.75,1].forEach(k=>{const y=t+(H-t-b)*k,val=max-(max-min)*k;grid+='<line x1="'+l+'" y1="'+y+'" x2="'+(W-r)+'" y2="'+y+'" class="v170-grid"/><text x="'+(l-10)+'" y="'+(y+4)+'" text-anchor="end" class="v170-axis">'+esc(fmt(val))+'</text>'});
 let dots='';pts.forEach((p,i)=>{dots+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(i===pts.length-1?7:4)+'" class="'+(i===pts.length-1?'v170-dot-last':'v170-dot')+'"><title>'+esc(data[i].date)+' · '+esc(fmt(data[i].value))+' '+esc(unit||'')+'</title></circle>'});
 let labels='';[0,Math.floor((data.length-1)/2),data.length-1].filter((v,i,a)=>a.indexOf(v)===i).forEach(i=>{labels+='<text x="'+pts[i][0]+'" y="'+(H-14)+'" text-anchor="'+(i===0?'start':i===data.length-1?'end':'middle')+'" class="v170-axis">'+esc(dateLabel(data[i].date))+'</text>'});
 return '<svg class="v170-chart-svg" viewBox="0 0 '+W+' '+H+'" role="img"><defs><linearGradient id="v170Area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity=".34"/><stop offset="100%" stop-color="currentColor" stop-opacity=".02"/></linearGradient></defs>'+grid+'<path d="'+area+'" class="v170-area"/><path d="'+line+'" class="v170-line"/>'+dots+labels+'</svg>';
}
let metricBy={};
function exerciseMarkup(id,compact){
 const options=defs(id),key=metricBy[id]&&options.some(x=>x.key===metricBy[id])?metricBy[id]:options[0].key;metricBy[id]=key;
 const def=options.find(x=>x.key===key),rows=series(id,key),all=records(id),best=rows.length?Math.max(...rows.map(r=>r.value)):null,last=rows.at(-1)?.value??null,tr=trend(rows);
 let trendText='–';if(tr){trendText=tr.delta>0?'↑ '+fmt(Math.abs(tr.delta))+' '+def.unit+' (+'+fmt(tr.pct)+'%)':tr.delta<0?'↓ '+fmt(Math.abs(tr.delta))+' '+def.unit:(cs()?'beze změny':'no change')}
 let tabs='';if(options.length>1){tabs='<div class="v170-metric-tabs">'+options.map(d=>'<button type="button" class="'+(d.key===key?'active':'')+'" data-v170-metric="'+d.key+'" data-v170-ex="'+esc(id)+'">'+esc(d.label)+'</button>').join('')+'</div>'}
 return '<section class="v170-ex-progress '+(compact?'compact':'')+'" data-exercise="'+esc(id)+'"><div class="v170-progress-head"><div><small>'+(cs()?'PROGRESS CVIKU':'EXERCISE PROGRESS')+'</small><h3>'+(cs()?'Vývoj výkonu':'Performance trend')+'</h3></div><span>'+all.length+' '+(cs()?'tréninků':'sessions')+'</span></div>'+tabs+'<div class="v170-kpis"><div><span>'+(cs()?'Nejlepší':'Best')+'</span><strong>'+(best==null?'–':fmt(best)+' '+def.unit)+'</strong></div><div><span>'+(cs()?'Poslední':'Last')+'</span><strong>'+(last==null?'–':fmt(last)+' '+def.unit)+'</strong></div><div><span>'+(cs()?'Trend':'Trend')+'</span><strong>'+esc(trendText)+'</strong></div></div><div class="v170-chart-wrap">'+chart(rows,def.unit)+'</div></section>';
}
function bind(root){
 qa('[data-v170-metric]',root).forEach(btn=>btn.onclick=()=>{const id=btn.dataset.v170Ex,key=btn.dataset.v170Metric;metricBy[id]=key;const card=btn.closest('.v170-ex-progress');if(!card)return;const box=document.createElement('div');box.innerHTML=exerciseMarkup(id,card.classList.contains('compact'));card.replaceWith(box.firstElementChild);bind(root)});
}
function injectDetail(id){const actions=q('#exerciseDetailActions');if(!actions)return;q('.v170-ex-progress',q('#videoDialog'))?.remove();actions.insertAdjacentHTML('afterend',exerciseMarkup(id,false));bind(q('#videoDialog'))}
function injectHistory(id){const content=q('#historyContent');if(!content)return;q('.v170-ex-progress',content)?.remove();content.insertAdjacentHTML('afterbegin',exerciseMarkup(id,true));bind(content)}
function weekStart(){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d}
function inWeek(iso){try{return new Date(iso+'T12:00:00')>=weekStart()}catch(_){return false}}
function inMonth(iso){try{const d=new Date(iso+'T12:00:00'),n=new Date();return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()}catch(_){return false}}
function workouts(){return(state?.workouts||[]).filter(w=>w&&w.type!=='cardio'&&w.date).slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)))}
function snapStats(){let done=0,skipped=0,tracked=0;workouts().forEach(w=>{if(Array.isArray(w.exerciseSnapshot)&&w.exerciseSnapshot.length){tracked++;w.exerciseSnapshot.forEach(x=>{if(x?.skipped)skipped++;else if(x?.done)done++})}});return{done,skipped,tracked,total:done+skipped}}
function sessionName(w){
 if(w.programId==='busy_week'&&window.GymV165?.busySession){const s=window.GymV165.busySession(Number(w.programSessionIndex)||0);if(s)return cs()?s.titleCs:s.titleEn}
 try{const p=PLAN_PRESETS?.[w.programId]?.plans?.[w.day];return p?.[cs()?'title_cs':'title_en']||p?.title_en||w.programTitle||w.day||'Workout'}catch(_){return w.programTitle||w.day||'Workout'}
}
function sessions(){
 const map=new Map();workouts().forEach(w=>{const name=sessionName(w),x=map.get(name)||{name,count:0,minutes:0,done:0,skipped:0};x.count++;x.minutes+=Number(w.minutes)||0;if(Array.isArray(w.exerciseSnapshot))w.exerciseSnapshot.forEach(e=>{if(e?.skipped)x.skipped++;else if(e?.done)x.done++});map.set(name,x)});return[...map.values()].sort((a,b)=>b.count-a.count)
}
function leaders(){
 const out=[];Object.keys(state?.history||{}).forEach(id=>{const x=exercise(id);if(!x||!['weight','sideweight'].includes(x.mode))return;const s=series(id,'weight');if(s.length<2||!s[0].value)return;const delta=s.at(-1).value-s[0].value,pct=delta/s[0].value*100;if(delta>0)out.push({id,name:(()=>{try{return itemName(x)}catch(_){return x.en||x.cs||id}})(),delta,pct})});return out.sort((a,b)=>b.pct-a.pct)
}
function dashboard(){
 const ws=workouts(),week=ws.filter(w=>inWeek(w.date)).length,month=ws.filter(w=>inMonth(w.date)).length,hours=Math.round(ws.reduce((s,w)=>s+(Number(w.minutes)||0),0)/60),ss=snapStats(),ratio=ss.total?Math.round(ss.done/ss.total*100):null,ssn=sessions(),lead=leaders(),top=lead[0];
 let sessionRows=ssn.length?ssn.slice(0,8).map(s=>{const total=s.done+s.skipped,rate=total?Math.round(s.done/total*100):null;return '<div class="v170-session-row"><div><strong>'+esc(s.name.replace(/^[^A-Za-zÀ-ž0-9]+\\s*/,''))+'</strong><small>'+s.count+'× · '+(s.count?Math.round(s.minutes/s.count):0)+' min '+(cs()?'průměr':'avg')+'</small></div><div class="v170-session-rate"><b>'+(rate==null?'–':rate+'%')+'</b><span>complete</span></div></div>'}).join(''):'<div class="empty">'+(cs()?'Zatím bez tréninků.':'No workouts yet.')+'</div>';
 let leaderRows=lead.length?lead.slice(0,5).map((x,i)=>'<button type="button" class="v170-improvement-row" data-v170-open="'+esc(x.id)+'"><span>'+(i+1)+'</span><div><strong>'+esc(x.name)+'</strong><small>+'+fmt(x.delta)+' kg</small></div><b>+'+fmt(x.pct)+'%</b></button>').join(''):'<div class="empty">'+(cs()?'Potřebuju alespoň dva uložené výkony stejného cviku.':'At least two saved performances are needed.')+'</div>';
 return '<section class="v170-dashboard"><div class="v170-dashboard-title"><small>'+(cs()?'TRÉNINKOVÝ PROGRESS':'TRAINING PROGRESS')+'</small><h2>'+(cs()?'Výkon & konzistence':'Performance & consistency')+'</h2></div><div class="v170-dashboard-kpis"><div><span>'+(cs()?'Tento týden':'This week')+'</span><strong>'+week+'</strong><small>'+(cs()?'workoutů':'workouts')+'</small></div><div><span>'+(cs()?'Tento měsíc':'This month')+'</span><strong>'+month+'</strong><small>'+(cs()?'workoutů':'workouts')+'</small></div><div><span>'+(cs()?'Celkový čas':'Total time')+'</span><strong>'+hours+'</strong><small>h</small></div><div><span>'+(cs()?'Dokončeno':'Completed')+'</span><strong>'+(ratio==null?'–':ratio+'%')+'</strong><small>'+(ss.tracked?ss.tracked+' '+(cs()?'sled. sessions':'tracked'):'')+'</small></div></div>'+(top?'<div class="v170-most-improved"><span>↗</span><div><small>'+(cs()?'NEJVĚTŠÍ POSUN':'MOST IMPROVED')+'</small><strong>'+esc(top.name)+'</strong><p>+'+fmt(top.delta)+' kg · +'+fmt(top.pct)+'%</p></div></div>':'')+'<div class="v170-session-panel"><div class="v170-panel-head"><h3>'+(cs()?'Progress sessions':'Session progress')+'</h3><span>'+ws.length+' '+(cs()?'celkem':'total')+'</span></div><div class="v170-session-list">'+sessionRows+'</div></div><div class="v170-improvement-panel"><div class="v170-panel-head"><h3>'+(cs()?'Největší zlepšení cviků':'Exercise improvements')+'</h3></div>'+leaderRows+'</div></section>';
}
function injectDashboard(){const root=q('#progress');if(!root)return;q('.v170-dashboard',root)?.remove();root.insertAdjacentHTML('afterbegin',dashboard());qa('[data-v170-open]',root).forEach(b=>b.onclick=()=>{try{openHistory(b.dataset.v170Open)}catch(_){}})}
function wrap(name,after){try{const native=window[name]||eval('typeof '+name+"==='function'?"+name+':null');if(typeof native!=='function'||native.__v170)return;const f=function(...args){const r=native.apply(this,args);requestAnimationFrame(()=>after(...args));return r};f.__v170=true;f.__native=native;try{eval(name+'=f')}catch(_){}window[name]=f}catch(e){console.warn('[v170 wrap]',name,e)}}
function install(){wrap('openVideo',id=>injectDetail(id));wrap('openHistory',id=>injectHistory(id));wrap('renderProgress',()=>injectDashboard());requestAnimationFrame(injectDashboard)}
V.exerciseMarkup=exerciseMarkup;V.dashboard=dashboard;window.GymV170=V;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();