import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function keyPaths(value, prefix = '') {
  if (Array.isArray(value)) {
    return value.flatMap((v, i) => keyPaths(v, `${prefix}[${i}]`));
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).flatMap((k) => keyPaths(value[k], prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

export function parityErrors(a, b) {
  const pa = new Set(keyPaths(a));
  const pb = new Set(keyPaths(b));
  const errors = [];
  for (const k of pa) if (!pb.has(k)) errors.push(`missing in en: ${k}`);
  for (const k of pb) if (!pa.has(k)) errors.push(`missing in de: ${k}`);
  return errors;
}

export function loadContent(root) {
  const de = loadJson(join(root, 'content/site.de.json'));
  const en = loadJson(join(root, 'content/site.en.json'));
  const slugs = loadJson(join(root, 'content/slugs.json'));
  const errors = parityErrors(de, en);
  if (errors.length) {
    throw new Error(`Content parity failed (${errors.length}):\n${errors.join('\n')}`);
  }
  return { de, en, slugs };
}
