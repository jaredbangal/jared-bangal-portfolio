"""python3 tools/qa/sweep.py   (needs `python3 serve.py` running)

Pre-deploy sweep: 13 pages x 3 widths x 2 themes.

HTTP >= 400, page errors, console errors, horizontal overflow, duplicate ids,
dead in-page anchors, broken images (lazy images forced eager and awaited
first -- a lazy image outside the viewport reports naturalWidth 0 and is not
broken), and the scan-code wiring: field-qr on the home page only.
"""
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8777/"
PAGES = ["index.html", "services.html", "pricing.html", "products.html", "privacy.html",
         "terms.html", "404.html"] + ["work/%s.html" % s for s in
         ("botanica", "borough", "kettle", "sunday", "meridian", "northline")]
SIZES = [(1440, 900), (860, 1000), (390, 844)]
GL = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]

PROBE = """async () => {
  const out = {};
  out.overflow = document.documentElement.scrollWidth - innerWidth;
  const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
  out.dupIds = [...new Set(ids.filter((v, i) => ids.indexOf(v) !== i))];
  out.deadAnchors = [...document.querySelectorAll('a[href^="#"]')]
    .map(a => a.getAttribute('href')).filter(h => h.length > 1 && !document.getElementById(h.slice(1)));
  const imgs = [...document.images];
  imgs.forEach(i => i.loading = 'eager');
  await Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 8000); })));
  out.brokenImgs = imgs.filter(i => !i.naturalWidth).map(i => i.getAttribute('src'));
  out.fieldQr = document.documentElement.classList.contains('field-qr');
  out.slot = !!document.querySelector('[data-qr-slot]');
  out.theme = document.documentElement.dataset.theme || 'light';
  return out;
}"""

problems, loads = [], 0
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=GL)
    for scheme in ("light", "dark"):
        for (w, h) in SIZES:
            ctx = browser.new_context(viewport={"width": w, "height": h}, color_scheme=scheme)
            for path in PAGES:
                page = ctx.new_page()
                tag = "%s %dx%d %s" % (path, w, h, scheme)
                page.on("pageerror", lambda e, t=tag: problems.append("%s pageerror %s" % (t, e)))
                page.on("console", lambda m, t=tag: m.type == "error" and problems.append("%s console %s" % (t, m.text)))
                page.on("response", lambda r, t=tag: r.status >= 400 and problems.append("%s HTTP %d %s" % (t, r.status, r.url)))
                page.goto(BASE + path, wait_until="networkidle")
                page.wait_for_timeout(400)
                o = page.evaluate(PROBE)
                loads += 1
                if o["overflow"] > 0: problems.append("%s overflow %dpx" % (tag, o["overflow"]))
                if o["dupIds"]: problems.append("%s dup ids %s" % (tag, o["dupIds"]))
                if o["deadAnchors"]: problems.append("%s dead anchors %s" % (tag, o["deadAnchors"]))
                if o["brokenImgs"]: problems.append("%s broken imgs %s" % (tag, o["brokenImgs"]))
                if o["theme"] != scheme: problems.append("%s theme is %s" % (tag, o["theme"]))
                if (path == "index.html") != o["slot"] or o["slot"] != o["fieldQr"]:
                    problems.append("%s scan wiring slot=%s field-qr=%s" % (tag, o["slot"], o["fieldQr"]))
                page.close()
            ctx.close()
    browser.close()

# 404.html is served with a 404 status by design when fetched directly? It is
# fetched by path here, so any HTTP 404 on it would be the page itself.
print("loads:", loads, "| problems:", len(problems))
for x in problems[:60]:
    print("  ", x)
