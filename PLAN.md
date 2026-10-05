# PLAN — GreenkeeperAI

Stand 05.10.2026 · Fassung 3.31.0 (geliefert, im Repo liegt noch 3.30.0) · Planmodus

**Pausiert (Chris, 05.10.):** Die Aufräum-Sitzungen 3 bis 10 und der Umbau „Doktor als Zentrale“ ruhen. Zuerst kommt der Durchgang (nächster Abschnitt). Erst danach wird entschieden, was gebaut wird.
- Die Sitzungen 4 bis 10 werden durch den Durchgang voraussichtlich ersetzt. Sie bleiben als Infoquelle für bekannte Fehler und Ideen stehen (Chris, 05.10.).

- Sitzung 1 ist freigegeben (26.09.2026) und als 3.30.0 geliefert.
- Sitzung 2 ist freigegeben (27.09.2026) und als 3.31.0 geliefert. Ab Sitzung 3 sind die Sitzungen geplant, aber noch nicht freigegeben. Jede braucht vor dem Bauen eine eigene Freigabe.
- Die Reihenfolge wurde am 26. und 27.09.2026 mit Chris festgelegt. Chris: „es werden sich evtl. noch mehr sammeln“. Neue Punkte kommen hier hinein, nie nur in den Chat.

---

# Durchgang: die ganze App von vorne nach hinten
Chris am 05.10.2026: „Ich bin in so einer Zwickmühle, wo ich nicht weiß, wo ich anfangen und was ich ändern soll, aber ich weiß, dass es mir nicht gefällt.“ Ziel: die kleinen Details und Hindernisse finden, die die Nutzung schleppend machen. Dann wird alles so aufgeräumt und gestaltet, dass es passt.

Organisiert wird in Todoist: Projekt „🛠️ Praxis-Projekte“, Bereich „🌱 GreenkeeperAI“ (angelegt am 05.10.).

## Grundsatz
- Geprüft wird nach Wegen, nicht nach Code. Die Frage ist nie „Funktioniert das?“, sondern „Was will ich gerade erledigen, und was hält mich dabei auf?“
- Erst sammeln, dann entscheiden, dann bauen. Im Durchgang wird nichts gebaut.
- Jeder Fund bekommt genau ein Urteil: **behalten**, **vereinfachen**, **zusammenlegen** oder **streichen**.

## Phase 0 · Wofür ist die App da? (zusammen, ein Gespräch)
- **Leitbild (Chris, 05.10.):** „Kern ist es, allumfassend eine App für die Haltung von Pflanzen zu haben und jeden Aspekt ihrer Haltung abzudecken: Substrat, Wasser und Dünger, Pflege, Licht, Standort und die Freude am Sammeln, sowie das Anreichern von Informationen und einer Geschichte seiner Pflanzenstammbäume über die Zeit.“
- Kernaufgaben, an denen alles gemessen wird (Entwurf Claude, von Chris „im Großen und Ganzen“ bestätigt, ergänzt um das Leitbild):
  1. Gießen und Düngen: Was ist heute dran, und schnell abhaken.
  2. Eine neue Pflanze erfassen.
  3. Ein Problem an einer Pflanze klären (Symptome, Schädlinge, Pflege).
  4. Licht und Standort: Wo steht sie, passt das?
  5. Substrat: Was braucht sie, und umtopfen.
  6. Die Sammlung aktuell halten und Freude daran haben (Fotos, Zustand).
  7. Geschichte und Stammbaum: Vermehren, Anzucht, Ableger, Verlauf über die Zeit.
  8. Nachschlagen und Informationen anreichern.
- Phase 0 ist damit erledigt. Was Chris wirklich nutzt, klärt Phase 1.

## Phase 1 · Bestandsliste (Claude, aus dem Code)
- Jeder Bildschirm, jedes Fenster, jede Einstellung und jeder Knopf mit eigener Funktion, je Reiter: Heute, Sammlung, Pflanzenkarte, Anlegen, Werkzeuge, Mehr, Gießmodus und Rundgang.
- Je Eintrag: wozu, wie viele Tipps bis dorthin, zu welcher Kernaufgabe er gehört (oder zu keiner).
- Chris markiert je Eintrag: **nutze ich**, **nie**, **wusste ich nicht**.
- Ergebnis: eine Liste. Einträge ohne Kernaufgabe und mit „nie“ sind die ersten Kandidaten zum Streichen.

## Phase 2 · Wege ablaufen (Chris am Handy, je Weg 5 bis 10 Minuten)
- Jede Kernaufgabe einmal echt durchspielen, in dieser Reihenfolge: erster Start, Heute, Gießmodus, Sammlung, Pflanzenkarte, Anlegen, Doktor, Vermehren und Anzucht, Mehr.
- Dabei festhalten, mit Bildschirmaufnahme oder Screenshots und einem Satz je Stelle:
  - Wo musste ich suchen?
  - Wo war es zu viel Text?
  - Wo musste ich warten?
  - Wo war ein Tipp zu viel?
  - Wo wusste ich nicht, was passiert?
- Claude zählt dazu die Tipps je Weg aus dem Code und vergleicht.
- Jeder Weg ist eine Aufgabe in Todoist. Die Funde kommen als Kommentar oder Unteraufgabe dazu.

## Phase 3 · Befunde bewerten (zusammen)
- Alle Funde in eine Liste, je Fund ein Urteil: behalten, vereinfachen, zusammenlegen oder streichen.
- Was wegfällt, wird hier entschieden, nicht später beim Bauen.

## Phase 4 · Zielbild (Claude, Vorschau.html)
- Neue Reiter- und Menüstruktur, Wege mit weniger Tipps.
- Ideen, die schon auf dem Tisch liegen und geprüft werden:
  - **BOTaniker** als zentrale Anlaufstelle (Abschnitt „Neuausrichtung“ unten).
  - **Fotosession statt Rundgang** (Chris, 05.10.): Er schaut seine Pflanzen meist ohne Handy an. Wenn das Handy dabei ist, dann für eine Fotorunde: einmal herumgehen und Fotos machen, ohne Fragen je Pflanze. Die App ordnet die Fotos zu, Raum für Raum.
  - Einstellungen statt Mehr; Gießcenter-Seiten zusammenlegen.
- Chris segnet die Vorschau ab, bevor gebaut wird.

## Phase 5 · Umsetzung
- Aus dem Zielbild entstehen die Bau-Sitzungen, nach Regel 3.3 geplant und einzeln freigegeben.
- Die pausierten Sitzungen 3 bis 10 werden dann neu einsortiert, angepasst oder gestrichen.

## Zeit und Takt
- Chris hat etwa eine Stunde pro Woche (05.10.).
- Die Termine stehen in Todoist im Bereich „🌱 GreenkeeperAI“ (Vorschlag vom 05.10., eingetragen erst nach Chris' „ok“). Eine Stunde pro Woche, sonntags, weil Präsenzwochenenden auf Freitag und Samstag fallen.

---

# Neuausrichtung: Doktor als Zentrale
Chris am 05.10.2026: „Ich habe momentan das Gefühl, dass die App einfach zu viel ist. Viel zu viel.“ Idee: Vieles in einen interaktiven Multifunktionsdoktor packen. Ablauf: Was möchtest du machen? → Welche Pflanze? → Was mit der Pflanze (Symptome klären, Substrat, …)? Der Rundgang ist laut Chris „echt massiv shit“.

Stand: Idee, pausiert bis nach dem Durchgang. Wird in Phase 4 geprüft.
- Name (Chris, 05.10.): weder „Doktor“ noch „Helfer“. Vorschlag Chris: **BOTaniker**.
- Rundgang (Chris, 05.10.): unsicher. Er möchte eine Funktion, mit der er die Sammlung auf dem Laufenden hält, hat aber wenig Zeit dafür. Eher eine Fotosession als ein Rundgang mit Fragen.

## Bestand heute (belegt, Code 3.31.0)
- 4 Reiter: Heute, Sammlung, Werkzeuge, Mehr.
- Werkzeuge: Doktor (4 Schritte: Pflanze, Weg, Merkmale, Einschätzung), Gießplan (ohne Kachel), Substrat, Vermehren und Anzucht, Umtopfen, Stammbaum, Grundriss.
- Mehr: 25 Abschnitte. Das sind Aufgaben, Wunschliste, Sicherung, Bibliothek (Arten, Rezepte, Wissen), Gießcenter (Wasser, Dünger, Rhythmus), Urlaub, Wetter, Tiere, Rundgang, Ansicht, Einstellungen, KI-Dienst, Kartei, Tour, Rückmeldung, Installieren, Art melden, Patchnotes und Scrollprotokoll.
- Pflanzenkarte mit 4 Reitern: Pflege, Standort, Verlauf, Wissen.
- Dazu kommen Gießmodus und Rundgang als eigene Vollbild-Abläufe.

## Einschätzung (Claude)
- Die Richtung stimmt: ein Einstieg, der von der Pflanze und der Frage ausgeht, statt sieben Werkzeugen mit je eigenem Ablauf.
- Aber: Den Doktor zur Zentrale zu machen, spart allein noch nichts. Ein Hub mit acht Knöpfen ist das heutige Werkzeuge-Raster mit einem Tipp mehr. Kleiner wird die App nur, wenn dabei Dinge **wegfallen** oder **zusammenfallen**.
- Der Name „Doktor“ passt zu Symptomen, nicht zu Substrat, Vermehren oder Umtopfen. Vorschlag: der Reiter heißt neutral, etwa „Helfer“ oder „Fragen“, und der Doktor ist darin eine Aktion. Entscheidung bei Chris.

## Vorschlag Aufbau
- **3 Reiter statt 4:**
  - **Heute:** Was ist dran? Gießen, Nachfragen, Aufgaben und Wunschliste.
  - **Sammlung:** Pflanzen und Anzucht, mit Umschalter. Der Grundriss wird eine Ansicht der Sammlung („nach Raum“) statt eines Werkzeugs.
  - **Helfer (Doktor):** Erste Frage „Was möchtest du tun?“, zweite „Welche Pflanze?“. Ist eine Pflanze schon gewählt, etwa aus der Karte über „Helfer fragen“, entfällt die zweite Frage.
- **Aktionen im Helfer**, jeweils mit gewählter Pflanze:
  - Symptome klären (der heutige Doktor)
  - Passendes Substrat
  - Umtopfen
  - Vermehren und Ableger
  - Steckbrief auffrischen (die Kartei für eine Pflanze)
  - Standort und Licht prüfen
  - Frei fragen (neu: eine KI-Frage mit dem Kontext der Pflanze, kostet Kontingent, nur per Knopf)
  - Ohne Pflanze: Nachschlagen (die heutige Bibliothek) und Art bestimmen per Foto
- **Mehr wird „Einstellungen“** (Zahnrad oben statt Reiter). Darin:
  - Gießen und Düngen: Wasser, Dünger und Rhythmus auf einer Seite
  - Wetter und Ort
  - Tiere
  - Ansicht
  - KI-Dienst
  - Sicherung
  - Urlaubszettel
  - „Über die App“: Tour, Patchnotes, Rückmeldung, Art melden, Installieren
- **Pflanzenkarte:** Der Stammbaum wandert in den Reiter Verlauf, der Knopf „Helfer fragen“ kommt dazu.
- **Rundgang fällt weg**, samt Einstellungen und `S.rundgang`. Erhalten bleiben nur die zwei Ideen, die Chris gut fand:
  - Foto und „Alles gut / Neues Blatt / Stimmt was nicht“ im Gießmodus
  - Sammel-Umzug („Steht jetzt woanders“) aus der Sammlung
  Das Entfernen löscht Daten, deshalb trägt die Fassung `sicherung:true` und das Pflichtfenster greift.

## Folgen für die Aufräum-Reihenfolge
- **Sitzung 3** („Nachfrage fällig“) und **Sitzung 6** (Gießmodus, Wintermodus) bleiben gültig, beide gehören zu Heute.
- **Sitzung 4** (Kartei) bleibt gültig. Die Kartei wird später zusätzlich eine Helfer-Aktion für eine einzelne Pflanze.
- **Sitzung 5** (Einstellungen neu gestalten): erst nach der Neuordnung. Sonst gestaltet sie Seiten, die danach umziehen oder wegfallen.
- **Sitzungen 7 und 8** (Rundgang): entfallen, wenn der Rundgang wegfällt. Übrig bleiben Blick-Knöpfe im Gießmodus (zu Sitzung 6), Sammel-Umzug (eigene kleine Sitzung) und, falls gewünscht, der Monatsüberblick.
- **Sitzung 10** (Tour): ganz zuletzt, sie muss die neue Struktur erklären.

## Vorschlag Aufteilung (Größe gesamt: groß)
1. Vorschau.html: Helfer-Einstieg (Was? → Pflanze → Aktion), neue Reiterleiste, Einstellungen-Liste. Nur zum Absegnen, kein Code (Regel 9.6).
2. Helfer-Reiter: Die vorhandenen Werkzeuge wandern unverändert hinein, Werkzeuge-Reiter weg.
3. Mehr → Einstellungen, Gießcenter-Seiten zusammenlegen, „Über die App“.
4. Rundgang entfernen (mit Sicherungsfenster), Blick-Knöpfe im Gießmodus.
5. Neue Aktionen: Frei fragen, Steckbrief für eine Pflanze, Standort prüfen.
6. Danach: Einstellungen neu gestalten (bisher Sitzung 5) und Tour.

## Offen, Chris
- A. Name des Reiters: „Doktor“ bleibt, oder neutral („Helfer“, „Fragen“)?
- B. Rundgang ganz raus, nur Blick-Knöpfe im Gießmodus und Sammel-Umzug bleiben?
- C. Reihenfolge: Neuausrichtung (Schritt 1, Vorschau) vor den Sitzungen 3 und 4, oder erst 3 und 4 fertig machen?
- D. Für die Vorschau brauche ich Screenshots vom heutigen Doktor (Schritt 1 und 2) und vom Werkzeuge-Reiter (Regel 9.4).

---

# Aufräumen · Überblick

Chris am 22.09.2026: Nach der Anzucht wird die App grundlegend aufgeräumt, bevor etwas Neues kommt. Seit dem 27.09. gehören dazu auch Gießmodus, Wintermodus, Rundgang und die Einstellungen.

| Sitzung | Thema | Größe | Stand |
|---|---|---|---|
| 1 | Fehler und Daten | mittel | geliefert als 3.30.0 |
| 2 | Ballast mit Sicherungsfenster | mittel | geliefert als 3.31.0 |
| 3 | Heute: „Nachfrage fällig“ | klein bis mittel | Screenshot nötig |
| 4 | Kartei: Teilergebnisse und „schon aufgefrischt“ | klein bis mittel | geplant |
| 5 | Einstellungen neu gestalten | mittel bis groß | Screenshots und Vorschau nötig |
| 6 | Gießmodus und Wintermodus | mittel bis groß | Richtung entschieden |
| 7 | Rundgang, Teil 1 | mittel | Richtung entschieden |
| 8 | Rundgang, Teil 2 | mittel | Richtung entschieden |
| 9 | Scrollfehler | offen | erst Messwerte, Regel 5.6 |
| 10 | App Tour neu | groß | ganz zuletzt |

Warum diese Reihenfolge:
- Die Einstellungen (5) kommen vor Gießmodus und Rundgang. Beide bringen neue Einstellungen mit, und die sollen gleich im neuen Aussehen gebaut werden, nicht zweimal.
- Scrollfehler und Tour kommen zuletzt. Der Scrollfix kann die Sammlung umbauen, und die Tour erklärt dann den Endstand.

---

# Sitzung 1 · Fehler und Daten
Geliefert als 3.30.0 (sw.js greenkeeperai-v126). Einzelheiten im CHANGELOG. Am Handy noch unbestätigt.

---

# Sitzung 2 · Ballast → Zielversion 3.31.0, sw.js greenkeeperai-v127

Freigegeben am 27.09.2026 samt Nachtrag „Sicherungsfenster“. Zielversion 3.31.0. Zahlen am 27.09. im Code von 3.30.0 nachgezählt.

## Ziel
Alles, was die App mitschleppt, aber nichts mehr tut, ist entfernt, und neue Löschreste entstehen nicht mehr. Für Chris ändert sich sichtbar nur: Der Eintrag „Abgelegt“ unter Mehr verschwindet, und die Patchnotes zeigen nur noch die letzten zehn Fassungen.

## Änderungen

### Schicht „mitgelieferte Pflanzen“ (belegt: `PFLANZEN` ist leer, index.html Zeile 4794)
- Weg: Papierkorb (`papierkorbRender`), der Eintrag „Abgelegt“ unter Mehr, „aus der Sammlung nehmen“, „Zurückholen“.
- Weg: `S.weg` (8 Stellen) und die Überlagerung `S.edits` (10 Stellen) samt `aenderungen()`, `pflanzeMitAenderung()` und dem `S.edits`-Teil von `giftMigrieren()`.
- Die drei Topf-Abfragen mit Rückgriff auf `S.edits` (um Zeile 14061, 14151, 15430) lesen nur noch `p.topf`.
- `PFLANZEN` selbst (8 Stellen) wird durch die eigene Sammlung ersetzt, wo es noch gelesen wird.
- Beim Laden werden `edits` und `weg` aus dem Zustand gelöscht, auch aus alten Sicherungen. In Chris' Daten sind beide leer, es geht nichts verloren.

### Löschreste
- Beim Löschen einer Pflanze verschwinden künftig auch ihre Ereignisse, ihr Umtopfplan und „gesehen“.
- Vorhandene Reste werden einmal beim Laden entfernt: E-131 bis E-134 und E-152 (Ereignisse, „gesehen“, bei E-131 der Umtopfplan).
- Das läuft in `datenVereinheitlichen()` mit und bleibt idempotent: Ein zweiter Lauf ändert nichts.
- Entfernt wird nur, was zu keiner vorhandenen Pflanze gehört, auch zu keinem Ableger, keiner Mutter und keinem Anzuchtgefäß.

### Alte Gießintervall-Kopien
- `intervall` ohne `intervallEigen` wird entfernt (40 Pflanzen). Die App ignoriert den Wert heute schon.
- Ebenfalls in `datenVereinheitlichen()`, idempotent.
- Das Feld `ansichtsart` aus alten Sicherungen wird entfernt.

### Toter Code
- Funktionen ohne Aufrufer. Heute gezählt: 20 (die Übergabe nannte 22, zwei sind mit 3.30.0 wieder in Gebrauch oder weggefallen):
  bearbeitenHTML, brettSpanne, brettStunden, fensterAuf, fensterZu, giessAbstaende, giftPruefungFaellig, heuteStatusHTML, kantenArt, kantenAzimut, lichtName, massnahmenZuAufgaben, merkmaleVon, pflanzenAuswahlHTML, raumKnoepfeHTML, schaedlingErkennen, sonnenstunden, umtopfVorgemerkt, wannSetzen, werkzeugZeichnen.
  - Ausnahme `merkmaleVon`: Der Name berührt „`merkmale` (Bibliothek)“ aus „Nicht anfassen“. Siehe Entscheidung 2.
  - Vier davon prüft nur noch pruef.js (brettSpanne, brettStunden, heuteStatusHTML, umtopfVorgemerkt). Siehe Entscheidung 1.
- CSS-Klassen ohne Verwendung. Die grobe Zählung heute ergibt 81 (Übergabe: 75). Vor dem Entfernen wird jede einzeln geprüft. Klassen, die im Code zusammengesetzt werden (etwa `'lk-' + x`), bleiben stehen.
- CSS-IDs ohne Element: `#z-info`, `#ver-pflanze-weg`, `#verm-pflanze`.
- Der tote Aufruf beim Dichte-Umschalter wird beim Bauen genau benannt. Belegt ist bisher nur, dass `dichteZeichnen()` existiert; welcher Aufruf tot ist, prüfe ich vor dem Entfernen.

### Grundwerte
- Alle Felder, die die App in `S` benutzt, aber nicht in `LEERSTAND()` stehen, kommen dort hinein (Übergabe: 21 Felder). `grundwerteErgaenzen()` füllt sie dann bei jedem Laden.
- Die Liste der Felder steht nach dem Bauen im CHANGELOG.

### Patchnotes
- In der App bleiben die letzten zehn Fassungen (heute 108 Einträge). Das CHANGELOG enthält alle, bis 1.0.
- Unter den zehn steht „Ältere Fassungen stehen im CHANGELOG“ mit Link auf die Datei im Repo: github.com/cmohr0212/GreenkeeperAi/blob/HEAD/CHANGELOG.md (öffnet in neuem Tab).

### Pflichtpaket
Nach Regel 6.2.

## Nicht angefasst
- Scrollprotokoll (bis Sitzung 9)
- App Tour (Sitzung 10). Kapitel, die „Abgelegt“ oder „aus der Sammlung nehmen“ erwähnen, bekommen nur den Satz gestrichen, sonst nichts.
- Alle Punkte unter „Nicht anfassen“ der Übergabe, besonders `datenVereinheitlichen()` (bleibt idempotent), `merkmale`, `giessListe()`
- `S.deleted` (andere Aufgabe: gelöschte Aufgaben, bleibt)
- Aussehen der App, Texte außer den gestrichenen Einträgen

## Risiken
- **Datenbereinigung an echten Pflanzen:** Löschreste und Intervall-Kopien werden gelöscht. Prüfung wie in Sitzung 1 an einer Kopie deiner Sicherung vom 26.09., Feld für Feld vorher und nachher. Vor dem ersten Start mit 3.31.0 lädst du eine frische Sicherung herunter.
- **Löschreste falsch erkannt:** Ereignisse eines Ablegers oder Gefäßes könnten als verwaist gelten. Deshalb zählt jede bekannte Kennung als vorhanden, und der Test an der Sicherung muss genau die fünf Nummern oben treffen.
- **Tote Funktionen:** Ein Aufruf über einen zusammengesetzten Namen oder `window[...]` wäre für die Suche unsichtbar. Vor dem Entfernen wird jeder Name auch als Text gesucht.
- **CSS:** Eine Klasse, die nur im Code zusammengesetzt wird, sähe unbenutzt aus. Solche Klassen bleiben stehen. Fehlt trotzdem eine, sieht man es nur am Handy.
- **Alte Sicherung mit gefülltem `S.edits`:** Die Änderungen gehörten zu mitgelieferten Pflanzen, die es nicht mehr gibt. Sie gehen verloren, hätten aber schon heute nichts angezeigt.

## Prüfung
pruef.js mit Gegenproben nach Regel 5.2:
- Löschen einer Pflanze entfernt Ereignisse, Umtopfplan und „gesehen“ mit.
- Bereinigung: verwaiste Reste weg, Reste einer vorhandenen Pflanze und eines Ablegers bleiben.
- `intervall` ohne `intervallEigen` weg, mit `intervallEigen` bleibt.
- `edits`, `weg` und `ansichtsart` verschwinden beim Laden einer alten Sicherung.
- Jedes Feld aus `LEERSTAND()` ist nach `laden()` mit leerem Zustand gesetzt.
- Die Patchnotes zeigen genau zehn Einträge, der neueste ist 3.31.0.
- „Abgelegt“ steht nicht mehr unter Mehr.
- Keine der entfernten Funktionen existiert noch.
- Bereinigung an deiner Sicherung: nur die fünf Löschreste, die 40 Intervall-Kopien und `ansichtsart` geändert, sonst nichts; zweiter Lauf ändert nichts.
- Voller Lauf von pruef.js grün.

Nicht durch Tests abgedeckt — nur am Handy prüfbar: ob nach dem CSS-Aufräumen irgendwo etwas anders aussieht.

## Größe
mittel

## Entscheidungen (Chris, 27.09.)
1. Tote Funktionen mit Test (brettSpanne, brettStunden, heuteStatusHTML, umtopfVorgemerkt): Funktion und Tests werden entfernt.
2. `merkmaleVon` bleibt stehen.
3. Patchnotes: die letzten zehn Fassungen, dazu ein Link auf CHANGELOG.md im Repo.

## Nachtrag: Sicherungsfenster vor der Bereinigung (mit rein, 27.09.)
Chris, 27.09.: „Bevor wir bereinigen muss ein Fenster beim User aufpoppen, wenn der Versionsupload kommt, mit einem Button, der eine Sicherung runterlädt. Dieses Fenster kann nicht übersprungen werden und wird geschlossen, sobald die Sicherung geladen ist.“

Vorschlag:
- Beim ersten Start einer neuen Fassung erscheint ein Fenster „Neue Fassung 3.31.0 — erst sichern“ mit einem einzigen Knopf „Sicherung herunterladen“.
- Kein Schließen-Kreuz. Tipp daneben, Zurück-Taste und Wischen schließen es nicht.
- Es benutzt dieselbe Sicherung wie unter Mehr → Sicherung (Daten und Fotos).
- Es erscheint nur, wenn Daten da sind. Wer die App frisch öffnet, sieht es nicht.
- **Die neue Bereinigung wartet auf die Sicherung.** Löschreste, Intervall-Kopien, `edits`, `weg` und `ansichtsart` werden erst entfernt, nachdem die Sicherung heruntergeladen ist. So enthält die Sicherung garantiert den Stand vor der Bereinigung. Die Bereinigung aus 3.30.0 läuft unverändert weiter, sie ist schon erledigt.
- Wird eine alte Sicherung eingelesen, erscheint das Fenster erneut, bevor bereinigt wird.

Grenze (belegt, Browser): Die App kann nicht sehen, ob die Datei wirklich im Download-Ordner angekommen ist. Sie weiß nur, dass der Download gestartet wurde. Das Fenster schließt sich deshalb, sobald der Download gestartet ist.

Entschieden (Chris, 27.09.):
- A. Das Fenster erscheint nur bei Fassungen, die Daten bereinigen und dabei zu Datenverlust führen können. Solche Fassungen tragen im Patchnotes-Eintrag eine Kennung. 3.31.0 ist die erste.
- B. Scheitert der Download, bietet das Fenster „Noch einmal versuchen“ an. Scheitert auch der zweite Versuch, erscheint zusätzlich „Ohne Sicherung weiter“, zusammen mit der Fehlermeldung.

Prüfung (pruef.js, mit Gegenproben):
- Das Fenster erscheint bei Daten und neuer Fassung, nicht bei leerem Zustand.
- Tipp daneben und Zurück schließen es nicht.
- Vor dem Knopf ist nichts bereinigt, danach schon.
- Erster Fehlschlag: nur „Noch einmal versuchen“. Zweiter Fehlschlag: zusätzlich „Ohne Sicherung weiter“.
- Eine Fassung ohne Kennung zeigt kein Fenster.
- Ein zweiter Start derselben Fassung zeigt kein Fenster mehr.

Nicht durch Tests abgedeckt — nur am Handy prüfbar: ob der Download am Android-Gerät startet und ob die Zurück-Taste das Fenster wirklich nicht schließt.

Größe mit Nachtrag: weiter mittel.

---

# Sitzung 3 · Heute: „Nachfrage fällig“
Chris am 26.09.2026. Gemeint ist der Kasten „Nachfrage fällig“ mit „Ja, wieder normal“ und „Noch zwei Wochen“. In Chris' Daten sind heute 12 Nachfragen fällig.
- Ist die Liste zu lang oder passt sie nicht ins Design, wird sie ausklappbar oder ein Knopf mit eigenem Fenster.
- Jede Zeile bekommt das Profilfoto der Pflanze, damit man sie erkennt.
- Vor dem Plan: Screenshot vom Ist-Zustand auf Heute (Regel 9.4). Eine Vorschau.html auf Wunsch.

# Sitzung 4 · Kartei: Teilergebnisse und „schon aufgefrischt“
Chris am 27.09.2026. Bricht ein Lauf ab oder ist das Tageskontingent erschöpft, lässt sich das bereits Geprüfte nicht durchsehen. Wer neu startet, prüft wieder alle 50 Pflanzen und verbraucht das Kontingent erneut.
- Belegt im Code: In einem angehaltenen Lauf sind die fertigen Zeilen nur Text (Modus „lauf“), ohne „Durchsehen“. Ein Datum der letzten Auffrischung wird an der Pflanze nicht gespeichert.
- Angehaltener Lauf: Die fertigen Pflanzen sind antippbar und lassen sich durchsehen und übernehmen wie nach einem vollständigen Lauf.
- Jede Pflanze merkt sich, wann sie zuletzt aufgefrischt wurde (Feld, nicht sichtbar).
- In der Auswahl steht bei jeder Pflanze „aufgefrischt vor 1 Tag“.
- Pflanzen, die in den letzten 30 Tagen aufgefrischt wurden, sind nicht vorausgewählt. Eine Zeile oben sagt: „6 schon aufgefrischt, nicht ausgewählt“. Die Zahl 30 ist ein Vorschlag.
- **Nichts wird gesperrt** (Chris, 27.09.). Jede Pflanze bleibt jederzeit anhakbar, auch eine, die vor einer Stunde aufgefrischt wurde. Der Vermerk ändert nur die Vorauswahl.
- **Neuer Auftrag zählt als „nicht aufgefrischt“** (Vorschlag): Zusammen mit dem Datum merkt sich die Pflanze eine Kennung des Kartei-Auftrags. Hat eine neue Fassung den Auftrag geändert, ist die Pflanze wieder vorausgewählt, auch nach weniger als 24 Stunden. Die Zeile oben sagt dann: „Der Auftrag ist neu — alle sind wieder ausgewählt“.
- Entscheidung Chris (27.09.): gehört ins Aufräumen.

# Sitzung 5 · Einstellungen neu gestalten
Chris am 27.09.2026: „die sehen scheußlich aus und passen nicht zum Design, teilweise richtig Windows-XP-mäßig“.
- Alle Einstellungsseiten unter Mehr bekommen ein einheitliches Aussehen: Schalter statt nackter Kästchen, Auswahl als Knopfreihe statt grauer Auswahlliste, gleiche Abstände, Überschriften und Erklärzeilen.
- Chris am 27.09.2026 mit Screenshots: „Was ich so doof finde, ist das Weiß und die viele Schrift, die durch den Kontrast erschlägt.“
- **Belegt (Screenshots vom 27.09. und Code):** Es gibt keinen Grundstil für Eingabefelder, Auswahllisten, Häkchen und Knöpfe. Die Regel in index.html um Zeile 396 setzt nur die Mindesthöhe. Was nicht in einem eigens gestalteten Bereich steht, zeichnet der Browser selbst. Betroffen sind:
  - KI-Dienst: „Ersetzen“, „Löschen“, „Neu holen“ als graue Kastenknöpfe; die Modellwahl als weiße Auswahlliste.
  - Dünger: „Kannengröße“, „ml je Liter“ und „Düngetag ab“ als weiße Kästen; das Häkchen „Volle Dosis“ und „Wochentag“ in Browseroptik.
  - Einstellungen: blaue Browser-Häkchen bei „Wetter und Standortklima“ und „Kennzahlen“.
  - Sicherung: „−“ und „+“ als graue Kastenknöpfe.
  - Wetter: das Ortsfeld weiß, „Suchen“ grau, „Ort entfernen“ als weißer Kasten.
  - Dazu kommen drei Knopfarten nebeneinander: Versalien in Pillen („SICHERUNG HERUNTERLADEN“), gerundete Kästen („Knapp / Normal / Ausführlich“) und die grauen Browserknöpfe.
- **Belegt (Screenshots):** Lange Erklärtexte in voller Schriftgröße, zum Beispiel beim Modell (7 Zeilen), bei der Sicherung (8 Zeilen) und beim Dünger (7 Zeilen).
- **Vorbild aus der App selbst:** „Wissenswertes“ (ruhige Liste, Überschrift und eine kurze Zeile) sowie die Felder im Rundgang (grün getönt, gerundet). So soll es überall aussehen.
- Richtung:
  - Ein Grundstil für alle Felder, Listen, Häkchen und Knöpfe. Kein Weiß, sondern die grün getönte Fläche wie im Rundgang.
  - Häkchen werden Schalter.
  - Drei Knopfarten und nicht mehr: Hauptknopf, Nebenknopf, Gefahrknopf.
  - „−“ und „+“ bekommen dieselbe Form wie die übrigen Knöpfe.
  - Erklärtexte: höchstens eine kurze Zeile, kleiner und in der gedämpften Schriftfarbe. Der Rest wandert hinter den i-Knopf oder ein „Mehr dazu“ zum Aufklappen.
- Danach kommt eine Vorschau.html mit zwei, drei Seiten im neuen Aussehen zum Absegnen (Regel 9.6), zum Beispiel KI-Dienst, Dünger und Sicherung.
- Die Bausteine (Schalter, Knopfreihe, Zeile mit Erklärung) werden einmal gebaut und danach überall benutzt, auch in den Sitzungen 6 bis 8.
- Nur Aussehen und Anordnung. Was eine Einstellung bewirkt, ändert sich nicht.

# Sitzung 6 · Gießmodus und Wintermodus
Chris am 27.09.2026, Richtung entschieden.

Belegt im Code:
- Der Gießmodus beginnt sofort mit der ersten Pflanze, eine Übersicht gibt es nicht.
- Die Reihenfolge richtet sich nach Dringlichkeit, nicht nach dem Standort.
- „War staubtrocken“ verkürzt bei Wüstenkaktus und Blattsukkulente den Abstand (`runter: 0.95`), obwohl staubtrocken dort das Ziel ist.

Entschieden:
- **Übersicht vor der ersten Pflanze** (Chris: „machen wir so“):
  - Kopf: „Heute: 9 Pflanzen, 2 Gläser“.
  - Nach Raum und Stellplatz gruppiert, mit Miniaturfotos.
  - Eine Zeile „Was du brauchst“: Wasserart, Anstau, Tauchen, Dünger. Der Düngetag steht dort mit und ist kein eigener Schritt mehr.
  - Optional: einen Raum abwählen, und „3 wären morgen dran — mitnehmen?“.
- **Reihenfolge nach Standort** (Chris: „super“): Raum für Raum, Stellplatz für Stellplatz, oben „Wohnzimmer 2 von 4“. `giessListe()` bleibt unverändert, sortiert wird im Gießmodus.
- **Knöpfe passend zur Gießgruppe** (Chris: „top“). Die Rückmeldung passt zu dem, was man an der Pflanze sieht:
  - Kakteen und Blattsukkulenten: „Schrumpelig oder weich“ (zu lange gewartet) und „Noch feucht“. Kein „staubtrocken“ mehr.
  - Karnivoren im Anstau und Sumpfpflanzen (Chris: „sind auch immer feucht“): Die Knöpfe sprechen vom Untersetzer, zum Beispiel „Untersetzer war leer“ (zu lange) und „Untersetzer noch voll“ (zu früh). Das Moorbeet lernt bisher gar nicht (`lernt:false`). Ob es lernen soll, wird im Plan geklärt.
  - Kannenpflanze: sinngemäß „Oberfläche war trocken“ und „noch klamm“.
  - Die übrigen Gruppen werden im Plan einzeln durchgesehen. Wortlaut und Lernrichtung prüft Chris am Handy.
- **Kein Rhythmus von Hand** (Chris, 27.09.): Die genaueren Knöpfe lösen das.

Wintermodus (Chris: „parallel dazu anschauen“, unklar, wie man ihn z. B. beim Fettkraut einschaltet):
- Belegt im Code: Es gibt drei getrennte Dinge.
  - Die allgemeine Winterpause im Gießcenter (`S.giess.winterpause`).
  - Den Zustand „Winterruhe“, den man in der Karte im Feld „Zustand“ wählt.
  - Das Merkmal „Kältephase“ (`p.winterruhe`), das nur anzeigt, dass eine Pflanze eine Ruhe braucht.
- Keines davon ist ein sichtbarer Schalter, und die App schlägt es auch nicht vor.
- Vorschlag:
  - Im Herbst fragt die App bei Pflanzen, die eine Ruhe brauchen, von selbst: „Fettkraut: Winterrosette beginnt — umstellen?“. Die Frage kommt auf Heute und in der Gießmodus-Übersicht, mit einem Knopf zum Umstellen.
  - Im Frühjahr fragt sie genauso zurück.
  - In der Karte gibt es einen gut sichtbaren Knopf „Winterruhe an/aus“, statt des versteckten Eintrags im Zustandsfeld.
- Dazu gehört der offene Punkt „Fettkraut Winterrosette“. Mexikanische Fettkräuter ruhen trocken als Rosette, nicht kalt. Das braucht einen eigenen Wintersatz.
- Zu klären im Plan: Welche Gruppen fragt die App? Und wie hängen allgemeine Winterpause und Winterruhe je Pflanze zusammen?

Größe: mittel bis groß. Passt es nicht in eine Sitzung, kommt der Wintermodus in eine eigene.

# Sitzung 7 · Rundgang, Teil 1
Chris am 27.09.2026. Belegt aus der Sicherung vom 26.09.: eingestellt ist „Bestandsaufnahme“ ohne Obergrenze alle 7 Tage, also rund 50 Pflanzen mit Foto je Woche.

Entschieden bzw. Richtung:
- **Blick im Gießmodus:** Bei jeder Pflanze im Gießmodus gibt es einen kleinen Knopf „Foto“ und „Alles gut / Neues Blatt / Stimmt was nicht“. Ist das letzte Foto alt, steht das dabei.
- **Bereich statt fester Kleinstzahl** (Chris: „höchstens 5 finde ich doof“):
  - Man wählt einen Bereich, zum Beispiel „Regal“, und geht genau diese Pflanzen durch.
  - Vor dem Start steht: „Regal: 15 Pflanzen · etwa 6 Minuten“.
  - Mein Vorschlag zur Obergrenze: Beim gewählten Bereich keine. Der Bereich begrenzt sich selbst, und man sieht vorher Anzahl und Zeit.
  - Man kann jederzeit aufhören, der Stand bleibt, und später geht es an der Stelle weiter.
  - Beim Vorschlag ohne Bereich („Was ist dran?“) gilt eine Obergrenze von 10, einstellbar (Chris, 27.09.).
- **Umstellen pflegen** (Chris: „diese Woche 10 Pflanzen umgestellt, aber nicht vermerkt“):
  - Im Rundgang gibt es je Pflanze „Steht jetzt woanders“, mit schneller Wahl von Raum und Stellplatz, ohne den Grundriss zu öffnen.
  - Dazu kommt ein Sammel-Umzug: Zielplatz wählen und die Pflanzen anhaken, die dort jetzt stehen. Das geht auch ohne Rundgang, etwa aus der Sammlung.
  - Die genaue Lage im Grundriss bleibt danach offen und wird als „Platz im Grundriss noch setzen“ vermerkt.
  - Zu klären im Plan: Was passiert mit dem alten Punkt im Grundriss (entfernen oder behalten, bis er neu gesetzt ist)?
- **Einfachere Einstellungen** (Chris: „macht Sinn“): statt Stufe, Rhythmus, Obergrenze und Fotorhythmus nur noch „Wie viel Zeit hast du? 2 / 5 / 10 Minuten“ oder „Bereich wählen“.

# Sitzung 8 · Rundgang, Teil 2
- **Monatsüberblick wie bei Spotify** (Chris: „wie ein Zusatzfenster bei Spotify mit dein Überblick diesen Monat und dann einzelne Highlights“):
  - Ein eigenes Fenster „Dein September“: so oft gegossen, neue Blätter und Triebe, neue Ableger, eingetopfte Stecklinge.
  - Dazu Highlights mit Vorher-und-Nachher-Fotos, etwa „Monti: 3 neue Blätter“ oder „Die erste Blüte am Fettkraut“.
  - Erscheint am Monatsanfang auf Heute und ist danach unter Mehr abrufbar.
- **Vorher und Nachher:** Nach einem neuen Foto steht das alte daneben, mit Datum.
- **KI-Kurzcheck** (Chris: „super, nimmt den Weg in den Doktor ab“): Ein Foto im Rundgang oder Gießmodus lässt sich auf Knopfdruck kurz prüfen, nur auf Schädlinge und Zustand. Findet er etwas, geht es mit einem Tipp in den Doktor. Das kostet Kontingent, deshalb nie automatisch. Regel 10.8: Übernommen wird nur per Knopf.

# Sitzung 9 · Scrollfehler
Er wurde mehrfach ohne Erfolg angegangen, deshalb gilt Regel 5.6: kein Fix auf Verdacht. Das Protokoll vom 26.09. liegt vor (Sammlung, Raster), die Auswertung steht in der Übergabe.
- Chris' Vermutung (26.09.): Die Sammlung lädt ein riesiges Raster statt mehrerer einzelner Gruppen. Passt dazu: Die Sprünge kamen fast alle bei Gruppierung „keine“.
- Erst eine Messung, dann ein Plan. Falls die Sammlung dafür künftig in Gruppen geladen wird, ändert sich ihre Oberfläche. Deshalb steht die Tour dahinter.

# Sitzung 10 · App Tour neu
- Alle 16 Kapitel werden gegen die aktuelle App neu geschrieben.
- Der Prüfstand erkennt künftig versteckte Ziele. Heute zeigen zwei Schritte der „Kurzen Runde“ auf den versteckten Leerstart, sobald Pflanzen da sind.
- Umfang und Kapitelliste werden vor Beginn gemeinsam festgelegt, eventuell mit Vorschau.html.

---

# Nach dem Aufräumen

## Anzucht in der Sammlung
Chris am 27.09.2026. Ein zusätzlicher Bereich in der Sammlung:
- Mit einem Klick wird zwischen „Sammlung“ und „Anzucht“ umgeschaltet.
- Auf einen Blick stehen dort die Anzuchtgefäße mit Bild und den zugehörigen Daten. Mehr nicht.

Vorschläge, noch zu besprechen:
- Der Umschalter sitzt oben in der Sammlung als zwei Knöpfe „Pflanzen | Anzucht“. Die Zahl am Reiter zählt weiter nur Pflanzen.
- Eine Kachel je Gefäß: Foto des Gefäßes, Name, Medium, Zahl der Stecklinge, Arten darin, Tage seit Start, nächster Wasserwechsel.
- Ein Balken „Bewurzelung“: Tage seit Start im Verhältnis zur erwarteten Dauer des Wegs.
- Ein Tipp auf die Kachel öffnet das Gefäß im Werkzeug Anzucht. Bearbeitet wird nur dort, damit es nicht zwei Wege gibt.
- Oben steht, was als Nächstes fällig ist (Wasserwechsel, Befeuchten).
- Gibt es keine Anzucht, kommt ein kurzer Hinweis mit Knopf „Zur Anzucht“.
- Offen: Gelten Suche und Filter der Sammlung auch für die Anzucht?

## Danach
Sammel-Anlegen, F, T, Claude-Anbindung, Browser-Dialoge durch App-Fenster ersetzen und die übrigen Punkte aus uebergabe.md.
