# Übergabe — GreenkeeperAI · Stand 3.11.0 · 11.09.2026

## Kurz
Version: 3.11.0 · sw.js greenkeeperai-v104 · geliefert 11.09.2026, Hochladen und Handy-Prüfung durch Chris ausstehend
Nächster Schritt: Chris prüft 3.11.0 am Handy (Reiterbreite, offene Blöcke, Befunde) · danach Planmodus Fassung A2
Offen oder kaputt: Scroll-Rücksprung bei Gruppierung „Keine“ ungelöst, Messwerte fehlen · Düngetag-Fix aus 3.10.8 am Gerät unbestätigt · 3.11.0 am Gerät unbestätigt
Nicht anfassen: Scroll-Code und Scrollprotokoll — eigenes Thema, erst wieder mit Messwerten
Offener Plan: nein (PLAN.md enthält A1, umgesetzt in 3.11.0)

## Gescheiterte Versuche
- Scroll-Rücksprung: 3.9.1 und 3.10.6 setzten an einer Zuklapp-Mechanik an, die nicht mehr griff; 3.10.7 hat sie entfernt, Fehler besteht weiter. Belegt: Seitenhöhe ändert sich beim Scrollen nicht. Vermutet: etwas setzt den Scrollstand aktiv. Werte aus Stufe 2 (3.10.8) stehen aus.

## Entscheidungen
- Fassung A geteilt in A1 (Umbau, erledigt) und A2 (neue Inhalte) — A am Stück war zu groß für eine Sitzung.
- Befunde werden nur in der Anzeige von den Notizen getrennt, gespeichert bleibt alles in p.notiz — strukturierte Befunde kommen mit Fassung C, ein Datenumzug jetzt wäre doppelte Arbeit.
- Gießabstände und Wachstum stehen im Reiter Verlauf — Pflege zeigt nur, was ansteht.
- Der Gießtipp wird satzweise gefiltert, ein Satz ohne Regel-Stichwort bleibt immer — sonst verschwinden eigene Hinweise.
- Licht am Platz wird nur angezeigt und wirkt nicht auf das Gießintervall — Chris' Wahl (für A2).
- Die zuletzt angerührte Substratmischung wird gemerkt — sonst fängt jedes Umtopfen bei null an (für A2).
- Zeitstrahl-Zeitraum: Vorgabe 3 Monate, verstellbar — Chris will das als Einstellung (für B).

## Backlog-Zuwachs
Noch nicht freigegeben.

**Fassung A2 — neue Inhalte der Pflanzenkarte**
- Standort: „Licht am Platz“ (Licht im laufenden Monat und Bedarf der Art; ohne Grundriss-Eintrag ein Verweis zum Einzeichnen statt einer Zahl).
- Pflege: „Topf und Substrat“ (Topfgröße, letztes Umtopfen, zuletzt angerührte Mischung aus Substratwerkzeug und Umtopfen).
- Giftigkeit für alle eingetragenen Haustiere, bei jeder Pflanze (heute nur Katze im Reiter Wissen).
- Gießintervall von Hand auf der Karte sichtbar und änderbar. Belegt: `intervallEigen` wird gelesen, aber keine Stelle der App setzt es.
- Wissen für selbst angelegte Pflanzen aus der Artenbibliothek füllen (Familie, Wuchsform, Frostgrenze) — heute bleibt der Steckbrief dort meist leer.

**Fassung B — Zeitstrahl im Reiter Verlauf**
- Ersetzt Gießabstände, Einträge und Beobachtungen durch einen Zeitstrahl; Zustände als Bänder, Rhythmus als Balken (Gießen oder Düngen), Ereignisse als Punkte über Chips.
- Zeitraum umstellbar (4 Wochen · 3 Monate · 1 Jahr · alles), Wahl pro Gerät gemerkt.
- Neue App-Ereignisse: Intervall von Hand geändert · Intervall gelernt · Gießklasse gewechselt · Standort gewechselt.

**Fassung C — Pflanzendoktor**
- Prompt überarbeiten, Befund als eigene Daten statt Notiztext (Datum, Zustand, Maßnahmen), Verknüpfung mit Zustand, Aufgaben und Zeitstrahl; keine Wiederholung der Artpflege im Befund (Chris, 11.09.).

**Aufgaben**
- Aufgabensystem neu, mit Kalender — die heutigen Aufgaben sind laut Chris „nur nervig“ (Chris, 11.09.).

## Offene Regeländerungen
- Projektanweisungen Stand 2 (11.09.2026): Eintragen von Chris noch nicht bestätigt.
- Stand 3, Regel 10.8 NEU (Gegenproben über Mini-Prüfstand): Eintragen noch nicht bestätigt.
