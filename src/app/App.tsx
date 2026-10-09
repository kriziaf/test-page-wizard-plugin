import { useState, useCallback } from "react";
import { Check, Lock, ChevronUp, ChevronDown, Trash2, Plus, Zap, ClipboardPaste } from "lucide-react";
import {
  PATTERNS,
  variantsOf,
  variantLabel,
  type PatternId,
} from "./patterns/registry";
import { MockPage, useLoadedSections } from "./mock/MockPage";
import { buildHtml, downloadHtml } from "./export/exportHtml";

// ── Types ────────────────────────────────────────────────────────────────
export type PageType = "business" | "article" | "blog" | "services";

type SectionPattern = PatternId;

interface PageSection {
  id: string;
  name: string;
  pattern: SectionPattern;
  description: string;
  required?: boolean;
  variant: string;
  variants: string[];
}

interface ContentBrief {
  audience: string;
  serviceLine: string;
  pageGoal: string;
  primaryAction: string;
  secondaryAction: string;
  requiredContent: string;
  existingCopy: string;
}

// ── Static data ──────────────────────────────────────────────────────────
const STEP_META = [
  { num: 1, title: "Scope", locked: true },
  { num: 2, title: "Page type", locked: false },
  { num: 3, title: "Content brief", locked: false },
  { num: 4, title: "Architecture", locked: false },
  { num: 5, title: "Review", locked: false },
  { num: 6, title: "Generate", locked: false },
];

const PAGE_TYPES: { id: PageType; name: string; desc: string; icon: string }[] = [
  {
    id: "business",
    name: "Business Page",
    desc: "Brand homepage, product page, or corporate overview",
    icon: "◈",
  },
  {
    id: "article",
    name: "Article",
    desc: "News story, thought leadership, or editorial content",
    icon: "◎",
  },
  {
    id: "blog",
    name: "Blog",
    desc: "Blog post or editorial series entry",
    icon: "◉",
  },
  {
    id: "services",
    name: "Services",
    desc: "Service catalog, specialty area, or product line overview",
    icon: "◐",
  },
];

const GROUP_COLORS: Record<string, { color: string; bg: string }> = {
  "Card patterns": { color: "#7a3fff", bg: "#f0e8ff" },
  "Text and list": { color: "#555", bg: "#f0eeec" },
  Functional: { color: "#0033ff", bg: "#e8eeff" },
};

const PATTERN_META = Object.fromEntries(
  (Object.keys(PATTERNS) as PatternId[]).map((id) => [
    id,
    { label: PATTERNS[id].label, ...GROUP_COLORS[PATTERNS[id].group] },
  ]),
) as Record<SectionPattern, { label: string; color: string; bg: string }>;

const isHeroPattern = (p: SectionPattern) => p === "hero-primary" || p === "hero-secondary";

// Wireframe shape used by the small previews in Steps 4 to 6.
const WIRE_KIND: Record<SectionPattern, string> = {
  "hero-primary": "hero",
  "hero-secondary": "hero",
  "overview-cards": "overview-cards",
  "graphic-cards": "graphic-cards",
  "horizontal-cards": "overview-cards",
  "accent-cards": "accent-cards",
  "highlight-band": "accent-cards",
  "external-link-cards": "external-link-cards",
  "bullet-image": "text-media",
  "text-media": "text-media",
  "expanded-text": "expanded-text",
  "longform-text": "expanded-text",
  form: "form",
  "promo-banner": "promo-banner",
};

// First documented variant per pattern (spec: default is the first documented variant).
const DEFAULT_VARIANT: Record<SectionPattern, string> = {
  "overview-cards": "stacked-right",
  "accent-cards": "brand",
  "graphic-cards": "illustration",
  "horizontal-cards": "1-col-large",
  "external-link-cards": "compact",
  "bullet-image": "icon-bullets",
  "text-media": "image-left-photo",
  "expanded-text": "centered-2-col",
  "longform-text": "paragraph",
  "highlight-band": "subtle",
  "hero-primary": "image-overlay",
  "hero-secondary": "brand-strong",
  form: "subtle",
  "promo-banner": "image-led-brand",
};

export type SectionDef = {
  id: string;
  name: string;
  pattern: SectionPattern;
  description: string;
  required?: boolean;
  variant?: string; // overrides DEFAULT_VARIANT
};

// Recommended sections per page type (spec: "Recommended Sections").
export const ARTICLE_SECTIONS: SectionDef[] = [
  { id: "a1", name: "Article hero", pattern: "hero-secondary", description: "Headline and supporting line with one image", required: true },
  { id: "a2", name: "Article body", pattern: "longform-text", description: "Opening text establishing context", required: true },
  { id: "a3", name: "Text + media", pattern: "text-media", description: "Inline photo or video with surrounding copy" },
  { id: "a4", name: "Related articles", pattern: "horizontal-cards", description: "Related editorial items" },
  { id: "a5", name: "Related links", pattern: "external-link-cards", description: "Curated links to related pages" },
  { id: "a6", name: "Supporting details", pattern: "accent-cards", description: "Short supporting facts, standing in for an author bio", required: true },
];

export const SECTIONS_BY_TYPE: Record<PageType, SectionDef[]> = {
  business: [
    { id: "b1", name: "Brand hero", pattern: "hero-primary", description: "Main headline, supporting copy, buttons, and one image", required: true },
    { id: "b2", name: "Entry points", pattern: "overview-cards", description: "Cards linking to key product or service areas" },
    { id: "b3", name: "Feature overview", pattern: "text-media", description: "Primary service highlight with photo or video" },
    { id: "b4", name: "Supporting details", pattern: "accent-cards", description: "Short feature cards with no links", required: true },
    { id: "b5", name: "Promo banner", pattern: "promo-banner", description: "Campaign or next-step promotion" },
    { id: "b6", name: "Contact form", pattern: "form", description: "Context beside a short form", required: true },
  ],
  article: ARTICLE_SECTIONS,
  blog: ARTICLE_SECTIONS.map((s) => ({ ...s, id: s.id.replace("a", "g") })),
  services: [
    { id: "s1", name: "Services hero", pattern: "hero-primary", description: "Headline, supporting copy, and buttons over or beside a photo", required: true, variant: "split-media" },
    { id: "s2", name: "Quick links", pattern: "external-link-cards", description: "Three wayfinding cards below the hero" },
    { id: "s3", name: "Service overview", pattern: "expanded-text", description: "Features or services as icon cards", variant: "split-1-col" },
    { id: "s4", name: "Feature video", pattern: "text-media", description: "Video with headline, body, and one button", variant: "image-left-video" },
    { id: "s5", name: "Supporting details", pattern: "accent-cards", description: "Short feature cards with no links" },
    { id: "s6", name: "Final CTA", pattern: "promo-banner", description: "Closing banner with one or two buttons", required: true, variant: "branded-cta" },
    { id: "s7", name: "Inquiry form", pattern: "form", description: "Context beside a short form" },
  ],
};

function makeSection(def: SectionDef): PageSection {
  const variants = variantsOf(def.pattern);
  const wanted = def.variant ?? DEFAULT_VARIANT[def.pattern];
  return {
    id: def.id,
    name: def.name,
    pattern: def.pattern,
    description: def.description,
    required: def.required,
    variants,
    variant: variants.includes(wanted) ? wanted : (variants[0] ?? wanted),
  };
}

function initSections(type: PageType): PageSection[] {
  return SECTIONS_BY_TYPE[type].map(makeSection);
}

// Parked patterns: registered and Figma-mapped, but hidden from the UI
// pending content-architecture review. Revisit in specs/006-content-architecture-mapping/.
const HIDDEN_PATTERNS = new Set<PatternId>(["highlight-band"]);

/** Sections offered by Add section: removed recommended ones, then patterns not in the list. */
function addPool(type: PageType, sections: PageSection[]): SectionDef[] {
  const heroPrimaryOk = type === "business" || type === "services";
  const recommended = SECTIONS_BY_TYPE[type];
  const removed = recommended.filter((d) => !sections.some((s) => s.id === d.id));
  const usedPatterns = new Set(recommended.map((d) => d.pattern));
  const extras: SectionDef[] = (Object.keys(PATTERNS) as PatternId[])
    .filter((p) => !usedPatterns.has(p))
    .map((p) => ({
      id: `x-${p}`,
      name: PATTERNS[p].label,
      pattern: p,
      description: "Not in the recommended list",
    }));
  return [...removed, ...extras].filter(
    (d) =>
      (heroPrimaryOk || d.pattern !== "hero-primary") &&
      variantsOf(d.pattern).length > 0 &&
      !HIDDEN_PATTERNS.has(d.pattern),
  );
}

// ── Step sidebar ──────────────────────────────────────────────────────────
function Sidebar({
  step,
  completed,
  onNavigate,
}: {
  step: number;
  completed: Set<number>;
  onNavigate: (s: number) => void;
}) {
  return (
    <aside
      className="flex w-[216px] shrink-0 flex-col"
      style={{
        background: "#111",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Identity */}
      <div className="px-5 py-5">
        <div
          className="mb-1 text-[10px] font-medium uppercase tracking-widest"
          style={{ fontFamily: "'DM Mono', monospace", color: "#3a3a3a" }}
        >
          Page Builder
        </div>
        <div className="text-[13px] font-semibold" style={{ color: "#d0cdc9" }}>
          Spec plan
        </div>
      </div>

      {/* Steps */}
      <nav className="flex-1 px-3">
        {STEP_META.map((s) => {
          const isActive = step === s.num;
          const isDone = completed.has(s.num);
          const canNav = isDone || s.num < step;
          return (
            <button
              key={s.num}
              onClick={() => canNav && onNavigate(s.num)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all"
              style={{
                cursor: canNav ? "pointer" : "default",
                background: isActive
                  ? "rgba(255,255,255,0.07)"
                  : "transparent",
              }}
            >
              <span
                className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[10px]"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  background: isDone
                    ? "#00885a"
                    : isActive
                      ? "#0033ff"
                      : "rgba(255,255,255,0.05)",
                  color: isDone || isActive ? "#fff" : "#484848",
                }}
              >
                {isDone ? (
                  <Check size={10} strokeWidth={2.5} />
                ) : (
                  s.num
                )}
              </span>
              <span
                className="flex-1 text-[12.5px] font-medium"
                style={{
                  color: isActive ? "#f0eeeb" : isDone ? "#777" : "#3a3a3a",
                }}
              >
                {s.title}
              </span>
              {s.locked && (
                <Lock size={10} style={{ color: "#3a3a3a" }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Progress */}
      <div className="px-5 pb-5 pt-3">
        <div
          className="mb-2 flex justify-between text-[10px]"
          style={{ fontFamily: "'DM Mono', monospace", color: "#3a3a3a" }}
        >
          <span>Progress</span>
          <span>{Math.round((completed.size / 6) * 100)}%</span>
        </div>
        <div
          className="h-[3px] w-full overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(completed.size / 6) * 100}%`,
              background: "#0033ff",
            }}
          />
        </div>
      </div>
    </aside>
  );
}

// ── Shared step header ────────────────────────────────────────────────────
function StepHeader({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-8">
      <div
        className="mb-2 text-[10.5px] font-medium uppercase tracking-widest"
        style={{ fontFamily: "'DM Mono', monospace", color: "#0033ff" }}
      >
        Step {num}
      </div>
      <h2
        className="mb-2 text-[21px] font-semibold"
        style={{ color: "#1a1a1a" }}
      >
        {title}
      </h2>
      <p className="text-[13.5px] leading-relaxed" style={{ color: "#888" }}>
        {desc}
      </p>
    </div>
  );
}

// ── Step 1: Scope ─────────────────────────────────────────────────────────
function Step1() {
  return (
    <div className="mx-auto max-w-[640px] px-6 py-10">
      <StepHeader
        num="01"
        title="Choose scope"
        desc="Define whether you're building a single page or a coordinated multi-page set."
      />

      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "Single page",
            desc: "One standalone page built to the full spec and pattern library.",
          },
          {
            label: "Multi-page set",
            desc: "A coordinated set of pages sharing structure, patterns, and navigation.",
          },
        ].map((opt) => (
          <div
            key={opt.label}
            className="relative overflow-hidden rounded-2xl p-5"
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              background: "#faf9f7",
              opacity: 0.42,
              cursor: "not-allowed",
            }}
          >
            <span
              className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-medium"
              style={{
                fontFamily: "'DM Mono', monospace",
                background: "#eceae7",
                color: "#aaa",
              }}
            >
              <Lock size={8} />
              Coming soon
            </span>
            <div
              className="mb-1 text-[15px] font-semibold"
              style={{ color: "#1a1a1a" }}
            >
              {opt.label}
            </div>
            <div className="text-[13px]" style={{ color: "#888" }}>
              {opt.desc}
            </div>
          </div>
        ))}
      </div>

      <p
        className="mt-5 text-[12.5px] leading-relaxed"
        style={{ color: "#b0aca8" }}
      >
        Scope selection will be enabled in a future version. Continue to
        proceed with a single-page build.
      </p>
    </div>
  );
}

// ── Step 2: Page type ─────────────────────────────────────────────────────
function Step2({
  pageType,
  setPageType,
}: {
  pageType: PageType | null;
  setPageType: (t: PageType) => void;
}) {
  return (
    <div className="mx-auto max-w-[640px] px-6 py-10">
      <StepHeader
        num="02"
        title="Choose page type"
        desc="Select the type of page you're building. This determines the recommended section architecture in step 4."
      />

      <div className="grid grid-cols-2 gap-3.5">
        {PAGE_TYPES.map((pt) => {
          const isSelected = pageType === pt.id;
          return (
            <button
              key={pt.id}
              onClick={() => setPageType(pt.id)}
              className="relative rounded-2xl p-5 text-left transition-all"
              style={{
                border: isSelected
                  ? "2px solid #0033ff"
                  : "1px solid rgba(0,0,0,0.09)",
                background: isSelected ? "#f5f7ff" : "#fff",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {isSelected && (
                <span
                  className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full"
                  style={{ background: "#0033ff" }}
                >
                  <Check size={11} color="#fff" strokeWidth={2.5} />
                </span>
              )}
              <span
                className="mb-3 block text-[22px]"
                style={{ lineHeight: 1 }}
              >
                {pt.icon}
              </span>
              <div
                className="mb-1 text-[14.5px] font-semibold"
                style={{ color: isSelected ? "#0033ff" : "#1a1a1a" }}
              >
                {pt.name}
              </div>
              <div className="text-[12.5px]" style={{ color: "#888" }}>
                {pt.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 3: Content brief ─────────────────────────────────────────────────
function BriefField({
  label,
  hint,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  multiline?: boolean;
}) {
  const base: React.CSSProperties = {
    width: "100%",
    fontSize: "13.5px",
    color: "#1a1a1a",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: "10px",
    padding: "9px 12px",
    background: "#fff",
    outline: "none",
    fontFamily: "'Figtree', system-ui, sans-serif",
    resize: "none",
  };
  return (
    <div>
      <label
        className="mb-0.5 block text-[12.5px] font-semibold"
        style={{ color: "#1a1a1a" }}
      >
        {label}
      </label>
      <p className="mb-1.5 text-[11.5px]" style={{ color: "#b0aca8" }}>
        {hint}
      </p>
      {multiline ? (
        <textarea rows={3} value={value} onChange={onChange} style={base} />
      ) : (
        <input type="text" value={value} onChange={onChange} style={base} />
      )}
    </div>
  );
}

function Step3({
  brief,
  setBrief,
  pasteText,
  setPasteText,
}: {
  brief: ContentBrief;
  setBrief: (b: ContentBrief) => void;
  pasteText: string;
  setPasteText: (t: string) => void;
}) {
  const [pasteOpen, setPasteOpen] = useState(pasteText.length > 0);
  const set =
    (key: keyof ContentBrief) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setBrief({ ...brief, [key]: e.target.value });

  return (
    <div className="mx-auto max-w-[640px] px-6 py-10">
      <StepHeader
        num="03"
        title="Create the content brief"
        desc="Define the page audience, goal, and content inputs. Fill in these fields or paste an existing brief."
      />

      {/* Paste brief */}
      <div className="mb-6">
        <button
          onClick={() => setPasteOpen(!pasteOpen)}
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl py-4 transition-colors hover:bg-white"
          style={{ border: "1.5px dashed rgba(0,0,0,0.11)", background: "#faf9f7" }}
        >
          <ClipboardPaste size={14} style={{ color: "#a09c98" }} />
          <span className="text-[13px]" style={{ color: "#a09c98" }}>
            {pasteOpen ? "Hide pasted brief" : pasteText.trim() ? "Edit pasted brief" : "Paste brief"}
          </span>
        </button>
        {pasteOpen && (
          <div className="mt-2">
            <textarea
              rows={10}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your brief here. It is kept with this page and does not fill the fields below."
              style={{
                width: "100%",
                fontSize: "13px",
                color: "#1a1a1a",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "10px",
                padding: "10px 12px",
                background: "#fff",
                outline: "none",
                fontFamily: "'Figtree', system-ui, sans-serif",
                lineHeight: 1.5,
              }}
            />
            <div className="mt-1 text-[11px]" style={{ color: "#c0bbb7" }}>
              {pasteText.trim().length} characters
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <BriefField
          label="3.1 Audience"
          hint="Who is this page for? Include plan type, life stage, or segment."
          value={brief.audience}
          onChange={set("audience")}
        />
        <BriefField
          label="3.2 Service line"
          hint="Which product, plan, or service area does this page cover?"
          value={brief.serviceLine}
          onChange={set("serviceLine")}
        />
        <BriefField
          label="3.3 Page goal"
          hint="What should visitors do or understand after viewing this page?"
          value={brief.pageGoal}
          onChange={set("pageGoal")}
          multiline
        />
        <div className="grid grid-cols-2 gap-3.5">
          <BriefField
            label="3.4 Primary action"
            hint="e.g. Start a quote, Find a doctor"
            value={brief.primaryAction}
            onChange={set("primaryAction")}
          />
          <BriefField
            label="Secondary action"
            hint="e.g. Learn more, Compare plans"
            value={brief.secondaryAction}
            onChange={set("secondaryAction")}
          />
        </div>
        <BriefField
          label="3.5 Required content"
          hint="Content, claims, or regulatory messaging that must appear on this page"
          value={brief.requiredContent}
          onChange={set("requiredContent")}
          multiline
        />
        <BriefField
          label="3.6 Existing copy or approved content source"
          hint="Paste approved copy here, or note the source document and version"
          value={brief.existingCopy}
          onChange={set("existingCopy")}
          multiline
        />
      </div>
    </div>
  );
}

// ── Step 4: Architecture ──────────────────────────────────────────────────
interface HeroContent {
  text: string;
}

const GENERATED_HERO_COPY = [
  "Evernorth EnGuide℠ Pharmacy",
  "Support on your GLP-1 journey",
  "Held to the highest standards under the Evernorth® brand, our team of specially trained pharmacists are readily available to address your needs and work directly with your doctor to help you save money, discuss treatment options, and more.",
  "Log in",
  "Learn more",
].join("\n");

const DEFAULT_HERO: HeroContent = {
  text: GENERATED_HERO_COPY,
};

/** Heuristic "smart refine" of a single freeform text block into hero card fields. */
function parseHeroText(text: string): {
  eyebrow: string;
  headline: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
} {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const isCtaLike = (l: string) => l.length <= 28 && !/[.!?]$/.test(l);

  let secondaryCta = "";
  let primaryCta = "";
  const rest = [...lines];
  if (rest.length > 1 && isCtaLike(rest[rest.length - 1])) {
    secondaryCta = rest.pop()!;
  }
  if (rest.length > 1 && isCtaLike(rest[rest.length - 1])) {
    primaryCta = rest.pop()!;
  }
  // A lone trailing CTA-like line should be treated as the primary, not secondary.
  if (!primaryCta && secondaryCta) {
    primaryCta = secondaryCta;
    secondaryCta = "";
  }

  let eyebrow = "";
  let headline = "";
  let body = "";
  if (rest.length >= 3) {
    eyebrow = rest[0];
    headline = rest[1];
    body = rest.slice(2).join(" ");
  } else if (rest.length === 2) {
    eyebrow = rest[0];
    headline = rest[1];
  } else if (rest.length === 1) {
    headline = rest[0];
  }

  return {
    eyebrow: eyebrow || "Brand name",
    headline: headline || "Page headline",
    body: body || "Body copy goes here…",
    primaryCta: primaryCta || "Primary CTA",
    secondaryCta,
  };
}

function HeroPreview({ content }: { content: HeroContent }) {
  const parsed = parseHeroText(content.text);
  return (
    <div className="overflow-hidden rounded-xl" style={{ background: "#111" }}>
      <div className="px-5 py-7">
        <div
          className="mb-2 text-[9.5px] font-semibold uppercase tracking-widest"
          style={{ fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.32)" }}
        >
          {parsed.eyebrow}
        </div>
        <h2
          className="mb-3 text-[21px] font-bold leading-snug"
          style={{ color: "#fff" }}
        >
          {parsed.headline}
        </h2>
        <p
          className="mb-5 text-[12px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.52)", maxWidth: "320px" }}
        >
          {parsed.body}
        </p>
        <div className="flex flex-wrap gap-2">
          <span
            className="inline-block rounded-full px-4 py-2 text-[12px] font-semibold text-white"
            style={{ background: "#0033ff" }}
          >
            {parsed.primaryCta}
          </span>
          {parsed.secondaryCta && (
            <span
              className="inline-block rounded-full px-4 py-2 text-[12px] font-semibold"
              style={{ border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.6)" }}
            >
              {parsed.secondaryCta}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentPanel({
  section,
  heroContent,
  setHeroContent,
}: {
  section: PageSection | null;
  heroContent: HeroContent;
  setHeroContent: (c: HeroContent) => void;
}) {
  const [saved, setSaved] = useState(false);

  if (!section) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20 text-center"
        style={{ border: "1.5px dashed rgba(0,0,0,0.09)" }}
      >
        <span className="text-[18px]" style={{ opacity: 0.18 }}>◈</span>
        <p className="text-[12.5px]" style={{ color: "#c0bbb7" }}>
          Select a section to preview and edit its content.
        </p>
      </div>
    );
  }

  const pm = PATTERN_META[section.pattern];
  const isHero = isHeroPattern(section.pattern);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ border: "1px solid rgba(0,0,0,0.09)", background: "#faf9f7" }}
    >
      {/* Panel header */}
      <div
        className="flex shrink-0 items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", background: "#fff" }}
      >
        <span className="text-[13px] font-semibold" style={{ color: "#1a1a1a" }}>
          {section.name}
        </span>
        <span
          className="rounded-md px-1.5 py-0.5 text-[9.5px] font-medium"
          style={{ fontFamily: "'DM Mono', monospace", background: pm.bg, color: pm.color }}
        >
          {pm.label}
        </span>
        {section.required && (
          <span
            className="text-[9.5px]"
            style={{ fontFamily: "'DM Mono', monospace", color: "#ccc" }}
          >
            req.
          </span>
        )}
      </div>

      <div
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 230px)", scrollbarWidth: "none" }}
      >
        {isHero ? (
          <div className="space-y-4 p-4">
            {/* Live preview */}
            <div>
              <div
                className="mb-2 text-[9.5px] font-medium uppercase tracking-wide"
                style={{ fontFamily: "'DM Mono', monospace", color: "#c0bbb7" }}
              >
                Live preview
              </div>
              <HeroPreview content={heroContent} />
            </div>

            <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }} />

            <div
              className="text-[9.5px] font-medium uppercase tracking-wide"
              style={{ fontFamily: "'DM Mono', monospace", color: "#c0bbb7" }}
            >
              Edit content
            </div>

            <button
              onClick={() => setHeroContent({ text: GENERATED_HERO_COPY })}
              className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full py-3 text-[13.5px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#0033ff" }}
            >
              <Zap size={14} />
              Generate copy
            </button>

            <textarea
              rows={8}
              value={heroContent.text}
              onChange={(e) => setHeroContent({ text: e.target.value })}
              placeholder="Brand name&#10;Page headline&#10;Supporting paragraph…&#10;Primary CTA&#10;Secondary CTA"
              style={{
                width: "100%",
                fontSize: "13px",
                color: "#1a1a1a",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "8px",
                padding: "8px 10px",
                background: "#fff",
                outline: "none",
                fontFamily: "'Figtree', system-ui, sans-serif",
                resize: "none",
                lineHeight: 1.5,
              }}
            />

            <button
              onClick={handleSave}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-semibold text-white transition-all duration-300"
              style={{ background: saved ? "#00885a" : "#1a1a1a" }}
            >
              {saved ? "✓ Saved" : "Save content"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
            <span
              className="text-[9.5px] font-medium uppercase tracking-widest"
              style={{ fontFamily: "'DM Mono', monospace", color: "#d0ccc8" }}
            >
              Coming soon
            </span>
            <p className="text-[12.5px] leading-relaxed" style={{ color: "#b0aca8" }}>
              Content editing for{" "}
              <strong style={{ color: "#888", fontWeight: 600 }}>
                {section.name}
              </strong>{" "}
              will be available in a future version. Only the Hero section is editable in this prototype.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Step4({
  pageType,
  sections,
  heroContent,
  setHeroContent,
}: {
  pageType: PageType | null;
  sections: PageSection[];
  heroContent: HeroContent;
  setHeroContent: (c: HeroContent) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    sections.find((s) => isHeroPattern(s.pattern))?.id ?? null,
  );

  const selectedSection = sections.find((s) => s.id === selectedId) ?? null;
  const typeName = PAGE_TYPES.find((p) => p.id === pageType)?.name ?? "your page";

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10">
      <StepHeader
        num="04"
        title="Build the page architecture"
        desc={`Recommended sections for a ${typeName}. Click any row to preview and edit its content.`}
      />

      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "50% 50%", alignItems: "start" }}
      >
        {/* Left: section list */}
        <div>
          <div
            className="mb-2 grid items-center px-3 text-[10px] font-medium uppercase tracking-widest"
            style={{
              gridTemplateColumns: "28px 1fr 160px 48px",
              fontFamily: "'DM Mono', monospace",
              color: "#c0bbb7",
            }}
          >
            <span>#</span>
            <span>Section</span>
            <span>Pattern</span>
            <span></span>
          </div>

          <div className="space-y-1.5">
            {sections.map((s, i) => {
              const pm = PATTERN_META[s.pattern];
              const isSelected = selectedId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className="grid w-full items-center gap-x-3 rounded-xl px-3 py-3 text-left transition-all"
                  style={{
                    gridTemplateColumns: "28px 1fr 160px 48px",
                    background: "#fff",
                    border: isSelected
                      ? "1px solid rgba(0,51,255,0.2)"
                      : "1px solid rgba(0,0,0,0.07)",
                    borderLeft: isSelected
                      ? "3px solid #0033ff"
                      : "1px solid rgba(0,0,0,0.07)",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <span
                    className="text-[10px]"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      color: isSelected ? "#0033ff" : "#c8c4c0",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div
                      className="text-[13.5px] font-semibold"
                      style={{ color: "#1a1a1a" }}
                    >
                      {s.name}
                    </div>
                    <div className="text-[11.5px]" style={{ color: "#aaa" }}>
                      {s.description}
                    </div>
                  </div>
                  <span>
                    <span
                      className="inline-block rounded-md px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        background: pm.bg,
                        color: pm.color,
                      }}
                    >
                      {pm.label}
                    </span>
                  </span>
                  <span className="flex items-center justify-end gap-1.5">
                    {s.required && (
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px]"
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          background: "#f0eeec",
                          color: "#b0aca8",
                        }}
                      >
                        req.
                      </span>
                    )}
                    <span
                      className="text-[11px]"
                      style={{ color: isSelected ? "#0033ff" : "#ddd" }}
                    >
                      {isHeroPattern(s.pattern) ? "✎" : "›"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="mt-5 rounded-xl px-4 py-3.5"
            style={{ background: "#f5f3f0" }}
          >
            <span
              className="mb-1 block text-[9.5px] font-medium uppercase tracking-wide"
              style={{ fontFamily: "'DM Mono', monospace", color: "#c0bbb7" }}
            >
              Shared page structure
            </span>
            <p className="text-[12.5px]" style={{ color: "#888" }}>
              hero → entry points → supporting content → trust → promotion →
              final action
            </p>
          </div>
        </div>

        {/* Right: content panel */}
        <div className="sticky top-6">
          <ContentPanel
            section={selectedSection}
            heroContent={heroContent}
            setHeroContent={setHeroContent}
          />
        </div>
      </div>
    </div>
  );
}

// ── Step 5: Review ────────────────────────────────────────────────────────
function Step5({
  pageType,
  sections,
  setSections,
}: {
  pageType: PageType | null;
  sections: PageSection[];
  setSections: (s: PageSection[]) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const pool = pageType ? addPool(pageType, sections) : [];

  const addSection = (def: SectionDef) => {
    const n = sections.filter((s) => s.pattern === def.pattern).length;
    setSections([
      ...sections,
      makeSection({ ...def, id: `${def.id}-${Date.now()}${n}`, required: false }),
    ]);
    setAddOpen(false);
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setSections(next);
  };

  const remove = (id: string) =>
    setSections(sections.filter((s) => s.id !== id));

  const setVariant = (id: string, v: string) =>
    setSections(sections.map((s) => (s.id === id ? { ...s, variant: v } : s)));

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10">
      <StepHeader
        num="05"
        title="Review and customize"
        desc="Add, remove, and reorder sections. Choose a pattern variant for each section and adjust card counts, media, metrics, and actions."
      />

      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "50% 50%", alignItems: "start" }}
      >
        {/* ── Left: section editor ── */}
        <div>
          <div className="space-y-2.5">
            {sections.map((s, i) => {
              const pm = PATTERN_META[s.pattern];
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5"
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <span
                    className="shrink-0 select-none text-[15px]"
                    style={{ color: "#ddd", cursor: "grab" }}
                  >
                    ⠿
                  </span>

                  <span
                    className="shrink-0 text-[10px]"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      color: "#c8c4c0",
                      minWidth: "20px",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-[13.5px] font-semibold" style={{ color: "#1a1a1a" }}>
                        {s.name}
                      </span>
                      <span
                        className="inline-block rounded-md px-1.5 py-0.5 text-[9.5px] font-medium"
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          background: pm.bg,
                          color: pm.color,
                        }}
                      >
                        {pm.label}
                      </span>
                      {s.required && (
                        <span
                          className="text-[9.5px]"
                          style={{ fontFamily: "'DM Mono', monospace", color: "#ccc" }}
                        >
                          req.
                        </span>
                      )}
                    </div>
                    <div className="text-[12px]" style={{ color: "#b0aca8" }}>
                      {s.description}
                    </div>
                  </div>

                  <select
                    value={s.variant}
                    onChange={(e) => setVariant(s.id, e.target.value)}
                    className="rounded-lg px-2.5 py-1.5 text-[12px] font-medium"
                    style={{
                      border: "1px solid rgba(0,0,0,0.09)",
                      background: "#faf9f7",
                      color: "#555",
                      fontFamily: "'Figtree', system-ui, sans-serif",
                      cursor: "pointer",
                      minWidth: "148px",
                      outline: "none",
                    }}
                  >
                    {s.variants.map((v) => (
                      <option key={v} value={v}>{variantLabel(v)}</option>
                    ))}
                  </select>

                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="flex items-center justify-center rounded p-0.5"
                      style={{ color: i === 0 ? "#e8e5e2" : "#999", cursor: i === 0 ? "default" : "pointer" }}
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === sections.length - 1}
                      className="flex items-center justify-center rounded p-0.5"
                      style={{ color: i === sections.length - 1 ? "#e8e5e2" : "#999", cursor: i === sections.length - 1 ? "default" : "pointer" }}
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => !s.required && remove(s.id)}
                    className="flex items-center justify-center rounded-lg p-1.5"
                    style={{ color: s.required ? "#e8e5e2" : "#cc4400", cursor: s.required ? "not-allowed" : "pointer" }}
                    title={s.required ? "Required section — cannot remove" : "Remove section"}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setAddOpen(!addOpen)}
            className="mt-3.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 transition-colors hover:bg-white"
            style={{ border: "1.5px dashed rgba(0,0,0,0.1)", background: "transparent", color: "#b0aca8" }}
          >
            <Plus size={13} />
            <span className="text-[13px] font-medium">Add section</span>
          </button>
          {addOpen && (
            <div
              className="mt-2 space-y-1.5 rounded-xl p-2"
              style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)" }}
            >
              {pool.length === 0 && (
                <div className="px-3 py-2 text-[12px]" style={{ color: "#b0aca8" }}>
                  No more sections to add.
                </div>
              )}
              {pool.map((d) => {
                const pm = PATTERN_META[d.pattern];
                return (
                  <button
                    key={d.id}
                    onClick={() => addSection(d)}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-[#faf9f7]"
                  >
                    <span className="flex-1 text-[13px] font-medium" style={{ color: "#1a1a1a" }}>
                      {d.name}
                    </span>
                    <span className="text-[11.5px]" style={{ color: "#aaa" }}>
                      {d.description}
                    </span>
                    <span
                      className="rounded-md px-1.5 py-0.5 text-[9.5px] font-medium"
                      style={{ fontFamily: "'DM Mono', monospace", background: pm.bg, color: pm.color }}
                    >
                      {pm.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: live preview ── */}
        <div
          className="sticky top-6 overflow-hidden rounded-2xl"
          style={{ border: "1px solid rgba(0,0,0,0.09)", background: "#f5f3f0" }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
          >
            <span className="text-[12px] font-semibold" style={{ color: "#1a1a1a" }}>
              Page preview
            </span>
            <span
              className="text-[10px]"
              style={{ fontFamily: "'DM Mono', monospace", color: "#b0aca8" }}
            >
              {sections.length} sections
            </span>
          </div>

          <div
            className="overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 260px)", scrollbarWidth: "none" }}
          >
            {sections.map((s, i) => (
              <SectionWire key={s.id} section={s} index={i} />
            ))}
            <div
              className="flex items-center justify-center py-4"
              style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
            >
              <span
                className="text-[9.5px] uppercase tracking-widest"
                style={{ fontFamily: "'DM Mono', monospace", color: "#c0bbb7" }}
              >
                · end of page ·
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 6: Generate ──────────────────────────────────────────────────────
function SummaryRow({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <div
        className="mb-0.5 text-[11px] font-medium"
        style={{ color: "#c0bbb7" }}
      >
        {label}
      </div>
      <div
        className="text-[13px] font-medium"
        style={{ color: value === "—" ? "#c0bbb7" : "#1a1a1a" }}
      >
        {value}
      </div>
    </div>
  );
}

function Step6({
  pageType,
  brief,
  sections,
}: {
  pageType: PageType | null;
  brief: ContentBrief;
  sections: PageSection[];
}) {
  const [generated, setGenerated] = useState(false);
  const typeName =
    PAGE_TYPES.find((p) => p.id === pageType)?.name ?? "Page";

  const loaded = useLoadedSections(generated ? sections : []);

  if (generated) {
    const missing = loaded?.filter((l) => !l.svg).length ?? 0;
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-10">
        <StepHeader
          num="06"
          title="Mock page"
          desc={`${typeName} with ${sections.length} sections, built from the pattern drawings. Text in the drawings is placeholder; your brief is not shown here yet.`}
        />
        <div className="mb-5 flex items-center gap-3">
          <button
            onClick={() => loaded && downloadHtml(`${typeName.toLowerCase().replace(/\s+/g, "-")}-mock.html`, buildHtml(`${typeName} mock`, loaded))}
            disabled={!loaded}
            className="flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white"
            style={{ background: loaded ? "#0033ff" : "#c8c4c0" }}
          >
            Export HTML
          </button>
          <button
            disabled
            title="Available in v2"
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold"
            style={{ border: "1px solid rgba(0,0,0,0.09)", color: "#c0bbb7", cursor: "not-allowed", background: "#fff" }}
          >
            Figma (v2)
          </button>
          <div className="flex-1" />
          {missing > 0 && (
            <span className="text-[12px]" style={{ color: "#cc4400" }}>
              {missing} section{missing > 1 ? "s" : ""} without a drawing
            </span>
          )}
          <button
            onClick={() => setGenerated(false)}
            className="cursor-pointer text-[12.5px] font-medium"
            style={{ color: "#b0aca8" }}
          >
            ← Back to spec
          </button>
        </div>
        <div
          className="overflow-hidden rounded-2xl"
          style={{ border: "1px solid rgba(0,0,0,0.09)", background: "#fff" }}
          data-testid="mock-page"
        >
          <MockPage sections={sections} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] px-6 py-10">
      <StepHeader
        num="06"
        title="Generate"
        desc="Review your complete spec and produce one page or a coordinated page set."
      />

      {/* Brief summary */}
      <div
        className="mb-4 rounded-2xl p-5"
        style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)" }}
      >
        <div
          className="mb-4 text-[10px] font-medium uppercase tracking-widest"
          style={{ fontFamily: "'DM Mono', monospace", color: "#c0bbb7" }}
        >
          Brief summary
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5">
          <SummaryRow label="Page type" value={typeName} />
          <SummaryRow
            label="Audience"
            value={brief.audience.trim() || "—"}
          />
          <SummaryRow
            label="Service line"
            value={brief.serviceLine.trim() || "—"}
          />
          <SummaryRow
            label="Primary action"
            value={brief.primaryAction.trim() || "—"}
          />
          {brief.pageGoal.trim() && (
            <SummaryRow
              label="Page goal"
              value={brief.pageGoal.trim()}
              wide
            />
          )}
        </div>
      </div>

      {/* Sections */}
      <div
        className="mb-5 rounded-2xl p-5"
        style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)" }}
      >
        <div
          className="mb-4 text-[10px] font-medium uppercase tracking-widest"
          style={{ fontFamily: "'DM Mono', monospace", color: "#c0bbb7" }}
        >
          Page structure · {sections.length} sections
        </div>
        <div className="flex flex-wrap gap-2">
          {sections.map((s, i) => {
            const pm = PATTERN_META[s.pattern];
            return (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium"
                style={{ background: pm.bg, color: pm.color }}
              >
                <span
                  className="text-[9px] opacity-60"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.name}
              </span>
            );
          })}
        </div>
        <div
          className="mt-4 rounded-lg px-3.5 py-2.5 text-[12px]"
          style={{ background: "#f5f3f0", color: "#999" }}
        >
          <span
            className="mr-2 text-[9.5px] uppercase tracking-wide"
            style={{ fontFamily: "'DM Mono', monospace", color: "#c0bbb7" }}
          >
            Structure
          </span>
          hero → entry points → supporting content → trust → promotion →
          final action
        </div>
      </div>

      {/* Generate CTA */}
      <button
        onClick={() => setGenerated(true)}
        className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full py-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: "#0033ff" }}
      >
        <Zap size={15} />
        Generate page
      </button>
      <p
        className="mt-3 text-center text-[12px]"
        style={{ color: "#c0bbb7" }}
      >
        Builds a mock {typeName.toLowerCase()} from the pattern drawings, then
        exports it as HTML
      </p>
    </div>
  );
}

// ── Preview panel ────────────────────────────────────────────────────────
function SectionWire({ section, index }: { section: PageSection; index: number }) {
  const pm = PATTERN_META[section.pattern];

  const wireframe = () => {
    switch (WIRE_KIND[section.pattern]) {
      case "hero":
        return (
          <div
            className="flex flex-col items-center justify-center gap-2 px-4 py-7"
            style={{ background: "#1a1a1a" }}
          >
            <div className="h-2.5 w-28 rounded" style={{ background: "rgba(255,255,255,0.22)" }} />
            <div className="h-1.5 w-40 rounded" style={{ background: "rgba(255,255,255,0.12)" }} />
            <div className="h-1.5 w-36 rounded" style={{ background: "rgba(255,255,255,0.10)" }} />
            <div className="mt-2 h-6 w-20 rounded-full" style={{ background: "#0033ff", opacity: 0.7 }} />
          </div>
        );

      case "overview-cards":
      case "graphic-cards":
        return (
          <div className="grid grid-cols-3 gap-1.5 px-3 py-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-lg p-2"
                style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff" }}
              >
                {section.pattern === "graphic-cards" && (
                  <div className="mb-1.5 h-8 rounded" style={{ background: "#f0eeec" }} />
                )}
                <div className="mb-1 h-1.5 w-full rounded" style={{ background: "#e0ddd9" }} />
                <div className="h-1.5 w-4/5 rounded" style={{ background: "#eceae7" }} />
              </div>
            ))}
          </div>
        );

      case "accent-cards":
        return (
          <div className="grid grid-cols-3 gap-1.5 px-3 py-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 rounded-lg p-2.5"
                style={{ background: pm.bg }}
              >
                <div className="h-3.5 w-10 rounded" style={{ background: pm.color, opacity: 0.28 }} />
                <div className="h-1.5 w-full rounded" style={{ background: pm.color, opacity: 0.14 }} />
              </div>
            ))}
          </div>
        );

      case "text-media":
        return (
          <div className="grid grid-cols-2 gap-2.5 px-3 py-3">
            <div className="flex flex-col gap-1.5">
              <div className="h-2 w-3/4 rounded" style={{ background: "#ddd" }} />
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-1.5 rounded" style={{ background: "#eceae7", width: i === 2 ? "70%" : "100%" }} />
              ))}
              <div className="mt-1 h-5 w-14 rounded-full" style={{ background: "#1a1a1a", opacity: 0.15 }} />
            </div>
            <div className="rounded-lg" style={{ background: "#f0eeec", minHeight: 68 }} />
          </div>
        );

      case "expanded-text":
        return (
          <div className="flex flex-col gap-1.5 px-3 py-3">
            <div className="mb-0.5 h-2 w-1/2 rounded" style={{ background: "#ddd" }} />
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-1.5 rounded"
                style={{ background: "#eceae7", width: i === 4 ? "55%" : i === 2 ? "88%" : "100%" }}
              />
            ))}
          </div>
        );

      case "external-link-cards":
        return (
          <div className="flex flex-col gap-1.5 px-3 py-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ border: "1px solid rgba(0,0,0,0.07)", background: "#fff" }}
              >
                <div className="h-1.5 flex-1 rounded" style={{ background: "#eceae7" }} />
                <div className="h-2 w-2 rounded-full" style={{ background: "#ddd" }} />
              </div>
            ))}
          </div>
        );

      case "form":
        return (
          <div className="flex flex-col gap-2 px-3 py-3">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-7 rounded-lg"
                style={{ border: "1px solid rgba(0,0,0,0.1)", background: "#fff" }}
              />
            ))}
            <div className="h-7 rounded-full" style={{ background: "#1a1a1a", opacity: 0.14 }} />
          </div>
        );

      case "promo-banner":
        return (
          <div
            className="flex flex-col items-center justify-center gap-2 px-3 py-5"
            style={{ background: pm.bg }}
          >
            <div className="h-2 w-28 rounded" style={{ background: pm.color, opacity: 0.28 }} />
            <div className="h-1.5 w-20 rounded" style={{ background: pm.color, opacity: 0.18 }} />
            <div className="mt-1 h-5 w-16 rounded-full" style={{ background: pm.color, opacity: 0.22 }} />
          </div>
        );

      default:
        return (
          <div className="px-3 py-5">
            <div className="h-1.5 w-full rounded" style={{ background: "#eceae7" }} />
          </div>
        );
    }
  };

  return (
    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      {/* Section label row */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5"
        style={{ background: "#f5f3f0" }}
      >
        <span
          className="text-[9.5px]"
          style={{ fontFamily: "'DM Mono', monospace", color: "#c0bbb7" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex-1 truncate text-[11px] font-medium" style={{ color: "#555" }}>
          {section.name}
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-medium"
          style={{
            fontFamily: "'DM Mono', monospace",
            background: pm.bg,
            color: pm.color,
          }}
        >
          {pm.label}
        </span>
      </div>
      {/* Wireframe */}
      {wireframe()}
    </div>
  );
}

function PreviewPanel({ sections }: { sections: PageSection[] }) {
  const typeName = sections.length > 0
    ? "Page preview"
    : "No sections yet";

  return (
    <aside
      className="flex w-[272px] shrink-0 flex-col overflow-hidden"
      style={{
        borderLeft: "1px solid rgba(0,0,0,0.09)",
        background: "#f5f3f0",
      }}
    >
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", background: "#f5f3f0" }}
      >
        <span className="text-[12px] font-semibold" style={{ color: "#1a1a1a" }}>
          {typeName}
        </span>
        {sections.length > 0 && (
          <span
            className="text-[10px]"
            style={{ fontFamily: "'DM Mono', monospace", color: "#b0aca8" }}
          >
            {sections.length} sections
          </span>
        )}
      </div>

      {/* Wireframe scroll */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {sections.length === 0 ? (
          <div
            className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center"
          >
            <span className="text-[22px] opacity-20">⬜</span>
            <p className="text-[12px]" style={{ color: "#b0aca8" }}>
              Complete steps 2–3 to see a page preview here.
            </p>
          </div>
        ) : (
          <>
            {sections.map((s, i) => (
              <SectionWire key={s.id} section={s} index={i} />
            ))}
            {/* Page end indicator */}
            <div
              className="flex items-center justify-center py-4"
              style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
            >
              <span
                className="text-[9.5px] uppercase tracking-widest"
                style={{ fontFamily: "'DM Mono', monospace", color: "#c0bbb7" }}
              >
                · end of page ·
              </span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

// ── Step footer nav ───────────────────────────────────────────────────────
function StepFooter({
  step,
  canAdvance,
  onNext,
  onBack,
}: {
  step: number;
  canAdvance: boolean;
  onNext: () => void;
  onBack: () => void;
}) {
  const isLast = step === 6;
  return (
    <div
      className="flex shrink-0 items-center justify-between px-8 py-3.5"
      style={{
        borderTop: "1px solid rgba(0,0,0,0.07)",
        background: "#fff",
      }}
    >
      <button
        onClick={onBack}
        disabled={step === 1}
        className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-all"
        style={{
          border: "1px solid rgba(0,0,0,0.09)",
          color: step === 1 ? "#d8d4d0" : "#666",
          cursor: step === 1 ? "default" : "pointer",
          background: "#fff",
        }}
      >
        ← Back
      </button>

      <span
        className="text-[10.5px]"
        style={{ fontFamily: "'DM Mono', monospace", color: "#c8c4c0" }}
      >
        {step} / 6
      </span>

      {isLast ? (
        <div style={{ width: "88px" }} />
      ) : (
        <button
          onClick={onNext}
          disabled={!canAdvance}
          className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold text-white transition-all"
          style={{
            background: canAdvance ? "#1a1a1a" : "#e0ddd9",
            cursor: canAdvance ? "pointer" : "not-allowed",
          }}
        >
          Continue →
        </button>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(3);
  const [pageType, setPageType] = useState<PageType | null>("business");
  const [brief, setBrief] = useState<ContentBrief>({
    audience:
      "Current Cigna/Evernorth members who have been prescribed a GLP-1 medication and are seeking pharmacy fulfillment, dosing support, and cost management.",
    serviceLine:
      "Evernorth EnGuide℠ Pharmacy — specialty home delivery pharmacy for GLP-1 medications, operating under the Evernorth® brand.",
    pageGoal:
      "Drive enrolled members to use EnGuide Pharmacy for their GLP-1 prescriptions. Communicate the distinct benefits (dosing guidance, 90-day supply, EPP, auto-reminders, savings cards) and provide clear entry points for new members, current members, and providers.",
    primaryAction: "Log in to account",
    secondaryAction: "Explore FAQs",
    requiredContent:
      "• Evernorth® / EnGuide℠ brand attribution\n• Pharmacist availability and direct-to-doctor coordination\n• 90-day supply benefit and cost/continuity rationale\n• Extended Payment Plan (EPP) — 3 equal payments\n• Automatic refill reminders at 7-day and 2-day windows\n• Manufacturer savings card acceptance disclaimer\n• Free standard shipping disclosure\n• Express Scripts® Pharmacy callout for non-GLP-1 prescriptions",
    existingCopy:
      "Support on your GLP-1 journey\n\nHeld to the highest standards under the Evernorth® brand, Evernorth EnGuide℠ Pharmacy is committed to offering guidance and support on your GLP-1 journey. Our team of specially trained pharmacists are readily available to address your needs and work directly with your doctor to help you save money, discuss treatment options, and more.\n\nNeed a prescription that isn't a GLP-1? Express Scripts® Pharmacy, an Evernorth home delivery pharmacy, is ready to assist you.\n\nMember benefits\nAs an Evernorth EnGuide Pharmacy patient, you'll have access to:\n— Assistance with getting you safely to your optimal dose for best results\n— 90-day supplies: Switching to a longer supply could save you time and money while ensuring your therapy remains uninterrupted.\n— Extended Payment Plan (EPP): Spread out your costs with the option to pay in three equal payments instead of all at once.\n— Automatic reminders: We'll send you notifications reminding you to place an order when you're seven days and two days away from needing a refill.\n— Manufacturer's savings card programs (also known as coupons): We are currently accepting select manufacturer savings cards.\n\nHow to get started\nNew and current members: We'll send your GLP-1 prescription right to your door, with free standard shipping.\nProviders: When your patients request GLP-1s, we're here to work with you.",
  });
  const [pasteText, setPasteText] = useState("");
  const [sections, setSections] = useState<PageSection[]>([]);
  const [completed, setCompleted] = useState<Set<number>>(new Set([1, 2]));
  const [heroContent, setHeroContent] = useState<HeroContent>(DEFAULT_HERO);

  const canAdvance =
    step === 1
      ? true
      : step === 2
        ? pageType !== null
        : step === 3
          ? brief.audience.trim().length > 0
          : step === 4
            ? true
            : step === 5
              ? sections.length > 0
              : false;

  const goNext = useCallback(() => {
    // Initialize sections when leaving step 3
    if (step === 3 && pageType) {
      if (sections.length === 0) {
        setSections(initSections(pageType));
      }
    }
    setCompleted((prev) => new Set([...prev, step]));
    setStep((s) => Math.min(s + 1, 6));
  }, [step, pageType, sections.length]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  // Derive sections for step 4 if not yet initialized
  const step4Sections =
    sections.length > 0
      ? sections
      : pageType
        ? initSections(pageType)
        : [];

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ fontFamily: "'Figtree', system-ui, sans-serif" }}
    >
      {/* Toolbar */}
      <header
        className="flex shrink-0 items-center gap-2.5 px-5 py-2.5"
        style={{
          background: "#0c0c0c",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <span
          className="flex h-5 w-5 items-center justify-center rounded-md text-[11px]"
          style={{ background: "#222", color: "#666" }}
        >
          ◈
        </span>
        <span
          className="text-[13px] font-semibold"
          style={{ color: "#d0cdc9" }}
        >
          Page Builder
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10.5px] font-medium"
          style={{
            fontFamily: "'DM Mono', monospace",
            background: "#1c1c1c",
            color: "#484848",
          }}
        >
          spec plan mode
        </span>
        <div className="flex-1" />
        <span
          className="text-[10.5px]"
          style={{ fontFamily: "'DM Mono', monospace", color: "#383838" }}
        >
          v0.1.1 · prototype
        </span>
      </header>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        <Sidebar
          step={step}
          completed={completed}
          onNavigate={(s) => {
            if (completed.has(s) || s <= step) setStep(s);
          }}
        />

        <main
          className="flex flex-1 flex-col overflow-hidden"
          style={{ background: "#faf9f7" }}
        >
          <div
            className="flex-1 overflow-y-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {step === 1 && <Step1 />}
            {step === 2 && (
              <Step2
                pageType={pageType}
                setPageType={(t) => {
                  setPageType(t);
                  setSections([]);
                }}
              />
            )}
            {step === 3 && (
              <Step3 brief={brief} setBrief={setBrief} pasteText={pasteText} setPasteText={setPasteText} />
            )}
            {step === 4 && (
              <Step4
                pageType={pageType}
                sections={step4Sections}
                heroContent={heroContent}
                setHeroContent={setHeroContent}
              />
            )}
            {step === 5 && (
              <Step5 pageType={pageType} sections={sections} setSections={setSections} />
            )}
            {step === 6 && (
              <Step6
                pageType={pageType}
                brief={brief}
                sections={sections}
              />
            )}
          </div>

          <StepFooter
            step={step}
            canAdvance={canAdvance}
            onNext={goNext}
            onBack={goBack}
          />
        </main>

      </div>
    </div>
  );
}
