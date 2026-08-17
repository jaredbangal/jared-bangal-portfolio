#!/usr/bin/env python3
"""Render the concept sites into the tiles and hero crops the home page uses.

    python3 tools/build_shots.py            # all six
    python3 tools/build_shots.py kettle     # just one

Two images come out of one render per concept:

  assets/img/work-<slug>.webp    the Selected Work tile — the page, to MAX_TILE_H
  assets/img/stage-<slug>.webp   the hero stage crop — the top 800x620

This existed only as ad-hoc commands until now, which meant the spec lived in
CLAUDE.md and the *execution* lived nowhere. The tile's `height` attribute has
to match the file or the card reserves the wrong space and the page shifts as
it loads, so this script rewrites those attributes in index.html itself rather
than trusting anyone to copy numbers by hand.

Spec, unchanged from the original renders:
  viewport 900x1125, full_page=True, resized to 800 wide, WebP q84.

**The first 1125px of the page must stand alone.** At rest the tile shows only
its top, and a touch device never sees the rest — the hover travel that reveals
the remainder is gated on fine pointers.
"""
import pathlib
import re
import sys

try:
    from playwright.sync_api import sync_playwright
    from PIL import Image
except ImportError:
    sys.exit("needs: pip install playwright pillow && playwright install chromium")

ROOT = pathlib.Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"

SLUGS = ["botanica", "borough", "kettle", "sunday", "meridian", "northline"]

SHOT_W, SHOT_H = 900, 1125     # render viewport
TILE_W = 800                   # tile is resized to this
STAGE_W, STAGE_H = 800, 620    # hero crop, taken after the resize
QUALITY = 84

# The tile is a teaser, not the document. It is capped because the card
# scrubs through it on hover over a *fixed* duration — so an uncapped render
# does not show more, it shows the same thing faster, and past roughly three
# screens it is unreadable. The concepts grew from 1.4–1.8 screens to 3.4–4.3
# when they were filled out, which is what forced this cap to exist.
#
# Changing it means re-solving the 3800ms scrub in .slide__shot to match.
MAX_TILE_H = 2600              # ~2.6 screens


def render(page, slug):
    """One page in, two files out. Returns the tile's height in pixels."""
    src = ROOT / "concepts" / f"{slug}.html"
    page.goto(src.as_uri())
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(400)          # webfonts paint late and these are type-led

    shot = IMG / f"_{slug}.png"
    page.screenshot(path=str(shot), full_page=True)

    full = Image.open(shot).convert("RGB")
    h = round(full.height * TILE_W / full.width)
    tile = full.resize((TILE_W, h), Image.LANCZOS)
    if h > MAX_TILE_H:
        tile = tile.crop((0, 0, TILE_W, MAX_TILE_H))
        h = MAX_TILE_H
    tile.save(IMG / f"work-{slug}.webp", "WEBP", quality=QUALITY, method=6)

    stage = tile.crop((0, 0, STAGE_W, min(STAGE_H, h)))
    stage.save(IMG / f"stage-{slug}.webp", "WEBP", quality=QUALITY, method=6)

    shot.unlink()
    return h


def sync_heights(heights):
    """Point index.html's height attributes at what was actually written.

    Every <img> for a given slug gets the same number, so this covers both the
    Selected Work tile and the carousel slide without caring which is which.
    """
    path = ROOT / "index.html"
    html = original = path.read_text()
    for slug, h in heights.items():
        html = re.sub(
            rf'(<img[^>]*work-{slug}\.webp"[^>]*height=")\d+(")',
            rf"\g<1>{h}\g<2>",
            html,
        )
    if html != original:
        path.write_text(html)
        return True
    return False


def main():
    want = [s for s in sys.argv[1:] if not s.startswith("-")] or SLUGS
    bad = [s for s in want if s not in SLUGS]
    if bad:
        sys.exit(f"unknown concept(s): {', '.join(bad)}\nknown: {', '.join(SLUGS)}")

    heights = {}
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        page = b.new_page(viewport={"width": SHOT_W, "height": SHOT_H},
                          device_scale_factor=1)
        for slug in want:
            heights[slug] = render(page, slug)
            size = (IMG / f"work-{slug}.webp").stat().st_size // 1024
            capped = " (capped)" if heights[slug] == MAX_TILE_H else ""
            print(f"  {slug:10s} {TILE_W}x{heights[slug]:<5d} {size:3d} KB{capped}")
        b.close()

    print("index.html heights:", "rewritten" if sync_heights(heights) else "already current")


if __name__ == "__main__":
    main()
