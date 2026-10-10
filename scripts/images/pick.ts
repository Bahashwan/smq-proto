// Records the chosen candidate for a slot and copies it to public/images/<slot>/source.png.
// Usage: npx tsx scripts/images/pick.ts --slot=IMG-… --candidate=1 [--note="why"]
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const opt = (k: string) => argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const slot = opt("slot");
const cand = opt("candidate");
if (!slot || !cand) {
  console.error("usage: pick.ts --slot=IMG-X --candidate=1 [--note=…]");
  process.exit(1);
}
const src = path.resolve("public/images/_candidates", slot, `${slot}-c${cand}.png`);
if (!fs.existsSync(src)) {
  console.error(`missing ${src}`);
  process.exit(1);
}
const PICKS = path.resolve("scripts/images/picks.json");
const LOG = path.resolve("scripts/images/out/log.jsonl");
const picks = fs.existsSync(PICKS) ? JSON.parse(fs.readFileSync(PICKS, "utf8")) : {};
const logLines = fs.existsSync(LOG) ? fs.readFileSync(LOG, "utf8").trim().split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
const entry = [...logLines].reverse().find((e) => e.slot === slot && e.candidate === `c${cand}`);
const dest = path.resolve("public/images", slot, "source.png");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
picks[slot] = {
  candidate: `c${cand}`,
  file: path.relative(process.cwd(), dest),
  model: entry?.model ?? "unknown",
  prompt: entry?.prompt ?? "",
  seed: entry?.providerMetadata?.images?.[0]?.seed ?? entry?.providerMetadata?.seed ?? null,
  requestId: entry?.providerMetadata?.requestId ?? entry?.providerMetadata?.id ?? null,
  pickedAt: new Date().toISOString(),
  note: opt("note") ?? "",
};
fs.writeFileSync(PICKS, JSON.stringify(picks, null, 2) + "\n");
console.log(`picked ${slot} c${cand} → ${path.relative(process.cwd(), dest)}`);
