import { readdirSync, readFileSync, existsSync, statSync, realpathSync } from 'node:fs';
import { join, dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrast, cssTokens } from './contrast.js';

const SKIP = /^(https?:|mailto:|tel:|data:|javascript:|\/\/)/i;
// An id attribute, but not data-id or similar prefixed attributes.
const ID_RE = /(?<![\w-])id="([^"]+)"/g;

function rel(out, file) {
  return relative(out, file).split('\\').join('/');
}

export function extractRefs(html) {
  return [...html.matchAll(/\b(?:href|src|poster)="([^"]*)"/g)].map((m) => m[1]);
}

export function ids(html) {
  return new Set([...html.matchAll(ID_RE)].map((m) => m[1]));
}

export function checkLinks(file, html, out) {
  const errors = [];
  const own = ids(html);
  const outRoot = resolve(out);
  for (const ref of extractRefs(html)) {
    if (!ref || SKIP.test(ref)) continue;
    const [pathPart, hash] = ref.split('#');
    if (!pathPart) {
      if (hash && !own.has(hash)) errors.push(`${rel(out, file)}: missing anchor #${hash}`);
      continue;
    }
    let target = resolve(dirname(file), pathPart.split('?')[0]);
    const inside = relative(outRoot, target);
    if (inside.startsWith('..') || isAbsolute(inside)) {
      errors.push(`${rel(out, file)}: link leaves dist ${ref}`);
      continue;
    }
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    if (!existsSync(target)) {
      errors.push(`${rel(out, file)}: broken link ${ref}`);
      continue;
    }
    if (hash && target.endsWith('.html') && !ids(readFileSync(target, 'utf8')).has(hash)) {
      errors.push(`${rel(out, file)}: missing anchor ${ref}`);
    }
  }
  return errors;
}

// Checks that apply to every generated document, including the gallery.
export function checkDocument(file, html, { lang, out }) {
  const errors = [];
  const r = rel(out, file);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${r}: expected 1 h1, found ${h1}`);
  const idList = [...html.matchAll(ID_RE)].map((m) => m[1]);
  const dupes = [...new Set(idList.filter((id, i) => idList.indexOf(id) !== i))];
  if (dupes.length) errors.push(`${r}: duplicate id(s) ${dupes.join(', ')}`);
  if (!/<title>\s*\S[^<]*<\/title>/.test(html)) errors.push(`${r}: empty title`);
  if (!new RegExp(`<html\\b[^>]*\\blang="${lang}"`).test(html)) errors.push(`${r}: lang attribute is not "${lang}"`);
  if (!/<meta name="robots" content="noindex[^"]*">/.test(html)) errors.push(`${r}: robots noindex meta missing`);
  if (/\bundefined\b/.test(html)) errors.push(`${r}: contains "undefined"`);
  if (html.includes('[object Object]')) errors.push(`${r}: contains "[object Object]"`);
  if (/\bNaN\b/.test(html)) errors.push(`${r}: contains "NaN"`);
  return errors;
}

// Checks for a demo page: the document checks plus the main navigation and the language toggle.
export function checkPage(file, html, { lang, slugs, out }) {
  const errors = checkDocument(file, html, { lang, out });
  const r = rel(out, file);
  const start = html.indexOf('id="site-menu"');
  const menu = start >= 0 ? html.slice(start, html.indexOf('</nav>', start)) : '';
  if (!menu) errors.push(`${r}: main navigation (id="site-menu") missing`);
  for (const [page, slug] of Object.entries(slugs[lang])) {
    if (page === 'imprint' || page === 'privacy') continue;
    if (menu && !menu.includes(`href="${slug}"`)) errors.push(`${r}: nav link to ${page} (${slug}) missing`);
  }
  if (!/<a\b[^>]*\bhreflang="(de|en)"/.test(html)) errors.push(`${r}: language toggle missing`);
  return errors;
}

export function checkTheme(demoId, css) {
  const label = `demos/${demoId}/theme.css`;
  const rootBlock = css.match(/:root\s*\{([^}]*)\}/);
  if (!rootBlock) return [`${label}: no :root block found`];
  const t = cssTokens(rootBlock[1]);
  const errors = [];
  for (const [a, b] of [['fg', 'bg'], ['accent-fg', 'accent']]) {
    const missing = [a, b].filter((k) => !t[k]);
    if (missing.length) {
      errors.push(`${label}: token(s) ${missing.map((k) => `--${k}`).join(', ')} missing or not a 6-digit hex color`);
      continue;
    }
    const c = contrast(t[a], t[b]);
    if (c < 4.5) errors.push(`${label}: contrast --${a} on --${b} is ${c.toFixed(2)} (< 4.5)`);
  }
  return errors;
}

function dirs(path, filter = () => true) {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true })
    .filter((e) => e.isDirectory() && filter(e.name))
    .map((e) => e.name)
    .sort();
}

export function checkDist({ out, root }) {
  const errors = [];
  if (!existsSync(join(out, 'index.html'))) return { errors: [`${out}: index.html missing (run the build first)`], files: 0 };
  const slugs = JSON.parse(readFileSync(join(root, 'content/slugs.json'), 'utf8'));
  const expected = dirs(join(root, 'demos'));
  const built = dirs(out, (name) => /^\d\d-/.test(name));
  for (const id of expected) if (!built.includes(id)) errors.push(`${id}: demo folder missing from dist (stale build?)`);
  for (const id of built) if (!expected.includes(id)) errors.push(`${id}: dist contains a demo that no longer exists in demos/`);
  if (!built.length) errors.push('no demo folders found in dist');
  if (!existsSync(join(out, 'robots.txt'))) errors.push('robots.txt missing from dist');
  const galleryFile = join(out, 'index.html');
  const gallery = readFileSync(galleryFile, 'utf8');
  errors.push(...checkDocument(galleryFile, gallery, { lang: 'de', out }));
  let files = 1;
  for (const id of built) {
    const themePath = join(root, 'demos', id, 'theme.css');
    if (existsSync(themePath)) errors.push(...checkTheme(id, readFileSync(themePath, 'utf8')));
    else errors.push(`demos/${id}/theme.css missing`);
    for (const lang of Object.keys(slugs)) {
      for (const slug of Object.values(slugs[lang])) {
        const file = join(out, id, lang, slug);
        if (!existsSync(file)) {
          errors.push(`${id}/${lang}/${slug}: file missing`);
          continue;
        }
        files++;
        const html = readFileSync(file, 'utf8');
        errors.push(...checkPage(file, html, { lang, slugs, out }));
        errors.push(...checkLinks(file, html, out));
      }
      if (!gallery.includes(`href="${id}/${lang}/${slugs[lang].home}"`)) errors.push(`index.html: missing link to ${id}/${lang}`);
    }
  }
  errors.push(...checkLinks(galleryFile, gallery, out));
  return { errors: [...new Set(errors)], files };
}

function isMain() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMain()) {
  const here = join(dirname(fileURLToPath(import.meta.url)), '..');
  const out = resolve(process.argv[2] || join(here, 'dist'));
  const root = resolve(process.argv[3] || here);
  const { errors, files } = checkDist({ out, root });
  if (errors.length) {
    console.error(errors.join('\n'));
    console.error(`\n${errors.length} problem(s) found in ${files} files`);
    process.exit(1);
  }
  console.log(`OK: ${files} files checked, no problems`);
}
