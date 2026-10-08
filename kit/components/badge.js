import { esc } from '../html.js';

export function badge(ctx) {
  const u = ctx.t.meta.ui;
  const n = String(ctx.demoIndex).padStart(2, '0');
  return `<div class="demo-badge-wrap" data-badge>
<a class="demo-badge" href="${ctx.paths.gallery()}">${esc(u.demo)} ${n}/${ctx.demoCount} · ${esc(u.allDemos)}</a>
<button class="demo-badge-close" type="button" aria-label="${esc(u.close)}">&times;</button>
</div>`;
}
