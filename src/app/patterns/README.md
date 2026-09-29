# Pattern Documentation

Building-block patterns for Page Builder. Three groups: Card Patterns, Text and List Patterns, Functional Patterns.

---

## Card Patterns

### Design Principles

- **Group small, digestible content** — Cards and lists are best suited for minimal headline and body copy — not long-form text.
- **Treat content as a preview** — Copy in this pattern represents fuller content found elsewhere on the page or on external pages. Write it as a teaser, not a summary.
- **Write active, contextual CTAs** — Link text should be specific and action-oriented. Avoid generic labels like "Learn more" — give users a clear sense of where they're going.

### Overview Cards

A card component that simplifies complex information and previews a product or service before directing users to more detail. Each card includes a CTA link to an external page.

- **Content Guidance:** Short headline, brief body copy, and a CTA link.
- **Use when:** Communicating product benefits, explaining how something works, or presenting a value proposition as a lead-in to deeper content.

### Accent Cards

A read-only card with a branded background color that breaks up white space and draws attention to supporting information. Does not include a CTA link.

- **Content Guidance:** Short heading and brief body copy — no links or interactive elements.
- **Use when:** Highlighting product features, sharing trivia, or surfacing supporting details alongside primary content.

### Graphic Cards

A card that pairs a graphic asset — illustration or icon — with a short headline or label to help users quickly identify and navigate content categories. Messaging should be brief and direct.

- **Content Guidance:** Icon or illustration paired with a short headline or label.
- **Use when:** There's a need to add visual interest for a list of button cards. Examples: Help Center topic categories, labeling service formats, or any content that needs a visual to aid navigation.

### Horizontal Cards

A card layout that introduces externally linked pages using a horizontal format. Typically used in multi-card sets to surface related content.

- **Content Guidance:** Short headline and brief body copy previewing the linked page. No long-form text.
- **Use when:** Featuring related topics, article intros, or editorial content such as insights, case studies, or news items.

### External Link Cards

A wayfinding card that guides users to related topics or destinations. Typically placed below the hero or at the bottom of a page.

- **Content Guidance:** Minimal body text with a concise two-line headline. No additional details or CTA copy.
- **Use when:** Surfacing related topics at the end of a page, or directing users to separate pages.

---

## Text and List Patterns

### Design Principles

- **Write for depth, not brevity** — These components are built for complex information. Give content the space it needs — don't compress detail that benefits from being fully expressed.
- **Cut what doesn't earn its place** — Every line should be informative. Remove repetition and filler, but don't sacrifice clarity for the sake of being short.
- **Avoid CTAs — these are reading patterns** — Text and list text are not navigational. If a link or action is needed, route users through a card or CTA Banner instead.

### Bullet Image

A split-layout section component pairing a headline and a structured list with a supporting image on the right.

- **Variants:** Icon bullets (icon + short copy), Simple bullets (plain list), Grid (two-column labeled items)
- **Content:** Headline (2–3 lines, bold), List (2–3 bullets or up to 6 grid items)
- **Use when:** Listing features, locations, or benefits alongside an image, or when content benefits from a scannable list rather than a paragraph.

### Text Media

A split-layout section component that pairs a media asset with a headline, body copy, and a CTA button.

- **Variants:** Image Left or Text Left; Photo or Video
- **Content:** Headline (2–3 lines, bold), Body (3–5 lines), CTA (one button)
- **Use when:** Introducing a key service or feature with visual support, pairing editorial imagery with a value proposition, or anchoring a section that needs both a narrative and a clear next action.

### Expanded Text

A full-width section component for presenting 3–4 features or services as icon cards beneath a shared headline.

- **Variants:** Centered 2-col (no links), Split 1-col (no links), Centered 3-col (with links), Split 2-col (with links)
- **Card content:** Icon, bold headline (1–2 lines), supporting copy (2–4 lines), optional link label with arrow
- **Use when:** Showcasing a set of related features, services, or benefits where each item benefits from an icon, a brief description, and an optional navigation link.

### Longform Text

A full-width editorial section for displaying dense, structured text content — a bold headline paired with one of three body formats.

- **Variants:** Paragraph (4–8 lines), Bullet list (4–8 items), Resource list (4–8 entries with linked titles and 2–4 lines each)
- **Content:** Headline (1 line, bold)
- **Use when:** Content is primarily text-driven — program overviews, benefits breakdowns, or curated resource lists where the text itself is the primary value.

### Highlight Band

A full-width social-proof section that showcases key metrics or feature highlights in a centered, evenly spaced row beneath a headline.

- **Variants:** Type: Metrics or List
  - Metrics: 3 large stat figures with captions (e.g. "2M+", "4.8★", "<10 min")
  - List: 3 icon-led feature cards, each with a title and short description
  - Background: Brand (dark/teal) or Subtle (light gray)
- **Content:** Headline (1 line, semi-bold); 3 columns, each with:
  - Metrics: bold stat + caption
  - List: icon + bold title + 2–3 line description
- **Use when:** Building trust with quantitative proof points, summarizing service advantages at a glance, or breaking up long-form content with a visually distinct stats band.

### Highlight Band

A full-width social-proof section that showcases key metrics or feature highlights in a centered, evenly spaced row beneath a headline.

- **Variants:** Type: Metrics or List
  - Metrics: 3 large stat figures with captions (e.g. "2M+", "4.8★", "<10 min")
  - List: 3 icon-led feature cards, each with a title and short description
- **Variants:** Background: Brand (dark/teal) or Subtle (light gray)
- **Content:** Headline (1 line, semi-bold); 3 columns, each with:
  - Metrics: bold stat + caption
  - List: icon + bold title + 2–3 line description
- **Use when:** Building trust with quantitative proof points, summarizing service advantages at a glance, or breaking up long-form content with a visually distinct stats band.

---

## Functional Patterns

### Design Principles

- **Use interaction to organize content** — Use accordions to reveal grouped content and tabs to switch between related views. Add interaction only when it makes information easier to scan.
- **Lead users to a clear next action** — Use promo banners to start important journeys or highlight timely campaigns and news. Keep the message focused and use one contextual CTA.
- **Match behavior to the task** — Hero patterns can pair content with buttons, sticky prompts, or form fields. Choose or redesign the simplest behavior that supports the intended outcome.

### Hero Primary

A high-impact opening section that establishes the page's main message through prominent media, focused copy, and a clear next step.

- **Variants:** Image + overlay (full-width media with content panel), Form + image (form over media), Split media (balanced columns)
- **Content:** Heading (4–10 words), Supporting body (1–3 sentences), Buttons (1–2, labels 1–4 words), Form fields (1–4), one clear image
- **Use when:** Building a main entry page — homepage, landing page, sign-in page, or campaign page — that needs a strong first impression and immediate action. Typically includes an embedded sign-in/lead form, CTA buttons, or a search bar.

### Hero Secondary

A compact introductory banner that frames a page or section with a clear message, supporting visual, and focused action.

- **Variants:** Brand teal (high-contrast), Bright green (energetic), Light neutral (softer)
- **Content:** Heading (4–10 words), Supporting body (1–2 sentences), Button (0–1, label 1–4 words), one supporting image
- **Use when:** A page needs clear orientation and visual identity without the scale of a primary hero. Meant as a distinctive banner on top of sub-pages. Keep consistent across sibling pages.

### Two-Col Form

A split-layout section pairing contextual content with a focused form — guidance and benefits sit beside the fields users need to complete.

- **Variants:** Default (neutral form on white), Tinted form (light accent panel behind the form)
- **Content:** Section heading (3–8 words), Supporting body (1–3 short paragraphs), Benefit items (2–4), Field labels (1–4 words), Fields (3–6), Button label (1–3 words)
- **Use when:** Users need context and reassurance while completing a short, focused form.

### Promo Banner Card

A prominent in-page banner that pairs a concise message with clear actions to promote a service, offer, or next step.

- **Variants:** Image-led (split layout with photography), Branded CTA (full-width color treatment), Simple CTA (centered text, neutral background)
- **Content:** Heading (4–10 words), Supporting body (1–2 sentences), Buttons (1–2, labels 1–4 words), one supporting image
- **Use when:** A page needs a strong visual break that calls attention to an important next step. Use sparingly, typically between dense sections or near the bottom of a page.
