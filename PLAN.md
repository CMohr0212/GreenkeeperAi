# PLAN — GreenkeeperAI

Freigegeben am 14.09.2026 · Ausgangsfassung 3.16.0 · **Zielversion 3.17.0, sw.js greenkeeperai-v111**

Erledigt und nicht mehr hier: Etappe A (Anlegen) und Etappe B (Doktor bewertet mit den Ist-Werten), geliefert bis 3.16.0. Der Verlauf steht im CHANGELOG.

Offen sind fünf Etappen: **C, D, E, F und T**. Reihenfolge von Chris gesetzt am 14.09.2026: erst C bis F, der App-Rundgang (T) zuletzt. Begründung: C, D und E ändern Dinge, die der Rundgang beschreiben müsste — sonst wird der Rundgang zweimal geschrieben.

---

# Freigegeben — Etappe C · Herkunft und Rangfolge

Freigabe von Chris am 14.09.2026.

## Ziel

Jeder übernommene Wert an einer Pflanze trägt einen Stempel, woher er kommt, und eine feste Rangfolge entscheidet, wer wen überschreiben darf — ohne dass ein eigener Eintrag dadurch unkorrigierbar wird.

## Was am Ist-Stand geprüft wurde

- Alle Schreibvorgänge an einer Pflanze laufen durch **eine** Stelle: `aenderungSetzen(id, felder)` in index.html 8917. Es gibt 18 Aufrufer.
- Die Funktion legt die Werte in `S.eigene` (selbst angelegte Pflanze) oder `S.edits` (Abweichung zu einer mitgelieferten) ab.
- Die Giftfrage hat bereits eine eigene Herkunftslogik: `giftEigenSetzen`, Status `fest` / `strittig`, Feld `quelle`. Sie ist von C nicht betroffen.
- Der Doktor-Abgleich vergleicht in `dokAbgleichZeigen` (25520) genau die sechs Felder aus `AB_FELDER`: botanisch, typ, klasse, sonne, wichtig, frostMin.

## Änderungen

- **Neues Feld `quellen` an der Pflanze**: ein Objekt `{feld: 'ki' | 'bib' | 'hand'}`. Es wird wie jeder andere Wert über `aenderungSetzen` abgelegt und wandert damit ohne Sonderweg in Sicherung und Wiederherstellung.
- **`aenderungSetzen(id, felder, herkunft)`** bekommt ein drittes Argument. Fehlt es, gilt `hand`. Jeder der 18 Aufrufer wird einzeln zugeordnet: die Doktorwege und `vermehrungUebernehmen` auf `ki`, die Übernahme aus der Bibliothek beim Anlegen auf `bib`, alles, was hinter einem Tippen von Chris steht, auf `hand`.
- **Gestempelt werden sieben Felder**: art, botanisch, typ, klasse, sonne, wichtig, frostMin. Nicht gestempelt werden Werte, die ohnehin nur von Hand entstehen — name, raum, stellplatz, topf, topfform, substrat, ablauf, notiz, intervall.
- **Rangfolge beim stillen Schreiben**, geprüft in `aenderungSetzen`: `hand` schlägt `ki`, `ki` schlägt `bib`. Ein Wert niedrigeren Rangs wird verworfen, der bestehende Stempel bleibt stehen. Gleicher Rang überschreibt. Die Rangfolge gilt nur für das, was ohne Nachfrage geschrieben wird — ein ausdrücklich angetippter Knopf schreibt immer.
- **Neue Lesefunktion `herkunftVon(p, feld)`**: liefert den Stempel, und `bib` für alles ohne Eintrag. Altdaten werden dadurch beim Lesen ausgelegt und nicht umgeschrieben.
- **Doktor-Abgleich bleibt vollständig.** Alle abweichenden Felder stehen weiter in der Liste, auch die mit Stempel `hand`. Diese tragen den Vermerk „von dir gesetzt“ und lassen sich einzeln mit einem Tipp übernehmen. Nur „Alles übernehmen“ überspringt sie, damit ein Tipp nicht mehrere eigene Einträge auf einmal wegräumt; der Knopf sagt dazu, wie viele er stehen lässt.

## Nicht angefasst

`giftEigenSetzen` und die Giftstatus `fest` / `strittig`, `AB_FELDER` als Liste, `ANTWORT_FORMAT`, `dokPromptBauen`, `dokArtZeigen`, das Anlegen-Formular, die Karte, der Grundriss, die Gieß- und Lernlogik, `TOUR_KAPITEL`, die Bibliothek selbst. Altdaten werden nicht umgeschrieben.

## Risiken

- **18 Aufrufer, jeder einzeln zuzuordnen.** Ein falsch gesetzter `hand`-Stempel hält künftige stille Übernahmen von diesem Feld fern.
- **Der Vorgabewert `hand` ist bewusst streng.** Ein vergessener Aufrufer sperrt lieber das stille Schreiben, als eine eigene Eingabe zu überschreiben. Ein übersehener Fall fällt trotzdem erst am Gerät auf.
- **Zwei Rangfolgen nebeneinander.** Gift entscheidet über `status`, alles andere über `quellen`. Wer den einen Weg liest, erwartet den anderen.
- **Altbestand.** Was Chris vor dieser Fassung von Hand eingetragen hat, gilt als `bib` und ist für einen KI-Wert offen. Ein einmaliges Umschreiben wäre die Alternative, würde aber Werte festschreiben, deren Herkunft niemand kennt.
- **`S.edits` wächst.** Jede Pflanze bekommt ein weiteres Objekt. Bei großen Sammlungen zählt das für den lokalen Speicher.
- **Die eine Zeile mehr im Abgleich** macht den Kasten länger. Auf schmalem Gerät kann der Vermerk umbrechen.

## Prüfung

pruef.js prüft: `aenderungSetzen` ohne drittes Argument stempelt `hand`; ein `bib`-Wert überschreibt weder einen `ki`- noch einen `hand`-Wert, ein `ki`-Wert keinen `hand`-Wert, gleicher Rang überschreibt; der Stempel überlebt, wenn ein Wert verworfen wird; `herkunftVon` liefert `bib` für ein Feld ohne Eintrag und den Stempel, sobald einer da ist; eine Übernahme aus dem Doktor stempelt `ki`, eine Eingabe über die Bearbeiten-Box stempelt `hand`; ein Feld mit Stempel `hand` steht weiter in `dokVorschlaege` und trägt den Vermerk; die Einzelübernahme greift auch bei `hand`; „Alles übernehmen“ lässt Felder mit Stempel `hand` stehen und ändert die übrigen; die Stempel überstehen Sichern und Laden einer Sicherungsdatei; keines der sieben Felder verliert seinen Wert durch die Umstellung.

Nicht durch Tests abgedeckt — nur am Handy prüfbar: Lesbarkeit des Vermerks und die Zeilenumbrüche im Abgleich auf schmalem Gerät, die Lage des Kastens über Gift- und Artkasten.

## Größe

Mittel.

---

# Ausblick — noch nicht freigegeben

## D — Sorten

Feld `sorte` an der Pflanze, Freitext vom Nutzer. Karte und Listen zeigen die Sorte hinter dem Artnamen. Der Auftrag beschreibt sichtbare Sortenmerkmale, statt einen Namen zu raten. Größe: klein.

## E — Sammel-Anlegen

Mehrere Fotos wählen, je Pflanze eine eigene Anfrage gleichzeitig, Durchwinkliste, Standort einmal für alle. Größe: groß — Aufteilung: E1 Fotos und parallele Anfragen, E2 Durchwinkliste.

## F — KI im Rundgang

Noch Idee, kein Plan. Wird besprochen, wenn C bis E stehen.

## T — App-Rundgang neu (zuletzt)

Kompletter Neubau von `TOUR_KAPITEL` (index.html ab 27806, 16 Kapitel). Größe: **groß**, Aufteilung in vier Etappen: **T1** Runde und Einrichtung, **T2** Sammlung, Karte, Heute, Gießmodus, Rundgang, **T3** Werkzeuge, Doktor, Substrat, Grundriss, Zeichenfläche, Vermehren, **T4** Mehr, Sicherung, Urlaub und ein neues Kapitel KI-Dienst.

Am 14.09.2026 am Ist-Stand belegte Abweichungen, damit sie nicht noch einmal gesucht werden müssen:

- `einricht`, Schritt „Die KI fragen“ beschreibt Kopieren-und-Einfügen. Ist: Drei-Fotos-Forderung, Modellwahl, Bilderfeld `#ki-direkt-anlegen`, Knopf „Fragen“ (`#btn-gemini`); der Kopierweg liegt zugeklappt unter `#neu-alt`.
- `einricht` kennt Stufe 4 nur halb: Kulturform `#f-kultur`, Topfart, Durchmesser-Schieber `#f-topf`, Substrat und Abzugsloch (`#al-topf`) kommen nicht vor, der Schritt zeigt nur auf `#al-pflege`.
- `einricht` kennt den Doktor-Anstoß nach dem Anlegen nicht (`.km-anstoss`, index.html 14338).
- Kein Kapitel nennt den Schlüssel unter Mehr › KI-Dienst (`[data-mh="kidienst"]`), ohne den der direkte Weg nicht läuft.
- `runde`, Schritt 5 nennt sechs Werkzeuge. Ist: sieben — Doktor, Umtopfen, Gießplan, Substrat, Vermehren, Stammbaum, Grundriss.
- `runde`, Schritt 6 nennt den KI-Dienst nicht.
- `werkzeuge` heißt „Die drei Werkzeuge“ und beschreibt drei.
- `sammlung`, Schritt „Drei Ansichten“ trägt eine überholte Umzugsnotiz.
- `mehr` hat vier Schritte; Bibliothek, KI-Dienst, Aufgaben, Wetter und Tiere fehlen.
- Nach C, D und E kommen weitere Abweichungen dazu — die Liste ist vor T neu zu prüfen, nicht ungeprüft zu übernehmen.

Geprüft und richtig: die vier Reiter der Karte, die sechs Werkzeuge der Zeichenfläche, die fünf Stufen im Anlegen. Bestehende Prüfungen, die am Wortlaut hängen: „Sie hat sieben Schritte“ (runde), der Regex auf „Mehr › App Tour“ im Schlussschritt, „Das Mehr-Kapitel zeigt nicht mehr auf ansicht“, „Alle Kapitel stehen zur Wahl“ (zählt `Object.keys(TOUR_KAPITEL).length`).
