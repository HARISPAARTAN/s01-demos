import { esc } from '../html.js';

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
  return `<nav class="snap-dots" aria-label="${esc(ctx.t.meta.ui.sections)}">${ids
    .map((id) => `<a href="#${id}" aria-label="${id}"><span></span></a>`)
    .join('')}</nav>`;
}

function section(cls, inner) {
  return `<section id="hero" class="hero ${cls}">
${inner}
</section>`;
}

export const hero = {
  'bottom-left': (ctx) => section('hero-bottom-left', `${heroVideo(ctx)}${heroPlay(ctx)}<div class="hero-content container">${heroCopy(ctx)}</div>${scrollCue(ctx)}`),
  centered: (ctx) => section('hero-centered', `${heroVideo(ctx)}${heroPlay(ctx)}<div class="hero-content container">${heroCopy(ctx)}</div>${scrollCue(ctx)}`),
  glass: (ctx) => section('hero-glass', `${heroVideo(ctx)}${heroPlay(ctx)}<div class="hero-content container"><div class="glass-panel">${heroCopy(ctx)}</div></div>${scrollCue(ctx)}`),
  split: (ctx) => section('hero-split', `<div class="hero-split-media">${heroVideo(ctx)}${heroPlay(ctx)}</div><div class="hero-content">${heroCopy(ctx)}</div>`),
  'snap-stack': (ctx) => section('hero-snap-stack hero-bottom-left', `${heroVideo(ctx)}${heroPlay(ctx)}<div class="hero-content container">${heroCopy(ctx, { bullets: false })}</div>${scrollCue(ctx)}`) + snapDots(ctx),
};
