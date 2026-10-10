"use client";
// G9 · the alliance room's in-memory actions, shared by the overview (desktop and phone), the requests page and the
// radar so a decision taken on one screen shows on the others. Nothing is sent anywhere: the store records it and a
// toast confirms it.
import { useRouter } from "next/navigation";
import { applicationById } from "@/data/applications";
import { referrals } from "@/data/referrals";
import { requestById, shortRequestId } from "@/data/requests";
import { effectiveRequest, nextReferralNumber, nextRequestNumber, NOW, TODAY, type RadarRow } from "@/data/selectors";
import type { Referral } from "@/data/types";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import { radarSegment, toOffices } from "./room";
import { officeShort } from "./util";

export function useRoomActions() {
  const router = useRouter();
  const toast = useStore((s) => s.toast);
  const setApplication = useStore((s) => s.setApplication);
  const setRequest = useStore((s) => s.setRequest);
  const addReferral = useStore((s) => s.addReferral);
  const addRequest = useStore((s) => s.addRequest);
  const patch = useStore((s) => s.patch);
  const reqOverrides = useStore((s) => s.requests);
  const createdReferrals = useStore((s) => s.createdReferrals);
  const createdRequests = useStore((s) => s.createdRequests);

  /** «اعتمد كعضو موثّق» */
  const approveApplication = (id: string) => {
    const a = applicationById(id);
    if (!a) return;
    setApplication(id, "verified");
    toast(`اعتُمد ${a.officeName} كعضو موثّق · ${a.id}`, { action: { label: "الأعضاء", href: "/admin/alliance/members" } });
  };

  /** «اعرض على المشتري أولاً» — recorded on the request; the request stays open. */
  const showToBuyer = (reqId: string, officeId: string) => {
    patch("request-shown", reqId, { officeId, at: NOW });
    toast(`عُرض عرض ${officeShort(officeId)} على المشتري · ${shortRequestId(reqId)}`);
  };

  /** «ارفض العرض مع سبب» — the reason is recorded and the request stays open. */
  const rejectOffer = (reqId: string, officeId: string, reason: string) => {
    patch("request-rejected", `${reqId}:${officeId}`, { reason, at: NOW });
    toast(`رُفض عرض ${officeShort(officeId)} على ${shortRequestId(reqId)} · ${reason}`);
  };

  /** «أنشئ سجل إحالة»: a REF with number, date and stage «تعارف»; the request moves to «تعارف» and the referrals
   *  tab opens on the new record. REQ-2026-0412 + مكتب ط gives REF-2026-0117 (the fixture's record). */
  const createReferral = (reqId: string, officeId: string) => {
    const base = requestById(reqId);
    if (!base) return;
    const req = effectiveRequest(base, reqOverrides);
    const offer = req.offers.find((o) => o.officeId === officeId);
    if (!offer) return;
    const known = referrals.find((r) => r.requestId === req.id && r.offerOfficeId === officeId);
    const id = known?.id ?? nextReferralNumber(createdReferrals.map((r) => r.id));
    const rec: Referral = {
      ...(known ?? {
        id,
        requestId: req.id,
        requesterOfficeId: req.source === "member" && req.memberOfficeId ? req.memberOfficeId : "SMQ",
        offerOfficeId: officeId,
        districtSlug: req.districtSlug,
        summary: req.summaryAr,
        offerSummary: [offer.type, offer.areaM2 ? `${offer.areaM2} م²` : null, offer.priceSar ? `${offer.priceSar.toLocaleString("en-US")} ريال` : null].filter(Boolean).join(" · "),
        offerAreaM2: offer.areaM2,
        brokered: offer.brokered,
        valueSar: offer.priceSar ?? 0,
        split: "50 / 50",
        splitTbc: true,
        protectionDays: 90,
        createdBy: "فريق SMQ · سعود",
        offerSentAt: offer.repliedAt,
        charterVersion: "1.0",
      }),
      id,
      stage: "intro",
      stageLabelAr: "تعارف",
      stageNote: `التعارف ${fmtDate(TODAY)}`,
      introducedOn: TODAY,
      createdAt: NOW,
    };
    addReferral(rec);
    setRequest(req.id, { stage: "intro", referralId: id });
    toast(`أُنشئ ${id} · ${officeShort(officeId)} · مرحلة «تعارف»`);
    router.push(`/admin/alliance/referrals?ref=${id}`);
  };

  /** «أرسل للمكاتب» from the radar: a request made from the visitors' searches (no personal data), sent to the
   *  members covering the district. */
  const sendRadarRequest = (row: Pick<RadarRow, "district" | "detail" | "memberIds">) => {
    const id = nextRequestNumber(createdRequests.map((r) => r.id));
    addRequest({ id, districtSlug: row.district.slug, summaryAr: radarSegment(row), createdAt: NOW });
    toast(`أُنشئ ${shortRequestId(id)} وأُرسل ${toOffices(row.memberIds)} · ${radarSegment(row)}`, { action: { label: "الطلبات والمطابقات", href: "/admin/alliance/requests" } });
    return id;
  };

  /** Manual mode: «أرسل على واتساب» prepares the message for one office; nothing leaves the prototype. */
  const sendManual = (reqId: string, officeId: string) => {
    patch("request-manual", `${reqId}:${officeId}`, { at: NOW });
    toast(`أُرسل يدوياً ${toOffices([officeId])} · ${shortRequestId(reqId)}`);
  };

  return { approveApplication, showToBuyer, rejectOffer, createReferral, sendRadarRequest, sendManual, toast, patch };
}
