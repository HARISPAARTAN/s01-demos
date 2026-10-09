import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { extractRefs, checkLinks, checkDocument, checkPage, checkTheme, checkDist } from '../build/check.js';
import { build, ROOT } from '../build/build.js';

const slugs = { de: { home: 'index.html', services: 'services.html', projects: 'projekte.html', company: 'unternehmen.html', careers: 'karriere.html', contact: 'kontakt.html', imprint: 'impressum.html', privacy: 'datenschutz.html' }, en: { home: 'index.html', services: 'services.html', projects: 'projects.html', company: 'company.html', careers: 'careers.html', contact: 'contact.html', imprint: 'imprint.html', privacy: 'privacy.html' } };

const navBlock = '<nav id="site-menu" class="site-nav"><ul><li><a href="index.html">a</a></li><li><a href="services.html">b</a></li><li><a href="projekte.html">c</a></li><li><a href="unternehmen.html">d</a></li><li><a href="karriere.html">e</a></li><li><a href="kontakt.html">f</a></li></ul><a class="lang-toggle" hreflang="en" href="../en/index.html">EN</a></nav>';

test('extractRefs reads href, src and poster attributes', () => {
  assert.deepEqual(extractRefs('<a href="a.html"><img src="b.jpg"><video poster="c.jpg">'), ['a.html', 'b.jpg', 'c.jpg']);
});

test('checkLinks reports broken files, missing anchors and links leaving dist, skips external links', (t) => {
  const out = mkdtempSync(join(tmpdir(), 's01-check-'));
  t.after(() => rmSync(out, { recursive: true, force: true }));
  mkdirSync(join(out, 'x/de'), { recursive: true });
  writeFileSync(join(out, 'x/de/services.html'), '<section id="risk"></section>');
  const file = join(out, 'x/de/index.html');
  const html = '<a href="services.html#risk">ok</a><a href="services.html#nope">bad</a><a href="missing.html">bad</a><a href="#top">bad</a><a href="https://x.y/">ext</a><a href="mailto:a@b.c">m</a><a href="tel:+1">t</a><div id="main"></div><a href="#main">ok</a><a href="../../../escape.html">bad</a><a href="../">dir</a>';
  writeFileSync(file, html);
  writeFileSync(join(out, 'x/index.html'), 'parent');
  const errors = checkLinks(file, html, out);
  assert.equal(errors.length, 4);
  assert.match(errors[0], /x\/de\/index\.html: missing anchor services\.html#nope/);
  assert.match(errors[1], /broken link missing\.html/);
  assert.match(errors[2], /missing anchor #top/);
  assert.match(errors[3], /link leaves dist \.\.\/\.\.\/\.\.\/escape\.html/);
});

test('checkDocument enforces h1, title, lang, unique ids and leaked placeholders on any document', () => {
  const out = '/dist';
  const good = `<html lang="de" class="x"><head><title> T </title></head><body><h1>x</h1><i data-id="a"></i><i data-id="a"></i></body></html>`;
  assert.deepEqual(checkDocument(join(out, 'index.html'), good, { lang: 'de', out }), []);
  const bad = `<html lang="en"><head><title>   </title></head><body><h1>a</h1><h1>b</h1><div id="x"></div><p id="x"></p>undefined [object Object] NaN</body></html>`;
  const errors = checkDocument(join(out, 'index.html'), bad, { lang: 'de', out });
  assert.ok(errors.some((e) => /index\.html: expected 1 h1, found 2/.test(e)));
  assert.ok(errors.some((e) => /duplicate id\(s\) x/.test(e)));
  assert.ok(errors.some((e) => /empty title/.test(e)));
  assert.ok(errors.some((e) => /lang attribute is not "de"/.test(e)));
  assert.ok(errors.some((e) => /contains "undefined"/.test(e)));
  assert.ok(errors.some((e) => /contains "\[object Object\]"/.test(e)));
  assert.ok(errors.some((e) => /contains "NaN"/.test(e)));
});

test('checkPage requires the six links inside the main navigation and a toggle link', () => {
  const out = '/dist';
  const good = `<html lang="de"><head><title>T</title><link rel="alternate" hreflang="en" href="../en/index.html"></head><body>${navBlock}<h1>x</h1></body></html>`;
  assert.deepEqual(checkPage(join(out, '01/de/index.html'), good, { lang: 'de', slugs, out }), []);
  const footerOnly = `<html lang="de"><head><title>T</title><link rel="alternate" hreflang="en" href="../en/index.html"></head><body><nav id="site-menu"></nav><h1>x</h1><footer><a href="index.html">a</a><a href="services.html">b</a><a href="projekte.html">c</a><a href="unternehmen.html">d</a><a href="karriere.html">e</a><a href="kontakt.html">f</a></footer></body></html>`;
  const errors = checkPage(join(out, '01/de/index.html'), footerOnly, { lang: 'de', slugs, out });
  assert.equal(errors.filter((e) => /nav link to/.test(e)).length, 6);
  assert.ok(errors.some((e) => /language toggle missing/.test(e)), 'head alternates do not count as a toggle');
  const noMenu = `<html lang="de"><head><title>T</title></head><body><h1>x</h1></body></html>`;
  assert.ok(checkPage(join(out, '01/de/index.html'), noMenu, { lang: 'de', slugs, out }).some((e) => /main navigation \(id="site-menu"\) missing/.test(e)));
});

test('checkTheme requires tokens and 4.5:1 contrast in the :root block', () => {
  assert.deepEqual(checkTheme('x', ':root{--bg:#ffffff;--fg:#212121;--accent:#1863dc;--accent-fg:#ffffff;}'), []);
  const low = checkTheme('x', ':root{--bg:#ffffff;--fg:#999999;--accent:#1863dc;--accent-fg:#ffffff;}');
  assert.deepEqual(low, ['demos/x/theme.css: contrast --fg on --bg is 2.85 (< 4.5)']);
  const missing = checkTheme('x', ':root{--bg:#ffffff;--fg:#212121;}');
  assert.deepEqual(missing, ['demos/x/theme.css: token(s) --accent-fg, --accent missing or not a 6-digit hex color']);
  assert.deepEqual(checkTheme('x', '.a{--bg:#ffffff;}'), ['demos/x/theme.css: no :root block found']);
  const later = checkTheme('x', ':root{--bg:#ffffff;--fg:#212121;--accent:#1863dc;--accent-fg:#ffffff;} .dark{--fg:#ffffff;}');
  assert.deepEqual(later, [], 'only the :root block is read');
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

test('checkDist reports realistic damage with file names', { skip: !haveAssets && 'assets not downloaded' }, (t) => {
  const out = mkdtempSync(join(tmpdir(), 's01-dist-damaged-'));
  t.after(() => rmSync(out, { recursive: true, force: true }));
  build({ root: ROOT, out });
  unlinkSync(join(out, '01-original/de/karriere.html'));
  const projekte = join(out, '01-original/de/projekte.html');
  let html = readFileSync(projekte, 'utf8');
  html = html.replace(/<li><a href="unternehmen\.html"[^<]*<\/a><\/li>/, '');
  html = html.replace(/<a class="lang-toggle"[^>]*>[^<]*<\/a>/, '');
  html = html.replace('href="../../kit/base.css"', 'href="../../../kit/base.css"');
  writeFileSync(projekte, html);
  const gallery = join(out, 'index.html');
  writeFileSync(gallery, readFileSync(gallery, 'utf8').replace('</header>', '<p>undefined</p></header>'));
  const { errors } = checkDist({ out, root: ROOT });
  const expect = (re) => assert.ok(errors.some((e) => re.test(e)), `expected ${re} in:\n${errors.join('\n')}`);
  expect(/01-original\/de\/karriere\.html: file missing/);
  expect(/01-original\/de\/index\.html: broken link karriere\.html/);
  expect(/01-original\/de\/projekte\.html: nav link to company \(unternehmen\.html\) missing/);
  expect(/01-original\/de\/projekte\.html: language toggle missing/);
  expect(/01-original\/de\/projekte\.html: link leaves dist \.\.\/\.\.\/\.\.\/kit\/base\.css/);
  expect(/index\.html: contains "undefined"/);
  assert.equal(new Set(errors).size, errors.length, 'errors are deduplicated');
});

test('the CLI exits 1 with the errors on stderr and 0 with an OK line otherwise', { skip: !haveAssets && 'assets not downloaded' }, (t) => {
  const out = mkdtempSync(join(tmpdir(), 's01-dist-cli-'));
  t.after(() => rmSync(out, { recursive: true, force: true }));
  build({ root: ROOT, out });
  const ok = spawnSync(process.execPath, [join(ROOT, 'build/check.js'), out, ROOT], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /^OK: \d+ files checked, no problems/);
  unlinkSync(join(out, '02-cinematic/en/contact.html'));
  const bad = spawnSync(process.execPath, [join(ROOT, 'build/check.js'), out, ROOT], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.equal(bad.stdout, '');
  assert.match(bad.stderr, /02-cinematic\/en\/contact\.html: file missing/);
  assert.match(bad.stderr, /\d+ problem\(s\) found in \d+ files/);
});
