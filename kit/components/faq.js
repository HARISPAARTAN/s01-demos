import { esc, paragraphs } from '../html.js';

function wrap(cls, inner) {
  return `<section id="faq" class="section faq ${cls}"><div class="container narrow">${inner}</div></section>`;
}

export const faq = {
  accordion(ctx, data = ctx.t.pages[ctx.page].faq) {
    return wrap('faq-accordion', `<h2>${esc(data.title)}</h2><div class="acc-list">${data.items
      .map((it, i) => {
        const id = `faq-${ctx.page}-${i}`;
        return `<div class="acc"><h3 class="acc-heading"><button class="acc-trigger" type="button" aria-expanded="false" aria-controls="${id}"><span class="acc-label">${esc(it.q)}</span><span class="acc-icon" aria-hidden="true"></span></button></h3><div class="acc-panel" id="${id}" hidden>${paragraphs(it.a)}</div></div>`;
      })
      .join('')}</div>`);
  },
  'two-column'(ctx, data = ctx.t.pages[ctx.page].faq) {
    return wrap('faq-two-column', `<h2>${esc(data.title)}</h2><div class="faq-grid">${data.items
      .map((it) => `<div class="faq-item"><h3>${esc(it.q)}</h3>${paragraphs(it.a)}</div>`)
      .join('')}</div>`);
  },
};
