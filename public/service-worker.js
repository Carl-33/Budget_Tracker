// declaring our static and data caches
const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v2";

// everything in the public folder to be added to the cache
const staticFilestoPreCache = [
    "/",
    "db.js",
    "styles.css",
    "manifest.webmanifest",
    "index.js",
    "icons/icon-192x192.png",
    "icons/icon-512x512.png",
];

// installing the service-worker
self.addEventListener('install', function(evt){
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("precached those files for ya");
            return cache.addAll(staticFilestoPreCache);
        })
    );
    self.skipWaiting();
});

// activate the service-worker
self.addEventListener("activate", function(evt){
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if(key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log(`Removing ${key} from cache`);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
        self.clients.claim();
})

self.addEventListener("fetch", function(evt) {
    const {url} = evt.request;
    if(url.includes("/api/transaction") || url.includes("/api/transaction") ){
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache =>{
                return fetch(evt.request)
                .then(response => {
                    if(response.status === 200) {
                        cache.put(evt.request, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            }).catch(err => console.log(err))
        );
    } else {
        evt.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(evt.request).then(response => {
                    return response || fetch(evt.request);
                });
            })
        );
    }
});