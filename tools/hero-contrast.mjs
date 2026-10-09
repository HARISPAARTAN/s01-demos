// Hero text contrast over real video frames: samples frames of each demo hero and reports per text line the
// worst-frame median contrast (WCAG formula, per pixel). Usage: DEMOS=01-original,02-cinematic node tools/hero-contrast.mjs   (env: DIST=path)
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const root = resolve(process.cwd());
const { startServer } = await import(pathToFileURL(root + '/build/serve.js').href);
const { launchBrowser } = await import(pathToFileURL(root + '/build/lib/browser.js').href);
const srv = await startServer({ dir: (process.env.DIST || root + '/dist'), port: 0 });
const browser = await launchBrowser();

// Decoder page: compute per-rect stats from a PNG buffer
const decoder = await browser.newPage();
await decoder.setContent('<canvas id="c"></canvas>');
async function stats(pngBuf, rects, fgRgb, fgAlpha) {
  const b64 = pngBuf.toString('base64');
  return await decoder.evaluate(async ({ b64, rects, fgRgb, fgAlpha }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.getElementById('c'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const L = (r, g_, b) => 0.2126 * lin(r) + 0.7152 * lin(g_) + 0.0722 * lin(b);
    const res = [];
    for (const r of rects) {
      const x = Math.max(0, Math.floor(r.x)), y = Math.max(0, Math.floor(r.y));
      const w = Math.max(1, Math.min(img.width - x, Math.ceil(r.w))), h = Math.max(1, Math.min(img.height - y, Math.ceil(r.h)));
      const d = g.getImageData(x, y, w, h).data;
      const cr = [];
      for (let i = 0; i < d.length; i += 4) {
        const br = d[i], bg = d[i + 1], bb = d[i + 2];
        // effective foreground: fg with alpha over the pixel
        const fr = fgRgb[0] * fgAlpha + br * (1 - fgAlpha), fgc = fgRgb[1] * fgAlpha + bg * (1 - fgAlpha), fb = fgRgb[2] * fgAlpha + bb * (1 - fgAlpha);
        const l1 = L(fr, fgc, fb), l2 = L(br, bg, bb);
        const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
        cr.push((hi + 0.05) / (lo + 0.05));
      }
      cr.sort((a, b) => a - b);
      const q = (p) => cr[Math.min(cr.length - 1, Math.floor(p * cr.length))];
      res.push({ min: cr[0], p5: q(0.05), p25: q(0.25), median: q(0.5) });
    }
    return res;
  }, { b64, rects, fgRgb, fgAlpha });
}

const demos = (process.env.DEMOS || '03-swiss-minimal,04-corporate-navy').split(',');
const viewports = [{ w: 1440, h: 900 }, { w: 390, h: 844 }];
for (const demo of demos) {
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, locale: 'de-DE' });
    const page = await ctx.newPage();
    await page.goto(`${srv.url}/${demo}/de/index.html`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const dur = await page.evaluate(async () => { const v = document.querySelector('video'); v.pause(); if (v.readyState < 1) await new Promise(r => v.addEventListener('loadedmetadata', r, { once: true })); return v.duration; });
    // text elements and rects
    const targets = await page.evaluate(() => {
      const sel = ['.hero-eyebrow', '.hero-title', '.hero-bullets li', '.hero-actions .btn-ghost'];
      const out = [];
      for (const s of sel) for (const el of document.querySelectorAll('.hero ' + s)) {
        const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        // text-only rect: use Range for tight text boxes
        const range = document.createRange(); range.selectNodeContents(el);
        const rects = [...range.getClientRects()].filter(q => q.width > 1);
        out.push({ sel: s, text: el.textContent.trim().slice(0, 28), color: cs.color, opacity: cs.opacity, size: parseFloat(cs.fontSize), weight: cs.fontWeight, rects: rects.map(q => ({ x: q.x, y: q.y, w: q.width, h: q.height })) });
      }
      return out;
    });
    // hide hero content only so we see background + overlay
    await page.addStyleTag({ content: '.hero-content, .scroll-cue, .hero-play, .demo-badge-wrap { visibility: hidden !important; }' });
    const times = []; for (let t = 0; t < dur; t += Math.max(1, dur / 24)) times.push(t);
    const agg = {}; const perFrame = {};
    for (const t of times) {
      await page.evaluate(async (tt) => { const v = document.querySelector('video'); await new Promise(res => { const done = () => { v.removeEventListener('seeked', done); res(); }; v.addEventListener('seeked', done); v.currentTime = tt; setTimeout(res, 1500); }); }, t);
      await page.waitForTimeout(120);
      const png = await page.screenshot();
      for (const tg of targets) {
        const [r, g, b] = tg.color.match(/\d+(\.\d+)?/g).map(Number);
        const fgAlpha = Number(tg.opacity) || 1;
        const s = await stats(png, tg.rects, [r, g, b], fgAlpha);
        const key = tg.sel + ' | ' + tg.text;
        const worstP5 = Math.min(...s.map(x => x.p5)), worstMedian = Math.min(...s.map(x => x.median)), worstMin = Math.min(...s.map(x => x.min));
        (perFrame[key] ||= []).push(worstMedian);
        const a = (agg[key] ||= { size: tg.size, weight: tg.weight, minMedian: 99, minP5: 99, minMin: 99, at: 0 });
        if (worstMedian < a.minMedian) { a.minMedian = worstMedian; a.at = t; }
        a.minP5 = Math.min(a.minP5, worstP5); a.minMin = Math.min(a.minMin, worstMin);
      }
    }
    console.log(`\n=== ${demo} @${vp.w}x${vp.h}, video duration ${dur.toFixed(1)}s, ${times.length} frames`);
    for (const [k, arr] of Object.entries(perFrame)) { const need = k.startsWith('.hero-title') ? 3 : 4.5; const below = arr.filter(v => v < need).length; console.log('   frames below ' + need + ' : ' + below + '/' + arr.length + '  for ' + k.slice(0, 40)); }
    for (const [k, a] of Object.entries(agg)) console.log(`${k.padEnd(60)} ${String(a.size).padStart(5)}px w${a.weight}  worst-frame median ${a.minMedian.toFixed(2)} (t=${a.at.toFixed(1)}s)  worst p5 ${a.minP5.toFixed(2)}  absolute min ${a.minMin.toFixed(2)}`);
    await ctx.close();
  }
}
await browser.close(); await srv.close();
