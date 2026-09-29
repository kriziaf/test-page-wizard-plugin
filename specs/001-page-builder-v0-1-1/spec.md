# Feature Specification: Page Builder v0.1.1

**Feature Branch**: `001-page-builder-v0-1-1`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Page Builder plugin: assemble pages from approved templates, pattern rules, and content guidance through a 6-step flow (scope, page type, content brief, architecture, review, generate). v0.1.1 finalizes the page types and makes Generate produce a mock page that can be exported as HTML. Figma export is v2."

## Baseline (what exists today)

The `v0.1 · prototype` already runs the 6-step flow end to end with sample content (Business Page, GLP-1 pharmacy brief). Sidebar navigation, step gating, section lists per page type, variant selection, reorder/remove, hero content editing, and a wireframe preview are in place. Step 1 shows Single page (available) and Multi-page set ("Coming soon"). Step 6 currently ends at a "Page spec ready" confirmation. There is no export.

v0.1.1 changes are limited to what is listed under Requirements. Everything else in the prototype is kept as is.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build a single page from start to finish (Priority: P1)

A marketing or content team member opens Page Builder, picks a page type, fills in the brief, reviews the recommended sections, and generates a page.

**Why this priority**: This is the whole product. Every other story supports it.

**Independent Test**: Complete Steps 1–6 for any page type without leaving the tool and reach a generated page.

**Acceptance Scenarios**:

1. **Given** a new session, **When** the user continues past Step 1, **Then** Single page is the only available scope and Multi-page set is visibly unavailable.
2. **Given** a completed Step 5, **When** the user reaches Step 6, **Then** the brief summary and section structure are shown before generating.
3. **Given** the user goes back to an earlier step, **When** they return forward, **Then** previously entered choices and content are still there.

---

### User Story 2 - Choose a page type and get a recommended structure (Priority: P1)

The user picks one of five page types and receives a starting list of sections mapped to approved patterns.

**Why this priority**: The section recommendation is the core value of the tool and drives every later step.

**Independent Test**: Select each page type and confirm a section list appears with required sections marked.

**Acceptance Scenarios**:

1. **Given** Step 2, **When** the user views page types, **Then** exactly these are offered: Business Page, Article, Blog, Services, Search Results.
2. **Given** a page type is selected, **When** the user reaches Step 4, **Then** the recommended sections for that type are shown, each mapped to a pattern.
3. **Given** the user changes page type after sections exist, **When** they return to Step 4, **Then** sections reflect the new type.

---

### User Story 3 - Capture the content brief (Priority: P2)

The user describes audience, service line, page goal, primary and secondary actions, required content, and existing approved copy.

**Why this priority**: The brief feeds the summary and, later, generation and validation.

**Independent Test**: Fill only Audience and advance; fill all fields and see them in the Step 6 summary.

**Acceptance Scenarios**:

1. **Given** Step 3 with Audience empty, **When** the user tries to continue, **Then** they cannot advance.
2. **Given** all brief fields are filled, **When** the user reaches Step 6, **Then** the summary shows the entered values.

---

### User Story 4 - Review and customize sections (Priority: P2)

The user adds, removes, and reorders sections and chooses a variant per section, with required sections protected.

**Why this priority**: Lets teams adapt the recommendation without leaving the approved pattern set.

**Independent Test**: Reorder two sections, remove an optional one, change a variant, and confirm the changes carry to Step 6.

**Acceptance Scenarios**:

1. **Given** a required section, **When** the user tries to remove it, **Then** it stays.
2. **Given** an optional section, **When** the user removes it, **Then** it disappears from the list and the Step 6 structure.
3. **Given** the section list is empty, **When** the user tries to continue, **Then** they cannot advance.

---

### User Story 5 - Generate a mock page and export it as HTML (Priority: P1)

At Step 6 the user generates a mock example of the page and exports it as an HTML file.

**Why this priority**: This is the v0.1.1 deliverable that turns the plan into something a designer or developer can open.

**Independent Test**: Generate for one page type, download the file, open it in a browser, and see the sections in the chosen order.

**Acceptance Scenarios**:

1. **Given** Step 6, **When** the user selects Generate, **Then** a mock page is shown that follows the chosen sections, variants, and order.
2. **Given** a generated mock page, **When** the user selects Export HTML, **Then** an `.html` file downloads and opens standalone in a browser.
3. **Given** the Figma export option, **When** the user looks for it, **Then** it is shown as unavailable ("Coming in v2") and cannot be selected.

---

### Edge Cases

- What happens when the user changes page type after customizing sections in Step 5? (Prototype resets sections; keep that and make it clear.)
- What happens when brief fields are empty at Step 6? (Summary shows "—" for empty values; generation still works.)
- What happens when the exported HTML is opened offline? It must render without external requests.
- What happens when the user returns to Step 1 or 2 after generating?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST offer exactly five page types in Step 2: Business Page, Article, Blog, Services, Search Results. Bio is removed.
- **FR-002**: The system MUST provide a recommended section list for each of the five page types, each section mapped to one approved pattern (hero, accent cards, overview cards, graphic cards, external-link cards, text/media, expanded text, form, promo banner) with at least one variant.
- **FR-003**: The system MUST mark required sections and prevent their removal.
- **FR-004**: Step 1 MUST keep Single page as the only available scope; Multi-page set MUST show as unavailable.
- **FR-005**: The system MUST capture the seven brief fields and require Audience to continue.
- **FR-006**: Users MUST be able to add, remove, reorder sections and change variants in Step 5.
- **FR-007**: Step 6 MUST show a brief summary and section structure before generating.
- **FR-008**: Step 6 MUST generate a mock example page reflecting the selected sections, variants, and order.
- **FR-009**: The system MUST export the mock page as a single standalone HTML file.
- **FR-010**: The system MUST show Figma export as unavailable ("v2") and MUST NOT attempt it.
- **FR-011**: Section list and page type MUST be preserved when navigating back and forward between steps.
- **FR-012**: Blog and Search Results MUST have recommended sections defined [NEEDS CLARIFICATION: section lists for Blog and Search Results are not yet decided. Blog may reuse the current Article list; Search Results has no template yet].
- **FR-013**: The mock page content MUST come from [NEEDS CLARIFICATION: brief and hero content entered by the user, placeholder copy per pattern, or a mix?].
- **FR-014**: The Step 3 "Upload brief document" control MUST [NEEDS CLARIFICATION: stay as a non-functional placeholder in v0.1.1, be hidden, or be built?].

### Key Entities

- **Page type**: One of five templates; determines the starting section list.
- **Section**: A named block on the page mapped to a pattern; has a selected variant, an order position, and a required flag.
- **Pattern**: An approved building block (nine kinds) with named variants.
- **Content brief**: Seven text fields describing audience, service line, goal, actions, required content, and approved copy.
- **Generated page**: The mock example produced from page type, brief, and sections, and its HTML export.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from opening the tool to a downloaded HTML file for any of the five page types in under 10 minutes.
- **SC-002**: 100% of the five page types produce a non-empty recommended section list with required sections marked.
- **SC-003**: The exported HTML opens in a current desktop browser with no external requests and shows all selected sections in order.
- **SC-004**: Removing, reordering, or changing a variant in Step 5 is reflected in the Step 6 summary and the generated page in every case tested.
- **SC-005**: Step 6 never offers an export path other than HTML.

## Assumptions

- Audience is internal marketing, content, design, and development teams at Cigna/Evernorth.
- Pattern and variant definitions are the hardcoded set in the prototype; syncing with Figma or Storybook is out of scope.
- Content rules (character limits, required fields), voice and tone guidance, and validation come from documentation not yet provided and are out of scope.
- Multi-page sets, Primary Care at Home as a page type, and Figma export via Figma MCP are deferred to later versions.
- The plugin plus skills structure (intake, architecture, customize, generate) remains the direction; v0.1.1 delivers it as the single prototype UI, not as separate skills.
- Single user, single session; nothing is saved between sessions.
