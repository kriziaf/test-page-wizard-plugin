# Tasks: Page Builder v0.1.1

**Input**: `spec.md`, `plan.md`, `research.md` in this folder. Services is built first; Business Page and Article/Blog reuse the same machinery.

Format: `[ID] [P?] [Story] Description`. **[P]** = can run in parallel. Status: `x` = done.

## Phase 1: Setup

- [x] T001 Add dev dependencies `sharp` and `svgo`; add `.gitignore` (node_modules, `_generated`, dist)
- [x] T002 `scripts/optimize-patterns.mjs`: shrink embedded images to 1200 px, SVGO with per-file ID prefix (transform conversion off), write to `src/app/patterns/_generated/`; run from `predev` and `prebuild`

## Phase 2: Foundation (blocks all stories)

- [x] T003 `src/app/patterns/registry.ts`: read `_generated/*.svg` by file name, expose patterns, variants, `loadSvg`, dev-time report of gaps and unmatched files
- [x] T004 `src/app/mock/MockPage.tsx`: stack SVGs in order, placeholder block for a missing variant
- [x] T005 `src/app/export/exportHtml.ts`: standalone HTML with inline SVGs, download helper

## Phase 3: User stories

- [x] T006 [US2] Page types: Business Page, Article, Blog, Services (Bio removed) in `App.tsx`
- [x] T007 [US1] Recommended section lists per the spec, Services first; Hero Primary on Business Page and Services only; variants read from the registry
- [x] T008 [US3] Step 3: Paste brief control with text area, text kept in app state
- [x] T009 [US4] Step 5: Add section from removed recommended sections plus unplaced patterns
- [x] T010 [US5] Step 6: Generate mock page, Export HTML, disabled Figma (v2)

## Phase 4: Validate and follow up

- [x] T011 Walkthrough of the Services path in a headless browser: 8 sections render, no placeholders, export has no external requests
- [ ] T012 Compare the generated Services mock to `templates/services-page/01` to `04` section by section; record gaps in `plan.md`
- [ ] T013 Business Page pass: check the section list against a real Business page
- [ ] T014 Article and Blog pass (Longform Text still mock drawings)
- [ ] T015 [P] Confirm Leaf token match for `#EAF4F6` and `#0F7885` in the drawings
- [ ] T016 Decide whether the ~35 MB `templates/` folder stays in the repo
- [ ] T017 Decide on automated tests before v0.2
- [ ] T018 Tag `v0.1.1` when shipped
