# Research & Decisions: Page Builder v0.1.1

Converted from the earlier ADR log. Each entry: decision, rationale, alternatives considered.

## 1. Plugin plus skills structure

- **Decision**: Plugin is the entry point and orchestrator; four skills handle intake, architecture, customize, and generate.
- **Rationale**: Marketing teams invoke one repeatable flow while design and engineering extend or version pieces independently (new page types, pattern updates, generation).
- **Alternatives**: One monolithic plugin (harder to extend, releases coupled across teams); skills only with no plugin wrapper (no guided flow, easy to skip steps).
- **Consequence for v0.1.1**: Delivered as the single prototype UI. Splitting into skills comes later.

## 2. Page types

- **Decision**: Business Page, Article, Blog, Services. Bio removed. Search Results dropped for now.
- **Rationale**: Matches the page types teams are building; Bio had no current use. Search Results has no section design yet.
- **Alternatives**: Keep Bio alongside the new types (six types, one with no use case); keep the original four (no Blog).
- **Open**: Blog sections. Starts as a copy of Article.

## 3. Generation output

- **Decision**: v1 generates a mock page and exports standalone HTML. v2 adds Figma export once Figma MCP can be used.
- **Rationale**: HTML ships now and is easy to open and share; Figma depends on tooling that is not available yet.
- **Alternatives**: HTML and Figma together in v1 (blocked, larger scope); Figma only (no shareable output for developers).

## 4. Mock rendering approach

- **Decision**: Lightweight mock components with inline styles and inline SVG; the same components render in the app and in the export.
- **Rationale**: Exported file must work offline with no external requests. Tailwind classes would not carry into a standalone file without also inlining a stylesheet.
- **Alternatives**: Ship the compiled app stylesheet inside the export (larger, more moving parts); hand-write a separate HTML template per pattern (two sources of truth).

## 5. Demo media

- **Decision**: SVGs provided by the project owner, bundled with the tool and inlined into the export.
- **Alternatives**: In-tool SVG upload (more UI and validation than an MVP needs); placeholder boxes only (weaker demo).

## 6. Brief input

- **Decision**: Paste-brief control opens a text area. The text is stored and editable. It does not fill the seven fields in v0.1.1.
- **Alternatives**: Real file upload for .doc/.docx/.pdf/.txt (parsing work); auto-splitting pasted text into fields (needs rules or a model call).

## Deferred: pattern and content data

Pattern rules will come from Figma and Storybook. Content rules and voice and tone come from documentation not yet provided. Both are out of scope for v0.1.1 and will be added as their sources arrive.
