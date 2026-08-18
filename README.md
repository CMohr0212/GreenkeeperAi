# 🌿 Pflanzenglossar

**[Deutsch](#deutsch) · [English](#english)**

---

<a name="deutsch"></a>
## Deutsch

Eine Web-App zur Pflege von Zimmer- und Balkonpflanzen. Läuft komplett
offline, alle Daten bleiben auf deinem Gerät — es gibt keinen Server, der
etwas speichert oder sieht.

### Ausprobieren

👉 **[App öffnen](../../)**

Am Handy: öffnen, dann über das Browsermenü „Zum Startbildschirm hinzufügen“
bzw. „App installieren“ — danach läuft sie wie eine normale App, mit eigenem
Symbol und ohne Adressleiste.

### Was sie kann

- **Pflanzenbibliothek** mit über 200 Arten: Gießklasse, Licht, Dünger,
  Frostgrenze, Katzengiftigkeit
- **Gießtracker** mit geführtem Gießmodus
- **Rundgang** zum regelmäßigen Erfassen von Wachstum und Zustand
- **Pflanzendoktor** — Symptome eingeben oder ein Foto von einer KI
  einschätzen lassen, die Antwort fließt automatisch ein
- **Substratkonfigurator** — passende Erdmischung aus dem, was man zu Hause
  hat, plus Referenzrezept
- **Vermehrungsleitfaden** — welche Methode bei welcher Art funktioniert
- **Grundriss-Planer** mit echter Sonnenstandsberechnung fürs eigene Zuhause
- **Aufgabenliste, Wunschliste, Stammbaum der Ableger**

### Eigene Daten

Alles liegt im Speicher deines Browsers. Wichtig:

- **Regelmäßig sichern** — unter „Mehr → Sicherung“ als Datei herunterladen.
- Löschst du die App vom Startbildschirm, können je nach Gerät auch die
  Daten verschwinden.
- Diese veröffentlichte Fassung ist absichtlich leer. Niemand sieht deine
  Pflanzen außer dir.

### Mitmachen

Fehler gefunden, eine Pflanzenart fehlt, eine Idee? Über „Mehr →
Rückmeldung“ in der App, oder als
[Issue](../../issues) hier im Repository.

### Technik

Eine einzelne HTML-Datei, kein Build-Prozess, keine Abhängigkeiten. Zum
lokalen Entwickeln reicht ein beliebiger lokaler Webserver, damit der
Service Worker funktioniert (`file://` allein reicht nicht).

---

<a name="english"></a>
## English

A web app for taking care of houseplants and balcony plants. Runs entirely
offline — all data stays on your device, there's no server storing or
seeing anything.

### Try it

👉 **[Open the app](../../)**

On mobile: open it, then use your browser menu to "Add to Home Screen" /
"Install app" — it then behaves like a native app, with its own icon and no
address bar.

### What it does

- **Plant library** with 200+ species: watering class, light, fertilizer,
  frost tolerance, cat toxicity
- **Watering tracker** with a guided watering mode
- **Walkthrough mode** for regularly logging growth and condition
- **Plant doctor** — pick symptoms yourself or have an AI assess a photo,
  with the answer fed straight back in
- **Substrate builder** — the best mix from what you already have, plus a
  reference recipe
- **Propagation guide** — which method actually works for which species
- **Floor plan tool** with real sun-position calculations for your own home
- **Task list, wishlist, propagation family tree**

### Your data

Everything lives in your browser's storage. Worth knowing:

- **Back up regularly** — under "More → Backup", download as a file.
- Removing the app from your home screen may also remove its data,
  depending on your device.
- This published version is intentionally empty. Nobody sees your plants
  but you.

### Contributing

Found a bug, missing a species, have an idea? Use "More → Feedback" inside
the app, or open an [issue](../../issues) in this repository.

### Tech

A single HTML file, no build step, no dependencies. For local development,
serve it through any local web server so the service worker can register
(plain `file://` won't do that part).
