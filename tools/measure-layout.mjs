// Layout measurement: serves a built dist/ and reports, per demo and width, horizontal overflow,
// words of up to 20 letters broken across lines in h1/h2/h3 (any length under 18 at 320px),
// and headline punctuation pushed onto its own line.
// Usage: node tools/measure-layout.mjs [demo ids]   (env: DIST=path/to/dist  WIDTHS=320,360,390,768,1024,1280,1440)
import { readdirSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const ROOT = resolve(process.cwd());
const out = process.env.DIST ? resolve(process.env.DIST) : `${ROOT}/dist`;
const only = process.argv.slice(2);
const { startServer } = await import(pathToFileURL(`${ROOT}/build/serve.js`).href);
const { launchBrowser } = await import(pathToFileURL(`${ROOT}/build/lib/browser.js`).href);
const slugs = JSON.parse(readFileSync(`${ROOT}/content/slugs.json`, "utf8"));
const demos = readdirSync(out, { withFileTypes: true }).filter((e) => e.isDirectory() && /^\d\d-/.test(e.name)).map((e) => e.name).filter((d) => !only.length || only.includes(d));
const widths = (process.env.WIDTHS || "320,360,390").split(",").map(Number);
const pages = [["de", "home"], ["de", "services"], ["de", "projects"], ["de", "privacy"], ["de", "company"], ["de", "careers"], ["de", "contact"], ["en", "home"]];
const variantsOf = (d) => { try { const o = JSON.parse(readFileSync(`${ROOT}/demos/${d}/demo.json`, "utf8")); return `nav=${o.variants.nav} hero=${o.variants.hero}`; } catch { return ""; } };
const server = await startServer({ dir: out });
const launched = await launchBrowser();
const browser = launched.browser || launched;
const measure = () => {
  const cw = document.documentElement.clientWidth;
  const res = { overflow: document.documentElement.scrollWidth > cw + 1, culprits: [], hard: [], soft: 0 };
  if (res.overflow) {
    const vis = (e) => { const cs = getComputedStyle(e); return cs.visibility !== "hidden" && cs.display !== "none" && cs.position !== "fixed" && Number(cs.opacity) > 0; };
    const name = (e) => e.tagName.toLowerCase() + (e.className && typeof e.className === "string" && e.className.trim() ? "." + e.className.trim().split(/\s+/).slice(0, 2).join(".") : "");
    for (const sec of document.querySelectorAll("body > *, main > *")) if (sec.scrollWidth > cw + 1 || sec.getBoundingClientRect().right > cw + 1) res.culprits.push("SECTION " + name(sec) + " sw=" + sec.scrollWidth);
    const deep = [];
    for (const e of document.querySelectorAll("body *")) {
      const r = e.getBoundingClientRect();
      if (r.width > 0 && r.right > cw + 1 && vis(e) && ![...e.querySelectorAll("*")].some((c) => c.getBoundingClientRect().right > cw + 1)) {
        const range = document.createRange();
        range.selectNodeContents(e);
        const tw = Math.round(range.getBoundingClientRect().width);
        deep.push({ s: name(e) + " w=" + Math.round(r.width) + " text=" + tw + "px " + JSON.stringify((e.textContent || "").trim().slice(0, 28)), tw });
      }
    }
    deep.sort((a, b) => b.tw - a.tw);
    res.culprits.push(...deep.slice(0, 3).map((d) => d.s));
  }
  for (const h of document.querySelectorAll("h1, h2")) {
    const w2 = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    let n2;
    while ((n2 = w2.nextNode())) {
      const re2 = /[A-Za-zÄÖÜäöüß]{4,}[.,:;!?]+/g;
      let t;
      while ((t = re2.exec(n2.nodeValue))) {
        const wordEnd = t.index + t[0].replace(/[.,:;!?]+$/, "").length;
        const rw = document.createRange(); rw.setStart(n2, t.index); rw.setEnd(n2, wordEnd);
        const rp = document.createRange(); rp.setStart(n2, wordEnd); rp.setEnd(n2, t.index + t[0].length);
        const topsW = new Set([...rw.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top)));
        const topsP = new Set([...rp.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top)));
        if (topsP.size && topsW.size && Math.max(...topsP) > Math.max(...topsW)) res.hard.push(`${h.tagName.toLowerCase()}:PUNCT-ORPHAN ${t[0]} @${getComputedStyle(h).fontSize}`);
      }
    }
  }
  for (const h of document.querySelectorAll("h1, h2, h3, .stat-value, .num")) {
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue;
      const re = /[A-Za-zÄÖÜäöüß]{5,}/g;
      let m;
      while ((m = re.exec(text))) {
        const range = document.createRange();
        range.setStart(node, m.index);
        range.setEnd(node, m.index + m[0].length);
        const tops = new Set([...range.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top)));
        if (tops.size > 1) {
          if (m[0].length < 18 || (m[0].length <= 20 && innerWidth >= 360)) {
            const probe = document.createElement("span");
            probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap";
            probe.textContent = m[0];
            h.appendChild(probe);
            const ww = Math.round(probe.getBoundingClientRect().width);
            probe.remove();
            const cs = getComputedStyle(h);
            res.hard.push(`${h.tagName.toLowerCase()}:${m[0]}(word ${ww}px in box ${Math.round(h.getBoundingClientRect().width)}px @${cs.fontSize} ${cs.textTransform === "uppercase" ? "UPPER" : ""} parent=${h.parentElement.tagName.toLowerCase()}.${(h.parentElement.className || "").toString().split(" ")[0]})`);
          } else res.soft++;
        }
      }
    }
  }
  return res;
};
let problems = 0;
for (const demo of demos) {
  const lines = [];
  for (const width of widths) {
    const ctx = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 900 }, isMobile: width < 700, hasTouch: width < 700 });
    const page = await ctx.newPage();
    for (const [lang, key] of pages) {
      await page.goto(`${server.url}/${demo}/${lang}/${slugs[lang][key]}`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const r = await page.evaluate(measure);
      if (r.overflow || r.hard.length) {
        problems++;
        lines.push(`  ${width}px ${lang}/${key}: ${r.overflow ? "OVERFLOW[" + r.culprits.join(" ") + "] " : ""}${r.hard.length ? "SPLIT " + [...new Set(r.hard)].join(",") : ""}`);
      }
    }
    await ctx.close();
  }
  console.log(`${demo} (${variantsOf(demo)}): ${lines.length ? "" : "clean"}`);
  for (const l of lines) console.log(l);
}
console.log(`\n${problems} problem page-width combinations`);
await browser.close();
await server.close();
