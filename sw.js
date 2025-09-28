const CACHE = 'hamaka-v1.3'; // Incremented version
const APP_SHELL = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=> c.addAll(APP_SHELL)));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=> Promise.all(
    keys.map(k=> k!==CACHE ? caches.delete(k) : null)
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (e)=>{
  if(e.request.method!=='GET') return;

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // Got a response from the network. Cache it and return it.
        const responseToCache = networkResponse.clone();
        caches.open(CACHE).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return networkResponse;
      })
      .catch(() => {
        // Network request failed. Try to get it from the cache.
        return caches.match(e.request);
      })
  );
});

self.addEventListener('message', (e)=>{ 
  if(e.data?.action==='skipWaiting') self.skipWaiting(); 
});
