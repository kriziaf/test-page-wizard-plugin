# Implementation Plan: Page Builder v0.1.1

**Branch**: `001-page-builder-v0-1-1` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-page-builder-v0-1-1/spec.md`

## Summary

Bring the existing v0.1 prototype in line with the spec: four page types, a paste-in text brief, a working Add section, the thirteen documented patterns registered from a folder of SVGs, and a Generate step that stacks those SVGs into a mock page and exports it as standalone HTML. Figma export is shown as v2 only.

## Technical Context

**Language/Version**: TypeScript, React (existing prototype)

**Primary Dependencies**: Vite, Tailwind, lucide-react, Radix/shadcn UI primitives (all already in the repo); no new dependency planned

**Storage**: None. State lives in the app component for the session

**Testing**: Manual walkthrough against the spec's acceptance scenarios for v0.1.1. Automated tests deferred [NEEDS CLARIFICATION: is a test setup wanted before v0.2?]

**Target Platform**: Current desktop browsers; exported HTML opens standalone

**Project Type**: Single-page web app (originated as a Figma Make export)

**Performance Goals**: Generate and export feel instant for pages of up to about 10 sections

**Constraints**: Exported HTML makes no external requests (inline SVG, minimal inline CSS)

**Scale/Scope**: Four page types, nine patterns, one user, one session

## Constitution Check

No constitution file for this project yet. Working rules for now, taken from the spec: keep prototype behavior that is not listed in the spec unchanged; mock components are demonstration only; no Figma work in v0.1.1.

## Design Decisions

Carried over from the former ADR log. Rationale and alternatives are in [research.md](./research.md).

| Decision | Outcome |
|----------|---------|
| Structure | Plugin orchestrates four skills (intake, architecture, customize, generate). v0.1.1 ships it as the single prototype UI |
| Page types | Business Page, Article, Blog, Services. Bio removed. Search Results deferred |
| Output | v1 HTML export of a mock page. v2 Figma via Figma MCP |
| Pattern registry | A folder of SVGs is the registry. The file name is the pattern and variant |
| Mock rendering | The mock page stacks static SVGs (option A). No coded mock components, no text swapping in v0.1.1 |
| Brief input | Paste-brief control opens a text area; no auto-fill of fields in v0.1.1 |

## Pattern Registry (new)

Source of truth for pattern names, variants, and guidance: `src/app/patterns/README.md`. Drawings live beside it as `{pattern}--{variant}.svg`, one file per variant, all drawn by the project owner. Variant names come from the pattern documentation; where it lists none (the card patterns), the name describes the drawing.

| Pattern | SVG files (`{pattern}--{variant}.svg`) |
|---------|----------------------------------------|
| overview-cards | `stacked-right`, `grid-3-up`, `grid-2-up` |
| accent-cards | `brand`, `subtle` |
| graphic-cards | `illustration`, `icon` |
| horizontal-cards | `1-col-large`, `2-col-compact`, `2-col` |
| external-link-cards | `compact`, `icon-heading-body`, `text-only` |
| bullet-image | `icon-bullets`, `simple-bullets`, `grid` |
| text-media | `image-left-photo`, `image-left-video`, `text-left-photo`, `text-left-video` |
| expanded-text | `centered-2-col`, `split-1-col`, `centered-3-col`, `split-2-col` |
| longform-text | `paragraph`, `bullet-list`, `resource-list` |
| hero-primary | `image-overlay`, `form-image`, `split-media` |
| hero-secondary | `brand-strong`, `bright-green`, `subtle` |
| two-col-form | `subtle`, `brand` |
| promo-banner-card | `image-led-brand`, `image-led-subtle`, `branded-cta`, `simple-cta` |

That is 39 SVGs. Card pattern variants (overview, accent, graphic, horizontal, external link) are not in the pattern documentation, so their names describe the drawings the owner made. Longform Text is not yet drawn.

Variant naming rule: where a pattern has a gray treatment and a tinted-green treatment, they are called `subtle` (gray) and `brand` (tinted green).

How it works:

- The app imports every SVG in the folder as text at build time. Adding a correctly named file registers that variant.
- The Step 4 and Step 5 variant lists read from the registered file names instead of the hardcoded lists.
- Mock page: for each section, in order, render the SVG for its pattern and variant. If none exists, render a labeled placeholder block.
- Export: the same SVG text is written inline into the HTML file. No external requests.
- Dev-time check: lists documented patterns and variants that have no SVG, and SVG files that match nothing.

## Project Structure

### Documentation (this feature)

```text
specs/001-page-builder-v0-1-1/
├── spec.md
├── plan.md
├── research.md
└── tasks.md        # next step
```

### Source Code (repository root)

```text
src/app/
├── App.tsx                  # existing: steps, state; edits listed below
├── patterns/
│   ├── README.md            # pattern documentation (provided)
│   ├── card-patterns/       # SVGs, one per pattern variant (drawn by owner)
│   ├── text-and-list/       # SVGs
│   ├── functional-patterns/ # SVGs
│   ├── templates/           # full-page reference drawings (not patterns; not bundled in exports)
│   └── registry.ts          # reads all SVGs under patterns/, exposes patterns and variants
├── mock/
│   └── MockPage.tsx         # stacks SVGs for the chosen sections
└── export/
    └── exportHtml.ts        # builds standalone HTML string and triggers download
```

**Structure Decision**: Keep the prototype's single `App.tsx` for the step UI and add three small folders (patterns, mock, export), so the new work is separable from the existing prototype.

## Changes to Existing Prototype

| Where | Change |
|-------|--------|
| Page type list and section templates | Replace Bio with Blog (same sections as Article); no Search Results |
| Pattern set | Replace the prototype's nine patterns with the thirteen documented ones, and re-map each page type's sections to them using the "Recommended Sections" table in the spec. Hero Primary appears only on Business Page |
| Steps 4 and 5 | Variant lists come from the registry, not hardcoded arrays |
| Step 3 | Replace upload zone with paste-brief control and text area; hold pasted text in app state |
| Step 5 | Wire Add section to the approved sections not currently on the page |
| Step 6 | Replace "Page spec ready" confirmation with Generate, mock page view (stacked SVGs), Export HTML, and a disabled "Figma (v2)" option |
| App state | Add pasted brief text; keep it across step navigation |

## Pattern SVG Status

| Pattern | Status |
|---------|--------|
| overview-cards, accent-cards, graphic-cards, horizontal-cards, external-link-cards | Drawn and renamed. All five are in `card-patterns/` |
| bullet-image, text-media, expanded-text | Drawn and renamed, in `text-and-list/` |
| longform-text | Parked. No drawings yet. Renders as a labeled placeholder until drawn |
| promo-banner-card (4), two-col-form (2), hero-primary (3), hero-secondary (3) | Drawn and renamed, in `functional-patterns/`. Promo banner sits with the functional set for now |

Mock images: the image areas in Text Media (4), Bullet Image (3) and Overview Cards `stacked-right` contain a neutral mock image drawn into the SVG, tagged `data-mock="image"` so it can be found and swapped later.

## SVG Weight

Drawings are 80 KB to 2 MB each because text is converted to outlines and two promo banners embed photos. Measured on a copy: running SVGO over the 30 pattern SVGs cut the folder from 12.4 MB to 6.8 MB (about 45%). Decision (approved):

- Keep the source SVGs in the repo exactly as drawn.
- Optimize only when building the export, not the source files.
- Use SVGO with ID prefixing per file. Its default ID minifying would make IDs collide when several SVGs are inlined into one HTML file. (The current files have unique IDs, so nothing collides today.)
- Check the optimized output looks identical before relying on it.
- Embedded photos are the bigger weight. Hero Secondary `subtle` is 23 MB, `brand-strong` 12 MB and Hero Primary `split-media` 10 MB, because each embeds 4096 px photos (up to 8 MB each) shown at about 500 px wide. SVGO does not shrink embedded photos. At export, downscale each embedded image to about twice its displayed width and recompress it (keeping transparency for the cut-out portraits). Sources stay untouched. Prototype: `scripts/shrink-embedded-images.py <in.svg> <out.svg> [maxWidth=1200]`. On a copy, `split-media` went 10.1 MB to 0.3 MB, `brand-strong` 12.0 MB to 1.9 MB and `subtle` 23.1 MB to 4.0 MB, with a mean pixel difference of 0.05/255 on `subtle` when rendered at 1440 px.
- Text stays as outlines, so text swapping (option B) remains a later redraw or re-export job.

## Reference Templates

`templates/services-page/` holds four full-page drawings (01 Virtual Care Overview, 02 Urgent Care & Walk-ins, 03 Find a Provider, 05 Primary Care at Home; 04 is absent). They are 1.8 MB to 15 MB each, 33 MB in total. Plan: treat them as reference material for building the Services page, never load them in the app or the export, and decide whether they belong in the repo at this size.

## Build Order

Build and review the mock one page type at a time, so the SVGs you draw and the section lists are checked against a real page before moving on:

1. Business Page (Hero Primary, Overview Cards, Text Media, Accent Cards, Promo Banner Card, Two-Col Form)
2. Article, and Blog with it (adds Hero Secondary, Longform Text, Horizontal Cards, External Link Cards)
3. Services (adds Graphic Cards)

## Versioning

Option A: one spec folder per release (`001-page-builder-v0-1-1`, later `002-page-builder-v0-2-0`). v0.1.1 is one cohesive release. Switch to one folder per feature, with git tags marking releases, when a release starts bundling several independent features. Add a `v0.1.1` git tag when it ships.

## Later Versions (not in this plan)

- **v0.2**: content rules and validation, voice and tone guidance, Blog sections finalized, Search Results, tagged text slots in SVGs so the mock shows brief and hero content
- **v0.3**: pattern data from Figma and Storybook
- **v1.0**: Figma export through Figma MCP, multi-page sets
- Open items to schedule: Primary Care at Home page type

## Complexity Tracking

None. No new dependencies and no new layers beyond two folders.
