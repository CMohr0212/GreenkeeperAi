# Änderungen

Was sich in jeder Fassung getan hat — Funktionen und Bedienung, keine Technik.

---

## 1.9 — 22. August 2026
**Erklärungen beim ersten Mal**

### Neu
- Die App erklärt sich jetzt selbst — aber nicht am Stück, sondern dort, wo man gerade steht. Beim ersten Öffnen eines Bereichs legt sich eine kurze Erklärung über die Seite: der Rest verblasst, ein Pfeil zeigt auf das, worum es geht. Danach kommt sie von allein nicht wieder.
- Der Willkommensblock endet nicht mehr im leeren Formular, sondern führt Schritt für Schritt durch das Anlegen der ersten Pflanze. Dabei ist immer nur der Knopf antippbar, um den es gerade geht — man kann sich nicht verlaufen. Wegtippen geht in jedem Schritt.
- Erklärungen für die Sammlung, die Pflanzenkarte und den Heute-Reiter. Weitere Bereiche folgen in der nächsten Fassung.
- Innerhalb einer Erklärung lässt sich zurückblättern. Ein versehentlich weggetippter Schritt ist damit nicht verloren — man muss nicht das ganze Kapitel wiederholen.
- Neuer Abschnitt „Erklärungen“ unter „Mehr“: alle Kapitel einzeln noch einmal ansehen, alle zurücksetzen oder ganz abschalten.

### Besser
- Wer die App schon benutzt, bekommt nach diesem Update keine einzige Erklärung vorgesetzt. Alle Kapitel gelten für bestehende Sammlungen als gesehen und stehen unter „Mehr“ bereit, falls man doch hineinschauen will.
- Springt man von einer Pflanzenkarte aus in ein Werkzeug, erscheint die Erklärung trotzdem. Wer auf diesem Weg zum ersten Mal irgendwo landet, braucht sie eher mehr als weniger — und ist mit einem Tipp wieder draussen.

### Behoben
- Fehlt ein Element, auf das eine Erklärung zeigen wollte — etwa der Teilen-Knopf auf einem Gerät ohne Teilen-Funktion —, wird der Schritt still übersprungen, statt ins Leere zu zeigen.

---

## 1.8 — 22. August 2026
**Gattungstabelle**

### Neu
- Neue Gattungstabelle mit rund achtzig Sammlergattungen. Sie liefert Familie, Wuchsform und Pflegeeigenschaften für Arten, die nicht in der Bibliothek stehen — Anthurium, Hoya, Dischidia, Homalomena, Labisia, Rhaphidophora, Scindapsus, Platycerium, alle Karnivorengattungen, Blattkakteen, Caudexpflanzen und mehr. Sammler kaufen Sorten, keine Arten; ein Artenverzeichnis kann das nie einholen, eine Gattung schon.
- Panaschierte Sorten werden am Namen erkannt. Weiße Blattteile haben kein Chlorophyll, brauchen deshalb mehr Licht als die grüne Form und verbrennen zugleich schneller in praller Sonne.
- Neun Pflegeeigenschaften werden pro Pflanze ermittelt, darunter bereifte Blätter, behaarte Blätter, Empfindlichkeit gegen Seifensprays, Substrat das nie abtrocknen darf, und der Unterschied zwischen Pflanzen, bei denen kein Wasser ins Herz gehört, und Bromelien, bei denen der Trichter gefüllt sein muss.

### Besser
- Giftigkeit wird jetzt auch für selbst angelegte Pflanzen ohne Bibliothekstreffer bestimmt. Bisher blieb das Familienfeld dort leer, wodurch keine einzige Familienregel griff — eine selbst angelegte Alocasia galt als unbedenklich, obwohl alle Aronstabgewächse Calciumoxalat enthalten.
- Familiennamen der Gattungstabelle folgen der Schreibweise der Bibliothek.

### Behoben
- In der Zustandsauswahl konnten Blüte und Winterruhe bei Arten, die den Code auch in der Bibliothek tragen, doppelt erscheinen. Die Liste wird jetzt entdoppelt.
- Ein von Hand bearbeiteter Sicherungseintrag mit einer Zahl statt eines botanischen Namens brachte die Artzuordnung zum Absturz.
- Hoya wurde über die Familienregel für Hundsgiftgewächse als schwer giftig eingestuft. Das trifft auf Oleander und Adenium zu, nicht auf Hoya: die ASPCA führt sie ausdrücklich als ungiftig für Katzen, Hunde und Pferde. Gattungen mit geprüfter Angabe schlagen jetzt die Familienregel. Dischidia bleibt bewusst bei unklar, weil dafür keine geprüfte Angabe vorliegt.

---

## 1.7 — 22. August 2026
**Gehärteter KI-Prompt**

### Neu
- Die Frage an die KI verlangt die Antwort jetzt in einem Codeblock. Das ist der wirksamste Schutz, den es ohne Programmierschnittstelle gibt: innerhalb eines Codeblocks setzt kein Chatdienst Fettschrift, Überschriften oder Aufzählungspunkte, und Vorwort wie Schlussfloskel bleiben draußen. Die App wertet dann nur noch den Blockinhalt aus.
- Der Prompt nennt für jedes Feld mit fester Wortliste ausdrücklich die erlaubten Wörter, zeigt eine vollständige Musterantwort, führt eine Gegenliste mit typischen Fehlern und endet mit sechs Prüffragen zum Abhaken.
- Sortenerkennung auf Sammlerniveau: Erkennt die KI eine Sorte sicher, hängt sie sie in einfachen Anführungszeichen an den botanischen Namen. Erkennt sie sie nicht sicher, muss sie sie weglassen — geratene Sortennamen sind ausdrücklich verboten, weil panaschierte Sorten am Foto oft nicht unterscheidbar sind.
- Panaschierung wird abgefragt und im Feld Wuchsform vermerkt.

### Besser
- Fehlt der Codeblock, wertet die App weiterhin den ganzen Text aus. Der Block ist eine Absicherung, keine Bedingung.
- Antwortet ein Dienst mit mehreren Codeblöcken, wird der mit den meisten Feldzeilen genommen statt einfach der erste.
- Bricht ein Dienst die Antwort ab und schließt den Codeblock nicht, wird trotzdem ausgewertet.
- Der Prompt verlangt, dass jede Zeile vorkommt — auch bei Wissenslücken, dann mit dem Wort unbekannt.

### Behoben
- Platzhalter wie unbekannt, unklar oder ein Bindestrich landeten als echter Wert im Steckbrief. Sie werden jetzt verworfen.
- Vier statt drei Backticks, Sprachangaben am Codeblock und Windows-Zeilenenden führten dazu, dass die Antwort nicht erkannt wurde.

---

## 1.6 — 22. August 2026
**Genauere KI-Bestimmung**

### Neu
- Die Frage an die KI wird beim Anlegen genauso zusammengebaut wie beim Pflanzendoktor: Raum, Stellplatz, eingetragener Lichtbedarf und der laufende Monat gehen mit. Steht die Art schon fest, kommt ihr Soll-Lichtbedarf aus der Bibliothek dazu — die KI muss den Standort dann nicht mehr aus dem Foto erraten.
- Steht eine Pflanze im Grundriss, schickt die App die tatsächlich gemessenen Sonnenstunden dieses Platzes mit. Das ist belastbarer als jede Schätzung am Bild.
- Neuer Hinweis auf der Pflanzenkarte, wenn an einem Platz deutlich mehr oder weniger Sonne ankommt, als für die Art üblich ist. Er nennt die gemessene Stundenzahl und den Sollwert, verbietet aber nichts: die Pflanze darf stehen bleiben, wo sie steht.
- Pflegehinweise lassen sich einzeln mit dem × wegklicken oder unter Mehr › Ansicht komplett abschalten. Warnungen zu Giftigkeit, Quarantäne und Wasserqualität sind davon nicht betroffen.
- Maßnahmen kommen strukturiert zurück: Auslöser, Handlung, Dringlichkeit und Wiederholung stehen getrennt. Aufgaben tragen dadurch ihren Anlass und den Wiederholungsabstand im Text, und was die KI als „sofort" einstuft, landet unter „Jetzt" statt unter „Diese Woche".
- Standardratschläge werden aussortiert, bevor sie zu Aufgaben werden. „Heller stellen" erscheint nur noch, wenn an diesem Platz tatsächlich zu wenig Sonne ankommt.

### Besser
- Die KI muss jetzt sagen, ob Blattunterseiten und Blattachseln auf dem Foto überhaupt zu erkennen waren. Waren sie es nicht, darf sie einen Schädlingsbefall nicht mehr ausschließen — bisher kam gelegentlich ein beruhigendes „keine Schädlinge" zurück, das auf nichts beruhte.
- Nennt die KI einen Schädling, muss sie die Fundstelle angeben: Blattachsel, Blattunterseite, Stängel oder Erdoberfläche. Sieht sie die Stelle nicht, muss sie den Verdacht ausdrücklich als unbestätigt kennzeichnen.
- Unscharfe, zu dunkle oder angeschnittene Fotos muss die KI als solche benennen. Der Hinweis mit dem Auftrag für die zweite Aufnahme erscheint dann wie bisher.
- Anlegen und Pflanzendoktor benutzen dieselbe Antwortstruktur. Bisher waren es zwei getrennte Listen, die sich mit der Zeit auseinandergelebt hatten.
- Die Schädlingsbehandlungen des Pflanzendoktors stehen jetzt an einer Stelle und werden von der KI-Auswertung mitbenutzt, statt doppelt gepflegt zu werden.
- Die Bibliothek hat ein Feld für artspezifische Schädlingshinweise bekommen. Wo eine Art anders behandelt werden muss als üblich, geht dieser Hinweis der Standardmaßnahme vor.

### Behoben
- Antwortete eine KI mit Überschriften statt mit Schlüsselwortzeilen — „### Zustand" statt „ZUSTAND:" —, wurde der gesamte folgende Abschnitt an das zuletzt erkannte Feld angehängt. Im botanischen Namen standen dann halbe Kapitel.
- Beschriftungen wurden nur bei wortgenauer Übereinstimmung erkannt. „Giftig für Katzen: ja" ging deshalb verloren, obwohl eindeutig war, was gemeint ist.
- Abschiedsfloskeln wie „Ich hoffe, das hilft dir weiter" landeten mit in den Maßnahmen und wurden zu einer Aufgabe.
- Mehrere Maßnahmenzeilen überschrieben sich gegenseitig; übrig blieb nur die letzte.
- Beim Anlegen wurden Maßnahmen am Halbgeviertstrich zerschnitten, wodurch Halbsätze als Aufgaben endeten.

---

## 1.5 — 22. August 2026
**Aufgeräumt**

### Neu
- Oben rechts steht klein, wann du zuletzt eine Sicherung heruntergeladen hast. Ist sie älter als fünf Tage, färbt sich die Zeile. Antippen führt zur Sicherung.
- Gruppenaufgaben lassen sich als Ganzes abhaken. Der Haken links erledigt alle Pflanzen der Gruppe auf einmal, die Zahl rechts klappt sie einzeln auf — wer nur eine Pflanze erledigen will, macht das weiterhin dort.

### Besser
- Neue Pflanzen legst du ausschließlich über den runden Knopf unten rechts an. Der Block „Pflanze hinzufügen" steht nicht mehr dauerhaft in der Sammlung herum; er erscheint erst, wenn du den Knopf drückst. Beim allerersten Start führt weiterhin der Willkommensblock hin.
- Gruppieren ist ein Auswahlfeld geworden, und beides — Gruppieren und Filter — liegt hinter dem Knopf „Filter" neben der Suche. Sind Filter gesetzt, steht ihre Zahl am Knopf. Sichtbar bleibt nur die Suche.
- Die Zeile über jeder Reiterüberschrift mit Sammlung, Pflanzenzahl und Datum ist weggefallen, ebenso der Erklärabsatz darunter.
- Die Feuchte-Skala ist verschwunden. Ab einer gewissen Zahl Pflanzen standen die Marken übereinander und die Angabe steht ohnehin auf jeder Karte. Die Zeichenerklärung bleibt.
- Die Meldung neuer Arten nennt nur noch, was die Art benennt: deutscher und botanischer Name. Standort und Anlagedatum sind raus, und ein in Klammern angehängter deutscher Name wird nicht mehr doppelt gezeigt.
- Werden in einer Fassung Arten ergänzt, stehen sie in den Änderungen als aufklappbare Liste mit Anzahl — nicht mehr einzeln ausgeschrieben.

### Behoben
- Beim Anlegen stand „über 400 Arten" in der Bibliothek. Es sind knapp 250 — die Zahl war nie angepasst worden.
- Der Knopf „Filter" neben der Suche war zweimal verdrahtet und ging beim ersten Antippen nicht auf.

### Bibliothek
Drei Arten ergänzt: Königsbegonie (Begonia rex-cultorum), Elatior-Begonie (Begonia x hiemalis), Dreifarbiger Kletterphilodendron (Philodendron hederaceum Brasil).

---

## 1.4 — 21. August 2026
**Anlegen, Pflanzendoktor und Fotos**

### Neu
- Neue Pflanzen legst du über den runden Knopf unten rechts an. Er ist in der Sammlung immer erreichbar, egal wie weit du gescrollt hast — die alten Knöpfe im Fließtext sind dafür weggefallen.
- Das Anlegen-Formular fragt jetzt zuerst, wie du vorgehen willst: Art in der Bibliothek suchen oder von einer KI bestimmen lassen. Nur der gewählte Weg wird angezeigt.
- Knopf „Formular leeren": setzt alle Felder auf Anfang zurück, wenn die eingefügte Antwort zur falschen Pflanze gehörte oder die Bestimmung daneben lag.
- Der Pflanzendoktor nimmt Fotos direkt entgegen — sie landen in der Galerie der gewählten Pflanze.
- Nach einer KI-Antwort gleicht der Doktor den Steckbrief ab und zeigt nur, was fehlt oder abweicht: Botanisch, Wuchsform, Gießklasse, Licht, Katzen, wichtiger Hinweis, Frostgrenze. Einzelne Zeilen lassen sich verwerfen, der Rest wandert auf einen Knopfdruck in die Karte.
- Sagt die KI, dass sie sich nicht sicher ist, steht jetzt da, was sie auf dem Foto nicht erkennen kann und welche zweite Aufnahme die Bestimmung sicher machen würde.
- Fotos haben ein Dreipunktmenü: eines als Profilbild festlegen oder das Bild löschen. Vor dem Löschen wird gefragt.
- Die Aufgabenliste unter „Heute" trennt jetzt „Jetzt" von „Diese Woche".

### Besser
- Ohne Spitznamen zeigt die Karte „Botanischer Name (deutscher Name)" statt der internen Kennung. Das Namensfeld bleibt frei und ist wieder das, wofür es gedacht war: für Spitznamen.
- Die Frage an die KI fragt zusätzlich nach Wuchsform, Gießklasse und Frostgrenze — bei Arten außerhalb der Bibliothek blieben diese Felder bisher leer.
- Vermehren, Stammbaum, Gießplan und Wunschliste sind in der Sammlung zu aufklappbaren Blöcken geworden, wie schon bei Werkzeuge und Mehr. Die Feuchte-Skala und die Kartenliste bleiben wie sie waren.
- Erklärtexte stehen überall hinter dem i-Knopf statt dauerhaft im Weg — auch bei der Feuchte-Skala, beim Anlegen und bei den offenen Punkten.
- Das Profilbild gilt jetzt überall gleich: auf der Kachel, im Gießmodus, im Rundgang und auf dem Urlaubszettel. Fotos aus dem Pflanzendoktor werden nie von selbst zum Profilbild, weil sie meist Schäden zeigen.
- Die App heißt überall GreenkeeperAi — auch auf dem Startbildschirm, wo bisher „Pflanzen" stand.

### Behoben
- Eine Lichtangabe „hell, indirekt" wurde als volle Sonne gelesen, weil „indirekt" das Wort „direkt" enthält. Außerdem kannte die Übernahme beim Anlegen die Stufe „Schatten" nicht und machte daraus „hell indirekt".
- Der Kasten „Kurzeintrag — diese Pflanze hast du selbst angelegt" ist verschwunden. Am Ende sind alle Pflanzen selbst angelegt, der Hinweis sagte nichts aus.
- Der Knopf „Im Raum" in der Karte ist weggefallen — das Abteil „Lage" macht dasselbe.
- Doppelte Erklärungen entfernt: der Installationstext stand in drei Fassungen da, der Hinweis unter den Rückmelde-Knöpfen wiederholte den i-Text, und das 130-cm-Fensterbeispiel stand zweimal im Grundriss.

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
