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

Source of truth for pattern names, variants, and guidance: `src/app/patterns/README.md`. Drawings live beside it as `{pattern}--{variant}.svg`, one file per variant, all drawn by the project owner. Patterns with no documented variants use `--default`.

| Pattern | SVG files (`{pattern}--{variant}.svg`) |
|---------|----------------------------------------|
| overview-cards | `default` |
| accent-cards | `default` |
| graphic-cards | `default` |
| horizontal-cards | `default` |
| external-link-cards | `default` |
| bullet-image | `icon-bullets`, `simple-bullets`, `grid` |
| text-media | `image-left-photo`, `image-left-video`, `text-left-photo`, `text-left-video` |
| expanded-text | `centered-2-col`, `split-1-col`, `centered-3-col`, `split-2-col` |
| longform-text | `paragraph`, `bullet-list`, `resource-list` |
| hero-primary | `image-overlay`, `form-image`, `split-media` |
| hero-secondary | `brand-teal`, `bright-green`, `light-neutral` |
| two-col-form | `default`, `tinted-form` |
| promo-banner-card | `image-led`, `branded-cta`, `simple-cta` |

That is 30 SVGs.

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
│   ├── *.svg                # one per pattern variant (drawn by owner)
│   └── registry.ts          # reads the SVG folder, exposes patterns and variants
├── mock/
│   └── MockPage.tsx         # stacks SVGs for the chosen sections
└── export/
    └── exportHtml.ts        # builds standalone HTML string and triggers download
```

**Structure Decision**: Keep the prototype's single `App.tsx` for the step UI and add three small folders (patterns, mock, export), so the new work is separable from the existing prototype.

## Changes to Existing Prototype

| Where | Change |
|-------|--------|
| Page type list and section templates | Replace Bio with Blog (copy of Article sections); no Search Results |
| Pattern set | Replace the prototype's nine patterns with the thirteen documented ones, and re-map each page type's sections to them [NEEDS CLARIFICATION: mapping not yet decided] |
| Steps 4 and 5 | Variant lists come from the registry, not hardcoded arrays |
| Step 3 | Replace upload zone with paste-brief control and text area; hold pasted text in app state |
| Step 5 | Wire Add section to the approved sections not currently on the page |
| Step 6 | Replace "Page spec ready" confirmation with Generate, mock page view (stacked SVGs), Export HTML, and a disabled "Figma (v2)" option |
| App state | Add pasted brief text; keep it across step navigation |

## Later Versions (not in this plan)

- **v0.2**: content rules and validation, voice and tone guidance, Blog sections finalized, Search Results, tagged text slots in SVGs so the mock shows brief and hero content
- **v0.3**: pattern data from Figma and Storybook
- **v1.0**: Figma export through Figma MCP, multi-page sets
- Open items to schedule: Primary Care at Home page type

## Complexity Tracking

None. No new dependencies and no new layers beyond two folders.
