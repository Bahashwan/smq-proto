// Contact sheets of the rejected candidates (6 per sheet, 3 columns, labelled) for reviewing what can still be used.
// Usage: node scripts/images/rejected-sheet.mjs <out-dir>
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
const root = path.resolve("public/images/_candidates/_rejected");
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const files = fs.readdirSync(root).flatMap((d) => fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith(".png")).map((f) => path.join(root, d, f)));
const W = 460, COLS = 3, PER = 6;
for (let s = 0; s * PER < files.length; s++) {
  const batch = files.slice(s * PER, s * PER + PER);
  const tiles = [];
  for (const f of batch) {
    const img = await sharp(f).resize({ width: W }).png().toBuffer();
    const m = await sharp(img).metadata();
    const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="24"><rect width="100%" height="100%" fill="#141311"/><text x="6" y="17" font-family="sans-serif" font-size="13" font-weight="700" fill="#B48F2E">${path.basename(f, ".png")}</text></svg>`);
    tiles.push({ img, h: m.height, label });
  }
  const rows = Math.ceil(tiles.length / COLS);
  const rowH = Math.max(...tiles.map((t) => t.h)) + 24 + 8;
  const comps = [];
  tiles.forEach((t, i) => {
    const x = (i % COLS) * (W + 8), y = Math.floor(i / COLS) * rowH;
    comps.push({ input: t.label, left: x, top: y }, { input: t.img, left: x, top: y + 24 });
  });
  const file = path.join(out, `rejected-${s + 1}.png`);
  await sharp({ create: { width: COLS * (W + 8), height: rows * rowH, channels: 3, background: "#D4CFC4" } }).composite(comps).png().toFile(file);
  console.log(file, batch.map((f) => path.basename(f, ".png")).join(" "));
}
