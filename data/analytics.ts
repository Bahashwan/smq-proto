// Search analytics (Admin-Analytics-D, Admin-Overview-D, Admin-M), the radar's district sessions
// (Admin-AllianceRadar-D), per-unit weekly views and the monthly alliance reports (Admin-AllianceReport-D,
// Member-Report-D). Every number here is illustrative («الأرقام توضيحية»); the 30-day set is the designed one,
// 7 days comes from the overview board, 90 days is a scaled set for the period toggle.
import type { AllianceReport, AnalyticsPeriod, AnalyticsPeriodKey, RadarDistrict } from "./types";

const BUDGET_LABELS = ["<400", "400 إلى 500", "500 إلى 600", "600 إلى 700", "700 إلى 850", "850 إلى مليون", ">مليون"];
const BUDGET_BOUNDS: [number | null, number | null][] = [[null, 400000], [400000, 500000], [500000, 600000], [600000, 700000], [700000, 850000], [850000, 1000000], [1000000, null]];
const bands = (pcts: number[]) => pcts.map((pct, i) => ({ labelAr: BUDGET_LABELS[i], min: BUDGET_BOUNDS[i][0], max: BUDGET_BOUNDS[i][1], pct }));
const rows = (pairs: [string, string, number][]) => pairs.map(([key, labelAr, pct]) => ({ key, labelAr, pct }));

const ROOMS: [string, string, number][] = [["all", "الكل", 31], ["2", "2", 24], ["3", "3", 33], ["4", "4", 9], ["5", "5+", 3]];
const TYPES: [string, string, number][] = [["apt", "شقة", 74], ["villa", "فيلا", 14], ["roof", "روف", 8], ["duplex", "دوبلكس", 4]];
const FEATURES: [string, string, number][] = [["balcony", "بلكونة", 41], ["maid", "خادمة", 29], ["smart", "سمارت", 18], ["driver", "سائق", 12], ["roof", "سطح", 7]];
const SORT: [string, string, number][] = [["price", "السعر، الأقل أولاً (افتراضي)", 71], ["ppm", "سعر المتر", 13], ["area", "المساحة", 11], ["delivery", "التسليم", 5]];
const VIEW: [string, string, number][] = [["grid", "شبكة", 88], ["map", "خريطة", 12]];
const TOOLS: [string, string, number][] = [["compare", "استخدموا المقارنة", 12], ["guide", "فتحوا دليل الأسعار", 23]];
const HOURS = [30, 18, 10, 6, 4, 4, 6, 10, 18, 28, 34, 36, 32, 30, 30, 34, 40, 48, 56, 66, 82, 100, 96, 64];

const ZERO_TOP = [
  { labelAr: "أبحر الشمالية · شقة · 3 غرف · حتى 700 ألف", count: 412, loosenAr: "تخفيف: الحي" },
  { labelAr: "الروضة · شقة · 4 غرف · أي ميزانية", count: 287, loosenAr: "تخفيف: الغرف" },
  { labelAr: "الفيصلية · أي نوع · حتى 500 ألف", count: 231, loosenAr: "تخفيف: الحي" },
  { labelAr: "الروضة · شقة · حتى 420 ألف", count: 196, loosenAr: "تخفيف: الميزانية" },
  { labelAr: "الروضة · شقة · 3 غرف · غرفة سائق", count: 148, loosenAr: "تخفيف: السائق" },
];

const period30: AnalyticsPeriod = {
  key: "30d",
  labelAr: "30 يوماً",
  days: 30,
  visitors: 5112,
  sessions: 7930,
  searches: 8420,
  whatsappClicks: 389,
  funnel: [
    { labelAr: "زيارة", count: 5112 },
    { labelAr: "بحث بالميزانية", count: 3580 },
    { labelAr: "فتح وحدة", count: 2046 },
    { labelAr: "مقارنة أو ثانية وحدة", count: 614 },
    { labelAr: "نقرة واتساب أو اتصال", count: 389 },
  ],
  medianBudget: 650000,
  meanBudget: 712000,
  budgetBands: bands([6, 14, 22, 27, 15, 8, 8]),
  supplyGapAr: "16% يبحثون بين 850 ألف ومليون ولا توجد وحدة في هذا النطاق",
  districtsDemand: [
    { slug: "rawdah", labelAr: "الروضة", pct: 38 },
    { slug: "obhur-north", labelAr: "أبحر الشمالية", pct: 19 },
    { slug: "faisaliyah", labelAr: "الفيصلية", pct: 14 },
    { slug: "shati", labelAr: "الشاطئ", pct: 11 },
    { slug: "naeem", labelAr: "النعيم", pct: 6 },
    { slug: "all", labelAr: "كل جدة", pct: 12 },
  ],
  districtNoteAr: "أبحر الشمالية هي أول حي يستحق مشروعاً ثانياً بالأرقام: 970 بحثاً في 30 يوماً بلا نتيجة واحدة.",
  rooms: rows(ROOMS),
  types: rows(TYPES),
  features: rows(FEATURES),
  zeroResults: { count: 1573, pct: 19, top: ZERO_TOP, noteAr: "62% من هؤلاء ضغطوا أحد اقتراحات التخفيف، و9% أرسلوا طلباً على واتساب." },
  sort: rows(SORT),
  view: rows(VIEW),
  tools: rows(TOOLS),
  hours: HOURS,
  hoursNoteAr: "41% من نقرات واتساب تصل خارج ساعات العمل. الرد التلقائي المسائي مهم.",
  outsideHoursPct: 41,
};

const period7: AnalyticsPeriod = {
  ...period30,
  key: "7d",
  labelAr: "7 أيام",
  days: 7,
  visitors: 1284,
  visitorsDeltaPct: 18,
  sessions: 1990,
  searches: 2061,
  whatsappClicks: 97,
  funnel: [
    { labelAr: "زيارة", count: 1284 },
    { labelAr: "بحث بالميزانية", count: 905 },
    { labelAr: "فتح وحدة", count: 518 },
    { labelAr: "مقارنة أو ثانية وحدة", count: 156 },
    { labelAr: "نقرة واتساب أو اتصال", count: 97 },
  ],
  medianBudget: 650000,
  meanBudget: 705000,
  supplyGapAr: "23% من الباحثين فوق 850 ألف ولا توجد وحدة بينها والفلل",
  districtsDemand: [
    { slug: "rawdah", labelAr: "الروضة", pct: 38 },
    { slug: "obhur-north", labelAr: "أبحر الشمالية", pct: 19 },
    { slug: "faisaliyah", labelAr: "الفيصلية", pct: 14 },
    { slug: "shati", labelAr: "الشاطئ", pct: 11 },
    { slug: "all", labelAr: "كل جدة", pct: 18 },
  ],
  districtNoteAr: "الذهبي = طلب بلا معروض. 44% من عمليات البحث انتهت بلا نتائج بسبب الحي.",
  zeroResults: { count: 392, pct: 19, top: ZERO_TOP.map((z) => ({ ...z, count: Math.round(z.count / 4) })), noteAr: period30.zeroResults.noteAr },
};

const period90: AnalyticsPeriod = {
  ...period30,
  key: "90d",
  labelAr: "90 يوماً",
  days: 90,
  visitors: 14900,
  visitorsDeltaPct: 9,
  sessions: 23100,
  searches: 24500,
  whatsappClicks: 1130,
  funnel: [
    { labelAr: "زيارة", count: 14900 },
    { labelAr: "بحث بالميزانية", count: 10280 },
    { labelAr: "فتح وحدة", count: 5810 },
    { labelAr: "مقارنة أو ثانية وحدة", count: 1720 },
    { labelAr: "نقرة واتساب أو اتصال", count: 1130 },
  ],
  medianBudget: 640000,
  meanBudget: 705000,
  budgetBands: bands([7, 15, 23, 26, 14, 8, 7]),
  supplyGapAr: "15% يبحثون بين 850 ألف ومليون ولا توجد وحدة في هذا النطاق",
  districtsDemand: [
    { slug: "rawdah", labelAr: "الروضة", pct: 40 },
    { slug: "obhur-north", labelAr: "أبحر الشمالية", pct: 18 },
    { slug: "faisaliyah", labelAr: "الفيصلية", pct: 13 },
    { slug: "shati", labelAr: "الشاطئ", pct: 10 },
    { slug: "naeem", labelAr: "النعيم", pct: 7 },
    { slug: "all", labelAr: "كل جدة", pct: 12 },
  ],
  districtNoteAr: "أبحر الشمالية تتصدّر الطلب بلا عرض للشهر الثالث.",
  zeroResults: { count: 4560, pct: 19, top: ZERO_TOP.map((z) => ({ ...z, count: Math.round(z.count * 2.9) })), noteAr: period30.zeroResults.noteAr },
};

/** Sessions per district, 30 days (the radar grid). 90 days is a scaled set. */
export const districtSessions30d: Record<string, number> = {
  "obhur-north": 318, shati: 186, dhahban: 12, mohammadiyah: 96, nahdah: 44, basateen: 18, sawari: 6,
  rawdah: 1060, safa: 204, naeem: 433, zahra: 71, salamah: 9, khalidiyah: 15, nuzhah: 24, naseem: 11,
  harazat: 58, samer: 39, rehab: 7, ajaweed: 11, bryman: 4, waha: 6,
  hamra: 52, balad: 14, andalus: 22, ruwais: 8, sharafiyah: 19, baghdadiyah: 5,
  faisaliyah: 141, muntazahat: 16, jamiah: 21, sanabel: 3, quwaizah: 9, kawthar: 13,
};
/** Launch day (Alliance-Launch-M): the four districts the manager marks «مطلوب» from the radar before any member joins. */
export const launchRequiredDistricts: string[] = ["obhur-north", "mohammadiyah", "safa", "naeem"];

export const districtSessions90d: Record<string, number> = Object.fromEntries(Object.entries(districtSessions30d).map(([k, v]) => [k, Math.round(v * 2.7)]));

/** Drawer detail for the districts the radar ranks (Admin-AllianceRadar-D). */
export const radarDistricts: Record<string, RadarDistrict> = {
  "obhur-north": { slug: "obhur-north", sessions: 318, deltaPct: 22, medianBudget: 1900000, topDemandAr: "فلل · 5 غرف", topBeds: 5, whatsappNoResult: 41, supplyNoteAr: "مشروع أبحر قريباً [للتأكيد]", summaryAr: "طلب قوي، لا وحدات لنا، ومكتبان يغطيانه" },
  safa: { slug: "safa", sessions: 204, deltaPct: 8, medianBudget: 680000, topDemandAr: "شقق · 4 غرف", topBeds: 4, whatsappNoResult: 23, ownerUnits: 1, supplyNoteAr: "1 من مالك", summaryAr: "طلب على 4 غرف يسبق العرض، ومكتب واحد يغطيه" },
  faisaliyah: { slug: "faisaliyah", sessions: 141, deltaPct: 14, medianBudget: 440000, topDemandAr: "شقق · 4 غرف", topBeds: 4, whatsappNoResult: 17, summaryAr: "طلب على شقق 4 غرف بلا وحدات لنا، ومكتب واحد يغطيه" },
  mohammadiyah: { slug: "mohammadiyah", sessions: 96, deltaPct: -3, medianBudget: 850000, topDemandAr: "شقق · 3 غرف", topBeds: 3, whatsappNoResult: 9, summaryAr: "طلب متوسط، لا وحدات لنا، ومكتب نشط واحد يغطيه" },
  naeem: { slug: "naeem", sessions: 433, deltaPct: 31, medianBudget: 720000, topDemandAr: "شقق · 3 غرف", topBeds: 3, whatsappNoResult: 38, supplyNoteAr: "عرض بدخل قيد المراجعة", summaryAr: "طلب قوي على الشقق، والعضو الوحيد متخصص في العماير" },
  rawdah: { slug: "rawdah", sessions: 1060, deltaPct: 12, medianBudget: 620000, topDemandAr: "شقق · غرفتان", topBeds: 2, whatsappNoResult: 0, summaryAr: "نغطيه بأنفسنا" },
  shati: { slug: "shati", sessions: 186, deltaPct: 5, medianBudget: 1100000, topDemandAr: "شقق · 3 غرف", topBeds: 3, whatsappNoResult: 15, summaryAr: "طلب جيد، لا وحدات لنا، ومكتبان يغطيانه" },
  nahdah: { slug: "nahdah", sessions: 44, deltaPct: 2, medianBudget: 560000, topDemandAr: "شقق · غرفتان", topBeds: 2, whatsappNoResult: 6, summaryAr: "طلب صغير ولا أعضاء" },
};

/** Per-unit views and WhatsApp clicks, 7 days (Admin-Inventory-D «مشاهدات · واتساب · 7 أيام»). */
export const unitWeek: Record<string, { views: number; whatsapp: number; noteAr?: string }> = {
  "RZ-A": { views: 184, whatsapp: 9 },
  "RZ-B": { views: 121, whatsapp: 6 },
  "RZ-C": { views: 96, whatsapp: 4 },
  "RZ-D": { views: 312, whatsapp: 21 },
  "RZ-RF": { views: 58, whatsapp: 3 },
  "YS-A": { views: 40, whatsapp: 2, noteAr: "تنبيهات" },
  "YS-B": { views: 77, whatsapp: 5 },
  "YS-C": { views: 33, whatsapp: 1 },
  "YS-D": { views: 298, whatsapp: 18 },
  "YS-RF": { views: 64, whatsapp: 4 },
};

export const analytics = {
  periods: { "7d": period7, "30d": period30, "90d": period90 } as Record<AnalyticsPeriodKey, AnalyticsPeriod>,
  periodOrder: ["7d", "30d", "90d"] as AnalyticsPeriodKey[],
  today: { visitors: 212, whatsapp: 17, whatsappUnanswered: 5 },
  /** The admin overview's header line */
  overview: { greetingAr: "صباح الخير، سعود", dateAr: "السبت 10 أكتوبر 2026", lastSyncAr: "آخر مزامنة للوحدات قبل 12 دقيقة", visitorsNoteAr: "+18% عن الأسبوع السابق" },
  sourcesAr: ["كل المصادر", "سناب شات", "تيك توك", "واتساب", "إنستغرام", "قوقل", "مباشر"],
  districtSessions30d,
  districtSessions90d,
  radarDistricts,
  unitWeek,
  /** Alliance-wide response numbers, 30 days (Admin-Alliance-D «سرعة الرد») */
  allianceResponse: { noReplyWithinDeadline: 4, sentWithinDeadline: 31, explicitNone: 12, autoSendsThisMonth: 27, manualSendsThisMonth: 4 },
};

export const allianceReports: AllianceReport[] = [
  {
    id: "2026-10",
    monthAr: "أكتوبر 2026",
    status: "draft",
    generatesOn: "2026/11/01 · 06:00",
    sessions: 1613,
    recipients: 11,
    newDistrictsAr: "النهضة، الحرازات",
    byDistrict: rows([["rawdah", "الروضة", 21], ["obhur-north", "أبحر الشمالية", 18], ["safa", "الصفا", 14], ["naeem", "النعيم", 9], ["nahdah", "النهضة", 4]]),
    byBudget: rows([["b1", "حتى 500k", 20], ["b2", "500 إلى 700k", 29], ["b3", "700k إلى 1M", 21], ["b4", "1 إلى 1.5M", 13], ["b5", "1.5 إلى 2.5M", 12]]),
    byBeds: rows([["2", "غرفتان", 34], ["3", "3 غرف", 42], ["4", "4 غرف", 19], ["5", "5 فأكثر", 5]]),
    opportunities: [
      { labelAr: "أبحر الشمالية · فلل 1.5 إلى 2.5M", sessions: 128, offices: 2, officeIds: ["office-01", "office-11"], supplyAr: "0 وحدة" },
      { labelAr: "الصفا · شقق 4 غرف", sessions: 84, offices: 1, officeIds: ["office-05"], supplyAr: "1 وحدة من مالك" },
      { labelAr: "الفيصلية · شقق 4 غرف", sessions: 51, offices: 1, officeIds: ["office-09"], supplyAr: "0 وحدة" },
      { labelAr: "النهضة · شقق غرفتين", sessions: 44, offices: 0, officeIds: [], supplyAr: "0 وحدة" },
      { labelAr: "المحمدية · 3 غرف", sessions: 18, offices: 1, officeIds: ["office-04"], supplyAr: "0 وحدة" },
      { labelAr: "الحرازات · فلل", sessions: 16, offices: 0, officeIds: [], supplyAr: "0 وحدة" },
      { labelAr: "الزهراء · شقق غرفتين", sessions: 14, offices: 0, officeIds: [], supplyAr: "0 وحدة" },
    ],
    wordAr: "الطلب على 4 غرف في الصفا والفيصلية يسبق العرض للشهر الثاني. من يملك عرضاً هناك فليرسله عاماً من صفحته.",
    sections: [
      { key: "district", labelAr: "بالحي", on: true },
      { key: "budget", labelAr: "بشريحة الميزانية", on: true },
      { key: "beds", labelAr: "بعدد الغرف", on: true },
      { key: "gaps", labelAr: "حيث وجد الطلب لا عرض", on: true },
      { key: "speed", labelAr: "سرعة رد الأعضاء (بالاسم)", on: false },
    ],
  },
  {
    id: "2026-09",
    monthAr: "سبتمبر 2026",
    status: "published",
    publishedOn: "2026-10-01",
    sessions: 4812,
    sessionsDeltaPct: 12,
    medianBudget: 640000,
    noSupplyPct: 31,
    recipients: 12,
    byDistrict: rows([["rawdah", "الروضة", 22], ["obhur-north", "أبحر الشمالية", 17], ["safa", "الصفا", 13], ["naeem", "النعيم", 9], ["shati", "الشاطئ", 8], ["mohammadiyah", "المحمدية", 7], ["faisaliyah", "الفيصلية", 6], ["other", "أخرى", 18]]),
    byBudget: rows([["b1", "حتى 500k", 19], ["b2", "500 إلى 700k", 28], ["b3", "700k إلى 1M", 21], ["b4", "1 إلى 1.5M", 14], ["b5", "1.5 إلى 2.5M", 12], ["b6", "أكثر من 2.5M", 6]]),
    byBeds: rows([["2", "غرفتان", 36], ["3", "3 غرف", 42], ["4", "4 غرف", 17], ["5", "5 فأكثر", 5]]),
    bedsNoteAr: "الطلب على 4 غرف ارتفع 6 نقاط عن أغسطس، وأكثره في الصفا والفيصلية حيث لا عرض.",
    opportunities: [
      { labelAr: "أبحر الشمالية · فلل 1.5 إلى 2.5M", sessions: 318, offices: 2, officeIds: ["office-01", "office-11"], supplyAr: "0 وحدة" },
      { labelAr: "الصفا · شقق 4 غرف حتى 700k", sessions: 204, offices: 1, officeIds: ["office-05"], supplyAr: "1 وحدة من مالك" },
      { labelAr: "الفيصلية · شقق 4 غرف حتى 450k", sessions: 141, offices: 1, officeIds: ["office-09"], supplyAr: "0 وحدة" },
      { labelAr: "المحمدية · شقق 3 غرف 700k إلى 1M", sessions: 96, offices: 2, officeIds: ["office-04", "office-12"], supplyAr: "0 وحدة" },
      { labelAr: "النعيم · عماير سكنية بدخل 3 إلى 6M", sessions: 61, offices: 1, officeIds: ["office-06"], supplyAr: "1 عرض قيد المراجعة", needsMembers: true },
    ],
    wordAr: "الطلب على 4 غرف في الصفا والفيصلية يسبق العرض للشهر الثاني. من يملك عرضاً هناك فليرسله عاماً من صفحته.",
    sections: [
      { key: "district", labelAr: "بالحي", on: true },
      { key: "budget", labelAr: "بشريحة الميزانية", on: true },
      { key: "beds", labelAr: "بعدد الغرف", on: true },
      { key: "gaps", labelAr: "حيث وجد الطلب لا عرض", on: true },
      { key: "speed", labelAr: "سرعة رد الأعضاء (بالاسم)", on: false },
    ],
  },
  {
    id: "2026-08",
    monthAr: "أغسطس 2026",
    status: "published",
    publishedOn: "2026-09-01",
    sessions: 4297,
    sessionsDeltaPct: 7,
    medianBudget: 630000,
    noSupplyPct: 29,
    recipients: 12,
    byDistrict: rows([["rawdah", "الروضة", 24], ["obhur-north", "أبحر الشمالية", 15], ["safa", "الصفا", 12], ["naeem", "النعيم", 8], ["shati", "الشاطئ", 8], ["other", "أخرى", 33]]),
    byBudget: rows([["b1", "حتى 500k", 21], ["b2", "500 إلى 700k", 29], ["b3", "700k إلى 1M", 20], ["b4", "1 إلى 1.5M", 13], ["b5", "1.5 إلى 2.5M", 11], ["b6", "أكثر من 2.5M", 6]]),
    byBeds: rows([["2", "غرفتان", 39], ["3", "3 غرف", 43], ["4", "4 غرف", 11], ["5", "5 فأكثر", 7]]),
    opportunities: [
      { labelAr: "أبحر الشمالية · فلل 1.5 إلى 2.5M", sessions: 261, offices: 2, officeIds: ["office-01", "office-11"], supplyAr: "0 وحدة" },
      { labelAr: "الصفا · شقق 3 غرف", sessions: 170, offices: 1, officeIds: ["office-05"], supplyAr: "0 وحدة" },
    ],
    wordAr: "",
    sections: [
      { key: "district", labelAr: "بالحي", on: true },
      { key: "budget", labelAr: "بشريحة الميزانية", on: true },
      { key: "beds", labelAr: "بعدد الغرف", on: true },
      { key: "gaps", labelAr: "حيث وجد الطلب لا عرض", on: true },
      { key: "speed", labelAr: "سرعة رد الأعضاء (بالاسم)", on: false },
    ],
  },
];

export function reportById(id: string): AllianceReport | undefined {
  return allianceReports.find((r) => r.id === id);
}
