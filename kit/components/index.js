import { nav } from './nav.js';
import { hero } from './hero.js';
import { services } from './services.js';
import { feature } from './feature.js';
import { projects } from './projects.js';
import { faq } from './faq.js';
import { footer } from './footer.js';
import { contact } from './contact.js';

export const registry = { nav, hero, services, feature, projects, faq, footer, contact };

export function resolveVariants(demo, reg = registry) {
  const out = {};
  for (const key of Object.keys(reg)) {
    const name = demo.variants[key];
    const fn = Object.hasOwn(reg[key], name) ? reg[key][name] : undefined;
    if (!fn) {
      throw new Error(`demos/${demo.id}: unknown ${key} variant "${name}". Valid: ${Object.keys(reg[key]).join(', ')}`);
    }
    out[key] = fn;
  }
  return out;
}
