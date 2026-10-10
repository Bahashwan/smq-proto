// Slot ids → the room words the boards print on thumbnails and in the gallery (Unit-M/D, Unit-Gallery-M/D),
// and the gallery lists per unit. No numbers here: counts come from the lists themselves.
import type { Unit } from "@/data/types";
import { projectById } from "@/data/projects";

export interface SlotLabel {
  ar: string;
  /** the short word on a thumbnail («النوم» for the master bedroom in the gallery strip) */
  short: string;
  en: string;
}

const LABELS: Record<string, SlotLabel> = {
  "IMG-PRJ-ROWDAH-EXT": { ar: "الواجهة", short: "الواجهة", en: "Facade" },
  "IMG-PRJ-BLDG-ROSE-FACADE": { ar: "الواجهة", short: "الواجهة", en: "Facade" },
  "IMG-PRJ-BLDG-YASMIN-FACADE": { ar: "الواجهة", short: "الواجهة", en: "Facade" },
  "IMG-PRJ-ROWDAH-ENTRANCE": { ar: "المدخل", short: "المدخل", en: "Entrance" },
  "IMG-PRJ-ROWDAH-LOBBY": { ar: "البهو", short: "البهو", en: "Lobby" },
  "IMG-PRJ-ROWDAH-PARKING": { ar: "المواقف", short: "المواقف", en: "Parking" },
  "IMG-UNIT-APT-2BR-LIVING": { ar: "الصالة", short: "الصالة", en: "Living room" },
  "IMG-UNIT-APT-3BR-LIVING": { ar: "الصالة", short: "الصالة", en: "Living room" },
  "IMG-UNIT-ROOF-LIVING": { ar: "الصالة", short: "الصالة", en: "Living room" },
  "IMG-UNIT-APT-KITCHEN-OPEN": { ar: "المطبخ", short: "المطبخ", en: "Kitchen" },
  "IMG-UNIT-APT-KITCHEN-CLOSED": { ar: "المطبخ", short: "المطبخ", en: "Kitchen" },
  "IMG-UNIT-APT-3BR-MASTER": { ar: "غرفة النوم الرئيسية", short: "غرفة النوم", en: "Master bedroom" },
  "IMG-UNIT-APT-2BR-BEDROOM": { ar: "غرفة النوم", short: "غرفة النوم", en: "Bedroom" },
  "IMG-UNIT-APT-BALCONY": { ar: "البلكونة", short: "البلكونة", en: "Balcony" },
  "IMG-UNIT-APT-BATH": { ar: "الحمام", short: "الحمام", en: "Bathroom" },
  "IMG-UNIT-MAID-ROOM": { ar: "غرفة الخادمة", short: "غ. الخادمة", en: "Maid's room" },
  "IMG-UNIT-ROOF-TERRACE": { ar: "التراس", short: "التراس", en: "Terrace" },
  "IMG-UNIT-SMARTHOME-DETAIL": { ar: "سمارت هوم", short: "سمارت هوم", en: "Smart home" },
};

export function slotLabel(id: string): SlotLabel {
  return LABELS[id] ?? { ar: id, short: id, en: id };
}

export interface GalleryItem extends SlotLabel {
  slotId: string;
}

const toItem = (slotId: string): GalleryItem => ({ slotId, ...slotLabel(slotId) });

/** The thumbnails under the unit cover: the unit's own slots, cover first. */
export function unitThumbs(unit: Unit): GalleryItem[] {
  return unit.images.map(toItem);
}

/** The full-screen gallery: the building's facade and the project entrance first, then the unit's slots. */
export function galleryItems(unit: Unit): GalleryItem[] {
  const p = projectById(unit.projectId);
  const facade = p?.images.find((s) => s.includes(unit.building === "RZ" ? "ROSE" : "YASMIN"));
  const entrance = p?.images.find((s) => s.includes("ENTRANCE"));
  const ids = [facade, entrance, ...unit.images].filter((s): s is string => !!s);
  return Array.from(new Set(ids)).map(toItem);
}

/** Files the server found for a slot (real photo under /public/real, generated render under /public/images). */
export type SlotFiles = Record<string, { real?: string; gen?: string } | undefined>;
