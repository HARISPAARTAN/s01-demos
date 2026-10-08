import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serviceImages, pageImages } from '../kit/images.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'assets/video/manifest.json'), 'utf8'));
const sources = JSON.parse(readFileSync(join(root, 'assets/sources.json'), 'utf8'));

test('manifest has the four video keys with src and poster', () => {
  assert.deepEqual(Object.keys(manifest).sort(), ['powerlines', 'substation', 'trailer', 'windfarm']);
  for (const v of Object.values(manifest)) {
    assert.match(v.src, /^video\/[a-z-]+\.mp4$/);
    assert.match(v.poster, /^video\/[a-z-]+\.(jpg|webp)$/);
    assert.ok(v.credit && v.url);
  }
});

test('every image referenced by the kit is listed in sources.json', () => {
  const imgs = new Set(Object.keys(sources.img));
  for (const f of Object.values(serviceImages)) assert.ok(imgs.has(f), `${f} missing in sources.json`);
  for (const f of Object.values(pageImages)) if (f) assert.ok(imgs.has(f), `${f} missing in sources.json`);
  assert.equal(Object.keys(serviceImages).length, 6);
});

test('every video src in the manifest is listed in sources.json', () => {
  for (const v of Object.values(manifest)) {
    assert.ok(sources.video[v.src.replace('video/', '')], `${v.src} missing in sources.json`);
  }
});

test('downloaded assets exist (run npm run fetch-assets first)', { skip: !existsSync(join(root, 'assets/video/trailer.mp4')) }, () => {
  for (const name of Object.keys(sources.video)) assert.ok(existsSync(join(root, 'assets/video', name)), name);
  for (const name of Object.keys(sources.img)) assert.ok(existsSync(join(root, 'assets/img', name)), name);
});
