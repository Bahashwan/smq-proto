// Coverage check: every board in design/preview has a screen entry (or is a reference sheet), and every
// registered route exists in the static export. Usage: npx tsx scripts/check-coverage.ts [--out=out]
import fs from "node:fs";
import path from "node:path";
import { allScreens } from "../lib/screens";

const outDir = path.resolve(process.argv.find((a) => a.startsWith("--out="))?.slice(6) ?? "out");
const REFERENCE = new Set(["A-Hero", "A-Card", "B-Hero", "B-Card", "Tokens", "Components", "Components2", "Components3", "Shots", "Icons", "OG-Home", "OG-Project", "OG-Unit"]);
const boards = fs.readdirSync("design/preview").filter((f) => f.endsWith(".html") && f !== "index.html").map((f) => f.slice(0, -5)).sort();
const registered = new Set(allScreens.map((s) => s.board));

const missingBoards = boards.filter((b) => !REFERENCE.has(b) && !registered.has(b));
const unknownBoards = [...registered].filter((b) => !boards.includes(b));

function exportedFile(route: string): string | null {
  const p = route.split("?")[0].split("#")[0];
  const candidates = p === "/" ? ["index.html"] : [`${p.slice(1)}.html`, `${p.slice(1)}/index.html`];
  for (const c of candidates) if (fs.existsSync(path.join(outDir, c))) return c;
  return null;
}
const haveOut = fs.existsSync(outDir);
const missingRoutes = haveOut ? Array.from(new Set(allScreens.map((s) => s.route))).filter((r) => !exportedFile(r) && !r.startsWith("/this-page-does-not-exist")) : [];

console.log(`boards: ${boards.length} · reference sheets: ${REFERENCE.size} · registered boards: ${registered.size} · screens: ${allScreens.length}`);
console.log(`boards without a screen entry (${missingBoards.length}): ${missingBoards.join(", ") || "none"}`);
if (unknownBoards.length) console.log(`screen entries naming no board file (${unknownBoards.length}): ${unknownBoards.join(", ")}`);
if (haveOut) console.log(`registered routes missing from ${path.relative(process.cwd(), outDir)}/ (${missingRoutes.length}): ${missingRoutes.join(" ") || "none"}`);
else console.log(`(no ${outDir}: run npm run build to check exported routes)`);
process.exitCode = missingBoards.length || missingRoutes.length ? 1 : 0;
