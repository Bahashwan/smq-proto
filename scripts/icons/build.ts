// Builds the favicon and app icons per the Icons board: the gold mark on ink, 20% margin, no radius in the source;
// the maskable icon is the solid gold hexagon inside the 80% safe area; 16px favicons simplify to the hexagon.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const INK = "#141311";
const GOLD = "#B48F2E";
const mark = path.resolve("design/brand/logo-mark-gold.png");
const out = (f: string) => path.resolve("public", f);

async function markOnInk(size: number, margin = 0.2): Promise<Buffer> {
  const inner = Math.round(size * (1 - 2 * margin));
  const m = await sharp(mark).resize({ width: inner, height: inner, fit: "inside" }).png().toBuffer();
  const meta = await sharp(m).metadata();
  const left = Math.round((size - (meta.width ?? inner)) / 2);
  const top = Math.round((size - (meta.height ?? inner)) / 2);
  return sharp({ create: { width: size, height: size, channels: 4, background: INK } }).composite([{ input: m, left, top }]).png().toBuffer();
}

function hexSvg(size: number, safe = 0.8): string {
  const s = size * safe;
  const o = (size - s) / 2;
  const pts = [[0.25, 0], [0.75, 0], [1, 0.5], [0.75, 1], [0.25, 1], [0, 0.5]].map(([x, y]) => `${o + x * s},${o + y * s}`).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${INK}"/><polygon points="${pts}" fill="${GOLD}"/></svg>`;
}

const markB64 = fs.readFileSync(mark).toString("base64");
const favSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="${INK}"/><image href="data:image/png;base64,${markB64}" x="12.8" y="12.8" width="38.4" height="38.4" preserveAspectRatio="xMidYMid meet"/></svg>`;
fs.writeFileSync(out("favicon.svg"), favSvg);
fs.writeFileSync(out("favicon-32.png"), await markOnInk(32, 0.15));
fs.writeFileSync(out("favicon-16.png"), await sharp(Buffer.from(hexSvg(16, 0.9))).png().toBuffer());
fs.writeFileSync(out("apple-touch-icon.png"), await markOnInk(180));
fs.writeFileSync(out("icon-512.png"), await markOnInk(512));
fs.writeFileSync(out("icon-512-maskable.png"), await sharp(Buffer.from(hexSvg(512, 0.8))).png().toBuffer());
fs.writeFileSync(
  out("manifest.webmanifest"),
  JSON.stringify(
    { name: "إس إم كيو العقارية", short_name: "SMQ", start_url: "/", display: "standalone", background_color: INK, theme_color: INK, dir: "rtl", lang: "ar", icons: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }, { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }] },
    null,
    2,
  ),
);
console.log("icons: favicon.svg favicon-16.png favicon-32.png apple-touch-icon.png icon-512.png icon-512-maskable.png manifest.webmanifest");
