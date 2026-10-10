// Converts every picked source.png to responsive AVIF + WebP with a blur placeholder.
// Writes public/images/<slot>/<slot>-{640,1280,2048}.{avif,webp} and public/images/manifest.json. A cropped source
// narrower than the next size keeps its own width as the largest file (e.g. 1259 instead of only 640).
// Usage: npx tsx scripts/images/convert.ts [--only=IMG-…]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PICKS = path.resolve("scripts/images/picks.json");
const picks = fs.existsSync(PICKS) ? JSON.parse(fs.readFileSync(PICKS, "utf8")) : {};
const WIDTHS = [640, 1280, 2048];
const manifestPath = path.resolve("public/images/manifest.json");
const manifest: Record<string, { width: number; height: number; widths: number[]; blur: string }> = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};

const only = process.argv.slice(2).find((a) => a.startsWith("--only="))?.slice(7);
for (const [slot, pick] of Object.entries(picks as Record<string, { file: string }>)) {
  if (only && slot !== only) continue;
  const src = path.resolve(pick.file);
  if (!fs.existsSync(src)) {
    console.warn(`skip ${slot}: ${pick.file} missing`);
    continue;
  }
  const dir = path.dirname(src);
  const meta = await sharp(src).metadata();
  const widths = WIDTHS.filter((w) => w <= (meta.width ?? 2048));
  const native = meta.width ?? 0;
  if (native >= 1000 && native < 2048 && native > widths[widths.length - 1]) widths.push(native);
  for (const w of widths) {
    await sharp(src).resize({ width: w }).avif({ quality: 50 }).toFile(path.join(dir, `${slot}-${w}.avif`));
    await sharp(src).resize({ width: w }).webp({ quality: 78 }).toFile(path.join(dir, `${slot}-${w}.webp`));
  }
  const blur = await sharp(src).resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  manifest[slot] = { width: meta.width ?? 0, height: meta.height ?? 0, widths, blur: `data:image/webp;base64,${blur.toString("base64")}` };
  console.log(`${slot}: ${widths.join("/")} avif+webp`);
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`manifest: ${Object.keys(manifest).length} slot(s)`);
