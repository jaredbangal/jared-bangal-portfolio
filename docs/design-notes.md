# Design notes — the reasoning behind CLAUDE.md

`CLAUDE.md` is the rule list and loads in every session. This file is the
evidence: the measurements, the incidents each rule came out of, and the
alternatives that were tried and rejected. **Read the section here before
changing the thing it describes**, then keep `CLAUDE.md` as the short form.

Headings match `CLAUDE.md` one to one.

Static site. No build step, no framework, no package manager. Plain HTML, one
stylesheet, two progressive-enhancement scripts.

```
index.html              Home (the only real page)
assets/css/styles.css   all styles
assets/js/main.js       nav, reveals, hero stage, marquee, carousel, forms
assets/js/particles.js  the WebGL field
assets/img/             portrait{,-480}.webp, work-<slug>.webp (concept
                        renders), stage-<slug>.webp (hero crops)
concepts/<slug>.html    six self-contained concept designs
motion/index.html       standalone particle study, not linked from the site
reference/              squarespace.com screens + scraped tokens
reference/site/         this site's own screens + tokens; regenerate with its
                        scrape.py rather than describing the design by hand
```

## Skills

The *method* lives in reusable skills. Invoke them rather than re-deriving.

| Skill | For |
|---|---|
| **`rendered-contrast`** | every contrast check here — texture, glass and the particle canvas are invisible to a CSSOM checker |
| **`surface-texture`** | the paper tooth; blend modes, calibration, the linearRGB trap |
| **`particle-field`** | `particles.js` and `motion/` |
| **`carousel-craft`** | hero stage, Selected Work track, testimonial marquee |
| **`frontend-bug-sweep`** | pre-deploy pass |
| **`ui-ux-pro-max`** | `--design-system` for direction, `--domain ux` for a11y. §1–§3 are the pre-delivery gate |
| **`frontend-design`** | component craft |
| **`webapp-testing`** | screenshot at 1440 / 860 / 390 before calling anything done |

Skip `ui-styling` — Tailwind/shadcn, and this is vanilla CSS.

**There is no test suite. Measurement is the test.** Every number below was
measured; if you change what it describes, re-measure rather than recompute.

## Running it

```bash
python3 serve.py            # http://localhost:8777
python3 serve.py --stamp    # before deploying
```

Use `serve.py`, not `python3 -m http.server` — it stamps `?v=<md5>` on the CSS
and JS links and sends `no-store`. **When a reported bug does not reproduce,
check this first**: compare `md5 assets/css/styles.css` against
`curl -s .../styles.css | md5`. A truncating CSS parse error looks identical to
a stale cache from the outside.

Deploy: `git push origin main` — Vercel builds from GitHub, live at
`jared-bangal-portfolio.vercel.app`. `vercel.json` sets HTML to
`max-age=0, must-revalidate`, `/assets/*` to `immutable`.

## Running it

**The cache-busting story, because it cost a round trip.** `vercel.json` serves
`/assets/*` with `Cache-Control: public, max-age=31536000, immutable`. That is
correct and deliberate — the assets *are* immutable, provided every URL that
points at them carries a content hash. `serve.py` has always written those
hashes into `index.html`.

The generator did not write them. Eleven new pages shipped linking bare
`assets/css/styles.css`, and Vercel duly told every visitor's browser to keep
that response for a year without revalidating. The consequences were precisely
inverted from how the bug presented:

- The **home page** pointed at `styles.css?v=ac59c460`, a distinct URL, so it
  picked up each CSS change immediately and looked fine.
- The **generated pages** pointed at `styles.css`, cached immutably from the
  first visit, so they kept rendering the stylesheet as it was *before* the
  `.prose a:not(.btn)` fix — the invisible-button bug, still visible, on exactly
  the pages the fix was written for.
- Every automated check passed, because Playwright launches with a cold cache
  and therefore never reproduced it.

So the report "you didn't fix it on those pages" was correct about the symptom
and the fix was correct about the cause; the two were separated by a year-long
cache entry. **Adding the `?v=` token changes the URL, which is what makes the
stale entry unreachable** — no purge, no header change, no waiting.

Two defences now, deliberately overlapping: `build_pages.py` stamps at
generation time so committed output is already correct, and `serve.py --stamp`
walks every page rather than only `index.html`, with patterns that capture and
restore the `../` prefix the case studies need.

**The general rule this leaves:** a bug that reproduces for the user on some
pages but not others, immediately after a deploy that measures correct in a
fresh browser, is a caching difference between those pages — not a CSS bug that
half-applied.

## Visual direction

squarespace.com's system on Jared's palette. `reference/squarespace-tokens.json`
holds scraped values — re-scrape rather than guess.

- **Nav** 80px, transparent over the hero, blurred translucent bar after.
- **Display type** weight 300, `letter-spacing: -.055em`, `line-height: 1.04`,
  fluid `clamp()`. This light-and-tight setting is the whole look; **don't bold
  headings.**
- **Labels** 12px/500 uppercase, `+.08em` tracking.
- **Buttons** 4px radius, uppercase 14px/500, solid fill, colour-and-background
  transition — no opacity fades, no lift. The **nav CTA** is the only `.btn--sm`:
  theirs is 60px in an 80px bar, so our 44px read as a thin slab. Now 56px at
  `--text-2xs`, matching the Log In link beside it — the two are a set.
- **Radii** 4px controls, 8px media/cards, 30px chips. There is no `--radius-md`.
- **Easings** from their computed styles: `--ease-out` easeOutQuart (entering),
  `--ease-in-out` easeInOutCubic (buttons), `--ease-in-out-q` easeInOutQuad
  (nav), `--ease-in` easeInQuart (exits).
- **Layout** centred section heads with a muted sub-line, 128/160px padding.

Their face, Clarkson, is proprietary and served from their CDN — do not embed or
hotlink it. **Archivo** is the stand-in: closest freely licensed grotesque with a
true 300 weight.

## Colour

**The page is cream.** `--cream-200` `#E4E2DC` ground, `--cream-300` `#DAD7CF`
bands, `--cream-100` `#F4F2EC` raised cards, `--ink-dk` `#16171A` ink — all four
from the Meridian concept.

**Accent is pure black**: `--accent` / `--accent-ink` `#000000`, `--accent-hover`
`#2B2B2B` (the only direction black can move), `--text-on-accent` white. 21:1 as
a fill and as ink on every cream.

**A monochrome accent costs the colour half of a hover**: a heading already at
`--text-primary` travels 1.15:1 to the accent — imperceptible. Those hovers read
through lift, shadow and rule wipe instead. To get colour back, soften the *rest*
state; don't move the accent. The fill/draw token split stays even though both
halves resolve to the same pair here — **restore two distinct pairs if the accent
ever goes light again.** A light accent cannot be ink on paper, which is the trap
the previous orange fell into (`#F25939`: 5.6:1 as a fill, 2.6:1 as ink).

**Never introduce a fifth value.** `--focus-ring` stays ink — an on-theme ring is
weaker than a maximum-contrast one, and the ring is an accessibility affordance
before it is a brand surface.

**Muted floor**: `--ink-dk-70` on cream (4.7:1 against the darkest textured patch
of `--cream-300`, the worst surface here). `--ink-dk-66` measured 4.9:1 on the
*flat* band and **4.2:1** once textured — a real AA failure. Measure ink against
the *darkest patch*, never the token's nominal value. `--ink-60` on dark.

### The dark scope

`.on-dark` redefines every semantic token for the ink blocks. It was dead code
for a while and rotted twice — **check it whenever the brand colour moves.**

- Its accent lagged the brand (orange, then terracotta). Monochrome cannot shift
  hue here, so it **inverts**: `#FFFFFF`, measuring 18.4 / 17.6 / 16.2 / 15.1 on
  shade-900…600. Pure black on shade-900 is **1.06:1**.
- `--accent` (the fill) was once not redefined at all — a ~2:1 button waiting for
  the first `.btn--primary` dropped into a dark section.

**`color` must be re-resolved wherever the scope changes.** It inherits as the
*computed* value, so `body` resolves `--text-primary` against one ramp and
everything that merely inherits (every `.h2`) keeps it and vanishes. Elements
that set their own colour were fine, which is what makes the bug look random.

`.nav` is in the `.on-dark` selector list rather than carrying the class, because
it has to leave the scope again: light values are re-declared on
`.nav[data-scrolled]` and the two open states at one notch more specificity.

## Texture

Paper tooth on every surface, sitting **behind** the content as a background
layer on the surface itself — that is why it can be this strong. A fixed overlay
above live text is capped by contrast and never got past stdev 2.2. Method:
**`surface-texture` skill.** Project values:

| | tile | mode | measured |
|---|---|---|---|
| Cream surfaces | `--tex`, slope .38 / centre .762 | `luminosity` | stdev 8.2, shift +1.5 |
| Ink blocks | `--tex-dark`, slope .16, sRGB filters | `lighten` | stdev 3.2, shift +1.6 |

The dark tile sits on `--shade-950` `#070A0E` so the textured result lands on
`--shade-900`'s apparent value; its lower stdev is the honest ceiling, since
black has no downside headroom. The tile scrolls with the surface rather than
being fixed, which also sidesteps the iOS `background-attachment: fixed` bug;
`stitchTiles` keeps the repeat seamless.

## The particle field

`particles.js` — a fixed WebGL field of 2400 points behind the whole page,
morphing between four formations as sections scroll past. Architecture and every
general rule: **`particle-field` skill.** Project specifics:

- **Running order `sphere → vortex → polaris → waves → sphere`**, set by
  `data-formation`: hero sphere; stats and What I do vortex; Selected Work
  polaris; About and Testimonials waves; **Services, FAQ and Contact all sphere**,
  so the field settles and holds while the page asks for the enquiry instead of
  morphing under the form. Worst text contrast across that closing run:
  **6.62:1** at 1440, **6.93:1** at 390.
- **Palette is blue** — five stops, luminance .03 to .50. Cool field on a warm
  ground; the one thing here allowed to be cold. It is **not** on `--accent` and
  must never be promoted into the token layer, or the page has two accents.
- **`CORE_ALPHA` `.34` is a contrast budget**, not taste — the previous maroon
  could only afford `.20`, and at full opacity put `--text-muted` at 1.19:1.
  Re-solve against rendered pixels if the palette moves. Worst with the field
  live: **6.14:1** at 1440, **6.29:1** at 390.
- The sphere fits **0.52** of the smaller viewport half-extent.
- Camera orbit runs at **45%** of `motion/`'s figures — a camera swinging under a
  paragraph is motion sickness.
- `#field` is `position: fixed` at `z-index: 0`; `.nav`, `main`, `footer` at 1.
  The canvas is transparent so cream and texture show through, but the field does
  **not** show through the ink blocks or `.band` — those are opaque, deliberately.

**The hero has no photograph.** Removed when the field went in. If one comes back
the scrim must be re-solved from scratch (method in git at `331840d`).

`motion/` is the full-strength study on its own page — 3000 particles, r128 from
cdnjs plus DM Sans. It borrows the palette so it reads as the same studio but
**shares no stylesheet, tokens or measurements**, and still runs the **maroon**
palette with square points. Text there needs a **halo, not a panel** (dark ink on
the darkest particle was 1.24:1; the halo took every string to 6.3–14.3:1), its
`#c2451c` is fills-only at 3.44:1 with `#9E3110` carrying text, and dim copy runs
`.70` alpha. Porting the blue there means re-measuring that page.

## Hero stage

Six concept sites on a self-advancing track under the headline, cut off by the
fold. Mechanics: **`carousel-craft` skill.** Project specifics:

- Opens on **meridian / sunday / northline**, Sunday centred. **Source order is
  the running order and index 1 leads**: `--i: 1` in the stylesheet and
  `START = 1` in `main.js` name the same slide — change one alone and the page
  opens differently depending on whether JS loaded.
- Advances every **2s**; hover suspends, an arrow or dot stops it for good.
  **There is no pause button** — the arrows are the WCAG 2.2.2 stop mechanism. If
  they go, a pause control must come back. Opening three images eager, rest lazy.
- **No border on the cards.** These are full-bleed screenshots, so a 1px light
  edge reads as a white hairline drawn *on* the artwork — worst on the dark
  concepts. The shadow separates them.
- `stage-<slug>.webp` is the top 800×620 of each full-page render (~16KB vs
  ~45KB). Re-crop from the master if a concept is re-shot.
- **The cards are whole, not cropped.** A card complete on all four corners cannot
  be produced by clipping, so the artwork has to fit: `--card-h` is 16:9 and
  `object-position: top` keeps each masthead in frame.
- **Bounded by viewport *height*, not just width.**
  `--stage-max-h: max(120px, calc(100svh - 36rem))` — what is left after the copy
  block, which measures 514–558px and is near constant. A proportional budget
  (34svh) put the card 23px below the fold at 1280×800: whole, but cut by the
  window, which looks identical to the clipping this replaced.
- **Portrait viewports of any width** take the stage height from the slide's
  aspect instead of `100svh`. The condition is the aspect ratio, not a width: a
  slide's height is fixed by the viewport *width*, so on portrait it cannot reach
  the fold and the stage grew past the artwork (216px of dead cream at 768×1024,
  while 1024×768 clips correctly at the same width). Below 620px the centre is
  62vw — at 78 the neighbours peeked by 14% against ~52% on desktop — and the
  stage height comes off entirely; landscape phones drop the stage.
- `#intro` and the stage gave up `.shell` to run full-bleed. **Do not reach for a
  `100vw` pseudo-element** — that already put a horizontal scrollbar on every
  breakpoint once.

## Nav panels

Four disclosures — Services, Pricing, Process, About — all built to one
three-column shape (index / explore / promo) so they read as a set. Keep new ones
to that shape. **Process is a panel without a page section**, deliberately: the
"How it works" section was cut but the four steps are still worth saying. Column
one is links where real destinations exist and `.panel__facts` data rows where
they do not; chips are `.panel__pills` links or `.panel__pills--static` facts.

**The panel is the page colour, not `--bg-band`** — it is not a different surface,
it is the page lifted off itself, so the shadow and border do all the separating.
The caret carries the same value; a mismatch shows as a chip.

**Each panel points at its own trigger** via an 8px gap and a caret at
`--caret-x`, set by `main.js` from the trigger's centre. Panels are positioned
against the **bar**, not the trigger, so a wide one can centre without running off
the left edge, and they use `visibility`, not `display`, so they can transition
and still leave the tab order when shut.

The caret is `.nav__panel::before`, **not a child element** — `.nav__panel > *`
carries the column stagger, so a real element would be a fifth column and shift
every `nth-child` delay. Two things about it were wrong first: **the clip keeps
the square's top-*left* triangle** (under `rotate(45deg)` that corner lands at the
top — reason from where the corner ends up, not from how the polygon looks
unrotated), and **its border is `--border-strong`**, because the panel sits 1.15:1
from the page so the two visible border faces are what actually draw the arrow.

**Below 901px the bar becomes a drawer** and panels an accordion — same markup,
triggers and JS, only `display` and position change. The JS breakpoint
(`barLayout`) must stay in step with the CSS one: hover opens panels in the bar
layout only, or in the accordion `mouseenter` would open a section and the click
that follows would immediately close it.

Triggers are `<button aria-expanded>`, not links — they disclose, they do not
navigate. Hover is never the only way in: click, Enter, Space and Escape all work,
Escape returns focus to the trigger, tabbing past the last panel link closes it,
and a 220ms grace on `mouseleave` covers the gap to the panel.

**The open transition is theirs, scraped then slowed**: a long easeOutQuart
transform under a quick fade, which makes a panel arrive rather than switch on.
`--dur-panel-settle` 1100ms, `--dur-panel` 420ms from `translateY(10px)`, columns
staggered by `--panel-stagger` 90ms from `translateX(-12px)` — that left-to-right
stagger against the settling shell is what reads as diagonal. `--dur-panel` drives
the fade, the column resolve **and** the visibility hand-off; keep them on one
token or the panel snaps out instead of fading.

Two selector traps, both hit once: bar-level link styling must be `.nav__item > a`
and the flex row `.nav__links > ul` (descendant selectors leak the uppercase 12px
treatment and the 40px gap into the panels); and the scrollspy reads `[data-spy]`,
not every `a[href^="#"]` in the bar, because the panels are full of hash links and
a panel link is not a location. Panel links point at real anchors on this page —
check with the dead-anchor query in `frontend-bug-sweep` rather than assuming.

### The fifth trigger

Adding Products to the bar broke it, in the exact band the old note predicted
and nobody had re-measured: **horizontal overflow between 902px and 980px.**
Four triggers fitted in the bar down to the 901px drawer breakpoint with room
to spare; five need about 1024px, so for 80px of viewport the row simply ran
off the edge.

Two fixes, and the first alone was not enough. Cutting the row's gap from 40px
to 32px saves 4 × 8 = 32px across five items — real, but the shortfall was over
100px. So the drawer breakpoint moved from 900/901 to 1024/1025 as well, in
**both** the CSS media queries and `main.js`'s `barLayout`. Those two must move
together: out of step, `mouseenter` opens a section in the accordion and the
click that follows immediately closes it again.

Measured after: no overflow at any width from 320 to 1600, and the bar keeps at
least 54px of clearance either side wherever it is shown.

**Then Process was cut and the bar was back to four.** The 1024 breakpoint was
only ever compensation for the fifth trigger, so it went back to 900/901 in both
places — restoring the full bar to every viewport between 902 and 1024, which is
most tablets in landscape. The 32px row gap stayed: it reads no differently at
those widths and leaves headroom. At 902px the bar now has 24px of clearance
either side, which is the whole margin. **Re-run the sweep from 320 to 1600 if a
fifth is ever added again** — the bar has now been outgrown once and it did not
announce itself either time.

Removing Process cost no information: `services.html` carries all four steps
under "How a project runs", which is why it was safe to cut a panel that had
been kept specifically to preserve them.

### Buttons into the panels

Four pages had been built and were reachable only from the footer, because the
nav's Services panel indexed *anchors within* `services.html` rather than
offering the page itself, and Pricing's headline was one line of text among
several. The fix is `.panel__cta`: one filled button per panel, sized like any
other button on the site, at the foot of column one.

Only three panels get one. Process deliberately has no page, and About's
destination is a section of the home page that its own first link already names
— adding buttons there for symmetry would have meant inventing a destination or
duplicating one, and a button that goes nowhere useful teaches people not to
trust the others.

## The case (stats)

Their "Join millions of entrepreneurs" band, on Jared's argument. Sits on
`--bg-page`, not `--bg-band` — the hero dissolves into the page colour and a band
here would put a hard edge under that fade.

**The numbers are load-bearing and every one is attributable on the page.** That
visible source line is what separates research from decoration, so it is not
optional trim.

| Figure | Source |
|---|---|
| 27% of small businesses have no website | Top Design Firms, May 2022, n=1,003 |
| 98% use the internet to find a local business | BrightLocal, Local Consumer Review Survey |
| 46% judge credibility on how a site looks | Stanford Web Credibility Project |

If a figure cannot be traced to a named study with a date, it does not go here.
The widely-repeated **"75% judge credibility on design" is a misattribution** —
Stanford's actual finding is 46.1%. It is quoted correctly; don't let anyone
"improve" it.

**The section is deliberately half the height it first ran at** and capped at
56rem, not the full shell: at shell width the three figures sat a third of a
screen apart and read as three separate facts. It is a preamble, not a
destination — if it grows back, that is a regression.

**The count-up fires once**, the first time each figure crosses into view; a
number that re-runs every time you pass it becomes a fidget. easeOutQuart, 1400ms.
The final value is in the HTML so the figures read correctly without `main.js`;
`tabular-nums` stops proportional digits reflowing the row every frame; and the
animated span is `aria-hidden` beside a visually-hidden copy of the true value, so
assistive tech never sees a partial number.

## Selected Work

Six **concept projects** — self-directed designs in `concepts/`, each rendered to
`assets/img/work-<slug>.webp` and tagged `Concept` in the UI. There is no shipped
client work yet. **Never present someone else's site as work done here**; if a tile
becomes real client work, swap the image, title and meta, and drop the tag.

| Slug | Business | Direction |
|---|---|---|
| `botanica` | Floral studio | Fraunces italic on cream, deep green |
| `borough` | Barber shop | Oswald condensed on near-black, amber |
| `kettle` | Coffee roaster | Instrument Serif on sand, rust italic |
| `sunday` | Bakery | Bricolage Grotesque, butter/terracotta blocks |
| `meridian` | Architecture studio | Archivo only, visible column grid |
| `northline` | Bike shop | IBM Plex Mono specs, lime on slate |

Each is a different typeface and temperature on purpose — the set exists to show
range, so keep new ones distinct from all six.

**A tab-driven scroll-snap carousel** with a clone loop; see `carousel-craft`.
Native scroll-snap does the moving, so the track still works without `main.js` —
there are simply no clones and it does not wrap. **It auto-advances every 4s** on
the hero stage's contract (hover suspends; taking hold of a tab or scrolling the
track stops it for good, which makes the tabs the WCAG 2.2.2 stop mechanism), and
only while the section is on screen. Slower than the hero's 2s because these cards
carry copy.

**Hover-to-suspend is bound to the track and the tab row, never the section.**
`#work` is full-bleed and taller than the viewport, so a `pointerenter` on it fires
the moment the cursor is anywhere on screen and never leaves — the carousel sits
permanently suspended and reads as simply not auto-advancing.

**The cards carry a shadow and it is load-bearing**: on cream they do not separate
by luminance — Meridian's `#E4E2DC` card *is* the page colour.

Each card carries its concept's palette via `--slide-bg` / `--slide-ink` inline.
**Softened text uses `color-mix` and the percentages are solved, not chosen** — at
72%/80% the eyebrow and body dropped to 3.3:1 on the lower-contrast cards; 88%/92%
clears AA on all six. Kettle's rust had to darken to `#6B351D` because `#A2542F`
only reached 4.87:1 against its own ink. Re-solve if a card colour changes.

**Render spec, and why it is a script now.** Shoot at **900×1125** with
`full_page=True`, resize to **800px** wide, WebP q84, and write the resulting pixel
height into the tile's `height` attribute. That last step is the one that rots: the
height is what reserves the card's space before the image arrives, so a stale number
is a layout shift on every load. It lived in this file and in nobody's hands until
`tools/build_shots.py`, which does the render and the rewrite in one pass.

**The 2600px cap, and the 2400 → 3800ms that came with it.** The concepts were
originally 1.4–1.8 screens — hero plus two sections, closer to a mockup than a site.
Filling them out (real price lists, process, practical info, a proper footer) took
them to **3.4–4.3 screens**: botanica 3445px, borough 4083, kettle 4323, sunday 3848,
meridian 3747, northline 4153.

That broke the hover scrub, in a way worth stating precisely because it is
counter-intuitive: **the travel is the full image over a fixed duration, so the
duration is a speed, not a length.** A 2.5× taller render does not show more on
hover — it shows the same thing 2.5× faster, and past roughly three screens nothing
is legible. Two fixes were possible: stretch the duration proportionally (6.5s of
hover, absurd) or cap the render. Capping won, because the tile is a teaser and the
whole site is one click away.

`MAX_TILE_H` is **2600px** (~2.6 screens) and `.slide__shot` is **3800ms**. These are
one decision in two files: 2400ms was solved against ~1600px tiles, and 2600 × (2400
÷ 1600) ≈ 3800 holds the px/ms. Move either and re-solve the other. File sizes came
out at 46–108KB, which is where they were before.

The first 1125px must still stand alone — that is all a touch device sees. Layouts
built for a landscape viewport leave voids when rendered tall.

**Hover travel.** `.work__frame` is `container-type: size`, so the image moves by
`translateY(calc(100cqh - 100%))` — exactly (image − frame) at any breakpoint, no
per-tile numbers. Gated on `(hover: hover) and (pointer: fine)`: a touch device has
no way to reverse the state and would be stranded mid-scroll. Under
`prefers-reduced-motion` the travel is **cancelled outright** — the global reduce
rule only shortens the transition, which would snap the image to its end position.

**The responsive patch is retired.** The concepts were built as 900px render
targets with zero media queries and scrolled sideways on every phone, so each
carried a *generated* `@media (max-width: 760px)` block — a retrofit, regenerated
rather than hand-edited. When the six were rewritten they were authored responsive
from the start (a content breakpoint around 860–980, a layout one at 760, a gutter
tier at 380), so there is nothing left to retrofit. **Edit the pages directly.**

**Six contrast failures found on the rebuilt pages, none visible to a CSSOM
checker.** Every one was either an `opacity` on inherited ink or an accent measured
against the wrong ground:

| Page | What | Measured | Fix |
|---|---|---|---|
| Meridian | nav links, 11px | **2.94:1** | muted ink .55 → .86 |
| Sunday | prices and labels | 3.28:1 | added `--crust-ink` |
| Kettle | roast headings, 21px | 4.20:1 | `--rust` → `--rust-ink` |
| Kettle | footer labels | 4.32:1 | re-solved on `--sand-dk` |
| Botanica | kicker and prices | 3.40:1 | added `--clay-ink` |
| Meridian | footer detail | 4.39:1 | same .86 bump |

Two lessons are worth keeping. **An accent solved on the page ground fails on the
footer ground** — Kettle's `--rust-ink` passed at 4.88:1 on `--sand` and failed at
4.32:1 on `--sand-dk`, three shades darker; it is now solved against the tighter of
the two. And **21px is not large text**: the 3:1 floor starts at 24px (or 18.66px at
700+), so a decorative accent is only safe in display sizes. Hence the split across
all three warm concepts — `--clay`/`--clay-ink`, `--rust`/`--rust-ink`,
`--crust`/`--crust-ink`, the first of each pair failing 4.5:1 *by design* and
allowed only at 24px and up.

**Two concepts blended into the page, and ratio could not see it.** Botanica's
ground was `#F4F0E6` and Kettle's `#E7E1D6` — the portfolio's own raised-card and
page colours. The tiles dissolved into the band behind them. The trap is that
**WCAG contrast ratio is a luminance measure and says nothing about hue**, so it
cannot distinguish "this is a different colour" from "this is the same colour":

| Ground | vs page (ratio) | ΔE vs page | Reads as its own? |
|---|---|---|---|
| Sunday `#F2C14E` | 1.30:1 | 60.3 | yes |
| Meridian `#8FA3B0` | 2.02:1 | 27.2 | yes |
| Botanica, first fix `#C4D0BC` | 1.24:1 | 12.0 | **no** |
| Botanica `#A8BA9F` | 1.51:1 | 21.4 | yes |
| Kettle `#2A1F19` | 12.39:1 | 77.2 | yes |
| Botanica, before `#F4F0E6` | 1.14:1 | 5.4 | no |
| Kettle, before `#E7E1D6` | **1.00:1** | 3.0 | no |

Sunday is the proof that a *low* ratio is fine — butter is 1.30:1 against the page
and nobody has ever thought it blended. What separates it is chroma, not value. So
the working rule is **ΔE ≥ 25 in Lab**, with Meridian at 27.2 as the lowest proven
point; the first sage attempt passed every contrast check and still looked like the
page, which is exactly the failure mode ratio is blind to.

**Botanica fought back, because it is green ink on a green ground.** Deepening the
sage to clear ΔE dropped moss text to 4.98:1 on the page and **4.21:1 on the
footer**, which is 7% darker again. Moss went `#2F4634` → `#263A2A` (5.92:1 / 5.01:1)
and clay-ink `#A44F2E` → `#5F2A19`. Ground and ink are one decision here — re-solve
both or neither. The ceiling is real: at `#98AE8E` (ΔE 27.3) no clay shade clears
4.5:1 on the footer at all, which is why the ground stopped at 21.4.

**Kettle inverted instead of warming, and that was the whole answer.** A roaster's
identity is a warm accent on a neutral. Every saturated *light* ground tested killed
the accent — on a `#C9A882` tan the rust had to fall to `#632F16` to clear 4.5:1, by
which point it is brown and the page has no accent left. Going to espresso `#2A1F19`
lets the accent go *up* to copper `#E0A46B` at 7.41:1, which is the same move
`.on-dark` makes on the portfolio itself. The closing block inverts back to sand so
the page still breathes. Sand on espresso measures 12.3:1.

**No fabricated testimonials in the six.** The obvious way to make a concept site
look finished is a customer quote, and all six were candidates. They do not have
them, for the same reason the marquee came off the home page: the site's own
position is that invented reviews are not acceptable, and a fictional business is
not a loophole a visitor can see. Each got a section that suits its trade instead —
Kettle's brew ratios, Northline's rate card, Borough's house rules, Sunday's bake
schedule — which is more informative than a quote would have been anyway.

## The accent hover

**What I do** points share one behaviour with any block of their kind: the heading
(and numeral where there is one) goes `--accent-ink-hover`, the rule or border goes
`--accent-ink`, and colour lands *first* (`--dur-fast`) while the lift and any rule
wipe run slower. Treat it as one pattern — it is what makes the page feel like a
single system, so a new block of the same kind should join it rather than invent
its own.

**None of them carry a pointer cursor or a focus equivalent, deliberately.** These
are decoration — a step is not a destination, and nothing is reachable only by
hovering. Promising an interaction that does not exist is worse than no hover.

### The "What I do" cards: glass and tilt

**Glassmorphism needs something behind it.** `backdrop-filter` over a flat colour
is just a translucent panel — the blur has nothing to work on. On the ink block
that is doubly true: the only thing behind the cards is the paper texture, which
runs at stdev 3.2. `.intro__points::before` is two very soft blooms (7% white, 9%
cool blue-grey, blurred 28px) under the card row.

**That wash must not use a negative horizontal inset.** The version of this that
lived under the old service cards bled 8% past each side and made the document
wider than the viewport at *every* breakpoint — a scrollbar traded for a gradient
edge nobody can see. `inset: -10% 0 -14%`: vertical bleed only, and the radials
are soft enough to reach the corners from inside.

**The glass tokens invert with the scope, and the numbers are not close.** The
light values are a *tint* pulled back from an opaque card; the dark ones are a
*film* laid on near-black. 62% of `--cream-100` reads as frosted glass; 62% of
white on ink reads as a grey box. Measured: at 10% edge the card stopped
separating from the block, at 20% fill it stopped looking like glass and started
looking like a lighter panel. Landed at 6% fill / 14% edge, 11% / 42% hovered.

**The tilt lives in the reveal's transform.** `--rx` / `--ry` join `--lift` in
`.js .reveal.is-in` — a transform on the card itself is (0,3,0) against a hover's
(0,2,0) and loses. **Set variables, never `transform`, on anything that also
carries `.reveal`.**

**The entrance and the hover need different durations from the same property.**
`.reveal` transitions transform at `--dur-slow` (800ms), which is right for an
entrance and broken for a hover. `main.js` already adds `.is-settled` when the
entrance ends, so that is the hook: `.js .intro__points .intro__point.is-settled`
re-declares the transition at `--dur-base`. It is written at (0,4,0) on purpose —
`.js .reveal.is-in` is (0,3,0), and matching it would make the result depend on
which rule happens to come later in the file.

`data-tracking` drops the transform transition while the pointer is being
followed — a transition there turns the lean into elastic drag — and is removed on
leave so the *return* still eases. Gated on `(hover: hover) and (pointer: fine)`:
a touch device would be left holding a card at an angle. Under reduced motion the
glare is `display: none` and the lean pinned to 0; the global reduce rule only
shortens the transition, which would snap the card to its end position instead.

**The JS binds to every direct child of `[data-tilt]`**, not to a class name, so
the behaviour can be pointed at a different set without renaming anything. Max
lean is 5° — restrained on purpose, since a card that swings reads as a gimmick.

**Measuring text on glass: sample the glyph, not a percentile.** A 2nd/98th
percentile over a mostly-empty box reads *antialiasing*. And check the element is
actually revealed first: measuring these at 390 reported **1.21:1** for card three
until it was scrolled into view — the card was at opacity 0 and the sample was of
the block behind it, not the card. Current worst across all three cards, at rest
and hovered, at 1440 and 390: **5.54:1**, the hovered body copy, where the glare
lightens the ground behind it.

## Testimonial marquee

A marquee, not the concept carousel's snap track: reviews are short and there are
many, so the interesting thing is the wall of them moving — nothing to land on, and
no tabs because there is nothing to pick. Mechanics: `carousel-craft`. The track
holds the set **twice** and drifts left; the duplicate is inserted by `main.js`,
`aria-hidden` with `tabindex="-1"` descendants.

**The travel is not `-50%`.** Sixteen cards have fifteen gaps, so half the track is
8 cards + 7.5 gaps while landing the second set where the first began needs 8 cards
+ 8 gaps. The missing half-gap is a 12px jolt once per cycle — exactly the artefact
the duplicate exists to prevent. Hence
`translate3d(calc(-50% - var(--marquee-gap) / 2), 0, 0)`, and hence the gap lives
in a token. Verify by measuring `children[N].offsetLeft - children[0].offsetLeft`,
not by watching. Transform only, never `scrollLeft`, so it stays off the main
thread.

**Three ways to stop it, and the button is the one that counts.** WCAG 2.2.2 wants
a pause mechanism; hover and `:focus-within` only reach a mouse and a keyboard. The
button is built by `main.js`, not the HTML — a pause control for an animation that
never starts is a dead control. Under reduced motion `data-marquee-ready` is
removed and the toggle hidden (bound to a `change` listener, so toggling the OS
setting mid-session takes effect); without JS there is no duplicate and the
viewport is an ordinary scrollable row. The end fades are a `mask-image`, not an
overlay, which would have to hard-code `--bg-band`.

## Pages

**Why there is a generator when the project rule is "no build step".** The rule is
about *serving*: this site has no framework, no bundler, and nothing that has to
run before a browser can read it. That is still true — `tools/build_pages.py`
writes plain HTML, the output is committed, and Vercel serves the files
untouched.

What changed is arithmetic. The nav is 180 lines and the footer 15. Eleven
secondary pages meant eleven copies of both, and the first time a panel link
changed, ten of them would silently disagree with the eleventh. The existing
precedent is the concept pages' responsive patch, which is generated for exactly
the same reason and carries the same warning: **regenerate, never hand-edit.**

`retarget()` is where the subtlety is. A copy of the nav needs three corrections
before it is correct on another page:

1. **Depth.** `assets/…`, `concepts/…`, `work/…` and the root pages get `../` per
   level. Straightforward, but it has to run before the anchor rewrite or the
   anchor rewrite writes the wrong prefix.
2. **Anchors.** A bare `#contact` in the nav means *the home page's* contact
   section. On a subpage it has to become `index.html#contact` — except for
   `#main`, which every page has, and except for any id the page declares itself.
   That exception is what lets `services.html` keep `#web-design` as a same-page
   jump while every other hash link leaves for home.
3. **`aria-current`.** Stripped from the inherited copy and re-applied to whichever
   link is this page, so the footer marks Services on Services rather than
   permanently marking Home.

**`.h1` did not exist, and that shipped for one build.** Every secondary page
opened with `class="h1"` on an element the stylesheet had never heard of, so the
browser's default `<h1>` — bold, 2em — applied. It is the single most visible way
to break this site's type direction, and it took a screenshot to notice, because
the markup looked right. `.h1` and `.h2` now share one rule at `--text-4xl`: the
distinction between them is semantic, and giving the page title its own larger
size would have made every secondary page shout at the home page.

**The case studies are concepts, stated three times.** The eyebrow reads
`Concept · <sector>`, the meta row's first cell reads `Concept — self-directed`,
and a note above the pager says the business is not real. That is not
over-caution: these are full site designs for plausible-sounding businesses, and
a visitor skimming a page headed "Precision grooming" with a barber shop's
branding on it will assume a client unless told otherwise. `build_cases.py`
derives each pager from `ORDER`, so the six cannot fall out of sequence when one
is added or renamed.

**The privacy page describes today, not the intention.** Its opening note says the
forms are not connected and that submitting one sends nothing anywhere, because
that is currently true and a policy describing collection that does not happen is
just a different kind of inaccuracy. The Google Fonts and Cloudflare cdnjs entries
are there for the same reason — both genuinely receive the visitor's IP address,
and a policy claiming "no third parties" while loading two would be wrong. The
fragment carries a `NOTE FOR JARED` comment naming the two paragraphs that must
change the day an endpoint exists.

**The terms page invents nothing.** Every clause restates something the site
already claims: the four chips in the Pricing panel (fixed quote, 2 design rounds,
you own everything, 50% to start), the four Process steps, and the FAQ answers. It
opens by saying it is a summary rather than a contract and that the written quote
governs. If any of those source claims change, this changes with them.

**The sweep's nameless-control check had a false positive** and it was the case
studies that exposed it: a link wrapping only an image takes its accessible name
from the image's `alt`, which the check did not consider, so every case study
reported its own render as a nameless link. Fixed in the `frontend-bug-sweep`
skill rather than worked around here.

## Page order

Hero → **The case** → **What I do** → Selected Work → **About** → Testimonials →
**Services** → **FAQ** → Contact → Newsletter.

"The case" states the problem, "What I do" answers it — that order is the point.
Don't move the stats below Services; a figure about businesses without websites
lands as an argument before the pitch and as filler after it.

"What I do" is the plain-language opener, kept distinct from Services (which lists
what you can buy) — if the two start saying the same thing, cut the overlap from
this one. It is centred throughout, which only works because the statement is
capped at 20ch and the three points at 34ch each. Centred text stops being readable
past about four lines, so if the copy grows, **the measures are what hold, not the
alignment.**

**Two sections are ink blocks** — "What I do" and Testimonials, carrying
`.on-dark block--dark`. Worst contrast across twelve runs: **5.85:1**; the hovered
point heading 8.51:1. Alternating textured cream with solid ink gives the page a
rhythm and the ink blocks read as the quiet ones.

**Services sits down by the contact form** with the FAQ under it: by that point a
visitor has seen the work and the person, and this is the "what can I actually buy"
moment. `#work` lost its `.section--tight-top` when that pairing ended; "What I do"
keeps `.section--tight-bottom` (256 → 208) and now introduces Selected Work.

### Services and the FAQ

**One tab each, not ten rows.** Each section is a single disclosure whose body
carries the whole list — four services in a 2×2 grid, six questions in the same
grid. Ten separate rows read as a wall; two closed doors read as a choice, and the
tab title *is* the section heading, so nothing is said twice.

**The two are joined, not spaced.** `.services` drops its bottom padding, `.faq`
its top padding *and* its `border-top` — otherwise the Services item's bottom rule
and the FAQ's top rule stack into a 2px line. Each row still breathes from
`.acc__label`'s 64px top padding, which is *inside* the rule.

**Both grids use `subgrid`, and that is what keeps the columns level.** Each entry
spans the grid's own rows, so every question sits in one row band and every answer
in the next. Without it each cell is an independent block: a question that wraps to
two lines in one column pushes its answer down while its neighbour's stays put.
`@supports` guards it.

Rows are written **open** in the HTML and closed by `main.js` (`data-acc="closed"`),
so with the script gone both sections are headed prose rather than dead buttons
hiding their own content. The panel animates on `grid-template-rows: 1fr → 0fr`,
not `max-height` — a max-height needs a magic number larger than any answer will
ever be, which makes the close start late and the open finish early, while `fr`
measures the content. `visibility` drops after the collapse so a zero-height row
leaves the tab order.

The `#web-design` / `#brand-identity` / `#portfolio-sites` / `#site-care` anchors
moved here with the section — the nav Services panel links to them.

**Nothing in the FAQ quotes a price.** The cost answer describes *how* quoting
works and points at the form; the Pricing panel is the single source for figures.
Every other answer restates something already true elsewhere on the page or in the
Process panel. Keep it that way.

## Findability, and the domain trap

**The canonical tag is the dangerous one.** It is a single line that tells search
engines "this is the real address of this page", and if it points somewhere that
is not this site, they believe it. `jaredbangal.com` is registered, resolves, and
returns HTTP 200 — but what it returns is a registrar lander that redirects to
`/lander`. Writing that domain into `CANONICAL` today would hand every page's
identity to a parking page. So `CANONICAL` stays on the vercel.app address until
the domain is genuinely connected in Vercel, and `tools/siteinfo.py` says so at
the top rather than leaving the next person to work out why it looks temporary.

Everything derived from it — sitemap, `og:url`, `og:image`, canonical — reads
from that one constant, so the switch is one edit and two commands.

**Why the sitemap excludes 404.html.** It is served with `noindex`. A sitemap is
a request to index; `noindex` is an instruction not to. Listing a page in both is
a contradiction, and Search Console reports it as an error rather than silently
picking one.

**Why the OG cards are drawn rather than screenshotted.** The obvious approach is
to render each page at 1200×630 and crop. It produces almost nothing: these page
heads have `nav-h + --space-24` of padding above the label, so a 630px-tall crop
is a nav bar, a lot of cream, and possibly the first line of a heading. Drawing a
card gives the title room to be the whole image, which is what the format is for.

Each case study card takes its own concept's background and ink, so the six read
as six things in a feed. That matters more than it sounds: a link preview is
seen at about 500px wide in a chat window, where a title is legible and nothing
else is.

**JPEG rather than WebP**, despite every image on the site proper being WebP.
Preview scrapers are not browsers — several still reject WebP outright, and the
failure mode is no image at all. 25KB against 15KB is not worth a blank card.

## About

Sits directly above the testimonials so the portrait introduces the person right
before other people vouch for him.

**The two columns are sized to their content and the pair is centred**, not split
as fractions of the shell. At `.7fr / 1.3fr` the copy column came out 738px while
the text inside is capped at its measure (395px body, 476px heading), so 343px of
the column was empty and the section hugged the left edge. Fractions balance the
*columns*; what has to balance is the ink.

**It is two paragraphs and nothing else.** A credentials list was built here and
cut: Jared wants the security background as an argument, not a CV.

The security claim is the section's whole point, so the wording is load-bearing:

- The page says **"a master's in cybersecurity management."** The résumé says MS,
  Information Systems, with Cybersecurity Management among the coursework. Jared
  asked for it this way — but know the two differ, and don't "fix" either.
- His bachelor's is **Information Technology** at BYU–Hawaii (the résumé says
  Information Systems). It appears nowhere on the page now; if it ever does, that
  is the correction to apply.
- Figures come from the résumé: 2,500+ students and staff at BYU–Hawaii, 350+
  machines at the Polynesian Cultural Center. Don't round them up.

The nav's About panel carries the same line. **If one changes, change both.**

**The portrait is shown whole, not cropped** — `height: auto`, no `object-fit:
cover`, and the column narrowed to `.7fr` to pay for the extra height a full 2:3
frame needs. `height: auto` has to be explicit: the `width`/`height` attributes on
the `<img>` are a presentational hint that otherwise wins. On mobile it is capped
by `max-width`, never by height.

## Editing index.html with a script

**Slice on unique markers, and verify the section list afterwards.** Moving the
Services block once cut from its `<section>` tag and left the
`<!-- ── Services ── -->` comment orphaned near the top of the document. A later
edit searched for that comment, matched the orphan, and deleted **Selected Work,
About and Testimonials** — three sections, silently, with no error. It shipped.

- Cut from the comment, not the tag, and never leave a marker behind.
- After any structural edit, print
  `re.findall(r'<section[^>]*id="([a-z]+)"', html)` and read it. Expected: stats,
  intro, work, about, feedback, services, faq, contact, newsletter.

`frontend-bug-sweep` catches it too, via dead anchors — but only if run *before*
pushing.

## Conventions

**Every block in `main.js` gets its own IIFE.** `var` is function-scoped, so
without one they share a scope. The hero stage block declares `track`, `real`,
`all` and `CLONES` — the exact names the Selected Work carousel uses — and being
later, silently reassigned all four out from under that block's closures: Selected
Work's tabs stopped scrolling and its current-tab marker cleared itself, with **no
error anywhere**. Scan for duplicate top-level `var` names when adding a block.

**Tokens are three-layer and one-directional.** Primitives (`--ink-60`,
`--space-6`) → semantic (`--text-muted`, `--border-subtle`) → component
(`--nav-h`). **Components reference semantic tokens only** — no raw hex or rgba in
a component rule. Breaking this made the polarity flip cost five fixes instead of
zero, when `.hero__note`, `.panel__facts u` and `.showcase__tab` reached for raw
`--ink-85` and went invisible on cream.

**Contrast is checked, not guessed.** Every ink alpha in the primitive layer
carries its measured ratio against the surface ramp in a comment. Body copy sits at
`--ink-60` or lighter (5.8:1 floor); `--ink-40` is large bold text only (3:1);
below that is non-text. If you add a value, compute the ratio and record it.

**The entrance stagger must not outlive the entrance.** `--stagger` is a
`transition-delay`, and a transition-delay applies to *every* transition that
element ever runs — left in place it delayed a hover by 240ms, which read as that
element being less responsive. `main.js` adds `.is-settled` on `transitionend`
(with a 1400ms fallback, since transitionend never fires for an entrance that was
not animated) and that zeroes the delay. Anything that sets its own delay must too.

**Set variables, never `transform`, on anything that also carries `.reveal`.**
`.js .reveal.is-in` is (0,3,0) and every hover lift is (0,2,0), so a component
transform is silently pinned. Route it through `--lift`.

**Depth is a four-step scale**, not per-component shadows. `--shadow-1`…`4`, each
*two* shadows: a tight contact shadow that sells the edge and a wide ambient one
that sells the height — one shadow can do either, never both, which is why the five
hand-written values these replaced looked flat at rest and muddy when raised. Light
is from directly above, so offsets are vertical only. Cards rest at 1 and hover at
3, slides rest at 2, panels sit at 4, buttons take 2 on hover and drop to 1 on
press.

**Everything pressable has an `:active`.** Their absence is most of what makes an
interface feel like a document rather than a product. Buttons scale to `.98`
through their own `--press` channel (so `:active` never has to out-specify
anything) and the transition drops to 90ms — `--dur-fast` at 200ms feels spongy
under a finger.

**Motion shares one rhythm.** `--dur-fast` 200ms buttons, `--dur-base` 300ms
nav/surfaces, `--dur-slow` 800ms scroll entrances, `--stagger` 80ms between
siblings — all matching squarespace.com. Transform and opacity only, never
width/height/top/left. Every motion rule needs a `prefers-reduced-motion` escape.

**Touch targets are 44px minimum**, reached with padding or `min-height`, not by
growing the visible element — and 44px is a *floor, not a starting size*.
`flex-shrink: 1` will silently trade it down; use `flex: 0 0 44px` and let the gap
give way.

**JS is optional by contract.** The page must read, navigate and submit with
`main.js` removed. The `.js` class is added by the script itself, so any hidden
start state it introduces can only exist when something can undo it.

## Source of truth

The design lives in Claude Design project
`f1dfaa4f-eab9-48d1-b16c-67b925eef288` ("Portfolio landing page design").
`Home.dc.html` is the reference for this page. Read with the `DesignSync` MCP
(`get_file`); images dropped into `<image-slot>` elements are stored as base64 in
`.image-slots.state.json`, not as files. **Never push local changes back** unless
asked — the sync is one-way, design → code.

`Services.dc.html` and `Pricing.dc.html` are designed but **not implemented**. The
nav and footer links that used to 404 now point at `#services` and `#contact`; if
those pages get built, repoint them.

## Content still to fill

**All eight testimonials are invented, and this is the one that cannot ship.**
Every quote, every "Placeholder Name", every role was written so the marquee could
be designed. Publishing invented reviews as genuine is deceptive, and in the US it
is unlawful under the FTC's rule on consumer reviews (16 CFR Part 465), which
reaches fabricated testimonials on a business's own site. **Replace them with real,
attributable quotes or delete the section** before this is promoted anywhere. The
avatars are still empty `.slot` tiles.

**Pricing is Jared's, set 2026-08-14**: from $300 landing page, from $1,200 full
site, $120/month care — no longer drafts. They live in the nav Pricing panel only,
and **the contact form's budget placeholder tracks the range** ("e.g. New site,
$300–1,200"); move it whenever the figures move, or the form implies a bracket the
panel does not offer.

**Forms post to `action="#"`.** `main.js` refuses that honestly rather than faking
success, so nobody is misled — but the form cannot work until it has a real
endpoint. Point it at one and delete the placeholder branch.

**Confirm the licence on the supplied photography.** `process-bench.webp` came in
as `neatly-kept-jewelers-desk.jpg`, a filename that reads like a stock library.
Jared supplied it, but a commercial site needs licences on record before launch,
and the masters in `assets/img/_source/` are what a takedown request would be
measured against.
