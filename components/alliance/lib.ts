// Shared words, orders and small formatters for the alliance components. Copy comes from the boards;
// everything numeric is formatted with lib/format (Western digits, tabular numerals).
import type { ReferralStage, RequestStage, Sector } from "@/data/types";
import { fmtNum } from "@/lib/format";

/** The design's «today» (every board is dated around it). Pages may pass their own reference date. */
export const PROTOTYPE_TODAY = "2026-10-10";

export const SECTOR_ORDER: Sector[] = ["north", "central", "east", "west", "south"];
export const SECTOR_LABELS: Record<Sector, string> = {
  north: "شمال جدة",
  central: "وسط جدة",
  east: "شرق جدة",
  west: "غرب جدة",
  south: "جنوب جدة",
};

/** Referral stages in board order; «لم تتم» is the failure word, drawn where the record stopped. */
export const REFERRAL_STAGES: readonly string[] = ["تعارف", "معاينة", "تفاوض", "إفراغ", "لم تتم"];
export const REFERRAL_STAGE_WORD: Record<ReferralStage, string> = {
  intro: "تعارف",
  viewing: "معاينة",
  negotiation: "تفاوض",
  transfer: "إفراغ",
  failed: "لم تتم",
};
export const REFERRAL_STAGE_INDEX: Record<ReferralStage, number> = { intro: 0, viewing: 1, negotiation: 2, transfer: 3, failed: 4 };
export const APPLICATION_STEPS: readonly string[] = ["وصل الطلب", "التحقق من الرخصة", "موثّق"];

export const REQUEST_STAGE_WORD: Record<RequestStage, string> = {
  new: "جديد",
  sent: "أُرسل",
  offers: "وصلت عروض",
  intro: "تعارف",
  closed: "مغلق",
};

export type RequestSource = "visitor" | "staff" | "member";
export const SOURCE_WORD: Record<RequestSource, string> = { visitor: "زائر بلا نتائج", staff: "فريق SMQ", member: "مكتب عضو" };
export const SOURCE_WORD_SHORT: Record<RequestSource, string> = { visitor: "زائر", staff: "فريق", member: "عضو" };

/** 100 → «1 س 40 د» · 50 → «50 د» · 120 → «2 س 00 د» (the Members board pads the minutes) */
export function fmtReply(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} د`;
  return `${h} س ${String(m).padStart(2, "0")} د`;
}

/** 24 → «24 يوماً» · 1 → «يوم واحد» · 2 → «يومان» · 3 → «3 أيام» */
export function daysLabel(n: number): string {
  if (n === 1) return "يوم واحد";
  if (n === 2) return "يومان";
  if (n >= 3 && n <= 10) return `${n} أيام`;
  return `${n} يوماً`;
}

/** 450000 → «450k» · 2200000 → «2.2M» · 1000000 → «1M» (the boards' short budget form) */
export function fmtShort(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}M`;
  }
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return fmtNum(n);
}

/** «حتى 450,000» · «700,000 إلى 1,000,000» · short: «حتى 2.2M» · «700k إلى 1M» */
export function budgetLabel(min?: number, max?: number, short = false): string {
  const f = short ? fmtShort : fmtNum;
  if (min != null && max != null) return `${f(min)} إلى ${f(max)}`;
  if (max != null) return `حتى ${f(max)}`;
  if (min != null) return `من ${f(min)}`;
  return "";
}

/** «لا أعضاء» · «1 مكتب» · «2 مكاتب» (as the Radar and Alliance boards write it) */
export function membersLabel(n: number): string {
  if (n === 0) return "لا أعضاء";
  if (n === 1) return "1 مكتب";
  return `${n} مكاتب`;
}
/** sector heading count: «5 مكاتب» · «1 مكتب» · «0 مكاتب» */
export function officesCount(n: number): string {
  return n === 1 ? "1 مكتب" : `${n} مكاتب`;
}
/** «0 وحدة» · «1 وحدة» · «8 وحدات» */
export function unitsLabel(n: number): string {
  if (n >= 3 && n <= 10) return `${n} وحدات`;
  return `${n} وحدة`;
}

export type LedgerNet = "giver" | "taker" | "balanced";
export const LEDGER_NET_WORD: Record<LedgerNet, string> = { giver: "معطٍ", taker: "مستقبِل", balanced: "متوازن" };
export function ledgerNet(given: number, received: number): LedgerNet {
  if (given > received) return "giver";
  if (given < received) return "taker";
  return "balanced";
}
/** «معطٍ أكثر مما يستقبل · 10 مقابل 9» (Member-Ledger-M); the taker and balanced lines follow the same pattern */
export function ledgerNetLine(given: number, received: number): string {
  const net = ledgerNet(given, received);
  const pair = `${fmtNum(given)} مقابل ${fmtNum(received)}`;
  if (net === "giver") return `معطٍ أكثر مما يستقبل · ${pair}`;
  if (net === "taker") return `مستقبِل أكثر مما يعطي · ${pair}`;
  return `متوازن · ${pair}`;
}

const DAY = 86_400_000;
function utc(iso: string): number {
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  return Date.UTC(y, m - 1, d);
}
/** "2026-10-10" + 90 → "2027-01-08" */
export function addDays(iso: string, n: number): string {
  return new Date(utc(iso) + n * DAY).toISOString().slice(0, 10);
}
export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((utc(toIso) - utc(fromIso)) / DAY);
}
/** protection days remaining, never below zero */
export function protectionDaysLeft(introducedOn: string, protectionDays: number, today = PROTOTYPE_TODAY): number {
  return Math.max(0, protectionDays - daysBetween(introducedOn, today));
}

/** Loose Arabic matching for the district search: alef forms, taa marbuta, final ya, tashkeel */
export function normalizeAr(s: string): string {
  return s
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim()
    .toLowerCase();
}

export function chunk<T>(arr: readonly T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += Math.max(1, n)) out.push(arr.slice(i, i + Math.max(1, n)));
  return out;
}
