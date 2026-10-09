// Behaviour pass: muted autoplay, DE/EN toggle landing on the same page, badge link, demo form confirmation,
// phone menu open/close, console errors. Usage: BASE=http://127.0.0.1:8080 node tools/behaviour-pass.mjs   (env: DEMOS=ids, WAIT=load|domcontentloaded)
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const ROOT = resolve(process.cwd());
const { launchBrowser } = await import(pathToFileURL(`${ROOT}/build/lib/browser.js`).href);
const base = process.env.BASE || "http://127.0.0.1:8080";
const WAIT = process.env.WAIT || "load";
const demos = (process.env.DEMOS || "02-cinematic,06-brutalist,13-sidebar,21-snap-fullscreen,24-timeline-story").split(",");
const launched = await launchBrowser();
const browser = launched.browser || launched;
let fails = 0;
const report = (demo, name, ok, info = "") => { if (!ok) fails++; console.log(`${ok ? "ok  " : "FAIL"} ${demo} ${name}${info ? " " + info : ""}`); };
for (const demo of demos) {
  const errors = [];
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktop.newPage();
  page.setDefaultTimeout(90000);
  page.on("console", (m) => { if (m.type() === "error" && !/fonts\.g/.test(m.text())) errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push("pageerror " + e.message));
  await page.goto(`${base}/${demo}/de/index.html`, { waitUntil: WAIT });
  for (let i = 0; i < 60; i++) { const t = await page.evaluate(() => { const v = document.querySelector("video.hero-video"); return v ? v.currentTime : -1; }); if (t > 0) break; await page.waitForTimeout(500); }
  const video = await page.evaluate(() => { const v = document.querySelector("video.hero-video"); return v ? { muted: v.muted, autoplay: v.autoplay, paused: v.paused, t: v.currentTime, ready: v.readyState } : null; });
  report(demo, "video autoplays muted", !!video && video.muted && !video.paused && video.t > 0, JSON.stringify(video));
  await Promise.all([page.waitForNavigation({ waitUntil: WAIT }), page.click("a.lang-toggle")]);
  report(demo, "toggle home -> en", page.url().endsWith(`/${demo}/en/index.html`), page.url());
  await page.goto(`${base}/${demo}/de/karriere.html`, { waitUntil: WAIT });
  await Promise.all([page.waitForNavigation({ waitUntil: WAIT }), page.click("a.lang-toggle")]);
  report(demo, "toggle karriere -> careers", page.url().endsWith(`/${demo}/en/careers.html`), page.url());
  await Promise.all([page.waitForNavigation({ waitUntil: WAIT }), page.click("a.lang-toggle")]);
  report(demo, "toggle back -> karriere", page.url().endsWith(`/${demo}/de/karriere.html`), page.url());
  await page.goto(`${base}/${demo}/de/index.html`, { waitUntil: WAIT });
  await Promise.all([page.waitForNavigation({ waitUntil: WAIT }), page.click("a.demo-badge")]);
  report(demo, "badge -> gallery", page.url().replace(/index\.html$/, "") === base + "/", page.url());
  await page.goto(`${base}/${demo}/de/kontakt.html`, { waitUntil: WAIT });
  const formResult = await page.evaluate(async () => {
    const form = document.querySelector("form.form");
    if (!form) return { error: "no form" };
    for (const el of form.querySelectorAll("[required]")) {
      if (el.type === "checkbox") el.checked = true;
      else if (el.type === "email") el.value = "demo@example.com";
      else if (el.type === "tel") el.value = "+49 6196 0";
      else if (el.tagName === "SELECT") el.selectedIndex = Math.max(1, el.selectedIndex);
      else el.value = "Demo-Eingabe";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const btn = form.querySelector("button[type=submit]");
    const disabled = btn.disabled;
    btn.click();
    await new Promise((r) => setTimeout(r, 300));
    const ok = form.querySelector("[data-form-success]");
    return { disabled, shown: ok && !ok.hidden && getComputedStyle(ok).display !== "none" };
  });
  report(demo, "contact form shows confirmation", !!formResult.shown && !formResult.disabled, JSON.stringify(formResult));
  await desktop.close();
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await mobile.newPage();
  mp.setDefaultTimeout(90000);
  mp.on("console", (m) => { if (m.type() === "error" && !/fonts\.g/.test(m.text())) errors.push(m.text()); });
  await mp.goto(`${base}/${demo}/de/index.html`, { waitUntil: WAIT });
  const burger = mp.locator("button.nav-burger");
  const visible = await burger.isVisible();
  await burger.click();
  await mp.waitForTimeout(400);
  const opened = await mp.evaluate(() => { const b = document.querySelector("button.nav-burger"); const m = document.getElementById("site-menu"); const r = m.getBoundingClientRect(); const cs = getComputedStyle(m); return { expanded: b.getAttribute("aria-expanded"), visible: cs.visibility !== "hidden" && cs.display !== "none" && r.width > 0 && r.left < innerWidth && r.right > 0 }; });
  await mp.keyboard.press("Escape");
  await mp.waitForTimeout(400);
  const closed = await mp.evaluate(() => { const b = document.querySelector("button.nav-burger"); const m = document.getElementById("site-menu"); const cs = getComputedStyle(m); const r = m.getBoundingClientRect(); return { expanded: b.getAttribute("aria-expanded"), hidden: cs.visibility === "hidden" || cs.display === "none" || r.left >= innerWidth || r.right <= 0 }; });
  report(demo, "mobile menu opens", visible && opened.expanded === "true" && opened.visible, JSON.stringify(opened));
  report(demo, "mobile menu closes on Escape", closed.expanded === "false" && closed.hidden, JSON.stringify(closed));
  await mobile.close();
  report(demo, "no console errors", errors.length === 0, errors.slice(0, 2).join(" | "));
}
console.log(`\n${fails} failing checks`);
await browser.close();
