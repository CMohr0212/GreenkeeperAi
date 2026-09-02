# Übergabe 12 — GreenkeeperAI

**Stand am Ende dieser Sitzung: Fassung 3.2.6, `sw.js` v71, 1014 Prüfungen grün.**
Ausgangspunkt war 3.2.2 (im Repo). In dieser Sitzung entstanden vier Fassungen: 3.2.3, 3.2.4, 3.2.5, 3.2.6.

---

## Was hochzuladen ist

`index.html`, `sw.js`, `CHANGELOG.md`, `pruef.js` — alle vier aus dieser Sitzung.
**Noch nicht am Gerät getestet.** Chris hat bis 3.2.2 getestet; alles ab 3.2.3 ist ungeprüft.

---

## Was in dieser Sitzung passiert ist

### 3.2.3 — fünf Fehler aus Chris' Testlauf
- **Foto-Plus ging nur bei leerer Galerie.** Nicht diagnostiziert, sondern umgebaut: statt `<label>` mit verstecktem `<input>` gibt es jetzt einen einzigen Dateieingang am Dokument (`#foto-eingang`, angelegt von `fotoEingang()`) und einen `<button class="foto-add" data-p="…">`, der ihn programmatisch auslöst. Die Ursache ist damit nicht gefunden, sondern beseitigt.
- **Erste Werkzeugkachel 6 px flacher.** `.wrap section[data-ans]:not(.ans-aus).ans-erste` gab dem ersten Abschnitt einer Ansicht `margin-top:6px` — auf einem gestreckten Gitterfeld kostet das genau diese Höhe. `ans-erste` wird jetzt nicht mehr an Abschnitte im `.kachelgitter` vergeben, dazu ein CSS-Riegel.
- **Substratgalerie ohne Bilder beim ersten Öffnen.** `subAufbau()` lief nur einmal beim Start, da sind die Fotos noch nicht aus der IndexedDB gelesen. `sektionOeffnen('substrat')` ruft jetzt neu auf.
- **Stammbaum zählte Linienmitglieder doppelt.** `sbUmfang()` setzte `zahl = mitglieder.length` und ließ dieselbe Ebene noch einmal durch `lauf()` laufen. Jetzt nur `lauf(…, 0)`. Linienmitglieder heißen „Pflanzen", nicht „Ableger".
- **KI-Antworten brachen still ab.** `maxOutputTokens: 4096` ist weg (die Modelle bezahlen ihr Nachdenken aus demselben Topf); `finishReason === 'MAX_TOKENS'` mit Teiltext wirft jetzt eine Meldung, statt halb eingelesen zu werden.

### 3.2.4 — Doktor blättert, Mischungen nebeneinander
- **Doktor auf Stufen umgestellt.** `dokZeigen()` benutzte `dokSchritt >= n`; jetzt `=== n`. Neu: `dokStufeZeigen(nr)`, Fußleiste `#dok-fuss` mit `#dok-zurueck-f` / `#dok-weiter-f`. Weiter ist auf Stufe 2 gesperrt, solange kein Weg gewählt ist.
- **Feld für die eigene Frage** (`#dok-frage-eigen` → `dokFrage`). Geht als `MEINE FRAGE:` an den Anfang des Prompts.
- **Doktor-Prompt getrennt vom Anlegen-Prompt.** `DOKTOR_PROMPT_KOPF` neu geschrieben; `mitDoktorZeilen()` fügt zwei Pflichtzeilen `ANTWORT:` und `STELLE:` in `DIE ZEILEN` und ins Beispiel ein. `promptZahlSetzen()` zählt automatisch nach (Doktor 18 Felder, Anlegen unverändert 16). Parser kennt die Schlüssel `antwort` und `stelle`.
- **Umtopfen: sieben statt sechs Stufen.** Zutatenauswahl (4) und Rechnung (5) sind getrennt, Stecklinge 6, Abschluss 7.
- **Vergleichsansicht** `vergleichHTML(machbar, optimal)`: Wischspur mit zwei Karten, Punkten und `vglPunkteSetzen()`. Vorn die Mischung aus dem Vorrat, dahinter das Optimum samt Zukauf. Ohne Vorrat keine Spur.

### 3.2.5 — Diagnosekarte, Kopf- und Fußleiste
- **Reihenfolge in `dok-s4` umgedreht:** Hinweis, Einschätzung, Maßnahmen, Gift, dann `<details id="dok-abgleich-auf">` mit Zähler, dann Rückfragen.
- **Unsicherheitshinweis** ist ein Streifen mit × (`.dok-unsicher.knapp`), `kurzFehlt()` kürzt auf den ersten Satz / 96 Zeichen. `FEHLT:` im Prompt verlangt jetzt Stichworte statt Prosa.
- **`topfHTML()` ohne Empfehlungszeile** — die stand dort in voller Länge und gleich darunter noch einmal als Maßnahme.
- **Wasserkultur-Regel im Prompt:** fehlender Ablauf ist dort kein Mangel; die KI muss sich zwischen „so lassen" und „in Erde umstellen" entscheiden. Dazu: Maßnahmen auf einen Befehlssatz begrenzt.
- **`dokAbschliessen()`** setzt den Durchgang zurück und schließt das Fenster. **Nur dieser Knopf** — wer das Fenster verlässt, behält seine Eingaben. Auf der letzten Stufe wird aus „Weiter" der Knopf „Diagnose abschließen".
- **Kopfleiste neu:** `<button class="sekm-raus">` mit Pfeil-SVG links, Titel mittig (`text-align:center`, `--t-l`, `overflow-wrap:anywhere`), rundes i rechts. Gilt für `#sek-modal` und `#karte-modal`. `sekZurueckKnopf()` setzt nur noch `aria-label`, keinen Text mehr.
- **Fußleisten kleben:** `.as-fuss,.al-fuss,.ut-fuss` bekommen `position:sticky; bottom:…`.

### 3.2.6 — Raumansicht
- **`grStufe` hat einen dritten Wert `'ansicht'`.** Neuer Block `#gr-ansicht` mit `#gra-flaeche`, Lichtschiebern (`#gra-monat`, `#gra-zeit`), Lichtart-Knöpfen, `#gra-info`, `#gra-karte`, `#gra-warnungen` und „Diesen Raum bearbeiten".
- **Raumkarten haben zwei Knöpfe:** `data-raum-sehen` und `data-raum-auf`.
- **`markenPositionen(r)`** verteilt Pflanzen, die auf demselben Möbel stehen, ausgerichtet darauf: Spaltenzahl aus dem Seitenverhältnis (`Math.round(Math.sqrt(n * b/t))`), letzte Reihe mittig. Wird **nur in der Ansicht** benutzt (`grStufe === 'ansicht'`), damit im Editor keine Marke zurückspringt. Bodenpflanzen behalten ihren Ort.

---

## Offene Etappen, in dieser Reihenfolge verabredet

1. **Abschlussknopf vereinheitlichen.** Beim Doktor liegt der Abschluss seit 3.2.5 in der Fußleiste. Bei **Umtopfen, Anlegen und Vermehren** steht er weiter im Text der letzten Stufe (`#ut-fertig`, `#ver-los`, …). Ziel: auf der letzten Stufe wird aus „Weiter" überall die Abschlussaktion. Betrifft drei Assistenten — eigene Etappe, eigene Fassung.
2. **Etagen (Frontansicht der Möbel).** Welche Pflanze steht auf welchem Brett. Das ist eine **Datenänderung**: Möbel brauchen Etagen, Pflanzen eine Etagenangabe, und „Raum bearbeiten" braucht dafür eine eigene Oberfläche. Nicht nur Anzeige.
3. **Räume aneinanderlegen.** Nachbarschaft der Räume, damit die Lichtrechnung weiß, wo eine Wand nach innen zeigt und von dort keine Sonne kommen kann. Greift in `sonnenstundenRaum()` / `lichtWert()` ein.
4. **Gestaltung allgemein.** Chris will nach den Funktionen einmal über das Aussehen gehen. Die Kopfleiste ist erledigt.

### Älterer Rückstand (aus Übergabe 11, unverändert offen)
- **Sammelvermehrung**: Bilderstapel aus der Sammlung für Gemini, Antworten zurück auf einzelne Pflanzen.
- **Mehrere Anbieter**: Adapter für Anthropic und OpenAI.
- **Etappe F**: Düngen und Umtopfen als eigene Aufgabenarten.

---

## Was Chris am Gerät prüfen muss

Der Prüfstand kennt kein Layout. Ungetestet bleibt:
- ob das Foto-Plus bei belegter Galerie jetzt wirklich auslöst (der eigentliche Anlass für den Umbau),
- ob die klebende Fußleiste auf seinem Bildschirm nichts verdeckt,
- ob die Wischspur sich gut anfühlt und die Punkte mitlaufen,
- ob die Kacheln jetzt sichtbar gleich hoch sind,
- **ob der neue Doktor-Prompt bessere Antworten liefert** — ob die KI die braune Stelle benennt, statt Pflegehinweise aufzuzählen. Das ist die eigentliche offene Frage aus dieser Sitzung.
- ob die Marken in der Raumansicht auf den Möbeln vernünftig sitzen und die Beschriftungen sich nicht überdecken.

---

## Arbeitsweise (gilt weiter)

- **Planmodus zuerst.** Kein Code, bevor der Plan freigegeben ist. Chris will bei größeren Sachen erst wissen, ob ich ihn richtig verstanden habe.
- **Antworten kurz.** Stichpunkte, kein Fließtext, keine Rechtfertigungen. Erklärung nur, wenn ich vom Plan abweiche.
- **Etappen zusammenziehen, wenn sie nicht zu lang werden** — aber nicht vier auf einmal.
- **Keine Zwischenfassungen hochladen.** Alles sammeln, eine Fassung am Ende.
- **Jede Fassung braucht:** `CHANGELOG.md`, neuer Eintrag oben in `PATCHNOTES`, `FASSUNG` hoch, `VERSION` in `sw.js` hoch.
- **Nur geänderte Dateien liefern.**
- **`node pruef.js` ist Pflicht**, nicht optional. Syntaxprüfung aller Skriptblöcke davor.
- **Gegenprobe:** jeden Fix einzeln zurückdrehen und nachsehen, ob die neue Prüfung wirklich umfällt. Hat in dieser Sitzung viermal bestätigt, dass die Prüfungen etwas taugen — und beim Kachelfehler den Schuldigen benannt (`doktor-sec`).
- **Patchskripte in Python** mit `rep(old, new, n=1)` und `assert s.count(old) == n` vor jeder Ersetzung.

## Werkzeugkram

- Repo: `github.com/cmohr0212/GreenkeeperAi`, GitHub Pages.
- Dateien holen: `curl -sL -H "User-Agent: c" https://raw.githubusercontent.com/…` — `web_fetch` auf diese Domain scheitert.
- `npm install jsdom` im Arbeitsordner, bevor `pruef.js` läuft.
- Prüfstand-Eigenheiten: an dieser Stelle im Ablauf gibt es **erst eine Pflanze und keine Möbel** — wer beides braucht, legt es selbst an (siehe Grundriss-Block in `pruef.js`).
- Entwurfsdatei heißt immer `Vorschau.html`, ohne Fassungsnummer.

## Wiederkehrende Fehlerquellen

- **CSS-Spezifität** ist die häufigste Ursache. Zweimal in dieser Sitzung: `.ans-erste` schlug die Gitterregel, und `sekZurueckKnopf()` überschrieb den neuen Pfeil beim Blättern wieder mit „Fertig". Beim Ändern einer Regel immer prüfen, wer sie sonst noch trifft.
- **Prüfungen, die nie laufen.** Der erste Anlauf der Marken-Prüfung stand in einem `if(mo)`, und Möbel gab es keine — sie war grün, ohne je ausgeführt worden zu sein. Die Gegenprobe hat das aufgedeckt. Wenn eine neue Prüfung beim Zurückdrehen nicht umfällt, läuft sie vermutlich gar nicht.
