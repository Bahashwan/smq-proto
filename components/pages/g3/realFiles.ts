// Server only (route files): which slots have a real photo under /public/real/<slot>.jpg, checked at build time.
// The real tier shows those files; every other slot draws the neutral ink frame with no label.
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Unit } from "@/data/types";
import { units } from "@/data/units";
import { galleryItems, type RealFiles } from "./slots";

export function realFilesFor(list: Unit[] = units): RealFiles {
  const out: RealFiles = {};
  const slots = new Set(list.flatMap((u) => [...u.images, ...galleryItems(u).map((g) => g.slotId)]));
  for (const slot of slots) {
    if (existsSync(join(process.cwd(), "public", "real", `${slot}.jpg`))) out[slot] = `/real/${slot}.jpg`;
  }
  return out;
}
