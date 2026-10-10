// The 12 alliance members in abjad order (Admin-AllianceMembers-D, Admin-AllianceMember-D, Alliance-D).
// Ledger: gave = offersGiven + requestsGiven («أعطى»), received = requestsReceived («استقبل»); the net is computed
// by ledgerNet() in selectors. مكتب ل is suspended («بلا رد 30 يوماً»): it keeps its records but leaves the directory,
// the coverage counts and the routing. Office names are the design's placeholders; avgReplyMinutes 0 = «بلا رد».
import type { Office, OfficeLedger, Sector } from "./types";

export const ABJAD = ["أ", "ب", "ج", "د", "هـ", "و", "ز", "ح", "ط", "ي", "ك", "ل", "م", "ن", "س", "ع", "ف", "ص", "ق", "ر", "ش", "ت", "ث", "خ", "ذ", "ض", "ظ", "غ"];

const LAUNCH = "2026-10-01"; // «منذ أكتوبر 2026»

function office(n: number, sector: Sector, districts: string[], specialties: string[], expiresOn: string, ledger: OfficeLedger, extra: Partial<Office> = {}): Office {
  const letter = ABJAD[n - 1];
  return {
    id: `office-${String(n).padStart(2, "0")}`,
    letter,
    nameAr: `مكتب ${letter}`,
    fullName: `مكتب ${letter} للعقارات`,
    sector,
    districts,
    specialties,
    licence: { number: "1200XXXXXX", verifiedOn: LAUNCH, verifiedBy: "نورة", expiresOn },
    hours: "single",
    applicantRole: "مالك المكتب العقاري",
    memberSince: LAUNCH,
    status: "active",
    inDirectory: true,
    charterVersion: "1.0",
    charterAcceptedOn: LAUNCH,
    joinedThisMonth: false,
    ledger,
    ...extra,
  };
}

export const offices: Office[] = [
  office(1, "north", ["obhur-north", "shati", "mohammadiyah"], ["فلل", "عماير سكنية", "أراضي مطورة"], "2027-06-30", { offersGiven: 7, requestsGiven: 3, dealsClosed: 1, requestsReceived: 9, replied: 8, avgReplyMinutes: 100 }, {
    ownerName: "عبدالعزيز",
    phoneMasked: "+966 5X XXX 7710",
    mapsLink: "https://maps.app.goo.gl/",
    notes: [
      { by: "نورة", at: "2026-10-12", text: "«رد سريع، عروضهم موثّقة فعلاً. مؤسِّس مرشّح.»" },
      { by: "سعود", at: "2026-10-18", text: "«نزاع REF-0098 مع مكتب ج: سمعنا الطرفين، ننتظر رد أ.»" },
    ],
  }),
  office(2, "central", ["rawdah"], ["شقق", "عماير سكنية"], "2027-02-14", { offersGiven: 3, requestsGiven: 1, dealsClosed: 0, requestsReceived: 12, replied: 10, avgReplyMinutes: 185 }, { hours: "morning" }),
  office(3, "north", ["shati"], ["شقق", "مكاتب"], "2027-09-01", { offersGiven: 4, requestsGiven: 2, dealsClosed: 0, requestsReceived: 6, replied: 6, avgReplyMinutes: 140 }, { joinedThisMonth: true }),
  office(4, "north", ["mohammadiyah"], ["فلل", "منتجعات وشاليهات"], "2026-11-03", { offersGiven: 2, requestsGiven: 1, dealsClosed: 0, requestsReceived: 5, replied: 4, avgReplyMinutes: 290 }, { licenceReminded: true, hours: "evening" }),
  office(5, "central", ["safa"], ["شقق", "عماير تجارية"], "2027-04-22", { offersGiven: 4, requestsGiven: 1, dealsClosed: 1, requestsReceived: 8, replied: 7, avgReplyMinutes: 115 }),
  office(6, "central", ["naeem"], ["عماير سكنية", "أراضي خام"], "2027-01-10", { offersGiven: 1, requestsGiven: 1, dealsClosed: 0, requestsReceived: 4, replied: 3, avgReplyMinutes: 370 }, { hours: "other", joinedThisMonth: true }),
  office(7, "east", ["samer"], ["شقق", "فلل"], "2027-08-08", { offersGiven: 2, requestsGiven: 1, dealsClosed: 0, requestsReceived: 3, replied: 3, avgReplyMinutes: 160 }),
  office(8, "west", ["hamra"], ["مكاتب", "عماير تجارية"], "2027-05-19", { offersGiven: 6, requestsGiven: 2, dealsClosed: 0, requestsReceived: 2, replied: 2, avgReplyMinutes: 70 }, { applicantRole: "مدير" }),
  office(9, "south", ["faisaliyah"], ["شقق", "مستودعات"], "2027-03-30", { offersGiven: 3, requestsGiven: 1, dealsClosed: 0, requestsReceived: 3, replied: 3, avgReplyMinutes: 72 }, { phoneMasked: "+966 5X XXX 2246", joinedThisMonth: true }),
  office(10, "central", ["rawdah"], ["أراضي مطورة"], "2027-07-07", { offersGiven: 1, requestsGiven: 0, dealsClosed: 0, requestsReceived: 7, replied: 5, avgReplyMinutes: 570 }, { hours: "evening" }),
  office(11, "north", ["obhur-north"], ["فلل"], "2027-10-12", { offersGiven: 5, requestsGiven: 2, dealsClosed: 1, requestsReceived: 6, replied: 6, avgReplyMinutes: 120 }, { joinedThisMonth: true }),
  office(12, "north", ["mohammadiyah"], ["شقق", "صناعية"], "2027-02-28", { offersGiven: 1, requestsGiven: 0, dealsClosed: 0, requestsReceived: 8, replied: 0, avgReplyMinutes: 0 }, {
    status: "suspended",
    suspendedOn: "2026-10-05",
    suspendedReason: "بلا رد 30 يوماً",
    inDirectory: false,
    joinedThisMonth: false,
  }),
];

export function officeById(id: string): Office | undefined {
  return offices.find((o) => o.id === id);
}
export function officeByLetter(letter: string): Office | undefined {
  return offices.find((o) => o.letter === letter);
}
/** Members that count: verified and not suspended. */
export function activeOffices(): Office[] {
  return offices.filter((o) => o.status === "active");
}
/** «مكتب أ» for an office id; «SMQ» stays «SMQ». */
export function officeNameAr(id: string): string {
  if (id === "SMQ") return "SMQ";
  return officeById(id)?.nameAr ?? id;
}
export const HOURS_LABELS: Record<Office["hours"], string> = { single: "دوام واحد", morning: "صباحي", evening: "مسائي", other: "أخرى" };
