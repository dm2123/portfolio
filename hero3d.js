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
    // cinematic professional look: ACES tone mapping + sRGB output
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    var CAM_Z = 11; // closer camera: shapes fill the frame, front-and-center WOW
    camera.position.set(0, -1.1, CAM_Z); // slight low angle: cinematic feel
    camera.lookAt(0, 0.5, 0);

    // ---- 3-point studio lighting: key + fill + rim + volt accent ----
    var key = new THREE.DirectionalLight(0xfff4e0, 2.4); // warm key, top-right
    key.position.set(6, 9, 8);
    scene.add(key);
    var fill = new THREE.HemisphereLight(0xfff9ef, 0xd8c9a8, 0.55); // soft cream fill
    scene.add(fill);
    var rim = new THREE.DirectionalLight(0xdfe8ff, 1.6); // cool rim from back-left: edge definition
    rim.position.set(-8, 4, -7);
    scene.add(rim);
    var voltLight = new THREE.PointLight(0x00e07f, 95, 45, 1.8);
    voltLight.position.set(-4, 3, 5);
    scene.add(voltLight);

    var world = new THREE.Group();
    scene.add(world);

    // ---- premium materials: metallic sheen, emissive glow, satin finishes ----
    var MAT = {
      crimsonMetal: new THREE.MeshPhysicalMaterial({
        color: 0xC8102E, metalness: 0.62, roughness: 0.27,
        clearcoat: 0.65, clearcoatRoughness: 0.22,
        emissive: 0x7a0a18, emissiveIntensity: 0.9 // punchy crimson glow
      }),
      crimsonWire: new THREE.MeshStandardMaterial({
        color: 0xC8102E, wireframe: true, transparent: true, opacity: 0.68,
        roughness: 0.4, metalness: 0.3
      }),
      voltGlow: new THREE.MeshStandardMaterial({
        color: 0x00E07F, emissive: 0x00E07F, emissiveIntensity: 1.7, // vivid volt
        roughness: 0.3, metalness: 0.1
      }),
      voltWire: new THREE.MeshStandardMaterial({
        color: 0x00E07F, wireframe: true, transparent: true, opacity: 0.8,
        emissive: 0x00E07F, emissiveIntensity: 0.6
      }),
      inkWire: new THREE.MeshStandardMaterial({
        color: 0x1a1a1a, wireframe: true, transparent: true, opacity: 0.5,
        roughness: 0.5, metalness: 0.4
      }),
      creamSatin: new THREE.MeshStandardMaterial({
        color: 0xEADFC6, roughness: 0.42, metalness: 0.28
      })
    };

    // ---- floating geometries: BOLD composition — big, front-and-center, dramatic ----
    // (canvas renders behind hero content, so large shapes = dramatic backdrop, text stays readable)
    var shapes = [
      // hero centerpiece: giant torus knot, fast spin, upper-center
      { geo: new THREE.TorusKnotGeometry(1.9, 0.52, 120, 16), mat: 'crimsonMetal', pos: [2.8, 1.8, -1.5], spd: [0.0052, 0.0072] },
      { geo: new THREE.IcosahedronGeometry(2.6, 0), mat: 'creamSatin', pos: [-4.4, -1.6, -2.5], spd: [0.0032, 0.0046] },
      { geo: new THREE.OctahedronGeometry(1.8, 0), mat: 'voltGlow', pos: [-3.2, 2.8, -1], spd: [0.0062, 0.0036] },
      { geo: new THREE.IcosahedronGeometry(1.5, 1), mat: 'inkWire', pos: [4.6, -2.6, -1.5], spd: [0.0042, 0.0056] },
      { geo: new THREE.TorusGeometry(1.55, 0.42, 18, 44), mat: 'crimsonWire', pos: [0.6, 3.4, -2.5], spd: [0.005, 0.003] },
      { geo: new THREE.TetrahedronGeometry(1.35, 0), mat: 'voltWire', pos: [-1.6, -3.4, -2], spd: [0.007, 0.005] }
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
      size: 0.11, vertexColors: true, transparent: true, opacity: 0.6,
      depthWrite: false, sizeAttenuation: true
    }));
    world.add(stars);

    // ---- dark theme sync: dark bg par ink-wire gayab ho jata hai, cream-satin chamakta hai —
    //      isliye theme ke saath materials re-tint karo (script.js se dinesh:themechange aata hai) ----
    function applySceneTheme(dark) {
      MAT.inkWire.color.set(dark ? 0xEAE3D3 : 0x1a1a1a);
      MAT.creamSatin.color.set(dark ? 0x453C2E : 0xEADFC6);
      fill.color.set(dark ? 0x3A3226 : 0xfff9ef);
      fill.groundColor.set(dark ? 0x100D09 : 0xd8c9a8);
      var ca = starGeo.attributes.color, c;
      for (var i = 0; i < COUNT; i++) {
        c = dark
          ? [[0.91, 0.14, 0.29], [0.0, 0.88, 0.50], [0.92, 0.88, 0.78]][i % 3] // crimson, volt, warm-white
          : [[0.78, 0.06, 0.18], [0.0, 0.75, 0.42], [0.10, 0.10, 0.10]][i % 3]; // crimson, volt, ink
        ca.setXYZ(i, c[0], c[1], c[2]);
      }
      ca.needsUpdate = true;
    }
    window.addEventListener('dinesh:themechange', function (e) {
      applySceneTheme(!!(e.detail && e.detail.dark));
    });
    applySceneTheme(document.documentElement.getAttribute('data-theme') === 'dark');

    // ---- ASSEMBLY intro: parts door se aakar ek-ek karke judte hain (dramatic) ----
    var asm = { started: false, t0: 0 };
    var voltFlash = 0;
    var asmOffsets = [
      [16, 11, -14], [-17, 10, -13], [-13, -13, -15],
      [17, -11, -14], [10, 16, -17], [-10, -17, -15]
    ];
    meshes.forEach(function (m, i) {
      var f = m.position.clone();
      var o = asmOffsets[i % asmOffsets.length];
      m.userData.finalPos = f;
      m.userData.startPos = new THREE.Vector3(f.x + o[0], f.y + o[1], f.z + o[2]);
      m.userData.delay = i * 380; // har part me gap: ek-ek karke judna
      m.userData.dur = 950;
      m.userData.landed = false;
      m.userData.pulseT = -1;
      m.position.copy(m.userData.startPos);
    });
    function startAssembly() {
      if (asm.started) return;
      asm.started = true;
      asm.t0 = performance.now();
    }
    window.addEventListener('dinesh:assemble', startAssembly);
    if (window.__heroAssembleNow) startAssembly(); // event module load se pehle fire ho gaya tha
    setTimeout(startAssembly, 9000); // safety: parts kabhi scattered na rahen

    // ---- mouse: feel like you're inside the 3D space (lerped, responsive) ----
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
      mx += (tx - mx) * 0.075;
      my += (ty - my) * 0.075;
      world.rotation.y = mx * 0.62; // bold, responsive mouse parallax
      world.rotation.x = -my * 0.4;
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
      // assembly: har part apni jagah aakar lock hota hai (scale pulse + volt flash)
      if (asm.started) {
        var nowMs = performance.now();
        for (var k = 0; k < meshes.length; k++) {
          var mm = meshes[k], u = mm.userData;
          var lt = (nowMs - asm.t0 - u.delay) / u.dur;
          if (lt < 0) { mm.position.copy(u.startPos); continue; }
          if (lt >= 1) {
            if (!u.landed) { u.landed = true; u.pulseT = 0; voltFlash = 1; }
            mm.position.copy(u.finalPos);
          } else {
            var ez = 1 - Math.pow(1 - lt, 3);
            mm.position.lerpVectors(u.startPos, u.finalPos, ez);
          }
          if (u.pulseT >= 0 && u.pulseT <= 1) {
            u.pulseT += 0.045;
            mm.scale.setScalar(1 + 0.13 * Math.sin(Math.PI * Math.min(u.pulseT, 1)));
            if (u.pulseT > 1) { mm.scale.setScalar(1); u.pulseT = -1; }
          }
        }
        voltFlash *= 0.93;
        voltLight.intensity = 95 + voltFlash * 150;
      }
      // subtle dolly-back as you scroll through the hero (cinematic angle maintained)
      var rect = hero.getBoundingClientRect();
      var prog = Math.min(Math.max(-rect.top / Math.max(1, rect.height), 0), 1);
      camera.position.z = CAM_Z + prog * 4;
      camera.lookAt(0, 0.5, 0);
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
