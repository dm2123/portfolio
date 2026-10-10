// Dinesh Singh Portfolio — interactions
(function () {
  // Sticky nav shadow
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Mobile menu
  var burger = document.getElementById('hamburger');
  var links = document.getElementById('navLinks');
  burger.addEventListener('click', function () {
    links.classList.toggle('open');
    burger.textContent = links.classList.contains('open') ? '✕' : '☰';
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      burger.textContent = '☰';
    });
  });

  // Scroll reveal
  var revealEls = document.querySelectorAll('.section .container, .hero-inner');
  revealEls.forEach(function (el) { el.classList.add('reveal'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(function (el) { io.observe(el); });
})();
