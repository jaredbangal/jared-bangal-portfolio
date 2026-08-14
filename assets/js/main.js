/* Progressive enhancement only.
   Without this file the page still reads, navigates, and submits — the
   browser's native form validation and a normal POST take over. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ── Scroll reveals ─────────────────────────────────────
     Only opt into the hidden start state once we know we can undo it. */
  if (!reducedMotion.matches && "IntersectionObserver" in window) {
    root.classList.add("js");

    // The entrance stagger is a transition-delay, and a transition-delay
    // applies to everything that element ever transitions — not just the
    // entrance. Clearing it once the entrance is over is what keeps a
    // hover on the fourth card as immediate as one on the first.
    function settle(el) {
      var timer;
      function done(e) {
        if (e && e.target !== el) return;
        el.classList.add("is-settled");
        el.removeEventListener("transitionend", done);
        clearTimeout(timer);
      }
      el.addEventListener("transitionend", done);
      // transitionend never fires if the entrance was not actually
      // animated — a background tab, or an element already at its end
      // state. Long enough to outlast --dur-slow plus the largest stagger.
      timer = setTimeout(done, 1400);
    }

    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealer.unobserve(entry.target);
        settle(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(function (el) {
      revealer.observe(el);
    });
  }

  /* ── Card tilt ──────────────────────────────────────────
     Leans the service cards toward the pointer and moves a glare with it.
     Everything here is decoration: without this file the cards are still
     frosted, still lift, still take the accent — only the lean is missing.

     Gated on a fine pointer. A touch device has no hover to reverse the
     tilt out of, and would be left holding a card at an angle. */
  var tiltHost = document.querySelector("[data-tilt]");

  if (tiltHost && !reducedMotion.matches &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches) {

    var MAX = 5;   // degrees. Restrained on purpose — this page is quiet,
                   // and a card that swings reads as a gimmick.

    [].slice.call(tiltHost.querySelectorAll(".card")).forEach(function (card) {
      var frame = null, rect = null;

      function apply(e) {
        frame = null;
        if (!rect) return;
        var px = (e.clientX - rect.left) / rect.width;    // 0…1
        var py = (e.clientY - rect.top) / rect.height;
        // Away from the pointer on X, toward it on Y — that pairing is what
        // reads as a surface being pushed rather than a box being spun.
        card.style.setProperty("--ry", ((px - 0.5) * 2 * MAX).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - py) * 2 * MAX).toFixed(2) + "deg");
        card.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
      }

      card.addEventListener("pointerenter", function () {
        // Measured once per entry, not per move: getBoundingClientRect in a
        // pointermove handler forces layout on every frame.
        rect = card.getBoundingClientRect();
        card.setAttribute("data-tracking", "");
      });

      card.addEventListener("pointermove", function (e) {
        if (frame) return;                    // one update per frame, no more
        frame = requestAnimationFrame(function () { apply(e); });
      }, { passive: true });

      card.addEventListener("pointerleave", function () {
        if (frame) { cancelAnimationFrame(frame); frame = null; }
        rect = null;
        // Drop the flag first so the transition is back in play and the card
        // eases home instead of snapping.
        card.removeAttribute("data-tracking");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ── Nav state ──────────────────────────────────────────
     Transparent over the hero, blurred bar once past it. A
     sentinel element beats a scroll listener — no per-frame work. */
  var nav = document.querySelector("[data-nav]");
  var sentinel = document.getElementById("nav-sentinel");

  if (nav && sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) nav.removeAttribute("data-scrolled");
        else nav.setAttribute("data-scrolled", "");
      });
    }, { threshold: 0 }).observe(sentinel);
  }

  /* ── Nav disclosure panels ──────────────────────────────
     Hover opens them for a mouse, but hover alone is not an interface:
     the trigger is a real <button aria-expanded>, so click, Enter, Space
     and Escape all work, and touch — which has no hover — gets the same
     behaviour through click. */
  var menuItems = [].slice.call(document.querySelectorAll("[data-menu]"));

  if (menuItems.length && nav) {
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    // Must match the drawer breakpoint in styles.css.
    var barLayout = window.matchMedia("(min-width: 901px)");
    var closeTimer = null;

    function panelOf(item) { return item.querySelector(".nav__panel"); }
    function triggerOf(item) { return item.querySelector(".nav__trigger"); }

    function close(item) {
      item.removeAttribute("data-open");
      triggerOf(item).setAttribute("aria-expanded", "false");
    }

    function closeAll(except) {
      menuItems.forEach(function (item) { if (item !== except) close(item); });
      if (!menuItems.some(function (i) { return i.hasAttribute("data-open"); })) {
        nav.removeAttribute("data-menu-open");
      }
    }

    // The panel is centred on the bar, not on its trigger, so the caret is
    // the only thing tying the two together. Measured rather than guessed:
    // the panel's width depends on its content and the bar's on the viewport.
    function aimCaret(item) {
      var panel = panelOf(item);
      var t = triggerOf(item).getBoundingClientRect();
      var p = panel.getBoundingClientRect();
      if (!p.width) return;
      // Keep the point on the panel, with a corner's clearance at each end.
      var x = Math.min(Math.max(t.left + t.width / 2 - p.left, 18), p.width - 18);
      panel.style.setProperty("--caret-x", x + "px");
    }

    function open(item) {
      clearTimeout(closeTimer);
      closeAll(item);
      item.setAttribute("data-open", "");
      triggerOf(item).setAttribute("aria-expanded", "true");
      nav.setAttribute("data-menu-open", "");
      aimCaret(item);
    }

    function toggle(item) {
      if (item.hasAttribute("data-open")) { close(item); closeAll(); }
      else open(item);
    }

    menuItems.forEach(function (item) {
      var trigger = triggerOf(item);
      var panel = panelOf(item);

      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        toggle(item);
      });

      // Hover drives the bar layout only. In the drawer the panels are an
      // accordion, where mouseenter would open a section and the click that
      // follows would immediately close it again. Checked at event time,
      // not attach time, so resizing the window behaves.
      item.addEventListener("mouseenter", function () {
        if (canHover.matches && barLayout.matches) open(item);
      });
      // A grace period on leave: the pointer has to cross a gap between the
      // trigger and the panel, and the menu must not vanish mid-trip.
      item.addEventListener("mouseleave", function () {
        if (!canHover.matches || !barLayout.matches) return;
        clearTimeout(closeTimer);
        closeTimer = setTimeout(function () { close(item); closeAll(); }, 220);
      });

      // Tabbing past the last link in the panel should close it, not leave
      // an orphaned panel hanging over the page.
      item.addEventListener("focusout", function (e) {
        if (!item.contains(e.relatedTarget)) { close(item); closeAll(); }
      });

      panel.addEventListener("click", function (e) {
        if (e.target.closest("a")) { close(item); closeAll(); }
      });
    });

    // The bar reflows on resize and the panel's centre moves with it.
    window.addEventListener("resize", function () {
      menuItems.forEach(function (item) {
        if (item.hasAttribute("data-open")) aimCaret(item);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var openItem = menuItems.filter(function (i) { return i.hasAttribute("data-open"); })[0];
      if (!openItem) return;
      triggerOf(openItem).focus();
      close(openItem);
      closeAll();
    });

    /* The narrow-screen drawer. Same triggers inside it, behaving as an
       accordion — nothing about the panels changes, only where they sit. */
    var burger = document.querySelector("[data-nav-toggle]");

    function closeDrawer() {
      if (!burger) return;
      nav.removeAttribute("data-nav-open");
      burger.setAttribute("aria-expanded", "false");
    }

    if (burger) {
      burger.addEventListener("click", function () {
        var open = nav.hasAttribute("data-nav-open");
        if (open) { closeDrawer(); closeAll(); }
        else {
          nav.setAttribute("data-nav-open", "");
          burger.setAttribute("aria-expanded", "true");
        }
      });

      // A chosen destination should put the menu away.
      document.querySelectorAll(".nav__links a").forEach(function (link) {
        link.addEventListener("click", closeDrawer);
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.hasAttribute("data-nav-open")) {
        if (burger) burger.focus();
        closeDrawer();
        closeAll();
      }
    });

    document.addEventListener("pointerdown", function (e) {
      if (e.target.closest("[data-menu]")) return;
      closeAll();
      if (!e.target.closest(".nav")) closeDrawer();
    });
  }

  /* ── Concept carousel ───────────────────────────────────
     Endless in both directions: the last two slides are cloned before the
     first and the first two after the last, so there is always a
     neighbour peeking on each side. When the scroll settles on a clone the
     position is corrected by exactly one set — instantly and without
     smoothing, so it is invisible.

     Native scroll-snap does the moving, so with this file removed the
     track still scrolls and snaps; it just does not wrap. */
  var showcase = document.querySelector("[data-showcase]");

  if (showcase) {
    var track = showcase.querySelector(".showcase__track");
    var tabs = [].slice.call(showcase.querySelectorAll("[data-tab]"));
    var real = [].slice.call(showcase.querySelectorAll("[data-slide]"));
    var N = real.length;
    var CLONES = Math.min(2, N);
    var hoverTimer = null, settleTimer = null, correcting = false;

    function makeClone(node) {
      var copy = node.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.dataset.clone = "true";
      // Duplicates must not be reachable by keyboard or announced twice.
      copy.querySelectorAll("a, button, [tabindex]").forEach(function (el) {
        el.setAttribute("tabindex", "-1");
      });
      return copy;
    }

    if (N > 1) {
      var head = document.createDocumentFragment();
      for (var i = N - CLONES; i < N; i++) head.appendChild(makeClone(real[i]));
      track.insertBefore(head, track.firstChild);

      var tail = document.createDocumentFragment();
      for (var j = 0; j < CLONES; j++) tail.appendChild(makeClone(real[j]));
      track.appendChild(tail);
    }

    var all = [].slice.call(track.children);

    function offsetFor(index) {
      var el = all[index];
      return el.offsetLeft - (track.clientWidth - el.clientWidth) / 2;
    }

    function goTo(index, smooth) {
      var left = offsetFor(index);
      if (smooth && !reducedMotion.matches) {
        track.scrollTo({ left: left, behavior: "smooth" });
        return;
      }
      // Not `behavior: "auto"` — that defers to the CSS scroll-behavior,
      // which is smooth here, and would animate the clone correction across
      // the whole set in full view instead of hiding it.
      var previous = track.style.scrollBehavior;
      track.style.scrollBehavior = "auto";
      track.scrollLeft = left;
      track.style.scrollBehavior = previous;
    }

    function centredIndex() {
      var mid = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bestDistance = Infinity;
      all.forEach(function (el, i) {
        var d = Math.abs(el.offsetLeft + el.clientWidth / 2 - mid);
        if (d < bestDistance) { bestDistance = d; best = i; }
      });
      return best;
    }

    function markCurrent(name) {
      tabs.forEach(function (tab) {
        if (tab.dataset.tab === name) tab.setAttribute("aria-current", "true");
        else tab.removeAttribute("aria-current");
      });
    }

    // Land on the clone that is nearest the current position, so stepping
    // from the last concept to the first travels forward rather than
    // rewinding through the whole set.
    function show(name, smooth) {
      var home = -1;
      real.forEach(function (el, i) { if (el.dataset.slide === name) home = i + CLONES; });
      if (home < 0) return;

      var here = track.scrollLeft;
      var best = home, bestDistance = Infinity;
      [home - N, home, home + N].forEach(function (candidate) {
        if (candidate < 0 || candidate >= all.length) return;
        var d = Math.abs(offsetFor(candidate) - here);
        if (d < bestDistance) { bestDistance = d; best = candidate; }
      });
      goTo(best, smooth !== false);
    }

    function settle() {
      var index = centredIndex();
      markCurrent(all[index].dataset.slide);
      if (index >= CLONES && index < CLONES + N) return;
      // On a clone — jump one full set to its real twin.
      correcting = true;
      goTo(index < CLONES ? index + N : index - N, false);
      requestAnimationFrame(function () { correcting = false; });
    }

    track.addEventListener("scroll", function () {
      if (correcting) return;
      markCurrent(all[centredIndex()].dataset.slide);
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 120);
    }, { passive: true });

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { show(tab.dataset.tab); });

      // Hover previews, as on theirs. Debounced so dragging the pointer
      // across the row does not fire five scrolls.
      tab.addEventListener("mouseenter", function () {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(function () { show(tab.dataset.tab); }, 120);
      });
      tab.addEventListener("mouseleave", function () { clearTimeout(hoverTimer); });

      tab.addEventListener("keydown", function (e) {
        var step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        var next = tabs[(i + step + tabs.length) % tabs.length];
        next.focus();
        show(next.dataset.tab);
      });
    });

    /* Auto-advance. Same contract as the hero stage: hover suspends,
       and taking hold of a tab — or scrolling the track yourself — stops
       it for good. The tabs are therefore the WCAG 2.2.2 stop mechanism,
       and unlike hover they are reachable by touch and keyboard.

       Slower than the hero's 2s because these cards carry copy you are
       meant to read, and it only runs while the section is actually on
       screen — a carousel cycling three viewports away is pure battery. */
    var autoTimer = null, autoStopped = false, inView = false;

    function autoStop() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
    function autoStart() {
      autoStop();
      if (autoStopped || !inView || reducedMotion.matches) return;
      autoTimer = setInterval(function () {
        var here = ((centredIndex() - CLONES) % N + N) % N;
        show(real[(here + 1) % N].dataset.slide);
      }, 4000);
    }
    function autoTake() { autoStopped = true; autoStop(); }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", autoTake);
      tab.addEventListener("keydown", autoTake);
    });
    // A real drag or wheel is the user taking over; our own scrollTo also
    // fires `scroll`, so that event cannot be the signal.
    ["wheel", "touchstart", "pointerdown"].forEach(function (evt) {
      track.addEventListener(evt, autoTake, { passive: true });
    });
    /* Hover-to-suspend is bound to the track and the tab row, NOT the
       section. The section is full-bleed and taller than the viewport, so
       a pointerenter on it fires the moment the cursor is anywhere on
       screen and never leaves — the carousel would sit permanently
       suspended and look like it simply does not auto-advance. */
    [track, showcase.querySelector(".showcase__tabs")].forEach(function (el) {
      if (!el) return;
      el.addEventListener("pointerenter", autoStop);
      el.addEventListener("pointerleave", autoStart);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) autoStop(); else autoStart();
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) autoStart(); else autoStop();
      }, { threshold: 0.25 }).observe(showcase);
    } else {
      inView = true;
      autoStart();
    }

    // Start on the first real slide, with its neighbours already flanking it.
    requestAnimationFrame(function () { goTo(CLONES, false); });
    window.addEventListener("resize", function () {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () { goTo(centredIndex(), false); }, 150);
    });
  }

  /* ── Stat counters ──────────────────────────────────────
     Counts each figure up from zero the first time it scrolls into view,
     once, and never again — a number that re-runs every time you pass it
     stops being information and becomes a fidget.

     The final value is already in the HTML, so with this file removed the
     figures simply read correctly. The animated span is aria-hidden and
     sits beside a visually-hidden copy of the true value, so assistive
     tech never sees a partial number no matter when it looks. */
  var counters = [].slice.call(document.querySelectorAll("[data-count-to]"));

  if (counters.length && !reducedMotion.matches && "IntersectionObserver" in window) {
    var COUNT_MS = 1400;

    function runCount(el) {
      var target = parseInt(el.getAttribute("data-count-to"), 10);
      if (isNaN(target)) return;
      var started = null;

      function frame(now) {
        if (started === null) started = now;
        var t = Math.min((now - started) / COUNT_MS, 1);
        // easeOutQuart, the same curve everything else enters on.
        var eased = 1 - Math.pow(1 - t, 4);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(frame);
      }

      el.textContent = "0";
      requestAnimationFrame(frame);
    }

    var counterWatch = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        counterWatch.unobserve(entry.target);
        runCount(entry.target);
      });
    }, { rootMargin: "0px 0px -15% 0px", threshold: 0.6 });

    counters.forEach(function (el) { counterWatch.observe(el); });
  }

  /* ── Hero stage ─────────────────────────────────────────
     The six concepts on a self-advancing track. All script does is set
     --i, the slide index; the stylesheet turns that into a translate. The
     arrangement in the HTML is already a valid composition with this file
     removed — there are simply no clones, so it does not wrap.

     Clones follow the Selected Work pattern: the last two slides go before
     the first and the first two after the last, so a neighbour always
     peeks on both sides and the set can be stepped through without ever
     rewinding across it. When the index lands on a clone the position is
     corrected by exactly one set, with the transition suppressed — an
     animated correction is precisely the artefact the clones exist to
     hide.

     There is no pause button. Taking hold of an arrow or a dot stops the
     auto-advance for good, which is the stop mechanism WCAG 2.2.2 wants
     and, unlike hover, is reachable by touch and by keyboard. Hover only
     suspends it. */
  /* Scoped in its own IIFE, and that is not stylistic. `var` is
     function-scoped, so every `var` in this file shares one scope — and
     this block declares `track`, `real`, `all` and `CLONES`, which are the
     exact names the Selected Work carousel above uses. Because this runs
     later, it silently reassigned all four out from under that block's
     closures: its tabs stopped scrolling the track and its current-tab
     marker cleared itself, with no error anywhere. Keep new blocks
     isolated the same way. */
  (function () {
    var stage = document.querySelector("[data-hero-stage]");

    if (stage) {
      var track = stage.querySelector(".stage__track");
      var real  = track ? Array.prototype.slice.call(track.children) : [];
      var n     = real.length;

      if (track && n > 1) {
        var CLONES = 2;
        var STEP   = 2000;

        // The opening slide is the *second* in source order, so that both
        // neighbours exist without clones and the no-JS composition is
        // symmetric. That is the same slide the stylesheet's `--i: 1`
        // default centres — change one and the page opens on a different
        // concept depending on whether this file loaded. Source order is
        // therefore also the running order; see the hero stage in index.html.
        var START = 1;
        var idx = CLONES + START, timer = null, taken = false;

        for (var c = 0; c < CLONES; c++) {
          var head = real[n - 1 - c].cloneNode(true);
          head.setAttribute("aria-hidden", "true");
          track.insertBefore(head, track.firstChild);
          var tail = real[c].cloneNode(true);
          tail.setAttribute("aria-hidden", "true");
          track.appendChild(tail);
        }

        // Re-read after cloning: `real` is the six concepts, `all` is the ten
        // elements actually in the track, and depth is assigned over `all`.
        var all = Array.prototype.slice.call(track.children);

        function realIndex() { return ((idx - CLONES) % n + n) % n; }

        /* Order matters here, and getting it wrong is invisible in a
           screenshot: *every* state change has to land inside the silenced
           window, not just --i. The depth attributes were being written
           after `data-jump` came off, so at each wrap the whole set
           re-stacked with transitions live and eased for 600ms on top of a
           correction that is supposed to be instantaneous. It only showed up
           by tracing the centre slide's rendered height frame by frame. */
        function paint(animate) {
          if (!animate) track.setAttribute("data-jump", "");

          track.style.setProperty("--i", String(idx));

          // Position in the run, clamped: the stylesheet turns it into depth,
          // so the centre stands proud of its neighbours. Clamped at ±2
          // because anything further is off the edge at every breakpoint and
          // only needs to be already turned when it enters the frame.
          all.forEach(function (el, k) {
            var d = Math.max(-2, Math.min(2, k - idx));
            var pos = String(d);
            if (el.getAttribute("data-pos") !== pos) el.setAttribute("data-pos", pos);
          });

          if (!animate) {
            void track.offsetWidth;              // flush every one of the above,
            track.removeAttribute("data-jump");  // or lifting the silence lets
          }                                      // them transition after all

          // Written only when it actually changes. The loop correction lands
          // on a clone of the slide already showing, so both paints resolve
          // to the same dot — and re-setting aria-current to the value it
          // already holds still fires a mutation, which a screen reader can
          // announce a second time.
          var r = realIndex();
          dots.forEach(function (d, k) {
            var want = k === r ? "true" : "false";
            if (d.getAttribute("aria-current") !== want) d.setAttribute("aria-current", want);
          });
        }

        function step(dir) { idx += dir; paint(true); }

        // The correction happens after the move lands, not during it, so the
        // travel a viewer sees is always exactly one slide.
        track.addEventListener("transitionend", function (e) {
          if (e.propertyName !== "transform") return;
          if (idx >= CLONES + n) { idx -= n; paint(false); }
          else if (idx < CLONES) { idx += n; paint(false); }
        });

        function stop()  { if (timer) { clearInterval(timer); timer = null; } }
        function start() {
          stop();
          if (taken || reducedMotion.matches) return;
          timer = setInterval(function () { step(1); }, STEP);
        }
        function take() { taken = true; stop(); }

        var controls = document.createElement("div");
        controls.className = "stage__controls";

        function arrow(dir, label, d) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "stage__arrow stage__arrow--" + (dir < 0 ? "prev" : "next");
          b.setAttribute("aria-label", label);
          b.innerHTML = '<svg viewBox="0 0 6 10" aria-hidden="true"><path d="' + d +
                        '" stroke-linecap="round" stroke-linejoin="round"/></svg>';
          b.addEventListener("click", function () { take(); step(dir); });
          return b;
        }

        controls.appendChild(arrow(-1, "Previous concept", "M5 1L1 5l4 4"));

        var dots = real.map(function (el, i) {
          var img  = el.querySelector("img");
          var name = img ? (img.getAttribute("alt") || "").split(",")[0] : "Slide " + (i + 1);
          var b = document.createElement("button");
          b.type = "button";
          b.className = "stage__dot";
          b.setAttribute("aria-label", "Show " + name);
          b.addEventListener("click", function () {
            take();
            // Travel to whichever copy of the target is nearer, so jumping
            // from the last concept to the first goes forward rather than
            // rewinding the whole set.
            var want = CLONES + i, here = idx;
            if (Math.abs(want + n - here) < Math.abs(want - here)) want += n;
            else if (Math.abs(want - n - here) < Math.abs(want - here)) want -= n;
            idx = want;
            paint(true);
          });
          controls.appendChild(b);
          return b;
        });

        controls.appendChild(arrow(1, "Next concept", "M1 1l4 4-4 4"));
        stage.parentNode.insertBefore(controls, stage);

        // Hover suspends; it does not count as taking control, so the
        // carousel picks up again when the pointer leaves.
        stage.addEventListener("pointerenter", stop);
        stage.addEventListener("pointerleave", start);
        controls.addEventListener("pointerenter", stop);
        controls.addEventListener("pointerleave", start);
        controls.addEventListener("focusin", stop);
        document.addEventListener("visibilitychange", function () {
          if (document.hidden) stop(); else start();
        });
        reducedMotion.addEventListener("change", start);

        paint(false);
        start();
      }
    }
  })();

  /* ── Testimonial marquee ────────────────────────────────
     The CSS animation runs to exactly -50%, so the track has to hold the
     set twice for the wrap to land invisibly. Doubling it here rather
     than in the markup keeps one copy in the source, and means that with
     this file removed there is no half-set to animate off the screen —
     the viewport is just a scrollable row of reviews.

     Also builds the pause control. It only exists when the motion does,
     which is why it is not in the HTML: a pause button for an animation
     that never starts is a dead control. */
  var marquee = document.querySelector("[data-marquee]");

  if (marquee) {
    var mTrack = marquee.querySelector("[data-marquee-track]");
    var originals = [].slice.call(mTrack.children);

    if (originals.length) {
      var dup = document.createDocumentFragment();
      originals.forEach(function (item) {
        var copy = item.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        // The second set is the same reviews. It must not be read out
        // twice, nor collect tab stops.
        copy.querySelectorAll("a, button, [tabindex]").forEach(function (el) {
          el.setAttribute("tabindex", "-1");
        });
        dup.appendChild(copy);
      });
      mTrack.appendChild(dup);

      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "marquee__toggle";
      toggle.setAttribute("aria-pressed", "false");
      toggle.textContent = "Pause";

      toggle.addEventListener("click", function () {
        var paused = marquee.toggleAttribute("data-paused");
        toggle.setAttribute("aria-pressed", String(paused));
        toggle.textContent = paused ? "Play" : "Pause";
      });

      marquee.appendChild(toggle);
      marquee.setAttribute("data-marquee-ready", "");

      // Reduced motion gets the row without the drift. Live, not read
      // once — a preference toggled mid-session takes effect here.
      var applyMotion = function () {
        if (reducedMotion.matches) marquee.removeAttribute("data-marquee-ready");
        else marquee.setAttribute("data-marquee-ready", "");
        toggle.hidden = reducedMotion.matches;
      };
      applyMotion();
      if (reducedMotion.addEventListener) {
        reducedMotion.addEventListener("change", applyMotion);
      }
    }
  }

  /* ── Current-section indicator ──────────────────────────
     Marks the nav link whose section is nearest the top of the
     viewport, so the nav reflects where you actually are. */
  // [data-spy] rather than every hash link in the bar — the panels are full
  // of them, and a panel link is not a top-level location.
  var navLinks = [].slice.call(document.querySelectorAll(".nav__links [data-spy]"));

  if (navLinks.length && "IntersectionObserver" in window) {
    var sections = navLinks
      .map(function (link) { return document.querySelector(link.getAttribute("data-spy")); })
      .filter(Boolean);
    var visible = new Set();

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });

      // Topmost visible section wins.
      var current = sections
        .filter(function (s) { return visible.has(s.id); })
        .map(function (s) { return s.id; })[0];

      navLinks.forEach(function (link) {
        if (current && link.getAttribute("data-spy") === "#" + current) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-80px 0px -55% 0px", threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ── Forms ──────────────────────────────────────────────
     Validate on blur (never per keystroke), show the message beside the
     field that caused it, and move focus to the first problem on submit. */
  var MESSAGES = {
    valueMissing: {
      name:  "Add your name so I know who I'm replying to.",
      email: "Add your email so I can reply.",
      _:     "This field is required."
    },
    typeMismatch: {
      email: "That doesn't look like an email address — check for a missing @.",
      _:     "Check the format of this value."
    },
    _: "Please check this field."
  };

  function messageFor(input) {
    var key = input.validity.valueMissing ? "valueMissing"
            : input.validity.typeMismatch ? "typeMismatch"
            : null;
    if (!key) return MESSAGES._;
    var set = MESSAGES[key];
    return set[input.name] || set._;
  }

  function fieldOf(input) { return input.closest("[data-field]"); }

  function showError(input, message) {
    input.setAttribute("aria-invalid", "true");
    var field = fieldOf(input);
    // Compact forms (the newsletter) have no per-field slot; their one
    // status line carries the message instead.
    if (!field) { setStatus(input.form, "error", message); return; }
    field.classList.add("field--invalid");
    var slot = field.querySelector("[data-error]");
    if (slot) slot.textContent = message;
  }

  function clearError(input) {
    input.removeAttribute("aria-invalid");
    var field = fieldOf(input);
    if (!field) { setStatus(input.form, "", ""); return; }
    field.classList.remove("field--invalid");
    var slot = field.querySelector("[data-error]");
    if (slot) slot.textContent = "";
  }

  function validate(input) {
    if (input.checkValidity()) { clearError(input); return true; }
    showError(input, messageFor(input));
    return false;
  }

  function setStatus(form, state, message) {
    var status = form.querySelector("[data-status]");
    if (!status) return;
    status.dataset.state = state;
    status.textContent = message;
  }

  document.querySelectorAll("form[novalidate]").forEach(function (form) {
    var inputs = [].slice.call(form.querySelectorAll("input"));
    var submit = form.querySelector('button[type="submit"]');

    inputs.forEach(function (input) {
      input.addEventListener("blur", function () {
        if (input.value !== "" || input.required) validate(input);
      });
      // Once a field is marked bad, clear it as soon as it's good again.
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true" && input.checkValidity()) {
          clearError(input);
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var bad = inputs.filter(function (i) { return !validate(i); });
      if (bad.length) {
        // Per-field messages already say what's wrong; the status line just
        // counts them. Compact forms keep the message showError() wrote.
        if (fieldOf(bad[0])) {
          setStatus(form, "error", bad.length === 1
            ? "One field needs a fix."
            : bad.length + " fields need a fix.");
        }
        bad[0].focus();
        return;
      }

      // No handler wired yet — action="#" is the placeholder. Swap this
      // block for a fetch() to your form endpoint.
      if (form.getAttribute("action") === "#") {
        setStatus(form, "error",
          "This form isn't connected yet — email hello@jaredbangal.com in the meantime.");
        return;
      }

      setStatus(form, "", "");
      if (submit) {
        submit.setAttribute("aria-busy", "true");
        submit.disabled = true;
      }

      fetch(form.action, {
        method: form.method || "post",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          form.reset();
          inputs.forEach(clearError);
          setStatus(form, "success", "Thanks — I'll get back to you within a day or two.");
        })
        .catch(function () {
          setStatus(form, "error",
            "That didn't send. Try again, or email hello@jaredbangal.com.");
        })
        .finally(function () {
          if (submit) {
            submit.removeAttribute("aria-busy");
            submit.disabled = false;
          }
        });
    });
  });
})();
