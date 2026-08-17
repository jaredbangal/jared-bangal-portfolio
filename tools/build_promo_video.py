#!/usr/bin/env python3
"""Record a scrolling walkthrough of the home page as an MP4.

    python3 tools/build_promo_video.py                  # both formats
    python3 tools/build_promo_video.py --format feed    # just the 4:5
    python3 tools/build_promo_video.py --url https://jaredbangal.com

Output lands in promo/ (gitignored — these are marketing assets, not source).

**Recorded, not stitched.** Playwright's context video captures the real
frame timeline, so the particle field, the hero stage and the Selected Work
carousel all move at their true speed. Screenshotting frame by frame would
freeze every animation between captures and produce a slideshow of a site
that looks alive in person.

Two formats, because they are for different places:

  feed   1080x1350 (4:5)  — LinkedIn's feed format. Takes the most vertical
                            space on a phone, which is where the feed is read.
  wide   1920x1080 (16:9) — the conventional one. Better on desktop, and the
                            right choice for a site embed or a YouTube post.

The browser viewport is recorded at the output's aspect ratio and scaled
down, rather than recorded small: a 1440-wide viewport gets the desktop
layout (the nav bar rather than the drawer, three columns rather than one),
which is the layout worth showing.

Audio: none. LinkedIn autoplays muted, and a silent track is one less thing
to get wrong. The `-an` is explicit so no encoder guesses.
"""
import argparse
import pathlib
import shutil
import subprocess
import sys

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit("needs: pip install playwright && playwright install chromium")

try:
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except ImportError:
    FFMPEG = shutil.which("ffmpeg")
if not FFMPEG:
    sys.exit("needs ffmpeg: pip install imageio-ffmpeg")

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "promo"

FORMATS = {
    # name: (capture w, capture h, output w, output h)
    #
    # Capture close to the output size. A 1440-wide capture scaled into a
    # 1080-wide frame renders body copy around 10px in the file — legible on
    # a monitor, gone on a phone. 1152 keeps the desktop layout (the drawer
    # breakpoint is 901) while landing at 0.94 scale, near native.
    "feed": (1152, 1440, 1080, 1350),
    "wide": (1920, 1080, 1920, 1080),
}

HOLD_TOP = 3.2      # seconds parked at the hero, so the stage advances twice
SCROLL_SECS = 19.0  # the travel itself
HOLD_END = 2.4      # the footer, so the last frame is not mid-motion
FPS = 30

# Eased scroll driven in the page. window.scrollTo on a rAF loop rather than
# CSS smooth-scroll: this needs a known duration and an easing that starts
# and ends still, which scroll-behavior does not offer.
SCROLL_JS = """([secs]) => new Promise(resolve => {
  // The site sets `scroll-behavior: smooth` on <html>. Under it, every
  // scrollTo starts a NEW smooth animation that pre-empts the last one, so a
  // rAF loop fights itself and the page crawls — measured: scrollTo(3000)
  // reached 2546 after half a second, and the first recording never left the
  // hero. Force it off for the capture; it is restored on resolve.
  const root = document.documentElement;
  const prior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  const end = root.scrollHeight - window.innerHeight;
  const t0 = performance.now();
  const ms = secs * 1000;
  // easeInOutSine — no abrupt start, no hard stop, and unlike a cubic it
  // does not dwell so long at the ends that the middle has to race.
  const ease = t => -(Math.cos(Math.PI * t) - 1) / 2;
  function step(now) {
    const t = Math.min((now - t0) / ms, 1);
    window.scrollTo(0, end * ease(t));
    if (t < 1) { requestAnimationFrame(step); }
    else { root.style.scrollBehavior = prior; resolve(); }
  }
  requestAnimationFrame(step);
})"""


def record(url, name, cap_w, cap_h, out_w, out_h):
    raw = OUT / f".raw-{name}"
    raw.mkdir(parents=True, exist_ok=True)
    for old in raw.glob("*.webm"):
        old.unlink()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=[
            "--enable-gpu", "--use-gl=angle", "--use-angle=swiftshader",
            "--hide-scrollbars",          # a scrollbar in the capture is noise
        ])
        ctx = browser.new_context(
            viewport={"width": cap_w, "height": cap_h},
            record_video_dir=str(raw),
            record_video_size={"width": cap_w, "height": cap_h},
            device_scale_factor=1,
            reduced_motion="no-preference",   # the animations are the point
        )
        page = ctx.new_page()
        page.goto(url, wait_until="networkidle")
        page.wait_for_timeout(1500)           # webfonts + first particle frame
        page.wait_for_timeout(int(HOLD_TOP * 1000))
        page.evaluate(SCROLL_JS, [SCROLL_SECS])
        page.wait_for_timeout(int(HOLD_END * 1000))
        ctx.close()                           # flushes the video file
        browser.close()

    src = next(raw.glob("*.webm"), None)
    if not src:
        sys.exit(f"{name}: playwright wrote no video")

    dest = OUT / f"jaredbangal-{name}.mp4"
    subprocess.run([
        FFMPEG, "-y", "-i", str(src),
        "-vf", f"scale={out_w}:{out_h}:flags=lanczos,fps={FPS}",
        "-c:v", "libx264",
        "-profile:v", "high", "-level", "4.0",
        "-pix_fmt", "yuv420p",     # without this, Quicktime and some phones
                                   # refuse the file outright
        "-crf", "20",              # visually clean on flat colour and type
        "-preset", "slow",
        "-movflags", "+faststart", # metadata first, so it plays while loading
        "-an",
        str(dest),
    ], check=True, capture_output=True)

    shutil.rmtree(raw, ignore_errors=True)
    return dest


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://localhost:8777/index.html")
    ap.add_argument("--format", choices=[*FORMATS, "both"], default="both")
    args = ap.parse_args()

    OUT.mkdir(exist_ok=True)
    names = list(FORMATS) if args.format == "both" else [args.format]
    for name in names:
        dest = record(args.url, name, *FORMATS[name])
        mb = dest.stat().st_size / 1_048_576
        w, h = FORMATS[name][2], FORMATS[name][3]
        print(f"  {dest.relative_to(ROOT)}  {w}x{h}  {mb:.1f} MB")


if __name__ == "__main__":
    main()
