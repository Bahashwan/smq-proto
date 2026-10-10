"use client";
// /member/[token] · Member-Ledger-M: the office, its ledger (أعطى · استقبل, net), the open requests in its districts,
// its referral records. office-01 (مكتب أ) as designed; office-09 (مكتب ط) ends the alliance tour.
import Link from "next/link";
import { activeOffices, districtAr, effectiveReferralStage, expiresInLabel, ledgerNet, officeById, protectionUntil, referralsForOffice, replyLabel, whenLabel, type Referral } from "@/data";
import { useStore } from "@/lib/store";
import { cx, fmtDate, fmtNum, waLink } from "@/lib/format";
import { PhoneColumn } from "@/components/ui";
import { AlliancePill, FalBadge, LedgerBar, StagePill } from "@/components/alliance";
import { HeaderLink, MemberHeader } from "../chrome";
import { counterpart, monthYear } from "../data";
import { useOpenRequests } from "./hooks";

function budget(min?: number, max?: number): string {
  if (min != null && max != null) return `${fmtNum(min)} إلى ${fmtNum(max)}`;
  if (max != null) return `حتى ${fmtNum(max)}`;
  return min != null ? `من ${fmtNum(min)}` : "";
}

function referralLine(r: Referral, officeId: string, stage: Referral["stage"]): string {
  const type = r.offerSummary.split(" · ")[0];
  const value = fmtNum(r.finalValueSar ?? r.valueSar);
  const tail =
    stage === "viewing"
      ? (r.stageLabelAr ?? "معاينة").replace(" · ", " ")
      : stage === "transfer"
        ? `أُفرغت ${r.closedOn ? fmtDate(r.closedOn) : ""}`.trim()
        : stage === "failed"
          ? "لم تتم"
          : `الحماية حتى ${fmtDate(protectionUntil(r))}`;
  return `${districtAr(r.districtSlug)} · ${type} ${value} · مع ${counterpart(r, officeId)} · ${tail}`;
}

export function MemberLedger({ officeId }: { officeId: string }) {
  const office = officeById(officeId);
  const stages = useStore((s) => s.referralStages);
  const created = useStore((s) => s.createdReferrals);
  const open = useOpenRequests(officeId);
  if (!office) return null;
  const net = ledgerNet(office);
  const l = office.ledger;
  const slowest = Math.max(...activeOffices().map((o) => o.ledger.avgReplyMinutes), 1);
  const records = [...created.filter((r) => r.requesterOfficeId === officeId || r.offerOfficeId === officeId), ...referralsForOffice(officeId)].filter((r, i, all) => all.findIndex((x) => x.id === r.id) === i);
  const openSorted = [...open].sort((a, b) => {
    const sa = a.sentTo.find((s) => s.officeId === officeId)?.sentAt ?? a.createdAt;
    const sb = b.sentTo.find((s) => s.officeId === officeId)?.sentAt ?? b.createdAt;
    return sa < sb ? 1 : -1;
  });
  const suspended = office.status === "suspended";

  return (
    <PhoneColumn className="bg-cream">
      <div className="min-h-dvh bg-cream text-ink">
        <MemberHeader subtitle="صفحة عضو · بلا دخول" action={<HeaderLink href={`/member/${officeId}/report`}>تقرير الشهر</HeaderLink>} />
        <main className="flex flex-col gap-4.5 px-4 pt-5 pb-6">
          <section className="flex items-center gap-3">
            <span className="flex h-13 w-13 shrink-0 items-center justify-center bg-ink text-[20px] font-extrabold text-gold hex-flat">{office.letter}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <h1 className="text-[20px] font-extrabold">{office.fullName}</h1>
              <span className="flex items-center gap-2 text-caption font-normal text-muted">
                <FalBadge suspended={suspended} className="shrink-0" />
                <span className="min-w-0">{suspended ? `موقوف منذ ${office.suspendedOn ? fmtDate(office.suspendedOn) : ""} · ${office.suspendedReason ?? ""}` : `سارية حتى ${fmtDate(office.licence.expiresOn)} · عضو منذ ${monthYear(office.memberSince)}`}</span>
              </span>
              <span className="text-caption font-normal leading-relaxed text-muted">
                يغطي: {office.districts.map(districtAr).join("، ")} · {office.specialties.join("، ")}
              </span>
            </div>
          </section>

          <LedgerBar
            given={net.gave}
            received={net.received}
            header={{ title: "الميزان · منذ الانضمام", subtitle: "أعطى مقابل استقبل" }}
            divider
            rows={{
              given: [
                { label: "عروض قدّمها", value: l.offersGiven },
                { label: "طلبات أرسلها", value: l.requestsGiven },
                { label: "صفقات أُغلقت", value: l.dealsClosed },
              ],
              received: [
                { label: "طلبات وُجّهت له", value: l.requestsReceived },
                { label: "ردّ عليها", value: l.replied },
                { label: "متوسط الرد", value: l.avgReplyMinutes, display: replyLabel(l.avgReplyMinutes), ratio: l.avgReplyMinutes / slowest },
              ],
            }}
            note="الميزان يرتّب من يستقبل الطلبات أولاً حين يغطي الحي أكثر من مكتب. الرد السريع و«لا يوجد» الصريح يُحسبان لك؛ الصمت يُحسب عليك."
          />

          <section className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[18px] font-extrabold">طلبات مفتوحة في أحيائك</h2>
              <span className="text-caption text-muted tnum">{openSorted.length}</span>
            </div>
            {openSorted.length === 0 && <p className="text-[12px] text-muted">لا طلبات مفتوحة في أحيائك الآن.</p>}
            {openSorted.map((r, i) => {
              const sentAt = r.sentTo.find((s) => s.officeId === officeId)?.sentAt ?? r.createdAt;
              return (
                <Link key={r.id} href={`/member/${officeId}/requests/${r.id}`} className={cx("relative flex items-center justify-between gap-2.5 bg-paper px-3 py-2.5 text-ink no-underline hover:bg-sand", i === 0 && "ps-4")} style={{ border: "1.5px solid var(--smq-ink)" }}>
                  {i === 0 && <span aria-hidden className="absolute -inset-y-[1.5px] -start-[1.5px] w-[5px] bg-gold" />}
                  <span className="flex min-w-0 flex-col gap-px">
                    <b className="text-[13px] font-extrabold tnum">
                      {districtAr(r.districtSlug)} · {r.typeLabelAr ?? r.type}
                      {budget(r.budgetMin, r.budgetMax) && ` · ${budget(r.budgetMin, r.budgetMax)}`}
                    </b>
                    <small className="text-caption font-normal text-muted">
                      وصل {whenLabel(sentAt)} · ينتهي بعد {expiresInLabel(r.expiresAt)}
                    </small>
                  </span>
                  <AlliancePill tone="gold-outline" className="shrink-0 text-[11px]">
                    بلا رد
                  </AlliancePill>
                </Link>
              );
            })}
          </section>

          <section className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[18px] font-extrabold">سجلات الإحالة</h2>
              <span className="text-caption text-muted tnum">{records.length}</span>
            </div>
            {records.map((r) => {
              const stage = effectiveReferralStage(r, stages);
              const closed = stage === "transfer" || stage === "failed";
              return (
                <Link key={r.id} href={`/member/${officeId}/referrals/${r.id}`} className={cx("flex items-center justify-between gap-2.5 bg-paper px-3 py-2.5 no-underline hover:bg-sand", closed ? "text-muted" : "text-ink")} style={{ border: "1.5px solid var(--smq-ink)" }}>
                  <span className="flex min-w-0 flex-col gap-px">
                    <b dir="ltr" className="self-start text-[13px] font-extrabold text-ink tnum">
                      {r.id}
                    </b>
                    <small className="text-caption font-normal leading-relaxed text-muted">{referralLine(r, officeId, stage)}</small>
                  </span>
                  <StagePill stage={stage} className="shrink-0 text-[11px]" />
                </Link>
              );
            })}
          </section>

          <section className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <a href={waLink(`عرض عام · ${office.fullName}`)} target="_blank" rel="noopener" className="inline-flex h-12 items-center justify-center bg-ink px-3 text-[13px] font-extrabold text-paper no-underline cut-s hover:bg-ink-2">
                + عرض عام
              </a>
              <a href={waLink(`طلب في حي آخر · ${office.fullName}`)} target="_blank" rel="noopener" className="inline-flex h-12 items-center justify-center bg-paper px-3 text-[13px] font-bold text-ink no-underline hover:bg-sand" style={{ border: "1.5px solid var(--smq-ink)" }}>
                + طلب في حي آخر
              </a>
            </div>
            <span className="text-caption leading-relaxed text-muted">العرض العام يُطابَق مع الطلبات القادمة في حيّه. الطلب في حي آخر يُرسل لمن يغطيه ويُحسب لك في «أعطى».</span>
          </section>
        </main>
      </div>
    </PhoneColumn>
  );
}
