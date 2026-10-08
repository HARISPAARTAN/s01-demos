import { esc, paragraphs } from '../html.js';
import { pageHero } from './sections.js';

export function legal(ctx, data) {
  const notice = data.notice ? `<p class="notice">${esc(data.notice)}</p>` : '';
  const blocks = data.blocks
    .map((b) => {
      const lines = b.lines && b.lines.length ? `<p>${b.lines.map(esc).join('<br>')}</p>` : '';
      const text = b.text ? paragraphs(b.text) : '';
      return `<h2>${esc(b.title)}</h2>${lines}${text}`;
    })
    .join('');
  return `${pageHero(ctx, data.hero)}
<section class="section legal"><div class="container narrow">${notice}${blocks}</div></section>`;
}
