import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { keyPaths, parityErrors, loadContent } from '../build/lib/content.js';

test('keyPaths lists leaf paths including array indices', () => {
  assert.deepEqual(keyPaths({ a: 1, b: { c: [1, { d: 2 }] } }), ['a', 'b.c[0]', 'b.c[1].d']);
});

test('parityErrors reports keys missing on either side', () => {
  const de = { x: 1, items: [{ q: 'a' }, { q: 'b' }] };
  const en = { x: 1, items: [{ q: 'a' }], extra: true };
  assert.deepEqual(parityErrors(de, en), ['missing in en: items[1].q', 'missing in de: extra']);
  assert.deepEqual(parityErrors(de, de), []);
});

function fixtureRoot(de, en) {
  const root = mkdtempSync(join(tmpdir(), 's01-content-'));
  mkdirSync(join(root, 'content'));
  writeFileSync(join(root, 'content/site.de.json'), JSON.stringify(de));
  writeFileSync(join(root, 'content/site.en.json'), JSON.stringify(en));
  writeFileSync(join(root, 'content/slugs.json'), JSON.stringify({ de: { home: 'index.html' }, en: { home: 'index.html' } }));
  return root;
}

test('loadContent returns both languages and slugs when trees match', () => {
  const root = fixtureRoot({ a: 'x' }, { a: 'y' });
  const c = loadContent(root);
  assert.equal(c.de.a, 'x');
  assert.equal(c.en.a, 'y');
  assert.equal(c.slugs.de.home, 'index.html');
});

test('loadContent throws naming the missing key', () => {
  const root = fixtureRoot({ a: 'x', b: 'z' }, { a: 'y' });
  assert.throws(() => loadContent(root), /missing in en: b/);
});
