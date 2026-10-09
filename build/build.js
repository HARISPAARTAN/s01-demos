import { mkdirSync, rmSync, cpSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadContent } from './lib/content.js';
import { loadDemos } from './lib/demos.js';
import { registry, resolveVariants } from '../kit/components/index.js';
import { renderPage } from '../kit/render.js';
import { makePaths, LANGS } from '../kit/paths.js';
import { inlineLogo } from '../kit/logo.js';
import { renderGallery } from '../kit/gallery.js';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function build({ root = ROOT, out = join(ROOT, 'dist') } = {}) {
  const { de, en, slugs } = loadContent(root);
  const content = { de, en };
  const manifest = JSON.parse(readFileSync(join(root, 'assets/video/manifest.json'), 'utf8'));
  const credits = JSON.parse(readFileSync(join(root, 'assets/img/credits.json'), 'utf8'));
  const demos = loadDemos(root, registry, Object.keys(manifest));
  if (!demos.length) throw new Error('No demos found in demos/');
  for (const [key, v] of Object.entries(manifest)) {
    for (const f of [v.src, v.poster]) {
      if (!existsSync(join(root, 'assets', f))) {
        throw new Error(`video "${key}": missing asset assets/${f} (run npm run fetch-assets and npm run posters)`);
      }
    }
  }
  const logoSvg = readFileSync(join(root, 'assets/img/logo-lang.svg'), 'utf8');
  const markSvg = readFileSync(join(root, 'assets/img/logo-kurz.svg'), 'utf8');

  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, 'kit'), { recursive: true });
  cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true, filter: (src) => !src.endsWith('sources.json') });
  cpSync(join(root, 'kit/base.css'), join(out, 'kit/base.css'));
  cpSync(join(root, 'kit/base.js'), join(out, 'kit/base.js'));

  let pages = 0;
  demos.forEach((demo, i) => {
    const C = resolveVariants(demo, registry);
    mkdirSync(join(out, demo.id), { recursive: true });
    cpSync(join(demo.dir, 'theme.css'), join(out, demo.id, 'theme.css'));
    for (const lang of LANGS) {
      const t = content[lang];
      const logo = { lang: inlineLogo(logoSvg, t.meta.siteName), mark: inlineLogo(markSvg, t.meta.siteName) };
      mkdirSync(join(out, demo.id, lang), { recursive: true });
      for (const page of Object.keys(slugs[lang])) {
        const ctx = {
          lang, t, demo, page,
          paths: makePaths({ lang, page, slugs }),
          video: manifest[demo.video],
          demoIndex: i + 1,
          demoCount: demos.length,
          logo,
        };
        writeFileSync(join(out, demo.id, lang, slugs[lang][page]), renderPage(ctx, C));
        pages++;
      }
    }
  });

  const thumbExists = (id) => existsSync(join(root, 'assets/thumbs', `${id}.jpg`));
  writeFileSync(join(out, 'index.html'), renderGallery({ demos, slugs, thumbExists, manifest, credits }));
  writeFileSync(join(out, '.nojekyll'), '');
  return { demos: demos.length, pages };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const t0 = Date.now();
  const r = build();
  console.log(`Built ${r.demos} demos, ${r.pages} pages in ${Date.now() - t0} ms -> dist/`);
}
