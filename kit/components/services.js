import { esc, paragraphs, list } from '../html.js';
import { serviceImages } from '../images.js';

function data(ctx) {
  const detailed = ctx.page === 'services';
  const src = detailed ? ctx.t.pages.services : ctx.t.pages.home.services;
  return { detailed, items: src.items, title: detailed ? src.sectionTitle : src.title, eyebrow: src.eyebrow };
}

function head(d) {
  return `<header class="section-head"><p class="eyebrow">${esc(d.eyebrow)}</p><h2>${esc(d.title)}</h2></header>`;
}

function img(ctx, item, cls = 'card-media') {
  return `<figure class="${cls}"><img src="${ctx.paths.asset(`img/${serviceImages[item.id]}`)}" alt="${esc(item.imageAlt)}" loading="lazy" width="1600" height="1067"></figure>`;
}

function body(ctx, d, item) {
  const bullets = d.detailed && item.bullets ? list(item.bullets, 'checks') : '';
  const more = d.detailed ? '' : `<a class="link-more" href="${ctx.paths.toPage('services', item.id)}">${esc(ctx.t.meta.ui.more)}</a>`;
  return `${paragraphs(item.text)}${bullets}${more}`;
}

function idAttr(d, item) {
  return d.detailed ? ` id="${item.id}"` : '';
}

function wrap(cls, inner) {
  return `<section id="services" class="section services ${cls}"><div class="container">${inner}</div></section>`;
}

const num = (i) => String(i + 1).padStart(2, '0');

export const services = {
  grid(ctx) {
    const d = data(ctx);
    return wrap('services-grid', head(d) + `<div class="grid grid-3">${d.items
      .map((item) => `<article class="card"${idAttr(d, item)}>${img(ctx, item)}<div class="card-body"><h3>${esc(item.title)}</h3>${body(ctx, d, item)}</div></article>`)
      .join('')}</div>`);
  },
  numbered(ctx) {
    const d = data(ctx);
    return wrap('services-numbered', head(d) + `<ol class="num-list">${d.items
      .map((item, i) => `<li class="num-item"${idAttr(d, item)}><span class="num" aria-hidden="true">${num(i)}</span><div class="num-body"><h3>${esc(item.title)}</h3>${body(ctx, d, item)}</div></li>`)
      .join('')}</ol>`);
  },
  bento(ctx) {
    const d = data(ctx);
    return wrap('services-bento', head(d) + `<div class="bento-grid">${d.items
      .map((item, i) => {
        const wide = i === 0 || i === 3;
        return `<article class="bento-item${wide ? ' bento-wide' : ''}"${idAttr(d, item)}>${wide ? img(ctx, item, 'bento-media') : ''}<div class="bento-body"><span class="num" aria-hidden="true">${num(i)}</span><h3>${esc(item.title)}</h3>${body(ctx, d, item)}</div></article>`;
      })
      .join('')}</div>`);
  },
  scroll(ctx) {
    const d = data(ctx);
    return wrap('services-scroll', head(d) + `<div class="scroll-track" tabindex="0">${d.items
      .map((item, i) => `<article class="scroll-card"${idAttr(d, item)}><span class="num big" aria-hidden="true">${num(i)}</span>${img(ctx, item)}<h3>${esc(item.title)}</h3>${body(ctx, d, item)}</article>`)
      .join('')}</div>`);
  },
  accordion(ctx) {
    const d = data(ctx);
    return wrap('services-accordion', head(d) + `<div class="acc-list">${d.items
      .map((item, i) => `<div class="acc"${idAttr(d, item)}><h3 class="acc-heading"><button class="acc-trigger" type="button" aria-expanded="${i === 0 ? 'true' : 'false'}" aria-controls="svc-${item.id}"><span class="num" aria-hidden="true">${num(i)}</span><span class="acc-label">${esc(item.title)}</span><span class="acc-icon" aria-hidden="true"></span></button></h3><div class="acc-panel" id="svc-${item.id}"${i === 0 ? '' : ' hidden'}>${body(ctx, d, item)}</div></div>`)
      .join('')}</div>`);
  },
  rows(ctx) {
    const d = data(ctx);
    return wrap('services-rows', head(d) + d.items
      .map((item, i) => `<article class="row${i % 2 ? ' row-reverse' : ''}"${idAttr(d, item)}>${img(ctx, item, 'row-media')}<div class="row-body"><span class="num" aria-hidden="true">${num(i)}</span><h3>${esc(item.title)}</h3>${body(ctx, d, item)}</div></article>`)
      .join(''));
  },
  timeline(ctx) {
    const d = data(ctx);
    return wrap('services-timeline', head(d) + `<ol class="tl">${d.items
      .map((item, i) => `<li class="tl-item"${idAttr(d, item)}><span class="tl-marker" aria-hidden="true">${num(i)}</span><div class="tl-body"><h3>${esc(item.title)}</h3>${body(ctx, d, item)}</div></li>`)
      .join('')}</ol>`);
  },
};
