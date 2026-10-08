import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contact } from '../kit/components/contact.js';
import { makeCtx } from './support/ctx.js';

for (const variant of ['split', 'centered']) {
  test(`contact.${variant} renders info blocks and the demo form`, () => {
    const html = contact[variant](makeCtx({ page: 'contact' }));
    assert.ok(html.includes(`<section id="contact" class="section contact contact-${variant}">`));
    assert.ok(html.includes('href="mailto:info@s01-pm.de"'));
    assert.ok(html.includes('href="tel:+49619658655556"'));
    assert.ok(html.includes('<form class="form" data-demo-form>'));
    for (const name of ['name', 'company', 'email', 'phone', 'message', 'consent']) assert.ok(html.includes(`name="${name}"`), name);
    assert.ok(html.includes('<input type="email" name="email" required'));
    assert.ok(html.includes('<input type="checkbox" name="consent" required>'));
    assert.ok(html.includes('<p class="form-success" data-form-success hidden role="status">'));
    assert.ok(html.includes('<button class="btn btn-primary" type="submit" disabled>Senden</button>'));
    assert.ok(html.includes('href="datenschutz.html"'));
  });
}
