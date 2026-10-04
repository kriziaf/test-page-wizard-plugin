# Feature Specification: Figma export plugin (tool-agnostic)

**Feature Branch**: `003-figma-export-plugin`

**Created**: 2026-10-03

**Status**: Draft — design only, no plugin code written yet

**Input**: User description: "Design a way to push Page Builder's generated page into Figma that works regardless of which AI coding tool (Claude Code, Cursor, etc.) is used — a real Figma plugin, not an AI-agent skill tied to one tool's MCP server."

## Problem & decision

A prior approach (see `specs/004-figma-export-agent-skill-reference/spec.md`) pushed a
generated mock page into Figma using an AI agent (Claude Code) driving the Figma MCP
server's Plugin-API bridge. That worked, but it is tied to one coding tool and one Figma
MCP server's specific tool surface. The user also uses Cursor, which connects to a
different Figma MCP server with a different tool surface — so the agent-skill approach
would need a separate reimplementation per tool, and would break again the next time
either tool's MCP integration changes.

**Decision**: build a real Figma plugin instead — ordinary code that runs inside Figma
itself, invoked by a human. No AI agent or MCP server is involved at the point of
execution. Whichever coding tool helps write the plugin only matters once, at build time;
after that, running it is identical regardless of tool.

This closes the same gap the project has already identified and deferred: Step 6's
"Figma (v2)" button is shown disabled today (`specs/001-page-builder-v0-1-1/tasks.md:24`,
task T010), and `research.md:21-23` names "Figma export via Figma MCP" as the planned v2
approach with no implementation detail specified. This spec is one way of closing that
gap — a standalone plugin invoked by a human from within Figma, as distinct from Figma
export becoming a native in-app button (a different, larger alternative not designed
here).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import a generated page into Figma as editable artwork (Priority: P1)

A user has generated a mock page in Page Builder (Step 6) and exported it as HTML. They
want that page's sections to appear in a Figma file as real, editable vector layers —
not a flattened screenshot — without needing any particular AI coding assistant running.

**Why this priority**: This is the entire feature. Everything else supports it.

**Independent Test**: Generate a page, export its HTML, open Figma, run the plugin,
select the exported file, and confirm the sections appear in Figma in the same order as
the original page, as editable vector layers.

**Acceptance Scenarios**:

1. **Given** an HTML file exported from Page Builder's Step 6, **When** the user runs the
   plugin and selects that file, **Then** each section's SVG artwork appears in Figma as
   an editable vector layer, in the same order as the source page.
2. **Given** the import completes, **When** the user looks at the result, **Then** all
   sections are wrapped in a single named frame (not scattered loose on the canvas), and
   the viewport has scrolled/zoomed to show it.
3. **Given** a section whose SVG is very large (hundreds of KB, embedded raster images),
   **When** it is imported, **Then** it succeeds without hitting any script- or
   payload-size error — the plugin calls the Plugin API directly and has no such limit.

---

### Edge Cases

- What happens if the selected file isn't a valid Page Builder export (wrong format, no
  `data-section` blocks)? The plugin MUST fail clearly in its UI rather than silently
  importing nothing or crashing.
- What happens if a section in the HTML has no `<svg>` content (a "No drawing yet"
  placeholder block, per `exportHtml.ts`)? The plugin MUST skip that section and report
  which ones were skipped, rather than importing an empty frame for it.
- What happens if the user runs the plugin without anything useful on the clipboard/file
  picker? The UI MUST prompt for a file rather than doing nothing.
- What happens on repeated imports of the same export? Out of scope to dedupe/update in
  place for v1 — each run creates a new frame. Updating an existing frame in place is a
  later-version concern.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The plugin MUST accept a Page Builder–exported standalone HTML file via a
  file picker in its UI.
- **FR-002**: The plugin MUST parse that HTML to find each `<section data-section=
  "{pattern}--{variant}">...</section>` block and extract its inline `<svg>` markup, in
  document order. This parsing MUST happen in the plugin's UI iframe context (which has a
  full DOM/`DOMParser`), not in the plugin's main thread (which does not).
- **FR-003**: For each extracted SVG, the plugin's main thread MUST import it as an
  editable vector node tree via `figma.createNodeFromSvg(svgString)`. The UI thread MUST
  hand off the parsed `{pattern, variant, svg}` list to the main thread via
  `postMessage`, since only the main thread can call `figma.*`.
- **FR-004**: The plugin MUST wrap all imported section nodes into a single
  `figma.createAutoLayout('VERTICAL', …)` frame, sized to match the source page's width
  (1440px, matching the app's generated output), in the same order as the source HTML.
- **FR-005**: The plugin MUST name the resulting frame from the source HTML's `<title>`
  (or a sensible fallback if absent).
- **FR-006**: After import, the plugin MUST scroll/zoom the viewport to the new frame
  (`figma.viewport.scrollAndZoomIntoView`) so the result is immediately visible.
- **FR-007**: The plugin MUST NOT be constrained by any script-payload size limit when
  importing large SVGs — it calls `createNodeFromSvg` directly in plugin code, which has
  no such ceiling (unlike an MCP tool-call wrapper, which may impose one).
- **FR-008**: Sections with no `<svg>` content in the source HTML (placeholder blocks)
  MUST be skipped, with the skipped section(s) reported to the user in the plugin UI.
- **FR-009**: The plugin MUST run entirely from Figma's own Plugin menu (dev-mode import
  via manifest, or later publishing) — it MUST NOT require any AI coding assistant, MCP
  server, or external agent to be running at the point of use.

### Key Entities

- **Page Builder export**: The standalone HTML file produced by the app's existing
  "Export HTML" feature (`src/app/export/exportHtml.ts`) — unchanged, reused as-is as
  this plugin's input format.
- **Plugin UI thread**: The sandboxed HTML/iframe part of the plugin; has DOM access;
  responsible for the file picker and HTML parsing.
- **Plugin main thread**: The sandboxed JS part of the plugin with `figma.*` access; no
  DOM; responsible for node creation and layout.
- **Imported frame**: The single top-level Figma frame produced per import run,
  containing all section nodes in source order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with no AI coding assistant open or configured can still complete an
  import end to end, using only the app's existing Export HTML button and this plugin.
- **SC-002**: Every section present in a given export (with SVG content) appears in the
  resulting Figma frame, in the same order, with no size-related import failures.
- **SC-003**: The same export file produces the same result whether the plugin was built
  with the help of Claude Code, Cursor, or any other coding tool — the plugin's behavior
  at runtime does not depend on which tool wrote it.

## Assumptions

- The user runs the plugin manually from within Figma; no scheduled/automatic import is
  in scope for v1.
- v1 takes its input via a manual file picker (the user has already clicked "Export HTML"
  in the app, in a normal browser, where that button already works reliably). A later
  version could have the plugin fetch directly from a running local dev server URL
  instead, which would need `networkAccess` entries in the manifest and more moving
  parts — not designed here, flagged as a future option only.
- Distribution for v1 is a private/dev-mode plugin (Figma → Plugins → Development →
  Import plugin from manifest), good enough for solo/internal use. Publishing to a team
  or the Community is a later, separate decision.
- This plugin is independent of, and does not require, any Figma MCP server, Claude
  Code project skill, or Cursor configuration. See
  `specs/004-figma-export-agent-skill-reference/spec.md` for the (non-executable,
  reference-only) agent-skill alternative this supersedes as the recommended approach.
- The 50,000-character script-payload limit encountered when driving this via the Figma
  MCP's `use_figma` tool is a constraint of that specific MCP bridge, not of Figma's
  Plugin API. A real plugin calling `createNodeFromSvg` directly has no such ceiling,
  which is part of why this approach is simpler, not only more portable.

## Implementation notes (non-binding, for whoever builds this)

- Suggested new top-level directory: `figma-plugin/` (sibling to `src/`), containing
  `manifest.json`, a main-thread entry (e.g. `code.ts`), and a UI entry (e.g. `ui.html` +
  its own small script) — not created this round.
- `manifest.json` MUST set `editorType: ["figma"]` and point `main`/`ui` at the built
  outputs of the above.
- The UI/main-thread split (FR-002/FR-003) is the main non-obvious architectural point —
  state it clearly in any implementation so it isn't rediscovered the hard way.
