# PLAN — GreenkeeperAI

Stand 15.09.2026 · Ausgangsfassung 3.19.0 · **Zielversion 3.19.1, sw.js greenkeeperai-v114**

Erledigt und nicht mehr hier: Etappe A bis D (bis 3.18.0) und E1 „Der Lauf" (3.19.0 — der erste Lauf läuft am Gerät, Chris ist bisher zufrieden, Hintergrund und Benachrichtigung noch unbestätigt). Der Verlauf steht im CHANGELOG.

Offen sind: der Fix unten, danach **E2**, dann Sammel-Anlegen, **F** und **T**.

---

# Freigegeben — Löschen einer Pflanze

Freigabe von Chris am 15.09.2026. Die Ergebnisliste („Alle anhaken", Abschnitt während des Laufs) folgt danach und ist nicht Teil dieser Freigabe.

Gemeldet von Chris am 15.09.2026: „Löschen funktioniert nicht, ich kann einen meiner Ableger nicht mehr löschen."

## Ziel

„Pflanze löschen" und „Aus der Sammlung nehmen" wirken wieder, werden gespeichert, und das Kartenfenster schließt sich danach.

## Befund

- **Belegt** (Prüfstand, 15.09.2026): Der Knopf löst `bearb-weg` aus (index.html 9113). Dort steht noch `offen.delete(id)` (9131). Die Variable `offen` gibt es nicht mehr — der Knopf wirft `ReferenceError: offen is not defined`.
- **Belegt:** Der Fehler fliegt, nachdem die Pflanze im Speicher entfernt ist, aber vor `sichern()` und `render()`. Die Karte zeigt die Pflanze weiter, gespeichert wird nichts.
- **Belegt:** Das betrifft jede Pflanze, nicht nur Ableger — eigene wie mitgelieferte.
- **Belegt:** Auch ohne den Absturz bleibt das Kartenfenster offen und zeigt die gelöschte Pflanze weiter. `karteRumpfFuellen()` findet sie nicht mehr und lässt den alten Inhalt stehen.
- **Belegt:** Kein Test in pruef.js tippt den Löschknopf an. Deshalb blieb der Prüfstand grün.
- **Vermutet:** Kaputt seit 3.10.7. Dort wurde die Zuklapp-Mechanik entfernt, zu der `offen` gehörte. Erschlossen aus dem CHANGELOG, nicht aus der Git-Historie.
- **Vermutet:** Speichert danach etwas anderes — etwa der laufende Abgleich nach jeder Antwort —, landet die halbe Löschung doch im Speicher. Der Ableger kann nach einem Neustart der App schon weg sein. Aus dem Code gelesen, nicht am Gerät geprüft.

## Änderungen

- `offen.delete(id)` in `bearb-weg` entfernen.
- Nach dem Löschen: Zeigt das Kartenfenster genau diese Pflanze, schließt es sich über `modalZu('karte-modal')`.
- Pflichtpaket nach Regel 6.2: FASSUNG 3.19.1, sw.js greenkeeperai-v114, PATCHNOTES-Eintrag, CHANGELOG, Versionsnummer in pruef.js.

## Nicht angefasst

Was beim Löschen mit der Pflanze weggeht (Fotos, Gießverlauf, Aufgaben, Zustand, Orte, Änderungen), `papierkorbRender` und „zurückholen", der alte Behandler `pflanze-weg` (index.html 16617, kein Knopf ruft ihn mehr auf), `pfl-weg` im Grundriss, der gesamte Kartei-Lauf und `S.kartei`, Stammbaum und Verlauf der Mutterpflanze, alles aus „Nicht anfassen" der Übergabe.

## Risiken

- `modalZu` geht über `history.back()`. Das Schließen verbraucht einen Schritt im Zurück-Verlauf — gewollt, aber nur am Handy wirklich prüfbar.
- Ergebnisse im Kartei-Zwischenlager zu einer gelöschten Pflanze bleiben liegen. Die Ergebnisliste blendet sie schon aus, die Zeile „x von y beantwortet" zählt sie aber mit. Gehört zu E2.
- Der Verlauf der Mutterpflanze („vermehrt") zeigt weiter auf den gelöschten Ableger. Im Prüfstand wirft das keinen Fehler; wie der Stammbaum es anzeigt, ist nicht geprüft.
- Hochladen während eines laufenden Abgleichs ist ein bekanntes, ungelöstes Risiko. Erst hochladen, wenn die Leiste „Kartei aufgefrischt" zeigt.

## Prüfung

pruef.js prüft, mit selbst angelegter Mutter und selbst angelegtem Ableger:

- Karte öffnen → Bearbeiten → „Pflanze löschen" → der Ableger fehlt in `S.eigene` und bleibt nach `laden()` weg; Gießverlauf, Fotos, Aufgaben und Zustand sind entfernt.
- Beim Löschen fliegt kein Laufzeitfehler. Gegenprobe: mit wieder eingesetztem `offen.delete(id)` schlägt die Prüfung fehl.
- Das Kartenfenster ist danach zu. Gegenprobe: ohne das Schließen schlägt die Prüfung fehl.
- Mitgelieferte Pflanze: „Aus der Sammlung nehmen" setzt `S.weg`, ist gespeichert, „zurückholen" bringt sie zurück.
- Abbrechen im Bestätigungsdialog ändert nichts.
- Löschen während eines laufenden Abgleichs: kein Fehler, der Lauf endet regulär, die gelöschte Pflanze steht nicht in der Ergebnisliste.

Nicht durch Tests abgedeckt — nur am Handy prüfbar: das Schließen des Kartenfensters samt Zurück-Geste, der Bestätigungsdialog in Chrome auf Android, die Sammlung nach dem Schließen.

## Größe

Klein.

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
