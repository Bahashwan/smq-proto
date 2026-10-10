import type { Screen } from "./types";
// g3-unit: the unit page (states and image tiers), the full-screen gallery, the schematic plan, compare, /en/units/[code].
const R1 = "1–12 · Public site, round 1";
const R2 = "23–29 · Public, round 2";
const COMPARE = "/compare?u=rz-d,ys-d,rz-c";

export const screens: Screen[] = [
  { board: "Unit-M", route: "/units/rz-a", width: 390, section: R1, note: "status, price, per-m², «قياساً بالحي» computed (any of the ten codes)" },
  { board: "Unit-D", route: "/units/rz-a", width: 1440, section: R1 },
  { board: "Compare-M", route: COMPARE, width: 390, section: R1, note: "best-in-row gold marker computed; selection kept on the device 7 days" },
  { board: "Compare-D", route: COMPARE, width: 1440, section: R1 },
  { board: "Unit-Reserved-M", route: "/units/ys-d?ustatus=reserved", width: 390, section: R2, note: "presenter «unit status» (available | reserved | sold); the fixtures stay 8 / 2 / 0" },
  { board: "Unit-Sold-M", route: "/units/ys-a", width: 390, section: R2, note: "a real sold unit (also /units/ys-c)" },
  { board: "Unit-Roof-M", route: "/units/rz-rf", width: 390, section: R2, note: "roof villa layout, «قارن الروفين» (also /units/ys-rf)" },
  { board: "Unit-Gallery-M", route: "/units/rz-a/gallery?i=3", width: 390, section: R2, note: "swipe, Esc, arrow keys", viewport: true },
  { board: "Unit-Gallery-D", route: "/units/rz-a/gallery?i=3", width: 1440, section: R2, note: "«الصور · المخطط · جولة 360 [للتأكيد]» tabs", viewport: true },
  { board: "Unit-Plan-M", route: "/units/rz-a/plan", width: 390, section: R2, note: "schematic plan, tap a room for its area; roof villas get two tabs (/units/rz-rf/plan)", viewport: true },
  { board: "Unit-Tier-Real-M", route: "/units/rz-a?tier=real", width: 390, section: R2, note: "presenter «image tier»: /public/real/* when present, else the neutral frame, no label", viewport: true },
  { board: "Unit-Tier-Gen-M", route: "/units/rz-a", width: 390, section: R2, note: "default tier: generated images with «صورة تعبيرية»", viewport: true },
  { board: "Unit-Tier-Typo-M", route: "/units/rz-a?tier=typo", width: 390, section: R2, note: "typographic tier", viewport: true },
  { board: "Compare-One-M", route: "/compare?u=rz-a", width: 390, section: R2 },
  { board: "Compare-Empty-M", route: "/compare", width: 390, section: R2, viewport: true },
  { board: "EN-Unit-M", route: "/en/units/rz-a", width: 390, section: R2 },
];
