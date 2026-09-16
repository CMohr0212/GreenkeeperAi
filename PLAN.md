# PLAN — GreenkeeperAI

Stand 16.09.2026 · Ausgangsfassung 3.19.1 · **Zielversion 3.20.0, sw.js greenkeeperai-v115**

Erledigt und nicht mehr hier: Etappe A bis D, E1 „Der Lauf" (3.19.0) und der Lösch-Fix (3.19.1). Der Verlauf steht im CHANGELOG.

Offen sind: der Plan unten, danach **E2**, dann Sammel-Anlegen, **F** und **T**.

---

# Freigegeben — Kartei auffrischen: Auswahl, Laufansicht, Fortsetzen

Freigabe von Chris am 16.09.2026 · Zielversion 3.20.0, sw.js greenkeeperai-v115.

Gewünscht von Chris am 16.09.2026, mit Screenshot vom Ist-Stand. Nimmt die Backlog-Punkte „Alle anhaken" und „Abschnitt während des Laufs" vom 15.09. auf.

## Ziel

Die Seite „Kartei auffrischen" zeigt die Auswahl sofort als Gitter mit zwei Kästchen, während eines Laufs nur den Fortschritt, und ein angehaltener Lauf lässt sich lückenlos fortsetzen.

## Befund

- **Belegt** (Screenshot 16.09.): Die Leiste zeigt „Prüfe 1 von 4" mit leerem Balken, der Abschnitt zeigt gleichzeitig die Startauswahl für 51 Pflanzen.
- **Belegt** (Code): „Abbrechen" leert die Warteschlange (`k.offen = []`) und setzt nicht `pausiert`. Nach einem Abbruch gibt es deshalb nie „Fortsetzen".
- **Belegt** (Code): Eine Pflanze wird beim Start ihrer Anfrage aus `k.offen` genommen. Wird die App währenddessen geschlossen oder die Anfrage abgebrochen, steht sie weder in `offen` noch in `fertig`. Der Lauf erreicht dann nie „x von x".
- **Vermutet, nicht am Gerät geprüft:** Das ist einer der Gründe, warum bei Chris kein Lauf durchkommt. Ob es der einzige ist, ist offen.
- **Belegt** (Code): `karteiBilder` (Foto verkleinern) läuft vor der Frist von `kiFragen` und hat kein eigenes Zeitlimit. Ob es hängen kann, ist nicht geprüft.

## Änderungen

**Startansicht**
- Das Suchfeld und das Bildgitter stehen sofort da. Der Knopf „Einzelne auswählen" entfällt, ebenso „Alle anhaken" und „Auswahl leeren".
- Statt der Knöpfe „Alle" und „Nur mit Lücken" gibt es zwei Kästchen zum Anhaken: „Alle (n)" und „Nur mit Lücken (n)". Die Zahl zählt dieselbe Menge, die das Kästchen anhakt.
- „Alle" anhaken hakt jede Pflanze an. Abhaken leert die Auswahl.
- „Nur mit Lücken" anhaken setzt die Auswahl auf genau die Pflanzen mit Lücken oder ohne Foto (Menge wie heute). Abhaken nimmt diese Pflanzen aus der Auswahl.
- Ein Tipp auf eine Kachel hakt sie an oder ab. Die Kästchen ziehen nach: „Alle" ist angehakt, wenn alle gewählt sind; „Nur mit Lücken" ist angehakt, wenn die Auswahl genau der Lücken-Menge entspricht.
- Die Suche filtert nur die Anzeige. Die Kästchen wirken immer auf alle Pflanzen.
- Beim ersten Öffnen nach dem App-Start sind alle Pflanzen angehakt. Danach bleibt die Auswahl bis zum nächsten App-Start stehen.
- „Auffrischen starten (n)" zählt die angehakten Pflanzen.

**Laufansicht** (solange ein Lauf läuft oder angehalten ist und noch Pflanzen offen sind)
- Auswahl, Suche, Gitter und Startknopf sind weg.
- Sichtbar: Fortschrittsbalken, darunter „Prüfe x von y · n %" beziehungsweise „Angehalten bei x von y · n %".
- Läuft der Lauf: Knopf „Anhalten". Ist er angehalten: Knopf „Fortsetzen" und Knopf „Lauf verwerfen".
- Darunter die bis dahin fertigen Pflanzen als Zeilen, ohne Kästchen.
- Nach dem Ende erscheint die Ergebnisansicht wie heute.

**Anhalten und Fortsetzen**
- Der Lauf merkt sich beim Start die vollständige Liste (`alle`).
- „Anhalten" bricht laufende Anfragen ab, lässt die Warteschlange stehen und setzt den Lauf auf angehalten.
- „Fortsetzen" und die Wiederaufnahme nach einem Neustart bauen die Warteschlange neu: alle Pflanzen aus `alle`, die noch nicht in `fertig` stehen.
- „Lauf verwerfen" und das × in der Leiste löschen den Lauf samt bisherigen Ergebnissen, danach steht wieder die Startansicht da.
- Ein Lauf aus 3.19.x ohne `alle` wird nicht nachgebaut. Er lässt sich nur verwerfen.

**Leiste unten**
- Der Text bekommt die Prozentzahl: „Prüfe 12 von 51 · 23 %", „Angehalten bei 12 von 51 · 23 %". Die Prozentzahl zählt fertige Pflanzen.
- Der Knopf heißt „Anhalten" statt „Abbrechen".

**Pflichtpaket** nach Regel 6.2: FASSUNG 3.20.0, sw.js greenkeeperai-v115, PATCHNOTES-Eintrag, CHANGELOG, Versionsnummer in pruef.js.

## Nicht angefasst

`kiFragen`, Aufträge und Prompts, Parallelität und Bremse bei 429, Wiederholungen, `karteiBilder`, die Benachrichtigung am Laufende, die Ergebnisansicht nach dem Ende samt „Ausgewählte noch einmal prüfen", das Bildgitter des Doktors (`pwahlZeichnen` wird nur aufgerufen, nicht geändert), E2, alles aus „Nicht anfassen" der Übergabe. Benachrichtigungen fürs Gießen und der Schalter unter Einstellungen gehören nicht in diesen Plan (Backlog).

## Risiken

- Der Plan behebt eine belegte Lücke beim Fortsetzen. Ob danach ein Lauf bei Chris durchkommt, ist nicht gesichert — die Ursache am Gerät ist weiter nur vermutet.
- Der laufende Lauf auf Chris' Gerät stammt aus 3.19.x und hat kein `alle`. Vor dem Hochladen verwerfen.
- Das Gitter lädt jetzt beim Öffnen gleich alle Vorschaubilder. Die Seite kann spürbar langsamer aufgehen.
- „Anhalten" wirft Antworten weg, die gerade unterwegs sind. Diese Anfragen zählen trotzdem gegen das Google-Kontingent.
- Die Laufansicht wird nach jeder Antwort neu gezeichnet. Ob die Seite dabei springt, zeigt nur das Handy.
- Die Leiste wird durch die Prozentzahl breiter. Ob der Text neben dem Knopf noch in eine Zeile passt, zeigt nur das Handy.

## Prüfung

pruef.js prüft, mit selbst angelegten Pflanzen (mit und ohne Foto, mit und ohne Lücken) und gestubbtem `fetch`:

- Startansicht: Gitter sichtbar ohne weiteren Tipp; kein Knopf „Einzelne auswählen", kein „Alle anhaken", kein „Auswahl leeren"; zwei Kästchen mit Zahl.
- „Alle" an → alle gewählt, Startknopf zählt alle; „Alle" ab → nichts gewählt.
- „Nur mit Lücken" an → genau die Lücken-Menge gewählt; ab → diese Pflanzen raus.
- Kachel antippen → Kästchen ziehen richtig nach.
- Suche aktiv, „Alle" an → trotzdem alle gewählt.
- Start → Auswahl und Startknopf weg, Balken und „· n %" im Abschnitt und in der Leiste.
- „Anhalten" mit laufenden Anfragen → angehalten, „Fortsetzen" in Leiste und Abschnitt; „Fortsetzen" → jede Pflanze landet in `fertig`, der Lauf endet mit „y von y". Gegenprobe: ohne Nachbau der Warteschlange schlägt die Prüfung fehl.
- Neustart (`laden()`) mit Anfragen, die beim Schließen liefen → sie werden nachgeholt. Gegenprobe wie oben.
- „Lauf verwerfen" → Startansicht zurück, `S.kartei` weg.
- Nach dem Ende → Ergebnisansicht wie bisher.

Nicht durch Tests abgedeckt — nur am Handy prüfbar: Aussehen der Kästchen und des Gitters, Scrollen im Gitter, Springen der Laufansicht, Breite der Leiste mit Prozentzahl, Ladezeit der Seite, alles in Chrome auf Android.

## Größe

Mittel.

---

# Freigegeben im Zuschnitt, noch nicht im Detail — Etappe E2 · Prüfen und übernehmen

Wird zu Beginn der nächsten Sitzung als eigener Plan ausgeschrieben.

## Ziel

Das Ergebnis eines Laufs wird Zeile für Zeile durchgesehen und einzeln übernommen.

## Zuschnitt, von Chris am 15.09.2026 gesetzt

- Kein blindes Sammelübernehmen. Jede Angabe wird vor der Übernahme angezeigt: Pflanze, Feld, alt → neu.
- Auswählen und einzeln übernehmen. Was nicht übernommen wird, fällt weg — ein „Später" gibt es nicht.
- Angaben, bei denen Chris unsicher ist, lassen sich anhaken und per Knopf noch einmal durchlaufen lassen. Der Weg dafür steht seit E1.
- Die Rangfolge aus Etappe C entscheidet, was als Widerspruch gilt: ein Feld mit Stempel `hand` ist immer einer.

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
