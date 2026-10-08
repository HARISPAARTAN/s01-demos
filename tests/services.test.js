import { test } from 'node:test';
import assert from 'node:assert/strict';
import { services } from '../kit/components/services.js';
import { makeCtx, count } from './support/ctx.js';

const ids = ['project-controls', 'scheduling', 'interfaces', 'risk', 'documentation', 'consulting'];

for (const variant of Object.keys(services)) {
  test(`services.${variant} on home links to anchors on the services page`, () => {
    const html = services[variant](makeCtx({ page: 'home' }));
    assert.ok(html.includes(`<section id="services" class="section services services-${variant}">`));
    assert.ok(html.includes('<h2>Unsere Leistungen</h2>'));
    assert.equal(count(html, /<h3[ >]/g), 6);
    for (const id of ids) assert.ok(html.includes(`href="services.html#${id}"`), `${variant} link to ${id}`);
    assert.equal(count(html, /class="link-more"/g), 6);
    assert.ok(!html.includes('class="checks"'), 'no bullets on home');
  });

  test(`services.${variant} on the services page renders ids and bullets`, () => {
    const html = services[variant](makeCtx({ page: 'services' }));
    for (const id of ids) assert.ok(html.includes(`id="${id}"`), `${variant} id ${id}`);
    assert.equal(count(html, /<ul class="checks">/g), 6);
    assert.equal(count(html, /<li>/g), 18);
    assert.ok(!html.includes('class="link-more"'));
    assert.ok(html.includes('<h2>Unsere Leistungen im Detail</h2>'));
  });
}

test('variants that show images use the service image map with alt text', () => {
  const html = services.grid(makeCtx());
  assert.ok(html.includes('src="../../assets/img/engineers.jpg" alt="Zwei Ingenieure mit Schutzhelmen auf einer Baustelle"'));
  assert.equal(count(html, /<img /g), 6);
  assert.equal(count(services.bento(makeCtx()), /<img /g), 2);
  assert.equal(count(services.rows(makeCtx()), /<img /g), 6);
  assert.equal(count(services.numbered(makeCtx()), /<img /g), 0);
});

test('accordion opens the first panel only and wires aria', () => {
  const html = services.accordion(makeCtx({ page: 'services' }));
  assert.equal(count(html, /aria-expanded="true"/g), 1);
  assert.equal(count(html, /aria-expanded="false"/g), 5);
  assert.ok(html.includes('aria-controls="svc-risk"'));
  assert.ok(html.includes('id="svc-risk" hidden'));
});
