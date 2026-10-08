import { test } from 'node:test';
import assert from 'node:assert/strict';
import { faq } from '../kit/components/faq.js';
import { makeCtx, count } from './support/ctx.js';

test('faq.accordion uses page faq by default with closed panels', () => {
  const html = faq.accordion(makeCtx({ page: 'home' }));
  assert.ok(html.includes('<section id="faq" class="section faq faq-accordion">'));
  assert.equal(count(html, /class="acc-trigger"/g), 4);
  assert.equal(count(html, /aria-expanded="false"/g), 4);
  assert.ok(html.includes('aria-controls="faq-home-0"'));
  assert.ok(html.includes('id="faq-home-0" hidden'));
  assert.ok(html.includes('<p>S01 Projektmanagement (ausgesprochen es null eins)'));
});

test('faq variants accept explicit data (used by careers) and render multi-paragraph answers', () => {
  const ctx = makeCtx({ page: 'careers' });
  const html = faq['two-column'](ctx, ctx.t.pages.careers.faq);
  assert.ok(html.includes('class="section faq faq-two-column"'));
  assert.equal(count(html, /class="faq-item"/g), 5);
  assert.equal(count(html, /<h3>/g), 5);
  assert.ok(html.includes('<p>Ja, einige Rollen sind remote möglich.</p>'));
});

test('services page faq has nine items', () => {
  assert.equal(count(faq.accordion(makeCtx({ page: 'services' })), /class="acc-trigger"/g), 9);
});
