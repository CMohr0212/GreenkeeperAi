# Änderungen

Was sich in jeder Fassung getan hat — Funktionen und Bedienung, keine Technik.

---

## 1.3.1 — 21. August 2026
**Fehlerbehebungen**

### Besser
- Sicherungen heißen jetzt auf beiden Wegen gleich — auch beim Teilen ersetzt eine neue Sicherung die vorherige, statt sich zu stapeln.

### Behoben
- Der einfache Modus hat den Grundriss und den Blattzähler nicht ausgeblendet. Beides verschwindet jetzt tatsächlich.
- Eine unvollständige Pflanze aus einer älteren Sicherung konnte die gesamte Anzeige stilllegen — die App zeigte dann gar nichts mehr, obwohl alle anderen Pflanzen in Ordnung waren.
- Dasselbe konnte ein Gießverlauf im alten Format auslösen. Beide Fälle werden jetzt abgefangen.
- Der Bereich „Was sich geändert hat" ließ sich nicht aufklappen und sprang stattdessen zur Sicherung.

---

## 1.3 — 21. August 2026
**Sicherung, einfacher Modus und Warnungen**

### Neu
- **Einfacher Modus** unter Mehr → Ansicht: blendet Grundriss, Gießart-Auswahl und Blattzähler aus, der Rundgang läuft mit drei Knöpfen. Es geht dabei nichts verloren — abschalten und alles ist unverändert wieder da.
- **Sicherung teilen**: schickt die Sicherungsdatei in einem Schritt an WhatsApp, Drive, iCloud oder eine Mail an dich selbst.
- **Urlaubszettel teilen**: die Kurzfassung lässt sich direkt verschicken, statt sie erst zu kopieren.
- **Substrat auf die Wunschliste**: fehlende Bestandteile wandern auf Knopfdruck in die vorhandene Wunschliste.

### Besser
- Sicherungen überschreiben sich jetzt gegenseitig, statt sich als fünfzig einzelne Dateien im Download-Ordner zu stapeln. Wo der Browser es zulässt, wird einmalig ein Ordner gewählt.
- Die App bittet den Browser einmalig, die Daten dauerhaft zu behalten — dann darf er sie bei Platzmangel nicht mehr ungefragt löschen.
- Substrat-Ersatzstoffe: fehlt eine Zutat, schlägt die App vor, was stattdessen schon im Vorrat liegt. Kein Perlit, dafür Bims.
- Das Einlesen einer KI-Antwort versteht jetzt auch JSON, nicht mehr nur das Zeilenformat.
- Neuer Bereich **Was sich geändert hat** unter Mehr. Nach einem Update zeigt die App den neuesten Eintrag einmal von selbst.

### Behoben
- Ungeprüfte Tierarten wurden bisher stillschweigend übersprungen und sahen dadurch aus wie „unbedenklich". Sie stehen jetzt in einem eigenen gelben Kasten mit Suchlink zum Selbstprüfen.

---

## 1.2 — 20. August 2026
**Karten in Reiter, Räume statt Standort**

### Neu
- Die Pflanzenkarte ist in vier Reiter geteilt: Allgemein, Pflege, Lage und Geschichte.
- Raum und Stellplatz als getrennte Angaben — danach lässt sich filtern und gruppieren.
- Quarantäne: befallene Pflanzen lassen sich markieren und fallen auf der Karte sofort ins Auge.
- Rückmeldung mit vorbereiteter Mail und Knopf zum Melden auf GitHub.

### Besser
- Warnungen stehen jetzt immer ganz oben auf der Karte, nicht mehr irgendwo dazwischen.
- „Schatten" ist als Lichtangabe dazugekommen.

### Behoben
- Das alte Standort-Feld ist überall entfernt — es stand in Konkurrenz zu Raum und Stellplatz und führte zu widersprüchlichen Angaben.

---

## 1.1 — 19. August 2026
**Werkzeuge und Fotospeicher**

### Neu
- Werkzeugseite mit aufklappbaren Bereichen statt einer langen Liste.
- Urlaubszettel zum Ausdrucken.
- Substratrechner mit Vorratsverwaltung.

### Besser
- Fotos liegen jetzt im großen Browserspeicher statt im kleinen — vorher war nach etwa fünfzig Bildern Schluss.

---

## 1.0 — 18. August 2026
**Erste Fassung**

### Neu
- Pflanzenverwaltung mit Gießplan, Fotos und Notizen.
- Gießmodus und Rundgang.
- Pflanzendoktor und Giftigkeitshinweise für Haustiere.
- Läuft offline, alle Daten bleiben auf dem Gerät.

---

## Für kommende Fassungen

Beim Veröffentlichen einer neuen Fassung sind drei Stellen zu ändern:

1. In `index.html` einen neuen Eintrag **oben** in `PATCHNOTES` einfügen und `FASSUNG` auf dessen Nummer setzen.
2. In `sw.js` die Zahl in `VERSION` erhöhen, damit die Geräte die neue Datei auch wirklich holen.
3. Hier in dieser Datei denselben Eintrag ergänzen.
