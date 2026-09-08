/* Gym Tracker v134: accelerating 5-second rest alarm + strong flashing */
(()=>{
'use strict';
const V={release:'v134'};
let tick=null,lastPulseAt=0,finishedForEnd=0,audio=null;
function restState(){try{const w=state?.activeWorkout,end=Number(w?.restEndAt)||0;if(!w||!end)return null;return {w,end,left:end-Date.now()}}catch(_){return null}}
function audioCtx(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;audio=audio||new C();if(audio.state==='suspended')audio.resume().catch(()=>{});return audio}catch(_){return null}}
function beep(strong=false){const ctx=audioCtx();if(!ctx||ctx.state!=='running')return;const now=ctx.currentTime,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=strong?'sawtooth':'square';osc.frequency.setValueAtTime(strong?1280:980,now);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(strong?.42:.22,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+(strong?.22:.09));osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+(strong?.24:.11))}
function finalAlarm(){const ctx=audioCtx();if(ctx&&ctx.state==='running'){[0,.18,.36].forEach((delay,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime+delay;osc.type='sawtooth';osc.frequency.setValueAtTime(i===1?1450:1120,start);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.46,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+.16);osc.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(start+.18)})}try{navigator.vibrate?.([120,70,120,70,220])}catch(_){}}
function intervalFor(leftMs){const p=Math.max(0,Math.min(1,(5000-leftMs)/5000));return Math.round(760-(590*p))}
function flashTargets(on,leftMs=5000){[document.getElementById('v133GlobalRest'),document.getElementById('restOverlay')].filter(Boolean).forEach(el=>{el.classList.toggle('v134-alarm-flash',on);if(on)el.style.setProperty('--v134-flash-ms',`${Math.max(160,intervalFor(leftMs))}ms`);else el.style.removeProperty('--v134-flash-ms')})}
function update(){const r=restState();if(!r){flashTargets(false);lastPulseAt=0;return}if(r.left>5000){flashTargets(false);lastPulseAt=0;finishedForEnd=0;return}if(r.left>0){flashTargets(true,r.left);const now=performance.now(),gap=intervalFor(r.left);if(!lastPulseAt||now-lastPulseAt>=gap){lastPulseAt=now;try{lastRestBeepSecond=Math.ceil(r.left/1000)}catch(_){}beep(r.left<900);try{navigator.vibrate?.(r.left<1000?100:55)}catch(_){}}return}flashTargets(false);if(finishedForEnd!==r.end){finishedForEnd=r.end;finalAlarm()}}
function unlock(){audioCtx()}
function start(){document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('touchstart',unlock,{passive:true});clearInterval(tick);tick=setInterval(update,60);update()}
V.update=update;V.diagnostics=()=>{const r=restState();return {release:V.release,leftMs:r?.left||0,alarmWindow:!!r&&r.left<=5000&&r.left>0,audioState:audio?.state||'none'}};window.GymV134=V;window.gymV134Diagnostics=V.diagnostics;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
