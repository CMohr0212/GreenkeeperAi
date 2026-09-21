# PLAN — GreenkeeperAI

Stand 21.09.2026 · Ausgangsfassung 3.25.0 · **Zielversion 3.26.0, sw.js greenkeeperai-v121**

Erledigt und nicht mehr hier: Etappe A bis D, E1 (3.19.0), Lösch-Fix (3.19.1), Kartei-Seite (3.20.0), E2 (3.21.0), E2b (3.22.0), E4 + K (3.23.0), Kartei-Abschluss (3.24.0), E3 Pflegetexte (3.25.0). Der Verlauf steht im CHANGELOG.

Offen sind: **Stecklinge sammeln** unter einer Kartei oder Gruppe (Chris erklärt, Plan folgt), Sammel-Anlegen, **F** und **T**. Zurückgestellt: Claude-Anbindung.

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
