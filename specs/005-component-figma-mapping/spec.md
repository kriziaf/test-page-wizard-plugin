# Feature Specification: Component → Figma library mapping

**Feature Branch**: `005-component-figma-mapping`

**Created**: 2026-10-08

**Status**: Draft — design only; matching is mostly automated via `search_design_system` name-matching (see Decision), with a human-confirm step and limited manual node-id resolution. Not yet started.

**Input**: User description: "I want to audit the component list we have. This component needs to map itself to the figma Library I will be sharing. ... I want to scan for components we have on site and match it to Figma links from library."

## Baseline (what exists today)

Two separate component inventories exist in code, with no link to any Figma
library component:

1. `src/app/patterns/registry.ts` — the live registry of 14 `PatternId`s
   (grouped as Card patterns / Text-and-list / Functional), backed by
   `{pattern}--{variant}.svg` files under `_generated/`. This is what
   `App.tsx`, `MockPage.tsx`, and `exportHtml.ts` all consume — the set a
   user actually picks from when building a page.
2. `src/app/tokens-and-styles/components/` — a dormant CSS component layer:
   `hero`, `testimonial`, `button`, `form`, `header`, `heading-block`,
   `highlight-bar`, `external-link-cards`, `horizontal-cards`, `list-item`.
   No registry/index file exists for this layer, and nothing in the app
   currently imports it (`grep` found zero `.tsx`/`.ts` references to its
   `styles.css` entry point).

Neither layer has ever been checked against the actual target design-system
library: **Leaf Public Sites Web**, Figma file key `BYYBVG0tM2CmNo7p4kC96W`
(https://www.figma.com/design/BYYBVG0tM2CmNo7p4kC96W/Leaf-Public-Sites-Lib-test?node-id=2083-25006&m=draw).
Existing specs that touch Figma (`003-figma-export-plugin`,
`004-figma-export-agent-skill-reference`) only vectorize raw SVGs into
Figma as artwork — they explicitly do not match against a design system's
named components.

A real tooling constraint surfaced while scoping this: the Figma MCP tools
available here (`get_metadata`, `search_design_system`, `get_design_context`,
etc.) only see what's currently loaded/open in the user's Figma desktop
app. Calling `get_metadata` with no node id against this file returned a
single top-level page ("🖼️ Cover"), and the node the user shared
(`2083:25006`) resolved to one component's documentation-sheet `_HEADER`
instance — not a library-wide index. There is no way with these tools to
remotely enumerate "every component in the library" in one call; the file
also has no libraries added to it (`get_libraries` returned an empty
`libraries_added_to_file`).

That constraint turned out to apply only to `get_metadata`'s desktop-bridge
path, not to search. `search_design_system` against the same `fileKey`
**does** index this library by name/semantics: generic queries like
`"hero"`, `"button"`, `"card"` returned real, named components —
`overview-cards`, `horizontal-cards`, `external-link-cards`,
`promo-banner-card`, `list-cards`, `icon-cards`, `tab-card`, `graphic-card`,
`text-media`, `two-col-form`, `CTA Banner`, `insights-metric`,
`Value-Prop-Card`, `Testimonial Stack Card`, and several hero variants —
from a library called **Leaf Public Sites Lib-test**, `libraryKey
lk-5a95d848db1508fb5daa85b15840ef400cdbf4c1ba657288bebc79cb0e19afece95c41cdd820bd31e330f9b215316354a85600bffeb026ff8f01d10c29ef4ade`.
These names map almost 1:1 to our existing registry ids. The same call also
surfaced noise from other libraries this account can see (`Foundations -
Reference Only`, `Equity Base`/`Equity UI`, `FCDS-Dot`, `Open Sprints`) that
happen to also have components named "Button"/"Card" — scoping future
calls with `includeLibraryKeys: ["lk-5a95d848...ef4ade"]` avoids that noise.

## Problem & decision

We have no record of which of our site's components correspond to a real
component in the Cigna "Leaf" Figma library, which are custom/have no
match, or where our naming has drifted from the library's. Without this,
any later work that wants to swap our mock SVG patterns for real library
components (e.g. a future version of the export plugin) has nothing to go
on.

**Decision**: write the Figma match directly into each layer's own registry
file, as an optional `figma` field on the existing entry — not a separate
mapping file. For `src/app/patterns/registry.ts` this means adding
`figma?: FigmaRef` to the existing `PATTERNS` map; the `tokens-and-styles`
layer gets an analogous new registry file with the same shape, since none
exists today. `figma` references a library by a short alias (see
`FIGMA_LIBRARIES` below) plus a `nodeId`, rather than repeating the raw
Figma file key on every entry, so redirecting to a different library file
later is a one-line change in one place. Because the field is optional and
nothing in the static-mock rendering path (`MockPage.tsx`, `exportHtml.ts`)
reads it, static mock mode keeps working unchanged, with or without any
`figma` data present — Figma data is purely additive metadata, never a
runtime dependency of the mock pipeline.

**This is strictly additive to the existing registry.** The `PatternId`,
`label`, and `group` values already in `registry.ts` (and the
tokens-and-styles folder names) are not arbitrary — they encode
content-architecture decisions already made and merged to GitHub. Matching
against Figma MUST NOT rename, restructure, or otherwise alter any
existing id/label/group. Our existing names are the *query input* fed into
Figma's search, never something Figma's naming gets to rewrite — matching
only ever adds the new `figma` field alongside what's already there (see
FR-008).

Filling `figma` in is a **two-phase process**, not a single manual sweep:

- **Phase A — automated proposal**: batch-query `search_design_system`
  (scoped to `includeLibraryKeys: ["lk-5a95d848...ef4ade"]`) using our
  existing registry ids/labels as the search terms, once per inventory id
  (or a few at a time, per the tool's own batching guidance). Each query
  proposes its best name/semantic match plus that component's description,
  without any Figma desktop navigation.
- **Phase B — human confirm + node-id resolution**: the user confirms or
  rejects each proposal (fast — no Figma navigation needed for this step).
  For confirmed matches, a `nodeId` still needs resolving, since
  `search_design_system` returns a `componentKey`/`componentSetKey`
  (Figma's stable library identifier), not a canvas `nodeId`, and a
  clickable Figma URL needs the latter. Prefer resolving many at once (the
  user gives one shared parent node — e.g. the library's "Components" page
  — once, and `get_metadata` drills that subtree to pull child node-ids by
  name) over one Figma-desktop round-trip per component; fall back to
  asking per-component only where drilling doesn't resolve a name cleanly.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build the component inventory (Priority: P1)

Before any Figma matching can happen, we need one definitive list of every
component id across both layers that needs a decision.

**Why this priority**: Nothing else in this spec can start without it.

**Independent Test**: Read `src/app/patterns/registry.ts` and list its 14
`PatternId`s; list the subfolder names under
`src/app/tokens-and-styles/components/`; confirm the combined list has no
duplicates and every id is traceable to a real file in the repo.

**Acceptance Scenarios**:

1. **Given** the registry and the tokens-and-styles components folder,
   **When** the inventory is built, **Then** it contains exactly the 14
   `PatternId`s plus one id per tokens-and-styles component folder, with no
   omissions and no invented ids.

---

### User Story 2 - Record a Figma match per component (Priority: P1)

For each inventory id, determine whether the Leaf library has a matching
component, and record it.

**Why this priority**: This is the actual deliverable the user asked for.

**Independent Test**: Pick any single inventory id, have the user share its
Figma node-id/URL (or confirm there's no match), verify that node
(`get_metadata` + `get_screenshot`), and confirm its registry entry now has
a `figma` field referencing the right library alias, `nodeId`, and
`status`.

**Acceptance Scenarios**:

1. **Given** an inventory id and a Figma node-id the user shares for it,
   **When** Claude verifies the node resolves to a real component in the
   `leaf` library, **Then** that entry's `figma` field is set to
   `{ library: "leaf", nodeId, status: "mapped", verifiedAt }`.
2. **Given** an inventory id the user says has no Leaf equivalent, **When**
   that's confirmed, **Then** that entry's `figma` field is set to
   `status: "no-match"` (distinct from an entry with no `figma` field at
   all, which means "not yet reviewed").
3. **Given** the full pass is complete, **When** the registries are
   inspected, **Then** every inventory id has a `figma` field, and none are
   missing.

---

### Edge Cases

- A pattern has multiple SVG variants (e.g. `overview-cards` has several) —
  does the Figma mapping apply once per `PatternId`, or per variant? Default
  for this pass: **one entry per `PatternId`**, not per variant, unless a
  specific variant turns out to map to a visibly different Leaf component —
  flag that case in `notes` rather than inventing extra ids.
- A tokens-and-styles component folder contains sub-parts that might map to
  *different* Leaf components (e.g. `hero` might cover more than one Leaf
  hero variant) — record one entry for the folder and note any sub-variant
  ambiguity in `notes` rather than splitting ids unilaterally.
- A Figma node the user shares turns out not to be a component (e.g. it's a
  loose frame or instance override) — do not record it as `mapped`; ask for
  the correct node instead.
- Figma components get renamed or moved after this pass — out of scope to
  detect automatically; the registry's `figma` data is a point-in-time
  record, not a live sync.
- The target library is replaced by a genuinely different Figma file (a
  duplicate, a migration to a new team) — `nodeId`s do not carry over
  across a file duplicate in Figma, so a new alias in `FIGMA_LIBRARIES`
  needs its own pass. That pass re-runs Phase A (automated name-matching
  proposals via `search_design_system`) against the new `libraryKey`,
  *provided the new library is also published/searchable* — that half is
  not a return to a fully manual walkthrough. Phase B (turning a confirmed
  match into a verified `nodeId`) is manual regardless of which library is
  in play — see the Code Connect note under Assumptions; this is a
  tooling-access limitation, not something specific to `leaf`. Existing
  entries under the old alias are left alone (superseded, not deleted)
  rather than rewritten. Note: simply opening the same cloud file from a
  different device is **not** this case — a Figma file's
  `fileKey`/`libraryKey` are tied to the file, not the device, so no action
  is needed when only the device changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The inventory MUST include all 14 `PatternId`s from
  `src/app/patterns/registry.ts` and one id per component folder under
  `src/app/tokens-and-styles/components/`.
- **FR-002**: Each inventory id MUST get exactly one `figma` entry, written
  directly onto its existing registry object (`PATTERNS` for patterns; the
  new tokens-and-styles registry for that layer) — not a separate mapping
  file.
- **FR-003**: Each `figma` entry MUST carry a `status` of `"mapped"` or
  `"no-match"`; an inventory id with no `figma` field at all means
  "not yet reviewed" — this absence MUST NOT be interpreted as `"no-match"`
  anywhere that reads the registry later.
- **FR-004**: A `"mapped"` entry MUST reference its library by alias (see
  FR-007) plus a `nodeId` — it MUST NOT repeat the raw Figma file key
  inline on every entry.
- **FR-005**: Before writing a `"mapped"` entry, the given node-id MUST be
  verified (via `get_metadata` and/or `get_screenshot`) to actually resolve
  to a component in the referenced library — no entry is recorded from an
  unverified guess.
- **FR-006**: The `figma` field MUST be optional on every registry entry,
  and no code in the static-mock rendering path (`MockPage.tsx`,
  `exportHtml.ts`, the Step 4/5 picker in `App.tsx`) MUST read or depend on
  it — static mock mode MUST work identically whether or not any `figma`
  data has been filled in.
- **FR-007**: A single `FIGMA_LIBRARIES` map (alias → `{ fileKey,
  libraryKey, name }`) MUST be the one place a library's Figma file key
  *and* published-library key are recorded. Pointing existing or future
  entries at a different library file MUST only require adding/editing an
  entry in this map, never editing every registry entry that references
  it. `libraryKey` (Figma's published-library id, distinct from `fileKey`)
  is what makes `search_design_system` scoping possible, and is also the
  clearest signal that a redirect is to a genuinely *new* library — a file
  that republishes its own components gets a new `libraryKey` even if it's
  a duplicate of the old file, so comparing `libraryKey`s is how to tell
  "same library, new device" apart from "actually a different library."
- **FR-008**: Matching MUST NOT modify any existing `PatternId`, `label`,
  or `group` value in `registry.ts`, nor any existing
  `tokens-and-styles/components/` folder name — these already encode
  content-architecture decisions made and merged separately. The `figma`
  field is the only thing matching is allowed to add.

### Key Entities

- **Inventory id**: Either an existing `PatternId` (from `registry.ts`) or
  a new id introduced here for a `tokens-and-styles/components/` folder.
  Matching only reads these — see FR-008.
- **FigmaRef**: `{ library: string, nodeId: string, status: "mapped" |
  "no-match", verifiedAt: string, notes?: string }` — the optional `figma`
  field value written onto a registry entry. `library` is an alias key
  into `FIGMA_LIBRARIES`, not a raw file key.
- **FIGMA_LIBRARIES**: `Record<alias, { fileKey: string, libraryKey:
  string, name: string }>` — the single source of truth for which Figma
  file/published-library an alias points at.
- **Target library**: alias `leaf` → `fileKey BYYBVG0tM2CmNo7p4kC96W`,
  `libraryKey lk-5a95d848...ef4ade`, name `Leaf Public Sites Lib-test` —
  the only library in scope for this pass.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every one of the 14 pattern ids and every tokens-and-styles
  component id (~24 total) has a `figma` field in its registry entry, with
  none left unreviewed.
- **SC-002**: Every `"mapped"` entry's `{ library, nodeId }` resolves to the
  correct component when opened in Figma (via `FIGMA_LIBRARIES[library]`).
- **SC-003**: Every `"no-match"` entry was an explicit user confirmation,
  not an assumption made without asking.
- **SC-004**: Redirecting every existing entry to a new Figma library file
  requires editing exactly one `FIGMA_LIBRARIES` entry (`fileKey` +
  `libraryKey`), never touching individual `PATTERNS`/component registry
  entries, and never touching their `id`/`label`/`group` (FR-008). Phase A
  (candidate name-matching) re-runs automatically against the new
  `libraryKey`; Phase B (node-id verification per confirmed match) still
  requires the user to supply node-ids, same as against `leaf` — see the
  Code Connect note below.

## Assumptions

- Phase A (candidate matching via `search_design_system`) is automated.
  Phase B (turning a confirmed match into a verified, clickable `nodeId`)
  is **manual regardless of which library is in play** — not just a
  `leaf`-specific limitation. `search_design_system` only returns a
  `componentKey`, and the one tool that bulk-resolves
  `componentKey → nodeId` for a whole file
  (`list_file_components_for_code_connect`) requires a Dev/Full seat on a
  Figma Organization/Enterprise plan, which this account does not have; the
  plain page-listing bridge call also only ever returned one page
  ("Cover"), so there is no remote index to drill from blind either. The
  practical floor is: the user supplies a `nodeId` per confirmed match (or
  one shared parent node to drill, when one exists) — for `leaf` and for
  any future library redirect alike. This would go away if Code Connect
  access is added to the account later; until then, don't plan around
  removing this step.
- `Leaf Public Sites Lib-test` (`fileKey BYYBVG0tM2CmNo7p4kC96W`,
  `libraryKey lk-5a95d848...ef4ade`) is the only target library for this
  pass. Other libraries surfaced while exploring this file (`FCDS-Dot
  Design-Component Library`, `Equity Base`, `Equity UI`, `Foundations -
  Reference Only`, `Open Sprints - Atomic Elements`) are out of scope
  unless the user explicitly asks to widen the search later.
- This `figma` metadata is additive registry data for now. Wiring it into
  the export plugin (`specs/003-figma-export-plugin/`) so a future export
  could insert real library component instances instead of raw vectorized
  SVGs is a plausible future consumer, but is **not** committed to by this
  spec.
- `FIGMA_LIBRARIES` centralizes the file/library-key redirect problem to
  one place, and Phase A's name-matching re-runs automatically against a
  new `libraryKey` *provided* the new library is also published/
  searchable — if it isn't, even Phase A degrades to manual. Either way,
  Phase B's node-id step per confirmed match stays manual (see above);
  this spec accepts that as a fixed cost of the current tooling access,
  not something to engineer around further.

## Implementation notes (non-binding, for whoever builds this)

- Add `figma?: FigmaRef` to the `PATTERNS` map's value type in
  `src/app/patterns/registry.ts`, alongside the existing `label`/`group`
  fields — same file, no new file for the pattern layer.
- Create a small new registry for the tokens-and-styles layer (e.g.
  `src/app/tokens-and-styles/components/registry.ts`) with the same
  `{ label?, figma? }` shape, since no registry exists there today.
  Suggested ids (one per existing folder): `hero`, `text-and-image`,
  `heading-block`, `form`, `list-item`, `horizontal-cards`,
  `external-link-cards`, `highlight-bar`, `testimonial`, `header`,
  `button` (core) — confirm against the actual folder names at
  implementation time, since this spec's count ("~10") is from directory
  listing, not a frozen list.
- Put `FIGMA_LIBRARIES` somewhere both registries can import from (e.g.
  `src/app/patterns/figma-libraries.ts`), with `{ leaf: { fileKey:
  "BYYBVG0tM2CmNo7p4kC96W", libraryKey: "lk-5a95d848...ef4ade", name:
  "Leaf Public Sites Lib-test" } }` as its only entry for this pass.
- Suggested audit flow (Phase A/B from the Decision section): batch
  `search_design_system` calls using existing registry ids/labels as query
  terms, scoped with `includeLibraryKeys: ["lk-5a95d848...ef4ade"]`;
  present the proposed name matches (with their Figma descriptions) to the
  user for quick confirm/reject; for confirmed matches, resolve `nodeId`s
  in bulk via one `get_metadata` drill-down from a shared parent node
  where possible, falling back to asking per-component only when that
  doesn't cleanly resolve a name; commit each registry edit incrementally
  rather than in one giant batch, so partial progress isn't lost.
