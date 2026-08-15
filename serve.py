#!/usr/bin/env python3
"""Dev server for the portfolio.

Two jobs, both about the same failure mode: a browser running old assets
against new markup. That produced a reported bug during this build — the
nav panels rendered unstyled and a concept mockup covered the page —
which could not be reproduced, because the served files were correct and
only the browser was stale.

1. Cache-busting. `stamp()` rewrites the ?v= token on the CSS and JS links
   in index.html to the first 8 hex of each file's md5. Change a file and
   its URL changes, so no cache can serve the old one. Runs on startup, and
   only writes when a token actually differs, so it creates no git churn.
   Run before deploying too — the token has to ship with the HTML.

2. No-store headers. The stdlib server sends neither Cache-Control nor
   ETag, so browsers fall back to heuristic caching and hold subresources
   across many edits.

    python3 serve.py [port]     # default 8777
    python3 serve.py --stamp    # rewrite tokens and exit
"""

import hashlib
import pathlib
import re
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = pathlib.Path(__file__).parent
# The `(\.\./)*` group is the reason this works on the generated pages: they
# live at a depth and reference `../assets/...`. It is captured and written
# back, so a case study keeps its prefix.
ASSETS = {
    "assets/css/styles.css": r'href="((?:\.\./)*)assets/css/styles\.css(?:\?v=[a-f0-9]+)?"',
    "assets/js/main.js": r'src="((?:\.\./)*)assets/js/main\.js(?:\?v=[a-f0-9]+)?"',
    "assets/js/particles.js": r'src="((?:\.\./)*)assets/js/particles\.js(?:\?v=[a-f0-9]+)?"',
}


def pages():
    """Every HTML page that links the shared assets.

    Not just index.html. vercel.json serves /assets/* as immutable for a
    year, so one unstamped page is one page that never sees a CSS change
    again — and that shipped once, on all eleven generated pages at the
    same time.
    """
    found = [ROOT / "index.html"]
    found += sorted((ROOT / "work").glob("*.html"))
    found += sorted(p for p in ROOT.glob("*.html") if p.name != "index.html")
    return [p.relative_to(ROOT).as_posix() for p in found if p.exists()]


def stamp(page="index.html"):
    """Point the HTML at content-hashed asset URLs. Returns what changed."""
    path = ROOT / page
    html = original = path.read_text()
    changed = []

    for asset, pattern in ASSETS.items():
        file = ROOT / asset
        if not file.exists():
            continue
        token = hashlib.md5(file.read_bytes()).hexdigest()[:8]
        attr = "href" if asset.endswith(".css") else "src"
        html, n = re.subn(pattern, rf'{attr}="\g<1>{asset}?v={token}"', html)
        if n:
            changed.append(f"{asset} -> {token}")

    if html != original:
        path.write_text(html)
        return changed
    return []


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Quiet on 2xx; problems still surface.
        code = str(args[1]) if len(args) > 1 else ""
        if not code.startswith("2"):
            super().log_message(fmt, *args)


def main():
    args = sys.argv[1:]

    def stamp_all():
        out = []
        for page in pages():
            for line in stamp(page):
                out.append(f"{page}: {line}")
        return out

    if "--stamp" in args:
        for line in stamp_all() or ["already current"]:
            print(line)
        return

    for line in stamp_all():
        print("restamped:", line)

    port = int(args[0]) if args and args[0].isdigit() else 8777
    handler = partial(NoCacheHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print(f"Serving on http://localhost:{port}  (no-store)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
