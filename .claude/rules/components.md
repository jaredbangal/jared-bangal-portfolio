---
paths:
  - "assets/js/main.js"
  - "index.html"
  - "concepts/**"
  - "tools/build_shots.py"
  - "tools/parked/**"
---
# Hero stage, nav panels, stats, Selected Work, marquee, About

<!-- Loaded only when a matching file is read. Evidence for every rule is
     in docs/design-notes.md under the same ## heading. -->

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
