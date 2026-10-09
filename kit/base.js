(function () {
  'use strict';
  var doc = document;

  // Demo contact form: the submit button is enabled only when this script runs,
  // so a browser without JS can never submit; on submit validate, then show the
  // demo confirmation and move focus to it. Nothing is sent anywhere.
  doc.querySelectorAll('[data-demo-form]').forEach(function (form) {
    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = false;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var ok = form.querySelector('[data-form-success]');
      if (btn) btn.disabled = true;
      if (ok) {
        ok.hidden = false;
        ok.tabIndex = -1;
        ok.focus();
      }
    });
  });

  // Mobile / overlay menu
  var burger = doc.querySelector('.nav-burger');
  var menu = doc.getElementById('site-menu');
  if (burger && menu) {
    var setOpen = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      doc.body.classList.toggle('menu-open', open);
    };
    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || burger.getAttribute('aria-expanded') !== 'true') return;
      setOpen(false);
      burger.focus();
    });
    var desktop = window.matchMedia('(min-width: 1024px)');
    var onDesktopChange = function (e) { if (e.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onDesktopChange);
    else if (desktop.addListener) desktop.addListener(onDesktopChange);
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  }

  // Header state after scrolling (transparent / hamburger variants)
  var header = doc.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Accordions
  doc.querySelectorAll('.acc-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = doc.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.hidden = open;
    });
  });

  // Deep links into an accordion row (e.g. services.html#risk) open that row
  var openHashTarget = function () {
    if (!location.hash) return;
    var target = doc.getElementById(location.hash.slice(1));
    if (!target) return;
    if (!target.classList.contains('acc')) return;
    var trigger = target.querySelector('.acc-trigger');
    if (trigger && trigger.getAttribute('aria-expanded') !== 'true') trigger.click();
  };
  openHashTarget();
  window.addEventListener('hashchange', openHashTarget);

  // Tabs
  doc.querySelectorAll('[data-tabs]').forEach(function (tabs) {
    var list = Array.prototype.slice.call(tabs.querySelectorAll('[role="tab"]'));
    var select = function (tab, focus) {
      list.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var p = doc.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
    };
    list.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') select(list[(i + 1) % list.length], true);
        if (e.key === 'ArrowLeft') select(list[(i - 1 + list.length) % list.length], true);
      });
    });
  });

  // Hero video: reduced motion, data saver, autoplay failure, file failure
  var video = doc.querySelector('[data-video]');
  var play = doc.querySelector('[data-video-play]');
  if (video) {
    var markFailed = function () {
      var media = video.closest('.hero-media');
      if (media) media.classList.add('video-failed');
      if (play) play.hidden = true;
    };
    var showPlay = function () {
      if (!play) return;
      play.hidden = false;
      play.addEventListener('click', function () {
        var attempt = video.play();
        if (attempt && typeof attempt.then === 'function') {
          attempt.then(function () { play.hidden = true; }).catch(function () { /* keep the button so the visitor can try again */ });
        } else {
          play.hidden = true;
        }
      });
    };
    video.addEventListener('error', markFailed, true);
    var checkFailed = function () { if (video.error || video.networkState === 3) markFailed(); };
    if (doc.readyState === 'complete') checkFailed(); else window.addEventListener('load', checkFailed);
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var save = navigator.connection && navigator.connection.saveData;
    if (reduce || save) {
      video.removeAttribute('autoplay');
      video.pause();
      showPlay();
    } else {
      var p = video.play();
      if (p && typeof p.catch === 'function') p.catch(showPlay);
    }
  }

  // Demo badge
  var badge = doc.querySelector('[data-badge]');
  if (badge) {
    var KEY = 's01DemoBadgeHidden';
    try { if (sessionStorage.getItem(KEY) === '1') badge.hidden = true; } catch (err) { /* storage blocked */ }
    var close = badge.querySelector('.demo-badge-close');
    if (close) {
      close.addEventListener('click', function () {
        badge.hidden = true;
        try { sessionStorage.setItem(KEY, '1'); } catch (err) { /* storage blocked */ }
      });
    }
  }

  // Snap dots active state
  var dots = doc.querySelectorAll('.snap-dots a');
  if (dots.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        dots.forEach(function (d) {
          d.classList.toggle('is-active', d.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
    dots.forEach(function (d) {
      var s = doc.getElementById((d.getAttribute('href') || '').slice(1));
      if (s) io.observe(s);
    });
  }
})();
