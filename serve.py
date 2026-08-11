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
ASSETS = {
    "assets/css/styles.css": r'href="assets/css/styles\.css(?:\?v=[a-f0-9]+)?"',
    "assets/js/main.js": r'src="assets/js/main\.js(?:\?v=[a-f0-9]+)?"',
}


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
        html, n = re.subn(pattern, f'{attr}="{asset}?v={token}"', html)
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

    if "--stamp" in args:
        for line in stamp() or ["already current"]:
            print(line)
        return

    for line in stamp():
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
