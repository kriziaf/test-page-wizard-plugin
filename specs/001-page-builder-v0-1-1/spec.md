# Feature Specification: Page Builder v0.1.1

**Feature Branch**: `001-page-builder-v0-1-1`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Page Builder plugin: assemble pages from approved templates, pattern rules, and content guidance through a 6-step flow (scope, page type, content brief, architecture, review, generate). v0.1.1 finalizes the page types, adds a paste-in text brief, and registers the documented building-block patterns from a folder of SVGs, and makes Generate produce a mock page stacked from those SVGs that can be exported as HTML. Figma export is v2."

## Baseline (what exists today)

The `v0.1 · prototype` already runs the 6-step flow end to end with sample content (Business Page, GLP-1 pharmacy brief). Sidebar navigation, step gating, section lists per page type, variant selection, reorder/remove, hero content editing, and a wireframe preview are in place. Step 1 shows Single page (available) and Multi-page set ("Coming soon"). Step 6 currently ends at a "Page spec ready" confirmation. There is no export.

Known gaps in the prototype that v0.1.1 closes: Step 2 still offers Bio (not Blog); the Step 3 "Upload brief document" control does nothing; the Step 5 "Add section" button has no behavior; Step 6 has no mock page or export.

Everything else in the prototype is kept as is.

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

The user picks one of four page types and receives a starting list of sections mapped to approved patterns.

**Why this priority**: The section recommendation is the core value of the tool and drives every later step.

**Independent Test**: Select each page type and confirm a section list appears with required sections marked.

**Acceptance Scenarios**:

1. **Given** Step 2, **When** the user views page types, **Then** exactly these are offered: Business Page, Article, Blog, Services.
2. **Given** a page type is selected, **When** the user reaches Step 4, **Then** the recommended sections for that type are shown, each mapped to a pattern.
3. **Given** the user changes page type after sections exist, **When** they return to Step 4, **Then** sections reflect the new type.

---

### User Story 3 - Capture the content brief (Priority: P2)

The user describes audience, service line, page goal, primary and secondary actions, required content, and existing approved copy. They can also paste a full text brief.

**Why this priority**: The brief feeds the summary and, later, generation and validation.

**Independent Test**: Fill only Audience and advance; paste a text brief and see it kept; fill all fields and see them in the Step 6 summary.

**Acceptance Scenarios**:

1. **Given** Step 3 with Audience empty, **When** the user tries to continue, **Then** they cannot advance.
2. **Given** Step 3, **When** the user selects the paste-brief control, **Then** a text area opens where they can paste or type a full brief and edit it.
3. **Given** a pasted text brief, **When** the user leaves and returns to Step 3, **Then** the text is still there.
4. **Given** all brief fields are filled, **When** the user reaches Step 6, **Then** the summary shows the entered values.

---

### User Story 4 - Review and customize sections (Priority: P2)

The user adds, removes, and reorders sections and chooses a variant per section, with required sections protected.

**Why this priority**: Lets teams adapt the recommendation without leaving the approved pattern set.

**Independent Test**: Reorder two sections, remove an optional one, add it back, change a variant, and confirm the changes carry to Step 6.

**Acceptance Scenarios**:

1. **Given** a required section, **When** the user tries to remove it, **Then** it stays.
2. **Given** an optional section, **When** the user removes it, **Then** it disappears from the list and the Step 6 structure.
3. **Given** a section that was removed, **When** the user selects Add section, **Then** they can choose from the approved sections not currently on the page and it is added.
4. **Given** the section list is empty, **When** the user tries to continue, **Then** they cannot advance.

---

### User Story 5 - Generate a mock page and export it as HTML (Priority: P1)

At Step 6 the user generates a mock example of the page, stacked from the pattern SVGs for the chosen sections and variants, and exports it as an HTML file.

**Why this priority**: This is the v0.1.1 deliverable that turns the plan into something a designer or developer can open.

**Independent Test**: Generate for one page type, download the file, open it in a browser, and see the pattern SVGs in the chosen order and variants.

**Acceptance Scenarios**:

1. **Given** Step 6, **When** the user selects Generate, **Then** a mock page is shown that follows the chosen sections, variants, and order.
2. **Given** a section with a chosen pattern and variant, **When** the mock page renders, **Then** the SVG registered for that pattern and variant is shown.
3. **Given** a variant with no SVG yet, **When** the mock page renders, **Then** a labeled placeholder block naming the pattern and variant is shown instead.
4. **Given** a generated mock page, **When** the user selects Export HTML, **Then** an `.html` file downloads and opens standalone in a browser.
5. **Given** the Figma export option, **When** the user looks for it, **Then** it is shown as unavailable ("Coming in v2") and cannot be selected.

---

### Edge Cases

- What happens when the user changes page type after customizing sections in Step 5? (Prototype resets sections; keep that and make it clear.)
- What happens when brief fields are empty at Step 6? (Summary shows "—" for empty values; generation still works.)
- What happens when the pattern SVG folder has a file that matches no documented pattern or variant? It is ignored and reported in a dev-time check.
- What happens when the exported HTML is opened offline? It must render without external requests, including the SVGs.
- What happens when the user returns to Step 1 or 2 after generating?
- What happens when Add section is used and every approved section is already on the page? The control is disabled or says nothing is left to add.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST offer exactly four page types in Step 2: Business Page, Article, Blog, Services. Bio is removed. Search Results is not offered in v0.1.1.
- **FR-002**: The system MUST provide a recommended section list for each of the four page types, each section mapped to one approved pattern with at least one variant. The approved patterns are the thirteen in `src/app/patterns/README.md`: Overview Cards, Accent Cards, Graphic Cards, Horizontal Cards, External Link Cards, Bullet Image, Text Media, Expanded Text, Longform Text, Hero Primary, Hero Secondary, Two-Col Form, Promo Banner Card. Pattern and variant names follow that document. Recommended sections per page type are listed under "Recommended Sections" below. Hero Primary is used on Business Page and Services only. Highlight Band (stats band, `subtle` and `brand`) is a fourteenth pattern added after the documented set; its documentation is not yet written.
- **FR-003**: The system MUST mark required sections and prevent their removal.
- **FR-004**: Step 1 MUST keep Single page as the only available scope; Multi-page set MUST show as unavailable.
- **FR-005**: The system MUST capture the seven brief fields and require Audience to continue.
- **FR-006**: Step 3 MUST replace "Upload brief document" with a paste-brief control that opens an editable text area for a full text brief. The pasted text MUST persist while the user moves between steps. Pasting does not fill the seven fields automatically in v0.1.1.
- **FR-007**: Users MUST be able to add, remove, reorder sections and change variants in Step 5. Add section MUST offer the approved sections for the page type that are not currently on the page.
- **FR-008**: Step 6 MUST show a brief summary and section structure before generating.
- **FR-009**: Step 6 MUST generate a mock page by stacking, in order, the SVG for each selected section's pattern and variant.
- **FR-010**: Patterns and variants MUST be registered from a folder of SVGs in the repository, named `{pattern}--{variant}.svg`. Adding a correctly named SVG makes that variant available with no code change. Variant names come from the pattern documentation; where it lists none (the card patterns), the name describes the drawing.
- **FR-011**: A pattern variant with no SVG MUST render as a labeled placeholder block, and the system MUST report registered patterns and variants that are missing an SVG during development.
- **FR-012**: The system MUST export the mock page as a single standalone HTML file with the SVGs included.
- **FR-013**: The system MUST show Figma export as unavailable ("v2") and MUST NOT attempt it.
- **FR-014**: Page type, brief, pasted text, and sections MUST be preserved when navigating back and forward between steps.
- **FR-015**: The Blog page type MUST have a recommended section list. For v0.1.1 it is the same as Article's.

### Recommended Sections

First draft, approved for v0.1.1 and open to adjustment in later versions. **R** = required (cannot be removed). Each section uses the pattern in the second column; the variant defaults to the first documented variant and can be changed in Step 5.

| # | Business Page | Article | Blog | Services |
|---|---|---|---|---|
| 1 | Hero Primary **R** | Hero Secondary **R** | Hero Secondary **R** | Hero Primary **R** |
| 2 | Overview Cards | Longform Text **R** | Longform Text **R** | External Link Cards |
| 3 | Text Media | Text Media | Text Media | Expanded Text |
| 4 | Accent Cards **R** | Horizontal Cards | Horizontal Cards | Text Media |
| 5 | Promo Banner Card | External Link Cards | External Link Cards | Accent Cards |
| 6 | Two-Col Form **R** | Accent Cards **R** | Accent Cards **R** | Promo Banner Card **R** |
| 7 | | | | Two-Col Form |

Notes: Services was validated against the four reference templates in `src/app/patterns/templates/services-page/`, which end with a branded CTA banner (Promo Banner Card `branded-cta`) and a Two-Col Form. Graphic Cards is parked for Services and available through Add section. Accent Cards stands in for the earlier "Author bio" section on Article and Blog. Bullet Image, Highlight Band and Graphic Cards (on Services) are not in a recommended list and are available through Add section. Expanded Text is recommended on Services only.

### Key Entities

- **Page type**: One of four templates; determines the starting section list.
- **Section**: A named block on the page mapped to a pattern; has a selected variant, an order position, and a required flag.
- **Pattern**: An approved building block (fourteen kinds; thirteen documented in `src/app/patterns/README.md`, plus Highlight Band) with named variants.
- **Pattern SVG**: A wireframe-style drawing of one pattern variant, supplied by the project owner. It is the only visual used for that variant in the mock page. Not a production component.
- **Content brief**: Seven text fields plus an optional pasted text brief.
- **Generated page**: The mock page produced from page type, brief, and sections, and its HTML export.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can go from opening the tool to a downloaded HTML file for any of the four page types in under 10 minutes.
- **SC-002**: 100% of the four page types produce a non-empty recommended section list with required sections marked.
- **SC-003**: The exported HTML opens in a current desktop browser with no external requests and shows the SVG for every selected section in order.
- **SC-004**: Removing, adding, reordering, or changing a variant in Step 5 is reflected in the Step 6 summary and the generated page in every case tested.
- **SC-005**: A text brief pasted in Step 3 is still present after moving to any other step and back.
- **SC-006**: Step 6 never offers an export path other than HTML.

## Assumptions

- Audience is internal marketing, content, design, and development teams at Cigna/Evernorth.
- Pattern and variant definitions come from the pattern documentation and the SVG folder; syncing with Figma or Storybook is out of scope.
- Content rules (character limits, required fields), voice and tone guidance, and validation come from documentation not yet provided and are out of scope.
- Multi-page sets, Search Results, Primary Care at Home, and Figma export via Figma MCP are deferred to later versions.
- Pattern SVGs are drawn by the project owner and bundled with the tool; users cannot upload their own SVGs in v0.1.1.
- Pattern SVGs are static, with placeholder text baked in. The mock page does not show the brief or hero content in v0.1.1. Tagged text slots that swap in user content are a later version.
- Longform Text has mock drawings (plain text on white) in place of final ones. The owner replaces them in place, keeping the file names.
- Image areas in Text Media, Bullet Image, and Overview Cards (stacked-right) show a neutral mock image drawn into the SVG.
- Pattern SVGs are approximations for demonstration; matching the production component library is out of scope.
- The mock is a wireframe-level view of structure and variant choice, not a rendering of the user's content.
- Blog uses the Article section list until real Blog sections are defined.
- Add section offers removed recommended sections plus patterns not in the recommended list, and never offers Hero Primary outside Business Page and Services.
- The mock is built and reviewed one page type at a time: Services first (validated against the reference templates), then Business Page, then Article (with Blog, which shares its list).
- Versioning: one spec folder per release. When a release starts bundling several independent features, switch to one folder per feature with git tags marking releases. A `v0.1.1` git tag is added when this release ships.
- The plugin plus skills structure (intake, architecture, customize, generate) remains the direction; v0.1.1 delivers it as the single prototype UI, not as separate skills.
- Single user, single session; nothing is saved between sessions.
