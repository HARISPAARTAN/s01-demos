import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './lib/browser.js';
import { startServer } from './serve.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
const only = process.argv.slice(2);
if (!existsSync(join(out, 'index.html'))) {
  console.error('dist/index.html missing: run npm run build first');
  process.exit(1);
}
const slugs = JSON.parse(readFileSync(join(root, 'content/slugs.json'), 'utf8'));
mkdirSync(join(root, 'assets/thumbs'), { recursive: true });
mkdirSync(join(root, '.shots'), { recursive: true });
const demos = readdirSync(out, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^\d\d-/.test(e.name))
  .map((e) => e.name)
  .sort()
  .filter((id) => !only.length || only.includes(id));
const unknown = only.filter((id) => !demos.includes(id));
if (unknown.length) {
  console.error(`Unknown demo id(s): ${unknown.join(', ')}`);
  process.exit(1);
}

const server = await startServer({ dir: out });
const browser = await launchBrowser();
const problems = [];

async function open(context, url) {
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const where = m.location() && m.location().url ? m.location().url : '';
    if (/fonts\.(googleapis|gstatic)\.com/.test(where) || /fonts\.(googleapis|gstatic)\.com/.test(m.text())) return;
    errors.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    const f = r.failure();
    const text = f ? f.errorText : '';
    if (text === 'net::ERR_ABORTED' || /fonts\.(googleapis|gstatic)\.com/.test(r.url())) return;
    errors.push(`request failed: ${r.url()} ${text}`);
  });
  const res = await page.goto(url, { waitUntil: 'load' });
  if (!res || res.status() !== 200) errors.push(`status ${res ? res.status() : 'none'} for ${url}`);
  await page.waitForTimeout(800);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (overflow) errors.push(`horizontal overflow at ${await page.evaluate(() => window.innerWidth)}px`);
  return { page, errors };
}

for (const id of demos) {
  const label = (s) => `${id}: ${s}`;
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  const home = await open(desktop, `${server.url}/${id}/de/${slugs.de.home}`);
  const videos = await home.page.locator('video.hero-video').count();
  const navLinks = await home.page.locator('#site-menu a').count();
  if (videos !== 1) home.errors.push(`expected 1 hero video, found ${videos}`);
  if (navLinks < 6) home.errors.push(`expected at least 6 nav links, found ${navLinks}`);
  // Thumbnails must be reproducible: show the poster frame instead of the live video, hide the demo badge.
  await home.page.evaluate(() => {
    const badge = document.querySelector('[data-badge]');
    if (badge) badge.hidden = true;
    const v = document.querySelector('video.hero-video');
    if (v) {
      v.pause();
      v.style.display = 'none';
    }
  });
  await home.page.screenshot({ path: join(root, 'assets/thumbs', `${id}.jpg`), type: 'jpeg', quality: 80, animations: 'disabled' });
  problems.push(...home.errors.map(label));
  await home.page.close();

  const services = await open(desktop, `${server.url}/${id}/en/${slugs.en.services}`);
  const anchors = await services.page.locator('#risk').count();
  if (anchors !== 1) services.errors.push(`services page: expected id="risk", found ${anchors}`);
  problems.push(...services.errors.map((s) => label(`services page: ${s}`)));
  await services.page.close();

  const m = await open(mobile, `${server.url}/${id}/de/${slugs.de.home}`);
  const burgerVisible = await m.page.locator('.nav-burger').isVisible();
  if (!burgerVisible) m.errors.push('burger button not visible');
  await m.page.screenshot({ path: join(root, '.shots', `${id}-mobile.png`), fullPage: false });
  problems.push(...m.errors.map((s) => label(`mobile home: ${s}`)));
  await m.page.close();

  await desktop.close();
  await mobile.close();
  console.log(`${problems.some((p) => p.startsWith(id + ':')) ? 'FAIL' : 'ok  '} ${id}`);
}

await browser.close();
await server.close();
if (problems.length) {
  console.error('\n' + problems.join('\n'));
  console.error(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`\nAll ${demos.length} demos passed smoke checks; thumbnails in assets/thumbs/`);
