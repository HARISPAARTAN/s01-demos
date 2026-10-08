import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { makePaths, otherLang, LANGS } from '../kit/paths.js';

const slugs = JSON.parse(readFileSync(new URL('../content/slugs.json', import.meta.url), 'utf8'));

test('LANGS and otherLang', () => {
  assert.deepEqual(LANGS, ['de', 'en']);
  assert.equal(otherLang('de'), 'en');
  assert.equal(otherLang('en'), 'de');
});

test('toPage resolves slugs in the current language with optional hash', () => {
  const p = makePaths({ lang: 'de', page: 'home', slugs });
  assert.equal(p.toPage('services'), 'services.html');
  assert.equal(p.toPage('projects'), 'projekte.html');
  assert.equal(p.toPage('services', 'risk'), 'services.html#risk');
  assert.throws(() => p.toPage('nope'), /Unknown page "nope"/);
});

test('otherLang links to the same page in the other language', () => {
  assert.equal(makePaths({ lang: 'de', page: 'projects', slugs }).otherLang(), '../en/projects.html');
  assert.equal(makePaths({ lang: 'en', page: 'careers', slugs }).otherLang(), '../de/karriere.html');
});

test('asset, kit, theme and gallery are relative to dist/<demo>/<lang>/', () => {
  const p = makePaths({ lang: 'en', page: 'home', slugs });
  assert.equal(p.asset('video/trailer.mp4'), '../../assets/video/trailer.mp4');
  assert.equal(p.kit('base.css'), '../../kit/base.css');
  assert.equal(p.theme(), '../theme.css');
  assert.equal(p.gallery(), '../../index.html');
  assert.equal(p.other, 'de');
});

test('makePaths rejects unknown language or page', () => {
  assert.throws(() => makePaths({ lang: 'fr', page: 'home', slugs }), /Unknown language "fr"/);
  assert.throws(() => makePaths({ lang: 'de', page: 'x', slugs }), /Unknown page "x"/);
});

test('makePaths rejects a page missing from the other language table', () => {
  const oneSided = { de: { home: 'index.html', extra: 'extra.html' }, en: { home: 'index.html' } };
  assert.throws(() => makePaths({ lang: 'de', page: 'extra', slugs: oneSided }), /Unknown page "extra" for language "en"/);
  assert.doesNotThrow(() => makePaths({ lang: 'de', page: 'home', slugs: oneSided }));
});
