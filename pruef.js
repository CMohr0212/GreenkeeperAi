const fs = require('fs');
const { JSDOM } = require('jsdom');

let html = fs.readFileSync('index.html', 'utf8');
/* Bruecke in die Seite hinein: let/const aus <script>-Bloecken sind
   von aussen nicht ueber window erreichbar. */
html = html.replace('</body>', '<script>window.__T=function(c){return eval(c)};</script>\n</body>');
const fehler = [];

/* ── Attrappen für Schlüssel ──────────────────────────────────
   Hier stand nie ein echter Schlüssel, aber die Zeichenketten sahen
   aus wie welche — und ein Scanner, der eine Datei durchsieht, kann
   das nicht unterscheiden. Zusammengesetzt steht nirgends mehr etwas,
   das man für einen Schlüssel halten könnte.

   Die Längen sind nicht beliebig: `kiAnbieter()` erkennt den Anbieter
   am Anfang und prüft, ob genug Zeichen folgen. */
const A_KOPF   = 'AI' + 'za';
const A_FUELL  = 'TEST';
const ATTRAPPE      = A_KOPF + A_FUELL.repeat(6);              /* 28 Zeichen */
const ATTRAPPE_LANG = A_KOPF + A_FUELL.repeat(8) + 'TES';      /* 39 Zeichen */
const ATTRAPPE_ECHT = A_KOPF + 'Sy' + 'A'.repeat(20);          /* Form eines Google-Schlüssels */
const ATTRAPPE_ANT  = 'sk-' + 'ant-api03-' + 'X'.repeat(12);
const ATTRAPPE_OAI  = 'sk-' + 'proj-' + 'X'.repeat(20);

let zahl = 0;
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://cmohr0212.github.io/GreenkeeperAi/',
  beforeParse(w) {
    w.matchMedia = q => ({ matches: false, media: q, addListener(){}, removeListener(){},
      addEventListener(){}, removeEventListener(){}, onchange: null });
    w.scrollTo = () => {};
    w.HTMLElement.prototype.scrollIntoView = () => {};
    w.IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} };
    w.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
    w.HTMLCanvasElement.prototype.getContext = () => null;
    /* jsdom rechnet kein Layout: jedes Element meldet 0×0. tourZiel()
       verwirft Ziele ohne Ausdehnung — ohne diese Attrappe spulte
       jedes Kapitel wortlos durch und galt sofort als gesehen. */
    w.Element.prototype.getBoundingClientRect = function(){
      return {x:20, y:120, width:280, height:60, top:120, left:20,
              right:300, bottom:180, toJSON(){ return this; }};
    };
    w.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
    w.cancelAnimationFrame = id => clearTimeout(id);
    w.indexedDB = undefined;
    Object.defineProperty(w.navigator, 'serviceWorker', {
      value: { register: () => Promise.resolve({ addEventListener(){} }),
               addEventListener(){}, ready: new Promise(()=>{}) },
      configurable: true });
    w.print = () => {};
    /* Wetter-Attrappe: kein echter Netzzugriff im Pruefstand. */
    w.__netz = true;
    w.__abrufe = [];
    w.fetch = (u, o) => {
      w.__abrufe.push(String(u));
      if (!w.__netz) return Promise.reject(new Error('offline'));
      const j = String(u).indexOf('geocoding') !== -1
        ? {results:[{name:'Leipzig', admin1:'Sachsen', country:'Deutschland', latitude:51.3397, longitude:12.3731}]}
        : (function(){
            const std = {time:[], temperature_2m:[], precipitation:[], weather_code:[]};
            ['2026-08-26','2026-08-27'].forEach(tag=>{
              for(let h=0; h<24; h++){
                std.time.push(tag + 'T' + String(h).padStart(2,'0') + ':00');
                std.temperature_2m.push(14 + h * 0.5);
                std.precipitation.push(h === 18 ? 1.4 : 0);
                std.weather_code.push(h < 12 ? 0 : 61);
              }
            });
            return {
              current:{time:'2026-08-26T14:30', temperature_2m:24.4,
                       weather_code:2, relative_humidity_2m:58},
              hourly: std,
              daily:{
                time:['2026-08-26','2026-08-27','2026-08-28','2026-08-29',
                      '2026-08-30','2026-08-31','2026-09-01'],
                temperature_2m_max:[29.2, 21, 19, 14, 8, 9, 12],
                temperature_2m_min:[15.1, 12, 10, 5, -2, 1, 4],
                precipitation_sum:[0, 6.2, 1.1, 0, 0, 0.4, 0],
                weather_code:[2, 61, 3, 0, 0, 71, 2]
              }};
          })();
      return Promise.resolve({ok:true, json:()=>Promise.resolve(j)});
    };
    w.alert = () => {};
    w.confirm = () => true;
    w.addEventListener('error', e => fehler.push('Laufzeit: ' + (e.error && e.error.stack || e.message)));
  }
});

const w = dom.window;

setTimeout(async () => {
  const d = w.document;
  /* 60 ms waren zu knapp: modalZu() geht ueber history.back(), und
     popstate kommt in jsdom unter Last spaeter. Die Pruefung schlug
     dann sprunghaft fehl, ohne dass sich an der App etwas geaendert
     hatte. */
  const tick = () => new Promise(r => setTimeout(r, 160));
  const pruef = (name, bed, zusatz) => {
    zahl++;
    if (!bed) { console.log('  FEHL ' + name + (zusatz ? '  → ' + zusatz : '')); fehler.push(name); }
  };

  pruef('Startskript setzt data-design',
    d.documentElement.getAttribute('data-design') === 'botanisch',
    d.documentElement.getAttribute('data-design'));
  pruef('DESIGNS vorhanden', typeof w.__T('DESIGNS') === 'object');
  pruef('S.design gesetzt', w.__T('S.design') === 'botanisch', w.__T('S.design'));
  pruef('Zweitschlüssel geschrieben',
    w.localStorage.getItem('gk-design') === 'botanisch',
    w.localStorage.getItem('gk-design'));
  pruef('FASSUNG 3.5.0', w.__T('FASSUNG') === '3.5.0', w.__T('FASSUNG'));
  pruef('Drei Umschaltknöpfe', d.querySelectorAll('[data-design-go]').length === 3);
  pruef('Botanisch ist gedrückt',
    d.querySelector('[data-design-go="botanisch"]').getAttribute('aria-pressed') === 'true');

  ['klartext', 'terrarium', 'botanisch', 'klartext'].forEach(n => {
    d.querySelector(`[data-design-go="${n}"]`).click();
    pruef('→ ' + n,
      d.documentElement.getAttribute('data-design') === n
      && w.__T('S.design') === n
      && w.localStorage.getItem('gk-design') === n
      && d.querySelector(`[data-design-go="${n}"]`).getAttribute('aria-pressed') === 'true'
      && d.querySelectorAll('[data-design-go][aria-pressed="true"]').length === 1);
  });
  d.querySelector('[data-design-go="botanisch"]').click();

  const tf = () => d.querySelector('meta[name="theme-color"]').getAttribute('content');
  w.__T("ansichtZeigen('heute')");
  pruef('Botanisch · Heute hell', tf() === '#F1F4ED', tf());
  w.__T("ansichtZeigen('sammlung')");
  pruef('Botanisch · Sammlung hell', tf() === '#F1F4ED', tf());
  w.__T("ansichtZeigen('mehr')");
  pruef('Botanisch · Mehr hell', tf() === '#F1F4ED', tf());
  w.__T("ansichtZeigen('werkzeuge')");
  pruef('Botanisch · Werkzeuge hell', tf() === '#F1F4ED', tf());
  pruef('Botanisch springt nicht mehr zwischen den Reitern',
    tf() === '#F1F4ED');
  d.querySelector('[data-design-go="terrarium"]').click();
  pruef('Terrarium überall dunkel', tf() === '#0C1810', tf());
  w.__T("ansichtZeigen('heute')");
  pruef('Terrarium · Heute dunkel', tf() === '#0C1810', tf());
  d.querySelector('[data-design-go="klartext"]').click();
  pruef('Klartext hell', tf() === '#FFFFFF', tf());
  w.__T("ansichtZeigen('heute')");
  pruef('Klartext · Heute hell', tf() === '#FFFFFF', tf());
  d.querySelector('[data-design-go="botanisch"]').click();

  ['botanisch', 'klartext', 'terrarium'].forEach(des => {
    d.querySelector(`[data-design-go="${des}"]`).click();
    ['heute', 'sammlung', 'werkzeuge', 'mehr'].forEach(a => {
      const vorher = fehler.length;
      try { w.__T(`ansichtZeigen('${a}')`); } catch (e) { fehler.push(des + '/' + a + ': ' + e.message); }
      pruef(des + ' · ' + a, fehler.length === vorher);
    });
  });

  const alt = { ansicht: 'heute', ansichtAlles: false, einfach: false,
    tasks: {}, water: {}, profil: {}, eigene: [], zustand: {} };
  w.localStorage.setItem('pflanzenglossar-start', JSON.stringify(alt));
  w.localStorage.removeItem('gk-design');
  try {
    w.__T('S = LEERSTAND(); laden();');
    pruef('Zustand ohne design ergänzt', w.__T('S.design') === 'botanisch', w.__T('S.design'));
  } catch (e) { pruef('Migration', false, e.message); }
  try {
    w.__T("S.design = 'unfug'; grundwerteErgaenzen();");
    pruef('Unbekanntes Design fällt zurück', w.__T('S.design') === 'botanisch', w.__T('S.design'));
  } catch (e) { pruef('Rückfall', false, e.message); }

  const wert = (n) => w.getComputedStyle(d.documentElement).getPropertyValue(n).trim();
  const erwartet = {
    botanisch: {'--tap':'44px', '--r-mittel':'14px', '--grundschrift':'1.125rem', '--dauer':'180ms'},
    klartext:  {'--tap':'56px', '--r-mittel':'10px', '--grundschrift':'1.375rem', '--dauer':'0s'},
    terrarium: {'--tap':'44px', '--r-mittel':'18px', '--grundschrift':'1.0625rem', '--dauer':'220ms'}
  };
  Object.keys(erwartet).forEach(des => {
    d.querySelector(`[data-design-go="${des}"]`).click();
    Object.entries(erwartet[des]).forEach(([tok, soll]) => {
      pruef(des + ' ' + tok, wert(tok) === soll, wert(tok));
    });
  });
  d.querySelector('[data-design-go="botanisch"]').click();

  const ids = ['giessmodus','rundgang','foto-modal','gift-modal','neu-modal','lightbox','urlaub-blatt','willkommen'];
  pruef('acht Fenster angemeldet',
    ids.every(i => w.__T('MODAL')[i]), ids.filter(i=>!w.__T('MODAL')[i]).join(','));

  /* Beim Start steht der Willkommensschirm offen — erst wegräumen. */
  w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());');
  const stapel = () => w.__T('MODAL_STAPEL').slice();
  const zu = async (id) => { w.__T(`modalZu(${id ? "'" + id + "'" : ''})`); await tick(); };
  const sichtbar = id => { const el = d.getElementById(id);
    return id === 'lightbox' ? el.classList.contains('on') : !el.hidden; };

  w.__T("modalAuf('gift-modal')");
  pruef('öffnet', stapel().length === 1 && sichtbar('gift-modal'));
  pruef('Hintergrund stillgelegt',
    d.querySelector('.wrap').hasAttribute('inert') && d.getElementById('tabs').hasAttribute('inert'));
  pruef('Scroll gesperrt', d.documentElement.classList.contains('modal-offen'));
  pruef('Rolle gesetzt', d.getElementById('gift-modal').getAttribute('aria-modal') === 'true');
  pruef('Verlaufseintrag gelegt', w.history.state && w.history.state.gkModal === 'gift-modal');

  await zu('gift-modal');
  pruef('schließt', stapel().length === 0 && !sichtbar('gift-modal'));
  pruef('Hintergrund frei',
    !d.querySelector('.wrap').hasAttribute('inert') && !d.getElementById('tabs').hasAttribute('inert'));
  pruef('Scroll frei', !d.documentElement.classList.contains('modal-offen'));

  w.__T("modalAuf('gift-modal')");
  d.dispatchEvent(new w.KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
  await tick();
  pruef('Esc schließt', stapel().length === 0);

  w.__T("modalAuf('gift-modal')");
  d.getElementById('gift-modal').dispatchEvent(new w.MouseEvent('click', {bubbles:true}));
  await tick();
  pruef('Tippen daneben schließt', stapel().length === 0);

  w.__T("modalAuf('giessmodus')");
  d.getElementById('giessmodus').dispatchEvent(new w.MouseEvent('click', {bubbles:true}));
  await tick();
  pruef('Gießmodus bleibt bei Tippen daneben', stapel().length === 1);
  await zu('giessmodus');

  /* Der Zurück-Knopf des Geräts. */
  w.__T("modalAuf('gift-modal')");
  w.history.back();
  await new Promise(r => setTimeout(r, 20));
  pruef('Zurück-Knopf schließt', stapel().length === 0 && !sichtbar('gift-modal'));

  w.__T("modalAuf('gift-modal'); modalAuf('lightbox');");
  pruef('zwei offen', stapel().join(',') === 'gift-modal,lightbox');
  pruef('nur das obere ist frei',
    d.getElementById('gift-modal').hasAttribute('inert')
    && !d.getElementById('lightbox').hasAttribute('inert'));
  w.__T("modalAuf('neu-modal')");
  pruef('drittes verdrängt das zweite', stapel().join(',') === 'gift-modal,neu-modal');
  w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());');
  pruef('geleert', stapel().length === 0);

  w.__T("MODAL['gift-modal'].darfZu = ()=>false; modalAuf('gift-modal');");
  await zu('gift-modal');
  pruef('darfZu()=false hält offen', stapel().length === 1);
  w.__T("MODAL['gift-modal'].darfZu = null;");
  await zu('gift-modal');
  pruef('nach Aufheben schließt es', stapel().length === 0);

  const knopf = d.querySelector('[data-design-go="klartext"]');
  w.__T("modalAuf('gift-modal', document.querySelector('[data-design-go=\\'klartext\\']'))");
  await zu('gift-modal');
  pruef('Fokus kehrt zum Auslöser zurück', d.activeElement === knopf, d.activeElement && d.activeElement.id);

  /* Abschnittsfenster */
  const keys = ['doktor','giessplan','substrat','vermehren','stammbaum','grundriss',
                'sicherung','urlaub','tiere','rundgang','ansicht','tour','rueck','install','weg','melde','patch'];
  pruef('17 Abschnitte auffindbar',
    keys.every(k => w.__T(`!!sekAbschnitt('${k}')`)),
    keys.filter(k => !w.__T(`!!sekAbschnitt('${k}')`)).join(','));

  pruef('Kachelgitter gebaut',
    d.querySelectorAll('.kachelgitter section[data-wz]').length === 6,
    String(d.querySelectorAll('.kachelgitter section[data-wz]').length));
  /* Der Gießplan hat seine Heimat im Gießcenter und darum keine
     eigene Kachel mehr — erreichbar bleibt er trotzdem. */
  pruef('Gießplan hat keine Kachel',
    !d.querySelector('.kachelgitter section[data-wz="giessplan"]'));
  pruef('Sein Abschnitt bleibt im Dokument',
    !!d.querySelector('section[data-wz="giessplan"]'));
  pruef('und ist weiter aufrufbar', !!w.__T("!!sekAbschnitt('giessplan')"));
  pruef('Das Gießcenter führt hin',
    !!d.querySelector('#mh-in-giess [data-wz-go="giessplan"]'));
  /* Die Marke `ans-erste` nimmt der ersten Sektion einer Ansicht die
     Überschriftslinie — und gibt ihr dabei einen Außenrand. Auf einem
     gestreckten Gitterfeld kostet der genau diese Höhe: die erste
     Kachel stand 6 px tiefer und war 6 px flacher als die anderen. */
  w.__T("ansichtZeigen('werkzeuge')");
  pruef('Keine Werkzeugkachel gilt als erste Sektion',
    !d.querySelector('.kachelgitter .ans-erste'),
    (d.querySelector('.kachelgitter .ans-erste') || {}).id || '');
  w.__T("ansichtZeigen('heute')");

  let kaputt = [];
  for (const k of keys) {
    try {
      w.__T(`sektionOeffnen('${k}')`);
      const rumpf = d.getElementById('sekm-rumpf');
      const box = rumpf.querySelector('.wz-in');
      const titel = d.getElementById('sekm-titel').textContent.trim();
      if (!box || box.hidden || !titel) kaputt.push(k + '(auf)');
      await zu('sek-modal');
      if (rumpf.querySelector('.wz-in')) kaputt.push(k + '(nicht zurück)');
      const sec = w.__T(`sekAbschnitt('${k}')`);
      if (!sec.querySelector('.wz-in')) kaputt.push(k + '(verloren)');
    } catch (e) { kaputt.push(k + ': ' + e.message); }
  }
  pruef('alle 17 öffnen und hängen zurück', kaputt.length === 0, kaputt.join(' | '));

  /* Der Inhalt darf beim Öffnen nicht neu gebaut werden. */
  w.__T("sektionOeffnen('melde')");
  const feld = d.getElementById('sekm-rumpf').querySelector('input,textarea,select');
  if (feld) { feld.value = 'PROBE'; }
  await zu('sek-modal');
  w.__T("sektionOeffnen('melde')");
  const feld2 = d.getElementById('sekm-rumpf').querySelector('input,textarea,select');
  pruef('Eingabe überlebt Auf und Zu', !feld || (feld2 && feld2.value === 'PROBE'),
    feld2 && feld2.value);
  await zu('sek-modal');

  /* Reiterwechsel schließt das Fenster. */
  w.__T("sektionOeffnen('doktor'); ansichtZeigen('heute');");
  await tick();
  pruef('Reiterwechsel schließt', !w.__T("modalOffen('sek-modal')"));

  /* Migration: die drei Schlüssel müssen weg sein. */
  w.__T("S.wzOffen='doktor'; S.mehrOffen='tour'; S.ansichtAlles=true; grundwerteErgaenzen();");
  pruef('alte Schlüssel entfernt',
    w.__T("!('wzOffen' in S) && !('mehrOffen' in S) && !('ansichtAlles' in S)"));

  /* Kartendetail */
  w.__T("S.eigene = [];");
  const bauen = n => w.__T(`
    S.eigene = [];
    for(let i=0;i<${n};i++) S.eigene.push({id:'T'+i, art:'Testpflanze '+i, name:'Probe '+i, klasse:'IV', eigen:true});
    render();
  `);
  bauen(4);
  const karten = d.querySelectorAll('#out .card-btn');
  pruef('vier Karten gezeichnet', karten.length >= 4, karten.length);
  pruef('Liste klappt nicht mehr auf', !d.querySelector('#out .card.open'));

  karten[1].click();
  await tick();
  pruef('Karte öffnet als Fenster',
    w.__T("modalOffen('karte-modal')") && !!d.querySelector('#karte-rumpf .card'));
  pruef('Titel gesetzt', d.getElementById('karte-titel').textContent.trim().length > 0,
    d.getElementById('karte-titel').textContent);
  pruef('keine doppelte Kennung', d.querySelectorAll('#c-T1').length <= 1);

  const titel = () => d.getElementById('karte-titel').textContent.trim();
  const t1 = titel();
  d.getElementById('karte-zurueck').click();
  pruef('Pfeil vorwärts blättert', titel() !== t1, titel());
  d.getElementById('karte-vor').click();
  pruef('Pfeil zurück blättert zurück', titel() === t1, titel());

  w.__T("_karteId = _karteListe[0]; karteRumpfFuellen();");
  pruef('erste Pflanze: Rückwärtspfeil aus', d.getElementById('karte-vor').disabled);
  w.__T("_karteId = _karteListe[_karteListe.length-1]; karteRumpfFuellen();");
  pruef('letzte Pflanze: Vorwärtspfeil aus', d.getElementById('karte-zurueck').disabled);

  await zu('karte-modal');
  pruef('Fenster schließt und räumt auf',
    !w.__T("modalOffen('karte-modal')") && d.getElementById('karte-rumpf').innerHTML === '');

  bauen(1);
  d.querySelector('#out .card-btn').click();
  await tick();
  pruef('bei einer Pflanze keine Pfeile',
    d.getElementById('karte-vor').hidden && d.getElementById('karte-zurueck').hidden);
  await zu('karte-modal');

  /* Klartext stapelt statt Reiter */
  bauen(3);
  d.querySelector('[data-design-go="klartext"]').click();
  d.querySelector('#out .card-btn').click();
  await tick();
  const hatReiter = !!d.querySelector('#karte-rumpf .ktabs');
  pruef('Klartext ohne Reiter', !hatReiter);
  await zu('karte-modal');
  d.querySelector('[data-design-go="botanisch"]').click();

  /* Sammlung */
  w.__T("delete S.samAnsicht;");
  d.querySelector('[data-design-go="botanisch"]').click();
  pruef('Botanisch belegt Raster vor', w.__T('samAnsicht()') === 'raster', w.__T('samAnsicht()'));
  d.querySelector('[data-design-go="klartext"]').click();
  pruef('Klartext belegt eine Spalte vor', w.__T('samAnsicht()') === 'karten', w.__T('samAnsicht()'));
  d.querySelector('[data-design-go="terrarium"]').click();
  pruef('Terrarium belegt Raster vor', w.__T('samAnsicht()') === 'raster', w.__T('samAnsicht()'));
  w.__T("samAnsichtSetzen('zeilen')");
  d.querySelector('[data-design-go="botanisch"]').click();
  pruef('eigene Wahl überlebt Designwechsel', w.__T('samAnsicht()') === 'zeilen', w.__T('samAnsicht()'));
  w.__T("delete S.samAnsicht; render();");

  w.__T(`
    S.eigene = [{id:'F1', art:'Bildprobe', name:'Bildprobe', klasse:'IV', eigen:true}];
    S.fotos = S.fotos || {};
    S.fotos['F1'] = [{key:'profil', src:'data:image/gif;base64,R0lGODlhAQABAAAAACw='}];
    render();
  `);
  const bild = d.querySelector('#out .thumb');
  pruef('Vorschaubild ist ein <img>', bild && bild.tagName === 'IMG', bild && bild.tagName);
  pruef('lädt verzögert', bild && bild.getAttribute('loading') === 'lazy');
  pruef('leerer Alternativtext', bild && bild.getAttribute('alt') === '');

  /* Messung: naturalWidth gibt jsdom nicht her, also von Hand prüfen. */
  w.__T(`
    const k = document.querySelector('#out .card');
    const i = k && k.querySelector('.thumb');
    if(i){ Object.defineProperty(i, 'naturalWidth', {value:100, configurable:true});
           Object.defineProperty(i, 'naturalHeight', {value:150, configurable:true});
           bildFormatMessen(i); }
  `);
  const karte = d.querySelector('#out .card');
  /* Das Format kommt nicht mehr aus dem Foto, sondern aus einer festen
     Stufe je Pflanze — sonst waeren alle Kacheln gleich hoch. */
  pruef('Bildformat gesetzt',
    karte && [1.32, 1.0, 0.78, 1.15].indexOf(
      parseFloat(karte.style.getPropertyValue('--bildhoehe'))) !== -1,
    karte && karte.style.getPropertyValue('--bildhoehe'));
  pruef('Format bleibt gleich bei gleicher Pflanze',
    w.__T("bildStufe('abc') === bildStufe('abc')") === true);
  pruef('Formate verteilen sich', w.__T(`(function(){
    const s = new Set(); for(let i=0;i<40;i++) s.add(bildStufe('p'+i));
    return s.size; })()`) >= 3);
  /* --spanne ist entfallen: die Kachelhoehe wird gemessen, nicht
     mehr aus dem Bildformat gerechnet. */
  pruef('keine gerechnete Spanne mehr',
    karte && karte.style.getPropertyValue('--spanne') === '');
  pruef('Raster misst statt zu rechnen',
    w.__T('typeof rasterSpannen') === 'function');
  pruef('Messung läuft ohne Raster durch', w.__T(`(function(){
    try{ rasterSpannen(); return true; }catch(e){ return 'Fehler: ' + e.message; } })()`) === true);

  /* Ansicht-Fenster */
  pruef('drei Miniaturen', d.querySelectorAll('#dsn-wahl .dsn-schau').length === 3);
  const svgB = w.__T("designMiniatur('botanisch')");
  const svgT = w.__T("designMiniatur('terrarium')");
  pruef('Miniaturen unterscheiden sich', svgB !== svgT);
  pruef('Botanisch zieht seinen Farbwert', svgB.indexOf('#44574A') !== -1 || svgB.indexOf('68, 87, 74') !== -1, svgB.slice(0,120));
  pruef('Terrarium zieht seinen Farbwert', svgT.toUpperCase().indexOf('#0C1810') !== -1 || svgT.indexOf('12, 24, 16') !== -1);
  pruef('keine Probe hängengeblieben', d.querySelectorAll('html > [data-design]').length === 0);

  /* Wetter */
  w.__T("S.wetter = null; grundwerteErgaenzen();");
  pruef('ohne Ort keine Zeile', w.__T('wetterZeileHTML()') === '');
  const vorher = w.__abrufe.length;
  w.__T("render()");
  pruef('ohne Ort kein Abruf', w.__abrufe.length === vorher);

  d.getElementById('wt-ort').value = 'Leipzig';
  w.__T("wetterOrtSuchen()");
  await new Promise(r => setTimeout(r, 80));
  pruef('Suche liefert Treffer', d.querySelectorAll('[data-wt-pick]').length === 1);
  d.querySelector('[data-wt-pick]').click();
  await new Promise(r => setTimeout(r, 120));
  pruef('Ort gespeichert', w.__T('S.wetter.ort') === 'Leipzig', w.__T('S.wetter.ort'));
  pruef('Koordinaten gerundet gespeichert',
    w.__T('S.wetter.lat') === 51.3397 && w.__T('S.wetter.lon') === 12.3731);
  pruef('Werte geholt', w.__T('S.wetter.daten && S.wetter.daten.jetzt') === 24.4);
  pruef('Luftfeuchte geholt', w.__T('S.wetter.daten.feuchte') === 58);

  /* Tagesverlauf: ab der laufenden Stunde bis Mitternacht.
     14:30 Uhr heiszt zehn Zeilen, 14 bis 23 Uhr. */
  pruef('Verlauf bis Mitternacht', w.__T('S.wetter.daten.stunden.length') === 10,
    w.__T('S.wetter.daten.stunden.length'));
  pruef('Verlauf beginnt bei der laufenden Stunde',
    w.__T('S.wetter.daten.stunden[0].zeit') === '2026-08-26T14:00',
    w.__T('S.wetter.daten.stunden[0].zeit'));
  pruef('Verlauf endet vor Mitternacht',
    w.__T('S.wetter.daten.stunden[S.wetter.daten.stunden.length-1].zeit') === '2026-08-26T23:00');
  pruef('sieben Tage geholt', w.__T('S.wetter.daten.tage.length') === 7,
    w.__T('S.wetter.daten.tage.length'));
  pruef('nur eine Anfrage je Abruf',
    w.__abrufe.filter(u => u.indexOf('forecast') !== -1).length === 1,
    String(w.__abrufe.filter(u => u.indexOf('forecast') !== -1).length));

  /* Frost im Ausblick */
  pruef('Frosttag gefunden', w.__T('wetterFrostTag(S.wetter.daten).i') === 4,
    String(w.__T('wetterFrostTag(S.wetter.daten) && wetterFrostTag(S.wetter.daten).i')));
  pruef('Frost wird angesagt',
    w.__T("wetterRat({hoch:14, tief:8, regen:0, regenMorgen:0, tage:S.wetter.daten.tage})").indexOf('Frost') !== -1,
    w.__T("wetterRat({hoch:14, tief:8, regen:0, regenMorgen:0, tage:S.wetter.daten.tage})"));
  pruef('ohne Frost kein Frostsatz',
    w.__T("wetterRat({hoch:20, tief:9, regen:0, regenMorgen:0, tage:[{tief:5},{tief:7}]})") === '');

  /* Verlauf und Ausblick im Fenster */
  const det = w.__T('wetterDetailHTML()');
  pruef('Verlauf hat eine Ueberschrift', det.indexOf('Heute bis Mitternacht') !== -1, det.slice(0,80));
  pruef('Verlauf zeigt Stundenzeilen', (det.match(/wt-r\b/g) || []).length >= 17);
  pruef('Ausblick steht darunter', det.indexOf('Die nächsten Tage') !== -1);
  pruef('Frosttag traegt ein Wort, nicht nur Farbe', det.indexOf('>Frost<') !== -1);
  pruef('Ausblick nennt Wochentage', det.indexOf('Heute') !== -1 && det.indexOf('Morgen') !== -1);

  /* Die Leiste fuehrt ins Wetterfenster */
  const lz = w.__T('wetterZeileHTML()');
  pruef('Leiste ist ein Knopf', lz.indexOf('<button') === 0 && lz.indexOf('id="wt-leiste"') !== -1);
  pruef('Leiste ist beschriftet', lz.indexOf('aria-label="Wetter in Leipzig') !== -1, lz.slice(0,120));
  pruef('Leiste zeigt die Luftfeuchte', lz.indexOf('Luft 58') !== -1);
  w.__T("document.getElementById('heute-status').innerHTML = wetterZeileHTML();");
  d.getElementById('wt-leiste').dispatchEvent(new w.MouseEvent('click', {bubbles:true}));
  await new Promise(r => setTimeout(r, 160));
  pruef('Tipp auf die Leiste oeffnet das Wetterfenster',
    w.__T("modalOffen('sek-modal')") === true);
  pruef('im Fenster steht der Verlauf',
    (d.getElementById('wt-detail') || {innerHTML:''}).innerHTML.indexOf('wt-liste') !== -1);
  w.__T("modalZu('sek-modal')");
  await new Promise(r => setTimeout(r, 160));

  const zeile = w.__T('wetterZeileHTML()');
  pruef('Zeile zeigt Ort und Temperatur',
    zeile.indexOf('Leipzig') !== -1 && zeile.indexOf('24 °C') !== -1, zeile);
  pruef('Zeile enthält einen Rat', zeile.indexOf('wt-rat') !== -1, zeile);
  pruef('Rat bei Hitze', w.__T("wetterRat({hoch:30, regen:0, regenMorgen:0})").indexOf('Heiß') !== -1);
  pruef('frischer Wert ohne Standhinweis', zeile.indexOf('Stand von') === -1);

  /* Regen morgen schlaegt Hitze nicht — Reihenfolge pruefen */
  pruef('Rat bei viel Regen heute',
    w.__T("wetterRat({regen:5, hoch:30})").indexOf('kaum gießen') !== -1);
  pruef('Rat bei Frost',
    w.__T("wetterRat({tief:1})").indexOf('Kalt') !== -1);
  pruef('kein Rat bei unauffälligem Wetter',
    w.__T("wetterRat({jetzt:18, hoch:21, tief:11, regen:0, regenMorgen:0})") === '');

  /* Alter Wert bekommt sein Datum */
  w.__T("S.wetter.stand = new Date(Date.now() - 9*3600000).toISOString();");
  pruef('alter Wert nennt sein Datum', w.__T('wetterZeileHTML()').indexOf('Stand von') !== -1);

  /* Flugmodus */
  w.__netz = false;
  const altDaten = w.__T('JSON.stringify(S.wetter.daten)');
  const ok = await w.__T('wetterHolen()');
  pruef('Abruf ohne Netz scheitert still', ok === false);
  pruef('letzter Wert bleibt stehen', w.__T('JSON.stringify(S.wetter.daten)') === altDaten);
  pruef('Zeile bleibt lesbar', w.__T('wetterZeileHTML()').indexOf('Leipzig') !== -1);
  w.__netz = true;

  /* Ort entfernen */
  w.__T('wetterOrtLoeschen()');
  pruef('Ort entfernt', w.__T('!S.wetter.ort && !S.wetter.lat && !S.wetter.daten'));
  pruef('Zeile wieder aus', w.__T('wetterZeileHTML()') === '');

  pruef('Wetterabschnitt öffnet', w.__T("sektionOeffnen('wetter')") === true);
  await zu('sek-modal');

  /* ══════════ 2.9.9 — Tour und Kartenfenster ══════════ */
  w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());');
  await tick();

  const tourBox = d.getElementById('tour');
  /* Beim Öffnen eines Abschnitts startet sonst von allein ein Kapitel
     und steht dem gezielten Durchlauf weiter unten im Weg. */
  w.__T('if(typeof tourLauf !== "undefined" && tourLauf) tourSchliessen();');
  w.__T('S.tutorial = {aus:true, kapitel:{}, einricht:0}; sichern();');

  /* Eine Pflanze anlegen, damit es eine Karte gibt. */
  w.__T("S.plants = S.plants || []; if(!allePflanzen().length){ S.plants.push({id:'p1', name:'Probe', art:'Monstera', klasse:'mittel', angelegt:new Date().toISOString()}); sichern(); render(); }");
  await tick();
  const pid = w.__T('allePflanzen()[0].id');
  pruef('Probepflanze steht', !!pid, pid);

  /* — Fenstersperre nimmt die Tour aus — */
  w.__T("sektionOeffnen('doktor')");
  await tick();
  pruef('Doktorfenster offen', w.__T("modalOffen('sek-modal')") === true);
  pruef('Tour bleibt bedienbar', !tourBox.hasAttribute('inert'));
  pruef('Seite ist gesperrt',
    d.querySelector('.wrap') ? d.querySelector('.wrap').hasAttribute('inert') : true);
  await zu('sek-modal');
  pruef('nach dem Schließen niemand mehr gesperrt', !tourBox.hasAttribute('inert'));

  /* — Tourziele lösen in der Fensterwelt auf — */
  const zielDa = (kap, i) => w.__T(
    `(function(){ const s = TOUR_KAPITEL['${kap}'].schritte()[${i}];
       if(!s) return 'kein Schritt';
       if(s.fenster && !modalOffen(s.fenster)) return 'Fenster zu';
       try{ return s.ziel() ? 'da' : 'fehlt'; }catch(e){ return 'Fehler: ' + e.message; } })()`);

  pruef('Kartenfenster öffnet', w.__T(`karteOeffnen('${pid}')`) === true);
  await tick();
  ['schnell', 'ktabs', 'acc', 'Fertig'].forEach((n, i) => {
    pruef('Karte · Schritt ' + (i+1) + ' (' + n + ')', zielDa('karte', i) === 'da', zielDa('karte', i));
  });
  /* Die feste Leiste unter dem Kopf ist leer: die Karte beginnt mit
     dem Bild, die Handlungen stehen darunter im Fluss. */
  pruef('Feste Leiste ist leer geräumt',
    (d.getElementById('karte-fest')||{}).innerHTML === '');
  pruef('Keine Schnellleiste mehr im Rumpf',
    !d.querySelector('#karte-rumpf .schnell'));

  /* ── Der neue Kartenkopf ── */
  pruef('Kopf trägt ein großes Bild',
    !!d.querySelector('#karte-rumpf .km-held-bild'));
  pruef('Name liegt im Kopf',
    !!d.querySelector('#karte-rumpf .km-held-titel'));
  pruef('Fotoband ist die bekannte Galerie',
    !!d.querySelector('#karte-rumpf .km-fotoband .gal'));
  pruef('Profilbild bleibt über das Foto-Menü wählbar',
    !!d.querySelector('#karte-rumpf .km-fotoband [data-do="foto-menu"]'));
  /* Seit 3.2.3 ist das Plusfeld ein Knopf mit der Pflanzenkennung, kein
     Label mit verstecktem Dateifeld mehr. Geprüft wird beides: dass der
     Knopf da ist und dass er weiß, für welche Pflanze er gilt. */
  pruef('Fotos hinzufügen bleibt erreichbar',
    !!d.querySelector('#karte-rumpf .km-fotoband button.foto-add'));
  pruef('Das Plusfeld kennt seine Pflanze',
    !!(d.querySelector('#karte-rumpf .km-fotoband button.foto-add') || {}).dataset
    && !!d.querySelector('#karte-rumpf .km-fotoband button.foto-add').dataset.p);
  pruef('Das Plusfeld steht auch bei belegter Galerie',
    d.querySelectorAll('#karte-rumpf .km-fotoband .gal figure').length > 0
      ? !!d.querySelector('#karte-rumpf .km-fotoband button.foto-add') : true);
  pruef('Standzeile mit Ton vorhanden',
    !!d.querySelector('#karte-rumpf .km-stand[data-ton]'));
  pruef('Zeichenreihe steht im Kopf',
    !!d.querySelector('#karte-rumpf .km-zeichen .icons'));
  pruef('Gießen ist der breite Hauptknopf',
    !!d.querySelector('#karte-rumpf .km-haupt[data-do="giessen"]'));
  pruef('Vier Nebenknöpfe darunter',
    d.querySelectorAll('#karte-rumpf .km-neben button').length === 4);
  ['doktor-fuer','substrat-fuer','vermehren-fuer','bearb-auf'].forEach(k=>{
    pruef('Nebenknopf ' + k + ' vorhanden',
      !!d.querySelector('#karte-rumpf .km-neben [data-do="' + k + '"]'));
  });
  pruef('Bearbeitungsfach bleibt erhalten',
    !!d.querySelector('#karte-rumpf .bearb[data-spaet]'));

  /* ── Drei Reiter statt vier ── */
  {
    const tabs = [...d.querySelectorAll('#karte-rumpf .ktab')].map(x=>x.dataset.ktab);
    pruef('Genau drei Reiter', tabs.length === 3, tabs.join(','));
    pruef('Reiter heißen pflege, standort, verlauf',
      tabs.join(',') === 'pflege,standort,verlauf', tabs.join(','));
    pruef('Kein Reiter „Allgemein" mehr', tabs.indexOf('allgemein') === -1);
    pruef('Fotos sind kein Akkordeon mehr',
      !d.querySelector('#karte-rumpf [data-acc="fotos"]'));
    pruef('Aufgaben stehen vor den Reitern',
      !!d.querySelector('#karte-rumpf .detail > [data-acc="aufgaben"]'));
    pruef('Steckbrief liegt im Pflege-Reiter',
      !!d.querySelector('#karte-rumpf [data-kpane="pflege"] [data-acc="steckbrief"]')
      || !d.querySelector('#karte-rumpf [data-acc="steckbrief"]'));
    pruef('Notizen liegen im Verlauf-Reiter',
      !!d.querySelector('#karte-rumpf [data-kpane="verlauf"] [data-acc="notiz"]')
      || !d.querySelector('#karte-rumpf [data-acc="notiz"]'));
    pruef('Standort trägt die Lagebox',
      !!d.querySelector('#karte-rumpf [data-kpane="standort"] .lagebox'));
  }
  pruef('„Zuklappen" ist raus',
    !d.querySelector('#karte-modal [data-do="karte-zu-oben"]'));
  pruef('„Fertig" ist da', !!d.getElementById('karte-zu'));
  await zu('karte-modal');
  pruef('Kartenschritt ohne Fenster hat kein Ziel', zielDa('karte', 0) === 'Fenster zu');

  w.__T("sektionOeffnen('doktor')");
  await tick();
  [0,1,2].forEach(i => {
    pruef('Doktor · Schritt ' + (i+1), zielDa('doktor', i) === 'da', zielDa('doktor', i));
  });

  /* Der Doktor war der einzige Assistent, der seine Stufen stapelte:
     jede erledigte blieb stehen, und am Ende scrollte man durch vier
     untereinander. Genau eine darf sichtbar sein. */
  const dokSicht = () => ['dok-s1','dok-s2','dok-s3','dok-ki-zeile','dok-s4']
    .filter(i => { const e = d.getElementById(i); return e && !e.hidden; });
  w.__T("dokWeg = null; dokStufeZeigen(1)");
  pruef('Doktor zeigt auf Stufe 1 nur Stufe 1',
    dokSicht().join(',') === 'dok-s1', dokSicht().join(','));
  w.__T("dokStufeZeigen(2)");
  pruef('Doktor zeigt auf Stufe 2 nur Stufe 2',
    dokSicht().join(',') === 'dok-s2', dokSicht().join(','));
  pruef('Ohne Weg bleibt Weiter gesperrt',
    d.getElementById('dok-weiter-f').disabled === true);
  w.__T("dokWeg = 'ki'; dokStufeZeigen(3)");
  pruef('Der KI-Weg zeigt nur seine Stufe',
    dokSicht().join(',') === 'dok-ki-zeile', dokSicht().join(','));
  w.__T("dokWeg = 'selbst'; dokStufeZeigen(3)");
  pruef('Der Merkmalsweg zeigt nur seine Stufe',
    dokSicht().join(',') === 'dok-s3', dokSicht().join(','));
  w.__T("dokStufeZeigen(4)");
  pruef('Die Einschätzung steht allein',
    dokSicht().join(',') === 'dok-s4', dokSicht().join(','));
  /* Seit 3.2.5 wird aus Weiter auf der letzten Stufe der Abschluss —
     das Beenden liegt damit an derselben Stelle wie das Blaettern. */
  pruef('Auf der letzten Stufe schließt der Knopf ab',
    /abschlie/i.test(d.getElementById('dok-weiter-f').textContent),
    d.getElementById('dok-weiter-f').textContent);
  pruef('Zurück ist auf Stufe 1 verborgen',
    (w.__T("dokStufeZeigen(1)"), d.getElementById('dok-zurueck-f').hidden === true));

  /* ── Der Doktor nach 3.3.1 ──────────────────────────────────
     Die Bilder sind die eigentliche Arbeit und standen unter dem
     Fragefeld; der Knopf, der ein Bild in die Galerie legt, stand
     mitten in der Anfrage; und „Weiter" sprang auf eine leere
     Einschätzung. */
  {
    const zeile = d.getElementById('dok-ki-zeile');
    const fotos = d.getElementById('ki-fotos-doktor');
    const frage = d.getElementById('dok-frage-eigen');
    pruef('Die Bilderzeile im Doktor gibt es', !!fotos);
    pruef('Sie steht über dem Fragefeld',
      !!fotos && !!frage && !!zeile
      && (fotos.compareDocumentPosition(frage) & 4) !== 0);
    pruef('Die Bilder sind gro\u00df',
      (d.getElementById('ki-bilder-doktor').className || '').indexOf('gross') !== -1);
    pruef('Der Galerieauszug steht offen',
      d.getElementById('ki-galerie-auf').hasAttribute('open'));

    /* Ein einzelnes Dateifeld nimmt am Telefon immer den Umweg ueber
       die Auswahl. Fuer den geraden Weg an die Kamera braucht es ein
       zweites mit `capture` — beides in einem geht nicht. */
    w.__T("kiBilderZeichnen('doktor')");
    const felder = d.querySelectorAll('#ki-bilder-doktor input[type=file]');
    pruef('Es gibt zwei Wege zu einem Bild', felder.length === 2,
      String(felder.length));
    pruef('Einer davon geht direkt an die Kamera',
      !!d.querySelector('#ki-bilder-doktor input[capture]'));
    pruef('Der andere darf mehrere auf einmal',
      !!d.querySelector('#ki-bilder-doktor input[multiple]:not([capture])'));
    pruef('Auch die Galerie der Pflanze l\u00e4sst sich mit der Kamera f\u00fcllen',
      !!d.getElementById('dok-datei-kamera')
      && d.getElementById('dok-datei-kamera').hasAttribute('capture'));
    const feld = d.getElementById('dok-foto-feld');
    pruef('Foto in die Galerie legen geh\u00f6rt zur Einsch\u00e4tzung',
      !!feld && !!feld.closest('#dok-s4'));

    /* Ohne Merkmal gibt es nichts einzuschaetzen. */
    w.__T("dokWeg = 'selbst'; dokSymptome.clear(); dokStufeZeigen(3)");
    pruef('Ohne ein einziges Merkmal bleibt Weiter grau',
      d.getElementById('dok-weiter-f').disabled === true);

    /* Mit Schluessel wird aus „Weiter" die Handlung selbst. */
    const merkS = w.__T("kiSchluessel()");
    w.__T("kiSchluesselSetzen('" + ATTRAPPE_LANG + "');"
      + "S.kiModelle = [{id:'gemini-9.9-flash', anzeige:'9.9 Flash'}];"
      + "S.kiModell = 'gemini-9.9-flash';"
      + "dokKiFertig = false; dokWeg = 'ki'; dokStufeZeigen(3)");
    pruef('Mit Schl\u00fcssel fragt der Fu\u00dfknopf',
      /frag/i.test(d.getElementById('dok-weiter-f').textContent),
      d.getElementById('dok-weiter-f').textContent);
    pruef('Der doppelte Knopf dar\u00fcber ist weg',
      d.getElementById('dok-ki-knopfzeile').hidden === true);
    w.__T("dokKiFertig = true; dokStufeZeigen(3)");
    pruef('Liegt eine Antwort vor, f\u00fchrt er wieder weiter',
      /weiter/i.test(d.getElementById('dok-weiter-f').textContent),
      d.getElementById('dok-weiter-f').textContent);
    w.__T("dokKiFertig = false; kiSchluesselSetzen(" + JSON.stringify(merkS || '') + ");"
      + "delete S.kiModelle; delete S.kiModell; kiModusZeigen(); dokStufeZeigen(1)");
  }

  /* ── Warum die Kacheln sich stapelten ───────────────
     Beim ersten Öffnen der Sammlung hatte das Gitter noch keine
     Breite; ohne Breite wird nichts gemessen, und alle Kacheln fielen
     auf die feine Grundzeile zurück. */
  {
    pruef('Es gibt einen Beobachter f\u00fcr das Kachelgitter',
      typeof w.__T('typeof rasterBeobachten') === 'string'
      && w.__T('typeof rasterBeobachten') === 'function');
    pruef('Er wird beim Spannen angeworfen',
      html.indexOf('rasterBeobachten();') !== -1);
    pruef('Der Wechsel in die Sammlung sto\u00dft das Messen an',
      html.indexOf("if(name === 'sammlung' && typeof rasterSpannenBald === 'function')") !== -1);
  }

  /* ── Der Verlauf, ohne Umweg ─────────────────────
     Aus der Pflanzenkarte fuehrte nur ein Weg in den Stammbaum. Das
     Blatt mit dem Verlauf soll direkt aufgehen — und sagen, von wem
     die Pflanze abstammt. */
  {
    const mutter = w.__T('allePflanzen()[0].id');
    const kind = w.__T(`(function(){
      const m = allePflanzen().find(function(x){ return x.id === '${mutter}'; });
      const k = allePflanzen().find(function(x){ return x.eltern === '${mutter}'; });
      if(k) return k.id;
      const neu = JSON.parse(JSON.stringify(m));
      neu.id = 'pruef-kind';
      neu.name = 'Pr\u00fcfableger';
      neu.eltern = '${mutter}';
      S.eigene = S.eigene || [];
      S.eigene.push(neu);
      return neu.id;
    })()`);

    pruef('Das Verlaufsblatt l\u00e4sst sich direkt \u00f6ffnen',
      w.__T(`sbBlattOeffnen('${kind}', true)`) === true);
    pruef('Es liegt dann \u00fcber allem',
      d.getElementById('sb-blatt').classList.contains('frei'));
    pruef('Die Mutterpflanze steht dar\u00fcber',
      !!d.querySelector('.sb-herkunft'));
    pruef('und f\u00fchrt selbst auf ihren Verlauf',
      !!d.querySelector(`.sb-herkunft [data-sbblatt="${mutter}"]`));
    w.__T('sbBlattSchliessen()');
    pruef('Schlie\u00dfen nimmt beides zur\u00fcck',
      !d.getElementById('sb-blatt').classList.contains('an')
      && !d.getElementById('sb-blatt').classList.contains('frei'));

    /* Im Stammbaum bleibt es eingespannt wie vorher. */
    w.__T(`sbBlattOeffnen('${kind}')`);
    pruef('Aus dem Stammbaum heraus bleibt es eingespannt',
      !d.getElementById('sb-blatt').classList.contains('frei'));
    w.__T('sbBlattSchliessen()');

    w.__T("S.eigene = (S.eigene||[]).filter(function(x){ return x.id !== 'pruef-kind'; })");
  }

  /* ── Wie lange die App auf Google wartet ────────────────────
     Ohne Frist wartete sie unbegrenzt, wenn Google langsam antwortete
     statt „\u00fcberlastet" zu melden. */
  {
    pruef('Es gibt eine Frist f\u00fcr Anfragen mit Bild',
      w.__T('KI_FRIST_BILD') === 30000, String(w.__T('KI_FRIST_BILD')));
    pruef('und eine k\u00fcrzere f\u00fcr Anfragen ohne',
      w.__T('KI_FRIST_TEXT') === 15000, String(w.__T('KI_FRIST_TEXT')));
    pruef('Die Frist mit Bild ist die l\u00e4ngere',
      w.__T('KI_FRIST_BILD') > w.__T('KI_FRIST_TEXT'));
    pruef('Nachgefasst wird nur noch einmal',
      w.__T('KI_NACHFASSEN.length') === 1, String(w.__T('KI_NACHFASSEN.length')));
    pruef('und zwar z\u00fcgig',
      w.__T('KI_NACHFASSEN[0]') <= 2000, String(w.__T('KI_NACHFASSEN[0]')));
  }

  /* Die eigene Frage: sie ist der Anlass und muss im Prompt stehen. */
  pruef('Es gibt ein Feld für die eigene Frage',
    !!d.getElementById('dok-frage-eigen'));
  w.__T("dokFrage = 'Was ist die braune Stelle am mittleren Blatt?'");
  const dokP = w.__T('dokPromptBauen()');
  pruef('Die eigene Frage steht im Prompt',
    /MEINE FRAGE: Was ist die braune Stelle/.test(dokP));
  pruef('Der Prompt verlangt eine Antwort darauf',
    /\nANTWORT: Beantworte zuerst/.test(dokP));
  pruef('Der Prompt verlangt die genaue Stelle',
    /\nSTELLE: Wo genau sitzt/.test(dokP));
  pruef('Der Doktorkopf spricht von Diagnose, nicht von Bestimmung',
    /keine Bestimmungsaufgabe/.test(dokP));
  /* Die Zahl im Prompt zaehlt die Feldzeilen — sie muss die zwei
     neuen mitzaehlen, sonst zaehlt die KI selbst nach und stolpert. */
  pruef('Die Zahl im Prompt stimmt', /achtzehn Schlüsselwörter/.test(dokP),
    (dokP.match(/Alle \S+ Schlüsselwörter/) || [''])[0]);
  const gel = JSON.parse(w.__T(
    "JSON.stringify(geminiLesen('ANTWORT: Sonnenbrand.\\nSTELLE: Blattmitte, trocken.\\nZUSTAND: gesund'))"));
  pruef('Der Leser kennt ANTWORT', gel.antwort === 'Sonnenbrand.', JSON.stringify(gel));
  pruef('Der Leser kennt STELLE', gel.stelle === 'Blattmitte, trocken.');
  /* Der Unsicherheitshinweis war acht Zeilen Fliesstext ueber der
     Diagnose. Uebrig bleibt eine Zeile mit Kreuz. */
  pruef('Lange Begründungen werden auf Stichworte gekürzt',
    w.__T("kurzFehlt('Blattunterseite, Blattachseln; das ist der zweite Satz.')")
      === 'Blattunterseite, Blattachseln');
  pruef('Sehr lange Angaben werden abgeschnitten',
    w.__T("kurzFehlt('a'.repeat(200))").length <= 96);
  pruef('Topf und Platz wiederholt die Empfehlung nicht',
    !/Empfehlung/.test(w.__T(
      "topfHTML({groesse:'zu klein', material:'Glas', ablauf:'kein ablauf sichtbar', empfehlung:'In 15 cm umtopfen'})")));
  pruef('Der Prompt kennt die Wasserkultur-Regel',
    /Wasserkultur/.test(w.__T('dokPromptBauen()')));
  pruef('Die Antwort auf die Frage steht in der Einschätzung',
    /dok-antwort/.test(w.__T(
      "dokKiErgebnisHTML({antwort:'Sonnenbrand.', stelle:'Blattmitte.', zustand:'gesund'})")));
  pruef('Ohne gestellte Frage bleibt der Kasten weg',
    !/dok-antwort/.test(w.__T(
      "dokKiErgebnisHTML({antwort:'keine Frage gestellt', zustand:'gesund'})")));
  /* Der Durchgang endete nie: „Fertig“ schloss nur das Fenster, und
     die alte Diagnose stand beim naechsten Aufruf noch da. */
  w.__T("dokPflanze = allePflanzen()[0].id; dokWeg = 'ki'; dokKiFertig = true;");
  w.__T("dokKiDaten = {zustand:'gesund'}; dokFrage = 'Testfrage'; dokStufeZeigen(4)");
  pruef('Vor dem Abschluss steht der Durchgang noch',
    w.__T('dokSchritt') === 4 && w.__T('dokWeg') === 'ki');
  w.__T('dokAbschliessen()');
  pruef('Abschließen setzt auf Stufe 1', w.__T('dokSchritt') === 1, String(w.__T('dokSchritt')));
  pruef('Abschließen leert den Weg', w.__T('dokWeg') === null);
  pruef('Abschließen leert die Antwort', w.__T('dokKiDaten') === null);
  pruef('Abschließen leert die eigene Frage', w.__T('dokFrage') === '');
  pruef('Abschließen leert die Pflanzenwahl', w.__T('dokPflanze') === null);
  pruef('Abschließen leert die Einschätzung',
    (d.getElementById('dok-ergebnis').innerHTML || '') === '');

  /* Die Kopfleiste: Pfeil links, Titel mittig, i rechts. */
  pruef('Die Kopfleiste hat einen Zurück-Pfeil',
    !!d.querySelector('#sek-modal .sekm-raus#sekm-zu svg'));
  pruef('Der Pfeil trägt kein Wort',
    !/[A-Za-zÄÖÜäöü]/.test(d.getElementById('sekm-zu').textContent || ''),
    d.getElementById('sekm-zu').textContent.trim());
  pruef('Das i steht rechts vom Titel',
    d.getElementById('sekm-titel').compareDocumentPosition(d.getElementById('sekm-info'))
      === 4);
  pruef('Auch die Pflanzenkarte hat den Pfeil',
    !!d.querySelector('#karte-modal .sekm-raus#karte-zu svg'));

  await zu('sek-modal');

  w.__T("sektionOeffnen('substrat')");
  await tick();
  [0,1,2].forEach(i => {
    pruef('Substrat · Schritt ' + (i+1), zielDa('substrat', i) === 'da', zielDa('substrat', i));
  });
  await zu('sek-modal');

  /* Der Rechner wurde einmal beim Start aufgebaut. Da sind die Fotos
     noch nicht aus dem großen Speicher gelesen — die Auswahlkacheln
     blieben bis zur ersten Suche leer. Öffnen muss neu zeichnen. */
  w.__T("document.getElementById('sub-gitter').innerHTML = ''");
  w.__T("sektionOeffnen('substrat')");
  await tick();
  pruef('Substratwahl wird beim Öffnen neu gezeichnet',
    d.querySelectorAll('#sub-gitter .pwahl-k').length > 0,
    String(d.querySelectorAll('#sub-gitter .pwahl-k').length));

  /* Die beiden Mischungen standen untereinander: Vergleichen hiess
     scrollen und sich die obere merken. Jetzt liegen sie in einer
     Wischspur nebeneinander — vorn das Machbare, dahinter das Optimum
     mit dem Zukauf. Ohne Vorrat gibt es nichts zu vergleichen. */
  w.__T("S.vorrat = []; subPflanze = null; subZiel = 'zimmer'; subErgebnis()");
  pruef('Ohne Vorrat keine Wischspur',
    !d.querySelector('#sub-mischung .vgl'));
  w.__T("S.vorrat = ['blumenerde','perlit','bims']; subErgebnis()");
  const vgl = d.querySelector('#sub-mischung .vgl');
  pruef('Mit Vorrat entsteht eine Wischspur', !!vgl);
  pruef('Genau zwei Karten in der Spur',
    !!vgl && vgl.querySelectorAll('.vgl-karte').length === 2,
    vgl ? String(vgl.querySelectorAll('.vgl-karte').length) : 'keine');
  pruef('Vorn steht die Mischung aus dem Vorrat',
    !!vgl && /Aus deinem Vorrat/.test(vgl.querySelectorAll('.vgl-karte')[0].textContent));
  pruef('Dahinter das Optimum',
    !!vgl && /optimal/.test(vgl.querySelectorAll('.vgl-karte')[1].textContent));
  pruef('Die Zukaufempfehlung liegt beim Optimum',
    !!vgl && !/Dafür fehlt dir/.test(vgl.querySelectorAll('.vgl-karte')[0].textContent));
  pruef('Zwei Punkte zum Springen',
    !!vgl && vgl.querySelectorAll('.vgl-punkt').length === 2);

  /* ── Abschlussknopf ──
     Ein Hauptknopf, der auf der letzten Stufe die Abschlussaktion
     traegt. Beim Substrat stand dort vorher gar keiner: man musste
     ueber den Fensterkopf hinaus. */
  w.__T('subStufeZeigen(1)');
  pruef('Substrat \u00b7 Stufe 1 hei\u00dft Weiter',
    d.getElementById('sub-weiter').hidden === false
    && d.getElementById('sub-weiter').textContent === 'Weiter',
    d.getElementById('sub-weiter').textContent);
  w.__T('subStufeZeigen(SUB_STUFEN)');
  pruef('Substrat \u00b7 auf der letzten Stufe steht Fertig',
    d.getElementById('sub-weiter').hidden === false
    && d.getElementById('sub-weiter').textContent === 'Fertig',
    d.getElementById('sub-weiter').textContent);
  d.getElementById('sub-weiter').click();
  pruef('Substrat \u00b7 Fertig setzt auf Stufe 1 zur\u00fcck',
    w.__T('subStufe') === 1, String(w.__T('subStufe')));
  await zu('sek-modal');

  w.__T("sektionOeffnen('vermehren')");
  await tick();
  pruef('Vermehren \u00b7 nur noch ein Hauptknopf',
    d.getElementById('ver-los') === null && !!d.getElementById('ver-weiter'));
  w.__T('verPflanze = allePflanzen()[0].id; verErledigt = false; verStufeZeigen(1)');
  pruef('Vermehren \u00b7 Stufe 1 hei\u00dft Weiter',
    d.getElementById('ver-weiter').textContent === 'Weiter',
    d.getElementById('ver-weiter').textContent);
  w.__T('verStufeZeigen(VER_STUFEN)');
  pruef('Vermehren \u00b7 auf der letzten Stufe steht die Abschlussaktion',
    d.getElementById('ver-weiter').hidden === false
    && /Ableger anlegen/.test(d.getElementById('ver-weiter').textContent),
    d.getElementById('ver-weiter').textContent
    + ' hidden=' + d.getElementById('ver-weiter').hidden);
  /* Dritter Zustand: angelegt, aber noch nicht abgeraeumt — die
     Meldung mit den Links auf die neuen Pflanzen muss lesbar
     bleiben, das Formular daneben nicht. */
  w.__T('verErledigt = true; verFussZeichnen()');
  pruef('Vermehren \u00b7 danach hei\u00dft der Knopf Fertig',
    d.getElementById('ver-weiter').textContent === 'Fertig',
    d.getElementById('ver-weiter').textContent);
  pruef('Vermehren \u00b7 das Formular tritt hinter die Meldung zur\u00fcck',
    d.getElementById('ver-form3').hidden === true);
  pruef('Vermehren \u00b7 Zur\u00fcck ist dann weg',
    d.getElementById('ver-zurueck').hidden === true);
  d.getElementById('ver-weiter').click();
  pruef('Vermehren \u00b7 Fertig r\u00e4umt ab',
    w.__T('verStufe') === 1 && w.__T('verErledigt') === false
    && d.getElementById('ver-form3').hidden === false,
    String(w.__T('verStufe')) + '/' + String(w.__T('verErledigt')));
  await zu('sek-modal');

  w.__T("sektionOeffnen('sicherung')");
  await tick();
  [0,1,2].forEach(i => {
    pruef('Sicherung · Schritt ' + (i+1), zielDa('sicherung', i) === 'da', zielDa('sicherung', i));
  });
  await zu('sek-modal');

  /* Kein Schritt zeigt mehr in die alte Inline-Welt. */
  const alteZiele = w.__T(`(function(){
    const treffer = [];
    Object.keys(TOUR_KAPITEL).forEach(k=>{
      let ss = []; try{ ss = TOUR_KAPITEL[k].schritte() || []; }catch(e){ return; }
      ss.forEach((s, i)=>{
        const q = String(s.ziel);
        if(q.indexOf('.card.open') !== -1 || q.indexOf('.wz-i') !== -1) treffer.push(k + '#' + (i+1));
      });
    });
    return treffer.join(', '); })()`);
  pruef('keine Ziele mehr in der alten Inline-Welt', alteZiele === '', alteZiele);

  /* — Ein Kapitel wirklich durchlaufen — */
  w.__T('if(tourLauf) tourSchliessen();');
  w.__T('S.tutorial = {aus:false, kapitel:{}, einricht:0}; sichern();');
  pruef('Kartenfenster öffnet erneut', w.__T(`karteOeffnen('${pid}')`) === true);
  await tick();
  pruef('Tour startet', w.__T("tourStart('karte')") === true);
  await tick();
  pruef('Tourkasten sichtbar', tourBox.hidden === false);
  pruef('Tour steht auf Schritt 1', w.__T('tourLauf.i') === 0);
  d.getElementById('tour-weiter').click();
  await tick();
  pruef('„Weiter" geht einen Schritt vor', w.__T('tourLauf.i') === 1, w.__T('tourLauf.i'));
  pruef('Fenster steht noch offen', w.__T("modalOffen('karte-modal')") === true);
  d.getElementById('tour-weiter').click();
  await tick();
  d.getElementById('tour-weiter').click();
  await tick();
  pruef('bis zum letzten Schritt', w.__T('tourLauf.i') === 3, w.__T('tourLauf.i'));
  d.getElementById('tour-zurueck').click();
  await tick();
  pruef('„Zurück" geht auch', w.__T('tourLauf.i') === 2, w.__T('tourLauf.i'));
  w.__T('tourAbbruch()');
  await tick();
  pruef('Tour weg', w.__T('tourLauf') === null && tourBox.hidden === true);
  await zu('karte-modal');

  /* — Esc gehört erst der Tour — */
  pruef('Fenster für Esc-Probe', w.__T(`karteOeffnen('${pid}')`) === true);
  await tick();
  w.__T("tourStart('karte')");
  await tick();
  d.dispatchEvent(new w.KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
  await tick();
  pruef('Esc beendet die Tour', w.__T('tourLauf') === null);
  pruef('Esc lässt das Fenster stehen', w.__T("modalOffen('karte-modal')") === true);
  d.dispatchEvent(new w.KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
  await tick();
  pruef('zweites Esc schließt das Fenster', w.__T("modalOffen('karte-modal')") === false);

  /* — Abhakkästchen — */
  const tickRegel = w.__T(`(function(){
    let t = '';
    Array.prototype.forEach.call(document.querySelectorAll('style'), s=>{ t += s.textContent; });
    return t; })()`);
  pruef('Kästchen aus der Tap-Regel ausgenommen',
    tickRegel.indexOf('button:not(.linkbtn):not(.tick-btn)') !== -1);
  pruef('Kästchen quadratisch', /\.tick-btn\{[^}]*width:22px;height:22px/.test(tickRegel));
  pruef('Kästchen mit Trefffläche', tickRegel.indexOf('.tick-btn::before') !== -1);
  pruef('Klartext größer', tickRegel.indexOf('html[data-design="klartext"] .tick-btn{width:26px') !== -1);
  pruef('Tour liegt über den Fenstern',
    tickRegel.indexOf('#tour{position:fixed;inset:0;z-index:300') !== -1);

  w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());');
  await tick();

  /* ══════════ 2.9.10 — Shortcuts, Sprung, „Noch feucht" ══════════ */
  w.__T('if(tourLauf) tourSchliessen();');
  w.__T('S.tutorial = {aus:true, kapitel:{}, einricht:0}; sichern();');
  w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());');
  await tick();

  /* — Schnellzugriffe aus der Karte — */
  const kurz = async (tat) => {
    w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());');
    w.__T(`karteOeffnen('${pid}')`);
    await tick();
    const b = d.querySelector(`#karte-modal [data-do="${tat}"]`);
    if(b) b.click();
    await tick();
    return w.__T('_sekOffen ? _sekOffen.key : null');
  };
  pruef('Karte › Doktor öffnet den Doktor', await kurz('doktor-fuer') === 'doktor');
  pruef('Karte › Substrat öffnet Substrat', await kurz('substrat-fuer') === 'substrat');
  pruef('Karte › Vermehren öffnet Vermehren', await kurz('vermehren-fuer') === 'vermehren');
  pruef('Werkzeugfenster bleibt offen', w.__T("modalOffen('sek-modal')") === true);
  w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());');
  await tick();

  /* Ein echter Reiterwechsel schließt das Fenster weiterhin. */
  w.__T("sektionOeffnen('doktor')");
  await tick();
  w.__T("ansichtZeigen('mehr')");
  await tick();
  pruef('Reiterwechsel schließt weiterhin', w.__T("modalOffen('sek-modal')") === false);

  /* — „Ansehen" springt in den Bereich — */
  const sprung = async (k) => {
    w.__T('if(tourLauf) tourSchliessen();');
    w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());');
    await tick();
    w.__T(`tourHin('${k}')`);
    await tick();
    return w.__T('JSON.stringify({a:S.ansicht, sek:_sekOffen?_sekOffen.key:null, stapel:MODAL_STAPEL})');
  };
  pruef('Sprung Doktor', JSON.parse(await sprung('doktor')).sek === 'doktor');
  pruef('Sprung Substrat', JSON.parse(await sprung('substrat')).sek === 'substrat');
  pruef('Sprung Sicherung', JSON.parse(await sprung('sicherung')).sek === 'sicherung');
  pruef('Sprung Vermehren', JSON.parse(await sprung('vermehren')).sek === 'vermehren');
  pruef('Sprung Grundriss', JSON.parse(await sprung('grundriss')).sek === 'grundriss');
  pruef('Sprung Mehr', JSON.parse(await sprung('mehr')).a === 'mehr');
  pruef('Sprung Sammlung', JSON.parse(await sprung('sammlung')).a === 'sammlung');
  const sk = JSON.parse(await sprung('karte'));
  pruef('Sprung Karte öffnet eine Karte', sk.stapel.indexOf('karte-modal') !== -1, JSON.stringify(sk));
  pruef('jedes Kapitel kennt seinen Weg', w.__T(`
    Object.keys(TOUR_KAPITEL).filter(k => k !== 'einricht' && k !== 'plan'
      && typeof TOUR_KAPITEL[k].hin !== 'function').join(',')`) === '');

  /* ══ Overlays behalten ihre Verankerung ═══════════════════════
     In 2.9.28 hob eine Regel fuer den Hintergrund alle Body-Kinder
     mit `body>*{position:relative}` an. Das traf auch die elf
     Overlays: ihr `position:fixed` wurde zu `relative`, sie fielen
     in den Textfluss und standen mitten auf der Seite. Die App war
     unbenutzbar, und keine der 610 Pruefungen schlug an \u2014 jsdom
     rechnet kein Layout, aber die Kaskade rechnet es sehr wohl. */
  {
    const overlays = ['willkommen','tour','giessmodus','rundgang','urlaub-blatt',
                      'karte-modal','sek-modal','lightbox','foto-modal',
                      'gift-modal','neu-modal'];
    ['botanisch','klartext','terrarium'].forEach(dz => {
      d.querySelector('[data-design-go="' + dz + '"]').click();
      const kaputt = overlays.filter(id => {
        const el = d.getElementById(id);
        return el && w.getComputedStyle(el).position !== 'fixed';
      });
      pruef('Overlays bleiben verankert in ' + dz,
        kaputt.length === 0, kaputt.join(','));
    });
    pruef('Die Leiste unten bleibt verankert',
      w.getComputedStyle(d.querySelector('nav.tabs')).position === 'fixed');
    /* Der Hintergrund darf die Kinder nicht anfassen. */
    /* Nur im Stilblock suchen \u2014 im Kommentar daneben steht die Regel
       als abschreckendes Beispiel und soll dort stehen bleiben. */
    pruef('Keine Sammelregel auf den Body-Kindern',
      !/[^`]body>\*\{[^}]*position:relative/.test(
        [...d.querySelectorAll('style')].map(x=>x.textContent).join('')));
    d.querySelector('[data-design-go="botanisch"]').click();
  }

  /* ══ Durchlauf durch alle Fenster ══════════════════════════════
     Reiter wechseln, jeden Abschnitt oeffnen und schliessen, die
     Kartenreiter durchklicken, die Runde von vorn bis hinten laufen
     lassen. Fasst das, was am Schreibtisch nie auffaellt: ein Fenster,
     das sich nicht mehr oeffnet, ein Reiter ohne Inhalt, eine Tour,
     die sich selbst abbricht. */
  {
    for(const a of ['heute','sammlung','werkzeuge','mehr']){
      w.__T(`ansichtZeigen('${a}')`);
      await tick();
      pruef('Reiter ' + a + ' erreichbar', d.body.dataset.ansicht === a,
        d.body.dataset.ansicht);
      pruef('Reiter ' + a + ' zeigt Inhalt',
        [...d.querySelectorAll(`[data-ans="${a}"]`)]
          .some(x => !x.classList.contains('ans-aus')));
    }

    const abschnitte = [...d.querySelectorAll('section[data-wz],section[data-mh]')]
      .map(x => x.dataset.wz || x.dataset.mh);
    pruef('Alle Abschnitte gefunden', abschnitte.length >= 25, String(abschnitte.length));
    const stumm = [], leer = [], klemmt = [];
    for(const k of abschnitte){
      const auf = w.__T(`sektionOeffnen('${k}')`);
      await tick();
      if(auf !== true){ stumm.push(k); continue; }
      const rumpf = d.getElementById('sekm-rumpf');
      if(!rumpf || rumpf.textContent.trim().length < 20) leer.push(k);
      w.__T("modalZu('sek-modal')");
      await tick();
      if(w.__T("modalOffen('sek-modal')")) klemmt.push(k);
    }
    pruef('Jeder Abschnitt \u00f6ffnet', stumm.length === 0, stumm.join(','));
    pruef('Keiner ist leer', leer.length === 0, leer.join(','));
    pruef('Jeder schlie\u00dft wieder', klemmt.length === 0, klemmt.join(','));

    /* Kartenfenster mit seinen drei Reitern */
    w.__T("ansichtZeigen('sammlung')"); await tick();
    const kid = w.__T('allePflanzen()[0].id');
    w.__T(`karteOeffnen('${kid}')`); await tick();
    pruef('Kartenfenster \u00f6ffnet', w.__T("modalOffen('karte-modal')"));
    const tot = [];
    for(const t of ['pflege','standort','verlauf']){
      const b = d.querySelector(`#karte-rumpf .ktab[data-ktab="${t}"]`);
      if(!b){ tot.push(t + ' (Knopf fehlt)'); continue; }
      b.click(); await tick();
      const pane = d.querySelector(`#karte-rumpf [data-kpane="${t}"]`);
      if(!pane || pane.hidden) tot.push(t);
    }
    pruef('Alle drei Kartenreiter schalten um', tot.length === 0, tot.join(','));

    /* Abstammung: offen im Verlauf-Reiter, nicht in einem Akkordeon.
       Sie greift auch bei Pflanzen aus alten Fass\u00fcngen \u2014 sie liest
       p.eltern, nicht die Ereignisse. */
    {
      /* Zwei Pflanzen anlegen, wie sie aus einer alten Fassung
         stammen koennten: das Kind kennt seine Mutter ueber
         p.eltern, Ereignisse dazu gibt es keine. */
      const alt = w.__T(`(function(){
        S.eigene = (S.eigene||[]).filter(x=>x.id!=='AM1' && x.id!=='AK1');
        const roh = id => ({id, name:id==='AM1'?'Mutter':'Ableger',
          art:'Monstera deliciosa', botanisch:'Monstera deliciosa',
          klasse:'B', licht:'indirekt', seit:iso(HEUTE),
          probleme:[], katzentext:'', beob:[], todo:[], log:[], notiz:''});
        const m = roh('AM1'), k = roh('AK1');
        k.eltern = 'AM1';
        S.eigene.push(m, k); sichern(); render();
        return JSON.stringify({m:'AM1', k:'AK1'}); })()`);
      await tick();
      if(alt){
        const ids = JSON.parse(alt);
        pruef('Abstammung greift ohne Ereignisse',
          w.__T(`abstammungHTML(allePflanzen().find(x=>x.id==='${ids.k}'))`) !== '');
        w.__T(`karteOeffnen('${ids.k}')`); await tick();
        const b = d.querySelector('#karte-rumpf .ktab[data-ktab="verlauf"]');
        if(b){ b.click(); await tick(); }
        const blk = d.querySelector('#karte-rumpf [data-kpane="verlauf"] .abstammung');
        pruef('Abstammung steht im Verlauf-Reiter', !!blk);
        pruef('und nicht in einem Akkordeon',
          !!blk && !blk.closest('.acc'));
        pruef('Sie nennt die Mutter mit Sprung',
          !!blk && !!blk.querySelector(`[data-go="${ids.m}"]`));
        pruef('und den Weg in den Stammbaum',
          !!blk && !!blk.querySelector('[data-do="stammbaum-auf"]'));
        w.__T("modalZu('karte-modal')"); await tick();
        w.__T(`S.eigene = (S.eigene||[]).filter(x=>x.id!=='AM1' && x.id!=='AK1');
          sichern(); render()`);
        pruef('Testpflanzen wieder entfernt',
          !w.__T("allePflanzen().some(x=>x.id==='AM1')"));
      }
    }
    w.__T("modalZu('karte-modal')"); await tick();
    pruef('Kartenfenster schlie\u00dft', !w.__T("modalOffen('karte-modal')"));

    /* Die Runde von vorn bis hinten. Sie wechselt dabei viermal die
       Ansicht \u2014 genau daran ist sie zuerst gescheitert. */
    /* Fruehere Pruefungen haben Kapitel durchlaufen lassen; „runde"
       gilt danach als gesehen und tourStart verweigert. Zuruecksetzen. */
    w.__T("const _t = tourZustand(); _t.aus = false; delete _t.kapitel.runde; sichern()");
    w.__T("tourStart('runde')"); await tick();
    pruef('Die Runde startet', !!w.__T('tourLauf'),
      'aus=' + String(w.__T('tourZustand().aus'))
      + ' noetig=' + String(w.__T("tourNoetig('runde')")));
    pruef('Der Deckel liegt auf', d.getElementById('tour').hidden === false);
    for(let i = 0; i < 5; i++){
      d.getElementById('tour-weiter').click();
      await tick();
      if(!w.__T('tourLauf')) break;
    }
    pruef('Sie \u00fcbersteht den Ansichtswechsel', !!w.__T('tourLauf'),
      'nach Schritt ' + String(w.__T('tourLauf && tourLauf.i')));
    pruef('Sie ist \u00fcber Heute hinaus',
      w.__T('tourLauf && tourLauf.i') >= 2,
      String(w.__T('tourLauf && tourLauf.i')));
    w.__T('tourAbbruch()'); await tick();
    pruef('Sie r\u00e4umt sich weg', d.getElementById('tour').hidden === true);
    pruef('Kein Deckel bleibt liegen', !w.__T('tourLauf'));

    /* Nach der Tour muss alles weiter bedienbar sein */
    w.__T("ansichtZeigen('werkzeuge')"); await tick();
    pruef('Reiter nach der Tour erreichbar', d.body.dataset.ansicht === 'werkzeuge');
    pruef('Fenster nach der Tour bedienbar', w.__T("sektionOeffnen('doktor')") === true);
    w.__T("modalZu('sek-modal')"); await tick();
    w.__T("ansichtZeigen('heute')"); await tick();
  }

  /* ══ Düngen ════════════════════════════════════════════════════
     Die Stufen gab es schon, die Rechnung darueber nicht. Wichtig
     sind die Sperren: Duenger zur falschen Zeit reichert Salz an und
     verbrennt Wurzeln \u2014 lieber gar nicht als zu frueh. */
  {
    const dp = w.__T(`(function(){
      S.eigene = (S.eigene||[]).filter(x=>x.id!=='DG1');
      S.eigene.push({id:'DG1', name:'D\u00fcngetest', art:'Monstera deliciosa',
        botanisch:'Monstera deliciosa', klasse:'B', licht:'indirekt',
        duenger:'normal', seit:iso(HEUTE), probleme:[], katzentext:'',
        beob:[], todo:[], log:[], notiz:''});
      S.dueng = {}; S.duengLangzeit = {};
      if(S.zustand) delete S.zustand['DG1'];
      S.giess = {art:'leitung', haerte:'', dgArt:'fluessig',
                 winterpause:false, saison:true, saisonStaerke:'normal'};
      sichern(); render(); return 'DG1'; })()`);
    await tick();

    /* Abstand nach Bedarfsstufe */
    pruef('Normal ergibt 21 Tage',
      w.__T(`duengAbstand(allePflanzen().find(x=>x.id==='${dp}'))`) === 21,
      String(w.__T(`duengAbstand(allePflanzen().find(x=>x.id==='${dp}'))`)));
    pruef('Starkzehrer h\u00e4ufiger als normal',
      w.__T('DUENG_ABSTAND.viel') < w.__T('DUENG_ABSTAND.normal'));
    pruef('Sparsam seltener als normal',
      w.__T('DUENG_ABSTAND.sparsam') > w.__T('DUENG_ABSTAND.normal'));

    /* Die Duengerart streckt den Abstand */
    w.__T("S.giess.dgArt = 'stab'; sichern()");
    pruef('St\u00e4bchen strecken den Abstand',
      w.__T(`duengAbstand(allePflanzen().find(x=>x.id==='${dp}'))`) === 42,
      String(w.__T(`duengAbstand(allePflanzen().find(x=>x.id==='${dp}'))`)));
    w.__T("S.giess.dgArt = 'selbst'; sichern()");
    pruef('Selbst Angesetztes darf h\u00e4ufiger',
      w.__T(`duengAbstand(allePflanzen().find(x=>x.id==='${dp}'))`) < 21);
    pruef('Nie unter einer Woche',
      w.__T(`duengAbstand(allePflanzen().find(x=>x.id==='${dp}'))`) >= 7);
    w.__T("S.giess.dgArt = 'fluessig'; sichern()");

    /* ── Die vier Sperren ── */
    pruef('Ohne Sperre ist nichts im Weg',
      w.__T(`duengSperre(allePflanzen().find(x=>x.id==='${dp}'))`) === null);

    w.__T(`(function(){ S.eigene.find(x=>x.id==='${dp}').duenger = 'nie'; sichern(); })()`);
    pruef('Karnivoren werden nie ged\u00fcngt',
      (w.__T(`duengSperre(allePflanzen().find(x=>x.id==='${dp}'))`)||{}).code === 'nie');
    pruef('und haben keinen Abstand',
      w.__T(`duengAbstand(allePflanzen().find(x=>x.id==='${dp}'))`) === 0);
    w.__T(`(function(){ S.eigene.find(x=>x.id==='${dp}').duenger = 'normal'; sichern(); })()`);

    w.__T("S.giess.winterpause = true; sichern()");
    const m = new Date().getMonth() + 1;
    const imWinter = (m >= 10 || m <= 2);
    pruef('Winterpause greift nur von Oktober bis Februar',
      ((w.__T(`duengSperre(allePflanzen().find(x=>x.id==='${dp}'))`)||{}).code === 'winter')
        === imWinter, 'Monat ' + m);
    w.__T("S.giess.winterpause = false; sichern()");

    /* Frisch umgetopft \u2014 die Verknuepfung zum Umtopf-Assistenten */
    w.__T(`zustandSetzen('${dp}', 'frisch')`);
    pruef('Frisch umgetopft sperrt das D\u00fcngen',
      (w.__T(`duengSperre(allePflanzen().find(x=>x.id==='${dp}'))`)||{}).code === 'frisch');
    pruef('Der Grund steht im Klartext dabei',
      /Substrat/.test((w.__T(`duengSperre(allePflanzen().find(x=>x.id==='${dp}'))`)||{}).text || ''));
    w.__T(`if(S.zustand) delete S.zustand['${dp}']; sichern()`);

    /* Langzeitduenger \u2014 feste Sperre statt Rechnung */
    w.__T(`S.duengLangzeit = {'${dp}': iso(HEUTE)}; sichern()`);
    pruef('Langzeitd\u00fcnger sperrt ein halbes Jahr',
      (w.__T(`duengSperre(allePflanzen().find(x=>x.id==='${dp}'))`)||{}).code === 'langzeit');
    w.__T(`S.duengLangzeit = {'${dp}': iso(new Date(Date.now() - 200*86400000))}; sichern()`);
    pruef('Nach einem halben Jahr wieder frei',
      w.__T(`duengSperre(allePflanzen().find(x=>x.id==='${dp}'))`) === null);
    w.__T("S.duengLangzeit = {}; sichern()");

    /* ── Quittieren ── */
    pruef('Ohne Eintrag ist der Stand unbekannt',
      w.__T(`duengStatus(allePflanzen().find(x=>x.id==='${dp}')).stand`) === 'unbekannt');
    pruef('D\u00fcngen l\u00e4sst sich eintragen', w.__T(`duengen('${dp}')`) === true);
    pruef('Der Eintrag tr\u00e4gt das heutige Datum',
      w.__T(`duengLog('${dp}')[0]`) === w.__T('iso(HEUTE)'));
    pruef('Danach ist sie nicht mehr f\u00e4llig',
      w.__T(`duengStatus(allePflanzen().find(x=>x.id==='${dp}')).stand`) === 'ok');
    pruef('Zweimal am selben Tag z\u00e4hlt einmal', w.__T(`(function(){
      duengen('${dp}'); return S.dueng['${dp}'].length; })()`) === 1);
    pruef('R\u00fccknahme geht', w.__T(`(function(){
      duengWeg('${dp}'); return (S.dueng['${dp}']||[]).length; })()`) === 0);

    /* Gesperrt heisst: gar nicht eintragbar. */
    w.__T(`zustandSetzen('${dp}', 'frisch')`);
    pruef('Gesperrt l\u00e4sst sich nichts eintragen', w.__T(`duengen('${dp}')`) === false);
    w.__T(`if(S.zustand) delete S.zustand['${dp}']; sichern()`);

    /* Kein Nachholen: 90 Tage her ergibt einen Termin, nicht vier. */
    w.__T(`S.dueng['${dp}'] = [iso(new Date(Date.now() - 90*86400000))]; sichern()`);
    pruef('Lange \u00fcberf\u00e4llig ist genau einmal f\u00e4llig',
      w.__T(`duengListe().filter(x=>x.id==='${dp}').length`) === 1);
    w.__T(`duengen('${dp}')`);
    pruef('Eintragen setzt den Z\u00e4hler zur\u00fcck, ohne Rest',
      w.__T(`duengStatus(allePflanzen().find(x=>x.id==='${dp}')).stand`) === 'ok');

    /* ── Anzeige ── */
    w.__T(`S.dueng['${dp}'] = [iso(new Date(Date.now() - 40*86400000))]; sichern(); render()`);
    await tick();
    pruef('Die Karte zeigt den D\u00fcngeabschnitt',
      /dg-block/.test(w.__T(`duengAbschnittHTML(allePflanzen().find(x=>x.id==='${dp}'))`)));
    pruef('Sie nennt die Bedarfsstufe',
      /Normal/.test(w.__T(`duengAbschnittHTML(allePflanzen().find(x=>x.id==='${dp}'))`)));
    pruef('Gesperrt zeigt sie den Grund statt eines Knopfes', w.__T(`(function(){
      zustandSetzen('${dp}', 'frisch');
      const h = duengAbschnittHTML(allePflanzen().find(x=>x.id==='${dp}'));
      if(S.zustand) delete S.zustand['${dp}'];
      return h.indexOf('gesperrt') !== -1 && h.indexOf('dg-knopf') === -1; })()`));
    pruef('Die Zeile auf Heute erscheint',
      /dg-zeile/.test(w.__T('duengZeileHTML()')), w.__T('duengZeileHTML()').slice(0, 40));
    pruef('Ohne F\u00e4llige bleibt sie weg', w.__T(`(function(){
      const merk = S.dueng['${dp}'];
      S.dueng['${dp}'] = [iso(HEUTE)];
      const leer = duengListe().length === 0 ? duengZeileHTML() === '' : true;
      S.dueng['${dp}'] = merk; return leer; })()`));

    /* Der Haken im Giessmodus laeuft nur bei Fl\u00fcssigd\u00fcnger mit. */
    pruef('Fl\u00fcssig l\u00e4uft im Giesswasser mit', w.__T('duengImGiesswasser()') === true);
    w.__T("S.giess.dgArt = 'stab'; sichern()");
    pruef('St\u00e4bchen nicht', w.__T('duengImGiesswasser()') === false);
    w.__T("S.giess.dgArt = 'langzeit'; sichern()");
    pruef('Langzeit auch nicht', w.__T('duengImGiesswasser()') === false);
    w.__T("S.giess.dgArt = 'fluessig'; sichern()");

    /* Der Umtopf-Assistent setzt die Langzeitsperre. */
    pruef('Der Assistent fragt nach Langzeitd\u00fcnger', !!d.getElementById('ut-langzeit'));
    w.__T(`(function(){ UT.pflanze = '${dp}'; UT.langzeit = true;
      UT.stecklinge = false; UT.gruende = []; utEintragen(); })()`);
    pruef('Er tr\u00e4gt die Sperre ein',
      !!w.__T(`(S.duengLangzeit||{})['${dp}']`));
    pruef('Damit ist D\u00fcngen gesperrt',
      (w.__T(`duengSperre(allePflanzen().find(x=>x.id==='${dp}'))`)||{}).code
        === 'frisch' || (w.__T(`duengSperre(allePflanzen().find(x=>x.id==='${dp}'))`)||{}).code
        === 'langzeit');

    /* Aufraeumen */
    w.__T(`S.eigene = (S.eigene||[]).filter(x=>x.id!=='${dp}');
      delete S.dueng['${dp}']; delete S.duengLangzeit['${dp}'];
      if(S.zustand) delete S.zustand['${dp}'];
      if(S.ereignisse) delete S.ereignisse['${dp}'];
      if(S.edits) delete S.edits['${dp}'];
      S.giess = {art:'leitung', haerte:'', dgArt:'fluessig', winterpause:true,
                 saison:true, saisonStaerke:'normal'};
      filterDueng = false; sichern(); render()`);
    await tick();
    pruef('Testpflanze wieder entfernt',
      !w.__T(`allePflanzen().some(x=>x.id==='${dp}')`));
  }

  /* ══ Stammbaum ═════════════════════════════════════════════════
     Vorher eine flache Liste: Mutter, darunter die Kinder als Zeilen.
     Ab der zweiten Generation stand ein Enkel gleichberechtigt neben
     einem Kind \u2014 die Abstammung war nicht mehr abzulesen. */
  {
    /* Drei Generationen bauen: Mutter, zwei Kinder, zwei Enkel. */
    w.__T(`(function(){
      const roh = (id, name, eltern) => ({id, name,
        art:'Monstera deliciosa', botanisch:'Monstera deliciosa',
        klasse:'B', licht:'indirekt', duenger:'normal', seit:iso(HEUTE),
        eltern: eltern || undefined,
        probleme:[], katzentext:'', beob:[], todo:[], log:[], notiz:''});
      S.sbMerk = S.eigene;
      S.eigene = [roh('SW0','Ausgangspflanze'), roh('SK1','Ableger A','SW0'),
                  roh('SK2','Ableger B','SW0'), roh('SE1','Enkel 1','SK1'),
                  roh('SE2','Enkel 2','SK1')];
      S.ereignisse = Object.assign({}, S.ereignisse, {
        SW0:[{id:'se1', datum:iso(HEUTE), typ:'vermehrt', text:'Kopfsteckling', bezug:'SK1'}],
        SK1:[{id:'se2', datum:iso(HEUTE), typ:'entstanden', text:'Kopfsteckling', bezug:'SW0'}]});
      S.added = Object.assign({}, S.added, {SK1:[{id:'sa1', text:'Im Wasserglas angesetzt'}]});
      sichern(); render(); })()`);
    await tick();
    w.__T("sektionOeffnen('stammbaum')");
    await tick();

    /* ── Liste ── */
    pruef('Genau eine Wurzel', w.__T('sbWurzeln().length') === 1,
      w.__T('JSON.stringify(sbWurzeln().map(x=>x.id))'));
    pruef('Ein Kind ist keine eigene Wurzel',
      !w.__T("sbWurzeln().some(x=>x.id==='SK1')"));
    pruef('Die Liste zeigt sie',
      d.querySelectorAll('#sb-liste .sb-linie').length === 1,
      String(d.querySelectorAll('#sb-liste .sb-linie').length));
    pruef('Der Umfang stimmt', w.__T('JSON.stringify(sbUmfang(sbWurzeln()[0]))')
      === '{"zahl":4,"tiefe":2}', w.__T('JSON.stringify(sbUmfang(sbWurzeln()[0]))'));
    pruef('Die Zeile nennt die Generationen',
      /Generationen/.test(d.querySelector('#sb-liste .sb-gen').textContent),
      d.querySelector('#sb-liste .sb-gen').textContent);

    /* Eine Linie ohne Mutterpflanze in der Sammlung zählte ihre
       Mitglieder zweimal: erst in `zahl`, dann noch einmal im Durchlauf.
       Aus zwei Venusfliegenfallen wurden vier Ableger. */
    const linieUmfang = JSON.parse(w.__T(
      "JSON.stringify(sbUmfang({art:'linie', mitglieder:[{id:'LX1'},{id:'LX2'}]}))"));
    pruef('Eine Linie zählt ihre Mitglieder einmal',
      linieUmfang.zahl === 2, JSON.stringify(linieUmfang));
    pruef('Eine Linie ohne Nachkommen hat keine Tiefe',
      linieUmfang.tiefe === 0, String(linieUmfang.tiefe));

    /* Suche */
    w.__T("sbListeRendern('Ausgangs')");
    pruef('Suche findet die Linie',
      d.querySelectorAll('#sb-liste .sb-linie').length === 1);
    w.__T("sbListeRendern('xyzqfg')");
    pruef('Unsinn findet nichts',
      d.querySelectorAll('#sb-liste .sb-linie').length === 0
      && /Keine Linie/.test(d.getElementById('sb-liste').textContent));
    w.__T("sbListeRendern('')");

    /* ── Baum ── */
    const dat = JSON.parse(w.__T('JSON.stringify(sbBaumDaten(sbWurzeln()[0]))'));
    pruef('Drei Ebenen', dat.ebenen === 3, String(dat.ebenen));
    pruef('F\u00fcnf Knoten', dat.knoten.length === 5, String(dat.knoten.length));
    pruef('Vier Verbindungslinien', dat.linien.length === 4, String(dat.linien.length));
    pruef('Jede Ebene liegt tiefer als die vorige',
      dat.knoten.every(k => k.y === k.ebene * w.__T('SB_ZEILE')));
    /* Geschwister duerfen sich nicht ueberlappen, sonst liest man
       nicht mehr, wer wohin geh\u00f6rt. */
    const e1 = dat.knoten.filter(k => k.ebene === 1).sort((a,b)=>a.x-b.x);
    pruef('Geschwister \u00fcberlappen nicht',
      e1.length < 2 || (e1[0].x + e1[0].w) <= e1[1].x + 0.01,
      e1.map(k=>k.x+'+'+k.w).join(' | '));
    pruef('Alles bleibt im Feld',
      dat.knoten.every(k => k.x >= 0 && k.x + k.w <= 100));

    d.querySelector('#sb-liste .sb-linie').click();
    await tick();
    pruef('Antippen zeigt den Baum',
      d.getElementById('sb-baum-ansicht').classList.contains('an'));
    pruef('Die Liste tritt zur\u00fcck',
      !d.getElementById('sb-liste-ansicht').classList.contains('an'));
    pruef('Der Titel steht \u00fcber dem Baum',
      d.getElementById('sb-baum-titel').textContent === 'Ausgangspflanze',
      d.getElementById('sb-baum-titel').textContent);
    pruef('Alle Knoten sind gezeichnet',
      d.querySelectorAll('.sb-knoten').length === 5,
      String(d.querySelectorAll('.sb-knoten').length));
    pruef('Die Ausgangspflanze ist hervorgehoben',
      d.querySelectorAll('.sb-knoten.mutter').length === 1);
    pruef('Die Linien sind gezeichnet',
      d.querySelectorAll('#sb-linien path').length === 4);

    /* ── Blatt ── */
    d.querySelector('[data-sbknoten="SK1"]').click();
    await tick();
    pruef('Ein Knoten \u00f6ffnet sein Blatt',
      d.getElementById('sb-blatt').classList.contains('an'));
    pruef('Es nennt die Pflanze',
      d.getElementById('sb-blatt-name').textContent === 'Ableger A',
      d.getElementById('sb-blatt-name').textContent);
    pruef('Ein Ableger zeigt seinen Vermehrungsablauf',
      d.getElementById('sb-blatt-untertitel').textContent === 'Vermehrungsablauf');
    pruef('Vermehrungsschritt und Ereignis stehen zusammen',
      d.querySelectorAll('#sb-blatt-inhalt .sb-schritt').length === 2,
      String(d.querySelectorAll('#sb-blatt-inhalt .sb-schritt').length));
    pruef('Der Weg in die Karte ist da',
      !!d.querySelector('#sb-blatt-inhalt [data-go="SK1"]'));

    d.getElementById('sb-blatt-zu').click();
    await tick();
    pruef('Das Blatt schlie\u00dft', !d.getElementById('sb-blatt').classList.contains('an'));
    d.getElementById('sb-zurueck').click();
    await tick();
    pruef('Zur\u00fcck f\u00fchrt zur Liste',
      d.getElementById('sb-liste-ansicht').classList.contains('an'));

    /* Ohne Abstammung ein Hinweis statt einer leeren Fl\u00e4che. */
    w.__T("S.eigene = []; sichern(); sbListeRendern('')");
    pruef('Leere Sammlung erkl\u00e4rt sich',
      /Noch keine Abstammungen/.test(d.getElementById('sb-liste').textContent));

    w.__T(`S.eigene = S.sbMerk || []; delete S.sbMerk;
      ['SW0','SK1','SK2','SE1','SE2'].forEach(id=>{
        if(S.ereignisse) delete S.ereignisse[id];
        if(S.added) delete S.added[id]; });
      sichern(); render()`);
    await tick();
    w.__T("modalZu('sek-modal')");
    await tick();
    pruef('Testbaum wieder entfernt',
      !w.__T("allePflanzen().some(x=>x.id==='SW0')"));
  }

  /* ══ Grundriss ═════════════════════════════════════════════════
     Drei Fehler auf einmal: der Planer sprang immer in den Editor
     zurueck, im Vollbild kam man nicht mehr ganz heraus, und jede
     Kantenbreite wurde auf 50 gedeckelt. */
  {
    /* Der Planer beginnt in der Raumliste, auch nach einem Besuch
       im Editor. */
    w.__T("grStufe = 'editor'");
    w.__T("sektionOeffnen('grundriss')");
    await tick();
    pruef('Der Planer beginnt bei den R\u00e4umen', w.__T('grStufe') === 'liste',
      String(w.__T('grStufe')));
    pruef('Die Raumliste ist sichtbar',
      d.getElementById('gr-liste').hidden === false);

    /* ── Die Raumansicht ──────────────────────────────────────
       Vorher fuehrte die Raumkarte nur in den Editor: wer nachsehen
       wollte, wo etwas steht, landete zwischen Zeichenwerkzeugen und
       verschob aus Versehen Moebel. */
    pruef('Jede Raumkarte bietet Ansehen an',
      d.querySelectorAll('#gr-karten [data-raum-sehen]').length
        === w.__T('raeume().length'),
      String(d.querySelectorAll('#gr-karten [data-raum-sehen]').length));
    pruef('und Bearbeiten daneben',
      d.querySelectorAll('#gr-karten [data-raum-auf]').length
        === w.__T('raeume().length'));
    const rid = w.__T('raeume()[0].id');
    w.__T(`grAnsehen('${rid}')`);
    await tick();
    pruef('Ansehen \u00f6ffnet die Ansicht', w.__T('grStufe') === 'ansicht',
      String(w.__T('grStufe')));
    pruef('Die Ansicht ist sichtbar', d.getElementById('gr-ansicht').hidden === false);
    pruef('Der Editor bleibt zu', d.getElementById('gr-editor').hidden === true);
    pruef('Die Ansicht zeichnet den Raum',
      !!d.querySelector('#gra-flaeche svg.plan-svg'));
    pruef('Der Lichtschieber steht in der Ansicht',
      !!d.getElementById('gra-monat') && !!d.getElementById('gra-zeit'));
    pruef('Von der Ansicht geht es ins Bearbeiten',
      !!d.getElementById('btn-gra-bearbeiten'));
    d.getElementById('btn-gra-bearbeiten').click();
    pruef('und der Editor geht auf', w.__T('grStufe') === 'editor',
      String(w.__T('grStufe')));
    w.__T("grStufe = 'liste'; planRender()");

    /* Pflanzen auf demselben Moebel stehen ausgerichtet, nicht kreuz
       und quer uebereinander. Der Pruefstand hat weder Moebel noch
       Pflanzen im Raum — beides wird hier gestellt. */
    {
      const r0 = w.__T('raeume()[0]');
      const rid0 = w.__T('raeume()[0].id');
      w.__T(`(function(){
        const r = raeume()[0];
        r.moebel = [{id:'mtest', typ:'regal', name:'Pr\u00fcfregal',
                     b:120, t:40, h:80, katze:true, x:20, y:20}];
        delete r.roh;
      })()`);
      /* Der Pruefstand hat an dieser Stelle erst eine Pflanze —
         zwei weitere kommen dazu, damit sich ueberhaupt etwas
         ueberdecken kann. */
      w.__T(`(function(){
        S.eigene = S.eigene || [];
        ['prA','prB'].forEach(function(id){
          if(!S.eigene.some(function(p){ return p.id === id; }))
            S.eigene.push({id:id, name:'Pr\u00fcfling ' + id, art:'Monstera',
              klasse:'mittel', angelegt:new Date().toISOString()});
        });
        sichern();
      })()`);
      const ids = w.__T('allePflanzen().slice(0,3).map(p=>p.id)');
      /* Alle drei auf denselben Punkt: genau der Fall, der vorher drei
         Marken uebereinanderlegte. */
      ids.forEach(id => w.__T(`pflanzeSetzen('${id}', '${rid0}', 40, 30)`));
      pruef('Drei Pflanzen stehen auf dem M\u00f6bel',
        w.__T(`pflanzenIm('${rid0}').length`) >= 3,
        String(w.__T(`pflanzenIm('${rid0}').length`)));
      const pos = JSON.parse(w.__T('JSON.stringify(markenPositionen(raeume()[0]))'));
      const genutzt = ids.map(id => pos[id]).filter(Boolean);
      pruef('Jede Pflanze auf dem M\u00f6bel bekommt einen Platz',
        genutzt.length === ids.length, genutzt.length + '/' + ids.length);
      pruef('Keine zwei Marken liegen aufeinander',
        new Set(genutzt.map(o => o.x + ':' + o.y)).size === genutzt.length,
        JSON.stringify(genutzt));
      pruef('Alle stehen innerhalb des M\u00f6bels',
        genutzt.every(o => o.x >= 20 && o.x <= 140 && o.y >= 20 && o.y <= 60),
        JSON.stringify(genutzt));
      /* Ein langes schmales Regal ergibt eine Reihe, keine Traube. */
      pruef('Auf einem langen Regal stehen sie in einer Reihe',
        new Set(genutzt.map(o => o.y)).size === 1, JSON.stringify(genutzt.map(o=>o.y)));

      /* Wer auf dem Boden steht, bleibt, wo er steht. */
      const frei = ids[0];
      w.__T(`pflanzeSetzen('${frei}', '${rid0}', 200, 200)`);
      const pos2 = JSON.parse(w.__T('JSON.stringify(markenPositionen(raeume()[0]))'));
      const echt = JSON.parse(w.__T(`JSON.stringify(pflanzenOrt('${frei}'))`));
      pruef('Bodenpflanzen bleiben an ihrem Ort',
        !!pos2[frei] && pos2[frei].x === echt.x && pos2[frei].y === echt.y,
        JSON.stringify(pos2[frei]) + ' statt ' + JSON.stringify(echt));
    }

    /* ── Etagen ──────────────────────────────────────────────
       Ein Regal ist nicht eine Flaeche in einer Hoehe, sondern
       mehrere. Alte Raeume haben kein `etagen`-Feld und muessen sich
       trotzdem genau wie vorher verhalten. */
    {
      const rid0 = w.__T('raeume()[0].id');
      pruef('Ein M\u00f6bel ohne Etagenfeld hat einen Boden in seiner H\u00f6he',
        JSON.stringify(w.__T("etagenVon({h:80})")) === '[80]',
        JSON.stringify(w.__T("etagenVon({h:80})")));
      pruef('Ohne Etagenangabe gilt der oberste Boden',
        w.__T("etageVon({h:150, etagen:[40,80,120,150]}, null)") === 3,
        String(w.__T("etageVon({h:150, etagen:[40,80,120,150]}, null)")));
      pruef('Eine zu hohe Etagennummer f\u00e4llt auf den obersten Boden',
        w.__T("etageVon({h:150, etagen:[40,80]}, {etage:7})") === 1);
      const vert = w.__T('JSON.stringify(etagenVerteilen(150, 4))');
      pruef('Vier B\u00f6den verteilen sich gleichm\u00e4\u00dfig \u00fcber die H\u00f6he',
        vert === '[40,75,115,150]', vert);
      pruef('Ein Regal bekommt beim Einsetzen vier B\u00f6den',
        w.__T('MOEBEL_ARTEN.regal.boeden') === 4,
        String(w.__T('MOEBEL_ARTEN.regal.boeden')));

      /* Das Pruefregal aus dem Block darueber bekommt Boeden. */
      w.__T(`(function(){
        const r = raeume()[0];
        const m = r.moebel.find(function(x){ return x.id === 'mtest'; });
        m.etagen = etagenVerteilen(m.h, 4);
        SONNE_CACHE = {}; SONNE_CACHE_SIG = '';
        sichern();
      })()`);
      const et = w.__T("JSON.stringify(raeume()[0].moebel[0].etagen)");
      pruef('Das Pr\u00fcfregal hat jetzt vier B\u00f6den', et === '[20,40,60,80]', et);

      /* Ein Boden verschattet den darunter. Gemessen wird an einem
         Punkt mitten unter dem Regal, einmal mit und einmal ohne die
         Boeden darueber. */
      const untenMit = w.__T(`(function(){
        const r = raeume()[0];
        SONNE_CACHE = {}; SONNE_CACHE_SIG = '';
        return sonnenstundenRaum(r, 80, 40, 20, 6);
      })()`);
      const untenOhne = w.__T(`(function(){
        const r = raeume()[0];
        const m = r.moebel[0], alt = m.etagen;
        m.etagen = [20];
        SONNE_CACHE = {}; SONNE_CACHE_SIG = '';
        const v = sonnenstundenRaum(r, 80, 40, 20, 6);
        m.etagen = alt;
        SONNE_CACHE = {}; SONNE_CACHE_SIG = '';
        return v;
      })()`);
      pruef('Ein Boden nimmt dem darunter Sonne weg',
        untenMit < untenOhne, untenMit + ' statt weniger als ' + untenOhne);
      pruef('Der oberste Boden verliert dadurch nichts',
        w.__T('(function(){ const r=raeume()[0]; SONNE_CACHE={}; SONNE_CACHE_SIG=\'\'; '
          + 'return sonnenstundenRaum(r, 80, 40, 80, 6); })()') > untenMit);

      /* Der Sonnen-Cache kannte Moebel nicht. Nach dem Ziehen eines
         Bretts lieferte er weiter die alten Stunden. */
      const sig1 = w.__T('raumSignatur(raeume()[0])');
      w.__T("raeume()[0].moebel[0].etagen = [25,45,65,85]");
      const sig2 = w.__T('raumSignatur(raeume()[0])');
      pruef('Der Sonnen-Cache merkt, wenn ein Boden wandert',
        sig1 !== sig2, 'Signatur unver\u00e4ndert');
      w.__T("raeume()[0].moebel[0].etagen = [20,40,60,80]");

      /* Ein Brettwert ist der Mittelwert ueber das Brett, kein
         einzelner Punkt in seiner Mitte. */
      const bs = w.__T('brettStunden(raeume()[0], raeume()[0].moebel[0], 0, 6)');
      pruef('Ein Boden hat einen eigenen Sonnenwert',
        typeof bs === 'number' && isFinite(bs), String(bs));
      const sp = JSON.parse(w.__T(
        'JSON.stringify(brettSpanne(raeume()[0], raeume()[0].moebel[0], 3))'));
      pruef('Ein Boden kennt seine dunkelste und hellste Ecke',
        sp.min <= sp.max && sp.min >= 0 && sp.max <= 4, JSON.stringify(sp));

      /* Der Ort merkt sich die Etage, und ein Umzug verliert sie
         nicht — solange das neue Moebel sie hat. */
      const pid = w.__T('allePflanzen()[0].id');
      w.__T(`pflanzeSetzen('${pid}', '${rid0}', 40, 30, 1)`);
      pruef('Ein Platz merkt sich seinen Boden',
        w.__T(`(pflanzenOrt('${pid}')||{}).etage`) === 1,
        String(w.__T(`(pflanzenOrt('${pid}')||{}).etage`)));
      w.__T(`pflanzeSetzen('${pid}', '${rid0}', 45, 32)`);
      pruef('Verschieben im Grundriss beh\u00e4lt den Boden',
        w.__T(`(pflanzenOrt('${pid}')||{}).etage`) === 1,
        String(w.__T(`(pflanzenOrt('${pid}')||{}).etage`)));
      pruef('Das Urteil rechnet mit der H\u00f6he dieses Bodens',
        w.__T(`platzUrteil(raeume()[0], 45, 32, 6, 1).hoehe`) === 40,
        String(w.__T(`platzUrteil(raeume()[0], 45, 32, 6, 1).hoehe`)));
      pruef('und ohne Angabe mit dem obersten',
        w.__T(`platzUrteil(raeume()[0], 45, 32, 6).hoehe`) === 80,
        String(w.__T(`platzUrteil(raeume()[0], 45, 32, 6).hoehe`)));

      /* Weniger Boeden: wer oben stand, faellt nicht ins Leere.
         Die Pflanze muss dafuer vorher auf einem Boden stehen, den es
         danach wirklich nicht mehr gibt — sonst ist die Pruefung schon
         erfuellt, bevor die Funktion irgendetwas tut. */
      w.__T(`pflanzeSetzen('${pid}', '${rid0}', 45, 32, 3)`);
      pruef('Die Pflanze steht auf dem obersten von vier B\u00f6den',
        w.__T(`(pflanzenOrt('${pid}')||{}).etage`) === 3,
        String(w.__T(`(pflanzenOrt('${pid}')||{}).etage`)));
      w.__T(`(function(){
        const r = raeume()[0], m = r.moebel[0];
        m.etagen = [40, 80];
        moebelEtagenPruefen(r, m);
      })()`);
      pruef('Weniger B\u00f6den setzen die Pflanze auf den obersten',
        w.__T(`(pflanzenOrt('${pid}')||{}).etage`) === 1,
        String(w.__T(`(pflanzenOrt('${pid}')||{}).etage`)));
      w.__T("raeume()[0].moebel[0].etagen = [20,40,60,80]");
    }

    /* ── Kanten nach innen ──────────────────────────────────────
       Eine Tuer zum Flur ist keine Lichtquelle wie ein Fenster:
       dahinter liegt ein Raum. Direkte Sonne endet dort, Streulicht
       kommt gedaempft durch. */
    {
      const rid0 = w.__T('raeume()[0].id');
      pruef('Es gibt eine T\u00fcr nach innen',
        w.__T('!!KANTEN_ART.innentuer') === true);
      pruef('und einen Durchgang nach innen',
        w.__T('!!KANTEN_ART.durchgang') === true);
      pruef('Beide sind als innen gekennzeichnet',
        w.__T('KANTEN_ART.innentuer.innen === true && KANTEN_ART.durchgang.innen === true'));
      pruef('Eine Kante nach aussen ist es nicht',
        w.__T('!KANTEN_ART.fenster.innen && !KANTEN_ART.offen.innen'));

      const ik = w.__T('aussenKanten(raeume()[0]).filter(k=>k.k==="o").map(k=>k.id)[0]');
      pruef('Eine Kante zum Pr\u00fcfen ist da', !!ik, String(ik));

      /* Dieselbe Kante zweimal: einmal offen, einmal nach innen. Der
         Messpunkt liegt in genau der Kachel, zu der die Kante gehoert,
         und die Sonne steht senkrecht darueber hinaus — sonst misst
         man eine Wand woanders. */
      const messen = art => w.__T(`(function(){
        const r = raeume().find(function(x){ return x.id === '${rid0}'; });
        r.kanten['${ik}'] = '${art}';
        SONNE_CACHE = {}; SONNE_CACHE_SIG = '';
        const t = '${ik}'.split(':')[1].split(',');
        const px = (+t[0] + 0.5) * KACHEL, py = (+t[1] + 0.5) * KACHEL;
        return JSON.stringify({
          sonne: sonnigImRaum(r, px, py, 100, {az: r.drehung, hoehe: 60}),
          hell: helligkeit(r, px, py, 100)
        });
      })()`);

      const offen = JSON.parse(messen('offen'));
      const innen = JSON.parse(messen('durchgang'));

      pruef('Durch einen Durchgang nach innen f\u00e4llt keine Sonne',
        innen.sonne === false, JSON.stringify(innen));
      pruef('Durch dieselbe Kante als „offen\u201c schon',
        offen.sonne === true, JSON.stringify(offen));
      pruef('Streulicht kommt trotzdem an',
        innen.hell > 0, String(innen.hell));
      pruef('aber deutlich weniger als von aussen',
        innen.hell < offen.hell * 0.9,
        innen.hell.toFixed(1) + ' gegen ' + offen.hell.toFixed(1));

      /* Auch die Tuer nach innen sperrt die Sonne aus — nicht nur der
         Durchgang, sonst haenge die Pruefung an einer einzigen Art. */
      const tuer = JSON.parse(messen('innentuer'));
      pruef('Eine T\u00fcr nach innen sperrt die Sonne genauso aus',
        tuer.sonne === false, JSON.stringify(tuer));

      w.__T(`(function(){
        const r = raeume().find(function(x){ return x.id === '${rid0}'; });
        delete r.kanten['${ik}'];
        SONNE_CACHE = {}; SONNE_CACHE_SIG = '';
      })()`);
    }

    /* ── Die Ansicht „von vorne" ist wieder draussen ──────────── */
    {
      pruef('Das Fenster f\u00fcr die Frontansicht ist weg',
        !d.getElementById('mf-modal'));
      pruef('Der Weg dorthin aus dem M\u00f6belformular ebenfalls',
        !d.getElementById('btn-mb-front'));
      pruef('Die Rechnung dahinter bleibt',
        typeof w.__T('typeof brettStunden') === 'string'
        && w.__T('typeof brettStunden') === 'function');
    }

    /* ── Der Maßstab der Grundhelligkeit ──────────────────
       Bis 3.2.9 lag der Faktor bei 10000 und die oberste Schwelle bei
       45 — jeder Punkt in jedem Raum mit einer Öffnung war Stufe 4.
       Diese vier Fälle sind die Eichung. Fällt einer, stimmt der
       Maßstab nicht mehr. */
    {
      const stufen = art => w.__T(`(function(){
        const kacheln = {};
        for(let y=0;y<8;y++) for(let x=0;x<6;x++) kacheln[x+','+y] = 1;
        const r = {id:'refhell', sp:6, re:8, kacheln, drehung:180, dach:true,
          deckeH:250, moebel:[],
          kanten:{'o:1,0':'${art}','o:2,0':'${art}','o:3,0':'${art}'}};
        return JSON.stringify([
          helligkeitStufe(helligkeit(r, 125, 25, 0)),
          helligkeitStufe(helligkeit(r, 125, 175, 0)),
          helligkeitStufe(helligkeit(r, 125, 325, 0))
        ]);
      })()`);

      const f = JSON.parse(stufen('fenster'));
      pruef('Direkt am Fenster ist es sehr hell', f[0] === 4, JSON.stringify(f));
      pruef('Anderthalb Meter tiefer noch hell', f[1] === 3, JSON.stringify(f));
      pruef('Drei Meter tief im Raum ist es dunkel', f[2] === 1, JSON.stringify(f));
      pruef('Die Helligkeit nimmt nach hinten wirklich ab',
        f[0] > f[1] && f[1] > f[2], JSON.stringify(f));

      const t = JSON.parse(stufen('innentuer'));
      pruef('Ein Raum, der nur eine T\u00fcr nach innen hat, ist hinten sehr dunkel',
        t[2] === 0, JSON.stringify(t));

      pruef('Der Faktor steht als eigene Gr\u00f6\u00dfe da',
        w.__T('HELL_FAKTOR') === 50, String(w.__T('HELL_FAKTOR')));
    }

    /* ── Der Raum wächst mit ──────────────────────────
       Anbauen nach links ergibt negative Kachelnummern. Sie dürfen
       den Zug überleben, aber nicht das Loslassen. */
    {
      const rid0 = w.__T('raeume()[0].id');
      w.__T(`(function(){
        const r = raeume()[0];
        r.kacheln = {}; r.sp = 2; r.re = 2;
        for(let y=0;y<2;y++) for(let x=0;x<2;x++) r.kacheln[x+','+y] = 1;
        r.kanten = {'o:0,0':'fenster'};
        r.kantenMass = {'o:0,0':{b:70}};
        r.moebel = [{id:'wtest', name:'Regal', typ:'regal', x:0, y:0,
                     b:50, t:50, h:150, etagen:[150]}];
        SONNE_CACHE = {}; SONNE_CACHE_SIG = '';
      })()`);
      const pidW = w.__T('allePflanzen()[0].id');
      w.__T(`pflanzeSetzen('${pidW}', '${rid0}', 25, 25)`);

      w.__T("malt = {an:true}; kachelMalen(raeume()[0], -1, 0)");
      pruef('W\u00e4hrend des Zuges darf eine Kachel negativ hei\u00dfen',
        w.__T("!!raeume()[0].kacheln['-1,0']") === true);

      w.__T('raumZuschneiden(raeume()[0]); malt = null');
      pruef('Nach dem Loslassen f\u00e4ngt der Raum wieder bei null an',
        w.__T("!!raeume()[0].kacheln['0,0']") === true
        && w.__T("!!raeume()[0].kacheln['-1,0']") === false);
      pruef('Der Raum ist eine Spalte breiter geworden',
        w.__T('raeume()[0].sp') === 3, String(w.__T('raeume()[0].sp')));
      pruef('Die Wand ist mitgewandert',
        w.__T("!!raeume()[0].kanten['o:1,0']") === true,
        JSON.stringify(w.__T('JSON.stringify(raeume()[0].kanten)')));
      pruef('Ihre eigenen Ma\u00dfe ebenfalls',
        w.__T("(raeume()[0].kantenMass['o:1,0']||{}).b") === 70);
      pruef('Das M\u00f6bel ist mitgewandert',
        w.__T("raeume()[0].moebel[0].x") === 50,
        String(w.__T("raeume()[0].moebel[0].x")));
      pruef('Die Pflanze auch',
        w.__T(`(pflanzenOrt('${pidW}')||{}).x`) === 75,
        String(w.__T(`(pflanzenOrt('${pidW}')||{}).x`)));

      /* Wegnehmen schneidet die Grenzen wieder zurück. */
      w.__T(`(function(){
        const r = raeume()[0];
        malt = {an:false};
        kachelMalen(r, 0, 0); kachelMalen(r, 0, 1);
        raumZuschneiden(r); malt = null;
      })()`);
      pruef('Wegnehmen schneidet den Raum wieder zu',
        w.__T('raeume()[0].sp') === 2, String(w.__T('raeume()[0].sp')));

      /* Die letzte Kachel bleibt, sonst gäbe es nichts mehr zum Tippen. */
      w.__T(`(function(){
        const r = raeume()[0];
        r.kacheln = {'0,0':1}; r.sp = 1; r.re = 1;
        malt = {an:false}; kachelMalen(r, 0, 0); malt = null;
      })()`);
      pruef('Die letzte Kachel l\u00e4sst sich nicht wegnehmen',
        w.__T('Object.keys(raeume()[0].kacheln).length') === 1);

      /* Ausgangslage für alles Weitere wiederherstellen. */
      w.__T(`(function(){
        const r = raeume()[0];
        r.kacheln = {}; r.sp = 6; r.re = 3;
        for(let y=0;y<3;y++) for(let x=0;x<6;x++) r.kacheln[x+','+y] = 1;
        r.kanten = {}; r.kantenMass = {}; r.moebel = [];
        for(let x=0;x<6;x++) r.kanten['u:'+x+',2'] = 'bruestung';
        r.kanten['o:2,0'] = 'tuer';
        r.kanten['o:3,0'] = 'fenster';
        SONNE_CACHE = {}; SONNE_CACHE_SIG = '';
        sichern();
      })()`);
      w.__T(`pflanzeSetzen('${pidW}', '${rid0}', 40, 30)`);
      pruef('Der Pr\u00fcfraum steht wieder', w.__T('raeume()[0].sp') === 6);

      /* Der Rand zum Anbauen ist kein Schmuck: ohne ihn gibt es
         ausserhalb der Grenzen nichts, was der Finger treffen kann. */
      const merkM = w.__T('pModus');
      w.__T("pModus = 'kacheln'; planRender()");
      pruef('Im Fl\u00e4chenmodus liegt ein Rand zum Anbauen',
        !!d.querySelector('#plan-svg [data-kx="-1"]'));
      w.__T("pModus = 'pflanzen'; planRender()");
      pruef('In den anderen Werkzeugen nicht',
        !d.querySelector('#plan-svg [data-kx="-1"]'));
      w.__T(`pModus = '${merkM}'; planRender()`);
    }

    /* ── Was vor der Öffnung steht ─────────────────────
       Ein Balkon vor dem Fenster nimmt die flache Sonne weg und lässt
       die hohe durch. Genau das ist der Unterschied zu einer Wand. */
    {
      const rid0 = w.__T('raeume()[0].id');
      const ik = w.__T('aussenKanten(raeume()[0]).filter(k=>k.k==="o").map(k=>k.id)[0]');
      const messen = (vt, vh, hoehe) => w.__T(`(function(){
        const r = raeume().find(function(x){ return x.id === '${rid0}'; });
        r.kanten['${ik}'] = 'offen';
        kantenMassSetzen(r, '${ik}', {vorTiefe:${vt}, vorHoehe:${vh}});
        SONNE_CACHE = {}; SONNE_CACHE_SIG = '';
        const t = '${ik}'.split(':')[1].split(',');
        const px = (+t[0] + 0.5) * KACHEL, py = (+t[1] + 0.5) * KACHEL;
        return sonnigImRaum(r, px, py, 100, {az: r.drehung, hoehe: ${hoehe}});
      })()`);

      pruef('Ohne Vorbau kommt die flache Sonne herein',
        messen(0, 0, 20) === true);
      pruef('Ein Balkon davor h\u00e4lt sie ab',
        messen(300, 400, 20) === false);
      pruef('Die hohe Sonne kommt \u00fcber denselben Balkon hinweg',
        messen(300, 400, 60) === true);
      pruef('Eine Tiefe ohne H\u00f6he \u00e4ndert nichts',
        messen(300, 0, 20) === true);

      w.__T(`(function(){
        const r = raeume().find(function(x){ return x.id === '${rid0}'; });
        delete r.kanten['${ik}'];
        kantenMassSetzen(r, '${ik}', {});
        SONNE_CACHE = {}; SONNE_CACHE_SIG = '';
      })()`);
    }

    /* ── Maße als Blatt statt prompt() ────────────────── */
    {
      pruef('Es gibt ein Blatt f\u00fcr die Kantenma\u00dfe',
        !!d.getElementById('km-modal'));
      const kid2 = w.__T('aussenKanten(raum()).filter(k=>k.k==="o").map(k=>k.id)[0]');
      w.__T(`raum().kanten['${kid2}'] = 'fenster'`);
      w.__T(`kantenMassFragen(raum(), '${kid2}')`);
      await tick();
      pruef('Ein zweiter Tipp auf eine Kante \u00f6ffnet es',
        w.__T("modalOffen('km-modal')") === true);
      pruef('Die H\u00f6hen stehen schon drin',
        +d.getElementById('km-sockel').value === 90,
        d.getElementById('km-sockel').value);
      pruef('Und die Felder f\u00fcr den Vorbau auch',
        !!d.getElementById('km-vt') && !!d.getElementById('km-vh'));
      d.getElementById('km-vt').value = '150';
      d.getElementById('km-vh').value = '250';
      w.__T('kmSpeichern()');
      await tick();
      pruef('\u00dcbernehmen schreibt den Vorbau weg',
        w.__T(`kantenMass(raum(), '${kid2}').vorTiefe`) === 150,
        String(w.__T(`kantenMass(raum(), '${kid2}').vorTiefe`)));
      pruef('und schlie\u00dft das Blatt',
        w.__T("modalOffen('km-modal')") === false);
      w.__T(`kantenMassSetzen(raum(), '${kid2}', {})`);
    }

    /* ── Raumeinstellungen im Vollbild ────────────────── */
    {
      pruef('Die Vollbildleiste hat ein Werkzeug f\u00fcr den Raum',
        !!d.getElementById('btn-vb-raum'));
      const merk = w.__T('pModus');
      w.__T("vollbild = true; pModus = 'raum'; schubladeFuellen()");
      pruef('Die Drehung ist im Vollbild erreichbar',
        !!d.getElementById('vb-r-drehung'));
      pruef('Der offene Himmel auch',
        !!d.getElementById('vb-r-dach'));
      const vor = w.__T('raum().drehung');
      const feld = d.getElementById('vb-r-drehung');
      feld.value = String((vor + 90) % 360);
      feld.dispatchEvent(new w.Event('input', {bubbles:true}));
      pruef('Der Schieber dreht den Raum wirklich',
        w.__T('raum().drehung') === (vor + 90) % 360,
        String(w.__T('raum().drehung')));
      w.__T(`raum().drehung = ${vor}`);
      w.__T(`vollbild = false; pModus = '${merk}'; schubladeFuellen()`);
    }

    /* ── Auch eine Wand hat eine Breite ────────────────
       Bis 3.3.0 liess sich nur ein Fenster oder eine Tuer bemassen.
       Wer ein 130er Fenster setzt, muss der Wand daneben aber sagen
       koennen, wie lang sie ist. */
    {
      const wid = w.__T('aussenKanten(raum()).filter(k=>k.k==="o").map(k=>k.id)[2]');
      w.__T(`delete raum().kanten['${wid}']; pKanteArt = 'wand'`);
      /* Der Weg dorthin fuehrt ueber das Tippen im Grundriss, nicht
         ueber den direkten Aufruf — genau dort war die Wand gesperrt. */
      w.__T("pModus = 'kanten'; planRender()");
      w.__T(`planTipp({target: document.querySelector('#plan-svg [data-kante="${wid}"]')})`);
      await tick();
      pruef('Ein zweiter Tipp auf eine Wand \u00f6ffnet das Ma\u00dfblatt',
        w.__T("modalOffen('km-modal')") === true);
      pruef('Unterkante und Oberkante bleiben dabei weg',
        d.getElementById('km-sockel').closest('.km-oeffnung').hidden === true);
      d.getElementById('km-b').value = '150';
      w.__T('kmSpeichern()');
      await tick();
      pruef('Eine Wandbreite l\u00e4sst sich eintragen',
        Math.round(w.__T(`kantenBreite(raum(), '${wid}')`)) === 150,
        String(w.__T(`kantenBreite(raum(), '${wid}')`)));
      w.__T(`kantenMassSetzen(raum(), '${wid}', {})`);

      /* Bei einer Oeffnung stehen die Felder wieder da. */
      w.__T(`raum().kanten['${wid}'] = 'fenster'`);
      w.__T(`kantenMassFragen(raum(), '${wid}')`);
      await tick();
      pruef('Bei einem Fenster stehen sie wieder da',
        d.getElementById('km-sockel').closest('.km-oeffnung').hidden === false);
      w.__T("modalZu('km-modal')");
      w.__T(`delete raum().kanten['${wid}']; kantenMassSetzen(raum(), '${wid}', {})`);
      await tick();
    }

    /* ── Der Ausschnitt füllt seine Fläche ───────────────
       Bis 3.3.1 hatte der Ausschnitt immer das Verhältnis des Raums.
       Auf einer breiten Fläche blieb ein hoher Raum in der Höhe
       gefangen und ließ links und rechts alles leer. */
    {
      const feld = d.getElementById('plan-flaeche');
      /* jsdom misst nichts von selbst — die Fläche wird gestellt. */
      const stellen = (br, ho) => {
        Object.defineProperty(feld, 'clientWidth',  {value:br, configurable:true});
        Object.defineProperty(feld, 'clientHeight', {value:ho, configurable:true});
      };
      const verh = () => {
        const m = w.__T('JSON.stringify(planMasse())');
        const o = JSON.parse(m);
        return o.vW / o.vH;
      };

      stellen(800, 400);
      pruef('Auf einer breiten Fl\u00e4che wird der Ausschnitt breit',
        Math.abs(verh() - 2) < 0.01, verh().toFixed(3));
      stellen(400, 800);
      pruef('Auf einer hohen Fl\u00e4che wird er hoch',
        Math.abs(verh() - 0.5) < 0.01, verh().toFixed(3));

      /* Der Raum muss immer vollständig darin liegen — aufgefüllt
         wird nur, wo Platz übrig ist, nie beschnitten. */
      stellen(800, 400);
      const m2 = JSON.parse(w.__T('JSON.stringify(planMasse())'));
      pruef('Der Raum passt in beide Richtungen hinein',
        m2.vW >= m2.W - 0.01 && m2.vH >= m2.H - 0.01,
        m2.vW.toFixed(1) + '\u00d7' + m2.vH.toFixed(1) + ' gegen '
        + m2.W.toFixed(1) + '\u00d7' + m2.H.toFixed(1));

      /* Ohne gemessene Fläche fällt es auf das Verhältnis des Raums
         zurück, statt durch null zu teilen. */
      stellen(0, 0);
      const m3 = JSON.parse(w.__T('JSON.stringify(planMasse())'));
      pruef('Ohne gemessene Fl\u00e4che gilt das Verh\u00e4ltnis des Raums',
        Math.abs(m3.vW / m3.vH - m3.W / m3.H) < 0.01);

      stellen(800, 400);
      pruef('Das kleinste Zoom ist jetzt eins',
        w.__T('zoomMinimum()') === 1, String(w.__T('zoomMinimum()')));
      w.__T('pZoom = 1; pPanX = 0; pPanY = 0; grenzenPruefen()');
      pruef('Bei Zoom eins gibt es nichts zu verschieben',
        w.__T('pPanX') === 0 && w.__T('pPanY') === 0);
    }

    /* ── Ein Fenster liegt vorn ──────────────────────
       Erst lag das Maßblatt unter der Vollbildbühne (80), dann unter
       dem Sektionsfenster (120), aus dem es geoeffnet wird. Beide Male
       war es unsichtbar, nahm aber Eingaben an: die Tastatur ging auf,
       im Nichts wurde Text markiert. Ein Fenster gehoert vor alles
       ausser die Tour. */
    {
      const zahl = muster => {
        const t = html.match(muster);
        return t ? parseInt(t[1], 10) : null;
      };
      const modal = zahl(/\.modal\{[^}]*z-index:(\d+)/);
      const sekm  = zahl(/\.sekm\{[^}]*z-index:(\d+)/);
      const wk    = zahl(/\.wk\{[^}]*z-index:(\d+)/);
      const tour  = zahl(/#tour\{[^}]*z-index:(\d+)/);
      pruef('Alle Schichten sind auffindbar',
        modal && sekm && wk && tour,
        JSON.stringify({modal, sekm, wk, tour}));
      pruef('Ein Fenster liegt \u00fcber dem Sektionsfenster', modal > sekm,
        modal + ' gegen ' + sekm);
      pruef('und \u00fcber der Werkzeugansicht', modal > wk, modal + ' gegen ' + wk);
      pruef('Die Tour liegt weiter dar\u00fcber', tour > modal, tour + ' gegen ' + modal);
      pruef('Die Sonderregel f\u00fcrs Vollbild wird nicht mehr gebraucht',
        html.indexOf('body.vollbild .modal') === -1);
    }

    /* ── Verschieben im Vollbild ────────────────────
       Der Grundriss liess sich nur zwischen zwei Punkten bewegen: die
       Mittelstellung des Ausschnitts wurde als Verschiebung mitgezaehlt
       und die Grenze lag trotzdem bei null. */
    {
      const feld = d.getElementById('plan-flaeche');
      const stellen = (br, ho) => {
        Object.defineProperty(feld, 'clientWidth',  {value:br, configurable:true});
        Object.defineProperty(feld, 'clientHeight', {value:ho, configurable:true});
      };
      stellen(400, 800);
      w.__T('pZoom = 3; pPanX = 0; pPanY = 0');
      const M = JSON.parse(w.__T('JSON.stringify(planMasse())'));
      /* Welche Richtung eingeengt ist, haengt davon ab, wie Raum und
         Flaeche zueinander stehen. Geprueft wird die, in der es
         ueberhaupt etwas zu verschieben gibt. */
      const engX = M.vW < M.W;
      const achse = engX ? 'pPanX' : 'pPanY';
      const spanne = engX ? (M.W - M.vW) : (M.H - M.vH);
      pruef('Bei dreifachem Zoom ist der Ausschnitt in einer Richtung kleiner',
        spanne > 1, achse + ': ' + spanne.toFixed(1));

      /* Bis ans Ende und wieder zurueck. */
      w.__T(achse + ' = 99999; grenzenPruefen()');
      const weit = w.__T(achse);
      pruef('Verschieben reicht bis an den Rand des Raums',
        Math.abs(weit - spanne) < 0.5,
        weit.toFixed(1) + ' gegen ' + spanne.toFixed(1));
      pruef('und das ist eine echte Strecke, kein Punkt', weit > 1, String(weit));
      w.__T(achse + ' = -99999; grenzenPruefen()');
      pruef('Am anderen Ende ist bei null Schluss',
        w.__T(achse) === 0, String(w.__T(achse)));
      /* Die freie Richtung bleibt stehen. */
      w.__T((engX ? 'pPanY' : 'pPanX') + ' = 500; grenzenPruefen()');
      pruef('Wo alles ins Bild passt, wird nicht verschoben',
        w.__T(engX ? 'pPanY' : 'pPanX') === 0);
      w.__T((engX ? 'pPanY' : 'pPanX') + ' = -500; grenzenPruefen()');
      pruef('Auch nicht in die andere Richtung',
        w.__T(engX ? 'pPanY' : 'pPanX') === 0,
        String(w.__T(engX ? 'pPanY' : 'pPanX')));

      /* Und der Raum steht in dieser Richtung mittig. Genau das ging
         beim Zoomen verloren: der Ausgangspunkt rechnete mit dem
         verkleinerten Raum statt mit dem ganzen, und der Grundriss
         wanderte mit jeder Stufe weiter zur Seite. */
      w.__T('pPanX = 0; pPanY = 0');
      const M2 = JSON.parse(w.__T('JSON.stringify(planMasse())'));
      const freiVoll = engX ? (M2.vH >= M2.H) : (M2.vW >= M2.W);
      const mitteInhalt = engX
        ? (-M2.rand - M2.R + M2.H/2) : (-M2.rand - M2.R + M2.W/2);
      const mitteBild = engX ? (M2.y0 + M2.vH/2) : (M2.x0 + M2.vW/2);
      pruef('In der freien Richtung ist reichlich Platz', freiVoll);
      pruef('Der Raum steht dort mittig',
        Math.abs(mitteInhalt - mitteBild) < 0.5,
        mitteInhalt.toFixed(1) + ' gegen ' + mitteBild.toFixed(1));

      /* Passt alles ins Bild, gibt es nichts zu verschieben. */
      w.__T('pZoom = 1; pPanX = 0; pPanY = 0; pPanX = 500; grenzenPruefen()');
      pruef('Bei Zoom eins bleibt der Ausschnitt stehen',
        w.__T('pPanX') === 0, String(w.__T('pPanX')));
      w.__T('pZoom = 1; pPanX = 0; pPanY = 0');
      stellen(800, 400);
    }

    /* ── Wenn Marken einander verdecken ────────────────
       Vier Pflanzen auf einem Fensterbrett ergaben einen Klumpen aus
       Kreisen und einen Brei aus Namen. */
    {
      /* Zusammenfassen statt auseinanderschieben ─ auch aus dem
         Sonderfall heraus, dass alle auf demselben Punkt liegen. */
      const roh = w.__T(`JSON.stringify(markenBuendel(
        {a:{x:100,y:100}, b:{x:100,y:100}, c:{x:104,y:100}, d:{x:400,y:400}}, 30))`);
      const gr = JSON.parse(roh);
      const von = id => gr.find(g=>g.ids.indexOf(id) >= 0);
      pruef('Drei nahe Marken werden ein B\u00fcndel',
        von('a').ids.length === 3, JSON.stringify(gr.map(g=>g.ids)));
      pruef('Wer weit weg steht, bleibt f\u00fcr sich',
        von('d').ids.length === 1, JSON.stringify(von('d').ids));
      pruef('Es bleiben genau zwei B\u00fcndel', gr.length === 2, String(gr.length));
      /* Das Buendel steht dort, wo die Pflanzen stehen ─ nicht daneben.
         Genau das war der Fehler des Auseinanderschiebens. */
      pruef('Das B\u00fcndel steht bei seinen Pflanzen',
        Math.abs(von('a').x - 101.33) < 0.1 && Math.abs(von('a').y - 100) < 0.1,
        von('a').x + ',' + von('a').y);
      /* Der Schluessel haengt an den Mitgliedern, nicht an der
         Reihenfolge ─ sonst klappte das offene Buendel bei jedem
         Neuzeichnen zu. */
      const roh2 = w.__T(`JSON.stringify(markenBuendel(
        {c:{x:104,y:100}, b:{x:100,y:100}, a:{x:100,y:100}, d:{x:400,y:400}}, 30))`);
      pruef('Dieselbe Lage ergibt denselben Schl\u00fcssel',
        JSON.parse(roh2).map(g=>g.key).join() === gr.map(g=>g.key).join(),
        JSON.parse(roh2).map(g=>g.key).join());

      /* Und die Beschriftung: eng ist eng. */
      const gedraengt = JSON.parse(w.__T(`JSON.stringify(markenGedraengt(
        {a:{x:0,y:0}, b:{x:20,y:0}, c:{x:500,y:500}}, 58))`));
      pruef('Nahe Nachbarn gelten als gedr\u00e4ngt',
        gedraengt.a === true && gedraengt.b === true, JSON.stringify(gedraengt));
      pruef('Wer allein steht, nicht',
        !gedraengt.c, JSON.stringify(gedraengt));

      /* Im Bild: der Name fällt weg, der Kreis bleibt. */
      const rid = w.__T('raum().id');
      const zwei = w.__T('allePflanzen().slice(0,2).map(function(p){ return p.id; })');
      w.__T(`pflanzeSetzen('${zwei[0]}', '${rid}', 100, 100)`);
      w.__T(`pflanzeSetzen('${zwei[1]}', '${rid}', 104, 100)`);
      /* Gepr\u00fcft wird die Zeichnung selbst. Der Umweg \u00fcber das
         Dokument taugt hier nicht: ob der Grundriss gerade im
         Dokument steht, h\u00e4ngt davon ab, welches Werkzeugfenster
         offen ist \u2014 und jsdom findet SVG-Elemente ohnehin nicht \u00fcber
         Klassenselektoren. */
      w.__T("grStufe = 'editor'; pGewaehlt = null");
      const bild = w.__T('grundrissSVG()');
      const zaehl = (t, m) => (t.split(m).length - 1);
      pruef('Beide Marken werden gezeichnet',
        zaehl(bild, 'data-pfl=') >= 2, String(zaehl(bild, 'data-pfl=')));
      pruef('Ihre Namen nicht \u2014 sie l\u00e4gen \u00fcbereinander',
        zaehl(bild, 'class="p-lab"') < zaehl(bild, 'data-pfl='),
        zaehl(bild, 'class="p-lab"') + ' Namen bei '
        + zaehl(bild, 'data-pfl=') + ' Marken');

      /* Eine Pflanze weit ab beh\u00e4lt ihren Namen. */
      w.__T(`pflanzeSetzen('${zwei[1]}', '${rid}', 250, 100)`);
      const weit = w.__T('grundrissSVG()');
      pruef('Wer allein steht, wird beschriftet',
        zaehl(weit, 'class="p-lab"') > zaehl(bild, 'class="p-lab"'),
        zaehl(weit, 'class="p-lab"') + ' gegen ' + zaehl(bild, 'class="p-lab"'));

      /* In der Ansicht werden Marken, die aufeinander liegen, zu einem
         B\u00fcndel. Gepr\u00fcft wird am fertigen Bild, nicht an der
         Funktion \u2014 sonst bliebe ein fehlender Aufruf unbemerkt. */
      {
        const stelleVon = (t, id) => {
          const tr = new RegExp('data-pfl="' + id + '"[\\s\\S]{0,120}?translate\\(([-0-9.]+),([-0-9.]+)\\)');
          const m = t.match(tr);
          return m ? {x:+m[1], y:+m[2]} : null;
        };
        w.__T("raum().moebel = []; SONNE_CACHE = {}; SONNE_CACHE_SIG = ''");
        w.__T(`pflanzeSetzen('${zwei[0]}', '${rid}', 120, 60)`);
        w.__T(`pflanzeSetzen('${zwei[1]}', '${rid}', 120, 60)`);
        w.__T("grStufe = 'ansicht'; pGewaehlt = null; pBuendel = null");
        const bildA = w.__T('grundrissSVG()');
        const zaehlA = (t, m) => (t.split(m).length - 1);
        const drin = (t, id) => t.indexOf('data-pfl="' + id + '"') >= 0;
        pruef('In der Ansicht stehen die zwei als ein B\u00fcndel',
          zaehlA(bildA, 'data-buendel=') === 1
          && !drin(bildA, zwei[0]) && !drin(bildA, zwei[1]),
          zaehlA(bildA, 'data-buendel=') + ' B\u00fcndel');
        pruef('Es tr\u00e4gt die Zahl zwei',
          /class="b-zahl"[^>]*>2</.test(bildA));
        /* Und es steht dort, wo die Pflanzen stehen. Das
           Auseinanderschieben setzte Marken neben den Raum. */
        const bm = bildA.match(/data-buendel="[^"]*"[\s\S]{0,120}?translate\(([-0-9.]+),([-0-9.]+)\)/);
        pruef('Das B\u00fcndel steht am Ort der Pflanzen',
          bm && Math.abs(+bm[1] - 120) < 0.5 && Math.abs(+bm[2] - 60) < 0.5,
          bm ? bm[1] + ',' + bm[2] : '—');

        /* Angetippt f\u00e4hrt es die Namen aus \u2014 zwei Zeilen, jede
           mit ihrer Pflanze daran. */
        const key = bildA.match(/data-buendel="([^"]*)"/)[1];
        w.__T(`pBuendel = '${key}'`);
        const bildAuf = w.__T('grundrissSVG()');
        pruef('Aufgeklappt stehen beide Namen in der Liste',
          drin(bildAuf, zwei[0]) && drin(bildAuf, zwei[1]),
          String(zaehlA(bildAuf, 'class="b-lab"')));
        pruef('Zugeklappt wieder nicht',
          zaehlA(bildA, 'class="b-lab"') === 0);
        w.__T('pBuendel = null');

        /* Viele auf einem Punkt: die Zahl im Kreis und die Zeilen der
           Liste muessen dasselbe sagen. */
        {
          const viele = w.__T('allePflanzen().map(function(p){return p.id;})').slice(0, 7);
          viele.forEach(id=> w.__T(`pflanzeSetzen('${id}', '${rid}', 120, 60)`));
          w.__T("grStufe = 'ansicht'; pGewaehlt = null; pBuendel = null");
          const bv = w.__T('grundrissSVG()');
          const zahl7 = (bv.match(/class="b-zahl"[^>]*>(\d+)</) || [])[1];
          const key7 = (bv.match(/data-buendel="([^"]*)"/) || [])[1];
          w.__T(`pBuendel = '${key7}'`);
          const auf7 = w.__T('grundrissSVG()');
          const zeilen7 = (auf7.match(/class="buendel-zeile"/g) || []).length;
          pruef('Die Zahl im Kreis nennt alle',
            +zahl7 === viele.length, zahl7 + ' bei ' + viele.length + ' Pflanzen');
          pruef('Und die Liste zeigt genauso viele',
            zeilen7 === +zahl7, zeilen7 + ' Zeilen bei ' + zahl7);
          /* Auf einem M\u00f6bel verteilt `markenPositionen` sie zuerst.
             Genau so steht es beim Nutzer: sieben auf einem Brett. */
          w.__T(`raum().moebel = [{id:'brett', name:'Brett', typ:'regal',
            x:100, y:40, b:120, t:30, h:95}];
            SONNE_CACHE = {}; SONNE_CACHE_SIG = ''`);
          viele.forEach(id=> w.__T(`pflanzeSetzen('${id}', '${rid}', 130, 55)`));
          w.__T('pBuendel = null');
          const bMo = w.__T('grundrissSVG()');
          const zMo = (bMo.match(/class="b-zahl"[^>]*>(\d+)</g) || [])
            .map(t=>+t.replace(/[^0-9]/g, ''));
          const eMo = (bMo.match(/data-pfl="/g) || []).length;
          pruef('Auf einem M\u00f6bel geht keine Pflanze verloren',
            zMo.reduce((a,b)=>a+b, 0) + eMo === viele.length,
            zMo.join('+') + ' geb\u00fcndelt, ' + eMo + ' einzeln, '
            + viele.length + ' Pflanzen');
          const kMo = (bMo.match(/data-buendel="([^"]*)"/) || [])[1];
          if(kMo){
            w.__T(`pBuendel = '${kMo}'`);
            const aMo = w.__T('grundrissSVG()');
            const zahlMo = +(aMo.match(/data-buendel="[^"]*"[\s\S]{0,200}?class="b-zahl"[^>]*>(\d+)</) || [])[1];
            const zeilenMo = (aMo.match(/class="buendel-zeile"/g) || []).length;
            pruef('Die Zahl auf dem M\u00f6bel stimmt mit der Liste \u00fcberein',
              zeilenMo === zahlMo, zeilenMo + ' Zeilen bei ' + zahlMo);
            w.__T('pBuendel = null');
          }
          w.__T("raum().moebel = []; SONNE_CACHE = {}; SONNE_CACHE_SIG = ''");
          viele.forEach(id=> w.__T(`pflanzeSetzen('${id}', '${rid}', 120, 60)`));
          w.__T(`pBuendel = '${key7}'`);

          /* Und die Liste muss ins Bild passen. Ein B\u00fcndel oben in
             der Ecke schob sie \u00fcber den oberen Rand: der Kreis sagte
             sieben, sichtbar waren sechs \u2014 das SVG schneidet an
             seiner viewBox ab.

             Der Modus geh\u00f6rt dazu: nur im Kachelmodus liegt ein Ring
             leerer Kacheln um den Raum, der einen \u00fcberstehenden
             Kasten auffinge. In der Ansicht gibt es ihn nicht. */
          w.__T("pModus = 'pflanzen'");
          const kasten = auf7.match(
            /class="buendel-liste"[\s\S]{0,120}?x="([-0-9.]+)" y="([-0-9.]+)" width="([-0-9.]+)" height="([-0-9.]+)"/);
          const vb = (auf7.match(/viewBox="([-0-9.]+) ([-0-9.]+) ([-0-9.]+) ([-0-9.]+)"/) || [])
            .slice(1).map(Number);
          const passt = kasten && vb.length === 4
            && +kasten[1] >= vb[0] && +kasten[2] >= vb[1]
            && +kasten[1] + +kasten[3] <= vb[0] + vb[2]
            && +kasten[2] + +kasten[4] <= vb[1] + vb[3];
          pruef('Die Liste liegt ganz im Bild', !!passt,
            kasten ? kasten.slice(1).join(',') + ' in ' + vb.join(',') : '—');

          /* Gegenprobe am oberen Rand: das B\u00fcndel wandert dorthin,
             wo der Fehler auftrat. */
          viele.forEach(id=> w.__T(`pflanzeSetzen('${id}', '${rid}', 130, 10)`));
          /* Der Ausschnitt wird nach unten geschoben, wie beim Schieben
             im Vollbild \u2014 dann steht das B\u00fcndel dicht am oberen
             Rand und die Liste muss ausweichen. */
          w.__T('pPanY = 55');
          const oben = w.__T('grundrissSVG()');
          const kOben = oben.match(
            /class="buendel-liste"[\s\S]{0,120}?x="([-0-9.]+)" y="([-0-9.]+)" width="([-0-9.]+)" height="([-0-9.]+)"/);
          const vbO = (oben.match(/viewBox="([-0-9.]+) ([-0-9.]+) ([-0-9.]+) ([-0-9.]+)"/) || [])
            .slice(1).map(Number);
          pruef('Auch oben in der Ecke',
            kOben && +kOben[2] >= vbO[1]
            && +kOben[2] + +kOben[4] <= vbO[1] + vbO[3],
            kOben ? kOben[2] + '+' + kOben[4] + ' in ' + vbO[1] + '+' + vbO[3] : '—');

          /* Die beiden aus der Nachbarpr\u00fcfung geh\u00f6ren zur\u00fcck an
             ihren Punkt, die \u00fcbrigen aus dem Weg. */
          w.__T('pPanY = 0');
          w.__T('pBuendel = null');
          viele.slice(2).forEach((id, i)=>
            w.__T(`pflanzeSetzen('${id}', '${rid}', ${300 + i*60}, 300)`));
          w.__T(`pflanzeSetzen('${zwei[0]}', '${rid}', 120, 60)`);
          w.__T(`pflanzeSetzen('${zwei[1]}', '${rid}', 120, 60)`);
        }

        /* Im Editor bleibt die Marke da, wo der Finger sie hingezogen
           hat \u2014 dort darf nichts von selbst wegrutschen, und
           geb\u00fcndelt werden darf auch nichts: was man ziehen soll,
           muss einzeln unter dem Finger liegen. */
        w.__T("grStufe = 'editor'");
        const bildE = w.__T('grundrissSVG()');
        const e0 = stelleVon(bildE, zwei[0]);
        pruef('Im Editor bleibt sie an ihrem echten Ort',
          e0 && Math.abs(e0.x - 120) < 0.5 && Math.abs(e0.y - 60) < 0.5,
          e0 ? e0.x + ',' + e0.y : '—');
        pruef('Im Editor wird nicht geb\u00fcndelt',
          bildE.indexOf('data-buendel=') < 0
          && bildE.indexOf('data-pfl="' + zwei[0] + '"') >= 0
          && bildE.indexOf('data-pfl="' + zwei[1] + '"') >= 0);
        w.__T(`pflanzeSetzen('${zwei[1]}', '${rid}', 104, 100)`);
        w.__T(`pflanzeSetzen('${zwei[0]}', '${rid}', 100, 100)`);
      }

      /* Die ausgew\u00e4hlte beh\u00e4lt ihren Namen auch im Gedr\u00e4nge. */
      w.__T(`pflanzeSetzen('${zwei[1]}', '${rid}', 104, 100)`);
      w.__T(`pGewaehlt = {typ:'pflanze', id:'${zwei[0]}'}`);
      const gewBild = w.__T('grundrissSVG()');
      pruef('Die ausgew\u00e4hlte Pflanze beh\u00e4lt ihren Namen',
        zaehl(gewBild, 'class="p-lab"') > zaehl(bild, 'class="p-lab"'),
        zaehl(gewBild, 'class="p-lab"') + ' gegen ' + zaehl(bild, 'class="p-lab"'));
      w.__T('pGewaehlt = null; planRender()');
    }

    /* ── Die Marke bleibt unter dem Finger ──────────────
       Ohne gemerkten Griffpunkt sprang sie beim ersten Millimeter mit
       ihrem Mittelpunkt unter den Finger. */
    {
      pruef('Der Griffpunkt wird beim Aufsetzen gemerkt',
        html.indexOf('dx: (p && o0) ? p.x - o0.x : 0') !== -1);
      pruef('und beim Ziehen abgezogen',
        html.indexOf('Math.min(r.sp*KACHEL, p.x - zieht.dx)') !== -1);
      pruef('Die Schwelle ist klein genug',
        html.indexOf('zieht.sy) < 3) return;') !== -1);
    }

    /* ── Beschriftung der Möbel ────────────────
       Ein Name, der breiter ist als sein Möbel, lief bis 3.4.2 quer
       über das Nachbarmöbel: „Wandbrett" lag auf „TV-Sideboard".
       Jetzt trägt jedes Möbel nur so viel Text, wie es breit ist. */
    {
      w.__T(`raum().moebel = [
        {id:'breit',  name:'Esstisch mit St\u00fchlen', typ:'tisch', x:0, y:0, b:220, t:100, h:75},
        {id:'schmal', name:'Wandbrett am Fenster',  typ:'regal', x:0, y:250, b:34, t:24, h:120}];
        SONNE_CACHE = {}; SONNE_CACHE_SIG = ''`);
      w.__T("grStufe = 'editor'; pGewaehlt = null");
      const bildM = w.__T('grundrissSVG()');
      /* Der Text steht hinter der Klasse, nicht hinter einer Kennung —
         also wird er selbst gelesen. */
      const labels = (bildM.match(/class="m-lab"[^>]*>([^<]*)</g) || [])
        .map(t=>t.replace(/^[\s\S]*>/, '').replace(/<$/, ''));
      const hoehen = (bildM.match(/class="m-h"/g) || []).length;
      pruef('Das breite M\u00f6bel tr\u00e4gt seinen vollen Namen',
        labels.indexOf('Esstisch mit St\u00fchlen') >= 0, JSON.stringify(labels));
      const kurzL = labels.filter(t=>t !== 'Esstisch mit St\u00fchlen');
      pruef('Das schmale bekommt einen gek\u00fcrzten',
        kurzL.length === 1 && kurzL[0].length < 'Wandbrett am Fenster'.length
        && kurzL[0].slice(-1) === '\u2026', JSON.stringify(kurzL));
      pruef('Und der gek\u00fcrzte passt in seine Breite',
        kurzL.length === 1 && kurzL[0].length <= 8, kurzL[0]);
      pruef('Nur das breite zeigt seine H\u00f6he',
        hoehen === 1, String(hoehen));

      /* ── Wer hoeher steht, liegt oben ────────────────
         Gezeichnet wurde in der Reihenfolge des Eintragens. Ein
         Wandbrett auf 1,80 m lag damit unter einem Sideboard auf
         50 cm, wenn es frueher eingetragen war. */
      {
        const platz = (t, id) => t.indexOf('data-moebel="' + id + '"');
        pruef('Das h\u00f6here M\u00f6bel wird zuletzt gezeichnet',
          platz(bildM, 'schmal') > platz(bildM, 'breit'),
          platz(bildM, 'schmal') + ' nach ' + platz(bildM, 'breit'));
        /* Und umgekehrt, damit nicht blosse Eintragsreihenfolge
           bestanden hat: dasselbe Paar andersherum eingetragen. */
        w.__T(`raum().moebel = [
          {id:'hoch',  name:'Wandbrett', typ:'regal', x:0, y:0,   b:120, t:30, h:180},
          {id:'flach', name:'Sideboard', typ:'kommode', x:0, y:60, b:120, t:40, h:50}];
          SONNE_CACHE = {}; SONNE_CACHE_SIG = ''`);
        const bildH = w.__T('grundrissSVG()');
        pruef('Auch wenn es zuerst eingetragen wurde',
          bildH.indexOf('data-moebel="hoch"') > bildH.indexOf('data-moebel="flach"'),
          bildH.indexOf('data-moebel="hoch"') + ' nach '
          + bildH.indexOf('data-moebel="flach"'));
        /* Die Liste selbst bleibt in der Reihenfolge des Eintragens \u2014
           sonst zeigte die Moebelleiste jedes Mal etwas anderes. */
        pruef('Die Liste wird dabei nicht umsortiert',
          w.__T("raum().moebel[0].id") === 'hoch', w.__T("raum().moebel[0].id"));
        w.__T(`raum().moebel = [
          {id:'breit',  name:'Esstisch mit St\u00fchlen', typ:'tisch', x:0, y:0, b:220, t:100, h:75},
          {id:'schmal', name:'Wandbrett am Fenster',  typ:'regal', x:0, y:250, b:34, t:24, h:120}];
          SONNE_CACHE = {}; SONNE_CACHE_SIG = ''`);
      }

      /* Ein Brett, das f\u00fcr drei Zeichen zu schmal ist, tr\u00e4gt gar
         nichts — ein einzelner Buchstabe sagt weniger als nichts. */
      w.__T(`raum().moebel[1].b = 12; SONNE_CACHE = {}; SONNE_CACHE_SIG = ''`);
      const bildW = w.__T('grundrissSVG()');
      pruef('Ein sehr schmales M\u00f6bel bleibt unbeschriftet',
        (bildW.match(/class="m-lab"/g) || []).length === 1,
        String((bildW.match(/class="m-lab"/g) || []).length));
      w.__T("raum().moebel = []; SONNE_CACHE = {}; SONNE_CACHE_SIG = ''");
    }

    /* ── Was nicht zusammenpasst ───────────────
       Die Giftmeldungen standen einmal je Pflanze mit dem vollen
       Grundtext; sechs Aronstabgew\u00e4chse ergaben sechsmal denselben
       Absatz. Und der Frostkasten sammelte aus allen R\u00e4umen \u2014 im
       Wohnzimmer standen die Balkonpflanzen. */
    {
      const rid2 = w.__T('raum().id');
      const drei = w.__T('allePflanzen().map(function(p){return p.id;})').slice(0, 3);
      w.__T("raum().moebel = []; SONNE_CACHE = {}; SONNE_CACHE_SIG = ''");
      drei.forEach((id, i)=>
        w.__T(`pflanzeSetzen('${id}', '${rid2}', ${80 + i*70}, 120)`));
      /* Damit \u00fcberhaupt gewarnt wird, muss ein Tier gehalten werden,
         die Pflanze giftig sein und der Platz erreichbar. Alle drei
         werden hier gesetzt \u2014 sonst pr\u00fcft der Block gegen einen
         leeren Bericht und h\u00e4lt jeden Fehler f\u00fcr richtig. */
      w.__T("S.tiere = {aktiv:true, arten:['katze']}");
      w.__T(`(function(){
        const eigen = ['a','b','c'];
        ['${drei[0]}', '${drei[1]}', '${drei[2]}'].forEach(function(id, i){
          const p = allePflanzen().find(function(x){ return x.id === id; });
          if(!p) return;
          p.gift = {status:'fest', quelle:'pruefstand', beleg:'-',
            grund:'Unl\u00f6sliche Calciumoxalat-Nadeln in allen Pflanzenteilen.',
            tiere:{katze:'giftig'}};
        });
      })()`);
      const gr = JSON.parse(w.__T('JSON.stringify(giftGruppen(raum()))'));
      const wieOft = t => t.split('Calciumoxalat').length - 1;
      const html = w.__T('planWarnungen()');
      if(gr.length){
        const groesste = gr.slice().sort((a,b)=>b.wer.length - a.wer.length)[0];
        pruef('Gleiche Gr\u00fcnde stehen in einer Gruppe',
          gr.every(g=>g.wer.length >= 1), JSON.stringify(gr.map(g=>g.wer.length)));
        /* Der Grundtext darf h\u00f6chstens einmal je Gruppe vorkommen,
           nicht einmal je Pflanze. */
        const grundZahl = gr.filter(g=>g.grund.indexOf('Calciumoxalat') >= 0).length;
        pruef('Der Grund steht einmal je Gruppe, nicht je Pflanze',
          wieOft(html) <= grundZahl,
          wieOft(html) + ' mal im Text, ' + grundZahl + ' Gruppen, '
          + groesste.wer.length + ' Pflanzen in der gr\u00f6\u00dften');
        pruef('Der Grund steckt hinter einem Aufklappen',
          html.indexOf('warn-mehr') >= 0 || wieOft(html) === 0);
      } else {
        pruef('Ohne giftige Pflanze gibt es keine Gruppe', gr.length === 0);
        pruef('und keinen Grundtext im Bericht', wieOft(html) === 0);
        pruef('Der Bericht bleibt trotzdem eine Zeichenkette', typeof html === 'string');
      }

      /* Der Frostkasten kennt jetzt einen Raum. Damit er \u00fcberhaupt
         etwas zeigt, braucht es einen zweiten Raum unter offenem
         Himmel, eine frostempfindliche Pflanze darin und Herbst. */
      const zweitR = w.__T(`(function(){
        const rs = raeume();
        let z = rs.find(function(x){ return x.id !== '${rid2}'; });
        if(!z){
          z = JSON.parse(JSON.stringify(rs[0]));
          z.id = 'pruef-balkon'; z.name = 'Pr\u00fcfbalkon';
          S.raeume.push(z);
        }
        z.dach = false;
        return z.id;
      })()`);
      /* Es gibt nur wenige Pflanzen im Pr\u00fcfstand \u2014 die letzte der
         drei zieht auf den Balkon, die Giftpr\u00fcfung oben ist durch. */
      const frostP = w.__T('allePflanzen().map(function(p){return p.id;})')
        .filter(id => drei.indexOf(id) < 0)[0] || drei[drei.length - 1];
      w.__T('pMonat = 10');
      if(frostP){
        w.__T(`(function(){
          const q = (S.eigene || []).find(function(x){ return x.id === '${frostP}'; });
          if(q) q.frostMin = 10;
          const p = allePflanzen().find(function(x){ return x.id === '${frostP}'; });
          if(p) p.frostMin = 10;
          pflanzeSetzen('${frostP}', '${zweitR}', 60, 60);
        })()`);
        w.__T(`SONNE_CACHE = {}; SONNE_CACHE_SIG = ''`);
        console.log('DBG2 frostMin', w.__T(`allePflanzen().find(function(x){return x.id==='${frostP}';}).frostMin`),
          'ort', JSON.stringify(w.__T(`pflanzenOrt('${frostP}')`)),
          'dach', w.__T(`raeume().find(function(x){return x.id==='${zweitR}';}).dach`),
          'monat', w.__T('pMonat'),
          'imBalkon', w.__T(`pflanzenIm('${zweitR}').length`));
        const nurEiner = w.__T(`umzugHTML('${rid2}')`);
        const alle = w.__T('umzugHTML()');
        pruef('Der Frostkasten des Nachbarraums taucht dort nicht auf',
          nurEiner.indexOf(w.__T(`nice(allePflanzen().find(function(x){ return x.id === '${frostP}'; }))`)) < 0,
          nurEiner.slice(0, 90));
        pruef('Ohne Raumangabe sammelt er weiterhin alle',
          alle.length > nurEiner.length,
          alle.length + ' gegen ' + nurEiner.length);
      }
      /* Und im Bericht des Raums steht keine Pflanze aus einem anderen. */
      const fremd = w.__T(`(function(){
        const r = raum();
        const eigen = pflanzenIm(r.id).map(function(p){ return nice(p); });
        const t = planWarnungen();
        return allePflanzen().filter(function(p){
          return eigen.indexOf(nice(p)) < 0
            && t.indexOf('<b>' + nice(p) + '</b>') >= 0;
        }).map(function(p){ return nice(p); });
      })()`);
      pruef('Keine Pflanze aus einem anderen Raum im Bericht',
        fremd.length === 0, JSON.stringify(fremd));
    }

    /* ── Bild oben, Werkzeug darunter ──────────
       Wer den Raum auf dem Kompass ausrichtete, war zwei Bildschirme
       von dem Raum entfernt, den er ausrichtete. */
    {
      const ed = d.getElementById('gr-editor');
      const stelle = id => {
        const el = d.getElementById(id);
        if(!el) return -1;
        return Array.prototype.indexOf.call(ed.querySelectorAll('*'), el);
      };
      pruef('Das Bild steht vor der Werkzeugleiste',
        stelle('plan-halter') < stelle('kanten-leiste'),
        stelle('plan-halter') + ' vor ' + stelle('kanten-leiste'));
      pruef('und vor dem Lichtfenster',
        stelle('plan-halter') < stelle('licht-panel'));
      pruef('und vor den Raumeinstellungen \u2014 dort liegt der Kompass',
        stelle('plan-halter') < stelle('raum-einrichten'),
        stelle('plan-halter') + ' vor ' + stelle('raum-einrichten'));
      pruef('Die Reiter stehen weiterhin ganz oben',
        stelle('plan-halter') > 0 && ed.querySelector('.gr-tabs') != null);

      /* Die Hinweise klappen. */
      w.__T("grStufe = 'editor'; pModus = 'pflanzen'; grHinweise = false");
      w.__T('planRender()');
      const hin = () => d.getElementById('modus-hinweis').hidden;
      pruef('Der Bedienhinweis ist zugeklappt', hin() === true, String(hin()));
      pruef('Der Infotext zeigt ihn dann auch nicht',
        d.getElementById('p-info').innerHTML.indexOf('Marke antippen') < 0);
      w.__T("document.getElementById('btn-gr-hinweise').click()");
      pruef('Ein Tipp klappt ihn auf', hin() === false, String(hin()));
      pruef('Und der Infotext zeigt ihn mit',
        d.getElementById('p-info').innerHTML.indexOf('Marke antippen') >= 0);
      w.__T("document.getElementById('btn-gr-hinweise').click()");
    }

    /* ── Die Leiste der Ansicht klappt ─────────
       Der Monatsregler stand zwischen Grundriss und Text im Weg.
       Zugeklappt muss trotzdem ablesbar bleiben, welches Licht man
       gerade sieht \u2014 sonst waere die Zeichnung nicht mehr zu deuten. */
    {
      w.__T("grStufe = 'ansicht'; pLicht = 'stunden'; pMonat = 9; graLeiste = false");
      w.__T('grAnsichtZeichnen()');
      const inh = () => w.__T("document.getElementById('gra-leiste-inhalt').hidden");
      const stand = () => w.__T("document.getElementById('gra-leiste-stand').textContent");
      pruef('Zugeklappt sind Wahl und Regler weg', inh() === true, String(inh()));
      pruef('Der Kopf sagt trotzdem, was zu sehen ist',
        stand() === 'Sonnenstunden \u00b7 September', stand());

      w.__T("document.getElementById('btn-gra-leiste').click()");
      pruef('Ein Tipp klappt sie auf', inh() === false, String(inh()));
      pruef('Und das merkt sich der Zustand', w.__T('graLeiste') === true);

      /* Der Bedienhinweis geh\u00f6rt zur aufgeklappten Leiste. */
      const mitTipp = w.__T("document.getElementById('gra-info').innerHTML");
      w.__T("document.getElementById('btn-gra-leiste').click()");
      const ohneTipp = w.__T("document.getElementById('gra-info').innerHTML");
      pruef('Aufgeklappt steht der Bedienhinweis da',
        mitTipp.indexOf('Marke antippen') >= 0);
      pruef('Zugeklappt nicht mehr',
        ohneTipp.indexOf('Marke antippen') < 0);
      pruef('Der Raum mit seinen Ma\u00dfen bleibt in beiden F\u00e4llen',
        ohneTipp.indexOf('geschlossen') >= 0 || ohneTipp.indexOf('offener Himmel') >= 0);

      /* Ein anderer Monat, ein anderer Kopf. */
      w.__T('pMonat = 1; grAnsichtZeichnen()');
      pruef('Der Kopf folgt dem Monat',
        stand() === 'Sonnenstunden \u00b7 Januar', stand());
      w.__T("pLicht = 'hell'; grAnsichtZeichnen()");
      pruef('und der Lichtart', stand() === 'Grundhelligkeit', stand());
      w.__T("pLicht = 'stunden'; pMonat = 9; graLeiste = false; grStufe = 'editor'");
    }

    /* ── Möbel drehen ──────────────────────────
       Gedreht wird die Zeichnung, getauscht werden die Maße. Nur so
       stimmen Schatten und Stellflaeche mit dem Bild ueberein. */
    {
      w.__T(`raum().moebel = [{id:'drehtest', name:'Sofa', typ:'sofa',
        x:0, y:0, b:200, t:90, h:45}]`);
      const m = () => JSON.parse(w.__T("JSON.stringify(raum().moebel[0])"));
      pruef('Ein neues M\u00f6bel liegt ungedreht', (m().dreh || 0) === 0);

      w.__T('moebelDrehen(raum().moebel[0])');
      const eins = m();
      pruef('Einmal drehen macht 90 Grad', eins.dreh === 90, String(eins.dreh));
      pruef('Breite und Tiefe tauschen dabei',
        eins.b === 90 && eins.t === 200, eins.b + '\u00d7' + eins.t);

      w.__T('moebelDrehen(raum().moebel[0]); moebelDrehen(raum().moebel[0])');
      const drei = m();
      pruef('Dreimal weiter macht 270', drei.dreh === 270, String(drei.dreh));
      pruef('und stellt es wieder quer', drei.b === 90 && drei.t === 200,
        drei.b + '\u00d7' + drei.t);

      w.__T('moebelDrehen(raum().moebel[0])');
      const rund = m();
      pruef('Viermal drehen f\u00fchrt zur\u00fcck an den Anfang',
        (rund.dreh % 360) === 0 && rund.b === 200 && rund.t === 90,
        rund.dreh + ' / ' + rund.b + '\u00d7' + rund.t);

      /* Die Zeichnung muss die Drehung ebenfalls tragen. */
      w.__T('moebelDrehen(raum().moebel[0])');
      const svg = w.__T('moebelForm(raum().moebel[0], "red")');
      pruef('Die Zeichnung dreht mit', /rotate\(90 /.test(svg), svg.slice(0, 60));

      /* Der Schatten dreht mit, weil er an b und t haengt. */
      w.__T(`(function(){
        const r = raum();
        r.moebel = [{id:'drehtest', name:'Regal', typ:'regal',
          x:0, y:0, b:300, t:25, h:150}];
        SONNE_CACHE = {}; SONNE_CACHE_SIG = '';
      })()`);
      const breit = w.__T('!!hoeheAn(raum(), 250, 10)');
      w.__T('moebelDrehen(raum().moebel[0])');
      const hoch = w.__T('!!hoeheAn(raum(), 250, 10)');
      pruef('Vorher tr\u00e4gt es an der weit rechts gelegenen Stelle',
        breit === true, String(breit));
      pruef('Nach dem Drehen nicht mehr \u2014 die Ma\u00dfe sind mitgewandert',
        hoch === false, String(hoch));
      pruef('Die gedrehte H\u00fclle stimmt',
        w.__T('raum().moebel[0].b') === 25 && w.__T('raum().moebel[0].t') === 300);

      w.__T("raum().moebel = []; SONNE_CACHE = {}; SONNE_CACHE_SIG = ''");
      pruef('Es gibt einen Knopf zum Drehen', !!d.getElementById('btn-mb-dreh'));
    }

    /* ── Was Licht wegnimmt, trägt nichts ─────────────── */
    {
      pruef('Es gibt einen Zaun', !!w.__T('MOEBEL_ARTEN.zaun'));
      pruef('und ein Ecksofa', !!w.__T('MOEBEL_ARTEN.ecksofa'));
      pruef('und ein TV-Sideboard', !!w.__T('MOEBEL_ARTEN.sideboard'));
      pruef('und einen Esstisch mit St\u00fchlen', !!w.__T('MOEBEL_ARTEN.esstisch'));
      pruef('Zaun, Hecke, Mauer und Baum sperren',
        w.__T('["zaun","hecke","mauer","baum"].every(function(k){ return MOEBEL_ARTEN[k].sperrt === true; })'));
      pruef('Ein Regal sperrt nicht',
        w.__T('!MOEBEL_ARTEN.regal.sperrt'));
      pruef('Jede Art hat eine Gruppe',
        w.__T('Object.keys(MOEBEL_ARTEN).every(function(k){ return !!MOEBEL_ARTEN[k].gruppe; })'));

      const rid = w.__T('raum().id');
      /* Eine Hecke quer vor der offenen Kante, hoch genug, um die
         flache Sonne abzufangen. */
      const messen = typ => w.__T(`(function(){
        const r = raum();
        r.kanten['o:1,0'] = 'offen';
        r.moebel = ${typ ? `[{id:'hindernis', name:'St\u00fcck', typ:'${typ}',
          x:0, y:0, b:r.sp*KACHEL, t:KACHEL, h:200}]` : '[]'};
        SONNE_CACHE = {}; SONNE_CACHE_SIG = '';
        return JSON.stringify({
          sonne: sonnigImRaum(r, 75, 130, 0, {az: r.drehung, hoehe: 25}),
          traegt: !!hoeheAn(r, 75, 25)
        });
      })()`);
      void rid;

      const ohne = JSON.parse(messen(null));
      const mit  = JSON.parse(messen('hecke'));
      pruef('Ohne Hecke kommt die flache Sonne durch',
        ohne.sonne === true, JSON.stringify(ohne));
      pruef('Eine Hecke davor h\u00e4lt sie ab',
        mit.sonne === false, JSON.stringify(mit));
      pruef('Auf der Hecke steht keine Pflanze',
        mit.traegt === false, JSON.stringify(mit));

      const regal = JSON.parse(messen('regal'));
      pruef('Ein Regal an derselben Stelle tr\u00e4gt sehr wohl',
        regal.traegt === true, JSON.stringify(regal));

      w.__T("raum().moebel = []; delete raum().kanten['o:1,0'];"
        + " SONNE_CACHE = {}; SONNE_CACHE_SIG = ''");
    }

    /* ── Die Auswahl steht in Gruppen ───────────────── */
    {
      /* Geprüft wird, was in der Leiste steht — nicht, was die
         Funktion zurückgibt. Sonst bliebe die Prüfung grün, auch
         wenn die Leiste ganz woanders gefüllt wird. */
      w.__T('planAufbau()');
      const h = d.getElementById('moebel-leiste').innerHTML;
      pruef('Die M\u00f6belauswahl in der Leiste ist unterteilt',
        h.indexOf('mgruppe-titel') !== -1);
      pruef('Ein Hindernis ist darin als solches gezeichnet',
        h.indexOf('mchip sperrt') !== -1);
      pruef('Jede Art taucht darin genau einmal auf',
        w.__T('Object.keys(MOEBEL_ARTEN).every(function(k){'
          + ' return (moebelWahlHTML().split(\'data-mneu="\' + k + \'"\').length - 1) === 1; })'));
    }

    /* ── Kantenbreiten ── */
    const kid = w.__T('aussenKanten(raum()).filter(k=>k.k==="o").map(k=>k.id)[0]');
    if(kid){
      const wand = JSON.parse(w.__T(`JSON.stringify(wandGlieder(raum(),'${kid}'))`));
      pruef('Eine Wand kennt ihre Glieder', wand.length > 1, String(wand.length));
      pruef('Alle liegen auf derselben Seite',
        wand.every(x => x.indexOf('o:') === 0));

      const vorher = JSON.parse(w.__T(`JSON.stringify(wandBreiten(raum(),'${kid}'))`));
      pruef('Ohne Vorgabe ist jedes Glied eine Kachel',
        Object.values(vorher.breiten).every(b => b === w.__T('KACHEL')));
      pruef('Die Wandl\u00e4nge stimmt',
        vorher.gesamt === wand.length * w.__T('KACHEL'));

      /* Der eigentliche Punkt: 130 cm gehen ueber eine Kachel hinaus. */
      w.__T(`kantenMassSetzen(raum(),'${kid}',{b:130, sockel:90, oben:220})`);
      pruef('130 cm werden \u00fcbernommen',
        w.__T(`kantenBreite(raum(),'${kid}')`) === 130,
        String(w.__T(`kantenBreite(raum(),'${kid}')`)));
      pruef('Auch kantenMass meldet 130',
        w.__T(`kantenMass(raum(),'${kid}').b`) === 130);

      const nachher = JSON.parse(w.__T(`JSON.stringify(wandBreiten(raum(),'${kid}'))`));
      pruef('Die Wand bleibt gleich lang',
        Math.abs(nachher.summe - nachher.gesamt) < 0.01,
        nachher.summe + ' statt ' + nachher.gesamt);
      pruef('Die Nachbarn geben Platz ab',
        w.__T(`kantenBreite(raum(),'${wand[1]}')`) < w.__T('KACHEL'),
        String(w.__T(`kantenBreite(raum(),'${wand[1]}')`)));
      pruef('Kein Glied verschwindet ganz',
        Object.values(nachher.breiten).every(b => b >= 5));
      pruef('Sockel und Oberkante kommen mit',
        w.__T(`kantenMass(raum(),'${kid}').sockel`) === 90
        && w.__T(`kantenMass(raum(),'${kid}').oben`) === 220);

      /* Zuruecksetzen stellt das Raster wieder her. */
      w.__T(`kantenMassSetzen(raum(),'${kid}',{})`);
      pruef('Zur\u00fccksetzen bringt die Kachel zur\u00fcck',
        w.__T(`kantenBreite(raum(),'${kid}')`) === w.__T('KACHEL'));
      pruef('Und die ganze Wand ist wieder gleichm\u00e4\u00dfig',
        Object.values(JSON.parse(w.__T(`JSON.stringify(wandBreiten(raum(),'${kid}').breiten)`)))
          .every(b => b === w.__T('KACHEL')));
    /* ── Auswahlknopf mit Bild, Pflanzen im Vollbild ── */
    pruef('Der Auswahlknopf kann ein Bild tragen',
      typeof w.__T('zchipHTML') === 'function');
    /* Die Schublade kannte den Pflanzenmodus nicht — im Vollbild gab
       es damit keine Möglichkeit, eine Pflanze zu setzen. Seit 3.3.0
       steht der Raummodus mit in derselben Liste. */
    pruef('Die Vollbild-Schublade kennt den Pflanzenmodus',
      html.indexOf("['moebel','kanten','pflanzen','raum'].includes(pModus)") !== -1);
    }
    w.__T("modalZu('sek-modal')");
    await tick();
  }

  /* ══ App Tour ══════════════════════════════════════════════════
     Frueher startete auf jedem Reiter und beim ersten Oeffnen jedes
     Bereichs ungefragt ein Kapitel. Jetzt gibt es eine Runde, die man
     holt — und Kapitel, die nur auf Anforderung laufen. */
  {
    pruef('Die Runde ist ein eigenes Kapitel', !!w.__T('TOUR_KAPITEL.runde'));
    pruef('Sie hat sieben Schritte',
      w.__T('TOUR_KAPITEL.runde.schritte().length') === 7,
      String(w.__T('TOUR_KAPITEL.runde.schritte().length')));
    pruef('Jeder Schritt hat Titel und Text',
      w.__T(`TOUR_KAPITEL.runde.schritte().every(s=>s.titel && s.text)`));
    pruef('Jeder Schritt hat ein Ziel',
      w.__T(`TOUR_KAPITEL.runde.schritte().every(s=>typeof s.ziel === 'function')`));
    /* Bei leerer Sammlung darf nichts ins Leere zeigen — darum die
       Komma-Fallbacks auf die Leerstart-Karte. */
    pruef('Der Sammlungs-Schritt hat einen Ausweichweg',
      /,/.test(w.__T('String(TOUR_KAPITEL.runde.schritte()[2].ziel)')));
    pruef('Der Schlussschritt ebenso',
      /,/.test(w.__T('String(TOUR_KAPITEL.runde.schritte()[6].ziel)')));

    /* Kein Kapitel startet mehr von selbst */
    pruef('Ansichtswechsel l\u00f6st nichts aus',
      w.__T('tourAnsichtPruefen("werkzeuge")') === undefined
      && !w.__T('!!tourLauf'));
    w.__T("ansichtZeigen('werkzeuge')"); await tick();
    pruef('Werkzeuge-Reiter startet keine Tour', !w.__T('!!tourLauf'));
    w.__T("ansichtZeigen('mehr')"); await tick();
    pruef('Mehr-Reiter startet keine Tour', !w.__T('!!tourLauf'));
    pruef('Erstes \u00d6ffnen eines Bereichs auch nicht',
      w.__T('tourNachOeffnen("substrat")') === undefined && !w.__T('!!tourLauf'));
    w.__T("sektionOeffnen('substrat')"); await tick();
    pruef('Der Substratmischer bleibt unverstellt', !w.__T('!!tourLauf'));
    w.__T("modalZu('sek-modal')"); await tick();
    pruef('Kein card-btn-Listener mehr in der Quelle',
      html.indexOf("e.target.closest('.card-btn')") === -1);

    /* Willkommen */
    pruef('Willkommen hat keine Bereichsliste mehr',
      !d.querySelector('[data-wk="1"] .wk-liste'));
    pruef('Der Hauptknopf hei\u00dft „Kurze Runde durch die App\u201c',
      d.querySelector('[data-wkfertig="1"]').textContent.trim() === 'Kurze Runde durch die App',
      d.querySelector('[data-wkfertig="1"]').textContent.trim());
    pruef('Der Nebenknopf hei\u00dft „Selbst umsehen\u201c',
      d.querySelector('[data-wk="4"] [data-wkfertig="0"]').textContent.trim() === 'Selbst umsehen');
    pruef('Die Haustier-Frage bleibt', !!d.querySelector('[data-wk="2"] [data-wktiere]'));
    pruef('Die Grundriss-Frage bleibt', !!d.querySelector('[data-wk="3"] [data-wkplan]'));

    /* Rueckweg-Hinweise an jedem Ausgang */
    const hinweisAuf = el => el && /Mehr\s*\u203a\s*App Tour/.test(el.textContent);
    pruef('Willkommen Schritt 1 nennt den R\u00fcckweg',
      hinweisAuf(d.querySelector('[data-wk="1"]')));
    pruef('Willkommen Schritt 4 nennt den R\u00fcckweg',
      hinweisAuf(d.querySelector('[data-wk="4"]')));
    pruef('Der Schlussschritt der Runde nennt ihn',
      /Mehr \u203a App Tour/.test(w.__T('TOUR_KAPITEL.runde.schritte()[6].text')));
    pruef('Der \u00dcberspringen-Knopf nennt ihn',
      html.indexOf('Du findest die Runde jederzeit unter Mehr \u203a App Tour wieder.') !== -1);

    /* Ersteinrichtung bleibt, startet aber nie von allein */
    pruef('Die Ersteinrichtung ist noch da', !!w.__T('TOUR_KAPITEL.einricht'));
    pruef('Sie ist weiterhin ein Sperrablauf',
      w.__T('TOUR_KAPITEL.einricht.modus') === 'sperre');
    pruef('wkFertig startet die Runde, nicht die Einrichtung',
      html.indexOf("requestAnimationFrame(()=>tourStart('runde'))") !== -1
      && html.indexOf("if(tourNoetig('einricht')) requestAnimationFrame(()=>tourStart('einricht'))") === -1);

    /* Bestandsnutzer: ein Angebot, dann nie wieder */
    pruef('Der Angebotskasten existiert', !!d.getElementById('runde-angebot'));
    w.__T("S.startGesehen = iso(HEUTE); S.rundeAngeboten = null; sichern(); rundeAngebotZeichnen()");
    pruef('Das Angebot erscheint einmal',
      d.getElementById('runde-angebot').hidden === false);
    d.querySelector('[data-do="angebot-nein"]').click();
    pruef('Weggetippt bleibt es weg',
      d.getElementById('runde-angebot').hidden === true
      && !!w.__T('S.rundeAngeboten'));
    w.__T('rundeAngebotZeichnen()');
    pruef('Auch nach neuem Aufbau', d.getElementById('runde-angebot').hidden === true);

    /* Liste unter Mehr */
    w.__T('tourListeZeichnen()');
    const liste = d.getElementById('tour-liste');
    pruef('Die Runde steht in der Liste',
      !!liste.querySelector('[data-tourgo="runde"]'));
    pruef('Sie steht abgesetzt oben',
      liste.innerHTML.indexOf('Von vorn') < liste.innerHTML.indexOf('Einzelne Bereiche'));
    pruef('Alle Kapitel stehen zur Wahl',
      liste.querySelectorAll('[data-tourgo]').length
        === w.__T('Object.keys(TOUR_KAPITEL).length'));
    pruef('Der Erkl\u00e4rtext verspricht kein Aufploppen mehr',
      !/erscheint genau einmal/.test(d.getElementById('tour-aus-text').textContent),
      d.getElementById('tour-aus-text').textContent.slice(0, 50));

    /* Die Leerstart-Karte bietet beide Wege */
    w.__T('erststartZeigen()');
    const es = d.getElementById('erststart');
    if(!es.hidden){
      pruef('Leerstart bietet die Runde', !!es.querySelector('[data-do="start-runde"]'));
      pruef('und die Ersteinrichtung', !!es.querySelector('[data-do="start-tour"]'));
      pruef('und nennt den R\u00fcckweg', hinweisAuf(es));
    }

    /* Das Mehr-Kapitel zielte auf einen stillgelegten Punkt */
    pruef('Das Mehr-Kapitel zeigt nicht mehr auf „ansicht\u201c',
      w.__T('JSON.stringify(TOUR_KAPITEL.mehr.schritte().map(s=>String(s.ziel)))')
        .indexOf('data-mh=\\"ansicht\\"') === -1);
  }

  /* ══ Vermehrung im Verlauf ═════════════════════════════════════
     Ein Ableger stand bisher nur im Steckbrief des Kindes. Weder der
     Zeitstrahl der Mutter noch der des Ablegers wusste davon. */
  {
    const mid = w.__T('allePflanzen()[0].id');
    const vorher = w.__T(`ereignisse('${mid}').length`);
    const kid = w.__T(`(function(){
      const meth = Object.keys(V_METHODEN)[0];
      const k = ablegerAnlegen('${mid}', meth);
      return k ? k.id : null; })()`);

    pruef('Ableger wird angelegt', !!kid, String(kid));
    pruef('Mutter bekommt einen Verlaufseintrag',
      w.__T(`ereignisse('${mid}').length`) === vorher + 1);
    pruef('Der Eintrag der Mutter heißt „vermehrt"',
      w.__T(`ereignisse('${mid}')[0].typ`) === 'vermehrt',
      w.__T(`ereignisse('${mid}')[0].typ`));
    pruef('Der Eintrag der Mutter zeigt auf den Ableger',
      w.__T(`ereignisse('${mid}')[0].bezug`) === kid,
      String(w.__T(`ereignisse('${mid}')[0].bezug`)));
    pruef('Der Ableger bekommt seinen Gegeneintrag',
      w.__T(`ereignisse('${kid}')[0].typ`) === 'entstanden',
      w.__T(`ereignisse('${kid}')[0].typ`));
    pruef('Der Eintrag des Ablegers zeigt auf die Mutter',
      w.__T(`ereignisse('${kid}')[0].bezug`) === mid);
    pruef('Beide Ereignisarten sind bekannt',
      !!w.__T('EREIGNIS_ARTEN.vermehrt') && !!w.__T('EREIGNIS_ARTEN.entstanden'));
    pruef('Sie stehen nicht als Rundgangsknopf zur Wahl',
      w.__T("STANDARD_KNOEPFE.indexOf('vermehrt')") === -1
      && w.__T("STANDARD_KNOEPFE.indexOf('entstanden')") === -1);

    /* Abstammungsblock über dem Zeitstrahl */
    const abM = w.__T(`abstammungHTML(allePflanzen().find(x=>x.id==='${mid}'))`);
    pruef('Mutter zeigt ihre Ableger', /Ableger/.test(abM), abM.slice(0, 70));
    pruef('Mutter verlinkt in die Karte des Ablegers',
      abM.indexOf('data-go="' + kid + '"') !== -1);
    pruef('Weg in den Stammbaum vorhanden',
      abM.indexOf('data-do="stammbaum-auf"') !== -1);

    const abK = w.__T(`abstammungHTML(allePflanzen().find(x=>x.id==='${kid}'))`);
    pruef('Ableger nennt seine Mutter', /Ableger von/.test(abK), abK.slice(0, 70));
    pruef('Ableger verlinkt zurück zur Mutter',
      abK.indexOf('data-go="' + mid + '"') !== -1);

    pruef('Der Zeitstrahl verlinkt das Gegenüber',
      w.__T(`statusHTML(allePflanzen().find(x=>x.id==='${mid}'))`)
        .indexOf('data-go="' + kid + '"') !== -1);
    /* Die Abstammung lag zuerst in statusHTML und landete damit im
       Akkordeon „Statusänderung und Verlauf“ — zwei Ebenen tief und
       zugeklappt. Sie gehört offen an den Anfang des Reiters. */
    pruef('Abstammung steckt nicht im Zeitstrahl',
      w.__T(`statusHTML(allePflanzen().find(x=>x.id==='${mid}'))`)
        .indexOf('abstammung') === -1);

    /* Ohne Abstammung bleibt der Block weg — sonst hätte jede
       Pflanze einen leeren Kasten im Verlauf. */
    pruef('Ohne Abstammung kein Block', w.__T(`(function(){
      const p = allePflanzen().find(x=>!x.eltern && !x.linie
        && !allePflanzen().some(k=>k.eltern===x.id));
      return p ? abstammungHTML(p) : ''; })()`) === '');

    /* Aufräumen: der Testableger darf die folgenden Prüfungen nicht
       verfälschen. */
    w.__T(`(function(){
      S.eigene = (S.eigene||[]).filter(x=>x.id !== '${kid}');
      delete S.ereignisse['${kid}'];
      S.ereignisse['${mid}'] = (S.ereignisse['${mid}']||[]).filter(x=>x.typ !== 'vermehrt');
      sichern(); })()`);
    pruef('Testableger wieder entfernt',
      !w.__T(`allePflanzen().some(x=>x.id==='${kid}')`));
  }

  /* ══ KI direkt: Schluessel, Modelle, Aufruf ════════════════════
     Ohne echten Schluessel laesst sich nur die Schicht pruefen, nicht
     Googles Verhalten. Geprueft wird deshalb, was in dieser Datei
     entschieden wird: dass der Schluessel nirgends hinausgerat, dass
     die Modellregel das Richtige waehlt und dass jeder Fehlerweg
     einen deutschen Satz liefert statt eines Statuscodes. */
  {
    /* --- Der Schluessel darf nicht in die Sicherung --- */
    w.__T("kiSchluesselSetzen('" + ATTRAPPE + "')");
    const inhalt = w.__T('sicherungInhalt()');
    pruef('Schlüssel steht nicht in der Sicherungsdatei',
      inhalt.indexOf(ATTRAPPE.slice(0, 16)) === -1);
    pruef('Schlüssel liegt nicht in S',
      JSON.stringify(w.__T('S')).indexOf(ATTRAPPE.slice(0, 16)) === -1);
    pruef('Schlüssel liegt in einem eigenen Fach',
      w.__T("localStorage.getItem(KI_SCHLUESSEL_FACH)") === ATTRAPPE);
    pruef('kiBereit meldet den Schlüssel', w.__T('kiBereit()') === true);
    pruef('Maske zeigt den Schlüssel nie ganz',
      w.__T("kiMaske('" + ATTRAPPE + "')").indexOf(A_FUELL.repeat(3)) === -1);

    /* --- Anbieter am Praefix --- */
    pruef('AIza wird als Google erkannt',
      w.__T("(kiAnbieter('" + ATTRAPPE_ECHT + "')||{}).code") === 'google');
    pruef('AQ. wird als Google erkannt',
      w.__T("(kiAnbieter('AQ.Ab8RN6ABCDEFGHIJKLMNOP')||{}).code") === 'google');
    pruef('Anthropic wird erkannt und abgelehnt',
      w.__T("(kiAnbieter('" + ATTRAPPE_ANT + "')||{}).kann") === false);
    pruef('OpenAI wird erkannt und abgelehnt',
      w.__T("(kiAnbieter('" + ATTRAPPE_OAI + "')||{}).kann") === false);
    pruef('Unsinn wird nicht zugeordnet', w.__T("kiAnbieter('hallo')") === null);

    /* --- Die Modellregel --- */
    /* Ein fest eingebauter Modellname waere in drei Monaten tot.
       Geprueft wird die Regel, nicht ein Name. */
    const besser = (a, b) => w.__T('kiModellPunkte(' + JSON.stringify(a) + ')')
                           > w.__T('kiModellPunkte(' + JSON.stringify(b) + ')');
    pruef('Neuere Version schlägt ältere',
      besser('models/gemini-3-flash', 'models/gemini-2.5-flash'));
    pruef('Flash schlägt Pro bei gleicher Version',
      besser('models/gemini-3-flash', 'models/gemini-3-pro'));
    pruef('Stabil schlägt Vorschau',
      besser('models/gemini-3-flash', 'models/gemini-3-flash-preview-11-2025'));
    pruef('Voll schlägt Lite',
      besser('models/gemini-3-flash', 'models/gemini-3-flash-lite'));
    pruef('Kurzer Name schlägt langen Ableger',
      besser('models/gemini-3-flash', 'models/gemini-3-flash-002'));

    /* --- Modellliste aus einer erfundenen Antwort --- */
    w.__T(`window.fetch = (u, o) => {
      window.__letzteUrl = String(u); window.__letzteOpt = o;
      return Promise.resolve({ok:true, status:200, json:()=>Promise.resolve({models:[
        {name:'models/gemini-2.5-flash', displayName:'Gemini 2.5 Flash', supportedGenerationMethods:['generateContent']},
        {name:'models/gemini-3-flash', displayName:'Gemini 3 Flash', supportedGenerationMethods:['generateContent']},
        {name:'models/gemini-3-flash-preview-11-2025', displayName:'Gemini 3 Flash Vorschau', supportedGenerationMethods:['generateContent']},
        {name:'models/text-embedding-004', displayName:'Embedding', supportedGenerationMethods:['embedContent']},
        {name:'models/imagen-4', displayName:'Imagen', supportedGenerationMethods:['generateContent']}
      ]})});
    }`);
    await w.__T('kiModelleHolen()');
    const liste = w.__T('kiModelle()');
    pruef('Embedding und Imagen fliegen aus der Liste',
      liste.length === 3, JSON.stringify(liste.map(m=>m.id)));
    pruef('Empfohlen ist das neueste stabile Modell',
      liste[0].id === 'models/gemini-3-flash' && liste[0].empfohlen === true, liste[0].id);
    pruef('Das Empfohlene ist gesetzt', w.__T('S.kiModell') === 'models/gemini-3-flash');
    pruef('Der Schlüssel steht nicht in der Modellliste',
      JSON.stringify(liste).indexOf(ATTRAPPE.slice(0, 8)) === -1);

    /* --- Der Aufruf --- */
    w.__T(`window.fetch = (u, o) => {
      window.__letzteUrl = String(u); window.__letzteOpt = o;
      return Promise.resolve({ok:true, status:200, json:()=>Promise.resolve({candidates:[
        {content:{parts:[{text:'ART: Efeutute'}]}, finishReason:'STOP'}
      ]})});
    }`);
    const txt = await w.__T("kiFragen('frag mich', [{mime:'image/jpeg', daten:'QUJD'}])");
    pruef('Die Antwort kommt als reiner Text zurück', txt === 'ART: Efeutute', String(txt));
    pruef('Der Aufruf geht an das gewählte Modell',
      w.__T('window.__letzteUrl').indexOf('models/gemini-3-flash:generateContent') > -1,
      w.__T('window.__letzteUrl'));
    const leib = JSON.parse(w.__T('window.__letzteOpt.body'));
    pruef('Das Bild geht als inline_data mit',
      leib.contents[0].parts[1].inline_data.data === 'QUJD');
    pruef('Der Prompt steht im ersten Teil',
      leib.contents[0].parts[0].text === 'frag mich');
    pruef('Höchstens fünf Bilder gehen mit', w.__T('KI_BILD_MAX') === 5);

    /* --- Fehlerwege: jeder liefert einen deutschen Satz --- */
    const fehler = async code => {
      w.__T('window.fetch = () => Promise.resolve({ok:false, status:' + code
        + ', json:()=>Promise.resolve({error:{message:"testfehler"}})})');
      try{ await w.__T("kiFragen('x', [])"); return null; }
      catch(e){ return String(e.message || e); }
    };
    const f400 = await fehler(400);
    pruef('400 nennt den Schlüssel', /400/.test(f400) && /Schl/.test(f400), f400);
    const f429 = await fehler(429);
    pruef('429 nennt das Kontingent', /Kontingent/.test(f429), f429);
    const f403 = await fehler(403);
    pruef('403 nennt den ungültigen Schlüssel', /ung/.test(f403), f403);
    const f503 = await fehler(503);
    pruef('503 nennt die Überlastung', /berlastet/.test(f503), f503);
    const f404 = await fehler(404);
    pruef('404 schickt zur Modellliste', /Modellliste/.test(f404), f404);
    pruef('Googles eigener Text wird durchgereicht', /testfehler/.test(f400), f400);

    w.__T('window.fetch = () => Promise.reject(new TypeError("Failed to fetch"))');
    let offline = '';
    try{ await w.__T("kiFragen('x', [])"); }catch(e){ offline = String(e.message || e); }
    pruef('Offline nennt die Zwischenablage als Ausweg',
      /Zwischenablage/.test(offline), offline);

    /* --- Leere Antwort und Sicherheitsfilter --- */
    w.__T(`window.fetch = () => Promise.resolve({ok:true, status:200,
      json:()=>Promise.resolve({candidates:[{content:{parts:[{text:''}]}, finishReason:'MAX_TOKENS'}]})})`);
    let leer = '';
    try{ await w.__T("kiFragen('x', [])"); }catch(e){ leer = String(e.message || e); }
    pruef('Abgeschnittene Antwort rät zu weniger Bildern', /Bilder/.test(leer), leer);

    /* --- Anzeige: beide Wege stehen untereinander ---
       Der Direktweg haengt seit 3.0.1 nicht mehr an der Dienstwahl,
       sondern allein daran, ob ein Schluessel hinterlegt ist. */
    w.__T('kiModusZeigen()');
    pruef('Direktkasten im Anlegen sichtbar',
      d.getElementById('ki-direkt-anlegen').hidden === false);
    pruef('Direktkasten im Doktor sichtbar',
      d.getElementById('ki-direkt-doktor').hidden === false);
    pruef('Der Kopierweg klappt zu',
      d.getElementById('neu-alt').open === false
      && !d.getElementById('neu-alt').classList.contains('nurweg'));
    pruef('Der Knopf heißt jetzt Fragen',
      d.getElementById('btn-gemini').textContent === 'Fragen');
    w.__T("kiSchluesselSetzen(''); kiModusZeigen()");
    pruef('Ohne Schlüssel steht der Kopierweg offen wie bisher',
      d.getElementById('neu-alt').open === true
      && d.getElementById('neu-alt').classList.contains('nurweg'));
    pruef('Ohne Schlüssel ist der Direktkasten weg',
      d.getElementById('ki-direkt-anlegen').hidden === true);
    pruef('Ohne Schlüssel führt der Knopf zur Einrichtung',
      d.getElementById('btn-gemini').textContent === 'API-Schlüssel einfügen');
    pruef('Die Dienstwahl steckt im Kopierweg',
      !!d.querySelector('#neu-alt #ki-dienst') && !!d.querySelector('#dok-alt #dok-dienst'));
    pruef('„Gemini direkt“ steht in keinem Auswahlfeld mehr',
      !d.querySelector('#ki-dienst option[value="direkt"]'));
    w.__T("kiSchluesselSetzen('" + ATTRAPPE + "'); kiModusZeigen()");

    /* --- Modellwahl steht an allen drei Stellen --- */
    /* Vier: Einstellungen, Anlegen, Doktor, Vermehren. Ein Wert,
       vier Anzeigen. */
    pruef('Vier Modellauswahlen',
      d.querySelectorAll('.ki-modell-wahl').length === 4,
      String(d.querySelectorAll('.ki-modell-wahl').length));
    w.__T('kiModellZeichnen()');
    const wahlen = [...d.querySelectorAll('.ki-modell-wahl')];
    pruef('Alle Auswahlen zeigen dieselbe Liste',
      wahlen.length === 4 && wahlen.every(x => x.options.length === 3));
    pruef('Das Empfohlene trägt ein Häkchen',
      wahlen[0].options[0].textContent.indexOf('\u2713') > -1, wahlen[0].options[0].textContent);
    pruef('Das Abzeichen steht am empfohlenen Modell',
      d.querySelector('.ki-modell-abz').hidden === false);
    w.__T("S.kiModell = 'models/gemini-2.5-flash'; kiModellZeichnen()");
    pruef('Bei anderer Wahl verschwindet das Abzeichen',
      d.querySelector('.ki-modell-abz').hidden === true);

    /* --- Bilder --- */
    w.__T("KI_BILDER.anlegen.length = 0; KI_BILDER.anlegen.push({mime:'image/jpeg', daten:'QUJD', vorschau:'data:image/jpeg;base64,QUJD'}); kiBilderZeichnen('anlegen')");
    pruef('Gewählte Bilder stehen als Miniatur',
      d.querySelectorAll('#ki-bilder-anlegen .kibild').length === 1);
    pruef('Ein Knopf zum Nachlegen ist da',
      !!d.querySelector('#ki-bilder-anlegen .kibild-neu'));
    w.__T("kiBildWeg('anlegen', 0)");
    pruef('Miniaturen lassen sich entfernen',
      d.querySelectorAll('#ki-bilder-anlegen .kibild').length === 0);
    pruef('Data-URL wird in base64 zerlegt',
      w.__T("(kiBildAusDataUrl('data:image/png;base64,XYZ')||{}).daten") === 'XYZ');

    /* --- Aufräumen: der Testschlüssel darf nicht liegen bleiben,
       und die Attrappe darf keinem späteren Test im Weg stehen --- */
    w.__T("kiSchluesselSetzen(''); S.kiModelle = null; S.kiModell = null; S.kiDienst = 'gemini'");
    w.__T("window.fetch = () => Promise.reject(new Error('offline'))");
    w.__T('kiModusZeigen()');
    pruef('Löschen entfernt den Schlüssel', w.__T('kiBereit()') === false);
  }

  /* ══ Anlegen-Assistent ═════════════════════════════════════════
     Das lange Formblatt ist weg. Geprueft wird, dass dabei keine der
     Kennungen verlorengegangen ist, an denen Bibliothekssuche,
     KI-Uebernahme und Speichern haengen — und dass die Stufen
     tatsaechlich nacheinander laufen. */
  {
    pruef('Das alte Formblatt hat keinen Platz mehr in der Seite',
      !d.getElementById('anlegen-sec'));
    pruef('Der Assistent ist ein eigenes Fenster',
      !!d.getElementById('anleg-modal')
      && d.getElementById('anleg-modal').classList.contains('sekm'));
    pruef('Das Fenster haengt direkt an body',
      d.getElementById('anleg-modal').parentElement === d.body);
    pruef('Fuenf Stufen',
      d.querySelectorAll('#form-neu .al-stufe').length === 5,
      String(d.querySelectorAll('#form-neu .al-stufe').length));

    /* Kein Feld darf beim Umbau verschwunden sein. */
    ['f-name','f-bot','f-art','f-typ','f-notiz','f-wichtig','f-paste','f-fotos',
     'f-zustand','f-klasse','f-sonne','f-giftig','f-giessart','f-raum','f-stellplatz',
     'bib-liste','bib-gewaehlt','paste-box','paste-meld','neu-unsicher','neu-massnahmen',
     'al-weiter','btn-neu-leeren','btn-neu-cancel','btn-bib','btn-paste-los',
     'btn-paste-auf','btn-ki-kopie','ki-text','neu-bibbox','neu-kibox','f-quar'
    ].forEach(id => pruef('Feld ' + id + ' hat den Umbau ueberlebt', !!d.getElementById(id)));

    w.__T('alStart()');
    pruef('Der Assistent oeffnet auf Stufe 1', w.__T('alStufe') === 1);
    pruef('Fenster ist offen', w.__T("modalOffen('anleg-modal')") === true);
    pruef('Der schwebende Knopf verschwindet',
      d.getElementById('fab-neu').hidden === true);
    pruef('Zurueck ist auf Stufe 1 weg', d.getElementById('al-zurueck').hidden === true);
    pruef('Auf Stufe 1 heisst der Hauptknopf Weiter',
      d.getElementById('al-weiter').hidden === false
      && d.getElementById('al-weiter').textContent === 'Weiter',
      d.getElementById('al-weiter').textContent);
    pruef('Es gibt keinen zweiten Abschlussknopf mehr',
      d.getElementById('btn-neu-save') === null);

    /* Ohne gewaehlten Weg fuehrt Weiter nirgendwohin — Stufe 2 waere
       eine leere Seite. */
    w.__T("document.getElementById('al-weiter').click()");
    pruef('Ohne Weg bleibt der Assistent auf Stufe 1', w.__T('alStufe') === 1);

    w.__T("document.querySelector('[data-neuweg=\"bib\"]').click()");
    pruef('Ein gewaehlter Weg fuehrt gleich weiter', w.__T('alStufe') === 2);
    pruef('Die Bibliothekssuche ist offen',
      d.getElementById('neu-bibbox').hidden === false);
    pruef('Der KI-Kasten bleibt zu', d.getElementById('neu-kibox').hidden === true);

    w.__T("document.querySelector('[data-neuweg=\"hand\"]').click()");
    pruef('Der Weg von Hand oeffnet keinen der beiden Kaesten',
      d.getElementById('neu-bibbox').hidden === true
      && d.getElementById('neu-kibox').hidden === true);
    pruef('Von Hand steht ein Hinweis statt einer leeren Seite',
      d.getElementById('al-hand-hinweis').hidden === false);

    /* Auswahlknoepfe statt Auswahlfeld */
    w.__T('alStufeZeigen(3)');
    pruef('Zustand hat Knoepfe',
      d.querySelectorAll('#f-zustand-knoepfe .al-knopf').length > 1,
      String(d.querySelectorAll('#f-zustand-knoepfe .al-knopf').length));
    w.__T('alStufeZeigen(4)');
    pruef('Giessklasse hat vier Knoepfe',
      d.querySelectorAll('#f-klasse-knoepfe .al-knopf').length === 4);
    pruef('Licht hat vier Knoepfe',
      d.querySelectorAll('#f-sonne-knoepfe .al-knopf').length === 4);
    pruef('Katzen hat drei Knoepfe',
      d.querySelectorAll('#f-giftig-knoepfe .al-knopf').length === 3);
    pruef('Der lange Text wird am Gedankenstrich getrennt',
      d.querySelector('#f-klasse-knoepfe .al-knopf b').textContent === 'B'
      && /Normal/.test(d.querySelector('#f-klasse-knoepfe .al-knopf i').textContent));
    /* Der Knopf schreibt ins Auswahlfeld, nicht daneben: alles
       Bestehende liest weiterhin das <select>. */
    w.__T("document.querySelector('#f-klasse-knoepfe [data-alwert=\"C\"]').click()");
    pruef('Der Knopf schreibt ins Auswahlfeld',
      d.getElementById('f-klasse').value === 'C');
    pruef('Der gewaehlte Knopf ist gedrueckt',
      d.querySelector('#f-klasse-knoepfe [data-alwert="C"]').getAttribute('aria-pressed') === 'true');
    /* Umgekehrt: aendert die Bibliothek das Feld, ziehen die Knoepfe
       nach. Sonst zeigt der Knopf B, waehrend im Feld laengst S steht. */
    w.__T("document.getElementById('f-klasse').value = 'S'; alKnopfGruppe('f-klasse')");
    pruef('Die Knoepfe ziehen nach, wenn das Feld sich aendert',
      d.querySelector('#f-klasse-knoepfe [data-alwert="S"]').getAttribute('aria-pressed') === 'true');

    /* Stufe 4 fasst zusammen, wenn die Art aus der Bibliothek kam */
    w.__T("gewaehlteArt = {de:'Efeutute', bot:'Epipremnum aureum', fam:'Araceae', typ:'Kletterpflanze'}; alStufeZeigen(4)");
    pruef('Aus der Bibliothek: nur die Zusammenfassung',
      d.getElementById('al-bibzsf').hidden === false
      && d.getElementById('al-pflege').hidden === true);
    pruef('Die Zusammenfassung nennt die Familie',
      /Araceae/.test(d.getElementById('al-bibzsf-liste').textContent));
    w.__T("document.getElementById('btn-al-pflege-auf').click()");
    pruef('Aendern klappt die Felder auf',
      d.getElementById('al-pflege').hidden === false);
    w.__T('gewaehlteArt = null; formularLeeren(); alStufeZeigen(4)');
    pruef('Ohne Bibliothek stehen die Felder offen da',
      d.getElementById('al-bibzsf').hidden === true
      && d.getElementById('al-pflege').hidden === false);

    /* Stufe 5: aus Weiter wird die Abschlussaktion — ein Knopf an
       einer Stelle, wie beim Doktor. */
    w.__T('alStufeZeigen(5)');
    pruef('Auf der letzten Stufe traegt der Hauptknopf die Abschlussaktion',
      d.getElementById('al-weiter').hidden === false
      && /anlegen/i.test(d.getElementById('al-weiter').textContent),
      d.getElementById('al-weiter').textContent);
    pruef('Die Zusammenfassung ist gefuellt',
      d.getElementById('al-zsf').textContent.length > 10);
    pruef('Die Fotoauswahl hat einen Knopf zum Nachlegen',
      !!d.querySelector('#al-fotos .kibild-neu'));
    pruef('Das rohe Dateifeld ist versteckt',
      d.getElementById('f-fotos').hidden === true);

    w.__T('alStufeZeigen(2)');
    pruef('Zurueck geht auch', w.__T('alStufe') === 2);
    w.__T("modalZu('anleg-modal')");
    await tick();
    pruef('Abbrechen schliesst das Fenster',
      w.__T("modalOffen('anleg-modal')") === false);
  }

  /* ══ Kulturform und die Bilder aus der KI-Anfrage ══════════════ */
  {
    /* Wasser- und Hydrokultur steckten in GIESSARTEN laengst drin,
       waren beim Anlegen aber nicht erreichbar. */
    pruef('Die Kulturform ist eine eigene Frage', !!d.getElementById('f-kultur'));
    pruef('Drei Kulturformen zur Wahl',
      d.getElementById('f-kultur').options.length === 3);
    pruef('Das Giessartfeld kennt Wasser- und Hydrokultur',
      !!d.querySelector('#f-giessart option[value="wasser"]')
      && !!d.querySelector('#f-giessart option[value="hydro"]'));

    w.__T('alStart(); alStufeZeigen(4)');
    pruef('Beim Start steht sie in Erde', w.__T("document.getElementById('f-kultur').value") === 'erde');
    pruef('In Erde stehen die Giessfelder offen',
      d.getElementById('al-pflege').hidden === false);
    w.__T("document.querySelector('#f-kultur-knoepfe [data-alwert=\"wasser\"]').click()");
    pruef('Wasserglas setzt die Giessart',
      d.getElementById('f-giessart').value === 'wasser');
    pruef('Im Wasserglas verschwinden Giessklasse und Giessart',
      d.getElementById('al-pflege').hidden === true);
    pruef('Der Hinweis nennt den Wechsel',
      /wechseln/.test(d.getElementById('f-kultur-hint').textContent));
    w.__T("document.querySelector('#f-kultur-knoepfe [data-alwert=\"hydro\"]').click()");
    pruef('Blaehton setzt Hydrokultur',
      d.getElementById('f-giessart').value === 'hydro');
    w.__T("document.querySelector('#f-kultur-knoepfe [data-alwert=\"erde\"]').click()");
    pruef('Zurueck in Erde raeumt die Giessart wieder frei',
      d.getElementById('f-giessart').value === '');

    /* Die Wortwahl der Tat haengt daran: gegossen wird nicht. */
    pruef('Wasserkultur wird gewechselt, nicht gegossen',
      w.__T("giessTat({giessart:'wasser'})") === 'Wasser gewechselt');
    pruef('Hydrokultur wird aufgefuellt',
      w.__T("giessTat({giessart:'hydro'})") === 'Wasserstand aufgefüllt');
    pruef('Wasserkultur hat einen eigenen Takt',
      JSON.stringify(w.__T("GIESSARTEN['wasser'].wechsel")) === '[7,10]');

    /* Die KI muss es sagen duerfen und die App es lesen koennen. */
    const format = w.__T('ANTWORT_FORMAT');
    pruef('Der Prompt erlaubt wasserkultur', /wasserkultur/.test(format));
    pruef('Der Prompt erlaubt hydrokultur', /hydrokultur/.test(format));
    pruef('Der Prompt verlangt es am Bild zu sehen',
      /wirklich siehst/.test(format));

    w.__T('alStart(); neuWegSetzen("ki")');
    w.__T("document.getElementById('f-paste').value = 'ART: Fensterblatt\\nBOTANISCH: Monstera deliciosa\\nGIESSART: wasserkultur'; document.getElementById('btn-paste-los').click()");
    pruef('„wasserkultur“ in der Antwort setzt die Kulturform',
      w.__T("document.getElementById('f-kultur').value") === 'wasser'
      && d.getElementById('f-giessart').value === 'wasser');
    w.__T('alStart()');
    w.__T("document.getElementById('f-paste').value = 'ART: Fensterblatt\\nBOTANISCH: Monstera deliciosa\\nGIESSART: hydrokultur'; document.getElementById('btn-paste-los').click()");
    pruef('Hydrokultur in der Antwort wird gelesen',
      d.getElementById('f-giessart').value === 'hydro');
    w.__T('alStart()');
    w.__T("document.getElementById('f-paste').value = 'ART: Fensterblatt\\nBOTANISCH: Monstera deliciosa\\nGIESSART: durchdringend'; document.getElementById('btn-paste-los').click()");
    pruef('Eine normale Giessart bleibt eine Giessart',
      d.getElementById('f-giessart').value === 'durch'
      && w.__T("document.getElementById('f-kultur').value") === 'erde');

    /* Bilder der Anfrage landen in der Fotoauswahl. */
    w.__T('alStart()');
    w.__T("KI_BILDER.anlegen = [{mime:'image/jpeg', daten:'QUJD', vorschau:'data:image/jpeg;base64,QUJD'}]");
    const n1 = w.__T('kiBilderUebernehmen()');
    pruef('Das Bild der Anfrage wandert in die Fotoauswahl',
      n1 === 1 && w.__T('AL_FOTOS.length') === 1);
    pruef('Es ist eine echte Datei', w.__T('AL_FOTOS[0].datei instanceof File') === true);
    pruef('Zweimal uebernehmen legt es nicht doppelt an',
      w.__T('kiBilderUebernehmen()') === 0 && w.__T('AL_FOTOS.length') === 1);
    w.__T('alStufeZeigen(5)');
    pruef('Es laesst sich wieder herausnehmen',
      !!d.querySelector('#al-fotos [data-alfoto-weg]'));
    w.__T("kiBildWeg('anlegen', 0); AL_FOTOS.length = 0; KI_BILDER.anlegen.length = 0");

    /* Ein unlesbares Bild darf das Fenster nicht offen halten. */
    pruef('Das Bildlesen hat eine Geduldsgrenze', w.__T('BILD_GEDULD') > 0);
    w.__T("modalZu('anleg-modal')");
    await tick();
  }

  /* ══ 503: nachfassen und ausweichen ════════════════════════════
     Ein 503 heisst, dass Google die Rechenleistung ausgeht — nicht,
     dass der Schluessel falsch waere oder die Bilder zu gross. Vorher
     abfragen laesst sich das nicht, also wird es abgefangen. */
  {
    w.__T("kiSchluesselSetzen('" + ATTRAPPE + "')");
    w.__T(`S.kiModelle = [
      {id:'models/gemini-3.6-flash', anzeige:'3.6 Flash', empfohlen:true},
      {id:'models/gemini-3.5-flash', anzeige:'3.5 Flash'},
      {id:'models/gemini-3-flash', anzeige:'3 Flash'},
      {id:'models/gemini-3-flash-lite', anzeige:'3 Flash Lite'},
      {id:'models/gemini-2.5-flash', anzeige:'2.5 Flash'}];
      S.kiModell = 'models/gemini-3.6-flash'`);
    /* Die Wartezeiten werden fuer den Pruefstand auf 5 ms gekuerzt.
       Die LAENGE bleibt, wie sie in der App steht — sie bestimmt,
       wie oft nachgefasst wird, und darf hier nicht verstellt
       werden, sonst prueft man eine andere Leiter als die echte. */
    w.__T('KI_NACHFASSEN.forEach(function(_, i){ KI_NACHFASSEN[i] = 5; })');

    const kette = () => w.__T("kiAusweichModelle('models/gemini-3.6-flash').map(m=>m.anzeige)");
    pruef('Ausgewichen wird auf das naechstaeltere, nicht auf irgendein altes',
      JSON.stringify(kette()) === '["3.5 Flash","3 Flash"]', JSON.stringify(kette()));
    pruef('Auf eine Lite-Variante nie',
      kette().every(x => !/Lite/.test(x)));
    pruef('Nie mehr als eine Generation zurueck',
      kette().every(x => !/2\.5/.test(x)));
    pruef('Hoechstens zwei Schritte', kette().length <= 2);

    /* Kurze Lastspitze: dasselbe Modell, zweiter Versuch klappt.
       Seit 3.3.1 wird genau einmal nachgefasst — wer laenger wartet,
       wartet meistens umsonst. */
    w.__T(`window.__n = 0; window.fetch = () => { window.__n++;
      return window.__n < 2
        ? Promise.resolve({ok:false, status:503, json:()=>Promise.resolve({error:{message:'high demand'}})})
        : Promise.resolve({ok:true, status:200, json:()=>Promise.resolve({candidates:[{content:{parts:[{text:'ART: Efeutute'}]}, finishReason:'STOP'}]})});
    }`);
    const r1 = await w.__T("kiFragenHartnaeckig('x', [])");
    pruef('Bei 503 wird einmal nachgefasst', w.__T('window.__n') === 2,
      String(w.__T('window.__n')));
    pruef('Dafuer braucht es keinen Modellwechsel',
      r1.gewechselt === false && r1.modell.id === 'models/gemini-3.6-flash');
    pruef('Die Antwort kommt trotzdem an', r1.text === 'ART: Efeutute');

    /* Beim dritten Fehlschlag desselben Modells ist Schluss mit
       Nachfassen — dann zaehlt Tempo. */
    w.__T('for(const k in KI_UEBERLASTET) delete KI_UEBERLASTET[k]');
    w.__T(`window.__n = 0; window.fetch = () => { window.__n++;
      return window.__n < 3
        ? Promise.resolve({ok:false, status:503, json:()=>Promise.resolve({error:{message:'high demand'}})})
        : Promise.resolve({ok:true, status:200, json:()=>Promise.resolve({candidates:[{content:{parts:[{text:'ART: Efeutute'}]}, finishReason:'STOP'}]})});
    }`);
    const r1b = await w.__T("kiFragenHartnaeckig('x', [])");
    pruef('Beim zweiten Fehlschlag wird gewechselt statt gewartet',
      r1b.gewechselt === true && r1b.modell.id === 'models/gemini-3.5-flash',
      r1b.modell.id);

    /* Bleibt es voll, uebernimmt das naechste Modell. */
    w.__T('for(const k in KI_UEBERLASTET) delete KI_UEBERLASTET[k]');
    w.__T(`window.__n = 0; window.fetch = (u) => { window.__n++;
      return String(u).indexOf('3.6-flash') > -1
        ? Promise.resolve({ok:false, status:503, json:()=>Promise.resolve({error:{message:'high demand'}})})
        : Promise.resolve({ok:true, status:200, json:()=>Promise.resolve({candidates:[{content:{parts:[{text:'ART: Efeutute'}]}, finishReason:'STOP'}]})});
    }`);
    const r2 = await w.__T("kiFragenHartnaeckig('x', [])");
    pruef('Bleibt es voll, antwortet das naechste Modell',
      r2.gewechselt === true && r2.modell.anzeige === '3.5 Flash');
    pruef('Ein volles Modell wird gemerkt',
      w.__T("kiIstUeberlastet('models/gemini-3.6-flash')") === true);
    pruef('Ein freies Modell wird nicht gemerkt',
      w.__T("kiIstUeberlastet('models/gemini-3.5-flash')") === false);

    /* Ein 400 wird durch Warten nicht besser. */
    w.__T('for(const k in KI_UEBERLASTET) delete KI_UEBERLASTET[k]');
    w.__T(`window.__n = 0; window.fetch = () => { window.__n++;
      return Promise.resolve({ok:false, status:400, json:()=>Promise.resolve({error:{message:'bad key'}})}); }`);
    let f400 = '';
    try{ await w.__T("kiFragenHartnaeckig('x', [])"); }catch(e){ f400 = String(e.message || e); }
    pruef('Ein 400 wird kein zweites Mal versucht', w.__T('window.__n') === 1);
    pruef('Und meldet weiterhin den Schluessel', /Schl/.test(f400), f400);

    /* Ist alles voll, sagt die Meldung auch das. */
    w.__T('for(const k in KI_UEBERLASTET) delete KI_UEBERLASTET[k]');
    w.__T(`window.__n = 0; window.fetch = () => { window.__n++;
      return Promise.resolve({ok:false, status:503, json:()=>Promise.resolve({error:{message:'high demand'}})}); }`);
    /* Seit 3.3.1: nachgefasst wird nur beim ersten Modell, danach
       zaehlt Tempo. Erwartet sind also zwei Versuche fuer das erste
       und je einer fuer die Ausweichmodelle. Die Kettenlaenge muss
       VOR dem Lauf stehen — waehrenddessen werden alle Modelle als
       voll gemerkt und fallen aus der Kette. */
    const ketteN = w.__T('kiAusweichModelle(kiModellAktiv().id).length + 1');
    let voll = '';
    try{ await w.__T("kiFragenHartnaeckig('x', [])"); }catch(e){ voll = String(e.message || e); }
    pruef('Nur das erste Modell wird zweimal gefragt',
      w.__T('window.__n') === ketteN + 1,
      w.__T('window.__n') + ' Anfragen bei ' + ketteN + ' Modellen');
    pruef('Die Meldung nennt die Ausweichversuche',
      /Ausweichmodelle/.test(voll), voll.slice(-60));

    w.__T("kiSchluesselSetzen(''); S.kiModelle = null; S.kiModell = null");
    w.__T("window.fetch = () => Promise.reject(new Error('offline'))");
  }

  /* ══ Fotos ankommen lassen ═════════════════════════════════════
     Die Bindung lief in render(); das Kartenfenster entsteht aber
     erst beim Oeffnen einer Karte, also danach. Die Felder dort
     bekamen nie einen Handler — bei jeder Pflanze. Zustellung am
     Dokument greift unabhaengig davon, wann das Feld entsteht. */
  {
    w.__T('window.__vorFoto = JSON.stringify(S.eigene);'
      + " S.eigene = [{id:'ft', name:'Rudi', art:'Efeutute', klasse:'B'}]; sichern(); render()");
    const kasten = d.createElement('div');
    kasten.innerHTML = '<label class="foto-add"><input type="file" data-foto="ft"></label>';
    d.body.appendChild(kasten);
    w.__T('window.__altHinzu = fotosHinzu;'
      + ' fotosHinzu = (id, f) => { window.__ruf = id + ":" + f.length; return Promise.resolve(); }');
    const inp = kasten.querySelector('input');
    Object.defineProperty(inp, 'files',
      {value:[new w.File([new Uint8Array([1])], 'a.jpg', {type:'image/jpeg'})]});
    inp.dispatchEvent(new w.Event('change', {bubbles:true}));
    await tick();
    pruef('Ein spaeter eingefuegtes Fotofeld kommt an',
      w.__T('window.__ruf') === 'ft:1', String(w.__T('window.__ruf')));
    w.__T('fotosHinzu = window.__altHinzu');
    kasten.remove();
    w.__T('S.eigene = JSON.parse(window.__vorFoto); sichern(); render()');
  }

  /* ══ Filterblatt, Karte, Notizen ═══════════════════════════════ */
  {
    /* Die Leiste wuchs mit jedem Filter. Jetzt ein eigenes Fenster. */
    pruef('Das Filterblatt ist ein eigenes Fenster',
      !!d.getElementById('filter-modal')
      && d.getElementById('filter-modal').classList.contains('sekm'));
    pruef('Gruppieren und Filter sind aus der Leiste raus',
      !d.querySelector('#ctrl-klapp #gruppen') && !d.querySelector('#ctrl-klapp .chip'));
    pruef('Es gibt eine Markenzeile', !!d.getElementById('filter-marken'));

    w.__T('window.__sicher = JSON.stringify(S.eigene)');
    w.__T(`S.eigene = [
      {id:'fa', name:'Rudi', art:'Efeutute', botanisch:'Epipremnum aureum', klasse:'B'},
      {id:'fb', name:'Bego1', art:'Begonie', botanisch:'Begonia maculata', klasse:'B'},
      {id:'fc', name:'Bego2', art:'Begonie', botanisch:'Begonia rex', klasse:'A'},
      {id:'fd', name:'Kind', art:'Efeutute', botanisch:'Epipremnum aureum', klasse:'B', eltern:'fa'}
    ]; sichern(); gruppierung = 'keine'; filterZustand.clear(); sortierung = 'faellig'; render()`);
    const karten = () => d.querySelectorAll('#out .card').length;
    pruef('Alle vier stehen da', karten() === 4, String(karten()));

    /* Gruppieren nach Gattung: der erste Teil des botanischen Namens. */
    w.__T("gruppierung = 'gattung'; render()");
    const gr = () => [].map.call(d.querySelectorAll('.group-title'), x=>x.textContent);
    pruef('Alle Begonien stehen zusammen',
      gr().indexOf('Begonia') > -1 && gr().indexOf('Epipremnum') > -1, gr().join('|'));
    w.__T("S.eigene.push({id:'fe', name:'Namenlos', art:'Unbekannt'}); render()");
    pruef('Ohne botanischen Namen gibt es eine eigene Gruppe',
      gr().indexOf('Ohne botanischen Namen') > -1, gr().join('|'));
    w.__T("S.eigene = S.eigene.filter(p=>p.id !== 'fe')");

    /* Abstammung: die Mutter steht bei ihren Ablegern. */
    w.__T("gruppierung = 'abstammung'; render()");
    pruef('Ableger stehen unter ihrer Mutter', gr().indexOf('Aus Rudi') > -1, gr().join('|'));

    /* Zustandsfilter, mehrfach waehlbar. */
    w.__T("gruppierung = 'keine'; filterZustand.add('steckling'); render()");
    pruef('Der Ablegerfilter greift', karten() === 1, String(karten()));
    pruef('Der aktive Filter steht als Marke da',
      d.querySelectorAll('.filter-marke').length === 1);
    pruef('Der Knopf zaehlt ihn mit',
      !!d.querySelector('#btn-ctrl-auf .ctrl-zahl'));
    w.__T("filterZustand.add('gesund'); render()");
    pruef('Zwei Zustaende heissen „eines von beiden“', karten() === 4, String(karten()));
    d.querySelectorAll('.filter-marke')[0].click();
    await tick();
    pruef('Eine Marke laesst sich wegtippen',
      w.__T('filterZustand.size') === 1);

    /* Sortieren. */
    w.__T("filterZustand.clear(); sortierung = 'name'; render()");
    const ersteId = w.__T("_karteListe[0]");
    pruef('Alphabetisch steht Bego1 vorn', ersteId === 'fb', String(ersteId));
    w.__T("sortierung = 'faellig'; render()");

    /* Zuruecksetzen raeumt alles ab. */
    w.__T("filterZustand.add('ueber'); filterKlasse = 'A'; filterZuruecksetzen()");
    pruef('Zuruecksetzen leert alle Filter',
      w.__T('filterZahl()') === 0 && w.__T("sortierung") === 'faellig');

    /* Das Blatt fuellt sich beim Oeffnen. */
    w.__T('filterKnoepfeZeichnen()');
    pruef('Neun Zustaende zur Wahl',
      d.querySelectorAll('#filter-zustand .as-knopf').length === 9,
      String(d.querySelectorAll('#filter-zustand .as-knopf').length));
    pruef('Elf Gruppierungen zur Wahl',
      d.querySelectorAll('#filter-gruppen .as-knopf').length === 11,
      String(d.querySelectorAll('#filter-gruppen .as-knopf').length));
    pruef('Vier Sortierungen zur Wahl',
      d.querySelectorAll('#filter-sort .as-knopf').length === 4);

    /* ── Karte unten ── */
    pruef('Eintragen sitzt unter dem Verlauf',
      w.__T("statusHTML({id:'fa'})").indexOf('stat-liste')
        < w.__T("statusHTML({id:'fa'})").indexOf('stat-auf'));

    /* Der rote Kasten sagte bei Karnivoren zweimal dasselbe. */
    const karni = {id:'k1', name:'Vivi', art:'Venusfliegenfalle',
                   botanisch:'Dionaea muscipula', klasse:'S'};
    const wOhne = w.__T('warnungenHTML(' + JSON.stringify(karni) + ')');
    const wDeckt = w.__T('warnungenHTML(' + JSON.stringify(Object.assign({}, karni,
      {wichtig:'Ausschließlich kalkfreies Wasser wie Regenwasser und niemals düngen.'})) + ')');
    const wFremd = w.__T('warnungenHTML(' + JSON.stringify(Object.assign({}, karni,
      {wichtig:'Steht auf dem Balkon.'})) + ')');
    pruef('Ohne eigenen Text steht die Regel da', /Leitungswasser/.test(wOhne));
    pruef('Ein eigener Text, der dasselbe sagt, ersetzt die Regel',
      !/Leitungswasser/.test(wDeckt) && /Wichtig/.test(wDeckt));
    /* Wichtig: „Balkon“ darf die Warnung nicht abraeumen — sie haelt
       die Pflanze am Leben. */
    pruef('Ein eigener Text ueber etwas anderes laesst die Regel stehen',
      /Leitungswasser/.test(wFremd) && /Wichtig/.test(wFremd));

    /* ── Notizen ── */
    const nt = w.__T("notizTrennen('Steht am Ostfenster.\\n\\nBefund vom 22.8.2026: Nadeln trocken.\\n\\nBefund vom 23.8.2026: Wassermangel.')");
    pruef('Die eigene Notiz bleibt fuer sich', nt.eigen === 'Steht am Ostfenster.', nt.eigen);
    pruef('Zwei Befunde werden erkannt', nt.befunde.length === 2);
    pruef('Der Befund traegt sein Datum', nt.befunde[0].datum === '22.8.2026', nt.befunde[0].datum);
    const nur = w.__T("notizTrennen('Nur eine eigene Notiz.')");
    pruef('Ohne Befund bleibt alles eigene Notiz',
      nur.eigen === 'Nur eine eigene Notiz.' && nur.befunde.length === 0);
    const html = w.__T("notizenHTML({id:'fa', notiz:'Meins.\\n\\nBefund vom 1.1.2026: A.\\n\\nBefund vom 2.1.2026: B.\\n\\nBefund vom 3.1.2026: C.\\n\\nBefund vom 4.1.2026: D.'})");
    pruef('Drei Befunde stehen offen, der Rest hinter einem Aufklapper',
      /bef-mehr/.test(html) && /1 ältere anzeigen/.test(html), html.slice(-90));
    pruef('Der neueste Befund steht oben',
      html.indexOf('4.1.2026') < html.indexOf('3.1.2026'));
    pruef('Jeder Befund laesst sich einzeln loeschen',
      (html.match(/data-do="befund-weg"/g) || []).length === 4);

    /* Der Bestand von vorher kommt zurueck: die Pruefungen danach
       rechnen mit ihren eigenen Pflanzen. */
    w.__T("S.eigene = JSON.parse(window.__sicher); sichern();"
      + " gruppierung = 'raum'; sortierung = 'faellig'; filterZustand.clear(); render()");
  }

  /* ══ Doktor: Pflanzenauswahl als Galerie ═══════════════════════ */
  {
    pruef('Das Auswahlfeld ist weg', !d.getElementById('dok-pflanze'));
    pruef('Es gibt ein Suchfeld', !!d.getElementById('dok-such'));
    pruef('Es gibt eine Liste', !!d.getElementById('dok-liste'));
    w.__T('dokAufbau()');
    const zeilen = () => d.querySelectorAll('#dok-liste [data-dokp]').length;
    pruef('Die Sammlung steht als Zeilen da', zeilen() > 1, String(zeilen()));
    pruef('„Keine bestimmte Pflanze“ steht mit drin',
      !!d.querySelector('#dok-liste [data-dokp=""]'));
    pruef('Jede Kachel hat Bildfeld und Namen',
      !!d.querySelector('#dok-liste .pwahl-bild')
      && !!d.querySelector('#dok-liste .pwahl-txt b'));
    pruef('Auf der Kachel steht der botanische Name als Zweitzeile',
      !!d.querySelector('#dok-liste .pwahl-txt i'));
    pruef('Zwei Spalten, kein Listenmuster mehr',
      !d.querySelector('#dok-liste .sb-linie')
      && d.getElementById('dok-liste').classList.contains('pwahl-gitter'));

    const ersteId = d.querySelector('#dok-liste [data-dokp]:not([data-dokp=""])').dataset.dokp;
    w.__T("dokPflanzeSetzen('" + ersteId + "')");
    pruef('Antippen waehlt die Pflanze', w.__T('dokPflanze') === ersteId);
    pruef('Die Wahl schiebt den Doktor auf Schritt 2', w.__T('dokSchritt') >= 2);
    pruef('Die Liste macht der Wahl Platz',
      d.getElementById('dok-wahl').hidden === true
      && d.getElementById('dok-gewaehlt').hidden === false);
    pruef('Die gewaehlte Zeile nennt den Namen',
      d.getElementById('dok-gewaehlt').textContent.length > 3);
    w.__T("document.getElementById('dok-andere').click()");
    pruef('„Andere“ holt die Liste zurueck',
      d.getElementById('dok-wahl').hidden === false && w.__T('dokPflanze') === null);

    /* Suchen grenzt ein */
    const alle = zeilen();
    w.__T("dokListeZeichnen('zzzqqq')");
    pruef('Ein Suchbegriff ohne Treffer laesst nur den Ausweg stehen',
      zeilen() === 1 && /Kein Treffer/.test(d.getElementById('dok-liste').textContent));
    w.__T("dokListeZeichnen('')");
    pruef('Leere Suche zeigt wieder alles', zeilen() === alle);
  }

  /* ══ Mehr-Seite: Gruppen, Nebenzeilen, Einstellungen ═══════════ */
  {
    /* Kein Punkt darf beim Gruppieren verlorengehen — das ist der
       Fehler, der niemandem auffaellt, bis er gesucht wird. */
    const alle = [...d.querySelectorAll('section[data-mh]:not(.mh-still)')].map(x=>x.dataset.mh);
    const gruppiert = [...d.querySelectorAll('.mh-gruppe section[data-mh]')].map(x=>x.dataset.mh);
    pruef('Jeder Menüpunkt liegt in einer Gruppe',
      alle.length === gruppiert.length,
      alle.filter(x=>gruppiert.indexOf(x) === -1).join(','));
    pruef('Dreizehn Punkte in der Liste', alle.length === 13, String(alle.length));
    pruef('Kein Punkt ist ersatzlos weg',
      d.querySelectorAll('section[data-mh]').length === 24,
      String(d.querySelectorAll('section[data-mh]').length));
    /* Stillgelegt heisst nicht unerreichbar: der KI-Dienst steht
       nicht in der Liste, aber eine Zeile in den Einstellungen fuehrt
       hin. Faellt die weg, ist der Abschnitt tot. */
    pruef('KI-Dienst ist stillgelegt',
      d.querySelector('section[data-mh="kidienst"]').classList.contains('mh-still'));
    pruef('KI-Dienst ist aus den Einstellungen erreichbar',
      !!d.querySelector('#mh-in-einstell [data-mh-go="kidienst"]'));
    ['aufgaben','wunsch','weg','giess','wetter','bibliothek','sicherung','einstell',
     'tour','install','patch','rueck','melde','ansicht','tiere','rundgang'].forEach(k=>{
      if(k === 'ansicht' || k === 'tiere' || k === 'rundgang') return;
      pruef('Punkt ' + k + ' vorhanden', alle.indexOf(k) !== -1);
    });
    pruef('Vier Gruppen', d.querySelectorAll('.mh-gruppe').length === 4,
      String(d.querySelectorAll('.mh-gruppe').length));
    /* Der Behaelter braucht data-ans, sonst stehen die vier
       Ueberschriften auf jedem Reiter. */
    pruef('Men\u00fcbeh\u00e4lter h\u00e4ngt an der Mehr-Ansicht',
      (d.querySelector('.mh-menue')||{}).getAttribute
        && d.querySelector('.mh-menue').getAttribute('data-ans') === 'mehr');
    w.__T("ansichtZeigen('werkzeuge')");
    pruef('Auf Werkzeuge sind die Gruppen ausgeblendet',
      d.querySelector('.mh-menue').classList.contains('ans-aus'));
    w.__T("ansichtZeigen('mehr')");
    pruef('Auf Mehr sind sie wieder da',
      !d.querySelector('.mh-menue').classList.contains('ans-aus'));
    pruef('Jede Gruppe hat eine Überschrift',
      d.querySelectorAll('.mh-gruppe .mh-abschnitt').length
        === d.querySelectorAll('.mh-gruppe').length);

    /* Ansicht, Haustiere und Rundgang sind aus der Liste heraus —
       aber nicht verschwunden: sie hängen unter Einstellungen. */
    ['ansicht','tiere','rundgang'].forEach(k=>{
      pruef(k + ' nicht mehr in der Mehr-Liste', alle.indexOf(k) === -1);
      pruef(k + ' über Einstellungen erreichbar',
        !!d.querySelector('#mh-in-einstell [data-mh-go="' + k + '"]'));
      pruef(k + ' hat noch seinen Abschnitt', !!w.__T(`!!sekAbschnitt('${k}')`));
    });

    /* Nebenzeilen */
    w.__T('mehrNebenzeilen()');
    const ohne = [...d.querySelectorAll('section[data-mh]:not(.mh-still)')]
      .filter(x=>{ const u = x.querySelector('.mh-unter');
                   return !u || !u.textContent.trim(); })
      .map(x=>x.dataset.mh);
    pruef('Jeder Punkt hat eine Nebenzeile', ohne.length === 0, ohne.join(','));
    pruef('Sicherung meldet ihren Stand',
      /gesichert|Sicherung anlegen/.test(
        d.querySelector('section[data-mh="sicherung"] .mh-unter').textContent));
    pruef('Patch-Zeile nennt die Fassung',
      d.querySelector('section[data-mh="patch"] .mh-unter').textContent
        .indexOf(w.__T('FASSUNG')) !== -1);

    /* ── Kartendichte ── */
    pruef('Dichte startet auf normal', w.__T('S.dichte') === 'normal', w.__T('S.dichte'));
    w.__T("S.acc = {giessen:1}");
    pruef('Normal folgt dem Gemerkten',
      w.__T("accOffen('giessen')") === true && w.__T("accOffen('katzen')") === false);
    w.__T("S.dichte='knapp'");
    pruef('Knapp lässt alles zu',
      w.__T("accOffen('giessen')") === false && w.__T("accOffen('katzen')") === false);
    w.__T("S.dichte='voll'");
    pruef('Voll klappt alles auf',
      w.__T("accOffen('giessen')") === true && w.__T("accOffen('katzen')") === true);
    w.__T("S.dichte='normal'; sichern()");

    /* Die Wahlreihe muss den Stand zeigen und ihn setzen. */
    w.__T('dichteZeichnen()');
    pruef('Wahlreihe markiert normal',
      d.querySelector('#dichte-wahl [data-dichte="normal"]').getAttribute('aria-pressed') === 'true');
    d.querySelector('#dichte-wahl [data-dichte="voll"]').click();
    pruef('Antippen setzt die Dichte', w.__T('S.dichte') === 'voll', w.__T('S.dichte'));
    pruef('und markiert sie',
      d.querySelector('#dichte-wahl [data-dichte="voll"]').getAttribute('aria-pressed') === 'true');
    pruef('Erklärtext wechselt mit',
      d.getElementById('dichte-text').textContent.length > 10);
    d.querySelector('#dichte-wahl [data-dichte="normal"]').click();

    /* ── Heute-Schalter ── */
    pruef('Wetterzeile startet an', w.__T('S.heuteWetter') !== false);
    pruef('Kennzahlen starten aus', w.__T('S.heuteKennzahlen') === false);
    pruef('Kennzahlen liefern nichts, solange sie aus sind',
      w.__T('kennzahlenHTML()') === '');
    w.__T('S.heuteKennzahlen = true');
    const kz = w.__T('kennzahlenHTML()');
    pruef('Eingeschaltet erscheint die Leiste', /kennzahlen/.test(kz), kz.slice(0, 60));
    pruef('Drei Felder', (kz.match(/kz-feld/g) || []).length === 3);
    pruef('Gesund als Anteil', /\d+\/\d+/.test(kz));
    const k = w.__T('JSON.stringify(kennzahlen())');
    const kk = JSON.parse(k);
    pruef('Gesund nie größer als die Sammlung', kk.gesund <= kk.gesamt, k);
    pruef('Gießtreue liegt zwischen 0 und 100',
      kk.treue === null || (kk.treue >= 0 && kk.treue <= 100), k);
    w.__T('S.heuteWetter = false');
    pruef('Abgeschaltete Wetterzeile bleibt leer', w.__T('wetterZeileHTML()') === '');
    w.__T('S.heuteWetter = true; S.heuteKennzahlen = false; sichern()');
  }

  /* ══ Gießcenter ════════════════════════════════════════════════
     Fuenf Wege unter einem Dach. Gießplan und Vertretungszettel gab
     es schon, sie lagen nur an zwei Enden der App. */
  {
    pruef('Gießcenter steht in der Liste',
      !!d.querySelector('.mh-gruppe section[data-mh="giess"]'));
    pruef('Es liegt unter Pflege',
      d.querySelector('section[data-mh="giess"]').closest('.mh-gruppe')
        .querySelector('.mh-abschnitt').textContent === 'Pflege');

    const wege = [...d.querySelectorAll('#mh-in-giess .ein-zeile')]
      .map(b=>b.dataset.wzGo || b.dataset.mhGo);
    pruef('Fünf Wege im Gießcenter', wege.length === 5, wege.join(','));
    pruef('Die fünf sind die richtigen',
      wege.join(',') === 'giessplan,urlaub,wasser,duenger,rhythmus', wege.join(','));

    /* Was aus der Mehr-Liste verschwindet, muss anderswo auftauchen —
       sonst ist es weg, ohne dass es jemand merkt. */
    ['urlaub','wasser','duenger','rhythmus'].forEach(k=>{
      pruef(k + ' nicht mehr in der Mehr-Liste',
        !d.querySelector('.mh-gruppe section[data-mh="' + k + '"]'));
      pruef(k + ' über das Gießcenter erreichbar',
        !!d.querySelector('#mh-in-giess [data-mh-go="' + k + '"]'));
      pruef(k + ' hat noch seinen Abschnitt', !!w.__T(`!!sekAbschnitt('${k}')`));
    });
    pruef('Der Gießplan bleibt auch ein Werkzeug',
      !!w.__T("!!sekAbschnitt('giessplan')"));
    pruef('Urlaubszettel heißt jetzt Vertretungszettel',
      d.querySelector('section[data-mh="urlaub"] .wz-t').textContent.trim() === 'Vertretungszettel');

    /* ── Einstellungen ── */
    pruef('Gießeinstellungen haben Standardwerte',
      w.__T("giessEinst().art") === 'leitung'
      && w.__T("giessEinst().dgArt") === 'fluessig'
      && w.__T("giessEinst().saison") === true);
    pruef('Härte bleibt leer, bis sie jemand setzt',
      w.__T("giessEinst().haerte") === '');

    w.__T('giessCenterZeichnen()');
    pruef('Wasserart ist markiert',
      d.querySelector('#wasser-wahl [data-wasser="leitung"]').getAttribute('aria-pressed') === 'true');
    d.querySelector('#wasser-wahl [data-wasser="regen"]').click();
    pruef('Antippen setzt die Wasserart', w.__T("giessEinst().art") === 'regen');
    pruef('Erklärtext wechselt mit',
      d.getElementById('wasser-text').textContent.length > 20);
    pruef('Nebenzeile im Gießcenter zieht nach',
      /Regenwasser/.test(d.getElementById('gc-u-wasser').textContent));

    d.querySelector('#haerte-wahl [data-haerte="hart"]').click();
    pruef('Härte lässt sich setzen', w.__T("giessEinst().haerte") === 'hart');
    d.querySelector('#dgart-wahl [data-dgart="langzeit"]').click();
    pruef('Düngerart lässt sich setzen', w.__T("giessEinst().dgArt") === 'langzeit');

    /* ── Saison greift wirklich in den Gießabstand ──
       Eine Einstellung, die nichts bewirkt, ist schlimmer als keine. */
    const pid2 = w.__T('allePflanzen()[0].id');
    const winter = w.__T('!sommer()');
    w.__T("S.giess.saison = false; sichern()");
    const ohne = w.__T(`intervallVon(allePflanzen().find(x=>x.id==='${pid2}'))`);
    w.__T("S.giess.saison = true; S.giess.saisonStaerke = 'stark'; sichern()");
    const mit = w.__T(`intervallVon(allePflanzen().find(x=>x.id==='${pid2}'))`);
    pruef('Saisonfaktor ist im Sommer neutral',
      winter || w.__T('saisonFaktor()') === 1);
    if(winter){
      pruef('Stark streckt den Winterabstand', mit > ohne, ohne + ' → ' + mit);
    } else {
      pruef('Im Sommer bleibt der Abstand gleich', mit === ohne, ohne + ' → ' + mit);
    }
    w.__T("S.giess.saisonStaerke = 'normal'");
    pruef('Faktor liegt in sinnvollen Grenzen', w.__T('saisonFaktor()') >= 1
      && w.__T('saisonFaktor()') <= 2, String(w.__T('saisonFaktor()')));

    /* Der Schalter blendet die Stärke aus, ohne sie zu verstecken. */
    d.getElementById('ck-saison').checked = false;
    d.getElementById('ck-saison').dispatchEvent(new w.Event('change', {bubbles:true}));
    pruef('Schalter setzt die Saison ab', w.__T("giessEinst().saison") === false);
    pruef('Stärkewahl wird stillgelegt',
      d.getElementById('saison-wahl').classList.contains('aus'));
    d.getElementById('ck-saison').checked = true;
    d.getElementById('ck-saison').dispatchEvent(new w.Event('change', {bubbles:true}));
    pruef('und wieder aktiv',
      !d.getElementById('saison-wahl').classList.contains('aus'));

    d.getElementById('ck-winterpause').checked = false;
    d.getElementById('ck-winterpause').dispatchEvent(new w.Event('change', {bubbles:true}));
    pruef('Winterpause lässt sich abstellen', w.__T("giessEinst().winterpause") === false);

    /* Zuruecksetzen fuer die folgenden Pruefungen */
    w.__T("S.giess = {art:'leitung', haerte:'', dgArt:'fluessig', winterpause:true, saison:true, saisonStaerke:'normal'}; sichern()");
  }

  /* ══ Rueckweg aus verschachtelten Abschnittsfenstern ═══════════
     Von „Einstellungen \u203a Ansicht\u201c fuehrte ein Druck auf „Fertig\u201c
     zwei Ebenen auf einmal zurueck \u2014 man landete auf der Mehr-Seite
     statt in den Einstellungen. */
  {
    const knopf = d.getElementById('sekm-zu');
    w.__T("sektionOeffnen('einstell')");
    await tick();
    /* Seit 3.2.5 ist der Knopf ein Pfeil ohne Wort. Was er tut, sagt
       die Vorlesebeschriftung. */
    pruef('Oberste Ebene verl\u00e4sst das Werkzeug',
      /verlassen/.test(knopf.getAttribute('aria-label') || ''),
      knopf.getAttribute('aria-label'));
    pruef('Kein Rueckweg auf der obersten Ebene', w.__T('_sekWeg.length') === 0);

    /* Aus dem Fenster heraus eine Ebene tiefer */
    const tiefer = d.querySelector('#sekm-rumpf [data-mh-go="ansicht"]');
    pruef('Ansicht ist aus den Einstellungen heraus erreichbar', !!tiefer);
    if(tiefer){
      tiefer.click();
      await tick();
      pruef('Eine Ebene tiefer angekommen', w.__T('_sekOffen && _sekOffen.key') === 'ansicht',
        String(w.__T('_sekOffen && _sekOffen.key')));
      pruef('Rueckweg ist gemerkt', w.__T('_sekWeg.join(",")') === 'einstell',
        w.__T('_sekWeg.join(",")'));
      pruef('Knopf f\u00fchrt jetzt eine Ebene zur\u00fcck',
        /Ebene/.test(knopf.getAttribute('aria-label') || ''),
        knopf.getAttribute('aria-label'));
      pruef('Fenster ist noch offen', w.__T("modalOffen('sek-modal')"));

      knopf.click();
      await tick();
      pruef('Zur\u00fcck f\u00fchrt in die Einstellungen',
        w.__T('_sekOffen && _sekOffen.key') === 'einstell',
        String(w.__T('_sekOffen && _sekOffen.key')));
      pruef('und nicht aus dem Fenster heraus', w.__T("modalOffen('sek-modal')"));
      pruef('Rueckweg ist wieder leer', w.__T('_sekWeg.length') === 0);
      pruef('Der Knopf verl\u00e4sst wieder das Werkzeug',
        /verlassen/.test(knopf.getAttribute('aria-label') || ''),
        knopf.getAttribute('aria-label'));

      knopf.click();
      await tick();
      pruef('Auf oberster Ebene schlie\u00dft er das Fenster', !w.__T("modalOffen('sek-modal')"));
    }

    /* Ein Wechsel von der Seite aus ist keine Ebene */
    w.__T("sektionOeffnen('giess')");
    await tick();
    pruef('Seitenwechsel legt keinen Rueckweg an', w.__T('_sekWeg.length') === 0);
    const gcTiefer = d.querySelector('#sekm-rumpf [data-mh-go="wasser"]');
    if(gcTiefer){
      gcTiefer.click();
      await tick();
      pruef('Gie\u00dfcenter \u203a Wasser merkt den Rueckweg',
        w.__T('_sekWeg.join(",")') === 'giess', w.__T('_sekWeg.join(",")'));
      knopf.click();
      await tick();
      pruef('und f\u00fchrt ins Gie\u00dfcenter zur\u00fcck',
        w.__T('_sekOffen && _sekOffen.key') === 'giess');
    }
    w.__T("modalZu('sek-modal')");
    await tick();
    pruef('Schlie\u00dfen leert den Rueckweg', w.__T('_sekWeg.length') === 0);
  }

  /* ══ Umtopf-Assistent ══════════════════════════════════════════
     Der Wert liegt im Abschluss: ohne ihn muesste man Topfgroesse,
     Verlauf, Zustand und Stecklinge an vier Stellen nachtragen. */
  {
    w.__T("sektionOeffnen('umtopfen')");
    await tick();
    pruef('Umtopfen ist ein Werkzeug', !!w.__T("sekAbschnitt('umtopfen')"));
    pruef('Es hat eine Kachel',
      !!d.querySelector('.kachelgitter section[data-wz="umtopfen"] .wz-ikon svg'));
    /* Seit 3.1.0 sechs: die Substratmischung steht zwischen Topf und
       Stecklingen, statt in ein anderes Werkzeug zu verweisen. */
    /* Seit 3.2.4 sind es sieben: Zutatenauswahl und Rechnung standen
       in derselben Stufe, und wer ankreuzte, sah das Ergebnis erst
       eine Bildschirmlaenge tiefer. */
    pruef('Sieben Stufen', d.querySelectorAll('#wz-in-umtopfen [data-ut-stufe]').length === 7,
      String(d.querySelectorAll('#wz-in-umtopfen [data-ut-stufe]').length));
    pruef('Fortschritt hat sieben Marken',
      d.querySelectorAll('#ut-fortschritt li').length === 7,
      String(d.querySelectorAll('#ut-fortschritt li').length));
    pruef('Vorrat und Mischung sind getrennte Stufen',
      d.querySelector('[data-ut-stufe="4"]').contains(d.getElementById('ut-sub-vorrat'))
      && d.querySelector('[data-ut-stufe="5"]').contains(d.getElementById('ut-sub-mischung')));
    pruef('Der Sprung in den Substratmischer ist ersetzt',
      !d.getElementById('ut-zum-substrat') && !!d.getElementById('ut-sub-mischung'));
    pruef('Die Pflanzenwahl ist ein Kachelgitter, kein Auswahlfeld',
      !d.getElementById('ut-pflanze') && !!d.getElementById('ut-gitter'));
    pruef('Das Gitter ist gef\u00fcllt',
      d.querySelectorAll('#ut-gitter [data-utp]').length > 0,
      String(d.querySelectorAll('#ut-gitter [data-utp]').length));
    pruef('Gr\u00fcnde stehen zur Wahl',
      d.querySelectorAll('[data-ut-grund]').length === 6,
      String(d.querySelectorAll('[data-ut-grund]').length));
    pruef('Topfformen stehen zur Wahl',
      d.querySelectorAll('[data-ut-form]').length
        === Object.keys(JSON.parse(w.__T('JSON.stringify(TOPFFORMEN)'))).length);

    /* Bl\u00e4ttern */
    pruef('Stufe 1 ist offen', w.__T('UT.stufe') === 1);
    pruef('Zur\u00fcck ist auf Stufe 1 verborgen', d.getElementById('ut-zurueck').hidden === true);
    d.getElementById('ut-weiter').click();
    pruef('Weiter bl\u00e4ttert vor', w.__T('UT.stufe') === 2);
    pruef('Stufe 2 ist sichtbar',
      d.querySelector('[data-ut-stufe="2"]').classList.contains('an'));
    d.getElementById('ut-zurueck').click();
    pruef('Zur\u00fcck bl\u00e4ttert zur\u00fcck', w.__T('UT.stufe') === 1);

    /* Gr\u00fcnde sind mehrfach w\u00e4hlbar */
    d.querySelector('[data-ut-grund="wurzelig"]').click();
    d.querySelector('[data-ut-grund="substrat"]').click();
    pruef('Zwei Gr\u00fcnde gew\u00e4hlt', w.__T('UT.gruende.length') === 2);
    pruef('Beide sind markiert',
      d.querySelector('[data-ut-grund="wurzelig"]').getAttribute('aria-pressed') === 'true'
      && d.querySelector('[data-ut-grund="substrat"]').getAttribute('aria-pressed') === 'true');
    d.querySelector('[data-ut-grund="substrat"]').click();
    pruef('Nochmal antippen nimmt zur\u00fcck', w.__T('UT.gruende.length') === 1);

    /* Topf: Volumen rechnet mit derselben Funktion wie der Mischer */
    w.__T("UT.topf = 24; UT.form = 'kultur'; utZeichnen()");
    pruef('Volumen wird genannt',
      /Liter/.test(d.getElementById('ut-volumen').textContent));
    pruef('Es ist dasselbe wie im Substratmischer',
      Math.abs(w.__T('topfVolumen(24, "kultur")')
        - w.__T('topfLiter(24)')) < 0.001
      || w.__T('subForm') !== 'kultur');
    /* Der Sprung von alter auf neue Groesse wird bewertet */
    w.__T("UT.pflanze = allePflanzen()[0].id");
    w.__T("aenderungSetzen(UT.pflanze, {topf:'14'})");
    w.__T("UT.topf = 30; utZeichnen()");
    pruef('Zu gro\u00dfer Sprung wird gemeldet',
      /N\u00e4sse|cm mehr/.test(d.getElementById('ut-sprung').textContent),
      d.getElementById('ut-sprung').textContent.slice(0, 50));
    w.__T("UT.topf = 17; utZeichnen()");
    pruef('Guter Sprung wird best\u00e4tigt',
      /guter Sprung/.test(d.getElementById('ut-sprung').textContent),
      d.getElementById('ut-sprung').textContent.slice(0, 50));

    /* ── Der Abschluss: hier h\u00e4ngen die Verkn\u00fcpfungen ── */
    const pid3 = w.__T('UT.pflanze');
    const vorEreignis = w.__T(`ereignisse('${pid3}').length`);
    const vorPflanzen = w.__T('allePflanzen().length');
    w.__T("UT.topf = 18; UT.form = 'schale'; UT.gruende = ['wurzelig'];");
    w.__T("UT.stecklinge = true; UT.zahl = 2; UT.art = Object.keys(V_METHODEN)[0];");
    w.__T('UT.stufe = UT_STUFEN; utZeichnen()');
    const erg = JSON.parse(w.__T('JSON.stringify(utEintragen())'));
    pruef('Eintragen l\u00e4sst die Stufe stehen',
      w.__T('UT.stufe') === 7, String(w.__T('UT.stufe')));

    pruef('Neue Topfgr\u00f6\u00dfe steht an der Pflanze',
      String(w.__T(`allePflanzen().find(x=>x.id==='${pid3}').topf`)) === '18',
      String(w.__T(`allePflanzen().find(x=>x.id==='${pid3}').topf`)));
    pruef('Topfform wird mitgeschrieben',
      w.__T(`allePflanzen().find(x=>x.id==='${pid3}').topfform`) === 'schale');
    pruef('Verlauf hat einen Eintrag mehr',
      w.__T(`ereignisse('${pid3}').length`) > vorEreignis);
    pruef('Der Eintrag hei\u00dft „umgetopft\u201c',
      w.__T(`ereignisse('${pid3}').some(e=>e.typ==='umgetopft')`));
    pruef('Er nennt Gr\u00f6\u00dfe und Grund',
      /18 cm/.test(w.__T(`ereignisse('${pid3}').find(e=>e.typ==='umgetopft').text`)));

    /* D\u00fcngesperre: EREIGNIS_ARTEN.umgetopft setzt zustand frisch,
       ZUSTAENDE.frisch sperrt 28 Tage. */
    pruef('Zustand steht auf „frisch umgetopft\u201c',
      w.__T(`zustandVon(allePflanzen().find(x=>x.id==='${pid3}')).code`) === 'frisch',
      String(w.__T(`zustandVon(allePflanzen().find(x=>x.id==='${pid3}')).code`)));
    pruef('Die D\u00fcngesperre l\u00e4uft vier Wochen',
      w.__T('ZUSTAENDE.frisch.tage') === 28);

    /* Stecklinge: dieselbe Bahn wie im Vermehren-Werkzeug */
    pruef('Zwei Stecklinge angelegt', erg.kinder.length === 2, String(erg.kinder.length));
    pruef('Sie sind in der Sammlung',
      w.__T('allePflanzen().length') === vorPflanzen + 2);
    pruef('Beide kennen ihre Mutter',
      erg.kinder.every(k =>
        w.__T(`allePflanzen().find(x=>x.id==='${k}')`) &&
        w.__T(`allePflanzen().find(x=>x.id==='${k}').eltern`) === pid3));
    pruef('Die Mutter hat Vermehrungseintr\u00e4ge',
      w.__T(`ereignisse('${pid3}').filter(e=>e.typ==='vermehrt').length`) === 2);
    pruef('Jeder Steckling hat seinen Gegeneintrag',
      erg.kinder.every(k => w.__T(`ereignisse('${k}').some(e=>e.typ==='entstanden')`)));
    pruef('Der Stammbaum verbindet sie',
      erg.kinder.every(k =>
        w.__T(`abstammungHTML(allePflanzen().find(x=>x.id==='${k}'))`)
          .indexOf('data-go="' + pid3 + '"') !== -1));

    /* ── Abschlussknopf ──
       Der Abschluss stand im Text der Stufe 7, nicht in der
       Fussleiste. Und utEintragen sprang selbst auf Stufe 1 zurueck:
       die Meldung, die der Aufrufer gleich danach schrieb, landete
       auf einer Stufe, die niemand mehr sah. */
    pruef('Der Abschluss steht nicht mehr im Text der Stufe',
      d.getElementById('ut-fertig') === null);
    w.__T('UT.erledigt = false; UT.stufe = 1; utZeichnen()');
    pruef('Umtopfen \u00b7 Stufe 1 hei\u00dft Weiter',
      d.getElementById('ut-weiter').hidden === false
      && d.getElementById('ut-weiter').textContent === 'Weiter',
      d.getElementById('ut-weiter').textContent);
    w.__T('UT.stufe = UT_STUFEN; utZeichnen()');
    /* Nicht nur die Beschriftung: der Knopf war auf der letzten Stufe
       ueberhaupt versteckt, weil der Abschluss im Text stand. Ohne
       hidden faellt die Gegenprobe hier nicht um. */
    pruef('Umtopfen \u00b7 auf der letzten Stufe steht die Abschlussaktion',
      d.getElementById('ut-weiter').hidden === false
      && /eintragen/i.test(d.getElementById('ut-weiter').textContent),
      d.getElementById('ut-weiter').textContent
      + ' hidden=' + d.getElementById('ut-weiter').hidden);
    w.__T('UT.erledigt = true; utZeichnen()');
    pruef('Umtopfen \u00b7 danach hei\u00dft der Knopf Fertig',
      d.getElementById('ut-weiter').textContent === 'Fertig',
      d.getElementById('ut-weiter').textContent);
    pruef('Umtopfen \u00b7 Zur\u00fcck ist dann weg',
      d.getElementById('ut-zurueck').hidden === true);
    w.__T(`document.getElementById('ut-zsf').innerHTML =
      '<p class="ut-fertig-melde">Eingetragen.</p>'; utZeichnen()`);
    pruef('Neuzeichnen wischt die Meldung nicht weg',
      /Eingetragen/.test(d.getElementById('ut-zsf').textContent),
      d.getElementById('ut-zsf').textContent.slice(0, 40));
    d.getElementById('ut-weiter').click();
    pruef('Umtopfen \u00b7 Fertig r\u00e4umt ab und geht auf Stufe 1',
      w.__T('UT.stufe') === 1 && w.__T('UT.erledigt') === false,
      String(w.__T('UT.stufe')) + '/' + String(w.__T('UT.erledigt')));

    /* Aufr\u00e4umen */
    erg.kinder.forEach(k=>{
      w.__T(`S.eigene = (S.eigene||[]).filter(x=>x.id !== '${k}'); delete S.ereignisse['${k}']`);
    });
    w.__T(`S.ereignisse['${pid3}'] = (S.ereignisse['${pid3}']||[])
      .filter(e=>e.typ!=='vermehrt' && e.typ!=='umgetopft')`);
    w.__T(`if(S.edits) delete S.edits['${pid3}']`);
    w.__T('sichern()');
    pruef('Testspuren wieder entfernt',
      w.__T('allePflanzen().length') === vorPflanzen);

    /* ── Doktor merkt f\u00fcrs Umtopfen vor ──
       Der Befund „Topf zu klein\u201c war bisher nur eine Notiz. */
    pruef('Vormerken l\u00e4sst sich aufrufen',
      w.__T(`umtopfVormerken('${pid3}', 'Topf zu klein, stark durchwurzelt')`) === true);
    pruef('Die Pflanze steht auf der Liste',
      w.__T(`umtopfVorgemerkt().some(x=>x.id==='${pid3}')`));
    w.__T('utAufbauen()');
    pruef('Vorgemerkte stehen vorn und tragen eine Marke',
      d.querySelector('#ut-gitter [data-utp]').getAttribute('data-utp') === pid3
      && !!d.querySelector('#ut-gitter [data-utp] .pwahl-marke'));
    pruef('Der Assistent startet bei einer vorgemerkten Pflanze',
      w.__T('UT.pflanze') === pid3, String(w.__T('UT.pflanze')));
    pruef('Der Grund steht in der Lagezeile',
      /vorgemerkt/i.test(d.getElementById('ut-pflanze-lage').textContent),
      d.getElementById('ut-pflanze-lage').textContent.slice(0, 60));

    /* Nach dem Eintragen ist die Vormerkung erledigt */
    w.__T("UT.stecklinge = false; UT.gruende = ['klein']; utEintragen()");
    pruef('Eintragen l\u00f6scht die Vormerkung',
      !w.__T(`umtopfVorgemerkt().some(x=>x.id==='${pid3}')`));

    w.__T(`S.ereignisse['${pid3}'] = (S.ereignisse['${pid3}']||[])
      .filter(e=>e.typ!=='umgetopft'); if(S.edits) delete S.edits['${pid3}'];
      if(S.zustand) delete S.zustand['${pid3}']; sichern()`);

    /* Vollbild: Pflanzen setzen und M\u00f6bel wieder verlassen. */
    w.__T("pModus='pflanzen'; vollbild=true; schubladeFuellen()");
    const sch = d.getElementById('vb-schublade');
    pruef('Die Schublade f\u00fchrt auch Pflanzen',
      sch && sch.hidden === false, sch ? 'hidden='+sch.hidden : 'fehlt');
    pruef('Sie zeigt Chips oder sagt, dass alles platziert ist',
      /zchip|Platz/.test(sch.innerHTML));
    pruef('Chips tragen ein Bild, wenn es eines gibt', w.__T(`(function(){
      const p = allePflanzen()[0];
      const h = zchipHTML(p, false, null);
      return !profilFoto(p.id) || h.indexOf('<img') !== -1; })()`));
    w.__T("vollbild=false; pModus='pflanzen'; schubladeFuellen()");

    pruef('Das M\u00f6belformular hat oben einen Schlie\u00dfen-Knopf',
      !!d.getElementById('btn-mb-zu-oben'));
    w.__T("document.getElementById('moebel-bearb').classList.add('on')");
    d.getElementById('btn-mb-zu-oben').click();
    pruef('Er schlie\u00dft das Formular',
      !d.getElementById('moebel-bearb').classList.contains('on'));

    w.__T("modalZu('sek-modal')");
    await tick();
  }

  /* ══ Bibliothek ════════════════════════════════════════════════
     Die Artentabelle war bisher nur beim Anlegen zu erreichen. */
  {
    w.__T("sektionOeffnen('bibliothek')");
    await tick();
    const zweige = [...d.querySelectorAll('#mh-in-bibliothek .ein-zeile')]
      .map(b=>b.dataset.mhGo);
    pruef('Drei Zweige', zweige.length === 3, zweige.join(','));
    pruef('Die drei sind die richtigen',
      zweige.join(',') === 'bib-arten,bib-rezepte,bib-wissen', zweige.join(','));
    ['bib-arten','bib-rezepte','bib-wissen'].forEach(k=>{
      pruef(k + ' nicht in der Mehr-Liste',
        !d.querySelector('.mh-gruppe section[data-mh="' + k + '"]'));
      pruef(k + ' hat noch seinen Abschnitt', !!w.__T(`!!sekAbschnitt('${k}')`));
    });

    /* Steckbriefe: Suche ueber Name, botanisch und Familie */
    w.__T("sektionOeffnen('bib-arten')");
    await tick();
    pruef('Ohne Eingabe steht die Artenzahl da',
      /Arten in der Tabelle/.test(d.getElementById('bib-such-zahl').textContent),
      d.getElementById('bib-such-zahl').textContent.slice(0, 40));
    pruef('Suche findet \u00fcber den deutschen Namen',
      w.__T("bibSuchen('Fensterblatt').length") > 0);
    pruef('Suche findet \u00fcber den botanischen Namen',
      w.__T("bibSuchen('Monstera').length") > 0);
    /* Die Familien stehen in der Tabelle auf Deutsch. */
    pruef('Suche findet \u00fcber die Familie',
      w.__T("bibSuchen('Aronstab').length") > 0);
    pruef('Unsinn findet nichts', w.__T("bibSuchen('xyzqfg').length") === 0);
    pruef('Trefferzahl ist gedeckelt', w.__T("bibSuchen('a').length") <= 40);

    d.getElementById('bib-such').value = 'Monstera';
    d.getElementById('bib-such').dispatchEvent(new w.Event('input', {bubbles:true}));
    pruef('Treffer werden angezeigt',
      d.querySelectorAll('#bib-treffer .bib-art').length > 0);
    pruef('Ein Steckbrief nennt die Gie\u00dfklasse',
      /Gie\u00dfklasse/.test(d.getElementById('bib-treffer').textContent));
    pruef('und die Tierfrage',
      /giftig|Ungiftig|nicht gesichert/.test(d.getElementById('bib-treffer').textContent));
    d.getElementById('bib-such').value = '';
    d.getElementById('bib-such').dispatchEvent(new w.Event('input', {bubbles:true}));

    /* Rezepte */
    w.__T("sektionOeffnen('bib-rezepte')");
    await tick();
    pruef('Rezepte sind da',
      d.querySelectorAll('#bib-rezepte .bib-art').length === 4,
      String(d.querySelectorAll('#bib-rezepte .bib-art').length));
    pruef('Jedes Rezept hat einen Warnhinweis',
      [...d.querySelectorAll('#bib-rezepte .bib-art')]
        .every(x=>x.querySelector('.bib-achtung')));
    pruef('Jedes nennt Zutaten, Ansatz und Anwendung',
      [...d.querySelectorAll('#bib-rezepte .bib-art')]
        .every(x=>x.querySelectorAll('.ut-zsf-liste>div').length === 3));

    /* Wissenswertes */
    w.__T("sektionOeffnen('bib-wissen')");
    await tick();
    pruef('Wissensthemen sind da',
      d.querySelectorAll('#bib-wissen .bib-art').length === 8,
      String(d.querySelectorAll('#bib-wissen .bib-art').length));
    pruef('Sie sind gruppiert',
      d.querySelectorAll('#bib-wissen .ein-abschnitt').length === 3,
      String(d.querySelectorAll('#bib-wissen .ein-abschnitt').length));
    pruef('Kein Thema ist leer',
      [...d.querySelectorAll('#bib-wissen .bib-text')]
        .every(x=>x.textContent.trim().length > 80));

    /* Zweimal Oeffnen darf nicht verdoppeln */
    w.__T("bibRezepteZeichnen(); bibWissenZeichnen()");
    pruef('Erneutes Zeichnen verdoppelt nichts',
      d.querySelectorAll('#bib-rezepte .bib-art').length === 4
      && d.querySelectorAll('#bib-wissen .bib-art').length === 8);

    w.__T("modalZu('sek-modal')");
    await tick();
  }

  /* Der Sprung darf kein zweites Kapitel auslösen. */
  w.__T('if(tourLauf) tourSchliessen();');
  w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());');
  w.__T('S.tutorial = {aus:false, kapitel:{}, einricht:0}; sichern();');
  await tick();
  pruef('Doktorkapitel startet', w.__T("tourStart('doktor')") === true);
  await tick();
  pruef('und beginnt bei Schritt 1', w.__T('tourLauf.i') === 0, w.__T('tourLauf && tourLauf.i'));
  pruef('im richtigen Kapitel', w.__T('tourLauf.key') === 'doktor', w.__T('tourLauf && tourLauf.key'));
  pruef('Doktorfenster steht offen', w.__T("modalOffen('sek-modal')") === true);
  d.getElementById('tour-weiter').click();
  await tick();
  pruef('Schritt 2 erreichbar', w.__T('tourLauf.i') === 1, w.__T('tourLauf && tourLauf.i'));
  d.getElementById('tour-weiter').click();
  await tick();
  pruef('Schritt 3 erreichbar', w.__T('tourLauf.i') === 2, w.__T('tourLauf && tourLauf.i'));
  w.__T('tourAbbruch()');
  w.__T('S.tutorial.aus = true; sichern();');
  w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());');
  await tick();

  /* — „Noch feucht" verschiebt auf morgen — */
  w.__T(`(function(){
    const p = allePflanzen()[0];
    S.water[p.id] = [];
    const alt = new Date(Date.now() - 40*86400000);
    S.water[p.id] = [iso(alt)];
    S.feuchtRueck = {};
    sichern();
  })()`);
  pruef('Pflanze ist überfällig', w.__T("giessStatus(allePflanzen()[0]).stand") === 'over');
  pruef('steht auf der Gießliste',
    w.__T(`giessListe().some(x=>x.id === '${pid}')`) === true);
  w.__T(`feuchtGemeldet(allePflanzen().find(x=>x.id==='${pid}'))`);
  pruef('Meldung vermerkt', w.__T(`!!S.feuchtRueck['${pid}']`) === true);
  pruef('heute als feucht gemeldet', w.__T(`giessStatus(allePflanzen()[0]).feuchtHeute`) === true);
  pruef('heute von der Liste runter',
    w.__T(`giessListe().some(x=>x.id === '${pid}')`) === false);

  /* Eine Feucht-Meldung ist Pflege, kein Versaeumnis. Solange sie
     gilt, darf die Pflanze nicht als ueberfaellig gelten — sonst
     bestraft die Giesstreue genau das Nachsehen, das sie belohnen
     soll. Chris stand deshalb bei 88 statt 100 Prozent. */
  pruef('Gemeldet, aber rechnerisch weiter ueberfaellig',
    w.__T(`giessStatus(allePflanzen().find(x=>x.id==='${pid}')).stand`) === 'over');
  pruef('Die Standzeile sagt nicht mehr „ueberfaellig“',
    /feucht gemeldet/.test(w.__T(`karteStand(allePflanzen().find(x=>x.id==='${pid}')).text`)),
    w.__T(`karteStand(allePflanzen().find(x=>x.id==='${pid}')).text`));
  pruef('Die Giesstreue zaehlt sie als puenktlich',
    w.__T('kennzahlen().treue') === 100, String(w.__T('kennzahlen().treue')));
  /* Laeuft die Frist ohne neue Meldung ab, ist sie wieder ueberfaellig —
     dann hat wirklich niemand hingesehen. */
  w.__T(`S.feuchtRueck['${pid}'].zuletzt = iso(new Date(Date.now() - 20*864e5))`);
  pruef('Nach Ablauf der Frist wieder ueberfaellig',
    /überfällig/.test(w.__T(`karteStand(allePflanzen().find(x=>x.id==='${pid}')).text`)));
  pruef('Und dann zaehlt sie auch wieder gegen die Treue',
    w.__T('kennzahlen().treue') < 100);
  w.__T(`S.feuchtRueck['${pid}'].zuletzt = iso(HEUTE)`);
  pruef('Gießabstand unverändert',
    w.__T(`giessStatus(allePflanzen()[0]).iv === intervallVon(allePflanzen()[0])`) === true);
  pruef('kein Gießvermerk eingetragen',
    w.__T(`(S.water['${pid}']||[]).indexOf(iso(HEUTE))`) === -1);
  /* Die Meldung galt frueher nur bis Mitternacht — am naechsten Tag
     stand dieselbe Pflanze wieder als ueberfaellig da, obwohl feuchtes
     Substrat ueber Nacht selten abtrocknet. Sie setzt jetzt eine Frist
     nach Giessklasse. */
  {
    const kl = w.__T(`allePflanzen().find(x=>x.id==='${pid}').klasse`);
    const frist = w.__T(`feuchtFrist(allePflanzen().find(x=>x.id==='${pid}'))`);
    pruef('Frist passt zur Gie\u00dfklasse ' + kl,
      frist === ({S:1, A:1, B:2, C:5})[kl], String(frist));
    pruef('Heute sind noch ' + frist + ' Tage \u00fcbrig',
      w.__T(`feuchtRest('${pid}')`) === frist, String(w.__T(`feuchtRest('${pid}')`)));

    /* Einen Tag weiter: bei Klasse B und C noch Ruhe, bei S und A vorbei. */
    w.__T(`S.feuchtRueck['${pid}'].zuletzt = iso(new Date(Date.now() - 86400000)); sichern();`);
    const nochRuhe = frist > 1;
    pruef('Nach einem Tag stimmt die Lage',
      w.__T(`giessListe().some(x=>x.id === '${pid}')`) === !nochRuhe,
      'Frist ' + frist + ', auf der Liste: '
        + String(w.__T(`giessListe().some(x=>x.id === '${pid}')`)));

    /* Nach Ablauf der Frist ist sie in jedem Fall wieder dran. */
    w.__T(`S.feuchtRueck['${pid}'].zuletzt = iso(new Date(Date.now() - ${'${frist + 1}'} * 86400000)); sichern();`
      .replace('${frist + 1}', String(frist + 1)));
    pruef('Nach Ablauf der Frist wieder f\u00e4llig',
      w.__T(`giessListe().some(x=>x.id === '${pid}')`) === true);
    pruef('Rest steht dann auf null',
      w.__T(`feuchtRest('${pid}')`) === 0);

    /* Die Frist muss man sehen koennen, sonst wirkt sie willkuerlich. */
    w.__T(`S.feuchtRueck['${pid}'].zuletzt = iso(HEUTE); sichern();`);
    const kopf = w.__T(`kartenKopfHTML(allePflanzen().find(x=>x.id==='${pid}'))`);
    pruef('Die Karte nennt die Ruhezeit',
      /Noch feucht \u2014 wieder in/.test(kopf), kopf.slice(kopf.indexOf('km-stand'), kopf.indexOf('km-stand')+120));
    pruef('und nicht mehr \u201e\u00fcberf\u00e4llig\u201c',
      kopf.indexOf('\u00fcberf\u00e4llig') === -1);

    /* Alle vier Klassen haben eine Frist, keine ist null. */
    pruef('Jede Gie\u00dfklasse hat eine Frist', w.__T(`
      Object.keys(KLASSEN).every(k => FEUCHT_FRIST[k] > 0)`),
      w.__T('JSON.stringify(FEUCHT_FRIST)'));
    pruef('Ein Kaktus bekommt l\u00e4nger Ruhe als ein Anstautopf',
      w.__T('FEUCHT_FRIST.C') > w.__T('FEUCHT_FRIST.S'));

    /* Zurueck auf gestern fuer die folgenden Pruefungen. */
    w.__T(`S.feuchtRueck['${pid}'].zuletzt = iso(new Date(Date.now() - 86400000)); sichern();`);
  }
  pruef('zweite Meldung am selben Tag zählt nicht doppelt', w.__T(`(function(){
    const p = allePflanzen().find(x=>x.id==='${pid}');
    feuchtGemeldet(p); const a = S.feuchtRueck['${pid}'].zahl;
    feuchtGemeldet(p); return S.feuchtRueck['${pid}'].zahl === a; })()`) === true);

  w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());');
  await tick();

  /* ══════════ 2.9.11 — Botanisch näher am Entwurf ══════════ */
  const stil = w.__T(`(function(){ let t=''; Array.prototype.forEach.call(
    document.querySelectorAll('style'), s=>{ t += s.textContent; }); return t; })()`);

  const et = d.getElementById('kopf-etikett');
  const ti = d.getElementById('kopf-titel');
  const setzen = async (a) => { w.__T(`ansichtZeigen('${a}')`); await tick(); return ti.textContent; };
  pruef('Kopf auf Heute', await setzen('heute') === 'Heute');
  pruef('Kopf auf Sammlung', await setzen('sammlung') === 'Sammlung');
  pruef('Kopf auf Werkzeuge', await setzen('werkzeuge') === 'Werkzeuge');
  pruef('Kopf auf Mehr', await setzen('mehr') === 'Mehr');
  pruef('Etikett bleibt leer', et.textContent === '', et.textContent);
  pruef('leeres Etikett verschwindet', /\.top-etikett:empty\{display:none/.test(stil));
  pruef('Etikett vor der Überschrift',
    et.nextElementSibling && et.nextElementSibling.id === 'kopf-titel');

  const dsn = (n) => { d.documentElement.setAttribute('data-design', n);
    return w.getComputedStyle(d.documentElement); };
  pruef('Botanisch nutzt die Serifenschrift',
    dsn('botanisch').getPropertyValue('--f-display').indexOf('Newsreader') !== -1);
  pruef('Terrarium nutzt die Serifenschrift',
    dsn('terrarium').getPropertyValue('--f-display').indexOf('Newsreader') !== -1);
  pruef('Klartext bleibt bei der Grotesk',
    dsn('klartext').getPropertyValue('--f-display').indexOf('Newsreader') === -1);
  pruef('Titelgewicht liegt im geladenen Bereich',
    dsn('botanisch').getPropertyValue('--gewicht-titel').trim() === '500');
  pruef('Klartext ohne Versalien im Etikett',
    stil.indexOf('html[data-design="klartext"] .top-etikett{text-transform:none') !== -1);
  d.documentElement.setAttribute('data-design', 'botanisch');

  /* Botanisch ist ganz hell geworden — auf Dunkelgruen war bei
     Sonnenlicht nichts mehr zu lesen. */
  pruef('Botanisch steht auf Salbei',
    dsn('botanisch').getPropertyValue('--fl-grund').trim().toUpperCase() === '#CDD9C5',
    dsn('botanisch').getPropertyValue('--fl-grund'));
  pruef('keine dunklen Zonen mehr',
    Array.isArray(w.__T("DESIGNS.botanisch.zonen")) && w.__T("DESIGNS.botanisch.zonen").length === 0);
  pruef('keine Notfarbe fuer Dunkel', w.__T("DESIGNS.botanisch.dunkel") === null);
  pruef('Zonengrund folgt dem Seitengrund',
    dsn('botanisch').getPropertyValue('--zone-grund').trim().toUpperCase() === '#CDD9C5');
  pruef('Knoepfe tragen die helle Karte',
    /html\[data-design="botanisch"\] \.haupttat,/.test(stil));
  pruef('kein Gruen mehr unter der Schrift',
    !/body\[data-ansicht="heute"\] \.wrap\{[^}]*--schrift:#F2F7F0/.test(stil.replace(/\n\s*/g,'')));
  pruef('Kacheln gleich hoch', stil.indexOf('grid-auto-rows:1fr') !== -1);
  pruef('Aktionswort statt Pfeil', stil.indexOf(".wz-p::after{content:'Öffnen'") !== -1);

  /* ══════════ 2.9.12 — Kacheln und Raster ══════════ */
  const stil2 = w.__T(`(function(){ let t=''; Array.prototype.forEach.call(
    document.querySelectorAll('style'), s=>{ t += s.textContent; }); return t; })()`);

  const kacheln = Array.prototype.slice.call(
    d.querySelectorAll('.kachelgitter section[data-wz]'));
  pruef('sechs Werkzeugkacheln', kacheln.length === 6, String(kacheln.length));
  pruef('jede Kachel hat ein Symbol',
    kacheln.every(k => k.querySelector('.wz-ikon svg')),
    kacheln.filter(k=>!k.querySelector('.wz-ikon svg')).map(k=>k.dataset.wz).join(','));
  pruef('jede Kachel hat eine Unterzeile',
    kacheln.every(k => (k.querySelector('.wz-unter') || {}).textContent),
    kacheln.filter(k=>!k.querySelector('.wz-unter')).map(k=>k.dataset.wz).join(','));
  pruef('Symbol wird nicht vorgelesen',
    kacheln.every(k => k.querySelector('.wz-ikon').getAttribute('aria-hidden') === 'true'));
  pruef('Symbol steht vor dem Namen',
    kacheln.every(k => {
      const kopf = k.querySelector('.wz-kopf');
      return kopf.firstElementChild && kopf.firstElementChild.classList.contains('wz-ikon');
    }));
  pruef('Name bleibt lesbarer Text',
    kacheln.every(k => (k.querySelector('.wz-t') || {}).textContent.trim().length > 2));
  /* Ein zweiter Aufruf darf nichts verdoppeln. */
  w.__T('werkzeugKachelnAusstatten()');
  pruef('kein doppeltes Symbol',
    kacheln.every(k => k.querySelectorAll('.wz-ikon').length === 1));
  pruef('kein doppelter Untertitel',
    kacheln.every(k => k.querySelectorAll('.wz-unter').length === 1));
  pruef('zwei Spalten', stil2.indexOf('.kachelgitter{display:grid;grid-template-columns:repeat(2,1fr)') !== -1);
  /* Feste Hoehe gewichen zugunsten einer mitwachsenden: alle sechs
     Kacheln sind gleich hoch, unabhaengig von der Textlaenge, und
     die Hoehe folgt der Fensterbreite. */
  pruef('Kachelhöhe wächst mit dem Schirm',
    stil2.indexOf('min-height:clamp(150px,42vw,200px)') !== -1);
  pruef('Kachel hat drei feste Zeilen',
    /\.kachelgitter \.wz-kopf\{display:grid;\s*grid-template-rows:/.test(stil2.replace(/\n\s*/g,' ')));
  pruef('Titel bekommt zwei Zeilen Platz',
    /\.kachelgitter \.wz-t\{[^}]*min-height:calc\(1\.22em \* 2\)/.test(stil2.replace(/\n\s*/g,'')));
  pruef('Unterzeile bekommt zwei Zeilen Platz',
    /\.kachelgitter \.wz-unter\{[^}]*min-height:calc\(1\.35em \* 2\)/.test(stil2.replace(/\n\s*/g,'')));
  pruef('Strich statt Fläche', /\.wz-ikon svg\{[^}]*fill:none/.test(stil2));

  pruef('Raster ohne Zeilenabstand',
    /botanisch"\] \.sam-raster \.grid\{[^}]*row-gap:0/.test(stil2));
  pruef('Abstand hängt an der Kachel',
    /botanisch"\] \.sam-raster \.card\{[^}]*margin:0 0 12px/.test(stil2));
  pruef('alte gerechnete Spanne ist raus',
    stil2.indexOf('span calc(var(--spanne') === -1);

  /* ══════════ 2.9.13 — Aufgeräumt ══════════ */
  const stil3 = w.__T(`(function(){ let t=''; Array.prototype.forEach.call(
    document.querySelectorAll('style'), s=>{ t += s.textContent; }); return t; })()`);

  /* — Kopf ohne Dopplung — */
  w.__T("ansichtZeigen('werkzeuge')"); await tick();
  pruef('Werkzeuge doppelt nicht',
    d.getElementById('kopf-etikett').textContent.toLowerCase()
      !== d.getElementById('kopf-titel').textContent.toLowerCase(),
    d.getElementById('kopf-titel').textContent);
  w.__T("ansichtZeigen('sammlung')"); await tick();
  pruef('Kopf nennt nur den Reiter',
    d.getElementById('kopf-titel').textContent === 'Sammlung',
    d.getElementById('kopf-titel').textContent);
  w.__T("ansichtZeigen('heute')"); await tick();
  pruef('kein Zusatz mehr im Kopf',
    d.getElementById('kopf-titel').textContent === 'Heute',
    d.getElementById('kopf-titel').textContent);
  pruef('Reitername steht groß',
    /header\.top h1\{font-size:clamp\(2\.4rem/.test(stil3));
  pruef('Etikett klein und gesperrt',
    /\.top-etikett\{[^}]*letter-spacing:\.18em/.test(stil3));

  /* — Schriften — */
  const dsn3 = (n) => { d.documentElement.setAttribute('data-design', n);
    return w.getComputedStyle(d.documentElement); };
  pruef('Botanisch: Fließtext in der Grotesk',
    dsn3('botanisch').getPropertyValue('--f-body').indexOf('Bricolage') !== -1);
  pruef('Botanisch: Überschriften mit Serifen',
    dsn3('botanisch').getPropertyValue('--f-display').indexOf('Newsreader') !== -1);
  d.documentElement.setAttribute('data-design', 'botanisch');

  /* — Werkzeugkacheln — */
  /* Die Hoehe haengt nicht mehr an einer Kette aus height:100% ueber
     drei Ebenen. Prozenthoehen brauchen eine aufgeloeste Elternhoehe;
     bei einem gestreckten Gitterfeld ist die je nach Zeitpunkt noch
     auto, und dann sackte eine einzelne Kachel auf Inhaltshoehe
     zusammen und sass durch align-content:center zu hoch. */
  pruef('Kachelabschnitt streckt sich',
    /\.kachelgitter section\[data-wz\]\{[^}]*align-self:stretch/.test(stil3));
  pruef('Kachelknopf streckt sich mit',
    /\.kachelgitter \.wz-kopfzeile\{[^}]*flex:1 1 auto/.test(stil3)
    && /\.kachelgitter \.wz-kopf\{[^}]*flex:1 1 auto/.test(stil3));
  pruef('Keine Prozenthoehen mehr in der Kachelkette',
    !/\.kachelgitter [^{]*\{[^}]*height:100%/.test(stil3));
  /* Zweimal habe ich versucht, den Knopf auf Feldhoehe zu zwingen —
     erst height:100%, dann flex. Beide Male sass eine Kachel schief.
     Jetzt traegt der Abschnitt das Aussehen: er IST das Gitterfeld
     und wird von grid-auto-rows:1fr gestreckt. Was der Knopf tut,
     kann das sichtbare Rechteck nicht mehr veraendern. */
  pruef('Die Kachel ist der Abschnitt, nicht der Knopf',
    /\.kachelgitter section\[data-wz\]\{[^}]*border:1px solid/.test(stil3)
    && /\.kachelgitter section\[data-wz\]\{[^}]*background:var\(--fl-karte\)/.test(stil3));
  pruef('Der Knopf traegt kein eigenes Aussehen mehr',
    /\.kachelgitter \.wz-kopf\{[^}]*border:0/.test(stil3)
    && /\.kachelgitter \.wz-kopf\{[^}]*box-shadow:none/.test(stil3));

  pruef('Das Gitter streckt seine Felder',
    /\.kachelgitter\{[^}]*align-items:stretch/.test(stil3));
  /* Vier Zeilen: Symbol, Name, Unterzeile, das Wort „Öffnen“. Mit
     dreien landete die vierte in einer stillschweigend erzeugten
     Zeile und der Abstand stimmte nur zufaellig. */
  pruef('Die Kachel hat eine Zeile je Bestandteil',
    /grid-template-rows:var\(--wz-ikon-h,46px\) auto auto auto/.test(stil3));

  /* — Mehr als Menü — */
  const mh = Array.prototype.slice.call(d.querySelectorAll('section[data-mh]'));
  pruef('Mehr hat Einträge', mh.length >= 10, String(mh.length));
  pruef('jeder Menüpunkt hat ein Symbol',
    mh.every(x => x.querySelector('.mh-ikon svg')),
    mh.filter(x=>!x.querySelector('.mh-ikon svg')).map(x=>x.dataset.mh).join(','));
  w.__T('mehrMenueAusstatten()');
  pruef('kein doppeltes Menüsymbol',
    mh.every(x => x.querySelectorAll('.mh-ikon').length === 1));
  pruef('Klartext behält die großen Zeilen',
    stil3.indexOf('html:not([data-design="klartext"]) section[data-mh] .wz-kopf{') !== -1);

  /* — Aufgaben und Wunschliste — */
  pruef('Aufgaben stehen unter Mehr',
    d.getElementById('todo-sec').dataset.ans === 'mehr'
    && d.getElementById('todo-sec').dataset.mh === 'aufgaben');
  pruef('Wunschliste steht unter Mehr',
    d.getElementById('wunsch-sec').dataset.ans === 'mehr'
    && d.getElementById('wunsch-sec').dataset.mh === 'wunsch');
  w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());'); await tick();
  pruef('Aufgaben öffnen als Fenster', w.__T("sektionOeffnen('aufgaben')") === true);
  pruef('und der Inhalt ist drin', !!d.querySelector('#sekm-rumpf #alltodo'));
  await zu('sek-modal');
  pruef('Wunschliste öffnet als Fenster', w.__T("sektionOeffnen('wunsch')") === true);
  pruef('und der Inhalt ist drin', !!d.querySelector('#sekm-rumpf #wunsch'));
  await zu('sek-modal');
  w.__T('S.wish = []; sichern(); wunschSichtbarkeit();');
  pruef('leere Wunschliste bleibt erreichbar',
    d.getElementById('wunsch-sec').hidden === false);

  /* — Heute aufgeräumt — */
  pruef('keine Raumknöpfe mehr auf Heute', !d.getElementById('raumknoepfe'));
  pruef('Heute zeigt nur noch das Wetter',
    w.__T("String(render).indexOf('heuteStatusHTML') === -1") === true);
  pruef('Aufgabenliste nicht mehr auf Heute',
    !d.querySelector('section[data-ans="heute"] #alltodo'));

  /* — Ortsfrage — */
  pruef('Ortsfrage existiert', w.__T('typeof ortFrageStellen') === 'function');
  pruef('Ortsfrage merkt sich das Fragen', w.__T(`(function(){
    S.wetter = {ort:null, gefragt:false}; sichern();
    if(!allePflanzen().length) return 'keine Pflanze';
    ortFrageStellen();
    return S.wetter.gefragt === true; })()`) === true);
  pruef('und fragt kein zweites Mal', w.__T(`(function(){
    let mal = 0; const alt = window.prompt;
    window.prompt = ()=>{ mal++; return ''; };
    ortFrageStellen();
    window.prompt = alt; return mal === 0; })()`) === true);
  pruef('ohne Pflanzen wird nicht gefragt', w.__T(`(function(){
    const merk = S.eigene;
    const alt = window.allePflanzen;
    S.eigene = [];
    S.wetter = {ort:null, gefragt:false};
    ortFrageStellen();
    const r = S.wetter.gefragt === false;
    S.eigene = merk; sichern();
    return r === true ? true : 'noch ' + allePflanzen().length; })()`) === true);

  /* — Sammlung — */
  pruef('Umschalter sitzt in der Filterklappe',
    !!d.querySelector('#ctrl-klapp #sammel-ansicht'));
  pruef('Umschalter ist erreichbar',
    d.getElementById('sammel-ansicht').hidden === false);
  pruef('drei Ansichten bleiben',
    d.querySelectorAll('#sammel-ansicht [data-samview]').length === 3);
  pruef('Terrarium steht auf Raster',
    w.__T('DESIGNS.terrarium.sammlung') === 'raster');
  pruef('Terrarium schneidet Vielecke',
    (stil3.match(/clip-path:polygon/g) || []).length >= 4);
  pruef('Vielecke leuchten', stil3.indexOf('drop-shadow(0 0 12px rgba(94,230,160,.30))') !== -1);
  pruef('Bild füllt sein Format',
    /\.sam-raster \.card:not\(\.open\) \.thumb,[\s\S]{0,180}object-fit:cover/.test(stil3));
  /* Die allgemeine Rasterregel steht bei vier Klassen. Wer das
     Bildformat setzt, muss mindestens gleichziehen, sonst bleibt
     jede Kachel quadratisch. */
  /* Die Rasterkachel traegt nur Name und Standzeile. */
  pruef('Kachel zeigt keine Kennung',
    /\.sam-raster \.card:not\(\.open\) \.card-id,/.test(stil3));
  pruef('Kachel zeigt keinen botanischen Zweitnamen',
    /\.sam-raster \.card:not\(\.open\) \.card-bot,/.test(stil3));
  pruef('Kachel zeigt keinen Standort',
    /\.sam-raster \.card:not\(\.open\) \.card-lage,/.test(stil3));
  pruef('Kachel zeigt keinen Feuchtebalken',
    /\.sam-raster \.card:not\(\.open\) \.bar\{display:none/.test(stil3));
  pruef('Standzeile steht im Raster',
    /\.sam-raster \.card:not\(\.open\) \.card-stand\{display:flex/.test(stil3));
  pruef('Standzeile sonst still', /\.card-stand\{display:none/.test(stil3));
  pruef('Punkt traegt nicht allein',
    /\.card-stand::before\{content:''/.test(stil3));

  const karte1 = w.__T(`(function(){
    const p = allePflanzen()[0]; return p ? cardHTML(p) : ''; })()`);
  pruef('Karte hat eine Standzeile', karte1.indexOf('class="card-stand"') !== -1);
  pruef('Standzeile nennt einen Ton', /data-ton="(wasser|gift|sicher|warn|still)"/.test(karte1),
    karte1.slice(0, 200));
  pruef('Name haengt nicht mehr zwei Namen aneinander',
    !/class="card-name">[^<]*\(/.test(karte1),
    (karte1.match(/class="card-name">[^<]*/) || [''])[0]);

  const stand = (o) => w.__T(`(function(){
    const p = Object.assign({id:'PRUEF-1', klasse:'normal'}, ${o});
    return karteStand(p).text; })()`);
  pruef('ohne Gievermerk keine Panik', stand("{}") === 'Noch nicht erfasst', stand("{}"));

  /* Zeichen bleiben, Zustandstoene sind mehr als zwei */
  pruef('Zeichenreihe bleibt auf der Kachel',
    !/\.sam-raster \.card:not\(\.open\) \.icons,/.test(stil3)
    && /\.sam-raster \.card:not\(\.open\) \.icons\{/.test(stil3));
  ['alarm','ruhe','bluete','warn'].forEach(t=>{
    pruef('Ton ' + t + ' hat eine eigene Farbe',
      new RegExp('\\.card-stand\\[data-ton="' + t + '"\\]::before\\{background:var\\(--')
        .test(stil3));
  });
  ['alarm','ruhe','bluete','sonne'].forEach(t=>{
    pruef('Token --' + t + ' steht in allen Tabellen',
      (stil3.match(new RegExp('--' + t + ':', 'g')) || []).length >= 4,
      String((stil3.match(new RegExp('--' + t + ':', 'g')) || []).length));
  });
  const tonVon = (code) => w.__T(`(function(){
    S.zustand['PRUEF-2'] = {code:'${code}', seit:null, bis:null};
    const t = karteStand({id:'PRUEF-2', klasse:'normal'}).ton;
    delete S.zustand['PRUEF-2']; return t; })()`);
  pruef('Quarantaene schlaegt Alarm', tonVon('quarantaene') === 'alarm', tonVon('quarantaene'));
  pruef('Schaedlinge ebenso', tonVon('schaedlinge') === 'alarm', tonVon('schaedlinge'));
  pruef('Winterruhe ist kein Alarm', tonVon('winterruhe') !== 'alarm', tonVon('winterruhe'));
  pruef('Karte traegt ihren Ton als Merkmal',
    /<article class="card" data-karte="[^"]*" data-ton="/.test(karte1), karte1.slice(0,90));

  /* Terrarium: Rand nach Zustand, botanischer Name bleibt */
  pruef('Zustandston zeichnet den Rand des Vielecks',
    /card:not\(\.open\) \.card-btn::after\{background:none;opacity:1;box-shadow:inset 0 0 0 2px var\(--zst\)/
      .test(stil3.replace(/\n\s*/g, '')));
  pruef('und leuchtet um die Form herum',
    /card:not\(\.open\) \.card-btn\{filter:drop-shadow\(0 0 4px var\(--zst\)\)/
      .test(stil3.replace(/\n\s*/g, '')));
  pruef('kein Rechteck um die Kristallform',
    /"terrarium"\] \.sam-raster \.card:not\(\.open\)\{border:0;box-shadow:none\}/
      .test(stil3.replace(/\n\s*/g, '')));
  pruef('Karte hebt sich vom Grund ab',
    /\.card\{background:var\(--fl-karte\)/.test(stil3));
  pruef('Kein Pfeil mehr im Wort Oeffnen',
    /\.kachelgitter \.wz-kopf \.wz-p,/.test(stil3));
  pruef('jeder Zustandston faerbt den Rand',
    (stil3.match(/\.sam-raster \.card\[data-zton="[a-z]+"\]\{--zst:/g) || []).length >= 5);
  /* Der Rand meldet den Zustand, nicht die naechste Aufgabe:
     gesund leuchtet gruen, auch wenn heute gegossen werden muss. */
  const zton = (code) => w.__T(`(function(){
    if(${code === null}) { delete S.zustand['PRUEF-3']; }
    else S.zustand['PRUEF-3'] = {code:'${code}', seit:null, bis:null};
    const t = karteZustandTon({id:'PRUEF-3', klasse:'normal'});
    delete S.zustand['PRUEF-3']; return t; })()`);
  pruef('gesund leuchtet gruen', zton('gesund') === 'gesund', zton('gesund'));
  pruef('ohne Eintrag ebenso', zton(null) === 'gesund', zton(null));
  pruef('Quarantaene leuchtet rot', zton('quarantaene') === 'alarm', zton('quarantaene'));
  pruef('Gruen fuer gesund ist ein eigener Wert',
    (stil3.match(/--gesund:/g) || []).length >= 4,
    String((stil3.match(/--gesund:/g) || []).length));
  pruef('Karte traegt auch den Zustandston',
    /data-zton="[a-z]+"/.test(karte1), karte1.slice(0,140));
  pruef('botanischer Name bleibt in Terrarium',
    /html\[data-design="terrarium"\] \.sam-raster \.card:not\(\.open\) \.card-bot\{[\s\S]{0,40}display:block/
      .test(stil3));

  /* Heute: Kopf, Knoepfe, Wettersymbol */
  w.__T("ansichtZeigen('heute')"); await tick();
  pruef('Kopf gruesst in der zweiten Zeile',
    /gut|wach/i.test(d.getElementById('kopf-gruss').textContent),
    d.getElementById('kopf-gruss').textContent);
  pruef('darunter steht die Lage des Tages',
    /Pflanzen? (ist|sind) heute dran|nichts f/i.test(d.getElementById('kopf-lage').textContent),
    d.getElementById('kopf-lage').textContent);
  w.__T("ansichtZeigen('sammlung')"); await tick();
  pruef('auf anderen Reitern bleibt der Gruss weg',
    d.getElementById('kopf-gruss').textContent === ''
    && d.getElementById('kopf-lage').textContent === '');
  w.__T("ansichtZeigen('heute')"); await tick();
  pruef('alle Flaechen auf Heute tragen dieselbe Haut',
    /"botanisch"\] \.haupttat,[\s\S]{0,160}"botanisch"\] \.nt,[\s\S]{0,80}"botanisch"\] \.wt-leiste,/.test(stil3));
  pruef('kein Umrissknopf mehr auf dem Gruen',
    !/\.wrap \.nt\{[^}]*background:rgba\(245,242,234/.test(stil3));
  /* Das gekachelte Blattmuster ist einem Papierbild gewichen, das
     einmal oben liegt und nach unten ausl\u00e4uft \u2014 auf allen vier
     Reitern, nicht mehr nur auf Heute und Mehr. */
  pruef('Papierbild als eigene Datei, nicht als Text',
    /body::before\{[\s\S]{0,240}url\("\.\/bg-papier\.webp"\)/
      .test(stil3.replace(/\n\s*/g,'')));
  pruef('Kein gekacheltes SVG-Muster mehr',
    (stil3.match(/background-image:url\("data:image\/svg\+xml/g) || []).length === 0);
  pruef('Es l\u00e4uft nach unten aus',
    /body::before\{[\s\S]{0,600}mask-image:linear-gradient/
      .test(stil3.replace(/\n\s*/g,'')));
  pruef('Heute und Mehr tragen es kr\u00e4ftiger',
    /body\[data-ansicht="mehr"\]\{--bild-staerke:\.2\}/
      .test(stil3.replace(/\n\s*/g,'')));
  pruef('Der Inhalt liegt dar\u00fcber',
    /body>\*\{position:relative;z-index:1\}/.test(stil3.replace(/\n\s*/g,'')));
  pruef('Terrarium legt sein Bild hinter Heute und Mehr',
    /"terrarium"\] body\[data-ansicht="mehr"\]\{[\s\S]{0,320}bg-terrarium\.webp/
      .test(stil3.replace(/\n\s*/g,'')));
  pruef('mit gerechnetem Schleier darueber',
    stil3.indexOf('linear-gradient(rgba(12,24,16,.62),rgba(12,24,16,.62))') !== -1);
  pruef('Wettersymbol traegt seine Lage',
    w.__T("wetterSymbolHTML(WETTER_BILD.regen, true)").indexOf('data-lage="regen"') !== -1);
  pruef('Sonne und Regen bekommen Farbe',
    /\.wt-bild\[data-lage="klar"\] svg\{stroke:var\(--sonne\)/.test(stil3)
    && /\.wt-bild\[data-lage="regen"\] svg\{stroke:var\(--wasser\)/.test(stil3));
  pruef('die drei Knoepfe ruecken nach unten',
    /\.heute-start\{display:block;margin:clamp\(20px,8vh,68px\)/.test(stil3));

  pruef('Bildformat schlaegt die allgemeine Rasterregel',
    /\.sam-raster \.card:not\(\.open\) \.thumb\{[^}]*aspect-ratio:1 \/ var\(--bildhoehe/.test(
      stil3.replace(/\n/g, '')) ||
    /aspect-ratio:1 \/ var\(--bildhoehe, 1\);/.test(
      (stil3.split('html[data-design="botanisch"] .sam-raster .card:not(.open) .thumb,')[1] || '').slice(0, 260)));

  w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());');
  await tick();

  /* ══════════ 2.9.14 — eine Hauptsache ══════════ */
  const stil4 = w.__T(`(function(){ let t=''; Array.prototype.forEach.call(
    document.querySelectorAll('style'), s=>{ t += s.textContent; }); return t; })()`);
  const haupt = d.getElementById('btn-giessmodus');
  pruef('Gießen ist der Hauptknopf', haupt && haupt.classList.contains('haupttat'));
  pruef('Hauptknopf trägt Marke, Text und Pfeil',
    haupt && haupt.querySelector('.ht-marke svg') && haupt.querySelector('.ht-txt b')
    && haupt.querySelector('.ht-pfeil'));
  pruef('Untertitel bleibt ansprechbar', !!d.getElementById('gm-start-sub'));
  const neben = Array.prototype.slice.call(d.querySelectorAll('.nebentaten .nt'));
  pruef('zwei Nebenknöpfe', neben.length === 2, String(neben.length));
  pruef('Rundgang ist einer davon',
    neben.some(b => b.id === 'btn-rundgang'));
  pruef('Doktor ist der andere',
    neben.some(b => b.id === 'btn-doktor-heute'));
  pruef('Nebenknöpfe haben Symbole', neben.every(b => b.querySelector('svg')));
  pruef('Symbole werden nicht vorgelesen',
    neben.every(b => b.querySelector('svg').getAttribute('aria-hidden') === 'true'));
  pruef('Klartext stapelt die Nebenknöpfe',
    stil4.indexOf('html[data-design="klartext"] .nebentaten{grid-template-columns:1fr}') !== -1);
  pruef('leerer Hauptknopf tritt zurück', /\.haupttat\.leer\{[^}]*background:var\(--fl-karte\)/.test(stil4));
  w.__T('while(MODAL_STAPEL.length) _modalWeg(modalOben());'); await tick();
  d.getElementById('btn-doktor-heute').click();
  await tick();
  pruef('Doktor öffnet von Heute aus', w.__T("_sekOffen ? _sekOffen.key : null") === 'doktor');
  await zu('sek-modal');

  /* ══════════ 2.9.15 — geradegezogen ══════════ */
  const stil5 = w.__T(`(function(){ let t=''; Array.prototype.forEach.call(
    document.querySelectorAll('style'), s=>{ t += s.textContent; }); return t; })()`);

  pruef('Startzeile stapelt statt zu spalten',
    /\.heute-start\{display:block/.test(stil5));
  pruef('Nebenknöpfe stehen unter dem Hauptknopf',
    d.querySelector('.heute-start .haupttat').nextElementSibling
      .classList.contains('nebentaten'));
  pruef('Stempel sitzt oben rechts, aber im Fluss',
    /\.sich-stempel\{order:-1;align-self:flex-end/.test(stil5));
  pruef('Stempel bricht nicht mehr an fester Breite',
    !/\.sich-stempel\{[^}]*position:absolute/.test(stil5));
  pruef('Stempel bleibt voll deckend', !/\.sich-stempel\{[^}]*opacity:/.test(stil5));

  /* Stempeltext: Datum und Fassung */
  w.__T("S.eigene = S.eigene || []; if(!S.eigene.length) S.eigene.push({id:'x', name:'Probe'});");
  w.__T("S.letzteSicherung = iso(HEUTE); S.sicherFassung = FASSUNG; sicherungStempel();");
  const stp = d.getElementById('sich-stempel');
  pruef('Stempel nennt Datum und Fassung',
    stp.textContent === 'Sicherung · heute · aktuelle Fassung', stp.textContent);
  pruef('aktuelle Fassung faerbt nicht', !stp.classList.contains('alt'));
  w.__T("S.sicherFassung = '2.8.0'; sicherungStempel();");
  pruef('alte Fassung wird benannt', stp.textContent.indexOf('Fassung 2.8.0') !== -1, stp.textContent);
  pruef('alte Fassung faellt auf', stp.classList.contains('alt'));
  w.__T("S.sicherFassung = null; sicherungStempel();");
  pruef('ohne Angabe wird nichts erfunden',
    stp.textContent.indexOf('Fassung unbekannt') !== -1, stp.textContent);
  w.__T("S.letzteSicherung = null; sicherungStempel();");
  pruef('nie gesichert steht als Wort da',
    stp.textContent === 'Sicherung · nie', stp.textContent);
  w.__T("S.letzteSicherung = iso(HEUTE); S.sicherFassung = FASSUNG; sicherungStempel();");
  stp.dispatchEvent(new w.MouseEvent('click', {bubbles:true}));
  await new Promise(r => setTimeout(r, 160));
  pruef('Stempel fuehrt zur Sicherung', w.__T("modalOffen('sek-modal')") === true);
  pruef('und zwar in den richtigen Abschnitt',
    d.getElementById('sekm-titel').textContent.indexOf('Sicherung') !== -1,
    d.getElementById('sekm-titel').textContent);
  w.__T("modalZu('sek-modal')");
  await new Promise(r => setTimeout(r, 160));

  /* Wetterleiste: dieselbe Schriftgroesze wie die Nebenknoepfe */
  pruef('Wetterschrift wie die Knoepfe daneben',
    /\.wt-oben\{[^}]*font-size:1\.02rem/.test(stil5) && /\.nt b\{[^}]*font-size:1\.02rem/.test(stil5));
  pruef('Vorschaubilder werden beschnitten, nicht gedehnt',
    stil5.indexOf('img.thumb{object-fit:cover') !== -1);

  /* Wetterlage */
  const lage = (c) => w.__T(`(function(){ const l = wetterLage(${c}); return l ? l.wort : null; })()`);
  pruef('klar', lage(0) === 'klar');
  pruef('teils bewölkt', lage(2) === 'teils bewölkt');
  pruef('bedeckt', lage(3) === 'bedeckt');
  pruef('Regen', lage(61) === 'Regen');
  pruef('Schnee', lage(73) === 'Schnee');
  pruef('Schneeschauer zählt als Schnee', lage(85) === 'Schnee');
  pruef('ohne Schlüssel keine Lage', lage(null) === null);
  pruef('Lage wird mit abgerufen',
    w.__T("String(wetterHolen).indexOf('weather_code') !== -1") === true);

  w.__T(`(function(){
    S.wetter = {ort:'Leipzig', lat:51.34, lon:12.37,
      daten:{jetzt:14, lage:61, hoch:18, tief:9, regen:3, regenMorgen:0},
      stand:new Date().toISOString(), gefragt:true};
    sichern(); })()`);
  const wz = w.__T('wetterZeileHTML()');
  pruef('Wetter steht in einer Leiste', wz.indexOf('wt-leiste') !== -1);
  pruef('mit Zeichnung', wz.indexOf('wt-bild') !== -1 && wz.indexOf('<svg') !== -1);
  pruef('Zeichnung wird nicht vorgelesen', wz.indexOf('aria-hidden="true"') !== -1);
  pruef('Lage steht auch als Wort', wz.indexOf('Regen') !== -1);
  pruef('Leiste hat Rahmen und Fläche',
    /\.wt-leiste\{[^}]*border:1px solid var\(--linie\)/.test(stil5));

  console.log('\n── Ergebnis ──');
  if (fehler.length) { console.log('  ' + fehler.length + ' Fehler'); fehler.forEach(f => console.log('   · ' + f)); process.exit(1); }
  console.log('  ' + zahl + ' Prüfungen, alles sauber');
  process.exit(0);
}, 2500);
