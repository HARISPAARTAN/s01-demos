import { test } from 'node:test';
import assert from 'node:assert/strict';
import { company } from '../kit/components/company.js';
import { careers } from '../kit/components/careers.js';
import { legal } from '../kit/components/legal.js';
import { faq } from '../kit/components/faq.js';
import { makeCtx, count } from './support/ctx.js';

test('company renders hero, mission, vision, values, method and quality', () => {
  const html = company(makeCtx({ page: 'company' }));
  assert.ok(html.includes('<h1>Unternehmen</h1>'));
  assert.ok(html.includes('src="../../assets/img/windfarm.jpg"'));
  assert.ok(html.includes('<h2>Unsere Mission</h2>'));
  assert.ok(html.includes('<h2>Unsere Vision</h2>'));
  assert.equal(count(html, /<ul class="word-grid">/g), 2);
  assert.ok(html.includes('<li>Verbindlichkeit</li>'));
  assert.ok(html.includes('<li>standardisiert</li>'));
  assert.ok(html.includes('PMBOK®-basierte Projektmanagementmethodik (PMP®)'));
  assert.equal(count(html, /<h1/g), 1);
});

test('careers renders jobs with correct headings, process steps and faq', () => {
  const ctx = makeCtx({ page: 'careers' });
  const html = careers(ctx, faq.accordion);
  assert.ok(html.includes('<h1>Karriere</h1>'));
  assert.equal(count(html, /<article class="card job">/g), 4);
  assert.ok(html.includes('<h4>Ihre Aufgaben</h4><ul class="checks"><li>Steuerung von Projekten im Strommarkt'));
  assert.ok(html.includes('<h4>Sie bringen mit</h4><ul class="checks"><li>Abgeschlossenes Hochschulstudium'));
  assert.ok(html.includes('href="https://join.com/companies/s01-pmde/15542712"'));
  assert.ok(html.includes('class="btn btn-ghost" href="https://www.s01-pm.de/wp-content/uploads/Stelenanzeige_Sr-PM.pdf"'));
  assert.ok(html.includes('href="mailto:recruiting@s01-pm.de?subject=Initiativbewerbung%20Remote"'));
  assert.equal(count(html, /<li class="step">/g), 4);
  assert.equal(count(html, /class="acc-trigger"/g), 5);
  assert.ok(html.includes('<h2>Jetzt bei S01 bewerben</h2>'));
  assert.equal(count(html, /<h1/g), 1);
});

test('legal renders blocks with lines and text, and the privacy notice', () => {
  const ctx = makeCtx({ page: 'privacy' });
  const html = legal(ctx, ctx.t.pages.privacy);
  assert.ok(html.includes('<h1>Datenschutzerklärung</h1>'));
  assert.ok(html.includes('<p class="notice">Demo – der rechtsverbindliche Text wird von S01 bereitgestellt.</p>'));
  assert.ok(html.includes('<h2>Ihre Rechte</h2>'));
  const imprint = legal(makeCtx({ page: 'imprint' }), ctx.t.pages.imprint);
  assert.ok(!imprint.includes('class="notice"'));
  assert.ok(imprint.includes('Handelsregister: HRB 139040<br>Registergericht: Amtsgericht Frankfurt am Main'));
  assert.ok(imprint.includes('<h2>Haftungsausschluss</h2><p>Die S01 Projektmanagement GmbH übernimmt keine Garantie'));
});
