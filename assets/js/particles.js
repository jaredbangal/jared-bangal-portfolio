/* Particle field — the background layer for the whole page.
   Ported from /motion/, but this one lives behind real body copy, and that
   single fact drives every difference between the two.

   The study could render particles at full strength because it carried
   eight short strings of text. Here they sit behind every paragraph on the
   site, so the alpha the cores render at is a contrast budget, not a taste
   decision — it is solved against rendered pixels and re-solved whenever
   the palette changes. See CORE_ALPHA below.

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

  // Blue, held per particle across every morph so a point keeps its
  // identity as the shape changes.
  //
  // Cool field on a warm ground — the pairing is deliberate, and it is the
  // one thing on the page allowed to be cold. It is *not* on the --accent
  // token: the maroon buttons and ink are untouched, and this palette must
  // never be promoted into the token layer, or the page has two accents.
  //
  // "Bright" here still has a ceiling. Cream sits at relative luminance
  // .76, so a genuinely light blue lands within a few points of the ground
  // and vanishes exactly the way a yellow gold did. These five run
  // .03–.50: the top two carry the brightness, the bottom two carry the
  // depth that keeps a particle legible when it crosses a pale surface.
  var PALETTE = [
    { c: [ 46, 155, 214], w: 0.34 },   // bright blue — the dominant tone
    { c: [110, 197, 240], w: 0.22 },   // sky, the highlight
    { c: [ 28, 111, 184], w: 0.22 },   // true blue
    { c: [ 20,  78, 134], w: 0.14 },   // deep blue
    { c: [ 12,  46,  82], w: 0.08 }    // navy
  ];
  /* The dark theme's five. Not these blues dimmed — the *opposite* problem.
     The note above explains that on cream the bottom two stops carry the
     depth that keeps a point legible against a pale surface. On
     --shade-800 those same two sit within a few levels of the ground and
     disappear entirely: the identical failure, mirrored. So every stop is
     lifted and the floor is lifted hardest, which is what keeps the field
     reading as depth rather than as flat dots. */
  var PALETTE_DARK = [
    { c: [ 96, 186, 236], w: 0.34 },   // bright blue — still the dominant
    { c: [172, 222, 250], w: 0.22 },   // sky, the highlight
    { c: [ 60, 148, 210], w: 0.22 },   // true blue
    { c: [ 42, 110, 168], w: 0.14 },   // deep
    { c: [ 30,  76, 120], w: 0.08 }    // navy, lifted off the ground
  ];

  /* Which stop each point drew, kept so a theme change can re-tint the
     field in place. Re-rolling Math.random() on every toggle would give
     each point a *different* colour rather than the same colour on the
     other palette, and 2400 points changing identity at once reads as the
     field flickering. */
  var stopIdx = new Uint8Array(COUNT);
  for (var i = 0; i < COUNT; i++) {
    var r = Math.random(), acc = 0, q = 0;
    for (; q < PALETTE.length - 1; q++) {
      acc += PALETTE[q].w;
      if (r <= acc) break;
    }
    stopIdx[i] = q;
  }

  function tint(theme) {
    var P = theme === "dark" ? PALETTE_DARK : PALETTE;
    for (var k = 0; k < COUNT; k++) {
      var col = P[stopIdx[k]].c;
      colors[k * 3]     = col[0] / 255;
      colors[k * 3 + 1] = col[1] / 255;
      colors[k * 3 + 2] = col[2] / 255;
    }
  }
  tint(document.documentElement.getAttribute("data-theme"));

  /* ── Sprite ─────────────────────────────────────────────────
     A PointsMaterial with no map draws gl_PointCoord's full square, which
     at these sizes is a visible 4–6px pixel. Every point therefore samples
     a generated disc instead.

     RGB is flat white and only alpha carries the shape, because
     PointsMaterial multiplies map × vertexColor: a white sprite passes the
     particle's own gold through untouched, so one texture serves all five
     palette stops.

     `plateau` is the fraction of the radius held at full alpha before the
     falloff starts, and it is what separates the two sprites: a core needs
     a solid middle and a soft rim (a disc), a glow needs no middle at all
     (a halo). Mipmaps are off — points pick a mip from screen-space
     derivatives that are meaningless for a quad this small, and the result
     is a dot that blurs in and out as the camera moves. */
  function sprite(plateau, falloff) {
    var S = 128, half = S / 2;
    var cv = document.createElement("canvas");
    cv.width = cv.height = S;
    var ctx = cv.getContext("2d");
    if (!ctx) return null;           // map:null is the old square — still a field
    var img = ctx.createImageData(S, S), d = img.data;
    for (var y = 0; y < S; y++) {
      for (var x = 0; x < S; x++) {
        var dx = (x + 0.5 - half) / half, dy = (y + 0.5 - half) / half;
        var r = Math.sqrt(dx * dx + dy * dy), a;
        if (r >= 1)            a = 0;
        else if (r <= plateau) a = 1;
        else                   a = Math.pow(1 - (r - plateau) / (1 - plateau), falloff);
        var o = (y * S + x) * 4;
        d[o] = d[o + 1] = d[o + 2] = 255;
        d[o + 3] = Math.round(a * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
    var t = new THREE.CanvasTexture(cv);
    t.minFilter = t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  }
  var DISC = sprite(0.34, 1.8);    // solid centre, feathered rim
  var HALO = sprite(0.00, 2.6);    // falls off from the very centre

  /* ── Glow ───────────────────────────────────────────────────
     NormalBlending, never additive. Additive light on a light ground
     washes to nothing — the usual glowing-particle recipe fails on cream,
     which is why the glow here is built out of *coverage* instead: a dense
     core inside a wide, very faint halo, exactly how a pigment blooms into
     paper. Three layers rather than two because two gave a dot with a ring
     around it; the middle one is what fills the step between them.

     CORE_ALPHA is the contrast budget. Gold's weighted mean luminance is
     .29 against maroon's .13, so it darkens the ground about three-fifths
     as hard per unit alpha, and the disc covers less of its quad than the
     old square did — together that is what pays for .34 where maroon could
     only afford .20. Re-solve it against rendered pixels if the palette
     moves again; it is not transferable. */
  var CORE_ALPHA = 0.34;

  // One BufferAttribute shared by all three layers, not one each: they draw
  // identical points and Three keys its GPU buffer cache on the attribute
  // object, so sharing turns three uploads per frame into one — and leaves
  // a single `needsUpdate` to remember to set.
  var posAttr = new THREE.BufferAttribute(rendered, 3);
  var colAttr = new THREE.BufferAttribute(colors, 3);

  // Re-tint on a theme change. One buffer upload, no geometry rebuild —
  // the formation, the morph clock and the pointer state all carry on.
  document.documentElement.addEventListener("themechange", function (e) {
    tint(e.detail && e.detail.theme);
    colAttr.needsUpdate = true;
  });

  function system(size, opacity, map) {
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", posAttr);
    g.setAttribute("color",    colAttr);
    var p = new THREE.Points(g, new THREE.PointsMaterial({
      size: size, map: map, vertexColors: true, transparent: true,
      opacity: opacity, blending: THREE.NormalBlending, depthWrite: false,
      sizeAttenuation: true
    }));
    swarm.add(p);
    return p;
  }
  // Sizes are fill-rate, and a point sprite's cost is its *area*. The outer
  // haze ran at 24 units first and cost 24fps of a 70fps budget under a
  // software rasteriser — a third of the frame for a layer whose mean
  // contribution measured under two levels out of 255. At 18 it keeps the
  // bloom and gives most of that back. Measure before growing it again.
  system(4.2,  CORE_ALPHA, DISC);   // core
  system(10.0, 0.060,      HALO);   // inner bloom
  system(18.0, 0.020,      HALO);   // outer haze

  /* ── Formations ─────────────────────────────────────────── */

  // A globe: one thin shell, not a filled volume. The radius spread used to
  // run 80–320, and a shell that thick has no silhouette — from outside it
  // is just dust. Holding every point at one radius is what makes a sphere
  // read, because projection then piles points up at the limb and leaves
  // the middle open. That middle is where the headline sits, so the shape
  // and the contrast budget happen to want the same thing.
  //
  // Points are placed on a Fibonacci lattice rather than by rejection
  // sampling. Random points on a sphere clump and leave holes at this count;
  // the lattice spaces them evenly, which is the difference between a
  // deliberate object and a spray. SHELL_JITTER then breaks the spiral up
  // just enough that it does not read as a wireframe when the swarm turns.
  var GOLDEN = Math.PI * (3 - Math.sqrt(5));
  var SHELL_JITTER = 7;

  // Sized from the viewport, not fixed. The camera's 60° fov is *vertical*,
  // so on a phone the horizontal half-extent is a third of the desktop's —
  // a fixed 250-unit globe would hang off both sides and look, again, like
  // scattered dust. Fit to whichever half-extent is smaller.
  function shellRadius() {
    var dist = 520;                                    // MODES.sphere cam z
    var halfH = Math.tan((60 * Math.PI / 180) / 2) * dist;
    var halfW = halfH * (window.innerWidth / window.innerHeight);
    return Math.min(halfH, halfW) * 0.52;
  }

  function sphere() {
    var a = new Float32Array(COUNT * 3), R = shellRadius();
    for (var i = 0; i < COUNT; i++) {
      var y   = 1 - (i / (COUNT - 1)) * 2;             // 1 → −1, evenly
      var rad = Math.sqrt(Math.max(0, 1 - y * y));
      var th  = GOLDEN * i;
      var r   = R + (Math.random() - .5) * SHELL_JITTER;
      a[i*3]   = r * rad * Math.cos(th);
      a[i*3+1] = r * y;
      a[i*3+2] = r * rad * Math.sin(th);
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
    /* `rep` is the cursor's reach, in world units, and it has to differ per
       formation, and so does `push`, the strength. Both were fixed values
       tuned on the sphere, whose points sit on a ~250-unit shell — but the
       wave sheets span the whole viewport in world units, where the same
       19-unit shove is a 2.7% nudge instead of a 7% one and reads as
       nothing. Scale both with the formation's own spread.

       Halved once from the pass that got these working — at full strength
       the cursor tore holes in the formation rather than parting it — and
       trimmed again since, unevenly, because the four formations were never
       equally loud. Measured as the share of *canvas* pixels the cursor
       moves beyond the field's own drift, probing a ring of positions and
       keeping the strongest:

         polaris 0.83pp · vortex 0.40 · sphere 0.14 · waves 0.06

       So polaris carried almost all of what read as "too much interaction",
       and it takes almost all of the cut: push 20 -> 9, rep 150 -> 120.
       Sphere and waves were always subtle and get a light trim only —
       cutting them further just switched them off, which is not the brief.
       The field now sits behind body copy on eleven pages, three of them
       solid prose, and a wake following the reading cursor competes with
       the words.

       Two ways this measurement lies, both hit:
         - Probing viewport centre reports the sphere as inert. It is a
           *shell*; the centre ray lands at the origin and no points are
           within `rep` of it. Probe a ring.
         - Moving the pointer also fires DOM hover states, and one heading
           changing colour swamps every dot on screen. Hide .nav, main and
           footer and measure the canvas alone, against a parked-pointer
           control over the same interval.

       Tune these against the *whole viewport*, not a strip. Sampling a
       narrow band read vortex as inert and polaris as violent when the
       truth was the opposite — the formations occupy very different parts
       of the frame, and the work section hides most of the field behind
       opaque cards. */
    sphere:   { cam: [0, 0, 520],   mx: 120, my: 80,  lerp: .035, spin: [.00012, .00055], rep: 110, push: 8, plane: 'z' },
    // One rotation rate for every formation, taken from the sphere. Vortex
    // ran 3.3x and polaris 11x faster, which read as three different pieces
    // of software rather than one field changing shape. At a single slow
    // rate the morphs carry the change and the spin just breathes.
    vortex:   { cam: [0, 380, 380], mx: 60,  my: 35,  lerp: .040, spin: [0, .00055], rep: 130, push: 7, plane: 'y' },
    polaris:  { cam: [0, 380, 380], mx: 60,  my: 40,  lerp: .040, spin: [0, .00055], rep: 120, push: 9, plane: 'y' },
    waves:    { cam: [0, 0, 600],   mx: 30,  my: 20,  lerp: .030, spin: [0, 0], rep: 280, push: 22, plane: 'z' }
  };
  var mode = MODES.sphere, current = "sphere";

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
    morphTo(name === "sphere"   ? sphere()
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

  basePos.set(sphere());
  rendered.set(basePos);
  morphTo(sphere(), 2400);

  var cursorWorld = new THREE.Vector3();
  var ndc = new THREE.Vector3();
  var localCursor = new THREE.Vector3();
  var visible = true, drifting = false;
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

    // Repulsion runs the whole page, not just the hero. It was scoped to
    // the hero for a while and the field went inert everywhere below it,
    // which is the more obvious loss: the cursor interaction is most of
    // what makes the background feel alive rather than printed.
    var repel = !reduce.matches && fine.matches;

    if (repel) {
      /* Put the cursor on the formation's OWN plane, not on a sphere around
         the camera.

         The old version pushed it a fixed |camera| along the view ray,
         which lands on a spherical cap facing the viewer. That is fine for
         the sphere, whose points sit on a shell — but vortex and polaris
         are flat discs in the XZ plane, so the cursor point only ever came
         near them along a single line and the field read as inert. Raising
         the repulsion radius did nothing, because reach was never the
         problem: the cursor was in the wrong place.

         Intersecting the ray with y=0 (discs) or z=0 (shell and sheets)
         puts it where the particles actually are. */
      ndc.set(mnx, mny, 0.5).unproject(camera).sub(camera.position).normalize();
      var axis = mode.plane === "y" ? "y" : "z";
      var denom = ndc[axis];
      var t = Math.abs(denom) < 1e-4
        ? camera.position.length()                    // ray parallel to the plane
        : -camera.position[axis] / denom;
      if (t < 0) t = camera.position.length();
      cursorWorld.copy(camera.position).add(ndc.multiplyScalar(t));
      swarm.updateMatrixWorld();
      localCursor.copy(cursorWorld);
      swarm.worldToLocal(localCursor);
    }

    // `drifting` keeps the decay running for a few frames after the hero
    // leaves, so the field eases back instead of snapping flat — and lets
    // everything below fall through to the cheap path once it has.
    if (repel || drifting) {
      var R = mode.rep || 90, R2 = R * R, live = false;
      for (var j = 0; j < COUNT; j++) {
        var k = j * 3;
        if (repel) {
          var dx = basePos[k] - localCursor.x,
              dy = basePos[k+1] - localCursor.y,
              dz = basePos[k+2] - localCursor.z;
          var d2 = dx*dx + dy*dy + dz*dz;
          if (d2 < R2) {
            var d = Math.sqrt(d2) || 0.001;
            var f = (1 - d / R) * (mode.push || 19);
            offset[k] += (dx / d) * f; offset[k+1] += (dy / d) * f; offset[k+2] += (dz / d) * f;
          }
        }
        offset[k] *= 0.90; offset[k+1] *= 0.90; offset[k+2] *= 0.90;
        if (!live && (offset[k] > .01 || offset[k] < -.01)) live = true;
        rendered[k]   = basePos[k]   + offset[k];
        rendered[k+1] = basePos[k+1] + offset[k+1];
        rendered[k+2] = basePos[k+2] + offset[k+2];
      }
      drifting = repel || live;
    } else {
      rendered.set(basePos);
    }

    posAttr.needsUpdate = true;       // shared — one flag covers all three
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  // The wave sheets and the sphere shell are both sized from the viewport,
  // so both have to be rebuilt when it changes. The sphere is debounced and
  // re-morphed rather than snapped: resize fires continuously through a
  // window drag, and rebuilding on every event would re-target the morph
  // dozens of times a second. A phone rotating 90° is the case that matters
  // — the shell fits the *narrow* extent, and without this a landscape
  // globe would stay phone-sized after the turn.
  var resizeTimer;
  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    buildGrid();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (current === "sphere") morphTo(sphere(), 600);
    }, 200);
  }, { passive: true });
})();
