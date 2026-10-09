import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, ROOT } from '../build/build.js';
import { renderGallery } from '../kit/gallery.js';

const haveAssets = existsSync(join(ROOT, 'assets/video/trailer.mp4')) && existsSync(join(ROOT, 'assets/video/powerlines.jpg'));

test('renderGallery lists every demo with DE and EN links and placeholders without thumbs', () => {
  const demos = [{ id: '01-original', name: 'Original', description: { de: 'A', en: 'B' }, accent: '#1863dc', video: 'trailer' }];
  const html = renderGallery({
    demos,
    slugs: { de: { home: 'index.html' }, en: { home: 'index.html' } },
    thumbExists: () => false,
    manifest: { trailer: { label: 'Trailer', credit: 'S01', url: 'https://www.s01-pm.de/' } },
    credits: [{ label: 'Photo', credit: 'Someone / Pexels', url: 'https://www.pexels.com/photo/x-1/' }],
  });
  assert.ok(html.includes('href="01-original/de/index.html"'));
  assert.ok(html.includes('href="01-original/en/index.html"'));
  assert.ok(html.includes('class="ph" style="--c:#1863dc"'));
  assert.ok(html.includes('Someone / Pexels'));
  assert.ok(html.includes('<html lang="de">'));
});

test('build writes all demos, languages, pages and shared files', { skip: !haveAssets && 'assets not downloaded' }, (t) => {
  const out = mkdtempSync(join(tmpdir(), 's01-dist-'));
  t.after(() => rmSync(out, { recursive: true, force: true }));
  const result = build({ root: ROOT, out });
  assert.ok(result.demos >= 2);
  assert.equal(result.pages, result.demos * 16);
  assert.ok(existsSync(join(out, 'index.html')));
  assert.ok(existsSync(join(out, '.nojekyll')));
  assert.ok(existsSync(join(out, 'kit/base.css')));
  assert.ok(existsSync(join(out, 'kit/base.js')));
  assert.ok(existsSync(join(out, 'assets/video/trailer.mp4')));
  assert.ok(!existsSync(join(out, 'assets/sources.json')));
  assert.ok(existsSync(join(out, '01-original/theme.css')));
  for (const f of ['index.html', 'services.html', 'projekte.html', 'unternehmen.html', 'karriere.html', 'kontakt.html', 'impressum.html', 'datenschutz.html']) assert.ok(existsSync(join(out, '01-original/de', f)), f);
  for (const f of ['index.html', 'services.html', 'projects.html', 'company.html', 'careers.html', 'contact.html', 'imprint.html', 'privacy.html']) assert.ok(existsSync(join(out, '02-cinematic/en', f)), f);
  const home = readFileSync(join(out, '02-cinematic/de/index.html'), 'utf8');
  assert.ok(home.includes('class="site-header nav-transparent"'));
  assert.ok(home.includes('Demo 02/'));
  assert.ok(home.includes('../../assets/video/powerlines.mp4'));
});
