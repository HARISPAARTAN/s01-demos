export const LANGS = ['de', 'en'];

export function otherLang(lang) {
  return lang === 'de' ? 'en' : 'de';
}

export function makePaths({ lang, page, slugs }) {
  if (!slugs[lang]) throw new Error(`Unknown language "${lang}"`);
  if (!slugs[lang][page]) throw new Error(`Unknown page "${page}"`);
  const other = otherLang(lang);
  return {
    lang,
    other,
    page,
    toPage(key, hash = '') {
      if (!slugs[lang][key]) throw new Error(`Unknown page "${key}"`);
      return slugs[lang][key] + (hash ? `#${hash}` : '');
    },
    otherLang: () => `../${other}/${slugs[other][page]}`,
    asset: (p) => `../../assets/${p}`,
    kit: (p) => `../../kit/${p}`,
    theme: () => '../theme.css',
    gallery: () => '../../index.html',
  };
}
