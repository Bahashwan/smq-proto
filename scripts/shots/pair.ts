// Board ↔ page comparison sheets: the board render (docs/shots/boards/<Board>.png) beside the page shot
// (docs/shots/<Board>.png), cut into slices small enough to read at full size. The page slice starts at the same
// proportion of its height as the board slice, so sections stay roughly level when the two heights differ.
// Usage: npx tsx scripts/shots/pair.ts <Board> [<Board> …] [--group=g3-unit] [--h=1100] [--scale=1] [--out=docs/shots/tmp/pairs]
//        npx tsx scripts/shots/pair.ts --crop=<png> --y=<top> --h=<height> [--x=0] [--w=<width>] --to=<out.png>   (zoom)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const argv = process.argv.slice(2);
const opt = (k: string) => argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);

if (opt("crop")) {
  const src = opt("crop")!;
  const meta = await sharp(src).metadata();
  const y = Math.max(0, parseInt(opt("y") ?? "0", 10));
  const x = Math.max(0, parseInt(opt("x") ?? "0", 10));
  const h = Math.min(parseInt(opt("h") ?? "900", 10), (meta.height ?? 0) - y);
  const w = Math.min(parseInt(opt("w") ?? String(meta.width), 10), (meta.width ?? 0) - x);
  const to = path.resolve(opt("to") ?? "docs/shots/tmp/crop.png");
  fs.mkdirSync(path.dirname(to), { recursive: true });
  await sharp(src).extract({ left: x, top: y, width: w, height: h }).png().toFile(to);
  console.log(path.relative(process.cwd(), to));
  process.exit(0);
}

let boards = argv.filter((a) => !a.startsWith("--"));
const group = opt("group");
if (group) boards = [...new Set((await import(`../../lib/screens/${group}`)).screens.map((s: { board: string }) => s.board))] as string[];
const outDir = path.resolve(opt("out") ?? "docs/shots/tmp/pairs");
fs.mkdirSync(outDir, { recursive: true });

const GAP = 16;
const LABEL = 28;
const label = (text: string, width: number) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${LABEL}"><rect width="100%" height="100%" fill="#141311"/><text x="8" y="19" font-family="sans-serif" font-size="14" font-weight="700" fill="#B48F2E">${text}</text></svg>`);

for (const board of boards) {
  const bFile = path.resolve("docs/shots/boards", `${board}.png`);
  const pFile = path.resolve("docs/shots", `${board}.png`);
  if (!fs.existsSync(bFile) || !fs.existsSync(pFile)) {
    console.log(`${board}: missing ${fs.existsSync(bFile) ? "page shot" : "board render"}`);
    continue;
  }
  const bm = await sharp(bFile).metadata();
  const pm = await sharp(pFile).metadata();
  const width = bm.width ?? 390;
  const phone = width <= 500;
  // phone: full size, side by side · desktop: half size, side by side (crop a region with --crop to read small text)
  const scale = parseFloat(opt("scale") ?? (phone ? "1" : "0.5"));
  const sliceH = parseInt(opt("h") ?? (phone ? "1100" : "1800"), 10);
  const bH = bm.height ?? 0;
  const pH = pm.height ?? 0;
  const ratio = pH / bH;
  const n = Math.ceil(bH / sliceH);
  const colW = Math.round(width * scale);
  const outs: string[] = [];
  for (let i = 0; i < n; i++) {
    const bTop = i * sliceH;
    const bh = Math.min(sliceH, bH - bTop);
    const pTop = Math.min(Math.round(bTop * ratio), Math.max(0, pH - 1));
    const ph = Math.max(1, Math.min(Math.round(sliceH * Math.max(1, ratio)), pH - pTop));
    const bBuf = await sharp(bFile).extract({ left: 0, top: bTop, width, height: bh }).resize({ width: colW }).png().toBuffer();
    const pBuf = await sharp(pFile).extract({ left: 0, top: pTop, width: pm.width ?? width, height: ph }).resize({ width: colW }).png().toBuffer();
    const bOutH = Math.round(bh * scale);
    const pOutH = Math.round(ph * scale);
    const H = LABEL + Math.max(bOutH, pOutH);
    const W = colW * 2 + GAP;
    const file = path.join(outDir, `${board}-${String(i + 1).padStart(2, "0")}.png`);
    // RTL reading order: the board on the right, the page on the left
    await sharp({ create: { width: W, height: H, channels: 3, background: "#D4CFC4" } })
      .composite([
        { input: label(`BOARD ${board} · y ${bTop}–${bTop + bh} of ${bH}`, colW), left: colW + GAP, top: 0 },
        { input: label(`PAGE · y ${pTop}–${pTop + ph} of ${pH}`, colW), left: 0, top: 0 },
        { input: bBuf, left: colW + GAP, top: LABEL },
        { input: pBuf, left: 0, top: LABEL },
      ])
      .png()
      .toFile(file);
    outs.push(path.relative(process.cwd(), file));
  }
  console.log(`${board} (${width}px · board ${bH}px · page ${pH}px) → ${outs.join(" ")}`);
}
