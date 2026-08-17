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
import hashlib
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from siteinfo import CANONICAL as SITE      # noqa: E402  one definition, tools/siteinfo.py

ROOT = pathlib.Path(__file__).resolve().parent.parent
FRAGS = ROOT / "tools" / "fragments"

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
<meta property="og:image" content="{site}/assets/og/{og}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="{site}/{path}">
{robots}
{favicon}

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&display=swap">
<link rel="stylesheet" href="{up}assets/css/styles.css?v={css_v}">
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
<script src="{up}assets/js/particles.js?v={particles_v}" defer></script>
<script src="{up}assets/js/main.js?v={main_v}" defer></script>
</body>
</html>
"""


def token(rel):
    """Content hash for an asset URL.

    **Not optional.** vercel.json serves /assets/* as `immutable,
    max-age=31536000`, so an unversioned `assets/css/styles.css` is cached by
    every visitor's browser for a year and will not be re-checked. The first
    build of these pages shipped without it: the home page pointed at a
    stamped URL and refreshed correctly while every generated page kept
    serving a year-old stylesheet from disk cache, which looked exactly like
    a CSS bug that would not reproduce. Same 8-hex scheme as serve.py.
    """
    return hashlib.md5((ROOT / rel).read_bytes()).hexdigest()[:8]


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
    # root-level pages, which a case study reaches with ../
    block = re.sub(
        r'\b(href)="((?:services|pricing|products|privacy|terms)\.html)', prefix, block)

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


def sync_index_origin():
    """Point index.html's own og:url / og:image / canonical at CANONICAL.

    index.html is the *source* this script reads, not one of its outputs, so
    it does not get the generated <head> and its three absolute URLs were
    hand-maintained. That split shipped wrong twice: on both origin moves the
    eleven generated pages corrected themselves the moment CANONICAL changed
    and the home page silently did not, leaving the site's most-linked page
    canonicalised to a dead host. Cheap to just do it here.
    """
    path = ROOT / "index.html"
    html = original = path.read_text()
    html = re.sub(r'(<meta property="og:url" content=")https?://[^/"]+',
                  rf"\g<1>{SITE}", html)
    html = re.sub(r'(<meta property="og:image" content=")https?://[^/"]+',
                  rf"\g<1>{SITE}", html)
    html = re.sub(r'(<link rel="canonical" href=")https?://[^/"]+',
                  rf"\g<1>{SITE}", html)
    if html != original:
        path.write_text(html)
        return True
    return False


def main():
    if sync_index_origin():
        print(f"  index.html      -> {SITE} (og:url, og:image, canonical)")
    index = (ROOT / "index.html").read_text()
    nav = slice_block(index, '<header class="nav" data-nav>', "</header>")
    footer = slice_block(index, '<footer class="footer', "</footer>")
    # The favicon is an inline SVG data URI, so it is copied rather than
    # re-typed — one wrong percent-escape and every tab loses its mark.
    favicon = re.search(r'<link rel="icon"[^>]*>', index).group(0)

    versions = {
        "css_v": token("assets/css/styles.css"),
        "main_v": token("assets/js/main.js"),
        "particles_v": token("assets/js/particles.js"),
    }

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
            og=meta.get("og", path.replace("/", "-").replace(".html", "")),
            robots='<meta name="robots" content="noindex">\n' if meta.get("noindex") else "",
            favicon=favicon,
            nav=retarget(nav, up, (path, body)),
            footer=retarget(footer, up, (path, body)),
            body=body.rstrip() + "\n",
            **versions,
        )
        out.write_text(page)
        written.append((path, len(page)))

    for path, size in written:
        print(f"  {path:26s} {size / 1024:5.1f} KB")
    print(f"{len(written)} pages   css={versions['css_v']} "
          f"main={versions['main_v']} particles={versions['particles_v']}")


if __name__ == "__main__":
    main()
