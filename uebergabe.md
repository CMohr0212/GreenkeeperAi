Fassung 3.30.0 · sw.js greenkeeperai-v126 · 26.09.2026

## Kurz
Version: 3.30.0 (index.html), greenkeeperai-v126 (sw.js). pruef.js 2306/2306 grün, 18 Gegenproben schlagen wie erwartet fehl.
Nächster Schritt: Chris prüft 3.30.0 am Handy. Danach Aufräumen Sitzung 2 (Scrollfehler), Plan steht in PLAN.md.
Offen oder kaputt: Scrollfehler in der Sammlung. 3.30.0, 3.29.0 und 3.27.0 sind am Gerät unbestätigt.
Nicht anfassen: `giftEigenSetzen`, `fest`/`strittig`, `merkmale` (Bibliothek), `ABLEGER_ERBE`, `ANTWORT_FORMAT` wortgleich, `sorteGeprueft`, `einzeln`-Zeilen, Werkzeugschlüssel `vermehren`, `giessListe()`, `KLASSEN`-Texte, `muetter`/`mitImTopf` nur Zusatz. Neu: `datenVereinheitlichen()` läuft bei jedem Laden und muss idempotent bleiben.
Offener Plan: ja (PLAN.md). Sitzung 1 ist als 3.30.0 geliefert, offen sind die Sitzungen 2, 3 und 4.

## Gescheiterte Versuche
- Keine.

## Entscheidungen
- Kartei-Streifen: Variante (a), einklappbar zu einer Marke. Chris hat das so gewählt (26.09.).
- Der eingeklappte Zustand steht in `S.kartei.klein`. Er verschwindet mit dem Lauf und braucht deshalb kein eigenes Aufräumen.
- Die Kartei-Meldung wird in `KARTEI_MELD` gemerkt und nach jedem Neuzeichnen wieder gezeigt. Ein neuer Lauf leert sie. Grund: Das Schließen des Fensters über den Verlauf zeichnet erst nach der Meldung neu.
- „seit“ ohne bekanntes Datum bleibt leer statt geschätzt, weil ein erfundenes Datum die Kennzahl verfälscht.
- Aus „ca. 01.08.2026“ wird der 01.08.2026, das „ca.“ entfällt, weil das Feld nur Datumsangaben lesen kann.
- Eine Klammer im botanischen Namen bleibt nur bei „syn.“ stehen. Eine Sorte in Anführungszeichen wird nur entfernt, wenn sie gleich der eingetragenen Sorte ist, weil sie sonst verloren ginge.
- Die Bereinigung läuft bei jedem Laden mit statt einmal mit Marker, damit auch alte Sicherungen sauber ankommen. An Chris' Sicherung vom 26.09. geprüft: 6 botanische Namen und 50 „seit“-Werte geändert, sonst nichts, der zweite Lauf ändert nichts.
- Ursache der Klammernamen (belegt im Code): Die KI liefert „Epipremnum aureum (Efeutute)“, und `karteiSortenZusatz` bricht bei Klammern ab. Behoben in `geminiLesen` über `botKlammerWeg`.
- Mit angehakter Tierfrage hat der Anlegen-Auftrag 21 Felder, deshalb reicht `ZAHLWORT` jetzt bis 25.
- Die Kartei bietet den Düngebedarf auch dann an, wenn er der Bibliothek gleicht, sofern an der Pflanze nichts steht. Sonst bliebe die neue Lücke für immer offen.
- Gegenproben liefen gegen einen Auszug aus pruef.js (Kopf und 3.30.0-Block, 35 Prüfungen, 8 s) statt gegen die volle Datei. Grund: 18 Gegenproben mal 120 s hätten nicht in die Blöcke nach Regel 5.9 gepasst. Die volle Datei lief danach grün.

## Scrollfehler, Stand für Sitzung 2
- **Belegt aus dem Protokoll vom 26.09. (Screenshots):**
  - Rücksprünge gibt es nur in der Sammlung (Raster, Gruppierung „keine“ und „Stellplatz“), nie auf anderen Reitern.
  - Sprünge von 60 bis 1191 px, oft bis y=0.
  - Kein `scrollTo` und kein `scrollIntoView` als Auslöser. Das einzige `scrollTo` (index.html 3.29.0 Zeile 24895) ist der Reiterwechsel, und der ist gewollt.
  - Die Dokumenthöhe bleibt dabei gleich (10488).
- **Vermutet:** Die Sammlungsleiste (`.controls`, Handler um index.html 25140) schaltet beim Scrollen `fest`, `weg` und `klebt` um. Dabei wechseln Platzhalterhöhe (`#ctrl-platz`) und Innenabstand. Die Scroll-Verankerung von Chrome gleicht das aus, und so entsteht der Sprung.
- **Vermutet:** Ein Teil der Zeilen sind Fehlalarme. Das Protokoll zählt jeden Richtungswechsel des Fingers über 60 px als RUECKSPRUNG.
- **Nächster Schritt nach Regel 5.6, kein Fix auf Verdacht:** Das Protokoll um drei Dinge erweitern und neue Werte von Chris holen:
  - Klassenwechsel der Leiste (`fest`, `weg`, `klebt`)
  - Höhe von `#ctrl-platz` und der Leiste zum Zeitpunkt des Sprungs
  - ob ein Finger auf dem Bildschirm lag (touchstart/touchend)

## Backlog-Zuwachs
- **Aufgabenstau:** In Chris' Daten stehen 49 offene Aufgaben aus dem Anlegen, die meisten „diese Woche“ seit August. Prüfen, ob solche Aufgaben ablaufen sollen. Das ist eine Frage an Chris.
- **Löschreste** (für Sitzung 3 bestätigt): E-131 bis E-134 und E-152 haben noch Ereignisse, „gesehen“ und einen Umtopfplan (E-131).
- **Alte Intervall-Kopien** (für Sitzung 3 bestätigt): 40 Pflanzen tragen `intervall` ohne `intervallEigen`.
- **Unbenutzte Felder** in der Sicherung: `ansichtsart` ist in keiner Fassung mehr im Code.
- **Kartei, Zeile Düngebedarf:** Steht an der Pflanze nichts, zeigt „bisher“ den Bibliothekswert statt „leer“. Das ist nur eine Anzeigefrage.
- Aus 26.09. weiter offen:
  - Mischtopf: Steckbrief, Sonne und Frost folgen nur der Hauptart
  - Wintersatz „Sukkulente mit Sommerruhe“
  - Zustand „Steckling“ nach dem Eintopfen
  - Claude-Anbindung
  - Gerätekontrollen: Gießcenter „überfällig“, Fettkraut im Winter, 3.13.0–3.20.0
  - Liste aus der Übergabe vom 16.09.: Doktor-Auftrag kürzen, Wissen-Reiter per KI, Düngebedarf „Starkzehrer“, Kartei-Leiste über „Einstellungen“, Kartei-Lauf im Hintergrund, Gießerinnerung als Benachrichtigung, Fettkraut „Winterrosette“, eigene Modellwahl für die Kartei, weniger Meldungen auf den Reitern, Foto nachtragen aus der Kartei, Lauf über neue Fassung hinweg, Sammel-Anlegen, F, T
  - Browser-Dialoge durch App-Fenster ersetzen (48 Stellen)
- Risiko: Spätere Änderungen an einer Mutter wandern nicht zum Ableger nach. Das gilt für alle Mütter eines Mischtopfs.

## Offene Regeländerungen
- 1.2 (ersetzt, Stand 3, 23.09.2026): Zeilenzahl „rund 27.000 Zeilen“ gestrichen. index.html hat inzwischen rund 32.500 Zeilen.
- 10.8 (ersetzt, Stand 3, 23.09.2026): Ausnahme ergänzt — der Doktor schreibt Zustand und Befund ohne Knopf, weil beide in die Historie gehören.
- 10.10 (neu, 15.09.2026): Der Inhalt steht in keiner Übergabe. Chris prüft, ob er eingetragen ist.
- 10.11 (neu, Stand 3, 16.09.2026): „Kartei auffrischen“ prüft und ergänzt nur Angaben, die für die Art oder Sorte gelten und in der Pflanzenkarte stehen: Steckbriefdaten, Sorte und art- oder sortenspezifische Pflegetexte. Pflegeregeln, die für jede Zimmerpflanze gelten, schreibt die Kartei nie. Zustand, Befund, Topf, Topfart, Substrat, Abzugsloch und Maßnahmen fragt die Kartei nie ab und zeigt sie nie zur Übernahme an; sie gehören dem Doktor. Der Doktor zeigt keinen Abgleich von Steckbriefdaten.
- 10.12 (Vorschlag, 22.09.2026): KI-Aufträge nennen eine Pflanze nie beim Namen aus der Karte, nur mit Art, botanischem Namen und eingetragener Sorte. Eine Sorte wird nur mit sichtbarem Beleg angeboten; die Sicherheit legt der Code fest, nicht die KI.
- 10.13 (Vorschlag, 22.09.2026): Eine KI-Angabe, die von der Artenbibliothek abweicht oder eine vorhandene Sorte ersetzen würde, wird nie mit einem Sammelknopf übernommen, nur einzeln.
- 5.9 (neu, Stand 3, 16.09.2026): Gegenproben laufen je in einer Kopie unter /tmp/<n> (veränderte index.html, pruef.js, Verweis auf node_modules). Ein Befehl startet höchstens einen Block von drei Gegenproben mit `timeout 250`, weil ein Befehl nach 300 Sekunden abbricht. Die Datei im Arbeitsordner wird dabei nie verändert; danach `cmp` gegen die gesicherte Fassung. Tests, die auf eine Antwort warten, brauchen eine eigene Zeitgrenze, damit eine Gegenprobe fehlschlägt statt hängt. Ergänzung 22.09.: Ein Prüflauf dauert rund 106 s; die drei Gegenproben eines Blocks laufen deshalb gleichzeitig.
- 5.9, Ergänzung (Vorschlag, 26.09.2026): Gegenproben dürfen gegen einen Auszug aus pruef.js laufen (Kopf bis vor die erste Prüfung, der Block der Sitzung, Ergebniszeilen). Danach läuft die volle pruef.js einmal mit dem echten Stand.
- Formfehler in der Datei: Die Kopfzeile nennt „Stand 2“; 10.8 steht als roher Änderungsblock; 10.9 hat keine eigene Zeile; 5.8 hat das Präfix „Regel:“.
