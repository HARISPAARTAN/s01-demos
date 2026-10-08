import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../kit/components/projects.js';
import { makeCtx, count } from './support/ctx.js';

for (const variant of ['cards', 'timeline', 'table', 'masonry']) {
  test(`projects.${variant} renders all seven references`, () => {
    const html = projects[variant](makeCtx({ page: 'projects' }));
    assert.ok(html.includes(`<section id="projects" class="section projects projects-${variant}">`));
    if (variant === 'table') {
      assert.equal(count(html, /<h2>/g), 0);
      assert.equal(count(html, /<th scope="row">/g), 7);
    } else {
      assert.equal(count(html, /<h2>/g), 7);
    }
    assert.ok(html.includes('Neubau 380 kV Umspannwerk (inkl. Rückbau)'));
    assert.ok(html.includes('Nachverfolgung von Nebenbestimmungen (BImSchG)'));
    assert.equal(count(html, /<li>/g), 23);
  });
}

test('table variant uses a real table with header cells', () => {
  const html = projects.table(makeCtx({ page: 'projects', lang: 'en' }));
  assert.ok(html.includes('<th scope="col">Project</th>'));
  assert.ok(html.includes('<th scope="col">Services</th>'));
  assert.equal(count(html, /<th scope="row">/g), 7);
});
