/* Particle field — the background layer for the whole page.
   Ported from /motion/, but this one lives behind real body copy, and that
   single fact drives every difference between the two.

   The study could render particles at full strength because it carried
   eight short strings of text. Here they sit behind every paragraph on the
   site, and a deep-maroon particle at full opacity puts --text-muted at
   1.19:1 — measured, not estimated. So the cores render at .20 alpha,
   which composites to the same result as an 80% cream veil over the field
   without needing a veil element at all. Below that the muted floor
   breaks; above it the field stops being visible. It is the whole budget.

   Progressive enhancement, same contract as main.js: with this file, or
   Three.js, or WebGL missing, the page is exactly the site it was before —
   cream, textured, and complete. Nothing here is load-bearing. */
(function () {
  "use strict";

  var canvas = document.getElementById("field");
  if (!canvas || !window.THREE) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var fine   = window.matchMedia("(hover: hover) and (pointer: fine)");

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) {
    return;                       // no WebGL — the page needs nothing from us
  }

  var COUNT = 2400;               // 3000 in the study; this one shares a page
                                  // with backdrop-filter cards and a texture
                                  // layer, so it pays rent for the frame.

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 4000);
  camera.position.set(0, 0, 520);

  // Rotations go on a group, never the scene: the cursor has to be inverted
  // into the same space the particles live in, and a group gives a matrix
  // to invert through. Rotate the scene and the repulsion hole drifts out
  // of register with the pointer as the formation spins.
  var swarm = new THREE.Group();
  scene.add(swarm);

  var basePos   = new Float32Array(COUNT * 3);
  var startPos  = new Float32Array(COUNT * 3);
  var targetPos = new Float32Array(COUNT * 3);
  var offset    = new Float32Array(COUNT * 3);
  var rendered  = new Float32Array(COUNT * 3);
  var colors    = new Float32Array(COUNT * 3);

  // The portfolio's own maroon-orange, held per particle across every morph
  // so a point keeps its identity as the shape changes.
  var PALETTE = [
    { c: [198,  74, 28], w: 0.35 },
    { c: [165,  48, 22], w: 0.25 },
    { c: [112,  30, 26], w: 0.20 },
    { c: [222, 116, 40], w: 0.12 },
    { c: [ 78,  22, 20], w: 0.08 }
  ];
  for (var i = 0; i < COUNT; i++) {
    var r = Math.random(), acc = 0, col = PALETTE[0].c;
    for (var q = 0; q < PALETTE.length; q++) {
      acc += PALETTE[q].w;
      if (r <= acc) { col = PALETTE[q].c; break; }
    }
    colors[i * 3]     = col[0] / 255;
    colors[i * 3 + 1] = col[1] / 255;
    colors[i * 3 + 2] = col[2] / 255;
  }

  // NormalBlending, never additive. Additive light on a light ground washes
  // to nothing — the usual glowing-particle recipe fails on cream.
  function system(size, opacity) {
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(rendered, 3));
    g.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
    var p = new THREE.Points(g, new THREE.PointsMaterial({
      size: size, vertexColors: true, transparent: true, opacity: opacity,
      blending: THREE.NormalBlending, depthWrite: false, sizeAttenuation: true
    }));
    swarm.add(p);
    return p;
  }
  var cores = system(2.2, 0.20);   // .20 is the contrast budget — see the top
  var haze  = system(8.0, 0.03);

  /* ── Formations ─────────────────────────────────────────── */

  function exploded() {
    var a = new Float32Array(COUNT * 3);
    for (var i = 0; i < COUNT; i++) {
      var rr = 80 + Math.random() * 320;
      var th = Math.random() * Math.PI * 2;
      var ph = Math.acos(2 * Math.random() - 1);
      a[i*3]   = rr * Math.sin(ph) * Math.cos(th) + (Math.random() - .5) * 10;
      a[i*3+1] = rr * Math.sin(ph) * Math.sin(th) + (Math.random() - .5) * 10;
      a[i*3+2] = rr * Math.cos(ph)                + (Math.random() - .5) * 10;
    }
    return a;
  }

  function vortex() {
    var a = new Float32Array(COUNT * 3), i = 0;
    var arms = 4, armTotal = Math.round(COUNT * 0.73), per = Math.floor(armTotal / arms);
    for (var arm = 0; arm < arms; arm++) {
      var base = arm * (Math.PI / 2);
      for (var k = 0; k < per; k++, i++) {
        var t = k / per, rad = 20 + t * 260;
        var ang = base + t * 4.2 + Math.random() * 0.35;
        a[i*3]   = rad * Math.cos(ang) + (Math.random() - .5) * 18;
        a[i*3+1] = (Math.random() - .5) * 28;
        a[i*3+2] = rad * Math.sin(ang) + (Math.random() - .5) * 18;
      }
    }
    var coreEnd = Math.round(COUNT * 0.90);
    for (; i < coreEnd; i++) {
      var cr = 35 * Math.cbrt(Math.random());
      var ct = Math.random() * Math.PI * 2, cp = Math.acos(2 * Math.random() - 1);
      a[i*3]   = cr * Math.sin(cp) * Math.cos(ct);
      a[i*3+1] = cr * Math.sin(cp) * Math.sin(ct);
      a[i*3+2] = cr * Math.cos(cp);
    }
    for (; i < COUNT; i++) {
      var hr = 260 + Math.random() * 160, ha = Math.random() * Math.PI * 2;
      a[i*3]   = hr * Math.cos(ha);
      a[i*3+1] = (Math.random() - .5) * 30;
      a[i*3+2] = hr * Math.sin(ha);
    }
    return a;
  }

  function polaris() {
    var a = new Float32Array(COUNT * 3), i = 0;
    var radii  = [30, 60, 95, 130, 165, 200, 235, 270];
    var counts = [40, 80, 120, 160, 200, 240, 320, 440];
    for (var r = 0; r < radii.length && i < COUNT; r++) {
      for (var k = 0; k < counts[r] && i < COUNT; k++, i++) {
        var ang = (k / counts[r]) * Math.PI * 2;
        a[i*3] = radii[r] * Math.cos(ang); a[i*3+1] = 0; a[i*3+2] = radii[r] * Math.sin(ang);
      }
    }
    var spokes = 12, perSpoke = 50;
    for (var s = 0; s < spokes && i < COUNT - 160; s++) {
      var sa = s * (Math.PI * 2 / spokes);
      for (var j = 0; j < perSpoke && i < COUNT - 160; j++, i++) {
        var sr = (j / perSpoke) * 270;
        a[i*3] = sr * Math.cos(sa); a[i*3+1] = 0; a[i*3+2] = sr * Math.sin(sa);
      }
    }
    for (; i < COUNT; i++) {
      var hr2 = 8 * Math.cbrt(Math.random()), ht = Math.random() * Math.PI * 2;
      a[i*3] = hr2 * Math.cos(ht); a[i*3+1] = (Math.random() - .5) * 3; a[i*3+2] = hr2 * Math.sin(ht);
    }
    return a;
  }

  // Waves keep moving after they arrive, so the grid is kept and the sheet
  // recomputed each frame once the morph lands. Rebuilt on resize — the
  // sheets are sized from the viewport.
  var grid = [];
  function buildGrid() {
    grid.length = 0;
    var sheets = 6, per = Math.ceil(COUNT / sheets);
    for (var s = 0; s < sheets; s++) {
      for (var k = 0; k < per; k++) {
        var colN = k % 50, row = Math.floor(k / 50);
        grid.push({ s: s,
          x: (colN - 25) * (window.innerWidth / 50),
          y: (row - 4.5) * (window.innerHeight / 10),
          z: (s - 2.5) * 80 });
      }
    }
  }
  buildGrid();

  function waveAt(g, elapsed) {
    var phase = -elapsed * 0.0014;          // negative → travels right to left
    var amp = 32 + g.s * 7, freq = 0.012 - g.s * 0.001;
    return { x: g.x,
             y: g.y + amp * Math.sin(freq * g.x + phase + g.s * 0.9),
             z: g.z + amp * 0.3 * Math.cos(freq * g.x * 0.5 + phase) };
  }
  function waves(elapsed) {
    var a = new Float32Array(COUNT * 3);
    for (var i = 0; i < COUNT; i++) {
      var p = waveAt(grid[i % grid.length], elapsed || 0);
      a[i*3] = p.x; a[i*3+1] = p.y; a[i*3+2] = p.z;
    }
    return a;
  }

  var MODES = {
    exploded: { cam: [0, 0, 520],   mx: 180, my: 110, lerp: .035, spin: [.0002, .0003] },
    vortex:   { cam: [0, 380, 380], mx: 60,  my: 35,  lerp: .040, spin: [0, .0018] },
    polaris:  { cam: [0, 380, 380], mx: 60,  my: 40,  lerp: .040, spin: [0, .0060] },
    waves:    { cam: [0, 0, 600],   mx: 30,  my: 20,  lerp: .030, spin: [0, 0] }
  };
  var mode = MODES.exploded, current = "exploded";

  /* ── Morph ──────────────────────────────────────────────── */
  var morphStart = 0, morphDur = 1800, morphing = false;
  function morphTo(target, ms) {
    startPos.set(basePos);
    targetPos.set(target);
    morphDur = reduce.matches ? 1 : (ms || 1800);
    morphStart = performance.now();
    morphing = true;
  }

  var camFrom = new THREE.Vector3().copy(camera.position);
  var camShiftStart = -1e9, CAM_MS = 1500;

  function setFormation(name, elapsed) {
    if (name === current || !MODES[name]) return;
    current = name;
    mode = MODES[name];
    camFrom.copy(camera.position);
    camShiftStart = performance.now();
    morphTo(name === "exploded" ? exploded()
          : name === "vortex"   ? vortex()
          : name === "polaris"  ? polaris()
          : waves(elapsed), 1800);
  }

  /* ── Pointer ────────────────────────────────────────────── */
  var mnx = 0, mny = 0;
  window.addEventListener("pointermove", function (e) {
    mnx = (e.clientX / window.innerWidth) * 2 - 1;
    mny = -((e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  /* ── Sections drive the formation ───────────────────────── */
  var t0 = performance.now();
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setFormation(en.target.dataset.formation, performance.now() - t0);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll("[data-formation]").forEach(function (s) { io.observe(s); });
  }

  basePos.set(exploded());
  rendered.set(basePos);
  morphTo(exploded(), 2400);

  var cursorWorld = new THREE.Vector3();
  var ndc = new THREE.Vector3();
  var localCursor = new THREE.Vector3();
  var visible = true;
  document.addEventListener("visibilitychange", function () { visible = !document.hidden; });

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;             // a hidden tab should cost nothing
    var elapsed = now - t0;

    if (morphing) {
      var t = Math.min((now - morphStart) / morphDur, 1);
      var e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;   // ease-in-out quad
      for (var i = 0; i < basePos.length; i++) {
        basePos[i] = startPos[i] + (targetPos[i] - startPos[i]) * e;
      }
      if (t >= 1) morphing = false;
    } else if (current === "waves" && !reduce.matches) {
      for (var w = 0; w < COUNT; w++) {
        var p = waveAt(grid[w % grid.length], elapsed);
        basePos[w*3] = p.x; basePos[w*3+1] = p.y; basePos[w*3+2] = p.z;
      }
    }

    var ct = Math.min((now - camShiftStart) / CAM_MS, 1);
    var ce = ct < 0.5 ? 2 * ct * ct : -1 + (4 - 2 * ct) * ct;
    var bx = camFrom.x + (mode.cam[0] - camFrom.x) * ce;
    var by = camFrom.y + (mode.cam[1] - camFrom.y) * ce;
    var bz = camFrom.z + (mode.cam[2] - camFrom.z) * ce;

    // Orbit pulled well back from the study's figures. There it was the
    // whole show; here it is behind text, and a swinging camera under a
    // paragraph is just motion sickness.
    var swing = reduce.matches ? 0 : 0.45;
    camera.position.x += ((bx + mnx * mode.mx * swing) - camera.position.x) * mode.lerp;
    camera.position.y += ((by + mny * mode.my * swing) - camera.position.y) * mode.lerp;
    camera.position.z += (bz - camera.position.z) * mode.lerp;
    camera.lookAt(0, 0, 0);

    if (!reduce.matches) {
      swarm.rotation.x += mode.spin[0];
      swarm.rotation.y += mode.spin[1];
    }

    if (!reduce.matches && fine.matches) {
      ndc.set(mnx, mny, 0.5).unproject(camera);
      cursorWorld.copy(camera.position)
        .add(ndc.sub(camera.position).normalize().multiplyScalar(camera.position.length()));
      swarm.updateMatrixWorld();
      localCursor.copy(cursorWorld);
      swarm.worldToLocal(localCursor);

      var R = 90, R2 = R * R;
      for (var j = 0; j < COUNT; j++) {
        var k = j * 3;
        var dx = basePos[k] - localCursor.x,
            dy = basePos[k+1] - localCursor.y,
            dz = basePos[k+2] - localCursor.z;
        var d2 = dx*dx + dy*dy + dz*dz;
        if (d2 < R2) {
          var d = Math.sqrt(d2) || 0.001;
          var f = (1 - d / R) * 55 * 0.35;
          offset[k] += (dx / d) * f; offset[k+1] += (dy / d) * f; offset[k+2] += (dz / d) * f;
        }
        offset[k] *= 0.90; offset[k+1] *= 0.90; offset[k+2] *= 0.90;
        rendered[k]   = basePos[k]   + offset[k];
        rendered[k+1] = basePos[k+1] + offset[k+1];
        rendered[k+2] = basePos[k+2] + offset[k+2];
      }
    } else {
      rendered.set(basePos);
    }

    cores.geometry.attributes.position.needsUpdate = true;
    haze.geometry.attributes.position.needsUpdate  = true;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    buildGrid();
  }, { passive: true });
})();
