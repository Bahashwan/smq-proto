import type { Screen } from "./types";
// g1-shell: Home and the shell pages (services, about, privacy, 404, /en), the header/footer and the B-Hero reference.
const O = "0 · Options";
const S = "1–12 · Public site, round 1";
const R2 = "23–29 · Public, round 2";
export const screens: Screen[] = [
  { board: "Home-M", route: "/", width: 390, section: S },
  { board: "Home-D", route: "/", width: 1440, section: S },
  { board: "Header-Scrolled-D", route: "/", width: 1440, section: S, note: "after 120px of scroll", prepare: { scroll: 400 }, viewport: true },
  { board: "B-Hero", route: "/", width: 390, section: O, note: "the Home hero/finder block (chosen direction)", viewport: true },
  { board: "HeaderFooter", route: "/?menu=1", width: 390, section: S, note: "mobile menu open (?menu=1); the desktop header and the full footer are on every public page", viewport: true },
  { board: "Services-M", route: "/services", width: 390, section: S },
  { board: "Services-D", route: "/services", width: 1440, section: S },
  { board: "About-M", route: "/about", width: 390, section: S },
  { board: "About-D", route: "/about", width: 1440, section: S, note: "default: no financing or testimonial blocks" },
  { board: "NotFound-M", route: "/this-page-does-not-exist", width: 390, section: S, viewport: true },
  { board: "NotFound-D", route: "/this-page-does-not-exist", width: 1440, section: S },
  { board: "About-Proof-D", route: "/about?proof=1", width: 1440, section: R2, note: "presenter «About proof blocks»: financing, numbers band, three quotes tagged «نص تجريبي»" },
  { board: "Privacy-M", route: "/privacy", width: 390, section: R2 },
  { board: "Privacy-D", route: "/privacy", width: 1440, section: R2, note: "sticky contents list" },
  { board: "EN-Home-M", route: "/en", width: 390, section: R2, note: "LTR, cuts mirrored" },
];
