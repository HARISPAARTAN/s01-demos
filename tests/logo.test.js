import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inlineLogo } from '../kit/logo.js';

const sample = `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" id="Ebene_1" viewBox="0 0 250 100"><defs><style>.st0 { fill: #555a5f; }</style></defs><path class="st0" d="M1 1h2"/></svg>`;

test('inlineLogo strips defs, classes and id and uses currentColor', () => {
  const out = inlineLogo(sample, 'S01 "Projektmanagement"');
  assert.ok(!out.includes('<defs>'));
  assert.ok(!out.includes('class="st0"'));
  assert.ok(!out.includes('id="Ebene_1"'));
  assert.ok(!out.includes('<?xml'));
  assert.ok(out.startsWith('<svg role="img" aria-label="S01 &quot;Projektmanagement&quot;" fill="currentColor" focusable="false" xmlns='));
  assert.ok(out.includes('<path d="M1 1h2"/>'));
  assert.ok(out.includes('viewBox="0 0 250 100"'));
});
