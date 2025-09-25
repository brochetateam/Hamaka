const CACHE = 'hamaka-v1.2';
const APP_SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(APP_SHELL)));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=> Promise.all(keys.map(k=> k!==CACHE ? caches.delete(k) : null))));
  self.clients.claim();
});
self.addEventListener('fetch', (e)=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const fetchPromise = fetch(e.request).then(res=>{
        caches.open(CACHE).then(c=> c.put(e.request, res.clone()));
        return res;
      }).catch(()=> cached);
      return cached || fetchPromise;
    })
  );
});
self.addEventListener('message', (e)=>{ if(e.data?.action==='skipWaiting') self.skipWaiting(); });