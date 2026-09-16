# PLAN — GreenkeeperAI

Stand 16.09.2026 · Ausgangsfassung 3.20.0 · **Zielversion 3.21.0, sw.js greenkeeperai-v116**

Erledigt und nicht mehr hier: Etappe A bis D, E1 „Der Lauf“ (3.19.0), Lösch-Fix (3.19.1), Kartei-Seite (3.20.0). Der Verlauf steht im CHANGELOG.

Verworfen am 16.09.2026: die Pläne E2a und E2 „Abgleich-Fenster mit allen Angaben“. Chris hat den Zweck der Kartei neu gesetzt (siehe unten).

Offen sind: **E2** (unten, freigegeben), **E3** Pflegetexte, **E4** Sorte, danach Sammel-Anlegen, **F** und **T**.

## Zweck der Kartei, von Chris am 16.09.2026 gesetzt

- Die Kartei hält die Pflanzenkarten auf dem neuesten Stand: Steckbriefdaten, die Sorte und art- oder sortenspezifische Pflegetexte.
- Nichts, was jede Pflanze braucht. Keine Töpfe, kein Zustand, kein Befund, keine Maßnahmen — das bleibt beim Doktor.
- Geprüft werden feste Daten wie Frost und Felder, die das Anlegen leer gelassen hat.
- Pflegetexte wie bei der Venusfliegenfalle („Pflegeschritte“, „Winterruhe“): die KI schreibt sie, wo keine da sind, und gleicht sie ab, wo welche da sind.
- Die Sorte ermittelt die KI, am besten schon beim Anlegen.
- Der Doktor verliert den Abgleich der Steckbriefdaten, den übernimmt die Kartei.

## Aufteilung (Regel 3.4, Regel 4.1)

Alles zusammen sind drei Themen und ist groß. Vorschlag: drei Sitzungen, je eine Version.

- **E2** (3.21.0): Kartei fragt nur noch Steckbriefdaten, Abgleich-Fenster, Doktor ohne Steckbrief-Abgleich.
- **E3** (3.22.0): Pflegetexte durch die KI.
- **E4** (3.23.0): Sorte durch die KI, im Anlegen und in der Kartei.

E2 zuerst, weil E3 und E4 das Fenster aus E2 benutzen.

---

# Freigegeben — Etappe E2 · Steckbrief-Abgleich

Freigabe von Chris am 16.09.2026 · Zielversion 3.21.0, sw.js greenkeeperai-v116.

## Ziel

Die Kartei fragt nur noch Steckbriefdaten ab, ein Fenster je Pflanze zeigt jede abweichende Angabe als „alt → neu“ mit eigenem Knopf, und der Doktor zeigt keinen Steckbrief-Abgleich mehr.

## Befund

- **Belegt** (Code): Der Auftrag „teil“ (Foto, keine Lücken) fragt nur MERKMALE, FEHLT, ZUSTAND, BEFUND, TOPF und MASSNAHME. Laut Mehr („Alles ausgefüllt“) trifft das bei Chris auf jede Pflanze mit Foto zu. Der Lauf ist heute im Kern ein Doktor für die Sammlung.
- **Belegt** (Code): Der Auftrag „voll“ fragt zusätzlich ZUSTAND, BEFUND, SUBSTRAT, TOPFART, ABLAUF, TOPF und MASSNAHME.
- **Belegt** (Code): Das Anlegen ohne Bibliothekstreffer lässt Familie, Frostgrenze und Düngebedarf leer. Die Frostangabe der KI landet dort nur als Satz in der Notiz.
- **Belegt** (Code): Bei Arten aus der Bibliothek liest die Karte Familie, Wuchsform und Frostgrenze bei jedem Öffnen frisch aus der Bibliothek, wenn das Feld an der Pflanze leer ist.
- **Belegt** (Code): „Ausgewählte noch einmal prüfen“ legt `S.kartei` neu an. Die Ergebnisse aller nicht angehakten Pflanzen gehen verloren.
- **Belegt** (Code): Der Doktor zeigt vier Steckbrief-Kästen: Abgleich (`AB_FELDER`), andere Art, Sortenmerkmale, Giftangabe. Die Vermehrungswege legt er ohne Knopf ab.
- **Belegt** (Code): Die Gießart wird im Anlegen mitten im Code gelesen, es gibt keine eigene Funktion. Die Art-Übernahme samt Gift-Neuberechnung steht nur im Klick-Code des Doktors.
- **Belegt** (Code): Ein Ergebnis speichert keinen Zeitpunkt je Pflanze.
- **Belegt** (Code): Fenster über `modalAuf` legen einen Verlaufseintrag an. Zurück am Gerät schließt das Fenster.

## Änderungen

**Auftrag an die KI**
- Es gibt nur noch zwei Aufträge: mit Foto und ohne Foto. Jede gewählte Pflanze bekommt ihn, auch ohne Lücken (Annahme A6).
- Gefragt wird: ART, BOTANISCH, SICHERHEIT, FAMILIE (neu), TYP, SPEICHER, LICHT, GIESSKLASSE, GIESSART, DUENGER (neu), FROST, WICHTIG, KATZEN, VERMEHRUNG. Mit Foto zusätzlich MERKMALE.
- Nicht mehr gefragt: ZUSTAND, BEFUND, TOPF, TOPFART, SUBSTRAT, ABLAUF, MASSNAHME, FEHLT, VERWECHSLUNG.
- FAMILIE und DUENGER bekommen eine Zeile im Format und einen Schlüssel im Leser. DUENGER nur mit einem der Wörter „nie“, „sparsam“, „normal“.
- Der Kopf sagt: Das ist ein Abgleich der Artdaten, keine Bestimmung und keine Diagnose.

**Ergebnisliste** (Ansicht nach dem Lauf)
- Jede Zeile nennt die Zahl der offenen Abweichungen: „3 Abweichungen“, „Keine Abweichung“. Bei einem Fehler steht wie bisher der Fehlertext.
- Ein Tipp auf den Namen öffnet das Abgleich-Fenster. Das Kästchen links dient nur „Ausgewählte noch einmal prüfen“.
- Der Satz „kommt in der nächsten Fassung“ entfällt. Stattdessen: „n Pflanzen mit Abweichungen. Tipp auf einen Namen zum Durchsehen.“
- Pflanzen, die es nicht mehr gibt, fallen aus dem Ergebnis.
- Eine Pflanze ohne offene Zeile verschwindet aus der Liste (A2). Ist keine mehr offen, wird das Ergebnis gelöscht und die Startansicht erscheint.
- Ergebnisse aus 3.20.0 werden gelesen. Angaben, die nicht mehr zur Kartei gehören (Zustand, Befund, Topf, Maßnahmen), werden nicht angezeigt.

**Abgleich-Fenster** (eine Pflanze)
- Kopf: Name, Kachelbild falls vorhanden, Datum der Antwort.
- Zuerst die Widersprüche: Felder mit Stempel `hand`, markiert mit „von dir gesetzt“. Danach der Rest.
- Jede Zeile: Feldname, alter Wert (oder „leer“), Pfeil, neuer Wert, Knopf „Übernehmen“, Knopf „×“ zum Verwerfen.
- Gezeigt wird nur, was fehlt oder abweicht.
- Kein Knopf für alles auf einmal (A3).
- Nach „Übernehmen“ verschwindet die Zeile, darunter steht „[Feld] übernommen.“, die Karte wird neu gezeichnet.
- Unten „Fertig — Rest verwerfen“: verwirft die offenen Zeilen dieser Pflanze und schließt das Fenster (A1).
- Zurück am Gerät und das × oben schließen ohne Verlust (A1).
- Hinweise ohne Knopf (Sicherheit niedrig, Giftfrage bleibt offen, Wasser- oder Hydrokultur) stehen unter dem Kopf und zählen nicht als Abweichung.

**Angaben im Fenster**
- Botanisch, Wuchsform, Gießklasse, Licht, Wichtig, Frost: über `AB_FELDER`, geschrieben mit `aenderungSetzen(…, 'ki', erzwungen)`. Gießklasse weg von S fragt über `klasseSBestaetigt` nach.
- Art: nur bei SICHERHEIT „hoch“ und abweichender Art. Knopf „Art übernehmen“ schreibt Art und botanischen Namen. Die Giftangabe wird danach neu ermittelt, außer sie ist `fest` oder `strittig`. Die Logik zieht aus dem Doktor in eine eigene Funktion.
- Familie: FAMILIE nach `familie`.
- Düngebedarf: DUENGER nach `duenger`, nur mit einem der drei Wörter.
- Sortenmerkmale: MERKMALE nach `sortenmerkmale`, nie nach `merkmale`.
- Gießart: über eine neue Funktion `giessartLesen`. Der bisherige Code im Anlegen zieht dorthin und ruft sie auf, das Anlegen verhält sich wie bisher. Wasser- und Hydrokultur nur als Hinweis.
- Speicher: nach `speicher`, nur mit einer der sechs Angaben aus `SPEICHER_GRUPPE`.
- Giftangabe: über `giftRaten` und `giftAbgleichen` (A5). „verschärft“ → „Als giftig übernehmen“. „strittig“ → „Als strittig vermerken“. „bestätigt“ → „Als bestätigt vermerken“, nur wenn die Angabe noch nicht `fest` ist. „bleibt offen“ → Hinweis. Eine Entwarnung wird nie übernommen.
- Vermehrung: über `vermehrungLesen`. Die Zeile nennt die Wege, „Übernehmen“ ersetzt vorhandene Wege, die Zeile sagt das dazu.

**Noch einmal prüfen**
- Nur die angehakten Pflanzen laufen neu. Ihre alten Ergebnisse werden ersetzt, die übrigen bleiben.
- Die Laufansicht zählt dabei nur die neu laufenden Pflanzen.

**Speicherung**
- Jedes neue Ergebnis bekommt den Zeitpunkt der Antwort. Ältere zeigen das Startdatum des Laufs.
- Übernommene und verworfene Zeilen werden in `S.kartei` vermerkt und tauchen nach einem Neustart nicht wieder auf.
- `S.kartei` schreibt nie von selbst in eine Pflanze.

**Doktor** (A4)
- Die Kästen „Das steht noch nicht so in der Karte“, „Der Doktor sieht eine andere Art“, „Sortenmerkmale am Foto“ und der Giftkasten entfallen samt ihren Knöpfen.
- Der Doktor legt keine Vermehrungswege mehr ab.
- Diagnose, Zustand, Befund, Topf und Maßnahmen bleiben wie sie sind.
- Der Auftrag des Doktors bleibt unverändert.

**Reihenfolge beim Bauen**
- Zuerst Auftrag, Liste, Fenster, Speicherung, „noch einmal prüfen“, dann `node pruef.js`. Danach der Doktor-Teil, dann wieder `node pruef.js`.
- Reicht der Kontext vor dem Doktor-Teil nicht sicher, gilt Regel 7.1. Die Kartei allein wird nur als 3.21.0 geliefert, wenn Chris das bestätigt.

**Pflichtpaket** nach Regel 6.2: FASSUNG 3.21.0, sw.js greenkeeperai-v116, PATCHNOTES-Eintrag, CHANGELOG, Versionsnummer in pruef.js.

## Annahmen — ohne Einwand gelten sie mit der Freigabe

- **A1** Zurück und × schließen das Fenster ohne Verlust. Weg sind offene Zeilen erst mit „Fertig — Rest verwerfen“ oder „Ergebnis verwerfen“. Weicht vom Zuschnitt vom 15.09. ab („kein Später“).
- **A2** Pflanzen ohne offene Zeile verschwinden aus der Ergebnisliste.
- **A3** Kein Sammelknopf.
- **A4** Der Doktor verliert alle vier Steckbrief-Kästen, auch den Giftkasten und den Art-Kasten.
- **A5** Die Giftangabe gehört zum Steckbrief. Die Kartei darf verschärfen, nie entwarnen, wie bisher der Doktor.
- **A6** Jede gewählte Pflanze wird voll abgefragt, nicht nur ihre Lücken. Das macht jede Antwort länger.

## Nicht angefasst

Pflegetexte (E3). Sorte und alles am Anlegen außer dem Herausziehen der Gießart (E4). Diagnose, Zustand, Befund, Topf und Maßnahmen im Doktor, sein Auftrag und sein stilles Schreiben von Zustand und Notiz (Backlog). `kiFragen`, Parallelität und Bremse, Anhalten und Fortsetzen, die Leiste, die Startansicht samt Kästchen, die Benachrichtigung. `aenderungSetzen`, `Q_RANG`, `giftEigenSetzen`, `fest`/`strittig`, `merkmale`, die Bibliothek. Die Statuszeile unter Mehr (Backlog).

## Risiken

- Größe: groß. Ein Abbruch mitten im Bau ist wahrscheinlicher als bei einer mittleren Etappe. Abgefangen durch die Reihenfolge oben. Eine Aufteilung in Kartei und Doktor ist möglich.
- Die Prüfungen zum Doktor-Abgleich (12 Stellen in pruef.js) fallen weg oder ziehen in die Kartei um. Dabei darf keine Prüfung verloren gehen, die sichert, dass eine KI nie entwarnt.
- Wuchsform und Wichtig sind Freitext, verglichen wird wortgleich (belegt). Vermutet: Die Antwort formuliert fast immer anders, dann erscheinen Zeilen ohne echten Unterschied.
- A6 macht jede Anfrage länger. Vermutet: Ein Lauf dauert spürbar länger und das Kontingent reicht für weniger Pflanzen.
- Der Doktor-Auftrag fragt die Steckbrief-Felder weiter ab, zeigt sie aber nicht mehr. Das kostet Antwortlänge ohne Nutzen (Backlog).
- Das Fenster vergleicht mit dem heutigen Stand der Karte, nicht mit dem Stand beim Lauf.
- „Noch einmal prüfen“ ändert `karteiStarten`, das auch der normale Start benutzt.
- Das Herausziehen der Gießart berührt das Anlegen.
- Die Rückfrage zur Gießklasse ist ein Systemdialog über dem Fenster. Nur am Handy prüfbar.
- Ob Zurück nur das Fenster schließt und nicht auch die Mehr-Unterseite, zeigt nur das Handy.

## Prüfung

pruef.js prüft, mit selbst angelegten Pflanzen und selbst eingetragenen Ergebnissen (gestubbtes `fetch` für Lauf und „noch einmal prüfen“):

- Auftrag mit und ohne Foto enthält die neuen Felder und keines der gestrichenen, auch bei einer Pflanze ohne Lücken.
- Der Leser erkennt FAMILIE und DUENGER. DUENGER mit einem anderen Wort wird nicht übernommen.
- Ergebniszeile zählt die Abweichungen, ohne Abweichung steht „Keine Abweichung“.
- Ein Ergebnis aus 3.20.0 mit ZUSTAND und TOPF zeigt diese nicht.
- Tipp auf den Namen öffnet das Fenster. Öffnen und Schließen ändert an der Pflanze nichts (Regel 10.8).
- Nur fehlende oder abweichende Felder erscheinen. Ein Feld mit Stempel `hand` steht oben mit „von dir gesetzt“.
- „Übernehmen“ schreibt genau dieses Feld mit Stempel `ki`, alles andere bleibt. Gegenprobe.
- „×“ entfernt die Zeile, die Pflanze bleibt gleich, nach `laden()` bleibt die Zeile weg. Gegenprobe.
- Art nur bei SICHERHEIT „hoch“. Übernehmen schreibt Art und botanischen Namen, eine `fest`e Giftangabe bleibt. Gegenprobe.
- Gift: „giftig“ bei ungeprüfter Art → Knopf, Übernahme verschärft. „unbedenklich“ → nie Entwarnung, bei giftiger Art strittig. Gegenprobe.
- Gießklasse weg von S mit abgelehnter Rückfrage schreibt nichts.
- Sortenmerkmale landen in `sortenmerkmale`, `merkmale` bleibt gleich.
- `giessartLesen` liefert dieselben Werte wie der bisherige Anlegen-Code. Anlegen mit „Wasserglas“ setzt weiter die Kulturform. In der Kartei nur Hinweis.
- Familie, Düngebedarf, Speicher, Vermehrung: Übernehmen schreibt genau das Feld. Ein nicht zuordenbarer Wert erscheint nicht.
- „Fertig — Rest verwerfen“ nimmt die Pflanze aus der Liste. Bei der letzten ist `S.kartei` weg und die Startansicht da.
- Schließen über Zurück lässt die Zeilen stehen.
- Eine gelöschte Pflanze fällt aus dem Ergebnis.
- „Noch einmal prüfen“ mit einer von drei Pflanzen: zwei Ergebnisse bleiben, eines wird ersetzt. Gegenprobe.
- Im Fenster kein Knopf für alles auf einmal.
- Doktor: Nach einer Antwort mit abweichenden Steckbriefdaten, anderer Art, Merkmalen, Giftaussage und Vermehrung erscheint keiner der vier Kästen, und an der Pflanze ändern sich weder Steckbrief noch Vermehrungswege. Gegenprobe.
- Doktor: Diagnose, Zustand und Maßnahmen-Auswahl erscheinen weiter.

Nicht durch Tests abgedeckt — nur am Handy prüfbar: Aussehen des Fensters, Scrollen im Fenster, Zurück-Geste, Rückfrage-Dialog über dem Fenster, Lesbarkeit langer Werte, echte Gemini-Antworten mit dem neuen Auftrag, alles in Chrome auf Android.

## Größe

Groß.

---

# Zuschnitt, nicht freigegeben — Etappe E3 · Pflegetexte durch die KI

Wird nach E2 als eigener Plan ausgeschrieben.

- **Belegt** (Code): „Pflegeschritte“ (`pflege`, Liste) und „Winterruhe“ (`winterruhe`, ja/nein) gibt es nur an Pflanzen aus dem alten, von Hand geschriebenen Bestand, etwa Viktor. Das Anlegen schreibt beide nie.
- **Belegt** (Code): Der Winterruhe-Text steht fest im Code und beschreibt die Venusfliegenfalle (3–4 Monate, 0–10 °C). Jede Pflanze mit `winterruhe` bekäme wortgleich denselben Text.
- Die Kartei fragt zusätzlich PFLEGESCHRITTE (mehrere Zeilen) und RUHEPHASE (ein Absatz oder „keine“). Nur art- oder sortenspezifisch. Allgemeines wie „bei Trockenheit gießen“ ist im Auftrag ausdrücklich verboten.
- Fehlen die Texte, zeigt das Fenster sie als neu. Sind sie da, zeigt es alt und neu nebeneinander. Übernahme je Block per Knopf, Stempel `ki`.
- Die Ruhephase bekommt ein eigenes Textfeld. Der feste Venusfliegenfallen-Text bleibt nur für Pflanzen ohne eigenes Textfeld.
- Offen: ob einzelne Pflegeschritte statt des ganzen Blocks übernehmbar sein sollen.
- Nicht in E3: Herkunft, Lebensumstände, „Wenn etwas nicht stimmt“, Beobachtungen (Backlog).

Größe: mittel.

---

# Zuschnitt, nicht freigegeben — Etappe E4 · Sorte durch die KI

Wird nach E3 als eigener Plan ausgeschrieben.

- **Belegt** (Code): Bisher nennt die KI absichtlich keinen Sortennamen, der Prüfauftrag verbietet ihn. Die Sorte tippt der Mensch. Chris hebt das am 16.09.2026 auf.
- Anlegen und Kartei fragen SORTE mit eigener Sicherheit. Die Merkmale bleiben als Begründung.
- Anlegen: Das Sortenfeld wird vorbelegt und als KI-Vorschlag gekennzeichnet. Gespeichert wird erst mit „Anlegen“.
- Kartei: Die Sorte erscheint im Fenster als Zeile mit Knopf. Eine selbst eingetragene Sorte gilt als Widerspruch.
- Risiko: Viele Sorten sind am Foto nicht sicher zu unterscheiden. Eine niedrige Sicherheit wird angezeigt, nie verschwiegen.

Größe: mittel.

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
