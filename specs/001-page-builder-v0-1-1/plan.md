# Implementation Plan: Page Builder v0.1.1

**Branch**: `001-page-builder-v0-1-1` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-page-builder-v0-1-1/spec.md`

## Summary

Bring the existing v0.1 prototype in line with the spec: four page types, a paste-in text brief, a working Add section, and a Generate step that renders a mock page from lightweight mock components and demo SVGs and exports it as standalone HTML. Figma export is shown as v2 only.

## Technical Context

**Language/Version**: TypeScript, React (existing prototype)

**Primary Dependencies**: Vite, Tailwind, lucide-react, Radix/shadcn UI primitives (all already in the repo); no new dependency planned

**Storage**: None. State lives in the app component for the session

**Testing**: Manual walkthrough against the spec's acceptance scenarios for v0.1.1. Automated tests deferred [NEEDS CLARIFICATION: is a test setup wanted before v0.2?]

**Target Platform**: Current desktop browsers; exported HTML opens standalone

**Project Type**: Single-page web app (originated as a Figma Make export)

**Performance Goals**: Generate and export feel instant for pages of up to about 10 sections

**Constraints**: Exported HTML makes no external requests (inline CSS, inline SVG)

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
| Mock rendering | Mock components per pattern, inline styles, inline SVG |
| Demo media | SVGs supplied by the project owner, bundled with the tool |
| Brief input | Paste-brief control opens a text area; no auto-fill of fields in v0.1.1 |

## Mock Components (new)

One lightweight component per pattern, nine in total, each accepting a section (pattern, variant, name) plus brief and hero content:

- hero, accent cards, overview cards, graphic cards, external-link cards, text/media, expanded text, form, promo banner
- Variants change layout only (for example image left or right, 3-up or 4-up), not behavior
- Hero uses the editable hero content; other patterns use brief text where a field matches (for example primary action for CTAs) and labeled placeholder copy otherwise
- Media slots take a demo SVG from the bundled set
- Styled with inline styles so the same markup renders in the app and in the export

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
├── mock/
│   ├── MockPage.tsx         # renders sections in order
│   ├── components/          # nine mock pattern components
│   └── assets/              # demo SVGs (provided)
└── export/
    └── exportHtml.ts        # builds standalone HTML string and triggers download
```

**Structure Decision**: Keep the prototype's single `App.tsx` for the step UI and add two small folders for the new mock rendering and export, so the new work is separable from the existing prototype.

## Changes to Existing Prototype

| Where | Change |
|-------|--------|
| Page type list and section templates | Replace Bio with Blog (copy of Article sections); no Search Results |
| Step 3 | Replace upload zone with paste-brief control and text area; hold pasted text in app state |
| Step 5 | Wire Add section to the approved sections not currently on the page |
| Step 6 | Replace "Page spec ready" confirmation with Generate, mock page view, Export HTML, and a disabled "Figma (v2)" option |
| App state | Add pasted brief text; keep it across step navigation |

## Later Versions (not in this plan)

- **v0.2**: content rules and validation, voice and tone guidance, Blog sections finalized, Search Results
- **v0.3**: pattern data from Figma and Storybook
- **v1.0**: Figma export through Figma MCP, multi-page sets
- Open items to schedule: Primary Care at Home page type

## Complexity Tracking

None. No new dependencies and no new layers beyond two folders.
