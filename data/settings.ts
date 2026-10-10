// Site settings (Admin-SiteSettings-D, Admin-Users-D, HeaderFooter, Contact-D) and the alliance settings
// (Admin-AllianceSettings-D). The office pin and the real licences come from the brief; the embed URLs are built from
// the coordinates until the owner pastes Google's own «Embed a map» code (docs/route-map.md).
import type { AllianceSettings, SiteSettings } from "./types";

export const OFFICE_LAT = 21.5604526;
export const OFFICE_LNG = 39.1811231;

/** Keyless Google Maps embed, street level (z=17), Arabic or English interface. */
export function embedUrl(lat: number, lng: number, hl: "ar" | "en" = "ar", z = 17): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${z}&hl=${hl}&output=embed`;
}
/** «افتح الاتجاهات في الخرائط»: a plain Google Maps directions link. */
export function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** WhatsApp templates (Admin-SiteSettings-D «قوالب رسائل واتساب»); variables in braces are replaced by fillTemplate(). */
export const WA_TEMPLATES = [
  { id: "unit", label: "من صفحة وحدة", text: "مرحباً، أسأل عن الوحدة {unit_code} في {project} بسعر {price} ريال. رمزي: {code}", exampleAr: "مثال: مرحباً، أسأل عن الوحدة RZ-A في جاردن الروضة بسعر 690,000 ريال. رمزي: SMQ-8F3A2" },
  { id: "results", label: "من النتائج أو دليل الأسعار", text: "مرحباً، أبحث عن {type} بميزانية {budget} ريال في {district}. رمزي: {code}" },
  { id: "general", label: "من الرأس أو التذييل (عام)", text: "مرحباً، أريد الاستفسار عن وحداتكم. رمزي: {code}" },
  { id: "owner-received", label: "تأكيد استلام عقار مالك (يُرسل من الفريق)", text: "وصلنا طلبك رقم {request_no}. سنراجع الصك والصور ونرد خلال يومي عمل." },
  { id: "owner-approved", label: "قبول عقار مالك", text: "تمت الموافقة على عقارك {request_no}. أصبح معروضاً على {unit_url} بسعر {price} ريال." },
  { id: "owner-rejected", label: "رفض عقار مالك", text: "شكراً لك. لم نتمكن من عرض عقارك {request_no} للسبب: {reason}. يمكنك تعديل الطلب وإعادة إرساله." },
];

/** Replace {variables} in a template; unknown variables stay as written. */
export function fillTemplate(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export const settings: SiteSettings = {
  office: {
    lat: OFFICE_LAT,
    lng: OFFICE_LNG,
    addressAr: "شارع السيدة خديجة، حي الفيصلية، جدة 23441",
    addressEn: "Sayyidah Khadijah Street, Al Faisaliyah, Jeddah 23441",
    mapsLink: directionsUrl(OFFICE_LAT, OFFICE_LNG),
    embedUrlAr: embedUrl(OFFICE_LAT, OFFICE_LNG, "ar"),
    embedUrlEn: embedUrl(OFFICE_LAT, OFFICE_LNG, "en"),
  },
  whatsapp: { number: "966559997929", templates: WA_TEMPLATES.map(({ id, label, text }) => ({ id, label, text })) },
  whatsappDisplay: "0559997929",
  whatsappIntl: "+966 55 999 7929",
  hours: { days: "السبت إلى الخميس", from: "9 ص", to: "6 م" },
  hoursLabelAr: "السبت إلى الخميس · 9 ص إلى 6 م",
  hoursLabelEn: "Saturday to Thursday, 9 am to 6 pm Jeddah time",
  fridayAr: "مغلق · واتساب يستقبل الرسائل",
  afterHoursAr: "نرد في أول ساعة عمل",
  businessHours: { days: [6, 0, 1, 2, 3, 4], open: 9, close: 18, timeZone: "Asia/Riyadh" },
  phone: "0556607779",
  phoneIntl: "+966 55 660 7779",
  email: "info@smqre.com",
  emailLeads: "leads@smqre.com",
  licence: { rega: "1200040135", cr: "7029797433" },
  taxNumber: { value: "", tbc: true },
  companyNameAr: "شركة إس إم كيو للاستثمار والتسويق العقاري",
  companyNameEn: "SMQ Real Estate",
  taglineAr: "شركة استثمار وتسويق عقاري، تبدأ من الأرقام",
  footerLineAr: "أسعار معلنة، وحدات حقيقية، رد خلال ساعات العمل.",
  social: {
    handle: "@smq_re",
    x: "https://x.com/smqre",
    instagram: "https://instagram.com/smqre",
    snapchat: "",
    tiktok: "",
    linkedin: "https://linkedin.com/company/smqre",
    youtube: "",
  },
  domain: "smq-re.com",
  switches: { financingBlock: false, testimonials: false, alliancePublic: true, marketersOpen: true },
  siteSwitches: { showSoldInResults: false, generatedLabel: true, acceptOwnerListings: true },
  whatsappBusiness: {
    connected: true,
    number: "+966 55 999 7929",
    lastSync: "اليوم 10:04 · تأكيد طلب 2026-1042",
    templatesApproved: "3 من 3",
    disconnectedNoteAr: "انقطع الاتصال قبل 40 دقيقة. 2 رسالتان بانتظار الإرسال اليدوي في الموافقات.",
  },
};

export const allianceSettings: AllianceSettings = {
  charter: {
    version: "1.0",
    date: "2026-10-11",
    fullText:
      "[للتأكيد من العميل: النص الكامل] 1. التحالف مبادرة تديرها شركة إس إم كيو للاستثمار والتسويق العقاري، والعضوية مفتوحة لكل مكتب مرخّص في جدة. 2. يمرّر الأعضاء طلبات المشترين وعروض العقارات عبر SMQ، ولا يتواصل مكتب مع مشترٍ أحاله مكتب آخر إلا بعد سجل إحالة. 3. تُقسم العمولة بين المكتبين 50 / 50 [للتأكيد]. 4. يحمي سجل الإحالة الطرفين 90 يوماً من تاريخ التعارف [للتأكيد]. 5. يُخرج العضو عند تخطّي سجل إحالة، أو انتهاء الرخصة، أو انعدام الرد 30 يوماً [للتأكيد].",
    summary: "تقسيم العمولة 50 / 50 · حماية الإحالة 90 يوماً من التعارف · الإخراج عند تخطّي سجل إحالة أو رخصة منتهية أو بلا رد 30 يوماً [للتأكيد]",
  },
  defaults: {
    split: "50 / 50",
    splitTbc: true,
    splitOptions: ["50 / 50 [للتأكيد]", "60 / 40 لصاحب العرض", "60 / 40 لصاحب الطلب"],
    protectionDays: 90,
    replyBusinessDays: 3,
    suspendAfterNoReplyDays: 30,
  },
  routing: {
    weights: { ledger: 50, speed: 30, specialty: 20 },
    sendTo: 2,
    sendToOptions: ["كل من يغطي", "أول 2", "أول 3"],
    autoSend: true,
  },
  options: {
    sectors: ["شمال جدة", "وسط جدة", "شرق جدة", "غرب جدة", "جنوب جدة"],
    specialties: ["عماير تجارية", "عماير سكنية", "أراضي مطورة", "أراضي خام", "فلل", "شقق", "مكاتب", "مستودعات", "أراضي زراعية", "صناعية", "تعليمي", "منتجعات وشاليهات", "أخرى"],
    hours: ["دوام واحد", "صباحي", "مسائي", "أخرى"],
    applicantRoles: ["مالك المكتب العقاري", "مدير", "موظف", "أخرى"],
    districtsCount: 30,
  },
  forms: [
    { key: "alliance", nameAr: "طلب الانضمام للتحالف", metaAr: "3 خطوات · /alliance/apply · آخر رد اليوم", open: true, responses: 41, imported: 37, path: "/alliance/apply" },
    { key: "add", nameAr: "تسجيل عرض عقاري · أضف عقارك", metaAr: "3 خطوات · /add · آخر رد قبل ساعة", open: true, responses: 128, path: "/add" },
    { key: "marketers", nameAr: "انضم كمسوّق", metaAr: "صفحة واحدة · /marketers · الحقول [للتأكيد]", open: true, responses: 9, path: "/marketers" },
  ],
  rejectReasons: ["رقم رخصة فال لا يطابق اسم المكتب", "الرخصة منتهية", "موقع المكتب خارج جدة", "بيانات ناقصة: موقع المكتب", "سبب آخر (اكتب)"],
};
