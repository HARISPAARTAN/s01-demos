import { esc, paragraphs, list } from '../html.js';
import { pageHero } from './sections.js';
import { pageImages } from '../images.js';

function job(j) {
  const parts = [`<p class="eyebrow">${esc(j.location)}</p><h3>${esc(j.title)}</h3>${paragraphs(j.about)}`];
  if (j.tasks) parts.push(`<h4>${esc(j.tasksTitle)}</h4>${list(j.tasks, 'checks')}`);
  if (j.profile) parts.push(`<h4>${esc(j.profileTitle)}</h4>${list(j.profile, 'checks')}`);
  if (j.benefits) parts.push(`<h4>${esc(j.benefitsTitle)}</h4>${list(j.benefits, 'checks')}`);
  parts.push(`<div class="job-actions"><a class="btn btn-primary" href="${esc(j.apply.href)}">${esc(j.apply.label)}</a>${j.pdf ? `<a class="btn btn-ghost" href="${esc(j.pdf.href)}">${esc(j.pdf.label)}</a>` : ''}</div>`);
  return `<article class="card job">${parts.join('')}</article>`;
}

export function careers(ctx, faqVariant) {
  const c = ctx.t.pages.careers;
  const mail = ctx.t.meta.company.recruitingEmail;
  return `${pageHero(ctx, c.hero, pageImages.careers)}
<section class="section careers-intro"><div class="container narrow"><p class="eyebrow">${esc(c.intro.eyebrow)}</p><h2 class="statement">${esc(c.intro.title)}</h2></div></section>
<section id="jobs" class="section jobs"><div class="container"><header class="section-head"><h2>${esc(c.jobs.title)}</h2><p>${esc(c.jobs.text)} <a href="mailto:${esc(mail)}">${esc(mail)}</a>.</p></header><div class="grid grid-2">${c.jobs.items.map(job).join('')}</div></div></section>
<section class="section why"><div class="container narrow"><p class="eyebrow">${esc(c.why.eyebrow)}</p><h2>${esc(c.why.title)}</h2>${paragraphs(c.why.text)}</div></section>
<section class="section culture"><div class="container"><header class="section-head"><p class="eyebrow">${esc(c.culture.eyebrow)}</p><h2>${esc(c.culture.title)}</h2></header><div class="grid grid-4">${c.culture.items.map((it) => `<div class="pillar"><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></div>`).join('')}</div></div></section>
<section class="section benefits"><div class="container"><header class="section-head"><p class="eyebrow">${esc(c.benefits.eyebrow)}</p><h2>${esc(c.benefits.title)}</h2></header>${list(c.benefits.items, 'checks grid-list')}</div></section>
<section class="section process"><div class="container"><header class="section-head"><p class="eyebrow">${esc(c.process.eyebrow)}</p><h2>${esc(c.process.title)}</h2></header><ol class="steps">${c.process.items.map((s, i) => `<li class="step"><span class="num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}</ol></div></section>
${faqVariant(ctx, c.faq)}
<section class="section apply"><div class="container narrow"><h2>${esc(c.apply.title)}</h2><p>${esc(c.apply.text)}</p><a class="btn btn-primary" href="mailto:${esc(mail)}">${esc(mail)}</a></div></section>`;
}
