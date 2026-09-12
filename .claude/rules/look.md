---
paths:
  - "assets/css/**"
  - "assets/img/**"
  - "assets/js/theme.js"
  - "tools/build_og.py"
---
# How the site looks: type, colour, dark mode, texture, the mark, the four dots, hover

<!-- Loaded only when a matching file is read. Evidence for every rule is
     in docs/design-notes.md under the same ## heading. -->

## Visual direction

squarespace.com's system on Jared's palette; `reference/squarespace-tokens.json`
holds scraped values — re-scrape rather than guess.

- **Nav** 80px, transparent over the hero, blurred translucent bar after. The
  brand is the `jb` mark alone — see **The mark**.
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

## Day and night

A theme toggle in the nav. **The dark palette is not a new one** — it is
`.on-dark`, the block scope, promoted to page level: `:root[data-theme="dark"]`
was added to that selector list and defines nothing of its own. One block, two
selectors, no second copy to go stale. That scope had already gone stale twice
when it was the only consumer; a duplicate would be a third way in.

- **`assets/js/theme.js` is loaded blocking in the `<head>` and is the one
  script on the site that is not deferred.** It sets `data-theme` before the
  first paint. Deferring it puts a cream flash in front of every dark-theme
  visitor. It is external rather than the usual inline snippet because
  `vercel.json` sends `script-src 'self'` with **no `'unsafe-inline'`** —
  inlining it would mean weakening the policy site-wide or carrying a sha256
  that breaks the page on the next one-character edit.
- **No JavaScript means light**, deliberately. Honouring `prefers-color-scheme`
  without JS needs the whole dark palette written again inside a media query,
  and that duplicate is the exact failure above. Light is the canonical design
  and fully functional, so this degrades to "the site as it shipped".
- **System preference is the default and the visitor's choice outranks it for
  good.** `theme.js` follows `prefers-color-scheme` live until someone presses
  the toggle; after that the stored value wins. Flipping under them at sunset
  reads as a bug. `localStorage` is wrapped on **read as well as write** — it
  throws outright in some privacy modes.
- **The paper tooth is not a token swap. The tile *and* the blend mode both
  change**: `--tex`/`luminosity` on cream, `--tex-dark`/`lighten` in dark.
  `luminosity` on a dark ground washes it to grey — the measurement is already
  in the `--tex-dark` note, it just now applies to the whole page.
- **The field's palette had to be lifted, not dimmed.** On cream the bottom two
  stops exist to keep a point legible where it crosses a pale surface; on
  `--shade-800` those same two sit within a few levels of the ground and
  vanish. Same failure, mirrored. `PALETTE_DARK` lifts every stop and lifts the
  floor hardest.
- **Each point keeps its stop index (`stopIdx`), so a toggle re-tints in
  place.** Re-rolling `Math.random()` would give every point a *different*
  colour rather than the same colour on the other palette, and 2400 points
  changing identity at once reads as a flicker. One buffer upload, no geometry
  rebuild: the formation, morph clock and pointer state all survive.
- **Elevation was re-solved, not reused.** The light scale is ink at 5–17%,
  which over `--shade-800` is about one level out of 255 — invisible. Dark runs
  near-black at roughly four times the alpha, contact shadow carrying more than
  ambient, because a wide soft black halo on near-black is just a smudge.
- **The nav bar and its scrim were raw cream `rgba` in component rules** and
  are five tokens now (`--nav-bar`, `--nav-bar-solid`, `--nav-scrim`,
  `--nav-scrim-mid`, `--nav-scrim-end`). Unfixed, the bar stays a cream stripe
  across a dark page.
- **The toggle is built by `main.js`, not written into the markup** — the same
  contract the marquee's pause button follows, and it means all thirteen pages
  get it without the nav carrying it. It lives in `.nav__actions` and is **the
  one thing there that survives the 620px cut**: Log In and the CTA go, the
  toggle stays. It shows the *destination* (a moon while the page is light),
  the `aria-label` names that destination, and there is no `aria-pressed` —
  "pressed" has no honest meaning for a swap between two equal states.
- **Worst rendered text contrast in dark is 4.92:1**, by strict per-pixel
  minimum, on the Selected Work sub-line; medians run ~5.5:1 and match the
  figures already recorded for light. Measured against rendered pixels with the
  field frozen — see the note.
- The bar keeps **78px of clearance at 902px** with the toggle in it. The 24px
  figure in *Nav panels* was from the five-trigger era.

## The mark

A brush-lettered `jb` in **`#F16813`**, `assets/img/logo-jb.webp` (169×240,
lossless, 13.8KB). It replaced the lettered `JB` tile and the "Jared Bangal"
wordmark in the nav; `.nav__mark` is gone from the stylesheet.

**The orange is the one saturated colour on the site and it is a logo, not a
token.** It must never be promoted into the token layer — same rule the blue
particle palette lives under, and for the same reason: the page would then have
two accents. `--accent` stays pure black.

- **It is weak on cream and strong on ink**: **2.41:1** on `--cream-200`,
  **6.36:1** on `--shade-950`. Logotypes are exempt from 1.4.3 and 1.4.11, and
  the brush strokes are thick enough to carry it, but that is why the mark is
  largest on the ink foot and smallest in the nav.
- **Three placements, three sizes**: nav 34px (28px under 620px), About 72px,
  newsletter 56px. Every one sets `width: auto` **explicitly** — the `width`
  and `height` attributes are a presentational hint that otherwise pins the
  intrinsic 169px, the same trap `.about__photo` documents.
- **The nav `alt` is the accessible name.** The mark is the home link's only
  content, so `alt="Jared Bangal"` is what a screen reader announces. The other
  two are `alt=""` — the About copy already names him, and the newsletter mark
  is decoration above a heading.
- **The source is flat two-colour, so the cut is exact, not estimated.** Every
  pixel of `JB1.png` lies on the `#E4E2DD` → `#F16813` axis to within 0.68/255,
  so alpha is the projection onto that axis and RGB is set to the ink
  everywhere. Unpremultiplying that way is why the edges carry no cream fringe
  on the dark blocks. **Re-run that method on any redraw** — a plain chroma-key
  leaves a halo that only shows on ink.
- **The light streaks inside the strokes are meant to be transparent.** They are
  brush texture, so they read as gaps on ink rather than as light marks.

### Where it is not

- **The six concept OG cards keep the lettered tile.** `build_og.py` takes the
  mark only when the card is on `CREAM` or `PAPER` (`mark_for()`). The tile
  redraws itself in each card's own `{ink}`/`{bg}`, which is the whole reason
  the six survive palettes as far apart as sage and lime; a fixed orange mark
  fights every one of them.
- **The favicon is the mark on an ink tile**, not the bare mark — at 16px the
  bare strokes and the cream-tiled version both dissolve, and only the ink
  ground keeps them separated. Rendered at 8× and downsampled.
  `/assets/img/favicon.png` and `apple-touch-icon.png` are **root-absolute on
  purpose**: `retarget()` only rewrites the nav and footer, so a relative path
  would 404 from `work/*.html`. Both links are copied out of `index.html` by
  `build_pages.py`, so the head still has one source.
- **The nav panel's About promo keeps the name** — it captions a photograph of
  him, where the name is the caption's job.

**`logo-jb.webp` is stamped by `serve.py` and the other images are not.** It is
the one image likely to be redrawn in place, and under `/assets/*`'s immutable
year a new mark would otherwise never reach anyone who had already visited. The
favicon is not stamped; browsers refetch those on their own schedule.

## Texture

Paper tooth on every surface, **behind** the content as a background layer on the
surface itself — that is why it can be this strong. Method: `surface-texture`.

| | tile | mode | measured |
|---|---|---|---|
| Cream page + bands | `--tex`, slope .38 / centre .762 | `luminosity` | stdev 8.2, shift +1.5 |
| Dark page + bands | `--tex-dark`, slope .16, sRGB filters | `lighten` | stdev 3.25, shift +1.6 |
| **Ink blocks** | **none** | — | **stdev 0.00, `#000000`** |

**The ink blocks are flat `#000000` and carry no tooth at all**, in either
theme — `--bg-ink` is `--shade-1000`. Jared asked for it directly, and the
blocks now read as the quiet surface the textured page sits against. All three
measure stdev 0.00 while the page beside them still measures 3.25.

**A `.block--dark` must not declare a background-image, and the two tooth rules
exclude it with `:not(.block--dark)` rather than the block over-declaring.**
The block used to paint its own tile, which happened to out-specify `.band`'s;
the moment it stopped, the band's tile leaked straight through and the
newsletter came back textured while `#intro` and the footer — which are not
bands — did not. In dark mode it was worse, because
`:root[data-theme="dark"] .band` is (0,3,0) and beats `.on-dark.block--dark`
at (0,2,0) outright.

The dark tile now sits on `--shade-800`, the dark page ground, rather than on
`--shade-950`; it measures the same stdev 3.25 / +1.6 signature there, so slope
.16 still holds. The tile scrolls with the surface, not the viewport;
`stitchTiles` keeps the repeat seamless.

## The four dots

A small orange mark, above the "What I do" label and in the Contact copy. It
started as squarespace.com's three-dot cluster and has moved away from it.

- **Two motions, on two elements, so they never fight for `transform`.** The
  ring rotates — that is the orbit — while each dot runs its own `scale()`
  pulse. Because the ring carries the rotation, each dot can be placed with
  `top`/`left` plus a negative half-margin and keep its transform free.
- **The original does neither.** Nothing there travels; its three dots hand
  each other their sizes, `scale(.403)/(1.56)/(1.59)` against base sizes
  13.08/8.375/5.27px — exactly the ratios that do that swap. Worth knowing if
  you ever go back to it. Jared asked for real orbital motion, so this one
  actually goes round.
- **`--dot-ring` is a no-overlap constraint, not a taste call.** Four dots 90°
  apart sit `R√2` from their neighbours, and the widest adjacent pair is
  `--dot-a + --dot-b`. They touch at R = 9.1px; R = 12 clears by **4.07px**,
  confirmed over 360 samples across the full 36s pattern. Re-solve if the ramp
  or the box moves: `R√2 ≥ (box / 2) × (a + b)`.
- **Measure the radius from the computed scale, never from
  `getBoundingClientRect`.** Inside the rotating ring the rect is the
  axis-aligned box of the *square* element — it swells to 1.41× at 45° and
  knows nothing about `border-radius`. Reading radii off it reported 56
  overlaps that do not exist. The rect's *centre* is still correct.
- **Fill is the mark's orange `#F16813`**, written in the component rather than
  as a token — see **The mark**: a token is exactly what would make it a second
  accent, and `--accent` stays pure black. It is decorative and `aria-hidden`,
  so no contrast minimum applies; for the record it measures 6.73:1 on the ink
  block, 5.76:1 on the dark page, 2.41:1 on cream.
- **One keyframe set and four negative delays.** The sequences are pure phase
  shifts. An earlier version needed four separate sets because it had a long
  synchronised rest; this one has no rest to line up.
- **The spin and pulse periods are deliberately unequal** (14s / 12s). At equal
  periods the swell parks permanently at twelve o'clock; at 7:6 it drifts one
  lap of the ring every 84s, which is how long the whole pattern takes to
  repeat. **Changing the spin cannot affect the overlap** — rotation preserves
  the distances between centres, and the radii come from the pulse alone.
- **A permanently rotating element breaks Playwright's `scroll_into_view_if_needed`** —
  it waits for stability that never arrives and times out at 30s. Pause the
  animations first, or scroll the parent.
- Built in markup, not by JS: it is pure CSS decoration, so unlike the
  marquee's pause button it is not a dead control without the script.

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
