Fassung 3.20.0 · sw.js greenkeeperai-v115 · 16.09.2026

## Kurz
Version: 3.20.0 (index.html), greenkeeperai-v115 (sw.js). Kartei-Seite neu (Kästchen, Laufansicht, Anhalten/Fortsetzen, Prozent), am Handy noch unbestätigt. Vor dem Hochladen den laufenden Lauf über das × in der Leiste verwerfen.
Nächster Schritt: am Handy prüfen, ob ein Lauf jetzt bis „x von x“ durchkommt. Kommt er nicht durch: Screenshot Leiste und Mehr › KI-Dienst, dann Messung nach Regel 5.6. Danach E2, Gießcenter, Meldungen, Benachrichtigungen. Chris entscheidet die Reihenfolge.
Offen oder kaputt: Kartei-Lauf nie durchgekommen (eine belegte Ursache in 3.20.0 behoben, weitere möglich). Gießcenter „2 überfällig“ (ungeprüft). Fettkraut im Winter (belegt). 3.19.0 Hintergrund/Benachrichtigung und Gerätekontrollen 3.13.0–3.19.1 unbestätigt.
Nicht anfassen: Gift über `giftEigenSetzen` und `fest`/`strittig`. `merkmale` gehört der Bibliothek, die KI schreibt nur nach `sortenmerkmale`. `S.kartei` schreibt nie von selbst in eine Pflanze.
Offener Plan: ja (PLAN.md) — Kartei-Seite erledigt, E2 im Zuschnitt freigegeben, Detailplan fehlt.

## Gescheiterte Versuche
- Die erste Fassung des Tests „Fortsetzen lässt den Lauf wieder laufen“ prüfte `k.aktiv` nach einem Tick. Bei 40 ms Verzug war der Lauf da schon durch. Der Test prüft jetzt `pausiert` und die Zahl der Anfragen.
- Alle Gegenproben in einem Befehl überschritten das Zeitlimit des Werkzeugs (300 s) und ließen eine veränderte index.html liegen. Ein Lauf im Hintergrund (nohup) wurde nach Befehlsende beendet. Was funktioniert: höchstens zwei Gegenproben je Befehl im Vordergrund, je rund 90 s, danach `cmp` gegen die gesicherte Datei.

## Entscheidungen
- `KARTEI_GEN` zählt bei Start, Anhalten und Verwerfen hoch. Sonst trägt eine abgebrochene Antwort nach dem Fortsetzen ein Ergebnis ein oder löscht den Abbrecher der neuen Anfrage.
- Die Warteschlange wird aus `k.alle` minus `k.fertig` neu gebaut, statt laufende Anfragen einzeln zu merken. Damit ist auch ein Abbruch durch Schließen der App abgedeckt.
- Ein Lauf ohne `alle` (aus 3.19.x) wird beim Start auf angehalten gesetzt und lässt sich nur verwerfen. Seine vollständige Liste ist nicht rekonstruierbar.
- Der Knopf heißt „Anhalten“, weil der Lauf danach fortsetzbar ist. Chris hat dem im Plan nicht widersprochen.
- `KARTEI_ART` ist entfernt. Die Auswahl ist nur noch `KARTEI_WAHL`, die Kästchen sind Kurzwege darauf.

## Backlog-Zuwachs
- **Gießerinnerung als Benachrichtigung** (von Chris, 16.09.2026). Einziger Weg ohne Server: Periodic Background Sync. Er geht nur in der installierten App, ohne feste Uhrzeit und höchstens etwa täglich; Chrome entscheidet nach Nutzung. Die Fälligkeiten müssen dafür nach IndexedDB gespiegelt werden, weil der Service Worker localStorage nicht lesen kann. Größe: groß.
- **Schalter für Benachrichtigungen unter Mehr › Einstellungen** (von Chris, 16.09.2026). Je Art ein Schalter (Kartei fertig, Gießen, weitere). Gehört zum Gieß-Plan.
- **Frostwarnung und Sicherungserinnerung** (Vorschlag Claude, 16.09.2026). Frost über die Open-Meteo-Vorhersage und `frostMin` der Pflanzen draußen. Noch nicht von Chris gewünscht.
- **Kartei-Lauf im Hintergrund** (von Chris, 16.09.2026). Chris möchte eine Erlaubnis anfragen, damit der Lauf im Hintergrund weiterläuft.
  - Belegt: Eine Web-App hat unter Android keine Erlaubnis für Hintergrundausführung, die sie anfragen könnte.
  - Vermutet, nicht geprüft: Chrome drosselt oder friert die Seite ein, sobald sie nicht mehr im Vordergrund ist.
  - Machbar: Wake Lock („Bildschirm bleibt an, solange ein Lauf läuft“), gilt nur bei sichtbarer App.
  - Ungeklärt: ob Background Fetch POST-Anfragen an Gemini zulässt. Vor einem Plan prüfen.
- **Zeitlimit für `karteiBilder`** (16.09.2026). Belegt: Das Verkleinern des Fotos hat keine Frist. Vermutet: Es kann einen Lauf festhalten.
- **Statuszeile „Kartei auffrischen“ unter Mehr** (16.09.2026). Belegt: Ein angehaltener Lauf zeigt dort „Ergebnis liegt bereit“, weil nur `aktiv` abgefragt wird. Richtig wäre „Angehalten“.
- **Zahl „mit Lücken“ in der Kopfzeile** (16.09.2026). Die Kopfzeile zählt nur Pflanzen mit Lücken, das Kästchen „Nur mit Lücken“ zählt auch die ohne Foto. Die beiden Zahlen weichen voneinander ab.
- Weiter offen aus der Übergabe vom 15.09.:
  - Gießcenter „2 überfällig“ verschwindet beim Antippen. Braucht Screenshots vor und nach dem Antippen.
  - Fettkraut im Winter: eigener Zustand „Winterrosette“ für mexikanische Pinguicula.
  - Eigene Modellwahl für den Kartei-Lauf.
  - Weniger Meldungen auf den Reitern. Braucht einen Screenshot.
  - Gelöschte Pflanzen im Kartei-Zwischenlager: in E2 erledigen.
  - `geminiLesen` liefert `bot` statt `botanisch`. Die Zuordnung zu den Pflanzenfeldern gehört in E2.
  - Zeit für fünfzig Pflanzen messen.
  - Doktor bestimmt eine fehlende Sorte.
  - Alte Sorten aus dem botanischen Namen holen, als Vorschlag mit Knopf.
  - Foto nachtragen aus der Kartei heraus.
  - Ein Lauf über eine neue Fassung hinweg.

## Offene Regeländerungen
- Regel 10.10 (neu, siehe Antwort vom 15.09.2026) — noch nicht als eingetragen bestätigt.
- Formfehler in der Datei (16.09.2026): Nach 10.7 steht ein roher Änderungsblock, obwohl die Kopfzeile „Stand 2“ nennt. Regel 5.8 trägt das Präfix „Regel:“. Beides beim nächsten Eintragen bereinigen.
