"""One definition of where this site lives.

Named siteinfo, not site: `site` is a standard-library module and shadowing
it breaks the import from anywhere on the path.

`CANONICAL` is the origin every absolute URL is built from: the sitemap, the
`og:` tags, and each page's `<link rel="canonical">`. Everything that needs it
imports it from here, so moving the site to its own domain is one edit
followed by:

    python3 tools/build_pages.py && python3 tools/build_seo.py

**The domain is live.** jaredbangal.com resolves to Vercel by an A record on
the apex (76.76.21.21) with www CNAMEd to it, both attached to the
`jaredbangal` project. GoDaddy remains the registrar; only DNS moved.

**It moved twice, and this constant is why that was cheap.** First from
jared-bangal-portfolio.vercel.app, when that project lost its production
alias and every canonical, og: tag and sitemap entry pointed at a hostname
returning DEPLOYMENT_NOT_FOUND. Then here. Each move was one line plus:

    python3 tools/build_pages.py && python3 tools/build_seo.py

**index.html is not covered by that.** It is the *source* build_pages.py
reads rather than one of its outputs, so its own og:url, og:image and
canonical are hand-maintained and do not follow this constant. Grep for the
old origin after changing it — the eleven generated pages corrected
themselves last time and the home page silently did not.
"""

CANONICAL = "https://jaredbangal.com"

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
