# Übergabe — GreenkeeperAI

Stand: 12.09.2026, Ende der Sitzung. Fassung **3.13.0**, sw.js **v106**,
Prüfstand **1587 Prüfungen, alles sauber**.

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

- Alles in einer `index.html` (~28.000 Zeilen), dazu `sw.js` und `CHANGELOG.md`.
  Kein Framework, kein Build.
- Zustand in localStorage (`pflanzenglossar-start`), Fotos in IndexedDB.
- Prüfstand: `node pruef.js`, jsdom, Brücke `window.__T`.
  `pruef.js` hält die Fassungsnummer an zwei Stellen fest (FASSUNG und
  oberster PATCHNOTES-Eintrag) — muss mitwandern.
- Patchskripte in Python: immer `assert s.count(alt) == n` vor jeder Ersetzung.
- Dateien holen: `curl -sL -H "User-Agent: c"` von raw.githubusercontent.com.
  Direktes web_fetch auf diese Domain scheitert.
- jsdom ist im Container nicht vorinstalliert: einmal `npm install jsdom`.
- Gegenprobe-Standard: jede Korrektur braucht eine Prüfung, die fehlschlägt,
  wenn man die Korrektur entfernt. Gegenproben in Häppchen mit Zeitlimit laufen
  lassen, sonst bleibt bei Abbruch eine kaputte Datei liegen.

---

## Diese Sitzung: 3.13.0

Zwei Themen: die Historie auf der Pflanzenkarte und das Lernen über einem
Handwert. Beides in allen drei Designs.

### Lernen über einem Handwert

Umgesetzt wie am 12.09. entschieden: der Handwert ersetzt die Gießklasse als
Ausgangspunkt, mehr nicht — und das Lernen ändert ihn nie still, sondern
schlägt vor.

- `lernSchritt` sperrt bei gesetztem Handwert nicht mehr, sondern zählt.
  Zwei gleichgerichtete Rückmeldungen schreiben `ivVorschlag` in
  `S.zustand[id]`; eine gegenläufige setzt den Zähler zurück.
- Der Vorschlag gilt nur für seine Saison und nur zu dem Wert, zu dem er
  entstanden ist. Ändert sich der Handwert, ist er hinfällig.
- Die Karte fragt im Gießen-Block: „Zweimal ‚noch feucht‘ — Sommer auf
  9 Tage setzen?“ Ein Tipp übernimmt, daneben steht „Lassen, wie es ist“.
- **Der Fix aus 3.12.0 ist mit drin:** Eine Änderung von Hand *und* die
  Annahme eines Vorschlags setzen den gelernten Faktor zurück auf 1.
- Gegenprobe wie vermerkt: Handwert plus zwei Rückmeldungen verschiebt den
  gerechneten Wert nicht, solange nicht zugestimmt wurde.

### Historie (Reiter Verlauf)

- Umschalter **Balken / Zeitstrahl**, die Wahl steht in `S.histAnsicht` und
  gilt über alle Pflanzen.
- Balken: zwölf Abstände, ältester links, gestrichelte Marke beim gerechneten
  Rhythmus, Tipp auf einen Balken schreibt Datum und Tage in die Zeile
  darunter. Unter drei Gießterminen eine ruhige Zeile statt leerem Bild.
- Zeitstrahl: Gießgänge, Ereignisse, Fotos und Doktor-Befunde zusammen, nach
  Monaten gruppiert, das Neueste oben, 25 Einträge offen, Rest im Aufklapper.
  Foto-Zeilen springen ins Fotoband.

### Abweichung vom Plan

- Der Plan sagte „neue Kachel Historie im Reiter Pflege“. Im Reiter Verlauf
  stand aber längst ein Balkenbild der Gießabstände (`verlaufHTML`). Eine
  zweite Historie daneben wäre dasselbe zweimal gewesen. Also im Reiter
  Verlauf ausgebaut: der Block heißt jetzt „Historie“ statt „Gießabstände“,
  das alte Bild ist der Balkenteil. Die Textzeile „Gegossen: 01.08. · …“ ist
  entfallen, der Zeitstrahl sagt dasselbe genauer.

### Neue oder geänderte Funktionen (zum Wiederfinden)

`vorschlagRechnen`, `ivVorschlagVon`, `ivVorschlagWeg`,
`ivVorschlagUebernehmen`, `ivVorschlagHTML`, `VORSCHLAG_AB`,
`histAnsicht`, `zeitstrahlHTML`, `zeitstrahlEintraege`, `zsDatumIso`.
`lernSchritt`, `lernZuruecksetzen`, `verlaufHTML` und `giessVerlaufHTML` sind
umgebaut. Merkmale in `S.zustand[id]`: `ivVorschlag`, `vorZahl`,
`vorRichtung`. Neu in `S`: `histAnsicht`.

---

## Wichtig für die nächste Sitzung

1. **Der Reiter Wissen bleibt immer stehen.** Ist zur Art nichts hinterlegt,
   steht dort ein Hinweis.
2. **Kein `background-image:url("data:image/svg+xml…")` im Stylesheet.**
   Eine Prüfung verbietet das seit dem Papierbild.
3. **Prüfungen nicht spröde schreiben.** Immer
   `((a && a.querySelector(…)) || {}).textContent || ''`.
4. `prompt()` gibt es in jsdom nicht — die Meldung im Protokoll ist normal.
5. **Der Handwert ist ein Paar** (Sommer, Winter), der gerechnete Abstand eine
   Mischung nach Jahreslage. Ein Vorschlag ändert immer nur eine Seite — wer
   prüft, ob „die App mit der angezeigten Zahl rechnet“, darf nicht erwarten,
   dass der Handwert selbst herauskommt.
6. **Rückmeldungen zählen nur einmal je Gießzyklus** (`lernMarke`). Wer im
   Prüfstand zwei Schritte braucht, muss dazwischen einen Gießtermin
   eintragen.

## Noch offen

- Am echten Gerät ansehen: klebende Reiter, Zustandsauswahl, der Sprung
  „Im Substratrechner öffnen“, der Umschalter der Historie, der Tipp auf
  einen Balken und der Sprung vom Zeitstrahl ins Fotoband.
- Der Zeitstrahl hat keinen Filter je Ereignisart — bewusst weggelassen,
  liegt im Backlog.

## Backlog

- Nach dem Hochladen: Chris an eine Pause von 1–3 Tagen erinnern, in der er
  lernt, wie er am besten mit Claude arbeitet (Prompting, Modellwahl,
  Arbeitsweise). Steht seit mehreren Sitzungen an.
- Zeitstrahl: umschaltbar nach Ereignisart filtern.
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
