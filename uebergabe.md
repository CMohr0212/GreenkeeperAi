Fassung 3.29.0 · sw.js greenkeeperai-v125 · 26.09.2026

## Kurz
Version: 3.29.0 (index.html), greenkeeperai-v125 (sw.js). pruef.js 2271/2271 grün, 7 Gegenproben schlagen wie erwartet fehl.
Nächster Schritt: Chris prüft 3.29.0 am Handy (Mischtopf, Bestimmen, Bearbeiten, Wege-Kacheln). Danach Umfang für „Aufräumen“ gemeinsam festlegen.
Offen oder kaputt: 3.29.0 und 3.27.0 am Gerät unbestätigt. Statuszeile „Kartei auffrischen“ unter Mehr (Screenshot nötig).
Nicht anfassen: `giftEigenSetzen`, `fest`/`strittig`, `merkmale` (Bibliothek), `ABLEGER_ERBE`, `ANTWORT_FORMAT` wortgleich, `sorteGeprueft`, `einzeln`-Zeilen, Werkzeugschlüssel `vermehren`, `giessListe()` bleibt reine Pflanzenliste, `KLASSEN`-Texte. Neu: `muetter`/`mitImTopf` sind nur Zusatz, `eltern` bleibt die Hauptmutter.
Offener Plan: ja (PLAN.md). 3.29.0 ist geliefert, danach kommt Aufräumen.

## Gescheiterte Versuche
- Keine.

## Entscheidungen
- Anzucht Teil 2 und die vier Funde laufen auf Chris' Wunsch in einer Fassung, obwohl die Größe „groß“ ist (Chris, 26.09.).
- Mischtopf erlaubt verschiedene Arten. Gegossen wird nach der trockensten Mutter (S → A → B → C), weil Chris das so festgelegt hat (26.09.).
- Klassen passen zusammen, wenn sie gleich oder benachbart sind. S passt nur mit S. Sonst erscheint ein Hinweis, gesperrt wird nicht, weil Chris den Hinweis wollte, keine Sperre.
- Gruppen ohne Mutter zählen beim Gießen nicht, weil ihre Klasse unbekannt ist.
- Gifthinweis im Mischtopf ist nur eine Anzeige. Der Giftwert der Karte bleibt der der Hauptmutter, weil die Giftlogik nicht angefasst werden darf.
- Gibt es eine KI-Auskunft, zeigen die Wege-Kacheln nur deren Wege. Regelwege entfallen dann, weil sich oben und unten sonst widersprachen.
- „Bearbeiten“ schreibt keinen Verlaufseintrag und legt Gruppen gleicher Herkunft zusammen. Grund: Es ist eine Korrektur, kein Ereignis.
- „Per Foto bestimmen“ legt Gruppen nicht zusammen. Grund: Eine Bestimmung soll nichts ungefragt verschmelzen.
- Wege ohne Katalogplatz (z. B. „Blattsegment“) bekommen eine eigene Kachel ohne Anleitung. Die Angaben dazu liegen nur im Speicher der Sitzung (`VER_KI_METHODEN`). Nach dem Neuladen fällt das Eintopfen solcher Gruppen auf den Kopfsteckling zurück.

## Backlog-Zuwachs
- **Zählwort im Auftrag falsch** (belegt, 26.09.): `promptZahlSetzen` zählt Feldnamen mit Unterstrich nicht (SORTE_BELEG, SORTEN_VERWECHSLUNG). Anlegen- und Kartei-Auftrag nennen deshalb zu wenige Schlüsselwörter. Im Bestimmen-Auftrag ist das lokal korrigiert. Zum Aufräumen.
- **Mischtopf:** Steckbrief, Sonne und Frost folgen nur der Hauptart. Prüfen, ob das bei stark verschiedenen Arten reicht.
- **Knopf „Bestimmen“ ohne Foto:** Er ist gesperrt, sieht aber nicht grau aus. Zum Aufräumen, am Handy prüfen.
- Aus 23.09. weiter offen:
  - Wintersatz „Sukkulente mit Sommerruhe“
  - Zustand „Steckling“ nach dem Eintopfen
  - Meldung nach der letzten Kartei-Übernahme geht ins Leere (`#kartei-meld`)
  - Alte uneinheitliche Werte
  - Claude-Anbindung
  - Gerätekontrollen: Gießcenter „überfällig“, Fettkraut im Winter, 3.13.0–3.20.0
  - Aus der Übergabe vom 16.09.: Doktor-Auftrag kürzen, Wissen-Reiter per KI, Düngebedarf „Starkzehrer“, Kartei-Leiste über „Einstellungen“, Kartei-Lauf im Hintergrund, Gießerinnerung als Benachrichtigung, Fettkraut „Winterrosette“, eigene Modellwahl für die Kartei, weniger Meldungen auf den Reitern, Foto nachtragen aus der Kartei, Lauf über neue Fassung hinweg, Sammel-Anlegen, F, T
- Risiko: Spätere Änderungen an einer Mutter wandern nicht zum Ableger nach. Das gilt jetzt für alle Mütter eines Mischtopfs.

## Offene Regeländerungen
- 1.2 (ersetzt, Stand 3, 23.09.2026): Zeilenzahl „rund 27.000 Zeilen“ gestrichen (index.html hat inzwischen rund 32.000).
- 10.8 (ersetzt, Stand 3, 23.09.2026): Ausnahme ergänzt — der Doktor schreibt Zustand und Befund ohne Knopf, weil beide in die Historie gehören.
- 10.10 (neu, 15.09.2026): Inhalt steht in keiner Übergabe. Chris prüft, ob eingetragen.
- 10.11 (neu, Stand 3, 16.09.2026): „Kartei auffrischen“ prüft und ergänzt nur Angaben, die für die Art oder Sorte gelten und in der Pflanzenkarte stehen: Steckbriefdaten, Sorte und art- oder sortenspezifische Pflegetexte. Pflegeregeln, die für jede Zimmerpflanze gelten, schreibt die Kartei nie. Zustand, Befund, Topf, Topfart, Substrat, Abzugsloch und Maßnahmen fragt die Kartei nie ab und zeigt sie nie zur Übernahme an; sie gehören dem Doktor. Der Doktor zeigt keinen Abgleich von Steckbriefdaten.
- 10.12 (Vorschlag, 22.09.2026): KI-Aufträge nennen eine Pflanze nie beim Namen aus der Karte, nur mit Art, botanischem Namen und eingetragener Sorte. Eine Sorte wird nur mit sichtbarem Beleg angeboten; die Sicherheit legt der Code fest, nicht die KI.
- 10.13 (Vorschlag, 22.09.2026): Eine KI-Angabe, die von der Artenbibliothek abweicht oder eine vorhandene Sorte ersetzen würde, wird nie mit einem Sammelknopf übernommen, nur einzeln.
- 5.9 (neu, Stand 3, 16.09.2026): Gegenproben laufen je in einer Kopie unter /tmp/<n> (veränderte index.html, pruef.js, Verweis auf node_modules). Ein Befehl startet höchstens einen Block von drei Gegenproben mit `timeout 250`, weil ein Befehl nach 300 Sekunden abbricht. Die Datei im Arbeitsordner wird dabei nie verändert; danach `cmp` gegen die gesicherte Fassung. Tests, die auf eine Antwort warten, brauchen eine eigene Zeitgrenze, damit eine Gegenprobe fehlschlägt statt hängt. Ergänzung 22.09.: Ein Prüflauf dauert rund 106 s; die drei Gegenproben eines Blocks laufen deshalb gleichzeitig.
- Formfehler in der Datei: Kopfzeile nennt „Stand 2“; 10.8 steht als roher Änderungsblock; 10.9 ohne eigene Zeile; 5.8 mit Präfix „Regel:“.
