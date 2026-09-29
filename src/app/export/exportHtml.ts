import { PATTERNS, variantLabel } from "../patterns/registry";
import type { LoadedSection } from "../mock/MockPage";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** One standalone HTML file: SVGs inlined, no external requests. */
export function buildHtml(title: string, sections: LoadedSection[]): string {
  const body = sections
    .map((s) =>
      s.svg
        ? `<section data-section="${esc(s.pattern)}--${esc(s.variant)}">${s.svg}</section>`
        : `<section class="missing">No drawing yet: ${esc(PATTERNS[s.pattern].label)} / ${esc(variantLabel(s.variant))}</section>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
body{margin:0;background:#fff}
section{line-height:0}
section svg{display:block;width:100%;height:auto}
section.missing{line-height:1.4;padding:80px 24px;text-align:center;font:14px system-ui,sans-serif;color:#888;background:#f6f5f3}
</style>
</head>
<body>
${body}
</body>
</html>
`;
}

export function downloadHtml(filename: string, html: string) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
