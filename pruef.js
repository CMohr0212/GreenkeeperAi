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
        : {current:{temperature_2m:24.4},
           daily:{temperature_2m_max:[29.2], temperature_2m_min:[15.1], precipitation_sum:[0, 6.2]}};
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
  const tick = () => new Promise(r => setTimeout(r, 60));
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
  pruef('FASSUNG 2.9.9', w.__T('FASSUNG') === '2.9.9', w.__T('FASSUNG'));
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
  pruef('Botanisch · Heute dunkel', tf() === '#2C3E33', tf());
  w.__T("ansichtZeigen('sammlung')");
  pruef('Botanisch · Sammlung hell', tf() === '#FBF9F3', tf());
  w.__T("ansichtZeigen('mehr')");
  pruef('Botanisch · Mehr dunkel', tf() === '#2C3E33', tf());
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
  pruef('Bildhöhe gemessen',
    karte && karte.style.getPropertyValue('--bildhoehe') === '1.500',
    karte && karte.style.getPropertyValue('--bildhoehe'));
  pruef('Zeilenspanne gesetzt',
    karte && karte.style.getPropertyValue('--spanne') === '15',
    karte && karte.style.getPropertyValue('--spanne'));

  /* Ansicht-Fenster */
  pruef('drei Miniaturen', d.querySelectorAll('#dsn-wahl .dsn-schau').length === 3);
  const svgB = w.__T("designMiniatur('botanisch')");
  const svgT = w.__T("designMiniatur('terrarium')");
  pruef('Miniaturen unterscheiden sich', svgB !== svgT);
  pruef('Botanisch zieht seinen Farbwert', svgB.indexOf('#2C3E33') !== -1 || svgB.indexOf('44, 62, 51') !== -1, svgB.slice(0,120));
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

  console.log('\n── Ergebnis ──');
  if (fehler.length) { console.log('  ' + fehler.length + ' Fehler'); fehler.forEach(f => console.log('   · ' + f)); process.exit(1); }
  console.log('  ' + zahl + ' Prüfungen, alles sauber');
  process.exit(0);
}, 2500);
