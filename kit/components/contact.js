import { esc } from '../html.js';

function info(ctx) {
  const c = ctx.t.pages.contact;
  const u = ctx.t.meta.ui;
  const co = ctx.t.meta.company;
  return `<div class="contact-info">
<div class="contact-block"><p class="eyebrow">${esc(u.emailLabel)}</p><a class="contact-value" href="mailto:${esc(c.email.value)}">${esc(c.email.value)}</a><p>${esc(c.email.text)}</p></div>
<div class="contact-block"><p class="eyebrow">${esc(u.phoneLabel)}</p><a class="contact-value" href="tel:${esc(c.phone.href)}">${esc(c.phone.value)}</a><p>${esc(c.phone.text)}</p></div>
<div class="contact-block"><p class="eyebrow">${esc(u.addressLabel)}</p><address>${esc(ctx.t.meta.legalName)}<br>${esc(co.street)}<br>${esc(co.city)}</address></div>
</div>`;
}

function form(ctx) {
  const f = ctx.t.pages.contact.form;
  return `<form class="form" data-demo-form>
<h2>${esc(f.title)}</h2>
<div class="form-grid">
<label><span>${esc(f.name)}</span><input type="text" name="name" required autocomplete="name"></label>
<label><span>${esc(f.company)}</span><input type="text" name="company" autocomplete="organization"></label>
<label><span>${esc(f.email)}</span><input type="email" name="email" required autocomplete="email"></label>
<label><span>${esc(f.phone)}</span><input type="tel" name="phone" autocomplete="tel"></label>
</div>
<label><span>${esc(f.message)}</span><textarea name="message" rows="6" required></textarea></label>
<label class="check"><input type="checkbox" name="consent" required><span>${esc(f.consent)} <a href="${ctx.paths.toPage('privacy')}">${esc(f.consentLink)}</a></span></label>
<button class="btn btn-primary" type="submit">${esc(f.submit)}</button>
<p class="form-success" data-form-success hidden role="status">${esc(f.success)}</p>
<p class="form-note">${esc(f.demoNote)}</p>
</form>`;
}

function wrap(cls, inner) {
  return `<section id="contact" class="section contact ${cls}"><div class="container">${inner}</div></section>`;
}

export const contact = {
  split: (ctx) => wrap('contact-split', `<div class="contact-grid">${info(ctx)}${form(ctx)}</div>`),
  centered: (ctx) => wrap('contact-centered', `<div class="narrow">${info(ctx)}${form(ctx)}</div>`),
};
