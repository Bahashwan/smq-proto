// G9 · small helpers shared by the marketers and alliance-room pages: relative time words in the boards' forms,
// Arabic counted nouns (the boards always print the digit) and short labels composed from the fixtures.
import { NOW, whenLabel } from "@/data/selectors";
import { officeById } from "@/data/offices";

const ymdFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" });
const ymd = (d: Date) => ymdFmt.format(d);

/** Calendar days between the record and the prototype's clock (Jeddah). */
export function daysAgo(iso: string, now: string = NOW): number {
  return Math.round((Date.parse(ymd(new Date(now))) - Date.parse(ymd(new Date(iso)))) / 86400000);
}

/** «اليوم 9:40» → «اليوم 09:40» (the marketers boards pad the hour). */
export function padTime(s: string): string {
  return s.replace(/(^|\s)(\d):(\d\d)/, (_m, sp: string, h: string, mm: string) => `${sp}0${h}:${mm}`);
}

/** Table time: «أمس 19:02» · «اليوم 09:40» · «قبل يومين» · «قبل 3 أيام» · «قبل 12 يوماً». */
export function agoLong(iso: string, now: string = NOW): string {
  const d = daysAgo(iso, now);
  if (d <= 1) return padTime(whenLabel(iso, now));
  if (d === 2) return "قبل يومين";
  if (d <= 10) return `قبل ${d} أيام`;
  return `قبل ${d} يوماً`;
}

/** Card time: «اليوم 09:40» · «أمس» · «قبل 3 أيام». */
export function agoShort(iso: string, now: string = NOW): string {
  const d = daysAgo(iso, now);
  if (d <= 0) return padTime(whenLabel(iso, now));
  if (d === 1) return "أمس";
  return agoLong(iso, now);
}

/** Minutes between two instants → «قبل 20 د» · «قبل 3 ساعات» (the request cards). */
export function minutesAgo(iso: string, now: string = NOW): number {
  return Math.max(0, Math.round((new Date(now).getTime() - new Date(iso).getTime()) / 60000));
}

/** «HH:MM» of an instant in Jeddah. */
export function clock(iso: string): string {
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Riyadh", hour: "2-digit", minute: "2-digit", hour12: false });
  return f.format(new Date(iso));
}
/** «2026/10/09 21:41» */
export function stamp(iso: string): string {
  return `${ymd(new Date(iso)).replaceAll("-", "/")} ${clock(iso)}`;
}
/** «2026/10/09» of an instant in Jeddah. */
export function dayOf(iso: string): string {
  return ymd(new Date(iso)).replaceAll("-", "/");
}

/**
 * Counted noun as the boards print it, always with the digit: 1 → «1 مكتب», 2–10 → «3 طلبات», 11+ → «19 طلباً».
 */
export function cnt(n: number, one: string, few: string, many: string = one): string {
  if (n === 1) return `1 ${one}`;
  if (n === 0 || (n >= 2 && n <= 10)) return `${n} ${few}`;
  return `${n} ${many}`;
}
export const visitsWord = (n: number) => cnt(n, "زيارة", "زيارات", "زيارة");
export const requestsWord = (n: number) => cnt(n, "طلب", "طلبات", "طلباً");
export const districtsWord = (n: number) => cnt(n, "حي", "أحياء", "حياً");
export const sectorsWord = (n: number) => cnt(n, "جهة", "جهات", "جهة");

/** «مكتب ط» · «SMQ» */
export function officeShort(id: string): string {
  if (id === "SMQ") return "SMQ";
  return officeById(id)?.nameAr ?? id;
}
/** The letters of a list of offices joined the boards' way: «أ، ك». */
export function letters(ids: string[]): string {
  return ids.map((id) => officeById(id)?.letter ?? id).join("، ");
}
