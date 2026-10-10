// Re-uses generated candidates by cropping them to the slot's ratio (no new generation): reads
// scripts/images/crops.json, writes public/images/<slot>/source.png and records the pick in picks.json, so
// `npm run images:convert` turns them into the AVIF/WebP sets. Used to keep the sea out of inland project and unit
// slots (Unit-Tier-Gen-M «لا إطلالات حقيقية مزعومة») when the first-run candidates showed it through a window.
// Usage: npx tsx scripts/images/crop.ts [--only=IMG-…] [--preview=docs/shots/tmp/images/crops]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

interface Crop {
  /** candidate number (c1 / c2) */
  candidate: number;
  /** "_rejected" when the candidate was moved there */
  from?: string;
  /** left, top and right edge as fractions of the source; the bottom follows from the slot ratio */
  box: [number, number, number];
  ratio: "3:2" | "16:9" | "4:5" | "1:1";
  /** sky retouch inside the cropped frame, in its pixels [x0, x1, y0, y1]: blue sea (and white specks such as a boat)
   *  in that band take the sky colour just above it; warm wall and pillar pixels stay */
  sky?: [number, number, number, number];
  note: string;
}

const argv = process.argv.slice(2);
const opt = (k: string) => argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const only = opt("only");
const preview = opt("preview");
const CROPS: Record<string, Crop> = JSON.parse(fs.readFileSync(path.resolve("scripts/images/crops.json"), "utf8"));
const PICKS = path.resolve("scripts/images/picks.json");
const picks = fs.existsSync(PICKS) ? JSON.parse(fs.readFileSync(PICKS, "utf8")) : {};
const R: Record<Crop["ratio"], number> = { "3:2": 3 / 2, "16:9": 16 / 9, "4:5": 4 / 5, "1:1": 1 };

for (const [slot, c] of Object.entries(CROPS)) {
  if (only && slot !== only) continue;
  const src = path.resolve("public/images/_candidates", c.from ?? "", slot, `${slot}-c${c.candidate}.png`);
  if (!fs.existsSync(src)) {
    console.warn(`skip ${slot}: ${path.relative(process.cwd(), src)} missing`);
    continue;
  }
  const meta = await sharp(src).metadata();
  const W = meta.width ?? 0;
  const H = meta.height ?? 0;
  const left = Math.round(c.box[0] * W);
  const top = Math.round(c.box[1] * H);
  const width = Math.round((c.box[2] - c.box[0]) * W);
  const height = Math.min(H - top, Math.round(width / R[c.ratio]));
  const w = Math.round(height * R[c.ratio]);
  const region = { left, top, width: Math.min(w, W - left), height };
  const dest = path.resolve("public/images", slot, "source.png");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (c.sky) {
    const { data, info } = await sharp(src).extract(region).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const [x0, x1, y0, y1] = c.sky;
    const at = (x: number, y: number) => (y * info.width + x) * info.channels;
    for (let x = x0; x < x1; x++) {
      // sky colour of this column, averaged over the four rows above the band
      const sky = [0, 1, 2].map((k) => (data[at(x, y0 - 6) + k] + data[at(x, y0 - 5) + k] + data[at(x, y0 - 4) + k] + data[at(x, y0 - 3) + k]) / 4);
      for (let y = y0; y < y1; y++) {
        const i = at(x, y);
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        const sea = b > r + 6 || (Math.min(r, g, b) > 215 && Math.abs(r - b) < 18);
        if (sea) [0, 1, 2].forEach((k) => (data[i + k] = Math.round(sky[k])));
      }
    }
    await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } }).png().toFile(dest);
  } else {
    await sharp(src).extract(region).png().toFile(dest);
  }
  if (preview) {
    fs.mkdirSync(path.resolve(preview), { recursive: true });
    await sharp(dest).resize({ width: 720 }).png().toFile(path.resolve(preview, `${slot}.png`));
  }
  picks[slot] = {
    candidate: `c${c.candidate}`,
    file: path.relative(process.cwd(), dest),
    model: "bfl/flux-3-image",
    crop: { ...region, of: `${W}×${H}` },
    pickedAt: new Date().toISOString(),
    note: c.note,
  };
  console.log(`${slot}: c${c.candidate} ${region.width}×${region.height} at ${left},${top} of ${W}×${H}`);
}
fs.writeFileSync(PICKS, JSON.stringify(picks, null, 2) + "\n");
