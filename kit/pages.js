import { esc } from './html.js';
import { intro, closing, pageHero, cta } from './components/sections.js';
import { company } from './components/company.js';
import { careers } from './components/careers.js';
import { legal } from './components/legal.js';
import { pageImages } from './images.js';

function calm(ctx) {
  const s = ctx.t.pages.services.calm;
  return `<section class="section calm"><div class="container narrow"><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p><a class="btn btn-ghost" href="${ctx.paths.toPage(s.page)}">${esc(s.button)}</a></div></section>`;
}

export function renderMain(ctx, C) {
  const t = ctx.t.pages;
  switch (ctx.page) {
    case 'home':
      return [C.hero(ctx), intro(ctx), C.services(ctx), closing(ctx), C.feature(ctx), C.faq(ctx, t.home.faq), cta(ctx)].join('\n');
    case 'services':
      return [pageHero(ctx, t.services.hero, pageImages.services), C.services(ctx), calm(ctx), C.faq(ctx, t.services.faq), cta(ctx)].join('\n');
    case 'projects':
      return [pageHero(ctx, t.projects.hero, pageImages.projects), C.projects(ctx), cta(ctx)].join('\n');
    case 'company':
      return [company(ctx), cta(ctx)].join('\n');
    case 'careers':
      return careers(ctx, C.faq);
    case 'contact':
      return [pageHero(ctx, t.contact.hero, pageImages.contact), C.contact(ctx)].join('\n');
    case 'imprint':
      return legal(ctx, t.imprint);
    case 'privacy':
      return legal(ctx, t.privacy);
    default:
      throw new Error(`Unknown page "${ctx.page}"`);
  }
}
