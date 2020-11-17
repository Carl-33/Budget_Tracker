// declaring our static and data caches
const CACE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v2";

// everything in the public folder to be added to the cache
const staticFuilestoPreCache = [
    "/",
    "db.js",
    "styles.css",
    "manifest.webmanifest",
    "index.js",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png",
];

// installing the service-worker
self.addEventListener('install', function(evt){
    evt.waitUntil(
        caches.open(CACE_NAME).then(cache => {
            console.log("precached those files for ya");
            return cache.addAll(staticFuilestoPreCache);
        })
    );
    self.skipWaiting();
});

// activate the service-worker
self.addEventListener("activate", function(evt){
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keylist.map(key => {
                    if(key !== CACE_NAME && key !== DATA_CACHE_NAME) {
                        console.log(`Removing ${key} from cahce`);
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
    if(url.includes("/api/transaction")){
        evt.respondWith(
            cavhes.open(DATA_CACHE_NAME).then(cahce =>{
                return fetch(evt.request)
                .then(response => {
                    if(response.status === 200) {
                        cache.put(evt.request, respponse.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.requesst);
                });
            }).catch(err => console.log(err))
        );
    } else {
        evt.respondWith(
            caches.open(CACE_NAME).then(cache => {
                return cache.match(evt.request).then(response => {
                    return response || fetch(evt.request);
                });
            })
        );
    }
});