// One ad-hoc page screenshot. Usage: npx tsx scripts/shots/shot.ts <url> <390|1440> <out.png> [--viewport] [--wait=ms] [--click=selector]
import path from "node:path";
import { launch, newPage, settle, ensureDir } from "./lib";

const [url, widthArg, outArg, ...rest] = process.argv.slice(2);
if (!url || !widthArg || !outArg) {
  console.error("usage: shot.ts <url> <390|1440> <out.png> [--viewport] [--wait=ms] [--click=selector]");
  process.exit(1);
}
const width = parseInt(widthArg, 10);
const viewportOnly = rest.includes("--viewport");
const wait = parseInt(rest.find((a) => a.startsWith("--wait="))?.slice(7) ?? "250", 10);
const click = rest.find((a) => a.startsWith("--click="))?.slice(8);

const browser = await launch();
const page = await newPage(browser, width, 900);
await page.goto(url, { waitUntil: "load" });
await settle(page, wait);
if (click) {
  await page.click(click);
  await settle(page, 250);
}
const out = path.resolve(outArg);
ensureDir(out);
await page.screenshot({ path: out, fullPage: !viewportOnly });
console.log(path.relative(process.cwd(), out));
await browser.close();
