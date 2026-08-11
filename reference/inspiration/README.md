# Inspiration — small-business sites worth studying

Captured at 1440×900 on 2026-08-10. These are reference material for *how to
build* sites like this. They are other companies' work — see the note at the
bottom before putting any of them on the Selected Work tiles.

| Site | What it does well | Steal this for |
|---|---|---|
| **goodee** ([goodeeworld.com](https://www.goodeeworld.com/)) | High-contrast display serif over full-bleed product photography; a solid blue CTA that has no business working against olive and it does. Three stacked nav tiers stay legible because each has its own band colour. | Hero treatment, and the discipline of one loud accent against a muted photo |
| **Great Jones** ([greatjonesgoods.com](https://greatjonesgoods.com/)) | Warm cream ground, chunky display face, trust strip immediately under the hero (shipping / reviews / trial / returns). Very approachable — reads friendly, not corporate. | The trust strip. A freelance site badly needs one: turnaround, revisions, what's included |
| **Sightglass** ([sightglasscoffee.com](https://sightglasscoffee.com/)) | Left-anchored hero copy on a process photo, review stars *above* the headline, small uppercase CTA with an arrow. Sells the craft, not the product. | Social proof placement, and photographing process rather than output |
| **Kettl** ([kettl.co](https://kettl.co/)) | Restrained serif centred on a shallow-focus photo. One line, one button, nothing else. Closest in spirit to your hero. | Confidence to leave the hero almost empty |
| **Hem** ([hem.com](https://www.hem.com/)) | Enormous white display type over interior photography; pill CTA bottom-right instead of centred. Editorial rather than salesy. | Off-centre CTA placement as an alternative to the centred stack |
| **Semplice** ([semplice.com](https://www.semplice.com/)) | Full-bleed yellow, black type at ~7rem set tight, three lines filling the viewport. No image at all. | Proof a hero needs no photo — useful while your photography is thin |
| **Oatly** ([oatly.com](https://www.oatly.com/)) | Graph-paper ground, hand-drawn display face, everything boxed in hairline rules. Total commitment to a voice. | How far a personality can be pushed when the copy carries it |

Not captured: **aesop.com** sits behind a Cloudflare bot check.

## Re-capturing

```bash
python3 -m playwright  # already installed
```
The capture script pattern is in the session scratchpad; it navigates with
`wait_until="domcontentloaded"` (never `networkidle` — these sites poll
forever), waits ~3.5s, then clicks through cookie and region gates before
shooting. Hem needs Private → United States → Confirm selection.

## Before using any of these on the site

These are other people's sites. Showing them under **"Selected Work / A few
recent projects"** presents them as work Jared did — the first thing a
prospective client does is click through, and the attribution problem
surfaces immediately.

Legitimate ways to fill that section with no shipped client work:

1. **Concept projects.** Design a full site for a fictional or real-but-
   unaffiliated business and label it `Concept — Botanica, floral studio`.
   Standard practice, and it shows more range than a client brief usually
   allows.
2. **Personal projects.** This portfolio itself is a build. So is any tool,
   template, or side site.
3. **Cut the section** until there is work, and let Services + Process carry
   the page. An empty Work grid reads worse than no Work grid.
