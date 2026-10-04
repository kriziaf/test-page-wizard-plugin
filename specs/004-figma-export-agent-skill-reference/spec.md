> ⚠️ **Reference only — not an active skill.** This document describes a possible
> Claude-Code-specific project skill for pushing Page Builder output to Figma via the
> Figma MCP server. It is intentionally saved under `specs/`, **not** under
> `.claude/skills/**`, so Claude Code will never auto-discover or auto-trigger it. It is
> also Claude-Code/Anthropic-Figma-MCP-specific and will **not** work unmodified in
> Cursor or with a different Figma MCP server — see
> [`specs/003-figma-export-plugin/spec.md`](../003-figma-export-plugin/spec.md) for the
> tool-agnostic alternative, which is the recommended approach going forward. Copy this
> content into `.claude/skills/figma-export/SKILL.md` only if the agent-skill approach is
> deliberately chosen later, with the Cursor/other-tool limitation understood.

# Reference Design: `figma-export` Claude Code project skill

**Status**: Reference only, not installed, not executable as written.

**Created**: 2026-10-03

**Why this exists**: this was the original plan for making the Figma-export workflow
repeatable, before the user clarified that Cursor (also in use) connects to a different
Figma MCP server, which would require a separate rewrite of this skill per tool. Rather
than discard the design work, it's preserved here as reference material.

## What this skill would do, if installed

A Claude Code project skill that pushes a Page Builder–generated mock page into a
user-specified Figma file via the Figma MCP server, without the user needing to drive
the process manually each time.

## Proposed frontmatter (example only — not a live file)

```yaml
---
name: figma-export
description: >
  Use when the user wants Page Builder's generated page pushed into Figma —
  trigger phrases like "push this to Figma", "export this page to Figma",
  "send the generated sections to Figma", "put the mock page in Figma",
  "generate a Figma design from Page Builder output". Drives the app to
  Step 6, reads the exact generated section list from the DOM, and uploads
  each section's pattern SVG into a user-supplied Figma file via the Figma
  MCP server's upload_assets tool. This is a manual stand-in for the app's
  own disabled "Figma (v2)" button (tasks.md T010) — it does not modify the
  app or write any files inside this repo.
disable-model-invocation: false
---
```

## Prerequisites

- Figma MCP server connected.
- User has supplied a `figma.com/design/...` URL → extract `fileKey`. **Never guess,
  never create a new file** — stop and ask if not given.
- Load `figma-use` fresh every session via the MCP resource before any `use_figma` call —
  do not vendor a copy into this repo, since it can drift out of date.
- `figma-generate-design` is usually *not* needed: this workflow uploads raw pattern SVGs
  as vector trees, it isn't translating app UI into existing design-system components, so
  that skill's component-discovery half doesn't apply here.
- Batch-load `use_figma`, `upload_assets`, `get_screenshot` via one `ToolSearch` call if
  they're deferred tools.

## Procedure

1. Start the app: `npm install` (not `pnpm install` — see Gotchas), `npm run dev` (runs
   `predev` → `scripts/optimize-patterns.mjs`, populates
   `src/app/patterns/_generated/*.svg`). Confirm `http://localhost:5173` actually renders
   Step 1 before continuing.
2. Drive Steps 1→6 (brief/page-type per the user's instructions, or state sensible
   defaults back to them), click "Generate page," wait for `[data-testid="mock-page"]`.
3. Extract the section list from the DOM — **never from a screenshot**. Query
   `[data-testid="mock-page"] [data-section]`, read each `data-section` attribute in
   order. Each value is already the exact `{pattern}--{variant}` filename stem
   (`src/app/mock/MockPage.tsx:62-64`, mirrored in `src/app/export/exportHtml.ts:12`).
4. Resolve each to `src/app/patterns/_generated/{pattern}--{variant}.svg`
   (`src/app/patterns/registry.ts:41,50-58`). Read raw bytes directly — skip
   `buildHtml()` entirely, there's no need to reconstruct standalone HTML for this path.
5. Confirm the target Figma `fileKey` (from Prerequisites).
6. Upload via `upload_assets`, not `use_figma`: request `count = N` URLs with
   `currentPageId` set, then `curl -F "file=@<path>;type=image/svg+xml;filename=..."
   <uploadUrl>` per section. Collect each `placedOnNodeId` in section order.
7. Wrap into one frame: load `figma-use`, run one `use_figma` script —
   `figma.createAutoLayout('VERTICAL', …)` at 1440px wide, append the resolved node IDs
   (as string literals) in step 3's order, return all created/mutated IDs.
8. Validate: `get_screenshot` on the new frame; cross-check child count/order against the
   step 3 scrape; flag (don't silently drop) any section with no matching SVG.

## Gotchas (symptom → cause → fix)

- In-app "Export HTML" doesn't reliably download under browser automation
  (`exportHtml.ts`'s blob-URL + synthetic `<a download>` click) — don't rely on it for
  this procedure; use steps 3–4 to get the section list and SVGs directly instead.
- pnpm/corepack is commonly broken in this environment: `Cannot find module
  '.../corepack/v1/pnpm/<ver>/bin/pnpm.cjs' ... MODULE_NOT_FOUND`; `pnpm-workspace.yaml`
  also restricts `supportedArchitectures.os` to `linux` only. Use `npm install`
  (`package-lock.json` exists alongside `pnpm-lock.yaml`).
- `use_figma`'s `code` parameter has a 50,000-character ceiling; these SVGs run
  122KB–366KB (embedded base64 photos) even after optimization — inline embedding is
  categorically not viable through this tool. `upload_assets` is a file transfer, not a
  scripted payload, so it sidesteps the limit. (Note: this limit is specific to this MCP
  bridge — see `specs/003-figma-export-plugin/spec.md` for why a real Figma plugin
  doesn't have this problem at all.)
- No GNU `timeout` on macOS — poll dev-server readiness with a curl-retry loop instead.
- Empty `_generated/` → every section renders "No drawing yet." — means `predev` didn't
  run; check before assuming this procedure is broken.
- Don't vendor `figma-use`/`figma-generate-design` into this repo.
- `figma-generate-design`'s `search_design_system` + component-discovery workflow mostly
  doesn't apply here — no design system is being matched, only raw SVGs vectorized.

## Relationship to the app roadmap

`specs/001-page-builder-v0-1-1/tasks.md:24` — task T010, "Step 6: Generate mock page,
Export HTML, disabled Figma (v2)." `specs/001-page-builder-v0-1-1/research.md:21-23`,
decision #3: "v1 generates a mock page and exports standalone HTML. v2 adds Figma export
once Figma MCP can be used." `specs/001-page-builder-v0-1-1/plan.md:192-193`, Later
Versions: "v1.0: Figma export through Figma MCP, multi-page sets."

This design would have been a manual stopgap for that acknowledged gap — a Claude Code
skill standing in for the app's own disabled "Figma (v2)" button. It's superseded as the
recommended approach by the tool-agnostic plugin design in
`specs/003-figma-export-plugin/spec.md`, which doesn't have the single-tool,
single-MCP-server limitation this design does.

## Why this was set aside

Not because it doesn't work — it was proven working manually in a live session (see
project memory / session history for the actual Figma push this was based on). It was
set aside because it only works in Claude Code with Anthropic's Figma MCP server
connected; the user also works in Cursor, which connects to a different Figma MCP server
with a different tool surface, so this exact design would need a separate rewrite there.
A real Figma plugin (`specs/003-figma-export-plugin/spec.md`) avoids that problem by not
depending on any particular coding tool or MCP server at the point of use.
