import { esc } from '../html.js';

function head(f) {
  return `<header class="section-head"><p class="eyebrow">${esc(f.eyebrow)}</p><h2>${esc(f.title)}</h2></header>`;
}

function pillars(f) {
  return `<div class="grid grid-4">${f.pillars.map((p) => `<div class="pillar"><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join('')}</div>`;
}

function wrap(cls, inner) {
  return `<section id="feature" class="section feature ${cls}"><div class="container">${inner}</div></section>`;
}

export const feature = {
  columns(ctx) {
    const f = ctx.t.pages.home.feature;
    return wrap('feature-columns', head(f) + pillars(f));
  },
  tabs(ctx) {
    const f = ctx.t.pages.home.feature;
    const tabs = f.pillars
      .map((p, i) => `<button role="tab" type="button" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0 ? 'true' : 'false'}" tabindex="${i === 0 ? '0' : '-1'}">${esc(p.title)}</button>`)
      .join('');
    const panels = f.pillars
      .map((p, i) => `<div role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}"${i === 0 ? '' : ' hidden'}><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`)
      .join('');
    return wrap('feature-tabs', head(f) + `<div class="tabs" data-tabs><div class="tablist" role="tablist" aria-label="${esc(f.title)}">${tabs}</div>${panels}</div>`);
  },
  stats(ctx) {
    const f = ctx.t.pages.home.feature;
    const stats = `<div class="stats">${f.stats.map((s) => `<div class="stat"><span class="stat-value">${esc(s.value)}</span><span class="stat-label">${esc(s.label)}</span></div>`).join('')}</div>`;
    return wrap('feature-stats', head(f) + stats + pillars(f));
  },
};
