#!/usr/bin/env python3
"""Write the six case-study fragments.

    python3 tools/build_cases.py && python3 tools/build_pages.py

Six pages that differ only in their content are six chances for one of them
to drift — a stale pager, a missing meta row, a swatch list that lost its
last colour. So the shared shape lives here once and the prose lives in
CASES, and the pager is derived from ORDER rather than typed six times.

Every one of these is a **concept**: self-directed, no client, no brief from
anyone but me. The pages say so in three places (the eyebrow, the meta row,
and the closing note) because a portfolio that blurs that line is lying.
"""
import html
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "tools" / "fragments"

ORDER = ["botanica", "borough", "kettle", "sunday", "meridian", "northline"]

CASES = {
    "botanica": dict(
        name="Botanica",
        business="Floral studio",
        title="Flowers that keep the season",
        desc="A concept site for a floral studio, built so the week's actual stems lead and ordering follows.",
        lead="A floral studio whose stock changes every week. The design problem is that the "
             "thing worth showing is also the thing that goes out of date fastest.",
        w=800, h=1816,
        swatches=["#A8BA9F", "#263A2A", "#5F2A19", "#1C2A20"],
        type_="Fraunces for display, Archivo for text",
        palette="Sage ground, deep green, clay",
        premise="A small floral studio taking weddings, weekly arrangements and walk-in stems. "
                "The kind of business whose Instagram is excellent and whose website is a form "
                "from 2016.",
        problem="Most florist sites open with a stock photograph of roses and bury what is "
                "actually in the bucket this week. But seasonality is the whole argument for "
                "buying from a studio instead of a supermarket — and it is the one thing a "
                "template cannot hold, because it changes every seven days.",
        approach=[
            ("Put the week first",
             "The page opens on what is in the studio right now, not on a hero image that will "
             "be true all year. That single decision reorders everything below it: ordering "
             "follows the stems rather than leading them, and the seasonal claim is "
             "demonstrated instead of asserted."),
            ("A serif that can be soft without being fussy",
             "Fraunces in italic carries the display type. It has the warmth the subject wants "
             "and enough structure not to tip into wedding-invitation pastiche, which is the "
             "failure mode for every florist brand."),
            ("Green as ink, not as decoration",
             "The deep green is used for type and rules rather than as a background wash, so it "
             "reads as the studio's colour rather than as a theme applied over the top. Brass "
             "does the small accents."),
            ("Weddings kept separate",
             "Wedding work is a different sale with a different timeline, so it gets its own "
             "section rather than being mixed into the weekly list — one visitor is buying in "
             "ten minutes and the other in ten months."),
        ],
        note="The seasonal block is the part that would need a real content plan behind it. A "
             "page that promises this week's flowers and shows last month's is worse than one "
             "that never promised.",
    ),
    "borough": dict(
        name="Borough Barber",
        business="Barber shop",
        title="Precision grooming",
        desc="A concept site for a barber shop, built around the two things people actually arrive wanting: the price and the next free chair.",
        lead="A four-chair barber shop. Everyone arriving at the site wants one of two things, "
             "and most shop sites make you hunt for both.",
        w=800, h=1576,
        swatches=["#121212", "#D8913A", "#E8E4DC", "#3A3A3A"],
        type_="Oswald condensed for display, Archivo for text",
        palette="Near-black ground, amber, bone",
        premise="An appointment-and-walk-in barber shop with four chairs and a regular clientele. "
                "Not a luxury grooming lounge — a good shop that is busy.",
        problem="Barber sites tend to open with atmosphere: a slow video of clippers, a paragraph "
                "about craft. The two questions people actually have are what it costs and when "
                "they can get in, and both are usually three clicks deep behind the mood.",
        approach=[
            ("Prices and availability above the fold",
             "The service list with prices sits at the top of the page, not on a separate menu "
             "page. Booking and walk-in status sit beside it. The atmosphere still exists — it "
             "is just doing its job underneath the answer rather than in front of it."),
            ("Condensed type because the list is the layout",
             "Oswald sets long service names in a narrow column without wrapping, which is what "
             "lets a price list stay a list rather than becoming a table. A wider face would "
             "have forced either smaller type or fewer words."),
            ("Amber on near-black, and only amber",
             "One accent, used for prices, booking and nothing else — so the eye learns in about "
             "two seconds that amber means 'this is the actionable part'."),
            ("Named chairs, not stock faces",
             "The team section names the four barbers rather than showing generic portraits. In "
             "a shop this size people book a person, not a business."),
        ],
        note="The dark ground was the hardest part to keep readable. Every text value on the "
             "page was measured against the darkest patch it actually sits on rather than "
             "against the nominal background colour.",
    ),
    "kettle": dict(
        name="Kettle &amp; Co",
        business="Coffee roaster",
        title="Roasted the morning it ships",
        desc="A concept site for a coffee roaster, built so the roast date is the product story rather than a detail on the bag.",
        lead="A small-batch roaster selling bags and subscriptions. The freshness claim is the "
             "whole product, so the design had to make it visible rather than state it.",
        w=800, h=1708,
        swatches=["#2A1F19", "#E7E1D6", "#E0A46B", "#6B351D"],
        type_="Instrument Serif for display, Archivo for text",
        palette="Espresso ground, sand, copper",
        premise="A roaster shipping direct to customers, competing with supermarket coffee on "
                "one axis: how recently it was roasted.",
        problem="Every roaster says 'freshly roasted'. The phrase has been worn smooth. Saying it "
                "louder does not help — the claim has to become something a visitor can see and "
                "check, or it reads as marketing copy like everyone else's.",
        approach=[
            ("Roast date as a structural element",
             "The date is not a line in the product description; it is part of how each coffee is "
             "presented, alongside origin and process. Once it sits at that level, the "
             "subscription pitch stops being a discount offer and becomes a logistics argument — "
             "the only way to always have coffee this fresh is to have it sent."),
            ("A serif with a real voice",
             "Instrument Serif has the editorial quality the subject wants, and it is distinctive "
             "enough that the page does not read as another minimal shop template."),
            ("Rust that had to darken",
             "The obvious accent for the palette measured 4.87:1 against its own ink — under the "
             "readable floor. Darkening it to #6B351D kept the character and cleared the bar. "
             "This is the kind of thing that only shows up if you measure the rendered page "
             "rather than trusting the swatch."),
            ("Subscription framed as a cadence",
             "'Every other Monday' rather than 'save 10%'. The former describes a habit, which is "
             "what a subscription actually is; the latter competes on price, which a small "
             "roaster loses."),
        ],
        note="Of the six, this is the one whose argument depends most on real operational data. "
             "Without genuine roast dates flowing into the page, the whole structure is theatre.",
    ),
    "sunday": dict(
        name="Sunday Bakehouse",
        business="Bakery",
        title="Bread worth getting up for",
        desc="A concept site for a bakery that sells out by noon, built around pre-order and a daily bake schedule.",
        lead="A bakery whose best products are gone by lunchtime. Scarcity is real here, which "
             "makes it a design opportunity rather than a marketing trick.",
        w=800, h=1612,
        swatches=["#F2C14E", "#C8501E", "#2E1B12", "#F8F1E8"],
        type_="Bricolage Grotesque throughout",
        palette="Butter yellow, terracotta, dark cocoa",
        premise="A neighbourhood bakery with a daily bake list, a Saturday pre-order, and a "
                "sideline in classes.",
        problem="The frustrating experience for a customer is arriving at eleven to find the "
                "sourdough gone. The frustrating experience for the bakery is throwing away what "
                "did not sell. Both are the same information problem, and a static 'our products' "
                "page solves neither.",
        approach=[
            ("A schedule, not a catalogue",
             "The product section is organised by when things come out of the oven and roughly "
             "when they run out. That turns browsing into planning, which is the behaviour the "
             "bakery actually wants."),
            ("Pre-order as the primary action",
             "One button, repeated at each decision point, doing the same thing. Pre-order is "
             "better for the customer and better for waste, so it earns the primary position "
             "rather than sharing it with a newsletter signup."),
            ("Blocks of colour instead of photographs",
             "Butter yellow and terracotta laid in large flat fields carry the warmth, so the "
             "layout does not depend on having twelve excellent food photographs — which a "
             "bakery this size will not have and cannot fake."),
            ("One typeface, worked hard",
             "Bricolage Grotesque covers display and text. Its variable width lets headlines get "
             "genuinely large without a second face, which keeps the page feeling like one voice."),
        ],
        note="The yellow is the loudest ground of the six. Every value on it was checked against "
             "the darkest textured patch rather than the flat colour, which is a meaningfully "
             "different number.",
    ),
    "meridian": dict(
        name="Meridian",
        business="Architecture studio",
        title="Buildings that sit quietly in their place",
        desc="A concept site for an architecture practice taking four projects a year, where restraint is the argument.",
        lead="A practice that takes four projects a year. For this client the temptation is to "
             "show everything; the correct move is to show almost nothing.",
        w=800, h=1597,
        swatches=["#8FA3B0", "#E4E2DC", "#0F1518", "#B9C4CB"],
        type_="Archivo only, at four weights",
        palette="Slate blue-grey, cream, near-black",
        premise="A small architecture studio whose work is residential, considered, and slow. "
                "Prospective clients are choosing on judgement, not on volume.",
        problem="Architecture sites default to a full-bleed slideshow of the best three buildings. "
                "It looks impressive and says nothing about how the practice thinks — which is "
                "the only thing a client is actually assessing when they are about to hand over "
                "two years and a large budget.",
        approach=[
            ("A visible column grid",
             "The layout shows its own structure: consistent columns, visible alignment, generous "
             "margins that do not collapse. For this practice the grid is the portfolio — a "
             "studio that cannot hold a grid on a web page is not going to hold one in a building."),
            ("Four projects, indexed rather than paraded",
             "The work section is a quiet index with dates and locations, not a carousel. If you "
             "only do four projects a year, listing them plainly is more convincing than "
             "animating them."),
            ("One typeface, no decoration",
             "Archivo alone, at four weights. There is no ornament anywhere on the page. The "
             "restraint is the message, and any flourish would undercut it."),
            ("Slate rather than white",
             "A cool blue-grey ground instead of the gallery white every practice uses. It reads "
             "as considered rather than default, and it is where this site's own cream palette "
             "originally came from."),
        ],
        note="This is the concept the main site borrowed its colour from — #E4E2DC, the cream "
             "you are reading this on, is Meridian's card value.",
    ),
    "northline": dict(
        name="Northline Cycles",
        business="Bike shop",
        title="Tuned by people who ride it",
        desc="A concept site for a bike shop and workshop, where the service menu is written as a spec sheet.",
        lead="A bike shop that makes most of its money in the workshop, not on the shop floor. "
             "The site had to reflect that split honestly.",
        w=800, h=1435,
        swatches=["#171C1F", "#C6F04B", "#E6EAEC", "#2A3338"],
        type_="IBM Plex Mono for specs, Archivo for text",
        palette="Slate near-black, lime, pale grey",
        premise="A workshop-led bike shop: servicing, wheel builds, fitting, and a smaller retail "
                "side. Customers are riders who know what they want done.",
        problem="Bike shop sites usually sell bikes and hide the workshop, when the workshop is "
                "the recurring revenue and the reason people come back. And the audience is "
                "technical — vague service descriptions read as evasive to someone who knows what "
                "a bottom bracket is.",
        approach=[
            ("The service menu as a spec readout",
             "IBM Plex Mono sets the workshop list: job, what is included, turnaround, price, in "
             "aligned columns. Monospace is doing real work here rather than signalling "
             "'technical' — it is what makes the figures line up down the column so the list can "
             "be scanned rather than read."),
            ("Turnaround stated, not implied",
             "Same-week is the promise, so it appears next to every job rather than in a "
             "paragraph further down. For a commuter deciding whether to drop a bike off, that "
             "is the entire decision."),
            ("Lime on slate, used sparingly",
             "One high-energy accent against a near-black ground, restricted to actions and "
             "figures. Enough to feel like a workshop, restrained enough not to feel like an "
             "energy drink."),
            ("Retail underneath, not removed",
             "Bikes and parts still have a place — below the workshop, because that reflects both "
             "the business and what visitors came for."),
        ],
        note="The mono column alignment is the load-bearing detail. Set that list in a "
             "proportional face and it stops being a spec sheet and becomes a paragraph with "
             "prices in it.",
    ),
}

TEMPLATE = """<!--meta
path: work/{slug}.html
title: {name} — concept case study
desc: {desc}
-->
  <section class="page-head shell" data-formation="sphere">
    <p class="label">Concept &middot; {business}</p>
    <h1 class="h1 page-head__title">{title}</h1>
    <p class="page-head__lead">{lead}</p>
  </section>

  <section class="section section--tight-top shell" data-formation="sphere">
    <div class="prose">
      <dl class="case__meta">
        <div>
          <dt>Type</dt>
          <dd>Concept &mdash; self-directed</dd>
        </div>
        <div>
          <dt>Sector</dt>
          <dd>{business}</dd>
        </div>
        <div>
          <dt>Typeface</dt>
          <dd>{type_}</dd>
        </div>
        <div>
          <dt>Palette</dt>
          <dd>
            <ul class="case__swatches">{swatches}
            </ul>
            {palette}
          </dd>
        </div>
      </dl>

      <h2>The premise</h2>
      <p>{premise}</p>

      <h2>The problem</h2>
      <p>{problem}</p>

      <h2>The approach</h2>
{approach}

      <h2>What I would want before building it for real</h2>
      <p>{note}</p>
    </div>
  </section>

  <section class="section shell" data-formation="sphere">
    <figure class="case__figure">
      <a href="../concepts/{slug}.html">
        <img class="case__shot" src="../assets/img/work-{slug}.webp" width="{w}" height="{h}"
             alt="{name} concept site design, full page." loading="lazy" decoding="async">
      </a>
      <figcaption class="case__caption">
        The full page. <a class="link-underline" href="../concepts/{slug}.html">Open the live concept</a>
      </figcaption>
    </figure>

    <div class="prose">
      <div class="prose__note">
        <p><strong>This is a concept, not client work.</strong> {name} is not a real business.
          The site was designed and built end to end to work through a specific problem, and it is
          shown here as design thinking rather than as a job I was hired to do.</p>
      </div>

      <nav class="pager" aria-label="More concepts">
        <a href="{prev_slug}.html">
          <span class="pager__dir">Previous</span>
          <span class="pager__name">{prev_name}</span>
        </a>
        <a href="{next_slug}.html">
          <span class="pager__dir">Next</span>
          <span class="pager__name">{next_name}</span>
        </a>
      </nav>
    </div>
  </section>
"""


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for i, slug in enumerate(ORDER):
        c = CASES[slug]
        prev_slug = ORDER[(i - 1) % len(ORDER)]
        next_slug = ORDER[(i + 1) % len(ORDER)]

        swatches = "".join(
            f'\n              <li style="background: {s};"'
            f' title="{s}"><span class="u-visually-hidden">{s}</span></li>'
            for s in c["swatches"]
        )
        approach = "\n".join(
            f"      <h3>{h}</h3>\n      <p>{b}</p>" for h, b in c["approach"]
        )

        (OUT / f"work-{slug}.html").write_text(TEMPLATE.format(
            slug=slug, name=c["name"], business=c["business"], title=c["title"],
            desc=html.escape(c["desc"], quote=True), lead=c["lead"], w=c["w"], h=c["h"],
            type_=c["type_"], palette=c["palette"], swatches=swatches,
            premise=c["premise"], problem=c["problem"], approach=approach, note=c["note"],
            prev_slug=prev_slug, prev_name=CASES[prev_slug]["name"],
            next_slug=next_slug, next_name=CASES[next_slug]["name"],
        ))
        print(f"  work-{slug}.html")
    print(f"{len(ORDER)} case fragments")


if __name__ == "__main__":
    main()
