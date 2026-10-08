import { test } from 'node:test';
import assert from 'node:assert/strict';
import { feature } from '../kit/components/feature.js';
import { makeCtx, count } from './support/ctx.js';

for (const variant of ['columns', 'tabs', 'stats']) {
  test(`feature.${variant} renders the four pillars`, () => {
    const html = feature[variant](makeCtx());
    assert.ok(html.includes(`<section id="feature" class="section feature feature-${variant}">`));
    assert.ok(html.includes('Komplexe Energieprojekte? Wir bringen Struktur rein.'));
    assert.equal(count(html, /<h3>/g), 4);
    assert.ok(html.includes('Branchenfokus'));
  });
}

test('tabs variant has an accessible tablist', () => {
  const html = feature.tabs(makeCtx());
  assert.equal(count(html, /role="tab"/g), 4);
  assert.equal(count(html, /role="tabpanel"/g), 4);
  assert.equal(count(html, /aria-selected="true"/g), 1);
  assert.equal(count(html, / hidden>/g), 3);
});

test('stats variant renders the four stats', () => {
  const html = feature.stats(makeCtx({ lang: 'en' }));
  assert.equal(count(html, /class="stat"/g), 4);
  assert.ok(html.includes('<span class="stat-value">380 kV</span>'));
});
