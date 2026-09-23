Fassung 3.28.0 · sw.js greenkeeperai-v123 · 22.09.2026

## Kurz
Version: 3.28.0 (index.html), greenkeeperai-v123 (sw.js) — Anzucht gebaut, am Gerät unbestätigt.
Nächster Schritt: Chris prüft 3.28.0 am Handy; danach Plan 3.29.0 (KI-Bestimmung, Mischtopf) zur Freigabe.
Offen oder kaputt: 3.28.0 und 3.27.0 am Gerät unbestätigt; vier alte rote Tests („Fokus“ wackelt); Statuszeile unter Mehr.
Nicht anfassen: `giftEigenSetzen`, `fest`/`strittig`, `merkmale` (Bibliothek), `ABLEGER_ERBE`, `ANTWORT_FORMAT` wortgleich, `sorteGeprueft`, `einzeln`-Zeilen, Werkzeugschlüssel `vermehren`, `giessListe()` bleibt reine Pflanzenliste.
Offener Plan: ja (PLAN.md) — 3.29.0 nicht freigegeben, danach Aufräumen.

## Gescheiterte Versuche
- Erster Bauanlauf am 22.09. brach nach der Code-Sichtung ab, ohne Codeänderung. Ursache vermutet: Länge der Antwort, nicht belegt.
- Sitzungsstart verfehlt: kein STAND-Block (Regel 2.3), fehlende Dateien nicht per curl geholt (Regel 2.1).
- Test „Gefäße sind keine Pflanzen“ schlug zuerst fehl: das Suchmuster `^AZ` traf die Test-Mutter „AZT-M“. Jetzt `^AZ[GBR]-`.

## Entscheidungen
- Weitergebaut trotz „Kontext reicht: nein“, weil Chris „Leg los“ schrieb (Regel 0.2 für diese Sitzung).
- Eingetopfte Stecklinge mit Mutter laufen über `ablegerAnlegen` und bekommen dort wie bisher den Zustand „Steckling“ samt Bewurzelungsfrist, weil der Plan „wie bisher“ sagt.
- Eingetopfte Stecklinge ohne Mutter bekommen Gießklasse B und keinen Zustand, weil keine Mutter zum Erben da ist; die Kartei ergänzt den Rest.
- Ein neuer Bereich hat den Rhythmus vorgabemäßig an (10 Tage), weil Z2 das Anzuchthaus im Gießplan will.
- Beim Auflösen eines Gefäßes werden seine Fotos nach Rückfrage mit gelöscht, weil sie sonst ohne Besitzer im Speicher blieben.
- Abweichung vom Plan, nachträglich zur Entscheidung: „Bereich auflösen“ (Gefäße bleiben ohne Bereich) ist dazugekommen; steht nicht im Plan.
- Gefäßfotos liegen in `S.fotos` unter der Gefäßkennung, damit Sicherung und Fotospeicher sie ohne Sonderweg mitnehmen.

## Backlog-Zuwachs
- **Aufräumen nach der Anzucht** (Chris, 22.09.): Umfang gemeinsam festlegen. Dazu die vier roten Tests („Der Anstau bekommt keine Fingerprobe“, „Die Bromelie wird im Trichter gegossen“, „Der Kaktus wird gewogen“, „Fokus kehrt zum Auslöser zurück“; vermutet datumsabhängig) und die Statuszeile „Kartei auffrischen“ unter Mehr (braucht Screenshot).
- **Widerspruch Regel 5.1:** „nur bei 0 Fehlschlägen“, geliefert wird seit 3.24.0 mit den vier alten roten Tests. Chris entscheidet: Regel anpassen oder die vier zuerst beheben.
- **Zustand „Steckling“ nach dem Eintopfen:** bewurzelte Stecklinge bekommen noch eine Bewurzelungsfrist. Klären, ob stattdessen „frisch umgetopft“ oder gar kein Zustand gelten soll.
- **Meldung nach der letzten Übernahme geht ins Leere** (belegt, Test): `karteiMeldung` schreibt in `#kartei-meld`, das die Ergebnisansicht nicht hat.
- **Alte Werte uneinheitlich:** Wuchsform „Kraut, panaschiert“, Vermehrung „Blattsteckling; TEILUNG“.
- **Claude-Anbindung** (zurückgestellt): `KI_ANBIETER` kennt Anthropic mit `kann:false`; `kiFragen` fest auf Google.
- Gerätekontrollen offen: Gießcenter „überfällig“, Fettkraut im Winter, 3.13.0–3.20.0.
- Aus der Übergabe vom 16.09. weiter offen: Doktor-Auftrag kürzen; Doktor schreibt Zustand und Befund ohne Knopf (widerspricht 10.8); Wissen-Reiter per KI; Düngebedarf „Starkzehrer“; Kartei-Leiste über „Einstellungen“; Kartei-Lauf im Hintergrund; Gießerinnerung als Benachrichtigung; Fettkraut „Winterrosette“; eigene Modellwahl für die Kartei; weniger Meldungen auf den Reitern; Foto nachtragen aus der Kartei; Lauf über neue Fassung hinweg; Sammel-Anlegen, F, T.
- Risiko: Spätere Änderungen an einer Mutter wandern nicht zum Ableger nach.

## Offene Regeländerungen
- 10.10 (neu, 15.09.2026): Inhalt steht in keiner Übergabe. Chris prüft, ob eingetragen.
- 10.11 (neu, Stand 3, 16.09.2026): „Kartei auffrischen“ prüft und ergänzt nur Angaben, die für die Art oder Sorte gelten und in der Pflanzenkarte stehen: Steckbriefdaten, Sorte und art- oder sortenspezifische Pflegetexte. Pflegeregeln, die für jede Zimmerpflanze gelten, schreibt die Kartei nie. Zustand, Befund, Topf, Topfart, Substrat, Abzugsloch und Maßnahmen fragt die Kartei nie ab und zeigt sie nie zur Übernahme an; sie gehören dem Doktor. Der Doktor zeigt keinen Abgleich von Steckbriefdaten.
- 10.12 (Vorschlag, 22.09.2026): KI-Aufträge nennen eine Pflanze nie beim Namen aus der Karte, nur mit Art, botanischem Namen und eingetragener Sorte. Eine Sorte wird nur mit sichtbarem Beleg angeboten; die Sicherheit legt der Code fest, nicht die KI.
- 10.13 (Vorschlag, 22.09.2026): Eine KI-Angabe, die von der Artenbibliothek abweicht oder eine vorhandene Sorte ersetzen würde, wird nie mit einem Sammelknopf übernommen, nur einzeln.
- 5.9 (neu, Stand 3, 16.09.2026): Gegenproben laufen je in einer Kopie unter /tmp/<n> (veränderte index.html, pruef.js, Verweis auf node_modules). Ein Befehl startet höchstens einen Block von drei Gegenproben mit `timeout 250`, weil ein Befehl nach 300 Sekunden abbricht. Die Datei im Arbeitsordner wird dabei nie verändert; danach `cmp` gegen die gesicherte Fassung. Tests, die auf eine Antwort warten, brauchen eine eigene Zeitgrenze, damit eine Gegenprobe fehlschlägt statt hängt. Ergänzung 22.09.: Ein Prüflauf dauert rund 106 s; die drei Gegenproben eines Blocks laufen deshalb gleichzeitig.
- Formfehler in der Datei: Kopfzeile nennt „Stand 2“; 10.8 steht als roher Änderungsblock; 10.9 ohne eigene Zeile; 5.8 mit Präfix „Regel:“.
