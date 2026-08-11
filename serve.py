#!/usr/bin/env python3
"""Dev server for the portfolio.

Why not `python3 -m http.server`: it sends no Cache-Control and no ETag, so
browsers fall back to heuristic caching and will happily keep serving a CSS
file from several edits ago. That produces bugs that exist only on your
machine and cannot be reproduced — during this build it showed up as the
Botanica mockup rendering at full height over the page, from a stylesheet
that had already been fixed.

This sends `Cache-Control: no-store` on everything, so a plain reload always
gets current files.

    python3 serve.py [port]        # default 8777
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Quiet by default; errors still surface through log_error.
        if not str(args[1] if len(args) > 1 else "").startswith("2"):
            super().log_message(fmt, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8777
    handler = partial(NoCacheHandler, directory=".")
    with ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print(f"Serving on http://localhost:{port}  (no-store)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
