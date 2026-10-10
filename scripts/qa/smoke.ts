// Smoke QA over every registered screen: runtime errors, horizontal overflow, design-rule violations.
// Usage: npx tsx scripts/qa/smoke.ts [--base=http://localhost:3000] [--group=g2-results] [--out=docs/qa/smoke.json]
import fs from "node:fs";
import path from "node:path";
import { launch, newPage } from "../shots/lib";
import { allScreens, type Screen } from "../../lib/screens";

const argv = process.argv.slice(2);
const opt = (k: string) => argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const base = opt("base") ?? "http://localhost:3000";
const outFile = path.resolve(opt("out") ?? "docs/qa/smoke.json");
let list: Screen[] = allScreens;
const group = opt("group");
if (group) list = (await import(`../../lib/screens/${group}`)).screens;

interface Finding { board: string; route: string; width: number; issues: string[] }
const findings: Finding[] = [];
const browser = await launch();
for (const s of list) {
  const page = await newPage(browser, s.width, 900);
  const issues: string[] = [];
  page.on("pageerror", (e) => issues.push(`pageerror: ${e.message.slice(0, 160)}`));
  page.on("console", (m) => {
    if (m.type() === "error" && !/favicon|Failed to load resource.*(google|gstatic)|maps\.google/i.test(m.text())) issues.push(`console: ${m.text().slice(0, 160)}`);
  });
  page.on("response", (r) => {
    const u = r.url();
    if (r.status() >= 400 && u.startsWith(base) && !u.includes("favicon")) issues.push(`HTTP ${r.status()} ${u.replace(base, "")}`);
  });
  try {
    const resp = await page.goto(base + s.route, { waitUntil: "load", timeout: 60000 });
    if (resp && resp.status() >= 400 && !s.route.includes("does-not-exist")) issues.push(`route HTTP ${resp.status()}`);
    await page.waitForTimeout(600);
    const checks = await page.evaluate(() => {
      const out: string[] = [];
      const doc = document.documentElement;
      if (doc.scrollWidth > window.innerWidth + 1) {
        const offenders = Array.from(document.querySelectorAll<HTMLElement>("body *")).filter((el) => {
          const r = el.getBoundingClientRect();
          return r.right > window.innerWidth + 1 || r.left < -1;
        }).slice(0, 3).map((el) => `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ").slice(0, 3).join(".")}`);
        out.push(`horizontal overflow ${doc.scrollWidth}px > ${window.innerWidth}px (${offenders.join(", ")})`);
      }
      if (!document.querySelector('meta[name="robots"][content*="noindex"]')) out.push("missing noindex meta");
      // visible text outside form controls (admin selects legitimately list «[للتأكيد]» as an option value)
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (n.parentElement?.closest("select,option,textarea,script,style,[aria-hidden=true],.sr-only") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
      });
      let text = "";
      for (let n = walker.nextNode(); n; n = walker.nextNode()) text += n.textContent + " ";
      // admin pages show the tokens as editable content and in permission text (Admin-FAQ-D, Admin-Users-D)
      if (!location.pathname.startsWith("/admin") && /\[للتأكيد\]|\[مسودة إجابة\]/.test(text)) out.push("literal [للتأكيد]/[مسودة إجابة] brackets in visible text (use <Mark>)");
      if (/[٠-٩]/.test(text)) out.push("Arabic-Indic digits in visible text");
      if (/ر\.س/.test(text)) out.push("«ر.س» printed (use the riyal sign)");
      if (/undefined|NaN/.test(text)) out.push(`"undefined"/"NaN" in visible text`);
      if (!document.querySelector("h1")) out.push("no h1");
      const imgs = Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0 && !/google|gstatic/.test(i.src));
      if (imgs.length) out.push(`broken images: ${imgs.slice(0, 3).map((i) => i.src.replace(location.origin, "")).join(", ")}`);
      return out;
    });
    issues.push(...checks);
  } catch (e) {
    issues.push(`navigation failed: ${(e as Error).message.slice(0, 160)}`);
  }
  if (s.route.includes("does-not-exist")) {
    // the 404 boards answer 404 by design
    for (let i = issues.length - 1; i >= 0; i--) if (/404/.test(issues[i])) issues.splice(i, 1);
  }
  findings.push({ board: s.board, route: s.route, width: s.width, issues: Array.from(new Set(issues)) });
  console.log(`${issues.length ? "✗" : "✓"} ${s.board.padEnd(28)} ${s.width} ${s.route}${issues.length ? "\n    - " + Array.from(new Set(issues)).join("\n    - ") : ""}`);
  await page.context().close();
}
await browser.close();
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(findings, null, 2) + "\n");
const bad = findings.filter((f) => f.issues.length);
console.log(`\n${findings.length} screens · ${bad.length} with issues → ${path.relative(process.cwd(), outFile)}`);
