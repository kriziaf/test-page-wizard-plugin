# Architecture Decision Records (ADRs)

This directory contains architecture decisions for the Page Builder plugin, captured using the MADR (Markdown Architecture Decision Record) framework.

## Index

| ADR | Title | Status | Date | Context |
|-----|-------|--------|------|---------|
| [0001](./0001-plugin-plus-skills-architecture.md) | Plugin + Skills Architecture | Accepted | 2026-09-29 | How to structure the plugin for cross-team extensibility and repeatable invocation |
| [0002](./0002-page-type-selection-update.md) | Page Type Selection Update: Blog & Search Results | Accepted | 2026-09-29 | Update page types to align with actual marketing workflows |
| [0003](./0003-generation-output-strategy.md) | Generation Output Strategy: V1 HTML, V2 Figma | Accepted | 2026-09-29 | V1 ships HTML-only with mock example; Figma integration deferred to v2 |
| [0004](#) | Pattern Data Source Integration | *Proposed* | — | How to connect Figma/Storybook pattern documentation |
| [0005](#) | Content Brief Form Structure | *Proposed* | — | Form fields, validation rules, content guidance integration |
| [0006](#) | Content Validation & Enforcement | *Proposed* | — | Rules engine for character limits, required fields, restricted patterns |
| [0007](#) | Voice & Tone Guidelines Integration | *Proposed* | — | How to layer in brand voice/tone per page type |

## How to Use

When a major architectural decision is finalized:

1. Create a new `.md` file: `000N-short-title.md`
2. Use the MADR template (see below)
3. Update this `README.md` to link the new ADR
4. Move status from "Proposed" to "Accepted" (or "Rejected", "Superseded" as appropriate)

## MADR Template

```markdown
# [Short title of solved problem]

* **Status**: [Proposed | Accepted | Rejected | Superseded]
* **Deciders**: [Names]
* **Date**: [YYYY-MM-DD]

## Context and Problem Statement
[Describe the context and the problem we are trying to solve. What forces are at play?]

## Decision Outcome
Chosen option: "[Selected Option]", because [justification of the choice].

### Positive Consequences
* [Consequence 1]
* [Consequence 2]

### Negative Consequences
* [Consequence 1]
* [Consequence 2]

## Pros and Cons of the Options

### [Option 1: Short Title]
* Good, because [argument]
* Bad, because [argument]

### [Option 2: Short Title]
* Good, because [argument]
* Bad, because [argument]

## Related Decisions
* **ADR-NNNN**: [Title if this ADR is related to or supersedes another]
```

## Status Legend

* **Proposed**: Decision has been suggested but not yet finalized
* **Accepted**: Decision is finalized and the team is proceeding with it
* **Rejected**: Decision was considered but not chosen
* **Superseded**: Decision was accepted but has since been replaced by a newer ADR
