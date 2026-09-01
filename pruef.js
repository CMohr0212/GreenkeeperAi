const fs = require('fs');
const { JSDOM } = require('jsdom');

let html = fs.readFileSync('index.html', 'utf8');
/* Bruecke in die Seite hinein: let/const aus <script>-Bloecken sind
   von aussen nicht ueber window erreichbar. */
html = html.replace('</body>', '<script>window.__T=function(c){return eval(c)};</script>\n</body>');
const fehler = [];

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
  pruef('FASSUNG 3.0.0', w.__T('FASSUNG') === '3.0.0', w.__T('FASSUNG'));
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
  pruef('Fotos hinzufügen bleibt erreichbar',
    !!d.querySelector('#karte-rumpf .km-fotoband .foto-add input[type="file"]'));
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
  await zu('sek-modal');

  w.__T("sektionOeffnen('substrat')");
  await tick();
  [0,1,2].forEach(i => {
    pruef('Substrat · Schritt ' + (i+1), zielDa('substrat', i) === 'da', zielDa('substrat', i));
  });
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

    /* Zoom: das Minimum haengt an der Flaeche, nicht mehr hart auf 1. */
    pruef('Es gibt ein gerechnetes Zoom-Minimum',
      typeof w.__T('zoomMinimum()') === 'number');
    pruef('Es liegt zwischen 0,4 und 1',
      w.__T('zoomMinimum()') >= 0.4 && w.__T('zoomMinimum()') <= 1,
      String(w.__T('zoomMinimum()')));
    w.__T('zoomSetzen(3)');
    pruef('Hineinzoomen geht', w.__T('pZoom') === 3, String(w.__T('pZoom')));
    w.__T('zoomSetzen(0.1)');
    pruef('Herauszoomen endet beim Minimum',
      Math.abs(w.__T('pZoom') - w.__T('zoomMinimum()')) < 0.001,
      String(w.__T('pZoom')));
    pruef('Ganz heraus setzt die Verschiebung zur\u00fcck',
      w.__T('pPanX') === 0 && w.__T('pPanY') === 0);
    w.__T('zoomSetzen(1)');

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
       es damit keine Möglichkeit, eine Pflanze zu setzen. */
    pruef('Die Vollbild-Schublade kennt den Pflanzenmodus',
      html.indexOf("['moebel','kanten','pflanzen'].includes(pModus)") !== -1);
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
    w.__T("kiSchluesselSetzen('AIzaTESTTESTTESTTESTTESTTEST')");
    const inhalt = w.__T('sicherungInhalt()');
    pruef('Schlüssel steht nicht in der Sicherungsdatei',
      inhalt.indexOf('AIzaTESTTESTTEST') === -1);
    pruef('Schlüssel liegt nicht in S',
      JSON.stringify(w.__T('S')).indexOf('AIzaTESTTESTTEST') === -1);
    pruef('Schlüssel liegt in einem eigenen Fach',
      w.__T("localStorage.getItem(KI_SCHLUESSEL_FACH)") === 'AIzaTESTTESTTESTTESTTESTTEST');
    pruef('kiBereit meldet den Schlüssel', w.__T('kiBereit()') === true);
    pruef('Maske zeigt den Schlüssel nie ganz',
      w.__T("kiMaske('AIzaTESTTESTTESTTESTTESTTEST')").indexOf('TESTTESTTEST') === -1);

    /* --- Anbieter am Praefix --- */
    pruef('AIza wird als Google erkannt',
      w.__T("(kiAnbieter('AIzaSyAAAAAAAAAAAAAAAAAAAA')||{}).code") === 'google');
    pruef('AQ. wird als Google erkannt',
      w.__T("(kiAnbieter('AQ.Ab8RN6ABCDEFGHIJKLMNOP')||{}).code") === 'google');
    pruef('Anthropic wird erkannt und abgelehnt',
      w.__T("(kiAnbieter('sk-ant-api03-XXXXXXXXXXXX')||{}).kann") === false);
    pruef('OpenAI wird erkannt und abgelehnt',
      w.__T("(kiAnbieter('sk-proj-XXXXXXXXXXXXXXXXXXXX')||{}).kann") === false);
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
      JSON.stringify(liste).indexOf('AIzaTEST') === -1);

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

    /* --- Anzeige: beide Wege stehen untereinander --- */
    w.__T("S.kiDienst = 'direkt'; kiModusZeigen()");
    pruef('Direktkasten im Anlegen sichtbar',
      d.getElementById('ki-direkt-anlegen').hidden === false);
    pruef('Direktkasten im Doktor sichtbar',
      d.getElementById('ki-direkt-doktor').hidden === false);
    pruef('Der Kopierweg klappt zu',
      d.getElementById('neu-alt').open === false
      && !d.getElementById('neu-alt').classList.contains('nurweg'));
    pruef('Der Knopf heißt jetzt Fragen',
      d.getElementById('btn-gemini').textContent === 'Fragen');
    w.__T("S.kiDienst = 'gemini'; kiModusZeigen()");
    pruef('Ohne Direktweg steht der Kopierweg offen wie bisher',
      d.getElementById('neu-alt').open === true
      && d.getElementById('neu-alt').classList.contains('nurweg'));
    pruef('Ohne Direktweg ist der Direktkasten weg',
      d.getElementById('ki-direkt-anlegen').hidden === true);
    pruef('Der Knopf heißt wieder Öffnen',
      d.getElementById('btn-gemini').textContent === 'Öffnen');

    /* --- Modellwahl steht an allen drei Stellen --- */
    pruef('Drei Modellauswahlen: Einstellungen, Anlegen, Doktor',
      d.querySelectorAll('.ki-modell-wahl').length === 3,
      String(d.querySelectorAll('.ki-modell-wahl').length));
    w.__T('kiModellZeichnen()');
    const wahlen = [...d.querySelectorAll('.ki-modell-wahl')];
    pruef('Alle Auswahlen zeigen dieselbe Liste',
      wahlen.every(x => x.options.length === 3));
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
    pruef('Oberste Ebene sagt „Fertig\u201c', knopf.textContent.trim() === 'Fertig',
      knopf.textContent.trim());
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
      pruef('Knopf hei\u00dft jetzt „Zur\u00fcck\u201c', /Zur\u00fcck/.test(knopf.textContent),
        knopf.textContent.trim());
      pruef('Fenster ist noch offen', w.__T("modalOffen('sek-modal')"));

      knopf.click();
      await tick();
      pruef('Zur\u00fcck f\u00fchrt in die Einstellungen',
        w.__T('_sekOffen && _sekOffen.key') === 'einstell',
        String(w.__T('_sekOffen && _sekOffen.key')));
      pruef('und nicht aus dem Fenster heraus', w.__T("modalOffen('sek-modal')"));
      pruef('Rueckweg ist wieder leer', w.__T('_sekWeg.length') === 0);
      pruef('Knopf hei\u00dft wieder „Fertig\u201c', knopf.textContent.trim() === 'Fertig');

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
    pruef('F\u00fcnf Stufen', d.querySelectorAll('#wz-in-umtopfen [data-ut-stufe]').length === 5);
    pruef('Fortschritt hat f\u00fcnf Marken',
      d.querySelectorAll('#ut-fortschritt li').length === 5);
    pruef('Pflanzenliste ist gef\u00fcllt',
      d.querySelectorAll('#ut-pflanze option').length > 0);
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
    const erg = JSON.parse(w.__T('JSON.stringify(utEintragen())'));

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

    pruef('Der Ablauf steht danach wieder auf Stufe 1', w.__T('UT.stufe') === 1);

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
    pruef('Vorgemerkte stehen in eigener Gruppe',
      !!d.querySelector('#ut-pflanze optgroup[label="Vorgemerkt"]'));
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
  pruef('Kachelabschnitt streckt sich',
    /\.kachelgitter section\[data-wz\]\{[^}]*height:100%/.test(stil3));
  pruef('Kachelknopf streckt sich mit',
    stil3.indexOf('.kachelgitter .wz-kopfzeile{height:100%}') !== -1);

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
