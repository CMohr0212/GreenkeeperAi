# Übergabe — GreenkeeperAI

Stand: 11.09.2026, Ende der Sitzung. Fassung **3.12.0**, sw.js **v105**,
Prüfstand **1559 Prüfungen, alles sauber**.

---

## Wer hier arbeitet

- Chris ist Eigentümer, Produktverantwortlicher und einziger Tester.
- Er arbeitet **ausschließlich vom Handy über die GitHub-Weboberfläche**.
  Jede Lieferung muss eine fertig hochladbare Datei sein.
- Er liest keinen Code, debuggt nicht und führt nichts lokal aus.
- Design am Handy: **Botanisch**.

## Arbeitsweise

- **Planmodus zuerst.** Kein Code, bevor Chris den Plan freigibt.
- Antworten kurz, Stichpunkte, keine Begründungsabsätze.
- Fortschritt: was getan wurde, nicht wie. Erklärung nur bei Abweichung vom Plan.
- Nur wirklich geänderte Dateien liefern.
- Keine Zwischenstände — alle Änderungen einer Sitzung in einer Fassung.
- `node pruef.js` ist nach jeder Änderung Pflicht.
- Jede funktionale Lieferung: CHANGELOG.md, neuer PATCHNOTES-Eintrag,
  FASSUNG hoch, VERSION in sw.js hoch. Alle drei zusammen.
- Reine Fehlerkorrekturen an unveröffentlichten Neuerungen bekommen keinen
  eigenen PATCHNOTES-Eintrag.
- Dateinamen tragen nie Fassung, Datum oder Nummer. GitHub ersetzt beim
  Hochladen nur gleichnamige Dateien.
- Die Vorschaudatei heißt immer `vorschau.html`.
- Diese Übergabedatei heißt immer `uebergabe.md` und wird jede Sitzung ersetzt.

## Technik in Kürze

- Alles in einer `index.html` (~27.000 Zeilen), dazu `sw.js` und `CHANGELOG.md`.
  Kein Framework, kein Build.
- Zustand in localStorage (`pflanzenglossar-start`), Fotos in IndexedDB.
- Prüfstand: `node pruef.js`, jsdom, Brücke `window.__T`.
  `pruef.js` hält die Fassungsnummer fest — muss mit FASSUNG mitwandern.
- Patchskripte in Python: immer `assert s.count(alt) == n` vor jeder Ersetzung.
- Dateien holen: `curl -sL -H "User-Agent: c"` von raw.githubusercontent.com.
  Direktes web_fetch auf diese Domain scheitert.
- Gegenprobe-Standard: jede Korrektur braucht eine Prüfung, die fehlschlägt,
  wenn man die Korrektur entfernt. Gegenproben in Häppchen mit Zeitlimit laufen
  lassen, sonst bleibt bei Abbruch eine kaputte Datei liegen.

---

## Diese Sitzung: 3.12.0

Ziel war die Etappe A2 der Pflanzenkarte, davor eine Designrunde. Chris hat
die Designvorschau abgenommen („Finde ich super so“), dann umgesetzt.

### Design (nur Botanisch)

Die Karte spricht jetzt dieselbe Sprache wie Heute, Mehr, Werkzeuge und
Gießmodus. Klartext und Terrarium bleiben unverändert — alle neuen Regeln
hängen an `html[data-design="botanisch"] #karte-rumpf`.

- Kopf: Bild, Fotoband, dann Name. Ohne Foto eine einzige Zeile
  „Foto hinzufügen“ statt leerem Kasten plus gestricheltem Plusfeld.
- Interne Kennung (E-100) raus aus dem Untertitel.
- Katze raus aus den Kurzprofil-Zeichen; die Warnung sagt es schon.
- Warnung als getönte Fläche statt Rahmen mit Balken.
- Aufgaben als eine Zeile wie in Mehr, eigener Merkschlüssel
  `aufgaben-zeile`, startet zugeklappt.
- Reiter: Text mit Unterstrich, `position:sticky`.
- Jeder Abschnitt eine weiche Kachel, Werte als Zeilen statt Mono-Etiketten,
  leere Zustände leise.

### A2-Inhalte (in allen drei Designs)

- **Licht am Platz** (Reiter Standort): Sonnenstunden im laufenden Monat,
  Spanne der Art als Band, Urteil passt/zu wenig/zu viel. Ohne Platz im
  Grundriss keine Zahl, stattdessen Knopf dorthin. **Wirkt nicht auf das
  Gießintervall** — nur Anzeige.
- **Topf und Substrat** (Reiter Pflege): Topfgröße, letztes Umtopfen,
  empfohlene Mischung der Art mit Teilen. Topfgröße auf der Karte
  nachtragbar, Sprung in den Substratrechner.
- **Rhythmus von Hand**: Sommer und Winter getrennt, Marke zur Herkunft
  (Gießklasse / gelernt / von Hand / Wasserwechsel), zurück zur Gießklasse.
- **Giftigkeit je Tier** (Reiter Wissen): eine Zeile pro eingetragenem Tier.
  Ohne Tiere kein Abschnitt und keine Warnung.
- **Steckbrief** ergänzt Familie, Wuchsform, Frostgrenze aus der
  Artenbibliothek. Eigene Angaben bleiben stehen.

### Abweichungen vom Plan, beide abgesprochen

- „Angerührte Mischung merken“ ist herausgefallen: In der App wird eine
  Mischung nur empfohlen, nie angerührt — es gibt keinen Auslöser. Liegt im
  Backlog.
- Ein eigener Rhythmus schaltet jetzt auch einen früher gelernten Faktor ab.
  Sonst stünde nach „alle 7 Tage“ eine andere Zahl auf der Karte.

### Neue oder geänderte Funktionen (zum Wiederfinden)

`ivEigen`, `rhythmusQuelle`, `ivEditorHTML`, `topfSubstratHTML`,
`lichtAmPlatzHTML`, `frostWort`, `steckbriefDaten`, `kartenZeichen`,
`aufgabenZeileHTML`. `trackerHTML` ist entfallen. `galerieHTML(p, ruhig)`
hat einen zweiten Parameter. `kGiftHTML` und `warnungenHTML` hängen jetzt an
`meineTiere()`.

---

## Wichtig für die nächste Sitzung

1. **Der Reiter Wissen bleibt immer stehen.** Ist zur Art nichts hinterlegt,
   steht dort ein Hinweis. Vorher verschwand der Reiter — das hat beim
   Umbau zwei Prüfungen umgeworfen.
2. **Kein `background-image:url("data:image/svg+xml…")` im Stylesheet.**
   Eine Prüfung verbietet das seit dem Papierbild. Selects behalten deshalb
   den Systempfeil.
3. **Prüfungen nicht spröde schreiben.** `auf.querySelector(…).textContent`
   stürzt bei einer Gegenprobe ab, statt sauber FEHL zu melden. Immer
   `((a && a.querySelector(…)) || {}).textContent || ''`.
4. `prompt()` gibt es in jsdom nicht — die Meldung im Protokoll ist normal.

## Noch offen aus dieser Sitzung

- Klebende Reiter und die Zustandsauswahl am echten Gerät ansehen.
- Der Sprung „Im Substratrechner öffnen“ von der Karte aus ist nicht am
  Gerät getestet, nur die Verdrahtung.

### Gleich im nächsten Schritt mitnehmen: Lernen über einem Handwert

Klein, aber inhaltlich wichtig. In 3.12.0 sperrt ein eigener Rhythmus das
Nachlernen komplett. Das ist zu streng: Wer einmal von Hand etwas eingestellt
hat, soll trotzdem übernehmen können, was der Gießmodus später lernt — zweimal
„noch feucht“ oder zweimal „staubtrocken“ sagen ja etwas.

Verhindert werden sollte nur eines: dass auf der Karte „alle 7 Tage“ steht und
die App in Wahrheit mit 9 rechnet.

Entscheidung (Chris, 12.09.): **Der Handwert ersetzt die Gießklasse als
Ausgangspunkt, mehr nicht — und das Lernen ändert ihn nie still, sondern
schlägt vor.**

- Nach zwei gleichgerichteten Rückmeldungen fragt die Karte:
  „Zweimal noch feucht — Sommer auf 9 Tage setzen?“ Ein Tipp übernimmt, und
  der neue Wert ist dann der Handwert.
- Nichts verschiebt sich hinter dem Rücken; passt zum Düngetag, der auch fragt
  statt einfach zu tun.
- Verworfen: still lernen und beide Zahlen anzeigen (zwei Zahlen für eine
  Sache), sowie still lernen und nur das Ergebnis zeigen (genau der
  Widerspruch, der in 3.12.0 rausgeflogen ist).
- **Wichtiges Detail:** Wird der Rhythmus von Hand geändert, muss der bis
  dahin gelernte Faktor zurück auf 1. Sonst schlägt ein alter Faktor sofort
  auf den frischen Wert durch, und man landet wieder bei der Zahl, die man
  gerade wegkorrigiert hat.
- Gegenprobe dazu: Ein Handwert plus zwei Rückmeldungen darf den gerechneten
  Wert **nicht** verschieben, solange der Vorschlag nicht angenommen wurde.

## Backlog

- Nach dem Hochladen: Chris an eine Pause von 1–3 Tagen erinnern, in der er
  lernt, wie er am besten mit Claude arbeitet (Prompting, Modellwahl,
  Arbeitsweise). Steht seit mehreren Sitzungen an.
- Gießhistorie auf der Pflanzenkarte als Diagramm, das die Abstände deutlich
  macht. In der Vorschau war ein Balkenbild dafür — noch nicht gebaut.
- Historie als umschaltbarer Zeitstrahl: Gießen, Blatt/Foto, Doktor,
  Umtopfen, Vermehren.
- Sammelvermehrung: Bilderstapel aus der Sammlung, um Vermehrungswege per KI
  zu bestimmen (Eingabegrenzen von Gemini beachten).
- Pflichtkriterien in den KI-Aufträgen (Doktor und Anlegen): Gesundheit
  (Schädlinge, Mängel, Krankheiten) plus Topf- und Platzbewertung mit
  konkreter Umtopf-Empfehlung.
- Lampen im Grundriss ausschließlich als angezeigter Lichtkegel, keine
  Weiterberechnung.
- Anbindung an Anthropic und OpenAI neben Gemini.
- „Angerührte Mischung merken“, falls je ein Auslöser dafür entsteht.

---

## Zu liefernde Dateien dieser Sitzung

`index.html`, `pruef.js`, `sw.js`, `CHANGELOG.md`, `uebergabe.md`
(und `vorschau.html`, falls die Designvorschau online bleiben soll).
