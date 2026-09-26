Fassung 3.28.1 · sw.js greenkeeperai-v124 · 23.09.2026

## Kurz
Version: 3.28.1 (index.html), greenkeeperai-v124 (sw.js) — pruef.js 2203/2203 grün, auch mit Datum Januar und Juli.
Nächster Schritt: Chris prüft 3.28.0 (Anzucht) und 3.28.1 am Handy; danach Plan 3.29.0 (KI-Bestimmung, Mischtopf) zur Freigabe.
Offen oder kaputt: 3.28.0, 3.28.1 und 3.27.0 am Gerät unbestätigt; Statuszeile „Kartei auffrischen“ unter Mehr (Screenshot nötig).
Nicht anfassen: `giftEigenSetzen`, `fest`/`strittig`, `merkmale` (Bibliothek), `ABLEGER_ERBE`, `ANTWORT_FORMAT` wortgleich, `sorteGeprueft`, `einzeln`-Zeilen, Werkzeugschlüssel `vermehren`, `giessListe()` bleibt reine Pflanzenliste, `KLASSEN`-Texte.
Offener Plan: ja (PLAN.md) — 3.29.0 nicht freigegeben, danach Aufräumen.

## Gescheiterte Versuche
- Keine in dieser Sitzung.

## Entscheidungen
- Wintersatz der Gruppe vor dem der Klasse, weil der Klassensatz Bromelie und Kaktus den passenden Hinweis nahm.
- Moorbeet, Laub, Dünnblättrige, Hartlaub ohne eigenen Wintersatz, weil der Klassensatz dort stimmt.
- „Sukkulente mit Sommerruhe“ ohne Wintersatz, weil das umgekehrte Jahr einen eigenen Fall braucht.
- Fokus-Fehler in der App behoben statt im Test: `_modalFokus` fokussierte verzögert auch nach dem Schließen (belegt durch Messung und Code).
- Düngetests setzen die Winterpause selbst aus, statt das Datum zu fälschen, weil sie sonst von Mitte Oktober bis März rot laufen.
- „Bereich auflösen“ (3.28.0) nachträglich freigegeben (Chris, 23.09.).
- Doktor schreibt Zustand und Befund ohne Knopf (Chris, 23.09.), siehe Regeländerung 10.8.

## Backlog-Zuwachs
- **Wintersatz „Sukkulente mit Sommerruhe“** (Lithops, Conophytum): im Winter gilt noch der Klassensatz. Fachlich klären.
- **Aufräumen nach der Anzucht** (Chris, 22.09.): Umfang gemeinsam festlegen. Dazu die Statuszeile „Kartei auffrischen“ unter Mehr (braucht Screenshot).
- **Zustand „Steckling“ nach dem Eintopfen:** bewurzelte Stecklinge bekommen noch eine Bewurzelungsfrist. Klären, ob stattdessen „frisch umgetopft“ oder gar kein Zustand gelten soll.
- **Meldung nach der letzten Übernahme geht ins Leere** (belegt, Test): `karteiMeldung` schreibt in `#kartei-meld`, das die Ergebnisansicht nicht hat.
- **Alte Werte uneinheitlich:** Wuchsform „Kraut, panaschiert“, Vermehrung „Blattsteckling; TEILUNG“.
- **Claude-Anbindung** (zurückgestellt): `KI_ANBIETER` kennt Anthropic mit `kann:false`; `kiFragen` fest auf Google.
- Gerätekontrollen offen: Gießcenter „überfällig“, Fettkraut im Winter, 3.13.0–3.20.0.
- Aus der Übergabe vom 16.09. weiter offen: Doktor-Auftrag kürzen; Wissen-Reiter per KI; Düngebedarf „Starkzehrer“; Kartei-Leiste über „Einstellungen“; Kartei-Lauf im Hintergrund; Gießerinnerung als Benachrichtigung; Fettkraut „Winterrosette“; eigene Modellwahl für die Kartei; weniger Meldungen auf den Reitern; Foto nachtragen aus der Kartei; Lauf über neue Fassung hinweg; Sammel-Anlegen, F, T.
- Risiko: Spätere Änderungen an einer Mutter wandern nicht zum Ableger nach.

## Offene Regeländerungen
- 1.2 (ersetzt, Stand 3, 23.09.2026): Zeilenzahl „rund 27.000 Zeilen“ gestrichen.
- 10.8 (ersetzt, Stand 3, 23.09.2026): Ausnahme ergänzt — der Doktor schreibt Zustand und Befund ohne Knopf, weil beide in die Historie gehören.
- 10.10 (neu, 15.09.2026): Inhalt steht in keiner Übergabe. Chris prüft, ob eingetragen.
- 10.11 (neu, Stand 3, 16.09.2026): „Kartei auffrischen“ prüft und ergänzt nur Angaben, die für die Art oder Sorte gelten und in der Pflanzenkarte stehen: Steckbriefdaten, Sorte und art- oder sortenspezifische Pflegetexte. Pflegeregeln, die für jede Zimmerpflanze gelten, schreibt die Kartei nie. Zustand, Befund, Topf, Topfart, Substrat, Abzugsloch und Maßnahmen fragt die Kartei nie ab und zeigt sie nie zur Übernahme an; sie gehören dem Doktor. Der Doktor zeigt keinen Abgleich von Steckbriefdaten.
- 10.12 (Vorschlag, 22.09.2026): KI-Aufträge nennen eine Pflanze nie beim Namen aus der Karte, nur mit Art, botanischem Namen und eingetragener Sorte. Eine Sorte wird nur mit sichtbarem Beleg angeboten; die Sicherheit legt der Code fest, nicht die KI.
- 10.13 (Vorschlag, 22.09.2026): Eine KI-Angabe, die von der Artenbibliothek abweicht oder eine vorhandene Sorte ersetzen würde, wird nie mit einem Sammelknopf übernommen, nur einzeln.
- 5.9 (neu, Stand 3, 16.09.2026): Gegenproben laufen je in einer Kopie unter /tmp/<n> (veränderte index.html, pruef.js, Verweis auf node_modules). Ein Befehl startet höchstens einen Block von drei Gegenproben mit `timeout 250`, weil ein Befehl nach 300 Sekunden abbricht. Die Datei im Arbeitsordner wird dabei nie verändert; danach `cmp` gegen die gesicherte Fassung. Tests, die auf eine Antwort warten, brauchen eine eigene Zeitgrenze, damit eine Gegenprobe fehlschlägt statt hängt. Ergänzung 22.09.: Ein Prüflauf dauert rund 106 s; die drei Gegenproben eines Blocks laufen deshalb gleichzeitig.
- Formfehler in der Datei: Kopfzeile nennt „Stand 2“; 10.8 steht als roher Änderungsblock; 10.9 ohne eigene Zeile; 5.8 mit Präfix „Regel:“.
