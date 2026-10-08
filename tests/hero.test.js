import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hero } from '../kit/components/hero.js';
import { makeCtx, count } from './support/ctx.js';

for (const variant of ['bottom-left', 'centered', 'glass', 'split', 'snap-stack']) {
  test(`hero.${variant} renders full-screen video markup and copy`, () => {
    const html = hero[variant](makeCtx());
    assert.ok(html.includes(`<section id="hero" class="hero hero-${variant}`));
    assert.ok(html.includes('<video class="hero-video" autoplay muted loop playsinline preload="metadata" poster="../../assets/video/trailer.webp" data-video>'));
    assert.ok(html.includes('<source src="../../assets/video/trailer.mp4" type="video/mp4">'));
    assert.ok(html.includes('<button class="hero-play" type="button" hidden data-video-play aria-label="Video abspielen">'));
    assert.ok(html.includes('<h1 class="hero-title">Projektsteuerung für Energieinfrastruktur.</h1>'));
    assert.ok(html.includes('<a class="btn btn-primary" href="kontakt.html">Kontakt aufnehmen</a>'));
    assert.ok(html.includes('<a class="btn btn-ghost" href="services.html">Unsere Leistungen</a>'));
    assert.ok(html.includes('<div class="hero-media" style="background-image:url(../../assets/video/trailer.webp)" aria-hidden="true">'));
    const mediaEnd = html.indexOf('<div class="hero-overlay"></div>\n</div>');
    assert.ok(mediaEnd > 0, 'hero-media wrapper closes after the overlay');
    assert.ok(html.indexOf('<button class="hero-play"') > mediaEnd, 'play button sits outside the aria-hidden media');
  });
}

test('bullets appear except in snap-stack; glass wraps copy in a panel; split has media column', () => {
  assert.equal(count(hero.centered(makeCtx()), /<li>/g), 3);
  assert.equal(count(hero['snap-stack'](makeCtx()), /<li>/g), 0);
  assert.ok(hero.glass(makeCtx()).includes('<div class="glass-panel">'));
  assert.ok(hero.split(makeCtx()).includes('<div class="hero-split-media">'));
});

test('snap-stack renders dot navigation to all home sections with localized names', () => {
  const html = hero['snap-stack'](makeCtx());
  const nav = html.slice(html.indexOf('<nav class="snap-dots"'), html.indexOf('</nav>') + 6);
  assert.ok(nav.startsWith('<nav class="snap-dots" aria-label="Abschnitte">'));
  const hrefs = [...nav.matchAll(/href="#([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, ['hero', 'intro', 'services', 'closing', 'feature', 'faq', 'cta']);
  assert.ok(nav.includes('<a href="#faq" aria-label="Fragen und Antworten">'));
  const en = hero['snap-stack'](makeCtx({ lang: 'en' }));
  assert.ok(en.includes('<a href="#closing" aria-label="Our promise">'));
});

test('scroll cue targets #intro and uses the ui label', () => {
  const html = hero['bottom-left'](makeCtx({ lang: 'en' }));
  assert.ok(html.includes('<a class="scroll-cue" href="#intro" aria-label="Scroll down">'));
});
