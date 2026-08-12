# Jared Bangal — portfolio site

Static site. No build step, no framework, no package manager. Plain HTML, one
stylesheet, one progressive-enhancement script.

```
index.html              Home
assets/css/styles.css   all styles
assets/js/main.js       nav state, reveals, scrollspy, form validation
assets/img/             hero-sewing-{960,1600,2400}.webp, portrait{,-480}.webp,
                        process-bench.webp, work-<slug>.webp
assets/img/_source/     full-resolution masters, not served
reference/              squarespace.com screenshots + scraped tokens
```

## Visual direction

The page follows squarespace.com's system, on Jared's dark palette.
`reference/squarespace-tokens.json` holds values scraped from their live
site — re-scrape rather than guess if you need more. What was adopted:

- **Nav** 80px, transparent over the hero, blurred translucent bar after.
- **Display type** weight 300, `letter-spacing: -.055em`, `line-height: 1.04`,
  fluid `clamp()`. This light-and-tight setting is the whole look; don't
  bold headings.
- **Labels** 12px/500 uppercase with `+.08em` tracking.
- **Buttons** 4px radius, uppercase 14px/500, solid fill, colour-and-
  background transition (no opacity fades, no lift).
- **Radii** 4px controls, 8px media/cards, 30px chips.
- **Easings**, all four lifted from their computed styles:
  `--ease-out` easeOutQuart (everything entering), `--ease-in-out`
  easeInOutCubic (buttons), `--ease-in-out-q` easeInOutQuad (nav),
  `--ease-in` easeInQuart (exits).
- **Layout** centred section heads with a muted sub-line, generous
  vertical air (128/160px section padding).
- **Nav disclosure panels** on Services and Process, matching their
  mega-menu: chevron down at rest, flipped when open, solid panel below a
  bar that turns solid with it.

Their face, Clarkson, is licensed proprietary and served from their CDN —
do not embed or hotlink it. **Archivo** is the stand-in: closest freely
licensed grotesque with a true 300 weight.

## Accent

Maroon: `--accent` / `--accent-ink` `#7F2007`, `--accent-hover` /
`--accent-ink-hover` `#5E1704`. `--text-on-accent` is **white** — the fill
is dark now.

Deep enough that one value does both jobs, which the orange before it could
not: as a fill it carries white at 9.9:1, as ink on cream it measures
6.9 / 7.7 / 8.9 on cream-300/200/100. The fill/draw token split is kept
because the *rules* still distinguish a background from a draw, but on this
palette both halves resolve to the same pair. **Restore two distinct pairs
if the accent ever goes light again** — a light accent cannot be ink on
paper, and that is the trap the previous orange fell into (`#F25939` was
5.6:1 as a fill and 2.6:1 as ink).

All that headroom also means the grain film, which costs about 10% at the
worst pixel, is no longer a binding constraint here. It was, at orange.

Everything accented comes off those tokens. **Never introduce a fifth
value.** `--focus-ring` deliberately stays ink: an on-theme focus ring is
weaker than a maximum-contrast one, and the ring is an accessibility
affordance before it is a brand surface.

## Texture

Paper tooth on every surface, at four times the strength the old grain
managed. `--tex` is one tile of four-octave `fractalNoise` — four octaves
carries both the fine speckle and the slower mottling, and two frequencies
are what separate paper from digital noise.

**It sits behind the content, not over it**, as a background layer on the
surface itself. That is the whole reason it can be this strong. The film it
replaced was a fixed overlay above everything including live text, so its
strength was capped by contrast and it never got past a stdev of 2.2 on a
flat surface — invisible. Behind the content the glyphs stay solid ink and
only the ground varies, exactly like print. This runs at **8.2**.

**The blend mode is `luminosity`, and the tile is calibrated, not guessed.**
Everything else was tried and measured:

| Mode | stdev | mean shift |
|---|---|---|
| `multiply` (the old film) | 2.2 | −8 |
| `multiply`, visible strength | 6.0 | **−30** |
| `soft-light` | 2.1 | +6 |
| `overlay` | 3.8 | +13 |
| `luminosity`, centred | **8.2** | **+1.5** |

`multiply` can only darken, so texture and page colour trade against each
other. `soft-light` and `overlay` compress at the light end of the range and
never got anywhere. `luminosity` takes the noise's luminance and keeps the
cream's hue, so the only requirement is that the noise be *centred* on the
surface's own luminance.

**That centre cannot be computed from the surface's channel value** — the
blend's `Lum()` weighting and clipping at the top of the range both move it.
It was found by measuring: slope `.70` about centre `.775`. If `--cream-200`
changes, re-measure rather than recompute.

Strength is baked into the tile with `feComponentTransfer` (RGB remapped to
a band around the centre), not set with `opacity`, so `slope` reads as
"how much this can vary". Tune there. The tile scrolls with the surface
rather than being fixed to the viewport — texture belongs to the paper, not
the window — which also sidesteps the iOS `background-attachment: fixed`
bug, and `stitchTiles` keeps the repeat seamless.

**Texture invalidates a ramp calibrated on flat colour.** `--ink-dk-66`
measured 4.9:1 against the flat band and **4.2:1** once that band had
texture on it — a real AA failure, not a rounding one. The floor is now
`--ink-dk-70` (4.7:1 against the darkest textured patch of `--cream-300`,
the worst surface on the page). Measure ink against the *darkest patch*,
never against the token's nominal value.

The automated contrast pass reads computed styles and cannot see any of
this. Checking texture means sampling rendered pixels: find the darkest
patch in a gutter strip, then test each ink against it.

## Polarity

**The page is cream.** `--cream-200` `#E4E2DC` is the ground, `--cream-300`
`#DAD7CF` bands, `--cream-100` `#F4F2EC` raised cards, `--ink-dk` `#16171A`
the ink. All four come from the Meridian concept, which is where the colour
entered this project.

The dark palette is not gone — it is `.on-dark`, scoped to the two places
that still need it: the **hero**, whose photo is dark and carries light
type, and the **nav** for as long as it floats over that hero. `.nav` is in
that selector list rather than carrying the class, because it has to leave
the scope again; the light values are re-declared on `.nav[data-scrolled]`
and the two open states at one notch more specificity, so the bar flips
back to page ink the moment it stops floating. Grouping those selectors
onto the `:root` block is what keeps both palettes written once.

Because components reference only semantic tokens, none of them know any of
this happened. That one-directional architecture is the whole reason a
polarity flip was a token change plus five fixes rather than a rewrite.

Those five, all found the hard way:

- **`color` must be re-resolved wherever the scope changes.** It inherits
  as the *computed* value, so `body` had already resolved `--text-primary`
  against one ramp and everything that merely inherits (every `.h2`) kept
  it and vanished. Elements that set their own colour were fine, which is
  what makes the bug look random.
- **Primitives leaking into components break instantly.** `.hero__note`,
  `.panel__facts u` and `.showcase__tab` all reached for raw `--ink-85`,
  which is invisible on cream. They now use `--text-strong`. This is the
  concrete cost of the "components reference semantic tokens only" rule
  being broken — it was harmless until the day it wasn't.
- **The grain film's blend mode had to invert.** See below.
- **The hero scrim needs a second gradient**, crossing to opaque
  `--cream-200` over the last 38%. One gradient cannot darken and then
  lighten without going muddy through the middle.
- **Shadows.** `rgba(0,0,0,.5)` under a panel is a dark-page value; on
  paper it reads as dirt. Now `rgba(22,23,26,.18)`.

The muted floor moves with the polarity: `--ink-dk-66` on cream (`.60` only
reaches 4.12:1 on `--cream-300`), `--ink-60` on dark.

## The case (stats)

Their "Join millions of entrepreneurs" band, on Jared's argument: three
figures for why a business without a website is losing something. Sits on
`--bg-page`, not `--bg-band` — the hero dissolves into the page colour and a
band here would put a hard edge immediately under that fade and undo it.

**The numbers are load-bearing and every one is attributable on the page.**
That visible source line is what separates research from decoration, so it
is not optional trim:

| Figure | Source |
|---|---|
| 27% of small businesses have no website | Top Design Firms, May 2022, n=1,003 |
| 98% use the internet to find a local business | BrightLocal, Local Consumer Review Survey |
| 46% judge credibility on how a site looks | Stanford Web Credibility Project |

If a figure cannot be traced to a named study with a date, it does not go
here. Note in particular that the widely-repeated **"75% judge credibility
on design" is a misattribution** — Stanford's actual finding is 46.1%.
It is quoted correctly here; don't let anyone "improve" it.

**The section is deliberately half the height it first ran at** — figure
clamp, lead margin and block padding all halved — and the grid is capped at
56rem rather than running the full shell. At shell width the three figures
sat a third of a screen apart and read as three separate facts; the
argument only lands when they can be taken in together. It is a preamble, not a
destination: its job is to land the problem and get out of the way of
"What I do", which is the section people actually came for. If it grows
back, that is a regression.

**Hover** follows the same language as the Process steps and service cards:
the label and the `%` take `--accent-ink-hover`, and the figure only lifts.
The numeral itself stays page ink — on cream the orange is a 2.6:1 colour
and a percentage is the one thing here you actually have to read.

**The count-up.** Fires once, the first time each figure crosses into view,
and never again — a number that re-runs every time you pass it stops being
information and becomes a fidget. easeOutQuart over 1400ms, the same curve
everything else enters on.

- The final value is in the HTML, so with `main.js` removed the figures
  simply read correctly.
- `font-variant-numeric: tabular-nums` is not decoration. Proportional
  digits change the element's width every frame and shuffle the row for the
  whole animation.
- The animated span is `aria-hidden` beside a visually-hidden copy of the
  true value, so assistive tech never sees a partial number regardless of
  when it looks.

## Nav panels

Four disclosures — Services, Pricing, Process, About — all built to one
three-column shape (index / explore / promo) so they read as a set. Keep
new ones to that shape; a panel noticeably smaller than its neighbours
looks like an oversight.

**Process is a panel without a page section**, and that is deliberate: the
"How it works" section was cut but the four steps are still worth saying.
Its column one is therefore `.panel__facts` data rows rather than links —
the documented pattern for information that has no destination. Don't add
links there unless the section comes back.

**Each panel points at its own trigger.** An 8px gap under the bar and a
caret at `--caret-x`, which `main.js` sets from the trigger's centre — the
panel is positioned against the *bar*, so without a pointer a wide panel
centred under the bar belongs to no item in particular. Squarespace's does
the same thing, and the gap is what lets the caret read at all.

The caret is `.nav__panel::before`, **not a child element**, and that is
load-bearing: `.nav__panel > *` carries the column stagger, so a real
element would be treated as a fifth column and shift every `nth-child`
delay after it.

It is a rotated square rather than a border triangle so it can carry the
panel's own surface. Two things about it were wrong on the first pass and
are easy to get wrong again:

- **The clip keeps the square's top-*left* triangle.** Under
  `rotate(45deg)` that corner lands at the top, so its two edges become the
  two upper faces of an upward point. Keeping the top-*right* triangle
  gives a right-pointing arrow, because TR lands at the right. Reason from
  where the corner ends up, not from how the polygon looks unrotated.
- **Its border is `--border-strong`, not the panel's own
  `--border-subtle`.** The panel sits only 1.15:1 from the page, so the
  caret's fill has almost nothing to separate it — the two visible border
  faces are what actually draw the arrow, and at 10% ink they were
  invisible.

Column one is links where real destinations exist and `.panel__facts` data
rows where it does not — a price tier is information, not a destination, so
the panel's single CTA carries the action. Chips are `.panel__pills` links
or `.panel__pills--static` facts.

**Below 901px the bar becomes a drawer** and the panels become an accordion:
same markup, same triggers, same JS, only `display` and position change.
Four triggers plus brand plus actions stop fitting around 700px. The JS
breakpoint (`barLayout`) must stay in step with the CSS one — hover opens
panels in the bar layout only, because in the accordion `mouseenter` would
open a section and the click that follows would immediately close it.

Triggers are `<button aria-expanded>`, not links — they disclose, they do
not navigate; the destination lives inside the panel. Hover opens them for
a mouse, but hover is never the only way in: click, Enter, Space and Escape
all work, Escape returns focus to the trigger, tabbing past the last panel
link closes it, and touch (which has no hover) gets the same behaviour
through click. A 220ms grace period on `mouseleave` covers the gap between
trigger and panel.

**The open transition is theirs, scraped not guessed, then slowed.** Their
shape is a long easeOutQuart transform under a quick fade, which is what
makes a panel feel like it arrives rather than switches on. Theirs runs
750ms/300ms; this site runs it slower, at `--dur-panel-settle` 1100ms and
`--dur-panel` 420ms from `translateY(10px)`. The three columns then fade
and slide in from `translateX(-12px)`, staggered by `--panel-stagger`
(90ms). That left-to-right stagger against the settling shell is what reads
as diagonal.

`--dur-panel` drives the fade, the column resolve **and** the visibility
hand-off. Keep them on the one token: if visibility flips before the fade
finishes the panel snaps out instead of fading.

Panels are positioned against the **bar**, not the trigger, so the wide one
can centre without running off the left edge. They use `visibility`, not
`display`, so they can transition and still leave the tab order when shut.

Two selector traps, both already hit once:

- Bar-level link styling must be `.nav__item > a`, and the flex row
  `.nav__links > ul`. Descendant selectors leak the uppercase 12px
  treatment and the 40px gap into the panels.
- The scrollspy reads `[data-spy]`, not every `a[href^="#"]` in the bar —
  the panels are full of hash links and a panel link is not a location.

Panel links point at real anchors (`#web-design`, `#discover`, …) that exist
on this page. Keep it that way; check with the dead-anchor query in the
menu test rather than assuming.

## motion/ — the particle study

A standalone one-page Three.js piece at `/motion/`, not part of the main
site's system and not linked from it. Single self-contained file, r128 from
cdnjs plus DM Sans; nothing else. 3000 particles morph through four
formations as sections scroll into view.

It borrows the portfolio's palette on purpose so it reads as the same
studio, but **it does not share the stylesheet or the tokens** — changing
`assets/css/styles.css` will not touch it, and it should not start
importing from there. Two values deliberately differ from the brief that
specified it, and both were measured:

- The brief's `#c2451c` measures **3.44:1** as small text on the gradient's
  darkest stop. It is kept for the button fill and the particles — a
  background and a decoration — and `#9E3110` (4.94:1) carries the text.
- Dim copy runs at `.70` alpha, not the brief's `.55`, which measured
  3.58:1.

**Text over a particle field needs a halo, not a panel.** Measured against
the rendered field, the darkest particle under a glyph is `rgb(78,22,20)`
and dark ink on it is **1.24:1** — not a judgement call. A panel behind the
copy would have broken the whole effect, so the cream halo goes on the
glyphs themselves: the section backgrounds stay genuinely transparent and
particles still pass behind the type. That took every string from 1.0–2.0:1
to **6.3–14.3:1**.

Two things about the particle system that are load-bearing:

- **NormalBlending, never additive.** The usual glowing-particle recipe is
  additive blending, which on a light ground washes to nothing. Solid cores
  at size 1.8 plus a size-7 haze at .08 opacity is what reads as pigment.
- **Rotations live on a `THREE.Group`, not on the scene**, so the cursor can
  be inverted into the same space with `worldToLocal`. Rotate the scene
  instead and the repulsion hole drifts out of register with the pointer as
  the formation spins.

Reduced motion drops the tumble, the spin, the travelling wave and the
repulsion but keeps the scroll-triggered morphs, which are user-initiated.
Without Three.js the page is text on a cream gradient and loses nothing it
needs.

## Source of truth

The design lives in Claude Design project
`f1dfaa4f-eab9-48d1-b16c-67b925eef288` ("Portfolio landing page design").
`Home.dc.html` there is the reference for this page; `Services.dc.html` and
`Pricing.dc.html` are designed but **not yet implemented** — `services.html`
and `pricing.html` are linked from the nav and footer and currently 404.

Read design files with the `DesignSync` MCP (`get_file`). Images dropped into
`<image-slot>` elements are stored as base64 in `.image-slots.state.json`, not
as files — decode from there. Never push local changes back to that project
unless asked; the sync is one-way, design → code.

## Skills to invoke

Any change to layout, color, type, spacing, motion, or component states:

- **`ui-ux-pro-max`** first — run `--design-system` for direction, then
  `--domain ux` for the accessibility/interaction/animation checklists. Its
  §1–§3 (Accessibility, Touch & Interaction, Performance) are the pre-delivery
  gate for this repo.
- **`frontend-design`** for component craft and visual detail.
- **`webapp-testing`** to verify — screenshot at 1440 / 860 / 390 before
  calling anything done. There is no test suite; screenshots are the check.

Skip `ui-styling` unless the stack changes — it is Tailwind/shadcn/React
guidance and this site is vanilla CSS.

## Running it

```bash
python3 serve.py            # http://localhost:8777
```

Use `serve.py`, not `python3 -m http.server`. It does two things the
stdlib server does not, both guarding against the same failure: a browser
running old assets against new markup.

- **Stamps cache-busting tokens.** The `?v=` on the CSS and JS links is the
  first 8 hex of that file's md5. Change a file and its URL changes, so no
  cache can serve the old one. `serve.py` rewrites them on startup and only
  writes when a token actually differs, so there is no git churn. **Run
  `python3 serve.py --stamp` before deploying** — the token ships with the
  HTML, and a stale token on a CDN is the same bug with a longer tail.
- **Sends `no-store`.** The stdlib server sends neither `Cache-Control` nor
  `ETag`, so browsers apply heuristic caching and hold subresources across
  many edits.

This is not hypothetical. It cost a debugging round here: the nav panels
rendered unstyled and a concept mockup covered the whole page, because the
browser had CSS from before the panels existed. Nothing was wrong with the
served files.

**When a reported bug does not reproduce, check this first.** Compare
`md5 assets/css/styles.css` against `curl -s .../styles.css | md5`, and
confirm the panel rules actually apply in a fresh browser — a truncating
CSS parse error looks identical to a stale cache from the outside:

```js
getComputedStyle(document.querySelector('.nav__panel')).position  // 'absolute'
```

If they match and that returns `absolute`, the build is fine and the
browser is stale.

## Conventions

**Tokens are three-layer and one-directional.** Primitives (`--ink-60`,
`--space-6`) → semantic (`--text-muted`, `--border-subtle`) → component
(`--nav-h`). Components reference semantic tokens only. Do not put a raw hex
or rgba in a component rule.

**Contrast is checked, not guessed.** Every ink alpha in the primitive layer
carries its measured ratio against the surface ramp in a comment. Body copy
sits at `--ink-60` or lighter (5.8:1 floor). `--ink-40` is for large bold text
only (3:1). Anything below that is non-text — rules and borders. If you add a
value, compute the ratio and record it.

**The entrance stagger must not outlive the entrance.** `--stagger` is
applied as a `transition-delay` on `.reveal:nth-child(n)`, and a
transition-delay is not a one-off — it applies to *every* transition that
element ever runs. Left in place it delayed the hover on the fourth service
card by 240ms and the third by 160ms, which read exactly as those cards
being less responsive than the first. `main.js` adds `.is-settled` on
`transitionend` (with a 1400ms fallback, since transitionend never fires
for an entrance that was not actually animated) and that zeroes the delay.
Any new staggered group inherits the fix; anything that sets its own
delay must do the same.

**Depth is a four-step scale, not per-component shadows.** `--shadow-1`…`4`,
each of them *two* shadows: a tight contact shadow that sells the edge and
a wide ambient one that sells the height. One shadow can do either, never
both, which is why the five hand-written values these replaced looked flat
at rest and muddy when raised. Light is from directly above — offsets are
vertical only, nothing here is lit from the side. Cards rest at 1 and hover
at 3, slides rest at 2, panels sit at 4, buttons take 2 on hover and drop
to 1 on press.

**Everything pressable has an `:active`.** There were none at all before;
that absence is most of what makes an interface feel like a document rather
than a product. Buttons scale to `.98` through their own `--press` channel
(so `:active` never has to out-specify anything) and the transition drops
to 90ms — Apple and Material both want feedback inside 100ms, and
`--dur-fast` at 200ms feels spongy under a finger.

**Motion shares one rhythm.** `--dur-fast` 200ms buttons, `--dur-base` 300ms
nav/surfaces, `--dur-slow` 800ms scroll entrances, `--stagger` 80ms between
siblings — all matching squarespace.com's timings. Transform and opacity
only, never width/height/top/left. Every motion rule needs a
`prefers-reduced-motion` escape.

**Touch targets are 44px minimum**, reached with padding or `min-height`, not
by growing the visible element.

**JS is optional by contract.** The page must read, navigate, and submit with
`main.js` removed. The `.js` class is added by the script itself, so any
hidden start state it introduces can only exist when something can undo it.

## Selected Work

There is no shipped client work yet, so the tiles hold six **concept
projects** — self-directed site designs in `concepts/`, each rendered to
`assets/img/work-<slug>.webp` and tagged `Concept` in the UI. Never present
someone else's site as work done here; if a tile becomes real client work,
swap the image, title, meta, and drop the tag.

| Slug | Business | Direction |
|---|---|---|
| `botanica` | Floral studio | Fraunces italic on cream, deep green |
| `borough` | Barber shop | Oswald condensed on near-black, amber |
| `kettle` | Coffee roaster | Instrument Serif on sand, rust italic |
| `sunday` | Bakery | Bricolage Grotesque, butter/terracotta blocks |
| `meridian` | Architecture studio | Archivo only, visible column grid |
| `northline` | Bike shop | IBM Plex Mono specs, lime on slate |

Each is a different typeface and temperature on purpose — the set exists to
show range, so keep new ones distinct from all six.

**The section is a tab-driven carousel**, after their "Grow your business"
block: a centred pill row where the active tab is filled, above a
scroll-snap track of wide cards with the neighbours peeking. Hovering or
clicking a pill scrolls the track; an observer reads the scroll position
back so the pills stay honest when you swipe. Native scroll-snap does the
moving, so the track still works with `main.js` removed.

**The cards carry a shadow, and it is load-bearing.** On the dark page they
separated by luminance alone. On cream they do not — Meridian's `#E4E2DC`
card *is* the page colour, so without an edge it dissolves into it. Two
layers: a tight one for the contact edge, a wide soft one for the lift.

**The track loops.** JS clones the last two slides before the first and the
first two after the last, so a neighbour always peeks on both sides —
Northline sits to the left of Botanica, Botanica to the right of Northline.
When the scroll settles on a clone the position is corrected by exactly one
set. Jumping between concepts picks whichever copy is nearer, so last → first
travels forward rather than rewinding.

Clones are `aria-hidden` with `tabindex="-1"` descendants; they must never be
reachable or announced twice. Without JS there are no clones and the track
simply does not wrap — everything else still scrolls and snaps.

**The correction must not use `behavior: "auto"`.** That defers to the CSS
`scroll-behavior: smooth` and animates the jump across the whole set in full
view, which is exactly the artefact the clones exist to hide. Set
`scrollLeft` directly with `scroll-behavior: auto` applied inline.

Each card carries its concept's own palette via `--slide-bg` / `--slide-ink`
set inline. **Softened text uses `color-mix`, and the percentages are solved,
not chosen** — at 72%/80% the eyebrow and body dropped to 3.3:1 on the
lower-contrast cards. 88%/92% clears AA on all six. Kettle's rust had to be
darkened to `#6B351D` because its original `#A2542F` only reached 4.87:1
against its own ink, so no softening could pass. Re-solve if a card colour
changes; `color-mix` resolves to `color(srgb …)` in computed styles, which
the contrast checker now parses.

**Render spec.** The mockup inside a card is a **full-page** render — 1.4–1.8
screens tall — so hovering the card travels through it.

Shoot at a **900×1125** viewport with `full_page=True`, resize to **800px
wide** (height follows), save WebP q84. The first 1125px must stand alone as
the tile's resting state, since that is all a touch device ever sees. Write
the resulting pixel height into the tile's `height` attribute.

```bash
python3 -m http.server 8777   # then screenshot concepts/<slug>.html
```

Give every concept enough below the fold to be worth scrolling — two
sections plus a closing band is the current shape. Design them to fill 4:5;
layouts built for a landscape viewport leave large voids when rendered tall.

**How the hover travel works.** `.work__frame` is `container-type: size`, so
the image moves by `translateY(calc(100cqh - 100%))` — exactly
(image height − frame height) at any breakpoint, no per-tile numbers. It is
gated on `@media (hover: hover) and (pointer: fine)`: a touch device has no
way to reverse the state and would be stranded mid-scroll. Under
`prefers-reduced-motion` the travel is cancelled outright — the global reduce
rule only shortens the transition, which would snap the image to its end
position instead.

## The particle field

`assets/js/particles.js` renders a fixed WebGL field behind the whole page —
2400 points morphing between four formations as sections scroll past.
Ported from `/motion/`, which still exists as the full-strength study.

**The hero has no photograph.** It was removed when the field went in; the
hero is now type on cream with particles behind it, like every other
section. `.hero__media`, `.hero__scrim`, the hero-local `.grain` and the
scroll-driven `hero-drift` parallax all went with it — about 70 lines. If a
photo ever comes back, the scrim has to be re-solved from scratch (the
method is in git history at `331840d`), not restored from memory.

**Cores render at `.20` opacity, and that number is the entire budget.**
This is the one thing to understand before touching it. In `/motion/` the
particles could run at full strength because that page carries eight short
strings. Here they sit behind every paragraph on the site, and a deep-maroon
particle at full opacity puts `--text-muted` at **1.19:1** — measured. At
`.20` the composite is identical to an 80% cream veil over the field, which
is what makes it work without a veil element at all. Below `.20` the muted
floor breaks; above it the field stops being visible.

Verified on rendered pixels with the field live, worst case **6.84:1**
across stats, intro, services, work, about and contact copy.

Layering: `#field` is `position: fixed` at `z-index: 0`, and `.nav`, `main`
and `footer` sit at 1. The canvas is transparent, so the cream ground and
its paper texture still show through — the particles are a layer *on* the
paper, not a replacement for it. `.band` and the cards keep their own opaque
fills, so the field passes behind them.

The camera orbit runs at 45% of the study's figures. There the swing was the
whole show; here it is behind body copy, and a camera swinging under a
paragraph is just motion sickness.

Everything degrades to the site as it was: no `particles.js`, no Three.js,
no WebGL, or `prefers-reduced-motion` — all of them leave a complete cream,
textured page. The script returns early rather than throwing. `serve.py`
stamps it like every other asset.

## Testimonial marquee

A marquee, not the concept carousel's snap track. Reviews are short and
there are many, so the interesting thing is the wall of them moving — there
is nothing here to land on, and no tabs, because there is nothing to pick.

The track holds the set **twice** and drifts left. The duplicate is inserted
by `main.js`, marked `aria-hidden` with `tabindex="-1"` descendants, exactly
like the carousel clones — the same reviews must not be announced twice or
collect tab stops.

**The travel is not `-50%`.** Sixteen cards have fifteen gaps between them,
so half the track width is 8 cards + 7.5 gaps, while landing the second set
where the first began needs 8 cards + 8 gaps. The missing half-gap is a 12px
jolt once per cycle — precisely the artefact the duplicate exists to
prevent. Hence `translate3d(calc(-50% - var(--marquee-gap) / 2), 0, 0)`, and
hence the gap lives in a token: change one and the other must follow.
Verify by measuring, not by watching — the distance travelled has to equal
`children[N].offsetLeft - children[0].offsetLeft`.

Transform only, never `scrollLeft`, so it stays off the main thread.

**Three ways to stop it, and the button is the one that counts.** WCAG 2.2.2
wants a pause mechanism for motion running past five seconds; hover and
`:focus-within` are conveniences that only reach a mouse and a keyboard, and
a touch device has neither. The button is built by `main.js`, not the HTML —
a pause control for an animation that never starts is a dead control.

Degradation is layered, and each layer still shows every review:

- **Reduced motion** — `data-marquee-ready` is removed and the toggle
  hidden, so the row is static and scrollable. Bound to a `change` listener,
  so toggling the OS setting mid-session takes effect.
- **No JS** — no duplicate set, no animation, and `.marquee__viewport`
  is an ordinary horizontally scrollable row.

The end fades are a `mask-image`, not a gradient overlay: the band sits on
`--bg-band` and an overlay would have to hard-code that colour.

## Page order

Hero → **The case** → **What I do** → Services → Selected Work → **About** →
Testimonials → Contact → Newsletter.

"The case" states the problem, "What I do" answers it — that order is the
point, and the two only work in sequence. Don't move the stats below
Services; a figure about businesses without websites lands as an argument
before the pitch and as filler after it.

"What I do" is the plain-language opener: one statement plus how I work.
Keep it distinct from Services, which lists what you can buy — if the two
start saying the same thing, cut the overlap from this one. It is centred
throughout, on the same axis as every other section head. That only works
because nothing in it runs long: the statement is capped at 20ch and the
three points at 34ch each. Centred text stops being readable past about
four lines, so if the copy grows, the measures are what hold — not the
alignment.

About sits directly above the testimonials so the portrait introduces the
person right before other people vouch for him.

**It is two paragraphs and nothing else.** A credentials list — degrees,
role, certificates — was built here and cut: Jared wants the security
background as an argument, not a CV. Don't reintroduce one.

The security claim is the section's whole point, so the wording is load-
bearing:

- The page says **"a master's in cybersecurity management."** The résumé
  says MS, Information Systems, with Cybersecurity Management among the
  coursework. Jared asked for it this way and that is his call — but know
  that the two differ, and don't "fix" one against the other.
- Jared's bachelor's is **Information Technology** at BYU–Hawaii (the
  résumé says Information Systems). It appears nowhere on the page now;
  if it ever does, that is the correction to apply.
- Figures come from the résumé: 2,500+ students and staff at BYU–Hawaii,
  350+ machines at the Polynesian Cultural Center. Don't round them up.

The nav's About panel carries the same line. If one changes, change both.

**The portrait is shown
whole, not cropped** — `height: auto`, no `object-fit: cover`, and the
column narrowed to `.7fr` to pay for the extra height a full 2:3 frame
needs. `height: auto` has to be explicit: the `width`/`height` attributes
on the `<img>` are a presentational hint that otherwise wins. On mobile it
is capped by `max-width`, never by height — cropping is the thing that was
removed.

## Service cards: glass and tilt

Frosted, and they lean toward the pointer. Both parts have a catch.

**Glassmorphism needs something behind it.** `backdrop-filter` over a flat
colour is just a translucent panel — the blur has nothing to work on. That
is what `.services::before` is for: two very soft radial blooms (9% accent,
11% cool grey, blurred 28px) sitting behind the card row. It is the
difference between the cards reading as glass and reading as slightly
see-through paper. Keep it far below anything that registers as a coloured
blob.

**That wash must not use a negative inset.** `.services` sits inside
`.shell`, so bleeding it 8% past each side made the document wider than the
viewport at *every* breakpoint — a horizontal scrollbar traded for a
gradient edge nobody can see. `inset: 12% 0 4%`; the radials are soft
enough to reach the corners from inside the box.

**The tilt lives in the reveal's transform.** `--rx` / `--ry` join `--lift`
in `.js .reveal.is-in`, for the same specificity reason documented there:
a hover transform on the card itself is (0,2,0) and loses. Set variables,
never `transform`, on anything that also carries `.reveal`.

`data-tracking` drops the transform transition while the pointer is being
followed — a transition there turns the lean into elastic drag — and is
removed on leave so the *return* to flat still eases.

The tilt is gated on `(hover: hover) and (pointer: fine)`: a touch device
has no hover to reverse out of and would be left holding a card at an
angle. Under reduced motion the glare is `display: none` and the lean is
pinned to 0. Without JS the cards are still frosted, still lift, still take
the accent — only the lean is missing.

**Measuring text on glass: sample the glyph, not a percentile.** A
translucent plate plus a moving glare means computed styles cannot tell you
anything, so it has to be rendered pixels — but a 2nd/98th percentile over
a mostly-empty numeral box reads *antialiasing*, not the glyph, and it lied
by more than a point. It reported 4.37:1 where the true value was 6.9:1,
and sent me lightening the glass to fix a problem that did not exist. Take
the darkest rendered pixel against the brightest: for dark text on a light
plate those are the two ends WCAG is actually about. Current worst across
all four cards, at rest and hovered: **5.56:1**.

## The accent hover

Two sections share one hover behaviour — **What I do** points and
**Services** cards. In each: the heading (and the numeral where there is
one) goes `--accent-ink-hover`, and the rule or border goes `--accent-ink`.

The service cards go further, and the staggering is the point: the card
lifts and gains a shadow at `--dur-base`, a 2px rule wipes across the
bottom at `--dur-slow`, and the numeral and title take the accent at
`--dur-fast` so colour lands first. The numeral travels 3px and the title
1px, so the two do not move as one block. `transform-origin` on the wipe
flips between hover and rest, so it retracts to the edge it came from
instead of jumping across to reverse.

Treat this as one pattern, not three rules. It is what makes the page feel
like a single system rather than a set of separately-styled blocks, so a
new block of the same kind should join it rather than invent its own.

**None of them carry a pointer cursor or a focus equivalent, deliberately.**
These are decoration — a step is not a destination, and nothing anywhere is
reachable only by hovering. Don't add a cursor to "finish" it; promising an
interaction that does not exist is worse than no hover at all.

Two joins are tighter than the 128/128 default. Services and Selected Work
are one thought and close from both sides with `.section--tight-bottom` /
`.section--tight-top` (256px → 144px). "What I do" closes only from below
(256px → 208px) — it introduces Services rather than belonging to it, so it
keeps more air than that pair does. Everything else keeps the 128/160
rhythm.

## Content still to fill

**Pricing is placeholder.** The three tiers in the Pricing panel — $1,200
landing page, $3,200 full site, $120/month care — are drafts to argue with,
not quoted rates. They were written to match the range already implied by
the contact form's "e.g. New site, $1k–3k". Set real numbers before this
goes anywhere public; published prices are a commitment.

**All eight testimonials are invented, and this is the one that can't
ship.** They were written so the marquee could be designed and reviewed —
every quote, every "Placeholder Name", every role. Publishing invented
reviews as genuine is deceptive, and in the US it is unlawful under the
FTC's rule on consumer reviews (16 CFR Part 465), which reaches fabricated
testimonials on a business's own site. Before this page goes public,
replace them with real quotes or delete the section. Anything that cannot
be attributed to a named, consenting client comes out. The avatars are
still empty `.slot` tiles.

**Confirm the licence on the supplied photography.** `hero-sewing-*.webp`
and `process-bench.webp` came in as `sewing-tools-flatlay-knolling.jpg` and
`neatly-kept-jewelers-desk.jpg`, filenames that read like a stock library.
Jared supplied them, but a commercial site needs the licences on record
before launch, and the masters in `assets/img/_source/` are what a takedown
request would be measured against.

Forms post to `action="#"` — point them at a real handler and delete the
placeholder branch in `main.js`.
