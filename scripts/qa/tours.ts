// Walks every guided tour step: the overlay must show, the route must load without errors.
// Writes docs/shots/tours/<tour>-<step>-<width>.png. Usage: npx tsx scripts/qa/tours.ts [--base=…] [--width=1440]
import path from "node:path";
import { launch, newPage, ensureDir } from "../shots/lib";
import { TOURS, tourHref } from "../../lib/tours";

const argv = process.argv.slice(2);
const opt = (k: string) => argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const base = opt("base") ?? "http://localhost:3000";
const width = parseInt(opt("width") ?? "1440", 10);
const browser = await launch();
let failures = 0;
for (const tour of TOURS) {
  for (let i = 1; i <= tour.steps.length; i++) {
    const page = await newPage(browser, width, 900);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
    const url = base + tourHref(tour, i);
    const resp = await page.goto(url, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(900);
    const overlay = await page.locator('aside[role="dialog"]').count();
    const status = resp?.status() ?? 0;
    const ok = status < 400 && overlay > 0 && errors.length === 0;
    if (!ok) failures++;
    const out = path.resolve("docs/shots/tours", `${tour.id}-${i}-${width}.png`);
    ensureDir(out);
    await page.screenshot({ path: out, fullPage: false });
    console.log(`${ok ? "✓" : "✗"} ${tour.id} ${i}/${tour.steps.length} ${tour.steps[i - 1].route} · HTTP ${status} · overlay ${overlay}${errors.length ? " · " + errors.join(" | ") : ""}`);
    await page.context().close();
  }
}
await browser.close();
console.log(failures ? `${failures} step(s) failed` : "all tour steps load with the overlay");
process.exitCode = failures ? 1 : 0;
