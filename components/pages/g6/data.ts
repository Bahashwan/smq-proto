// G6 page-level derivations over the fixtures (pure; no React). Pages never type a board number: every count,
// label and state below is computed from data/* and data/selectors.ts.
import {
  allApplications,
  allianceReports,
  analytics,
  applications,
  availableUnits,
  coverageBySector,
  districtBySlug,
  districts,
  marketers,
  memberCounts,
  offices,
  officeById,
  referrals,
  referralsForOffice,
  requests,
  unitDistrictSlug,
  type AllianceReport,
  type AllianceRequest,
  type Application,
  type ApplicationStatus,
  type District,
  type Office,
  type PctRow,
  type Referral,
  type Sector,
} from "@/data";
import { fmtDateLong } from "@/lib/format";

/** «+966 5X XXX 7710» → «05X XXX 7710» (the boards' local form) */
export function localPhone(masked: string): string {
  return masked.replace(/^\+966\s*/, "0");
}

/** «2026-09-14» → «سبتمبر 2026» */
export function monthYear(iso: string): string {
  return fmtDateLong(iso.slice(0, 10)).replace(/^\d+\s/, "");
}

/** A licence as the forms echo it: the first four digits, the rest masked («1200XXXXXX»). */
export function maskedLicence(licence: string): string {
  const digits = licence.replace(/\D/g, "");
  const head = (digits || licence).slice(0, 4);
  return head.padEnd(10, "X");
}

// ---------------------------------------------------------------------------
// /alliance · coverage, launch day, honeycomb
// ---------------------------------------------------------------------------

export interface SectorBlock {
  sector: Sector;
  offices: number;
  districts: { district: District; count: number }[];
}

/**
 * The coverage grid as the boards draw it: the first `perSector` districts of each sector in fixture order, with every
 * district that a member covers kept in (a covered district never drops out of the grid).
 */
export function coverageBlocks(perSector: number): SectorBlock[] {
  return coverageBySector().map((s) => {
    let room = Math.max(0, perSector - s.districts.filter((d) => d.count > 0).length);
    const picked = s.districts.filter((d) => {
      if (d.count > 0) return true;
      if (room > 0) {
        room--;
        return true;
      }
      return false;
    });
    return { sector: s.sector, offices: s.offices, districts: picked.map((d) => ({ district: d.district, count: d.count })) };
  });
}

/** Districts SMQ has available units in (the «نغطيه بأنفسنا» districts). */
export function smqDistricts(): Set<string> {
  return new Set(availableUnits().map((u) => unitDistrictSlug(u)));
}

/**
 * Launch day «مطلوب»: where SMQ buyers search today and SMQ has no unit — 30-day sessions above the city's mean per
 * district and no available SMQ unit in the district.
 */
export function launchRequired(): string[] {
  const s = analytics.districtSessions30d;
  const vals = districts.map((d) => s[d.slug] ?? 0);
  const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
  const own = smqDistricts();
  return districts.filter((d) => (s[d.slug] ?? 0) > mean && !own.has(d.slug)).map((d) => d.slug);
}

/**
 * Launch-day grid as Alliance-Launch-M draws it: north and centre with five cells each, then one merged row for the
 * three smaller sectors (two east, two west, one south), every cell empty.
 */
export function launchGroups(): { key: string; label: string; districts: District[] }[] {
  const of = (sector: Sector) => districts.filter((d) => d.sector === sector);
  return [
    { key: "north", label: "شمال جدة", districts: of("north").slice(0, 5) },
    { key: "central", label: "وسط جدة", districts: of("central").slice(0, 5) },
    { key: "rest", label: "شرق، غرب، جنوب", districts: [...of("east").slice(0, 2), ...of("west").slice(0, 2), ...of("south").slice(0, 1)] },
  ];
}

/** One hexagon per member in abjad order: gold = joined this month, ink-2 otherwise. */
export function honeycombTones(): ("gold" | "ink2")[] {
  return offices.map((o) => (o.joinedThisMonth ? "gold" : "ink2"));
}

export function allianceCounts() {
  const mc = memberCounts();
  return { members: mc.members, sectors: new Set(offices.map((o) => o.sector)).size, active: mc.active };
}

/** Imported Google-form applications («37 مكتباً سجّلت في نموذج قوقل سابقاً»). */
export function importedCount(): number {
  return allApplications.filter((a) => a.status === "imported").length;
}

/** The directory line «أبحر الشمالية · فلل، أراضي مطورة»: first covered district · specialties. */
export function directoryDistrict(o: Office): string {
  return districtBySlug(o.districts[0])?.ar ?? "";
}

// ---------------------------------------------------------------------------
// Application flow
// ---------------------------------------------------------------------------

/** The application the flow prefills and confirms (decision log: ALL-2026-0038 is مكتب م للعقارات). */
export const APPLY_ID = "ALL-2026-0038";
export function applyFixture(): Application {
  return applications.find((a) => a.id === APPLY_ID) ?? applications[0];
}
/** The designed rejection (ALL-2026-0031): its reason is reused when the presenter forces «rejected». */
export function designedRejection(): Application | undefined {
  return applications.find((a) => a.status === "rejected" && a.rejectReason);
}
export type StatusView = "review" | "verified" | "rejected";
export function statusView(s: ApplicationStatus): StatusView {
  if (s === "verified") return "verified";
  if (s === "rejected") return "rejected";
  return "review";
}

// ---------------------------------------------------------------------------
// Member pages
// ---------------------------------------------------------------------------

/** Requests sent to an office (its inbox), newest first. */
export function requestsForOffice(officeId: string): AllianceRequest[] {
  return requests.filter((r) => r.sentTo.some((s) => s.officeId === officeId) || r.memberOfficeId === officeId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Route params for /member/[token]/requests/[id] and /referrals/[id]. */
export function memberRequestParams(): { token: string; id: string }[] {
  return offices.flatMap((o) => requestsForOffice(o.id).map((r) => ({ token: o.id, id: r.id })));
}
export function memberReferralParams(): { token: string; id: string }[] {
  return offices.flatMap((o) => referralsForOffice(o.id).map((r) => ({ token: o.id, id: r.id })));
}

export function partyName(id: string): string {
  if (id === "SMQ") return "SMQ";
  return officeById(id)?.nameAr ?? id;
}
export function partyFull(id: string): string {
  if (id === "SMQ") return "SMQ العقارية";
  return officeById(id)?.fullName ?? id;
}
/** The other side of a record seen from `officeId` («مع SMQ», «مع مكتب ج»). */
export function counterpart(r: Referral, officeId: string): string {
  return r.requesterOfficeId === officeId ? partyName(r.offerOfficeId) : partyName(r.requesterOfficeId);
}
export function referralById(id: string): Referral | undefined {
  return referrals.find((r) => r.id === id);
}

/** Bars of the monthly report that turn gold («لا عرض يكفي»): a row named in one of the visible opportunities. */
export function goldRows(rows: PctRow[], report: AllianceReport, kind: "district" | "other"): Set<string> {
  const labels = report.opportunities.filter((o) => o.sessions >= 20).map((o) => o.labelAr);
  const out = new Set<string>();
  for (const r of rows) {
    if (r.key === "other") continue;
    const hit = kind === "district" ? labels.some((l) => l.split(" · ")[0] === r.labelAr) : labels.some((l) => l.includes(r.labelAr));
    if (hit) out.add(r.key);
  }
  return out;
}

/** The latest published monthly report (what members receive). */
export function latestPublished(): AllianceReport | undefined {
  return allianceReports.filter((r) => r.status === "published").sort((x, y) => (x.id < y.id ? 1 : -1))[0];
}

export function marketerParams(): { token: string }[] {
  return marketers.map((m) => ({ token: m.token }));
}
export function marketerSlugParams(): { name: string }[] {
  return marketers.map((m) => ({ name: m.slug }));
}
