export function hexToRgb(hex) {
  let h = String(hex).trim().replace(/^#/, '');
  if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(h)) throw new Error(`Invalid hex color "${hex}"`);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function cssTokens(css) {
  const out = {};
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*(?=[;!}])/g)) {
    if (!Object.hasOwn(out, m[1])) out[m[1]] = m[2].toLowerCase();
  }
  return out;
}
