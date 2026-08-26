/* Theme bootstrap — day/night.
   ============================================================
   **This one script is not deferred, and that is the whole point.** It has
   to set `data-theme` on <html> before the first paint, or every visitor on
   the dark theme gets a cream flash while the deferred bundle waits on the
   parser. It is ~1KB, same-origin and cached, which is the price of that.

   It is also a *separate file* rather than an inline <script>, because
   vercel.json sends `script-src 'self' https://cdnjs.cloudflare.com` with
   no 'unsafe-inline'. The usual no-flash snippet is inlined in the head;
   doing that here would mean either weakening the CSP for every script on
   the site or maintaining a sha256 hash that silently breaks the page the
   next time this file is edited by a character. An external blocking script
   costs one request and keeps the policy strict.

   No-JS therefore means light. That is the canonical design and it is fully
   functional, so it degrades to "the site as it shipped" rather than to
   anything broken. Honouring prefers-color-scheme without JS would need the
   entire dark palette written a second time inside a media query — and a
   duplicated palette is exactly how .on-dark went stale twice.
   ============================================================ */
(function () {
  var KEY  = "jb-theme";
  var root = document.documentElement;
  var mq   = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  // Reading localStorage throws outright in some privacy modes — not just
  // writing, and not just returning null. Both sides are wrapped.
  function stored() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "dark" || v === "light" ? v : null;
    } catch (e) { return null; }
  }

  function paint(theme) {
    root.setAttribute("data-theme", theme);
    // The browser chrome (mobile address bar) has to follow, or the page
    // sits in a cream frame in dark mode.
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#14171C" : "#E4E2DC");
  }

  function announce(theme) {
    root.dispatchEvent(new CustomEvent("themechange", { detail: { theme: theme } }));
  }

  var chosen = stored();
  paint(chosen || (mq && mq.matches ? "dark" : "light"));

  window.JBTheme = {
    get: function () {
      return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    },
    set: function (theme) {
      chosen = theme;
      try { localStorage.setItem(KEY, theme); } catch (e) {}
      paint(theme);
      announce(theme);
    }
  };

  /* Keep following the OS until the visitor overrides it themselves. Once
     they have picked, their choice outranks the system for good — flipping
     under them at sunset would read as a bug. */
  if (mq && mq.addEventListener) {
    mq.addEventListener("change", function (e) {
      if (chosen) return;
      paint(e.matches ? "dark" : "light");
      announce(window.JBTheme.get());
    });
  }
})();
