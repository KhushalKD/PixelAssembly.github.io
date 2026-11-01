# Pixel Assembly — website

A five-page marketing site for a full-service IT and creative studio: custom software,
websites, video editing, graphic design, paid ads and social media management.

Plain HTML, CSS and JavaScript. No build step, no framework, no npm install —
open the files or drop the folder on any host.

---

## Run it locally

Any static server works. With Node installed:

```bash
npx --yes serve . -l 5173
```

Then open <http://localhost:5173>.

Opening `index.html` straight from the filesystem mostly works, but a server is
better — some browsers block the web fonts and the 404 page over `file://`.

---

## Files

```
index.html          Home — hero, services ledger, stats, process, selected work
services.html       Six service sections, engagement models, FAQ
work.html           Filterable project grid
about.html          Studio story, rotating value cube, timeline
contact.html        Enquiry form + direct contact details
404.html            Not found

assets/css/styles.css    Everything visual. Design tokens at the top.
assets/js/main.js        Nav, reveal, counters, hero relief, tilt, filters, form
assets/img/favicon.svg

robots.txt
sitemap.xml
.claude/launch.json      Dev-server config for the editor preview. Safe to delete.
```

Header and footer markup is repeated in each page — that is the trade-off for having
no build step. Change one, change all five (six with `404.html`).

---

## Before you launch — checklist

Real and confirmed: email `info.pixelassembly@gmail.com`, phone `+91 86101 58290`,
"Chennai, India — working worldwide", a 48-hour reply promise, the Instagram handle
(`instagram.com/pixel.assembly_`), a 2023–2026 studio timeline, and the ten
projects on `work.html` — those are real builds, though the wording describing them was
drafted here and should be read before launch. Everything in the table below is still
placeholder. Search for the marker in the third column.

| What | Where | Marker |
|---|---|---|
| Domain `pixelassembly.studio` (13 places) | canonical + OG tags, `robots.txt`, `sitemap.xml` | `pixelassembly.studio` |
| Stat figures (70+, 5, 4.9/5, 86%) | `index.html`, `work.html` | `PLACEHOLDER FIGURES` |
| No project carries an outcome line | `work.html` | `card__out` |
| The testimonial | `index.html` | `PLACEHOLDER TESTIMONIAL` |
| The four timeline stories (years are right) | `about.html` | `PLACEHOLDER TIMELINE` |
| Tools claimed per service | `services.html` | `class="chip"` |
| Working hours | all footers, `contact.html` | `10:00–19:00 IST` |

**Do not ship the invented numbers or the testimonial as fact.** They are there to show
the layout. Replace them with real ones or delete those blocks.

Every filter on the work page matches at least one project, and it has to stay that way
— a filter that matches nothing is a broken button. Each card declares its disciplines
in `data-cat` (space separated, e.g. `data-cat="video social"`); add or remove a filter in
`#workFilters` in the same change as the project it belongs to. The home page shows three
of the same builds, so keep those in step too.

The grid is twelve columns: a plain card spans 4, `.work__item--half` spans 6 and
`.work__item--wide` spans 8. Inserting a card without checking the row still adds up to
twelve is what leaves a gap at the end of a row — three recent builds at 6 + 6 + 8 is
what left four empty columns on the home page. A card's figure ratio is set on the
figure, not by its span, so a 4-column card can still carry a 16/10 image.

The budget field is a free text input on purpose, not a set of brackets: asking someone
to pick a band makes them anchor low or close the tab. It posts under the same `budget`
name, so the Apps Script is unaffected. There is now no `<select>` anywhere on the site,
which leaves the `.field select` chevron rule unused but ready if one comes back.

### The footer grid

Twelve columns again, and the spans have to total twelve: brand 3, services 2, studio
2, get in touch 3 (`.ftr__col--wide`), where and when 2. The contact column is the wide
one because `info.pixelassembly@gmail.com` renders at about 207px and two tracks only buy
137px at 1081px, the narrowest width this layout runs at — the address used to run 67px
past its own column, further than the gutter, and land on top of the next one. Footer
links also carry `overflow-wrap: anywhere` so a long string wraps instead of escaping.
Below 880px the columns pair up, and below 560px they stack one per row.

The oversized wordmark under them is sized in `cqw` against the footer measure, not in
`vw` against the viewport, so it fills the column exactly at any width instead of
capping out and leaving a hole on the right. `.ftr .container` is the query container.
If you change the word, retune the coefficient: it is the content width divided by the
rendered width of the text per 1px of font-size.

### Project images

The project cards use flat inline SVG compositions rather than photographs, so the site
ships with zero image assets. To use real screenshots instead, replace the `<svg>` inside
each `<figure class="card__fig">` with:

```html
<img src="assets/img/project-name.jpg" alt="Describe what the screenshot shows"
     width="800" height="600" loading="lazy">
```

The figure already crops to the right aspect ratio.

---

## The contact form

The form posts to a Google Apps Script web app, which emails the enquiry to
`info.pixelassembly@gmail.com`. The script lives in `apps-script/Code.gs`; its deploy
steps are in the comment at the top of that file. The live URL is set as `ENDPOINT` in
`assets/js/main.js`.

Fields sent: `name`, `email`, `company`, `budget`, `services` (repeated for each ticked
box), `message`, and `website` — the honeypot, which must always arrive empty.

**Two things that will break it if you change them.**

The client posts `new URLSearchParams(...)`, not the `FormData` object. That matters
twice over: it sends `application/x-www-form-urlencoded`, which keeps the request inside
the CORS "simple request" rules so no preflight is sent — Apps Script cannot answer a
preflight — and it is the only body format Apps Script actually parses into
`e.parameter`. Post `FormData` and the script receives an empty object; post JSON and the
browser never completes the request at all.

And after any edit to `Code.gs` you must redeploy as **Manage deployments → edit → New
version**. Saving alone leaves the old code serving on the same URL.

If the endpoint is ever unreachable the visitor sees a message pointing them at the email
address. Blank out `ENDPOINT` and the form falls back to opening their mail client with
everything pre-filled.

To check the deployment is alive, open the `/exec` URL in a browser — it answers
`{"ok":true,...}` to a GET.

### Spam

The honeypot is a text input moved off-screen with `.hp` (not `display:none`, which some
bots know to skip) and taken out of the tab order. Anything that fills it gets a success
response and no email. If spam still gets through, add a timestamp check or reCAPTCHA in
`doPost` — the validation block is the place for it.

---

## Design system

Tokens live in `:root` at the top of `styles.css`. Change them there, not in the pages.

| Token | Value | Used for |
|---|---|---|
| `--paper` | `#EFEBE3` | page background |
| `--paper-2` / `--paper-3` | `#E6E1D7` / `#DCD6C9` | panels, figure backgrounds |
| `--ink` | `#16140F` | body text, borders, dark sections |
| `--ink-soft` / `--ink-mute` | `#55504A` / `#6E675E` | secondary text, labels |
| `--flame` | `#D9380F` | the accent as a **fill** — buttons, bands, rules, marks |
| `--flame-text` | per surface | the accent as **type**; never use `--flame` for text |
| `--cobalt` | `#1C3C8C` | secondary accent in illustrations |

Type is **Archivo** for everything and **DM Mono** for labels, eyebrows and metadata,
both from Google Fonts.

Two deliberate constraints, worth keeping if you extend the site:

- **No colour-fade gradients.** Depth comes from flat shades, hard offset shadows
  (`box-shadow: 6px 6px 0`) and real 3D transforms. Dot fields and the paper grain are
  patterns, not gradients.
- **One accent colour.** Vermilion does the work. Adding a second accent is what makes
  a layout start to look generic.

### Contrast

Everything is kept at 4.5:1 or better against its own backdrop. Three rules keep it there:

- **`--flame` is a fill, never type.** As text it only reaches 3.9:1 on paper. Type uses
  `--flame-text`, which is redefined per surface — darker on paper, lighter on ink — so
  `color: var(--flame-text)` adapts by itself, including on light cards inside `.inv`.
- **Nothing on the flame CTA band can be tinted.** Pure white on `#D9380F` is already
  only 4.6:1, so any `rgba(255,255,255,.8)` fails. Hierarchy there comes from size and
  weight instead.
- **The footer carries `.inv`.** It is a dark surface, so it needs the dark-surface text
  colours; without that class `.soft` rendered at 2.3:1 on it.

The one deliberate exception is `.ftr__word`, the oversized wordmark watermark. It is
`aria-hidden`, carries no information, and is meant to be barely there.

### Five things that will bite you

**Light cards inside a dark section.** `.inv` sets `color: var(--paper)` on the whole
section. Anything you drop inside it with a light background — a pricing card, a cube
face, a panel — inherits that and renders paper-on-paper, i.e. invisible. Headings go
first, because body text usually has its own explicit colour. Always set `color: var(--ink)`
on the component itself, and put the dark-variant overrides *after* the base rules, since
several of them tie on specificity.

**Inline `grid-column` on mobile.** The CTA bands, the contact layout and a couple of
editorial blocks position their children with `style="grid-column:1/8"`. Inline styles
beat the stylesheet, so the mobile breakpoint collapses them with
`.grid > * { grid-column: 1 / -1 !important; }`. Without it the 12-track grid survives at
phone width, each track collapses to about 11px and the content overflows the viewport.
If you add a new section with inline grid placement, it is already covered — but check
`document.documentElement.scrollWidth === clientWidth` at 390px before you ship.

**A bare element selector beating a component class.** `.nav a` is two classes' worth of
specificity; `.btn` is one. The header CTA is an `<a class="btn">`, so `.nav a` silently
overrode its padding, and `.nav a:hover` overrode its colour too — painting the label
ink-on-ink so it vanished the moment you hovered. Every nav rule is now
`.nav a:not(.btn)`. If you add another component inside a container that styles bare
elements, scope the container's rules the same way rather than piling on overrides.

**Positioning a decoration against the wrong box.** The select chevron was an `::after`
on `.field`, which wraps the label, the control *and* the error slot — so it sat below
the control instead of inside it. It is a `background-image` on the `<select>` now.
Anything that has to sit inside a control belongs to that control.

**A grouping property flattening a 3D context.** `opacity`, `overflow`, `filter` and the
rest force an element to render as one flattened plane, which silently kills
`transform-style: preserve-3d` on it and everything inside. It has bitten this project
twice: an `opacity` keyframe on the old hero made every side face vanish, and an
`overflow: hidden` on `.card` — which *is* the `.tilt__in` — turned each project card's
tilt into a flat skew. Both times the computed styles looked perfectly correct. Fade or
clip a wrapper that sits outside the 3D context instead. This still applies to the tilt
cards and the value cube; the hero sidesteps it entirely by being a canvas.

---

## The 3D pieces

Three of them. The hero is a canvas; the other two are pure CSS transforms. No WebGL,
no library.

**Pixel relief** (`index.html` hero). A 14x12 board of cubes that rises into the things a
client actually ends up with — their website, their brand, their feed, an edit, a
campaign and the build underneath — then re-forms into the next one. Nothing in the
drawing is labelled: a play triangle over a timeline reads as video, a 3x3 grid reads as
a feed. The figure caption names each one; the artwork never does.

To change a figure, edit its map in `ASM_SHAPES` at the top of `main.js`:

```js
{ cap: "the website", map: [
  "##############",      //  .  recessed   -  inset panel   o  surface
  "oooooooooooooo",      //  #  ink        F  flame         c  cobalt
  "oFooooooo###oo",
  ...
```

Each character picks a colour from `ASM_TONE` and a height from `ASM_H`. Every row must
be exactly as long as every other row, in every map, or the board tears. To add a seventh
figure, push another `{ cap, map }` — the cycle, the captions and the morph all follow
from the array. Sizing follows from one number: `main.js` fits a cell width to the stage
and everything else is derived, so there is nothing to rebuild on resize.

**Why a canvas, and why the board stands up.** A morph moves all 168 cells on every
frame; in CSS that is 168 style writes per frame plus the browser guessing at depth order
between them. And a grid laid flat like a floor foreshortens the pixels into mush and
lets tall cells hide the rows behind them — so the board faces the viewer instead, and
each pixel extrudes toward the camera. Every extrusion is parallel, so a cell can only
ever clip a sliver of its neighbour, which is exactly the part that reads as depth. Three
faces are ever visible: the front, the top, and the left flank.

> **If you edit this:** a figure changes by sinking into the board and rising back out,
> and each cell's colour switches at the bottom of that dip — cross-fading one flat fill
> into another only makes mud. Cells that two figures share never move at all, which is
> what makes a change read as a rebuild rather than a cut. The caption waits for the
> halfway point, or it would name the incoming figure while the board still shows the
> outgoing one. And the loop stops dead when the hero leaves the viewport: a canvas
> painting away behind the fold is pure battery.

**Tilt cards** (`services.html`). Each `.tilt` wrapper rotates its `.tilt__in` toward the
pointer. `data-tilt="10"` sets the maximum angle in degrees. Children with `.tilt__pop`
sit forward on the Z axis so they lift off the card as it turns.

**Value cube** (`about.html`). A six-faced cube on a 26-second rotation, paused on hover
or keyboard focus. Each face is ordinary HTML, so the text stays selectable and the whole
thing carries an `aria-label` describing all six principles for screen readers.

All three are disabled or frozen under `prefers-reduced-motion: reduce`, and the pointer
interactions are skipped on touch devices.

---

## Accessibility

Semantic landmarks, skip link, visible focus rings, `aria-current` on the active nav item,
labelled form fields with live error messages, `aria-expanded` on the menu and accordion,
and a full `prefers-reduced-motion` path. Decorative SVG is `aria-hidden`; the 3D cube
carries a text alternative.

Worth re-checking after you swap in real content: colour contrast on any new colour pairs,
and `alt` text on project images.

---

## Deploying

It is a static folder, so anything works:

- **Netlify / Vercel / Cloudflare Pages** — drag the folder in, or connect a repo. No
  build command, publish directory `.`.
- **GitHub Pages** — push to a repo, enable Pages on the branch root.
- **Any shared host** — upload over FTP.

The `404.html` is picked up automatically by Netlify, Vercel, Cloudflare and GitHub Pages.
On Apache add `ErrorDocument 404 /404.html`; on nginx, `error_page 404 /404.html;`.

After deploying, update the domain in `sitemap.xml`, `robots.txt` and every page's
`<link rel="canonical">`, then submit the sitemap in Google Search Console.
