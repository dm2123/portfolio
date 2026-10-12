// Dinesh Singh Portfolio — editorial interactions (GSAP-enhanced, graceful no-JS/no-CDN fallback)
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';

  /* ---------- INTRO SPLASH ---------- */
  var intro = document.getElementById('intro');
  var introDone = false;
  function dismissIntro() {
    if (introDone || !intro) return;
    introDone = true;
    intro.classList.add('done');
    document.body.style.overflow = '';
    setTimeout(function () { intro.style.display = 'none'; }, 700);
  }
  if (intro) {
    document.body.style.overflow = 'hidden';
    if (!reduced) {
      setTimeout(dismissIntro, 3200); // auto after letter reveal
    } else {
      dismissIntro();
    }
    var skip = document.getElementById('introSkip');
    if (skip) skip.addEventListener('click', dismissIntro);
    var cta = document.getElementById('introCta');
    if (cta) cta.addEventListener('click', dismissIntro);
    intro.addEventListener('click', function (e) {
      if (e.target === intro) dismissIntro();
    });
  }

  /* ---------- MOBILE NAV ---------- */
  var burger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- ACTIVE NAV LINK ---------- */
  var sections = ['about', 'skills', 'work', 'certs', 'contact'];
  var navAnchors = {};
  sections.forEach(function (id) {
    var a = document.querySelector('.nav-links a[href="#' + id + '"]');
    if (a) navAnchors[id] = a;
  });
  function setActive(id) {
    Object.keys(navAnchors).forEach(function (k) {
      navAnchors[k].classList.toggle('active', k === id);
    });
  }
  if ('IntersectionObserver' in window && !reduced) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(en.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) navObs.observe(el);
    });
  }

  /* ---------- ANIMATED COUNTERS ---------- */
  function animateCounters() {
    var nums = document.querySelectorAll('.stat-n[data-count]');
    nums.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduced || !('IntersectionObserver' in window)) {
        el.textContent = target + suffix;
        return;
      }
      var done = false;
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !done) {
            done = true;
            var start = null;
            function step(ts) {
              if (!start) start = ts;
              var p = Math.min((ts - start) / 1200, 1);
              el.textContent = Math.round(target * p) + suffix;
              if (p < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
            obs.disconnect();
          }
        });
      }, { threshold: 0.5 });
      obs.observe(el);
    });
  }

  /* ---------- SKILL BARS ---------- */
  function animateBars() {
    var fills = document.querySelectorAll('.fill[data-w]');
    fills.forEach(function (f) { f.style.width = '0'; });
    if (reduced || !('IntersectionObserver' in window)) {
      fills.forEach(function (f) { f.style.width = f.getAttribute('data-w') + '%'; });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.width = en.target.getAttribute('data-w') + '%';
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    fills.forEach(function (f) { obs.observe(f); });
  }

  /* ---------- GSAP SCROLL REVEALS (progressive enhancement) ---------- */
  function gsapReveals() {
    if (!hasGsap || reduced) return;
    if (typeof window.ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    // Hero entrance
    gsap.from('.ht-red', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.15 });
    gsap.from('.ht-black', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.3 });
    gsap.from('.hero-sub, .hero-cta, .hero-stats', { y: 34, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.45 });
    gsap.from('.hero-photo', { x: 70, opacity: 0, duration: 1.1, ease: 'power3.out', delay: 0.55 });
    // Section reveals
    var targets = document.querySelectorAll('.sec-title, .sec-sub, .about-text, .about-card, .skill-card, .work-card, .cert-card, .contact-grid > *');
    targets.forEach(function (el) {
      gsap.from(el, {
        y: 44, opacity: 0, duration: 0.85, ease: 'power2.out',
        scrollTrigger: (typeof window.ScrollTrigger !== 'undefined') ? { trigger: el, start: 'top 88%' } : undefined
      });
    });
  }

  /* ---------- CONTACT FORM (mailto) ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var msg = form.message.value.trim();
      var subject = encodeURIComponent('Portfolio enquiry from ' + name);
      var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + msg);
      window.location.href = 'mailto:dm7178072@gmail.com?subject=' + subject + '&body=' + body;
    });
  }

  animateCounters();
  animateBars();
  if (document.readyState === 'complete') {
    gsapReveals();
  } else {
    window.addEventListener('load', gsapReveals);
  }
})();
