"""Render the scan section and save what a phone camera would see.

Writes <out>/<name>.png plus <out>/meta.json (slot rect per shot) for
qr_decode.py. python3 tools/qa/qr_capture.py [settled|film|scroll|reduced|fallback|all|all2]
Needs `python3 serve.py` running. Shots go to $QA_OUT or <tmp>/jb-qa.
"""
import json, os, sys, tempfile, time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8777/index.html"
OUT = os.environ.get("QA_OUT") or os.path.join(tempfile.gettempdir(), "jb-qa")
os.makedirs(OUT, exist_ok=True)
GL = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]

meta, errors = {}, []

def slot_rect(page):
    return page.evaluate("""() => { const r = document.querySelector('[data-qr-slot]').getBoundingClientRect();
        return {x:r.left, y:r.top, w:r.width, h:r.height, vw:innerWidth, vh:innerHeight}; }""")

def to_slot(page):
    page.evaluate("""() => { const s = document.querySelector('[data-qr-slot]');
        const r = s.getBoundingClientRect();
        window.scrollTo({top: scrollY + r.top + r.height/2 - innerHeight/2, behavior: 'instant'}); }""")

def open_page(browser, w, h, scheme, dpr=1, block_three=False):
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr,
                              color_scheme=scheme)
    page = ctx.new_page()
    tag = "%dx%d-%s" % (w, h, scheme)
    page.on("pageerror", lambda e: errors.append("%s pageerror %s" % (tag, e)))
    page.on("console", lambda m: m.type == "error" and errors.append("%s console %s" % (tag, m.text)))
    if block_three:
        page.route("**/three.min.js", lambda r: r.abort())
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(1200)
    return ctx, page

def shot(page, name):
    path = os.path.join(OUT, name + ".png")
    page.screenshot(path=path)
    meta[name] = dict(slot_rect(page), file=path,
                      theme=page.evaluate("document.documentElement.dataset.theme || 'light'"),
                      fieldqr=page.evaluate("document.documentElement.classList.contains('field-qr')"))

mode = sys.argv[1] if len(sys.argv) > 1 else "settled"
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=GL)

    if mode in ("settled", "all"):
        for (w, h, dpr) in [(1440, 900, 1), (860, 1000, 1), (390, 844, 2)]:
            for scheme in ("light", "dark"):
                ctx, page = open_page(browser, w, h, scheme, dpr)
                to_slot(page)
                page.wait_for_timeout(5200)
                shot(page, "settled-%d-%s" % (w, scheme))
                ctx.close()

    if mode in ("film", "all"):
        ctx, page = open_page(browser, 1440, 900, "light")
        shot(page, "film-00-hero")
        to_slot(page)
        t0 = time.time()
        for target in (0.25, 0.7, 1.2, 1.7, 2.2, 2.8, 3.4, 4.8):
            dt = target - (time.time() - t0)
            if dt > 0: page.wait_for_timeout(dt * 1000)
            shot(page, "film-%04d" % int((time.time() - t0) * 1000))
        # and back up to Contact
        page.evaluate("document.getElementById('contact').scrollIntoView({block:'start', behavior:'instant'})")
        t0 = time.time()
        for target in (0.3, 1.0, 2.6):
            dt = target - (time.time() - t0)
            if dt > 0: page.wait_for_timeout(dt * 1000)
            shot(page, "back-%04d" % int((time.time() - t0) * 1000))
        ctx.close()

    if mode in ("scroll", "all2"):
        # A person scrolling down from Contact, not a jump: the trigger fires
        # at 75% of the slot and the sphere has to slide down onto it.
        ctx, page = open_page(browser, 1440, 900, "light")
        page.evaluate("document.getElementById('contact').scrollIntoView({block:'start', behavior:'instant'})")
        page.wait_for_timeout(2600)
        page.mouse.move(720, 450)
        t0, last = time.time(), -1.0
        while time.time() - t0 < 6.5:
            r = slot_rect(page)
            if r["y"] + r["h"] / 2 > r["vh"] / 2 + 4:
                page.mouse.wheel(0, 60)
            page.wait_for_timeout(50)
            if time.time() - last >= 0.45:
                last = time.time()
                shot(page, "scroll-%04d" % int((last - t0) * 1000))
        ctx.close()

    if mode in ("reduced", "all2"):
        for (w, h, dpr, scheme) in [(1440, 900, 1, "light"), (390, 844, 2, "dark")]:
            ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr,
                                      color_scheme=scheme, reduced_motion="reduce")
            page = ctx.new_page()
            page.on("pageerror", lambda e: errors.append("rm pageerror %s" % e))
            page.goto(BASE, wait_until="networkidle"); page.wait_for_timeout(1200)
            to_slot(page); page.wait_for_timeout(1500)
            shot(page, "settled-rm-%d-%s" % (w, scheme))
            ctx.close()

    if mode in ("fallback", "all"):
        ctx, page = open_page(browser, 1440, 900, "light", block_three=True)
        to_slot(page); page.wait_for_timeout(800)
        shot(page, "fallback-nowebgl-light")
        ctx.close()
        ctx, page = open_page(browser, 1440, 900, "dark", block_three=True)
        to_slot(page); page.wait_for_timeout(800)
        shot(page, "fallback-nowebgl-dark")
        ctx.close()

    browser.close()

prev = {}
mp = os.path.join(OUT, "meta.json")
if os.path.exists(mp):
    prev = json.load(open(mp))
prev.update(meta)
json.dump(prev, open(mp, "w"), indent=1)
print("shots:", len(meta), "| errors:", len(errors))
for e in errors[:20]:
    print("  ", e)
