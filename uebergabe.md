Fassung 3.21.0 · sw.js greenkeeperai-v116 · 16.09.2026

## Kurz
Version: 3.21.0 (index.html), greenkeeperai-v116 (sw.js). E2 umgesetzt: Kartei fragt nur Artdaten, Abgleich-Fenster je Pflanze, Doktor ohne Steckbrief-Abgleich. Am Handy noch unbestätigt.
Nächster Schritt: 3.21.0 am Handy prüfen (Fenster, Zurück-Geste, ein neuer Lauf mit echten Antworten). Danach Detailplan E3 (Pflegetexte durch die KI).
Offen oder kaputt: Lauf mit mehreren Pflanzen am Gerät unbestätigt (einer mit 1 Pflanze kam am 16.09. durch). Gießcenter „überfällig“ ungeprüft. Fettkraut im Winter. Gerätekontrollen 3.13.0–3.20.0 unbestätigt.
Nicht anfassen: Gift über `giftEigenSetzen` und `fest`/`strittig`. `merkmale` gehört der Bibliothek, die KI schreibt nur nach `sortenmerkmale`. `S.kartei` schreibt nie von selbst in eine Pflanze. Kartei fragt nur Artdaten (Regel 10.11, offen).
Offener Plan: ja (PLAN.md) — E2 erledigt, E3 und E4 im Zuschnitt, Detailplan fehlt.

## Gescheiterte Versuche
- Test „Ein leerer alter Wert heißt leer“ prüfte die Familie. Die Efeutute hat in der Bibliothek eine Familie, das Fenster zeigt diese als alten Wert. Der Test prüft jetzt den Wasserspeicher.
- Die erste Antwort dieser Sitzung brach nach dem Bauen am Werkzeug-Limit ab, bevor die Dateien übergeben waren. Der Container blieb bis zur nächsten Nachricht erhalten.

## Entscheidungen
- Zweck der Kartei (Chris, 16.09.): nur Artdaten aus der Pflanzenkarte; Zustand, Befund, Topf und Maßnahmen gehören dem Doktor.
- E2 vor E3 und E4, weil beide das Abgleich-Fenster brauchen.
- Zurück und × schließen das Fenster ohne Verlust, erst „Fertig — Rest verwerfen“ verwirft (A1), damit ein versehentliches Wischen keine bezahlten Antworten löscht.
- Ein Fehlschlag hält das Ergebnis offen, damit die Pflanze noch einmal geprüft werden kann.
- Leere Felder werden mit dem Bibliothekswert verglichen, weil die Karte diesen Wert anzeigt.
- Ein anderer deutscher Name bei gleichem botanischem Namen gilt nicht als andere Art, sonst entstünden Artzeilen ohne Unterschied.
- DUENGER nimmt nur nie/sparsam/normal, wie im Plan.
- Die Art-Übernahme liegt in `artUebernehmen`, die Gießart-Erkennung in `giessartLesen`. Der Doktor braucht die Art-Übernahme nicht mehr, das Anlegen ruft `giessartLesen` auf.
- „Noch einmal prüfen“ legt die übrigen Ergebnisse in `frueher` und führt sie am Ende zusammen. Wer den Nachlauf verwirft, behält das Ergebnis davor.

## Backlog-Zuwachs
- **E3 Pflegetexte durch die KI** und **E4 Sorte durch die KI** (von Chris, 16.09.2026). Zuschnitt steht in PLAN.md.
- **Doktor-Auftrag kürzen** (16.09.2026). Er fragt Steckbrief-Felder weiter ab, die er nicht mehr anzeigt.
- **Doktor schreibt Zustand und Befund-Notiz ohne Knopf** (16.09.2026). Belegt. Widerspricht Regel 10.8. Die Vermehrungswege sind mit 3.21.0 erledigt.
- **Wissen-Reiter per KI** (16.09.2026): Herkunft, Lebensumstände, „Wenn etwas nicht stimmt“, Beobachtungen. Nicht in E3.
- **Düngebedarf „Starkzehrer“** (16.09.2026). Die App kennt die Stufe `viel`, der Kartei-Auftrag erlaubt nur nie/sparsam/normal.
- **Kästchen in der Kartei-Ergebnisliste** erscheinen in Android-Blau statt in App-Farbe (Screenshot 16.09.2026).
- **Kartei-Leiste über der Zeile „Einstellungen“** unter Mehr (Screenshot 16.09.2026). Ob die Zeile erreichbar bleibt, ist nur am Handy prüfbar.
- **Kartei-Lauf im Hintergrund** (von Chris, 16.09.2026).
  - Belegt: Unter Android gibt es keine Hintergrund-Erlaubnis für Web-Apps.
  - Machbar: Wake Lock, solange die App sichtbar ist.
  - Ungeklärt: Background Fetch mit POST an Gemini.
- **Gießerinnerung als Benachrichtigung** (von Chris, 16.09.2026).
  - Nur über Periodic Background Sync, nur in der installierten App, höchstens etwa täglich.
  - Die Fälligkeiten müssen nach IndexedDB gespiegelt werden.
  - Größe: groß.
- **Schalter für Benachrichtigungen** unter Mehr › Einstellungen (von Chris, 16.09.2026). Gehört zum Gieß-Plan.
- **Frostwarnung und Sicherungserinnerung** (Vorschlag Claude, 16.09.2026). Noch nicht gewünscht.
- **Zeitlimit für `karteiBilder`** (16.09.2026). Das Verkleinern des Fotos hat keine Frist (belegt).
- **Statuszeile „Kartei auffrischen“ unter Mehr** (16.09.2026). Belegt (Screenshot): Während eines laufenden Laufs steht dort „Alles ausgefüllt“, ein angehaltener Lauf zeigt „Ergebnis liegt bereit“. Die Zeile wird beim Start nicht neu gezeichnet.
- **Zahl „mit Lücken“** in Kopfzeile und Kästchen weicht voneinander ab (16.09.2026).
- Weiter offen:
  - Gießcenter „überfällig“ verschwindet beim Antippen. Braucht Screenshots.
  - Fettkraut: Zustand „Winterrosette“.
  - Eigene Modellwahl für den Kartei-Lauf.
  - Weniger Meldungen auf den Reitern. Braucht einen Screenshot.
  - Zeit für fünfzig Pflanzen messen.
  - Alte Sorten aus dem botanischen Namen holen (geht in E4 auf).
  - Foto nachtragen aus der Kartei heraus.
  - Ein Lauf über eine neue Fassung hinweg.

## Offene Regeländerungen
- 10.10 (neu, Antwort vom 15.09.2026). Der Inhalt steht in keiner Übergabe. Chris prüft, ob er eingetragen ist.
- 10.11 (neu, Stand 3, 16.09.2026): „Kartei auffrischen“ prüft und ergänzt nur Angaben, die für die Art oder Sorte gelten und in der Pflanzenkarte stehen: Steckbriefdaten, Sorte und art- oder sortenspezifische Pflegetexte. Pflegeregeln, die für jede Zimmerpflanze gelten, schreibt die Kartei nie. Zustand, Befund, Topf, Topfart, Substrat, Abzugsloch und Maßnahmen fragt die Kartei nie ab und zeigt sie nie zur Übernahme an; sie gehören dem Doktor. Der Doktor zeigt keinen Abgleich von Steckbriefdaten.
- 5.9 (neu, Stand 3, 16.09.2026): Gegenproben laufen je in einer Kopie unter /tmp/<Name> (veränderte index.html, pruef.js, Verweis auf node_modules), höchstens drei gleichzeitig je Befehl mit `timeout 250`. Die Datei im Arbeitsordner wird dabei nie verändert; danach `cmp` gegen die gesicherte Fassung.
- Formfehler in der Datei: 10.8 steht als roher Änderungsblock, die Kopfzeile nennt „Stand 2“, 10.9 steht ohne eigene Zeile, 5.8 trägt das Präfix „Regel:“.
