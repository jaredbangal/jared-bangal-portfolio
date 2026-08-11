# Jared Bangal — portfolio site

Static site. No build step, no framework, no package manager. Plain HTML, one
stylesheet, one progressive-enhancement script.

```
index.html              Home
assets/css/styles.css   all styles
assets/js/main.js       nav state, reveals, scrollspy, form validation
assets/img/             hero-tools-{960,1600,2400}.webp, portrait{,-480}.webp
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

## Nav panels

Triggers are `<button aria-expanded>`, not links — they disclose, they do
not navigate; the destination lives inside the panel. Hover opens them for
a mouse, but hover is never the only way in: click, Enter, Space and Escape
all work, Escape returns focus to the trigger, tabbing past the last panel
link closes it, and touch (which has no hover) gets the same behaviour
through click. A 220ms grace period on `mouseleave` covers the gap between
trigger and panel.

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

**Render spec.** The tile is a 4:5 window (`.work__frame`) matching
squarespace.com's cards (measured 310×420 and 427×491, ratio 0.74–0.87).
The image inside is a **full-page** render — 1.4–1.8 screens tall — so
hovering can travel through it.

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

## Content still to fill

Two testimonial avatars and both quotes. Forms post to `action="#"` — point
them at a real handler and delete the placeholder branch in `main.js`.
