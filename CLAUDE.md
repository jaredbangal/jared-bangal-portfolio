# Jared Bangal — portfolio site

Static site. No build step, no framework, no package manager. Plain HTML, one
stylesheet, one progressive-enhancement script.

```
index.html              Home
assets/css/styles.css   all styles
assets/js/main.js       nav state, reveals, scrollspy, form validation
assets/img/             hero-tools-{960,1600,2400}.webp, portrait{,-480}.webp,
                        process-painter.webp, work-<slug>.webp
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

The one saturated colour on the page: `--accent` `#F25939`, `--accent-hover`
`#F57052`.

Jared's pick, arrived at after two rounds — `#E8703A` (OKLCH chroma .164)
read dusty, `#FF6B2C` (.195) was the correction, and this is where he
landed. Chroma is what makes a colour read as chosen rather than as a
tinted grey, so that is the axis to reason on if it ever moves again.

It does two jobs and has to clear 4.5:1 for both — a fill under
`--text-on-accent` (dark ink) and hover ink on the surface ramp. Those are
the same pair, so one measurement covers both: `#F25939` reaches
5.6 / 5.4 / 4.9 / **4.6** on shade-900…600, `#F57052` reaches 6.6 / 6.3 /
5.8 / 5.4.

**Watch that 4.6.** `--shade-600` (the chip-hover surface) is always the
binding one, and this value has almost no headroom left there. Darkening or
desaturating it any further breaks AA on shade-600 before anywhere else, so
measure against that surface first, not the page ground.

Everything accented comes off those two tokens — buttons, the active
carousel pill, the skip link, input focus borders, nav and panel link
hover, and the three hover states under "The accent hover" below.
**Never introduce a second accent value**; if a new component needs orange
it references the token.

`--accent` is the resting/fill value and `--accent-hover` the brighter ink
value. Where both appear in one component (a Process step: rule in
`--accent`, type in `--accent-hover`) that split is what keeps the type
legible while the rule still reads as the same colour.

`--focus-ring` deliberately stays `--ink`. An on-theme focus ring is
weaker than a maximum-contrast one, and the ring is an accessibility
affordance before it is a brand surface.

## Grain

Two passes of one SVG turbulence tile.

- `.grain` is hero-local, between the scrim and the copy, so it textures
  the photo and never lands on text. `overlay` at `.14` — there is a real
  image underneath with luminance to push against.
- `body::after` is the page-wide film: `position: fixed` (it should not
  scroll with the content) at `--z-grain` 60, above the nav so no surface
  is left smooth. `soft-light` at `.26`.

**Blend mode is the whole problem on a dark page.** `overlay` degenerates
to `multiply` below 50% luminance, so against the `#14171C` ground it has
no headroom — measured, it moved a flat surface's stdev from 0.76 to 0.83,
which is invisible. `soft-light` is the one that reads. It lifts the mean
slightly (23 → 28 on the L channel) because grain on near-black can only
work by adding light, but the floor stays put, so blacks stay black and
the specks are what you see. `normal` is worse than either: it washes the
page (23 → 34 at .14).

Opacity is capped by text, not by looks — the film composites over live
copy. Measured on rendered pixels at 1st/99th percentile, it costs
nothing at `.26` (label 4.42 → 4.70, body 7.47 → 7.68; it slightly helps,
because it lifts the ink end more than the ground). Raising it further
starts eating the `--text-muted` floor. Re-measure if you change it.

## The cream scope

One light section in an otherwise dark page, lifted from the Meridian
concept: `--cream-200` `#E4E2DC` is that concept's own card value,
`--cream-100` `#F4F2EC` sits above it, and `--ink-dk` `#16171A` is its ink.
Meridian's `--paper` `#FAFAF8` was too close to white to read as a colour
at all, which is why the ground is the darker of the two.

`.on-cream` works by redefining the **semantic** layer on a container. No
component rule knows the scope exists, and none should have to — that
one-directional token architecture is exactly what makes a polarity flip a
twenty-line change instead of a rewrite.

Three things bite, all already hit:

- **`color` must be re-resolved on the scope.** It inherits as the
  *computed* value, and `body` already resolved `--text-primary` against
  the dark ramp, so every `.h2` — which only inherits — stayed light ink
  and vanished. `.on-cream { color: var(--text-primary) }` fixes the whole
  subtree. Elements that set their own `color` (labels, `.section__sub`)
  were never affected, which is what makes the bug look random.
- **The accent flips too.** `#F25939` on cream measures 2.6:1 — unusable as
  ink and below even the 3:1 non-text bar. The scope swaps in `#A8320F` /
  `#9E2E0C` (5.2:1 / 5.7:1 on the ground). It follows that **a section in
  this scope must not contain an accent fill under dark ink**, which is the
  one combination these values cannot serve. Today it contains no buttons.
- **The muted floor moves.** Body copy sits at `--ink-dk-66` here, not the
  `.60` the dark ramp uses; `.60` only reaches 4.30:1 on `--cream-200`.

The grain film composites over this too. Measured on solid swatches, it
costs about 4% at the median and 10% at the worst pixel — accent ink on the
cream ground, the tightest pair, goes 5.18 → 4.87 median / 4.51 worst. That
still clears, but it is the value with the least room, so re-measure it
rather than the heading if anything here changes.

`.on-cream` is portable by design. It is on the testimonial band today, and
those quotes are placeholders that may not survive to launch — if the
section goes, move the class to the newsletter band rather than losing the
page's one light moment.

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

The hero is a flatlay of hammers and files on dark wood (3:2, 4460×2973
master), served at 960/1600/2400w. The portrait now lives in About — one
photo each, doing different jobs. Don't put the portrait back in the hero;
a 2:3 crop fights a full-bleed hero at every anchor point.

**The scrim is measured, never eyeballed.** Sample the *bare* photo with
`.hero__scrim` and `.grain` hidden and the text set to `visibility: hidden`,
find the brightest pixel inside each text box, then solve for the alpha that
clears 4.5:1. This flatlay's pale tool handles peak at rgb(239,238,234) — it
needs a *heavier* scrim than the dark-jacket portrait did, which is the
opposite of what the image looks like it needs. Current measurements:
headline 5.3:1, note 4.6:1, nav 7.3:1 desktop; 5.0/9.2/8.7 mobile.

The two gradient layers do different jobs. The linear pass stays light so
the flatlay reads at the edges (~.26 in the corners); the radial pass sinks
only the copy footprint (~.71 combined). Swapping the photo means
re-measuring both — the automated contrast pass skips anything sitting on an
image, so it will not catch a regression here.

**The linear pass's last stop must be alpha 1**, not .88 as it was. The
hero has to dissolve into the page rather than stop at an edge, and the
only way there is no seam is if the bottom band of hero *is* `--bg-page`.
Anything short of 1 leaves a visible step. Verify by sampling a pixel
column across the join — adjacent rows should differ by ≤1/255 (they
currently differ by 1, at every width).

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

Hero → **The case** → **What I do** → Services → Selected Work → Process → **About** →
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

Three sections share one hover behaviour — **What I do** points, **Services**
cards, **Process** steps. In each: the heading (and the numeral where there
is one) goes `--accent-hover`, and the rule or border goes `--accent`. The
service cards keep their own lift and fill underneath it.

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

**Confirm the licence on `process-painter.webp`.** It came in as
`tattooed-man-painting-walls.jpg`, which reads like a stock library file.
Jared supplied it, but a commercial site needs the licence on record before
launch, and the master in `assets/img/_source/` is what a takedown request
would be measured against.

Forms post to `action="#"` — point them at a real handler and delete the
placeholder branch in `main.js`.
