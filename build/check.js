import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { contrast, cssTokens } from './contrast.js';

const SKIP = /^(https?:|mailto:|tel:|data:|javascript:|\/\/)/i;

function rel(out, file) {
  return relative(out, file).split('\\').join('/');
}

export function extractRefs(html) {
  return [...html.matchAll(/\b(?:href|src|poster)="([^"]*)"/g)].map((m) => m[1]);
}

export function ids(html) {
  return new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
}

export function checkLinks(file, html, out) {
  const errors = [];
  const own = ids(html);
  for (const ref of extractRefs(html)) {
    if (!ref || SKIP.test(ref)) continue;
    const [pathPart, hash] = ref.split('#');
    if (!pathPart) {
      if (hash && !own.has(hash)) errors.push(`${rel(out, file)}: missing anchor #${hash}`);
      continue;
    }
    let target = resolve(dirname(file), pathPart.split('?')[0]);
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

export function checkPage(file, html, { lang, slugs, out }) {
  const errors = [];
  const r = rel(out, file);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${r}: expected 1 h1, found ${h1}`);
  const idList = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = [...new Set(idList.filter((id, i) => idList.indexOf(id) !== i))];
  if (dupes.length) errors.push(`${r}: duplicate id(s) ${dupes.join(', ')}`);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${r}: empty title`);
  if (!html.includes(`<html lang="${lang}">`)) errors.push(`${r}: lang attribute is not "${lang}"`);
  for (const [page, slug] of Object.entries(slugs[lang])) {
    if (page === 'imprint' || page === 'privacy') continue;
    if (!html.includes(`href="${slug}"`)) errors.push(`${r}: nav link to ${page} (${slug}) missing`);
  }
  if (!/hreflang="(de|en)"/.test(html)) errors.push(`${r}: language toggle missing`);
  if (html.includes('undefined')) errors.push(`${r}: contains "undefined"`);
  if (html.includes('[object Object]')) errors.push(`${r}: contains "[object Object]"`);
  if (/\bNaN\b/.test(html)) errors.push(`${r}: contains "NaN"`);
  return errors;
}

export function checkTheme(demoId, css) {
  const rootBlock = css.match(/:root\s*\{([^}]*)\}/);
  if (!rootBlock) return [`${demoId}/theme.css: no :root block found`];
  const t = cssTokens(rootBlock[1]);
  const errors = [];
  for (const [a, b] of [['fg', 'bg'], ['accent-fg', 'accent']]) {
    if (!t[a] || !t[b]) {
      errors.push(`${demoId}/theme.css: token --${a} or --${b} missing or not a hex color`);
      continue;
    }
    const c = contrast(t[a], t[b]);
    if (c < 4.5) errors.push(`${demoId}/theme.css: contrast --${a} on --${b} is ${c.toFixed(2)} (< 4.5)`);
  }
  return errors;
}

export function checkDist({ out, root }) {
  const errors = [];
  if (!existsSync(join(out, 'index.html'))) return { errors: [`${out}: index.html missing (run the build first)`], files: 0 };
  const slugs = JSON.parse(readFileSync(join(root, 'content/slugs.json'), 'utf8'));
  const demoDirs = readdirSync(out, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d\d-/.test(e.name))
    .map((e) => e.name)
    .sort();
  if (!demoDirs.length) errors.push('no demo folders found in dist');
  const gallery = readFileSync(join(out, 'index.html'), 'utf8');
  let files = 1;
  for (const id of demoDirs) {
    const themePath = join(root, 'demos', id, 'theme.css');
    if (existsSync(themePath)) errors.push(...checkTheme(id, readFileSync(themePath, 'utf8')));
    else errors.push(`${id}: demos/${id}/theme.css missing`);
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
  errors.push(...checkLinks(join(out, 'index.html'), gallery, out));
  return { errors, files };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const { errors, files } = checkDist({ out: join(root, 'dist'), root });
  if (errors.length) {
    console.error(errors.join('\n'));
    console.error(`\n${errors.length} problem(s) found in ${files} files`);
    process.exit(1);
  }
  console.log(`OK: ${files} files checked, no problems`);
}
