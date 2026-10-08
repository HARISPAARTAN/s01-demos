import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registry, resolveVariants } from '../kit/components/index.js';
import { renderMain } from '../kit/pages.js';
import { renderPage, fontsLink, bodyClasses } from '../kit/render.js';
import { makeCtx, demoFixture, count } from './support/ctx.js';

test('registry exposes every variant listed in the spec', () => {
  const expected = {
    nav: ['transparent', 'solid', 'sidebar', 'hamburger', 'pill'],
    hero: ['bottom-left', 'centered', 'glass', 'split', 'snap-stack'],
    services: ['grid', 'numbered', 'bento', 'scroll', 'accordion', 'rows', 'timeline'],
    feature: ['columns', 'tabs', 'stats'],
    projects: ['cards', 'timeline', 'table', 'masonry'],
    faq: ['accordion', 'two-column'],
    footer: ['columns', 'minimal', 'mega'],
    contact: ['split', 'centered'],
  };
  for (const [key, names] of Object.entries(expected)) {
    assert.deepEqual(Object.keys(registry[key]).sort(), names.sort(), key);
  }
});

test('resolveVariants returns the chosen functions and rejects unknown names', () => {
  const C = resolveVariants(demoFixture);
  assert.equal(C.hero, registry.hero.centered);
  assert.throws(() => resolveVariants({ ...demoFixture, variants: { ...demoFixture.variants, faq: 'x' } }), /unknown faq variant "x"\. Valid: accordion, two-column/);
});

test('renderMain composes every page with exactly one h1', () => {
  const C = resolveVariants(demoFixture);
  for (const page of ['home', 'services', 'projects', 'company', 'careers', 'contact', 'imprint', 'privacy']) {
    const html = renderMain(makeCtx({ page }), C);
    assert.equal(count(html, /<h1[ >]/g), 1, page);
  }
  const home = renderMain(makeCtx({ page: 'home' }), C);
  for (const id of ['hero', 'intro', 'services', 'closing', 'feature', 'faq', 'cta']) assert.ok(home.includes(`id="${id}"`), id);
  const services = renderMain(makeCtx({ page: 'services' }), C);
  assert.ok(services.includes('id="risk"'));
  assert.ok(services.includes('Ruhe und Sicherheit für Ihre Entscheidungen'));
  assert.ok(services.includes('href="unternehmen.html"'));
  assert.ok(!renderMain(makeCtx({ page: 'careers' }), C).includes('id="cta"'));
});

test('fontsLink and bodyClasses', () => {
  assert.equal(fontsLink([]), '');
  assert.ok(fontsLink(['Inter:wght@400;700', 'Fraunces:wght@600']).includes('href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Fraunces:wght@600&display=swap"'));
  assert.equal(bodyClasses(makeCtx({ page: 'services' })), 'demo-01-original scheme-light page-services nav-solid-layout hero-centered-layout');
  const snap = { ...demoFixture, variants: { ...demoFixture.variants, hero: 'snap-stack' } };
  assert.ok(bodyClasses(makeCtx({ page: 'home', demo: snap })).endsWith(' snap-home'));
  assert.ok(!bodyClasses(makeCtx({ page: 'services', demo: snap })).includes('snap-home'));
});

test('renderPage produces a complete document', () => {
  const ctx = makeCtx({ page: 'projects', lang: 'en' });
  const html = renderPage(ctx, resolveVariants(demoFixture));
  assert.ok(html.startsWith('<!doctype html>\n<html lang="en">'));
  assert.ok(html.includes('<title>Selected Projects | S01 Projektmanagement</title>'));
  assert.ok(html.includes('<link rel="stylesheet" href="../../kit/base.css">'));
  assert.ok(html.includes('<link rel="stylesheet" href="../theme.css">'));
  assert.ok(html.includes('<link rel="alternate" hreflang="de" href="../de/projekte.html">'));
  assert.ok(html.includes('<link rel="alternate" hreflang="en" href="projects.html">'));
  assert.ok(html.includes('<link rel="icon" href="../../assets/img/favicon.svg" type="image/svg+xml">'));
  assert.ok(html.includes('<a class="skip-link" href="#main">Skip to content</a>'));
  assert.ok(html.includes('<main id="main">'));
  assert.ok(html.includes('<script src="../../kit/base.js" defer></script>'));
  assert.ok(html.includes('class="demo-badge"'));
  assert.ok(html.includes('<footer class="site-footer footer-columns">'));
});
