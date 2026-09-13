# Übergabe — GreenkeeperAI · Fassung 3.16.0 · sw v110 · 12.09.2026

## Kurz

Version: 3.16.0, sw.js greenkeeperai-v110, Prüfstand 1675 Prüfungen, alles sauber.
Nächster Schritt: App-Rundgang (TOUR_KAPITEL) komplett neu bauen — eigene Etappe, von Chris gesetzt. Etappe C (Herkunft und Rangfolge) wartet dahinter.
Offen oder kaputt: Gerätekontrollen aus 3.13.0, 3.13.1, 3.14.0, 3.15.0 und 3.16.0 alle unbestätigt. Für 3.16.0 betrifft das die Länge des Doktor-Auftrags im Kopierfeld und die Ebenen des Artkastens über dem Abgleich.
Nicht anfassen: `ANTWORT_FORMAT` bleibt zeichengleich — geändert wird nur die Kopie, die der Doktor baut.
Offener Plan: nein — B ist geliefert. PLAN.md trägt den erledigten B-Plan.

## Gescheiterte Versuche

- **Gifttest prüfte nur den Status.** „Eine eigene Giftangabe überlebt den Artwechsel“ blieb grün, obwohl die Gegenprobe den Schutz entfernt hatte: `giftErmitteln` liefert für eine Art aus der geprüften Tabelle ebenfalls `status: 'fest'`. Der Test prüft jetzt zusätzlich `quelle === 'nutzer'`. Der Test war falsch, nicht der Code richtig.
- **`artBox()` stürzte ab, statt zu melden.** Ohne den Container `#dok-art` warf der Testlauf eine TypeError und zählte null Fehlschläge — eine Gegenprobe, die nichts beweist. Der Helfer verträgt jetzt ein fehlendes Element, und eine eigene Prüfung fragt nach dem Container.
- **Ersetzungsanker nicht eindeutig.** `aenderungSetzen(dokPflanze, felder);` kam zweimal vor; die `assert`-Zeile fing es ab. Anker mit den beiden Zeilen davor gebaut.
- **Werkzeuglimit beim Liefern, zweite Sitzung in Folge.** Code und Prüflauf waren fertig, CHANGELOG und `present_files` kamen nicht mehr durch. Lehre: bei mittleren Etappen nach dem grünen Prüflauf sofort liefern, Gegenproben danach.

## Entscheidungen

- **Sätze anhängen statt Textstellen ersetzen.** `mitIstWerten` hängt an die Feldzeilen an (`formatZeileErgaenzen`, erste Fundstelle je Schlüsselwort). Eine wortgleiche Ersetzung im Antwortformat bricht, sobald dort ein Komma wandert.
- **`mitIstWerten` läuft zuletzt und nur bei vorhandener TOPF-Zeile.** `ohneTopf` nimmt sie bei frisch umgetopften Pflanzen heraus; an eine entfernte Zeile hängt man nichts. Folge: ohne TOPF-Zeile bleibt auch der Substratsatz im BEFUND weg.
- **Der Artkasten übernimmt nur auf Knopfdruck** und erscheint nur bei abweichender ART *und* `SICHERHEIT: hoch`. Ein Artwechsel zieht Giftangabe, Pflegedaten und Bibliothek nach sich.
- **Giftangaben mit Status `fest` oder `strittig` überleben den Artwechsel.** Sie neu zu ermitteln wäre eine Entwarnung, die niemand gegeben hat. Alle anderen werden für die neue Art neu ermittelt.
- **Kein neues Schlüsselwort im Antwortformat.** Die Feldzahl bleibt bei neunzehn, `topfLesen` und die Vier-Felder-Zeile sind unberührt.
- **Der Artkasten benutzt die CSS-Klasse `.giftblock warn`.** Eine eigene Klasse hätte einen neuen Spezifitätskampf eröffnet (Regel 10.3), ohne anders auszusehen.

## Backlog-Zuwachs

- **App-Rundgang komplett neu** (von Chris gesetzt, nächste Etappe): Kapitel „Einrichtung“ beschreibt den KI-Weg noch als Kopieren-und-Einfügen, kennt den Topf- und Substratblock auf Stufe 4 und den Doktor-Anstoß nach dem Anlegen nicht. Alle Kapitel einzeln gegen den Ist-Stand prüfen.
- Prüfen, ob die Giftverschärfung („Neu: diese Pflanze ist giftig“) noch zur neuen Regel 10.8 passt — der Text sagt, die Angabe werde übernommen, bevor jemand den Knopf gedrückt hat.
- Zielgröße aus dem Doktor direkt in den Topfschieber der Karte übernehmen, statt sie nur als Notiz abzulegen.
- Topfdurchmesser auf der Karte als Schieber statt als `prompt`.
- Substrat und Ablauf auf der Karte nachtragen können.
- Schnelleres Modell fürs Anlegen wählen.
- Die achtteilige Prüfliste im Doktor-Auftrag kürzen, sobald dessen Feldliste kürzer ist.
- Zeitstrahl nach Ereignisart filtern.
- Sammelvermehrung aus einem Bilderstapel.
- Lampen im Grundriss nur als Lichtkegel.
- Anbindung an Anthropic und OpenAI neben Gemini.
- „Angerührte Mischung merken“, falls je ein Auslöser entsteht.

## Offene Regeländerungen

```
ÄNDERUNG PROJEKTANWEISUNGEN → Stand 3
Aktion: NEU
Regel: 10.8
Alt: –
Neu: Eine KI-Antwort ändert nie von selbst Daten an einer Pflanze. Jede Übernahme in die Karte geschieht erst, nachdem Chris einen Knopf angetippt hat, der die Übernahme benennt.
```

Chris hat das Eintragen nicht bestätigt. Steht der Punkt in den Anweisungen, fällt dieser Abschnitt weg.
