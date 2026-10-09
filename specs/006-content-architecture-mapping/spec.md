# Feature Specification: Content architecture mapping (pattern → Figma content guidance)

**Feature Branch**: `006-content-architecture-mapping`

**Created**: 2026-10-09

**Status**: Implemented (2026-10-09) — 13 of 14 patterns have `contentArchitecture`
entries; `highlight-band` is deliberately parked (hidden from the UI, no entry yet).

**Input**: User description: "Let's start mapping the components for its content architecture. Start with the context given to the SVG's and match them back to Figma. I like the initial descriptions for architecture in Step 04. Can we spec this plan."

## Baseline (what exists today)

Two separate sources of "what content goes in this section" exist:

1. **Step 4's per-template-slot descriptions**, in `src/app/App.tsx`. Short blurbs
   like `"Main headline, supporting copy, buttons, and one image"` live inside
   `SectionDef` objects, collected into `ARTICLE_SECTIONS` and `SECTIONS_BY_TYPE`
   (covering `business`/`article`/`blog`/`services` page types). These are keyed by
   **template section slot** (`b1`, `s1`, `a1`, …), not by `PatternId` — the same
   pattern can carry a different description depending on which template uses it.
2. **Figma's own documentation text**, embedded in the components matched during
   `specs/005-component-figma-mapping/` — both a "Use when" purpose statement and,
   on several components, a separate "Placement" statement (where in a page the
   component belongs). Neither was in the codebase before this spec.

Neither source feeds into content generation (confirmed in prior research this
session: Step 3's brief never reaches `MockPage`/export). This spec builds
*reference data* cross-referencing pattern content rules against the real design
system — it does not wire live content generation.

## Problem & decision

Step 4's descriptions are hand-written blurbs with no structural discipline behind
them. The real design system encodes actual "use when" and "placement" guidance per
component — discovered while matching patterns to Figma in spec 005, and refined
with direct product knowledge where Figma's own text was silent, generic, or wrong
for this product's actual usage.

**Decision**: `contentArchitecture` is an optional field on each `PATTERNS` entry in
`src/app/patterns/registry.ts`, a **sibling to `figma`, never nested inside it** —
so a future library redirect (`FIGMA_LIBRARIES` alias) doesn't silently invalidate
it. Implemented shape (refined twice during execution — see Delta below):

```ts
export type ContentArchitectureSource =
  | { type: "figma"; library: FigmaLibraryAlias; nodeId: string; extractedAt: string }
  | { type: "user"; confirmedAt: string; note?: string };

export type ContentArchitecture = {
  useWhen?: { text: string; source: ContentArchitectureSource };
  placement?: { text: string; source: ContentArchitectureSource };
};
```

`useWhen` and `placement` each carry their **own** provenance rather than one
shared `source` for the whole entry — necessary because, in practice, almost every
pattern ended up with a Figma-sourced `useWhen` paired with a user-sourced or
user-refined `placement` (Figma rarely documents page-sequencing intent; the
product owner does). A single shared source couldn't represent that split
honestly.

`App.tsx` additionally exports `PageType`, `SectionDef`, `ARTICLE_SECTIONS`, and
`SECTIONS_BY_TYPE` (previously module-private) — zero behavior change, just
visibility, so this data is importable instead of duplicated.

## Delta from the original spec draft

This spec was scoped before execution surfaced two real refinements and one
descoped field; recorded here rather than silently rewriting history:

1. **Schema narrowed**: the original draft's `contentArchitecture` had
   `headline`/`body`/`cta`/`useWhen` fields (word-count-style guidance) plus one
   shared `source`. Per the user's explicit narrowing, the shipped schema only
   keeps `useWhen` + `placement` — `placement` wasn't in the original draft at all;
   it was added mid-execution once it became clear `useWhen` alone can't answer
   "what comes before/after what" for page-stacking (several Figma components
   separate "Use when" purpose text from a distinct "Placement" sequencing
   statement).
2. **Source split per-field**, not one shared `source` — see Decision above.
3. **Two `PatternId` renames happened during this work**, requested directly by
   the user once their content-architecture roles were understood:
   `two-col-form` → `form` (confirmed as the page's final, action-inviting
   section — contradicting Figma's own generic "position before secondary
   content" placement text, which is recorded as an explicit override, not
   silently dropped) and `promo-banner-card` → `promo-banner`. Both renames were
   propagated through `registry.ts` (type + key), `App.tsx` (`WIRE_KIND`,
   `DEFAULT_VARIANT`, `SECTIONS_BY_TYPE` slots `b5`/`b6`/`s6`/`s7`), and the
   pattern's SVG source + generated files (`git mv`'d, history preserved) — the
   original spec didn't anticipate renames at all.
4. **`highlight-band` was parked, not just left "pending."** The original spec
   treated an empty `contentArchitecture` as equivalent to "not yet checked." In
   execution, `highlight-band` was both missing guidance text *and* explicitly
   hidden from the UI (`HIDDEN_PATTERNS` set in `App.tsx`, filtering it out of
   `addPool()`'s "Add section" list) — a deliberate product decision to revisit
   later, not an oversight. Its registry entry, Figma mapping, and SVG files are
   untouched.
5. **FR-001 (exporting the four `App.tsx` declarations) was approved early but not
   actually implemented until this sync pass caught the gap** — now done.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export the existing template descriptions (Priority: P1) — ✅ Done

`PageType`, `SectionDef`, `ARTICLE_SECTIONS`, `SECTIONS_BY_TYPE` are now exported
from `App.tsx`. Verified: `npm run dev` renders Step 4/5/6 identically, no console
errors.

### User Story 2 - Extract and record content architecture per pattern (Priority: P1) — ✅ Done for 13/14

For each pattern, record `useWhen` (almost always Figma-sourced) and `placement`
(a mix of Figma-sourced and user-provided/refined), each with independent
provenance.

**Acceptance Scenarios** (as implemented):

1. **Given** a pattern whose matched Figma component has explicit "Use when" text,
   **When** extracted, **Then** `contentArchitecture.useWhen` is populated with
   `source: { type: "figma", library, nodeId, extractedAt }`. True for all 13
   implemented patterns.
2. **Given** placement guidance that only exists as product knowledge (Figma
   doesn't document page-sequencing, or documents it wrong for this product's
   actual usage), **When** confirmed by the user, **Then**
   `contentArchitecture.placement` is populated with `source: { type: "user",
   confirmedAt, note? }` — `note` used specifically where this overrides Figma's
   own text (e.g. `form`'s placement).
3. **Given** `hero-primary`/`hero-secondary`, **When** their role is page-level
   (which page gets a hero, not where within a page), **Then** `placement` is
   correctly left absent rather than force-fit — `useWhen` alone answers the
   relevant question for these two.
4. **Given** `highlight-band`, **When** no guidance was extracted and the pattern
   was deliberately parked, **Then** it has no `contentArchitecture` entry *and*
   is excluded from `App.tsx`'s `HIDDEN_PATTERNS` set-filtered "Add section" pool.

### Edge Cases

- A pattern reused across multiple template slots (`hero-primary` at `b1`/`s1`) —
  `contentArchitecture` is one canonical record per `PatternId`, independent of
  Step 4's per-slot descriptions. Not merged, not conflicting.
- A repeatable pattern (`text-media`, `bullet-image`, `expanded-text`,
  `longform-text`) — "stackable in the middle of the page" is recorded in
  `placement`'s prose rather than as a separate boolean field, per the narrowed
  schema.
- Figma's placement guidance can be directly wrong for this product (`form`) — the
  user's correction wins, recorded with `note` explaining the override, not a
  silent replacement.
- A future library redirect — `contentArchitecture` entries are untouched
  automatically; `source.library`/`source.nodeId` (for figma-sourced fields) is
  what a future audit would check against the new library.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: ✅ `App.tsx` exports `SectionDef`, `PageType`, `SECTIONS_BY_TYPE`,
  `ARTICLE_SECTIONS`, no behavior change.
- **FR-002**: ✅ `PATTERNS` entries support an optional `contentArchitecture` field,
  sibling to (never nested inside) `figma`.
- **FR-003**: ✅ Each of `useWhen`/`placement` carries its own
  `ContentArchitectureSource` (revised from one shared `source` — see Delta #2).
- **FR-004**: ✅ Only guidance actually present in Figma, or explicitly confirmed by
  the user, was recorded — nothing invented.
- **FR-005**: ✅ No existing `PatternId`, `label`, `group`, or `figma` value was
  modified as a side effect of this work — the two renames (`form`,
  `promo-banner`) were separate, explicit user instructions, not incidental to
  content-architecture matching.
- **FR-006 (revised)**: 13 of 14 patterns have entries. `highlight-band` is
  explicitly parked — not "lower priority," but deliberately excluded from the UI
  pending a future revisit.

### Key Entities

- **ContentArchitecture**: `{ useWhen?: { text, source }, placement?: { text,
  source } }`.
- **ContentArchitectureSource**: `{ type: "figma", library, nodeId, extractedAt }
  | { type: "user", confirmedAt, note? }`.
- **HIDDEN_PATTERNS** (new, `App.tsx`): a `Set<PatternId>` filtered out of
  `addPool()`'s "Add section" offering — currently `{ "highlight-band" }`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: ✅ All four `App.tsx` declarations importable; no Step 4 behavior
  change.
- **SC-002 (revised)**: 13 of 14 patterns have a `contentArchitecture` entry
  sourced from real Figma text and/or confirmed user knowledge; `highlight-band`
  is explicitly parked (not silently incomplete).
- **SC-003**: ✅ No `contentArchitecture` entry references require touching on a
  future library redirect — only `source.library`/`source.nodeId` (figma-sourced
  fields only) become candidates to re-verify.

## Assumptions

- This spec produces reference data only — not wired into Step 3's brief, Step 4's
  rendering, `MockPage`, or export. Still a separate, later decision.
- `highlight-band` can be un-parked later by: removing it from `HIDDEN_PATTERNS` in
  `App.tsx`, and adding its `contentArchitecture` entry the same way as the other
  13.

## Implementation notes

- `src/app/patterns/registry.ts`: `ContentArchitectureSource`/`ContentArchitecture`
  types, `contentArchitecture` field on the `PATTERNS` value type, 13 populated
  entries.
- `src/app/App.tsx`: four `export` keywords added (FR-001); `HIDDEN_PATTERNS` set
  plus one filter line in `addPool()`; `two-col-form`/`promo-banner-card` renamed
  to `form`/`promo-banner` throughout (`WIRE_KIND`, `DEFAULT_VARIANT`,
  `SECTIONS_BY_TYPE`).
- Pattern SVGs renamed to match (`git mv`, history preserved): `two-col-form--*` →
  `form--*`, `promo-banner-card--*` → `promo-banner--*`, in both
  `functional-patterns/` and `_generated/`.
- Verified end-to-end via `npm run dev`: no console errors, no
  `[pattern registry]` missing/unmatched warnings, "Add section" pool confirmed to
  exclude `highlight-band`.
