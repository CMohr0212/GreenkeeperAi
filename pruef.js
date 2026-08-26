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
  pruef('FASSUNG 2.9.18', w.__T('FASSUNG') === '2.9.18', w.__T('FASSUNG'));
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
  pruef('Botanisch · Heute dunkel', tf() === '#44574A', tf());
  w.__T("ansichtZeigen('sammlung')");
  pruef('Botanisch · Sammlung hell', tf() === '#FBF9F3', tf());
  w.__T("ansichtZeigen('mehr')");
  pruef('Botanisch · Mehr dunkel', tf() === '#44574A', tf());
  w.__T("ansichtZeigen('werkzeuge')");
  pruef('Botanisch · Werkzeuge hell', tf() === '#FBF9F3', tf());
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
    d.querySelectorAll('.kachelgitter section[data-wz]').length === 6);

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
  pruef('Schnellzugriff hängt in der festen Leiste',
    !!d.querySelector('#karte-fest .schnell'));
  pruef('Schnellzugriff nicht mehr im Scrollbereich',
    !d.querySelector('#karte-rumpf .schnell'));
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
  /* Morgen ist sie wieder da: der Vermerk trägt das gestrige Datum. */
  w.__T(`S.feuchtRueck['${pid}'].zuletzt = iso(new Date(Date.now() - 86400000)); sichern();`);
  pruef('morgen wieder fällig',
    w.__T(`giessListe().some(x=>x.id === '${pid}')`) === true);
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

  pruef('Zonengrün aufgehellt',
    dsn('botanisch').getPropertyValue('--zone-grund').trim().toUpperCase() === '#44574A');
  pruef('Notfarbe zieht mit',
    w.__T("DESIGNS.botanisch.dunkel") === '#44574A', w.__T("DESIGNS.botanisch.dunkel"));
  pruef('heller Hauptknopf auf Heute',
    stil.indexOf('body[data-ansicht="heute"] .wrap .haupttat,') !== -1);
  pruef('helle Karte setzt color selbst',
    /\.wrap \.stich\{[^}]*color:#1C2620/.test(stil));
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
  pruef('Kacheln höher', stil2.indexOf('min-height:158px') !== -1);
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
  pruef('Stempel sitzt in der oberen rechten Ecke',
    /\.sich-stempel\{position:absolute;top:5px;right:0/.test(stil5));
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
