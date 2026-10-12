// Dinesh Singh Portfolio — real Three.js WebGL hero (progressive enhancement)
// If WebGL/CDN/importmap is unavailable, or reduced-motion is on, we bail out
// and CSS shows a static gradient instead. The page never breaks.
(function () {
  'use strict';

  var hero = document.querySelector('.hero');
  var canvas = document.getElementById('heroParticles');
  if (!hero || !canvas) return;

  function noWebGL() {
    document.documentElement.classList.add('no-webgl');
  }
  if (document.documentElement.classList.contains('no-webgl')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { noWebGL(); return; }

  // Dynamic import: a CDN failure can never break the rest of the page.
  import('three').then(function (THREE) {
    try { init(THREE); } catch (e) { noWebGL(); }
  }).catch(function () { noWebGL(); });

  function init(THREE) {
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) { noWebGL(); return; }
    if (!renderer.getContext()) { noWebGL(); return; }

    var isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    var finePointer = window.matchMedia('(pointer: fine)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    var CAM_Z = 14;
    camera.position.set(0, 0, CAM_Z);

    // ---- lighting: soft studio + one volt-green accent light ----
    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    var dir = new THREE.DirectionalLight(0xffffff, 1.15);
    dir.position.set(6, 8, 10);
    scene.add(dir);
    var voltLight = new THREE.PointLight(0x00e07f, 60, 45, 1.8);
    voltLight.position.set(-6, 3, 5);
    scene.add(voltLight);

    var world = new THREE.Group();
    scene.add(world);

    // ---- materials: crimson / volt / ink / cream, solid + wireframe mix ----
    var MAT = {
      crimsonSolid: new THREE.MeshStandardMaterial({ color: 0xC8102E, roughness: 0.35, metalness: 0.15 }),
      crimsonWire: new THREE.MeshStandardMaterial({ color: 0xC8102E, wireframe: true, transparent: true, opacity: 0.55 }),
      voltWire: new THREE.MeshStandardMaterial({ color: 0x00E07F, wireframe: true, transparent: true, opacity: 0.7 }),
      inkWire: new THREE.MeshStandardMaterial({ color: 0x141414, wireframe: true, transparent: true, opacity: 0.38 }),
      creamSolid: new THREE.MeshStandardMaterial({ color: 0xE9DCC3, roughness: 0.65, metalness: 0.05 })
    };

    // ---- floating geometries (real 3D, continuously rotating) ----
    var shapes = [
      { geo: new THREE.TorusKnotGeometry(1.05, 0.3, 110, 14), mat: 'crimsonWire', pos: [7.4, 1.2, -2], spd: [0.0018, 0.0026] },
      { geo: new THREE.IcosahedronGeometry(1.5, 0), mat: 'creamSolid', pos: [-7.6, -1.4, -3], spd: [0.0012, 0.0018] },
      { geo: new THREE.OctahedronGeometry(1.0, 0), mat: 'voltWire', pos: [-5.4, 2.6, -1], spd: [0.0024, 0.0014] },
      { geo: new THREE.IcosahedronGeometry(0.85, 1), mat: 'inkWire', pos: [5.8, -2.6, -1.5], spd: [0.0016, 0.0022] },
      { geo: new THREE.TorusGeometry(0.9, 0.26, 18, 40), mat: 'crimsonSolid', pos: [3.4, 2.9, -3.5], spd: [0.002, 0.0012] },
      { geo: new THREE.TetrahedronGeometry(0.75, 0), mat: 'voltWire', pos: [-2.8, -2.9, -2.5], spd: [0.0028, 0.002] }
    ];
    if (isMobile) shapes = shapes.slice(0, 3); // half the objects on mobile

    var meshes = shapes.map(function (s) {
      var m = new THREE.Mesh(s.geo, MAT[s.mat]);
      m.position.set(s.pos[0], s.pos[1], s.pos[2]);
      m.userData.spd = s.spd;
      world.add(m);
      return m;
    });

    // ---- 3D particle starfield drifting through depth (normal blending: visible on cream) ----
    var COUNT = isMobile ? 100 : 200;
    var pos = new Float32Array(COUNT * 3);
    var col = new Float32Array(COUNT * 3);
    var palette = [[0.78, 0.06, 0.18], [0.0, 0.75, 0.42], [0.10, 0.10, 0.10]]; // crimson, volt, ink
    for (var i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      var c = palette[i % 3];
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
      size: 0.085, vertexColors: true, transparent: true, opacity: 0.55,
      depthWrite: false, sizeAttenuation: true
    }));
    world.add(stars);

    // ---- mouse: feel like you're inside the 3D space (lerped) ----
    var mx = 0, my = 0, tx = 0, ty = 0;
    if (finePointer) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      hero.addEventListener('mouseleave', function () { tx = 0; ty = 0; });
    }

    // ---- render loop: pause when tab hidden or hero off-screen ----
    var running = false, raf = 0;
    function resize() {
      var r = hero.getBoundingClientRect();
      var w = Math.max(1, Math.floor(r.width));
      var h = Math.max(1, Math.floor(r.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    function frame() {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      mx += (tx - mx) * 0.045;
      my += (ty - my) * 0.045;
      world.rotation.y = mx * 0.35;
      world.rotation.x = -my * 0.22;
      for (var i = 0; i < meshes.length; i++) {
        meshes[i].rotation.x += meshes[i].userData.spd[0];
        meshes[i].rotation.y += meshes[i].userData.spd[1];
      }
      var p = starGeo.attributes.position;
      for (var j = 0; j < COUNT; j++) {
        var z = p.getZ(j) + 0.008; // drift toward the viewer through depth
        if (z > 4) z = -8;
        p.setZ(j, z);
      }
      p.needsUpdate = true;
      // subtle dolly-back as you scroll through the hero
      var rect = hero.getBoundingClientRect();
      var prog = Math.min(Math.max(-rect.top / Math.max(1, rect.height), 0), 1);
      camera.position.z = CAM_Z + prog * 6;
      voltLight.position.x = -6 + Math.sin(performance.now() * 0.0004) * 2.5;
      renderer.render(scene, camera);
    }
    function start() {
      if (!running && !document.hidden) {
        running = true;
        resize();
        raf = requestAnimationFrame(frame);
      }
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    var rt = null;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (running) resize(); }, 200);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) start(); else stop();
      }, { threshold: 0.02 }).observe(hero);
    }
    start();
  }
})();
