// Schematic plans (Unit-Plan-M): rooms as rectangles on a unit-less grid, never a real floor plan. Room areas are
// the rectangle's share of the drawing applied to the unit's fixture area, so every figure is computed and stays
// «تقريبية»; the dimensions toggle derives metres from the same share.
import type { Unit } from "@/data/types";

export type RoomKind = "room" | "bath" | "kitchen" | "service" | "balcony" | "majlis";
export type Side = "n" | "s" | "e" | "w";

export interface PlanRoom {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: RoomKind;
  /** window segments drawn in gold on these walls */
  windows?: Side[];
  /** the room's figure is itself «[للتأكيد]» (the living room on the board) */
  tbc?: boolean;
}

export interface PlanFloor {
  id: string;
  label: string;
  W: number;
  H: number;
  /** share of the unit's area this floor holds (one floor = 1) */
  share: number;
  rooms: PlanRoom[];
  /** the entrance segment on the outer wall (white) */
  entrance: { x: number; y: number; w: number; h: number };
}

export interface Plan {
  id: string;
  floors: PlanFloor[];
}

const ENTRANCE_S = (W: number, H: number, w = 10) => ({ x: W / 2 - w / 2, y: H - 1, w, h: 2 });

const aptA: PlanFloor = {
  id: "main",
  label: "الدور",
  W: 100,
  H: 88,
  share: 1,
  entrance: { x: 60, y: 87, w: 10, h: 2 },
  rooms: [
    { id: "living", label: "الصالة والمجلس", x: 0, y: 0, w: 50, h: 44, kind: "majlis", windows: ["n", "n"], tbc: true },
    { id: "kitchen", label: "المطبخ", x: 50, y: 0, w: 20, h: 26, kind: "kitchen" },
    { id: "master", label: "غرفة النوم الرئيسية", x: 70, y: 0, w: 30, h: 38, kind: "room", windows: ["n", "e"] },
    { id: "mbath", label: "حمام رئيسي", x: 70, y: 38, w: 16, h: 14, kind: "bath" },
    { id: "maid", label: "غ. خادمة", x: 86, y: 38, w: 14, h: 20, kind: "service" },
    { id: "bed2", label: "غرفة نوم 2", x: 0, y: 44, w: 30, h: 36, kind: "room", windows: ["s", "w"] },
    { id: "bed3", label: "غرفة نوم 3", x: 30, y: 50, w: 26, h: 30, kind: "room", windows: ["s"] },
    { id: "bath", label: "حمام", x: 56, y: 56, w: 14, h: 14, kind: "bath" },
    { id: "balcony", label: "البلكونة", x: 0, y: 80, w: 30, h: 8, kind: "balcony" },
  ],
};

const aptB: PlanFloor = {
  id: "main",
  label: "الدور",
  W: 100,
  H: 88,
  share: 1,
  entrance: { x: 60, y: 87, w: 10, h: 2 },
  rooms: [
    { id: "living", label: "الصالة", x: 0, y: 0, w: 48, h: 44, kind: "majlis", windows: ["n", "n"], tbc: true },
    { id: "kitchen", label: "المطبخ", x: 48, y: 0, w: 22, h: 26, kind: "kitchen" },
    { id: "master", label: "غرفة النوم الرئيسية", x: 70, y: 0, w: 30, h: 38, kind: "room", windows: ["n", "e"] },
    { id: "mbath", label: "حمام رئيسي", x: 70, y: 38, w: 16, h: 14, kind: "bath" },
    { id: "maid", label: "غ. خادمة", x: 86, y: 38, w: 14, h: 20, kind: "service" },
    { id: "bed2", label: "غرفة نوم 2", x: 0, y: 44, w: 32, h: 36, kind: "room", windows: ["s", "w"] },
    { id: "bath2", label: "حمام", x: 32, y: 56, w: 14, h: 14, kind: "bath" },
    { id: "bath3", label: "حمام ضيوف", x: 56, y: 56, w: 14, h: 14, kind: "bath" },
    { id: "balcony", label: "البلكونة", x: 0, y: 80, w: 32, h: 8, kind: "balcony" },
  ],
};

const aptC: PlanFloor = {
  id: "main",
  label: "الدور",
  W: 100,
  H: 78,
  share: 1,
  entrance: { x: 58, y: 77, w: 10, h: 2 },
  rooms: [
    { id: "living", label: "الصالة", x: 0, y: 0, w: 46, h: 40, kind: "majlis", windows: ["n"], tbc: true },
    { id: "kitchen", label: "المطبخ", x: 46, y: 0, w: 24, h: 24, kind: "kitchen" },
    { id: "master", label: "غرفة النوم الرئيسية", x: 70, y: 0, w: 30, h: 36, kind: "room", windows: ["n", "e"] },
    { id: "mbath", label: "حمام رئيسي", x: 70, y: 36, w: 16, h: 14, kind: "bath" },
    { id: "bed2", label: "غرفة نوم 2", x: 0, y: 40, w: 34, h: 30, kind: "room", windows: ["s", "w"] },
    { id: "bath", label: "حمام", x: 34, y: 46, w: 16, h: 14, kind: "bath" },
    { id: "balcony", label: "البلكونة", x: 0, y: 70, w: 34, h: 8, kind: "balcony" },
  ],
};

const aptD: PlanFloor = {
  ...aptC,
  rooms: [
    { id: "living", label: "الصالة", x: 0, y: 0, w: 48, h: 40, kind: "majlis", windows: ["n", "w"], tbc: true },
    { id: "kitchen", label: "المطبخ", x: 48, y: 0, w: 22, h: 24, kind: "kitchen" },
    { id: "master", label: "غرفة النوم الرئيسية", x: 70, y: 0, w: 30, h: 36, kind: "room", windows: ["n", "e"] },
    { id: "mbath", label: "حمام رئيسي", x: 70, y: 36, w: 16, h: 14, kind: "bath" },
    { id: "bed2", label: "غرفة نوم 2", x: 0, y: 40, w: 32, h: 30, kind: "room", windows: ["s"] },
    { id: "bath", label: "حمام", x: 32, y: 46, w: 16, h: 14, kind: "bath" },
    { id: "balcony", label: "البلكونة", x: 66, y: 70, w: 34, h: 8, kind: "balcony" },
  ],
};

const roofLower: PlanFloor = {
  id: "first",
  label: "الدور الأول",
  W: 100,
  H: 88,
  share: 0.56,
  entrance: ENTRANCE_S(100, 88),
  rooms: [
    { id: "living", label: "الصالة والمجلس", x: 0, y: 0, w: 50, h: 44, kind: "majlis", windows: ["n", "n", "w"], tbc: true },
    { id: "kitchen", label: "المطبخ", x: 50, y: 0, w: 22, h: 26, kind: "kitchen" },
    { id: "dining", label: "الطعام", x: 50, y: 26, w: 22, h: 18, kind: "room" },
    { id: "master", label: "غرفة النوم الرئيسية", x: 72, y: 0, w: 28, h: 36, kind: "room", windows: ["n", "e"] },
    { id: "mbath", label: "حمام رئيسي", x: 72, y: 36, w: 14, h: 12, kind: "bath" },
    { id: "maid", label: "غ. خادمة", x: 86, y: 36, w: 14, h: 18, kind: "service" },
    { id: "driver", label: "غ. سائق", x: 86, y: 54, w: 14, h: 16, kind: "service" },
    { id: "bed2", label: "غرفة نوم 2", x: 0, y: 44, w: 30, h: 36, kind: "room", windows: ["s", "w"] },
    { id: "bed3", label: "غرفة نوم 3", x: 30, y: 50, w: 26, h: 30, kind: "room", windows: ["s"] },
    { id: "bath", label: "حمام", x: 56, y: 56, w: 14, h: 14, kind: "bath" },
    { id: "balcony", label: "البلكونة", x: 0, y: 80, w: 30, h: 8, kind: "balcony" },
  ],
};

const roofUpper: PlanFloor = {
  id: "roof",
  label: "السطح",
  W: 100,
  H: 80,
  share: 0.44,
  entrance: { x: 44, y: 79, w: 10, h: 2 },
  rooms: [
    { id: "terrace", label: "التراس", x: 0, y: 0, w: 58, h: 50, kind: "balcony", windows: ["n", "w"], tbc: true },
    { id: "omajlis", label: "مجلس خارجي", x: 58, y: 0, w: 42, h: 28, kind: "majlis", windows: ["n", "e"] },
    { id: "bed4", label: "غرفة نوم 4", x: 58, y: 28, w: 42, h: 28, kind: "room", windows: ["e"] },
    { id: "bed5", label: "غرفة نوم 5", x: 0, y: 50, w: 40, h: 30, kind: "room", windows: ["s", "w"] },
    { id: "bath4", label: "حمام", x: 40, y: 50, w: 16, h: 14, kind: "bath" },
    { id: "bath5", label: "حمام", x: 58, y: 56, w: 16, h: 14, kind: "bath" },
    { id: "pantry", label: "مطبخ تحضيري", x: 74, y: 56, w: 26, h: 24, kind: "kitchen" },
  ],
};

export const PLANS: Record<string, Plan> = {
  "plan-apt-a": { id: "plan-apt-a", floors: [aptA] },
  "plan-apt-b": { id: "plan-apt-b", floors: [aptB] },
  "plan-apt-c": { id: "plan-apt-c", floors: [aptC] },
  "plan-apt-d": { id: "plan-apt-d", floors: [aptD] },
  "plan-roof-rz": { id: "plan-roof-rz", floors: [roofLower, roofUpper] },
  "plan-roof-ys": { id: "plan-roof-ys", floors: [roofLower, roofUpper] },
};

export function planOf(unit: Unit): Plan | undefined {
  return unit.plan ? PLANS[unit.plan] : undefined;
}

/** m² of a room: its rectangle's share of the floor drawing × the floor's share of the unit's area */
export function roomArea(room: PlanRoom, floor: PlanFloor, areaM2: number): number {
  return ((room.w * room.h) / (floor.W * floor.H)) * floor.share * areaM2;
}
/** metres per drawing unit on a floor */
export function metresPerUnit(floor: PlanFloor, areaM2: number): number {
  return Math.sqrt((floor.share * areaM2) / (floor.W * floor.H));
}
export function roomDims(room: PlanRoom, floor: PlanFloor, areaM2: number): { w: number; h: number } {
  const k = metresPerUnit(floor, areaM2);
  return { w: room.w * k, h: room.h * k };
}

const SIDE_WORD: Record<Side, { one: string; two: string; many: string }> = {
  n: { one: "نافذة شمالية", two: "نافذتان شماليتان", many: "نوافذ شمالية" },
  s: { one: "نافذة جنوبية", two: "نافذتان جنوبيتان", many: "نوافذ جنوبية" },
  e: { one: "نافذة شرقية", two: "نافذتان شرقيتان", many: "نوافذ شرقية" },
  w: { one: "نافذة غربية", two: "نافذتان غربيتان", many: "نوافذ غربية" },
};
/** «نافذتان شماليتان» · «نافذة شمالية ونافذة شرقية» */
export function windowNote(windows: Side[] | undefined): string {
  if (!windows?.length) return "";
  const counts = new Map<Side, number>();
  windows.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1));
  return Array.from(counts.entries())
    .map(([s, n]) => (n === 1 ? SIDE_WORD[s].one : n === 2 ? SIDE_WORD[s].two : `${n} ${SIDE_WORD[s].many}`))
    .join(" و");
}
