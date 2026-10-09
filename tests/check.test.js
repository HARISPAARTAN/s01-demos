import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractRefs, checkLinks, checkPage, checkTheme, checkDist } from '../build/check.js';
import { build, ROOT } from '../build/build.js';

const slugs = { de: { home: 'index.html', services: 'services.html', projects: 'projekte.html', company: 'unternehmen.html', careers: 'karriere.html', contact: 'kontakt.html', imprint: 'impressum.html', privacy: 'datenschutz.html' }, en: { home: 'index.html', services: 'services.html', projects: 'projects.html', company: 'company.html', careers: 'careers.html', contact: 'contact.html', imprint: 'imprint.html', privacy: 'privacy.html' } };

test('extractRefs reads href, src and poster attributes', () => {
  assert.deepEqual(extractRefs('<a href="a.html"><img src="b.jpg"><video poster="c.jpg">'), ['a.html', 'b.jpg', 'c.jpg']);
});

test('checkLinks reports broken files and missing anchors, skips external links', (t) => {
  const out = mkdtempSync(join(tmpdir(), 's01-check-'));
  t.after(() => rmSync(out, { recursive: true, force: true }));
  mkdirSync(join(out, 'x/de'), { recursive: true });
  writeFileSync(join(out, 'x/de/services.html'), '<section id="risk"></section>');
  const file = join(out, 'x/de/index.html');
  const html = '<a href="services.html#risk">ok</a><a href="services.html#nope">bad</a><a href="missing.html">bad</a><a href="#top">bad</a><a href="https://x.y/">ext</a><a href="mailto:a@b.c">m</a><a href="tel:+1">t</a><div id="main"></div><a href="#main">ok</a>';
  writeFileSync(file, html);
  const errors = checkLinks(file, html, out);
  assert.equal(errors.length, 3);
  assert.match(errors[0], /missing anchor services\.html#nope/);
  assert.match(errors[1], /broken link missing\.html/);
  assert.match(errors[2], /missing anchor #top/);
});

test('checkPage enforces h1, title, lang, nav links, toggle and leaked placeholders', () => {
  const out = '/dist';
  const good = `<html lang="de"><head><title>T</title></head><body><a href="index.html">a</a><a href="services.html">b</a><a href="projekte.html">c</a><a href="unternehmen.html">d</a><a href="karriere.html">e</a><a href="kontakt.html">f</a><a hreflang="en" href="../en/index.html">EN</a><h1>x</h1></body></html>`;
  assert.deepEqual(checkPage(join(out, '01/de/index.html'), good, { lang: 'de', slugs, out }), []);
  const bad = `<html lang="en"><head><title></title></head><body><h1>a</h1><h1>b</h1><div id="x"></div><p id="x"></p>undefined [object Object] NaN</body></html>`;
  const errors = checkPage(join(out, '01/de/index.html'), bad, { lang: 'de', slugs, out });
  assert.ok(errors.some((e) => /expected 1 h1, found 2/.test(e)));
  assert.ok(errors.some((e) => /duplicate id\(s\) x/.test(e)));
  assert.ok(errors.some((e) => /empty title/.test(e)));
  assert.ok(errors.some((e) => /lang attribute is not "de"/.test(e)));
  assert.ok(errors.some((e) => /nav link to services/.test(e)));
  assert.ok(errors.some((e) => /language toggle missing/.test(e)));
  assert.ok(errors.some((e) => /contains "undefined"/.test(e)));
  assert.ok(errors.some((e) => /contains "\[object Object\]"/.test(e)));
  assert.ok(errors.some((e) => /contains "NaN"/.test(e)));
});

test('checkTheme requires tokens and 4.5:1 contrast', () => {
  assert.deepEqual(checkTheme('x', ':root{--bg:#ffffff;--fg:#212121;--accent:#1863dc;--accent-fg:#ffffff;}'), []);
  const low = checkTheme('x', ':root{--bg:#ffffff;--fg:#999999;--accent:#1863dc;--accent-fg:#ffffff;}');
  assert.equal(low.length, 1);
  assert.match(low[0], /x\/theme\.css: contrast --fg on --bg is 2\.85 \(< 4\.5\)/);
  const missing = checkTheme('x', ':root{--bg:#ffffff;--fg:#212121;}');
  assert.match(missing[0], /--accent-fg or --accent missing/);
});

const haveAssets = existsSync(join(ROOT, 'assets/video/trailer.mp4')) && existsSync(join(ROOT, 'assets/video/powerlines.jpg'));
test('the real build passes every check', { skip: !haveAssets && 'assets not downloaded' }, (t) => {
  const out = mkdtempSync(join(tmpdir(), 's01-dist-check-'));
  t.after(() => rmSync(out, { recursive: true, force: true }));
  build({ root: ROOT, out });
  const { errors, files } = checkDist({ out, root: ROOT });
  assert.deepEqual(errors, []);
  assert.ok(files >= 33);
});
