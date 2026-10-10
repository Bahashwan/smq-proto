// Generated image files (Phase 8). scripts/images/convert.ts writes public/images/manifest.json; pages and
// ImageSlot read it at build time so a slot renders its AVIF/WebP set with a blur placeholder when one exists.
import manifest from "@/public/images/manifest.json";

export interface SlotFiles {
  width: number;
  height: number;
  widths: number[];
  blur: string;
}
const data = manifest as Record<string, SlotFiles>;

export function slotFiles(slotId: string): SlotFiles | null {
  return data[slotId] ?? null;
}
export function slotSrc(slotId: string, width = 1280, format: "webp" | "avif" = "webp"): string | null {
  const f = data[slotId];
  if (!f) return null;
  const w = f.widths.includes(width) ? width : f.widths[f.widths.length - 1];
  return `/images/${slotId}/${slotId}-${w}.${format}`;
}
export function slotSrcSet(slotId: string, format: "webp" | "avif"): string | null {
  const f = data[slotId];
  if (!f) return null;
  return f.widths.map((w) => `/images/${slotId}/${slotId}-${w}.${format} ${w}w`).join(", ");
}
export const GENERATED_SLOTS = Object.keys(data);
