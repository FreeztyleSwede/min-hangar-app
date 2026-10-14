// Min Hangar service worker.
// Vid varje release: höj VERSION här och ?v= i index.html (samma värde som APPVER i app.js).
// - Installationen hämtar alla filer förbi HTTP-cachen (cache:'reload'), så en ny cache får aldrig gammal kod.
// - CSS/JS är versionerade (?v=N) och serveras cache-först med exakt URL-matchning: en ny index.html
//   pekar alltid på sina egna filer, så gamla och nya filer kan inte blandas.
// - Sidladdning går nät-först (no-cache) med cachad index.html som reserv offline.
const VERSION='9';
const CACHE='min-hangar-v'+VERSION;
const FILER=['./','index.html','styles.css?v='+VERSION,'app.js?v='+VERSION,'tema.js?v='+VERSION,'icons/icon-192-maskable.png','icons/icon-512-maskable.png','manifest.webmanifest','icons/logo-header.png','icons/logo-header@2x.png','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILER.map(async u=>{
  const res=await fetch(new Request(u,{cache:'reload'})); if(!res.ok) throw new Error('Kunde inte hämta '+u+' ('+res.status+')'); await c.put(u,res);
}))).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('min-hangar')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; const url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==location.origin) return;
  if(req.mode==='navigate'){
    e.respondWith((async()=>{ const c=await caches.open(CACHE);
      // index.html cachas bara vid installation, så reservsidan offline alltid matchar cachens CSS/JS.
      try{ return await fetch(req,{cache:'no-cache'}); }
      catch(_){ return (await c.match('index.html'))||(await c.match('./'))||Response.error(); } })());
    return;
  }
  e.respondWith((async()=>{ const c=await caches.open(CACHE); const hit=await c.match(req); if(hit) return hit;
    try{ const res=await fetch(req,{cache:'no-cache'}); if(res.ok&&res.type==='basic'&&url.searchParams.has('v')) c.put(req,res.clone()); return res; }
    catch(_){ return Response.error(); } })());
});
