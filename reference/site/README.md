# reference/site — this site, scraped from itself

A snapshot of what the site *actually renders*, kept so the design can be
inspected without booting the server or reasoning from the stylesheet. Sibling
of `reference/`, which holds the squarespace.com material this was derived from.

Regenerate the whole folder after any visual change:

```bash
python3 serve.py &                       # must be serve.py — see CLAUDE.md
python3 reference/site/scrape.py http://localhost:8777 reference/site
```

## What is here

```
site-tokens.json    every custom property, declared and computed
fonts/archivo.css   the @font-face CSS Google actually serves us
screens/            viewport captures, per section, at 1440 and 390
manifest.json       filename → pixel size, written by the scrape
```

### site-tokens.json

- `custom` — all `:root` tokens, each with its **declared** value (`var()` chains
  intact, so the three-layer structure is visible) and its **computed** value.
- `dark` — what `.on-dark` redefines. Diff it against `custom` to see the full
  set of tokens that flip in the ink blocks.
- `breakpoints` — every `@media` condition in the stylesheet, deduplicated.
- `type` — the rendered type ramp: family, size, weight, line-height, tracking
  and colour for the nine elements that set the page's typography. These are
  *computed*, so they already account for the fluid `clamp()`.
- `fonts` — families in use, the Google Fonts stylesheets we link, and any
  `@font-face` rules readable from same-origin sheets.
- `concepts` — per concept page: its fonts, its font stylesheets, and its body
  background and ink. This is the quickest way to check a new concept is
  distinct from the six that exist.

### screens/

Captures are **viewport shots, not full-page**, wherever the field matters. The
particle canvas is `position: fixed`, so a full-page capture paints it once at
the top and leaves the rest of the document bare — it would misrepresent every
section below the fold. Both accordions are opened before capture.

- `home-<section>-{1440,390}.webp` — each section with the field live and the
  formation settled (2.2s of dwell per section, so the morph has landed).
- `home-full-{1440,860,390}.webp` — whole-document layout maps. The field looks
  wrong in these by design; they are for structure and rhythm only.
- `nav-<panel>-1440.webp` — the four nav panels open.
- `concept-<slug>.webp` — the six concept pages, full-page at 1200.
- `page-<name>.webp` — the generated pages (services, pricing, privacy, terms,
  404, and two case studies), full-page at 1440. One width each: these are prose
  and cards rather than layered effects, so a section-by-section sweep of them
  would be noise. Only two of the six case studies are captured — they share one
  template, so the other four differ in wording alone.
- `motion-1440.webp` — the standalone particle study.

### fonts/

Archivo is **OFL-licensed**, so this is safe to keep, but what is stored is the
*served CSS* — the `@font-face` rules and their `src` URLs — not the binaries.
The site loads them from Google's CDN at runtime; this file is a record of which
weights and unicode ranges that amounts to, so a change in what Google serves is
visible in a diff.

Their face, Clarkson, is proprietary and is **not** here and must not be
embedded or hotlinked. See CLAUDE.md.

## What this is not

Not a design system document and not a substitute for `CLAUDE.md` or
`docs/design-notes.md` — it records *what the values are*, never *why*. When the
two disagree, the scrape is right about the present and the notes are right
about the intent; reconcile before changing either.
