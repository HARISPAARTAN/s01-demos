import { esc } from './html.js';

export function renderGallery({ demos, slugs, thumbExists, manifest, credits }) {
  const total = String(demos.length).padStart(2, '0');
  const cards = demos
    .map((d, i) => {
      const n = String(i + 1).padStart(2, '0');
      const home = (lang) => `${d.id}/${lang}/${slugs[lang].home}`;
      const thumb = thumbExists(d.id)
        ? `<img src="assets/thumbs/${d.id}.jpg" alt="" loading="lazy" width="1200" height="750">`
        : `<div class="ph" style="--c:${esc(d.accent)}"><span>${n}</span></div>`;
      return `<article class="card" id="${d.id}">
<a class="thumb" href="${home('de')}" aria-label="${esc(d.name)} (Deutsch)">${thumb}</a>
<div class="body">
<p class="n">${n} / ${total}</p>
<h2>${esc(d.name)}</h2>
<p>${esc(d.description.de)}</p>
<p class="en">${esc(d.description.en)}</p>
<p class="meta">Video: ${esc(manifest[d.video].label)}</p>
<div class="links"><a class="btn" href="${home('de')}">Deutsch</a><a class="btn ghost" href="${home('en')}">English</a></div>
</div>
</article>`;
    })
    .join('\n');
  const videoCredits = Object.values(manifest).map((v) => `<li><a href="${esc(v.url)}">${esc(v.label)}</a> – ${esc(v.credit)}</li>`).join('');
  const photoCredits = credits.map((c) => `<li><a href="${esc(c.url)}">${esc(c.label)}</a> – ${esc(c.credit)}</li>`).join('');
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>S01 Projektmanagement – Website-Demos</title>
<meta name="description" content="${demos.length} Design-Demos der Website s01-pm.de, jeweils vollständig navigierbar in Deutsch und Englisch.">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<style>
:root { --bg: #0b0d10; --fg: #f3f4f6; --muted: #9aa3ad; --card: #141821; --border: #232a35; --accent: #4f8cff; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font-family: system-ui, -apple-system, "Segoe UI", sans-serif; line-height: 1.55; }
a { color: inherit; }
.wrap { max-width: 1280px; margin-inline: auto; padding: 48px 16px 80px; }
header { margin-bottom: 40px; }
header h1 { font-size: clamp(2rem, 5vw, 3.2rem); margin: 0 0 8px; letter-spacing: -0.02em; }
header p { color: var(--muted); max-width: 70ch; margin: 0 0 6px; }
.grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
.thumb { display: block; aspect-ratio: 16 / 10; background: #000; }
.thumb img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
.ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, var(--c), #000); font-size: 3rem; font-weight: 800; color: #fff; }
.body { padding: 20px; display: flex; flex-direction: column; flex: 1; }
.n { font-size: 0.75rem; letter-spacing: 0.14em; color: var(--muted); margin: 0 0 6px; }
h2 { margin: 0 0 8px; font-size: 1.35rem; }
.body p { margin: 0 0 8px; }
.en, .meta { color: var(--muted); font-size: 0.9rem; }
.links { display: flex; gap: 10px; margin-top: auto; padding-top: 16px; }
.btn { flex: 1; text-align: center; padding: 10px 14px; border-radius: 8px; background: var(--accent); color: #fff; text-decoration: none; font-weight: 600; }
.btn.ghost { background: transparent; border: 1px solid var(--border); color: var(--fg); }
footer { margin-top: 64px; padding-top: 24px; border-top: 1px solid var(--border); color: var(--muted); font-size: 0.85rem; }
footer ul { padding-left: 1.2em; }
</style>
</head>
<body>
<div class="wrap">
<header>
<h1>S01 Projektmanagement – Website-Demos</h1>
<p>${demos.length} Design-Richtungen für s01-pm.de. Jede Demo ist vollständig navigierbar, zweisprachig (DE/EN) und startet mit einem Vollbild-Video.</p>
<p>${demos.length} design directions for s01-pm.de. Every demo is fully navigable, bilingual (DE/EN) and opens with a full-screen video hero.</p>
</header>
<div class="grid">
${cards}
</div>
<footer>
<p>Demo only – nicht für den Produktivbetrieb. Formulare senden keine Daten. / Demo only, forms do not send data.</p>
<p>Videos:</p><ul>${videoCredits}</ul>
<p>Fotos / Photos:</p><ul>${photoCredits}</ul>
</footer>
</div>
</body>
</html>
`;
}
