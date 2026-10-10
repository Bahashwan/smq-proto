// Sample data for the QA styleguide only (the Components2 sheet's rows and the Admin-Pieces-D pieces).
// Numbers come from the fixtures: the six rows are real units from data/units.ts and the «changed» row takes its
// import-preview diff from `importPreview`. Only the sheet's state flags (hidden row) live here. Product pages never
// import this file.
import { importPreview, units } from "@/data/units";
import type { Unit } from "@/data/types";
import type { Notification } from "./Notifications";

export type SampleUnit = Pick<Unit, "code" | "slug" | "buildingNameAr" | "beds" | "areaM2" | "priceSar" | "status"> & { hidden?: boolean; previousPriceSar?: number };

/** The sheet's six rows in its order: default, hover, selected (sold), focus, changed (import preview), hidden. */
const SHEET_ROWS: { code: string; hidden?: boolean; changed?: boolean }[] = [{ code: "RZ-A" }, { code: "RZ-B" }, { code: "YS-A" }, { code: "YS-B" }, { code: "RZ-C", changed: true }, { code: "RZ-D", hidden: true }];

export const SAMPLE_UNITS: SampleUnit[] = SHEET_ROWS.flatMap(({ code, hidden, changed }) => {
  const u = units.find((x) => x.code === code);
  if (!u) return [];
  const diff = changed ? importPreview.updated.find((d) => d.code === code && d.field === "price") : undefined;
  const row: SampleUnit = { code: u.code, slug: u.slug, buildingNameAr: u.buildingNameAr, beds: u.beds, areaM2: u.areaM2, priceSar: diff ? diff.to : u.priceSar, status: u.status, hidden };
  if (diff) row.previousPriceSar = diff.from;
  return [row];
});

/** Admin-Pieces-D · 1: the dropdown's six items, last 7 days (copy from the board; the admin pages pass fixture data). */
export const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "عقار مالك جديد", text: "رقم 2026-1042، عمارة سكنية بدخل في النعيم بسعر 4,800,000 · وكيل", when: "قبل 25 دقيقة", href: "/admin/approvals", linkLabel: "افتح الموافقات" },
  { id: "n2", title: "3 طلبات بلا رد", text: "تجاوزت 24 ساعة", when: "قبل ساعة", href: "/admin/leads", linkLabel: "الطلبات الواردة" },
  { id: "n3", title: "انقطع اتصال واتساب بزنس", text: "وتحوّلت اللوحة إلى الوضع اليدوي ثم عاد الاتصال", when: "قبل 40 دقيقة", href: "/admin/users", linkLabel: "الإعدادات" },
  { id: "n4", text: "نورة حفظت مسودة في الرئيسية › الهيرو", when: "أمس 17:40", read: true },
  { id: "n5", text: "استيراد Excel اكتمل: 10 صفوف، لا تغييرات", when: "قبل 4 أيام", read: true },
  { id: "n6", text: "تنبيه «نبّهني» تطابق: ريم الزهراني تنتظر غرفتين حتى 520 ألفاً، ولا وحدة مطابقة بعد", when: "قبل يومين", read: true },
];
