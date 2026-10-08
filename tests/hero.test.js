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
    assert.equal(count(html, /aria-hidden="true"/g) >= 1, true);
  });
}

test('bullets appear except in snap-stack; glass wraps copy in a panel; split has media column', () => {
  assert.equal(count(hero.centered(makeCtx()), /<li>/g), 3);
  assert.equal(count(hero['snap-stack'](makeCtx()), /<li>/g), 0);
  assert.ok(hero.glass(makeCtx()).includes('<div class="glass-panel">'));
  assert.ok(hero.split(makeCtx()).includes('<div class="hero-split-media">'));
});

test('snap-stack renders dot navigation to all home sections', () => {
  const html = hero['snap-stack'](makeCtx());
  assert.ok(html.includes('<nav class="snap-dots" aria-label="Abschnitte">'));
  for (const id of ['hero', 'intro', 'services', 'closing', 'feature', 'faq', 'cta']) assert.ok(html.includes(`href="#${id}"`));
});

test('scroll cue targets #intro and uses the ui label', () => {
  const html = hero['bottom-left'](makeCtx({ lang: 'en' }));
  assert.ok(html.includes('<a class="scroll-cue" href="#intro" aria-label="Scroll down">'));
});
