// Dinesh Singh Portfolio — editorial interactions (GSAP-enhanced, graceful no-JS/no-CDN fallback)
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var parallaxReady = false;

  /* ---------- TYPEWRITER ---------- */
  function typeText(el, text, speed, done) {
    if (!el) { if (done) done(); return; }
    if (reduced) { el.textContent = text; if (done) done(); return; }
    var i = 0;
    el.textContent = '';
    (function tick() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i++);
        setTimeout(tick, speed);
      } else if (done) {
        done();
      }
    })();
  }

  var heroTermStarted = false;
  function startHeroTerm() {
    if (heroTermStarted) return;
    heroTermStarted = true;
    var el = document.getElementById('heroTyped');
    var res = document.getElementById('heroResult');
    if (reduced) {
      if (el) el.textContent = 'cat focus.txt';
      if (res) res.classList.add('show');
      return;
    }
    setTimeout(function () {
      typeText(el, 'cat focus.txt', 55, function () {
        if (res) res.classList.add('show');
      });
    }, 350);
  }

  /* ---------- INTRO BOOT SEQUENCE ---------- */
  var bootLines = ['projects loaded — 4', 'certifications verified — 6', 'defenses up'];
  function runBoot(i) {
    var boot = document.getElementById('introBoot');
    if (!boot || i >= bootLines.length) return;
    var line = document.createElement('span');
    line.className = 'boot-line';
    var ok = document.createElement('span');
    ok.className = 'ok';
    ok.textContent = '[OK]';
    var txt = document.createElement('span');
    line.appendChild(ok);
    line.appendChild(txt);
    boot.appendChild(line);
    typeText(txt, bootLines[i], 14, function () { runBoot(i + 1); });
  }
  function showBootInstant() {
    var boot = document.getElementById('introBoot');
    if (!boot) return;
    bootLines.forEach(function (t) {
      var line = document.createElement('span');
      line.className = 'boot-line';
      var ok = document.createElement('span');
      ok.className = 'ok';
      ok.textContent = '[OK]';
      line.appendChild(ok);
      line.appendChild(document.createTextNode(t));
      boot.appendChild(line);
    });
  }

  /* ---------- STATUS BAR ---------- */
  function initStatusBar() {
    var sb = document.getElementById('statusbar');
    if (!sb) return;
    sb.hidden = false;
    var clock = document.getElementById('sbClock');
    function tick() {
      if (!clock) return;
      var d = new Date();
      clock.textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }
    tick();
    setInterval(tick, 15000);
  }

  /* ---------- HERO ASSEMBLY (signature intro: parts ek-ek karke judte hain) ---------- */
  // Sirf JS se scattered states lagte hain taaki no-JS me content hamesha visible rahe.
  function assembleHeroDOM() {
    if (reduced) return; // reduced-motion: content turant dikhe, koi animation nahi
    function lockIn(el) {
      if (!el) return;
      el.classList.remove('asm-lock');
      void el.offsetWidth; // reflow: animation dobara trigger ho
      el.classList.add('asm-lock');
      setTimeout(function () { el.classList.remove('asm-lock'); }, 650);
    }
    if (!hasGsap) return; // GSAP CDN fail: content visible rehta hai, animation skip
    var parts = [
      { sel: '.nav', from: { y: -90, opacity: 0 }, d: 0 },
      { sel: '.ht-red', from: { x: -130, opacity: 0 }, d: 0.10 },
      { sel: '.ht-black', from: { x: 130, opacity: 0 }, d: 0.22 },
      { sel: '.hero-photo', from: { scale: 0.55, rotation: -8, opacity: 0 }, d: 0.30 },
      { sel: '.hero-sub', from: { y: 60, opacity: 0 }, d: 0.40 },
      { sel: '.term-line', from: { y: 40, opacity: 0 }, d: 0.52 },
      { sel: '.hero-cta', from: { y: 56, opacity: 0 }, d: 0.62 },
      { sel: '.hero-stats', from: { y: 44, opacity: 0 }, d: 0.72 }
    ];
    parts.forEach(function (p) {
      var el = document.querySelector(p.sel);
      if (!el) return;
      gsap.fromTo(el, p.from, {
        x: 0, y: 0, scale: 1, rotation: 0, opacity: 1,
        duration: 0.85, ease: 'power3.out', delay: p.d,
        onComplete: function () { lockIn(el); }
      });
    });
  }

  /* ---------- INTRO SPLASH ---------- */
  var intro = document.getElementById('intro');
  var introDone = false;
  function dismissIntro() {
    if (introDone || !intro) return;
    introDone = true;
    intro.classList.add('done');
    document.body.style.overflow = '';
    startHeroTerm();
    assembleHeroDOM(); // DOM parts ek-ek karke judte hain
    window.__heroAssembleNow = true;
    window.dispatchEvent(new Event('dinesh:assemble')); // 3D shapes assemble hon
    setTimeout(function () { intro.style.display = 'none'; }, 700);
    setTimeout(function () { parallaxReady = true; }, 1800); // let entrance animations settle first
  }
  if (intro) {
    document.body.style.overflow = 'hidden';
    var introTyped = document.getElementById('introTyped');
    var introResult = document.getElementById('introResult');
    if (!reduced) {
      setTimeout(function () {
        typeText(introTyped, 'whoami', 80, function () {
          if (introResult) introResult.classList.add('show');
          setTimeout(function () { runBoot(0); }, 280);
        });
      }, 1450);
      setTimeout(dismissIntro, 4600); // auto after letter reveal + verify + boot lines
    } else {
      if (introTyped) introTyped.textContent = 'whoami';
      if (introResult) introResult.classList.add('show');
      showBootInstant();
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
    var sbSec = document.getElementById('sbSection');
    if (sbSec) sbSec.textContent = '/' + id;
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
      fills.forEach(function (f) { f.style.width = f.getAttribute('data-w') + '%'; f.classList.add('lit'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.width = en.target.getAttribute('data-w') + '%';
          en.target.classList.add('lit');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    fills.forEach(function (f) { obs.observe(f); });
  }

  /* ---------- SKILL RADAR CHART ---------- */
  function animateRadar() {
    var svg = document.getElementById('skillRadar');
    if (!svg) return;
    // No animation: final state already in markup (works with no-JS too)
    if (reduced || !('IntersectionObserver' in window)) {
      svg.classList.add('radar-on');
      return;
    }
    svg.classList.add('radar-prep');
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          svg.classList.add('radar-on');
          obs.disconnect();
        }
      });
    }, { threshold: 0.35 });
    obs.observe(svg);
  }

  /* ---------- SPLIT-TEXT HEADING REVEAL (words, masked rise + stagger) ----------
     Sirf progressive enhancement: JS se word-spans lagte hain, no-JS / reduced-motion /
     GSAP-CDN-fail me markup hamesha original rehta hai — heading kabhi gayab nahi. */
  function splitTitleWords(el) {
    function splitNode(node) {
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(' '));
        } else {
          var w = document.createElement('span');
          w.className = 'st-w';
          var inner = document.createElement('span');
          inner.className = 'st-i';
          inner.textContent = part;
          w.appendChild(inner);
          frag.appendChild(w);
        }
      });
      return frag;
    }
    function walk(parent) {
      Array.prototype.slice.call(parent.childNodes).forEach(function (kid) {
        if (kid.nodeType === 3) {
          parent.replaceChild(splitNode(kid), kid);
        } else if (kid.nodeType === 1) {
          walk(kid); // <em> jaise inline elements: styling barkarar
        }
      });
    }
    walk(el);
    return el.querySelectorAll('.st-i');
  }
  function splitTextReveals() {
    if (typeof window.ScrollTrigger === 'undefined') return;
    document.querySelectorAll('.sec-title').forEach(function (el) {
      var words = splitTitleWords(el);
      if (!words.length) return;
      gsap.fromTo(words,
        { yPercent: 118 },
        {
          yPercent: 0, duration: 0.72, ease: 'power3.out', stagger: 0.065,
          scrollTrigger: { trigger: el, start: 'top 86%' }
        });
    });
  }

  /* ---------- GSAP SCROLL REVEALS (progressive enhancement) ---------- */
  function gsapReveals() {
    if (!hasGsap || reduced) return;
    if (typeof window.ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    // Section headings: split-text reveal (words mask karke ek-ek karke uthte hain)
    splitTextReveals();
    // NOTE: hero entrance yahan nahi — assembleHeroDOM() intro dismiss par chalata hai
    // (assembly: parts ek-ek karke judte hain, signature intro moment)
    // Section reveals
    var targets = document.querySelectorAll('.sec-sub, .about-text, .about-card, .radar-panel, .skill-card, .cert-card, .contact-grid > *');
    targets.forEach(function (el) {
      gsap.from(el, {
        y: 44, opacity: 0, duration: 0.85, ease: 'power2.out',
        scrollTrigger: (typeof window.ScrollTrigger !== 'undefined') ? { trigger: el, start: 'top 88%' } : undefined
      });
    });
    // Work cards: 3D perspective rotate-in reveal
    document.querySelectorAll('.work-card').forEach(function (card) {
      gsap.from(card, {
        rotationX: -24, y: 64, opacity: 0, transformPerspective: 1100,
        duration: 0.9, ease: 'power3.out',
        scrollTrigger: (typeof window.ScrollTrigger !== 'undefined') ? { trigger: card, start: 'top 88%' } : undefined
      });
    });
  }

  /* ---------- HERO TRUE-3D PARALLAX (fine pointers only) ----------
     Per-layer translate + subtle 3D tilt toward the mouse:
     headline, photo frame, text block and deco blobs sit on different
     "depth planes" (data-depth) and tilt at different rates. */
  function heroParallax() {
    if (reduced || !window.matchMedia('(pointer:fine)').matches) return;
    var hero = document.querySelector('.hero');
    var layers = document.querySelectorAll('.hero [data-depth]');
    if (!hero || !layers.length) return;
    hero.classList.add('parallax-on');
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function lerp() {
      cx += (tx - cx) * 0.075;
      cy += (ty - cy) * 0.075;
      for (var i = 0; i < layers.length; i++) {
        var d = parseFloat(layers[i].getAttribute('data-depth')) || 20;
        var x = (cx * d).toFixed(2);
        var y = (cy * d).toFixed(2);
        var ry = (cx * d * 0.12).toFixed(2);  /* deg: deeper layer -> more tilt */
        var rx = (-cy * d * 0.12).toFixed(2);
        layers[i].style.transform =
          'translate3d(' + x + 'px,' + y + 'px,0) perspective(1000px) rotateY(' + ry + 'deg) rotateX(' + rx + 'deg)';
      }
      if (Math.abs(tx - cx) > 0.0008 || Math.abs(ty - cy) > 0.0008) {
        raf = requestAnimationFrame(lerp);
      } else {
        raf = null;
      }
    }
    function kick() { if (!raf) raf = requestAnimationFrame(lerp); }
    hero.addEventListener('mousemove', function (e) {
      if (!parallaxReady) return;
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      kick();
    });
    hero.addEventListener('mouseleave', function () { tx = 0; ty = 0; kick(); });
  }

  /* ---------- WORK CARD TILT (desktop pointers only) ---------- */
  function cardTilt() {
    if (reduced || !window.matchMedia('(pointer:fine)').matches) return;
    document.querySelectorAll('.work-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + (x * 7).toFixed(2) + 'deg) rotateX(' + (-y * 7).toFixed(2) + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- READING PROGRESS BAR (scroll ke saath bharta hai) ----------
     transform:scaleX se chalata hai taaki repaints na hon; passive listener + rAF.
     No-JS me `hidden` rehta hai — decorative info element, content kabhi gayab nahi. */
  function initReadProgress() {
    var bar = document.getElementById('readProgress');
    if (!bar) return;
    bar.hidden = false;
    var raf = null;
    function update() {
      raf = null;
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? Math.min(Math.max(doc.scrollTop / max, 0), 1) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    }
    function kick() { if (!raf) raf = requestAnimationFrame(update); }
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    update();
  }

  /* ---------- CUSTOM CURSOR (crimson dot + trailing ring) ----------
     Sirf fine-pointer desktop par: dot tez lerp se chipakta hai, ring
     dheere trail karta hai. Reduced-motion / touch / no-JS me kabhi on nahi. */
  function initCustomCursor() {
    if (reduced || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;
    document.documentElement.classList.add('cursor-on');
    var tx = -100, ty = -100;      // target (mouse)
    var dx = -100, dy = -100;      // dot pos
    var rx = -100, ry = -100;      // ring pos
    var raf = null, inside = false;
    function place() {
      dx += (tx - dx) * 0.42;
      dy += (ty - dy) * 0.42;
      rx += (tx - rx) * 0.16;      // ring dheere — trailing feel
      ry += (ty - ry) * 0.16;
      dot.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0) translate(-50%,-50%)';
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0) translate(-50%,-50%)';
      var moving = Math.abs(tx - dx) > 0.05 || Math.abs(ty - dy) > 0.05 ||
                   Math.abs(tx - rx) > 0.05 || Math.abs(ty - ry) > 0.05;
      raf = moving ? requestAnimationFrame(place) : null;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(place); }
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!inside) { inside = true; dot.style.opacity = ''; ring.style.opacity = ''; }
      kick();
    }, { passive: true });
    document.addEventListener('mouseleave', function () {
      inside = false;
      dot.style.opacity = '0'; ring.style.opacity = '0';
    });
    // hoverable elements par ring grow (delegation — dynamically added bhi cover)
    var hoverSel = 'a,button,input,textarea,label,select,.skill-card,.cert-card,.work-card,.radar-panel';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) ring.classList.add('cursor-hover');
    }, { passive: true });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hoverSel)) ring.classList.remove('cursor-hover');
    }, { passive: true });
  }

  /* ---------- VCARD DOWNLOAD (real data, Blob — no-JS me hidden rehta hai) ---------- */
  function initVcard() {
    var wrap = document.getElementById('vcardWrap');
    var btn = document.getElementById('vcardBtn');
    if (!wrap || !btn) return;
    var vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:Dinesh Singh',
      'N:Singh;Dinesh;;;',
      'TITLE:BCA Student · Cybersecurity Learner',
      'EMAIL;TYPE=INTERNET,HOME:dm7178072@gmail.com',
      'URL:https://dm2123.github.io/portfolio/',
      'ADR;TYPE=HOME:;;Gurugram;Haryana;;India',
      'NOTE:GitHub https://github.com/dm2123 | LinkedIn https://www.linkedin.com/in/dinesh-singh-3439a4282 | Instagram https://www.instagram.com/dinesh_samrat1 | X https://x.com/DineshMaur60423',
      'END:VCARD'
    ].join('\r\n') + '\r\n';
    btn.addEventListener('click', function () {
      var blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'dinesh-singh.vcf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 800);
    });
    wrap.hidden = false;
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
  animateRadar();
  cardTilt();
  heroParallax();
  initCustomCursor();
  initStatusBar();
  initReadProgress();
  initVcard();
  if (document.readyState === 'complete') {
    gsapReveals();
  } else {
    window.addEventListener('load', gsapReveals);
  }
})();
