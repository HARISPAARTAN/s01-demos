import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser } from './lib/browser.js';
import { startServer } from './serve.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'assets/video/manifest.json'), 'utf8'));
const server = await startServer({ dir: root });
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
let failures = 0;

for (const [key, v] of Object.entries(manifest)) {
  const posterPath = join(root, 'assets', v.poster);
  if (existsSync(posterPath)) {
    console.log(`skip  ${v.poster} (exists)`);
    continue;
  }
  const src = `${server.url}/assets/${v.src}`;
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><video id="v" src="${src}" muted playsinline preload="auto" style="display:block;width:1280px;height:720px;object-fit:cover"></video></body></html>`);
  try {
    await page.evaluate(() => new Promise((resolve, reject) => {
      const v = document.getElementById('v');
      v.addEventListener('seeked', () => resolve(), { once: true });
      v.addEventListener('error', () => reject(new Error('video decode error (Chrome or Edge required for mp4)')), { once: true });
      v.addEventListener('loadedmetadata', () => { v.currentTime = Math.min(1.5, v.duration / 3); }, { once: true });
      v.load();
      setTimeout(() => reject(new Error('timeout waiting for a video frame')), 20000);
    }));
    await page.locator('#v').screenshot({ path: posterPath, type: 'jpeg', quality: 82 });
    console.log(`saved ${v.poster}`);
  } catch (err) {
    failures++;
    console.error(`FAIL  ${key}: ${err.message}`);
  }
}

await browser.close();
await server.close();
if (failures) process.exit(1);
