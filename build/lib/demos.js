import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const VARIANT_KEYS = ['nav', 'hero', 'services', 'feature', 'projects', 'faq', 'footer', 'contact'];

export function validateDemo(demo, folder, registry, videoKeys) {
  const where = `demos/${folder}`;
  if (!demo || typeof demo !== 'object' || Array.isArray(demo)) throw new Error(`${where}/demo.json: must be a JSON object`);
  if (demo.id !== folder) throw new Error(`${where}/demo.json: id "${demo.id}" must equal folder name "${folder}"`);
  if (!/^\d\d-[a-z0-9-]+$/.test(demo.id)) throw new Error(`${where}/demo.json: id must look like NN-slug (digits, dash, lowercase letters, digits and dashes)`);
  if (typeof demo.name !== 'string' || !demo.name) throw new Error(`${where}: name missing`);
  if (!demo.description || typeof demo.description.de !== 'string') throw new Error(`${where}: description.de missing`);
  if (!demo.description || typeof demo.description.en !== 'string') throw new Error(`${where}: description.en missing`);
  if (!['light', 'dark'].includes(demo.scheme)) throw new Error(`${where}: scheme must be "light" or "dark"`);
  if (!/^#[0-9a-fA-F]{6}$/.test(demo.accent || '')) throw new Error(`${where}: accent must be a 6-digit hex color`);
  if (!Array.isArray(demo.fonts)) throw new Error(`${where}: fonts must be an array of Google Fonts family specs`);
  if (!demo.variants) throw new Error(`${where}: variants missing`);
  for (const key of VARIANT_KEYS) {
    const name = demo.variants[key];
    const valid = Object.keys(registry[key] || {});
    if (!name || !valid.includes(name)) {
      throw new Error(`${where}: unknown ${key} variant "${name}". Valid: ${valid.join(', ')}`);
    }
  }
  if (!videoKeys.includes(demo.video)) {
    throw new Error(`${where}: unknown video "${demo.video}". Valid: ${videoKeys.join(', ')}`);
  }
}

export function loadDemos(root, registry, videoKeys) {
  const dir = join(root, 'demos');
  const folders = readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  return folders.map((folder) => {
    const file = join(dir, folder, 'demo.json');
    if (!existsSync(file)) throw new Error(`demos/${folder}: demo.json missing`);
    let demo;
    try {
      demo = JSON.parse(readFileSync(file, 'utf8'));
    } catch (err) {
      throw new Error(`demos/${folder}/demo.json: invalid JSON (${err.message})`);
    }
    validateDemo(demo, folder, registry, videoKeys);
    if (!existsSync(join(dir, folder, 'theme.css'))) throw new Error(`demos/${folder}: theme.css missing`);
    demo.dir = join(dir, folder);
    return demo;
  });
}
