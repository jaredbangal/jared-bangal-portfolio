# Jared Bangal — portfolio site

Static site. No build step, no framework, no package manager. Plain HTML, one
stylesheet, two progressive-enhancement scripts.

```
index.html              Home (the only real page)
assets/css/styles.css   all styles
assets/js/main.js       nav, reveals, hero stage, marquee, carousel, forms
assets/js/particles.js  the WebGL field
assets/img/             portrait{,-480}.webp, work-<slug>.webp (full-page
                        concept renders), stage-<slug>.webp (hero crops)
concepts/<slug>.html    six self-contained concept designs
motion/index.html       standalone particle study, not linked from the site
reference/              squarespace.com screenshots + scraped tokens
```

## Skills

Most of the *method* behind this site now lives in reusable skills. Invoke them
rather than re-deriving:

| Skill | For |
|---|---|
| **`rendered-contrast`** | any contrast check here — texture, glass and the particle canvas are all invisible to a CSSOM checker |
| **`surface-texture`** | the paper tooth; blend modes, calibration, the linearRGB trap |
| **`particle-field`** | `particles.js` and `motion/` |
| **`carousel-craft`** | hero stage, Selected Work track, testimonial marquee |
| **`frontend-bug-sweep`** | pre-deploy pass |
| **`ui-ux-pro-max`** | `--design-system` for direction, `--domain ux` for the a11y/interaction checklists. Its §1–§3 are the pre-delivery gate here |
| **`frontend-design`** | component craft |
| **`webapp-testing`** | screenshot at 1440 / 860 / 390 before calling anything done |

Skip `ui-styling` — it is Tailwind/shadcn guidance and this is vanilla CSS.

**There is no test suite. Measurement is the test.** Every number below was
measured; if you change the thing it describes, re-measure rather than
recompute.

## Running it

```bash
python3 serve.py            # http://localhost:8777
python3 serve.py --stamp    # before deploying
```

Use `serve.py`, not `python3 -m http.server`. It stamps `?v=<md5>` cache-busting
tokens onto the CSS and JS links and sends `no-store`. Not hypothetical: a stale
cache once cost a debugging round where the nav panels rendered unstyled and
nothing was wrong with the served files.

**When a reported bug does not reproduce, check this first.** Compare
`md5 assets/css/styles.css` against `curl -s .../styles.css | md5`. A truncating
CSS parse error looks identical to a stale cache from the outside.

Deploy: `git push origin main` — Vercel builds from GitHub. Live at
`jared-bangal-portfolio.vercel.app`. `vercel.json` sets HTML to
`max-age=0, must-revalidate` and `/assets/*` to `immutable`.

## Visual direction

Follows squarespace.com's system on Jared's palette.
`reference/squarespace-tokens.json` holds scraped values — re-scrape rather than
guess. What was adopted:

- **Nav** 80px, transparent over the hero, blurred translucent bar after.
- **Display type** weight 300, `letter-spacing: -.055em`, `line-height: 1.04`,
  fluid `clamp()`. This light-and-tight setting is the whole look; **don't bold
  headings.**
- **Labels** 12px/500 uppercase, `+.08em` tracking.
- **Buttons** 4px radius, uppercase 14px/500, solid fill, colour-and-background
  transition (no opacity fades, no lift). The **nav CTA** is the only user of
  `.btn--sm` and is proportioned from the scraped values, not guessed: theirs
  is `padding: 23px 28px`, 60px tall in an 80px bar. At 44px ours read as a
  long thin slab. Now 56px with `--text-2xs`, which also matches the Log In
  link beside it — the two are a set, and 14px next to 12px made the button
  shout.
- **Radii** 4px controls, 8px media/cards, 30px chips. There is no `--radius-md`.
- **Easings**, all lifted from their computed styles: `--ease-out` easeOutQuart
  (entering), `--ease-in-out` easeInOutCubic (buttons), `--ease-in-out-q`
  easeInOutQuad (nav), `--ease-in` easeInQuart (exits).
- **Layout** centred section heads with a muted sub-line, 128/160px section
  padding.

Their face, Clarkson, is licensed proprietary and served from their CDN — do not
embed or hotlink it. **Archivo** is the stand-in: closest freely licensed
grotesque with a true 300 weight.

## Colour

**The page is cream.** `--cream-200` `#E4E2DC` ground, `--cream-300` `#DAD7CF`
bands, `--cream-100` `#F4F2EC` raised cards, `--ink-dk` `#16171A` ink. All four
come from the Meridian concept, which is where the colour entered this project.

**Accent is pure black**: `--accent` / `--accent-ink` `#000000`,
`--accent-hover` `#2B2B2B` (the only direction black can move),
`--accent-ink-hover` `#000000`, `--text-on-accent` **white**. 21:1 as a fill,
21:1 as ink on every cream.

**A monochrome accent has one real cost, and it is measured.** Two hover
patterns changed *colour* from `--text-primary` (`#16171A`) to the accent —
the stats label/percentage and the service card title. Against pure black that
is a **1.15:1** change: imperceptible. Both interactions still read through
their other cues (the card lifts, gains a shadow and wipes a rule; the figure
lifts), and the numeral, which rests at 70% ink, still darkens visibly. But if
those colour cues are wanted back, the fix is to soften the *rest* state, not
to move the accent — a heading resting at `--text-body` would give black
something to travel from. Flagged rather than done: it changes resting design. The fill/draw token split is kept because the *rules*
still distinguish a background from a draw, but on this palette both halves
resolve to the same pair. **Restore two distinct pairs if the accent ever goes
light again** — a light accent cannot be ink on paper, and that is the trap the
previous orange fell into (`#F25939` was 5.6:1 as a fill and 2.6:1 as ink).

**Never introduce a fifth value.** `--focus-ring` deliberately stays ink: an
on-theme focus ring is weaker than a maximum-contrast one, and the ring is an
accessibility affordance before it is a brand surface.

**Muted floor**: `--ink-dk-70` on cream (4.7:1 against the darkest textured
patch of `--cream-300`, the worst surface on the page). `--ink-dk-66` measured
4.9:1 against the *flat* band and **4.2:1** once that band had texture on it — a
real AA failure, not a rounding one; and `.60` only reaches 4.12:1 on
`--cream-300`. Measure ink against the *darkest patch*, never the token's
nominal value. `--ink-60` on dark.

### The dark scope

`.on-dark` redefines every semantic token for the ink blocks. It was **dead
code** for a while and rotted; both of these were live bugs when it came back:

- Its accent lagged the brand twice (old orange, then a maroon-derived
  terracotta) before this. A monochrome brand cannot shift hue here, so it
  **inverts**: `#FFFFFF`, which measures 18.4 / 17.6 / 16.2 / 15.1 on
  shade-900…600. Pure black on shade-900 is **1.06:1** — invisible. **Check
  this block whenever the brand colour moves**; it has been stale twice.
- `--accent` (the fill) was not redefined at all, so it stayed maroon while
  `--text-on-accent` went near-black — a ~2:1 button waiting for the first
  `.btn--primary` dropped into a dark section.

**`color` must be re-resolved wherever the scope changes.** It inherits as the
*computed* value, so `body` had already resolved `--text-primary` against one
ramp and everything that merely inherits (every `.h2`) kept it and vanished.
Elements that set their own colour were fine, which is what makes the bug look
random.

`.nav` is in the `.on-dark` selector list rather than carrying the class,
because it has to leave the scope again: the light values are re-declared on
`.nav[data-scrolled]` and the two open states at one notch more specificity.

## Texture

Paper tooth on every surface, sitting **behind** the content as a background
layer on the surface itself — that is the whole reason it can be this strong. A
fixed overlay above live text has its strength capped by contrast and never got
past stdev 2.2. Method and the blend-mode findings: **`surface-texture` skill.**
Project values:

| | tile | mode | measured |
|---|---|---|---|
| Cream surfaces | `--tex`, slope .38 / centre .762 | `luminosity` | stdev 8.2, shift +1.5 |
| Ink blocks | `--tex-dark`, slope .16, sRGB filters | `lighten` | stdev 3.2, shift +1.6 |

The dark tile sits on `--shade-950` `#070A0E` so the textured result lands on
`--shade-900`'s apparent value. Its lower stdev is the honest ceiling, not
under-tuning — black has no downside headroom.

The tile scrolls with the surface rather than being fixed to the viewport, which
also sidesteps the iOS `background-attachment: fixed` bug; `stitchTiles` keeps
the repeat seamless.

## The particle field

`particles.js` — a fixed WebGL field of 2400 points behind the whole page,
morphing between four formations (`sphere`, `vortex`, `polaris`, `waves`) as
sections scroll past. Architecture and every general rule: **`particle-field`
skill.** Project specifics:

- **The running order is `sphere → vortex → polaris → waves → sphere`**, set by
  `data-formation` on each section: hero sphere, stats and What I do vortex,
  Selected Work polaris, About and Testimonials waves, then Services, FAQ and
  Contact all back to sphere. The closing three share one formation on
  purpose — the field settles and holds while the page asks for the enquiry,
  rather than morphing under the form. It also returns the page to the shape
  it opened on. Worst text contrast with the sphere behind that run:
  **6.62:1** at 1440, **6.93:1** at 390.

- **Palette is blue** — five stops from luminance .03 to .50. Cool field on a
  warm ground; the one thing on the page allowed to be cold. It is **not** on
  the `--accent` token and must never be promoted into the token layer, or the
  page has two accents.
- **`CORE_ALPHA` is `.34`, and that is a contrast budget**, not a taste
  decision — the previous maroon palette could only afford `.20`, and at full
  opacity put `--text-muted` at **1.19:1**. Re-solve against rendered pixels if
  the palette moves; it is not a transferable number. Worst text contrast with
  the field live: **6.14:1** at 1440, **6.29:1** at 390.
- The sphere fits **0.52** of the smaller viewport half-extent.
- Camera orbit runs at 45% of `motion/`'s figures — there the swing was the
  whole show; here it is behind body copy, and a camera swinging under a
  paragraph is motion sickness.
- Layering: `#field` is `position: fixed` at `z-index: 0`; `.nav`, `main` and
  `footer` sit at 1. The canvas is transparent so the cream ground and its
  texture still show through. The field does **not** show through the ink blocks
  or `.band` — those are opaque, deliberately.

**The hero has no photograph.** It was removed when the field went in. If one
ever comes back the scrim has to be re-solved from scratch (method in git at
`331840d`), not restored from memory.

`motion/` is the full-strength study on its own page — 3000 particles, r128 from
cdnjs plus DM Sans, nothing else. It borrows the palette so it reads as the same
studio but **does not share the stylesheet or the tokens**. It still runs the
**maroon** palette with square points and its own measured values, none of
which transfer:

- Text over the field needs a **halo, not a panel** — dark ink on the darkest
  particle measured **1.24:1**. A panel would have broken the effect, so the
  cream halo goes on the glyphs and the section backgrounds stay genuinely
  transparent. That took every string from 1.0–2.0:1 to **6.3–14.3:1**.
- Its brief's `#c2451c` measures **3.44:1** as small text on the gradient's
  darkest stop, so it is kept for fills and particles only and `#9E3110`
  (4.94:1) carries the text. Dim copy runs at `.70` alpha, not the brief's
  `.55`, which measured 3.58:1.

Porting the blue there means re-measuring that page, not copying these numbers.

## Hero stage

Six concept sites on a self-advancing track under the headline, cut off by the
fold. Mechanics: **`carousel-craft` skill.** Project specifics:

- Opens on **meridian / sunday / northline**, Sunday centred.
- **Source order is the running order, and index 1 leads.** `--i: 1` in the
  stylesheet and `START = 1` in `main.js` name the same slide — change one alone
  and the page opens on a different concept depending on whether JS loaded.
- Advances every **2s**; hover suspends, an arrow or dot stops it for good.
  Below 620px the centre is 62vw, not 78 — at 78 the neighbours peeked by 14%
  of the slide against ~52% on desktop, and the row read as one screen with
  slivers beside it.
  **There is no pause button** — the arrows are the WCAG 2.2.2 stop mechanism.
  If they are ever removed, the pause control has to come back.
- Loading hints follow the order: opening three eager, rest `lazy`.
- **No border on the cards.** These are full-bleed screenshots, so a 1px
  light edge reads as a white hairline drawn *on* the artwork rather than
  as a frame — most obvious on the dark concepts. The shadow separates them.
- `stage-<slug>.webp` is the top 800×620 of each full-page render (~16KB vs
  ~45KB). Re-crop from the master if a concept is re-shot.
- **The cards are whole, not cropped.** They were tall crops cut off by the
  stage, which left square bottom corners under rounded top ones — a card
  complete on all four corners cannot be produced by clipping, so the
  artwork has to fit. `--card-h` is 16:9 (a screen ratio, for screenshots)
  and `object-position: top` keeps each concept's masthead in frame.
- **The card is bounded by viewport *height*, not just width.**
  `--stage-max-h: max(120px, calc(100svh - 36rem))` — what is left after the
  copy block, which measures 514–558px across breakpoints and is near
  constant. A proportional budget (34svh) overshot on short screens and put
  the card 23px below the fold at 1280×800: whole, but cut by the window,
  which looks identical to the clipping this replaced.
- **Portrait viewports of any width** stop claiming `100svh` and take the stage
  height from the slide's aspect. The condition is the aspect ratio, not a
  width: a slide's height is fixed by the viewport *width*, so on anything
  portrait it cannot reach the fold and the stage grew past the artwork —
  216px of dead cream at 768×1024. 1024×768 clips correctly at the same width
  that fails at 768×1024. Below 620px the stage height also comes off — a phone cannot fit a screen tall enough to reach the fold
  *and* keep the neighbours in frame. Landscape phones drop the stage entirely.
- `#intro` and the stage both gave up `.shell` on the section to run full-bleed.
  **Do not reach for a `100vw` pseudo-element** — that already put a horizontal
  scrollbar on every breakpoint once.

## Nav panels

Four disclosures — Services, Pricing, Process, About — all built to one
three-column shape (index / explore / promo) so they read as a set. Keep new
ones to that shape.

**Process is a panel without a page section**, deliberately: the "How it works"
section was cut but the four steps are still worth saying. Its first column is
`.panel__facts` data rows rather than links — the documented pattern for
information that has no destination. Column one is links where real destinations
exist and data rows where they do not; chips are `.panel__pills` links or
`.panel__pills--static` facts.

**The panel is the page colour, not `--bg-band`.** It is not a different
surface from the page, it is the page lifted off it, so the shadow and
border do all the separating. The caret carries the same value — it paints
the panel's own surface, so a mismatch shows as a chip.

**Each panel points at its own trigger** via an 8px gap and a caret at
`--caret-x`, which `main.js` sets from the trigger's centre. Panels are
positioned against the **bar**, not the trigger, so a wide one can centre
without running off the left edge, and they use `visibility`, not `display`, so
they can transition and still leave the tab order when shut.

The caret is `.nav__panel::before`, **not a child element** — `.nav__panel > *`
carries the column stagger, so a real element would be treated as a fifth column
and shift every `nth-child` delay. Two things about it were wrong first:

- **The clip keeps the square's top-*left* triangle.** Under `rotate(45deg)`
  that corner lands at the top, so its two edges become the upper faces of an
  upward point. Keeping top-right gives a right-pointing arrow. Reason from
  where the corner ends up, not from how the polygon looks unrotated.
- **Its border is `--border-strong`, not `--border-subtle`.** The panel sits
  1.15:1 from the page, so the two visible border faces are what actually draw
  the arrow; at 10% ink they were invisible.

**Below 901px the bar becomes a drawer** and panels become an accordion — same
markup, same triggers, same JS, only `display` and position change. Four
triggers plus brand plus actions stop fitting around 700px. The JS breakpoint
(`barLayout`) must stay in step with the CSS one: hover opens panels in the bar
layout only, or in the accordion `mouseenter` would open a section and the click
that follows would immediately close it.

Triggers are `<button aria-expanded>`, not links — they disclose, they do not
navigate. Hover is never the only way in: click, Enter, Space and Escape all
work, Escape returns focus to the trigger, tabbing past the last panel link
closes it, and a 220ms grace on `mouseleave` covers the gap to the panel.

**The open transition is theirs, scraped then slowed**: a long easeOutQuart
transform under a quick fade, which is what makes a panel arrive rather than
switch on. `--dur-panel-settle` 1100ms, `--dur-panel` 420ms from
`translateY(10px)`, columns staggered by `--panel-stagger` 90ms from
`translateX(-12px)` — that left-to-right stagger against the settling shell is
what reads as diagonal. `--dur-panel` drives the fade, the column resolve **and**
the visibility hand-off; keep them on one token or the panel snaps out instead
of fading.

Two selector traps, both hit once:

- Bar-level link styling must be `.nav__item > a`, and the flex row
  `.nav__links > ul`. Descendant selectors leak the uppercase 12px treatment and
  the 40px gap into the panels.
- The scrollspy reads `[data-spy]`, not every `a[href^="#"]` in the bar — the
  panels are full of hash links and a panel link is not a location.

Panel links point at real anchors that exist on this page. Check with the
dead-anchor query in `frontend-bug-sweep` rather than assuming.

## The case (stats)

Their "Join millions of entrepreneurs" band, on Jared's argument. Sits on
`--bg-page`, not `--bg-band` — the hero dissolves into the page colour and a
band here would put a hard edge immediately under that fade.

**The numbers are load-bearing and every one is attributable on the page.** That
visible source line is what separates research from decoration, so it is not
optional trim.

| Figure | Source |
|---|---|
| 27% of small businesses have no website | Top Design Firms, May 2022, n=1,003 |
| 98% use the internet to find a local business | BrightLocal, Local Consumer Review Survey |
| 46% judge credibility on how a site looks | Stanford Web Credibility Project |

If a figure cannot be traced to a named study with a date, it does not go here.
Note in particular that the widely-repeated **"75% judge credibility on design"
is a misattribution** — Stanford's actual finding is 46.1%. It is quoted
correctly here; don't let anyone "improve" it.

**The section is deliberately half the height it first ran at** — figure clamp,
lead margin and block padding all halved — and capped at 56rem rather than the
full shell. At shell width the three figures sat a third of a screen apart and
read as three separate facts; the argument only lands when they can be taken in
together. It is a preamble, not a destination. If it grows back, that is a
regression.

**Hover** follows the Services language: the label and the `%` take
`--accent-ink-hover`, the figure only lifts. The numeral itself stays page ink —
a percentage is the one thing here you actually have to read.

**The count-up fires once**, the first time each figure crosses into view, and
never again — a number that re-runs every time you pass it stops being
information and becomes a fidget. easeOutQuart over 1400ms.

- The final value is in the HTML, so with `main.js` removed the figures read
  correctly.
- `font-variant-numeric: tabular-nums` is not decoration. Proportional digits
  change the element's width every frame and shuffle the row.
- The animated span is `aria-hidden` beside a visually-hidden copy of the true
  value, so assistive tech never sees a partial number.

## Selected Work

Six **concept projects** — self-directed designs in `concepts/`, each rendered
to `assets/img/work-<slug>.webp` and tagged `Concept` in the UI. There is no
shipped client work yet. **Never present someone else's site as work done
here**; if a tile becomes real client work, swap the image, title, meta, and
drop the tag.

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
Native scroll-snap does the moving, so the track still works with `main.js`
removed — without JS there are no clones and it simply does not wrap.

**It auto-advances every 4s**, on the same contract as the hero stage: hover
suspends, and taking hold of a tab — or scrolling the track yourself — stops it
for good, which makes the tabs the WCAG 2.2.2 stop mechanism. It only runs
while the section is on screen. Slower than the hero's 2s because these cards
carry copy you are meant to read.

**Hover-to-suspend is bound to the track and the tab row, never the section.**
`#work` is full-bleed and taller than the viewport, so a `pointerenter` on it
fires the moment the cursor is anywhere on screen and never leaves — the
carousel sits permanently suspended and reads as simply not auto-advancing.

**The cards carry a shadow and it is load-bearing.** On the dark page they
separated by luminance alone; on cream they do not — Meridian's `#E4E2DC` card
*is* the page colour, so without an edge it dissolves.

Each card carries its concept's palette via `--slide-bg` / `--slide-ink` inline.
**Softened text uses `color-mix` and the percentages are solved, not chosen** —
at 72%/80% the eyebrow and body dropped to 3.3:1 on the lower-contrast cards;
88%/92% clears AA on all six. Kettle's rust had to darken to `#6B351D` because
`#A2542F` only reached 4.87:1 against its own ink. Re-solve if a card colour
changes.

**Render spec.** The mockup is a **full-page** render, 1.4–1.8 screens tall, so
hovering the card travels through it. Shoot at a **900×1125** viewport with
`full_page=True`, resize to **800px** wide, WebP q84. The first 1125px must
stand alone as the resting state — that is all a touch device ever sees. Write
the resulting pixel height into the tile's `height` attribute. Give every
concept enough below the fold to be worth scrolling; layouts built for a
landscape viewport leave voids when rendered tall.

**Hover travel.** `.work__frame` is `container-type: size`, so the image moves
by `translateY(calc(100cqh - 100%))` — exactly (image − frame) at any
breakpoint, no per-tile numbers. Gated on `(hover: hover) and (pointer: fine)`:
a touch device has no way to reverse the state and would be stranded mid-scroll.
Under `prefers-reduced-motion` the travel is **cancelled outright** — the global
reduce rule only shortens the transition, which would snap the image to its end
position instead.

**The concept pages carry their own responsive patch.** They were built as 900px
render targets with **zero media queries** and scrolled sideways on every phone,
despite being linked from the nav and the tiles. Each now has a generated
`@media (max-width: 760px)` block (multi-column grids to `1fr`, every declared
flex row wraps, 44–56px gutters down to 20px) plus a 380px tier at 12px.
Generated from each page's own rules — regenerate rather than hand-edit. Nothing
fires above 760px, so the 900px tile renders are untouched.

## Service cards: glass and tilt

**Glassmorphism needs something behind it.** `backdrop-filter` over a flat
colour is just a translucent panel — the blur has nothing to work on.
`.services::before` is two very soft radial blooms (9% accent, 11% cool grey,
blurred 28px) behind the card row. Keep it far below anything that registers as
a coloured blob.

**That wash must not use a negative inset.** `.services` sits inside `.shell`,
so bleeding it 8% past each side made the document wider than the viewport at
*every* breakpoint — a scrollbar traded for a gradient edge nobody can see.
`inset: 12% 0 4%`; the radials are soft enough to reach the corners from inside.

**The tilt lives in the reveal's transform.** `--rx` / `--ry` join `--lift` in
`.js .reveal.is-in` — a hover transform on the card itself is (0,2,0) and loses.
**Set variables, never `transform`, on anything that also carries `.reveal`.**

`data-tracking` drops the transform transition while the pointer is being
followed — a transition there turns the lean into elastic drag — and is removed
on leave so the *return* still eases. Gated on `(hover: hover) and (pointer:
fine)`: a touch device would be left holding a card at an angle. Under reduced
motion the glare is `display: none` and the lean pinned to 0. Without JS the
cards are still frosted, still lift, still take the accent — only the lean is
missing.

**Measuring text on glass: sample the glyph, not a percentile.** A 2nd/98th
percentile over a mostly-empty numeral box reads *antialiasing* — it reported
4.37:1 where the true value was 6.9:1, and sent me lightening the glass to fix a
problem that did not exist. Current worst across all four cards, at rest and
hovered: **5.56:1**.

## The accent hover

Two sections share one behaviour — **What I do** points and **Services** cards.
In each: the heading (and the numeral where there is one) goes
`--accent-ink-hover`, and the rule or border goes `--accent-ink`.

The cards go further, and the staggering is the point: the card lifts and gains
a shadow at `--dur-base`, a 2px rule wipes across the bottom at `--dur-slow`,
and the numeral and title take the accent at `--dur-fast` so **colour lands
first**. The numeral travels 3px and the title 1px so the two do not move as one
block. `transform-origin` on the wipe flips between hover and rest so it
retracts to the edge it came from instead of jumping across.

Treat this as one pattern, not three rules. It is what makes the page feel like
a single system, so a new block of the same kind should join it rather than
invent its own.

**None of them carry a pointer cursor or a focus equivalent, deliberately.**
These are decoration — a step is not a destination, and nothing anywhere is
reachable only by hovering. Don't add a cursor to "finish" it; promising an
interaction that does not exist is worse than no hover at all.

## Testimonial marquee

A marquee, not the concept carousel's snap track. Reviews are short and there
are many, so the interesting thing is the wall of them moving — there is nothing
to land on, and no tabs, because there is nothing to pick. Mechanics:
`carousel-craft`.

The track holds the set **twice** and drifts left; the duplicate is inserted by
`main.js`, `aria-hidden` with `tabindex="-1"` descendants.

**The travel is not `-50%`.** Sixteen cards have fifteen gaps, so half the track
is 8 cards + 7.5 gaps while landing the second set where the first began needs 8
cards + 8 gaps. The missing half-gap is a 12px jolt once per cycle — precisely
the artefact the duplicate exists to prevent. Hence
`translate3d(calc(-50% - var(--marquee-gap) / 2), 0, 0)`, and hence the gap
lives in a token. Verify by measuring
`children[N].offsetLeft - children[0].offsetLeft`, not by watching.

Transform only, never `scrollLeft`, so it stays off the main thread.

**Three ways to stop it, and the button is the one that counts.** WCAG 2.2.2
wants a pause mechanism; hover and `:focus-within` only reach a mouse and a
keyboard. The button is built by `main.js`, not the HTML — a pause control for
an animation that never starts is a dead control. Under reduced motion
`data-marquee-ready` is removed and the toggle hidden (bound to a `change`
listener, so toggling the OS setting mid-session takes effect); without JS there
is no duplicate and the viewport is an ordinary scrollable row.

The end fades are a `mask-image`, not a gradient overlay: the band sits on
`--bg-band` and an overlay would have to hard-code that colour.

## Page order

Hero → **The case** → **What I do** → Selected Work → **About** →
Testimonials → **Services** → **FAQ** → Contact → Newsletter.

"The case" states the problem, "What I do" answers it — that order is the point,
and the two only work in sequence. Don't move the stats below Services; a figure
about businesses without websites lands as an argument before the pitch and as
filler after it.

"What I do" is the plain-language opener, kept distinct from Services (which
lists what you can buy) — if the two start saying the same thing, cut the
overlap from this one. It is centred throughout, which only works because the
statement is capped at 20ch and the three points at 34ch each. Centred text
stops being readable past about four lines, so if the copy grows, **the measures
are what hold, not the alignment.**

**Two sections are ink blocks** — "What I do" and Testimonials, carrying
`.on-dark block--dark`. Worst contrast across twelve runs: **5.85:1**; the
hovered point heading measures 8.51:1. Alternating textured cream with solid ink
gives the page a rhythm and the ink blocks read as the quiet ones.

**Services now sits down by the contact form**, with the FAQ under it. By
that point a visitor has seen the work and the person, and this is the
"what can I actually buy" moment. It used to follow "What I do", and that
pairing is gone: `#work` lost its `.section--tight-top` because the section
it was tightening against has moved away. "What I do" keeps its
`.section--tight-bottom` (256 → 208) and now introduces Selected Work.

**Services and the FAQ are one tab each, not ten rows.** Each section is a
single disclosure whose body carries the whole list — four services in a
2×2 grid, six questions in the same grid. Ten separate rows read as a wall;
two closed doors read as a choice, and the tab title *is* the section
heading, so nothing is said twice.

**The two are joined, not spaced.** `.services` drops its bottom padding,
`.faq` its top padding *and* its `border-top` — otherwise the Services
item's bottom rule and the FAQ's top rule stack into a 2px line. They read
as two rows of one list. Each row still breathes from `.acc__label`'s 64px
top padding, which is *inside* the rule, so closing the outer gap tightens
the pair without cramping it.

**Both grids use `subgrid`, and that is what keeps the columns level.**
Each entry spans the grid's own rows, so every question sits in one row
band and every answer in the next. Without it each cell is an independent
block: a question that wraps to two lines in one column pushes its answer
down while its neighbour's stays put, so the pair starts level but nothing
inside them lines up. `@supports` guards it; without subgrid the entries
are ordinary blocks and only lose the internal alignment.

Rows are written **open** in the HTML and closed by `main.js`
(`data-acc="closed"`) — the same contract as everything else here, so with
the script gone both sections are headed prose rather than dead buttons
hiding their own content. Verified: 2 tabs, both open, every service and
question rendered.

The panel animates on `grid-template-rows: 1fr → 0fr`, not `max-height`.
A max-height needs a magic number larger than any answer will ever be,
which makes the close start late and the open finish early; `fr` measures
the content, so the easing is honest at any length. `visibility` drops
after the collapse so a zero-height row leaves the tab order.

**The `#web-design` / `#brand-identity` / `#portfolio-sites` / `#site-care`
anchors moved with it** — the nav Services panel links to them.

**Nothing in the FAQ quotes a price.** The pricing figures are still
drafts, so the cost answer describes *how* quoting works and points at the
form. Every other answer restates something already true elsewhere on the
page or in the Process panel. Keep it that way.

## About

Sits directly above the testimonials so the portrait introduces the person right
before other people vouch for him.

**The two columns are sized to their content and the pair is centred**, not
split as fractions of the shell. At `.7fr / 1.3fr` the copy column came out
738px while the text inside is capped at its measure (395px body, 476px
heading), so 343px of the column was empty and the section hugged the left
edge. Fractions balance the *columns*; what has to balance is the ink.

**It is two paragraphs and nothing else.** A credentials list — degrees, role,
certificates — was built here and cut: Jared wants the security background as an
argument, not a CV. Don't reintroduce one.

The security claim is the section's whole point, so the wording is load-bearing:

- The page says **"a master's in cybersecurity management."** The résumé says
  MS, Information Systems, with Cybersecurity Management among the coursework.
  Jared asked for it this way and that is his call — but know that the two
  differ, and don't "fix" one against the other.
- His bachelor's is **Information Technology** at BYU–Hawaii (the résumé says
  Information Systems). It appears nowhere on the page now; if it ever does,
  that is the correction to apply.
- Figures come from the résumé: 2,500+ students and staff at BYU–Hawaii, 350+
  machines at the Polynesian Cultural Center. Don't round them up.

The nav's About panel carries the same line. **If one changes, change both.**

**The portrait is shown whole, not cropped** — `height: auto`, no `object-fit:
cover`, and the column narrowed to `.7fr` to pay for the extra height a full 2:3
frame needs. `height: auto` has to be explicit: the `width`/`height` attributes
on the `<img>` are a presentational hint that otherwise wins. On mobile it is
capped by `max-width`, never by height.

## Editing index.html with a script

**Slice on unique markers, and verify the section list afterwards.** Moving
the Services block once cut from its `<section>` tag and left the
`<!-- ── Services ── -->` comment orphaned near the top of the document. A
later edit searched for that comment to find the block, matched the orphan,
and deleted **Selected Work, About and Testimonials** — three sections,
silently, with no error. It shipped.

Two rules that would each have caught it:

- Cut from the comment, not the tag, and never leave a marker behind.
- After any structural edit, print
  `re.findall(r'<section[^>]*id="([a-z]+)"', html)` and read it. The
  expected list is stats, intro, work, about, feedback, services, faq,
  contact, newsletter.

`frontend-bug-sweep` catches it too, via dead anchors — but only if it is
run *before* pushing, not after.

## Conventions

**Every block in `main.js` gets its own IIFE.** `var` is function-scoped, so
without one they all share a single scope. The hero stage block declares
`track`, `real`, `all` and `CLONES` — the exact names the Selected Work
carousel uses — and because it runs later it silently reassigned all four out
from under that block's closures. Selected Work's tabs stopped scrolling the
track and its current-tab marker cleared itself, with **no error anywhere**.
Scan for duplicate top-level `var` names when adding a block.

**Tokens are three-layer and one-directional.** Primitives (`--ink-60`,
`--space-6`) → semantic (`--text-muted`, `--border-subtle`) → component
(`--nav-h`). **Components reference semantic tokens only.** No raw hex or rgba
in a component rule. Breaking this is what made the polarity flip cost five
fixes instead of zero — `.hero__note`, `.panel__facts u` and `.showcase__tab`
all reached for raw `--ink-85` and went invisible on cream; they use
`--text-strong` now. It was harmless until the day it wasn't.

**Contrast is checked, not guessed.** Every ink alpha in the primitive layer
carries its measured ratio against the surface ramp in a comment. Body copy sits
at `--ink-60` or lighter (5.8:1 floor). `--ink-40` is for large bold text only
(3:1). Anything below that is non-text — rules and borders. If you add a value,
compute the ratio and record it.

**The entrance stagger must not outlive the entrance.** `--stagger` is applied
as a `transition-delay`, and a transition-delay is not a one-off — it applies to
*every* transition that element ever runs. Left in place it delayed the hover on
the fourth service card by 240ms, which read exactly as that card being less
responsive. `main.js` adds `.is-settled` on `transitionend` (with a 1400ms
fallback, since transitionend never fires for an entrance that was not actually
animated) and that zeroes the delay. Anything that sets its own delay must do
the same.

**Depth is a four-step scale**, not per-component shadows. `--shadow-1`…`4`, each
of them *two* shadows: a tight contact shadow that sells the edge and a wide
ambient one that sells the height. One shadow can do either, never both, which
is why the five hand-written values these replaced looked flat at rest and muddy
when raised. Light is from directly above — offsets are vertical only. Cards
rest at 1 and hover at 3, slides rest at 2, panels sit at 4, buttons take 2 on
hover and drop to 1 on press.

**Everything pressable has an `:active`.** Their absence is most of what makes
an interface feel like a document rather than a product. Buttons scale to `.98`
through their own `--press` channel (so `:active` never has to out-specify
anything) and the transition drops to 90ms — Apple and Material both want
feedback inside 100ms, and `--dur-fast` at 200ms feels spongy under a finger.

**Motion shares one rhythm.** `--dur-fast` 200ms buttons, `--dur-base` 300ms
nav/surfaces, `--dur-slow` 800ms scroll entrances, `--stagger` 80ms between
siblings — all matching squarespace.com's timings. Transform and opacity only,
never width/height/top/left. Every motion rule needs a `prefers-reduced-motion`
escape.

**Touch targets are 44px minimum**, reached with padding or `min-height`, not by
growing the visible element — and 44px is a *floor, not a starting size*.
`flex-shrink: 1` will silently trade it down to fit; use `flex: 0 0 44px` and
let the gap give way.

**JS is optional by contract.** The page must read, navigate and submit with
`main.js` removed. The `.js` class is added by the script itself, so any hidden
start state it introduces can only exist when something can undo it.

## Source of truth

The design lives in Claude Design project
`f1dfaa4f-eab9-48d1-b16c-67b925eef288` ("Portfolio landing page design").
`Home.dc.html` is the reference for this page. Read with the `DesignSync` MCP
(`get_file`); images dropped into `<image-slot>` elements are stored as base64
in `.image-slots.state.json`, not as files. **Never push local changes back**
unless asked — the sync is one-way, design → code.

`Services.dc.html` and `Pricing.dc.html` are designed but **not implemented**.
The nav and footer links that used to 404 now point at `#services` and
`#contact`; if those pages get built, repoint them.

## Content still to fill

**All eight testimonials are invented, and this is the one that cannot ship.**
Every quote, every "Placeholder Name", every role was written so the marquee
could be designed and reviewed. Publishing invented reviews as genuine is
deceptive, and in the US it is unlawful under the FTC's rule on consumer reviews
(16 CFR Part 465), which reaches fabricated testimonials on a business's own
site. **Replace them with real, attributable quotes or delete the section**
before this is promoted anywhere. Anything that cannot be attributed to a named,
consenting client comes out. The avatars are still empty `.slot` tiles.

**Pricing is Jared's, set 2026-08-14**: from $300 landing page, from $1,200
full site, $120/month care. These are no longer drafts — he named them. They
live in the nav Pricing panel only; the FAQ still quotes no price and should
stay that way, so the panel is the single source. **The contact form's budget
placeholder tracks the range** and now reads "e.g. New site, $300–1,200" —
move it whenever the figures move, or the form implies a bracket the panel
does not offer.

**Forms post to `action="#"`.** `main.js` refuses that honestly rather than
faking success, so nobody is misled — but the form cannot work until it has a
real endpoint. Point it at one and delete the placeholder branch.

**Confirm the licence on the supplied photography.** `process-bench.webp` came
in as `neatly-kept-jewelers-desk.jpg`, a filename that reads like a stock
library. Jared supplied it, but a commercial site needs the licences on record
before launch, and the masters in `assets/img/_source/` are what a takedown
request would be measured against.

The `og:description` and the footer wordmark now both read "A website you can
feel", matching the hero.
