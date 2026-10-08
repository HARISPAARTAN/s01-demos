import { esc, paragraphs, list } from '../html.js';
import { pageHero } from './sections.js';
import { pageImages } from '../images.js';

function words(items) {
  return `<ul class="word-grid">${items.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>`;
}

export function company(ctx) {
  const c = ctx.t.pages.company;
  return `${pageHero(ctx, c.hero, pageImages.company)}
<section class="section about"><div class="container narrow"><p class="eyebrow">${esc(c.about.eyebrow)}</p><h2 class="statement">${esc(c.about.title)}</h2></div></section>
<section class="section mission-vision"><div class="container"><div class="grid grid-2"><div class="card card-pad"><h2>${esc(c.mission.title)}</h2>${paragraphs(c.mission.text)}</div><div class="card card-pad"><h2>${esc(c.vision.title)}</h2>${paragraphs(c.vision.text)}</div></div></div></section>
<section class="section values"><div class="container"><header class="section-head"><p class="eyebrow">${esc(c.values.eyebrow)}</p><h2>${esc(c.values.title)}</h2></header>${words(c.values.items)}<div class="narrow">${paragraphs(c.values.text)}</div></div></section>
<section class="section method"><div class="container"><header class="section-head"><p class="eyebrow">${esc(c.method.eyebrow)}</p><h2>${esc(c.method.title)}</h2></header>${words(c.method.items)}<div class="narrow">${paragraphs(c.method.text)}</div></div></section>
<section class="section quality"><div class="container"><div class="grid grid-2"><div><p class="eyebrow">${esc(c.quality.eyebrow)}</p><h2>${esc(c.quality.title)}</h2>${paragraphs(c.quality.text)}</div><div>${list(c.quality.items, 'checks big')}</div></div></div></section>`;
}
