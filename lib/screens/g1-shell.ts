import type { Screen } from "./types";
const S = "1–12 · Public site, round 1";
export const screens: Screen[] = [
  { board: "Home-M", route: "/", width: 390, section: S },
  { board: "Home-D", route: "/", width: 1440, section: S },
  { board: "Header-Scrolled-D", route: "/", width: 1440, section: S, note: "after 120px of scroll", prepare: { scroll: 400 }, viewport: true },
];
