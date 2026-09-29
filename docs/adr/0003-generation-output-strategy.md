# Generation Output Strategy: V1 HTML, V2 Figma

* **Status**: Accepted
* **Deciders**: Kriz
* **Date**: 2026-09-29

## Context and Problem Statement

Step 6 (Generate) needs to output a complete page that users can deploy or iterate on. The original brief mentioned dual output (HTML/React + Figma), but Figma MCP integration is not yet available, and building a Figma sync layer is complex. The question: Should generation output HTML in v1 and defer Figma to v2, or attempt both at launch?

## Decision Outcome

**Chosen option: "V1 HTML with mock example, V2 Figma via Figma MCP"**, because it unblocks v1 launch with tangible output, and defers Figma integration to when the Figma MCP is available and stable.

### Positive Consequences

* **V1 ships with output:** Users get a working HTML page they can download, preview, or deploy
* **Example-driven:** Mock example shows what a generated page looks like, builds confidence
* **Figma deferred responsibly:** No rushed Figma sync implementation; wait for MCP stability
* **Shorter v1 cycle:** HTML generation is simpler than Figma + HTML dual output
* **Users can iterate:** HTML output can be edited in code, handed off to engineering
* **Clear v2 scope:** Figma integration becomes a discrete v2 feature with its own ADR

### Negative Consequences

* **Figma gap:** Design-to-code handoff still manual in v1; Figma file not auto-generated
* **Two-tool workflow:** Users must export HTML from plugin, then manually sync to Figma (or vice versa)
* **V2 complexity:** Figma MCP integration will be non-trivial; adds technical debt to v2 roadmap
* **User friction:** Designers may expect Figma file output; HTML-only may feel incomplete

## Pros and Cons of the Options

### Option 1: V1 HTML, V2 Figma (Chosen)

* Good, because HTML is self-contained and deployable without external dependencies
* Good, because mock example provides immediate gratification and confidence
* Good, because Figma MCP integration can be done carefully in v2 without blocking v1
* Good, because splits scope into manageable chunks
* Bad, because v1 doesn't produce Figma file (design-to-code gap remains)
* Bad, because users must manage two outputs manually until v2

### Option 2: V1 HTML + Figma (Both at Launch)

* Good, because closes the design-to-code loop in v1
* Good, because aligns with original dual-output vision
* Bad, because Figma MCP is not yet available or stable
* Bad, because rolling custom Figma API sync is complex and risky
* Bad, because scope explosion delays v1 launch
* Bad, because Figma sync bugs would block v1 release

### Option 3: V1 Figma Only

* Good, because designers get native Figma output
* Good, because Figma is the source of truth for design teams
* Bad, because engineers can't easily deploy or iterate on HTML
* Bad, because no rendered, testable output
* Bad, because misses the engineering-friendly HTML use case

## Implementation Notes

**V1 HTML Generation:**
- Collect brief + sections + content from Steps 1–5
- Map to HTML template (using stored component specs or patterns)
- Mock example: show what a "Business Page" generates with placeholder content
- Export: downloadable .html file or code preview in modal
- No styling framework decision yet (Tailwind? CSS Modules? Inline?)

**V2 Figma Integration:**
- Depends on Figma MCP availability and stability
- Will need separate ADR for Figma sync strategy
- May require: Figma API auth, frame creation, component instance mapping, style sync

## Related Decisions

* **ADR-0001**: Plugin + Skills Architecture (v1 skills handle HTML only)
* **ADR-0002**: Page Type Selection (Section architecture determines HTML template)
* **ADR-0004** (forthcoming): Pattern Data Source Integration
* **ADR-0005** (forthcoming): V2 Figma MCP Integration Strategy
