#!/usr/bin/env python3
"""Write robots.txt and sitemap.xml from tools/siteinfo.py.

    python3 tools/build_seo.py

Both files hard-code an origin, which is exactly the kind of thing that goes
stale silently, so neither is hand-written. Re-run after changing CANONICAL
or adding a page to PAGES.
"""
import datetime
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from siteinfo import CANONICAL, PAGES        # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent

ROBOTS = """# Everything here is public and meant to be found.
User-agent: *
Allow: /

# Not part of the site: a standalone particle study nothing links to, and the
# scraped reference material the design was built against.
Disallow: /motion/
Disallow: /reference/

Sitemap: {canonical}/sitemap.xml
"""


def main():
    today = datetime.date.today().isoformat()
    (ROOT / "robots.txt").write_text(ROBOTS.format(canonical=CANONICAL))

    urls = "\n".join(
        f"  <url>\n"
        f"    <loc>{CANONICAL}/{path}</loc>\n"
        f"    <lastmod>{today}</lastmod>\n"
        f"    <priority>{priority}</priority>\n"
        f"  </url>"
        for path, priority in PAGES
    )
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{urls}\n"
        "</urlset>\n"
    )
    print(f"robots.txt      -> {CANONICAL}")
    print(f"sitemap.xml     -> {len(PAGES)} urls, lastmod {today}")


if __name__ == "__main__":
    main()
