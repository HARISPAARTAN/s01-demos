import { esc } from '../html.js';
import { logo } from './nav.js';

function footerLinks(ctx) {
  return ctx.t.meta.footerNav.map((it) => `<li><a href="${ctx.paths.toPage(it.page)}">${esc(it.label)}</a></li>`).join('');
}

function mainLinks(ctx) {
  return ctx.t.meta.nav.map((it) => `<li><a href="${ctx.paths.toPage(it.page)}">${esc(it.label)}</a></li>`).join('');
}

function address(ctx) {
  const c = ctx.t.meta.company;
  return `<address class="footer-address"><strong>${esc(ctx.t.meta.legalName)}</strong><br>${esc(c.street)}<br>${esc(c.city)}<br><a href="mailto:${esc(c.email)}">${esc(c.email)}</a><br><a href="tel:${esc(c.phoneHref)}">${esc(c.phone)}</a></address>`;
}

function iso(ctx) {
  return `<p class="footer-iso"><span class="iso-badge" aria-hidden="true">ISO</span>${esc(ctx.t.meta.company.iso)}</p>`;
}

function copy(ctx) {
  return `<p class="footer-copy">© ${new Date().getFullYear()} ${esc(ctx.t.meta.legalName)}</p>`;
}

function langAttr(ctx) {
  return ctx.lang === 'en' ? '' : ' lang="en"';
}

function wrap(cls, inner) {
  return `<footer class="site-footer ${cls}"><div class="container">${inner}</div></footer>`;
}

export const footer = {
  columns(ctx) {
    return wrap('footer-columns', `<div class="footer-grid"><div>${logo(ctx)}<p class="tagline"${langAttr(ctx)}>${esc(ctx.t.meta.tagline)}</p></div>${address(ctx)}<nav aria-label="${esc(ctx.t.meta.ui.footerNav)}"><ul class="footer-links">${footerLinks(ctx)}</ul></nav><div>${iso(ctx)}</div></div>${copy(ctx)}`);
  },
  minimal(ctx) {
    return wrap('footer-minimal', `<p class="tagline"${langAttr(ctx)}>${esc(ctx.t.meta.tagline)}</p>${address(ctx)}<nav aria-label="${esc(ctx.t.meta.ui.footerNav)}"><ul class="footer-links inline">${footerLinks(ctx)}</ul></nav>${iso(ctx)}${copy(ctx)}`);
  },
  mega(ctx) {
    return wrap('footer-mega', `<div class="footer-top"><p class="tagline-big"${langAttr(ctx)}>${esc(ctx.t.meta.tagline)}</p><a class="btn btn-primary" href="${ctx.paths.toPage('contact')}">${esc(ctx.t.meta.cta.button)}</a></div><div class="footer-grid">${address(ctx)}<nav aria-label="${esc(ctx.t.meta.ui.footerMainNav)}"><ul class="footer-links">${mainLinks(ctx)}</ul></nav><nav aria-label="${esc(ctx.t.meta.ui.footerNav)}"><ul class="footer-links">${footerLinks(ctx)}</ul></nav><div>${iso(ctx)}</div></div>${copy(ctx)}`);
  },
};
