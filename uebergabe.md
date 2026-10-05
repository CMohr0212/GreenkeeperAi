Fassung 3.31.0 · sw.js greenkeeperai-v127 · 05.10.2026

## Kurz
Version: 3.31.0 (index.html), greenkeeperai-v127 (sw.js). pruef.js 2348/2348 grün, 17 Gegenproben schlagen wie erwartet fehl. Bereinigung an Chris' Sicherung vom 26.09. geprüft.
Nächster Schritt: 3.31.0 hochladen und am Handy prüfen. Dann Phase 1 des Durchgangs (PLAN.md): Claude erstellt die Bestandsliste aller Bildschirme und Funktionen aus dem Code, Chris markiert „nutze ich / nie / wusste ich nicht“. Phase 0 (Leitbild, 8 Kernaufgaben) ist erledigt.
Offen oder kaputt: Scrollfehler in der Sammlung. „War staubtrocken“ verkürzt bei Kakteen den Rhythmus (Sitzung 6). 3.31.0, 3.30.0, 3.29.0 und 3.27.0 sind am Gerät unbestätigt.
Nicht anfassen: `giftEigenSetzen`, `fest`/`strittig`, `merkmale` und `merkmaleVon`, `ABLEGER_ERBE`, `ANTWORT_FORMAT` wortgleich, `sorteGeprueft`, `einzeln`-Zeilen, Werkzeugschlüssel `vermehren`, `giessListe()`, `KLASSEN`-Texte, `muetter`/`mitImTopf` nur Zusatz. `datenVereinheitlichen()` und `ballastBereinigen()` müssen idempotent bleiben. Der neueste PATCHNOTES-Eintrag mit `sicherung:true` darf beim Kürzen nicht wegfallen.
Offener Plan: ja (PLAN.md, Sitzungen 3 bis 10)

## Gescheiterte Versuche
- Keine.

## Entscheidungen
- Pflichtfenster (Chris, 27.09.): Es erscheint nur bei Fassungen, die Daten löschen. Diese Fassungen tragen im PATCHNOTES-Eintrag `sicherung:true`, damit die Kennung sichtbar an der Fassung steht.
- Die Bereinigung wartet auf die Sicherung (`S.bereinigtFassung`). So enthält die Sicherung garantiert den Stand davor.
- Das Fenster schließt, sobald der Download gestartet ist. Der Browser meldet nicht, ob die Datei angekommen ist.
- Nach dem ersten Fehlschlag gibt es „Noch einmal versuchen“, nach dem zweiten zusätzlich „Ohne Sicherung weiter“ (Chris, 27.09.). „Ohne Sicherung weiter“ bereinigt nicht, und das Fenster kommt beim nächsten Start wieder. Grund: kein Datenverlust ohne Sicherung.
- Jede heruntergeladene oder geteilte Sicherung, auch über Mehr, erfüllt die Pflicht, weil der Download den Stand vor der Bereinigung enthält.
- „Neu in Fassung …“ wartet, bis das Pflichtfenster zu ist, und solange es offen ist, öffnet sich kein anderes Fenster darüber, damit nichts darüberliegt.
- `S.idHoch` merkt sich die höchste je vergebene Nummer (bei Chris 153), damit nach dem Entfernen der Löschreste keine alte Kennung neu vergeben wird.
- Als Löschrest gilt nur eine Kennung `E-<Zahl>`, die keine Pflanze, Eltern- oder Mutterpflanze und keine Mutter einer Anzuchtgruppe ist. Gefäßkennungen (`az:`) bleiben unangetastet.
- Tote Funktionen mit Test (Chris, 27.09.): Die Funktionen und ihre Tests sind entfernt. Die beiden Tests zu `umtopfVorgemerkt` prüfen jetzt direkt `S.umtopfPlan`, damit die Abdeckung der Vormerkung bleibt.
- Die Patchnotes zeigen die letzten zehn Fassungen, darunter ein Link auf CHANGELOG.md im Repo (`blob/HEAD`) (Chris, 27.09.).
- Die 21 Grundwerte stehen mit `null` in `LEERSTAND()`, weil der Code jedes dieser Felder schon heute so liest, als fehle es.
- Mit entfernt: `imLicht`, das nur die gelöschte `sonnenstunden` benutzte, und der Handler `pflanze-weg`, zu dem es keinen Knopf gab.
- Prüfung an der Sicherung vom 26.09. (Fassung 3.29.0): Entfernt wurden `edits`, `weg` und `ansichtsart`, 40 Intervall-Kopien (Fetterik mit eigenem Rhythmus bleibt) sowie Ereignisse und „gesehen“ von E-131 bis E-134 und E-152 und der Umtopfplan von E-131. Dazu kommen die bekannten 3.30.0-Änderungen. Sonst ändert sich nichts, und ein zweiter Lauf ändert nichts mehr.

## Backlog-Zuwachs
- **Takt Durchgang** (Chris, 05.10.): etwa eine Stunde pro Woche. Die Sitzungen 4 bis 10 werden voraussichtlich ersetzt und bleiben als Infoquelle für Fehler und Ideen.
- **Durchgang durch die ganze App** (Chris, 05.10.): Die Aufräum-Sitzungen 3 bis 10 und der Umbau sind pausiert. Zuerst die ganze App von vorne nach hinten durchgehen und die Hindernisse finden. Phasen 0 bis 5 stehen in PLAN.md. Organisiert in Todoist unter „🛠️ Praxis-Projekte“, Bereich „🌱 GreenkeeperAI“.
- **Fotosession statt Rundgang** (Chris, 05.10.): Er schaut seine Pflanzen meist ohne Handy an. Wenn, dann eine Runde nur zum Fotografieren.
- **Neuausrichtung: Doktor als Zentrale** (Chris, 05.10.): „die App ist einfach zu viel“. Bestand, Einschätzung, Vorschlag mit 3 Reitern (Heute, Sammlung, Helfer), Einstellungen statt Mehr, Rundgang raus, Folgen für die Sitzungen 3 bis 10 und offene Fragen A bis D stehen in PLAN.md.
- **Weitere Löschreste:** Beim Löschen bleiben `dueng`, `duengLangzeit`, `feuchtRueck` und `profil` der Pflanze stehen. Das lag außerhalb des Plans (Kandidat für eine spätere Aufräum-Sitzung).
- **Weitere tote Aufrufe:** Möglich sind weitere `typeof X === 'function'`-Prüfungen auf Funktionen, die es nicht gibt. Nur der beim Dichte-Umschalter ist entfernt.
- Aus der Übergabe vom 27.09. weiter offen:
  - Gießmodus (Sitzung 6): Übersicht, Standort-Reihenfolge, Knöpfe je Gießgruppe. Karnivoren sprechen vom Untersetzer.
  - Wintermodus (Sitzung 6): Frage im Herbst und im Frühjahr, sichtbarer Knopf in der Karte, Wintersatz „Fettkraut Winterrosette“.
  - Einstellungen (Sitzung 5): kein Grundstil für Felder, Listen, Häkchen und Knöpfe. Nächster Schritt: Vorschau.html.
  - Rundgang (Sitzungen 7 und 8): Bereich wählen, Umstellen pflegen, Monatsüberblick, KI-Kurzcheck.
  - Kartei (Sitzung 4): Teilergebnisse durchsehen, `karteiAm` und Auftragskennung, nichts sperren.
  - Heute, „Nachfrage fällig“ (Sitzung 3): ausklappbar oder eigenes Fenster, mit Foto. Screenshot nötig.
  - Anzucht in der Sammlung (nach dem Aufräumen).
  - Scrollfehler (Sitzung 9): Protokoll um die Klassenwechsel der Leiste, die Höhe von `#ctrl-platz`, die Höhe der Leiste und touchstart/touchend erweitern und neue Werte holen (Regel 5.6).
  - Aufgabenstau: 49 offene Aufgaben aus dem Anlegen. Frage an Chris: Sollen sie ablaufen?
  - Kartei, Zeile Düngebedarf: „bisher“ zeigt den Bibliothekswert statt „leer“.
  - Mischtopf-Steckbrief, Wintersatz „Sukkulente mit Sommerruhe“, Zustand „Steckling“ nach dem Eintopfen, Claude-Anbindung, Browser-Dialoge durch App-Fenster ersetzen (48 Stellen), Gerätekontrollen, Punkte aus der Übergabe vom 16.09., Sammel-Anlegen, F, T.
- Risiko: Spätere Änderungen an einer Mutter wandern nicht zum Ableger nach. Das gilt für alle Mütter eines Mischtopfs.

## Offene Regeländerungen
- 4.2 (ersetzt, Stand 3, 27.09.2026): Wünsche außerhalb des Plans landen direkt in uebergabe.md oder PLAN.md, nie als Zeile zum Kopieren.
- 1.2 (ersetzt, Stand 3, 23.09.2026): Die Zeilenzahl „rund 27.000 Zeilen“ ist gestrichen. index.html hat inzwischen rund 31.000 Zeilen.
- 10.8 (ersetzt, Stand 3, 23.09.2026): Ausnahme ergänzt — der Doktor schreibt Zustand und Befund ohne Knopf, weil beide in die Historie gehören.
- 10.10 (neu, 15.09.2026): Der Inhalt steht in keiner Übergabe. Chris prüft, ob er eingetragen ist.
- 10.11 (neu, Stand 3, 16.09.2026): „Kartei auffrischen“ prüft und ergänzt nur Angaben, die für die Art oder Sorte gelten und in der Pflanzenkarte stehen: Steckbriefdaten, Sorte und art- oder sortenspezifische Pflegetexte. Pflegeregeln, die für jede Zimmerpflanze gelten, schreibt die Kartei nie. Zustand, Befund, Topf, Topfart, Substrat, Abzugsloch und Maßnahmen fragt die Kartei nie ab und zeigt sie nie zur Übernahme an; sie gehören dem Doktor. Der Doktor zeigt keinen Abgleich von Steckbriefdaten.
- 10.12 (Vorschlag, 22.09.2026): KI-Aufträge nennen eine Pflanze nie beim Namen aus der Karte, nur mit Art, botanischem Namen und eingetragener Sorte. Eine Sorte wird nur mit sichtbarem Beleg angeboten; die Sicherheit legt der Code fest, nicht die KI.
- 10.13 (Vorschlag, 22.09.2026): Eine KI-Angabe, die von der Artenbibliothek abweicht oder eine vorhandene Sorte ersetzen würde, wird nie mit einem Sammelknopf übernommen, nur einzeln.
- 5.9 (neu, Stand 3, 16.09.2026): Gegenproben laufen je in einer Kopie unter /tmp/<n> (veränderte index.html, pruef.js, Verweis auf node_modules). Ein Befehl startet höchstens einen Block von drei Gegenproben mit `timeout 250`, weil ein Befehl nach 300 Sekunden abbricht. Die Datei im Arbeitsordner wird dabei nie verändert; danach `cmp` gegen die gesicherte Fassung. Tests, die auf eine Antwort warten, brauchen eine eigene Zeitgrenze, damit eine Gegenprobe fehlschlägt statt hängt. Ergänzung 22.09.: Ein Prüflauf dauert rund 106 s; die drei Gegenproben eines Blocks laufen deshalb gleichzeitig.
- 5.9, Ergänzung (Vorschlag, 26.09.2026): Gegenproben dürfen gegen einen Auszug aus pruef.js laufen (Kopf bis vor die erste Prüfung, der Block der Sitzung, Ergebniszeilen). Danach läuft die volle pruef.js einmal mit dem echten Stand. Am 27.09. erneut so verfahren: ein Auszug läuft in 8 s.
- Formfehler in der Datei: Die Kopfzeile nennt „Stand 2“; 10.8 steht als roher Änderungsblock; 10.9 hat keine eigene Zeile; 5.8 hat das Präfix „Regel:“.
