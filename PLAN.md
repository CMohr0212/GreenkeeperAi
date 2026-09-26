# PLAN — GreenkeeperAI

Stand 26.09.2026 · Ausgangsfassung 3.28.1 · **Zielversion 3.29.0, sw.js greenkeeperai-v125**

**Freigegeben am 26.09.2026 (Chris): 3.29.0 · Zielversion 3.29.0, sw.js greenkeeperai-v125.** Umfang: A KI-Bestimmung, B Mischtopf (auch verschiedene Arten), C vier Funde aus der Handyprüfung 3.28.0 („mit rein“, Regel 4.3).

Aufteilung: keine, auf Chris' Wunsch (Regel 0.2). Die Größe ist „groß“, eine Aufteilung nach Regel 3.4 war vorgeschlagen und wurde abgelehnt.
Gerätekontrolle: 3.28.0 und 3.28.1 hat Chris am 26.09. am Handy geprüft, bis auf die Punkte in Teil C.

---

## Ziel
Anzucht Teil 2: Frei eingetragene Gruppen lassen sich per Foto bestimmen. Stecklinge aus mehreren Gruppen lassen sich zu einer Pflanze eintopfen. Die vier Funde aus der Handyprüfung von 3.28.0 sind behoben.

## Änderungen

### A · KI-Bestimmung
- Eine Gruppe ohne Mutter bekommt den Knopf „Per Foto bestimmen“. Gruppen mit Mutter bekommen ihn nicht.
- Ein Foto aufnehmen oder auswählen. Das Foto wird nicht gespeichert.
- Kurzer Auftrag nur mit ART, BOTANISCH, SICHERHEIT, SORTE, SORTE_BELEG und SORTEN_VERWECHSLUNG. Die Feldtexte kommen unverändert aus der vorhandenen Felddefinition. `ANTWORT_FORMAT` bleibt wortgleich. Kein Name aus einer Karte im Auftrag.
- Die Sorte läuft durch `sorteGeprueft` (unverändert).
- Das Ergebnis zeigt Art, botanischen Namen und Sorte mit Sicherheit und Beleg. Übernommen wird nur einzeln: Knopf „Art übernehmen“ und, wenn eine Sorte angeboten wird, Knopf „Sorte übernehmen“ (Regel 10.8, Vorschlag 10.13).
- Die Übernahme schreibt `art`, `botanisch` und `sorte` in die Gruppe und einen Verlaufseintrag „Per Foto bestimmt: …“.
- Ohne API-Schlüssel oder nach einem Fehlschlag gibt es den Weg über Kopieren und Einfügen (Regel 10.6).

### B · Mischtopf
- Im Schritt „Eintopfen“ gibt es die neue Wahl „Mit anderen Gruppen zusammen“. Darunter stehen alle Gruppen aller Gefäße, jede mit eigener Anzahl. **Verschiedene Arten sind erlaubt** (Chris, 26.09.).
- Hauptgruppe ist vorgegeben die Gruppe mit den meisten Stecklingen. Sie ist änderbar.
- Die Karte erbt über `ablegerErbe` von der Mutter der Hauptgruppe. Ohne Mutter kommen die Angaben aus der Gruppe. `ABLEGER_ERBE` bleibt unverändert.
- **Gießen, trockenste Pflanze gewinnt** (Chris, 26.09.): Klassen von nass nach trocken S → A → B → C. Hat eine Nebenmutter eine trockenere Klasse als die Hauptmutter, übernimmt die Karte deren Klasse, Gießgruppe und Gießart. Gruppen ohne Mutter haben keine bekannte Klasse und zählen dabei nicht.
- **Hinweis vor dem Eintopfen**, wenn die Klassen nicht zusammenpassen. Zusammen passen gleiche oder benachbarte Klassen (A–B, B–C), S nur mit S. Der Hinweis nennt die Pflanzen und sagt, nach welcher Pflanze gegossen wird. Das Eintopfen wird nicht gesperrt.
- Neue Felder an der Karte:
  - `muetter`: alle Mütter aus der Sammlung, die Hauptmutter zuerst.
  - `mitImTopf`: Liste `{art, sorte, anzahl}` der Nebengruppen.
- `eltern` bleibt die Hauptmutter.
- Die Karte zeigt „Mit im Topf: Marble Queen (2)“.
- **Giftigkeit:** Ist eine Nebenmutter giftig und die Hauptmutter nicht, zeigt die Karte „Mit im Topf: [Name] ist giftig“. Die Giftlogik wird nicht angefasst, das ist nur eine Anzeige.
- Stammbaum: Weitere Mütter stehen als Zeile „+ Name“ unter dem Knoten, ohne zweite Linie. Die Nebenmütter nennen den Ableger unter „Nachkommen“ mit dem Zusatz „mit im Topf“.
- Jede Gruppe zählt herunter und bekommt einen Verlaufseintrag. Der Verlauf aller Gruppen geht an die neue Karte.

### C · Funde aus der Handyprüfung von 3.28.0
1. **Doppeltes „In die Anzucht“:** Der Knopf unten nennt das Ziel, also „In Glas 2 setzen“ oder „In neues Gefäß setzen“. Er folgt der Auswahl im Feld „Gefäß“.
2. **Gefäßliste sortiert:** Alle Gefäß-Auswahllisten stehen alphabetisch mit natürlichen Zahlen (Glas 2 vor Glas 10). „Neues Gefäß …“ bleibt am Ende. Die Vorauswahl bleibt wie bisher.
3. **Wege passen zur Auskunft:**
   - Liegt eine KI-Auskunft zur Art vor, zeigen die Kacheln genau deren Wege, in deren Reihenfolge. Aussicht und Dauer kommen aus der Auskunft, das Schild zeigt „KI“ statt „geraten“.
   - Die Namen der Auskunft werden den Wegen im Katalog zugeordnet (Kopf-, Trieb-, Stammsteckling, Blattsteckling, Rhizomteilung, Teilung, Kindel, Ausläufer, Absenker, Abmoosen, Aussaat, Wurzelschnittling).
   - Neu im Katalog ist ein allgemeiner Weg **„Blattsteckling mit Stiel“** (Begonie, Peperomie, Usambaraveilchen). Der bisherige Blattsteckling gilt nur für Dickblattgewächse.
   - Ein Weg ohne Zuordnung bekommt eine Kachel nur mit den Angaben der Auskunft, ohne Schritt-für-Schritt.
   - Ohne Auskunft bleibt alles wie bisher.
4. **Gruppe bearbeiten:** Jede Gruppe bekommt den Knopf „Bearbeiten“. Änderbar sind Gefäß, Anzahl, Methode und Startdatum. Bei Gruppen ohne Mutter auch Art, botanischer Name und Sorte. Das ist eine Korrektur und schreibt keinen Verlaufseintrag. Steht im Zielgefäß schon eine Gruppe derselben Herkunft, werden beide zusammengelegt (wie beim Umsetzen). Das „Umsetzen“ unter „Entnehmen“ bleibt für echtes Umsetzen mit Verlaufseintrag.

### Pflichtpaket
Nach Regel 6.2.

## Nicht angefasst
- `sorteGeprueft` und `ANTWORT_FORMAT`
- `ABLEGER_ERBE` und `giftEigenSetzen`
- `KLASSEN`-Texte
- Die Regeln in `vermehrungFuer` (nur ergänzt: Begonie und Peperomie → „Blattsteckling mit Stiel“)
- Stammbaum-Layout (nur die Zusatzzeile)
- Zustand „Steckling“ nach dem Eintopfen (Backlog)
- Kartei und Doktor
- Alle Punkte unter „Nicht anfassen“ der Übergabe

## Risiken
- Größe „groß“ in einer Sitzung. Bricht die Sitzung ab, gilt Regel 7.1. Baureihenfolge: C, dann A, dann B, damit die kleinen Korrekturen zuerst fertig sind.
- „Blattsteckling mit Stiel“ und die Zuordnung sind Pflegeaussagen. **Den Wortlaut prüfst du am Handy.**
- Bei verschiedenen Arten richten sich Steckbrief, Sonne und Frost nur nach der Hauptart. Nur das Gießen folgt der trockensten Pflanze.
- Die Wegeliste mit KI-Auskunft zeigt keine Regelwege mehr. Hat die KI einen guten Weg vergessen, fehlt er in der Liste. Abhilfe ist „Neu nachfragen“.
- Beim Bearbeiten ändert sich mit Art oder Sorte die Herkunft der Gruppe. Gruppen werden danach anders zusammengelegt.
- Alte Sicherungen ohne `muetter` und `mitImTopf` müssen fehlerfrei laden. Eine gelöschte Nebenmutter darf nichts kaputt machen.

## Prüfung

pruef.js mit Gegenproben nach Regel 5.2:
- **A:**
  - Knopf nur bei Gruppen ohne Mutter
  - Auftrag mit genau sechs Feldern
  - Sorte ohne Beleg → „niedrig“
  - Trivialname wird nicht angeboten
  - Nichts ändert sich vor dem Tipp
  - Übernahme schreibt Felder und Verlauf
  - Rückfallweg ohne Schlüssel
- **B:**
  - 2 und 3 Gruppen aus verschiedenen Gefäßen
  - Verschiedene Arten
  - Vorgabe der Hauptgruppe
  - Erbe nur von der Hauptmutter
  - Trockenste Klasse gewinnt, samt Gießgruppe
  - Hinweis bei A mit C und bei S mit B, kein Hinweis bei A mit B
  - `muetter` und `mitImTopf` stimmen
  - Gifthinweis
  - Gelöschte Nebenmutter
  - Alte Daten
- **C:**
  - Knopftext folgt dem Gefäß
  - Sortierung Glas 2 vor Glas 10
  - Mit Auskunft „Blattsteckling, Rhizomteilung“ zeigen die Kacheln genau diese zwei, ohne „geraten“
  - Ohne Auskunft unverändert
  - Bearbeiten verschiebt die Gruppe ohne Verlaufseintrag und legt sie zusammen
  - Art ist nur bei Gruppen ohne Mutter änderbar

Nur am Handy prüfbar: Kamera und Fotoauswahl, echte Gemini-Antwort, Bedienung der Gruppenliste im Mischtopf, Stammbaum-Zusatzzeile, Wortlaut „Blattsteckling mit Stiel“, Aussehen der Kacheln und des Bearbeiten-Formulars.

## Größe
groß (eine Fassung, auf Chris' Wunsch)

---

# Danach: Aufräumen · keine neuen Funktionen

Chris am 22.09.2026: Nach der Anzucht wird die App grundlegend aufgeräumt, bevor wieder etwas Neues kommt. Alle restlichen Kinderschuhfehler werden beseitigt und alles wird auf 100 % funktional gebracht.

- Der Umfang wird vor Beginn gemeinsam festgelegt: Durchgang durch alle Bereiche, Fehlerliste, Reihenfolge.
- Dazu gehören:
  - die Statuszeile „Kartei auffrischen“ unter „Mehr“ (Screenshot nötig)
  - die Meldung, die nach der letzten Kartei-Übernahme ins Leere geht
  - die alten uneinheitlichen Werte
  - die offenen Gerätekontrollen
- Sammel-Anlegen, F, T, Claude-Anbindung und alle anderen neuen Punkte warten bis danach.
