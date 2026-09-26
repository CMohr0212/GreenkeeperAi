# PLAN — GreenkeeperAI

Stand 23.09.2026 · Ausgangsfassung 3.28.0 · **Zielversion 3.28.1, sw.js greenkeeperai-v124**

**Freigegeben am 23.09.2026 (Chris): 3.28.1 · Zielversion 3.28.1, sw.js greenkeeperai-v124.** 3.29.0 ist nicht freigegeben.

Reihenfolge (Chris, 23.09.2026): zuerst die roten Tests, dann 3.29.0, dann Aufräumen.
Erledigt und nicht mehr hier: alles bis 3.28.0 (Anzucht). Verlauf im CHANGELOG. „Bereich auflösen“ in 3.28.0 nachträglich freigegeben (Chris, 23.09.2026).

---

# Freigegeben — Rote Tests · Zielversion 3.28.1

## Ziel
pruef.js läuft unabhängig vom Datum und vom Zufall mit 0 Fehlschlägen, und der Gießhinweis verliert im Winter nicht mehr den Satz der Gießgruppe.

## Befund
- **Belegt** (Prüflauf 23.09.): 2198 Prüfungen, 3 rot — Anstau, Bromelie, Kaktus. „Fokus kehrt zum Auslöser zurück“ war diesmal grün.
- **Belegt** (Code, `giessHinweisFuer`): Im Winter (`sommer()` = `jahresLage() < 0.5`, also etwa seit Mitte September) gewinnt der Wintersatz der Klasse (`KLASSEN[x].probeWinter`) vor dem Satz der Gruppe. Folge in der App: Eine Bromelie liest „Im Winter tiefer prüfen …“ statt Trichter, ein Kaktus mit Klasse B verliert „Topf anheben“.
- **Belegt**: Die drei Tests laufen ohne festes Datum, deshalb sind sie seit Herbstbeginn rot. Der Test ist nicht falsch, der Wintersatz verdrängt die Gruppe tatsächlich.
- **Vermutet**: „Fokus“ wackelt durch ein Timing zwischen `modalZu` und `tick()` oder ein Neuzeichnen, das den Auslöser-Knopf ersetzt. Nicht belegt.

## Änderungen
- Gruppen bekommen einen eigenen Wintersatz (`probeWinter`), wo der Satz der Klasse falsch wäre. Reihenfolge im Winter: Gruppe-Winter → Klasse-Winter → Gruppe.
- Neue Wintersätze (Wortlaut zur Freigabe):
  - Trichterbromelie: „Im Winter nur wenig Wasser in den Trichter. Steht sie kühl, bleibt der Trichter leer und nur das Substrat wird leicht angefeuchtet.“
  - Wüstenkaktus: „Winterruhe: kühl und trocken halten. Topf anheben — gegossen wird nur, wenn der Körper schrumpelt.“
  - Blattsukkulente: „Im Winter Topf anheben und Blätter ansehen. Erst gießen, wenn sie weich oder runzlig werden.“
  - Rhizom- oder Knollenspeicher: „Im Winter Topf anheben und lange warten. Der Speicher trägt sie — im Zweifel gar nicht gießen.“
  - Rindenepiphyt: „Im Winter seltener: Wurzeln ansehen und den Topf anheben. Erst gießen, wenn sie silbrig und der Topf leicht ist.“
  - Sumpfpflanze: „Im Winter den Untersetzer nur knapp nachfüllen — leerlaufen darf er nicht.“
  - Kannenpflanze: „Oberfläche muss klamm bleiben — aber kein Wasser im Untersetzer.“ (wie im Sommer)
  - Knolle mit Trockenruhe: „Ist sie eingezogen, gar nicht gießen. Treibt sie weiter, sparsam.“
- Ohne eigenen Wintersatz, bleiben beim Satz der Klasse: Normales Laub, Dünnblättrige, Hartlaub, Moorbeet im Anstau (Klasse S „Untersetzer leeren“ ist gewollt).
- pruef.js: Gießhinweis-Tests laufen mit festem Datum, einmal Sommer (15.07.), einmal Winter (15.01.); `HEUTE` wird danach zurückgesetzt. Neue Wintertests: Bromelie Trichter, Kaktus anheben, Anstau ohne Fingerprobe, Laub mit Klassensatz.
- Datumsprobe: ein Prüflauf mit vorgetäuschtem Datum Januar und einer mit Juli, um weitere datumsabhängige Tests zu finden. Gefundene Tests bekommen ein festes Datum; Fehler in der App daraus → Backlog, nicht in diese Fassung.
- Fokus-Test: der Modal-Block läuft zehnmal allein. Ist die Ursache danach belegt, wird der Test oder die App behoben. Sonst bleibt er, bekommt eine Messung (Auslöser noch im Dokument ja/nein, aktives Element) und geht ins Backlog.
- Pflichtpaket nach Regel 6.2.

## Nicht angefasst
Gießrhythmus und Lernfaktor, `KLASSEN` (Texte und Werte), Gruppe „Sukkulente mit Sommerruhe“ (umgekehrtes Jahr, eigener Winterfall), Kartei, Doktor, Anzucht, alle Punkte unter „Nicht anfassen“ der Übergabe.

## Risiken
- Wintersätze sind Pflegeaussagen. Wortlaut von Chris prüfen lassen.
- Die Datumsprobe kann weitere rote Tests zeigen; die Fassung wächst dadurch nicht, nur der Backlog.
- Der Fokus-Test ist womöglich in dieser Fassung nicht lösbar (Zufall).

## Prüfung
- pruef.js: Wintersatz je Gruppe, Sommersatz unverändert, Anstau ohne Fingerprobe in beiden Jahreszeiten, Gegenprobe (ohne Gruppen-Wintersatz schlägt der Bromelien-Wintertest fehl).
- Nur am Handy: Wortlaut im Gießmodus und auf der Karte einer Bromelie oder eines Kaktus.

## Größe
klein

---

# Weiter offen, nicht freigegeben — Anzucht Teil 2 · Zielversion 3.29.0

## 3.29.0

**KI-Bestimmung**
- „Per Foto bestimmen“ in der Gruppe: kurzer Auftrag nur mit ART, BOTANISCH, SICHERHEIT, SORTE, SORTE_BELEG, SORTEN_VERWECHSLUNG; Regeln aus 3.27.0 (`sorteGeprueft`); gespeichert erst per Tipp.

**Mischtopf**
- Eintopfen aus mehreren Gruppen, auch aus verschiedenen Gefäßen und Sorten, zu **einer** Pflanze (z. B. Golden Pothos mit Marble Queen).
- Erbe über `ABLEGER_ERBE` von der Hauptgruppe (Vorgabe: die mit den meisten Stecklingen).
- Neue Felder `muetter` und `mitImTopf`; die Karte zeigt „Mit im Topf: Marble Queen (2)“. `eltern` bleibt die Hauptmutter, der Stammbaum zeigt weitere Mütter mit.

---

# Danach: Aufräumen · keine neuen Funktionen

Chris am 22.09.2026: Nach der Anzucht wird die App grundlegend aufgeräumt, alle restlichen Kinderschuhfehler beseitigt und alles auf 100 % funktional gebracht, bevor wieder etwas Neues kommt.

- Umfang wird vor Beginn gemeinsam festgelegt (Durchgang durch alle Bereiche, Fehlerliste, Reihenfolge).
- Dazu gehören die vier alten roten Tests (Anstau, Bromelie, Kaktus, Fokus) und die offene Statuszeile unter „Mehr“.
- Sammel-Anlegen, F, T, Claude-Anbindung und alle anderen neuen Punkte warten bis danach.
