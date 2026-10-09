import { esc, list } from '../html.js';

function wrap(cls, inner) {
  return `<section id="projects" class="section projects ${cls}"><div class="container">${inner}</div></section>`;
}

const num = (i) => String(i + 1).padStart(2, '0');

export const projects = {
  cards(ctx) {
    const p = ctx.t.pages.projects;
    return wrap('projects-cards', `<div class="grid grid-2">${p.items
      .map((it, i) => `<article class="card project-card"><p class="eyebrow">${esc(p.label)} ${num(i)}</p><h2>${esc(it.title)}</h2><p class="label">${esc(p.servicesLabel)}</p>${list(it.services, 'checks')}</article>`)
      .join('')}</div>`);
  },
  timeline(ctx) {
    const p = ctx.t.pages.projects;
    return wrap('projects-timeline', `<ol class="tl">${p.items
      .map((it, i) => `<li class="tl-item"><span class="tl-marker" aria-hidden="true">${num(i)}</span><div class="tl-body"><p class="eyebrow">${esc(p.label)}</p><h2>${esc(it.title)}</h2>${list(it.services, 'checks')}</div></li>`)
      .join('')}</ol>`);
  },
  table(ctx) {
    const p = ctx.t.pages.projects;
    return wrap('projects-table', `<div class="table-wrap"><table class="table"><thead><tr><th scope="col">#</th><th scope="col">${esc(p.label)}</th><th scope="col">${esc(p.servicesLabel)}</th></tr></thead><tbody>${p.items
      .map((it, i) => `<tr><td class="num">${num(i)}</td><th scope="row">${esc(it.title)}</th><td data-label="${esc(p.servicesLabel)}">${list(it.services, 'plain')}</td></tr>`)
      .join('')}</tbody></table></div>`);
  },
  masonry(ctx) {
    const p = ctx.t.pages.projects;
    return wrap('projects-masonry', `<div class="masonry">${p.items
      .map((it, i) => `<article class="card project-card"><span class="num big" aria-hidden="true">${num(i)}</span><h2>${esc(it.title)}</h2>${list(it.services, 'checks')}</article>`)
      .join('')}</div>`);
  },
};
