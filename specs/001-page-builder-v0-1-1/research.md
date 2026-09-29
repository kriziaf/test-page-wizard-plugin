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

## 4. Pattern registry and mock rendering

- **Decision**: A folder of SVGs is the pattern registry, one file per variant named `{pattern}--{variant}.svg`. The mock page stacks the static SVGs (option A). The same SVG text is inlined into the HTML export.
- **Rationale**: Patterns are building blocks the owner defines visually. Drawing them as SVGs avoids building a component library, adding a variant needs no code, and the export works offline with no external requests.
- **Alternatives**: Coded mock components per pattern (a component library in miniature, two things to maintain); SVGs with tagged text slots that swap in user content (option B, more work, deferred to v0.2); ship the compiled app stylesheet in the export (larger, more moving parts).

## 5. Pattern set

- **Decision**: The thirteen patterns in `src/app/patterns/README.md` replace the prototype's nine. Names and variants follow that document.
- **Rationale**: The document is the owner's definition of the building blocks the page builder must build to.
- **Alternatives**: Keep the prototype's nine and map the new ones onto them (loses the documented variants).
- **Open**: Which patterns each page type recommends.

## 6. Brief input

- **Decision**: Paste-brief control opens a text area. The text is stored and editable. It does not fill the seven fields in v0.1.1.
- **Alternatives**: Real file upload for .doc/.docx/.pdf/.txt (parsing work); auto-splitting pasted text into fields (needs rules or a model call).

## Deferred: pattern and content data

Pattern rules will come from Figma and Storybook. Content rules and voice and tone come from documentation not yet provided. Both are out of scope for v0.1.1 and will be added as their sources arrive.
