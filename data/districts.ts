// The 33 districts of docs/data-model.md «Districts»: slug, Arabic, transliteration, sector and an approximate centre
// that drives only the schematic SVG map layout and the project embed centre. comingSoon = the Admin-Lists-D set.
import type { District, Sector } from "./types";

export const SECTORS: Record<Sector, { ar: string; short: string; en: string }> = {
  north: { ar: "شمال جدة", short: "شمال", en: "North Jeddah" },
  central: { ar: "وسط جدة", short: "وسط", en: "Central Jeddah" },
  east: { ar: "شرق جدة", short: "شرق", en: "East Jeddah" },
  west: { ar: "غرب جدة", short: "غرب", en: "West Jeddah" },
  south: { ar: "جنوب جدة", short: "جنوب", en: "South Jeddah" },
};
export const SECTOR_ORDER: Sector[] = ["north", "central", "east", "west", "south"];

const d = (slug: string, ar: string, en: string, sector: Sector, lat: number, lng: number, extra: Partial<District> = {}): District => ({
  slug,
  ar,
  en,
  sector,
  centre: { lat, lng },
  comingSoon: false,
  ...extra,
});

export const districts: District[] = [
  d("obhur-north", "أبحر الشمالية", "Obhur North", "north", 21.78, 39.12, { comingSoon: true, inSiteList: true, listNoteAr: "مشروع مسودة" }),
  d("shati", "الشاطئ", "Ash Shati", "north", 21.63, 39.11, { comingSoon: true, inSiteList: true }),
  d("dhahban", "ذهبان", "Dhahban", "north", 21.94, 39.12),
  d("mohammadiyah", "المحمدية", "Al Mohammadiyah", "north", 21.64, 39.13, { comingSoon: true, inSiteList: true }),
  d("nahdah", "النهضة", "An Nahdah", "north", 21.62, 39.16, { inSiteList: true }),
  d("basateen", "البساتين", "Al Basateen", "north", 21.66, 39.15),
  d("sawari", "الصواري", "As Sawari", "north", 21.69, 39.11),
  d("rawdah", "الروضة", "Ar Rawdah", "central", 21.572, 39.168, { inSiteList: true }),
  d("safa", "الصفا", "As Safa", "central", 21.593, 39.202, { inSiteList: true, listNoteAr: "1 من مالك" }),
  d("naeem", "النعيم", "An Naeem", "central", 21.6, 39.17, { inSiteList: true }),
  d("zahra", "الزهراء", "Az Zahra", "central", 21.58, 39.14, { inSiteList: true }),
  d("salamah", "السلامة", "As Salamah", "central", 21.6, 39.14, { inSiteList: true }),
  d("khalidiyah", "الخالدية", "Al Khalidiyah", "central", 21.56, 39.15),
  d("nuzhah", "النزهة", "An Nuzhah", "central", 21.6, 39.19),
  d("naseem", "النسيم", "An Naseem", "central", 21.59, 39.23),
  d("harazat", "الحرازات", "Al Harazat", "east", 21.63, 39.27, { inSiteList: true }),
  d("samer", "السامر", "As Samer", "east", 21.6, 39.26, { inSiteList: true }),
  d("rehab", "الرحاب", "Ar Rehab", "east", 21.56, 39.24),
  d("ajaweed", "الأجاويد", "Al Ajaweed", "east", 21.58, 39.27),
  d("bryman", "بريمان", "Bryman", "east", 21.67, 39.26),
  d("waha", "الواحة", "Al Waha", "east", 21.64, 39.22),
  d("hamra", "الحمراء", "Al Hamra", "west", 21.53, 39.16, { inSiteList: true }),
  d("balad", "البلد", "Al Balad", "west", 21.485, 39.187, { inSiteList: true }),
  d("andalus", "الأندلس", "Al Andalus", "west", 21.52, 39.17),
  d("ruwais", "الرويس", "Ar Ruwais", "west", 21.53, 39.18),
  d("sharafiyah", "الشرفية", "Ash Sharafiyah", "west", 21.51, 39.19),
  d("baghdadiyah", "البغدادية", "Al Baghdadiyah", "west", 21.5, 39.18),
  d("faisaliyah", "الفيصلية", "Al Faisaliyah", "south", 21.56, 39.18, { inSiteList: true }),
  d("muntazahat", "المنتزهات", "Al Muntazahat", "south", 21.44, 39.24),
  d("jamiah", "الجامعة", "Al Jamiah", "south", 21.49, 39.24),
  d("sanabel", "السنابل", "As Sanabel", "south", 21.42, 39.22),
  d("quwaizah", "قويزة", "Quwaizah", "south", 21.46, 39.26),
  d("kawthar", "الكوثر", "Al Kawthar", "south", 21.47, 39.29),
];

export function districtBySlug(slug: string): District | undefined {
  return districts.find((x) => x.slug === slug);
}
/** Arabic name for a slug; the slug itself when unknown (never throws in JSX). */
export function districtAr(slug: string): string {
  return districtBySlug(slug)?.ar ?? slug;
}
export function districtsBySector(sector: Sector): District[] {
  return districts.filter((x) => x.sector === sector);
}
/** The 14 districts of the site lists (filter + «أضف عقارك»), in the Lists board's order: with-units first. */
export function siteDistricts(): District[] {
  const order = ["rawdah", "safa", "naeem", "obhur-north", "shati", "mohammadiyah"];
  return districts
    .filter((x) => x.inSiteList)
    .sort((a, b) => {
      const ia = order.indexOf(a.slug);
      const ib = order.indexOf(b.slug);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
}
