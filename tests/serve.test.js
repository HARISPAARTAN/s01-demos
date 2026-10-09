import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startServer, parseRange } from '../build/serve.js';

async function withServer(t, fn) {
  const base = mkdtempSync(join(tmpdir(), 's01-serve-'));
  const dir = join(base, 'site');
  mkdirSync(join(dir, 'sub'), { recursive: true });
  writeFileSync(join(base, 'secret.txt'), 'top secret');
  writeFileSync(join(dir, 'index.html'), '<h1>hi</h1>');
  writeFileSync(join(dir, 'sub', 'index.html'), 'sub');
  writeFileSync(join(dir, 'a.mp4'), Buffer.from('0123456789'));
  const s = await startServer({ dir });
  t.after(async () => {
    await s.close();
    rmSync(base, { recursive: true, force: true });
  });
  return fn(s);
}

test('parseRange follows RFC 7233 for single ranges', () => {
  assert.deepEqual(parseRange('bytes=2-4', 10), { start: 2, end: 4 });
  assert.deepEqual(parseRange('bytes=7-', 10), { start: 7, end: 9 });
  assert.deepEqual(parseRange('bytes=-3', 10), { start: 7, end: 9 });
  assert.deepEqual(parseRange('bytes=0-999', 10), { start: 0, end: 9 });
  assert.deepEqual(parseRange('bytes=10-', 10), { invalid: true });
  assert.deepEqual(parseRange('bytes=-0', 10), { invalid: true });
  for (const ignored of [undefined, '', 'bytes=', 'bytes=-', 'bytes=0-abc', 'bytes=5-3', 'items=0-5', 'bytes=0-1,5-6']) {
    assert.equal(parseRange(ignored, 10), null, String(ignored));
  }
});

test('serves files with content types, a directory index and HEAD', (t) => withServer(t, async (s) => {
  const r1 = await fetch(`${s.url}/`);
  assert.equal(r1.status, 200);
  assert.match(r1.headers.get('content-type'), /text\/html/);
  assert.equal(r1.headers.get('accept-ranges'), 'bytes');
  assert.equal(await r1.text(), '<h1>hi</h1>');
  const r2 = await fetch(`${s.url}/sub/`);
  assert.equal(await r2.text(), 'sub');
  const r3 = await fetch(`${s.url}/sub`, { redirect: 'manual' });
  assert.equal(r3.status, 301);
  assert.equal(r3.headers.get('location'), '/sub/');
  const r4 = await fetch(`${s.url}/missing.html`);
  assert.equal(r4.status, 404);
  const head = await fetch(`${s.url}/a.mp4`, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-length'), '10');
  assert.equal(head.headers.get('content-type'), 'video/mp4');
}));

test('serves byte ranges the way browsers request video', (t) => withServer(t, async (s) => {
  const r1 = await fetch(`${s.url}/a.mp4`, { headers: { Range: 'bytes=2-4' } });
  assert.equal(r1.status, 206);
  assert.equal(r1.headers.get('content-range'), 'bytes 2-4/10');
  assert.equal(r1.headers.get('content-length'), '3');
  assert.equal(await r1.text(), '234');
  const r2 = await fetch(`${s.url}/a.mp4`, { headers: { Range: 'bytes=7-' } });
  assert.equal(r2.status, 206);
  assert.equal(await r2.text(), '789');
  const r3 = await fetch(`${s.url}/a.mp4`, { headers: { Range: 'bytes=-3' } });
  assert.equal(r3.status, 206);
  assert.equal(r3.headers.get('content-range'), 'bytes 7-9/10');
  assert.equal(await r3.text(), '789');
  const r4 = await fetch(`${s.url}/a.mp4`, { headers: { Range: 'bytes=999-' } });
  assert.equal(r4.status, 416);
  assert.equal(r4.headers.get('content-range'), 'bytes */10');
  for (const ignored of ['bytes=0-abc', 'bytes=5-3', 'items=0-5', 'bytes=']) {
    const r = await fetch(`${s.url}/a.mp4`, { headers: { Range: ignored } });
    assert.equal(r.status, 200, ignored);
    assert.equal(await r.text(), '0123456789', ignored);
  }
}));

test('rejects traversal and malformed escapes without dying', (t) => withServer(t, async (s) => {
  const r1 = await fetch(`${s.url}/..%2fsecret.txt`);
  assert.equal(r1.status, 403);
  const r2 = await fetch(`${s.url}/..%5csecret.txt`);
  assert.ok([403, 404].includes(r2.status), `backslash traversal returned ${r2.status}`);
  const r3 = await fetch(`${s.url}/%E0%A4%A`);
  assert.equal(r3.status, 400);
  const r4 = await fetch(`${s.url}/`);
  assert.equal(r4.status, 200);
}));
