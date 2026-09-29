// Builds optimized copies of the pattern SVGs into src/app/patterns/_generated/.
// Sources are never modified. Steps per file:
//   1. Downscale embedded base64 images to MAX_WIDTH (PNG keeps alpha, others JPEG).
//   2. Run SVGO with per-file ID prefixing (safe to inline many SVGs in one page).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { optimize } from "svgo";

const MAX_WIDTH = 1200;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/app/patterns");
const outDir = path.join(root, "_generated");
const groups = ["card-patterns", "text-and-list", "functional-patterns"];
const IMG = /data:image\/(png|jpe?g);base64,([A-Za-z0-9+/=\s]+)/g;

async function shrink(svg) {
  const matches = [...svg.matchAll(IMG)];
  let out = svg;
  for (const m of matches) {
    const buf = Buffer.from(m[2].replace(/\s/g, ""), "base64");
    const meta = await sharp(buf).metadata();
    if (!meta.width || meta.width <= MAX_WIDTH) continue;
    const img = sharp(buf).resize({ width: MAX_WIDTH });
    const png = meta.hasAlpha;
    const data = png
      ? await img.png({ compressionLevel: 9 }).toBuffer()
      : await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    out = out.replace(m[0], `data:image/${png ? "png" : "jpeg"};base64,${data.toString("base64")}`);
  }
  return out;
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
let before = 0, after = 0, n = 0;
for (const g of groups) {
  const dir = path.join(root, g);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".svg"))) {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    const shrunk = await shrink(src);
    const res = optimize(shrunk, {
      multipass: true,
      plugins: [
        {
          name: "preset-default",
          params: { overrides: { cleanupIds: false, convertTransform: false, convertPathData: { floatPrecision: 3 } } },
        },
        { name: "prefixIds", params: { prefix: f.replace(/\.svg$/, "") } },
      ],
    });
    fs.writeFileSync(path.join(outDir, f), res.data);
    before += Buffer.byteLength(src); after += Buffer.byteLength(res.data); n++;
  }
}
console.log(`optimize-patterns: ${n} SVGs, ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`);
