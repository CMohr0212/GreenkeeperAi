# PLAN — Fassung A1 · Pflanzenkarte umbauen
Freigegeben: 11.09.2026 · Zielversion: 3.11.0 (sw.js greenkeeperai-v104)

Ziel: Jede Pflanze hat dieselbe Karte mit 4 klar getrennten Reitern, und das Wichtige steht ohne Aufklappen da.

Änderungen:
- Ein Darstellungsweg für alle Pflanzen. Abschnitte ohne Inhalt fallen weg. Fehlende Bibliotheksfelder führen nicht zum Absturz.
- 4 Reiter:
  - Pflege: Zustand · Gießen · Düngen · Pflegeschritte · Winterruhe
  - Standort: Raum · Stellplatz · Tiere · Grundriss
  - Verlauf: Gießabstände · Wachstum · Einträge · Befunde · Abstammung · Notizen
  - Wissen: Steckbrief · Merkmale · Herkunft · Giftigkeit · Wenn etwas nicht stimmt · Beobachtungen
- Der Zustand kommt aus dem Gießen-Aufklapper heraus und wird die erste Zeile im Reiter Pflege.
- In Pflege und Standort gibt es keine Aufklapper mehr, nur Blöcke mit Zwischenüberschrift. Aufklapper bleiben nur für lange Texte und für ältere Einträge.
- Aus „Gießen und Verlauf“ wird „Gießen“, aus „Statusänderung und Verlauf“ wird „Einträge“, und der Link „Verlauf ansehen“ entfällt.
- Der kursive Gießtipp fällt weg, wenn die Warnbox dasselbe sagt. Erkannt wird das über die vorhandenen `REGEL_STICHWORTE`.
- Befunde bekommen einen eigenen Abschnitt „Befunde des Doktors“ im Reiter Verlauf. Er zeigt den neuesten Befund mit Datum und erstem Satz, der Rest öffnet sich per Tippen. Die Daten bleiben unverändert, es ist nur eine andere Anzeige.
- Die Wachstumsrate erscheint erst ab 30 Tagen Spanne. Davor steht nur die Anzahl.
- Das Pflichtpaket läuft nach Regel 6.2. Zielversion ist 3.11.0 mit sw v104.

Nicht angefasst:
- Kopf (Foto bis Knopfreihe), Aufgaben, Warnbox
- Scroll-Code
- Datenformat (keine Umzüge)
- Doktor und Prompt
- Zeitstrahl
- Klartext-Design: stapelt weiter statt Reiter

Risiken:
- 4 Reiter könnten am Handy zu breit werden, weil 3 schon rund 70 % der Breite belegen.
- Rund 10 bestehende Tests prüfen die alten Positionen (z. B. Steckbrief in Pflege) und müssen angepasst werden. Jede Anpassung wird einzeln begründet, damit kein Test nur „grün gemacht“ wird.
- Ein gespeicherter Reiter mit altem Schlüssel fällt auf den ersten Reiter zurück, was harmlos ist.
- Eigene Pflanzen ohne Bibliotheksfelder waren der Grund für den Kurzweg. Hier liegt die Absturzgefahr.

Prüfung:
- pruef.js prüft:
  - Es gibt 4 Reiter.
  - Eine eigene und eine Bibliothekspflanze (vom Test angelegt) bekommen dieselben Abschnitte.
  - Eine eigene Pflanze ohne Stammdaten rendert ohne Fehler.
  - Befunde stehen nicht mehr unter Notizen.
  - Der Zustand steht nicht im Gießen-Block.
  - 2 Blätter in 2 Tagen ergeben keine Monatsrate.
  - Die Versionsangaben stimmen.
- Nicht durch Tests abgedeckt — nur am Handy prüfbar: Breite der Reiterleiste, Blocklayout ohne Aufklapper, Lesbarkeit der Befunde.

Größe: mittel
