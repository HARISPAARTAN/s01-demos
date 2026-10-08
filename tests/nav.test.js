import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nav } from '../kit/components/nav.js';
import { badge } from '../kit/components/badge.js';
import { makeCtx, count } from './support/ctx.js';

for (const variant of ['transparent', 'solid', 'pill', 'hamburger', 'sidebar']) {
  test(`nav.${variant} renders 6 links, burger, toggle and current page`, () => {
    const html = nav[variant](makeCtx({ page: 'services' }));
    assert.ok(html.includes(`class="site-header nav-${variant}"`));
    assert.ok(html.includes('<nav id="site-menu" class="site-nav'));
    assert.equal(count(html, /<li><a href="/g), 6);
    assert.ok(html.includes('<a href="services.html" aria-current="page">Services</a>'));
    assert.ok(html.includes('href="index.html"'));
    assert.ok(html.includes('class="nav-burger" type="button" aria-expanded="false" aria-controls="site-menu"'));
    assert.ok(html.includes('<a class="lang-toggle" href="../en/services.html" hreflang="en" lang="en"'));
    assert.ok(html.includes('role="img"'), 'inline logo present');
  });
}

test('nav labels follow the language', () => {
  const html = nav.solid(makeCtx({ lang: 'en', page: 'projects' }));
  assert.ok(html.includes('<a href="projects.html" aria-current="page">Projects</a>'));
  assert.ok(html.includes('href="../de/projekte.html" hreflang="de"'));
});

test('hamburger and sidebar include contact details', () => {
  for (const v of ['hamburger', 'sidebar']) {
    const html = nav[v](makeCtx());
    assert.ok(html.includes('mailto:info@s01-pm.de'));
    assert.ok(html.includes('tel:+4915730021089'));
  }
});

test('badge links to the gallery with the demo number', () => {
  const html = badge(makeCtx());
  assert.ok(html.includes('href="../../index.html"'));
  assert.ok(html.includes('Demo 01/24 · Alle Demos'));
  assert.ok(html.includes('class="demo-badge-close" type="button" aria-label="Schließen"'));
});
