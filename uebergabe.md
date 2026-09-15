Fassung 3.19.1 · sw.js greenkeeperai-v114 · 15.09.2026

## Kurz
Version: 3.19.1 (index.html), greenkeeperai-v114 (sw.js) — Löschen repariert, am Handy noch unbestätigt. Erst hochladen, wenn der laufende Abgleich fertig ist.
Nächster Schritt: Etappe E2 als Detailplan (Zuschnitt in PLAN.md) samt der zwei Wünsche zur Ergebnisliste — oder vorher der Gießcenter-Fehler. Chris entscheidet.
Offen oder kaputt: Gießcenter zeigt „2 überfällig“, nach dem Antippen nicht mehr (ungeprüft). Fettkraut im Winter falsch berechnet (belegt, siehe Backlog). 3.19.0: Hintergrundlauf und Benachrichtigung unbestätigt, der erste Lauf läuft, Chris ist bisher zufrieden. Gerätekontrollen 3.13.0–3.17.0 unbestätigt.
Nicht anfassen: Gift über `giftEigenSetzen` und `fest`/`strittig`. `merkmale` gehört der Bibliothek, die KI schreibt nur nach `sortenmerkmale`. `S.kartei` schreibt nie von selbst in eine Pflanze.
Offener Plan: ja (PLAN.md) — Lösch-Fix erledigt, E2 im Zuschnitt freigegeben, Detailplan fehlt.

## Gescheiterte Versuche
- Der erste Test für „Aus der Sammlung nehmen“ suchte sich eine mitgelieferte Pflanze aus `PFLANZEN`. Die Liste ist in der App leer (`const PFLANZEN = []`), der Test fand nichts. Er legt sich jetzt selbst eine an und entfernt sie am Ende wieder.

## Entscheidungen
- Die Ursache war `offen.delete(id)` in `bearb-weg`: ein Rest der Zuklapp-Mechanik aus 3.10.7, der das Löschen vor dem Speichern abbrach. Die Zeile ist ersatzlos weg, weil die Menge nirgends mehr existiert.
- Die Karte schließt sich nach dem Löschen nur, wenn sie genau diese Pflanze zeigt. Sonst würde ein Löschen aus einer anderen Ansicht ein fremdes Fenster schließen.
- Der alte Behandler `pflanze-weg` (index.html ~16630) bleibt stehen. Kein Knopf ruft ihn auf, und Aufräumen war nicht Teil des Plans.
- „Freigabe“ vom 15.09. galt nur dem Lösch-Fix. Die Wünsche zur Ergebnisliste gehören nach E2, weil E2 denselben Abschnitt umbaut.

## Backlog-Zuwachs
- **„Alle anhaken“ in der Ergebnisliste** (von Chris, 15.09.2026). Die Ergebnisliste unter „Kartei auffrischen“ bekommt „Alle anhaken“ und „Auswahl leeren“, wie das Auswahlgitter.
- **Abschnitt während des Laufs** (von Chris, 15.09.2026). Solange ein Lauf läuft, zeigt der Abschnitt statt der Startauswahl den Fortschrittsbalken und die bis dahin fertigen Ergebnisse. Belegt: Heute steht dort die Startauswahl, und „Starten“ meldet nur „läuft bereits“.
- **Gießcenter: „2 überfällig“ verschwindet beim Antippen** (von Chris, 15.09.2026). Nicht untersucht. Vor einem Plan braucht es einen Screenshot vor und nach dem Antippen und die Angabe, welche zwei Pflanzen gemeint sein könnten.
- **Fettkraut im Winter** (von Chris, 15.09.2026). Belegt im Prüfstand: Pinguicula steht in Klasse S (Anstau) und bekommt ganzjährig einen täglichen Blick (Intervall 1). Der wählbare Zustand „Winterruhe“ ändert daran nichts, weil Klasse S nur auf „Winterruhe der Karnivore“ umschaltet (dann 14 Tage). Diesen Zustand bietet die Karte beim Fettkraut aber nicht an, und sein Text (0–10 °C, Fallen werden schwarz) passt nicht zu mexikanischen Fettkräutern. Gewünscht: eine Winterrosette als eigener Zustand für mexikanische Pinguicula, mit trockenem Stand und etwa 2–4 Wochen Abstand, ohne kühlen Standort vorauszusetzen. Heimische Arten (P. vulgaris, P. grandiflora) brauchen dagegen Kälte. Zu klären ist, woran die App die beiden unterscheidet.
- **Gelöschte Pflanzen im Kartei-Zwischenlager** (15.09.2026). Ihre Ergebnisse bleiben in `S.kartei.fertig` liegen. Die Liste blendet sie aus, „x von y beantwortet“ zählt sie mit. In E2 mit erledigen.
- Weiter offen aus der Übergabe vom 15.09. (3.19.0):
  - **Für E2 wichtig:** `geminiLesen` liefert nicht die Feldnamen der Pflanze, der botanische Name kommt als `bot`, nicht als `botanisch`. Die Zuordnung von Antwortschlüssel zu Pflanzenfeld muss in E2 gebaut und geprüft werden.
  - **Zeit messen:** Der erste echte Lauf sagt, wie lange fünfzig Pflanzen brauchen.
  - **Doktor bestimmt eine fehlende Sorte** (14.09.2026). Das Rateverhalten bei panaschierten Sorten ist zu klären.
  - **Alte Sorten aus dem botanischen Namen holen:** als Vorschlag mit Knopf, nicht von selbst.
  - **Foto nachtragen aus der Kartei heraus:** Ein Tipp auf den Namen öffnet die Karte.
  - **Ein Lauf über eine neue Fassung hinweg:** ungelöst.

## Offene Regeländerungen
- Regel 10.10 (neu, siehe Antwort vom 15.09.2026) — noch nicht als eingetragen bestätigt.
