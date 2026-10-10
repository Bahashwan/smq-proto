// Renders the OG routes to public/og/*.png (1200×630). Usage: npm run og [-- --base=http://localhost:3000]
import path from "node:path";
import { launch, settle, ensureDir } from "./lib";

const base = process.argv.slice(2).find((a) => a.startsWith("--base="))?.slice(7) ?? "http://localhost:3000";
const routes: [string, string][] = [
  ["/og/home", "home.png"],
  ["/og/project/garden-rawdah", "project-garden-rawdah.png"],
  ["/og/unit/rz-a", "unit-rz-a.png"],
];
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, locale: "ar-SA" });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
for (const [route, file] of routes) {
  const page = await ctx.newPage();
  await page.goto(base + route, { waitUntil: "load" });
  await settle(page, 300);
  const out = path.resolve("public/og", file);
  ensureDir(out);
  await page.screenshot({ path: out, fullPage: false });
  console.log(`${route} → public/og/${file}`);
  await page.close();
}
await browser.close();
