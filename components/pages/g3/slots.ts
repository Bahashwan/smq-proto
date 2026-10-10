// Slot ids → the room words the boards print on thumbnails and in the gallery (Unit-M/D, Unit-Roof-M,
// Unit-Gallery-M/D, EN-Unit-M), and the gallery list per unit. No numbers here: counts come from the lists.
import type { Unit } from "@/data/types";
import { projectById } from "@/data/projects";

export interface SlotLabel {
  /** the full room name (aria-label, gallery header) */
  ar: string;
  /** the word on a unit-page thumbnail («غرفة النوم» for the master bedroom) */
  short: string;
  /** the word in the phone gallery strip («النوم») */
  gal: string;
  /** the word in the desktop gallery list («النوم الرئيسية») */
  galD: string;
  en: string;
}

const L = (ar: string, short = ar, gal = short, galD = gal, en = ar): SlotLabel => ({ ar, short, gal, galD, en });

const LABELS: Record<string, SlotLabel> = {
  "IMG-PRJ-ROWDAH-EXT": L("الواجهة", "الواجهة", "الواجهة", "الواجهة", "Facade"),
  "IMG-PRJ-BLDG-ROSE-FACADE": L("الواجهة", "الواجهة", "الواجهة", "الواجهة", "Facade"),
  "IMG-PRJ-BLDG-YASMIN-FACADE": L("الواجهة", "الواجهة", "الواجهة", "الواجهة", "Facade"),
  "IMG-PRJ-ROWDAH-ENTRANCE": L("المدخل", "المدخل", "المدخل", "المدخل", "Entrance"),
  "IMG-PRJ-ROWDAH-LOBBY": L("البهو", "البهو", "البهو", "البهو", "Lobby"),
  "IMG-PRJ-ROWDAH-PARKING": L("المواقف", "المواقف", "المواقف", "المواقف", "Parking"),
  "IMG-UNIT-APT-2BR-LIVING": L("الصالة", "الصالة", "الصالة", "الصالة", "Living room"),
  "IMG-UNIT-APT-3BR-LIVING": L("الصالة", "الصالة", "الصالة", "الصالة", "Living room"),
  "IMG-UNIT-ROOF-LIVING": L("الصالة", "الصالة", "الصالة", "الصالة", "Living room"),
  "IMG-UNIT-APT-KITCHEN-OPEN": L("المطبخ", "المطبخ", "المطبخ", "المطبخ", "Kitchen"),
  "IMG-UNIT-APT-KITCHEN-CLOSED": L("المطبخ", "المطبخ", "المطبخ", "المطبخ", "Kitchen"),
  "IMG-UNIT-APT-3BR-MASTER": L("غرفة النوم الرئيسية", "غرفة النوم", "النوم", "النوم الرئيسية", "Bedroom"),
  "IMG-UNIT-APT-2BR-BEDROOM": L("غرفة النوم", "غرفة النوم", "النوم", "غرفة النوم", "Bedroom"),
  "IMG-UNIT-APT-BALCONY": L("البلكونة", "البلكونة", "الشرفة", "الشرفة", "Balcony"),
  "IMG-UNIT-APT-BATH": L("الحمام", "الحمام", "الحمام", "الحمام", "Bathroom"),
  "IMG-UNIT-MAID-ROOM": L("غرفة الخادمة", "غ. الخادمة", "غ. الخادمة", "غرفة الخادمة", "Maid's room"),
  "IMG-UNIT-ROOF-TERRACE": L("التراس", "التراس", "التراس", "التراس", "Terrace"),
  "IMG-UNIT-SMARTHOME-DETAIL": L("سمارت هوم", "سمارت هوم", "سمارت هوم", "سمارت هوم", "Smart home"),
};

/** Roof villas: the bedroom shot is the upper floor (Unit-Roof-M «الدور العلوي»). */
const ROOF_LABELS: Record<string, SlotLabel> = {
  "IMG-UNIT-APT-3BR-MASTER": L("الدور العلوي", "الدور العلوي", "الدور العلوي", "الدور العلوي", "Upper floor"),
};

export function slotLabel(id: string, unit?: Pick<Unit, "type">): SlotLabel {
  return (unit?.type === "roof-villa" ? ROOF_LABELS[id] : undefined) ?? LABELS[id] ?? L(id, id, id, id, id);
}

export interface GalleryItem extends SlotLabel {
  slotId: string;
}

const toItem = (unit: Unit) => (slotId: string): GalleryItem => ({ slotId, ...slotLabel(slotId, unit) });

/** The thumbnails under the unit cover: the unit's own slots, cover first. */
export function unitThumbs(unit: Unit): GalleryItem[] {
  return unit.images.map(toItem(unit));
}

const BATH = "IMG-UNIT-APT-BATH";
const ROOM_RANK = ["LIVING", "KITCHEN", "MASTER", "BEDROOM", "BATH", "BALCONY", "MAID", "SMARTHOME"];
const rank = (id: string) => {
  const i = ROOM_RANK.findIndex((k) => id.includes(k));
  return i < 0 ? ROOM_RANK.length : i;
};

/** The full-screen gallery (Unit-Gallery-M/D): the building's facade and the project entrance first, then the
 *  unit's rooms in walking order (apartments also get the shared bathroom shot, as the gallery boards list it). */
export function galleryItems(unit: Unit): GalleryItem[] {
  const p = projectById(unit.projectId);
  const facade = p?.images.find((s) => s.includes(unit.building === "RZ" ? "ROSE" : "YASMIN")) ?? p?.images.find((s) => s.includes("EXT"));
  const entrance = p?.images.find((s) => s.includes("ENTRANCE"));
  const rooms = unit.type === "apartment" ? [...unit.images, ...(unit.images.includes(BATH) ? [] : [BATH])].sort((a, b) => rank(a) - rank(b)) : unit.images;
  const ids = [facade, entrance, ...rooms].filter((s): s is string => !!s);
  return Array.from(new Set(ids)).map(toItem(unit));
}

/** Real photo files the server found under /public/real (slot id → URL). */
export type RealFiles = Record<string, string>;
