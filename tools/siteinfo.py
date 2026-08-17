"""One definition of where this site lives.

Named siteinfo, not site: `site` is a standard-library module and shadowing
it breaks the import from anywhere on the path.

`CANONICAL` is the origin every absolute URL is built from: the sitemap, the
`og:` tags, and each page's `<link rel="canonical">`. Everything that needs it
imports it from here, so moving the site to its own domain is one edit
followed by:

    python3 tools/build_pages.py && python3 tools/build_seo.py

**Today it is the vercel.app address, because that is what actually serves
the site.** jaredbangal.com is registered and is attached to the Vercel
account, but its DNS still points at GoDaddy's forwarding service, which
301s to this origin. Change this the day the domain resolves to Vercel
directly, not before — a canonical tag pointing at something that redirects
away tells search engines to index the redirect target instead, which is
worse than having no canonical at all.

    CANONICAL = "https://jaredbangal.com"

**It moved once already, and this is why the constant exists.** The origin
was jared-bangal-portfolio.vercel.app until that project lost its production
alias and every URL on the site — canonicals, og:image, all 18 sitemap
entries — pointed at a hostname returning DEPLOYMENT_NOT_FOUND. Repointing
was this one line plus the two commands above.
"""

CANONICAL = "https://jaredbangal.vercel.app"

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
