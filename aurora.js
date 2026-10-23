// Dinesh Singh Portfolio — lightweight aurora + film-grain canvas (2D, 29 lines). reduced-motion/no-JS par blank rehta hai.
(function () {
  var c = document.getElementById('heroAurora');
  if (!c || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var x = c.getContext('2d'), W = 0, H = 0, t = 0, vis = true, blobs = [], gr = '';
  function pal() { // light/dark palette; theme toggle 'dinesh:themechange' event bhejta hai
    var d = document.documentElement.getAttribute('data-theme') === 'dark';
    blobs = d ? [['232,35,74', 0], ['0,224,127', 2.1], ['150,80,255', 4.2]] : [['200,16,46', 0], ['0,224,127', 2.1], ['25,25,25', 4.2]];
    gr = d ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  }
  function rs() { // low-res (1/4): CSS upscale se natural blur, GPU sasta
    var r = c.parentNode.getBoundingClientRect();
    W = c.width = Math.max(1, r.width / 4 | 0); H = c.height = Math.max(1, r.height / 4 | 0);
  }
  function fr() {
    requestAnimationFrame(fr); t += 0.008; x.clearRect(0, 0, W, H);
    if (!vis || document.hidden) return;
    for (var i = 0; i < 3; i++) { // 3 aurora blobs: sine path par slow drift
      var b = blobs[i], bx = W * (0.5 + 0.42 * Math.sin(t + b[1])), by = H * (0.5 + 0.4 * Math.cos(0.7 * t + 1.7 * b[1]));
      var g = x.createRadialGradient(bx, by, 0, bx, by, W * 0.5);
      g.addColorStop(0, 'rgba(' + b[0] + ',0.16)'); g.addColorStop(1, 'rgba(' + b[0] + ',0)');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
    }
    x.fillStyle = gr; // animated film grain: har frame naye random speckle
    for (var s = 0; s < 60; s++) x.fillRect(Math.random() * W | 0, Math.random() * H | 0, 1, 1);
  }
  addEventListener('dinesh:themechange', pal); addEventListener('resize', rs);
  new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(c);
  pal(); rs(); fr();
})();
