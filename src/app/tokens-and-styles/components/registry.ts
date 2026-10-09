// Figma match registry for the tokens-and-styles component layer
// (specs/005-component-figma-mapping). This layer is dormant — no code
// currently imports styles.css — so this file exists purely to record
// Figma matches; it is not consumed anywhere yet.

import type { FigmaRef } from "../../patterns/figma-libraries";

export type TokenStyleComponentId =
  | "external-link-cards"
  | "highlight-bar"
  | "horizontal-cards"
  | "list-item"
  | "testimonial"
  | "button"
  | "form"
  | "hero"
  | "text-and-image"
  | "header"
  | "heading-block";

export const TOKEN_STYLE_COMPONENTS: Record<
  TokenStyleComponentId,
  { label: string; figma?: FigmaRef }
> = {
  "external-link-cards": {
    label: "External link cards",
    figma: {
      library: "leaf",
      nodeId: "2400:13077",
      status: "mapped",
      verifiedAt: "2026-10-08",
    },
  },
  "highlight-bar": { label: "Highlight bar" },
  "horizontal-cards": {
    label: "Horizontal cards",
    figma: {
      library: "leaf",
      nodeId: "5624:3980",
      status: "mapped",
      verifiedAt: "2026-10-08",
    },
  },
  "list-item": {
    label: "List item",
    figma: {
      library: "leaf",
      nodeId: "2550:15097",
      status: "mapped",
      verifiedAt: "2026-10-08",
      notes: "Matched to \"Bullet Text\" component, not a literally-named list-item.",
    },
  },
  testimonial: {
    label: "Testimonial",
    figma: {
      library: "leaf",
      nodeId: "5581:6406",
      status: "mapped",
      verifiedAt: "2026-10-08",
      notes: "Matched to \"Quote Testimonial Section\" (Theme Light/Dark × Device Desktop/Mobile), one of 5 testimonial-ish candidates on the \"🚧 Testimonial\" canvas.",
    },
  },
  button: { label: "Button" },
  form: {
    label: "Form",
    figma: {
      library: "leaf",
      nodeId: "5077:26883",
      status: "mapped",
      verifiedAt: "2026-10-08",
      notes: "form-base atom, newer version on the \"✅ Form\" canvas (paired with the fuller 'forms' two-col-form set).",
    },
  },
  hero: {
    label: "Hero",
    figma: {
      library: "leaf",
      nodeId: "2579:44239",
      status: "mapped",
      verifiedAt: "2026-10-08",
      notes: "Same Figma component as patterns.hero-primary (.hero-primary set).",
    },
  },
  "text-and-image": {
    label: "Text and image",
    figma: {
      library: "leaf",
      nodeId: "2462:35747",
      status: "mapped",
      verifiedAt: "2026-10-08",
      notes: "Same Figma component as patterns.text-media (\"text-media\" set, asset=video/image × position=left/right).",
    },
  },
  header: { label: "Header" },
  "heading-block": {
    label: "Heading block",
    figma: {
      library: "leaf",
      nodeId: "2556:34013",
      status: "mapped",
      verifiedAt: "2026-10-08",
      notes: "Matched to \"heading-text\" component (type=left/Center/with CTA link).",
    },
  },
};
