---
paths:
  - "tools/siteinfo.py"
  - "tools/build_seo.py"
  - "tools/build_og.py"
  - "robots.txt"
  - "sitemap.xml"
  - "vercel.json"
---
# Canonical origin, sitemap, robots, OG cards

<!-- Loaded only when a matching file is read. Evidence for every rule is
     in docs/design-notes.md under the same ## heading. -->

## Findability

**One origin, `tools/siteinfo.py`.** `CANONICAL` feeds the sitemap, every `og:`
tag and every page's `<link rel="canonical">`. Moving to a custom domain is one
edit there plus `build_pages.py && build_seo.py`.

**It is `https://jaredbangal.com`, connected in Vercel.** `http://` 308s to it;
`www.` serves the same pages with a 200 rather than redirecting, so the
canonical tags are what consolidate the two. The rule that kept the origin on
vercel.app until the domain was live still holds for any future move: **a
canonical aimed at a host that does not serve the site tells search engines
to index the wrong thing.** Move `CANONICAL` the day the new host serves, not
before.

- `robots.txt` and `sitemap.xml` are **generated** by `tools/build_seo.py` —
  both hard-code an origin, which is what goes stale silently. 18 URLs.
- **`404.html` is not in the sitemap**, deliberately: it is `noindex`, and
  listing a page while telling robots to ignore it is a contradiction search
  consoles report as an error. `motion/` and `reference/` are `Disallow`ed.
- **OG cards are drawn, not screenshotted** (`tools/build_og.py`, 1200×630). A
  crop of a real page is mostly nav and whitespace, because the page heads are
  built to breathe. Each case study takes its concept's own palette, so the six
  are distinct at thumbnail size — the only size anyone sees them at.
- **JPEG, not WebP.** Several preview scrapers still refuse WebP, and a preview
  that fails is worse than one 40KB larger.
- `404.html` carries `og: home` in its fragment rather than a card of its own.
