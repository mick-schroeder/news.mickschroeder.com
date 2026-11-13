# Plan: News Shuffle on the data feed

Status: built, November 2026.

## Problem

The site was built around a hand-kept list: `name`, `url` and a flat set of
title-case tags (`"News"`, `"Drudge Report"`). The feed at
`data.news.mickschroeder.com` is richer:

| Field | What the site can do with it |
| -- | -- |
| `id` | Page address `/sources/{id}/`. Stable across retire and return. |
| `title` | Display name. Use the feed's word; drop `name`. |
| `description` | One line per site. Cards and source pages finally say *what* a site is. |
| `tier` | `S`–`D`, `E` unknown, `F` misinformation. A quality dial, and a natural sort order. |
| `tags` | Ids with a `kind`: `tag` (topic), `region`, `language`, `aggregator`, `tier`. Facets, not one flat list. |

The old UI treats all tags the same, has no place for descriptions, and knows
nothing of tiers. Wiring the feed into it would look migrated. Instead,
rebuild the data layer and the three main surfaces (shuffle, source page,
directory) around the feed's shape.

## Principles

- **The feed is the model.** Use its field names and ids everywhere (`title`,
  `tier`, `tags: ["news", "irish"]`). No mapping layer, no old names.
- **Kinds drive UI.** Topics, regions, language and "seen on" are different
  things and look different. `kind` decides where a tag appears.
- **Tier is a first-class axis**, like topic. `F` sites are dropped at load
  and appear nowhere on the site. `E` sites stay.
- **Static, validated at build.** Fetch, parse with zod, fail the build on
  anything unexpected. Amplify keeps the last good deploy.
- **Presentation stays here.** Icons and Irish labels live in the site, keyed
  by tag id. The data repo stays presentation-free.
- **No compat.** New ids, new storage keys, no redirects from old URLs.

## Data layer

### Loading

`src/content.config.ts`, two collections with inline loaders:

```ts
const base = import.meta.env.DATA_URL ?? "https://data.news.mickschroeder.com"

tags:    loader: () => fetchJson(`${base}/tags.json`)
sources: loader: () => fetchJson(`${base}/sources.json`)
```

- `DATA_URL=http://localhost:4400` points dev at the data repo's `out/` (the
  `data-preview` launch entry). Keep that entry; it becomes the documented
  offline workflow.
- `src/lib/feed.ts` parses both files: `tier` an enum, `tags` plain ids
  (not `reference()`, so the client payload stays flat). It checks every tag
  id exists, ids and URLs are unique, and the list has 100+ sites (catches a
  truncated publish). Any failure throws: build fails, last deploy stays.
- A site with no `tier` or `description` yet (hand-seeded, not judged) is
  read as tier `E` with an empty description.
- Collections are `sites` and `tags`. Tags carry their feed position, since
  collections come back in id order.
- After validation the loader drops `F` sites, so no page, list or payload
  ever sees them.
- Tag `kind` is an enum. A new kind fails the build on purpose; a new tag of
  a known kind does not.

### One domain module: `src/lib/sites.ts`

Replaces `discovery.ts`, `source-pages.ts`, `catalog.ts`,
`catalog-schema.ts`, `interest-tags.ts`.

```ts
type Site = CollectionEntry<"sources">["data"]   // from the schema
type Tag  = CollectionEntry<"tags">["data"]

tiers                      // ["S","A","B","C","D","E"] with order (F dropped)
depths                     // top: S–A, known: S–B, all: S–E
filterSites(sites, { topics, regions, seenOn, depth })
pickSite(sites, history, random)
similarSites(site, sites)  // shared topic + region, nearest tier
byTier(sites)              // Map<tier, Site[]>, title order inside
```

Filter rules, the same everywhere (shuffle, bookmark, tag pages):

- Within a facet, any match (news **or** tech).
- Across facets, all must match (topic **and** region **and** seen on
  **and** depth).
- An empty facet means "any".
- `E` is only in the "Everything" depth.

### Presentation keyed by tag id: `src/lib/tag-display.ts`

```ts
{ news: { icon: Newspaper, ga: "Nuacht" }, irish: { icon: Flag, ga: "Éireannach" }, ... }
```

Missing entry → fallback icon by kind and the English `title`. A test lists
tags in the fixture that have no entry, so a new tag is a small follow-up,
never a broken nightly build.

Tier labels and blurbs (`S` "Agenda-setters", `A` "Major outlets", …) go in
`i18n/ui.ts`, both languages.

### Client payload: `/sites.json`

Built from the collection. Fields: `id`, `title`, `url`, `description`,
`tier`, `tags`. About 15 KB gzipped for 313 sites. Replaces `catalog.json`.
Tags ship inline in the island props (they're small and fixed at build).

### Storage

- `news-shuffle.preferences.v2`: `{ topics, regions, seenOn, depth }`.
- `news-shuffle.history.v2`: site **ids**, not URLs (URLs change with
  `www.`; ids don't).
- Drop v1 keys. First visit default: `topics: ["news"]`, `depth: "known"`.

## Surfaces

### Home: the shuffle

Same idea, rebuilt around the data.

- **Up-next card** shows favicon, title, host, the **description**, a tier
  chip and topic chips. The description is the hook that makes someone press
  Open.
- **Controls, four rows:**
  1. *Topics*: toggle chips (kind `tag`, minus `sponsor`).
  2. *Where*: American, British, Irish, plus Gaeilge (kind `region` +
     `language`). Empty = anywhere.
  3. *Seen on*: aggregator chips (kind `aggregator`), e.g. Techmeme only
     shuffles sites Techmeme links to. Empty = any.
  4. *Tiers*: a slider over the S–E tier letters; everything from S down
     to the thumb is in. Default B.
- No pool count: the shuffle keeps its mystery. Zero matches shows the
  empty state.
- The logo marquee (`sources-section.astro`) is built from tier S and A sites
  in the feed instead of a hand list. Delete `public/icons/sources/`.

### Source page: `/sources/{id}/`

Becomes a real page about the outlet, not a link card.

- Header: favicon, title, host, Visit.
- The description as the lead.
- Facts: tier (chip + one-line meaning, linking to the tier section of the
  directory), topics, region, language.
- **Seen on**: the aggregator tags as their own row ("Techmeme, Memeorandum,
  Drudge Report"). This is provenance: why the site is here.
- **Similar sites**: 6 from `similarSites`.
- Prev/next stays (keep `source-navigation.ts`), walking the directory order
  (tier, then title) instead of name order.
- On `/ga/` pages the description is English; mark it `lang="en"`.

### Directory: `/sources/`

The tier list. Sections S → E, each a short blurb and a dense grid of
favicon + title rows. Topic chips at the top filter in place (no JS:
render all, links to tag pages; with JS: filter client-side). This is the
page that shows off the data best and the natural home for "how tiers work".

### Tags: `/tags/` and `/tags/{id}/`

- `/tags/` groups by kind: Topics, Where, Language, Seen on.
- `/tags/{id}/` intro depends on kind ("Sites Techmeme links to" vs
  "Technology news"), then the sites **grouped by tier**. Shuffle button
  keeps working via `/tags/{id}/redirect/`.
- `popular` (kind `tier`) and `sponsor` get no page; tier has its own UI.

### About: `/about/` (new)

How the list is made: aggregators, nightly run, AI-judged once, tiers and
what they mean, retirement after three months, link to the JSON and the data
repo. Tiers and descriptions are AI-written judgments about real outlets;
this page says so plainly, and tier chips link here. It also says some
low-quality sites are left out, without naming them.

### Freshness

Footer: "313 sites · updated 12 Nov 2026", from build time and collection
size.

## Code removed

- `src/data/` (all of it), `src/pages/catalog.json.ts`
- `scripts/catalog*`, `pnpm catalog:review`, `tests/catalog-maintenance.test.ts`
- `src/components/interest-icons.ts` → folded into `tag-display.ts`
- `public/icons/sources/`
- Words: "interest(s)" → "topics"; `Website` / `Source` → `Site`; `name` →
  `title`. Rename components to match (`interest-selector` → `topic-filter`,
  `interest-badges` → `tag-chips`).
- `docs/architecture.md`: delete once this lands; the data repo README covers
  the pipeline.

## Build and deploy

- Data repo workflow: after deploy, `curl -X POST $AMPLIFY_WEBHOOK` **only if
  published `sources.json` or `tags.json` changed** (compare ETag or hash
  before upload). Quiet nights trigger nothing.
- Site build: unchanged (`pnpm check && pnpm build`), plus `DATA_URL` unset in
  Amplify.
- Tests use a small fixture (`tests/fixtures/sources.json`, `tags.json`,
  ~20 sites covering every kind and tier), never the live feed. Cover:
  filter rules, depth cutoffs, `similarSites`, history by id, schema rejects
  bad tier / unknown tag / duplicate id.

## Red team

| Risk | What happens | Verdict |
| -- | -- | -- |
| Feed down at build time | Fetch throws, build fails. | Fine. Amplify keeps the last deploy. A code push that day fails too; retry later. |
| Feed publishes a broken or tiny list | Zod or the minimum-count check fails the build. | Fixed. |
| New tag added in data repo | Builds with fallback icon and English label. | Accepted. Test output names it; add display entry. |
| New tag kind | Build fails. | On purpose: a kind needs a UI decision. |
| Site retired | Its page disappears on next build; 404. | Accepted (no compat). It comes back with the same id if relisted. |
| Ids are page URLs | Data repo's "lock down ids" TODO must be done before launch. | Blocker. Do it first. |
| Publicly labelling outlets "F" | Reputational / legal exposure for an AI judgment. | Fixed. F sites are dropped at load; no page, list or label. |
| A site drops to F | Its page disappears on the next build. | Accepted, same as retirement. |
| Descriptions are English only | Irish pages mix languages. | Accepted, marked `lang="en"`. |
| Favicons from Google | Some are blank or generic. | Accepted; fallback icon. Same as today. |
| Nightly builds change prev/next and similar sites | Pages shift slightly day to day. | Accepted; that's the point of a live list. |

## Steps

1. Data repo: lock ids; add the Amplify webhook (changed-only).
2. Data layer: `content.config.ts`, `sites.ts`, `tag-display.ts`, fixtures
   and tests. Delete `src/data/` and the catalog scripts.
3. Home: new up-next card, four-row controls, pool count, v2 storage,
   `/sites.json`, data-driven marquee. Bookmark and redirects on the new
   filter.
4. Source page: description, facts, seen on, similar, new prev/next order.
5. Directory as tier list; tag index by kind; tag pages grouped by tier.
6. About page and footer freshness. Irish strings for everything new.
7. Clean up: renames, delete `architecture.md`, README "Develop" section with
   `DATA_URL`, drop the dead TODO items in the data repo.

## Decided

- `F`: left out of the site entirely.
- `E`: kept; shown on pages and in the directory, shuffled only at
  "Everything" depth.
- "New this week" badges: not now.

- "Seen on": a fourth filter row on home, alongside the aggregator tag pages.
