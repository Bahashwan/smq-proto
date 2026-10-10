// Generates candidate images through the Vercel AI Gateway (script only, never at request time).
// Usage: npm run images -- [--anchors] [--only=IMG-A,IMG-B] [--candidates=2] [--force] [--dry-run] [--budget=15]
// Candidates land in public/images/_candidates/<slot>/<slot>-c<n>.png (git-ignored) and are shown on /demo/contact-sheet.
// Picks are recorded with scripts/images/pick.ts; conversion to AVIF/WebP with scripts/images/convert.ts.
import fs from "node:fs";
import path from "node:path";
import { generateImage, generateText } from "ai";
import { GEN_SLOTS, ANCHORS, referencesFor, type GenSlot } from "./manifest";

const argv = process.argv.slice(2);
const flag = (k: string) => argv.includes(`--${k}`);
const opt = (k: string) => argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);

const MODEL = "bfl/flux-3-image";
const FALLBACK = "google/gemini-nano-banana-2.1";
const PRICE_2K = 0.05; // catalog: bfl/flux-3-image 2048×2048 class
const PRICE_FALLBACK = 0.0504;
const BUDGET = parseFloat(opt("budget") ?? "15");
const CANDIDATES = parseInt(opt("candidates") ?? "2", 10);
const PARALLEL = Math.max(1, parseInt(opt("parallel") ?? "1", 10));
const OUT = path.resolve("public/images/_candidates");
const LOG = path.resolve("scripts/images/out/log.jsonl");
const COST_FILE = path.resolve("scripts/images/out/cost.json");
const PICKS = path.resolve("scripts/images/picks.json");

type Picks = Record<string, { candidate: string; file: string; model: string; prompt: string; seed?: unknown; requestId?: string; pickedAt: string; note?: string }>;
const picks: Picks = fs.existsSync(PICKS) ? JSON.parse(fs.readFileSync(PICKS, "utf8")) : {};

fs.mkdirSync(path.dirname(LOG), { recursive: true });
let spent = fs.existsSync(COST_FILE) ? (JSON.parse(fs.readFileSync(COST_FILE, "utf8")).spent as number) : 0;
const saveCost = () => fs.writeFileSync(COST_FILE, JSON.stringify({ spent: +spent.toFixed(4), updatedAt: new Date().toISOString() }, null, 2));

let slots: GenSlot[] = GEN_SLOTS;
if (flag("anchors")) slots = slots.filter((s) => (ANCHORS as readonly string[]).includes(s.id));
const only = opt("only");
if (only) {
  const ids = only.split(",");
  slots = slots.filter((s) => ids.includes(s.id));
}
if (!flag("force")) slots = slots.filter((s) => !picks[s.id]);

if (!process.env.AI_GATEWAY_API_KEY && !flag("dry-run")) {
  console.error("AI_GATEWAY_API_KEY is not set (put it in .env.local and run with: npx dotenv -e .env.local -- … or export it). Nothing generated.");
  process.exit(1);
}

console.log(`${slots.length} slot(s) · ${CANDIDATES} candidate(s) each · spent so far $${spent.toFixed(2)} · budget $${BUDGET}`);

function refImages(slot: GenSlot): { id: string; bytes: Uint8Array }[] {
  const refs: { id: string; bytes: Uint8Array }[] = [];
  for (const id of referencesFor(slot)) {
    const p = picks[id]?.file;
    if (p && fs.existsSync(p)) refs.push({ id, bytes: new Uint8Array(fs.readFileSync(p)) });
    else console.warn(`  (no approved pick for reference ${id}; generating without it)`);
  }
  if (slot.id === "IMG-HERO-BRAND") {
    const logo = ["design/brand/logo-mark-gold.png", "design/preview/assets/logo-mark-gold.png"].map((p) => path.resolve(p)).find((p) => fs.existsSync(p));
    if (logo) refs.push({ id: "logo-mark-gold", bytes: new Uint8Array(fs.readFileSync(logo)) });
  }
  return refs;
}

async function runSlot(slot: GenSlot) {
  const dir = path.join(OUT, slot.id);
  fs.mkdirSync(dir, { recursive: true });
  const refs = refImages(slot);
  const promptText = refs.length
    ? `${slot.prompt}\n\nMatch the light, palette, material finish and framing of the attached reference image(s) so every image looks like one photo session.${slot.id === "IMG-HERO-BRAND" ? " The attached gold emblem is the brand mark: reproduce it exactly, as a small metal sign above the entrance, with no other text." : ""}`
    : slot.prompt;
  for (let i = 1; i <= CANDIDATES; i++) {
    const file = path.join(dir, `${slot.id}-c${i}.png`);
    if (fs.existsSync(file) && !flag("force")) {
      console.log(`  ${slot.id} c${i} exists, skipping`);
      continue;
    }
    if (spent + PRICE_2K > BUDGET) {
      console.error(`Budget reached ($${spent.toFixed(2)} of $${BUDGET}). Stopping before ${slot.id} c${i}.`);
      saveCost();
      process.exit(2);
    }
    if (flag("dry-run")) {
      console.log(`  [dry] ${slot.id} c${i} ${slot.aspectRatio} refs=${refs.map((r) => r.id).join(",") || "none"}\n      ${promptText.slice(0, 140)}…`);
      continue;
    }
    const started = Date.now();
    try {
      const result = await generateImage({
        model: MODEL,
        prompt: refs.length ? { text: promptText, images: refs.map((r) => r.bytes) } : promptText,
        aspectRatio: slot.aspectRatio,
        providerOptions: { blackForestLabs: { resolution: "2k", grounding: false, safetyTolerance: 2, pollTimeoutMillis: 240000 } },
      });
      const img = result.image;
      fs.writeFileSync(file, img.uint8Array);
      spent += PRICE_2K;
      saveCost();
      const meta = (result.providerMetadata as Record<string, unknown> | undefined)?.blackForestLabs as Record<string, unknown> | undefined;
      const entry = { slot: slot.id, candidate: `c${i}`, file: path.relative(process.cwd(), file), model: MODEL, aspectRatio: slot.aspectRatio, prompt: promptText, refs: refs.map((r) => r.id), providerMetadata: meta ?? null, ms: Date.now() - started, cost: PRICE_2K, at: new Date().toISOString() };
      fs.appendFileSync(LOG, JSON.stringify(entry) + "\n");
      console.log(`  ✓ ${slot.id} c${i} (${(entry.ms / 1000).toFixed(0)}s) · running cost $${spent.toFixed(2)}`);
    } catch (err) {
      console.warn(`  ✗ ${slot.id} c${i} on ${MODEL}: ${(err as Error).message.slice(0, 200)}`);
      try {
        const fb = await generateText({
          model: FALLBACK,
          prompt: promptText,
          providerOptions: { google: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: slot.aspectRatio, imageSize: "2K" } } },
        });
        const f = fb.files.find((x) => x.mediaType.startsWith("image/"));
        if (!f) throw new Error("fallback returned no image");
        fs.writeFileSync(file, f.uint8Array);
        spent += PRICE_FALLBACK;
        saveCost();
        fs.appendFileSync(LOG, JSON.stringify({ slot: slot.id, candidate: `c${i}`, file: path.relative(process.cwd(), file), model: FALLBACK, aspectRatio: slot.aspectRatio, prompt: promptText, refs: [], cost: PRICE_FALLBACK, at: new Date().toISOString() }) + "\n");
        console.log(`  ✓ ${slot.id} c${i} via fallback · running cost $${spent.toFixed(2)}`);
      } catch (err2) {
        console.error(`  ✗ ${slot.id} c${i} fallback failed: ${(err2 as Error).message.slice(0, 200)}`);
      }
    }
  }
}

// anchors (references) run first and sequentially; the rest in a small pool
const anchorsFirst = slots.filter((s) => (ANCHORS as readonly string[]).includes(s.id));
const others = slots.filter((s) => !(ANCHORS as readonly string[]).includes(s.id));
for (const s of anchorsFirst) await runSlot(s);
let cursor = 0;
await Promise.all(Array.from({ length: Math.min(PARALLEL, others.length) }, async () => {
  while (cursor < others.length) {
    const s = others[cursor++];
    await runSlot(s);
  }
}));
saveCost();
console.log(`Done. Total spent $${spent.toFixed(2)}.`);
