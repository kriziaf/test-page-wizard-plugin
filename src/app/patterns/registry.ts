// Pattern registry. The SVG folder is the source of truth: files are named
// {pattern}--{variant}.svg. `scripts/optimize-patterns.mjs` writes optimized
// copies to ./_generated (run automatically by predev/prebuild). Templates are
// never loaded here.

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

export const PATTERNS: Record<PatternId, { label: string; group: PatternGroup }> = {
  "overview-cards": { label: "Overview cards", group: "Card patterns" },
  "accent-cards": { label: "Accent cards", group: "Card patterns" },
  "graphic-cards": { label: "Graphic cards", group: "Card patterns" },
  "horizontal-cards": { label: "Horizontal cards", group: "Card patterns" },
  "external-link-cards": { label: "External link cards", group: "Card patterns" },
  "bullet-image": { label: "Bullet image", group: "Text and list" },
  "text-media": { label: "Text media", group: "Text and list" },
  "expanded-text": { label: "Expanded text", group: "Text and list" },
  "longform-text": { label: "Longform text", group: "Text and list" },
  "highlight-band": { label: "Highlight band", group: "Text and list" },
  "hero-primary": { label: "Hero primary", group: "Functional" },
  "hero-secondary": { label: "Hero secondary", group: "Functional" },
  "two-col-form": { label: "Two-col form", group: "Functional" },
  "promo-banner-card": { label: "Promo banner card", group: "Functional" },
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
