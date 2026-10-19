import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hero } from '../kit/components/hero.js';
import { nav } from '../kit/components/nav.js';
import { resolveVariants } from '../kit/components/index.js';
import { renderMain } from '../kit/pages.js';
import { bodyClasses } from '../kit/render.js';
import { makeCtx, demoFixture, count } from './support/ctx.js';

const spacex = { ...demoFixture, id: '25-spacex', scheme: 'dark', variants: { ...demoFixture.variants, nav: 'spacex', hero: 'spacex' } };
const C = resolveVariants(spacex);

test('hero.spacex renders the video hero followed by one full-screen panel per inner page', () => {
  const html = hero.spacex(makeCtx({ demo: spacex }));
  assert.ok(html.startsWith('<section id="hero" class="hero hero-spacex hero-bottom-left'));
  assert.equal(count(html, /<video class="hero-video"/g), 1, 'only the hero carries the hero video');
  assert.equal(count(html, /<h1 /g), 1);
  assert.equal(count(html, /<li>/g), 0, 'no bullet list, SpaceX style');
  assert.ok(html.includes('<a class="btn btn-primary" href="kontakt.html">Kontakt aufnehmen</a>'));
  assert.ok(html.includes('<a class="scroll-cue" href="#services"'));
  const panels = [...html.matchAll(/<section id="([a-z]+)" class="panel"/g)].map((m) => m[1]);
  assert.deepEqual(panels, ['services', 'projects', 'company', 'careers', 'contact']);
  assert.equal(count(html, /<video class="panel-video" autoplay muted loop playsinline preload="metadata"/g), 3, 'three panels play a clip');
  assert.equal(count(html, /<img class="panel-image"/g), 2, 'two panels use a photo');
  assert.ok(html.includes('<p class="panel-label">01 · Services</p>'));
  assert.ok(html.includes('<h2 class="panel-title">S01 Projektmanagement unterstützt Projektträger und Auftragnehmer bei der Steuerung komplexer Energieinfrastrukturprojekte.</h2>'));
  assert.ok(html.includes('<p class="panel-label">05 · Kontakt</p>'));
  assert.ok(html.includes('<a class="btn btn-ghost" href="projekte.html">Mehr erfahren</a>'));
  assert.ok(html.includes('<a class="btn btn-ghost" href="kontakt.html">Kontakt aufnehmen</a>'));
  assert.ok(html.includes('src="../../assets/video/windfarm.mp4"') && html.includes('src="../../assets/img/engineers.jpg"'));
  const en = hero.spacex(makeCtx({ lang: 'en', demo: spacex }));
  assert.ok(en.includes('<p class="panel-label">01 · Services</p>') && en.includes('>Learn more</a>'));
});

test('nav.spacex is a transparent header that hides while scrolling down', () => {
  const html = nav.spacex(makeCtx({ page: 'services', demo: spacex }));
  assert.ok(html.includes('class="site-header nav-transparent nav-spacex nav-autohide"'));
  assert.equal(count(html, /<li><a href="/g), 6);
  assert.ok(html.includes('<a href="services.html" aria-current="page">Services</a>'));
  assert.ok(html.includes('<a class="lang-toggle" href="../en/services.html" hreflang="en" lang="en"'));
});

test('the SpaceX home is panels only; inner pages keep the standard sections', () => {
  const home = renderMain(makeCtx({ page: 'home', demo: spacex }), C);
  assert.ok(home.includes('id="hero"') && home.includes('id="services" class="panel"'));
  for (const id of ['intro', 'closing', 'feature', 'faq', 'cta']) assert.ok(!home.includes(`id="${id}"`), `${id} absent from the panel home`);
  const services = renderMain(makeCtx({ page: 'services', demo: spacex }), C);
  assert.ok(services.includes('class="page-hero') && services.includes('id="cta"'));
  assert.ok(bodyClasses(makeCtx({ page: 'home', demo: spacex })).includes('hero-spacex-layout'));
});
