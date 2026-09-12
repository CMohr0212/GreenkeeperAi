# PLAN — Etappe A2 · Anlegen-Formular
Freigegeben: 12.09.2026 · Zielversion: 3.15.0 (sw.js greenkeeperai-v109)

## Ziel

Das Anlegen-Formular fragt Topfdurchmesser, Topfart, Substrat und Ablauf selbst ab, statt Urteile der KI zu übernehmen, und schickt die fertige Pflanze zum Doktor.

## Änderungen

- Neuer Block `al-topf` in Stufe 4 (Platz und Pflege), unter der Kulturform:
  - Schieber `f-topf` für den Topfdurchmesser, 5 bis 80 cm. Er startet **ungesetzt** und zeigt „nicht angegeben“; die erste Berührung setzt ihn auf 14 cm. Unter dem Schieber steht das Topfvolumen aus `topfVolumen`.
  - Knopfgruppe `f-topfform` aus `TOPFFORMEN`, mit `topfIcon` je Knopf — dieselbe Darstellung wie im Substratrechner.
  - Knopfgruppe `f-substrat` aus neuer Tabelle `SUBSTRATARTEN`: Erde, Erde mit Rinde, Rinde, Blähton, Seramis oder Pon, Sphagnum, Kies oder Sand, Wasser.
  - Knopfgruppe `f-ablauf`: ja, nein, weiß nicht.
- Vorbelegung aus der KI-Antwort: `topfartLesen` setzt `f-topfform`, `ablaufLesen` setzt `f-ablauf`, ein neues `substratLesen` setzt `f-substrat`. Ohne sichere Zuordnung bleibt die Gruppe ohne Auswahl. Kein Wert wird geraten.
- Kulturform steuert den Block: bei „Erde“ und „Blähton“ sichtbar (bei Blähton ist Blähton vorbelegt), bei „Wasserglas“ ausgeblendet; gespeichert wird dann `substrat: 'wasser'`, Topfgröße und Topfform bleiben leer.
- `alSpeichern` nimmt `topf`, `topfform`, `substrat`, `ablauf` aus den Feldern statt aus `letzteKiAntwort`. `topf` wird wie bisher als Zeichenkette abgelegt, nur wenn der Schieber gesetzt wurde.
- `formularLeeren` setzt die vier neuen Felder zurück.
- Raus aus dem Anlegen: `neuMassnahmenZeigen` samt Aufruf, der Kasten `#neu-massnahmen`, der Topfblock daraus (`topfHTML`, `topfMassnahme`), die Topfzeile in der Notiz, die Zustandsübernahme aus der KI-Antwort und die Umwandlung der Maßnahmen in Aufgaben in `alSpeichern` samt Meldung. Die Funktionen selbst bleiben — der Doktor benutzt sie weiter.
- Doktor-Anstoß: Nach dem Speichern zeigt die geöffnete Karte oben einen Kasten „Angelegt — der Doktor kann jetzt Zustand und Pflege bewerten“ mit den Knöpfen „Zum Doktor“ (bestehendes `data-do="doktor-fuer"`) und „Später“. Der Kasten erscheint nur für die gerade angelegte Pflanze und verschwindet nach einer Antwort.
- `alZsfZeichnen` („Das wird angelegt“) bekommt die Zeilen Topf und Substrat.
- `topfSubstratHTML` im Reiter Pflege zeigt zusätzlich das eingetragene Substrat und den Ablauf.

## Nicht angefasst

Anlegen-Auftrag und Antwortleser aus A1, Doktor-Auftrag und Doktor-Ansicht, `ANTWORT_FORMAT`, Substratrechner, Umtopfen-Werkzeug, Rundgang, Karte im Übrigen, Historie, Grundriss, Gieß- und Lernlogik, Altbestand (Herkunftsstempel sind Etappe C).

## Risiken

- Eine eingetragene Topfgröße ändert `wasserBedarf` und damit die angezeigte Gießmenge. Neue Pflanzen bekommen damit andere Mengen als bisher — gewollt, aber neu.
- Ein Schieber mit Standardwert hätte eine Messung erfunden, die niemand vorgenommen hat. Der ungesetzte Startzustand ist der Preis dafür und ein zusätzlicher Zustand, der am Handy überzeugen muss.
- Der Kasten auf der Karte liegt über der Kartenansicht. Ebenen und Modal-Sperre sind nach Regel 10.5 mitzuprüfen.
- Das Entfernen der Maßnahmenauswahl fasst Code an, den der Doktor mitbenutzt. Getrennt wird nur der Aufruf, nicht die Funktion.
- Vier neue Bedienelemente auf Stufe 4 machen die Stufe lang. Ob sie am Handy noch beherrschbar ist, zeigt erst das Gerät.

## Prüfung

pruef.js prüft: der Block `al-topf` und die vier Felder sind vorhanden; `SUBSTRATARTEN` und die Knopfgruppen haben genau die geplanten Werte; `substratLesen` ordnet die erlaubten KI-Angaben zu und gibt bei „nicht sichtbar“ und bei Unbekanntem leer zurück; eine eingelesene Musterantwort belegt Topfform, Substrat und Ablauf vor; ein ungesetzter Schieber legt kein `topf` an der Pflanze ab, ein gesetzter legt die Zeichenkette ab; Kulturform „Wasserglas“ blendet den Block aus und speichert `substrat: 'wasser'`; `formularLeeren` setzt alle vier zurück; `#neu-massnahmen` und der Aufruf von `neuMassnahmenZeigen` sind fort; eine Musterantwort mit Maßnahmen legt beim Anlegen keine Aufgaben mehr an; die Notiz enthält keine Topfzeile; `topfHTML` und `massnahmenAuswahlHTML` sind für den Doktor unverändert erreichbar; der Anstoßkasten erscheint nach dem Speichern mit beiden Knöpfen und trägt die Kennung der neuen Pflanze.

Nicht durch Tests abgedeckt — nur am Handy prüfbar: Schieber und Knopfgruppen unter dem Finger, Länge der Stufe 4, Ebenen des Anstoßkastens über der Karte.

## Größe

Mittel.

## Abweichung vom Ausblick

Der Ausblick nannte drei Bedienelemente. Der Ablauf bekommt eine vierte Knopfgruppe, weil er sonst als einziger der drei Werte aus A1 ohne Formularfeld bliebe — genau der Punkt, der in der Übergabe als offen steht.

---

# Ausblick — noch nicht freigegeben

## B — Doktor bewertet mit den Ist-Werten

`dokPromptBauen` bekommt Topfdurchmesser, Topfart, Substrat, Ablauf und Kulturform mit. `TOPF` wird zur Bewertung gegen die echte cm-Zahl. Art-Gegenprüfung nur bei anderer Art und `SICHERHEIT: hoch`. Zustand, Befund und Maßnahmen liegen ab hier ausschließlich beim Doktor. Größe: mittel.

## C — Herkunft und Rangfolge

Stempel `ki` / `bib` / `hand` je Feld. Hand schlägt KI, KI schlägt Bibliothek, Bibliothek nur ohne KI-Antwort. Der Doktor-Abgleich zeigt keine Felder mit Stempel `hand`. Altbestand ohne Stempel gilt als `bib`. Einzige Etappe, die Altdaten anfasst. Größe: mittel.

## D — Sorten

Feld `sorte` an der Pflanze, Freitext vom Nutzer. Karte und Listen zeigen die Sorte hinter dem Artnamen. Der Auftrag beschreibt sichtbare Sortenmerkmale, statt einen Namen zu raten. Größe: klein.

## E — Sammel-Anlegen

Mehrere Fotos wählen, je Pflanze eine eigene Anfrage gleichzeitig, Durchwinkliste, Standort einmal für alle. Größe: groß — Aufteilung: E1 Fotos und parallele Anfragen, E2 Durchwinkliste.

## F — KI im Rundgang

Noch Idee, kein Plan. Wird besprochen, wenn A bis E stehen.
