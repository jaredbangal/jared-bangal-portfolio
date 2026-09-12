---
paths:
  - "index.html"
  - "*.html"
  - "work/**"
  - "tools/fragments/**"
  - "tools/build_pages.py"
  - "tools/build_cases.py"
---
# Generated pages, page order, editing index.html, content rules

<!-- Loaded only when a matching file is read. Evidence for every rule is
     in docs/design-notes.md under the same ## heading. -->

## Pages

Eleven pages besides the home page, and **every one of them is generated**:

```bash
python3 tools/build_cases.py   # rewrites the six case-study fragments
python3 tools/build_pages.py   # wraps every fragment in the nav, head and footer
```

**There is still no build step to *serve* this site.** The generator's output is
plain static HTML, committed, and served as-is. It exists because the nav is 180
lines of markup: eleven hand-maintained copies would be eleven copies to forget.

- **`index.html` is the single source for the nav and footer.** Edit them there,
  re-run `build_pages.py`, commit the result. Never edit the generated pages —
  same contract as the concept pages' responsive patch.
- **Body content lives in `tools/fragments/`**, each with a `<!--meta -->` header
  giving its path, title and description.
- `retarget()` does three things to its copy of the nav: prefixes `../` at depth,
  turns a bare `#anchor` into `index.html#anchor` **unless the page declares that
  id itself**, and moves `aria-current="page"` to whichever link is this page.
- **`.h1` and `.h2` are deliberately the same size.** The distinction is semantic.
  Defining `.h1` at all is the point: a bare `<h1>` takes the browser's bold 2em
  default, which is exactly what this site's type direction is against — and it
  shipped that way for one build before being caught.
- **`.prose a` must stay `:not(.btn)`.** It is (0,1,1) against `.btn--primary`'s
  (0,1,0), so without the exclusion it repaints every CTA inside a prose block as
  near-black ink on a black fill — **1.06:1**, an invisible button, and it shipped
  on four pages.
- **`.svc-row__title` is the one deliberate bold heading on the site**, at 600 and
  `--text-3xl`, with tracking relaxed to `-.02em` because `--track-display`'s
  `-.055em` is drawn for weight 300 and closes bold counters into a smudge. The
  four service names are what visitors scan for; everywhere else, don't bold.
- **Pricing card heads are centred, bodies are left.** The name, figure and unit
  are compared across three cards so they share one axis; the feature lists stay
  left because a centred list cannot be scanned.

**The case studies are concepts and say so three times** — the eyebrow, the meta
row, and a standing note above the pager. There is no client work here yet, and a
portfolio that blurs that line is lying. `build_cases.py` derives the pager from
`ORDER`, so the six cannot drift out of sequence.

**Three pages carry a `NOTE FOR JARED` comment in their fragment**, not on the
page: `privacy.html` lists the paragraphs that must change the day the form gets
an endpoint, `terms.html` records that every clause restates something the site
already claims elsewhere, and `products.html` says what to replace when the first
product is real.

**Nothing on `privacy.html` is aspirational.** It describes what the site does
today, including the fact that the forms are not connected. The Google Fonts and
cdnjs entries are there because both genuinely receive the visitor's IP.

## Page order

Hero → **The case** → **What I do** → Selected Work → **About** →
**Services** → **FAQ** → Contact → **Scan** → Newsletter.

Testimonials sat between About and Services and is parked (see *Content still to
fill*). Its removal took the page's only vignette with it: that fade existed
because About dissolved into an ink block, and About now meets Services cream to
cream, which needs no transition.

- **"The case" states the problem and "What I do" answers it** — don't move the
  stats below Services.
- **"What I do" stays distinct from Services** (which lists what you can buy). It
  is centred, which only holds because the statement is capped at 20ch and the
  points at 34ch — **if the copy grows, the measures hold, not the alignment.**
- **One section is an ink block** — "What I do", `.on-dark block--dark` — plus
  the newsletter and footer as one continuous foot. Testimonials was the second
  and is parked. **All of them are flat `#000000`** (see *Texture*); the foot is
  one continuous surface, so the footer cannot keep a tooth the newsletter has
  lost without showing a seam. Worst contrast on an ink block: **4.99:1**
  (newsletter muted), and the glass card body improved 5.05 → **5.65:1** when
  the tooth came off.
- **Services sits by the contact form** with the FAQ under it — the "what can I
  actually buy" moment, after the work and the person.

### Services and the FAQ

- **One tab each, not ten rows.** The tab title *is* the section heading, so
  nothing is said twice.
- **The two are joined, not spaced**: `.services` drops its bottom padding, `.faq`
  its top padding *and* its `border-top`, or the shared rule doubles to 2px.
- **Both grids use `subgrid`** (behind `@supports`) so questions and answers sit
  in shared row bands rather than each cell floating independently.
- Rows ship **open** in the HTML and are closed by `main.js` — without the script
  both sections are headed prose, not dead buttons.
- The panel animates `grid-template-rows: 1fr → 0fr`, never `max-height`;
  `visibility` drops after the collapse so the row leaves the tab order.
- `#web-design` / `#brand-identity` / `#portfolio-sites` / `#site-care` live here;
  the nav Services panel links to them.
- **Nothing in the FAQ quotes a price** — the Pricing panel is the single source.

## Editing index.html with a script

A slice that cut from the `<section>` tag once left the `<!-- ── Services ── -->`
comment orphaned; the next edit matched the orphan and silently deleted **three
sections**. It shipped.

- **Cut from the comment, not the tag, and never leave a marker behind.**
- **After any structural edit, print
  `re.findall(r'<section[^>]*id="([a-z]+)"', html)` and read it.** Expected:
  stats, intro, work, about, services, faq, contact, scan, newsletter — plus
  `feedback` after about if the testimonials come back.
- `frontend-bug-sweep` catches it via dead anchors — but only if run *before*
  pushing.

## Content still to fill

- **The testimonial marquee is removed, not fixed.** All eight quotes were
  written rather than collected, and publishing fabricated reviews on a
  business's own site is unlawful in the US under the FTC rule on consumer
  reviews (16 CFR Part 465), so the section came out of `index.html` on
  2026-08-15. The markup is parked verbatim in `tools/parked/testimonials.html`
  with restore instructions. **It goes back only with real, attributable quotes
  from named, consenting clients** — delete any row that cannot be attributed;
  the marquee reads fine with four. Its CSS, its `main.js` block and the
  `#feedback` vignette are all still in place and no-op without the markup.
  **All three are now unverified — re-measure when it returns**, which is
  exactly how `.on-dark` rotted.
- **Pricing is Jared's**: from **$600** landing page (was $300 until 2026-08-26),
  from $1,200 full site, $120/month care, set 2026-08-14. **Each figure is written
  in four places** — the nav Pricing panel in `index.html`, the `pricing.html`
  card, that fragment's `desc:` line, and the `services.html` row — plus the
  contact form's budget placeholder, which tracks the range
  ("e.g. New site, $600–1,200"). Move all five together or the site quotes two
  different numbers.
- **Nobody is called a "small business" or a "startup".** Jared's clients are
  "businesses", full stop — changed 2026-08-26 across the meta and og
  descriptions, the About panel pills, the "What I do" statement, its first card,
  the About paragraph, `services.html` and `privacy.html`. **The one exception is
  the 27% stat**, whose label has to stay "of small businesses" because Top Design
  Firms surveyed 1,003 small-business owners and the figure does not describe
  anyone else. Widening it would misdescribe the source, which is the same rule
  that keeps the Stanford figure at 46%. The six concept case studies still say
  "a small floral studio", "a small-batch roaster" and so on — those describe the
  invented businesses in the work, not Jared's clients.
- **Nothing is for sale on `products.html`, and the page says so.** No items, no
prices, no checkout, because none exist — a nav entry promising a shop and
delivering invented products is the same lie as an invented review. The Products
panel reads "In development" for the same reason. **Do not put a price or a buy
button there before there is something to buy.**

**Forms post to `action="#"`.** `main.js` refuses that honestly rather than
  faking success, but the form cannot work until it has a real endpoint.
- **Confirm the licence on the supplied photography.** `process-bench.webp` came
  in as `neatly-kept-jewelers-desk.jpg`; a commercial site needs licences on
  record before launch.
