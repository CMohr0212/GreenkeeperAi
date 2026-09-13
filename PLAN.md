# PLAN — Etappe B · Doktor bewertet mit den Ist-Werten

Freigegeben: 12.09.2026 · Zielversion: 3.16.0 (sw.js greenkeeperai-v110)

## Ziel

Der Pflanzendoktor bekommt Topfdurchmesser, Topfform, Substrat, Ablauf und Kulturform der Pflanze mit und bewertet sie, statt sie am Foto zu schätzen.

## Änderungen

- **Ist-Werte im Auftrag.** `dokPromptBauen` schreibt nach den Standortzeilen einen Block „Das ist zu dieser Pflanze eingetragen“ mit je einer Zeile für gesetzte Werte: Topfdurchmesser in cm (aus `p.topf`), Topfform (Name aus `TOPFFORMEN`), Substrat (Name aus `SUBSTRATARTEN`), Wasserablauf (ja / nein aus `p.ablauf`), Kulturform (aus `p.substrat`: `wasser` → Wasserkultur, `blaehton`/`seramis` → Hydrokultur, sonst Erdkultur). Nicht eingetragene Werte erzeugen keine Zeile. Ist gar nichts eingetragen, entfällt der Block ganz.
- **Neue Funktion `mitIstWerten(txt, p)`**: sie hängt an die vorhandenen Feldzeilen des Doktor-Formats zusätzliche Sätze an, statt Textstellen wörtlich zu ersetzen. Sie läuft als letzte der drei Formatfunktionen und nur, wenn die TOPF-Zeile noch vorhanden ist.
  - Ist `p.topf` gesetzt: Das Größenurteil wird gegen die eingetragene cm-Zahl und die Art gefällt, nicht am Bild geschätzt; die Empfehlung muss eine Zielgröße in cm nennen, die von der eingetragenen Zahl abweicht, oder genau „kein Umtopfen nötig“. Prüflistenpunkt 7 bekommt denselben Zusatz.
  - Ist `p.ablauf` `ja` oder `nein`: Feld 3 übernimmt die eingetragene Angabe. Eine abweichende Beobachtung am Foto gehört in FEHLT, nicht ins Urteil.
  - Ist `p.topfform` gesetzt: Feld 2 nennt die eingetragene Form und ergänzt nur, was am Foto zusätzlich zu sehen ist.
  - Ist `p.substrat` gesetzt: BEFUND bekommt einen Satz dazu, ob das Substrat für diese Art taugt; passt es nicht, folgt eine MASSNAHME zum Wechsel.
  - Feldzahl, Reihenfolge und die drei senkrechten Striche der TOPF-Zeile bleiben unverändert; es kommt kein Schlüsselwort hinzu.
- **Art-Gegenprüfung mit Übernehmen-Knopf.** Der Doktorkopf verlangt: ART nur dann abweichend benennen, wenn am Foto eindeutig eine andere Art zu sehen ist, und dann SICHERHEIT auf hoch. Neuer Kasten `#dok-art` unter dem Giftkasten, gezeichnet von `dokArtZeigen(d)` — nur wenn die gelesene ART von `p.art` abweicht **und** SICHERHEIT hoch ist. Er zeigt alten und neuen Namen und hat zwei Knöpfe: „Art übernehmen“ (`art-nehmen`) und „So lassen“ (`art-lassen`).
  - `art-nehmen` setzt `art` und, wenn der Doktor einen botanischen Namen nennt, `botanisch`. Danach wird der Giftwert neu ermittelt — außer sein Status ist `fest` oder `strittig`, dann bleibt die eigene Angabe stehen und der Kasten sagt das.
  - Ohne Antippen ändert sich nichts. Der Kasten verschwindet nach jeder der beiden Antworten.
- **Nichts ohne Antippen.** Alles, was diese Etappe neu baut, ändert eine Pflanze erst auf einen ausdrücklichen Knopfdruck.

## Nicht angefasst

`ANTWORT_FORMAT` (die Konstante bleibt zeichengleich; geändert wird nur die Kopie, die der Doktor baut), `topfLesen` und das Vier-Felder-Format, Anlegen-Auftrag und Anlegen-Formular aus A1/A2, `massnahmenLesen`, `topfHTML`, `topfMassnahme`, Umtopf-Vormerkung, der Giftabgleich selbst, `AB_FELDER`, Karte, Rundgang, Grundriss, Gieß- und Lernlogik, Altbestand, App-Rundgang (Tour).

## Risiken

- Der Doktor-Auftrag wird länger. Bei Pflanzen mit allen Werten kommen rund acht Zeilen dazu — mehr Text heißt mehr Stellen, an denen eine Antwort ausschert.
- Ein falsch eingetragener Topfwert wird jetzt zur Grundlage des Urteils. Er lässt sich in der Karte ändern, aber bis dahin urteilt der Doktor auf der falschen Zahl.
- Der Artkasten kann bei falsch bestimmten Altpflanzen häufig erscheinen. Er ändert nichts von selbst, aber er kostet Aufmerksamkeit.
- Ein Artwechsel zieht die Giftfrage nach sich. Neu ermitteln kann eine hinterlegte Angabe verschieben; deshalb bleiben `fest` und `strittig` unangetastet.
- Altpflanzen ohne Topfwerte laufen auf dem alten Weg weiter. Zwei Verhalten nebeneinander sind zwei Verhalten zum Prüfen.
- `ohneTopf` und `mitIstWerten` fassen dieselbe Zeile an. `mitIstWerten` läuft deshalb zuletzt und nur, wenn die TOPF-Zeile noch da ist.

## Prüfung

pruef.js prüft: Der Ist-Werte-Block steht im Auftrag, sobald Werte an der Pflanze liegen, und fehlt ganz ohne Werte; jede gesetzte Angabe erscheint mit ihrem Klartextnamen, keine nicht gesetzte; `mitIstWerten` ändert die TOPF-Zeile nur bei gesetztem `p.topf` und lässt Feldzahl und Strichzahl unverändert; bei `ablauf: 'ja'` steht die Vorgabe im Text, bei leerem Ablauf nicht; `ANTWORT_FORMAT` ist nach jedem Auftragsbau zeichengleich unverändert; bei frisch umgetopfter Pflanze bleibt die TOPF-Zeile fort und `mitIstWerten` hängt nichts an; die Prüfliste bleibt lückenlos durchnummeriert und die Schlüsselwortzahl unverändert; eine Musterantwort mit abweichender ART und SICHERHEIT hoch erzeugt den Artkasten, dieselbe Antwort mit SICHERHEIT mittel nicht, gleiche ART nie; das bloße Zeichnen des Kastens ändert keine Pflanze; `art-nehmen` setzt Art und botanischen Namen, `art-lassen` nicht; ein Giftwert mit Status `fest` überlebt den Artwechsel.

Nicht durch Tests abgedeckt — nur am Handy prüfbar: Länge des Doktor-Auftrags im Kopierfeld, Ebenen des Artkastens über dem Abgleich, Lesbarkeit des Kastens auf schmalem Gerät.

## Größe

Mittel.

---

# Offen daneben

- **App-Rundgang (Tour) braucht ein komplettes Remake.** Eigene Etappe, eigene Sitzung — nach Regel 4.1 nicht Teil dieser Etappe.
