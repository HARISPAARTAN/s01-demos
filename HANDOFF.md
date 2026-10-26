# Übergabe / Handoff

Deutsch zuerst, English below.

## Deutsch

### Was das ist

Sechs Demo-Entwürfe der S01-Website, jeder vollständig klickbar (8 Seiten, DE/EN) mit Vollbild-Video-Einstieg:

- Galerie: https://harispaartan.github.io/s01-demos/
- Quellcode: https://github.com/HARISPAARTAN/s01-demos

Alle Texte, Bilder, Videos und der Generator liegen im Repository. Es braucht nur Node.js 22 oder neuer; kein Download-Schritt, keine Datenbank.

### Code holen (eine der drei Möglichkeiten)

1. **Mit Git:** `git clone https://github.com/HARISPAARTAN/s01-demos.git`
2. **Ohne Git:** auf https://github.com/HARISPAARTAN/s01-demos auf „Code“ → „Download ZIP“ klicken und entpacken.
3. **Mit eigenem GitHub-Konto (empfohlen, wenn Änderungen zurückfließen sollen):** auf der Repository-Seite „Fork“ klicken, dann den eigenen Fork klonen oder in Claude Code im Browser (https://claude.ai/code) über die GitHub-Verbindung öffnen.

### Lokal starten

```
npm install
npm run build
npm run serve
```

Danach http://127.0.0.1:8080/ öffnen. Nach jeder Änderung erneut `npm run build` ausführen (der Server zeigt den neuen Stand sofort).

### Änderungen mit Claude

Im Projektordner Claude Code starten. Die Datei `CLAUDE.md` erklärt Claude den Aufbau, die Befehle und wo Texte, Farben, Layout-Varianten und Videos liegen. Beispiele für Anweisungen:

- „Ändere im Demo 05 die Akzentfarbe auf Deep Teal #1A4E60 und baue neu.“
- „Ersetze den Text der Startseiten-Headline in DE und EN durch …“
- „Demo 03 soll den Footer ‚mega‘ statt ‚columns‘ verwenden.“
- „Lege ein Demo 07 auf Basis von Demo 06 an, aber dunkel und mit dem Windpark-Video.“
- „Führe `npm test`, `npm run build` und `npm run check` aus und zeig mir die Ergebnisse.“

Vor dem Zurückgeben bitte `npm test && npm run build && npm run check` laufen lassen; dieselben Schritte laufen bei der Veröffentlichung, ein Fehler blockiert sie.

### Änderungen zurückgeben (eine der drei Möglichkeiten)

1. **Pull Request (empfohlen):** im eigenen Fork committen und pushen, dann auf GitHub „Contribute“ → „Open pull request“ gegen `HARISPAARTAN/s01-demos`, Branch `main`. Claude Code kann das auf Wunsch übernehmen („commit, push und öffne einen Pull Request“).
2. **Ordner schicken:** den geänderten Projektordner ohne `node_modules` und `dist` zippen und senden.
3. **Direktzugriff:** den GitHub-Benutzernamen mitteilen, dann wird er als Mitwirkender eingetragen und kann direkt auf `main` pushen. Jeder Push auf `main` wird automatisch gebaut und unter der Galerie-Adresse veröffentlicht (etwa 1 bis 2 Minuten).

### Hinweise

- Formulare senden nichts; die Datenschutzseite ist ein Platzhalter.
- Lizenzen der Stock-Videos und -Fotos stehen in `CREDITS.md`.
- Design-Spezifikation: `docs/superpowers/specs/2026-10-08-s01-demos-design.md` (Abschnitt 15 Farben, Abschnitt 18 Animation).

## English

### What this is

Six demo redesigns of the S01 website, each fully navigable (8 pages, DE/EN) with a full-screen video opening:

- Gallery: https://harispaartan.github.io/s01-demos/
- Source: https://github.com/HARISPAARTAN/s01-demos

All text, images, videos and the generator are in the repository. It needs only Node.js 22 or newer; no download step, no database.

### Get the code (one of three ways)

1. **With Git:** `git clone https://github.com/HARISPAARTAN/s01-demos.git`
2. **Without Git:** on https://github.com/HARISPAARTAN/s01-demos click "Code" → "Download ZIP" and unpack it.
3. **With your own GitHub account (recommended if changes should come back):** click "Fork" on the repository page, then clone your fork or open it in Claude Code on the web (https://claude.ai/code) through the GitHub connection.

### Run locally

```
npm install
npm run build
npm run serve
```

Then open http://127.0.0.1:8080/. After every change run `npm run build` again (the server shows the new state immediately).

### Making changes with Claude

Start Claude Code in the project folder. `CLAUDE.md` tells Claude the structure, the commands and where text, colors, layout variants and videos live. Example instructions:

- "Change the accent color of demo 05 to Deep Teal #1A4E60 and rebuild."
- "Replace the home page headline in DE and EN with …"
- "Demo 03 should use the 'mega' footer instead of 'columns'."
- "Create a demo 07 based on demo 06, but dark and with the wind farm video."
- "Run `npm test`, `npm run build` and `npm run check` and show me the results."

Before handing back, run `npm test && npm run build && npm run check`; the same steps run on publication and a failure blocks it.

### Handing changes back (one of three ways)

1. **Pull request (recommended):** commit and push in your fork, then on GitHub "Contribute" → "Open pull request" against `HARISPAARTAN/s01-demos`, branch `main`. Claude Code can do this on request ("commit, push and open a pull request").
2. **Send the folder:** zip the changed project folder without `node_modules` and `dist` and send it.
3. **Direct access:** share your GitHub username to be added as a collaborator and push to `main` directly. Every push to `main` is built and published automatically under the gallery address (about 1 to 2 minutes).

### Notes

- Forms send nothing; the privacy page is a placeholder.
- Licenses of the stock videos and photos are in `CREDITS.md`.
- Design spec: `docs/superpowers/specs/2026-10-08-s01-demos-design.md` (section 15 colors, section 18 motion).
