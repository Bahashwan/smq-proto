// Inbound leads («الطلبات الواردة»: Admin-Leads-D/M, Admin-Overview-D, Admin-Marketers-D, Admin-MarketerDetail-D).
// The designed rows come first; illustrative filler rows (generated: true, deterministic seed) bring the status counts
// to the board's 12 unanswered · 41 answered · 86 closed · 139 total, which leadCounts() computes rather than types.
// WhatsApp and call leads carry only a reference code (SMQ-XXXXX / v-xxxxx); phone numbers exist for forms only.
import type { Lead, LeadKind, LeadStatus } from "./types";
import { units } from "./units";

export const LEAD_KIND_LABELS: Record<LeadKind, string> = { whatsapp: "واتساب", call: "اتصال", form: "نموذج تواصل", notify: "أبلغني", owner: "إضافة عقار" };
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = { unanswered: "بلا رد", answered: "تم الرد", closed: "مغلق" };
/** «عند الإغلاق، اختر السبب: اشترى، لم يرد، غير مناسب.» */
export const CLOSE_REASONS = ["اشترى", "لم يرد", "غير مناسب"];

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
/** «نموذج D · روز · 459,000» from the unit fixture (the price is never typed). */
export function unitLeadTitle(code: string): string {
  const u = units.find((x) => x.code === code);
  if (!u) return code;
  const model = u.type === "roof-villa" ? "فيلا روف" : `نموذج ${u.model}`;
  return `${model} · ${u.buildingNameAr} · ${fmt(u.priceSar)}`;
}

const designed: Lead[] = [
  {
    id: "SMQ-8F3A2",
    code: "SMQ-8F3A2",
    kind: "whatsapp",
    unitCode: "RZ-D",
    title: unitLeadTitle("RZ-D"),
    detail: "الرمز SMQ-8F3A2 · من بطاقة الوحدة · ميزانية 500 ألف",
    budgetSar: 500000,
    source: "سناب شات",
    device: "جوال",
    city: "جدة",
    status: "unanswered",
    at: "2026-10-10T21:46:00+03:00",
    path: [
      "الرئيسية من إعلان سناب شات (الروضة) · 21:40",
      "بحث 450 ثم 500 ألف · الروضة · غرفتان · 21:41",
      "فتح D روز (94 ث)، D ياسمين، C روز · 21:42",
      "مقارنة D روز مع D ياسمين · 21:45",
      "نقرة واتساب من بطاقة D روز · 21:46 · خارج ساعات العمل",
    ],
    notes: [{ by: "نورة", at: "2026-10-10T22:10:00+03:00", text: "وصلتني رسالته على واتساب 22:05، يسأل عن التقسيط. أرسلت له جدول الدفعات." }],
  },
  {
    id: "form-0291",
    kind: "form",
    name: "خالد باعشن",
    phoneMasked: "0553 XXX XXX",
    title: "«أبيع أم أنتظر؟» · الفيصلية",
    detail: "خالد باعشن · 0553 XXX XXX · استشارة",
    source: "قوقل",
    device: "سطح مكتب",
    city: "جدة",
    status: "unanswered",
    at: "2026-10-10T21:00:00+03:00",
    path: ["الخدمات من بحث قوقل · 20:52", "الاستشارات العقارية · 20:55", "نموذج التواصل · 21:00"],
    notes: [],
  },
  {
    id: "v-77b04",
    code: "v-77b04",
    kind: "call",
    unitCode: "YS-RF",
    title: "نقرة اتصال · فيلا روف ياسمين",
    detail: "v-77b04 · عائد ×3 · من المقارنة",
    source: "مباشر",
    device: "سطح مكتب",
    city: "جدة",
    status: "unanswered",
    at: "2026-10-10T21:00:00+03:00",
    path: ["الرئيسية · مباشر", "بحث 1.7 مليون · الروضة · 5 غرف", "مقارنة روف روز مع روف ياسمين", "نقرة اتصال من المقارنة"],
    notes: [],
  },
  {
    id: "2026-1042",
    kind: "owner",
    title: "عمارة سكنية بدخل · النعيم · 4,800,000",
    detail: "عبدالرحمن الزهراني (وكيل) · طلب 2026-1042 · في المراجعة",
    name: "عبدالرحمن الزهراني",
    phoneMasked: "0559 XXX XXX",
    source: "سناب شات",
    device: "جوال",
    city: "جدة",
    status: "answered",
    at: "2026-10-08T21:14:00+03:00",
    path: ["تعاون معنا", "أضف عقارك · الخطوة 1", "التفاصيل والسعر · عمارة بدخل", "الصور وبياناتك · وكيل", "أُرسل الطلب 2026-1042"],
    notes: [{ by: "النظام", at: "2026-10-08T21:15:00+03:00", text: "أُرسلت رسالة تأكيد الاستلام تلقائياً (واتساب بزنس متصل)" }],
    team: "سعود",
  },
  {
    id: "notify-0118",
    kind: "notify",
    unitCode: "YS-A",
    title: "مشابه لنموذج A ياسمين (مباع)",
    detail: "ريم الزهراني · 0556 XXX XXX · غرفتان حتى 560 ألف",
    name: "ريم الزهراني",
    phoneMasked: "0556 XXX XXX",
    budgetSar: 560000,
    source: "واتساب",
    device: "جوال",
    city: "مكة",
    status: "answered",
    statusDetailAr: "تنبيه محفوظ",
    at: "2026-10-09T15:00:00+03:00",
    path: ["صفحة YS-A من رابط واتساب", "«أبلغني عند توفر مشابه» · غرفتان حتى 560 ألف"],
    notes: [{ by: "نورة", at: "2026-10-09T16:20:00+03:00", text: "أخبرتها أن B ياسمين متاح بنفس الغرف؛ تفضّل أقل من 560 ألف." }],
    team: "نورة",
  },
  {
    id: "SMQ-A10F9",
    code: "SMQ-A10F9",
    kind: "whatsapp",
    unitCode: "RZ-B",
    title: unitLeadTitle("RZ-B"),
    detail: "SMQ-A10F9 · أتى من رابط واتساب مباشر",
    source: "واتساب",
    device: "جوال",
    city: "جدة",
    status: "closed",
    closedReason: "اشترى",
    at: "2026-10-02T11:30:00+03:00",
    path: ["صفحة RZ-B من رابط واتساب مباشر", "نقرة واتساب من صفحة الوحدة"],
    notes: [{ by: "سعود", at: "2026-10-02T13:00:00+03:00", text: "زيارة ثم عربون حجز؛ أُغلق بالشراء." }],
    team: "سعود",
  },
  {
    id: "SMQ-2C91E",
    code: "SMQ-2C91E",
    kind: "whatsapp",
    unitCode: "YS-A",
    title: unitLeadTitle("YS-A"),
    detail: "SMQ-2C91E · من بطاقة الوحدة · اشترى YS-A",
    source: "تيك توك",
    device: "جوال",
    city: "جدة",
    status: "closed",
    closedReason: "اشترى",
    at: "2026-09-26T19:40:00+03:00",
    path: ["الرئيسية من تيك توك", "بحث 600 ألف · الروضة", "نقرة واتساب من بطاقة A ياسمين"],
    notes: [{ by: "نورة", at: "2026-09-28T10:00:00+03:00", text: "تم الإفراغ 2026-09-28." }],
    team: "نورة",
  },
  {
    id: "SMQ-5B7E1",
    code: "SMQ-5B7E1",
    kind: "whatsapp",
    unitCode: "YS-RF",
    title: "واتساب · فيلا روف ياسمين",
    detail: "من المقارنة · ميزانية 1.6 مليون",
    budgetSar: 1600000,
    source: "تيك توك",
    device: "جوال",
    city: "جدة",
    status: "answered",
    at: "2026-10-10T19:00:00+03:00",
    path: ["الرئيسية من تيك توك", "بحث 1.6 مليون · الروضة", "مقارنة الروفين", "نقرة واتساب من المقارنة"],
    notes: [],
    team: "نورة",
  },
  {
    id: "SMQ-91B2C",
    code: "SMQ-91B2C",
    kind: "whatsapp",
    unitCode: "RZ-B",
    title: unitLeadTitle("RZ-B"),
    detail: "SMQ-91B2C · عبر مسوّق · عبدالله الحربي",
    source: "سناب شات",
    device: "جوال",
    city: "جدة",
    status: "answered",
    at: "2026-10-09T19:02:00+03:00",
    path: ["/r/abdullah → الرئيسية", "بحث 600 ألف · الروضة", "نقرة واتساب من بطاقة B روز"],
    notes: [],
    viaMarketer: "MK-07",
    team: "نورة",
  },
  {
    id: "SMQ-4F10A",
    code: "SMQ-4F10A",
    kind: "whatsapp",
    unitCode: "RZ-A",
    title: unitLeadTitle("RZ-A"),
    detail: "SMQ-4F10A · عبر مسوّق · عبدالله الحربي",
    source: "سناب شات",
    device: "جوال",
    city: "جدة",
    status: "answered",
    statusDetailAr: "زيارة محجوزة",
    at: "2026-10-07T17:30:00+03:00",
    path: ["/r/abdullah → الرئيسية", "فتح A روز", "نقرة واتساب من صفحة الوحدة"],
    notes: [{ by: "سعود", at: "2026-10-08T09:30:00+03:00", text: "تفاوض · زيارة الخميس" }],
    viaMarketer: "MK-07",
    team: "سعود",
  },
  {
    id: "v-77c12",
    code: "v-77c12",
    kind: "call",
    unitCode: "YS-B",
    title: "نقرة اتصال · نموذج B ياسمين",
    detail: "v-77c12 · عبر مسوّق · هند القرشي",
    source: "إنستغرام",
    device: "جوال",
    city: "جدة",
    status: "unanswered",
    at: "2026-10-06T11:10:00+03:00",
    path: ["/r/hind → الرئيسية", "فتح B ياسمين", "نقرة اتصال"],
    notes: [],
    viaMarketer: "MK-05",
  },
  {
    id: "SMQ-7A3E0",
    code: "SMQ-7A3E0",
    kind: "whatsapp",
    unitCode: "YS-D",
    title: unitLeadTitle("YS-D"),
    detail: "SMQ-7A3E0 · عبر مسوّق · عبدالله الحربي",
    source: "سناب شات",
    device: "جوال",
    city: "جدة",
    status: "answered",
    at: "2026-10-02T20:15:00+03:00",
    path: ["/r/abdullah → الرئيسية", "بحث 500 ألف · الروضة", "نقرة واتساب من بطاقة D ياسمين"],
    notes: [],
    viaMarketer: "MK-07",
    team: "نورة",
  },
  {
    id: "v-77b19",
    code: "v-77b19",
    kind: "call",
    title: "نقرة اتصال · دليل الأسعار",
    detail: "v-77b19 · عبر مسوّق · عبدالله الحربي",
    source: "سناب شات",
    device: "جوال",
    city: "جدة",
    status: "closed",
    closedReason: "لم يرد",
    at: "2026-09-28T12:00:00+03:00",
    path: ["/r/abdullah → الرئيسية", "دليل الأسعار", "نقرة اتصال"],
    notes: [],
    viaMarketer: "MK-07",
    team: "فيصل",
  },
  {
    id: "SMQ-2D9B1",
    code: "SMQ-2D9B1",
    kind: "whatsapp",
    unitCode: "RZ-C",
    title: unitLeadTitle("RZ-C"),
    detail: "SMQ-2D9B1 · عبر مسوّق · عبدالله الحربي",
    source: "سناب شات",
    device: "جوال",
    city: "جدة",
    status: "closed",
    closedReason: "غير مناسب",
    statusDetailAr: "اشترى من غيرنا",
    at: "2026-09-25T18:40:00+03:00",
    path: ["/r/abdullah → الرئيسية", "فتح C روز", "نقرة واتساب"],
    notes: [],
    viaMarketer: "MK-07",
    team: "نورة",
  },
  {
    id: "SMQ-0C44F",
    code: "SMQ-0C44F",
    kind: "whatsapp",
    unitCode: "RZ-RF",
    title: unitLeadTitle("RZ-RF"),
    detail: "SMQ-0C44F · عبر مسوّق · عبدالله الحربي",
    source: "سناب شات",
    device: "جوال",
    city: "جدة",
    status: "answered",
    at: "2026-09-20T21:05:00+03:00",
    path: ["/r/abdullah → الرئيسية", "فتح فيلا روف روز", "نقرة واتساب"],
    notes: [],
    viaMarketer: "MK-07",
    team: "سعود",
  },
];

// Deterministic filler: a small LCG so the rows never change between builds.
let seed = 20261010;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const hex5 = () => Math.floor(rnd() * 0xfffff).toString(16).toUpperCase().padStart(5, "0");
const SOURCES = ["سناب شات", "سناب شات", "تيك توك", "واتساب", "إنستغرام", "قوقل", "مباشر"];
const CITIES = ["جدة", "جدة", "جدة", "جدة", "مكة", "الرياض", "المدينة"];
const NAMES = ["نواف باخشوين", "أروى الجهني", "سامي بافقيه", "منى السلمي", "ياسر الغامدي", "هند الحربي", "وليد باعقيل", "رنا الزهراني"];
const KINDS: LeadKind[] = ["whatsapp", "whatsapp", "whatsapp", "whatsapp", "whatsapp", "call", "call", "form", "notify", "owner"];
const UNIT_CODES = units.map((u) => u.code);

function filler(status: LeadStatus, n: number, dayFrom: number, dayTo: number): Lead[] {
  const out: Lead[] = [];
  for (let i = 0; i < n; i++) {
    const kind = pick(KINDS);
    const unit = pick(UNIT_CODES);
    const day = dayFrom + Math.floor(rnd() * (dayTo - dayFrom + 1)); // days before 2026-10-10
    const date = new Date(Date.UTC(2026, 9, 10, 12, 0, 0) - day * 86400000 - Math.floor(rnd() * 10) * 3600000);
    const at = date.toISOString().replace("Z", "+00:00");
    const device = rnd() < 0.86 ? "جوال" : "سطح مكتب";
    const source = pick(SOURCES);
    const city = pick(CITIES);
    const base = { source, device, city, status, at, path: [] as string[], notes: [] as Lead["notes"], generated: true as const };
    const closedReason = status === "closed" ? pick(["اشترى", "لم يرد", "لم يرد", "غير مناسب", "غير مناسب"]) : undefined;
    if (kind === "whatsapp") {
      const code = `SMQ-${hex5()}`;
      out.push({ id: code, code, kind, unitCode: unit, title: unitLeadTitle(unit), detail: `${code} · من بطاقة الوحدة`, closedReason, ...base });
    } else if (kind === "call") {
      const code = `v-${hex5().toLowerCase()}`;
      out.push({ id: code, code, kind, unitCode: unit, title: `نقرة اتصال · ${unitLeadTitle(unit).split(" · ").slice(0, 2).join(" ")}`, detail: `${code} · من صفحة الوحدة`, closedReason, ...base });
    } else if (kind === "form") {
      const name = pick(NAMES);
      out.push({ id: `form-${1000 + i + dayFrom * 7}`, kind, name, phoneMasked: "05XX XXX XXX", title: "استفسار عام · الروضة", detail: `${name} · 05XX XXX XXX · استفسار`, closedReason, ...base });
    } else if (kind === "notify") {
      const name = pick(NAMES);
      out.push({ id: `notify-${1000 + i + dayFrom * 7}`, kind, name, phoneMasked: "05XX XXX XXX", unitCode: unit, title: `مشابه لـ ${unitLeadTitle(unit).split(" · ").slice(0, 2).join(" ")}`, detail: `${name} · 05XX XXX XXX`, closedReason, ...base });
    } else {
      const name = pick(NAMES);
      out.push({ id: `owner-${1000 + i + dayFrom * 7}`, kind, name, phoneMasked: "05XX XXX XXX", title: "شقة 3 غرف · الصفا", detail: `${name} (مالك) · طلب إضافة عقار`, closedReason, ...base });
    }
  }
  return out;
}

const TARGET = { unanswered: 12, answered: 41, closed: 86 } as const;
const count = (s: LeadStatus) => designed.filter((l) => l.status === s).length;

export const leads: Lead[] = [
  ...designed,
  ...filler("unanswered", TARGET.unanswered - count("unanswered"), 0, 2),
  ...filler("answered", TARGET.answered - count("answered"), 1, 30),
  ...filler("closed", TARGET.closed - count("closed"), 3, 40),
].sort((a, b) => (a.at < b.at ? 1 : -1));

export function leadById(id: string): Lead | undefined {
  return leads.find((l) => l.id === id || l.code === id);
}
