---
paths:
  - "assets/js/particles.js"
  - "tools/build_qr.py"
  - "motion/**"
---
# The particle field and the scan code

<!-- Loaded only when a matching file is read. Evidence for every rule is
     in docs/design-notes.md under the same ## heading. -->

## The particle field

`particles.js` — 2400 points, fixed behind the page, morphing between four
formations as sections scroll past. Architecture: `particle-field`.

- **Every section holds `sphere`, on every page** — the one exception is the
  scan code's slot on the home page (see **The scan code**). Jared asked for one
  shape the whole way down (2026-09-04); morphing under a reader was the part of
  the field that drew attention to itself. The running order used to be
  `sphere → vortex → polaris → waves → sphere`.
- **Nothing was deleted to do that, and nothing needs deleting.**
  `setFormation` returns early when the name matches what is already current, so
  25 sections all naming `sphere` means no morph and no camera shift ever runs.
  `vortex()`, `polaris()` and `waves()` are intact and one word away — put a name
  back in a section's `data-formation`. The frame loop's `current === "waves"`
  branch is an `else if`, so it simply never fires; the resize handler's
  `current === "sphere"` re-form now always applies, which is correct.
- **The case studies' `data-formation` lives in `tools/build_cases.py`**, not in
  `tools/fragments/work-*.html` — those six are generated, so an edit there is
  reverted by the next build. Worst text contrast on the sphere: 6.62:1 at 1440,
  6.93:1 at 390.
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

## The scan code

A QR for `services.html`, drawn by the field in `#scan`, between Contact and the
newsletter: the sphere swings face-on, streams into the code finder-corners
first, and 2523 extra points appear out of nothing to fill it. Jared's idea,
after tree.icqr.com's "Magic Tree"; nothing of theirs is used.

- **The matrix is baked, never computed.** `tools/build_qr.py` writes the
  `qr:begin`/`qr:end` blocks in `particles.js` and `index.html` from
  `CANONICAL` + `TARGET`. It needs `segno`. Re-run it, then `serve.py --stamp`.
  Error correction is **Q**, not M — the code is soft round points, and the
  extra recovery pays for that. Version 4, 33 × 33, **547 dark modules**.
- **4923 points is 547 × 9, and the sphere is still 2400.** The extras sit
  outside the draw range except while the code forms, shows and fades, so
  every contrast figure measured against the field still holds. `COUNT` is the
  formations' count and `TOTAL` the buffers'; never raise `COUNT` to get code
  points.
- **The slot carries `data-formation`, not the section, at
  `data-formation-at="0.75"`.** At the default .4 of the *section*, the slot's
  centre was still below the fold and the code formed where nobody could see it.
- **A formation takes over on the rising edge only** (`intersectionRatio ≥
  at`). The observer used to act on `isIntersecting`, which is also true for a
  section *leaving* past the threshold — Contact dropping below .4 re-fired
  `sphere` a moment after the slot fired `qr`. Invisible while every section
  said the same word.
- **The code is pinned to the slot every frame.** One CSS pixel is
  `2 · tan(30°) · 520 / innerHeight` world units at the code's plane, so the
  swarm moves to the slot's centre, the camera parks on axis, the spin unwinds
  to face-on and the cursor is off. **`frustumCulled = false` is
  load-bearing** — the bounding sphere is computed once from the first frame,
  and on a phone the code's corners reach well outside it.
- **`push: 0` does not turn the cursor off** — `(mode.push || 19)` reads 0 as
  19. Repulsion is gated on `current !== "qr"` instead.
- **Scannable by measurement.** Core to full opacity, halos out, the `QR_INK`
  stops, `QR_FILL` 2.4. Decodes with both OpenCV detectors at 1440 / 860 / 390
  in both themes, under reduced motion, and as the no-WebGL fallback; **worst
  module pair 4.26:1**, medians 5.73–5.95:1, 0 of 1089 modules misread.
  **Re-run the decode if `QR_INK`, `QR_FILL`, `CORE_SIZE` or the slot size
  moves**, and scan it with a real phone — OpenCV is not a phone camera.
- **Dark mode is a cream plate, never an inverted code** — plenty of scanners
  cannot read light-on-dark. The plate is drawn in WebGL because anything in
  the DOM sits above the canvas. `--qr-ground` / `--qr-ink` are the one pair
  the dark scope must not redefine.
- **`QR_INK` is not a token**, for the same reason the field's blues are not.
- **The per-point alpha and size are a patch on r128's shader strings.**
  Upgrading Three means checking both still match; the draw range keeps a
  failed patch from ever reaching the hero.
- The SVG in the slot is the code without WebGL; `particles.js` adds
  `.field-qr` to hide it only once it can draw its own. The square is an
  `aria-hidden` link with `tabindex="-1"` — the visible "Open the services page"
  link is the accessible one.
