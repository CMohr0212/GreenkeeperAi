# 🌿 GreenkeeperAi

Eine Web-App für die Pflege von Zimmer- und Balkonpflanzen. Sie läuft
offline, und alle Daten bleiben auf deinem Gerät. Es gibt keinen Server,
der etwas speichert oder sieht.

Aktuelle Fassung: siehe [CHANGELOG.md](CHANGELOG.md).

## Ausprobieren

👉 **[App öffnen](https://cmohr0212.github.io/GreenkeeperAi/)**

Am Handy: öffnen, dann über das Browsermenü „Zum Startbildschirm
hinzufügen“ oder „App installieren“ wählen. Danach läuft sie wie eine
normale App, mit eigenem Symbol und ohne Adressleiste.

## Was sie kann

- **Heute**: wer gegossen werden muss, das Wetter und der Kalender
- **Gießmodus**: führt Raum für Raum durch die fälligen Pflanzen und lernt
  deinen Rhythmus
- **Sammlung**: alle Pflanzen als Liste, Galerie oder Raster, mit Filtern,
  Tags und Mehrfachauswahl
- **Pflanzenkarte**: Verlauf, Platz, Pflegeheft, Steckbrief und Stammbaum
- **Anlegen in fünf Stufen**: per Foto mit KI, aus der Artenbibliothek
  (rund 250 Arten) oder von Hand
- **BOTaniker**: Chat mit Werkzeugen für Pflanzendoktor, Umtopfen, Substrat
  mischen, Anzucht, Stammbaum und Urlaubszettel
- **Kalender** mit Terminen, Serien und Vorlagen
- **Tags** mit Wirkung, etwa Gießpause, Winterruhe oder Dünger
- **Giftigkeit** für die eigenen Haustiere
- **App Tour**, die jeden Bereich kurz zeigt

Die KI ist freiwillig. Sie nutzt Gemini mit deinem eigenen kostenlosen
Schlüssel; ohne Schlüssel geht alles andere trotzdem.

## Eigene Daten

Alles liegt im Speicher deines Browsers.

- **Regelmäßig sichern**: Zahnrad › Sicherung, als Datei herunterladen.
- Löschst du die Browserdaten, sind auch die Pflanzen weg.
- Die veröffentlichte App ist leer. Niemand sieht deine Pflanzen außer dir.

## Mitmachen

Fehler gefunden, eine Art fehlt, eine Idee? In der App über
Zahnrad › Hilfe › Rückmeldung oder hier als [Issue](../../issues).

## Technik

Eine einzelne HTML-Datei ohne Build und ohne Abhängigkeiten, dazu ein
Service Worker (`sw.js`) und die Prüfungen (`pruef.js`, läuft mit Node und
jsdom). Zum lokalen Entwickeln reicht ein beliebiger lokaler Webserver;
`file://` allein genügt für den Service Worker nicht.
