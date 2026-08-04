const VERSION="v64";
const CORE_CACHE=`gym-tracker-core-${VERSION}`;
const IMAGE_CACHE=`gym-tracker-supabase-images-${VERSION}`;
const IMAGE_PREFIX="https://wknfwqjuatnozjksqutf.supabase.co/storage/v1/object/public/exercise-guides/v58/";
const CORE_ASSETS=[
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./assets/categories/chest.webp",
  "./assets/categories/back.webp",
  "./assets/categories/shoulders.webp",
  "./assets/categories/biceps.webp",
  "./assets/categories/triceps.webp",
  "./assets/categories/quads.webp",
  "./assets/categories/hamstrings.webp",
  "./assets/categories/calves.webp",
  "./assets/categories/core.webp",
  "./assets/categories/cardio.webp"
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
  return String(url).startsWith(IMAGE_PREFIX);
}

async function cacheExerciseImage(requestOrUrl){
  const request=requestOrUrl instanceof Request
    ?requestOrUrl
    :new Request(requestOrUrl,{mode:"no-cors",credentials:"omit",cache:"no-cache"});
  const cache=await caches.open(IMAGE_CACHE);
  const cached=await cache.match(request);
  if(cached)return cached;

  const response=await fetch(request);
  if(response.ok||response.type==="opaque"){
    await cache.put(request,response.clone());
  }
  return response;
}

async function navigationNetworkFirst(request){
  const cache=await caches.open(CORE_CACHE);
  try{
    const response=await fetch(request,{cache:"no-store"});
    if(response.ok)await cache.put("./index.html",response.clone());
    return response;
  }catch(_){
    return (await cache.match("./index.html"))||(await cache.match("./"));
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
    event.waitUntil(Promise.allSettled(
      data.urls.filter(isExerciseImageUrl).map(url=>cacheExerciseImage(url))
    ));
  }
});
