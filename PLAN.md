# PLAN — GreenkeeperAI

Freigegeben am 15.09.2026 · Ausgangsfassung 3.18.0 · **Zielversion 3.19.0, sw.js greenkeeperai-v113**

Erledigt und nicht mehr hier: Etappe A (Anlegen), B (Doktor bewertet mit den Ist-Werten), C (Herkunft und Rangfolge), D (Sorten) — geliefert bis 3.18.0. Der Verlauf steht im CHANGELOG.

Offen sind: **E, F und T**. Etappe E ist am 15.09.2026 neu zugeschnitten worden: sie heißt jetzt **Sammelprüfung des Bestands**, nicht mehr Sammel-Anlegen. Das Sammel-Anlegen wird eine eigene Etappe und folgt demselben Prinzip — die Sammelprüfung ist dafür der Testschritt.

Größe: **groß**. Aufteilung nach Regel 3.4 in **E1** und **E2**. Freigegeben und gebaut wird in dieser Sitzung E1.

---

# Freigegeben — Etappe E1 · Der Lauf

Freigabe von Chris am 15.09.2026.

## Ziel

Die KI läuft auf Zuruf über ausgewählte Pflanzen der Sammlung, sammelt ihre Antworten in einem Zwischenlager und meldet sich, wenn sie durch ist — ohne dass die App währenddessen blockiert ist und ohne dass ein einziger Wert an einer Pflanze geändert wird.

## Was am Ist-Stand geprüft wurde

- `kiFragen(prompt, bilder, modellId)` in index.html 18450 merkt den laufenden Abbruch in **einer** globalen Variablen `KI_LAEUFT`. Bei mehreren Anfragen gleichzeitig überschreibt jede die vorige — `kiAbbrechen()` träfe nur die letzte. Das ist die einzige Stelle, die für Parallelbetrieb angefasst werden muss.
- `auftragFormat(namen, sonicht, pruefliste)` (index.html 5957) setzt aus einer Feldnamensliste einen vollständigen Auftrag zusammen. Anlegen und Doktor benutzen ihn bereits. Die Sammelprüfung braucht deshalb keinen eigenen Prompt-Text, nur drei Feldlisten.
- `geminiLesen(txt)` (6248) liefert ein Objekt mit Feldnamen der App. Es wird unverändert benutzt.
- Fotos liegen als Data-URL in `fotosVon(id)`; `profilFoto(id)` wählt das Kachelbild, nie eines aus dem Doktor. `kiBildAusDataUrl` macht daraus die Form, die `kiFragen` erwartet.
- `S` wird über `sichern()` in localStorage abgelegt, Fotos gehen getrennt in IndexedDB. Das Zwischenlager muss deshalb klein bleiben.
- Benachrichtigungen benutzt die App bisher nirgends. `eigenstaendigGestartet()` (27889) erkennt die installierte App.
- Die Mehr-Seite baut sich aus `section[data-mh]`, `MH_IKON`, `MH_UNTER` und `MH_GRUPPEN` (23077 ff.).

## Änderungen

- **Neuer Punkt unter Mehr: „Pflanzenkartei auffrischen"** (`data-mh="kartei"`), Gruppe Pflege. Nebenzeile nennt den Stand: wie viele Pflanzen Lücken haben, ob ein Ergebnis bereitliegt.
- **Auswahl** in drei Möglichkeiten: *Alle*, *Nur mit Lücken*, *Einzelne auswählen*. Die dritte benutzt dasselbe Bildgitter wie der Pflanzendoktor (`pwahlZeichnen`), erweitert um Mehrfachauswahl. Dazu Suchfeld, „Alle" und „Keine".
- **Eine Anfrage je Pflanze**, kein getrennter Textlauf. Der Auftrag richtet sich nach dem Stand der Pflanze:
  - *voll* — botanischer Name fehlt oder mehrere Pflichtfelder sind leer: der vollständige Auftrag samt Zustand, Befund und Maßnahmen.
  - *teil* — Pflanze ist vollständig: nur Merkmale, Zustand, Befund, Maßnahmen.
  - *ohne Foto* — kein Bild hinterlegt: nur, was aus Art und botanischem Namen folgt. Kein Zustand, kein Topfurteil, keine Merkmale. Diese Pflanzen werden vor dem Start namentlich genannt.
- **Warteschlange mit 3 gleichzeitigen Anfragen.** Bei 429 drosselt sie selbst auf eine Anfrage und wartet eine Minute, statt abzubrechen. Bei 503 gilt das bestehende Ausweichen auf ein Modell tiefer.
- **`kiFragen` bekommt ein viertes Argument `ctrl`.** Wird ein eigener AbortController übergeben, benutzt die Funktion ihn und fasst `KI_LAEUFT` nicht an. Ohne das Argument bleibt alles wie bisher.
- **Die Schlange liegt in `S.kartei`** und übersteht das Schließen der App. Beim Öffnen läuft ein unterbrochener Lauf von selbst weiter, wenn er weniger als zwei Stunden alt ist; ist er älter, steht ein Knopf „Fortsetzen" da. Gespeichert werden nur die gelesenen Felder, nicht der Rohtext.
- **Leiste am unteren Rand** über allen Ansichten, nach dem Vorbild von `#update-streifen` (Ebene 90, über den Reitern, unter Modal und Tour). Zeigt „Prüfe 12 von 48", einen Balken und „Abbrechen". Kein Modal — die App bleibt bedienbar.
- **Benachrichtigung am Ende**, nur in der installierten App und nur, wenn die Seite gerade nicht im Blick ist. Die Erlaubnis wird beim Start eines Laufs gefragt, nicht vorher. Antippen öffnet die App; dafür bekommt sw.js einen `notificationclick`-Behandler.
- **Ergebnisliste zum Ansehen** im selben Abschnitt: je Pflanze, wie viele Angaben zurückkamen, welcher Auftrag lief, und bei Fehlschlägen der Grund. Auswählbar, dazu „Ausgewählte noch einmal prüfen" und „Ergebnis verwerfen". **Kein Übernehmen** — das ist E2. Der Abschnitt sagt das ausdrücklich.
- **Kein Wert an einer Pflanze wird geschrieben.** Regel 10.8 gilt hier ohne Ausnahme, auch für Pflanzen ohne jede Angabe.

## Nicht angefasst

`aenderungSetzen`, `herkunftVon`, die Rangfolge aus Etappe C, `giftEigenSetzen` und die Giftstatus, das Feld `merkmale` der Bibliothek, `sorte` und `sortenmerkmale`, `dokPromptBauen` und der gesamte Pflanzendoktor, `ANTWORT_FORMAT` im Wortlaut, das Anlegen-Formular, die Karte, der Grundriss, die Gieß- und Lernlogik, `TOUR_KAPITEL`, die Bibliothek. `kiFragen` wird nur um ein optionales Argument erweitert, sein bisheriges Verhalten bleibt.

## Risiken

- **Der Hintergrundlauf ist beobachtet, nicht garantiert.** Friert Android die Seite ein, hält der Lauf an und macht beim Öffnen weiter — dann kommt keine Benachrichtigung, sondern die Leiste. Das ist gebaut, aber genau das ist am Gerät zu prüfen.
- **Das Kontingent ist der Engpass, nicht das Gerät.** Bei 50 Pflanzen sind 50 Anfragen fällig. Ein 429 mitten im Lauf ist wahrscheinlicher als ein Netzfehler.
- **Zwei Abbruchwege nebeneinander.** `KI_LAEUFT` für die Einzelanfrage, eigene Controller für die Schlange. Wer den einen liest, erwartet den anderen.
- **localStorage.** Fünfzig Ergebnisse kosten geschätzt 25 bis 40 Kilobyte. Bei vollem Speicher scheitert `sichern()` — die Warnung dafür besteht bereits.
- **Die Benachrichtigungserlaubnis ist eine Systemfrage.** Wer sie einmal ablehnt, bekommt sie in Chrome nicht wieder gestellt; dann bleibt die Leiste der einzige Weg.
- **Ein halb gelaufener Lauf beim Hochladen einer neuen Fassung.** Der Service Worker tauscht die Datei, die Schlange steht in `S` und läuft weiter — die Felder können dann aus zwei Fassungen stammen.

## Prüfung

pruef.js prüft: die Auswahl liefert bei *alle* alle Pflanzen, bei *Lücken* nur die unvollständigen, bei *Einzelne* genau die angetippten; Mehrfachauswahl setzt und löst; der Auftrag ist *voll*, *teil* oder *ohne Foto* nach dem Stand der Pflanze und enthält im Fall *ohne Foto* keine ZUSTAND-, BEFUND-, MERKMALE- und TOPF-Zeile; die Zahl der Schlüsselwörter im Auftrag stimmt mit der Zahl der Feldzeilen überein; die Schlange startet höchstens drei Anfragen gleichzeitig; eine fehlgeschlagene Anfrage bricht den Lauf nicht ab und steht danach als Fehlschlag in der Liste; nach dem Lauf sind die Werte aller beteiligten Pflanzen unverändert und `S.edits` ist nicht gewachsen; Abbrechen hält an und behält die bis dahin gesammelten Antworten; ein unterbrochener Lauf nimmt beim Neuaufbau die offenen Pflanzen wieder auf; „Ausgewählte noch einmal prüfen" startet genau die angehakten; „Ergebnis verwerfen" leert das Zwischenlager; `kiFragen` ohne viertes Argument setzt `KI_LAEUFT` wie bisher, mit Argument nicht; die Leiste erscheint während des Laufs und verschwindet nach dem Verwerfen.

Nicht durch Tests abgedeckt — nur am Handy prüfbar: ob der Lauf bei zugeklappter App weiterläuft, ob die Benachrichtigung ankommt und sie beim Antippen die App öffnet, die Lage der Leiste über den Reitern und unter Modal und Tour, das Scrollen im Auswahlgitter, die Lesbarkeit der Ergebnisliste auf schmalem Gerät.

## Größe

Groß, deshalb geteilt. E1 ist mittel.

---

# Freigegeben im Zuschnitt, noch nicht im Detail — Etappe E2 · Prüfen und übernehmen

Wird zu Beginn der nächsten Sitzung als eigener Plan ausgeschrieben.

## Ziel

Das Ergebnis eines Laufs wird Zeile für Zeile durchgesehen und einzeln übernommen.

## Zuschnitt, von Chris am 15.09.2026 gesetzt

- Kein blindes Sammelübernehmen. Jede Angabe wird vor der Übernahme angezeigt: Pflanze, Feld, alt → neu.
- Auswählen und einzeln übernehmen. Was nicht übernommen wird, fällt weg — ein „Später" gibt es nicht.
- Angaben, bei denen Chris unsicher ist, lassen sich anhaken und per Knopf noch einmal durchlaufen lassen. Der Weg dafür steht seit E1.
- Die Rangfolge aus Etappe C entscheidet, was als Widerspruch gilt: ein Feld mit Stempel `hand` ist immer einer.

---

# Ausblick — noch nicht freigegeben

## Sammel-Anlegen (neu, war E)

Mehrere Fotos wählen, je Pflanze eine eigene Anfrage, Durchwinkliste, Standort einmal für alle. Benutzt die Warteschlange aus E1. Größe: groß.

## F — KI im Rundgang

Noch Idee, kein Plan. Wird besprochen, wenn E steht.

## T — App-Rundgang neu (zuletzt)

Kompletter Neubau von `TOUR_KAPITEL` (index.html ab 27806, 16 Kapitel). Größe: **groß**, Aufteilung in vier Etappen: **T1** Runde und Einrichtung, **T2** Sammlung, Karte, Heute, Gießmodus, Rundgang, **T3** Werkzeuge, Doktor, Substrat, Grundriss, Zeichenfläche, Vermehren, **T4** Mehr, Sicherung, Urlaub und ein neues Kapitel KI-Dienst.

Am 14.09.2026 am Ist-Stand belegte Abweichungen, damit sie nicht noch einmal gesucht werden müssen:

- `einricht`, Schritt „Die KI fragen" beschreibt Kopieren-und-Einfügen. Ist: Drei-Fotos-Forderung, Modellwahl, Bilderfeld `#ki-direkt-anlegen`, Knopf „Fragen" (`#btn-gemini`); der Kopierweg liegt zugeklappt unter `#neu-alt`.
- `einricht` kennt Stufe 4 nur halb: Kulturform `#f-kultur`, Topfart, Durchmesser-Schieber `#f-topf`, Substrat und Abzugsloch (`#al-topf`) kommen nicht vor, der Schritt zeigt nur auf `#al-pflege`.
- `einricht` kennt den Doktor-Anstoß nach dem Anlegen nicht (`.km-anstoss`, index.html 14338).
- Kein Kapitel nennt den Schlüssel unter Mehr › KI-Dienst (`[data-mh="kidienst"]`), ohne den der direkte Weg nicht läuft.
- `runde`, Schritt 5 nennt sechs Werkzeuge. Ist: sieben — Doktor, Umtopfen, Gießplan, Substrat, Vermehren, Stammbaum, Grundriss.
- `runde`, Schritt 6 nennt den KI-Dienst nicht.
- `werkzeuge` heißt „Die drei Werkzeuge" und beschreibt drei.
- `sammlung`, Schritt „Drei Ansichten" trägt eine überholte Umzugsnotiz.
- `mehr` hat vier Schritte; Bibliothek, KI-Dienst, Aufgaben, Wetter und Tiere fehlen.
- Neu ab 3.19.0: kein Kapitel nennt „Pflanzenkartei auffrischen".
- Nach E kommen weitere Abweichungen dazu — die Liste ist vor T neu zu prüfen, nicht ungeprüft zu übernehmen.

Geprüft und richtig: die vier Reiter der Karte, die sechs Werkzeuge der Zeichenfläche, die fünf Stufen im Anlegen. Bestehende Prüfungen, die am Wortlaut hängen: „Sie hat sieben Schritte" (runde), der Regex auf „Mehr › App Tour" im Schlussschritt, „Das Mehr-Kapitel zeigt nicht mehr auf ansicht", „Alle Kapitel stehen zur Wahl" (zählt `Object.keys(TOUR_KAPITEL).length`).
