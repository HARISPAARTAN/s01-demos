import { test } from 'node:test';
import assert from 'node:assert/strict';
import { intro, closing, pageHero, cta } from '../kit/components/sections.js';
import { makeCtx } from './support/ctx.js';

test('intro and closing render ids and content', () => {
  const ctx = makeCtx();
  const i = intro(ctx);
  assert.ok(i.includes('<section id="intro" class="section intro">'));
  assert.ok(i.includes(ctx.t.pages.home.intro.title));
  assert.ok(i.includes('<p class="lead">'));
  const c = closing(ctx);
  assert.ok(c.includes('<section id="closing"'));
  assert.ok(c.includes('strategische Prioritäten'));
});

test('pageHero renders breadcrumb, h1, optional lead and image', () => {
  const ctx = makeCtx({ page: 'services' });
  const html = pageHero(ctx, ctx.t.pages.services.hero, 'substation.jpg');
  assert.ok(html.includes('<h1>Services</h1>'));
  assert.ok(html.includes('<nav class="breadcrumb" aria-label="Brotkrümelnavigation">'));
  assert.ok(html.includes('<a href="index.html">Startseite</a>'));
  assert.ok(html.includes('<img src="../../assets/img/substation.jpg" alt="">'));
  assert.ok(html.includes('class="page-hero has-media"'));
  const plain = pageHero(makeCtx({ page: 'imprint' }), { title: 'Impressum', lead: '' });
  assert.ok(!plain.includes('<img'));
  assert.ok(!plain.includes('class="lead"'));
});

test('cta links to the contact page', () => {
  const html = cta(makeCtx());
  assert.ok(html.includes('<section id="cta" class="section cta">'));
  assert.ok(html.includes('href="kontakt.html"'));
  assert.ok(html.includes('Starten Sie mit einem kostenlosen Erstgespräch'));
});
