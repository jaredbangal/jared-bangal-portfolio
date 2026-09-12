"""Decode every settled/fallback shot with two independent OpenCV detectors,
and measure module separation against the known matrix.

Needs opencv-python-headless + numpy (pip). Usage: qr_decode.py [prefix]
"""
import json, os, re, sys, tempfile
import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("QA_OUT") or os.path.join(tempfile.gettempdir(), "jb-qa")
EXPECT = "https://jaredbangal.com/services.html"
QUIET = 4
PJS = os.path.join(HERE, "..", "..", "assets", "js", "particles.js")
rows = re.findall(r'^\s+"([#.]+)",?$', open(PJS).read(), re.M)
N = len(rows)
prefix = sys.argv[1] if len(sys.argv) > 1 else ""

std = cv2.QRCodeDetector()
aru = cv2.QRCodeDetectorAruco()

def decode(img):
    res = {}
    for name, det in (("std", std), ("aruco", aru)):
        try:
            txt, pts, _ = det.detectAndDecode(img)
        except cv2.error:
            txt = ""
        res[name] = txt
    return res

def lum(rgb):
    c = rgb / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]

meta = json.load(open(os.path.join(OUT, "meta.json")))
ok_all = True
for name in sorted(meta):
    if not name.startswith(prefix) or not (name.startswith("settled") or name.startswith("fallback")):
        continue
    m = meta[name]
    img = cv2.imread(m["file"])
    H, W = img.shape[:2]
    s = W / m["vw"]                      # device pixels per CSS px
    x0, y0, side = m["x"] * s, m["y"] * s, m["w"] * s
    pad = int(side * 0.08)
    crop = img[max(0, int(y0) - pad): int(y0 + side) + pad, max(0, int(x0) - pad): int(x0 + side) + pad]

    full, cropped = decode(img), decode(crop)
    # grey + upscaled, as a phone pipeline would binarise
    g = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    up = decode(cv2.resize(g, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC))

    # Sample each module's centre (inner 40% of the module) and compare the
    # dark set against the light set, in relative luminance.
    mod = side / (N + 2 * QUIET)
    rgb = img[..., ::-1].astype(float)
    darkL, lightL = [], []
    for r in range(N):
        for c in range(N):
            cx = x0 + (QUIET + c + 0.5) * mod
            cy = y0 + (QUIET + r + 0.5) * mod
            h = max(1, int(mod * 0.2))
            patch = rgb[int(cy) - h:int(cy) + h + 1, int(cx) - h:int(cx) + h + 1]
            L = float(lum(patch).mean())
            (darkL if rows[r][c] == "#" else lightL).append(L)
    darkL, lightL = np.array(darkL), np.array(lightL)
    worst_dark, worst_light = darkL.max(), lightL.min()
    ratio_med = (np.median(lightL) + .05) / (np.median(darkL) + .05)
    ratio_worst = (worst_light + .05) / (worst_dark + .05)
    misread = int((darkL > (np.median(darkL) + np.median(lightL)) / 2).sum()
                  + (lightL < (np.median(darkL) + np.median(lightL)) / 2).sum())

    hits = [k for k, v in list(("full-" + a, b) for a, b in full.items())
            + list(("crop-" + a, b) for a, b in cropped.items())
            + list(("up-" + a, b) for a, b in up.items()) if v == EXPECT]
    wrong = [v for v in list(full.values()) + list(cropped.values()) + list(up.values()) if v and v != EXPECT]
    ok = bool(hits) and not wrong
    ok_all &= ok
    print("%-26s %-5s mod %4.1fpx  median %5.2f:1  worst-pair %5.2f:1  misread %3d/%d  %s %s"
          % (name, m["theme"], mod, ratio_med, ratio_worst, misread, N * N,
             "DECODES" if ok else "FAILS", ",".join(hits) + (" WRONG:" + repr(wrong) if wrong else "")))
print("ALL DECODE" if ok_all else "SOME FAIL")
