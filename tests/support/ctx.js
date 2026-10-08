import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { makePaths } from '../../kit/paths.js';
import { inlineLogo } from '../../kit/logo.js';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const content = {
  de: JSON.parse(readFileSync(join(root, 'content/site.de.json'), 'utf8')),
  en: JSON.parse(readFileSync(join(root, 'content/site.en.json'), 'utf8')),
};
export const slugs = JSON.parse(readFileSync(join(root, 'content/slugs.json'), 'utf8'));
export const manifest = JSON.parse(readFileSync(join(root, 'assets/video/manifest.json'), 'utf8'));

const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 100"><path d="M1 1h2"/></svg>';

export const demoFixture = {
  id: '01-original', order: 1, name: 'Original', description: { de: 'Beschreibung', en: 'Description' },
  scheme: 'light', accent: '#1863dc', fonts: ['Manrope:wght@400;700'],
  variants: { nav: 'solid', hero: 'centered', services: 'grid', feature: 'columns', projects: 'cards', faq: 'accordion', footer: 'columns', contact: 'split' },
  video: 'trailer',
};

export function makeCtx({ lang = 'de', page = 'home', demo = demoFixture } = {}) {
  const t = content[lang];
  return {
    lang, t, demo, page,
    paths: makePaths({ lang, page, slugs }),
    video: manifest[demo.video],
    demoIndex: 1,
    demoCount: 24,
    logo: { lang: inlineLogo(logoSvg, t.meta.siteName), mark: inlineLogo(logoSvg, t.meta.siteName) },
  };
}

export function count(html, re) {
  return (html.match(re) || []).length;
}
