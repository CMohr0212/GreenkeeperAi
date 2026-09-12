# PLAN — Etappe A1 · Anlegen-Auftrag entkernen
Freigegeben: 12.09.2026 · Zielversion: 3.14.0 (sw.js greenkeeperai-v108)

## Ziel

Der Anlegen-Auftrag fragt nur noch nach Bestimmung und sichtbarem Ist-Zustand; jede Bewertung entfällt.

## Änderungen

- `ANTWORT_FORMAT` wird zur Laufzeit in seine Feldzeilen zerlegt; Anlegen und Doktor setzen daraus ihre eigene Liste zusammen. Der Doktortext bleibt dabei zeichengleich.
- Aus dem Anlegen-Auftrag fallen: `ZUSTAND`, `BEFUND`, `MASSNAHME`, `FEHLT`, `GIESSEN`, `TOPF`.
- Neu im Anlegen-Auftrag: `SUBSTRAT` (sichtbare Oberfläche), `TOPFART` (gegen `TOPFFORMEN`), `ABLAUF` (ja/nein/nicht sichtbar).
- `KATZEN` richtet sich nach den eingetragenen Tieren (`meineTiere`); ohne Tier fällt die Zeile weg.
- `ANTWORT_SCHLUESSEL` bekommt `substrat`, `topfart`, `ablauf`.
- Die drei neuen Angaben werden beim Speichern an der Pflanze abgelegt.
- Die Notiz beim Anlegen enthält nur noch `VERWECHSLUNG` und `FROST`.
- Das Zahlwort und die Beispielantwort wandern für beide Aufträge getrennt mit.

## Nicht angefasst

Doktor-Auftrag und Doktor-Ansicht, Anlegen-Formular (Schieber und Knopfgruppen kommen in A2), Maßnahmenauswahl und Topfblock im Formular (A2), Doktor-Anstoß nach dem Speichern (A2), Rundgang, Karte, Historie, Grundriss, Gieß- und Lernlogik, Substratrechner.

## Risiken

- Die Zerlegung muss den Doktortext zeichengleich wieder herstellen. Tut sie es nicht, ändert sich der Doktor still mit, obwohl er erst in B dran ist.
- `promptZahlSetzen` zählt die Feldzeilen selbst — zwei Aufträge heißen zwei Zahlen.
- `mitDoktorZeilen`, `ohneVermehrung` und `ohneTopf` arbeiten per Textersetzung und brechen still, wenn sich Formulierungen verschieben.
- Die Beispielantwort muss für beide Wege getrennt passen, sonst widerspricht sie der Liste.
- Die drei neuen Angaben haben in A1 noch kein Formularfeld; sie sind bis A2 nur gespeichert, nicht sichtbar.

## Prüfung

pruef.js prüft: der Anlegen-Auftrag enthält `SUBSTRAT`, `TOPFART`, `ABLAUF` und enthält `ZUSTAND`, `BEFUND`, `MASSNAHME`, `FEHLT`, `GIESSEN`, `TOPF` nicht; der Doktor-Auftrag enthält sie weiterhin; der zusammengesetzte Doktortext ist zeichengleich mit dem bisherigen; beide Zahlwörter stimmen zur jeweiligen Feldzahl; beide Beispielantworten enthalten jedes Feld ihrer Liste und keines darüber hinaus; die Tierzeile folgt `meineTiere` und fehlt ohne Tier; der Leser kennt `substrat`, `topfart`, `ablauf`; eine Musterantwort legt die drei Werte an der Pflanze ab; die Notiz enthält keinen Befund mehr; `ohneVermehrung` lässt den Rest unversehrt.

Nicht durch Tests abgedeckt — nur am Handy prüfbar: Qualität und Tempo der echten Antwort.

## Größe

Mittel.

---

# Ausblick — noch nicht freigegeben

## A2 — Anlegen-Formular

Schieber für den Topfdurchmesser, Knopfgruppen für Topfart und Substrat mit dem KI-Vorschlag vorbelegt, Maßnahmenauswahl und Topfblock raus, Doktor-Anstoß nach dem Speichern. Größe: mittel.

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
