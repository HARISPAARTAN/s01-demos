# Übergabe / Handoff

Deutsch zuerst, English below.

## Deutsch

### Was das ist

Sechs Demo-Entwürfe der S01-Website, jeder vollständig klickbar (8 Seiten, DE/EN) mit Vollbild-Video-Einstieg:

- Galerie: https://harispaartan.github.io/s01-demos/
- Quellcode: https://github.com/HARISPAARTAN/s01-demos

Alle Texte, Bilder, Videos und der Generator liegen im Repository. Es braucht nur Node.js 22 oder neuer; kein Download-Schritt, keine Datenbank.

### Code holen (Git wird nicht benötigt)

1. **ZIP herunterladen:** https://github.com/HARISPAARTAN/s01-demos/archive/refs/heads/main.zip laden und entpacken (ergibt den Ordner `s01-demos-main`) (ca. 17 MB, alle Videos enthalten). Alternativ enthält der Ordner, der per E-Mail kam, dieselben Dateien.
2. **Mit Git (optional):** `git clone https://github.com/HARISPAARTAN/s01-demos.git`

### Lokal starten

Einmalig Node.js 22 oder neuer installieren: https://nodejs.org/ (LTS, Standardinstallation). Dann im entpackten Ordner `s01-demos` ein Terminal öffnen (Windows: Rechtsklick im Ordner → „Im Terminal öffnen“) und ausführen:

```
npm install
npm run build
npm run serve
```

Danach http://127.0.0.1:8080/ öffnen. Nach jeder Änderung erneut `npm run build` ausführen (der Server zeigt den neuen Stand sofort).

### Änderungen mit Claude

Claude Code (Desktop-App oder Terminal, https://claude.ai/code) braucht kein Git; Node.js genügt. Im Projektordner Claude Code starten. Die Datei `CLAUDE.md` erklärt Claude den Aufbau, die Befehle und wo Texte, Farben, Layout-Varianten und Videos liegen. Beispiele für Anweisungen:

- „Ändere im Demo 05 die Akzentfarbe auf Deep Teal #1A4E60 und baue neu.“
- „Ersetze den Text der Startseiten-Headline in DE und EN durch …“
- „Demo 03 soll den Footer ‚mega‘ statt ‚columns‘ verwenden.“
- „Lege ein Demo 07 auf Basis von Demo 06 an, aber dunkel und mit dem Windpark-Video.“
- „Führe `npm test`, `npm run build` und `npm run check` aus und zeig mir die Ergebnisse.“

Vor dem Zurückgeben bitte `npm test && npm run build && npm run check` laufen lassen; dieselben Schritte laufen bei der Veröffentlichung, ein Fehler blockiert sie.

### Änderungen zurückgeben

**Ordner schicken (ohne Git):** den geänderten Projektordner `s01-demos` zippen und per E-Mail oder Dateifreigabe senden. Die Unterordner `node_modules` und `dist` vorher löschen oder weglassen, sie werden neu erzeugt. Claude Code kann das vorbereiten („lösche node_modules und dist und erstelle ein ZIP des Projektordners“). Die Änderungen werden dann eingespielt und unter der Galerie-Adresse veröffentlicht.

Mit GitHub-Konto geht alternativ ein Fork und ein Pull Request gegen `HARISPAARTAN/s01-demos` (Branch `main`), oder ein direkter Push nach Freischaltung als Mitwirkender; jeder Push auf `main` wird automatisch gebaut und veröffentlicht.

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

### Get the code (no Git required)

1. **Download the ZIP:** download https://github.com/HARISPAARTAN/s01-demos/archive/refs/heads/main.zip and unpack it (gives the folder `s01-demos-main`) (about 17 MB, all videos included). The folder sent by e-mail contains the same files.
2. **With Git (optional):** `git clone https://github.com/HARISPAARTAN/s01-demos.git`

### Run locally

Install Node.js 22 or newer once: https://nodejs.org/ (LTS, default installation). Then open a terminal in the unpacked `s01-demos` folder (Windows: right-click in the folder → "Open in Terminal") and run:

```
npm install
npm run build
npm run serve
```

Then open http://127.0.0.1:8080/. After every change run `npm run build` again (the server shows the new state immediately).

### Making changes with Claude

Claude Code (desktop app or terminal, https://claude.ai/code) does not need Git; Node.js is enough. Start Claude Code in the project folder. `CLAUDE.md` tells Claude the structure, the commands and where text, colors, layout variants and videos live. Example instructions:

- "Change the accent color of demo 05 to Deep Teal #1A4E60 and rebuild."
- "Replace the home page headline in DE and EN with …"
- "Demo 03 should use the 'mega' footer instead of 'columns'."
- "Create a demo 07 based on demo 06, but dark and with the wind farm video."
- "Run `npm test`, `npm run build` and `npm run check` and show me the results."

Before handing back, run `npm test && npm run build && npm run check`; the same steps run on publication and a failure blocks it.

### Handing changes back

**Send the folder (no Git):** zip the changed `s01-demos` project folder and send it by e-mail or file share. Delete or leave out the `node_modules` and `dist` subfolders first, they are regenerated. Claude Code can prepare this ("delete node_modules and dist and create a zip of the project folder"). The changes are then merged and published under the gallery address.

With a GitHub account, a fork and a pull request against `HARISPAARTAN/s01-demos` (branch `main`) also works, or a direct push after being added as a collaborator; every push to `main` is built and published automatically.

### Notes

- Forms send nothing; the privacy page is a placeholder.
- Licenses of the stock videos and photos are in `CREDITS.md`.
- Design spec: `docs/superpowers/specs/2026-10-08-s01-demos-design.md` (section 15 colors, section 18 motion).
