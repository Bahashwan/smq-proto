// Projects: the published جاردن الروضة, the draft مشروع أبحر, and the automatic «وحدات المُلّاك» group
// (Admin-Projects-D, Admin-ProjectEditor-D, Project-D, Projects-D). Counts per project are computed by the selectors.
import type { Project } from "./types";

export const PROJECT_FEATURES = ["موقف خاص", "دخول ذكي", "سمارت هوم"];

export const projects: Project[] = [
  {
    id: "rwd-01",
    code: "RWD-01",
    slug: "garden-rawdah",
    nameAr: "جاردن الروضة",
    nameEn: "Garden Al Rawdah",
    districtSlug: "rawdah",
    status: "under-construction",
    statusAr: "قيد الإنشاء",
    deliveryLabel: { value: "الربع الثاني 2027", tbc: true },
    buildings: [
      { code: "RZ", nameAr: "روز", letter: "R" },
      { code: "YS", nameAr: "ياسمين", letter: "Y" },
    ],
    features: PROJECT_FEATURES,
    milestones: [
      { label: "الهيكل مكتمل", date: "2026/06", done: true, tbc: false },
      { label: "التشطيبات", date: "[للتأكيد]", done: false, tbc: true },
      { label: "التسليم", date: "2027/Q2", done: false, tbc: true },
    ],
    warranties: "tbc",
    insurance: "tbc",
    occupancy: "بعد التسليم",
    centre: { lat: 21.572, lng: 39.168 }, // حي الروضة centre (docs/data-model.md); «الموقع تقريبي [للتأكيد]»
    images: ["IMG-PRJ-ROWDAH-EXT", "IMG-PRJ-BLDG-ROSE-FACADE", "IMG-PRJ-BLDG-YASMIN-FACADE", "IMG-PRJ-ROWDAH-ENTRANCE", "IMG-PRJ-ROWDAH-LOBBY", "IMG-PRJ-ROWDAH-PARKING"],
    published: true,
    featured: true,
    descriptionAr:
      "عمارتان سكنيتان، روز وياسمين، في قلب حي الروضة. شقق من غرفتين إلى 3 غرف بين 80 و147 م²، وفيلتان روف بخمس غرف ومسطح 411 و419 م². تسليم متوقع في الربع الثاني من 2027.",
    descriptionDraftAr: "عمارتان سكنيتان، روز وياسمين، في قلب حي الروضة. شقق من غرفتين إلى 3 غرف بين 80 و147 م²، وفيلتان روف بخمس غرف ومسطح 411 و419 م².",
    descriptionEn: "Two residential buildings, Rose and Yasmin, in the heart of Al Rawdah. 2 and 3-bedroom apartments between 80 and 147 m², and two 5-bedroom roof villas of 411 and 419 m². Expected delivery Q2 2027.",
    tbcFields: ["التسليم المتوقع", "مرحلة التشطيبات", "الضمانات", "نوع التأمين"],
    log: [
      { by: "سعود", text: "عدّل الوصف", at: "2026-10-10T10:12" },
      { by: "استيراد Excel", text: "حدّث 10 نماذج", at: "2026-10-01" },
      { by: "نورة", text: "أضافت صورتين", at: "2026-09-28" },
    ],
    order: 1,
  },
  {
    id: "ind",
    code: "IND",
    slug: "owner-units",
    nameAr: "وحدات المُلّاك",
    nameEn: "Owner units",
    districtSlug: "rawdah",
    status: "ready",
    statusAr: "تجميع تلقائي",
    deliveryLabel: { value: "", tbc: false },
    buildings: [],
    features: [],
    milestones: [],
    warranties: "tbc",
    insurance: "tbc",
    occupancy: "صادرة",
    centre: { lat: 21.593, lng: 39.202 }, // الصفا (the sample owner unit's district)
    images: [],
    published: true,
    featured: false,
    autoGroup: true,
    descriptionAr: "تجميع تلقائي للوحدات المعتمدة من «أضف عقارك» التي لا تنتمي لمشروع · لا يظهر كمشروع على الموقع",
    adminNoteAr: "تجميع تلقائي للوحدات المعتمدة من «أضف عقارك» التي لا تنتمي لمشروع · 0 حالياً · لا يظهر كمشروع على الموقع",
    order: 3,
  },
  {
    id: "abh-01",
    code: "ABH-01",
    slug: "obhur",
    nameAr: "مشروع أبحر",
    nameEn: "Obhur project",
    districtSlug: "obhur-north",
    status: "draft",
    statusAr: "مسودة",
    deliveryLabel: { value: "", tbc: true },
    buildings: [{ code: "RZ", nameAr: "عمارة واحدة", letter: "A" }],
    features: [],
    milestones: [],
    warranties: "tbc",
    insurance: "tbc",
    occupancy: "بعد التسليم",
    centre: { lat: 21.78, lng: 39.12 },
    images: [],
    published: false,
    featured: false,
    descriptionAr: "الأسعار والنماذج تُعلن عند الإطلاق [للتأكيد]. اترك جوالك ونرسل لك الأسعار أول ما تُنشر. بلا تسجيل حساب، ورسالة واحدة فقط.",
    adminNoteAr: "عمارة واحدة · 0 نماذج · أُنشئ لأن 970 بحثاً في الشهر استهدفت الحي بلا نتيجة · لا يظهر على الموقع حتى يُنشر",
    order: 2,
  },
];

export function projectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
/** Projects that appear on the site (published, not the automatic owner group), in display order. */
export function publicProjects(): Project[] {
  return projects.filter((p) => p.published && !p.autoGroup).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}
/** Every project the admin lists, in display order (published, auto group, drafts). */
export function adminProjects(): Project[] {
  return [...projects].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}
