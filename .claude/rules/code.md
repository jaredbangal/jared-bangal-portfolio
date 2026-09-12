---
paths:
  - "assets/**"
---
# CSS and JS conventions

<!-- Loaded only when a matching file is read. Evidence for every rule is
     in docs/design-notes.md under the same ## heading. -->

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
- **A `.reveal` is a stacking context for as long as it holds a transform, and
  it paints over any unpositioned content below it.** `.js .reveal.is-in`
  settles to `matrix(1,0,0,1,0,0)` — identity, but not `none` — and during the
  800ms entrance it is genuinely 24px lower than where it lands. Anything a
  revealed block can reach on its way in must own a layer
  (`position: relative; z-index: 1`), or the words get drawn over it.
  `.section__head` drops the transform outright on `.is-settled` for this
  reason; a centred block of section copy never lifts, so it loses nothing.
  **This shipped**: the Selected Work heading painted over the concept cards
  for the length of its own entrance, on phones only.
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
