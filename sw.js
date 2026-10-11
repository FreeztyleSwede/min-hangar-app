// Höj VERSION vid varje release. App-filerna hämtas dessutom med stale-while-revalidate,
// så en ny app.js/styles.css når användaren vid nästa sidladdning även om VERSION glöms.
const VERSION='2026-10-11.2';
const CACHE='min-hangar-'+VERSION;
const FILER=['./','index.html','styles.css','app.js','manifest.webmanifest','icons/logo-header.png','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILER)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('min-hangar-')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET'||new URL(req.url).origin!==location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const key=req.mode==='navigate'?'index.html':req;
    const cached=await c.match(key,{ignoreSearch:true});
    const natet=fetch(req).then(res=>{ if(res.ok&&res.type==='basic') c.put(key,res.clone()); return res; }).catch(()=>null);
    if(cached){ e.waitUntil(natet); return cached; }
    return (await natet)||Response.error();
  }));
});
