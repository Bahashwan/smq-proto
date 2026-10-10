// Page shots: one per screen entry, docs/shots/<Board>.png at the board's width, from a running server.
// Usage: npm run shots [-- --base=http://localhost:3000] [--group=g2-results] [--board=Home-M]
import path from "node:path";
import { launch, newPage, settle, ensureDir } from "./lib";
import { allScreens } from "../../lib/screens";

const argv = process.argv.slice(2);
const opt = (k: string) => argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const base = opt("base") ?? "http://localhost:3000";
const onlyBoard = opt("board");
const outDir = opt("out") ?? "docs/shots";
const group = opt("group");

let list = allScreens;
if (onlyBoard) list = list.filter((s) => s.board === onlyBoard);
if (group) {
  const mod = await import(`../../lib/screens/${group}`);
  list = mod.screens;
}

const browser = await launch();
for (const s of list) {
  const page = await newPage(browser, s.width, 900);
  await page.goto(base + s.route, { waitUntil: "load" });
  await settle(page, s.prepare?.wait ?? 300);
  if (s.prepare?.fill) {
    for (const [sel, val] of Object.entries(s.prepare.fill)) await page.fill(sel, val);
  }
  if (s.prepare?.click) {
    await page.click(s.prepare.click);
    await settle(page, 300);
  }
  if (s.prepare?.scroll) {
    await page.evaluate((y) => window.scrollTo(0, y), s.prepare.scroll);
    await page.waitForTimeout(300);
  }
  const out = path.resolve(outDir, `${s.board}.png`);
  ensureDir(out);
  await page.screenshot({ path: out, fullPage: !s.viewport });
  console.log(`${s.board} (${s.width}) ${s.route} → ${path.relative(process.cwd(), out)}`);
  await page.context().close();
}
await browser.close();
