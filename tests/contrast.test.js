import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hexToRgb, luminance, contrast, cssTokens } from '../build/contrast.js';

test('hexToRgb handles 6 and 3 digit hex', () => {
  assert.deepEqual(hexToRgb('#1863dc'), [24, 99, 220]);
  assert.deepEqual(hexToRgb('#fff'), [255, 255, 255]);
});

test('luminance of black and white', () => {
  assert.equal(luminance('#000000'), 0);
  assert.equal(Math.round(luminance('#ffffff') * 1000) / 1000, 1);
});

test('contrast ratios match WCAG reference values', () => {
  assert.equal(contrast('#000000', '#ffffff'), 21);
  assert.equal(contrast('#ffffff', '#000000'), 21);
  assert.equal(Math.round(contrast('#212121', '#ffffff') * 100) / 100, 16.1);
  assert.equal(Math.round(contrast('#ffffff', '#1863dc') * 100) / 100, 5.44);
});

test('cssTokens extracts first hex value per custom property', () => {
  const css = `:root { --bg: #ffffff; --fg:#212121 ; --accent: #1863dc; --radius: 8px; }\n.x { --bg: #000000; }`;
  assert.deepEqual(cssTokens(css), { bg: '#ffffff', fg: '#212121', accent: '#1863dc' });
});
