// Le mie Ricette - service worker - versione 1.1.2
const CACHE = "ricette-v1.1.2";
const FILE = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomi) => Promise.all(nomi.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Prima prova la rete (così gli aggiornamenti arrivano subito), se sei offline usa la copia salvata
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  e.respondWith(
    fetch(r)
      .then((resp) => {
        if (resp && resp.ok && !u.search) {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(r, copia));
        }
        return resp;
      })
      .catch(() => caches.match(r, { ignoreSearch: true }).then((m) => m || caches.match("./index.html")))
  );
});
