import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hero } from '../kit/components/hero.js';
import { makeCtx, demoFixture, count } from './support/ctx.js';

const arup = { ...demoFixture, id: '03-arup-editorial', variants: { ...demoFixture.variants, hero: 'editorial' } };

test('hero.editorial puts the headline block above an inset media box instead of over the video', () => {
  const html = hero.editorial(makeCtx({ demo: arup }));
  assert.ok(html.startsWith('<section id="hero" class="hero hero-editorial'));
  const copy = html.indexOf('<div class="hero-content container">');
  const box = html.indexOf('<div class="hero-media-box container">');
  assert.ok(copy > 0 && box > copy, 'copy comes first, media box second');
  assert.equal(count(html, /<video class="hero-video"/g), 1);
  assert.ok(html.indexOf('<div class="hero-media"') > box, 'the media sits inside the box');
  assert.ok(html.includes('<h1 class="hero-title">Projektsteuerung für Energieinfrastruktur.</h1>'));
  assert.ok(html.includes('<p class="hero-lead">Über 10 Jahre Erfahrung im Energiesektor · PMP®-zertifizierte Projektmanagementmethodik · Direkter Ansprechpartner während der gesamten Projektlaufzeit</p>'));
  assert.ok(html.includes('<a class="btn btn-primary" href="kontakt.html">Kontakt aufnehmen</a>'));
  assert.ok(html.includes('<a class="link-more" href="services.html">Unsere Leistungen</a>'), 'the secondary action is a text link, Arup style');
  assert.equal(count(html, /<li>/g), 0);
  assert.ok(!html.includes('scroll-cue'));
});
