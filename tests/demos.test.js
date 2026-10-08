import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadDemos, validateDemo, VARIANT_KEYS } from '../build/lib/demos.js';

const registry = {
  nav: { solid: () => '' }, hero: { centered: () => '' }, services: { grid: () => '' }, feature: { columns: () => '' },
  projects: { cards: () => '' }, faq: { accordion: () => '' }, footer: { columns: () => '' }, contact: { split: () => '' },
};
const videoKeys = ['trailer'];
const good = {
  id: '01-original', order: 1, name: 'Original', description: { de: 'x', en: 'y' }, scheme: 'light', accent: '#1863dc',
  fonts: ['Manrope:wght@400;700'],
  variants: { nav: 'solid', hero: 'centered', services: 'grid', feature: 'columns', projects: 'cards', faq: 'accordion', footer: 'columns', contact: 'split' },
  video: 'trailer',
};

function root(demos) {
  const r = mkdtempSync(join(tmpdir(), 's01-demos-'));
  mkdirSync(join(r, 'demos'));
  for (const [folder, { json, theme = ':root{--bg:#fff}' }] of Object.entries(demos)) {
    mkdirSync(join(r, 'demos', folder));
    if (json) writeFileSync(join(r, 'demos', folder, 'demo.json'), JSON.stringify(json));
    if (theme !== null) writeFileSync(join(r, 'demos', folder, 'theme.css'), theme);
  }
  return r;
}

test('VARIANT_KEYS lists the eight variant slots', () => {
  assert.deepEqual(VARIANT_KEYS, ['nav', 'hero', 'services', 'feature', 'projects', 'faq', 'footer', 'contact']);
});

test('validateDemo accepts a complete recipe', () => {
  assert.doesNotThrow(() => validateDemo(good, '01-original', registry, videoKeys));
});

test('validateDemo rejects unknown variant, listing valid names', () => {
  const bad = { ...good, variants: { ...good.variants, hero: 'spinning' } };
  assert.throws(() => validateDemo(bad, '01-original', registry, videoKeys), /demos\/01-original: unknown hero variant "spinning"\. Valid: centered/);
});

test('validateDemo rejects unknown video, id mismatch, missing fields', () => {
  assert.throws(() => validateDemo({ ...good, video: 'lava' }, '01-original', registry, videoKeys), /unknown video "lava"\. Valid: trailer/);
  assert.throws(() => validateDemo(good, '02-other', registry, videoKeys), /id "01-original" must equal folder name "02-other"/);
  assert.throws(() => validateDemo({ ...good, accent: 'blue' }, '01-original', registry, videoKeys), /accent must be a 6-digit hex/);
  assert.throws(() => validateDemo({ ...good, scheme: 'blue' }, '01-original', registry, videoKeys), /scheme must be "light" or "dark"/);
  assert.throws(() => validateDemo({ ...good, description: { de: 'x' } }, '01-original', registry, videoKeys), /description\.en missing/);
});

test('loadDemos reads folders sorted and requires theme.css', () => {
  const r = root({ '02-b': { json: { ...good, id: '02-b', order: 2 } }, '01-a': { json: { ...good, id: '01-a' } } });
  const demos = loadDemos(r, registry, videoKeys);
  assert.deepEqual(demos.map((d) => d.id), ['01-a', '02-b']);
  assert.equal(demos[0].dir, join(r, 'demos', '01-a'));
  const r2 = root({ '01-a': { json: { ...good, id: '01-a' }, theme: null } });
  assert.throws(() => loadDemos(r2, registry, videoKeys), /demos\/01-a: theme\.css missing/);
});
