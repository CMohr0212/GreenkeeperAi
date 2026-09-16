# PLAN — GreenkeeperAI

Stand 16.09.2026 · Ausgangsfassung 3.21.0 · **Zielversion 3.22.0, sw.js greenkeeperai-v117**

Erledigt und nicht mehr hier: Etappe A bis D, E1 „Der Lauf“ (3.19.0), Lösch-Fix (3.19.1), Kartei-Seite (3.20.0), E2 Steckbrief-Abgleich (3.21.0). Der Verlauf steht im CHANGELOG.

Offen sind: **E2b** (unten, freigegeben), **E4** Sorte, **E3** Pflegetexte, danach Sammel-Anlegen, **F** und **T**.

## Zweck der Kartei, von Chris am 16.09.2026 gesetzt

- Die Kartei hält die Pflanzenkarten auf dem neuesten Stand: Steckbriefdaten, die Sorte und art- oder sortenspezifische Pflegetexte.
- Nichts, was jede Pflanze braucht. Keine Töpfe, kein Zustand, kein Befund, keine Maßnahmen — das bleibt beim Doktor.
- Geprüft werden feste Daten wie Frost und Felder, die das Anlegen leer gelassen hat.
- Pflegetexte wie bei der Venusfliegenfalle („Pflegeschritte“, „Winterruhe“): die KI schreibt sie, wo keine da sind, und gleicht sie ab, wo welche da sind.
- Die Sorte ermittelt die KI, am besten schon beim Anlegen.
- Der Doktor verliert den Abgleich der Steckbriefdaten, den übernimmt die Kartei.

## Aufteilung (Regel 3.4, Regel 4.1)

Chris' Rückmeldung vom 16.09.2026 (Screenshots 21:02, 21:40, 21:41) enthält drei Themen. Vorschlag: je eine Sitzung.

- **E2b** (3.22.0): Kästchen statt Übernehmen-Knöpfe, Sammelknöpfe, Lücken-Auswahl ohne Ableger, Sortenschutz beim botanischen Namen.
- **E4** (3.23.0): Sorte durch die KI, im Anlegen und in der Kartei. Vorgezogen.
- **E3** (3.24.0): Pflegetexte durch die KI.

E2b zuerst, weil E4 das Fenster aus E2b benutzt.

---

# Freigegeben — Etappe E2b · Fenster mit Kästchen, Lücken-Auswahl

Freigabe von Chris am 16.09.2026 · Zielversion 3.22.0, sw.js greenkeeperai-v117. Mit Chris' Ergänzung vom selben Tag: Ableger erben alle erbbaren Eigenschaften.

## Ziel

Im Abgleich-Fenster werden Angaben per Kästchen gewählt und gesammelt übernommen, und „Nur mit Lücken“ wählt nur Pflanzen, deren Karte wirklich eine Lücke hat.

## Befund

- **Belegt** (Screenshots): Der Knopf „Übernehmen“ liegt über dem alten Wert („Kletterpfl|Übernehmen“, „Philodend|Übernehmen“). Der neue Wert steht als schmale Spalte, ein Wort je Zeile.
- **Vermutet**: Ursache ist die Flex-Zeile aus dem Doktor (`.ab-zeile`): Feldname in voller Breite, Knopf fest, der Wert schrumpft auf fast null und lange Wörter laufen unter den Knopf.
- **Belegt** (Code): `karteiLueckenMenge` nimmt jede Pflanze ohne Foto mit, auch ohne Lücke. Ein Test sichert das ab („Die Lücken-Menge nimmt auch die ohne Foto“). Ableger haben kein eigenes Foto.
- **Belegt** (Code): `ablegerAnlegen` übernimmt von der Mutter nicht `wichtig`, `speicher` und `giessart`. `wichtig` ist ein Pflichtfeld der Kartei, jeder Ableger zählt damit als „mit Lücken“, sobald die Mutter einen Hinweis hat — auch mit Foto.
- **Belegt** (Code): `karteiLuecken` liest nur die Pflanze selbst. Frostgrenze und Wuchsform aus der Bibliothek, die die Karte anzeigt, zählen trotzdem als Lücke.
- **Belegt** (Code): Kopfzeile („x mit Lücken“) und Kästchen („Nur mit Lücken (y)“) zählen verschieden: die Kopfzeile ohne, das Kästchen mit dem Foto-Kriterium.
- **Belegt** (Screenshot 21:02): Karte „Philodendron hederaceum Brasil (Dreifarbiger Kletterphilodendron)“, Antwort „Philodendron hederaceum“. Das Fenster bietet die kürzere Fassung an und dazu eine andere Art. Übernehmen würde die Sorte „Brasil“ aus der Karte löschen.
- **Belegt** (Code): Der Kartei-Auftrag verbietet Sortennamen. Das ändert erst E4.

## Änderungen

**Abgleich-Fenster**
- Jede Zeile: Kästchen links, darüber der Feldname (mit „von dir gesetzt“), darunter in voller Breite „alt → neu“, rechts das ×.
- Die Knöpfe „Übernehmen“, „Art übernehmen“, „Als … vermerken“ in der Zeile entfallen. Was eine Zeile bewirkt, steht als kurze Zeile unter dem Wert, etwa „Setzt Art und botanischen Namen“ oder „Wird als bestätigt vermerkt“.
- Ein Tipp auf Feldname oder Wert setzt oder entfernt den Haken.
- Beim Öffnen ist kein Kästchen angehakt.
- Unten: „Ausgewählte übernehmen (n)“ (grau bei 0), „Alle übernehmen (n)“, „Fertig — Rest verwerfen“.
- Übernommen wird in fester Reihenfolge, die Art zuerst.
- Lehnt Chris bei der Gießklasse die Rückfrage ab, bleibt nur diese Zeile offen, die übrigen werden übernommen.
- Danach verschwinden die übernommenen Zeilen, darunter steht „n Angaben übernommen.“, die Karte wird neu gezeichnet. Ist nichts mehr offen, schließt das Fenster wie bisher.
- × verwirft eine Zeile wie bisher.
- Die Kästchen im Fenster tragen die App-Farbe.

**Sortenschutz**
- Sind Gattung und Art (die ersten zwei Wörter) im alten und im neuen botanischen Namen gleich und hat der alte Name mehr Wörter, gilt das nicht als Abweichung. Dann erscheint keine Zeile „Botanisch“.
- Dieselbe Regel gilt für „andere Art“: gleiche Gattung und Art heißt gleiche Art, dann keine Art-Zeile.

**Lücken-Auswahl**
- „Nur mit Lücken“ nimmt nur Pflanzen mit einer echten Lücke. Ein fehlendes Foto ist keine Lücke.
- Frostgrenze und Wuchsform zählen nicht als Lücke, wenn die Bibliothek sie liefert.
- Kopfzeile und Kästchen zeigen dieselbe Zahl.
- Ableger erben alle erbbaren Eigenschaften der Mutter (Ergänzung Chris): Art, botanischer Name, Sorte, Sortenmerkmale, Familie, Gießklasse, Giftigkeit, Wuchsform, Licht, Frostgrenze, Düngebedarf, Bibliotheksbezug, Gießart, Wichtig, Wasserspeicher, KI-Vermehrungswege, Pflegeschritte, Winterruhe, dazu die Herkunftsstempel dieser Felder.
- Nicht erbbar, weil sie zum Exemplar gehören: Name, Topf, Topfart, Substrat, Abzugsloch, Kulturform, Zustand, Notiz, Fotos, Verlauf, Aufgaben. Raum, Stellplatz und ein eigener Gießrhythmus werden wie bisher mitgegeben.
- Die Liste steht an einer Stelle (`ABLEGER_ERBE`), Anlegen und Nachtrag benutzen sie beide.
- Bestehende Ableger: Beim Laden bekommen leere erbbare Felder einmalig den Wert der Mutter, nur wenn die Mutter noch in der Sammlung ist. Felder mit Inhalt bleiben unberührt. Ableger von Ablegern erben in der Reihenfolge der Abstammung.

**Pflichtpaket** nach Regel 6.2: FASSUNG 3.22.0, sw.js greenkeeperai-v117, PATCHNOTES-Eintrag, CHANGELOG, Versionsnummer in pruef.js.

## Annahmen — ohne Einwand gelten sie mit der Freigabe

- **B1** Die Annahme A3 aus E2 („kein Sammelknopf“) ist aufgehoben (Chris, 16.09.2026).
- **B2** Das × je Zeile bleibt.
- **B3** „Alle übernehmen“ nimmt auch Art- und Giftzeilen mit, ohne eigene Rückfrage. Eine Entwarnung gibt es weiterhin nie.
- **B4** Der einmalige Nachtrag bei bestehenden Ablegern schreibt ohne Knopf. Er stammt von der Mutter, nicht von der KI, Regel 10.8 greift nicht.
- **B5** Pflanzen ohne Foto bleiben über „Alle“ oder einzeln wählbar.

## Nicht angefasst

Der Kartei-Auftrag und der Anlegen-Auftrag (E4). Pflegetexte (E3). Der Doktor. Die Ergebnisliste samt ihren Kästchen (Android-Blau bleibt Backlog, außer Chris sagt „mit rein“). Die Laufansicht, `kiFragen`, Parallelität, Bremse, Anhalten und Fortsetzen, die Leiste, die Statuszeile unter Mehr. `aenderungSetzen`, `giftEigenSetzen`, `fest`/`strittig`, `merkmale`, die Bibliothek. Das Vermehren außer den vererbten Feldern.

## Risiken

- Aussehen, Kästchen-Größe und Tippflächen sind nur am Handy prüfbar.
- B3: Ein versehentliches „Alle übernehmen“ ändert auch die Art. Zurück geht es nur von Hand in der Karte.
- B4: Der Nachtrag schreibt still in bestehende Ableger. Hat Chris dort ein Feld bewusst leer gelassen, steht danach der Wert der Mutter drin.
- Spätere Änderungen an der Mutter wandern nicht zum Ableger nach, etwa eine später bestätigte Giftigkeit.
- Der Sortenschutz hält auch einen falschen Zusatz im botanischen Namen fest, etwa einen Tippfehler hinter der Art.
- Die Rückfrage zur Gießklasse mitten im Sammelübernehmen ist ein Systemdialog. Nur am Handy prüfbar.
- 9 Stellen in pruef.js tippen „Übernehmen“ oder × direkt an und werden umgebaut. Keine Prüfung, die sichert, dass nie entwarnt wird, darf dabei verloren gehen.
- Der Test „Die Lücken-Menge nimmt auch die ohne Foto“ wird umgedreht.

## Prüfung

pruef.js prüft, mit selbst angelegten Pflanzen und selbst eingetragenen Ergebnissen:

- Das Fenster hat je Zeile ein Kästchen und keinen Übernehmen-Knopf in der Zeile. Beim Öffnen ist keines angehakt.
- „Ausgewählte übernehmen“ ist bei 0 gesperrt und nennt die Zahl.
- Zwei von vier Zeilen angehakt → genau diese zwei Felder ändern sich, mit Stempel `ki`, zwei Zeilen bleiben offen. Gegenprobe.
- „Alle übernehmen“ schreibt alle Felder, Art zuerst. Gegenprobe.
- Gießklasse weg von S mit abgelehnter Rückfrage im Sammelübernehmen: nur diese Zeile bleibt, die anderen sind übernommen.
- Öffnen, Haken setzen, Schließen ohne Knopf ändert nichts an der Pflanze (Regel 10.8).
- Gift: „giftig“ bei ungeprüfter Art → Zeile, Übernahme verschärft. Eine Entwarnung erscheint nie als Zeile.
- × und „Fertig — Rest verwerfen“ wie bisher.
- Karte „Philodendron hederaceum Brasil“, Antwort „Philodendron hederaceum“ → keine Zeile Botanisch, keine Zeile Art. Gegenprobe.
- Antwort „Philodendron erubescens“ bei derselben Karte → Zeile Botanisch erscheint.
- Eine Pflanze ohne Foto und ohne Lücke ist nicht in der Lücken-Menge. Gegenprobe.
- Eine Bibliothekspflanze mit leerer Frostgrenze zählt nicht als Lücke.
- Kopfzeile und Kästchen nennen dieselbe Zahl.
- Neuer Ableger hat jedes Feld aus `ABLEGER_ERBE` der Mutter, keines der nicht erbbaren. Gegenprobe.
- Bestehender Ableger mit leerem `wichtig` und leerer Frostgrenze hat nach `laden()` die Werte der Mutter, ein Ableger mit eigenem `wichtig` behält seinen, ein Ableger ohne Mutter bleibt leer, ein Enkel erbt über den Ableger. Ein zweites `laden()` füllt ein danach geleertes Feld nicht wieder. Gegenprobe.

Nicht durch Tests abgedeckt — nur am Handy prüfbar: Aussehen der Zeilen, Umbruch langer Werte, Tippfläche der Kästchen, Farbe der Kästchen, Rückfrage-Dialog beim Sammelübernehmen, alles in Chrome auf Android.

## Größe

Mittel.

---

# Zuschnitt, nicht freigegeben — Etappe E4 · Sorte durch die KI

Vorgezogen vor E3 (Wunsch von Chris am 16.09.2026: „Gemini war sehr zuverlässig bei der Bestimmung“). Wird nach E2b als eigener Plan ausgeschrieben. Zielversion dann 3.23.0.

- **Belegt** (CHANGELOG): Von 1.7 bis 3.17 durfte die KI beim Anlegen eine sicher erkannte Sorte in einfachen Anführungszeichen an BOTANISCH hängen. 3.18.0 hat das verboten und MERKMALE eingeführt. Das ist das „vorher“, das besser klappte.
- **Belegt** (Code): Der Kartei-Auftrag verbietet den Sortennamen in BOTANISCH und MERKMALE (Prüfliste Punkt 4).
- Alte Sorten aus dem botanischen Namen holen (Backlog) geht hier auf, etwa „Philodendron hederaceum Brasil (Dreifarbiger Kletterphilodendron)“.

- **Belegt** (Code): Bisher nennt die KI absichtlich keinen Sortennamen, der Prüfauftrag verbietet ihn. Die Sorte tippt der Mensch. Chris hebt das am 16.09.2026 auf.
- Anlegen und Kartei fragen SORTE mit eigener Sicherheit. Die Merkmale bleiben als Begründung.
- Anlegen: Das Sortenfeld wird vorbelegt und als KI-Vorschlag gekennzeichnet. Gespeichert wird erst mit „Anlegen“.
- Kartei: Die Sorte erscheint im Fenster als Zeile mit Knopf. Eine selbst eingetragene Sorte gilt als Widerspruch.
- Risiko: Viele Sorten sind am Foto nicht sicher zu unterscheiden. Eine niedrige Sicherheit wird angezeigt, nie verschwiegen.

Größe: mittel.

---

# Zuschnitt, nicht freigegeben — Etappe E3 · Pflegetexte durch die KI

Wird nach E4 als eigener Plan ausgeschrieben. Zielversion dann 3.24.0.

- **Belegt** (Code): „Pflegeschritte“ (`pflege`, Liste) und „Winterruhe“ (`winterruhe`, ja/nein) gibt es nur an Pflanzen aus dem alten, von Hand geschriebenen Bestand, etwa Viktor. Das Anlegen schreibt beide nie.
- **Belegt** (Code): Der Winterruhe-Text steht fest im Code und beschreibt die Venusfliegenfalle (3–4 Monate, 0–10 °C). Jede Pflanze mit `winterruhe` bekäme wortgleich denselben Text.
- Die Kartei fragt zusätzlich PFLEGESCHRITTE (mehrere Zeilen) und RUHEPHASE (ein Absatz oder „keine“). Nur art- oder sortenspezifisch. Allgemeines wie „bei Trockenheit gießen“ ist im Auftrag ausdrücklich verboten.
- Fehlen die Texte, zeigt das Fenster sie als neu. Sind sie da, zeigt es alt und neu nebeneinander. Übernahme je Block per Knopf, Stempel `ki`.
- Die Ruhephase bekommt ein eigenes Textfeld. Der feste Venusfliegenfallen-Text bleibt nur für Pflanzen ohne eigenes Textfeld.
- Offen: ob einzelne Pflegeschritte statt des ganzen Blocks übernehmbar sein sollen.
- Nicht in E3: Herkunft, Lebensumstände, „Wenn etwas nicht stimmt“, Beobachtungen (Backlog).

Größe: mittel.

---

# Ausblick — noch nicht freigegeben

## Sammel-Anlegen (neu, war E)

Mehrere Fotos wählen, je Pflanze eine eigene Anfrage, Durchwinkliste, Standort einmal für alle. Benutzt die Warteschlange aus E1. Größe: groß.

## F — KI im Rundgang

Noch Idee, kein Plan. Wird besprochen, wenn E steht.

## T — App-Rundgang neu (zuletzt)

Kompletter Neubau von `TOUR_KAPITEL` (index.html ab 27806, 16 Kapitel). Größe: **groß**, Aufteilung in vier Etappen: **T1** Runde und Einrichtung, **T2** Sammlung, Karte, Heute, Gießmodus, Rundgang, **T3** Werkzeuge, Doktor, Substrat, Grundriss, Zeichenfläche, Vermehren, **T4** Mehr, Sicherung, Urlaub und ein neues Kapitel KI-Dienst.

Am 14.09.2026 am Ist-Stand belegte Abweichungen, damit sie nicht noch einmal gesucht werden müssen:

- `einricht`, Schritt „Die KI fragen" beschreibt Kopieren-und-Einfügen. Ist: Drei-Fotos-Forderung, Modellwahl, Bilderfeld `#ki-direkt-anlegen`, Knopf „Fragen" (`#btn-gemini`); der Kopierweg liegt zugeklappt unter `#neu-alt`.
- `einricht` kennt Stufe 4 nur halb: Kulturform `#f-kultur`, Topfart, Durchmesser-Schieber `#f-topf`, Substrat und Abzugsloch (`#al-topf`) kommen nicht vor, der Schritt zeigt nur auf `#al-pflege`.
- `einricht` kennt den Doktor-Anstoß nach dem Anlegen nicht (`.km-anstoss`, index.html 14338).
- Kein Kapitel nennt den Schlüssel unter Mehr › KI-Dienst (`[data-mh="kidienst"]`), ohne den der direkte Weg nicht läuft.
- `runde`, Schritt 5 nennt sechs Werkzeuge. Ist: sieben — Doktor, Umtopfen, Gießplan, Substrat, Vermehren, Stammbaum, Grundriss.
- `runde`, Schritt 6 nennt den KI-Dienst nicht.
- `werkzeuge` heißt „Die drei Werkzeuge" und beschreibt drei.
- `sammlung`, Schritt „Drei Ansichten" trägt eine überholte Umzugsnotiz.
- `mehr` hat vier Schritte; Bibliothek, KI-Dienst, Aufgaben, Wetter und Tiere fehlen.
- Neu ab 3.19.0: kein Kapitel nennt „Pflanzenkartei auffrischen".
- Nach E kommen weitere Abweichungen dazu — die Liste ist vor T neu zu prüfen, nicht ungeprüft zu übernehmen.

Geprüft und richtig: die vier Reiter der Karte, die sechs Werkzeuge der Zeichenfläche, die fünf Stufen im Anlegen. Bestehende Prüfungen, die am Wortlaut hängen: „Sie hat sieben Schritte" (runde), der Regex auf „Mehr › App Tour" im Schlussschritt, „Das Mehr-Kapitel zeigt nicht mehr auf ansicht", „Alle Kapitel stehen zur Wahl" (zählt `Object.keys(TOUR_KAPITEL).length`).
