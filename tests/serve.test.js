import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startServer } from '../build/serve.js';

test('serves files with content types, directory index, ranges and 404', async () => {
  const dir = mkdtempSync(join(tmpdir(), 's01-serve-'));
  writeFileSync(join(dir, 'index.html'), '<h1>hi</h1>');
  mkdirSync(join(dir, 'sub'));
  writeFileSync(join(dir, 'sub', 'index.html'), 'sub');
  writeFileSync(join(dir, 'a.mp4'), Buffer.from('0123456789'));
  const s = await startServer({ dir });
  try {
    const r1 = await fetch(`${s.url}/`);
    assert.equal(r1.status, 200);
    assert.match(r1.headers.get('content-type'), /text\/html/);
    assert.equal(await r1.text(), '<h1>hi</h1>');
    const r2 = await fetch(`${s.url}/sub/`);
    assert.equal(await r2.text(), 'sub');
    const r3 = await fetch(`${s.url}/a.mp4`, { headers: { Range: 'bytes=2-4' } });
    assert.equal(r3.status, 206);
    assert.equal(r3.headers.get('content-range'), 'bytes 2-4/10');
    assert.equal(await r3.text(), '234');
    assert.equal(r3.headers.get('content-type'), 'video/mp4');
    const r4 = await fetch(`${s.url}/missing.html`);
    assert.equal(r4.status, 404);
    const r5 = await fetch(`${s.url}/../package.json`);
    assert.notEqual(r5.status, 200);
  } finally {
    await s.close();
  }
});
