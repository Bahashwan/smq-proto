// Alliance membership applications (Admin-AllianceApplications-D, AllianceApply-*): the five designed applications
// plus the 37 Google-form rows imported with status «مستورد». ALL-2026-0038 is مكتب م (decision log: the board's
// مكتب أ is already member office-01). Letters follow the abjad after the members.
import type { Application, Sector } from "./types";
import { ABJAD } from "./offices";

const base = {
  licence: "1200XXXXXX",
  hours: "single" as const,
  notes: "",
  directoryConsent: true,
  charterConsent: true,
  charterVersion: "1.0",
};

export const applications: Application[] = [
  {
    ...base,
    id: "ALL-2026-0038",
    officeName: "مكتب م للعقارات",
    applicantName: "عبدالعزيز",
    applicantRole: "مالك المكتب العقاري",
    phoneMasked: "+966 5X XXX 7710",
    districtSlug: "obhur-north",
    sectors: ["north"],
    districts: ["obhur-north", "shati", "mohammadiyah"],
    specialties: ["فلل", "عماير سكنية", "أراضي مطورة"],
    offersDirect: 6,
    offersBrokered: 4,
    requestsElsewhere: ["rawdah", "safa"],
    want: "طلبات مشترين جادّين في أبحر الشمالية والشاطئ، وشريك موثوق للطلبات التي تخرج عن نطاقنا.",
    add: "10 عروض فلل وأراضٍ في شمال جدة، 4 منها بعقود وساطة موثّقة، ورد خلال ساعة في وقت الدوام.",
    wantSummary: "طلبات جادّة في أبحر والشاطئ، وشريك للطلبات خارج نطاقهم",
    addSummary: "10 عروض شمال جدة، رد خلال ساعة",
    mapsLink: "https://maps.app.goo.gl/",
    status: "review",
    // The review form's prefilled licence check (the admin has filled it, not yet approved).
    verification: { date: "2026-10-12", expiry: "2027-06-30", nameAtRega: "مكتب م للعقارات", by: "نورة" },
    submittedAt: "2026-10-09T11:20:00+03:00",
  },
  {
    ...base,
    id: "ALL-2026-0037",
    officeName: "مكتب ن للعقارات",
    applicantName: "ماجد",
    applicantRole: "مدير",
    phoneMasked: "+966 5X XXX 3182",
    districtSlug: "safa",
    sectors: ["central"],
    districts: ["safa", "nuzhah"],
    specialties: ["شقق"],
    offersDirect: 3,
    offersBrokered: 1,
    requestsElsewhere: [],
    want: "طلبات شقق في الصفا والنزهة.",
    add: "4 عروض شقق جاهزة للسكن.",
    status: "review",
    submittedAt: "2026-10-08T14:05:00+03:00",
  },
  {
    ...base,
    id: "ALL-2026-0036",
    officeName: "مكتب ع للعقارات",
    applicantName: "تركي",
    applicantRole: "موظف",
    phoneMasked: "+966 5X XXX 9047",
    districtSlug: "samer",
    sectors: ["east"],
    districts: ["samer", "harazat", "rehab", "ajaweed"],
    specialties: ["شقق", "فلل"],
    offersDirect: 0,
    offersBrokered: 0,
    requestsElsewhere: ["rawdah"],
    want: "طلبات في شرق جدة.",
    add: "تغطية 4 أحياء في الشرق.",
    status: "missing",
    missingNote: "بيانات ناقصة: موقع المكتب",
    submittedAt: "2026-10-07T10:30:00+03:00",
  },
  {
    ...base,
    id: "ALL-2026-0035",
    officeName: "مكتب ق للعقارات",
    applicantName: "بندر",
    applicantRole: "مالك المكتب العقاري",
    phoneMasked: "+966 5X XXX 5520",
    districtSlug: "hamra",
    sectors: ["west"],
    districts: ["hamra"],
    specialties: ["مكاتب", "عماير تجارية"],
    offersDirect: 8,
    offersBrokered: 4,
    requestsElsewhere: ["rawdah", "shati"],
    want: "طلبات تجارية في الحمراء.",
    add: "12 عرضاً تجارياً بعقود موثّقة.",
    status: "review",
    submittedAt: "2026-10-06T16:40:00+03:00",
  },
  {
    ...base,
    id: "ALL-2026-0031",
    officeName: "مكتب س للعقارات",
    applicantName: "ياسر",
    applicantRole: "مدير",
    phoneMasked: "+966 5X XXX 6613",
    districtSlug: "naeem",
    sectors: ["central"],
    districts: ["naeem", "salamah"],
    specialties: ["شقق", "عماير سكنية"],
    offersDirect: 2,
    offersBrokered: 0,
    requestsElsewhere: [],
    want: "طلبات شقق في النعيم.",
    add: "عرضان من الملاك مباشرة.",
    status: "rejected",
    rejectReason: "رقم رخصة فال المدخل لا يطابق سجل الهيئة لاسم المكتب. تأكد من الرقم وأعد الإرسال، أو أرسل صورة الرخصة على واتساب.",
    verification: { date: "2026-10-09", expiry: "", nameAtRega: "", by: "فريق التحالف" },
    submittedAt: "2026-10-04T12:15:00+03:00",
  },
];

/** The 37 Google-form rows: later abjad letters, then double letters, status «مستورد», no verification, no charter consent. */
const IMPORT_DISTRICTS = ["shati", "rawdah", "safa", "obhur-north", "naeem", "mohammadiyah", "hamra", "samer", "faisaliyah", "nahdah", "zahra", "salamah", "harazat", "balad", "andalus"];
const SECTOR_OF: Record<string, Sector> = {
  shati: "north", rawdah: "central", safa: "central", "obhur-north": "north", naeem: "central", mohammadiyah: "north", hamra: "west", samer: "east",
  faisaliyah: "south", nahdah: "north", zahra: "central", salamah: "central", harazat: "east", balad: "west", andalus: "west",
};
const IMPORT_SPECIALTIES = [["شقق"], ["فلل"], ["أراضي مطورة"], ["شقق", "عماير سكنية"], ["مكاتب"], ["فلل", "أراضي خام"], ["عماير تجارية"]];
const IMPORT_ROLES = ["مالك المكتب العقاري", "مدير", "موظف"];

function importedLetter(i: number): string {
  const used = 16; // أ…ل members (12) + م ن ع ق (4); س is index 14 and already used by ALL-2026-0031
  const single = ABJAD.slice(used).filter((l) => l !== "س"); // ف ص ر ش ت ث خ ذ ض ظ غ (11)
  if (i < single.length) return single[i];
  const j = i - single.length; // double letters: أأ أب أج …
  return `أ${ABJAD[j]}`;
}

export const importedApplications: Application[] = Array.from({ length: 37 }, (_, i) => {
  const n = i + 1;
  const district = IMPORT_DISTRICTS[i % IMPORT_DISTRICTS.length];
  const day = 1 + ((i * 7) % 28);
  return {
    id: `ALL-G-${String(n).padStart(3, "0")}`,
    officeName: `مكتب ${importedLetter(i)} للعقارات`,
    licence: "1200XXXXXX",
    applicantName: "",
    applicantRole: IMPORT_ROLES[i % IMPORT_ROLES.length],
    phoneMasked: `+966 5X XXX ${String(1000 + ((i * 937) % 9000)).padStart(4, "0")}`,
    districtSlug: district,
    sectors: [SECTOR_OF[district]],
    districts: [district],
    specialties: IMPORT_SPECIALTIES[i % IMPORT_SPECIALTIES.length],
    hours: "single",
    offersDirect: (i * 3) % 7,
    offersBrokered: (i * 2) % 4,
    requestsElsewhere: [],
    want: "",
    add: "",
    notes: "مستورد من نموذج قوقل",
    directoryConsent: false,
    charterConsent: false,
    status: "imported",
    submittedAt: `2026-09-${String(day).padStart(2, "0")}T10:00:00+03:00`,
  };
});

/** Every application the admin lists: the designed five first, then the imported rows. */
export const allApplications: Application[] = [...applications, ...importedApplications];

export function applicationById(id: string): Application | undefined {
  return allApplications.find((a) => a.id === id.toUpperCase());
}
/** «جديدة» (review) + «نواقص» (missing): what waits for the team. */
export function pendingApplications(): Application[] {
  return applications.filter((a) => a.status === "review" || a.status === "missing");
}
export const APPLICATION_STATUS_LABELS: Record<Application["status"], string> = {
  review: "قيد المراجعة",
  missing: "نواقص",
  verified: "موثّق",
  rejected: "مرفوض",
  imported: "مستورد",
};
/** The admin's list chip: «تحقق الرخصة» for review, «نواقص», «مرفوض», «مستورد». */
export const APPLICATION_LIST_LABELS: Record<Application["status"], string> = {
  review: "تحقق الرخصة",
  missing: "نواقص",
  verified: "موثّق",
  rejected: "مرفوض",
  imported: "مستورد",
};
