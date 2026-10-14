'use strict';
(function(){
const APP='min-hangar', VERSION=2, APPVER='9';
// ---------- Fältdefinitioner (följer originalets lib/equipment-categories.ts, lib/aircraft-fields.ts och formulärkomponenterna) ----------
const AIRCRAFT_TYPES=['3D-flygplan','Segelflygplan','Skala','Warbird','Trainer','Jet','Övrigt'];
const PROPULSION=['El','Bränsle','Turbin','Övrigt'];
const PRODUKT_KAT=['mottagare','fartreglage','servon','batterier','motorer','propellrar'];
const LANKAR=[['produktsida','Produktsida (länk)','url'],['manual','Manual (länk)','url'],['firmwarelank','Firmware (länk)','url']];
const TM=[['tillverkare','Tillverkare *','text',{req:1}],['modell','Modellnamn *','text',{req:1}]];
const T=(...a)=>a; // [nyckel, etikett, typ, extra]
const TYPER = {
 flygmodeller:{namn:'Flygmodell',falt:[...TM,T('smeknamn','Smeknamn'),T('flygplanstyp','Flygplanstyp','select',{opt:AIRCRAFT_TYPES,tom:'Välj typ'}),
   T('framdrivning','Framdrivning','select',{opt:PROPULSION,tom:'Välj framdrivning'}),T('spannvidd_mm','Spännvidd (mm)','int'),T('langd_mm','Längd (mm)','int'),T('flygvikt_g','Flygvikt (g)','int'),
   T('motor','Motor','ref',{kat:'motorer',grupp:'Installerad utrustning'}),T('fartreglage','Fartreglage','ref',{kat:'fartreglage',grupp:'Installerad utrustning'}),
   T('mottagare','Mottagare','ref',{kat:'mottagare',grupp:'Installerad utrustning'}),T('batteri','Batteri','ref',{kat:'batterier',grupp:'Installerad utrustning'}),
   T('propeller','Propeller','ref',{kat:'propellrar',grupp:'Installerad utrustning'}),T('servon','Servon','ref',{kat:'servon',grupp:'Installerad utrustning'}),
   T('anteckningar','Anteckningar','textarea')]},
 radiosandare:{namn:'Radiosändare',falt:[...TM,T('serienummer','Serienummer'),T('firmwareversion','Firmwareversion'),T('firmwarelank','Firmwarelänk','url'),T('manual','Manuallänk','url'),T('anteckningar','Anteckningar','textarea')]},
 mottagare:{namn:'Mottagare',falt:[T('protokoll','Protokoll'),T('frekvens','Frekvens'),T('kanaler','Antal kanaler','num'),T('telemetri','Telemetri')]},
 fartreglage:{namn:'Fartreglage',falt:[T('max_strom_a','Maximal ström (A)','num'),T('kont_strom_a','Kontinuerlig ström (A)','num'),T('maxstromstid_s','Maxströmstid (s)','num'),T('max_celler','Maximalt cellantal','num'),
   T('bec_v','BEC-spänning (V)','num'),T('bec_a','BEC-ström (A)','num'),T('vikt_g','Vikt (g)','num'),T('telemetri','Telemetri aktiverad','bool')]},
 servon:{namn:'Servon',falt:[T('moment','Moment (kg·cm)','num'),T('hastighet','Hastighet per 60° (s)','num'),T('matspanning','Mätspänning (V)','num'),T('drivspanning','Drivspänning'),T('matt','Mått (mm)'),T('vikt_g','Vikt (g)','num'),T('kugghjul','Kugghjulsmaterial')]},
 batterier:{namn:'Batterier',historik:true,falt:[T('kemi','Kemi'),T('celler','Cellantal','num'),T('kapacitet','Kapacitet (mAh)','num'),T('c_tal','C-tal','num'),T('kontakt','Kontakttyp'),T('inkopsdatum','Inköpsdatum','date'),T('startcykler','Cykler före registrering','int')]},
 motorer:{namn:'Motorer',falt:[T('motortyp','Motortyp'),T('kv','KV-tal','num'),T('rek_spanning','Rekommenderad spänning'),T('max_strom_a','Maxström (A)','num'),T('max_effekt_w','Maxeffekt (W)','num'),T('axel_mm','Axeldiameter (mm)','num'),T('montering','Monteringsmått')]},
 propellrar:{namn:'Propellrar',falt:[T('diameter','Diameter (tum)','num'),T('stigning','Stigning (tum)','num'),T('blad','Antal blad','num'),T('material','Material'),T('rek_motor','Rekommenderad motor')]},
 dokument:{namn:'Dokument',falt:[T('titel','Dokumenttitel *','text',{req:1}),T('tillverkare','Tillverkare'),T('modell','Modellnamn'),T('dokumenttyp','Dokumenttyp'),T('url','Dokumentlänk','url'),T('anteckningar','Anteckningar','textarea')]},
 firmware:{namn:'Firmwareversion',falt:[T('version','Version *','text',{req:1}),T('utgivningsdatum','Utgivningsdatum','date'),T('produkt','Produkt (välj denna eller radiosändare)','ref',{kat:PRODUKT_KAT,tom:'Ingen produkt'}),
   T('radiosandare','Radiosändare','ref',{kat:'radiosandare',tom:'Ingen radiosändare'}),T('nedladdning','Nedladdningslänk','url'),T('versionsanteckningar','Versionsanteckningar (länk)','url'),T('senaste','Senaste kända version','bool')]}
};
for(const k of PRODUKT_KAT) TYPER[k].falt=[...TM,...TYPER[k].falt,T('beskrivning','Beskrivning och anteckningar','textarea'),...LANKAR];
// Menystruktur som originalets startsida: Flygmodeller + åtta utrustningskategorier
const KATEGORIER=[
 {slug:'flygmodeller',name:'Flygmodeller',description:'Modeller, byggen och flygstatus',icon:'✈',href:'#/flygmodeller',typer:['flygmodeller']},
 {slug:'radiosandare',name:'Radiosändare',description:'Sändare, profiler och inställningar',icon:'🎮',typer:['radiosandare'],forslag:['Tillverkare','Modellnamn','Serienummer','Firmwareversion','Firmwarelänk','Manual och anteckningar']},
 {slug:'mottagare',name:'Mottagare',description:'Mottagare, protokoll och kanalinställningar',icon:'📡',typer:['mottagare'],forslag:['Tillverkare','Modellnamn','Frekvens / protokoll','Antal kanaler','Telemetri','Serienummer och anteckningar']},
 {slug:'fartreglage',name:'Fartreglage',description:'ESC, telemetri och programmering',icon:'ϟ',typer:['fartreglage'],forslag:['Tillverkare','Modellnamn','Maximal ström (A)','Kontinuerlig ström (A)','Maxströmstid och battericeller','BEC-spänning / ström, vikt och firmware']},
 {slug:'servon',name:'Servon',description:'Servon, mått och roderfunktioner',icon:'↔',typer:['servon'],forslag:['Tillverkare','Modellnamn','Moment vid angiven spänning','Hastighet vid angiven spänning','Drivspänning','Mått, vikt och kugghjulsmaterial']},
 {slug:'batterier',name:'Batterier',description:'LiPo, Li-Ion och laddhistorik',icon:'🔋',typer:['batterier'],forslag:['Tillverkare','Modellnamn','Kemi och cellantal','Kapacitet (mAh)','C-tal','Kontakttyp och inköpsdatum']},
 {slug:'motorer',name:'Motorer',description:'Motorer, KV-tal och loggar',icon:'◌',typer:['motorer'],forslag:['Tillverkare','Modellnamn','Motortyp och KV-tal','Rekommenderad spänning','Maxström och effekt','Axel- och monteringsmått']},
 {slug:'propellrar',name:'Propellrar',description:'Propellrar, storlekar och tester',icon:'✢',typer:['propellrar'],forslag:['Tillverkare','Modellnamn','Diameter och stigning','Antal blad','Material','Rekommenderad motor och testnoteringar']},
 {slug:'manualer-firmware',name:'Manualer & firmware',description:'Dokument, länkar och uppdateringar',icon:'▤',typer:['dokument','firmware'],forslag:['Tillverkare','Modellnamn','Dokumenttitel och typ','Manual- / dokumentlänk','Firmwareversion och datum','Versionsanteckningar']}
];
KATEGORIER.forEach(k=>{ if(!k.href) k.href='#/utrustning/'+k.slug; });
const KATMAP=Object.fromEntries(KATEGORIER.map(k=>[k.slug,k]));
const KAT_FOR_TYP=Object.fromEntries(KATEGORIER.flatMap(k=>k.typer.map(t=>[t,k])));

const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let poster=[], filter='';

// ---------- IndexedDB ----------
let dbp;
let migreringsInfo=null;
function visaBlockerad(rub,text){ // P1: bestående meddelande i sidan i stället för en tom vy
  const v=document.getElementById('vy'); if(!v) return;
  v.innerHTML=`<section class="panel blockerad" role="alert"><h1>${esc(rub)}</h1><p>${esc(text)}</p><button class="btn" type="button" id="laddaOm">Ladda om sidan</button></section>`;
  v._upd=null; document.getElementById('laddaOm').onclick=()=>location.reload(); }
function arV1(rec){ return !!rec&&typeof rec==='object'&&(rec.kat==='manualer'||('namn' in rec)||(!!TYPER[rec.kat]&&!('modell' in rec)&&!('titel' in rec)&&!('version' in rec))); }
function db(){ return dbp||(dbp=new Promise((res,rej)=>{ const r=indexedDB.open('min-hangar',2);
  r.onupgradeneeded=e=>{ const d=r.result, t=r.transaction; let s;
    if(e.oldVersion<1){ s=d.createObjectStore('poster',{keyPath:'id'}); s.createIndex('kat','kat'); } else s=t.objectStore('poster');
    if(!d.objectStoreNames.contains('sakerhetskopia')) d.createObjectStore('sakerhetskopia',{keyPath:'nyckel'});
    if(e.oldVersion>=1){ // Version 1 → 2: migrera i samma uppgraderingstransaktion. Kastas ett fel avbryts allt och inget går förlorat.
      const g=s.getAll(); g.onsuccess=()=>{ try{
        const alla=g.result; const v1=alla.filter(arV1); if(!v1.length) return;
        t.objectStore('sakerhetskopia').put({nyckel:'fore-v2-'+new Date().toISOString(),skapad:new Date().toISOString(),poster:alla});
        const upptagna=new Set(alla.filter(x=>!arV1(x)).map(x=>x.id)); let flyttade=0;
        for(const rec of v1){ const m=migreraV1(rec,upptagna); if(m.post.id!==rec.id) s.delete(rec.id); upptagna.add(m.post.id); s.put(m.post); flyttade+=m.flyttade; }
        migreringsInfo={antal:v1.length,flyttade};
      }catch(err){ console.warn('Migreringen avbröts',err); t.abort(); } }; } };
  r.onblocked=()=>visaBlockerad('Uppgraderingen väntar','Min Hangar är öppen i en annan flik eller ett hemskärmsfönster med en äldre version. Stäng de andra flikarna med Min Hangar, så fortsätter uppgraderingen automatiskt. Ingen data går förlorad.');
  r.onsuccess=()=>{ const d=r.result; d.onversionchange=()=>{ d.close(); visaBlockerad('En nyare version är öppen','En nyare version av Min Hangar har öppnats i en annan flik. Ladda om den här sidan för att fortsätta – ändringar kan inte sparas här längre.'); }; res(d); };
  r.onerror=()=>rej(r.error); })); }
async function tx(fn){ const d=await db(); return new Promise((res,rej)=>{ const t=d.transaction('poster','readwrite'); fn(t.objectStore('poster')); t.oncomplete=()=>res(); t.onerror=()=>rej(t.error); t.onabort=()=>rej(t.error||new Error('Transaktionen avbröts.')); }); }
async function ladda(){ const d=await db(); poster=await new Promise((res,rej)=>{ const r=d.transaction('poster').objectStore('poster').getAll(); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); });
  poster=poster.filter(p=>p&&TYPER[p.kat]); poster.sort((a,b)=>rubrik(a).localeCompare(rubrik(b),'sv')); }
// S1: slå ihop med det som redan ligger i databasen (en annan flik kan ha ändrat posten), i samma transaktion
const spara=p=>tx(s=>{ const g=s.get(p.id); g.onsuccess=()=>{ const c=g.result; s.put(c&&c.kat!=='_raderad'&&c.kat===p.kat?slaIhopPost(c,p):p); }; }).then(markeraAndring);
// Radering sparas som tombstone så att posten inte återuppstår vid molnsynk.
const tabort=id=>tx(s=>s.put({id,kat:'_raderad',raderad:new Date().toISOString(),_d:nyStampel()})).then(markeraAndring);

// ---------- Hjälp ----------
function toast(m){ const t=$('#toast'); t.textContent=m; t.classList.add('visa'); clearTimeout(toast.h); toast.h=setTimeout(()=>t.classList.remove('visa'),3500); }
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
function rubrik(p){ if(p.kat==='dokument') return p.titel||''; if(p.kat==='firmware') return 'Version '+(p.version||'');
  if(p.kat==='flygmodeller') return [p.modell,p.smeknamn?`”${p.smeknamn}”`:''].filter(Boolean).join(' ');
  return [p.tillverkare,p.modell].filter(Boolean).join(' '); }
const hitta=id=>poster.find(p=>p.id===id);
function cykler(p){ return (Number(p.startcykler)||0)+(p.laddningar||[]).reduce((n,l)=>n+(Number(l.cykler)||0),0); }
function sokText(p){ if(!TYPER[p.kat]) return ''; const k=KAT_FOR_TYP[p.kat]; return [rubrik(p),k&&k.name,k&&k.description,TYPER[p.kat].namn,...TYPER[p.kat].falt.map(f=>f[2]==='ref'?(hitta(p[f[0]])?rubrik(hitta(p[f[0]])):''):f[2]==='bool'?(p[f[0]]?f[1]:''):p[f[0]])].join(' ').toLocaleLowerCase('sv'); }
function matchar(p,q){ if(!q) return true; const t=sokText(p); return q.toLocaleLowerCase('sv').split(/\s+/).filter(Boolean).every(w=>t.includes(w)); }
const antal=n=>n===1?'1 post':n+' poster';
const fmtUnit=(f,v)=>esc(v);

// ---------- Versioner per fält (Lamport-klocka) för konfliktfri sammanslagning ----------
const lsGet=k=>{try{return localStorage.getItem(k)}catch(_){return null}}, lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(_){}}, lsDel=k=>{try{localStorage.removeItem(k)}catch(_){}};
const ENHET=(()=>{ let e=lsGet('mh-enhet'); if(!e){ e=uid().replace(/-/g,'').slice(0,12); lsSet('mh-enhet',e); } return e; })();
let lamport=Number(lsGet('mh-lamport'))||0;
const FLIK=uid().replace(/-/g,'').slice(0,6); // unik per flik → två flikar kan aldrig få samma stämpel
function lasLamport(){ const n=Number(lsGet('mh-lamport'))||0; if(n>lamport) lamport=n; }
window.addEventListener('storage',e=>{ if(e.key==='mh-lamport') lasLamport(); });
function nyStampel(){ lasLamport(); lamport+=1; lsSet('mh-lamport',String(lamport)); return [lamport,ENHET+'.'+FLIK]; }
function seStampel(s){ lasLamport(); if(Array.isArray(s)&&s[0]>lamport){ lamport=s[0]; lsSet('mh-lamport',String(lamport)); } }
const NOLL=[0,''];
const jmf=(a,b)=>{ a=a||NOLL; b=b||NOLL; return (a[0]-b[0])||(a[1]<b[1]?-1:a[1]>b[1]?1:0); };
function rensaStampel(s){ return Array.isArray(s)&&Number.isInteger(s[0])&&s[0]>=0&&s[0]<1e12&&typeof s[1]==='string'?[s[0],s[1].slice(0,40)]:undefined; }
const faltNycklar=kat=>[...TYPER[kat].falt.map(f=>f[0]),...(TYPER[kat].historik?['laddningar']:[])];
function maxStampel(r){ if(!r) return NOLL; if(r.kat==='_raderad') return r._d||NOLL; let m=NOLL; for(const s of Object.values(r._f||{})) if(jmf(s,m)>0) m=s; return m; }
function stampla(ny,gammal){ ny._f={...(gammal&&gammal._f||{})}; const s=nyStampel();
  for(const k of faltNycklar(ny.kat)) if(!gammal||kanon(ny[k]??'')!==kanon(gammal[k]??'')) ny._f[k]=s; return ny; }
function kanon(v){ return JSON.stringify(v,(k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.keys(x).sort().reduce((o,n)=>(o[n]=x[n],o),{}):x); }
function slaIhopPost(a,b){ // a = lokal, b = annan källa. Per fält vinner högsta stämpel; lika → a.
  if(!a) return b; if(!b) return a;
  const at=a.kat==='_raderad', bt=b.kat==='_raderad';
  if(at&&bt) return jmf(b._d,a._d)>0?b:a;
  if(at||bt){ const t=at?a:b, r=at?b:a; return jmf(maxStampel(r),t._d||NOLL)>0?r:t; } // radering vinner om ingen ändring gjorts efter den
  const ma=maxStampel(a), mb=maxStampel(b);
  if(!ma[0]&&!mb[0]) return (Date.parse(b.andrad)||0)>(Date.parse(a.andrad)||0)?b:a; // äldre data utan versioner
  if(a.kat!==b.kat) return jmf(mb,ma)>0?b:a;
  const ut={...a,_f:{...(a._f||{})}};
  for(const k of faltNycklar(a.kat)){ const sb=(b._f||{})[k], c=jmf(sb,(a._f||{})[k]); if(c>0||(c===0&&sb&&sb[0]>0&&kanon(a[k]??'')!==kanon(b[k]??''))){ ut[k]=b[k]; if(sb) ut._f[k]=sb; } } // lika version men olika värde (handredigerad fil): ta b
  if(jmf(mb,ma)>0) ut.andrad=b.andrad;
  return ut; }

// ---------- Dialoger (ersätter confirm) ----------
function fraga({titel,text,knappar}){ return new Promise(res=>{
  const d=$('#fraga'); $('#fragaTitel').textContent=titel; $('#fragaText').innerHTML=text;
  const k=$('#fragaKnappar'); k.innerHTML=knappar.map(b=>`<button type="button" class="btn ${b.klass||''}" data-svar="${b.v}">${esc(b.t)}</button>`).join('');
  const klar=v=>{ d.close(); res(v); };
  k.onclick=e=>{ const b=e.target.closest('[data-svar]'); if(b) klar(b.dataset.svar); };
  d.oncancel=e=>{ e.preventDefault(); klar('avbryt'); };
  d.showModal(); k.querySelector('[data-svar=avbryt]')?.focus();
}); }

// ---------- Rendering ----------
function render(){
  const h=location.hash.replace(/^#\/?/,''); const [a,b,c]=h.split('/').map(decodeURIComponent);
  document.querySelectorAll('.huvudmeny a').forEach(x=>x.toggleAttribute('aria-current',false));
  if(a==='kat'){ const ny=b==='flygmodeller'?'#/flygmodeller':b==='manualer'?'#/utrustning/manualer-firmware':KATMAP[b]?'#/utrustning/'+b:'#/';
    history.replaceState(null,'',ny); return render(); }
  if(a==='utrustning'&&KATMAP[b]&&b!=='flygmodeller') return vyKategori(KATMAP[b]);
  if(a==='flygmodeller'){ if(!b) return vyFlyglista(); if(b==='ny') return vyFlygForm(null);
    const p=hitta(b); if(p&&p.kat==='flygmodeller') return c==='redigera'?vyFlygForm(p):vyFlygDetalj(p); return vyEjHittad(); }
  if(a==='molnlagring') return vyMoln();
  if(a==='admin'||a==='auth') return vyInfo();
  if(a) return vyEjHittad();
  return vyStart();
}
const vy=()=>$('#vy');
function titel(t){ document.title=t?`${t} – Min Hangar`:'FreeStyle Swede – Min Hangar'; }
function falthtmlVisning(p,f){
  const [k,l,t]=f, v=p[k]; if(v===undefined||v===''||v===null||v===false) return '';
  let out; const ren=l.replace(/ \*$/,'');
  if(t==='url') out=/^https?:\/\//i.test(v)?`<a href="${esc(v)}" target="_blank" rel="noopener noreferrer">${esc(v)}</a>`:esc(v);
  else if(t==='bool') out='Ja';
  else if(t==='ref'){ const r=hitta(v); if(!r) return ''; out=r.kat==='flygmodeller'?`<a href="#/flygmodeller/${esc(r.id)}">${esc(rubrik(r))}</a>`:esc(rubrik(r)); }
  else out=esc(v);
  return `<dt>${esc(ren)}</dt><dd>${out}</dd>`;
}
function postHtml(p,visaKat){
  const def=TYPER[p.kat]; const skip=new Set(p.kat==='dokument'?['titel']:p.kat==='firmware'?['version']:['tillverkare','modell']);
  const rader=def.falt.filter(f=>!skip.has(f[0])&&f[2]!=='textarea').map(f=>falthtmlVisning(p,f));
  if(def.historik){ const l=(p.laddningar||[]).slice().sort((a,b)=>b.datum.localeCompare(a.datum))[0];
    rader.push(`<dt>Totalt cykler</dt><dd>${cykler(p)}</dd>`); if(l) rader.push(`<dt>Senast laddad</dt><dd>${esc(l.datum)}</dd>`); }
  const txt=def.falt.filter(f=>f[2]==='textarea'&&p[f[0]]).map(f=>`<p class="anteckning">${esc(p[f[0]])}</p>`).join('');
  const k=KAT_FOR_TYP[p.kat]; const href=p.kat==='flygmodeller'?`#/flygmodeller/${esc(p.id)}`:'';
  return `<li class="post" data-id="${esc(p.id)}">${visaKat?`<span class="tag">${esc(k.name)}</span>`:''}
   <h3>${href?`<a href="${href}">${esc(rubrik(p))}</a>`:esc(rubrik(p))}</h3><dl>${rader.join('')}</dl>${txt}
   <div class="knappar"><button class="btn small ghost" data-red="${esc(p.id)}" type="button">Redigera</button><button class="btn small danger" data-del="${esc(p.id)}" type="button">Ta bort</button></div></li>`;
}
function filterFalt(placeholder){
  return `<div class="filterrad"><label for="filter" class="sr">${esc(placeholder)}</label><input id="filter" type="search" placeholder="${esc(placeholder)}" value="${esc(filter)}">
   <button type="button" class="btn ghost" id="rensaFilter" ${filter?'':'hidden'}>Rensa</button></div>`;
}
function kopplaFilter(upd){ const el=$('#filter'), r=$('#rensaFilter');
  el.addEventListener('input',()=>{ filter=el.value; r.hidden=!filter; upd(); });
  r.onclick=()=>{ filter=''; el.value=''; r.hidden=true; upd(); el.focus(); }; }

function vyStart(){
  titel(''); setMeny('#/');
  vy().innerHTML=`<section class="hero"><div><p class="kicker">Din modellflygplats</p><h1>Min Hangar</h1>
    <p class="lead">Samla allt som hör till ditt modellflyg på ett ställe. Börja med att välja en kategori nedan.</p></div></section>
   <section class="panel" aria-labelledby="sokH"><h2 id="sokH">Sök online</h2>
    <form id="sokForm" class="filterrad" role="search"><label for="sokOnline" class="sr">Sökfråga</label>
    <input id="sokOnline" type="search" placeholder="Vad söker du efter?" maxlength="200" autocomplete="off"><button class="btn" type="submit">Sök</button></form>
    <p id="sokFel" class="fel" role="alert"></p></section>
   <section aria-labelledby="dinH"><div class="rad"><div><h2 id="dinH">Din utrustning</h2><p class="muted" id="raknare"></p></div><span class="muted">9 kategorier</span></div>
    ${filterFalt('Sök i din utrustning …')}<ul class="lista" id="traffar"></ul><div class="grid" id="kortgrid"></div></section>`;
  $('#sokForm').addEventListener('submit',e=>{ e.preventDefault(); const q=$('#sokOnline').value.trim();
    if(!q){ $('#sokFel').textContent='Skriv vad du vill söka efter.'; return; } $('#sokFel').textContent='';
    window.open('https://www.google.com/search?q='+encodeURIComponent(q),'_blank','noopener,noreferrer'); });
  const upd=()=>{
    const q=filter.trim(), m=poster.filter(p=>matchar(p,q));
    $('#raknare').textContent=!poster.length?'Inget är registrerat ännu.':q?`${antal(m.length)} av ${poster.length} matchar`:`Totalt ${antal(poster.length)}`;
    const ql=q.toLocaleLowerCase('sv');
    const kort=KATEGORIER.filter(k=>!q||`${k.name} ${k.description}`.toLocaleLowerCase('sv').includes(ql)||m.some(p=>k.typer.includes(p.kat)));
    $('#kortgrid').innerHTML=kort.length?kort.map(k=>{ const n=(q?m:poster).filter(p=>k.typer.includes(p.kat)).length;
      return `<a class="kort" href="${k.href}" data-kat="${k.slug}"><span class="ikon" aria-hidden="true">${k.icon}</span><h3>${esc(k.name)}</h3><p class="muted">${esc(k.description)}</p>
       <span class="kortfot"><span class="lank">Öppna kategori →</span><span class="antal">${antal(n)}</span></span></a>`; }).join(''):'<p class="panel">Inga matchningar ännu.</p>';
    $('#traffar').innerHTML=q&&m.length?m.map(p=>postHtml(p,true)).join(''):'';
  };
  kopplaFilter(upd); upd(); vy()._upd=upd;
}
function katNav(aktiv){
  return `<nav aria-label="Byt utrustningskategori" class="panel katnav"><p class="muted">Gå till en annan kategori</p><ul>${KATEGORIER.map(k=>
    `<li><a href="${k.href}" ${k.slug===aktiv?'aria-current="page"':''}>${esc(k.name)}</a></li>`).join('')}</ul></nav>`;
}
function vyKategori(k){
  titel(k.name); setMeny('#/');
  const sektioner=k.typer.map(t=>{ const rub=t==='dokument'?'Manualer och dokument':t==='firmware'?'Firmwareversioner':t==='radiosandare'?'Dina radiosändare':`Dina registrerade ${k.name.toLowerCase()}`;
    const lagg=t==='dokument'?'Lägg till dokument':t==='firmware'?'Lägg till firmwareversion':`Lägg till ${k.name.toLowerCase()}`;
    return `<section class="panel" aria-labelledby="h-${t}"><div class="rad"><h2 id="h-${t}">${esc(rub)}</h2><span class="muted" id="rk-${t}"></span></div>
      <ul class="lista" id="lista-${t}"></ul><button class="btn" type="button" data-ny="${t}">+ ${esc(lagg)}</button></section>`; }).join('');
  vy().innerHTML=`${katNav(k.slug)}<div class="rubrikkort"><p class="kicker">Din utrustning</p><h1>${esc(k.name)}</h1><p class="lead">${esc(k.description)}.</p></div>
   ${filterFalt('Filtrera '+k.name.toLowerCase()+' …')}
   <details class="panel forslag"><summary>Förslag på innehåll</summary><p class="muted">Varje post kan beskriva en produktmodell. Formuläret visar tekniska fält som passar just den här kategorin.</p>
    <ul>${(k.forslag||[]).map(f=>`<li>${esc(f)}</li>`).join('')}</ul></details>${sektioner}`;
  const upd=()=>{ for(const t of k.typer){ const alla=poster.filter(p=>p.kat===t), m=alla.filter(p=>matchar(p,filter));
    $('#rk-'+t).textContent=filter?`${antal(m.length)} av ${alla.length}`:antal(alla.length);
    $('#lista-'+t).innerHTML=m.length?m.map(p=>postHtml(p,false)).join(''):`<li class="muted">${alla.length?'Inga träffar.':'Inga poster registrerade ännu.'}</li>`; } };
  kopplaFilter(upd); upd(); vy()._upd=upd;
}
function vyFlyglista(){
  titel('Flygmodeller'); setMeny('#/flygmodeller');
  vy().innerHTML=`${katNav('flygmodeller')}<section class="rubrikkort bred"><p class="kicker">Din modellflygplats</p><div class="rad"><div><h1>Flygmodeller</h1>
    <p class="lead">Här samlar vi dina flygplan, deras specifikationer och all installerad utrustning.</p></div><a class="btn" href="#/flygmodeller/ny" id="nyFlyg">+ Lägg till flygmodell</a></div></section>
   <section class="panel"><h2>Filtrera flygmodeller</h2><div class="falt2">
    <label>Flygplanstyp<select id="fTyp"><option value="">Alla typer</option>${AIRCRAFT_TYPES.map(t=>`<option>${t}</option>`).join('')}</select></label>
    <label>Framdrivning<select id="fFram"><option value="">All framdrivning</option>${PROPULSION.map(t=>`<option>${t}</option>`).join('')}</select></label></div>
    ${filterFalt('Sök bland flygmodeller …')}</section>
   <div class="rad"><h2>Dina flygmodeller</h2><span class="muted" id="raknare"></span></div><ul class="lista flyggrid" id="lista"></ul>`;
  const upd=()=>{ const ty=$('#fTyp').value, fr=$('#fFram').value; const alla=poster.filter(p=>p.kat==='flygmodeller');
    const m=alla.filter(p=>(!ty||p.flygplanstyp===ty)&&(!fr||p.framdrivning===fr)&&matchar(p,filter));
    $('#raknare').textContent=m.length===alla.length?antal(alla.length):`${antal(m.length)} av ${alla.length}`;
    $('#lista').innerHTML=m.length?m.map(p=>`<li class="post"><h3><a href="#/flygmodeller/${esc(p.id)}">${esc(rubrik(p))}</a></h3><p class="muted">${esc(p.tillverkare)}</p>
      <dl><dt>Typ</dt><dd>${esc(p.flygplanstyp||'–')}</dd><dt>Framdrivning</dt><dd>${esc(p.framdrivning||'–')}</dd><dt>Spännvidd</dt><dd>${p.spannvidd_mm!==''&&p.spannvidd_mm!=null?esc(p.spannvidd_mm)+' mm':'–'}</dd><dt>Flygvikt</dt><dd>${p.flygvikt_g!==''&&p.flygvikt_g!=null?esc(p.flygvikt_g)+' g':'–'}</dd></dl>
      <div class="knappar"><button class="btn small ghost" data-red="${esc(p.id)}" type="button">Redigera</button><button class="btn small danger" data-del="${esc(p.id)}" type="button">Ta bort</button></div></li>`).join('')
      :`<li class="muted">${alla.length?'Inga flygmodeller matchar filtret.':'Inga flygmodeller registrerade ännu.'}</li>`; };
  $('#fTyp').onchange=upd; $('#fFram').onchange=upd; kopplaFilter(upd); upd(); vy()._upd=upd;
}
function vyFlygDetalj(p){
  titel(rubrik(p)); setMeny('#/flygmodeller');
  const def=TYPER.flygmodeller; const spec=def.falt.filter(f=>['flygplanstyp','framdrivning','spannvidd_mm','langd_mm','flygvikt_g'].includes(f[0]));
  const inst=def.falt.filter(f=>f[2]==='ref');
  vy().innerHTML=`<p><a class="tillbaka" href="#/flygmodeller">← Till flygmodeller</a></p>
   <div class="rubrikkort"><p class="kicker">${esc(p.tillverkare)}</p><h1>${esc(rubrik(p))}</h1></div>
   <section class="panel"><div class="rad"><h2>Specifikationer</h2><span class="knappar"><a class="btn" href="#/flygmodeller/${esc(p.id)}/redigera">Redigera flygmodellen</a><button class="btn danger" data-del="${esc(p.id)}" type="button">Ta bort</button></span></div>
    <dl class="specgrid">${spec.map(f=>{ const v=p[f[0]]; const enhet=f[0].endsWith('_mm')?' mm':f[0].endsWith('_g')?' g':'';
      return `<div><dt>${esc(f[1].replace(/ \(.*\)$/,''))}</dt><dd>${v!==''&&v!=null?esc(v)+enhet:'Inte angiven'}</dd></div>`; }).join('')}</dl></section>
   <section class="panel"><h2>Installerad utrustning</h2><dl class="specgrid">${inst.map(f=>{ const r=hitta(p[f[0]]);
      return `<div><dt>${esc(f[1])}</dt><dd>${r?esc(rubrik(r)):'Inte registrerad ännu'}</dd></div>`; }).join('')}</dl></section>
   <section class="panel"><h2>Anteckningar</h2><p class="anteckning">${p.anteckningar?esc(p.anteckningar):'<span class="muted">Inga anteckningar.</span>'}</p></section>`;
  vy()._upd=null;
}
function vyFlygForm(p){
  titel(p?'Redigera flygmodell':'Ny flygmodell'); setMeny('#/flygmodeller');
  vy().innerHTML=`<p><a class="tillbaka" href="${p?'#/flygmodeller/'+esc(p.id):'#/flygmodeller'}">← Tillbaka</a></p>
   <section class="panel"><h1 id="formRubrik">${p?'Redigera flygmodell':'Lägg till flygmodell'}</h1><form id="sidForm" class="postform" aria-labelledby="formRubrik" novalidate></form></section>`;
  byggForm($('#sidForm'),'flygmodeller',p,async ny=>{ history.replaceState(null,'','#/flygmodeller/'+encodeURIComponent(ny.id)); render(); fokusVy(); toast(p?'Flygmodellen är sparad.':'Flygmodellen är tillagd.'); },
    ()=>{ location.hash=p?'#/flygmodeller/'+encodeURIComponent(p.id):'#/flygmodeller'; });
  $('#sidForm [name=tillverkare]').focus(); vy()._upd=null;
}
function vyInfo(){ titel('Konto'); setMeny('');
  vy().innerHTML=`<section class="panel"><h1>Inloggning och administration</h1><p>Den här versionen av Min Hangar har ingen inloggning. All data sparas bara lokalt i den här webbläsaren. Använd <b>Exportera JSON</b> för säkerhetskopia eller för att flytta data till en annan enhet.</p><p><a href="#/">← Till Min Hangar</a></p></section>`; vy()._upd=null; }
function vyEjHittad(){ titel('Hittades inte'); setMeny('');
  vy().innerHTML=`<section class="panel"><h1>Sidan hittades inte</h1><p>Posten eller sidan finns inte, eller har tagits bort.</p><p><a href="#/">← Till Min Hangar</a></p></section>`; vy()._upd=null; }
function setMeny(h){ document.querySelectorAll('.huvudmeny a').forEach(a=>{ if(a.getAttribute('href')===h) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); }); }

// ---------- Formulär ----------
function refOptions(kat,egenId){ const kats=[].concat(kat); return poster.filter(p=>kats.includes(p.kat)&&p.id!==egenId); }
function faltInput(f,p){
  const [k,l,t='text',x={}]=f; const v=p?p[k]:''; const id='f-'+k;
  if(t==='bool') return `<label class="check"><input type="checkbox" name="${k}" ${v?'checked':''}> ${esc(l)}</label>`;
  if(t==='textarea') return `<label class="bred">${esc(l)}<textarea name="${k}" rows="4" maxlength="10000">${esc(v||'')}</textarea></label>`;
  let in_;
  if(t==='select') in_=`<select name="${k}"><option value="">${esc(x.tom||'–')}</option>${x.opt.map(o=>`<option${o===v?' selected':''}>${esc(o)}</option>`).join('')}</select>`;
  else if(t==='ref'){ const opts=refOptions(x.kat,p&&p.id);
    in_=`<select name="${k}"><option value="">${esc(x.tom||'Ingen vald')}</option>${opts.map(o=>`<option value="${esc(o.id)}"${o.id===v?' selected':''}>${esc(rubrik(o))}${Array.isArray(x.kat)?' ('+esc(TYPER[o.kat].namn)+')':''}</option>`).join('')}</select>`; }
  else { const typ=t==='num'||t==='int'?'number':t; in_=`<input name="${k}" type="${typ}" ${x.req?'required':''} maxlength="${t==='url'?2000:200}" ${typ==='number'?`min="0" max="1000000" step="${t==='int'?1:'any'}" inputmode="${t==='int'?'numeric':'decimal'}"`:''} value="${esc(v==null?'':v)}">`; }
  return `<label>${esc(l)}${in_}</label>`;
}
function byggForm(form,typ,p,efter,avbryt){
  const def=TYPER[typ]; let hist=p&&p.laddningar?p.laddningar.map(h=>({...h})):[];
  const vanliga=def.falt.filter(f=>!(f[3]&&f[3].grupp)), grupper={};
  def.falt.filter(f=>f[3]&&f[3].grupp).forEach(f=>(grupper[f[3].grupp]=grupper[f[3].grupp]||[]).push(f));
  form.innerHTML=`<div class="falt2">${vanliga.map(f=>faltInput(f,p)).join('')}</div>
   ${Object.entries(grupper).map(([g,fs])=>`<fieldset><legend>${esc(g)}</legend><div class="falt2">${fs.map(f=>faltInput(f,p)).join('')}</div></fieldset>`).join('')}
   ${def.historik?`<fieldset class="historik"><legend>Laddningshistorik</legend><table><thead><tr><th>Datum</th><th>Cykler</th><th><span class="sr">Åtgärd</span></th></tr></thead><tbody id="histRader"></tbody></table>
     <div class="ny"><label>Datum<input type="date" id="hDatum"></label><label>Cykler<input type="number" id="hCykler" min="1" max="10000" step="1" value="1"></label><button type="button" class="btn" id="hLagg">Lägg till rad</button></div></fieldset>`:''}
   <p class="fel" role="alert" id="formFel"></p>
   <div class="rad"><button class="btn ghost" type="button" id="avbrytKnapp">Avbryt</button><button class="btn" type="submit" id="sparaKnapp">Spara</button></div>`;
  const rita=()=>{ const tb=form.querySelector('#histRader'); if(!tb) return;
    tb.innerHTML=hist.length?hist.map((h,i)=>`<tr><td>${esc(h.datum)}</td><td>${esc(h.cykler)}</td><td><button type="button" class="btn ikonknapp ghost" data-hdel="${i}" aria-label="Ta bort raden ${esc(h.datum)}">✕</button></td></tr>`).join(''):'<tr><td colspan="3" class="muted">Ingen historik.</td></tr>'; };
  if(def.historik){ form.querySelector('#hDatum').value=new Date().toISOString().slice(0,10);
    form.querySelector('#hLagg').onclick=()=>{ const dt=form.querySelector('#hDatum').value, c=parseInt(form.querySelector('#hCykler').value,10);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(dt)||!(c>0&&c<=10000)) return toast('Ange datum och antal cykler (1–10000).'); hist.push({datum:dt,cykler:c}); hist.sort((a,b)=>a.datum.localeCompare(b.datum)); rita(); };
    form.querySelector('#histRader').onclick=e=>{ const i=e.target.closest('[data-hdel]'); if(i){ hist.splice(+i.dataset.hdel,1); rita(); } }; rita(); }
  form.querySelector('#avbrytKnapp').onclick=avbryt;
  if(typ==='firmware'){ const a=form.querySelector('[name=produkt]'), b=form.querySelector('[name=radiosandare]');
    a.addEventListener('change',()=>{ if(a.value) b.value=''; }); b.addEventListener('change',()=>{ if(b.value) a.value=''; }); }
  form.onsubmit=async e=>{ e.preventDefault(); const fd=new FormData(form);
    const ny={id:p?p.id:uid(),kat:typ,skapad:p?p.skapad:new Date().toISOString(),andrad:new Date().toISOString()};
    try{ for(const f of def.falt){ const raw=f[2]==='bool'?fd.has(f[0]):String(fd.get(f[0])??'').trim(); ny[f[0]]=normalisera(f,raw,true); }
      if(def.historik) ny.laddningar=hist;
      stampla(ny,p);
      if(typ==='firmware'&&ny.produkt&&ny.radiosandare) throw new Error('Välj antingen produkt eller radiosändare, inte båda.'); }
    catch(err){ form.querySelector('#formFel').textContent=err.message; return; }
    await spara(ny); await ladda(); await efter(ny); };
}
function oppnaDialog(typ,p){
  const d=$('#dlg'); $('#dlgTitel').textContent=`${p?'Redigera':'Lägg till'} – ${TYPER[typ].namn}`;
  byggForm($('#postForm'),typ,p,async()=>{ d.close(); render(); toast(p?'Sparat.':'Tillagd.'); },()=>d.close());
  d.showModal(); $('#postForm').querySelector('input,select,textarea').focus();
}
// Gemensam validering för formulär och import
function normalisera(f,v,franForm){
  const [k,l,t='text',x={}]=f; const namn=l.replace(/ \*$/,'');
  if(t==='bool'){ if(v===undefined||v===null||v==='') return false; if(typeof v!=='boolean') throw new Error(`"${namn}" måste vara sant eller falskt.`); return v; }
  if(v===undefined||v===null) v='';
  if(t==='num'||t==='int'){ if(v==='') return '';
    if(typeof v==='boolean'||(typeof v!=='number'&&typeof v!=='string')) throw new Error(`"${namn}" måste vara ett tal.`);
    const n=Number(v); if(!Number.isFinite(n)||n<0||n>1e6||(t==='int'&&!Number.isInteger(n))) throw new Error(`"${namn}" måste vara ett ${t==='int'?'heltal':'tal'} mellan 0 och 1 000 000.`); return n; }
  if(typeof v!=='string') throw new Error(`"${namn}" måste vara text.`);
  v=v.trim(); const max=t==='textarea'?10000:t==='url'?2000:200; if(v.length>max) throw new Error(`"${namn}" är för långt.`);
  if(x.req&&!v) throw new Error(`"${namn}" krävs.`);
  if(!v) return '';
  if(t==='url'&&!/^https?:\/\/[^\s]+$/i.test(v)) throw new Error(`"${namn}" måste börja med http:// eller https://.`);
  if(t==='date'&&!/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new Error(`"${namn}" måste vara ett datum (ÅÅÅÅ-MM-DD).`);
  if(t==='select'&&!x.opt.includes(v)) throw new Error(`"${namn}" har ett ogiltigt värde.`);
  return v;
}

// ---------- Molnlagring: Google Drive (appDataFolder) via Google Identity Services, token-flöde i webbläsaren ----------
// Konstanter. Testerna byter ut värdena genom att skriva om app.js i testmiljön – det finns inga testkrokar i produktionskoden.
const GOOGLE_CLIENT_ID='639271146102-1l36e5rl6ful64bvkgctd5kb32gkmrh2.apps.googleusercontent.com'; // OAuth-klient-ID av typen "Webbprogram". Tomt = molnsynk är inte aktiverad.
const SYNK_DEBOUNCE=2000, BACKOFF_BAS=5000, BACKOFF_MAX=300000, GIS_TIDSGRANS=10000, FETCH_TIDSGRANS=20000, TOKEN_TIDSGRANS=120000;
const TOMBSTONE_DAGAR=90;
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.appdata';
const MOLNFIL='min-hangar.json';
const DRIVE='https://www.googleapis.com/drive/v3', UPLOAD='https://www.googleapis.com/upload/drive/v3';
const klientId=()=>GOOGLE_CLIENT_ID;
const moln={token:null,utgar:0,status:'av',fel:'',not:'',senast:Number(lsGet('mh-moln-senast'))||0,timer:null,pagar:null,igen:false,forsok:0,okanda:[]};
const molnAnsluten=()=>!!klientId()&&lsGet('mh-moln-ansluten')==='1';
const klock=t=>new Date(t).toLocaleString('sv-SE',{dateStyle:'short',timeStyle:'short'});
function statusText(){ switch(moln.status){ case 'synkar':return 'Synkar…'; case 'synkad':return 'Synkad'; case 'offline':return 'Offline – ändringar köas';
  case 'pausad':return 'Pausad – tryck på Synka nu'+(moln.fel?` (${moln.fel})`:''); case 'fel':return 'Fel: '+moln.fel; case 'logga-in':return 'Logga in igen: '+moln.fel;
  default:return molnAnsluten()?'Ansluten':'Inte inloggad'; } }
function ritaStatus(){
  const t=statusText(), s=moln.senast?'Senast synkad '+klock(moln.senast):'Inte synkad ännu';
  document.querySelectorAll('[data-synkstatus]').forEach(e=>{ e.textContent=t; e.dataset.status=moln.status; });
  document.querySelectorAll('[data-synksenast]').forEach(e=>e.textContent=s);
  document.querySelectorAll('[data-synknot]').forEach(e=>{ e.textContent=moln.not; e.hidden=!moln.not; });
  const rad=$('#synkrad'); if(rad) rad.hidden=!molnAnsluten();
  const inl=$('#molnLoggaIn'), ut=$('#molnLoggaUt'), nu=$('#molnSynka');
  if(inl){ inl.hidden=molnAnsluten()&&moln.status!=='logga-in'; ut.hidden=!molnAnsluten(); nu.hidden=!molnAnsluten(); /* S3: Synka nu finns kvar även efter GIS-tidsgräns */ }
}
function satStatus(s,fel){ moln.status=s; moln.fel=fel||''; ritaStatus(); }
function medTidsgrans(p,ms,text){ let t; return Promise.race([p,new Promise((_,rej)=>{ t=setTimeout(()=>rej(Object.assign(new Error(text),{natfel:true})),ms); })]).finally(()=>clearTimeout(t)); }
let gisP=null; // GIS laddas bara när det behövs; ligger på annan origin och cachas aldrig av service workern.
function laddaGis(){ if(gisP) return gisP;
  gisP=medTidsgrans(new Promise((res,rej)=>{
    if(window.google&&google.accounts&&google.accounts.oauth2) return res();
    const s=document.createElement('script'); s.src='https://accounts.google.com/gsi/client'+(laddaGis.n?'?forsok='+laddaGis.n:''); laddaGis.n=(laddaGis.n||0)+1; s.async=true; // ny URL vid nytt försök, så att en hängande förfrågan inte återanvänds
    s.onload=()=>window.google&&google.accounts&&google.accounts.oauth2?res():rej(new Error('Google-inloggningen kunde inte laddas.'));
    s.onerror=()=>{ s.remove(); rej(Object.assign(new Error('Google-inloggningen kunde inte laddas. Kontrollera anslutningen.'),{natfel:true})); };
    document.head.appendChild(s); }),GIS_TIDSGRANS,'Google-inloggningen svarar inte (tidsgräns).').catch(e=>{ gisP=null; throw e; });
  return gisP; }
const gisRedo=()=>!!(window.google&&google.accounts&&google.accounts.oauth2);
// Token begärs BARA efter ett tryck (R5). requestAccessToken anropas synkront i klickhändelsen när GIS redan är laddat,
// så att popupfönstret inte blockeras i Safari/iOS. prompt:'' = ingen fråga om samtycke redan har getts.
function begarToken(samtycke){ return new Promise((res,rej)=>{
  let klar=false; const t=setTimeout(()=>{ if(!klar){ klar=true; rej(new Error('Inloggningen tog för lång tid.')); } },TOKEN_TIDSGRANS);
  const tc=google.accounts.oauth2.initTokenClient({client_id:klientId(),scope:DRIVE_SCOPE,
    callback:r=>{ if(klar) return; klar=true; clearTimeout(t); if(r&&r.access_token){ moln.token=r.access_token; moln.utgar=Date.now()+Math.max(60,(Number(r.expires_in)||3600)-60)*1000; res(); }
      else rej(new Error((r&&(r.error_description||r.error))||'Ingen åtkomst beviljades.')); },
    error_callback:e=>{ if(klar) return; klar=true; clearTimeout(t); rej(new Error(e&&e.type==='popup_closed'?'Inloggningsfönstret stängdes.':e&&e.type==='popup_failed_to_open'?'Inloggningsfönstret blockerades.':'Inloggningen misslyckades.')); }});
  tc.requestAccessToken({prompt:samtycke?'consent':''}); }); }
async function tryck(samtycke){ // anropas direkt från klickhändelsen
  if(!navigator.onLine){ satStatus('offline'); return; }
  try{ if(!gisRedo()){ satStatus('synkar'); await laddaGis(); } // första gången kan popupen behöva ett andra tryck i Safari
    await begarToken(samtycke); lsSet('mh-moln-ansluten','1'); moln.forsok=0; await synka(); }
  catch(e){ satStatus(molnAnsluten()?'logga-in':'av',e.message); if(!molnAnsluten()) toast(e.message); }
}
const harToken=()=>!!moln.token&&Date.now()<moln.utgar;
async function hamta(url,opt){ const ac=new AbortController(); const t=setTimeout(()=>ac.abort(),FETCH_TIDSGRANS);
  try{ return await fetch(url,{...opt,signal:ac.signal}); }
  catch(_){ throw Object.assign(new Error(ac.signal.aborted?'Google Drive svarar inte (tidsgräns).':'Ingen kontakt med Google Drive.'),{natfel:true}); }
  finally{ clearTimeout(t); } }
async function drive(url,opt={}){
  if(!harToken()) throw Object.assign(new Error('Inloggningen har gått ut.'),{pausa:true});
  const res=await hamta(url,{...opt,headers:{...(opt.headers||{}),Authorization:'Bearer '+moln.token}});
  if(res.status===401){ moln.token=null; throw Object.assign(new Error('Inloggningen har gått ut.'),{pausa:true}); }
  if(!res.ok){ const ra=Number(res.headers.get('Retry-After')); throw Object.assign(new Error(`Google Drive svarade ${res.status}.`),{status:res.status,retryAfter:ra>0?ra*1000:0}); }
  return res;
}
async function allaRader(){ const d=await db(); return new Promise((res,rej)=>{ const r=d.transaction('poster').objectStore('poster').getAll(); r.onsuccess=()=>res(r.result.filter(Boolean)); r.onerror=()=>rej(r.error); }); }
async function sparaKopia(prefix,rader){ const d=await db(); return new Promise((res,rej)=>{ const t=d.transaction('sakerhetskopia','readwrite'); const s=t.objectStore('sakerhetskopia');
  s.put({nyckel:prefix+'-'+new Date().toISOString(),skapad:new Date().toISOString(),poster:rader});
  const k=s.getAllKeys(); k.onsuccess=()=>{ const egna=k.result.filter(x=>String(x).startsWith(prefix+'-')).sort(); egna.slice(0,Math.max(0,egna.length-5)).forEach(x=>s.delete(x)); };
  t.oncomplete=res; t.onerror=()=>rej(t.error); }); }
function lasMolnData(data){
  if(!data||data.app!==APP||!Array.isArray(data.poster)) throw new Error('Molnfilen har fel format.');
  // R3: ogiltiga/okända poster (t.ex. från en nyare appversion) hoppas över och lämnas orörda i molnfilen.
  const {lista,hoppade}=validera({app:APP,version:Math.min(Number.isInteger(data.version)?data.version:VERSION,VERSION),poster:data.poster},{hoppa:true});
  const raderade=(Array.isArray(data.raderade)?data.raderade:[]).filter(x=>x&&typeof x.id==='string'&&x.id&&!isNaN(Date.parse(x.raderad)))
    .map(x=>({id:x.id.slice(0,100),kat:'_raderad',raderad:x.raderad,_d:rensaStampel(x._d)}));
  return {poster:lista,raderade,hoppade};
}
function molnData(rader,okanda){ return {app:APP,version:VERSION,appver:APPVER,format:'synk',uppdaterad:new Date().toISOString(),
  poster:[...rader.filter(r=>r.kat!=='_raderad'),...okanda],raderade:rader.filter(r=>r.kat==='_raderad').map(r=>({id:r.id,raderad:r.raderad,_d:r._d}))}; }
function slaIhop(lokalt,fjarr){
  const L=new Map(lokalt.map(r=>[r.id,r])), F=new Map();
  for(const r of [...fjarr.poster,...fjarr.raderade]){ seStampel(maxStampel(r)); F.set(r.id,F.has(r.id)?slaIhopPost(F.get(r.id),r):r); }
  const grans=Date.now()-TOMBSTONE_DAGAR*864e5;
  const ut=[], tillLokalt=[], rensa=[]; let tillFjarr=false;
  for(const id of new Set([...L.keys(),...F.keys()])){ const l=L.get(id), f=F.get(id); const v=slaIhopPost(l,f);
    if(v.kat==='_raderad'&&Date.parse(v.raderad)<grans){ if(l) rensa.push(id); if(f) tillFjarr=true; continue; } // R7: städa gamla tombstones
    ut.push(v); if(!l||kanon(v)!==kanon(l)) tillLokalt.push(v); if(!f||kanon(v)!==kanon(f)) tillFjarr=true; }
  return {ut,tillLokalt,tillFjarr,rensa};
}
function synka(){
  if(!molnAnsluten()) return Promise.resolve();
  if(moln.pagar){ moln.igen=true; return moln.pagar; }
  if(!navigator.onLine){ satStatus('offline'); return Promise.resolve(); }
  if(!harToken()){ satStatus('pausad'); return Promise.resolve(); } // R5: ingen tyst popup – vänta på ett tryck
  clearTimeout(moln.timer);
  moln.pagar=(async()=>{ satStatus('synkar'); const andring=lsGet('mh-moln-andring');
    try{
      for(let varv=0;;varv++){
        const q=encodeURIComponent(`name='${MOLNFIL}'`);
        const fil=((await (await drive(`${DRIVE}/files?spaces=appDataFolder&q=${q}&fields=files(id,version)`)).json()).files||[])[0];
        const fjarr=fil?lasMolnData(await (await drive(`${DRIVE}/files/${encodeURIComponent(fil.id)}?alt=media`)).json()):{poster:[],raderade:[],hoppade:[]};
        moln.okanda=fjarr.hoppade;
        const lokalt=await allaRader();
        const {ut,tillLokalt,tillFjarr,rensa}=slaIhop(lokalt,fjarr);
        if(tillLokalt.length||rensa.length){ await sparaKopia('fore-synk',lokalt);
          await tx(s=>{ for(const id of rensa) s.delete(id);
            for(const r of tillLokalt){ const g=s.get(r.id); g.onsuccess=()=>{ const c=g.result; s.put(c&&kanon(c)!==kanon(lokalt.find(x=>x.id===r.id)||null)?slaIhopPost(c,r):r); }; } });
          await ladda(); const v=vy(); v._upd?v._upd():render(); }
        if(tillFjarr||!fil){ const body=JSON.stringify(molnData(ut,fjarr.hoppade));
          if(fil){ // R10: optimistisk låsning – kontrollera att filen inte ändrats sedan vi läste den
            const nu=await (await drive(`${DRIVE}/files/${encodeURIComponent(fil.id)}?fields=version`)).json();
            if(String(nu.version)!==String(fil.version)&&varv<3) continue;
            await drive(`${UPLOAD}/files/${encodeURIComponent(fil.id)}?uploadType=media`,{method:'PATCH',headers:{'Content-Type':'application/json'},body}); }
          else { const g='mh'+uid().replace(/-/g,''); const meta=JSON.stringify({name:MOLNFIL,parents:['appDataFolder'],mimeType:'application/json'});
            await drive(`${UPLOAD}/files?uploadType=multipart&fields=id`,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+g},
              body:`--${g}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${g}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${g}--`}); } }
        break;
      }
      moln.not=moln.okanda.length?`${antal(moln.okanda.length)} i molnet kunde inte läsas av den här versionen och lämnades orörda. Uppdatera appen.`:'';
      moln.senast=Date.now(); lsSet('mh-moln-senast',String(moln.senast)); moln.forsok=0;
      if(lsGet('mh-moln-andring')===andring) lsDel('mh-moln-osynkat'); else moln.igen=true;
      satStatus('synkad');
    }catch(e){
      if(e.pausa){ moln.token=null; satStatus('pausad',e.message); }
      else if(e.natfel&&!navigator.onLine) satStatus('offline');
      else { // R4: nytt försök med exponentiell backoff och jitter, respekterar Retry-After
        moln.forsok++; const vant=Math.max(e.retryAfter||0,Math.min(BACKOFF_MAX,BACKOFF_BAS*2**(moln.forsok-1))*(0.8+Math.random()*0.4));
        satStatus('fel',`${e.message||'Okänt fel'} Nytt försök om ${Math.max(1,Math.round(vant/1000))} s.`);
        clearTimeout(moln.timer); moln.timer=setTimeout(synka,vant); }
    }
    finally{ moln.pagar=null; if(moln.igen){ moln.igen=false; if(moln.status==='synkad') schemalagg(); } }
  })();
  return moln.pagar;
}
function schemalagg(){ if(!molnAnsluten()) return; if(!navigator.onLine){ satStatus('offline'); return; }
  if(!harToken()){ satStatus('pausad'); return; }
  clearTimeout(moln.timer); moln.timer=setTimeout(synka,SYNK_DEBOUNCE); }
const kanal=typeof BroadcastChannel==='function'?new BroadcastChannel('min-hangar'):null;
if(kanal) kanal.onmessage=async e=>{ if(e.data==='andrad'){ await ladda(); if(!$('#dlg')?.open){ const v=vy(); v._upd?v._upd():render(); } } };
function markeraAndring(){ if(kanal) kanal.postMessage('andrad'); lsSet('mh-moln-andring',uid()); if(molnAnsluten()){ lsSet('mh-moln-osynkat','1'); schemalagg(); } }
function loggaUt(){ const t=moln.token; moln.token=null; clearTimeout(moln.timer); moln.forsok=0;
  if(t&&gisRedo()) google.accounts.oauth2.revoke(t,()=>{});
  lsDel('mh-moln-ansluten'); lsDel('mh-moln-osynkat'); moln.not=''; satStatus('av'); toast('Utloggad från Google Drive. Datan finns kvar på den här enheten.'); }
window.addEventListener('online',()=>{ if(molnAnsluten()) synka(); });
window.addEventListener('offline',()=>{ if(molnAnsluten()) satStatus('offline'); });
function startaMoln(){ if(!molnAnsluten()) return ritaStatus(); if(!navigator.onLine) return satStatus('offline'); satStatus('pausad'); }

// ---------- Vy: Molnlagring ----------
function vyMoln(){
  titel('Molnlagring'); setMeny('#/molnlagring');
  const g=klientId()?`<p class="status" data-synkstatus role="status"></p><p class="muted" data-synksenast></p><p class="varning" data-synknot hidden></p>
     <div class="knappar"><button class="btn" type="button" id="molnLoggaIn">Logga in med Google</button><button class="btn" type="button" id="molnSynka">Synka nu</button><button class="btn ghost" type="button" id="molnLoggaUt">Logga ut</button></div>
     <p class="muted">Datan sparas som en dold fil (${MOLNFIL}) i appens egen mapp i din Google Drive. Min Hangar kan bara se sin egen fil, inte dina övriga dokument. Av säkerhetsskäl sparas inloggningen bara medan sidan är öppen: tryck på <b>Synka nu</b> när du öppnar appen, sedan synkas ändringar automatiskt. Offline köas de tills du är online igen.</p>
     <p class="muted">Ändrar två enheter samma post slås ändringarna ihop fält för fält. Ändras samma fält efter varandra behålls den senaste ändringen enligt appens versionsräknare (inte enhetens klocka). Ändras samma fält på två enheter samtidigt, t.ex. offline, behålls en av ändringarna – samma på alla enheter. En säkerhetskopia sparas lokalt före varje sammanslagning. Raderade poster glöms efter ${TOMBSTONE_DAGAR} dagar.</p>`
    :`<p class="varning" id="molnAv">Molnsynk är inte aktiverad i den här versionen av appen. När ett Google-klient-ID har lagts in kan du synka din hangar mellan enheter via Google Drive. Tills dess: använd export och import nedan.</p>`;
  vy().innerHTML=`<div class="rubrikkort"><p class="kicker">Säkerhetskopiera och synka</p><h1>Molnlagring</h1><p class="lead">Din hangar sparas på den här enheten. Här kan du synka den via Google Drive eller spara en kopia i Filer och iCloud Drive.</p></div>
   <section class="panel" aria-labelledby="hDrive"><h2 id="hDrive">Google Drive</h2>${g}</section>
   <section class="panel" aria-labelledby="hIcloud"><h2 id="hIcloud">iCloud och Filer</h2>
    <p>Spara en säkerhetskopia som en JSON-fil. På iPhone och iPad öppnas delningsmenyn: välj <b>Spara i Filer</b> och sedan <b>iCloud Drive</b>, så finns kopian på alla dina Apple-enheter. På en dator laddas filen ner, och du kan flytta den till iCloud Drive eller en annan molnmapp.</p>
    <p>För att återställa eller flytta till en ny enhet: välj <b>Hämta från Filer</b>, bläddra till iCloud Drive och välj filen. Du får sedan välja om den ska ersätta eller slås ihop med det du har.</p>
    <div class="knappar"><button class="btn" type="button" id="delaKnapp">Spara i Filer / iCloud Drive</button><button class="btn ghost" type="button" id="hamtaFilKnapp">Hämta från Filer / iCloud Drive</button></div></section>`;
  if(klientId()){ $('#molnLoggaIn').onclick=()=>tryck(true); $('#molnSynka').onclick=()=>harToken()?synka():tryck(false); $('#molnLoggaUt').onclick=loggaUt;
    if(molnAnsluten()&&navigator.onLine) laddaGis().catch(()=>{}); } // förladda så att trycket kan öppna popupen direkt
  $('#delaKnapp').onclick=delaExport; $('#hamtaFilKnapp').onclick=()=>$('#importFil').click();
  ritaStatus(); vy()._upd=null;
}
async function delaExport(){
  const namn=`min-hangar-${new Date().toISOString().slice(0,10)}.json`;
  const fil=new File([exportBlob()],namn,{type:'application/json'});
  if(navigator.canShare&&navigator.share&&navigator.canShare({files:[fil]})){
    try{ await navigator.share({files:[fil],title:'Min Hangar – säkerhetskopia'}); toast('Säkerhetskopian delades.'); }
    catch(e){ if(e&&e.name!=='AbortError'){ exportera(true); toast('Delning misslyckades – filen laddades ner i stället.'); } }
  } else exportera();
}

// ---------- Export / import ----------
function exportBlob(){ return new Blob([JSON.stringify({app:APP,version:VERSION,exporterad:new Date().toISOString(),poster},null,2)],{type:'application/json'}); }
function exportera(tyst){
  const b=exportBlob();
  const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`min-hangar-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); if(!tyst) toast(`Exporterade ${antal(poster.length)}.`);
}
// Version 1-fält → version 2. [målfält eller null, etikett]. Allt som inte kan mappas hamnar i anteckningen.
const V1KARTA={
 flygmodeller:{typ:['flygplanstyp','Typ'],spannvidd:['spannvidd_mm','Spännvidd (mm)'],vikt:['flygvikt_g','Vikt (g)'],status:[null,'Status']},
 radiosandare:{protokoll:[null,'Protokoll'],firmware:['firmwareversion','Firmware'],kanaler:[null,'Kanaler']},
 mottagare:{protokoll:['protokoll','Protokoll'],kanaler:['kanaler','Kanaler'],utgang:[null,'Utgång'],monterad:[null,'Monterad i']},
 fartreglage:{strom:['max_strom_a','Ström (A)'],celler:['max_celler','Celler (S)'],bec:[null,'BEC'],firmware:[null,'Firmware'],monterad:[null,'Monterad i']},
 servon:{storlek:[null,'Storlek'],vridmoment:['moment','Vridmoment (kg·cm)'],hastighet:['hastighet','Hastighet (s/60°)'],typ:[null,'Typ'],antal:[null,'Antal']},
 batterier:{kemi:['kemi','Kemi'],celler:['celler','Celler (S)'],mah:['kapacitet','Kapacitet (mAh)'],c:['c_tal','C-tal'],kontakt:['kontakt','Kontakt'],startcykler:['startcykler','Cykler före registrering'],inkopt:['inkopsdatum','Inköpt']},
 motorer:{storlek:[null,'Storlek'],kv:['kv','KV'],celler:['rek_spanning','Celler (S)'],monterad:[null,'Monterad i']},
 propellrar:{storlek:['diameter','Diameter (tum)'],stigning:['stigning','Stigning (tum)'],blad:['blad','Antal blad'],material:['material','Material'],antal:[null,'Antal i lager']},
 manualer:{avser:['modell','Gäller produkt'],version:[null,'Version'],lank:['url','Länk'],datum:[null,'Datum']}
};
const V1_META=new Set(['id','kat','namn','anteckning','skapad','andrad','laddningar','tillverkare']);
const str=(v,max=200)=>v==null?'':String(v).trim().slice(0,max);
function migreraV1(r,upptagna){
  const ny=r.kat==='manualer'?'dokument':(TYPER[r.kat]?r.kat:'dokument'); const def=TYPER[ny]; const falt=k=>def.falt.find(f=>f[0]===k);
  let id=typeof r.id==='string'&&r.id.trim()?r.id.trim().slice(0,100):uid(); if(upptagna&&upptagna.has(id)) id=uid();
  const p={id,kat:ny,skapad:typeof r.skapad==='string'?r.skapad.slice(0,40):new Date().toISOString(),andrad:typeof r.andrad==='string'?r.andrad.slice(0,40):new Date().toISOString()};
  const noter=[]; const karta=V1KARTA[r.kat]||{};
  if(!TYPER[r.kat]&&r.kat!=='manualer') noter.push(`Kategori: ${str(r.kat)}`);
  p[ny==='dokument'?'titel':'modell']=str(r.namn)||'Namnlös post';
  if(falt('tillverkare')) p.tillverkare=str(r.tillverkare)||(falt('tillverkare')[3]&&falt('tillverkare')[3].req?'Okänd tillverkare':'');
  for(const [k,v] of Object.entries(r)){
    if(V1_META.has(k)||v===''||v==null||v===false) continue;
    const [mal,etikett]=karta[k]||[null,k]; const f=mal&&falt(mal);
    if(f){ let x=v; if((f[2]==='num'||f[2]==='int')&&typeof x==='string'){ const m=x.match(/^\s*(\d+(?:[.,]\d+)?)\s*s?\s*$/i); if(m) x=m[1].replace(',','.'); }
      let n=''; try{ n=normalisera(f,typeof x==='number'?x:String(x)); }catch(_){ n=''; }
      if(n!==''){ p[mal]=n; const lika=String(n)===String(v).trim()||((f[2]==='num'||f[2]==='int')&&x!==v); if(lika) continue; }
      noter.push(`${etikett}: ${str(v,1000)}`); continue; }
    noter.push(`${etikett}: ${typeof v==='object'?str(JSON.stringify(v),1000):str(v,1000)}`);
  }
  for(const f of def.falt) if(p[f[0]]===undefined) p[f[0]]=f[2]==='bool'?false:'';
  if(def.historik) p.laddningar=(Array.isArray(r.laddningar)?r.laddningar:[]).filter(x=>x&&/^\d{4}-\d{2}-\d{2}$/.test(x.datum)).map(x=>({datum:x.datum,cykler:Math.max(0,Math.min(10000,parseInt(x.cykler,10)||0))}));
  const notFalt=falt('anteckningar')?'anteckningar':'beskrivning';
  const delar=[str(r.anteckning,10000)]; if(noter.length) delar.push('Från version 1:\n'+noter.join('\n'));
  p[notFalt]=delar.filter(Boolean).join('\n\n').slice(0,10000);
  return {post:p,flyttade:noter.length};
}
function validera(data,opt={}){
  if(!data||typeof data!=='object'||Array.isArray(data)) throw new Error('Filen är ingen export från Min Hangar.');
  if(data.app!==APP) throw new Error('Filen kommer inte från Min Hangar.');
  if(!Number.isInteger(data.version)||data.version<1) throw new Error('Filen saknar giltigt versionsnummer.');
  if(data.version>VERSION) throw new Error(`Filen har version ${data.version}, men appen stöder bara upp till version ${VERSION}. Uppdatera appen först.`);
  if(!Array.isArray(data.poster)) throw new Error('Fältet "poster" saknas.');
  if(data.poster.length>20000) throw new Error('För många poster.');
  const sedda=new Set(); let dubbletter=0, v1flyttade=0; const ut=[], hoppade=[];
  data.poster.forEach((r0,i)=>{ const ra=r0; try{
    if(!r0||typeof r0!=='object'||Array.isArray(r0)) throw new Error(`Post ${i+1} är ogiltig.`);
    if(data.version===1){ const m=migreraV1(r0); v1flyttade+=m.flyttade; r0=m.post; } const r=r0; const def=TYPER[r.kat];
    if(!def) throw new Error(`Post ${i+1}: okänd kategori "${String(r.kat).slice(0,40)}".`);
    const id=typeof r.id==='string'&&r.id.trim()?r.id.trim().slice(0,100):uid();
    if(sedda.has(id)){ dubbletter++; return; } sedda.add(id);
    const p={id,kat:r.kat,skapad:typeof r.skapad==='string'?r.skapad.slice(0,40):new Date().toISOString(),andrad:typeof r.andrad==='string'?r.andrad.slice(0,40):new Date().toISOString()};
    for(const f of def.falt){ try{ p[f[0]]=normalisera(f,f[2]==='ref'?(typeof r[f[0]]==='string'?r[f[0]]:''):r[f[0]]); }catch(e){ throw new Error(`Post ${i+1}: ${e.message}`); } }
    if(def.historik){ const h=r.laddningar==null?[]:r.laddningar; if(!Array.isArray(h)) throw new Error(`Post ${i+1}: laddningshistoriken är ogiltig.`);
      p.laddningar=h.map((x,j)=>{ if(!x||!/^\d{4}-\d{2}-\d{2}$/.test(x.datum)) throw new Error(`Post ${i+1}: laddning ${j+1} har ogiltigt datum.`);
        const c=Number(x.cykler); if(!Number.isInteger(c)||c<0||c>10000) throw new Error(`Post ${i+1}: laddning ${j+1} har ogiltigt antal cykler.`); return {datum:x.datum,cykler:c}; }); }
    if(p.kat==='firmware'&&p.produkt&&p.radiosandare) throw new Error(`Post ${i+1}: välj antingen produkt eller radiosändare, inte båda.`);
    if(r._f&&typeof r._f==='object'){ p._f={}; for(const k of faltNycklar(p.kat)){ const st=rensaStampel(r._f[k]); if(st) p._f[k]=st; } }
    ut.push(p);
    }catch(e){ if(opt.hoppa) hoppade.push(ra); else throw e; } });
  return {lista:ut,dubbletter,v1flyttade,hoppade};
}
async function importera(fil){
  try{
    if(fil.size>20*1024*1024) throw new Error('Filen är för stor.');
    let data; try{ data=JSON.parse(await fil.text()); }catch(_){ throw new Error('Filen är inte giltig JSON.'); }
    const {lista,dubbletter,v1flyttade}=validera(data);
    const rader=await allaRader(); const R=new Map(rader.map(r=>[r.id,r]));
    // R2: postens egna versioner/andrad behålls. Slå ihop använder samma fältvisa sammanslagning som molnsynken.
    let nya=0, uppd=0, ofor=0; const ihop=[];
    for(const p of lista){ const l=R.get(p.id); const v=l?slaIhopPost(l,p):p; if(!l||l.kat==='_raderad'&&v.kat!=='_raderad') nya++; else if(kanon(v)!==kanon(l)) uppd++; else ofor++; if(!l||kanon(v)!==kanon(l)) ihop.push(v); }
    let varning='';
    if(!lista.length) varning=`<p class="varning"><b>Varning:</b> Filen innehåller inga poster. Väljer du Ersätt raderas alla ${antal(poster.length)} du har på den här enheten.</p>`;
    else if(poster.length&&lista.length<poster.length) varning=`<p class="varning"><b>Varning:</b> Filen innehåller färre poster (${lista.length}) än du har nu (${poster.length}). Väljer du Ersätt försvinner resten från den här enheten.</p>`;
    if(molnAnsluten()) varning+=`<p class="varning"><b>Molnsynk är på.</b> Ersätt gäller bara den här enheten: poster som finns i molnet men inte i filen, och nyare ändringar från andra enheter, kommer tillbaka vid nästa synk. Inget raderas i molnet. Vill du börja om helt, logga ut från Google Drive först.</p>`;
    const text=`<p>Filen innehåller ${antal(lista.length)}${dubbletter?` (${dubbletter} dubbletter i filen hoppas över)`:''}. Du har ${antal(poster.length)} nu.</p>${varning}
      <ul><li><b>Ersätt</b>: radera allt på den här enheten och spara filens innehåll.</li><li><b>Slå ihop</b>: ${nya} nya, ${uppd} uppdateras, ${ofor} oförändrade. Nyare ändringar du redan har behålls.</li><li><b>Avbryt</b>: ändra ingenting.</li></ul>`;
    const svar=await fraga({titel:'Importera JSON',text,knappar:[{t:'Avbryt',v:'avbryt',klass:'ghost'},{t:'Slå ihop',v:'ihop'},{t:'Ersätt',v:'ersatt',klass:'danger'}]});
    if(svar==='avbryt'){ toast('Importen avbröts. Inget ändrades.'); return; }
    if(svar==='ersatt') await sparaKopia('fore-import',rader);
    await tx(s=>{ if(svar==='ersatt'){ s.clear(); lista.forEach(p=>s.put(p)); } else ihop.forEach(p=>s.put(p)); }); // en enda atomisk transaktion
    lista.forEach(p=>seStampel(maxStampel(p))); markeraAndring();
    await ladda(); render();
    toast((svar==='ersatt'?`Ersatte all data med ${antal(lista.length)}.`:`Sammanslagning klar: ${nya} nya, ${uppd} uppdaterade, ${ofor} oförändrade${dubbletter?`, ${dubbletter} dubbletter hoppades över`:''}.`)+(v1flyttade?` ${v1flyttade} fält från version 1 lades i anteckningarna.`:''));
  }catch(e){ toast('Importen misslyckades: '+e.message); }
}

// ---------- Tema ----------
function aktuelltTema(){ return document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'); }
function temaEtikett(){ const m=aktuelltTema()==='dark'; const b=$('#temaKnapp'); b.setAttribute('aria-pressed',String(m)); b.setAttribute('aria-label','Mörkt läge'); b.title=m?'Byt till ljust läge':'Byt till mörkt läge'; }
function tema(){ const ny=aktuelltTema()==='dark'?'light':'dark'; document.documentElement.dataset.theme=ny; try{localStorage.setItem('mh-tema',ny);}catch(_){} temaEtikett(); toast(ny==='dark'?'Mörkt läge':'Ljust läge'); }

// ---------- Start ----------
document.addEventListener('click',async e=>{
  const r=e.target.closest('[data-red]'), d=e.target.closest('[data-del]'), n=e.target.closest('[data-ny]');
  if(n) oppnaDialog(n.dataset.ny,null);
  if(r){ const p=hitta(r.dataset.red); if(!p) return; if(p.kat==='flygmodeller') location.hash='#/flygmodeller/'+encodeURIComponent(p.id)+'/redigera'; else oppnaDialog(p.kat,p); }
  if(d){ const p=hitta(d.dataset.del); if(!p) return;
    const svar=await fraga({titel:'Ta bort post',text:`<p>Vill du ta bort <b>${esc(rubrik(p))}</b>? Det går inte att ångra.</p>`,knappar:[{t:'Avbryt',v:'avbryt',klass:'ghost'},{t:'Ta bort',v:'ja',klass:'danger'}]});
    if(svar!=='ja') return; await tabort(p.id); await ladda(); toast('Borttagen.');
    if(location.hash.startsWith('#/flygmodeller/')) location.hash='#/flygmodeller'; else (vy()._upd?vy()._upd():render()); }
});
$('#temaKnapp').onclick=tema; temaEtikett();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',temaEtikett);
$('#exportKnapp').onclick=exportera;
$('#importKnapp').onclick=()=>$('#importFil').click();
$('#importFil').onchange=e=>{ const f=e.target.files[0]; if(f) importera(f); e.target.value=''; };
function fokusVy(){ const h=vy().querySelector('h1'); const m=h||vy(); if(h) h.setAttribute('tabindex','-1'); m.focus({preventScroll:true}); }
window.addEventListener('hashchange',()=>{ render(); window.scrollTo(0,0); fokusVy(); });
vy().innerHTML='<section class="panel" role="status"><p>Öppnar databasen …</p></section>';
let dbKlar=false; setTimeout(()=>{ if(!dbKlar) visaBlockerad('Uppgraderingen väntar','Databasen har inte kunnat öppnas ännu. Troligen är Min Hangar öppen i en annan flik eller ett hemskärmsfönster med en äldre version. Stäng de andra flikarna med Min Hangar, så fortsätter appen automatiskt. Ingen data går förlorad.'); },1500);
ladda().then(()=>{ dbKlar=true; render(); startaMoln(); if(migreringsInfo) toast(`Dina ${antal(migreringsInfo.antal)} uppgraderades till den nya versionen${migreringsInfo.flyttade?` (${migreringsInfo.flyttade} fält lades i anteckningarna)`:''}. En säkerhetskopia sparades.`); }).catch(e=>{ vy().innerHTML='<p class="panel">Kunde inte öppna den lokala databasen: '+esc(e.message)+'</p>'; });
if('serviceWorker' in navigator&&location.protocol!=='file:'){
  navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(()=>{});
  let hadCtrl=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{ if(hadCtrl) toast('En ny version är installerad. Ladda om sidan för att använda den.'); hadCtrl=true; });
}
window.__minHangar=Object.freeze({TYPER,KATEGORIER,APPVER}); // bara statisk information, inga tokens eller funktioner
})();
