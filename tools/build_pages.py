#!/usr/bin/env python3
"""Assemble the secondary pages from index.html's nav and footer.

    python3 tools/build_pages.py

There is no build step *to serve* this site — every page it writes is plain
static HTML, committed, and served as-is. This exists because the nav is 180
lines of markup and the footer another 15, and nine hand-maintained copies of
them would be nine copies to forget. index.html stays the single source: edit
the nav there, re-run this, commit the result.

Same contract as the concept pages' responsive patch — generated, so
regenerate rather than hand-editing the output.

Each fragment in tools/fragments/ starts with a front-matter comment:

    <!--meta
    path: services.html
    title: Services — Jared Bangal
    desc: One-line description for <meta name=description> and og:description.
    -->
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FRAGS = ROOT / "tools" / "fragments"
SITE = "https://jared-bangal-portfolio.vercel.app"

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#E4E2DC">

<meta property="og:type" content="website">
<meta property="og:url" content="{site}/{path}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{site}/assets/img/portrait.webp">
<meta name="twitter:card" content="summary_large_image">
{robots}
{favicon}

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&display=swap">
<link rel="stylesheet" href="{up}assets/css/styles.css">
</head>
<body>

<a class="skip-link" href="#main">Skip to content</a>
<div id="nav-sentinel" aria-hidden="true"></div>
<canvas id="field" aria-hidden="true"></canvas>

{nav}

<main id="main">
{body}
</main>

{footer}

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" defer></script>
<script src="{up}assets/js/particles.js" defer></script>
<script src="{up}assets/js/main.js" defer></script>
</body>
</html>
"""


def slice_block(html, start, end):
    a = html.index(start)
    b = html.index(end, a) + len(end)
    return html[a:b]


def retarget(block, up, self_path):
    """Point a copy of the nav or footer at the right place from this page.

    Three rewrites, in this order:
      1. root-relative asset and page paths get the `../` prefix they need
      2. a bare `#anchor` means a section of the *home* page, not this one —
         except #main, which every page has, and except anchors this page
         actually declares
      3. aria-current lands on whichever nav or footer link is this page
    """
    def prefix(m):
        return f'{m.group(1)}="{up}{m.group(2)}'
    block = re.sub(r'\b(href|src)="((?:assets|concepts|work)/)', prefix, block)
    block = re.sub(r'\b(href)="(index\.html)', prefix, block)
    # services.html / pricing.html / privacy.html / terms.html at the root
    block = re.sub(r'\b(href)="((?:services|pricing|privacy|terms)\.html)', prefix, block)

    own = set(re.findall(r'id="([\w-]+)"', self_path[1])) | {"main"}
    def hashes(m):
        anchor = m.group(1)
        if anchor in own:
            return f'href="#{anchor}"'
        return f'href="{up}index.html#{anchor}"'
    block = re.sub(r'href="#([\w-]+)"', hashes, block)

    block = block.replace(' aria-current="page"', "")
    name = self_path[0].split("/")[-1]
    block = block.replace(f'href="{up}{name}"', f'href="{up}{name}" aria-current="page"', 1)
    return block


def parse_fragment(text):
    m = re.match(r"\s*<!--meta\s*(.*?)-->\s*", text, re.S)
    if not m:
        sys.exit("fragment is missing its <!--meta ... --> header")
    meta = {}
    for line in m.group(1).strip().splitlines():
        k, _, v = line.partition(":")
        meta[k.strip()] = v.strip()
    return meta, text[m.end():]


def main():
    index = (ROOT / "index.html").read_text()
    nav = slice_block(index, '<header class="nav" data-nav>', "</header>")
    footer = slice_block(index, '<footer class="footer', "</footer>")
    # The favicon is an inline SVG data URI, so it is copied rather than
    # re-typed — one wrong percent-escape and every tab loses its mark.
    favicon = re.search(r'<link rel="icon"[^>]*>', index).group(0)

    frags = sorted(FRAGS.glob("*.html"))
    if not frags:
        sys.exit(f"no fragments in {FRAGS}")

    written = []
    for f in frags:
        meta, body = parse_fragment(f.read_text())
        path = meta["path"]
        depth = path.count("/")
        up = "../" * depth
        out = ROOT / path
        out.parent.mkdir(parents=True, exist_ok=True)

        page = HEAD.format(
            title=meta["title"],
            desc=meta["desc"],
            site=SITE,
            path=path,
            up=up,
            robots='<meta name="robots" content="noindex">\n' if meta.get("noindex") else "",
            favicon=favicon,
            nav=retarget(nav, up, (path, body)),
            footer=retarget(footer, up, (path, body)),
            body=body.rstrip() + "\n",
        )
        out.write_text(page)
        written.append((path, len(page)))

    for path, size in written:
        print(f"  {path:26s} {size / 1024:5.1f} KB")
    print(f"{len(written)} pages")


if __name__ == "__main__":
    main()
