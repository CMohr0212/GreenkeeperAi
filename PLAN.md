# PLAN — GreenkeeperAI

Stand 16.09.2026 · Ausgangsfassung 3.22.0 · **Zielversion 3.23.0, sw.js greenkeeperai-v118**

Erledigt und nicht mehr hier: Etappe A bis D, E1 „Der Lauf“ (3.19.0), Lösch-Fix (3.19.1), Kartei-Seite (3.20.0), E2 Steckbrief-Abgleich (3.21.0), E2b Kästchen und Lücken-Auswahl (3.22.0). Der Verlauf steht im CHANGELOG.

Offen sind: **E4 + K** Sorte, Balken und Ergebnisliste (unten, freigegeben), **E3** Pflegetexte, danach Sammel-Anlegen, **F** und **T**.

## Zweck der Kartei, von Chris am 16.09.2026 gesetzt

- Die Kartei hält die Pflanzenkarten auf dem neuesten Stand: Steckbriefdaten, die Sorte und art- oder sortenspezifische Pflegetexte.
- Nichts, was jede Pflanze braucht. Keine Töpfe, kein Zustand, kein Befund, keine Maßnahmen — das bleibt beim Doktor.
- Geprüft werden feste Daten wie Frost und Felder, die das Anlegen leer gelassen hat.
- Pflegetexte wie bei der Venusfliegenfalle („Pflegeschritte“, „Winterruhe“): die KI schreibt sie, wo keine da sind, und gleicht sie ab, wo welche da sind.
- Die Sorte ermittelt die KI, am besten schon beim Anlegen.
- Der Doktor verliert den Abgleich der Steckbriefdaten, den übernimmt die Kartei.

## Aufteilung (Regel 3.4, Regel 4.1)

- Vorgeschlagen war: E4 in 3.23.0, K in 3.24.0.
- Chris am 16.09.2026: „Nimm K mit rein“ (Regel 4.3). E4 und K kommen gemeinsam in 3.23.0. Größe damit groß.
- E3 folgt in 3.24.0.

---

# Freigegeben — Etappe E4 + K · Sorte durch die KI, Balken, Ergebnisliste

Freigabe von Chris am 16.09.2026 · Zielversion 3.23.0, sw.js greenkeeperai-v118. E4 ist Chris' Wunsch vom 16.09.2026 („Gemini war sehr zuverlässig bei der Bestimmung“). K stammt aus dem Backlog vom 16.09.2026. Chris hat beides am 16.09.2026 zusammengelegt.

## Ziel

Die KI nennt beim Anlegen und in der Kartei die Sorte samt Sicherheit, in die Karte kommt sie erst durch Chris' Tipp, der Kartei-Balken bewegt sich während einer Anfrage, und die Ergebnisliste führt eindeutig zum Abgleich.

## Befund

- **Belegt** (CHANGELOG): Von 1.7 bis 3.17 durfte die KI beim Anlegen eine sicher erkannte Sorte an BOTANISCH hängen. 3.18.0 hat das verboten und MERKMALE eingeführt.
- **Belegt** (Code): Die Zeilen BOTANISCH und MERKMALE in `ANTWORT_FORMAT` verbieten Sortennamen. Die Prüflisten von Anlegen (Punkt 5) und Kartei (Punkt 4) fragen das ab.
- **Belegt** (Code): Der Doktor benutzt `ANTWORT_FORMAT` wortgleich. Anlegen und Kartei setzen ihre Aufträge aus `FMT_ZEILEN` und `FELD_ZUSATZ` zusammen. Eine neue Zeile nur für Anlegen und Kartei geht über `FELD_ZUSATZ`.
- **Belegt** (Code): Das Anlegen speichert `sorte` nur aus dem Feld `#f-sorte`. Die Merkmale stehen als Hinweis darunter (`#f-sorte-hint`).
- **Belegt** (Code): `karteiKontext` gibt „Sorte laut meiner Karte“ mit. `karteiAbweichungen` kennt keine Sorte-Zeile.
- **Belegt** (Code): Seit 3.22.0 gilt ein längerer alter botanischer Name mit gleicher Gattung und Art nicht als Abweichung.
- **Belegt** (Chris, 16.09.2026): Bei „Philodendron hederaceum Brasil“ steht „Brasil“ im Feld `botanisch`, aus einem früheren Anlegen.
- **Belegt** (Code): `karteiFortschritt` rechnet fertige durch gesamte Pflanzen. Bei einer Pflanze gibt es nur 0 und 100 %. Abschnitt und Leiste zeigen den Text mit „· 0 %“.
- **Belegt** (Code): Die Ergebnisliste zeigt vor jeder Zeile ein Kästchen ohne App-Farbe (`[data-karteierg]`). Es dient nur „Ausgewählte noch einmal prüfen“. Den Weg ins Fenster zeigt nur ein „›“ hinter dem Namen.
- **Belegt** (Screenshot 22:28): Chris hätte das Kästchen angetippt, um die Abweichungen zu sehen.

## Änderungen

**Auftrag**
- Neue Zeile `SORTE` nur im Anlegen- und im Kartei-Auftrag, direkt nach MERKMALE (ohne Foto nach BOTANISCH). Der Doktor-Auftrag bleibt wortgleich.
- Aufbau: `SORTE: Name | Sicherheit`, Sicherheit ist hoch, mittel oder niedrig. Ist keine Sorte erkennbar oder ist es die reine Art: `SORTE: keine`.
- Im Auftrag steht: nur eingeführte Handelsnamen, keine erfundenen, keine Anführungszeichen. Ohne Foto nennt die KI eine Sorte nur, wenn sie aus Name oder botanischem Namen folgt.
- In Anlegen und Kartei heißt der Prüflistenpunkt: „Steht ein Sortenname nur in SORTE und nicht in BOTANISCH oder MERKMALE?“
- Der Parser kennt den Schlüssel `sorte` (auch „Sortenname“, „Cultivar“). `sortenmerkmale` wird dabei nicht mehr getroffen als bisher.
- Eine Lesefunktion räumt Anführungszeichen, „cv.“ und Leerraum ab und liefert Name und Sicherheit oder nichts.

**Anlegen**
- Sicherheit hoch oder mittel und `#f-sorte` leer: Das Feld wird vorbelegt. Darunter steht „KI-Vorschlag · Sicherheit mittel — bitte prüfen“.
- Sicherheit niedrig: Das Feld bleibt leer. Darunter steht „Vielleicht: Name (unsicher)“ mit dem Knopf „Als Sorte eintragen“.
- Steht im Feld schon etwas: Es wird nie überschrieben. Weicht die Antwort ab, steht darunter „Die KI sieht: Name“.
- Der Merkmale-Hinweis bleibt darunter stehen.
- Gespeichert wird erst mit „Anlegen“. Herkunft `sorte`: `ki`, wenn der Wert beim Anlegen noch dem Vorschlag gleicht, sonst `hand`.

**Kartei**
- Nennt die Antwort mit hoch oder mittel eine andere Sorte als die Karte (ohne Anführungszeichen und Groß-/Kleinschreibung verglichen), erscheint die Zeile „Sorte“. Wirkungszeile: „Setzt die Sorte · Sicherheit mittel“.
- Sicherheit niedrig: keine Zeile, nur der Hinweis „Die Antwort vermutet die Sorte „Name“, ist sich aber unsicher.“
- Eine selbst eingetragene Sorte erscheint mit „von dir gesetzt“ oben, wie die anderen Felder.
- `SORTE: keine` bietet nie an, eine vorhandene Sorte zu löschen.
- Übernahme mit Stempel `ki`. Reihenfolge beim Sammelübernehmen: Art, Botanisch, Sorte, Rest.

**Alte Sorte im botanischen Namen**
- Hat `botanisch` mehr Wörter als Gattung und Art und ist `sorte` leer, gilt der Zusatz als Sorte. Ausnahme: Der Zusatz beginnt mit „var.“, „subsp.“, „ssp.“, „f.“ oder „×“.
- Die Kartei zeigt dann die Zeile „Sorte aus dem botanischen Namen“: alt „Philodendron hederaceum Brasil“, neu „Sorte Brasil · Botanisch Philodendron hederaceum“. Die Übernahme setzt beides.
- Nennt die Antwort eine andere Sorte als den Zusatz, erscheint stattdessen die normale Zeile „Sorte“ mit dem Hinweis „Im botanischen Namen steht „Brasil“.“ Der botanische Name bleibt dann unverändert.
- Keine stille Umschreibung beim Laden.

**Fortschrittsbalken (K)**
- Für jede laufende Anfrage merkt sich die App die Startzeit, nur im Speicher, nicht in der Sicherung.
- Der Balken zeigt die fertigen Pflanzen plus einen Vorlauf je laufender Anfrage, geteilt durch alle Pflanzen des Laufs.
- Vorlauf einer Anfrage: 30 % ihres Anteils nach 1 Sekunde, 60 % nach 4 Sekunden, 85 % nach 10 Sekunden. Dort bleibt er, bis die Antwort da ist. Bei einer Pflanze heißt das: 0 → 30 → 60 → 85 → 100 %.
- Ein Zeitgeber setzt nur die Breite des Balkens im Abschnitt und in der Leiste. Der Abschnitt wird dafür nicht neu gezeichnet. Läuft nichts, steht der Zeitgeber still.
- Der Text nennt keine Prozentzahl mehr: „Prüfe 1 von 3“, „Angehalten bei 1 von 3“. `aria-valuenow` folgt dem Balken.
- Nach einem Neustart der App beginnt der Vorlauf einer laufenden Anfrage wieder bei 0.

**Ergebnisliste (K)**
- Chris' Entscheidung vom 16.09.2026, Option 3: Die Kästchen erscheinen erst nach Tipp auf „Noch einmal prüfen“. Eine Vorschau entfällt (Chris, 16.09.2026).
- Grundzustand: keine Kästchen. Eine Zeile mit Abweichungen hat rechts den Knopf „Durchsehen ›“. Der Name öffnet das Fenster weiterhin. Zeilen ohne Abweichung und Fehlschläge haben keinen Knopf.
- Der Knopf unten heißt „Noch einmal prüfen“. Ein Tipp schaltet in die Auswahl: Vor jeder Zeile steht ein Kästchen in App-Farbe, keines ist angehakt, „Durchsehen ›“ verschwindet, ein Tipp auf den Namen setzt oder entfernt den Haken.
- In der Auswahl stehen unten „Ausgewählte prüfen (n)“ (grau bei 0) und „Abbrechen“. „Abbrechen“ verlässt die Auswahl ohne Änderung.
- Die Auswahl wird nicht gespeichert. Startet ein Lauf, endet sie.
- Der Hinweistext lautet „Tipp auf „Durchsehen“, um die Abweichungen anzusehen.“
- Die Laufansicht bleibt ohne Kästchen und ohne Knopf.

**Nachtrag beim Bau (Regel 3.6), Entscheidung von Chris am 16.09.2026: „Sorte auch erben“**
- Ableger erben den Herkunftsstempel der Sorte mit. Die Liste `ABLEGER_ERBE` bleibt unverändert.

**Pflichtpaket** nach Regel 6.2: FASSUNG 3.23.0, sw.js greenkeeperai-v118, PATCHNOTES-Eintrag, CHANGELOG, Versionsnummer in pruef.js.

## Annahmen — ohne Einwand gelten sie mit der Freigabe

- **C1** Aufbau `SORTE: Name | Sicherheit`.
- **C2** Das Anlegen belegt bei hoch und mittel vor, bei niedrig nicht.
- **C3** Die Kartei zeigt eine Zeile bei hoch und mittel, bei niedrig nur einen Hinweis.
- **C4** Eine vorhandene Sorte wird nie zum Löschen angeboten.
- **C5** Die Vorbelegung im Anlegen gilt als vereinbar mit Regel 10.8, weil vor „Anlegen“ nichts gespeichert wird. So arbeitet das Anlegen heute schon bei Art, Gießklasse und Wichtig.
- C1 bis C5 von Chris am 16.09.2026 bestätigt.
- **D1** Halte bei 30, 60 und 85 % des Anteils nach 1, 4 und 10 Sekunden.
- **D2** Die Prozentzahl entfällt im Text von Abschnitt und Leiste. Der Balken bleibt.
- **D3** In der Auswahl ist beim Einschalten nichts angehakt, auch keine Fehlschläge.

## Nicht angefasst

Der Doktor und `ANTWORT_FORMAT`. Pflegetexte (E3). Die Laufansicht außer dem Balken und dem Text. `kiFragen`, Parallelität, Bremse, Anhalten und Fortsetzen. Das Abgleich-Fenster außer der Sorte-Zeile. Die Auswahl vor dem Lauf (Bildgitter, „Alle“, „Nur mit Lücken“). `giftEigenSetzen`, `fest`/`strittig`, `merkmale`, die Bibliothek, `ABLEGER_ERBE`. Der Sortenschutz aus 3.22.0 bleibt, er wird nur ergänzt.

## Risiken

- Viele Sorten sind am Foto nicht sicher zu unterscheiden. Die KI kann mit „mittel“ danebenliegen, dann steht eine falsche Sorte vorbelegt im Anlegen.
- Die KI kann einen Handelsnamen erfinden. Der Auftrag verbietet es, prüfen kann die App es nicht.
- Eine zusätzliche Zeile im Auftrag erhöht leicht das Risiko, dass die Antwort vom Format abweicht.
- Die Zusatz-Erkennung kann bei ungewöhnlichen botanischen Namen irren, etwa mit Autorenkürzel oder Hybridschreibweise ohne „×“.
- Ableger erben die Sorte schon heute. Eine später übernommene Sorte an der Mutter wandert nicht zum Ableger nach.
- Der Kopierweg benutzt denselben Auftrag. Antworten aus einer alten Kopie ohne SORTE müssen weiter lesbar sein.
- 3 Prüfungen in pruef.js hängen am alten Wortlaut („Nenne keinen Sortennamen“, Prüflistenpunkt 5 im Anlegen) und werden angepasst. Die Prüfung auf den Doktor-Wortlaut (Punkt 8) bleibt unverändert.
- Hinweiszeilen und Knopf unter dem Sortenfeld sind nur am Handy prüfbar.
- Der Balken täuscht Fortschritt vor. Hängt eine Anfrage, steht er lange bei 85 %.
- Die Prozentzahl in der Leiste, eingeführt mit 3.20.0, entfällt.
- Ein Zeitgeber während des Laufs kostet etwas Akku. Er schreibt nur eine Breite.
- 7 Stellen in pruef.js suchen `[data-karteierg]` in der Ergebnisliste und werden auf die Auswahl umgebaut. Zwei davon prüfen, dass eine Zeile verschwunden ist. Sie dürfen nicht dadurch bestehen, dass es im Grundzustand gar keine Kästchen mehr gibt.
- Große Etappe: Mehr Stellen gleichzeitig offen, höheres Risiko eines Abbruchs mitten im Bau.

## Prüfung

pruef.js prüft, mit selbst angelegten Pflanzen und selbst eingetragenen Antworten:

- Anlegen- und Kartei-Auftrag enthalten `SORTE:`, der Doktor-Auftrag nicht und bleibt wortgleich.
- Der Parser liest `SORTE: Thai Constellation | hoch` als Name und Sicherheit, `SORTE: 'Albo' | mittel` ohne Anführungszeichen, `SORTE: keine` als nichts. `MERKMALE:` landet weiter nur in `sortenmerkmale`.
- Eine Antwort ohne SORTE-Zeile wird fehlerfrei gelesen.
- Anlegen mit „mittel“ und leerem Feld → Feld vorbelegt, Hinweis sichtbar. Gegenprobe.
- Anlegen mit „niedrig“ → Feld leer, Knopf „Als Sorte eintragen“ vorhanden, Tipp belegt das Feld.
- Anlegen mit eigenem Eintrag → Eintrag bleibt.
- Anlegen mit Vorschlag, gespeichert → `sorte` gesetzt, Herkunft `ki`. Vorschlag geändert, gespeichert → Herkunft `hand`.
- Kartei: Antwort „Albo | hoch“ bei leerer Sorte → Zeile Sorte. Gegenprobe.
- Kartei: gleiche Sorte in anderer Schreibweise → keine Zeile.
- Kartei: „niedrig“ → keine Zeile, Hinweis vorhanden.
- Kartei: „keine“ bei vorhandener Sorte → keine Zeile.
- Kartei: Öffnen und Schließen ohne Knopf ändert `sorte` nicht (Regel 10.8).
- Karte „Philodendron hederaceum Brasil“, leere Sorte, Antwort „keine“ → Zeile „Sorte aus dem botanischen Namen“, Übernahme setzt `sorte` „Brasil“ und `botanisch` „Philodendron hederaceum“. Gegenprobe.
- Karte „Monstera deliciosa var. borsigiana“ → keine solche Zeile.
- Sammelübernehmen mit Art- und Sorte-Zeile → Art zuerst, danach Sorte gesetzt.
- Balken: Lauf mit einer Pflanze, Anfrage hängt → Breite 0, nach 1 s 30 %, nach 4 s 60 %, nach 10 s 85 %, nach 20 s weiter 85 %, nach Antwort 100 %. Mit gestellter Uhr. Gegenprobe.
- Balken: Lauf mit drei Pflanzen, eine fertig, eine läuft seit 5 s → 33 + 20 = 53 %.
- Text in Abschnitt und Leiste enthält kein „%“, `aria-valuenow` gleicht der Balkenbreite.
- Nach Laufende läuft kein Zeitgeber mehr.
- Ergebnisliste Grundzustand: keine Kästchen, „Durchsehen ›“ nur an Zeilen mit Abweichungen. Gegenprobe.
- „Durchsehen ›“ öffnet das Fenster der richtigen Pflanze.
- „Noch einmal prüfen“ → Kästchen an jeder Zeile, keines angehakt, kein „Durchsehen ›“. Tipp auf den Namen hakt an und öffnet kein Fenster.
- „Ausgewählte prüfen“ bei 0 gesperrt. Mit einem Haken → Nachlauf nur für diese Pflanze, die übrigen Ergebnisse bleiben.
- „Abbrechen“ → Grundzustand, nichts geändert.
- Die umgebauten Verschwinden-Prüfungen schalten zuerst in die Auswahl und prüfen dort.

Nicht durch Tests abgedeckt — nur am Handy prüfbar: Hinweiszeilen und Knopf unter dem Sortenfeld, Umbruch der Zeile „Sorte aus dem botanischen Namen“ im Fenster, flüssige Bewegung des Balkens, Farbe und Tippfläche der Kästchen, Lage von „Durchsehen ›“, Treffsicherheit echter Gemini-Antworten, alles in Chrome auf Android.

## Größe

Groß. Aufteilung war vorgeschlagen, Chris hat K mit reingenommen.

---

# Zuschnitt, nicht freigegeben — Etappe E3 · Pflegetexte durch die KI

Wird nach E4 + K als eigener Plan ausgeschrieben. Zielversion dann 3.24.0.

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
