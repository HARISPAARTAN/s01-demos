# S01 website demos – guide for Claude

Six demo redesigns of https://www.s01-pm.de/ (S01 Projektmanagement GmbH, Eschborn), generated as static HTML by a small Node build. Every demo has the same 8 pages in German and English; the demos differ only in look, layout variants and motion.

Live gallery: https://harispaartan.github.io/s01-demos/
Repository: https://github.com/HARISPAARTAN/s01-demos

Read `HANDOFF.md` if you were asked to make changes for the company and hand them back.

## Commands

Requires Node 22 or newer. Run `npm install` once.

| Command | What it does |
|---|---|
| `npm test` | unit tests (`node --test "tests/**/*.test.js"`), about 2 seconds |
| `npm run build` | renders every demo into `dist/` (`dist/<demo-id>/<de|en>/<page>.html`, gallery at `dist/index.html`) |
| `npm run check` | validates `dist/`: broken links, anchors, missing translations, h1 per page, text contrast |
| `npm run serve` | serves `dist/` at http://127.0.0.1:8080/ |
| `npm run shots [demo-id]` | Playwright smoke test and gallery thumbnails (needs Chrome or Edge installed) |

Before committing: `npm test && npm run build && npm run check`. The GitHub Actions workflow (`.github/workflows/deploy.yml`) runs the same three steps on every push to `main` and then publishes `dist/` to GitHub Pages. A failing test or check blocks the deployment.

## Where things live

- `content/site.de.json`, `content/site.en.json` – all text (`meta` for company data, navigation, call to action and UI labels; `pages.home|services|projects|company|careers|contact|imprint|privacy`). The two files must have identical key trees; the build fails otherwise. Change text here, never in the components.
- `content/slugs.json` – file names per language (`projekte.html` vs `projects.html`).
- `demos/NN-slug/demo.json` – one demo: `id` (equals the folder name), `order`, `name`, `description.de|en`, `scheme` (`light`|`dark`), `accent` (6-digit hex), `fonts` (Google Fonts family specs), `variants`, `video`, optional `"motion": "cinematic"` (default `refined`).
- `demos/NN-slug/theme.css` – the demo's look: design tokens in `:root` and demo-specific overrides of kit classes.
- `kit/base.css`, `kit/base.js` – shared layout, components, motion system and behaviour for all demos. A change here affects every demo.
- `kit/components/*.js` – section renderers. Each exports a map `variantName -> (ctx) => html`. Available variants:
  - `nav`: transparent, solid, sidebar, hamburger, pill, spacex
  - `hero`: bottom-left, centered, glass, split, snap-stack, spacex, tesla, editorial, apple
  - `services`: grid, numbered, bento, scroll, accordion, rows, timeline
  - `feature`: columns, tabs, stats
  - `projects`: cards, timeline, table, masonry
  - `faq`: accordion, two-column
  - `footer`: columns, minimal, mega
  - `contact`: split, centered
- `kit/render.js`, `kit/pages.js`, `kit/html.js` – page shell, page composition, HTML helpers. `kit/gallery.js` renders the gallery start page.
- `kit/motion-cinematic.js` plus `kit/vendor/lenis.min.js` – only loaded by demos with `"motion": "cinematic"`.
- `assets/` – videos (`assets/video/manifest.json` defines the keys `trailer`, `powerlines`, `windfarm`, `substation`), photos, logos, gallery thumbnails. Everything is committed; no download step is needed to build.
- `build/` – generator (`build.js`), validator (`check.js`), dev server, screenshot script. `build/lib/demos.js` validates `demo.json`.
- `tests/` – Node test runner tests per component and for build, check and content.
- `tools/` – Playwright measurement scripts (layout overflow, behaviour pass, hero contrast); see README.
- `docs/superpowers/specs/2026-10-08-s01-demos-design.md` – design spec; section 15 is the corporate palette, section 18 the motion system.
- `CREDITS.md` – licenses of stock footage, photos and Lenis. Add a line when you add third-party media.

## Common changes

- **Text**: edit the same key in both `content/site.de.json` and `content/site.en.json`.
- **Colors of one demo**: edit the `:root` tokens in its `theme.css` (`--bg`, `--fg`, `--muted`, `--surface`, `--surface-2`, `--border`, `--accent`, `--accent-fg`, `--accent-2`, `--cta-bg`, `--cta-fg`, `--hero-fg`, `--hero-overlay`). `--bg`, `--fg`, `--accent`, `--accent-fg` must be 6-digit hex with at least 4.5:1 contrast, the check enforces it.
- **Corporate palette** (S01 stylesheet v1.0): Slate Teal #003C50, Lime Accent #E6FF80 (primary button only), Ink #262C30, Muted #6E7672, Line #E6E2DC, Surface #F8F8F6, Teal Light #8FB2BE, Deep Teal #1A4E60, Sand #DED0BE, Sky Blue #D0E6EA, Off-White #F6F6F6. Fonts: Geist (fallback for Roobert) for headlines and text, Sometype Mono (fallback for Fraktion Mono) for labels, navigation and tags.
- **Layout of a section**: switch the variant name in `demo.json`. To change how a variant looks for all demos, edit `kit/base.css`; for one demo, override the class in its `theme.css`.
- **Video**: add the file and poster under `assets/video/`, register a key in `assets/video/manifest.json`, point `demo.json` `video` at it, credit it in `CREDITS.md`.
- **New demo**: copy a folder under `demos/`, rename it `NN-slug`, set `id` to the folder name, adjust variants and tokens, build and check. The gallery picks it up automatically; run `npm run shots NN-slug` for its thumbnail.
- **Remove a demo**: delete its folder and `assets/thumbs/NN-slug.jpg`; update the expected file count in `tests/check.test.js` and the demo list in `tests/build.test.js` if tests fail.

## Conventions

- Plain HTML, CSS and JS, no framework, no bundler. Keep the output dependency-free apart from Google Fonts and the vendored Lenis.
- German is the default language; every page needs an EN twin (the build derives both from the content files).
- Phone first: check 320 to 1440 px widths. `node tools/measure-layout.mjs <demo-id>` reports overflow and broken headline words.
- Motion must stay optional: everything is gated on `html.js-motion`, which the inline head script sets only without a reduced-motion preference. Never hide content by default in CSS.
- Forms are demos and send nothing. The privacy page is a placeholder.
- Commit small, descriptive changes to `main` (or to a branch and open a pull request, see `HANDOFF.md`).
