import { document, esc } from './html.js';
import { renderMain } from './pages.js';
import { badge } from './components/badge.js';

export function fontsLink(fonts) {
  if (!fonts || !fonts.length) return '';
  const families = fonts.map((f) => `family=${f}`).join('&');
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${families}&display=swap">`;
}

export function bodyClasses(ctx) {
  const v = ctx.demo.variants;
  const cls = [`demo-${ctx.demo.id}`, `scheme-${ctx.demo.scheme}`, `page-${ctx.page}`, `nav-${v.nav}-layout`, `hero-${v.hero}-layout`];
  if (ctx.page === 'home' && v.hero === 'snap-stack') cls.push('snap-home');
  return cls.join(' ');
}

export function renderPage(ctx, C) {
  const t = ctx.t;
  const page = t.pages[ctx.page];
  const head = `${fontsLink(ctx.demo.fonts)}
<link rel="stylesheet" href="${ctx.paths.kit('base.css')}">
<link rel="stylesheet" href="${ctx.paths.theme()}">
<link rel="alternate" hreflang="${ctx.lang}" href="${ctx.paths.toPage(ctx.page)}">
<link rel="alternate" hreflang="${ctx.paths.other}" href="${ctx.paths.otherLang()}">
<link rel="icon" href="${ctx.paths.asset('img/favicon.svg')}" type="image/svg+xml">`;
  const body = `<a class="skip-link" href="#main">${esc(t.meta.ui.skip)}</a>
${C.nav(ctx)}
<main id="main">
${renderMain(ctx, C)}
</main>
${C.footer(ctx)}
${badge(ctx)}`;
  return document({
    lang: ctx.lang,
    title: `${page.title} | ${t.meta.siteName}`,
    description: page.description,
    head,
    bodyClass: bodyClasses(ctx),
    body,
    scripts: `<script src="${ctx.paths.kit('base.js')}" defer></script>`,
  });
}
