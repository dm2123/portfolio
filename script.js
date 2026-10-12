// Dinesh Singh Portfolio — cinematic interactions (vanilla JS, no dependencies)
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Intro: click to skip, remove from DOM after it plays ---- */
  var intro = document.getElementById('intro');
  if (intro) {
    if (reduced) { intro.remove(); }
    else {
      intro.addEventListener('click', function () { intro.remove(); });
      setTimeout(function () { if (intro.parentNode) intro.remove(); }, 3200);
    }
  }

  /* ---- Nav: shadow + hide on scroll down + mobile menu ---- */
  var nav = document.getElementById('nav');
  var lastY = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    if (y > 400 && y > lastY + 4) nav.classList.add('hide');
    else if (y < lastY - 4 || y < 400) nav.classList.remove('hide');
    lastY = y;
  }, { passive: true });

  var burger = document.getElementById('hamburger');
  var links = document.getElementById('navLinks');
  burger.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    burger.textContent = open ? '✕' : '☰';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      burger.textContent = '☰';
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---- Scroll reveal (staggered via --rd) ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Skill bars fill when visible ---- */
  var fills = document.querySelectorAll('.fill[data-w]');
  function fillBars() {
    fills.forEach(function (f) { f.style.width = f.getAttribute('data-w') + '%'; });
  }
  var skillsSec = document.getElementById('skills');
  if ('IntersectionObserver' in window && !reduced && skillsSec) {
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { fillBars(); bio.disconnect(); }
      });
    }, { threshold: 0.25 });
    bio.observe(skillsSec);
  } else { fillBars(); }

  /* ---- Animated stat counters ---- */
  var counters = document.querySelectorAll('.stat-n[data-count]');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduced) { el.textContent = target + suffix; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var statsBox = document.querySelector('.hero-stats');
  if (statsBox && 'IntersectionObserver' in window && !reduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          counters.forEach(animateCount);
          cio.disconnect();
        }
      });
    }, { threshold: 0.4 });
    cio.observe(statsBox);
  } else {
    counters.forEach(function (el) {
      el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
    });
  }

  /* ---- Active nav link highlight ---- */
  var navMap = {};
  document.querySelectorAll('.nav-links a[data-nav]').forEach(function (a) {
    navMap[a.getAttribute('data-nav')] = a;
  });
  var sections = document.querySelectorAll('section[id], header[id]');
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && navMap[e.target.id]) {
          Object.keys(navMap).forEach(function (k) { navMap[k].classList.remove('active'); });
          navMap[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { nio.observe(s); });
  }

  /* ---- Contact form -> opens visitor's email app (no backend needed) ---- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var msg = form.message.value.trim();
      var subject = encodeURIComponent('Portfolio enquiry from ' + name);
      var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + msg);
      window.location.href = 'mailto:dm7178072@gmail.com?subject=' + subject + '&body=' + body;
    });
  }
})();
