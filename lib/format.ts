// Number and text formatting. Western digits everywhere, tabular numerals from the root font settings.
const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 690000 → "690,000" */
export function fmtNum(n: number): string {
  return nf.format(Math.round(n));
}
/** 82.6 → "82.60" (areas keep two decimals); 147 → "147" */
export function fmtArea(n: number): string {
  return Number.isInteger(n) ? nf.format(n) : nf2.format(n);
}
/** price per square metre, rounded to the riyal */
export function ppm(priceSar: number, areaM2: number): number {
  return Math.round(priceSar / areaM2);
}
/** 690000 → "690k" style for chips: 700000 → "700 ألف" is copy, so this stays numeric: "700,000" */
export function fmtK(n: number): string {
  return nf.format(n);
}
/** 1650000 → "1.65 مليون" style for compact labels */
export function fmtCompactAr(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} مليون`;
  }
  if (n >= 1000) return `${fmtNum(n / 1000)} ألف`;
  return fmtNum(n);
}
/** "2026-09-28" → "2026/09/28" */
export function fmtDate(iso: string): string {
  return iso.replaceAll("-", "/");
}
const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
/** "2026-09-28" → "28 سبتمبر 2026" */
export function fmtDateLong(iso: string): string {
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  return `${d} ${AR_MONTHS[m - 1]} ${y}`;
}
/** Arabic plural helpers for the copy that counts things: units, rooms, offices. */
export function plural(n: number, forms: { one: string; two: string; few: string; many: string }): string {
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  if (n >= 3 && n <= 10) return `${n} ${forms.few}`;
  return `${n} ${forms.many}`;
}
export const UNITS = { one: "وحدة واحدة", two: "وحدتان", few: "وحدات", many: "وحدة" };
export const ROOMS = { one: "غرفة واحدة", two: "غرفتان", few: "غرف", many: "غرفة" };
export const OFFICES = { one: "مكتب واحد", two: "مكتبان", few: "مكاتب", many: "مكتباً" };
/** beds label as the boards write it: 2 → "غرفتان", 3 → "3 غرف", 5 → "5 غرف" */
export function bedsLabel(n: number): string {
  return plural(n, ROOMS);
}
export function bathsLabel(n: number): string {
  return plural(n, { one: "حمام واحد", two: "حمامان", few: "حمامات", many: "حماماً" });
}
/** WhatsApp link with a prefilled message */
export const WA_NUMBER = "966559997929";
export function waLink(text?: string): string {
  return text ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}` : `https://wa.me/${WA_NUMBER}`;
}
/** Visitor reference code shown in WhatsApp messages: SMQ-XXXXX (stable per browser) */
export function visitorCode(): string {
  if (typeof window === "undefined") return "SMQ-XXXXX";
  try {
    const k = "smq.visitor";
    let v = window.localStorage.getItem(k);
    if (!v) {
      v = "SMQ-" + Math.random().toString(16).slice(2, 7).toUpperCase();
      window.localStorage.setItem(k, v);
    }
    return v;
  } catch {
    return "SMQ-8F3A2";
  }
}
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
