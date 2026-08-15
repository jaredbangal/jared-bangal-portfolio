#!/usr/bin/env python3
"""Render a link-preview card per page into assets/og/.

    python3 tools/build_og.py

Every page shared one og:image — the portrait — so a Services link and a case
study previewed identically in Slack, iMessage and LinkedIn. These are drawn
rather than screenshotted: a 1200x630 crop of a real page is mostly nav and
whitespace, because the page heads are built to breathe.

**JPEG, not WebP.** Several preview scrapers still refuse WebP, and a preview
that fails is worse than one that is 40KB larger.

Each case study takes its own concept's palette, so the six are distinct at
thumbnail size — which is the only size anyone sees them at.
"""
import io
import pathlib
import subprocess
import sys

try:
    from playwright.sync_api import sync_playwright
    from PIL import Image
except ImportError:
    sys.exit("needs: pip install playwright pillow && playwright install chromium")

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "og"

CREAM, INK, PAPER = "#E4E2DC", "#16171A", "#F4F2EC"

# name, label, title, background, ink
CARDS = [
    ("home", "Freelance web design", "A website you can feel", CREAM, INK),
    ("services", "Services", "What I can build for you", CREAM, INK),
    ("pricing", "Pricing", "What it costs", CREAM, INK),
    ("products", "Products", "Things you can buy without hiring me", CREAM, INK),
    ("privacy", "Privacy", "What this site knows about you", PAPER, INK),
    ("terms", "Terms", "How a project runs", PAPER, INK),
    ("work-botanica", "Concept · Floral studio", "Flowers that keep the season", "#2F4634", "#F4F0E6"),
    ("work-borough", "Concept · Barber shop", "Precision grooming", "#121212", "#D8913A"),
    ("work-kettle", "Concept · Coffee roaster", "Roasted the morning it ships", "#6B351D", "#F8F1E8"),
    ("work-sunday", "Concept · Bakery", "Bread worth getting up for", "#F2C14E", "#2E1B12"),
    ("work-meridian", "Concept · Architecture studio", "Buildings that sit quietly", "#8FA3B0", "#0F1518"),
    ("work-northline", "Concept · Bike shop", "Tuned by people who ride it", "#171C1F", "#C6F04B"),
]

TEMPLATE = """<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500&display=swap">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ width: 1200px; height: 630px; }}
  body {{
    background: {bg};
    color: {ink};
    font-family: Archivo, "Helvetica Neue", Arial, sans-serif;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 72px 80px;
  }}
  .label {{
    font-size: 20px; font-weight: 500; letter-spacing: .08em;
    text-transform: uppercase; opacity: .68;
  }}
  h1 {{
    font-size: 84px; font-weight: 300; line-height: 1.04;
    letter-spacing: -.055em; max-width: 18ch;
  }}
  .foot {{ display: flex; align-items: center; gap: 16px; font-size: 22px; }}
  .mark {{
    width: 44px; height: 44px; border-radius: 6px;
    background: {ink}; color: {bg};
    display: grid; place-content: center;
    font-size: 19px; font-weight: 500; letter-spacing: .01em;
  }}
</style></head><body>
  <p class="label">{label}</p>
  <h1>{title}</h1>
  <div class="foot"><span class="mark">JB</span><span>Jared Bangal</span></div>
</body></html>"""


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    tmp = ROOT / ".og-card.html"
    written = []
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        pg = b.new_page(viewport={"width": 1200, "height": 630},
                        device_scale_factor=1)
        for name, label, title, bg, ink in CARDS:
            tmp.write_text(TEMPLATE.format(bg=bg, ink=ink, label=label, title=title))
            pg.goto(tmp.as_uri())
            pg.wait_for_load_state("networkidle")
            pg.wait_for_timeout(350)          # let the webfont paint
            img = Image.open(io.BytesIO(pg.screenshot())).convert("RGB")
            path = OUT / f"{name}.jpg"
            img.save(path, "JPEG", quality=86, optimize=True, progressive=True)
            written.append((path.name, path.stat().st_size // 1024))
        b.close()
    tmp.unlink(missing_ok=True)
    for n, kb in written:
        print(f"  {n:24s} {kb:3d} KB")
    print(f"{len(written)} cards -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
