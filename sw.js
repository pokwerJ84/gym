const VERSION="v127";
const CORE_CACHE=`gym-tracker-core-${VERSION}`;
const IMAGE_CACHE=`gym-tracker-supabase-images-${VERSION}`;
const IMAGE_PREFIXES=[
  "https://wknfwqjuatnozjksqutf.supabase.co/storage/v1/object/public/exercise-guides/v58/",
  "https://wknfwqjuatnozjksqutf.supabase.co/storage/v1/object/public/exercise-guides/v97/",
  "https://wknfwqjuatnozjksqutf.supabase.co/storage/v1/object/public/exercise-guides/v112/"
];
const CORE_ASSETS=[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./hotfix-v126.css",
  "./hotfix-v126.js",
  "./back-posture-routine.webp",
  "./cat-cow.webp",
  "./thoracic-rotation.webp",
  "./wall-angels.webp",
  "./scapular-squeeze.webp",
  "./wall-push-up-plus.webp",
  "./bird-dog.webp",
  "./doorway-chest-stretch.webp",
  "./nautilus-hack-squat.webp",
  "./nautilus-rotary-torso.webp",
  "./guide-seated-leg-curl-v115.webp",
  "./guide-leg-press-calf-raise-v115.webp",
  "./legacy-card-thumbs/hammer_strength_iso_lateral_incline_press.webp",
  "./exercise-guides/v122/guides/hammer_strength_iso_lateral_incline_press.webp"
];

self.addEventListener("install",event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CORE_CACHE);
    await Promise.allSettled(CORE_ASSETS.map(async asset=>{
      const response=await fetch(asset,{cache:"reload"});
      if(response.ok)await cache.put(asset,response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keep=new Set([CORE_CACHE,IMAGE_CACHE]);
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>!keep.has(key)).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

function isExerciseImageUrl(url){
  const value=String(url);
  return IMAGE_PREFIXES.some(prefix=>value.startsWith(prefix))
    ||value.includes("/legacy-card-thumbs/")
    ||value.includes("/exercise-guides/v122/guides/")
    ||value.includes("/exercise-guides/v114/guides/")
    ||value.includes("/exercise-guides/v113/guides/")
    ||value.includes("/exercise-guides/v112/guides/")
    ||value.includes("/exercise-guides/v111/guides/")
    ||value.includes("/exercise-guides/v108/guides/");
}

async function cacheExerciseImage(requestOrUrl){
  const request=requestOrUrl instanceof Request
    ?requestOrUrl
    :new Request(requestOrUrl,{mode:"no-cors",credentials:"omit",cache:"no-cache"});
  const cache=await caches.open(IMAGE_CACHE);
  const cached=await cache.match(request);
  if(cached)return cached;
  const response=await fetch(request);
  if(response.ok||response.type==="opaque")await cache.put(request,response.clone());
  return response;
}

async function injectV126(response){
  if(!response||!response.ok)return response;
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html"))return response;
  let html=await response.text();
  if(!html.includes("hotfix-v126.css"))html=html.replace("</head>",'<link rel="stylesheet" href="./hotfix-v126.css?v=127"></head>');
  if(!html.includes("hotfix-v126.js"))html=html.replace("</body>",'<script src="./hotfix-v126.js?v=127"></script></body>');
  const headers=new Headers(response.headers);
  headers.delete("content-length");
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}

async function navigationNetworkFirst(request){
  const cache=await caches.open(CORE_CACHE);
  try{
    const response=await fetch(request,{cache:"no-store"});
    if(response.ok)await cache.put("./index.html",response.clone());
    return injectV126(response);
  }catch(_){
    const cached=(await cache.match("./index.html"))||(await cache.match("./"));
    return injectV126(cached);
  }
}

async function sameOriginCacheFirst(request){
  const cache=await caches.open(CORE_CACHE);
  const cached=await cache.match(request,{ignoreSearch:true});
  if(cached)return cached;
  const response=await fetch(request);
  if(response.ok)await cache.put(request,response.clone());
  return response;
}

self.addEventListener("fetch",event=>{
  const request=event.request;
  if(request.method!=="GET")return;
  const url=request.url;
  if(isExerciseImageUrl(url)){
    event.respondWith(cacheExerciseImage(request).catch(async()=>{
      const cache=await caches.open(IMAGE_CACHE);
      return cache.match(request);
    }));
    return;
  }
  const parsed=new URL(url);
  if(parsed.origin!==self.location.origin)return;
  if(request.mode==="navigate"){
    event.respondWith(navigationNetworkFirst(request));
    return;
  }
  event.respondWith(sameOriginCacheFirst(request));
});

self.addEventListener("message",event=>{
  const data=event.data||{};
  if(data.type==="GET_VERSION"){
    if(event.ports?.[0])event.ports[0].postMessage({version:VERSION});
    return;
  }
  if(data.type==="SKIP_WAITING"){
    self.skipWaiting();
    return;
  }
  if(data.type==="PURGE_URL"&&data.url){
    event.waitUntil((async()=>{
      const cache=await caches.open(IMAGE_CACHE);
      await cache.delete(data.url);
    })());
    return;
  }
  if(data.type==="PREFETCH_URLS"&&Array.isArray(data.urls)){
    event.waitUntil(Promise.allSettled(data.urls.filter(isExerciseImageUrl).map(url=>cacheExerciseImage(url))));
  }
});

self.addEventListener("notificationclick",event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const clientsList=await clients.matchAll({type:"window",includeUncontrolled:true});
    if(clientsList.length){await clientsList[0].focus();return}
    await clients.openWindow("./?v=127&finishWorkout=1");
  })());
});