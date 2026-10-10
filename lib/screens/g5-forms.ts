import type { Screen } from "./types";
// g5-forms: أضف عقارك (three steps, the building variant, the success screen), the marketer form (+ its success screen,
// which has no board), and the تعاون معنا hub. One entry per board row of docs/route-map.md.
const R1 = "1–12 · Public site, round 1";
const R2 = "23–29 · Public, round 2";
const C = "30–32 · تعاون معنا";

/** Add-Step3-D: the board's incomplete number typed, then «أرسل الطلب» → «الرقم غير مكتمل. 10 أرقام تبدأ بـ 05.» */
const INCOMPLETE_PHONE: Screen["prepare"] = { wait: 500, fill: { "#add-phone": "05512" }, click: "form button[type=submit]" };

export const screens: Screen[] = [
  { board: "Add-D", route: "/add", width: 1440, section: R1, note: "step 1 «النوع والموقع»: the gold hero beside «كيف يسير الأمر», the step list beside the form" },
  { board: "Add-M", route: "/add/contact", width: 390, section: R1, note: "step 3 on the phone: hero, «كيف يسير الأمر», WhatsApp card, the form with the phone field focused", prepare: { wait: 500, click: "#add-phone" } },
  { board: "Add-Step1-M", route: "/add", width: 390, section: R2, note: "hero + «كيف يسير الأمر» + the form; schematic pin picker with «موقعي الحالي» and «ألصق رابطاً»" },
  { board: "Add-Step2-M", route: "/add/details", width: 390, section: R2, note: "apartment variant: asked per-m² against the district's available range (computed)" },
  { board: "Add-Step2-Building-M", route: "/add/details?type=building", width: 390, section: R2, note: "building variant: income block, per-m² on build and land, gross yield (ownerFormComputed)" },
  { board: "Add-Step2-D", route: "/add/details?type=building", width: 1440, section: R2, note: "building variant with the «للعمائر تحديداً» aside" },
  { board: "Add-Step3-D", route: "/add/contact?type=building", width: 1440, section: R2, note: "وكيل → the power-of-attorney block; an incomplete phone number submitted → the designed gold error", prepare: INCOMPLETE_PHONE },
  { board: "Add-Success-M", route: "/add/sent?no=2026-1043", width: 390, section: R2, note: "the apartment; «نسخ» copies the number, WhatsApp prefilled with «طلب 2026-1043»" },
  { board: "Add-Success-D", route: "/add/sent?no=2026-1042", width: 1440, section: R2, note: "the income building the owner tour then opens in /admin/approvals/2026-1042" },
  { board: "Hub-M", route: "/collaborate", width: 390, section: C, note: "three doors" },
  { board: "Hub-D", route: "/collaborate", width: 1440, section: C },
  { board: "Marketer-M", route: "/marketers", width: 390, section: C, note: "«الحقول [للتأكيد] حتى يصل النموذج الحقيقي» on the fields note" },
  { board: "Marketer-D", route: "/marketers", width: 1440, section: C },
  { board: "Marketer-Sent-M", route: "/marketers/sent", width: 390, section: C, note: "no board: the Add-Success pattern (MK-10 after a submit; the newest «جديد» application when opened directly)" },
  { board: "Marketer-Sent-D", route: "/marketers/sent", width: 1440, section: C, note: "no board: the Add-Success pattern" },
];
