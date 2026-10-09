// Pattern registry. The SVG folder is the source of truth: files are named
// {pattern}--{variant}.svg. `scripts/optimize-patterns.mjs` writes optimized
// copies to ./_generated (run automatically by predev/prebuild). Templates are
// never loaded here.

import type { FigmaLibraryAlias, FigmaRef } from "./figma-libraries";

// specs/006-content-architecture-mapping: per-pattern content guidance, decoupled
// from the `figma` pointer above (see that spec's Decision section for why — a
// library redirect must not silently invalidate this). Each field tracks its own
// source: `figma` for text extracted from the matched component's own
// documentation, `user` for product knowledge that confirms, refines, or
// overrides what Figma says (useWhen is usually figma-sourced; placement is
// frequently user-sourced, since Figma rarely documents page-sequencing intent).
export type ContentArchitectureSource =
  | { type: "figma"; library: FigmaLibraryAlias; nodeId: string; extractedAt: string }
  | { type: "user"; confirmedAt: string; note?: string };

export type ContentArchitecture = {
  useWhen?: { text: string; source: ContentArchitectureSource };
  placement?: { text: string; source: ContentArchitectureSource };
};

export type PatternId =
  | "overview-cards"
  | "accent-cards"
  | "graphic-cards"
  | "horizontal-cards"
  | "external-link-cards"
  | "bullet-image"
  | "text-media"
  | "expanded-text"
  | "longform-text"
  | "highlight-band"
  | "hero-primary"
  | "hero-secondary"
  | "form"
  | "promo-banner";

export type PatternGroup = "Card patterns" | "Text and list" | "Functional";

export const PATTERNS: Record<
  PatternId,
  {
    label: string;
    group: PatternGroup;
    figma?: FigmaRef;
    contentArchitecture?: ContentArchitecture;
  }
> = {
  "overview-cards": {
    label: "Overview cards",
    group: "Card patterns",
    figma: {
      library: "leaf",
      nodeId: "2400:13423",
      status: "mapped",
      verifiedAt: "2026-10-08",
    },
    contentArchitecture: {
      useWhen: {
        text: "Introduce a collection of resources or service categories before directing users to more detail.",
        source: { type: "figma", library: "leaf", nodeId: "2400:13423", extractedAt: "2026-10-09" },
      },
      placement: {
        text: "Below a hero or introductory section; position after a primary value statement to guide users toward specific resources.",
        source: { type: "figma", library: "leaf", nodeId: "2400:13423", extractedAt: "2026-10-09" },
      },
    },
  },
  "accent-cards": {
    label: "Accent cards",
    group: "Card patterns",
    figma: {
      library: "leaf",
      nodeId: "2400:13278",
      status: "mapped",
      verifiedAt: "2026-10-08",
    },
    contentArchitecture: {
      useWhen: {
        text: "Highlighting product features, sharing trivia, or surfacing supporting details alongside primary content.",
        source: { type: "figma", library: "leaf", nodeId: "2400:13278", extractedAt: "2026-10-09" },
      },
      placement: {
        text: "After a hero or introductory section and before detailed service pages or closing CTAs.",
        source: { type: "figma", library: "leaf", nodeId: "2400:13278", extractedAt: "2026-10-09" },
      },
    },
  },
  "graphic-cards": {
    label: "Graphic cards",
    group: "Card patterns",
    figma: {
      library: "leaf",
      nodeId: "2462:27357",
      status: "mapped",
      verifiedAt: "2026-10-08",
    },
    contentArchitecture: {
      useWhen: {
        text: "Present a browsable set of topics, services, or resource categories.",
        source: { type: "figma", library: "leaf", nodeId: "2462:27357", extractedAt: "2026-10-09" },
      },
      placement: {
        text: "Within the main body of an informational or support experience — typically below a primary hero and above detailed content pages.",
        source: { type: "figma", library: "leaf", nodeId: "2462:27357", extractedAt: "2026-10-09" },
      },
    },
  },
  "horizontal-cards": {
    label: "Horizontal cards",
    group: "Card patterns",
    figma: {
      library: "leaf",
      nodeId: "5624:3980",
      status: "mapped",
      verifiedAt: "2026-10-08",
    },
    contentArchitecture: {
      useWhen: {
        text: "Featuring related topics, article intros, or editorial content such as insights, case studies, or news items.",
        source: { type: "figma", library: "leaf", nodeId: "5624:3980", extractedAt: "2026-10-09" },
      },
      placement: {
        text: "Bottom of page, interchangeable with form. A softer CTA for secondary content (news & insights, help center) — not a primary login/call-booking task. Two-up = featured announcements; four-up = related topics / blog intro.",
        source: { type: "user", confirmedAt: "2026-10-09" },
      },
    },
  },
  "external-link-cards": {
    label: "External link cards",
    group: "Card patterns",
    figma: {
      library: "leaf",
      nodeId: "2400:13077",
      status: "mapped",
      verifiedAt: "2026-10-08",
    },
    contentArchitecture: {
      useWhen: {
        text: "Surface a set of related actions, services, or categories that users can explore independently.",
        source: { type: "figma", library: "leaf", nodeId: "2400:13077", extractedAt: "2026-10-09" },
      },
      placement: {
        text: "Within the body of a page to present navigable options — typically after a hero or introductory section.",
        source: { type: "figma", library: "leaf", nodeId: "2400:13077", extractedAt: "2026-10-09" },
      },
    },
  },
  "bullet-image": {
    label: "Bullet image",
    group: "Text and list",
    figma: {
      library: "leaf",
      nodeId: "2545:8954",
      status: "mapped",
      verifiedAt: "2026-10-08",
      notes: "Matched to \"bullet text\" component, not a literally-named bullet-image.",
    },
    contentArchitecture: {
      useWhen: {
        text: "Listing features, locations, or benefits alongside an image, or when content benefits from a scannable list rather than a paragraph.",
        source: { type: "figma", library: "leaf", nodeId: "2545:8954", extractedAt: "2026-10-09" },
      },
      placement: {
        text: "Repeatable — stack in the middle of the page.",
        source: { type: "user", confirmedAt: "2026-10-09" },
      },
    },
  },
  "text-media": {
    label: "Text media",
    group: "Text and list",
    figma: {
      library: "leaf",
      nodeId: "2462:35747",
      status: "mapped",
      verifiedAt: "2026-10-08",
    },
    contentArchitecture: {
      useWhen: {
        text: "Introducing a key service or feature with visual support, pairing editorial imagery with a value proposition, or anchoring a section that needs both a narrative and a clear next action.",
        source: { type: "figma", library: "leaf", nodeId: "2462:35747", extractedAt: "2026-10-09" },
      },
      placement: {
        text: "Repeatable — can stack multiple times in the middle of the page for expanded content: benefits, service intros, or story highlights.",
        source: { type: "user", confirmedAt: "2026-10-09" },
      },
    },
  },
  "expanded-text": {
    label: "Expanded text",
    group: "Text and list",
    figma: {
      library: "leaf",
      nodeId: "2502:41428",
      status: "mapped",
      verifiedAt: "2026-10-08",
    },
    contentArchitecture: {
      useWhen: {
        text: "Showcasing a set of related features, services, or benefits where each item benefits from an icon, a brief description, and an optional navigation link.",
        source: { type: "figma", library: "leaf", nodeId: "2502:41428", extractedAt: "2026-10-09" },
      },
      placement: {
        text: "Repeatable — stack in the middle of the page.",
        source: { type: "user", confirmedAt: "2026-10-09" },
      },
    },
  },
  "longform-text": {
    label: "Longform text",
    group: "Text and list",
    figma: {
      library: "leaf",
      nodeId: "2542:46006",
      status: "mapped",
      verifiedAt: "2026-10-08",
    },
    contentArchitecture: {
      useWhen: {
        text: "Content is primarily text-driven — program overviews, benefits breakdowns, or curated resource lists where the text itself is the primary value.",
        source: { type: "figma", library: "leaf", nodeId: "2542:46006", extractedAt: "2026-10-09" },
      },
      placement: {
        text: "Repeatable — stack in the middle of the page.",
        source: { type: "user", confirmedAt: "2026-10-09" },
      },
    },
  },
  "highlight-band": {
    label: "Highlight band",
    group: "Text and list",
    figma: {
      library: "leaf",
      nodeId: "5077:28316",
      status: "mapped",
      verifiedAt: "2026-10-08",
      notes: "Named \"Banner\" in Figma (List count=2/3/4 × Device); screenshot-verified.",
    },
  },
  "hero-primary": {
    label: "Hero primary",
    group: "Functional",
    figma: {
      library: "leaf",
      nodeId: "2579:44239",
      status: "mapped",
      verifiedAt: "2026-10-08",
    },
    contentArchitecture: {
      // No `placement`: this is a page-level choice (which page gets a primary
      // vs. secondary hero), not an intra-page sequencing decision.
      useWhen: {
        text: "Building a main entry page—such as a homepage, landing page, sign-in page, or campaign page—that needs a strong first impression and immediate action.",
        source: { type: "figma", library: "leaf", nodeId: "2579:44239", extractedAt: "2026-10-09" },
      },
    },
  },
  "hero-secondary": {
    label: "Hero secondary",
    group: "Functional",
    figma: {
      library: "leaf",
      nodeId: "2882:47746",
      status: "mapped",
      verifiedAt: "2026-10-08",
    },
    contentArchitecture: {
      useWhen: {
        text: "A page needs clear orientation and visual identity without the scale or complexity of a primary hero. Secondary hero is meant to be used as a distinctive banner on top of sub pages. Keep the design consistent for its sibling pages.",
        source: { type: "figma", library: "leaf", nodeId: "2882:47746", extractedAt: "2026-10-09" },
      },
    },
  },
  form: {
    label: "Form",
    group: "Functional",
    figma: {
      library: "leaf",
      nodeId: "5077:26845",
      status: "mapped",
      verifiedAt: "2026-10-08",
      notes: "Named \"forms\" in Figma (two-col-form layout); newer, fully-documented version on the \"✅ Form\" canvas (Device=Desktop/Mobile). PatternId renamed from two-col-form to form, 2026-10-09.",
    },
    contentArchitecture: {
      useWhen: {
        text: "Collect structured user input alongside contextual messaging — lead capture, contact, or intake scenarios.",
        source: { type: "figma", library: "leaf", nodeId: "5077:26845", extractedAt: "2026-10-09" },
      },
      placement: {
        text: "Bottom of page, last section — meant to invite action (e.g. \"join the network\" or \"schedule a demo\").",
        source: {
          type: "user",
          confirmedAt: "2026-10-09",
          note: "Overrides Figma's own placement text (\"before secondary or supporting page content\") based on actual product usage — forms are the final, action-inviting section here.",
        },
      },
    },
  },
  "promo-banner": {
    label: "Promo banner",
    group: "Functional",
    figma: {
      library: "leaf",
      nodeId: "2462:27848",
      status: "mapped",
      verifiedAt: "2026-10-08",
      notes: "PatternId renamed from promo-banner-card to promo-banner, 2026-10-09.",
    },
    contentArchitecture: {
      useWhen: {
        text: "A page needs a strong visual break that calls attention to an important next step; used sparingly, typically between dense sections or near the bottom of a page.",
        source: { type: "figma", library: "leaf", nodeId: "2462:27848", extractedAt: "2026-10-09" },
      },
      placement: {
        text: "Used once per page, typically near the bottom. Promotes a campaign and directs users to a portal, campaign, or microsite.",
        source: { type: "user", confirmedAt: "2026-10-09" },
      },
    },
  },
};

const files = import.meta.glob("./_generated/*.svg", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const index = new Map<string, () => Promise<string>>(); // "pattern--variant" -> loader
const variants = new Map<string, string[]>();
const unmatched: string[] = [];

for (const [path, loader] of Object.entries(files)) {
  const name = path.split("/").pop()!.replace(/\.svg$/, "");
  const [pattern, variant] = name.split("--");
  if (!pattern || !variant || !(pattern in PATTERNS)) {
    unmatched.push(name);
    continue;
  }
  index.set(name, loader);
  variants.set(pattern, [...(variants.get(pattern) ?? []), variant]);
}

export function variantsOf(pattern: PatternId): string[] {
  return variants.get(pattern) ?? [];
}

export function variantLabel(variant: string): string {
  const s = variant.replace(/-/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function hasSvg(pattern: PatternId, variant: string): boolean {
  return index.has(`${pattern}--${variant}`);
}

/** SVG markup for a pattern variant, or null if no drawing exists. */
export async function loadSvg(pattern: PatternId, variant: string): Promise<string | null> {
  const loader = index.get(`${pattern}--${variant}`);
  return loader ? loader() : null;
}

/** Dev-time check: documented patterns with no SVGs, and SVG files that match nothing. */
export function registryReport() {
  const missingPatterns = (Object.keys(PATTERNS) as PatternId[]).filter(
    (p) => variantsOf(p).length === 0,
  );
  return { missingPatterns, unmatched };
}

if (import.meta.env?.DEV) {
  const r = registryReport();
  if (r.missingPatterns.length || r.unmatched.length) {
    console.warn("[pattern registry]", r);
  }
}
