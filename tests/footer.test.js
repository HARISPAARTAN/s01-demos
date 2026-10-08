import { test } from 'node:test';
import assert from 'node:assert/strict';
import { footer } from '../kit/components/footer.js';
import { makeCtx, count } from './support/ctx.js';

for (const variant of ['columns', 'minimal', 'mega']) {
  test(`footer.${variant} renders tagline, address, links and ISO`, () => {
    const html = footer[variant](makeCtx({ page: 'company' }));
    assert.ok(html.includes(`<footer class="site-footer footer-${variant}">`));
    assert.ok(html.includes('Shaping sustainable grids'));
    assert.ok(html.includes('Alfred-Herrhausen-Allee 3-5'));
    assert.ok(html.includes('href="mailto:info@s01-pm.de"'));
    assert.ok(html.includes('href="tel:+49619658655556"'));
    assert.ok(html.includes('ISO 9001:2015 zertifiziert'));
    for (const slug of ['karriere.html', 'kontakt.html', 'impressum.html', 'datenschutz.html']) assert.ok(html.includes(`href="${slug}"`), slug);
    assert.ok(html.includes('<address class="footer-address">'));
  });
}

test('mega footer repeats the main navigation and a CTA button', () => {
  const html = footer.mega(makeCtx({ lang: 'en' }));
  assert.ok(html.includes('href="projects.html">Projects</a>'));
  assert.ok(html.includes('class="btn btn-primary" href="contact.html">Get in touch</a>'));
  assert.equal(count(html, /<nav /g), 2);
  assert.ok(html.includes('<nav aria-label="Pages (footer)">'));
  assert.ok(html.includes('<nav aria-label="Footer navigation">'));
  assert.ok(!html.includes('aria-label="Main navigation"'));
});

test('the English tagline is marked as English on German pages only', () => {
  assert.ok(footer.columns(makeCtx()).includes('<p class="tagline" lang="en">Shaping sustainable grids</p>'));
  assert.ok(footer.columns(makeCtx({ lang: 'en' })).includes('<p class="tagline">Shaping sustainable grids</p>'));
  assert.ok(footer.mega(makeCtx()).includes('<p class="tagline-big" lang="en">Shaping sustainable grids</p>'));
});
