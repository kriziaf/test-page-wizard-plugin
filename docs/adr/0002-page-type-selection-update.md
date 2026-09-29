# Page Type Selection Update: Blog & Search Results

* **Status**: Accepted
* **Deciders**: Kriz
* **Date**: 2026-09-29

## Context and Problem Statement

The initial MVP included a "Bio Page" page type for individual profiles. However, marketing workflows at Cigna/Evernorth require different page types: teams are building blog article landing pages and search results pages, not individual bio pages. The question: Should Bio remain, or should the page type set be updated to better serve actual marketing use cases?

## Decision Outcome

**Chosen option: "Update to Business, Article, Blog, Services, Search Results"**, because it aligns with real marketing workflows and removes the Bio template that doesn't serve current use cases.

### Positive Consequences

* **Workflow alignment:** Page types now match actual marketing work (blogs, services, search landing pages)
* **Blog support:** Dedicated Blog page type replaces generic Article
* **SEO coverage:** Search Results page type supports landing page SEO use cases
* **Reduced scope:** Five focused page types instead of four miscellaneous ones
* **Marketing team confidence:** Templates match what they actually build

### Negative Consequences

* **Future bio use:** If individual bio pages are needed later, will need to re-add or create custom template
* **Migration:** Existing designs or workflows referencing Bio template will need adjustment
* **Section template redesign:** Search Results page type requires new section architecture (not based on existing templates)

## Pros and Cons of the Options

### Option 1: Update to Blog + Search Results (Chosen)

* Good, because it aligns with current marketing workflows and use cases
* Good, because Blog is a more common page type than Bio for B2B healthcare marketing
* Good, because Search Results pages are a key SEO/SEM landing page type
* Bad, because Bio is removed and would need to be re-added if needed later
* Bad, because Search Results page type architecture hasn't been designed yet

### Option 2: Keep Bio, Add Blog & Search Results

* Good, because preserves Bio template for future use
* Good, because doesn't remove anything already in the codebase
* Bad, because the full set becomes 6 page types, increasing complexity
* Bad, because Bio remains a template looking for a use case

### Option 3: Keep Current (Business, Article, Bio, Services)

* Good, because no breaking changes to existing implementation
* Bad, because doesn't address Blog or Search Results gaps
* Bad, because Article and Blog are redundant concepts

## Related Decisions

* **ADR-0001**: Plugin + Skills Architecture
* **ADR-0003**: Generation Output Strategy (depends on understanding page type scope)

## Notes

**New Section Architecture Needed:** Search Results page type requires new section templates. Candidate sections:
- Hero/filter bar (keyword, filters)
- Search results cards (result title, snippet, rating, CTA)
- Pagination or load-more
- Related searches or refine suggestions
- Footer CTA
