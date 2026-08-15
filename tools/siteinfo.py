"""One definition of where this site lives.

Named siteinfo, not site: `site` is a standard-library module and shadowing
it breaks the import from anywhere on the path.

`CANONICAL` is the origin every absolute URL is built from: the sitemap, the
`og:` tags, and each page's `<link rel="canonical">`. Everything that needs it
imports it from here, so moving the site to its own domain is one edit
followed by:

    python3 tools/build_pages.py && python3 tools/build_seo.py

**Today it is the vercel.app address, because that is what actually serves
the site.** jaredbangal.com is registered but parked on a lander and has no
records pointing here. Change this the day the domain is connected in Vercel,
not before — a canonical tag pointing at a parking page tells search engines
to index the parking page instead of this one, which is worse than having no
canonical at all.

    CANONICAL = "https://jaredbangal.com"
"""

CANONICAL = "https://jared-bangal-portfolio.vercel.app"

# Every indexable page, in the order they should be crawled. 404.html is
# absent on purpose: it is noindex, and listing a page in a sitemap while
# telling robots to ignore it is a contradiction search engines report as an
# error. motion/ is absent because nothing links to it — it is a study, not
# part of the site.
PAGES = [
    ("", 1.0),
    ("services.html", 0.9),
    ("pricing.html", 0.9),
    ("products.html", 0.6),
    ("privacy.html", 0.3),
    ("terms.html", 0.3),
    ("work/botanica.html", 0.7),
    ("work/borough.html", 0.7),
    ("work/kettle.html", 0.7),
    ("work/sunday.html", 0.7),
    ("work/meridian.html", 0.7),
    ("work/northline.html", 0.7),
    ("concepts/botanica.html", 0.5),
    ("concepts/borough.html", 0.5),
    ("concepts/kettle.html", 0.5),
    ("concepts/sunday.html", 0.5),
    ("concepts/meridian.html", 0.5),
    ("concepts/northline.html", 0.5),
]
