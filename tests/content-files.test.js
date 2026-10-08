import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadContent } from '../build/lib/content.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('real content files have identical key trees', () => {
  const { de, en, slugs } = loadContent(root);
  assert.deepEqual(Object.keys(de.pages), Object.keys(en.pages));
  assert.deepEqual(Object.keys(slugs.de), Object.keys(en.pages));
  assert.equal(en.pages.services.items.length, 6);
  assert.equal(en.pages.projects.items.length, 7);
});

test('service ids are language-neutral and identical in both languages', () => {
  const { de, en } = loadContent(root);
  const ids = ['project-controls', 'scheduling', 'interfaces', 'risk', 'documentation', 'consulting'];
  assert.deepEqual(de.pages.services.items.map((i) => i.id), ids);
  assert.deepEqual(en.pages.services.items.map((i) => i.id), ids);
  assert.deepEqual(de.pages.home.services.items.map((i) => i.id), ids);
  assert.deepEqual(en.pages.home.services.items.map((i) => i.id), ids);
});
