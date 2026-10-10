// Renders design/preview/<Board>.html at the board's own width to docs/shots/boards/<Board>.png.
// Usage: npm run shots:boards [-- Board-Name ...]   (no names = every board that has a screen entry)
import path from "node:path";
import fs from "node:fs";
import { launch, newPage, settle, localFontCss, ensureDir, boardWidth } from "./lib";
import { allScreens } from "../../lib/screens";

const args = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const names = args.length ? args : Array.from(new Set(allScreens.map((s) => s.board)));
const previewDir = path.resolve("design/preview");

const browser = await launch();
for (const board of names) {
  const file = path.join(previewDir, `${board}.html`);
  if (!fs.existsSync(file)) {
    console.warn(`skip ${board}: no board file`);
    continue;
  }
  const width = boardWidth(board);
  const page = await newPage(browser, width === 390 ? 390 : 1440, 900);
  await page.goto(`file://${file}`, { waitUntil: "load" });
  await page.addStyleTag({ content: localFontCss() });
  await settle(page, 300);
  const out = path.resolve("docs/shots/boards", `${board}.png`);
  ensureDir(out);
  await page.screenshot({ path: out, fullPage: true });
  console.log(`${board} → ${path.relative(process.cwd(), out)}`);
  await page.context().close();
}
await browser.close();
