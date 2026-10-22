import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hero } from '../kit/components/hero.js';
import { resolveVariants } from '../kit/components/index.js';
import { renderMain } from '../kit/pages.js';
import { bodyClasses } from '../kit/render.js';
import { makeCtx, demoFixture, count } from './support/ctx.js';

const tesla = { ...demoFixture, id: '01-tesla-stack', scheme: 'dark', variants: { ...demoFixture.variants, nav: 'transparent', hero: 'tesla' } };
const C = resolveVariants(tesla);

test('hero.tesla renders a top-centered hero with bottom buttons and one panel per inner page', () => {
  const html = hero.tesla(makeCtx({ demo: tesla }));
  assert.ok(html.startsWith('<section id="hero" class="hero hero-tesla hero-top-center'));
  assert.equal(count(html, /<video class="hero-video"/g), 1);
  assert.equal(count(html, /<h1 /g), 1);
  assert.equal(count(html, /<li>/g), 0);
  const actions = html.slice(html.indexOf('<div class="hero-actions">'), html.indexOf('</section>'));
  assert.ok(actions.includes('<a class="btn btn-primary" href="kontakt.html">Kontakt aufnehmen</a>'));
  assert.ok(actions.includes('<a class="btn btn-ghost" href="services.html">Unsere Leistungen</a>'));
  const panels = [...html.matchAll(/<section id="([a-z]+)" class="panel panel-tesla"/g)].map((m) => m[1]);
  assert.deepEqual(panels, ['services', 'projects', 'company', 'careers', 'contact']);
  assert.ok(html.includes('<h2 class="panel-title">Services</h2>'));
  assert.ok(html.includes('<p class="panel-label">S01 Projektmanagement unterstützt Projektträger und Auftragnehmer bei der Steuerung komplexer Energieinfrastrukturprojekte.</p>'));
  assert.ok(html.includes('<div class="panel-actions"><a class="btn btn-primary" href="services.html">Mehr erfahren</a><a class="btn btn-ghost" href="kontakt.html">Kontakt aufnehmen</a></div>'));
  assert.ok(html.includes('<div class="panel-actions"><a class="btn btn-primary" href="kontakt.html">Kontakt aufnehmen</a></div>'), 'the contact panel has a single button');
  assert.equal(count(html, /<video class="panel-video"/g), 3);
  assert.equal(count(html, /<img class="panel-image"/g), 2);
});

test('the Tesla home is panels only and gets its layout body class', () => {
  const home = renderMain(makeCtx({ page: 'home', demo: tesla }), C);
  assert.ok(home.includes('class="panel panel-tesla"'));
  for (const id of ['intro', 'closing', 'feature', 'faq', 'cta']) assert.ok(!home.includes(`id="${id}"`), id);
  assert.ok(bodyClasses(makeCtx({ page: 'home', demo: tesla })).includes('hero-tesla-layout'));
  const en = hero.tesla(makeCtx({ lang: 'en', demo: tesla }));
  assert.ok(en.includes('<h2 class="panel-title">Selected Projects</h2>') && en.includes('>Learn more</a>'));
});
