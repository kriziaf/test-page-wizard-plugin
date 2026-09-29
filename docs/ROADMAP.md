# Page Builder Plugin Roadmap

## v0.1.1 (Current MVP)

**Focus:** UI scaffolding + state management for 6-step workflow

### Features
- [x] 6-step wizard flow with navigation gating
- [x] Step 1: Scope (locked to single-page only)
- [x] Step 2: Page type selection (Business, Article, Blog, Services, Search Results)
- [ ] Step 3: Content brief form (7 fields: audience, service line, goal, primary action, secondary action, required content, existing copy)
- [ ] Step 4: Architecture builder (section recommendations + variant selection)
- [ ] Step 5: Review & customize (reorder, variant tweaking)
- [ ] Step 6: Generate (mock example + HTML download)

### Technical Scope
- React + TypeScript foundation
- Radix UI + shadcn components
- State management (useState hooks, Set<number> for completed steps)
- Dark sidebar + light main layout
- 9 section patterns with color coding
- 4–5 page type templates with pre-populated sections

### Deliverables
- Fully navigable workflow (Steps 1–6)
- Mock content in Step 6 showing generated HTML
- Downloadable HTML output
- Dark mode friendly UI

### Not in Scope
- Content validation or rules enforcement
- Voice/tone guidance integration
- Figma file generation (deferred to v2)
- API/backend integration
- Multi-page sets (deferred to v1.1)

---

## v0.2.0 (Content Guidance + Step Completion)

**Focus:** Wire up form interactivity and content validation

### Features
- [ ] Step 3: Content Brief form fully functional (capture + state management)
- [ ] Step 4: Architecture Builder interactivity (add/remove/reorder sections, variant selection)
- [ ] Step 5: Review step with preview of selected sections
- [ ] Content validation: character limits, required fields
- [ ] Voice/tone guidance per page type (ADR-0007)
- [ ] Copy templates for headlines, CTAs, placeholder content
- [ ] Required content checklist per page type

### Technical Scope
- Form validation rules (from documentation, to be provided)
- Inline validation feedback
- Section preview / architecture visualization
- Voice/tone context injection into form hints
- State mutation for section add/remove/reorder

### Deliverables
- Functional content intake flow
- Visual feedback on validation errors
- Section architecture preview
- Voice/tone guidance visible in form UX

### Dependencies
- Voice/tone guidelines documentation (ADR-0007)
- Content validation rules (ADR-0006)
- Section architecture for Search Results page type (ADR-0002)

---

## v0.3.0 (HTML Generation + Export)

**Focus:** Generate working HTML pages from brief + sections + content

### Features
- [ ] Step 6: Generate → HTML output (from brief + sections)
- [ ] HTML template mapping (sections → HTML components)
- [ ] Mock example generation (show example page for each page type)
- [ ] Download HTML file
- [ ] Code preview (modal showing generated HTML)
- [ ] Basic styling (Tailwind or inline CSS, TBD)

### Technical Scope
- HTML template builder (sections + content → markup)
- Pattern → component mapping
- Styling strategy (TBD: Tailwind, CSS Modules, inline)
- Export logic (download handler)
- Example/mock data generation

### Deliverables
- Working HTML output for each page type
- Downloadable .html files
- Example pages showing capabilities

### Dependencies
- Pattern data structure finalization (ADR-0004)
- Styling framework decision
- Content mapping rules (brief → page sections → HTML)

---

## v0.4.0 (Pattern Data Integration)

**Focus:** Connect to Figma/Storybook for pattern specs and component documentation

### Features
- [ ] Figma component library connection (read-only)
- [ ] Storybook documentation import
- [ ] Pattern variant specs from external sources
- [ ] Component spec validation against library

### Technical Scope
- Figma API integration (read component metadata)
- Storybook API integration (if available)
- JSON schema for pattern variants
- Caching/sync strategy

### Deliverables
- Pattern documentation auto-synced from Figma
- Component specs available in plugin UI
- Variant options validated against library

### Blocked By
- ADR-0004: Pattern Data Source Integration (decision needed)
- Figma API authentication strategy
- Component library JSON schema definition

---

## v1.0.0 (v2 Figma + Polish)

**Focus:** Figma MCP integration for design file generation; general polish

### Features
- [ ] Figma MCP integration (when available/stable)
- [ ] Generate Figma design file from brief + sections
- [ ] Figma frame creation + component instance mapping
- [ ] Design sync: styles, typography, spacing from library
- [ ] Multi-page sets support (deferred from v0.1)
- [ ] Plugin stability, error handling, user feedback

### Technical Scope
- Figma MCP tool integration
- Frame + component instance creation
- Style sync from design system
- Dual-output orchestration (HTML + Figma)

### Deliverables
- Figma file output alongside HTML
- Design → code handoff with fidelity
- Stable, production-ready plugin

### Blocked By
- Figma MCP availability and stability
- ADR-0005: V2 Figma MCP Integration Strategy (decision needed)
- Figma authentication in plugin context

### Post-Launch
- Multi-page set support (Step 1 unlock)
- Additional page types (e.g., Primary Care at Home if needed)
- Advanced customization (CSS overrides, theme switching)
- Analytics / usage tracking

---

## Legend

- [x] Completed
- [ ] Not started
- [~] In progress
- **Blocked By:** Decision or external dependency needed before work can start
- **Dependencies:** Features or decisions from other ADRs this work needs

