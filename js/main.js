/* Interactions: smooth scroll, reveals, counters, cursor, tilt, nav */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Smooth scroll (Lenis) ---------- */
  var lenis = null;
  try {
    if (!reduceMotion && typeof Lenis !== 'undefined') {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      if (typeof gsap !== 'undefined') {
        lenis.on('scroll', function () {
          if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.update();
        });
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      } else {
        (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
      }
    }
  } catch (e) { lenis = null; }

  // Anchor links via Lenis (or native fallback)
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(el, { offset: -70 });
      else el.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Nav ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var links = document.querySelector('.nav-links');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function closeMenu() { toggle.classList.remove('open'); links.classList.remove('open'); }
  toggle.addEventListener('click', function () {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });

  // Active section highlight
  var sections = ['about', 'experience', 'projects', 'skills', 'contact'].map(function (id) {
    return document.getElementById(id);
  }).filter(Boolean);
  var navAs = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navAs.forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  function revealFallback() {
    document.querySelectorAll('[data-reveal]').forEach(function (el) { el.style.opacity = 1; });
  }
  try {
    if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      revealFallback();
    } else {
      gsap.registerPlugin(ScrollTrigger);
      gsap.utils.toArray('[data-reveal]').forEach(function (el, i) {
        gsap.fromTo(el,
          { opacity: 0, y: 36 },
          {
            opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
            delay: Math.min((i % 4) * 0.07, 0.28),
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
          });
      });
      // Hero entrance: gentle stagger on load
      gsap.fromTo('.hero [data-reveal]',
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, duration: 1.05, ease: 'power3.out', stagger: 0.12, delay: 0.15,
          scrollTrigger: { trigger: '.hero', start: 'top 90%', once: true } });
    }
  } catch (e) { revealFallback(); }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1600, start = null;
    if (reduceMotion) { el.textContent = target + suffix; return; }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counted = new WeakSet();
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !counted.has(en.target)) {
          counted.add(en.target);
          animateCount(en.target);
          cio.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });
  } else {
    document.querySelectorAll('[data-count]').forEach(animateCount);
  }

  /* ---------- Custom cursor ---------- */
  var dot = document.querySelector('.cursor-dot');
  var ring = document.querySelector('.cursor-ring');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    var cx = -100, cy = -100, rx = -100, ry = -100;
    window.addEventListener('pointermove', function (e) {
      cx = e.clientX; cy = e.clientY;
      dot.style.left = cx + 'px'; dot.style.top = cy + 'px';
    }, { passive: true });
    (function follow() {
      rx += (cx - rx) * 0.16; ry += (cy - ry) * 0.16;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(follow);
    })();
    document.querySelectorAll('a, button, .project-card').forEach(function (el) {
      el.addEventListener('pointerenter', function () { ring.classList.add('grow'); });
      el.addEventListener('pointerleave', function () { ring.classList.remove('grow'); });
    });
  } else {
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
  }

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + x * 0.18 + 'px,' + y * 0.22 + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- Project card spotlight ---------- */
  document.querySelectorAll('.project-card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Theme switcher ---------- */
  var THEMES = { nebula: 'Nebula', terminal: 'Terminal', dashboard: 'Dashboard', blueprint: 'Blueprint', light: 'Light' };
  var THEME_KEY = 'os-portfolio-theme';
  var switcher = document.getElementById('themeSwitcher');
  var themeBtn = document.getElementById('themeBtn');
  var themeName = document.getElementById('themeName');
  function setTheme(name) {
    if (!THEMES[name]) name = 'terminal';
    document.documentElement.dataset.theme = name;
    try { localStorage.setItem(THEME_KEY, name); } catch (e) {}
    if (themeName) themeName.textContent = THEMES[name];
    document.querySelectorAll('#themeMenu [data-set-theme]').forEach(function (b) {
      var on = b.getAttribute('data-set-theme') === name;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    if (typeof window.__setHeroTheme === 'function') window.__setHeroTheme(name);
  }
  if (switcher && themeBtn) {
    themeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = switcher.classList.toggle('open');
      themeBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('#themeMenu [data-set-theme]').forEach(function (b) {
      b.addEventListener('click', function () {
        setTheme(b.getAttribute('data-set-theme'));
        switcher.classList.remove('open');
        themeBtn.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', function (e) {
      if (!switcher.contains(e.target)) {
        switcher.classList.remove('open');
        themeBtn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        switcher.classList.remove('open');
        themeBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
  setTheme(document.documentElement.dataset.theme || 'terminal');

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
