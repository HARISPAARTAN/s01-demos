import { esc, paragraphs } from '../html.js';

export function intro(ctx) {
  const s = ctx.t.pages.home.intro;
  return `<section id="intro" class="section intro"><div class="container narrow"><h2 class="statement">${esc(s.title)}</h2>${paragraphs(s.text, 'lead')}</div></section>`;
}

export function closing(ctx) {
  const s = ctx.t.pages.home.closing;
  return `<section id="closing" class="section closing"><div class="container narrow"><p class="statement">${esc(s.text)}</p></div></section>`;
}

export function pageHero(ctx, data, imageFile = '') {
  const u = ctx.t.meta.ui;
  const media = imageFile
    ? `<div class="page-hero-media" aria-hidden="true"><img src="${ctx.paths.asset(`img/${imageFile}`)}" alt="" width="1600" height="1067"></div>`
    : '';
  const lead = data.lead ? `<p class="lead">${esc(data.lead)}</p>` : '';
  return `<section class="page-hero${imageFile ? ' has-media' : ''}">${media}<div class="container"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="${ctx.paths.toPage('home')}">${esc(u.breadcrumbHome)}</a><span aria-hidden="true">→</span><span aria-current="page">${esc(data.title)}</span></nav><h1>${esc(data.title)}</h1>${lead}</div></section>`;
}

export function cta(ctx) {
  const c = ctx.t.meta.cta;
  return `<section id="cta" class="section cta"><div class="container"><div class="cta-box"><h2>${esc(c.title)}</h2><p>${esc(c.text)}</p><a class="btn btn-primary" href="${ctx.paths.toPage('contact')}">${esc(c.button)}</a></div></div></section>`;
}
