# PLAN — GreenkeeperAI

Stand 22.09.2026 · Ausgangsfassung 3.27.0 · **nächste Zielversion 3.28.0, sw.js greenkeeperai-v123**

**Freigegeben am 22.09.2026 (Chris): 3.28.0 · Zielversion 3.28.0, sw.js greenkeeperai-v123.** 3.29.0 ist nicht freigegeben.

Erledigt und nicht mehr hier: Etappe A bis D, E1 (3.19.0), Lösch-Fix (3.19.1), Kartei-Seite (3.20.0), E2 (3.21.0), E2b (3.22.0), E4 + K (3.23.0), Kartei-Abschluss (3.24.0), E3 Pflegetexte (3.25.0), Kartei schneller (3.26.0), Verlässliche Sorten (3.27.0). Der Verlauf steht im CHANGELOG.

Reihenfolge (Chris, 22.09.2026): **Anzucht** (3.28.0 und 3.29.0, zur Freigabe) → **Aufräumen** ohne neue Funktionen. Erst danach Sammel-Anlegen, **F**, **T**. Zurückgestellt: Claude-Anbindung.

## Zweck der Kartei, von Chris am 16.09.2026 gesetzt

- Die Kartei hält die Pflanzenkarten auf dem neuesten Stand: Steckbriefdaten, die Sorte und art- oder sortenspezifische Pflegetexte.
- Nichts, was jede Pflanze braucht. Keine Töpfe, kein Zustand, kein Befund, keine Maßnahmen — das bleibt beim Doktor.
- Geprüft werden feste Daten wie Frost und Felder, die das Anlegen leer gelassen hat.
- Pflegetexte wie bei der Venusfliegenfalle („Pflegeschritte“, „Winterruhe“): die KI schreibt sie, wo keine da sind, und gleicht sie ab, wo welche da sind.
- Die Sorte ermittelt die KI, am besten schon beim Anlegen.
- Der Doktor verliert den Abgleich der Steckbriefdaten, den übernimmt die Kartei.

## Reihenfolge (Chris, 21.09.2026)

- 3.24.0 Kartei-Abschluss, 3.25.0 E3.
- Claude-Anbindung zurückgestellt (Chris, 21.09.2026): Die API kostet je Anfrage, auch mit Claude Pro. Der Befund bleibt im Backlog: `KI_ANBIETER` kennt Anthropic mit `kann:false`, `kiFragen` ist fest auf Google gebaut.

## Erledigt in 3.24.0

- Abgleich-Fenster nur mit Kreuzen: × je Zeile, „Übrige übernehmen (n)“. Eigene Angaben sind hervorgehoben und gehen mit (Chris, 21.09.2026: „nur hervorheben, nicht gesondert“).
- Anlegen: keine Sorte mehr im botanischen Namen, auch nicht aus einem Bibliothekseintrag mit Sorte. Die Sorte geht in den Vorschlag (mittel bei Bibliothekseintrag, sonst niedrig).
- Frist in `kiFragen` gilt bis die Antwort gelesen ist. `karteiBilder` wartet höchstens 10 s.
- Belegt (Code): „Wichtig“ wird in der Kartei nur per Übernehmen ersetzt, nie still. Kein Verstoß gegen 10.8.
- Lauf mit mehreren Pflanzen am Gerät bestätigt (Chris, 21.09.2026).

---

## Erledigt in 3.25.0 — E3 Pflegetexte

- Anlegen und Kartei fragen `PFLEGE` und `WINTERRUHE` (Chris, 21.09.2026: Anlegen fragt mit, statt E1). Der Doktor-Auftrag bleibt wortgleich.
- Fehlende Pflegeschritte und Winterruhe zählen als Lücke (Chris, 21.09.2026, statt E2). Geprüftes „keine“ steht als leere Liste bzw. leerer Text.
- Kartei-Auftrag: „wie Karte“ für WICHTIG, PFLEGE, WINTERRUHE; die drei Texte der Karte gehen mit (E3).
- Neues Feld `winterruheText`, Karte zeigt es statt des festen Venusfliegenfallen-Textes. `winterruhe` (ja/nein) setzt die KI nie (E4).
- Pflegeschritte werden als Ganzes ersetzt (E5). Bearbeiten mit Stempel `hand` nur bei Änderung.
- `winterruheText` in `ABLEGER_ERBE`; ein geprüftes „keine“ erbt mit.
- Folge: „Nur mit Lücken“ nimmt zunächst fast jede Pflanze, bis ein Kartei-Lauf die Texte ergänzt hat.

## Erledigt in 3.26.0 — Kartei schneller

- Bündel zu fünf Pflanzen gleicher Art (mit oder ohne Foto), zwei gleichzeitig, Frist 90 s. Blöcke `PFLANZE: <Nummer> | <Name>`; falscher Name, doppelte oder fehlende Nummer → die Pflanze geht einzeln noch einmal (`S.kartei.einzeln`).
- Niedrige Denkstufe nur für die Kartei: `thinkingLevel: low` ab Gemini 3, `thinkingBudget: 512` bei 2.5. Bei 400 einmal ohne, gemerkt in `KI_DENKEN_AUS`.
- 429 mit Tageskontingent (`PerDay`) hält den Lauf an (`halt: 'tag'`), Minutenlimit bremst nach Googles `retryDelay`, sonst 60 s.
- Laufzeit (`laufMs`, `laufAb`), Modell und Restzeit unter dem Balken; Dauer je Pflanze in der Ergebnisliste; Laufzeit in der Leiste.
- Am Gerät bestätigt (Chris, 22.09.2026): 49 von 50 in 3 Minuten, Modell 3.6 Flash, Warten sichtbar. Eine Pflanze mit 503.

---

# Erledigt in 3.27.0 — Verlässliche Sorten und Pflegeangaben

- A: Kein Spitzname im Auftrag (`karteiBezeichnung`), Blockkopf nur Nummer. `SORTE_BELEG` und `SORTEN_VERWECHSLUNG` in Kartei (mit Foto) und Anlegen. `sorteGeprueft`: Spitzname (nur Gleichheit, damit „Thai“ „Thai Constellation“ nicht sperrt), Trivialname, ohne Foto, ohne Beleg → niedrig, Verwechslung → höchstens mittel. Vorhandene Sorte → „strittig“, nur einzeln.
- B: Abweichung von der Bibliothek → Zeile `einzeln`, nicht im Sammelknopf. `Q_RANG` bleibt unverändert (betrifft nur stille Schreibwege; die Kartei schreibt nie still). Plausibilitätsregeln `PLAUSI_TROPISCH`, `PLAUSI_SUKKULENT`.
- C: Fotobündel `thinkingLevel: medium` / `thinkingBudget: 2048`.
- D: `herkunftZeileHTML` unter dem Steckbrief.
- E: `karteiFragen` weicht nach 503 einmal aus.
- F: Prüfstand in pruef.js (Beauty, King Green, Bogenhand, Thai Constellation gegen Albo, Aronstab-Grenzen, Kaktus, Bibliothek, Anlegen).

---

# Zur Freigabe — Anzucht · Zielversion 3.28.0 und 3.29.0

Chris am 22.09.2026: eigener Bereich mit allen Anzuchten, gegliedert in Anzuchtbereiche (z. B. das kleine Anzuchthaus) und Gefäße (Wassergläser). Wasserwechsel mit Abstand je Gefäß. Mehrere Stecklinge, auch verschiedene Sorten, werden oft zu einer Pflanze zusammengesetzt. Bestimmung über die Mutterpflanze aus der Galerie oder per KI. Fotos am Gefäß, Verlauf je Gruppe („beides“).

Nachtrag Chris, 22.09.2026:
- Der Wasserwechsel steht im **Gießplan** wie eine Gießaufgabe, nicht als Aufgabe — so wie bei Pflanzen in reinem Wasser.
- Stecklinge müssen **einzeln aus einer Gruppe entnommen** werden können, etwa zum Eintopfen.
- **„Vermehren“ und Anzucht zusammenführen** zu einem Werkzeug „Anzucht“, statt eines weiteren Eintrags unter Werkzeuge.

## Begriffe

- **Bereich:** ein Ort mit mehreren Gefäßen, z. B. „Anzuchthaus“. Freiwillig.
- **Gefäß:** Glas, Schale, Topf. Medium Wasser, Substrat, Moos oder Perlite.
- **Gruppe:** Stecklinge einer Herkunft in einem Gefäß — z. B. „15 Blattstecklinge Königsbegonie“. Ein Glas mit Red Emerald, Maranta, Adansonii und Pothos hat vier Gruppen.

## Befund

- **Belegt** (Code): Pflanzen in Wasserkultur haben im Gießplan schon den Wasserwechsel statt des Gießens (`GIESSARTEN.wasser`: `wechsel:[5,7]`, Knopf „Wasser gewechselt“, `wechselIntervall`). Genau so sollen die Gläser erscheinen.
- **Belegt** (Code): Gießliste, Gießmodus, Gießplan-Vorschau (`giessplanDaten`) und Heute bauen ausschließlich aus Pflanzen (`allePflanzen()`). Gefäße müssen dort als eigene Einträge hinein, ohne als Pflanzen zu gelten (sonst landen sie in Kartei, Lücken und Sammlungszahl).
- **Belegt** (Code): Das Werkzeug „Vermehren“ ist ein Ablauf in drei Stufen: Mutterpflanze wählen → Weg wählen (Aussicht, Anleitung, KI-Nachfrage) → „Wie viele Ableger?“, die sofort als eigene Pflanzen angelegt werden (`ablegerAnlegen`).
- **Belegt** (Code): Es gibt keinen Speicherort für Stecklinge; ein Ableger kennt genau eine Mutter (`eltern`) und eine Sorte.
- **Belegt** (Code): Pflanzenfotos liegen in IndexedDB (`FOTO_DB`), `S` im localStorage. Gefäßfotos gehören in den Fotospeicher.

## Aufteilung

- **3.28.0:** Werkzeug „Anzucht“ (ersetzt „Vermehren“), Bereiche, Gefäße, Gruppen, Wasserwechsel im Gießplan, Verlauf, Fotos, Entnehmen (Ausfall, umsetzen, als eigene Pflanze eintopfen).
- **3.29.0:** KI-Bestimmung per Foto, Mischtopf aus mehreren Gruppen und Sorten mit mehreren Müttern.

## 3.28.0

**Werkzeug „Anzucht“ statt „Vermehren“**
- Der Eintrag „Vermehren“ heißt künftig „Anzucht“, an derselben Stelle. Kein weiterer Eintrag, die Werkzeugseite sieht aus wie bisher.
- Oben die Übersicht: Bereiche mit ihren Gefäßen, Gefäße ohne Bereich darunter. Je Gefäß Name, Medium, Zahl der Stecklinge, nächster Wasserwechsel.
- Knopf „Neue Stecklinge“ startet den bisherigen Vermehren-Ablauf unverändert (Mutterpflanze → Weg mit Aussicht, Anleitung, KI-Nachfrage).
- Stufe 3 fragt neu „Wohin?“:
  - **In die Anzucht** (Vorgabe): Gefäß wählen oder neu anlegen, Anzahl — es entsteht eine Gruppe;
  - **Gleich als eigene Pflanzen**: wie bisher, für schon bewurzelte Ableger.
- „Frei eintragen“ für Stecklinge ohne Mutter in der Sammlung (getauscht): Art, botanischer Name, Sorte von Hand.

**Gefäß**
- Name, Medium, Bereich (oder keiner), Startdatum, Fotos mit Datum.
- Bei Medium Wasser: „Wasser wechseln alle … Tage“, Vorgabe 7, je Gefäß änderbar.
- Bei Substrat, Moos oder Perlite: „Befeuchten alle … Tage“, Vorgabe 10, je Gefäß änderbar oder aus.
- Umbenennen, verschieben, auflösen (nur wenn leer).

**Bereich mit eigenem Rhythmus**
- Ein Bereich kann selbst einen Rhythmus haben — gedacht für das Anzuchthaus: „Befeuchten alle … Tage“, Vorgabe 10.
- Dann stehen die Gefäße darin nicht einzeln im Gießplan, sondern das Anzuchthaus als ein Eintrag mit Knopf „Befeuchtet“. Wassergläser in einem Bereich behalten ihren eigenen Wechsel.

**Wasserwechsel im Gießplan**
- Wassergläser erscheinen in Heute, im Gießmodus und in der Gießplan-Vorschau **wie eine Pflanze in Wasserkultur**: Eintrag mit dem Gefäßnamen und seinen Stecklingen, Knopf „Wasser gewechselt“, fällig nach dem eingestellten Abstand.
- Substrat-Gefäße und Bereiche mit Rhythmus (Anzuchthaus) erscheinen genauso, mit Knopf „Befeuchtet“.
- Sie sind dort eigene Einträge, keine Pflanzen: nicht in Kartei, Lücken, Sammlungszahl, Doktor.

**Gruppe**
- Anzahl, Methode (Blattsteckling, Kopfsteckling, Stammsteckling, Blattschnitt, Triebstück, Teilstück, Ausläufer), Startdatum, Herkunft.
- Verlauf mit Datum: „Wurzeln sichtbar“, „erstes neues Blatt“, freie Notiz.

**Entnehmen**
- Aus jeder Gruppe lassen sich ein oder mehrere Stecklinge entnehmen, Anzahl wählbar:
  - **Eintopfen als eigene Pflanze** — je entnommenem Steckling eine Karte oder alle zusammen in einen Topf als eine Karte; erbt von der Mutter wie bisher, hängt im Stammbaum unter ihr;
  - **Umsetzen** in ein anderes Gefäß (vorhandene Gruppe derselben Herkunft oder neue Gruppe) — der Verlauf wandert mit;
  - **Ausfall** — zählt nur herunter, mit Eintrag im Verlauf.
- Eine leere Gruppe verschwindet aus dem Gefäß; der Verlauf bleibt am Ableger bzw. in der Mutterkarte.

**Mutterpflanze**
- Die Karte der Mutter zeigt: „In Anzucht: 15 Blattstecklinge · Glas 1“.

**Sicherung**
- `S.anzucht` geht in Datensicherung und Wiederherstellung mit, die Fotos wie die Pflanzenfotos.

## 3.29.0

**KI-Bestimmung**
- „Per Foto bestimmen“ in der Gruppe: kurzer Auftrag nur mit ART, BOTANISCH, SICHERHEIT, SORTE, SORTE_BELEG, SORTEN_VERWECHSLUNG; Regeln aus 3.27.0 (`sorteGeprueft`); gespeichert erst per Tipp.

**Mischtopf**
- Eintopfen aus mehreren Gruppen, auch aus verschiedenen Gefäßen und Sorten, zu **einer** Pflanze (z. B. Golden Pothos mit Marble Queen).
- Erbe über `ABLEGER_ERBE` von der Hauptgruppe (Vorgabe: die mit den meisten Stecklingen).
- Neue Felder `muetter` und `mitImTopf`; die Karte zeigt „Mit im Topf: Marble Queen (2)“. `eltern` bleibt die Hauptmutter, der Stammbaum zeigt weitere Mütter mit.

## Annahmen — ohne Einwand gelten sie mit der Freigabe

- **Z1** Ein Glas im Gießplan heißt wie das Gefäß („Glas 1“) und nennt darunter seine Stecklinge.
- **Z2** (entschieden, Chris 22.09.2026) Auch das Anzuchthaus steht im Gießplan: Es wird alle ein bis zwei Wochen mit etwas Wasser befüllt, damit die Feuchtigkeit bleibt. Vorgabe „Befeuchten alle 10 Tage“, einstellbar.
- **Z3** Der Vermehren-Ablauf bleibt inhaltlich gleich (Aussicht, Anleitung, KI-Wege); neu ist nur „Wohin?“ in Stufe 3.
- **Z4** Aufteilung auf 3.28.0 und 3.29.0 wie oben.

## Nicht angefasst

Kartei, Doktor, Gießlogik der Pflanzen, bestehende Ableger und `eltern`, `ABLEGER_ERBE` (nur gelesen), `giftEigenSetzen`, `fest`/`strittig`.

## Risiken

- Gießliste, Gießmodus, Vorschau und Heute bekommen einen zweiten Eintragstyp — jede Stelle, die heute „Pflanze“ annimmt, braucht einen Test mit Glas.
- Fotos mehrerer Gefäße vergrößern den Fotospeicher; sie werden verkleinert wie Pflanzenfotos.

**Pflichtpaket** je Fassung nach Regel 6.2.

---

# Danach: Aufräumen · keine neuen Funktionen

Chris am 22.09.2026: Nach der Anzucht wird die App grundlegend aufgeräumt, alle restlichen Kinderschuhfehler beseitigt und alles auf 100 % funktional gebracht, bevor wieder etwas Neues kommt.

- Umfang wird vor Beginn gemeinsam festgelegt (Durchgang durch alle Bereiche, Fehlerliste, Reihenfolge).
- Dazu gehören die vier alten roten Tests (Anstau, Bromelie, Kaktus, Fokus) und die offene Statuszeile unter „Mehr“.
- Sammel-Anlegen, F, T, Claude-Anbindung und alle anderen neuen Punkte warten bis danach.
