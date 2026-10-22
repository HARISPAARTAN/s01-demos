import { esc } from '../html.js';
import { pageImages } from '../images.js';

export function heroVideo(ctx) {
  const v = ctx.video;
  const poster = ctx.paths.asset(v.poster);
  const src = ctx.paths.asset(v.src);
  return `<div class="hero-media" style="background-image:url(${poster})" aria-hidden="true">
<video class="hero-video" autoplay muted loop playsinline preload="metadata" poster="${poster}" data-video><source src="${src}" type="video/mp4"></video>
<div class="hero-overlay"></div>
</div>`;
}

export function heroPlay(ctx) {
  return `<button class="hero-play" type="button" hidden data-video-play aria-label="${esc(ctx.t.meta.ui.playVideo)}"><svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg></button>`;
}

export function heroCopy(ctx, { bullets = true } = {}) {
  const h = ctx.t.pages.home.hero;
  const list = bullets ? `<ul class="hero-bullets">${h.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : '';
  return `<p class="hero-eyebrow">${esc(h.eyebrow)}</p>
<h1 class="hero-title">${esc(h.title)}</h1>
${list}
<div class="hero-actions">
<a class="btn btn-primary" href="${ctx.paths.toPage(h.primary.page)}">${esc(h.primary.label)}</a>
<a class="btn btn-ghost" href="${ctx.paths.toPage(h.secondary.page, h.secondary.hash)}">${esc(h.secondary.label)}</a>
</div>`;
}

export function scrollCue(ctx) {
  return `<a class="scroll-cue" href="#intro" aria-label="${esc(ctx.t.meta.ui.scrollDown)}"><span></span></a>`;
}

function snapDots(ctx) {
  const ids = ['hero', 'intro', 'services', 'closing', 'feature', 'faq', 'cta'];
  const names = ctx.t.meta.ui.sectionNames;
  return `<nav class="snap-dots" aria-label="${esc(ctx.t.meta.ui.sections)}">${ids
    .map((id) => `<a href="#${id}" aria-label="${esc(names[id])}"><span></span></a>`)
    .join('')}</nav>`;
}

function section(cls, inner) {
  return `<section id="hero" class="hero ${cls}">
${inner}
</section>`;
}

const PANEL_CLIPS = { services: 'windfarm', projects: 'powerlines', company: 'substation' };

function panelMedia(ctx, key) {
  const clip = PANEL_CLIPS[key];
  if (clip) {
    const poster = ctx.paths.asset(`video/${clip}.jpg`);
    return `<div class="panel-media" style="background-image:url(${poster})" aria-hidden="true"><video class="panel-video" autoplay muted loop playsinline preload="metadata" poster="${poster}"><source src="${ctx.paths.asset(`video/${clip}.mp4`)}" type="video/mp4"></video><div class="panel-overlay"></div></div>`;
  }
  const photo = ctx.paths.asset(`img/${pageImages[key]}`);
  return `<div class="panel-media" style="background-image:url(${photo})" aria-hidden="true"><img class="panel-image" src="${photo}" alt=""><div class="panel-overlay"></div></div>`;
}

function panel(ctx, key, index) {
  const p = ctx.t.pages[key];
  const label = `${String(index).padStart(2, '0')} · ${p.title}`;
  const button = key === 'contact' ? ctx.t.pages.home.hero.primary.label : ctx.t.meta.ui.more;
  return `<section id="${key}" class="panel">
${panelMedia(ctx, key)}
<div class="panel-content container"><p class="panel-label">${esc(label)}</p><h2 class="panel-title">${esc(p.hero.lead)}</h2><a class="btn btn-ghost" href="${ctx.paths.toPage(key)}">${esc(button)}</a></div>
</section>`;
}

function teslaPanel(ctx, key) {
  const p = ctx.t.pages[key];
  const more = ctx.t.meta.ui.more;
  const contact = ctx.t.pages.home.hero.primary.label;
  const actions = key === 'contact'
    ? `<a class="btn btn-primary" href="${ctx.paths.toPage(key)}">${esc(contact)}</a>`
    : `<a class="btn btn-primary" href="${ctx.paths.toPage(key)}">${esc(more)}</a><a class="btn btn-ghost" href="${ctx.paths.toPage('contact')}">${esc(contact)}</a>`;
  return `<section id="${key}" class="panel panel-tesla">
${panelMedia(ctx, key)}
<div class="panel-content container"><h2 class="panel-title">${esc(p.title)}</h2><p class="panel-label">${esc(p.hero.lead)}</p></div>
<div class="panel-actions">${actions}</div>
</section>`;
}

function teslaCopy(ctx) {
  const h = ctx.t.pages.home.hero;
  return `<div class="hero-content container"><p class="hero-eyebrow">${esc(h.eyebrow)}</p>
<h1 class="hero-title">${esc(h.title)}</h1></div>
<div class="hero-actions"><a class="btn btn-primary" href="${ctx.paths.toPage(h.primary.page)}">${esc(h.primary.label)}</a><a class="btn btn-ghost" href="${ctx.paths.toPage(h.secondary.page, h.secondary.hash)}">${esc(h.secondary.label)}</a></div>`;
}

function editorialCopy(ctx) {
  const h = ctx.t.pages.home.hero;
  return `<div class="hero-content container"><p class="hero-eyebrow">${esc(h.eyebrow)}</p>
<h1 class="hero-title">${esc(h.title)}</h1>
<p class="hero-lead">${h.bullets.map(esc).join(' · ')}</p>
<div class="hero-actions"><a class="btn btn-primary" href="${ctx.paths.toPage(h.primary.page)}">${esc(h.primary.label)}</a><a class="link-more" href="${ctx.paths.toPage(h.secondary.page, h.secondary.hash)}">${esc(h.secondary.label)}</a></div></div>`;
}

function appleCopy(ctx) {
  const h = ctx.t.pages.home.hero;
  return `<div class="hero-content container"><p class="hero-eyebrow">${esc(h.eyebrow)}</p>
<h1 class="hero-title">${esc(h.title)}</h1></div>
<div class="hero-after container"><p class="hero-lead">${h.bullets.map(esc).join(' · ')}</p>
<div class="hero-actions"><a class="btn btn-primary" href="${ctx.paths.toPage(h.primary.page)}">${esc(h.primary.label)}</a><a class="link-more" href="${ctx.paths.toPage(h.secondary.page, h.secondary.hash)}">${esc(h.secondary.label)}</a></div></div>`;
}

function spacexCopy(ctx) {
  const h = ctx.t.pages.home.hero;
  return `<p class="hero-eyebrow">${esc(h.eyebrow)}</p>
<h1 class="hero-title">${esc(h.title)}</h1>
<div class="hero-actions"><a class="btn btn-primary" href="${ctx.paths.toPage(h.primary.page)}">${esc(h.primary.label)}</a></div>`;
}

export const hero = {
  'bottom-left': (ctx) => section('hero-bottom-left', `${heroVideo(ctx)}${heroPlay(ctx)}<div class="hero-content container">${heroCopy(ctx)}</div>${scrollCue(ctx)}`),
  centered: (ctx) => section('hero-centered', `${heroVideo(ctx)}${heroPlay(ctx)}<div class="hero-content container">${heroCopy(ctx)}</div>${scrollCue(ctx)}`),
  glass: (ctx) => section('hero-glass', `${heroVideo(ctx)}${heroPlay(ctx)}<div class="hero-content container"><div class="glass-panel">${heroCopy(ctx)}</div></div>${scrollCue(ctx)}`),
  split: (ctx) => section('hero-split', `<div class="hero-split-media">${heroVideo(ctx)}${heroPlay(ctx)}</div><div class="hero-content">${heroCopy(ctx)}</div>`),
  apple: (ctx) => section('hero-apple', `<div class="hero-stage">${heroVideo(ctx)}${heroPlay(ctx)}${appleCopy(ctx)}</div>`),
  editorial: (ctx) => section('hero-editorial', `${editorialCopy(ctx)}<div class="hero-media-box container">${heroVideo(ctx)}${heroPlay(ctx)}</div>`),
  tesla: (ctx) => section('hero-tesla hero-top-center', `${heroVideo(ctx)}${heroPlay(ctx)}${teslaCopy(ctx)}<a class="scroll-cue" href="#services" aria-label="${esc(ctx.t.meta.ui.scrollDown)}"><span></span></a>`)
    + ['services', 'projects', 'company', 'careers', 'contact'].map((key) => teslaPanel(ctx, key)).join('\n'),
  spacex: (ctx) => section('hero-spacex hero-bottom-left', `${heroVideo(ctx)}${heroPlay(ctx)}<div class="hero-content container">${spacexCopy(ctx)}</div><a class="scroll-cue" href="#services" aria-label="${esc(ctx.t.meta.ui.scrollDown)}"><span></span></a>`)
    + ['services', 'projects', 'company', 'careers', 'contact'].map((key, i) => panel(ctx, key, i + 1)).join('\n'),
  'snap-stack': (ctx) => section('hero-snap-stack hero-bottom-left', `${heroVideo(ctx)}${heroPlay(ctx)}<div class="hero-content container">${heroCopy(ctx, { bullets: false })}</div>${scrollCue(ctx)}`) + snapDots(ctx),
};
