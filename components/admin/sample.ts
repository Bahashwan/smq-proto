// Sample data for the QA styleguide only (the Components2 sheet's own rows and the Admin-Pieces-D pieces).
// Product pages never import this file: they compute from /data fixtures. Once data/units.ts lands, the table rows
// here should be replaced by a selector over the real units (the six rows are RZ-A, RZ-B, YS-A, YS-B, RZ-C, RZ-D).
import type { Unit } from "@/data/types";
import type { Notification } from "./Notifications";

export type SampleUnit = Pick<Unit, "code" | "slug" | "buildingNameAr" | "beds" | "areaM2" | "priceSar" | "status"> & { hidden?: boolean; previousPriceSar?: number };

export const SAMPLE_UNITS: SampleUnit[] = [
  { code: "RZ-A", slug: "rz-a", buildingNameAr: "روز", beds: 3, areaM2: 147, priceSar: 690000, status: "available" },
  { code: "RZ-B", slug: "rz-b", buildingNameAr: "روز", beds: 2, areaM2: 116.9, priceSar: 555000, status: "available" },
  { code: "YS-A", slug: "ys-a", buildingNameAr: "ياسمين", beds: 2, areaM2: 109.35, priceSar: 555000, status: "sold" },
  { code: "YS-B", slug: "ys-b", buildingNameAr: "ياسمين", beds: 2, areaM2: 106.05, priceSar: 555000, status: "available" },
  { code: "RZ-C", slug: "rz-c", buildingNameAr: "روز", beds: 2, areaM2: 80.35, priceSar: 499000, previousPriceSar: 510000, status: "available" },
  { code: "RZ-D", slug: "rz-d", buildingNameAr: "روز", beds: 2, areaM2: 82.6, priceSar: 459000, status: "available", hidden: true },
];

/** Admin-Pieces-D · 1: the dropdown's six items, last 7 days. */
export const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: "n1", title: "عقار مالك جديد", text: "رقم 2026-1042، عمارة سكنية بدخل في النعيم بسعر 4,800,000 · وكيل", when: "قبل 25 دقيقة", href: "/admin/approvals", linkLabel: "افتح الموافقات" },
  { id: "n2", title: "3 طلبات بلا رد", text: "تجاوزت 24 ساعة", when: "قبل ساعة", href: "/admin/leads", linkLabel: "الطلبات الواردة" },
  { id: "n3", title: "انقطع اتصال واتساب بزنس", text: "وتحوّلت اللوحة إلى الوضع اليدوي ثم عاد الاتصال", when: "قبل 40 دقيقة", href: "/admin/users", linkLabel: "الإعدادات" },
  { id: "n4", text: "نورة حفظت مسودة في الرئيسية › الهيرو", when: "أمس 17:40", read: true },
  { id: "n5", text: "استيراد Excel اكتمل: 10 صفوف، لا تغييرات", when: "قبل 4 أيام", read: true },
  { id: "n6", text: "تنبيه «نبّهني» تطابق: ريم الزهراني تنتظر غرفتين حتى 520 ألفاً، ولا وحدة مطابقة بعد", when: "قبل يومين", read: true },
];
