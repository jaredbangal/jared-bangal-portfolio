# jaredbangal.com

Portfolio site for Jared Bangal — freelance web design for small businesses.

Static HTML, one stylesheet, one progressive-enhancement script. No build
step, no framework, no package manager, no dependencies.

```
index.html              the whole page
assets/css/styles.css   all styles
assets/js/main.js       nav panels, reveals, carousels, counters, forms
concepts/               six self-directed concept sites
reference/              scraped design tokens and screenshots
serve.py                dev server: cache-busting + no-store headers
```

## Running it

```bash
python3 serve.py            # http://localhost:8777
python3 serve.py --stamp    # rewrite ?v= cache tokens, then exit
```

Use `serve.py` rather than `python3 -m http.server`. It stamps content-hash
`?v=` tokens onto the CSS and JS links and sends `Cache-Control: no-store`,
both guarding against the same failure: a browser running old assets against
new markup.

## Notes

`CLAUDE.md` carries the design decisions and the reasoning behind them —
the token architecture, the measured contrast ratios, the scrim solver, the
marquee arithmetic, and the traps already hit once. Read it before changing
colour, type, spacing, or motion.

The page must read, navigate, and submit with `main.js` removed. That is a
contract, not an aspiration: any hidden start state the script introduces is
added by the script itself, so it can only exist where something can undo it.

Every ink alpha carries its measured contrast ratio in a comment. If you add
one, compute the ratio and record it.

## Still to do

- Real client testimonials, or remove that section — the current eight are
  placeholder copy attributed to "Placeholder Name".
- Real pricing. The three tiers are drafts, not quoted rates.
- Point the forms at a real handler and delete the placeholder branch in
  `main.js`.
- `services.html` and `pricing.html` are linked but not built.
