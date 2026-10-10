// Copy check: every visible string on a board appears on its page (the boards' copy is verbatim product copy).
// Usage: npx tsx scripts/qa/copy.ts [--base=http://localhost:3000] [--group=g3-unit] [--board=Unit-D] [--out=docs/qa/copy.json]
// Reports per screen: «missing» (text strings absent from the page), «numeric» (strings with digits: the page computes
// its numbers from the fixtures, so these are expected to differ where the board is illustrative) and «spacing»
// (present once spaces are ignored). Designer annotations on a board also show up as missing; triage by hand.
import fs from "node:fs";
import path from "node:path";
import { launch, newPage, settle } from "../shots/lib";
import { allScreens, type Screen } from "../../lib/screens";

const argv = process.argv.slice(2);
const opt = (k: string) => argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const base = opt("base") ?? "http://localhost:3000";
const outFile = path.resolve(opt("out") ?? "docs/qa/copy.json");
let list: Screen[] = allScreens;
const group = opt("group");
if (group) list = (await import(`../../lib/screens/${group}`)).screens;
const onlyBoard = opt("board");
if (onlyBoard) list = list.filter((s) => s.board === onlyBoard);

/** Visible text nodes, aria-labels, placeholders, input values and option labels, normalised. */
function collect(): string[] {
  const norm = (t: string) => t.replace(/[‌-‏⁦-⁩­]/g, "").replace(/[[\]]/g, "").replace(/\s+/g, " ").trim();
  const out: string[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const el = n.parentElement;
      if (!el || el.closest("script,style,noscript,template,[data-presenter],[data-tour-card]")) return NodeFilter.FILTER_REJECT;
      if (!el.checkVisibility({ visibilityProperty: true, opacityProperty: false } as CheckVisibilityOptions)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = norm(n.textContent ?? "");
    if (t) out.push(t);
  }
  document.querySelectorAll<HTMLElement>("[aria-label],[placeholder],input[value],option").forEach((el) => {
    if (!el.checkVisibility() && el.tagName !== "OPTION") return;
    for (const v of [el.getAttribute("aria-label"), el.getAttribute("placeholder"), el instanceof HTMLInputElement && el.type !== "hidden" ? el.value : null, el.tagName === "OPTION" ? el.textContent : null]) {
      const t = norm(v ?? "");
      if (t) out.push(t);
    }
  });
  return out;
}

interface Result { board: string; route: string; width: number; missing: string[]; numeric: string[]; spacing: string[]; note?: string }
const results: Result[] = [];
const browser = await launch();
for (const s of list) {
  const boardFile = path.resolve("design/preview", `${s.board}.html`);
  if (!fs.existsSync(boardFile)) {
    results.push({ board: s.board, route: s.route, width: s.width, missing: [], numeric: [], spacing: [], note: "no board file" });
    continue;
  }
  const bp = await newPage(browser, s.width, 900);
  await bp.goto(`file://${boardFile}`, { waitUntil: "load" });
  const boardStrings = [...new Set(await bp.evaluate(collect))];
  await bp.context().close();

  const page = await newPage(browser, s.width, 900);
  try {
    await page.goto(base + s.route, { waitUntil: "load", timeout: 60000 });
    await settle(page, s.prepare?.wait ?? 300);
    if (s.prepare?.fill) for (const [sel, val] of Object.entries(s.prepare.fill)) await page.fill(sel, val);
    if (s.prepare?.click) {
      await page.click(s.prepare.click);
      await settle(page, 300);
    }
    const pageText = (await page.evaluate(collect)).join(" ");
    const flat = pageText.replace(/\s+/g, "");
    const r: Result = { board: s.board, route: s.route, width: s.width, missing: [], numeric: [], spacing: [] };
    for (const b of boardStrings) {
      if (b.length < 2 || /^[\p{P}\p{S}\s]+$/u.test(b)) continue;
      if (pageText.includes(b)) continue;
      if (flat.includes(b.replace(/\s+/g, ""))) r.spacing.push(b);
      else if (/\d/.test(b)) r.numeric.push(b);
      else r.missing.push(b);
    }
    results.push(r);
    const n = r.missing.length;
    console.log(`${n ? "✗" : "✓"} ${s.board} (${s.width}) ${s.route}${n ? ` · ${n} missing` : ""}${r.numeric.length ? ` · ${r.numeric.length} numeric` : ""}${r.spacing.length ? ` · ${r.spacing.length} spacing` : ""}`);
    for (const m of r.missing) console.log(`    missing: ${m}`);
  } catch (e) {
    results.push({ board: s.board, route: s.route, width: s.width, missing: [], numeric: [], spacing: [], note: `load failed: ${(e as Error).message.slice(0, 160)}` });
    console.log(`! ${s.board} load failed`);
  }
  await page.context().close();
}
await browser.close();
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
const total = results.reduce((a, r) => a + r.missing.length, 0);
console.log(`\n${results.length} screens · ${total} missing strings · ${path.relative(process.cwd(), outFile)}`);
