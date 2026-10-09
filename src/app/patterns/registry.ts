// Pattern registry. The SVG folder is the source of truth: files are named
// {pattern}--{variant}.svg. `scripts/optimize-patterns.mjs` writes optimized
// copies to ./_generated (run automatically by predev/prebuild). Templates are
// never loaded here.

import type { FigmaRef } from "./figma-libraries";

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
  | "two-col-form"
  | "promo-banner-card";

export type PatternGroup = "Card patterns" | "Text and list" | "Functional";

export const PATTERNS: Record<
  PatternId,
  { label: string; group: PatternGroup; figma?: FigmaRef }
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
  },
  "two-col-form": {
    label: "Two-col form",
    group: "Functional",
    figma: {
      library: "leaf",
      nodeId: "5077:26845",
      status: "mapped",
      verifiedAt: "2026-10-08",
      notes: "Named \"forms\" in Figma; newer, fully-documented version on the \"✅ Form\" canvas (Device=Desktop/Mobile).",
    },
  },
  "promo-banner-card": {
    label: "Promo banner card",
    group: "Functional",
    figma: {
      library: "leaf",
      nodeId: "2462:27848",
      status: "mapped",
      verifiedAt: "2026-10-08",
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
