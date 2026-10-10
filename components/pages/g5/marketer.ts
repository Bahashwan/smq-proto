// The marketer application (/marketers → /marketers/sent): the number a new application gets (the next MK id after the
// marketers fixture, MK-10) and the record the success page shows when it opens without a submission in this session
// (the latest «جديد» application of the fixtures).
import { marketers } from "@/data/marketers";
import { forms } from "@/data/content";

export interface MarketerSent {
  no: string;
  name: string;
  phone: string; // masked
  fal: string;
  districts: string[];
  years: string;
  fresh?: boolean;
}

export function nextMarketerNo(): string {
  const n = Math.max(0, ...marketers.map((m) => Number(m.id.replace(/\D/g, "")) || 0)) + 1;
  return `MK-${String(n).padStart(2, "0")}`;
}

/** the newest application still in «جديد» (MK-09 / MK-08 in the fixtures) */
export function latestApplication(): MarketerSent {
  const fresh = marketers.filter((m) => m.stage === "new").sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""))[0] ?? marketers[0];
  const years = forms.marketer.years.find((y) => (fresh.yearsLabel ?? "").startsWith(y)) ?? fresh.yearsLabel ?? "";
  return { no: fresh.id, name: fresh.name, phone: fresh.phoneMasked, fal: fresh.licence ?? "", districts: fresh.districts, years };
}
