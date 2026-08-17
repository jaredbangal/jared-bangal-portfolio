# Jared Bangal — portfolio site

Static site. No build step, no framework, no package manager. Plain HTML, one
stylesheet, two progressive-enhancement scripts.

```
index.html              Home
services.html           the four services in full
pricing.html            the three packages, and how quoting works
products.html           digital products — nothing on sale yet, and it says so
privacy.html            what the site collects (and mostly does not)
terms.html              how a project runs, in plain English
404.html                Vercel serves this automatically
robots.txt, sitemap.xml generated — tools/build_seo.py
assets/og/              link-preview cards, one per page
tools/siteinfo.py       CANONICAL origin + the indexable page list
tools/parked/           markup pulled from the site but coming back
work/<slug>.html        six concept case studies
tools/build_pages.py    assembles every page above from index.html's nav
tools/build_cases.py    writes the six case-study fragments
tools/fragments/        the body of each generated page — edit these
assets/css/styles.css   all styles
assets/js/main.js       nav, reveals, hero stage, marquee, carousel, forms
assets/js/particles.js  the WebGL field
assets/img/             portrait{,-480}.webp, work-<slug>.webp (concept
                        renders), stage-<slug>.webp (hero crops)
tools/build_shots.py    renders both from concepts/ and syncs the heights
concepts/<slug>.html    six concept sites — full sites, not hero mockups
motion/index.html       standalone particle study, not linked from the site
reference/              squarespace.com screens + scraped tokens
reference/site/         this site's own screens + tokens; regenerate with its
                        scrape.py rather than describing the design by hand
docs/design-notes.md    why every rule below exists — measurements, incidents
```

**This file is the rule list. `docs/design-notes.md` is the evidence** — same
headings, one to one. Read the matching section there *before changing the thing
a rule describes*; the rule alone is enough to stay out of trouble, the note is
what tells you which fix is the right one.

**There is no test suite. Measurement is the test.** Every number here was
measured. If you change what it describes, re-measure rather than recompute.

## Skills

The method lives in reusable skills — invoke them rather than re-deriving.

| Skill | For |
|---|---|
| **`rendered-contrast`** | every contrast check here; texture, glass and the canvas are invisible to a CSSOM checker |
| **`surface-texture`** | the paper tooth |
| **`particle-field`** | `particles.js` and `motion/` |
| **`carousel-craft`** | hero stage, Selected Work track, testimonial marquee |
| **`frontend-bug-sweep`** | pre-deploy pass |
| **`ui-ux-pro-max`** | `--design-system` for direction, `--domain ux` for a11y; §1–§3 are the pre-delivery gate |
| **`frontend-design`** | component craft |
| **`webapp-testing`** | screenshot at 1440 / 860 / 390 before calling anything done |

Skip `ui-styling` — Tailwind/shadcn, and this is vanilla CSS.

## Running it

```bash
python3 serve.py            # http://localhost:8777
python3 serve.py --stamp    # before deploying
```

Use `serve.py`, not `python3 -m http.server` — it stamps `?v=<md5>` cache-busting
tokens and sends `no-store`. **When a bug does not reproduce, check this first**:
`md5 assets/css/styles.css` against `curl -s .../styles.css | md5`.

**Every page that links the shared assets must carry a `?v=` token, and it is
`vercel.json` that makes this non-negotiable**: `/assets/*` is served
`immutable, max-age=31536000`, so one unstamped page is a page whose visitors
keep a year-old stylesheet and never re-check it. `serve.py --stamp` now walks
*every* HTML page, not just `index.html`, and its patterns capture and restore a
`../` prefix so the case studies work. `build_pages.py` stamps at generation
time too, so a freshly built page is correct before `serve.py` ever runs.

This shipped broken once and looked nothing like a cache: the home page was
stamped and updated correctly while all eleven generated pages served stale CSS,
so a fix that was verifiably live read as "you didn't fix it on those pages."
**A bug that reproduces for the user on some pages and not others, after a
deploy that measures correct in a fresh browser, is this.**

Deploy: `git push origin main` — Vercel builds from GitHub.

## Visual direction

squarespace.com's system on Jared's palette; `reference/squarespace-tokens.json`
holds scraped values — re-scrape rather than guess.

- **Nav** 80px, transparent over the hero, blurred translucent bar after.
- **Display type** weight 300, `-.055em`, `line-height: 1.04`, fluid `clamp()`.
  This light-and-tight setting is the whole look — **don't bold headings.**
- **Labels** 12px/500 uppercase, `+.08em`.
- **Buttons** 4px radius, uppercase 14px/500, solid fill, colour-and-background
  transition — no opacity fades, no lift. The nav CTA is the only `.btn--sm`:
  56px at `--text-2xs`, a set with the Log In link beside it.
- **Radii** 4px controls, 8px media/cards, 30px chips. No `--radius-md`.
- **Easings** `--ease-out` easeOutQuart (entering), `--ease-in-out`
  easeInOutCubic (buttons), `--ease-in-out-q` easeInOutQuad (nav), `--ease-in`
  easeInQuart (exits).
- **Layout** centred section heads with a muted sub-line, 128/160px padding.

**Archivo** stands in for their proprietary Clarkson — do not embed or hotlink
theirs.

## Colour

**The page is cream**: `--cream-200` `#E4E2DC` ground, `--cream-300` `#DAD7CF`
bands, `--cream-100` `#F4F2EC` raised cards, `--ink-dk` `#16171A` ink.

**Accent is pure black**: `--accent` / `--accent-ink` `#000000`, `--accent-hover`
`#2B2B2B`, `--text-on-accent` white.

- **Never introduce a fifth value.** `--focus-ring` stays ink — the ring is an
  accessibility affordance before it is a brand surface.
- **Muted floor is `--ink-dk-70` on cream, `--ink-60` on dark.** Measure ink
  against the *darkest textured patch*, never the token's nominal value.
- **A monochrome accent cannot carry a colour hover** (1.15:1 of travel). To get
  colour back, soften the *rest* state; don't move the accent.
- **Restore two distinct fill/draw pairs if the accent ever goes light again** —
  a light accent cannot be ink on paper.

### The dark scope

`.on-dark` redefines every semantic token for the ink blocks; its accent
**inverts** to `#FFFFFF` (pure black on shade-900 is 1.06:1).

- **Check this block whenever the brand colour moves** — it has gone stale twice.
- **Re-resolve `color` wherever the scope changes.** It inherits as the
  *computed* value, so anything that merely inherits keeps the old ramp and
  vanishes.
- `.nav` is in the `.on-dark` selector list rather than carrying the class,
  because it has to leave the scope again on `[data-scrolled]` and the open
  states.

## Texture

Paper tooth on every surface, **behind** the content as a background layer on the
surface itself — that is why it can be this strong. Method: `surface-texture`.

| | tile | mode | measured |
|---|---|---|---|
| Cream surfaces | `--tex`, slope .38 / centre .762 | `luminosity` | stdev 8.2, shift +1.5 |
| Ink blocks | `--tex-dark`, slope .16, sRGB filters | `lighten` | stdev 3.2, shift +1.6 |

The dark tile sits on `--shade-950` `#070A0E` so the result lands on
`--shade-900`'s apparent value. The tile scrolls with the surface, not the
viewport; `stitchTiles` keeps the repeat seamless.

## The particle field

`particles.js` — 2400 points, fixed behind the page, morphing between four
formations as sections scroll past. Architecture: `particle-field`.

- **Running order `sphere → vortex → polaris → waves → sphere`**, set by
  `data-formation`. Services, FAQ and Contact all hold the sphere so the field
  settles instead of morphing under the enquiry. Worst text contrast there:
  6.62:1 at 1440, 6.93:1 at 390.
- **Palette is blue**, five stops. It is **not** on `--accent` and must never be
  promoted into the token layer, or the page has two accents.
- **`CORE_ALPHA` `.34` is a contrast budget, not taste.** Re-solve against
  rendered pixels if the palette moves. Worst with the field live: 6.14:1 / 6.29:1.
- **Cursor strength is per formation and they were never equally loud.** Measured
  as the share of *canvas* pixels the cursor moves beyond the field's own drift:
  polaris **0.73pp**, vortex 0.41, sphere 0.11, waves 0.04. Polaris carried nearly
  all of what read as too much interaction and took nearly all of the cut
  (push 20 → 9). **Two ways this measurement lies, both hit:** probing viewport
  centre reports the sphere as inert, because it is a shell and no points sit
  within `rep` of the origin — probe a ring; and moving the pointer also fires DOM
  hover states, which swamp every dot on screen — hide `.nav`, `main` and `footer`
  and measure the canvas against a parked-pointer control.
- Sphere fits **0.52** of the smaller viewport half-extent; camera orbit runs at
  **45%** of `motion/`'s.
- `#field` is fixed at `z-index: 0`; `.nav`, `main`, `footer` at 1. The field does
  **not** show through the ink blocks or `.band` — those are opaque, deliberately.
- **The hero has no photograph.** If one returns, re-solve the scrim from scratch
  (method in git at `331840d`).

`motion/` is a separate study — **shares no stylesheet, tokens or measurements**,
and still runs the maroon palette. Porting the blue there means re-measuring it.

## Hero stage

Six concept sites on a self-advancing track, cut off by the fold. Mechanics:
`carousel-craft`.

- Opens on meridian / **sunday** / northline. **Source order is the running order
  and index 1 leads**: `--i: 1` in CSS and `START = 1` in `main.js` name the same
  slide — change one alone and the opening depends on whether JS loaded.
- Advances every **2s**; hover suspends, an arrow or dot stops it for good.
  **There is no pause button** — the arrows are the WCAG 2.2.2 stop mechanism.
- **No border on the cards** — a 1px edge on a full-bleed screenshot reads as a
  hairline drawn on the artwork. The shadow separates them.
- **The cards are whole, not cropped**: `--card-h` is 16:9, `object-position: top`.
- **The stage is bounded by viewport *height***:
  `--stage-max-h: max(120px, calc(100svh - 36rem))`.
- **Portrait viewports of any width** take the stage height from the slide's
  aspect instead of `100svh`. Below 620px the centre is 62vw and the stage height
  comes off; landscape phones drop the stage.
- `#intro` and the stage run full-bleed without `.shell`. **Never use a `100vw`
  pseudo-element** — that put a horizontal scrollbar on every breakpoint once.
- `stage-<slug>.webp` is the top 800×620 of the full-page render. Opening three
  images eager, rest lazy.

## Nav panels

Four disclosures — Services, Pricing, Products, About — all one three-column
shape (index / explore / promo). Keep new ones to that shape.

- **Process was a fifth and is gone.** It was a panel without a page section,
  kept because the four steps were worth saying; `services.html` now says them
  under "How a project runs", so removing it lost nothing. Column one is links
  where destinations exist and `.panel__facts` rows where they do not — the
  Products panel is the remaining example of the latter.
- **The panel is the page colour, not `--bg-band`** — shadow and border do the
  separating, and the caret carries the same value.
- **Panels are positioned against the bar, not the trigger**, and use
  `visibility`, not `display`. The caret is `.nav__panel::before` at `--caret-x`,
  **not a child element** — a real element would take a column's `nth-child`
  stagger. Its border is `--border-strong`, or the arrow is invisible.
- **`.panel__cta` is a filled button to the disclosure's own page**, on Services,
  Pricing and Products only. Column one indexes anchors *within* a page; without
  this the page itself has no entry from the nav, which is how four pages ended
  up reachable only from the footer. Process has no page by design and About's
  destination is already its first link — **a button to nowhere is worse than no
  button.**
- **Below 901px the bar becomes a drawer** and panels an accordion. The JS
  breakpoint (`barLayout`) must stay in step with the CSS one — hover opens
  panels in the bar layout only. **Four triggers is what the bar holds**: it
  briefly ran five, which overflowed the viewport between 902 and 980px and
  forced the breakpoint to 1025 until Process was cut. The row gap drops to
  `--space-8` below 1180px, kept from that episode. **Re-measure at every width
  from 320 to 1600 if a fifth is ever added again** — at 902px the bar has 24px
  of clearance, which is all of it.
- Triggers are `<button aria-expanded>`, not links. Hover is never the only way
  in: click, Enter, Space, Escape, a 220ms `mouseleave` grace, focus returned to
  the trigger.
- **Timings**: `--dur-panel-settle` 1100ms, `--dur-panel` 420ms from
  `translateY(10px)`, `--panel-stagger` 90ms from `translateX(-12px)`.
  `--dur-panel` drives the fade, the column resolve **and** the visibility
  hand-off — keep them on one token.
- Bar-level styling must be `.nav__item > a` and `.nav__links > ul`; descendant
  selectors leak into the panels. The scrollspy reads `[data-spy]`, not every
  `a[href^="#"]`.
- Panel links must point at real anchors — check with `frontend-bug-sweep`.

## The case (stats)

**Every figure is attributable on the page**, and that visible source line is not
optional trim. If a figure cannot be traced to a named study with a date, it does
not go here.

| Figure | Source |
|---|---|
| 27% of small businesses have no website | Top Design Firms, May 2022, n=1,003 |
| 98% use the internet to find a local business | BrightLocal, Local Consumer Review Survey |
| 46% judge credibility on how a site looks | Stanford Web Credibility Project |

The widely-repeated **"75% judge credibility on design" is a misattribution** —
Stanford's finding is 46.1%. It is quoted correctly here; don't let anyone
"improve" it.

- Sits on `--bg-page`, not `--bg-band`, and is capped at 56rem. **It is a
  preamble, not a destination — if it grows back, that is a regression.**
- **The count-up fires once.** Final values live in the HTML; `tabular-nums` stops
  the row reflowing; the animated span is `aria-hidden` beside a visually-hidden
  copy of the true value.

## Selected Work

Six **concept projects** in `concepts/`, tagged `Concept` in the UI. There is no
shipped client work yet. **Never present someone else's site as work done here.**

| Slug | Business | Direction |
|---|---|---|
| `botanica` | Floral studio | Fraunces italic on sage, deep green |
| `borough` | Barber shop | Oswald condensed on near-black, amber |
| `kettle` | Coffee roaster | Instrument Serif on espresso, copper italic |
| `sunday` | Bakery | Bricolage Grotesque, butter/terracotta blocks |
| `meridian` | Architecture studio | Archivo only, visible column grid |
| `northline` | Bike shop | IBM Plex Mono specs, lime on slate |

Each is a different typeface and temperature on purpose — keep new ones distinct
from all six.

- **Tab-driven scroll-snap carousel** with a clone loop (`carousel-craft`).
  Auto-advances every **4s**, only while on screen; the tabs are the WCAG 2.2.2
  stop mechanism.
- **Hover-to-suspend binds to the track and the tab row, never `#work`** — the
  section is taller than the viewport, so it would suspend permanently.
- **A concept ground must clear ΔE ≈ 25 from `--cream-200`, and contrast ratio
  cannot check this.** Botanica `#F4F0E6` and Kettle `#E7E1D6` both dissolved
  into the page — Kettle sat at **1.00:1**, identical luminance. Ratio is blind
  to hue, so measure ΔE in Lab: Sunday works at 60, Meridian at 27, and those
  are the only two proven points. Botanica's first sage fix measured 12 and
  still blended.
- **Botanica is green ink on a green ground, so the two move together.** Darkening
  the ground to clear ΔE pushed moss text to 4.21:1 on the footer; moss went
  `#2F4634` → `#263A2A` with it. Re-solve both or neither.
- **Kettle inverts rather than warming.** Every saturated *light* ground tested
  killed the accent — rust had to reach `#632F16` to clear 4.5:1, by which point
  it read brown. On espresso the accent stays bright as copper, the same move
  `.on-dark` makes on this site.
- **The card shadow is still load-bearing** for the light grounds.
- Palettes ride inline on `--slide-bg` / `--slide-ink`; softened text uses
  `color-mix` at **88%/92%** — solved, not chosen. Re-solve if a colour changes.
- **`tools/build_shots.py` renders both images and rewrites the `height`
  attributes in `index.html`.** Never shoot these by hand: the height attribute
  is what reserves the card's space, and a stale one shifts the page as it
  loads. 900×1125, `full_page=True`, resized to 800 wide, WebP q84.
- **The tile is capped at `MAX_TILE_H` 2600px and that cap is load-bearing.**
  The card scrubs the whole render on hover over a *fixed* duration, so an
  uncapped tile does not show more — it shows the same thing faster. The
  concepts run 3.4–4.3 screens since they were filled out; uncapped, the scrub
  was unreadable. **`MAX_TILE_H` and the 3800ms in `.slide__shot` are one
  number in two files** — move one and re-solve the other (2400ms was correct
  at the old ~1600px).
- The first 1125px must still stand alone — that is all a touch device sees.
- **Hover travel** is `translateY(calc(100cqh - 100%))` on a `container-type:
  size` frame — no per-tile numbers. Gated on fine pointers, and **cancelled
  outright** under `prefers-reduced-motion`.
- **The concepts are authored responsive; there is no generated patch any
  more.** The `@media (max-width: 760px)` block each page used to carry was a
  retrofit, because the originals were built at one width. They were rewritten
  at three breakpoints, so the retrofit is gone — edit the pages directly.
- **Every accent in the six is split into a display value and a text value
  where it had to be**: `--clay`/`--clay-ink`, `--rust`/`--rust-ink`,
  `--crust`/`--crust-ink`. The decorative half fails 4.5:1 by design and is
  allowed only at 24px+. Six readings failed before this split, worst 2.94:1
  on Meridian's nav. Method: `rendered-contrast` — `opacity` on inherited ink
  is invisible to a CSSOM checker, and that is what most of these were.

## The accent hover

One pattern, shared: the heading (and numeral) goes `--accent-ink-hover`, the rule
or border goes `--accent-ink`, and **colour lands first** (`--dur-fast`) while the
lift and any wipe run slower. A new block of the same kind should join it rather
than invent its own.

**No pointer cursor and no focus equivalent, deliberately** — these are
decoration, and nothing is reachable only by hovering.

### The "What I do" cards: glass and tilt

The three points are glass cards on the ink block that lean toward the pointer.

- **Glass is a token set, not raw rgba**: `--glass-fill`, `--glass-edge`,
  `--glass-inset`, `--glass-glare`, `--glass-blur`, each with a hover variant.
  **They invert under `.on-dark`, and the two scopes are an order of magnitude
  apart** — 62% of cream is frosted glass, 62% of white on ink is a grey box.
  Dark values: fill 6% white, hover 11%. Below 10% edge the card stopped
  separating from the block; above 20% fill it stopped reading as glass.
- **Glass needs something behind it.** `.intro__points::before` puts two very soft
  blooms under the row, because the ink block otherwise offers the blur nothing
  but its own texture. **Vertical bleed only** — a negative horizontal inset once
  made the document wider than the viewport at every breakpoint.
- **The card carries `.reveal`, so it must never set `transform`.** The tilt goes
  through `--rx` / `--ry` / `--lift`, which `.js .reveal.is-in` applies.
- **The entrance owns the transform transition at `--dur-slow`**; a hover at that
  speed feels broken, so `.is-settled` hands the timing over at `(0,4,0)`
  specificity, which clears `.js .reveal.is-in` wherever the two sit in the file.
- `data-tracking` drops the transform transition while the pointer is followed —
  a transition there turns the lean into elastic drag — and is removed on leave so
  the *return* still eases.
- **`main.js` tilts every direct child of `[data-tilt]`**, not a class, so it can
  be pointed at another set without renaming anything. Max lean 5°.
- **Perspective belongs on the card, never on the row.** `perspective` on
  `.intro__points` gives three cards one vanishing point, so only the middle one
  is on axis — at an identical `rotateY(5deg)` they rendered **395.04 / 382.63 /
  370.21px** wide, the outer two keystoned. It is `--persp` per card now, fed
  into the transform as `perspective()` **first in the chain**, through a
  (0,4,0) rule because a card may not set `transform` itself.
- **The pointer is mapped in document space** — `pageX/pageY` against an
  `offsetLeft`-walked box. `getBoundingClientRect()` is wrong here twice over: it
  returns the *transformed* box, so re-entering a leaning card measures 395px
  instead of 384 and feeds that back in; and a rect cached on `pointerenter`
  goes stale the moment the page scrolls under a held pointer. Layout offsets
  ignore transforms and `pageX` already accounts for scroll, so neither needs a
  handler. Tracks the pointer to within **0.07°** of the 5° range.
- Gated on `(hover: hover) and (pointer: fine)`: a touch device cannot reverse a
  tilt. Under reduced motion the lean is pinned to 0 and the glare is
  `display: none` — the global reduce rule only shortens durations, which would
  strand the card mid-lean.
- Worst contrast across all three cards, at rest and hovered, at 1440 and 390:
  **5.54:1** (hovered body copy, where the glare lightens the ground behind it).

## Testimonial marquee

A marquee, not a snap track: there is nothing to land on and nothing to pick.
`main.js` inserts a second copy of the set, `aria-hidden` with `tabindex="-1"`
descendants.

- **The travel is not `-50%`** but
  `translate3d(calc(-50% - var(--marquee-gap) / 2), 0, 0)` — sixteen cards have
  fifteen gaps, and the missing half-gap is a 12px jolt per cycle. Verify by
  measuring `children[N].offsetLeft - children[0].offsetLeft`.
- Transform only, never `scrollLeft`.
- **The pause button is the WCAG 2.2.2 mechanism** and is built by `main.js`, not
  the HTML — a pause control for an animation that never starts is a dead control.
- End fades are a `mask-image`, not an overlay that would hard-code `--bg-band`.

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
**Services** → **FAQ** → Contact → Newsletter.

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
  and is parked. Worst contrast on the page: **5.94:1**.
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

## About

- **Columns are sized to their content and the pair is centred**, not split as
  fractions of the shell. Fractions balance the *columns*; what has to balance is
  the ink.
- **Two paragraphs and nothing else** — no credentials list. Jared wants the
  security background as an argument, not a CV.
- The page says **"a master's in cybersecurity management"**; the résumé says MS,
  Information Systems, with that among the coursework. Jared asked for it this
  way — don't "fix" either against the other.
- Résumé figures: **2,500+** students and staff at BYU–Hawaii, **350+** machines
  at the Polynesian Cultural Center. Don't round them up.
- **The nav's About panel carries the same line — if one changes, change both.**
- **The portrait is whole, not cropped**: `height: auto` (explicit, or the `height`
  attribute wins), capped on mobile by `max-width`, never by height.

## Editing index.html with a script

A slice that cut from the `<section>` tag once left the `<!-- ── Services ── -->`
comment orphaned; the next edit matched the orphan and silently deleted **three
sections**. It shipped.

- **Cut from the comment, not the tag, and never leave a marker behind.**
- **After any structural edit, print
  `re.findall(r'<section[^>]*id="([a-z]+)"', html)` and read it.** Expected:
  stats, intro, work, about, feedback, services, faq, contact, newsletter.
- `frontend-bug-sweep` catches it via dead anchors — but only if run *before*
  pushing.

## Conventions

- **Every block in `main.js` gets its own IIFE.** `var` is function-scoped; two
  blocks once shared `track` / `real` / `all` / `CLONES` and broke each other with
  no error anywhere. Scan for duplicate top-level `var` names.
- **Tokens are three-layer and one-directional**: primitives → semantic →
  component. **Components reference semantic tokens only** — no raw hex or rgba in
  a component rule.
- **Contrast is checked, not guessed.** Every ink alpha carries its measured ratio
  in a comment. Body copy at `--ink-60` or lighter (5.8:1 floor); `--ink-40` is
  large bold only (3:1); below that is non-text. Add a value, record its ratio.
- **The entrance stagger must not outlive the entrance.** A `transition-delay`
  applies to every later transition too; `main.js` zeroes it with `.is-settled`.
  Anything that sets its own delay must do the same.
- **Set variables, never `transform`, on anything carrying `.reveal`** —
  `.js .reveal.is-in` is (0,3,0) and out-specifies component transforms. Use
  `--lift`.
- **Depth is a four-step scale**, `--shadow-1`…`4`, each *two* shadows (contact +
  ambient), offsets vertical only. Cards rest 1 / hover 3, slides 2, panels 4,
  buttons 2 on hover and 1 on press.
- **Everything pressable has an `:active`** — `.98` through the `--press` channel,
  90ms, because 200ms feels spongy under a finger.
- **Motion shares one rhythm**: `--dur-fast` 200ms buttons, `--dur-base` 300ms
  nav/surfaces, `--dur-slow` 800ms entrances, `--stagger` 80ms between siblings.
  Transform and opacity only. Every motion rule needs a reduced-motion escape.
- **Touch targets are 44px minimum** and 44px is a *floor, not a starting size* —
  use `flex: 0 0 44px`, since `flex-shrink` will silently trade it down.
- **JS is optional by contract.** The page must read, navigate and submit with
  `main.js` removed; the `.js` class is added by the script, so a hidden start
  state can only exist when something is present to undo it.

## Findability

**One origin, `tools/siteinfo.py`.** `CANONICAL` feeds the sitemap, every `og:`
tag and every page's `<link rel="canonical">`. Moving to a custom domain is one
edit there plus `build_pages.py && build_seo.py`.

**It is still the vercel.app address on purpose.** `jaredbangal.com` is
registered but parked on a lander with no records pointing here. **A canonical
tag aimed at a parking page tells search engines to index the parking page** —
worse than no canonical at all. Change it the day the domain is connected in
Vercel, not before.

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

## Source of truth

The design lives in Claude Design project
`f1dfaa4f-eab9-48d1-b16c-67b925eef288` ("Portfolio landing page design");
`Home.dc.html` is the reference for this page. Read with the `DesignSync` MCP
(`get_file`) — images in `<image-slot>` elements are base64 in
`.image-slots.state.json`, not files. **Never push local changes back** unless
asked; the sync is one-way, design → code.

`Services.dc.html` and `Pricing.dc.html` are designed but **not implemented**. The
nav and footer links point at `#services` and `#contact`; repoint them if those
pages get built.

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
- **Pricing is Jared's, set 2026-08-14**: from $300 landing page, from $1,200 full
  site, $120/month care. They live in the nav Pricing panel only, and the contact
  form's budget placeholder tracks the range ("e.g. New site, $300–1,200") — move
  it whenever the figures move.
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
