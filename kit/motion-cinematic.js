(function () {
  'use strict';
  // Cinematic motion for demos with "motion": "cinematic". Runs only when the head script set html.js-motion
  // (no reduced-motion preference). Everything here is additive: without it the page is the refined version.
  var doc = document;
  var html = doc.documentElement;
  if (!html.classList.contains('js-motion')) return;

  // 1. Inertia scrolling (Lenis, kit/vendor). Native scroll position is still the source of truth, so
  //    IntersectionObserver, sticky elements and anchors keep working. Paused while the phone menu is open.
  if (typeof window.Lenis === 'function') {
    var navH = parseFloat(getComputedStyle(html).getPropertyValue('--nav-h')) || 72;
    var lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, autoRaf: true, anchors: { offset: -(navH + 16) } });
    var burger = doc.querySelector('.nav-burger');
    if (burger && 'MutationObserver' in window) {
      new MutationObserver(function () {
        if (burger.getAttribute('aria-expanded') === 'true') lenis.stop(); else lenis.start();
      }).observe(burger, { attributes: true, attributeFilter: ['aria-expanded'] });
    }
  }

  // 2. Word-by-word headline reveals (768px and up: narrower screens need hyphenation inside long words).
  if (window.matchMedia('(min-width: 768px)').matches) {
    var splitIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        splitIo.unobserve(en.target);
      });
    }, { threshold: 0.2 });
    doc.querySelectorAll('main .hero-title, main h2').forEach(function (h) {
      if (h.children.length) return;
      var text = h.textContent.trim();
      var words = text.split(/\s+/);
      if (!text || words.some(function (w) { return w.length > 22; })) return;
      h.setAttribute('aria-label', text);
      h.textContent = '';
      words.forEach(function (w, i) {
        var outer = doc.createElement('span');
        outer.className = 'w';
        var inner = doc.createElement('span');
        inner.className = 'wi';
        inner.style.setProperty('--wi', String(Math.min(i, 24)));
        inner.textContent = w;
        outer.appendChild(inner);
        h.appendChild(outer);
        if (i < words.length - 1) h.appendChild(doc.createTextNode(' '));
      });
      h.classList.add('split');
      if (h.closest('.hero')) {
        requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('is-visible'); }); });
      } else {
        splitIo.observe(h);
      }
    });
  }

  // 3. Hero stage: --p is the scroll progress through the 200svh hero (0 = top, 1 = stage released).
  var stage = doc.querySelector('.hero-apple');
  if (stage) {
    var pending = false;
    var update = function () {
      pending = false;
      var r = stage.getBoundingClientRect();
      var range = r.height - window.innerHeight;
      var p = range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;
      stage.style.setProperty('--p', p.toFixed(4));
      stage.classList.toggle('stage-late', p > 0.4);
    };
    var schedule = function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
  }
})();
