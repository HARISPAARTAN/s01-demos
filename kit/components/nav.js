import { esc } from '../html.js';

export function navLinks(ctx) {
  return ctx.t.meta.nav
    .map((item) => {
      const current = item.page === ctx.page ? ' aria-current="page"' : '';
      return `<li><a href="${ctx.paths.toPage(item.page)}"${current}>${esc(item.label)}</a></li>`;
    })
    .join('');
}

export function logo(ctx, mark = false) {
  return `<a class="logo${mark ? ' logo-mark' : ''}" href="${ctx.paths.toPage('home')}" aria-label="${esc(ctx.t.meta.siteName)}">${mark ? ctx.logo.mark : ctx.logo.lang}</a>`;
}

export function langToggle(ctx) {
  const u = ctx.t.meta.ui;
  return `<a class="lang-toggle" href="${ctx.paths.otherLang()}" hreflang="${ctx.paths.other}" lang="${ctx.paths.other}" title="${esc(u.switchLang)}">${ctx.paths.other.toUpperCase()}</a>`;
}

function burger(ctx) {
  return `<button class="nav-burger" type="button" aria-expanded="false" aria-controls="site-menu" aria-label="${esc(ctx.t.meta.ui.menu)}"><span></span><span></span><span></span></button>`;
}

function contactLine(ctx) {
  const c = ctx.t.meta.company;
  return `<div class="nav-contact"><a href="mailto:${esc(c.email)}">${esc(c.email)}</a><a href="tel:${esc(c.phoneMobileHref)}">${esc(c.phoneMobile)}</a></div>`;
}

function shell(cls, inner) {
  return `<header class="site-header ${cls}" data-nav="${cls}">
<div class="nav-inner">
${inner}
</div>
</header>`;
}

function standard(ctx, cls) {
  return shell(cls, `${logo(ctx)}
${burger(ctx)}
<nav id="site-menu" class="site-nav" aria-label="${esc(ctx.t.meta.ui.mainNav)}">
<ul>${navLinks(ctx)}</ul>
${langToggle(ctx)}
</nav>`);
}

export const nav = {
  transparent: (ctx) => standard(ctx, 'nav-transparent'),
  solid: (ctx) => standard(ctx, 'nav-solid'),
  pill: (ctx) => standard(ctx, 'nav-pill'),
  hamburger: (ctx) => shell('nav-hamburger', `${logo(ctx)}
<div class="nav-tools">${langToggle(ctx)}${burger(ctx)}</div>
<nav id="site-menu" class="site-nav nav-overlay" aria-label="${esc(ctx.t.meta.ui.mainNav)}">
<ul>${navLinks(ctx)}</ul>
${contactLine(ctx)}
</nav>`),
  sidebar: (ctx) => shell('nav-sidebar', `${logo(ctx)}
${burger(ctx)}
<nav id="site-menu" class="site-nav" aria-label="${esc(ctx.t.meta.ui.mainNav)}">
<ul>${navLinks(ctx)}</ul>
${langToggle(ctx)}
${contactLine(ctx)}
</nav>`),
};
