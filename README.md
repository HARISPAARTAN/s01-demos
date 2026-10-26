# S01 Projektmanagement – Website demos

6 shareable demo redesigns of https://www.s01-pm.de/, generated from one bilingual content source.
Each demo is fully navigable (8 pages, DE/EN) and opens with a full-screen video hero.

Live gallery: https://harispaartan.github.io/s01-demos/

Handoff guide for editing the demos with Claude and sending changes back: `HANDOFF.md` (DE/EN). `CLAUDE.md` briefs Claude Code on the project.

## Commands

| Command | Purpose |
|---|---|
| `npm test` | unit tests (`node --test "tests/**/*.test.js"`) |
| `npm run fetch-assets` | download videos, photos and logos listed in `assets/sources.json` |
| `npm run posters` | first-frame poster per video (needs Chrome or Edge installed) |
| `npm run build` | render everything into `dist/` |
| `npm run check` | validate `dist/` (links, anchors, translations, h1, contrast) |
| `npm run serve` | preview `dist/` at http://127.0.0.1:8080/ |
| `npm run shots` | Playwright smoke checks + gallery thumbnails |

## Adding a demo

1. Copy a folder under `demos/`, rename it `NN-slug`, set `id` in `demo.json` to the same name.
2. Pick variants (`nav`, `hero`, `services`, `feature`, `projects`, `faq`, `footer`, `contact`), fonts, a video key and optionally `"motion": "cinematic"` (default `refined`).
3. Edit `theme.css` tokens (`--bg`, `--fg`, `--accent`, `--accent-fg` must be 6-digit hex with 4.5:1 contrast).
4. `npm run build && npm run check && npm run shots NN-slug`, commit, push. GitHub Actions deploys.

## Notes

- Content lives in `content/site.de.json` and `content/site.en.json`; the build fails if the key trees differ.
- Forms are demos and send nothing. Datenschutz is a placeholder.
- Credits for stock footage and photos: `CREDITS.md`.

## Verification tools

Beyond `npm test`, `npm run check` and `npm run shots`, three Playwright scripts in `tools/` reproduce the measurements used during the fix waves. They need a built `dist/` and the installed Chrome:

- `node tools/measure-layout.mjs [demo ids]` reports horizontal overflow, words broken across lines in headings and headline punctuation pushed onto its own line. Set `WIDTHS=320,360,390,768,1024,1280,1440` to choose viewports and `DIST=` to point at another build.
- `BASE=http://127.0.0.1:8080 node tools/behaviour-pass.mjs` (with `npm run serve` running) checks muted autoplay, the DE/EN toggle landing on the same page, the badge link, the demo form confirmation and the phone menu.
- `DEMOS=01-original,02-cinematic node tools/hero-contrast.mjs` samples video frames and reports the worst-frame contrast of every hero text line.

Words of 18 letters or more are allowed to hyphenate (`hyphens: auto`); the Playwright Chrome profile has no German dictionary, so such words appear as plain breaks in test screenshots only.

## Motion

Every demo has the refined motion level (scroll reveals with stagger, hero entrance, parallax, counting key figures, hover lifts and image zooms, blurred translucent headers, cross-document page transitions). Demos with `"motion": "cinematic"` additionally load the vendored Lenis library (`kit/vendor`, MIT) for inertia scrolling, split headlines into words that rise out of a clipped line (768 px and up) and drive the Apple-style scroll stage of the `apple` hero. Everything is gated on `html.js-motion`, set by an inline head script only when the visitor has no reduced-motion preference; with reduced motion or without JS nothing is hidden or moved. Section 18 of the design spec has the details.

## Corporate palette

All demos use the S01 corporate colors (Slate Teal #003C50, Lime #E6FF80 for the primary button only, Ink #262C30, Line #E6E2DC, Surface #F8F8F6, Teal Light #8FB2BE, Deep Teal #1A4E60). Each theme sets them as tokens in its `:root` block (`--bg`, `--fg`, `--muted`, `--surface`, `--surface-2`, `--border`, `--accent`, `--accent-fg`, `--accent-2`, `--cta-bg`, `--cta-fg`, `--hero-fg`, `--hero-overlay`); the kit paints the primary button with `--cta-bg`/`--cta-fg`. Section 15 of the design spec lists the mapping and the few derived shades.
