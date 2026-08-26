/* ══════════════════════════════════════════════════════════════
   Offline-Zwischenspeicher
   Die Fassung steht in VERSION. Beim Veröffentlichen einer neuen
   Datei diese Zahl erhöhen — dann holt sich jedes Gerät beim
   nächsten Öffnen die neue Fassung.
   ══════════════════════════════════════════════════════════════ */

const VERSION = 'greenkeeperai-v40';
const DATEIEN = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', ev=>{
  ev.waitUntil(
    caches.open(VERSION)
      .then(c=>c.addAll(DATEIEN))
      .catch(()=>{})   /* einzelne fehlende Datei soll die Installation nicht verhindern */
  );
});

self.addEventListener('activate', ev=>{
  ev.waitUntil(
    caches.keys()
      .then(namen=>Promise.all(namen.filter(n=>n !== VERSION).map(n=>caches.delete(n))))
      .then(()=>self.clients.claim())
  );
});

/* Auf Zuruf sofort übernehmen, statt auf das Schließen aller Tabs zu warten */
self.addEventListener('message', ev=>{
  if(ev.data === 'uebernehmen') self.skipWaiting();
});

self.addEventListener('fetch', ev=>{
  const anfrage = ev.request;
  if(anfrage.method !== 'GET') return;
  const url = new URL(anfrage.url);
  if(url.origin !== self.location.origin) return;

  /* Seiten: erst Netz, dann Zwischenspeicher — so kommt eine neue
     Fassung an, ohne dass jemand den Verlauf leeren muss. */
  if(anfrage.mode === 'navigate' || anfrage.destination === 'document'){
    ev.respondWith(
      fetch(anfrage)
        .then(antwort=>{
          const kopie = antwort.clone();
          caches.open(VERSION).then(c=>c.put('./index.html', kopie));
          return antwort;
        })
        .catch(()=>caches.match('./index.html').then(t=>t || caches.match('./')))
    );
    return;
  }

  /* Alles andere: erst Zwischenspeicher, dann Netz */
  ev.respondWith(
    caches.match(anfrage).then(treffer=>treffer || fetch(anfrage).then(antwort=>{
      if(antwort && antwort.status === 200){
        const kopie = antwort.clone();
        caches.open(VERSION).then(c=>c.put(anfrage, kopie));
      }
      return antwort;
    }).catch(()=>treffer))
  );
});
