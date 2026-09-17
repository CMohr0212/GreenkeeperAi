Fassung 3.23.0 · sw.js greenkeeperai-v118 · 16.09.2026

## Kurz
Version: 3.23.0 (index.html), greenkeeperai-v118 (sw.js). E4 und K geliefert: Sorte durch die KI im Anlegen und in der Kartei, Sorte aus dem botanischen Namen, Balken mit Vorlauf, Ergebnisliste mit „Durchsehen ›“ und Kästchen erst nach „Noch einmal prüfen“.
Nächster Schritt: 3.23.0 am Handy prüfen (Liste im Chat vom 16.09.). Danach Plan E3 (Pflegetexte durch die KI), Zielversion 3.24.0.
Offen oder kaputt: 3.23.0 nicht am Gerät geprüft. Lauf mit mehreren Pflanzen weiter unbestätigt. Gießcenter „überfällig“, Fettkraut im Winter, Gerätekontrollen 3.13.0–3.20.0.
Nicht anfassen: Gift über `giftEigenSetzen` und `fest`/`strittig`. `merkmale` gehört der Bibliothek. `S.kartei` schreibt nie von selbst in eine Pflanze. Kartei fragt nur Artdaten. `ABLEGER_ERBE` ist die einzige Liste der erbbaren Felder. Der Doktor-Auftrag (`ANTWORT_FORMAT`) fragt keine SORTE.
Offener Plan: ja (PLAN.md) — E4 + K dort erledigt mit 3.23.0, E3 im Zuschnitt, Detailplan E3 fehlt.

## Gescheiterte Versuche
- Die erste Antwort nach der Freigabe brach vor dem Pflichtpaket ab. Ursache (belegt): Drei Blöcke Gegenproben in einem einzigen Befehl überschritten die 300 Sekunden je Befehl. Der Container blieb erhalten, gebaut wurde danach aus den gesicherten Dateien unter /tmp weiter.
- Gegenprobe „Sorte aus dem botanischen Namen“ ließ pruef.js abstürzen statt nur fehlzuschlagen. Die Tests greifen jetzt abgesichert zu.
- Gegenprobe zur Reihenfolge beim Sammelübernehmen schlug zuerst nicht fehl, weil die Art-Zeile ohnehin vorne steht. Der Test prüft jetzt Art, Sorte, Licht.

## Entscheidungen
- K kam mit in 3.23.0 („mit rein“, Chris), die Vorschau entfiel (Chris), deshalb rückt E3 auf 3.24.0.
- C1 bis C5 und D1 bis D3 gelten wie im Plan, weil Chris keinen Einwand hatte.
- Eine SORTE-Zeile ohne Sicherheit gilt als „niedrig“, damit nichts ungeprüft vorbelegt wird.
- Die Sorte steht nicht in `Q_FELDER`. Sie bekommt einen Stempel nur mit ausdrücklicher Herkunft; ohne Angabe fällt ein KI-Stempel weg, damit eine von Hand geänderte Sorte als eigene gilt.
- Ableger erben den Sortenstempel (Chris, 16.09.), damit eine geerbte KI-Sorte nicht als „von dir gesetzt“ erscheint.
- Die Prozentzahl in der Leiste entfiel, weil sie nicht mehr zum vorlaufenden Balken passte.

## Backlog-Zuwachs
- **Anlegen übernimmt einen längeren botanischen Namen der KI samt Zusatz.** Belegt (Code): `d.bot.length > treffer.bot.length` setzt `#f-bot` auf den KI-Namen. So kam „Brasil“ in den botanischen Namen. Der neue Auftrag verbietet den Sortennamen dort, der Code prüft es nicht.
- **Hängende Anfrage:** Der Balken steht dann lange bei 85 %.
- Aus der Übergabe vom 16.09. weiter offen:
  - Doktor-Auftrag kürzen.
  - Doktor schreibt Zustand und Befund-Notiz ohne Knopf, widerspricht Regel 10.8.
  - Wissen-Reiter per KI.
  - Düngebedarf „Starkzehrer“ (`viel`).
  - Kartei-Leiste über der Zeile „Einstellungen“.
  - Kartei-Lauf im Hintergrund (Wake Lock machbar, Background Fetch ungeklärt).
  - Gießerinnerung als Benachrichtigung (groß) samt Schalter unter Mehr › Einstellungen.
  - Frostwarnung und Sicherungserinnerung (Vorschlag, nicht gewünscht).
  - Zeitlimit für `karteiBilder`.
  - Statuszeile „Kartei auffrischen“ unter Mehr wird beim Start nicht neu gezeichnet.
  - Gießcenter „überfällig“ (braucht Screenshots).
  - Fettkraut „Winterrosette“.
  - Eigene Modellwahl für den Kartei-Lauf.
  - Weniger Meldungen auf den Reitern (braucht Screenshot).
  - Zeit für fünfzig Pflanzen messen.
  - Foto nachtragen aus der Kartei.
  - Ein Lauf über eine neue Fassung hinweg.
- Risiko: Spätere Änderungen an einer Mutter wandern nicht zum Ableger nach.

## Offene Regeländerungen
- 10.10 (neu, Antwort vom 15.09.2026). Der Inhalt steht in keiner Übergabe. Chris prüft, ob er eingetragen ist.
- 10.11 (neu, Stand 3, 16.09.2026): „Kartei auffrischen“ prüft und ergänzt nur Angaben, die für die Art oder Sorte gelten und in der Pflanzenkarte stehen: Steckbriefdaten, Sorte und art- oder sortenspezifische Pflegetexte. Pflegeregeln, die für jede Zimmerpflanze gelten, schreibt die Kartei nie. Zustand, Befund, Topf, Topfart, Substrat, Abzugsloch und Maßnahmen fragt die Kartei nie ab und zeigt sie nie zur Übernahme an; sie gehören dem Doktor. Der Doktor zeigt keinen Abgleich von Steckbriefdaten.
- 5.9 (neu, Stand 3, Fassung vom 16.09.2026 aus dieser Sitzung, ersetzt die ältere): Gegenproben laufen je in einer Kopie unter /tmp/<n> (veränderte index.html, pruef.js, Verweis auf node_modules). Ein Befehl startet höchstens einen Block von drei Gegenproben mit `timeout 250`, weil ein Befehl nach 300 Sekunden abbricht. Die Datei im Arbeitsordner wird dabei nie verändert; danach `cmp` gegen die gesicherte Fassung.
- Formfehler in der Datei:
  - Die Kopfzeile nennt „Stand 2“.
  - 10.8 steht als roher Änderungsblock.
  - 10.9 steht ohne eigene Zeile.
  - 5.8 trägt das Präfix „Regel:“.
