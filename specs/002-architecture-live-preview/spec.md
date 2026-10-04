# Feature Specification: Architecture step — 50/50 layout + hero pattern drawing preview

**Feature Branch**: `002-architecture-live-preview`

**Created**: 2026-10-03

**Status**: Draft — design only, not yet implemented

**Input**: User description: "In the Architecture step, where it says Live preview, add the image of the hero SVG as a fake placeholder, not yet editable — and make sure this view is 50/50 with the content sections on the left."

## Baseline (what exists today)

Step 4 "Architecture" (`src/app/App.tsx`, function `Step4`) lays out the section list on
the left and a sticky `ContentPanel` on the right, in a grid set at `App.tsx:934`:
`gridTemplateColumns: "1fr 360px"`. The left column flexes to fill remaining space; the
right column is pinned to a fixed 360px, so the two columns are visibly unbalanced at
normal desktop widths (observed: ~605px list vs. ~357px panel at a 987px viewport).

When the selected section is the hero (`ContentPanel`, hero branch, `App.tsx:822-833`),
the panel shows a block labeled "Live preview" containing `<HeroPreview content=
{heroContent} />` — a small hand-coded dark card (headline, body copy, CTA pills) built
from the user's typed content. This is **not** the actual hero pattern artwork; it's a
simplified live mock. The real hero pattern SVGs (e.g. `hero-primary--image-overlay.svg`)
already exist in `src/app/patterns/_generated/` and are loaded elsewhere via
`useLoadedSections` (`src/app/mock/MockPage.tsx:14-31`), but nothing in `ContentPanel`
currently shows them.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the real pattern drawing while editing hero content (Priority: P1)

A user on Step 4 has the hero section selected and is editing headline/body/CTA copy in
the content panel. They want to see what the actual hero pattern drawing looks like,
alongside their live-editable mock, without it being mistaken for something they can
click into or edit directly.

**Why this priority**: This is the entire ask — today there is no way to see the real
pattern artwork from inside the content-editing panel at all.

**Independent Test**: Select a hero section on Step 4 with a pattern/variant that has a
generated SVG; confirm the real drawing appears below the existing live-preview mock,
and that it does not respond to clicks or hover like an editable control.

**Acceptance Scenarios**:

1. **Given** a selected hero section whose pattern/variant has a generated SVG, **When**
   the user views the content panel, **Then** the real SVG artwork is shown in a clearly
   labeled, non-interactive block beneath the existing "Live preview" mock.
2. **Given** a selected hero section whose pattern/variant has no generated SVG yet,
   **When** the user views the content panel, **Then** no broken or empty placeholder box
   is shown — the block is simply omitted.
3. **Given** the new drawing block is visible, **When** the user edits headline, body, or
   CTA fields, **Then** only the existing `HeroPreview` mock updates; the drawing block
   never changes, since it is static reference art, not a template.

---

### User Story 2 - Balanced two-column layout on Step 4 (Priority: P2)

A user viewing Step 4 at a normal desktop width sees the section list and the content
panel as two clearly equal halves, rather than the list dominating the view.

**Why this priority**: Secondary to Story 1, but requested together — the panel needs
more room to usefully show both the editable mock and the new drawing block.

**Independent Test**: Load Step 4 at a desktop viewport and confirm the section-list
column and the content-panel column render at visually equal width.

**Acceptance Scenarios**:

1. **Given** Step 4 is open at a desktop viewport, **When** the page renders, **Then**
   the section-list column and the content-panel column are equal width (50/50), not the
   current flexible-left/fixed-360px-right split.
2. **Given** the wider content panel, **When** the existing `HeroPreview` mock renders,
   **Then** it still reads correctly (its internal `maxWidth: 320px` body-text constraint
   is unaffected by the wider column and simply leaves more right-hand padding).

---

### Edge Cases

- What happens for a non-hero section (e.g. a card or form pattern)? Out of scope for
  this feature — the "Live preview" / drawing-block treatment described here applies only
  to the hero branch of `ContentPanel`, matching where "Live preview" already exists
  today. Other section types keep their current content-panel behavior unchanged.
- What happens while the SVG is still loading? No block is shown until it resolves (or a
  minimal "Loading drawing…" line), matching how `MockPage` itself handles its own
  loading state (`MockPage.tsx:56`).
- What happens if the section's pattern/variant changes while the panel is open (user
  picks a different variant elsewhere)? The drawing block MUST re-fetch and update to the
  newly selected pattern/variant's SVG, the same way `useLoadedSections` already
  re-triggers on its `sections` key changing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Step 4's outer grid MUST render the section-list column and the
  `ContentPanel` column at equal width on desktop viewports.
- **FR-002**: When the selected section is a hero pattern and a generated SVG exists for
  its current pattern/variant, the content panel MUST display that SVG's artwork in a
  clearly labeled block, visually and behaviorally distinct from the existing editable
  `HeroPreview` mock (e.g. a "Preview only" badge, non-interactive styling).
- **FR-003**: The drawing block MUST NOT intercept clicks, hover states, or any other
  interaction — it is reference art only.
- **FR-004**: When no generated SVG exists for the selected hero pattern/variant, the
  drawing block MUST be omitted entirely rather than shown as a broken or empty box.
- **FR-005**: Editing the hero content fields (headline, sub-headline, body, CTAs) MUST
  continue to update only the existing `HeroPreview` mock; the drawing block MUST NOT
  attempt to reflect typed content.
- **FR-006**: The drawing block MUST reuse the existing SVG-loading mechanism
  (`useLoadedSections` from `src/app/mock/MockPage.tsx`) rather than introducing a new,
  parallel way of loading pattern SVGs.

### Key Entities

- **Content panel (hero branch)**: The existing right-hand panel on Step 4 shown when a
  hero section is selected; currently contains only the editable `HeroPreview` mock.
- **Drawing block** *(new)*: A non-interactive display of the real pattern SVG for the
  selected hero section's current pattern/variant, shown beneath the existing mock.
- **Pattern SVG**: Unchanged — the existing wireframe-style drawing per pattern/variant,
  defined in `src/app/patterns/registry.ts` and `src/app/patterns/_generated/`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At a standard desktop viewport, the two Step 4 columns measure equal width
  (within normal rounding), for every page type.
- **SC-002**: For every hero pattern/variant combination that has a generated SVG, the
  drawing block renders it correctly and never throws or shows a broken image.
- **SC-003**: For every hero pattern/variant combination with no generated SVG, no
  drawing block is rendered — Step 4 never shows a broken or empty placeholder for it.
- **SC-004**: Typing in any hero content field never changes the drawing block's content
  in manual testing.

## Assumptions

- This applies only to the hero branch of `ContentPanel` (where "Live preview" already
  exists today); non-hero section types are unchanged.
- "Not yet editable" means exactly that for this round — no template-based text injection
  into the SVG is in scope. A later version could explore swapping placeholder text
  inside the SVG for the user's actual brief content, but that is a separate, larger
  feature not designed here.
- The 50/50 split applies at normal desktop widths; no new responsive/mobile behavior is
  specified beyond what the existing grid already does at narrower widths.
- No new SVG assets are required — this reuses whatever pattern/variant SVGs already
  exist in `src/app/patterns/_generated/`.

## Implementation notes (non-binding, for whoever builds this)

- Grid: `src/app/App.tsx:934`, `gridTemplateColumns: "1fr 360px"` → `"1fr 1fr"`.
- New block: inside `ContentPanel`'s hero branch, `src/app/App.tsx:822-833`, below the
  existing "Live preview" block. Suggested label: "Pattern drawing", with a "Preview
  only" badge reusing the existing pill-badge style (`App.tsx:995-1004`,
  `App.tsx:1008-1017`).
- Data: import `useLoadedSections`/`MockSection` from `../mock/MockPage`; call
  `useLoadedSections([{ id: section.id, name: section.name, pattern: section.pattern, variant: section.variant }])`
  and read the single result's `.svg`.
- Rendering: `dangerouslySetInnerHTML`, reusing `MockPage`'s `.mock-svg{line-height:0}
  .mock-svg svg{width:100%;height:auto}` sizing rule (`MockPage.tsx:60-72`) rather than
  inventing new CSS. Wrap in `pointerEvents: "none"` plus a dashed border (matching the
  existing empty-state style at `App.tsx:766-774`) to read clearly as non-interactive.
