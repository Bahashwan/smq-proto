// G9 · the alliance room's derived lines, composed from the fixtures (never typed from the boards): request titles,
// the «آخر الأحداث» feed, the radar's opportunity lines, the decisions waiting for the manager.
import { allianceReports, analytics } from "@/data/analytics";
import { districtAr } from "@/data/districts";
import { officeById } from "@/data/offices";
import { applications } from "@/data/applications";
import { requests, shortRequestId, SOURCE_LABELS } from "@/data/requests";
import { referrals } from "@/data/referrals";
import { settings } from "@/data/settings";
import { agoLabel, effectiveRequest, NOW, protectionDaysLeft, radarRanking, reportSlices, type RadarRow, type RequestOverride } from "@/data/selectors";
import type { AllianceRequest, ApplicationStatus, Referral } from "@/data/types";
import { clock, daysAgo, officeShort } from "./util";

/** «REQ-0412 · الفيصلية · شقة 4 غرف» (short) or «REQ-2026-0412 · …» (long). */
export function reqTitle(r: Pick<AllianceRequest, "id" | "districtSlug" | "type" | "typeLabelAr">, long = false): string {
  return `${long ? r.id : shortRequestId(r.id)} · ${districtAr(r.districtSlug)} · ${r.typeLabelAr ?? r.type}`;
}
/** «زائر بلا نتائج» · «فريق SMQ» · «مكتب عضو · مكتب أ» */
export function sourceLine(r: Pick<AllianceRequest, "source" | "memberOfficeId">): string {
  return r.source === "member" && r.memberOfficeId ? `${SOURCE_LABELS.member} · ${officeShort(r.memberOfficeId)}` : SOURCE_LABELS[r.source];
}
/** The verb by the person's name in the event feed («نورة أنشأت» · «سعود أنشأ»). */
const FEMININE = new Set(["نورة", "سارة", "هند", "لمى", "ريم"]);
export function createdByName(createdBy: string): string {
  return createdBy.split(" · ").pop() ?? createdBy;
}
function madeVerb(name: string): string {
  return FEMININE.has(name) ? "أنشأت" : "أنشأ";
}
/** «لمكتبَي أ وك» · «لمكتب د» · «لـ أ، ك، ي» */
export function toOffices(ids: string[]): string {
  const ls = ids.map((id) => officeById(id)?.letter ?? id);
  if (ls.length === 1) return `لمكتب ${ls[0]}`;
  if (ls.length === 2) return `لمكتبَي ${ls[0]} و${ls[1]}`;
  return `لـ ${ls.join("، ")}`;
}

/** Event time as the feed writes it: today → «10:42», yesterday → «أمس», older → «قبل 3 أيام». */
export function feedTime(iso: string, now: string = NOW): string {
  const d = daysAgo(iso, now);
  if (d <= 0) return clock(iso);
  if (d === 1) return "أمس";
  return agoLabel(iso, now);
}

export interface FeedEvent {
  at: string;
  text: string;
}
/** «آخر الأحداث»: offers received, automatic / manual sends, referrals created, applications received, plus what the
 *  store created in this session. Newest first. */
export function allianceEvents(opts: { createdReferrals?: Referral[]; createdRequests?: { id: string; summaryAr: string; createdAt: string }[]; requestOverrides?: Record<string, RequestOverride>; applicationOverrides?: Record<string, ApplicationStatus> } = {}): FeedEvent[] {
  const out: FeedEvent[] = [];
  for (const base of requests) {
    const r = effectiveRequest(base, opts.requestOverrides);
    for (const o of r.offers) out.push({ at: o.repliedAt, text: `${officeShort(o.officeId)} أرسل عرضاً على ${shortRequestId(r.id)}` });
    const groups = new Map<string, { ids: string[]; mode: "auto" | "manual" }>();
    for (const s of r.sentTo) {
      const key = `${s.sentAt}|${s.mode}`;
      const g = groups.get(key) ?? { ids: [], mode: s.mode };
      g.ids.push(s.officeId);
      groups.set(key, g);
    }
    for (const [key, g] of groups) out.push({ at: key.split("|")[0], text: `أُرسل ${shortRequestId(r.id)} ${toOffices(g.ids)} ${g.mode === "auto" ? "تلقائياً" : "يدوياً"}` });
  }
  const seen = new Set<string>();
  for (const ref of [...(opts.createdReferrals ?? []), ...referrals]) {
    if (seen.has(ref.id)) continue;
    seen.add(ref.id);
    if (!ref.createdAt) continue;
    const name = createdByName(ref.createdBy);
    out.push({ at: ref.createdAt, text: `${name} ${madeVerb(name)} ${ref.id}` });
  }
  for (const a of applications) out.push({ at: a.submittedAt, text: `وصل طلب انضمام ${a.id}` });
  for (const c of opts.createdRequests ?? []) out.push({ at: c.createdAt, text: `أُنشئ ${shortRequestId(c.id)} · ${c.summaryAr}` });
  return out.filter((e) => e.at <= NOW || (opts.createdRequests ?? []).some((c) => c.createdAt === e.at)).sort((a, b) => (a.at < b.at ? 1 : -1));
}

/** The latest published monthly report (its opportunity slices carry the radar's segment labels). */
export const latestPublishedReport = allianceReports.find((r) => r.status === "published");
export const draftReport = allianceReports.find((r) => r.status === "draft");

/** «أبحر الشمالية · فلل 1.5 إلى 2.5M» for a radar row: the published report's slice for the district, else the
 *  district's top demand. */
export function radarSegment(row: Pick<RadarRow, "district" | "detail">): string {
  const slice = latestPublishedReport?.opportunities.find((o) => o.labelAr.startsWith(row.district.ar));
  if (slice) return slice.labelAr;
  return row.detail?.topDemandAr ? `${row.district.ar} · ${row.detail.topDemandAr}` : row.district.ar;
}

/** Opportunity rows for the overview (districts without SMQ units, by the radar formula). */
export function radarLines(n = 3): RadarRow[] {
  return radarRanking("30d").filter((r) => r.action !== "self").slice(0, n);
}

/** The minutes of yesterday's WhatsApp Business outage, read from the settings note («انقطع الاتصال قبل 40 دقيقة»). */
export const OUTAGE_MINUTES = Number((settings.whatsappBusiness.disconnectedNoteAr ?? "").match(/(\d+) دقيقة/)?.[1] ?? 0);

/** Days of protection left on a referral (shown on the dispute card). */
export function protectionLeft(ref: Referral): number {
  return protectionDaysLeft(ref);
}

/** Reply numbers of the alliance (30 days). */
export const RESPONSE = analytics.allianceResponse;

/** Report slices hidden from members (under 20 sessions) in the draft. */
export function hiddenSlices(): number {
  return draftReport ? reportSlices(draftReport.opportunities).hidden.length : 0;
}
