# PLAN — GreenkeeperAI

Stand 26.09.2026 · Ausgangsfassung 3.29.0 · **Zielversion 3.30.0, sw.js greenkeeperai-v126**

**Sitzung 1 freigegeben am 26.09.2026 (Chris).** Kartei-Streifen: Variante (a).

3.29.0 ist geliefert, der Verlauf steht im CHANGELOG. Hier steht jetzt nur noch das Aufräumen.

---

# Aufräumen · Überblick

Chris am 22.09.2026: Nach der Anzucht wird die App grundlegend aufgeräumt, bevor etwas Neues kommt.

Grundlage: Analyse vom 26.09.2026 (Code, Prüfstand, 344 Klicks durch alle Bereiche, Sicherung vom 26.09.).

Größe insgesamt: groß. Deshalb die Aufteilung nach Regel 3.4:

| Sitzung | Thema | Größe | Ziel |
|---|---|---|---|
| 1 | Fehler und Daten | mittel | 3.30.0 |
| 2 | Scrollfehler | offen | erst Messwerte, Regel 5.6 |
| 3 | Ballast | mittel | toter Code, Altlasten |
| 4 | App Tour neu | groß | zuletzt, weil 1–3 die Oberfläche ändern |

Danach wieder Neues: Sammel-Anlegen, F, T, Claude-Anbindung, Browser-Dialoge durch App-Fenster ersetzen (Backlog).

---

# Sitzung 1 · Fehler und Daten → Zielversion 3.30.0, sw.js greenkeeperai-v126

## Ziel
Die belegten Fehler aus der Analyse sind behoben, und die uneinheitlichen Werte in den Pflanzendaten sind einmalig vereinheitlicht.

## Änderungen

### Fehler
- **Kartei-Meldung bleibt stehen:** Nach der letzten Übernahme wird die Seite nicht mehr neu gezeichnet, nachdem die Meldung geschrieben ist. Heute verschwindet die Meldung nach etwa 0,3 s.
- **Kartei-Streifen einklappbar:** Ein Knopf am Streifen verkleinert ihn zu einer kleinen Marke unten rechts mit Fortschritt und Zeit. Ein Tipp auf die Marke klappt ihn wieder auf. Der Zustand bleibt bis zum Ende des Laufs gemerkt. Solange der Streifen offen ist, bekommt die Seite unten genug Platz, damit er nichts verdeckt. *(Variante (a), Chris 26.09.)*
- **Düngung zählt als Lücke:** Die Kartei meldet eine fehlende Düngeangabe. Betroffen sind heute Brigitte, Beate und Jimmini. Die Karte zeigt bei ihnen nichts an, der Düngeplan rechnet dagegen still mit „Normal“.
- **Zählwort im KI-Auftrag:** Feldnamen mit Unterstrich (SORTE_BELEG, SORTEN_VERWECHSLUNG) werden mitgezählt. Das betrifft den Anlegen- und den Kartei-Auftrag.
- **Datum nach Ortszeit:** Giftprüfung und Vermehrungsauskunft schreiben das Datum nach Ortszeit. Heute tragen sie zwischen 0 und 2 Uhr den Vortag ein.
- **Gesperrte Knöpfe sehen gesperrt aus:** Eine allgemeine Regel macht jeden gesperrten Knopf blass. Bisher gilt das nur an fünf Einzelstellen. Das betrifft auch „Bestimmen“ ohne Foto.
- **Vermehrungswege ohne Katalogplatz** (z. B. „Blattsegment“) werden an der Gruppe gespeichert. Heute fällt das Eintopfen solcher Gruppen nach dem Neuladen auf „Kopfsteckling“ zurück.
- **Interne Nummer weg:** „E-106“ und Ähnliches erscheint auf keiner Karte mehr.
- **Umlaute:** „Ueber 14 °dH“ und „Ueber Nacht“ (Gießcenter, Wasser).

### Daten (einmalig beim Laden, danach nie wieder)
- **Botanischer Name:** Ein angehängter deutscher Name in Klammern und eine Sorte in Anführungszeichen werden aus dem Feld entfernt. Die Sorte bleibt in ihrem eigenen Feld. Betroffen sind 6 Pflanzen:
  - Bernd: „Dracaena trifasciata 'Hahnii Golden' (Bogenhanf)“ → „Dracaena trifasciata“
  - Beate: „Begonia x hiemalis (Elatior-Begonie)“ → „Begonia x hiemalis“
  - Pfeffi: „Mentha × piperita (Pfefferminze)“ → „Mentha × piperita“
  - Tutti: „Epipremnum aureum (Efeutute)“ → „Epipremnum aureum“
  - Manni und Mathilda: „Monstera deliciosa Variegata (Monstera Albo)“ → „Monstera deliciosa Variegata“
- **Die Stelle, die so etwas schreibt, wird gesucht.** Findet sich eine, die heute noch aktiv ist, wird sie mit behoben. Findet sich keine, steht das in der Übergabe.
- **„Seit“-Datum einheitlich:** Heute gibt es vier Formen: „selbst angelegt“ (39 Pflanzen), „6.9.2026“, „ca. 01.08.2026“ und kein einziges Datum in der Form, die die App lesen kann. Die Kennzahl „neu in diesem Monat“ zeigt deshalb immer 0.
  - Datumsangaben werden umgeschrieben. Aus „ca. 01.08.2026“ wird der 01.08.2026, das „ca.“ entfällt.
  - Bei „selbst angelegt“ gilt das früheste bekannte Datum der Pflanze (Ereignis, Gießen). Gibt es keins, bleibt das Feld leer.
  - Alle drei Stellen, die das Feld schreiben (Anlegen, Ableger, Eintopfen aus der Anzucht), schreiben künftig dieselbe Form.

### Pflichtpaket
Nach Regel 6.2.

## Nicht angefasst
- Scrollprotokoll (bleibt als Messwerkzeug bis Sitzung 2)
- App Tour (Sitzung 4)
- Toter Code, tote CSS-Regeln, Altlasten und Löschreste (Sitzung 3)
- `sorteGeprueft`, `ANTWORT_FORMAT`, `ABLEGER_ERBE`, `giftEigenSetzen`, `KLASSEN`-Texte
- Alle Punkte unter „Nicht anfassen“ der Übergabe

## Risiken
- **Datenbereinigung:** Sie läuft genau einmal und schreibt an echten Pflanzen. Prüfung an einer Kopie deiner Sicherung vom 26.09., vorher und nachher Feld für Feld verglichen. Vor dem ersten Start mit 3.30.0 lädst du eine frische Sicherung herunter.
- **Botanischer Name:** Kürzen darf nur, was sicher kein Teil des Namens ist. Klammern mit Zusätzen wie „syn.“ bleiben stehen.
- **Monstera „Variegata“:** Das ist kein gültiger Sortenname, bleibt aber stehen. Die Sorte „Albo Borsigiana“ steht schon im eigenen Feld.
- **„Seit“ ohne Datum:** Die Pflanze zählt nirgends als neu. Das ist ehrlicher als ein erfundenes Datum.
- **Kartei:** Die neue Lücke „Düngung“ setzt die Anzeige „Alles ausgefüllt“ zurück, bis die drei Pflanzen aufgefrischt sind.

## Prüfung
pruef.js mit Gegenproben nach Regel 5.2:
- Kartei: Die Meldung steht nach dem Schließen des Fensters noch da, auch 1 s später.
- Kartei: fehlende Düngung ist eine Lücke, vorhandene nicht.
- Streifen: einklappen, aufklappen, Zustand bleibt nach dem Neuzeichnen.
- Zählwort: Anlegen- und Kartei-Auftrag nennen die richtige Zahl.
- Datum: 00:30 Uhr Ortszeit ergibt das heutige Datum.
- Gesperrter Knopf: Die allgemeine Regel greift.
- Vermehrungsweg ohne Katalogplatz überlebt `laden()`.
- Keine Karte enthält „E-1“ als sichtbaren Text.
- Bereinigung an deiner Sicherung: die 6 Namen wie oben, keine andere Pflanze verändert, alle „Seit“-Werte lesbar, zweiter Start ändert nichts mehr.
- pruef.js bekommt die fehlende prompt-Attrappe (Regel 10.2), die Debug-Ausgabe „DBG2“ fliegt raus.

Nur am Handy prüfbar: Aussehen und Bedienung des Streifens, Platz unten, blasse gesperrte Knöpfe, Kartenbild ohne Nummer.

## Größe
mittel

## Entscheidung
- **Kartei-Streifen:** (a) einklappbar zu einer kleinen Marke (Chris, 26.09.)

---

# Sitzung 2 · Scrollfehler
Er wurde mehrfach ohne Erfolg angegangen, deshalb gilt Regel 5.6: kein Fix auf Verdacht. Nötig von Chris:
- wo es passiert (Reiter, Fenster, was du gerade tust)
- was genau passiert (springt nach oben, ruckelt, bleibt hängen)
- der Text aus Mehr → Scrollprotokoll direkt danach

Protokoll von Chris liegt vor (26.09., Sammlung, Raster). Der Plan folgt in Sitzung 2.

# Sitzung 3 · Ballast
- Die Schicht „mitgelieferte Pflanzen“ entfernen (die Liste ist leer): Papierkorb, „aus der Sammlung nehmen“, „Zurückholen“, `S.weg` und die `S.edits`-Überlagerung. In deinen Daten ist `S.edits` leer, dabei geht also nichts verloren.
- Löschreste beim Löschen einer Pflanze mit entfernen und die vorhandenen Reste aufräumen (5 gelöschte Pflanzen mit Ereignissen, Umtopfplan und „gesehen“).
- Alte Gießintervall-Kopien ohne „eigen“ entfernen (40 Pflanzen). Sie werden heute schon ignoriert.
- 22 Funktionen ohne Aufrufer, 75 CSS-Klassen ohne Verwendung, 3 CSS-IDs ohne Element, der tote Aufruf beim Dichte-Umschalter.
- Grundwerte: Alle 21 fehlenden Felder kommen in die Liste der Grundwerte.
- Patchnotes in der App auf die letzten zehn Fassungen kürzen, der Rest steht im CHANGELOG.
- Scrollprotokoll: raus, sobald Sitzung 2 den Fehler behoben hat.

# Sitzung 4 · App Tour neu
- Alle 16 Kapitel werden gegen die aktuelle App neu geschrieben.
- Der Prüfstand erkennt künftig versteckte Ziele. Heute zeigen zwei Schritte der „Kurzen Runde“ auf den versteckten Leerstart, sobald Pflanzen da sind.
- Umfang und Kapitelliste werden vor Beginn gemeinsam festgelegt, eventuell mit Vorschau.html.
