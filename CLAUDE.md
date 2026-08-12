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

## Grain

Two passes of one SVG turbulence tile.

- `.grain` is hero-local, between the scrim and the copy, so it textures
  the photo and never lands on text. `overlay` at `.14` — there is a real
  image underneath with luminance to push against.
- `body::after` is the page-wide film: `position: fixed` (it should not
  scroll with the content) at `--z-grain` 60, above the nav so no surface
  is left smooth. **`multiply` at `.14`.**

**Blend mode is the whole problem, and which mode wins depends entirely on
which end of the range the page sits at.** Both failures have now been
measured on this repo:

| Page | Mode | Flat-surface stdev | Verdict |
|---|---|---|---|
| dark `#14171C` | `overlay` .04 | 0.76 → 0.83 | invisible |
| dark `#14171C` | `soft-light` .26 | 0.76 → 2.06 | reads |
| cream `#E4E2DC` | `soft-light` .26 | 0.00 → 0.50 | invisible |
| cream `#E4E2DC` | `soft-light` 1.0 | 0.00 → 1.68 | still weak |
| cream `#E4E2DC` | `multiply` .14 | 0.00 → ~2.0 | reads |

`overlay` degenerates to `multiply` below 50% luminance and had no headroom
on the dark ground; `soft-light` compresses near the *top* of the range and
had none on cream. `multiply` has all its headroom on a light ground, and
darkening slightly (226 → 218 on the L channel) is the right direction for
texture on paper.

**If the page ever goes dark again, this must go back to `soft-light`.**
The two are not interchangeable, and the failure mode in both directions is
silent — the film simply stops being visible.

The film composites over live text, which is what caps its opacity and what
forced `--accent-ink` a step darker. Re-measure on rendered pixels, not
computed styles: a blend layer is invisible to a contrast checker that
reads the CSSOM.

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

Three disclosures — Services, Pricing, About — all built to one
three-column shape (index / explore / promo) so they read as a set. Keep
new ones to that shape; a panel noticeably smaller than its neighbours
looks like an oversight. (Process was the fourth; it went with its page
section.)

**Each panel points at its own trigger.** An 8px gap under the bar and a
caret at `--caret-x`, which `main.js` sets from the trigger's centre — the
panel is positioned against the *bar*, so without a pointer a wide panel
centred under the bar belongs to no item in particular. Squarespace's does
the same thing, and the gap is what lets the caret read at all.

The caret is `.nav__panel::before`, **not a child element**, and that is
load-bearing: `.nav__panel > *` carries the column stagger, so a real
element would be treated as a fourth column and shift every `nth-child`
delay after it. It is a rotated square rather than a border triangle so it
can carry the panel's own background and border; `clip-path` drops the two
lower edges, which would otherwise draw a line across the panel's top.

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

## Hero imagery

A knolled flatlay of sewing and craft tools on white cloth (3:2,
4460×2973 master), served at 960/1600/2400w. The portrait lives in About —
one photo each, doing different jobs. Don't put the portrait back in the
hero; a 2:3 crop fights a full-bleed hero at every anchor point.

**The hero is light, and so is the type problem.** This replaced a dark
flatlay, and every polarity in the section inverted with it: the copy is
page ink, the scrim *lifts* the plate instead of sinking it, the nav's
scrim went from dark-protecting-light to light-protecting-dark, and the
hero-local grain went `overlay` → `multiply`. If the photo ever changes
again, ask which end of the range it sits at before touching an alpha.

**The scrim is solved, never eyeballed.** The method, which is repeatable:

1. Hide `.hero__scrim`, `.grain`, `body::after` and `.nav::before`, and set
   the type to `visibility: hidden`.
2. Screenshot, and take the **darkest** pixel inside each text box — the
   worst case for dark ink. (On the old dark hero it was the brightest.)
3. Solve for the cream alpha that brings that pixel far enough for the
   text's own colour to clear its ratio.

That gave: headline 0.29, note 0.41, nav 0.00 at 1440; headline 0.27, note
0.40, nav trigger 0.40 at 390. The scrim carries margin over those, since
the grain film composites on top. Composited result: headline 6.3:1 against
a 3:1 bar, note 6.2–6.8:1, nav 11–12:1.

**Three gradient layers, three jobs, and they must stay separate:** the
bottom dissolve into `--cream-200` so the photo ends in the page colour
rather than at an edge; a radial plate over the copy footprint only; and a
light top pass so the nav reads. Eyeballing one combined gradient is how
the first attempt washed the flatlay out until the tools were barely
visible — the numbers above are what pulled it back.

The automated contrast pass skips anything sitting on an image, so it will
not catch a regression here. Re-run the solver by hand.

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
