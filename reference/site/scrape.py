#!/usr/bin/env python3
"""Capture this site's own reference: screens + scraped tokens + font record.

    python3 scrape.py http://localhost:8777 /path/to/reference/site

Regenerates reference/site/ from the running site. Screens are viewport shots
(not full-page) wherever the particle field matters — the field is
position:fixed, so a full-page capture paints it once at the top and leaves
the rest of the document bare.
"""
import io, json, pathlib, sys, urllib.request
from playwright.sync_api import sync_playwright
from PIL import Image

BASE = sys.argv[1].rstrip("/")
OUT  = pathlib.Path(sys.argv[2])
SHOT = OUT / "screens"
SHOT.mkdir(parents=True, exist_ok=True)

CONCEPTS = ["botanica", "borough", "kettle", "sunday", "meridian", "northline"]
SECTIONS = ["stats", "intro", "work", "about", "feedback",
            "services", "faq", "contact", "newsletter"]


def save(png, path, max_w=1440, q=80):
    im = Image.open(io.BytesIO(png)).convert("RGB")
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(path, "WEBP", quality=q, method=6)
    return path.name, im.size


TOKENS = r"""() => {
  const root = document.documentElement, cs = getComputedStyle(root);
  const out = {custom: {}, dark: {}, breakpoints: [], type: {}, fonts: {}};

  const readVars = (sel, into) => {
    for (const ss of document.styleSheets) {
      let rules; try { rules = ss.cssRules; } catch (e) { continue; }
      for (const r of rules) {
        if (r.type !== 1 || r.selectorText !== sel) continue;
        for (const name of r.style) {
          if (!name.startsWith('--')) continue;
          into[name] = { declared: r.style.getPropertyValue(name).trim(),
                         computed: cs.getPropertyValue(name).trim() };
        }
      }
    }
  };
  readVars(':root', out.custom);
  readVars('.on-dark, .nav[data-open], .block--dark', out.dark);
  if (!Object.keys(out.dark).length) {
    for (const ss of document.styleSheets) {
      let rules; try { rules = ss.cssRules; } catch (e) { continue; }
      for (const r of rules) {
        if (r.type === 1 && /\.on-dark/.test(r.selectorText || '')) {
          for (const n of r.style) if (n.startsWith('--'))
            out.dark[n] = { declared: r.style.getPropertyValue(n).trim(), on: r.selectorText };
        }
      }
    }
  }

  for (const ss of document.styleSheets) {
    let rules; try { rules = ss.cssRules; } catch (e) { continue; }
    for (const r of rules) if (r.type === CSSRule.MEDIA_RULE)
      out.breakpoints.push(r.conditionText || r.media.mediaText);
  }
  out.breakpoints = [...new Set(out.breakpoints)].sort();

  // Rendered type ramp — what the tokens actually resolve to on this page.
  const probe = {
    'hero h1': '.hero h1', 'section h2': '.section h2, .h2',
    'accordion title': '.acc__title', 'card title': '.svc__title',
    'body copy': '.section__sub, .about p', 'label': '.label',
    'button': '.btn', 'nav link': '.nav__item > a', 'stat figure': '.stat__fig'
  };
  for (const [k, sel] of Object.entries(probe)) {
    const e = document.querySelector(sel); if (!e) continue;
    const s = getComputedStyle(e);
    out.type[k] = {selector: sel, family: s.fontFamily, size: s.fontSize,
                   weight: s.fontWeight, lineHeight: s.lineHeight,
                   letterSpacing: s.letterSpacing, transform: s.textTransform,
                   color: s.color};
  }

  const fams = new Set();
  for (const e of document.querySelectorAll('body, h1, h2, h3, p, a, button, span, li'))
    fams.add(getComputedStyle(e).fontFamily);
  out.fonts.familiesInUse = [...fams].sort();
  out.fonts.stylesheets = [...document.querySelectorAll('link[rel=stylesheet]')]
      .map(l => l.href).filter(h => /fonts\./.test(h));
  out.fonts.faces = (() => {
    const seen = [];
    for (const ss of document.styleSheets) {
      let rules; try { rules = ss.cssRules; } catch (e) { continue; }
      for (const r of rules) if (r.type === CSSRule.FONT_FACE_RULE)
        seen.push({family: r.style.fontFamily, weight: r.style.fontWeight,
                   display: r.style.fontDisplay, src: r.style.src.slice(0, 200),
                   range: r.style.unicodeRange ? r.style.unicodeRange.slice(0, 60) : ''});
    }
    return seen;
  })();
  return out;
}"""


def main():
    manifest = {"screens": [], "note": "Regenerate with reference/site/scrape.py"}
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True,
                              args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader"])

        # ── tokens, from the widest layout ──────────────────────────
        pg = b.new_page(viewport={"width": 1440, "height": 900})
        pg.goto(BASE + "/index.html"); pg.wait_for_load_state("networkidle")
        pg.wait_for_timeout(1500)
        tokens = pg.evaluate(TOKENS)
        (OUT / "site-tokens.json").write_text(json.dumps(tokens, indent=2) + "\n")
        print("tokens:", len(tokens["custom"]), "custom,", len(tokens["dark"]), "dark,",
              len(tokens["breakpoints"]), "breakpoints")

        # ── nav panels ──────────────────────────────────────────────
        for name in ["Services", "Pricing", "Process", "About"]:
            t = pg.query_selector(f'button:has-text("{name}")')
            if not t:
                continue
            t.hover(); pg.wait_for_timeout(1500)
            manifest["screens"].append(
                save(pg.screenshot(), SHOT / f"nav-{name.lower()}-1440.webp"))
            pg.mouse.move(720, 700); pg.wait_for_timeout(600)
        pg.close()

        # ── home, per section, both widths ──────────────────────────
        for w, h, tag in [(1440, 900, "1440"), (390, 844, "390")]:
            pg = b.new_page(viewport={"width": w, "height": h})
            pg.goto(BASE + "/index.html"); pg.wait_for_load_state("networkidle")
            pg.wait_for_timeout(1800)
            manifest["screens"].append(save(pg.screenshot(), SHOT / f"home-hero-{tag}.webp"))
            for btn in pg.query_selector_all(".acc__head"):
                try:
                    btn.click(); pg.wait_for_timeout(400)
                except Exception:
                    pass
            for sid in SECTIONS:
                if not pg.query_selector("#" + sid):
                    continue
                pg.evaluate(f"document.querySelector('#{sid}').scrollIntoView({{block:'start'}})")
                pg.wait_for_timeout(2200)          # let the formation morph land
                manifest["screens"].append(
                    save(pg.screenshot(), SHOT / f"home-{sid}-{tag}.webp"))
            pg.close()

        # ── full-page layout maps (field paints once — that is expected) ──
        for w, tag in [(1440, "1440"), (860, "860"), (390, "390")]:
            pg = b.new_page(viewport={"width": w, "height": 900})
            pg.goto(BASE + "/index.html"); pg.wait_for_load_state("networkidle")
            pg.wait_for_timeout(2000)
            pg.evaluate("window.scrollTo(0, document.body.scrollHeight); ")
            pg.wait_for_timeout(1500); pg.evaluate("window.scrollTo(0,0)")
            pg.wait_for_timeout(800)
            manifest["screens"].append(
                save(pg.screenshot(full_page=True), SHOT / f"home-full-{tag}.webp",
                     max_w=min(w, 900), q=72))
            pg.close()

        # ── the six concepts + the motion study ─────────────────────
        for slug in CONCEPTS:
            pg = b.new_page(viewport={"width": 1200, "height": 900})
            pg.goto(f"{BASE}/concepts/{slug}.html"); pg.wait_for_load_state("networkidle")
            pg.wait_for_timeout(1200)
            manifest["screens"].append(
                save(pg.screenshot(full_page=True), SHOT / f"concept-{slug}.webp",
                     max_w=900, q=76))
            pg.close()
        pg = b.new_page(viewport={"width": 1440, "height": 900})
        pg.goto(BASE + "/motion/index.html"); pg.wait_for_load_state("networkidle")
        pg.wait_for_timeout(2500)
        manifest["screens"].append(save(pg.screenshot(), SHOT / "motion-1440.webp"))
        pg.close()

        # ── what each concept is made of ────────────────────────────
        concept_probe = """() => {
          const fams = new Set(), sheets = [];
          for (const e of document.querySelectorAll('body,h1,h2,h3,p,a,button,span,li,em'))
            fams.add(getComputedStyle(e).fontFamily);
          for (const l of document.querySelectorAll('link[rel=stylesheet]'))
            if (/fonts\./.test(l.href)) sheets.push(l.href);
          const b = getComputedStyle(document.body);
          return {fonts: [...fams].sort(), fontStylesheets: sheets,
                  background: b.backgroundColor, ink: b.color};
        }"""
        tokens["concepts"] = {}
        for slug in CONCEPTS:
            pg = b.new_page(viewport={"width": 1200, "height": 900})
            pg.goto(f"{BASE}/concepts/{slug}.html")
            pg.wait_for_load_state("networkidle"); pg.wait_for_timeout(900)
            tokens["concepts"][slug] = pg.evaluate(concept_probe)
            pg.close()
        (OUT / "site-tokens.json").write_text(json.dumps(tokens, indent=2) + "\n")
        b.close()

    # ── the font files themselves, as a record of what is served ────
    # Archivo is OFL; this is the served CSS, not a copy of the binaries.
    faces = OUT / "fonts"
    faces.mkdir(exist_ok=True)
    for href in tokens["fonts"]["stylesheets"]:
        req = urllib.request.Request(href, headers={"User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"})
        css = urllib.request.urlopen(req, timeout=20).read().decode()
        name = "archivo" if "Archivo" in href else "fonts"
        (faces / f"{name}.css").write_text(css)
        print("fonts:", name + ".css", len(css), "bytes,",
              css.count("@font-face"), "faces")

    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"{len(manifest['screens'])} screens ->", SHOT)


main()
