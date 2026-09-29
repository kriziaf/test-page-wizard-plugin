import { useEffect, useState } from "react";
import { loadSvg, PATTERNS, variantLabel, type PatternId } from "../patterns/registry";

export interface MockSection {
  id: string;
  name: string;
  pattern: PatternId;
  variant: string;
}

export type LoadedSection = MockSection & { svg: string | null };

/** Loads the SVG for every section, in order. */
export function useLoadedSections(sections: MockSection[]): LoadedSection[] | null {
  const [loaded, setLoaded] = useState<LoadedSection[] | null>(null);
  const key = sections.map((s) => `${s.id}:${s.pattern}:${s.variant}`).join("|");
  useEffect(() => {
    let cancelled = false;
    setLoaded(null);
    Promise.all(
      sections.map(async (s) => ({ ...s, svg: await loadSvg(s.pattern, s.variant) })),
    ).then((r) => {
      if (!cancelled) setLoaded(r);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return loaded;
}

export function MissingBlock({ section }: { section: MockSection }) {
  return (
    <div
      style={{
        height: 240,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f6f5f3",
        border: "1.5px dashed #c8c4c0",
        color: "#888",
        fontSize: 14,
      }}
    >
      No drawing yet: {PATTERNS[section.pattern].label} / {variantLabel(section.variant)}
    </div>
  );
}

/** Stacks the SVG for each section, full width, in order. */
export function MockPage({ sections }: { sections: MockSection[] }) {
  const loaded = useLoadedSections(sections);
  if (!loaded) {
    return <div style={{ padding: 40, color: "#aaa", fontSize: 13 }}>Building mock page…</div>;
  }
  return (
    <div style={{ background: "#fff" }}>
      {loaded.map((s) =>
        s.svg ? (
          <div
            key={s.id}
            data-section={`${s.pattern}--${s.variant}`}
            className="mock-svg"
            dangerouslySetInnerHTML={{ __html: s.svg }}
          />
        ) : (
          <MissingBlock key={s.id} section={s} />
        ),
      )}
      <style>{`.mock-svg{line-height:0}.mock-svg svg{display:block;width:100%;height:auto}`}</style>
    </div>
  );
}
