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

    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

    document.querySelectorAll(".reveal").forEach(function (el) {
      revealer.observe(el);
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

    function open(item) {
      clearTimeout(closeTimer);
      closeAll(item);
      item.setAttribute("data-open", "");
      triggerOf(item).setAttribute("aria-expanded", "true");
      nav.setAttribute("data-menu-open", "");
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
     The track scrolls natively with snap points, so it works with this
     file removed. The tabs only set scrollLeft, and an observer reads the
     scroll position back so the pills stay honest when you swipe. */
  var showcase = document.querySelector("[data-showcase]");

  if (showcase) {
    var track = showcase.querySelector(".showcase__track");
    var tabs = [].slice.call(showcase.querySelectorAll("[data-tab]"));
    var slides = [].slice.call(showcase.querySelectorAll("[data-slide]"));
    var hoverTimer = null;

    function slideFor(name) {
      return slides.filter(function (s) { return s.dataset.slide === name; })[0];
    }

    function show(name) {
      var slide = slideFor(name);
      if (!slide) return;
      // scrollTo on the track, not scrollIntoView — the latter also scrolls
      // the page vertically to bring the section into view.
      track.scrollTo({
        left: slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2,
        behavior: reducedMotion.matches ? "auto" : "smooth"
      });
    }

    function markCurrent(name) {
      tabs.forEach(function (tab) {
        if (tab.dataset.tab === name) tab.setAttribute("aria-current", "true");
        else tab.removeAttribute("aria-current");
      });
    }

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
        var next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
        if (next === null) return;
        e.preventDefault();
        var target = tabs[(next + tabs.length) % tabs.length];
        target.focus();
        show(target.dataset.tab);
      });
    });

    if ("IntersectionObserver" in window) {
      var spyShow = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) markCurrent(entry.target.dataset.slide);
        });
      }, { root: track, threshold: 0.6 });
      slides.forEach(function (s) { spyShow.observe(s); });
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
