// Runs after `next build`: strips image-pipeline working files from the static export (they stay local only).
import fs from "node:fs";
import path from "node:path";
const out = path.resolve("out");
if (fs.existsSync(out)) {
  const rm = (p) => fs.existsSync(p) && fs.rmSync(p, { recursive: true, force: true });
  rm(path.join(out, "images", "_candidates"));
  const imgDir = path.join(out, "images");
  if (fs.existsSync(imgDir)) for (const slot of fs.readdirSync(imgDir)) rm(path.join(imgDir, slot, "source.png"));
  console.log("postbuild: removed image working files from out/");
}
