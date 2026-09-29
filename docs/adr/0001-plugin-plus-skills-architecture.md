# Plugin + Skills Architecture for Page Builder

* **Status**: Accepted
* **Deciders**: Kriz
* **Date**: 2026-09-29

## Context and Problem Statement

The Page Builder plugin needs to serve both marketing teams (who will invoke it repeatedly with the same workflow) and developer/designer teams (who need to extend it with new page types and pattern rules). A monolithic plugin approach would fragment across teams and make maintenance difficult.

The question: Should the plugin be a single, unified experience, or should it be composed of modular, reusable skills that can be versioned and improved independently?

## Decision Outcome

**Chosen option: "Plugin + Skills Architecture"**, because it scales across cross-functional teams without fragmenting into bespoke one-offs, allows independent versioning and iteration, and provides clear extension points for developers and designers while keeping the entry point simple for marketing users.

### Positive Consequences

* **Repeatable invocation**: Marketing teams call `/page-builder` and get the same structured workflow every time
* **Independent skill versioning**: Each skill (`intake-brief`, `architecture-builder`, `customize`, `generate`) can be updated without rebuilding the whole plugin
* **Clear extension points**: Developers can add new page types as skills; designers can layer in pattern updates from Figma/Storybook without touching core workflow
* **Team autonomy**: Design system team owns pattern rules, marketing ops owns tone/voice guidance, engineering owns generation logic—each can move independently
* **Phased capability delivery**: Voice/tone, pattern data, validation rules can be wired in as they're documented (not blockers for launch)
* **Easier testing and debugging**: Individual skills can be tested in isolation before integration

### Negative Consequences

* **More complex orchestration**: Plugin must coordinate state and handoffs across multiple skills (not a single monolithic flow)
* **Harder to debug end-to-end**: Problems may span skill boundaries, requiring cross-skill investigation
* **Skill dependency management**: If one skill breaks, users may not be able to proceed (needs clear error handling and fallbacks)
* **Additional documentation burden**: Each skill needs clear input/output contracts and error states

## Pros and Cons of the Options

### Option 1: Plugin + Skills (Chosen)

* Good, because it supports repeatable invocation by marketing teams without rebuilding
* Good, because skills can be versioned and improved independently
* Good, because it creates clear extension points for new page types and pattern data
* Good, because it aligns with team structure (design systems, marketing ops, engineering working in parallel)
* Bad, because orchestration across skills adds complexity
* Bad, because cross-skill bugs are harder to trace
* Bad, because it requires robust error handling and skill-to-skill contracts

### Option 2: Unified Plugin (Monolithic)

* Good, because the entire workflow is self-contained and easier to debug
* Good, because there are no cross-skill dependencies or handoff points
* Bad, because marketing teams can't invoke it repeatably—each call requires re-entry from scratch
* Bad, because new page types or pattern updates require rebuilding the entire plugin
* Bad, because it creates bottlenecks: design system team, marketing ops, and engineering all need to coordinate on a single release
* Bad, because it fragments into bespoke variants when teams need different behaviors

### Option 3: Standalone Skills Only (No Plugin Wrapper)

* Good, because maximum modularity and autonomy for each skill
* Bad, because marketing teams have no entry point or guided experience—they'd need to invoke multiple skills in sequence
* Bad, because the workflow is implicit, not enforced; easy for users to skip steps or get lost
* Bad, because no shared state management across steps

## Related Decisions

* **ADR-0002** (forthcoming): Content Brief form structure and validation rules
* **ADR-0003** (forthcoming): Generation output strategy (React/HTML + Figma sync)
* **ADR-0004** (forthcoming): Pattern data source integration (Figma/Storybook)
