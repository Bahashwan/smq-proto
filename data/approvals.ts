// Owner submissions («أضف عقارك» → Admin-Approvals-D, Admin-M, Admin-Overview-D, Add-Success-*). 2026-1042 is the
// income-building example the owner tour opens (submitted by a وكيل); 2026-1043 the apartment the success screen shows.
// ppm and yield are computed by ownerFormComputed(); the role checklists come from the Admin-Approvals-D board.
import type { Approval, ApprovalRole, ApprovalStatus } from "./types";

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = { new: "جديد", "awaiting-photos": "بانتظار صور", approved: "منشورة", rejected: "مرفوضة" };
export const ROLE_LABELS: Record<ApprovalRole, string> = { owner: "مالك", agent: "وكيل", marketer: "مسوّق" };
/** The role notes under the checklist (Admin-Approvals-D). */
export const ROLE_NOTES: Record<ApprovalRole, string> = {
  owner: "الصك باسمه، والرقم في الطلب يطابق رقم المالك في الصك.",
  agent: "الوكالة الشرعية سارية وتشمل البيع، مع الصك.",
  marketer: "رخصة فال سارية وعقد وساطة موثّق في موقع الهيئة، مع الصك.",
};
/** «سبب الرفض أو التعديل (يصل المالك على واتساب)» select options on the approvals board. */
export const APPROVAL_REJECT_OPTIONS = ["السعر أعلى من السوق بشكل كبير", "الصور غير كافية", "لم نتمكن من تأكيد الملكية", "خارج نطاق تغطيتنا", "مكرر"];

type Item = { label: string; done: boolean; roleOnly?: boolean };
const SHARED_INCOME: Item = { label: "عقود الإيجار موثّقة في إيجار والدخل المعلن يطابقها (للعمائر بدخل)", done: false };
const SHARED_PHOTOS: Item = { label: "الصور من فريق SMQ أو موافق عليها (3 صور على الأقل)", done: false };

/** Checklist templates per role; the building example pre-ticks the first two agent items as the board shows. */
export function checklistFor(kind: Approval["kind"], done: Partial<Record<ApprovalRole, boolean[]>> = {}): Record<ApprovalRole, Item[]> {
  const income = kind === "building" ? [SHARED_INCOME] : [];
  const mk = (role: ApprovalRole, items: Item[]) => items.map((it, i) => ({ ...it, done: done[role]?.[i] ?? it.done }));
  return {
    owner: mk("owner", [
      { label: "الصك باسمه، والرقم في الطلب يطابق رقم المالك في الصك", done: false, roleOnly: true },
      { label: "رقم الصك مطابق للعقار", done: false },
      ...income,
      SHARED_PHOTOS,
      { label: "اتفاقية التسويق موقّعة من المالك", done: false },
    ]),
    agent: mk("agent", [
      { label: "الوكالة الشرعية مرفقة وسارية، واسم الموكِّل يطابق مالك الصك", done: false, roleOnly: true },
      { label: "رقم الصك مطابق للعقار وللمالك في الوكالة", done: false },
      ...income,
      SHARED_PHOTOS,
      { label: "اتفاقية التسويق موقّعة من الوكيل بصفته", done: false },
    ]),
    marketer: mk("marketer", [
      { label: "رخصة فال سارية باسم المسوّق", done: false, roleOnly: true },
      { label: "عقد وساطة موثّق في موقع الهيئة، مع الصك", done: false, roleOnly: true },
      { label: "رقم الصك مطابق للعقار", done: false },
      ...income,
      SHARED_PHOTOS,
      { label: "اتفاقية التسويق موقّعة من المسوّق", done: false },
    ]),
  };
}

export const approvals: Approval[] = [
  {
    id: "2026-1043",
    kind: "apartment",
    typeLabelAr: "شقة",
    titleAr: "شقة 3 غرف · الروضة",
    role: "owner",
    submitterName: "محمد العمري",
    phoneMasked: "0559XXXXXX",
    phoneLast4: "4821",
    purpose: "sell",
    city: "جدة",
    districtSlug: "rawdah",
    landmark: "شارع الأمير سلطان، قرب الحديقة",
    pin: { lat: 21.572, lng: 39.168 },
    relation: "المالك",
    beds: 3,
    baths: 2,
    areaM2: 120,
    floor: "الثالث",
    ageLabel: "1 إلى 5 سنوات",
    occupancy: "مؤجّرة",
    features: ["موقف خاص", "مصعد", "مطبخ راكب"],
    askedPriceSar: 620000,
    negotiable: "نعم، قليلاً",
    photosCount: 3,
    attachments: [],
    timing: "أي وقت",
    submittedAt: "2026-10-09T20:00:00+03:00",
    ageHours: 26,
    status: "new",
    ownerNotes: "مؤجرة حتى مارس",
    sourceAr: "جوال · سناب شات",
    checklist: checklistFor("apartment"),
    log: [
      { by: "النظام", text: "رسالة للمالك: «استلمنا طلبك، نتواصل خلال 24 ساعة»", at: "2026-10-09T20:01:00+03:00", mode: "auto", noteAr: "أُرسلت تلقائياً (واتساب بزنس متصل)" },
      { by: "المالك", text: "المالك أرسل الطلب من صفحة «أضف عقارك»", at: "2026-10-09T20:00:00+03:00", noteAr: "جوال · سناب شات" },
    ],
  },
  {
    id: "2026-1042",
    kind: "building",
    typeLabelAr: "عمارة سكنية",
    titleAr: "عمارة سكنية بدخل · حي النعيم",
    role: "agent",
    submitterName: "عبدالرحمن الزهراني",
    phoneMasked: "0559 XXX XXX",
    phoneLast4: "2210",
    purpose: "sell",
    city: "جدة",
    districtSlug: "naeem",
    pin: { lat: 21.6, lng: 39.17 },
    relation: "مفوّض",
    landM2: 625,
    buildM2: 1480,
    floors: 4,
    unitsCount: 8,
    ageLabel: "6 إلى 10 سنوات",
    streetWidth: "20 م",
    hasIncome: true,
    incomeYearSar: 312000,
    occupiedUnits: 7,
    contractsLabel: "عقود موثّقة",
    buildingFeatures: ["مصعد", "مواقف", "خزان مياه"],
    askedPriceSar: 4800000,
    negotiable: "قليلاً",
    deedNumber: "",
    photosCount: 3,
    photos: ["IMG_4412.jpg · 2.1 MB", "IMG_4413.jpg · 1.8 MB", "IMG_4418.jpg · 2.4 MB"],
    attachments: ["الوكالة الشرعية · PDF"],
    timing: "صباحاً",
    submittedAt: "2026-10-08T21:14:00+03:00",
    ageHours: 49,
    status: "new",
    ownerNotes: "«العمارة مؤجّرة بالكامل عدا شقة الدور الأرضي، عقود إيجار موثّقة، مصعد وخزان وموقف لكل شقة. الوكالة مرفقة.»",
    priorRequestsAr: "طلب واحد سابق · لا شكاوى",
    modelCode: "IND-BLD-02",
    projectId: "ind",
    publishedDescription:
      "عمارة سكنية في حي النعيم، 8 وحدات على 4 أدوار، أرض 625 م² وبناء 1,480 م²، دخل سنوي 312,000 ريال بعقود موثّقة، إشغال 7 من 8. مصعد ومواقف وخزان.",
    publishFeatures: { maid: false, driver: false, balcony: true, smartHome: false, parking: true },
    sourceAr: "جوال · سناب شات",
    checklist: checklistFor("building", { agent: [true, true, false, false, false] }),
    log: [
      { by: "سعود", text: "فتح الطلب وبدأ التحقق", at: "2026-10-10T10:40:00+03:00" },
      { by: "النظام", text: "رسالة للمالك: «استلمنا طلبك، نتواصل خلال 24 ساعة»", at: "2026-10-08T21:15:00+03:00", mode: "auto", noteAr: "أُرسلت تلقائياً (واتساب بزنس متصل)" },
      { by: "المالك", text: "المالك أرسل الطلب من صفحة «أضف عقارك»", at: "2026-10-08T21:14:00+03:00", noteAr: "جوال · سناب شات" },
    ],
  },
  {
    id: "2026-1041",
    kind: "villa",
    typeLabelAr: "فيلا",
    titleAr: "فيلا 5 غرف · أبحر الشمالية",
    role: "owner",
    submitterName: "أحمد الغامدي",
    phoneMasked: "0556XXXXXX",
    purpose: "sell",
    city: "جدة",
    districtSlug: "obhur-north",
    pin: { lat: 21.78, lng: 39.12 },
    relation: "المالك",
    beds: 5,
    baths: 6,
    areaM2: 480,
    ageLabel: "جديد (لم يُسكن)",
    occupancy: "شاغرة",
    features: ["موقف خاص", "غرفة خادمة", "غرفة سائق", "مكيفات راكبة"],
    askedPriceSar: 2400000,
    negotiable: "لا",
    photosCount: 8,
    attachments: [],
    timing: "مساءً",
    submittedAt: "2026-10-10T13:00:00+03:00",
    ageHours: 9,
    status: "new",
    vsDistrictNoteAr: "لا مرجع في الحي",
    sourceAr: "جوال · قوقل",
    checklist: checklistFor("villa"),
    log: [
      { by: "النظام", text: "رسالة للمالك: «استلمنا طلبك، نتواصل خلال 24 ساعة»", at: "2026-10-10T13:01:00+03:00", mode: "auto", noteAr: "أُرسلت تلقائياً (واتساب بزنس متصل)" },
      { by: "المالك", text: "المالك أرسل الطلب من صفحة «أضف عقارك»", at: "2026-10-10T13:00:00+03:00", noteAr: "جوال · قوقل" },
    ],
  },
  {
    id: "2026-1040",
    kind: "land",
    typeLabelAr: "أرض",
    titleAr: "أرض 600 م² · الفيصلية",
    role: "owner",
    submitterName: "سارة باخشوين",
    phoneMasked: "0553XXXXXX",
    purpose: "sell",
    city: "جدة",
    districtSlug: "faisaliyah",
    pin: { lat: 21.56, lng: 39.18 },
    relation: "المالك",
    landM2: 600,
    askedPriceSar: 1100000,
    negotiable: "أفضل عرض",
    photosCount: 1,
    attachments: [],
    timing: "صباحاً",
    submittedAt: "2026-10-10T18:00:00+03:00",
    ageHours: 4,
    status: "awaiting-photos",
    sourceAr: "جوال · إنستغرام",
    checklist: checklistFor("land"),
    log: [
      { by: "نورة", text: "طُلبت صور إضافية من المالك · تذكير تلقائي بعد 48 ساعة", at: "2026-10-10T20:00:00+03:00", mode: "auto" },
      { by: "النظام", text: "رسالة للمالك: «استلمنا طلبك، نتواصل خلال 24 ساعة»", at: "2026-10-10T18:01:00+03:00", mode: "auto", noteAr: "أُرسلت تلقائياً (واتساب بزنس متصل)" },
      { by: "المالك", text: "المالك أرسل الطلب من صفحة «أضف عقارك»", at: "2026-10-10T18:00:00+03:00", noteAr: "جوال · إنستغرام" },
    ],
  },
];

/** «+ 14 طلباً مغلقاً هذا الشهر: 9 منشورة، 3 مرفوضة، 2 منسحبة» — illustrative closed submissions so the counts are computed. */
const CLOSED_SPEC: { id: string; kind: Approval["kind"]; status: ApprovalStatus; withdrawn?: boolean; district: string; price: number; name: string; title: string; closedOn: string; reason?: string }[] = [
  { id: "2026-1039", kind: "apartment", status: "approved", district: "safa", price: 680000, name: "فيصل باناجة", title: "شقة 4 غرف · الصفا", closedOn: "2026-10-07" },
  { id: "2026-1038", kind: "apartment", status: "approved", district: "rawdah", price: 540000, name: "هيا الجهني", title: "شقة غرفتين · الروضة", closedOn: "2026-10-06" },
  { id: "2026-1037", kind: "villa", status: "rejected", district: "obhur-north", price: 3900000, name: "عمر السبيعي", title: "فيلا 6 غرف · أبحر الشمالية", closedOn: "2026-10-04", reason: "السعر أعلى من السوق بأكثر من 20%" },
  { id: "2026-1036", kind: "land", status: "approved", district: "nahdah", price: 950000, name: "مها العوفي", title: "أرض 450 م² · النهضة", closedOn: "2026-10-03" },
  { id: "2026-1035", kind: "apartment", status: "rejected", district: "zahra", price: 610000, name: "سلطان الزهراني", title: "شقة 3 غرف · الزهراء", closedOn: "2026-10-02", reason: "صك غير مطابق للمعلومات" },
  { id: "2026-1034", kind: "building", status: "approved", district: "salamah", price: 5200000, name: "خالد بامحرز", title: "عمارة سكنية · السلامة", closedOn: "2026-10-01" },
  { id: "2026-1033", kind: "apartment", status: "rejected", withdrawn: true, district: "rawdah", price: 470000, name: "ريان الحربي", title: "شقة غرفتين · الروضة", closedOn: "2026-09-30", reason: "منسحب" },
  { id: "2026-1032", kind: "villa", status: "approved", district: "mohammadiyah", price: 2750000, name: "عبير باخشوين", title: "فيلا 5 غرف · المحمدية", closedOn: "2026-09-28" },
  { id: "2026-1031", kind: "apartment", status: "approved", district: "naeem", price: 590000, name: "تركي الشمراني", title: "شقة 3 غرف · النعيم", closedOn: "2026-09-26" },
  { id: "2026-1030", kind: "apartment", status: "rejected", district: "shati", price: 720000, name: "نوف باعشن", title: "شقة 3 غرف · الشاطئ", closedOn: "2026-09-24", reason: "صور غير كافية أو غير واضحة" },
  { id: "2026-1029", kind: "land", status: "approved", district: "faisaliyah", price: 1300000, name: "ماجد اللحياني", title: "أرض 700 م² · الفيصلية", closedOn: "2026-09-22" },
  { id: "2026-1028", kind: "apartment", status: "rejected", withdrawn: true, district: "safa", price: 655000, name: "لينا بخاري", title: "شقة 3 غرف · الصفا", closedOn: "2026-09-20", reason: "منسحب" },
  { id: "2026-1027", kind: "villa", status: "approved", district: "obhur-north", price: 2900000, name: "بدر القحطاني", title: "فيلا 5 غرف · أبحر الشمالية", closedOn: "2026-09-18" },
  { id: "2026-1026", kind: "apartment", status: "approved", district: "rawdah", price: 505000, name: "دانة فلمبان", title: "شقة غرفتين · الروضة", closedOn: "2026-09-15" },
];

export const closedApprovals: Approval[] = CLOSED_SPEC.map((c, i) => ({
  id: c.id,
  kind: c.kind,
  typeLabelAr: c.kind === "apartment" ? "شقة" : c.kind === "villa" ? "فيلا" : c.kind === "land" ? "أرض" : "عمارة سكنية",
  titleAr: c.title,
  role: "owner" as const,
  submitterName: c.name,
  phoneMasked: "055XXXXXXX",
  purpose: "sell" as const,
  city: "جدة",
  districtSlug: c.district,
  relation: "المالك",
  askedPriceSar: c.price,
  photosCount: 3 + (i % 4),
  attachments: [],
  timing: "أي وقت",
  submittedAt: `2026-09-${String(10 + i).padStart(2, "0")}T12:00:00+03:00`,
  ageHours: 0,
  status: c.status,
  withdrawn: c.withdrawn,
  closedOn: c.closedOn,
  rejectReason: c.reason,
  checklist: checklistFor(c.kind, { owner: [true, true, true, true, true, true] }),
  log: [{ by: "سعود", text: c.status === "approved" ? "اعتماد ونشر" : c.withdrawn ? "المالك سحب الطلب" : `رفض الطلب · ${c.reason}`, at: `${c.closedOn}T12:00:00+03:00`, mode: c.id === "2026-1037" ? "manual" : "auto" }],
}));

/** Every submission (open first, then this month's closed). */
export const allApprovals: Approval[] = [...approvals, ...closedApprovals];

export function approvalById(id: string): Approval | undefined {
  return allApprovals.find((a) => a.id === id);
}
/** The queue the admin opens: new and awaiting photos, newest submission first. */
export function openApprovals(): Approval[] {
  return approvals.filter((a) => a.status === "new" || a.status === "awaiting-photos").sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}
