import type { Screen } from "./types";
// g2-results: results list, filters sheet, loading and empty states, the alliance bridge success, the map view, /en/units.
const RESULTS = "/units?district=rawdah&max=700000&type=apt";
const EMPTY = "/units?district=faisaliyah&max=450000&beds=4&type=apt&feat=driver";
const MAP = "/units/map?district=rawdah&max=700000&type=apt&pin=rwd-01";
const R1 = "1–12 · Public site, round 1";
const R2 = "23–29 · Public, round 2";

export const screens: Screen[] = [
  { board: "B-Card", route: "/units", width: 390, section: "0 · Options", note: "the result card component on /units (chosen direction)" },
  { board: "Results-M", route: RESULTS, width: 390, section: R1 },
  { board: "Results-D", route: RESULTS, width: 1440, section: R1 },
  { board: "Results-Filters-M", route: `${RESULTS}&sheet=filters`, width: 390, section: R1, prepare: { wait: 600 }, viewport: true },
  { board: "State-Loading-M", route: "/units?skeleton=1", width: 390, section: R1, note: "presenter «loading skeletons»; also ~400 ms on every filter change" },
  { board: "Results-Loading-D", route: "/units?skeleton=1", width: 1440, section: R1 },
  { board: "State-Empty-M", route: EMPTY, width: 390, section: R1, note: "headline constraint and loosenings computed; the alliance bridge form" },
  { board: "State-Empty-D", route: EMPTY, width: 1440, section: R1 },
  { board: "State-Cards", route: "/units", width: 1440, section: R1, note: "sold card in the «مباعة، للمرجع فقط» strip; the reserved card is on /units/ys-d?ustatus=reserved" },
  { board: "Results-Map-M", route: MAP, width: 390, section: R2, prepare: { wait: 600 }, viewport: true },
  { board: "Results-Map-D", route: MAP, width: 1440, section: R2, prepare: { wait: 600 } },
  { board: "EN-Card-M", route: "/en/units", width: 390, section: R2 },
  { board: "State-Empty-Success-M", route: "/alliance/request/sent?req=REQ-2026-0412", width: 390, section: "30–32 · تعاون معنا" },
];
