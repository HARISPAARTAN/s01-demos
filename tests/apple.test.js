import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hero } from '../kit/components/hero.js';
import { resolveVariants } from '../kit/components/index.js';
import { renderPage, bodyClasses } from '../kit/render.js';
import { validateDemo } from '../build/lib/demos.js';
import { registry } from '../kit/components/index.js';
import { makeCtx, demoFixture, count } from './support/ctx.js';

const apple = { ...demoFixture, id: '06-apple-cinematic', motion: 'cinematic', variants: { ...demoFixture.variants, nav: 'solid', hero: 'apple' } };

test('hero.apple renders a sticky stage with the headline block and a separate lead/actions block', () => {
  const html = hero.apple(makeCtx({ demo: apple }));
  assert.ok(html.startsWith('<section id="hero" class="hero hero-apple'));
  assert.equal(count(html, /<div class="hero-stage">/g), 1);
  assert.equal(count(html, /<video class="hero-video"/g), 1);
  const content = html.indexOf('<div class="hero-content container">');
  const after = html.indexOf('<div class="hero-after container">');
  assert.ok(content > 0 && after > content, 'headline block first, lead/actions block second');
  assert.ok(html.includes('<h1 class="hero-title">Projektsteuerung für Energieinfrastruktur.</h1>'));
  assert.ok(html.slice(after).includes('<p class="hero-lead">Über 10 Jahre Erfahrung im Energiesektor · PMP®-zertifizierte Projektmanagementmethodik · Direkter Ansprechpartner während der gesamten Projektlaufzeit</p>'));
  assert.ok(html.slice(after).includes('<a class="btn btn-primary" href="kontakt.html">Kontakt aufnehmen</a>'));
  assert.ok(html.slice(after).includes('<a class="link-more" href="services.html">Unsere Leistungen</a>'));
  assert.equal(count(html, /<li>/g), 0);
  assert.ok(!html.includes('scroll-cue'));
});

test('cinematic demos get the body class, the Lenis and cinematic scripts; refined demos do not', () => {
  const C = resolveVariants(apple);
  const page = renderPage(makeCtx({ demo: apple }), C);
  assert.ok(bodyClasses(makeCtx({ demo: apple })).endsWith(' hero-apple-layout motion-cinematic'));
  assert.ok(page.includes('<script src="../../kit/vendor/lenis.min.js" defer></script>'));
  assert.ok(page.includes('<script src="../../kit/motion-cinematic.js" defer></script>'));
  assert.ok(page.indexOf('kit/base.js') < page.indexOf('kit/vendor/lenis.min.js'), 'base.js loads first');
  const refined = renderPage(makeCtx(), resolveVariants(demoFixture));
  assert.ok(!refined.includes('motion-cinematic') && !refined.includes('lenis'));
  for (const html of [page, refined]) {
    assert.ok(html.includes('document.documentElement.classList.add("js-motion")'), 'inline head script sets js-motion');
    assert.ok(html.includes('prefers-reduced-motion: reduce'), 'and respects reduced motion');
  }
});

test('validateDemo accepts refined, cinematic or no motion and rejects anything else', () => {
  const videos = ['trailer'];
  assert.doesNotThrow(() => validateDemo({ ...demoFixture }, '01-original', registry, videos));
  assert.doesNotThrow(() => validateDemo({ ...demoFixture, motion: 'refined' }, '01-original', registry, videos));
  assert.doesNotThrow(() => validateDemo({ ...demoFixture, motion: 'cinematic' }, '01-original', registry, videos));
  assert.throws(() => validateDemo({ ...demoFixture, motion: 'wild' }, '01-original', registry, videos), /motion must be "refined" \(default\) or "cinematic"/);
});
