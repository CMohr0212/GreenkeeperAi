# PLAN — GreenkeeperAI

Stand 22.09.2026 · Ausgangsfassung 3.27.0 · **nächste Zielversion 3.28.0, sw.js greenkeeperai-v123**

Erledigt und nicht mehr hier: Etappe A bis D, E1 (3.19.0), Lösch-Fix (3.19.1), Kartei-Seite (3.20.0), E2 (3.21.0), E2b (3.22.0), E4 + K (3.23.0), Kartei-Abschluss (3.24.0), E3 Pflegetexte (3.25.0), Kartei schneller (3.26.0), Verlässliche Sorten (3.27.0). Der Verlauf steht im CHANGELOG.

Reihenfolge (Chris, 22.09.2026): **Anzucht** (3.28.0, Konzept unten) → **Aufräumen** ohne neue Funktionen. Erst danach Sammel-Anlegen, **F**, **T**. Zurückgestellt: Claude-Anbindung.

## Zweck der Kartei, von Chris am 16.09.2026 gesetzt

- Die Kartei hält die Pflanzenkarten auf dem neuesten Stand: Steckbriefdaten, die Sorte und art- oder sortenspezifische Pflegetexte.
- Nichts, was jede Pflanze braucht. Keine Töpfe, kein Zustand, kein Befund, keine Maßnahmen — das bleibt beim Doktor.
- Geprüft werden feste Daten wie Frost und Felder, die das Anlegen leer gelassen hat.
- Pflegetexte wie bei der Venusfliegenfalle („Pflegeschritte“, „Winterruhe“): die KI schreibt sie, wo keine da sind, und gleicht sie ab, wo welche da sind.
- Die Sorte ermittelt die KI, am besten schon beim Anlegen.
- Der Doktor verliert den Abgleich der Steckbriefdaten, den übernimmt die Kartei.

## Reihenfolge (Chris, 21.09.2026)

- 3.24.0 Kartei-Abschluss, 3.25.0 E3.
- Claude-Anbindung zurückgestellt (Chris, 21.09.2026): Die API kostet je Anfrage, auch mit Claude Pro. Der Befund bleibt im Backlog: `KI_ANBIETER` kennt Anthropic mit `kann:false`, `kiFragen` ist fest auf Google gebaut.

## Erledigt in 3.24.0

- Abgleich-Fenster nur mit Kreuzen: × je Zeile, „Übrige übernehmen (n)“. Eigene Angaben sind hervorgehoben und gehen mit (Chris, 21.09.2026: „nur hervorheben, nicht gesondert“).
- Anlegen: keine Sorte mehr im botanischen Namen, auch nicht aus einem Bibliothekseintrag mit Sorte. Die Sorte geht in den Vorschlag (mittel bei Bibliothekseintrag, sonst niedrig).
- Frist in `kiFragen` gilt bis die Antwort gelesen ist. `karteiBilder` wartet höchstens 10 s.
- Belegt (Code): „Wichtig“ wird in der Kartei nur per Übernehmen ersetzt, nie still. Kein Verstoß gegen 10.8.
- Lauf mit mehreren Pflanzen am Gerät bestätigt (Chris, 21.09.2026).

---

## Erledigt in 3.25.0 — E3 Pflegetexte

- Anlegen und Kartei fragen `PFLEGE` und `WINTERRUHE` (Chris, 21.09.2026: Anlegen fragt mit, statt E1). Der Doktor-Auftrag bleibt wortgleich.
- Fehlende Pflegeschritte und Winterruhe zählen als Lücke (Chris, 21.09.2026, statt E2). Geprüftes „keine“ steht als leere Liste bzw. leerer Text.
- Kartei-Auftrag: „wie Karte“ für WICHTIG, PFLEGE, WINTERRUHE; die drei Texte der Karte gehen mit (E3).
- Neues Feld `winterruheText`, Karte zeigt es statt des festen Venusfliegenfallen-Textes. `winterruhe` (ja/nein) setzt die KI nie (E4).
- Pflegeschritte werden als Ganzes ersetzt (E5). Bearbeiten mit Stempel `hand` nur bei Änderung.
- `winterruheText` in `ABLEGER_ERBE`; ein geprüftes „keine“ erbt mit.
- Folge: „Nur mit Lücken“ nimmt zunächst fast jede Pflanze, bis ein Kartei-Lauf die Texte ergänzt hat.

## Erledigt in 3.26.0 — Kartei schneller

- Bündel zu fünf Pflanzen gleicher Art (mit oder ohne Foto), zwei gleichzeitig, Frist 90 s. Blöcke `PFLANZE: <Nummer> | <Name>`; falscher Name, doppelte oder fehlende Nummer → die Pflanze geht einzeln noch einmal (`S.kartei.einzeln`).
- Niedrige Denkstufe nur für die Kartei: `thinkingLevel: low` ab Gemini 3, `thinkingBudget: 512` bei 2.5. Bei 400 einmal ohne, gemerkt in `KI_DENKEN_AUS`.
- 429 mit Tageskontingent (`PerDay`) hält den Lauf an (`halt: 'tag'`), Minutenlimit bremst nach Googles `retryDelay`, sonst 60 s.
- Laufzeit (`laufMs`, `laufAb`), Modell und Restzeit unter dem Balken; Dauer je Pflanze in der Ergebnisliste; Laufzeit in der Leiste.
- Am Gerät bestätigt (Chris, 22.09.2026): 49 von 50 in 3 Minuten, Modell 3.6 Flash, Warten sichtbar. Eine Pflanze mit 503.

---

# Erledigt in 3.27.0 — Verlässliche Sorten und Pflegeangaben

- A: Kein Spitzname im Auftrag (`karteiBezeichnung`), Blockkopf nur Nummer. `SORTE_BELEG` und `SORTEN_VERWECHSLUNG` in Kartei (mit Foto) und Anlegen. `sorteGeprueft`: Spitzname (nur Gleichheit, damit „Thai“ „Thai Constellation“ nicht sperrt), Trivialname, ohne Foto, ohne Beleg → niedrig, Verwechslung → höchstens mittel. Vorhandene Sorte → „strittig“, nur einzeln.
- B: Abweichung von der Bibliothek → Zeile `einzeln`, nicht im Sammelknopf. `Q_RANG` bleibt unverändert (betrifft nur stille Schreibwege; die Kartei schreibt nie still). Plausibilitätsregeln `PLAUSI_TROPISCH`, `PLAUSI_SUKKULENT`.
- C: Fotobündel `thinkingLevel: medium` / `thinkingBudget: 2048`.
- D: `herkunftZeileHTML` unter dem Steckbrief.
- E: `karteiFragen` weicht nach 503 einmal aus.
- F: Prüfstand in pruef.js (Beauty, King Green, Bogenhand, Thai Constellation gegen Albo, Aronstab-Grenzen, Kaktus, Bibliothek, Anlegen).

---

# Konzept — Anzucht · Zielversion 3.28.0 (noch nicht zur Freigabe)

Chris am 22.09.2026: eigener Bereich mit allen Anzuchten, gegliedert in Anzuchtbereiche (z. B. das kleine Anzuchthaus) und Gefäße (Wassergläser). Wasserwechsel muss vermerkt werden. Mehrere Stecklinge, auch verschiedene Sorten, werden oft zu einer Pflanze zusammengesetzt. Bestimmung über die Mutterpflanze aus der Galerie oder per KI.

## Aufbau

- **Bereich „Anzucht“** in der App, eigener Einstieg.
- **Anzuchtbereiche**, z. B. „Anzuchthaus“, „Fensterbank Küche“. Ein Gefäß kann auch ohne Bereich stehen.
- **Gefäße**, z. B. „Glas 1“, „Schale im Anzuchthaus“. Angaben: Medium (Wasser, Substrat, Moos, Perlite), Foto, Startdatum.
- **Gruppen** im Gefäß: Anzahl, Methode (Blattsteckling, Kopfsteckling, Blattschnitt, Triebstück …), Start, Herkunft.

## Herkunft einer Gruppe — drei Wege

- Mutterpflanze aus der Galerie wählen (erbt Art, botanischen Namen, Sorte).
- KI-Bestimmung per Foto des Stecklings (dieselben Sorten-Regeln wie 3.27.0).
- Frei eintragen (getauschte Stecklinge).

## Wasserwechsel

- Gefäße mit Wasser haben „Wasser gewechselt“ mit Datum und Verlauf.
- Erinnerung im festen Abstand, fällig und überfällig sichtbar im Bereich und in der Tagesübersicht.

## Eintopfen

- Aus einer oder mehreren Gruppen, auch aus verschiedenen Gefäßen und Sorten, entsteht **eine** neue Pflanze.
- Die Karte kennt dann mehrere Mütter und eine Hauptsorte mit „Mit im Topf: …“ (z. B. Golden Pothos mit Marble Queen).
- Erbe über `ABLEGER_ERBE` von der gewählten Hauptmutter.
- Die Gruppen zählen um die eingetopften Stecklinge herunter; leere Gruppen verschwinden, der Verlauf bleibt.

## Befund für den Bau

- **Belegt** (Code): Ein Ableger kennt genau eine Mutter (`eltern`). Mehrere Mütter brauchen ein neues Feld.
- **Belegt** (Code): Eine Karte kennt genau eine Sorte.

## Offene Fragen an Chris

- Abstand für den Wasserwechsel als Vorgabe: alle 3 oder alle 7 Tage — oder je Gefäß einstellbar?
- Eigene Fotos und Verlauf je Gruppe (Wurzeln sichtbar, erstes Blatt) oder je Gefäß?

---

# Danach: Aufräumen · keine neuen Funktionen

Chris am 22.09.2026: Nach der Anzucht wird die App grundlegend aufgeräumt, alle restlichen Kinderschuhfehler beseitigt und alles auf 100 % funktional gebracht, bevor wieder etwas Neues kommt.

- Umfang wird vor Beginn gemeinsam festgelegt (Durchgang durch alle Bereiche, Fehlerliste, Reihenfolge).
- Dazu gehören die vier alten roten Tests (Anstau, Bromelie, Kaktus, Fokus) und die offene Statuszeile unter „Mehr“.
- Sammel-Anlegen, F, T, Claude-Anbindung und alle anderen neuen Punkte warten bis danach.
