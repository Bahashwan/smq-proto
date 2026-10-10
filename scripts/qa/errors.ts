// Prints every page error and console error of one URL in full (hydration diffs included).
// Usage: npx tsx scripts/qa/errors.ts <url> [width]
import { launch, newPage } from "../shots/lib";

const url = process.argv[2];
const width = parseInt(process.argv[3] ?? "1440", 10);
const browser = await launch();
const page = await newPage(browser, width, 900);
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message.slice(0, 3000)));
page.on("console", (m) => {
  if (m.type() === "error") console.log("CONSOLE:", m.text().slice(0, 2000));
});
await page.goto(url, { waitUntil: "load" });
await page.waitForTimeout(2500);
await browser.close();
