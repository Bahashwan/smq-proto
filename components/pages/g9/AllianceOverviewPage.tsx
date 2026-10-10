"use client";
// /admin/alliance · Admin-Alliance-D at 1440 (overview with the room's sub-tabs) and Admin-Alliance-M at 390 (the
// day's actions as cards, each decision one tap). Every tile, line and card is computed from the alliance fixtures
// with the store's overrides; the cards' buttons run the shared room actions.
import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AdminLinkButton, Dialog, AdminTextarea } from "@/components/admin";
import { HexCell, fmtReply, fmtShort, membersLabel, unitsLabel } from "@/components/alliance";
import { applications } from "@/data/applications";
import { districtAr } from "@/data/districts";
import { officeById } from "@/data/offices";
import { requests } from "@/data/requests";
import { referrals } from "@/data/referrals";
import { agoLabel, allianceReplyStats, effectiveReferralStage, effectiveRequest, memberCounts, routingOrder } from "@/data/selectors";
import { usePresenter } from "@/lib/presenter";
import { usePatch, useStore } from "@/lib/store";
import { cx, fmtNum, plural } from "@/lib/format";
import { useRoomActions } from "./actions";
import { allianceEvents, draftReport, feedTime, hiddenSlices, OUTAGE_MINUTES, protectionLeft, radarKind, radarLines, radarSegment, radarTeaser, reqTitle, RESPONSE } from "./room";
import { AllianceTabs, G9Shell, HexTag, LinkTile, RoomTitle, Section, useAllianceOverview } from "./shell";
import { cnt, districtsWord, letters, officeShort, sectorsWord } from "./util";

const REGA_URL = "https://rega.gov.sa";

function useRoomData() {
  const reqOv = useStore((s) => s.requests);
  const appOv = useStore((s) => s.applications);
  const refStages = useStore((s) => s.referralStages);
  const createdReferrals = useStore((s) => s.createdReferrals);
  const createdRequests = useStore((s) => s.createdRequests);
  return useMemo(() => {
    const reqs = requests.map((r) => effectiveRequest(r, reqOv));
    const offerReqs = reqs.filter((r) => r.stage === "offers" && r.source !== "member");
    const app = applications.find((a) => (appOv[a.id] ?? a.status) === "review");
    const unsentReqs = reqs.filter((r) => r.stage !== "closed" && ((r.unsentOfficeIds?.length ?? 0) > 0 || (r.stage === "new" && routingOrder(r.districtSlug, r.type).length > 0)));
    const manualReq = reqs.find((r) => r.stage !== "closed" && (r.unsentOfficeIds?.length ?? 0) > 0);
    const allRefs = [...createdReferrals, ...referrals.filter((r) => !createdReferrals.some((c) => c.id === r.id))];
    const disputes = allRefs.filter((r) => r.dispute && ["intro", "viewing", "negotiation"].includes(effectiveReferralStage(r, refStages)));
    const events = allianceEvents({ createdReferrals, createdRequests, requestOverrides: reqOv });
    return { offerReqs, app, unsentReqs, manualReq, disputes, events };
  }, [reqOv, appOv, refStages, createdReferrals, createdRequests]);
}

/** «مكتبان يغطيانه: أ، ك» */
function coverLine(ids: string[]): string {
  const who = plural(ids.length, { one: "مكتب واحد يغطيه", two: "مكتبان يغطيانه", few: "مكاتب تغطيه", many: "مكتباً تغطيه" });
  return `${who}: ${letters(ids)}`;
}

function RejectDialog({ open, onClose, onConfirm, title }: { open: boolean; onClose: () => void; onConfirm: (reason: string) => void; title: string }) {
  const [reason, setReason] = useState("");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      confirmLabel="ارفض العرض مع سبب"
      confirmDisabled={!reason.trim()}
      onConfirm={() => {
        onConfirm(reason.trim());
        setReason("");
      }}
    >
      <AdminTextarea label="السبب" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
    </Dialog>
  );
}

// ------------------------------------------------------------------------------------------------ desktop

function DecisionRow({ tag, title, line, cta }: { tag: ReactNode; title: string; line: ReactNode; cta: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0">
      {tag}
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <strong className="text-[13px] font-extrabold leading-[normal]">{title}</strong>
        <small className="text-[11px] leading-[normal] text-muted">{line}</small>
      </span>
      <span className="shrink-0">{cta}</span>
    </div>
  );
}

function Desktop() {
  const ov = useAllianceOverview();
  const { offerReqs, app, unsentReqs, disputes, events } = useRoomData();
  const { state } = usePresenter();
  const mc = memberCounts();
  const reply = allianceReplyStats();
  const { hexes: mini, lines } = useMemo(() => radarTeaser(), []);
  const outline = "inline-flex h-9 items-center whitespace-nowrap border-interactive bg-paper px-3 text-[12px] font-extrabold text-ink no-underline hover:bg-sand";

  return (
    <div className="hidden flex-col gap-6 md:flex">
      <AllianceTabs active="overview" />

      <div className="grid grid-cols-3 gap-3 xl:grid-cols-6">
        <LinkTile href="/admin/alliance/members" label="الأعضاء الموثّقون" value={fmtNum(mc.members)} note={`${sectorsWord(mc.sectors)} · ${districtsWord(mc.districtsCovered)}`} />
        <LinkTile href="/admin/alliance/applications" label="طلبات انضمام تنتظر" value={fmtNum(ov.pendingApplications)} note={`+${ov.importedApplications} من استيراد قوقل`} rule={ov.pendingApplications > 0} />
        <LinkTile href="/admin/alliance/requests" label="طلبات مفتوحة" value={fmtNum(ov.openRequests)} note={`${ov.visitorOpenRequests} من زوار بلا نتائج`} />
        <LinkTile href="/admin/alliance/requests" label="مطابقات تنتظر قراراً" value={fmtNum(ov.awaitingDecision)} note="وصلت عروض" rule={ov.awaitingDecision > 0} />
        <LinkTile href="/admin/alliance/referrals" label="إحالات جارية" value={fmtNum(ov.ongoingReferrals)} note={`${ov.viewing} معاينة · ${ov.negotiating} تفاوض`} />
        <LinkTile href="/admin/alliance/referrals" label="صفقات أُغلقت" value={fmtNum(ov.closedDeals)} note={`منذ الإطلاق · ${fmtShort(ov.closedValue)}`} ink />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Section title="يحتاج قراراً اليوم" aside="مرتّب بالأقدم">
          {offerReqs.map((r) => {
            const o = r.offers[0];
            return (
              <DecisionRow
                key={r.id}
                tag={<HexTag tone="gold">عرض</HexTag>}
                title={reqTitle(r, true)}
                line={`وصل عرض من ${officeShort(o.officeId)} (${o.priceSar ? fmtNum(o.priceSar) : ""}، ${o.brokered ? "عقد موثّق" : "مباشر من المالك"}) ${agoLabel(o.repliedAt)} · ينتظر عرضه على المشتري`}
                cta={
                  <Link href={`/admin/alliance/requests?req=${r.id}`} className={outline}>
                    افتح المطابقة
                  </Link>
                }
              />
            );
          })}
          {app && (
            <DecisionRow
              tag={<HexTag tone="outline">طلب</HexTag>}
              title={`${app.id} · ${app.officeName}`}
              line={`انضمام · ${districtAr(app.districtSlug)} · يحتاج تحقق الرخصة في موقع الهيئة`}
              cta={
                <Link href={`/admin/alliance/applications?id=${app.id}`} className={outline}>
                  راجع
                </Link>
              }
            />
          )}
          {unsentReqs.length > 0 && (
            <DecisionRow
              tag={<HexTag tone="goldOutline">واتساب</HexTag>}
              title={`${plural(unsentReqs.length, { one: "طلب واحد لم يُرسل", two: "طلبان لم يُرسلا", few: "طلبات لم تُرسل", many: "طلباً لم يُرسل" })} · الوضع اليدوي`}
              line={`انقطع واتساب بزنس ${OUTAGE_MINUTES} دقيقة أمس · أُرسل للمكاتب يدوياً؟`}
              cta={
                <Link href={`/admin/alliance/requests?req=${unsentReqs[0].id}&wa=manual`} className={outline}>
                  أرسل الآن
                </Link>
              }
            />
          )}
          {disputes.map((ref) => {
            const a = officeShort(ref.requesterOfficeId);
            const b = officeShort(ref.offerOfficeId);
            return (
              <DecisionRow
                key={ref.id}
                tag={<HexTag tone="ink">نزاع</HexTag>}
                title={`${ref.id} · ${a} و${b}`}
                line={`${b} يطلب تعديل المرحلة إلى «لم تتم» · ${a} لم يردّ منذ ${cnt(ref.dispute?.openedDaysAgo ?? 0, "يوم", "أيام", "يوماً")}`}
                cta={
                  <Link href={`/admin/alliance/referrals?ref=${ref.id}`} className={outline}>
                    افتح السجل
                  </Link>
                }
              />
            );
          })}
          {draftReport && (
            <DecisionRow
              tag={<HexTag tone="sand">تقرير</HexTag>}
              title={`تقرير ${draftReport.monthAr.split(" ")[0]}`}
              line={`يُولَّد ${draftReport.generatesOn?.split(" · ")[0] ?? ""} · ${cnt(hiddenSlices(), "شريحة", "شرائح", "شريحة")} تحت 20 جلسة ستُخفى`}
              cta={
                <Link href="/admin/alliance/report" className={outline}>
                  معاينة
                </Link>
              }
            />
          )}
        </Section>

        <Section
          title="الرادار · طلب بلا عرض"
          aside={
            <Link href="/admin/alliance/radar" className="text-[12px] font-extrabold text-gold-text no-underline hover:text-ink">
              الكامل ←
            </Link>
          }
          bodyClassName="flex flex-col gap-2.5 px-4 py-3.5"
        >
          <div className="flex flex-wrap items-center justify-center gap-1" style={{ ["--hex-surface" as string]: "var(--smq-paper)" }}>
            {mini.map((r) => {
              const kind = radarKind(r);
              return (
                <HexCell
                  key={r.district.slug}
                  label={r.district.ar}
                  value={fmtNum(r.sessions)}
                  state={kind === "self" ? "active" : kind === "needs" ? "muted" : "gap"}
                  size={64}
                  href={`/admin/alliance/radar?district=${r.district.slug}`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-[11px] text-muted">
            <span>ذهبي: طلب بلا وحدات SMQ، يغطيه أعضاء</span>
            <span>أسود: لدينا وحدات</span>
          </div>
          <div className="flex flex-col gap-1.5 border-t border-line pt-2.5 text-[12px]">
            {lines.map((r) => (
              <div key={r.district.slug} className="flex items-center justify-between gap-3">
                <span>{radarSegment(r)}</span>
                {radarKind(r) === "send" ? (
                  <strong className="shrink-0 font-extrabold">
                    {`${membersLabel(r.members)} · `}
                    <Link href={`/admin/alliance/radar?district=${r.district.slug}`} className="text-gold-text underline hover:text-ink">
                      أرسل
                    </Link>
                  </strong>
                ) : (
                  <strong className="shrink-0 font-extrabold text-gold-text">{r.members ? "يحتاج أعضاء" : "لا أعضاء"}</strong>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-3">
        <Section title="سرعة الرد · 30 يوماً" bodyClassName="flex flex-col gap-2 px-4 py-3.5 text-[12px]">
          {[
            ["متوسط التحالف", fmtReply(reply.meanMinutes), false],
            [`أسرع عضو · ${reply.fastest?.nameAr ?? ""}`, reply.fastest ? fmtReply(reply.fastest.ledger.avgReplyMinutes) : "", false],
            ["بلا رد خلال المهلة", `${RESPONSE.noReplyWithinDeadline} من ${RESPONSE.sentWithinDeadline}`, true],
            ["«لا يوجد» صريح", fmtNum(RESPONSE.explicitNone), false],
          ].map(([k, v, gold]) => (
            <div key={String(k)} className="flex items-center justify-between gap-3">
              <span>{k}</span>
              <strong className={cx("font-extrabold tnum", gold && "text-gold-text")}>{v}</strong>
            </div>
          ))}
        </Section>
        <Section title="قنوات الإرسال" bodyClassName="flex flex-col gap-2 px-4 py-3.5 text-[12px] leading-relaxed">
          <span className="flex items-center gap-2">
            <span aria-hidden className={cx("hex-flat inline-block h-2.5 w-3 shrink-0", state.wa === "manual" ? "bg-ink" : "bg-gold")} />
            {state.wa === "manual" ? "الوضع اليدوي (واتساب بزنس غير متصل)" : `واتساب بزنس متصل · ${cnt(RESPONSE.autoSendsThisMonth, "إرسال", "إرسالات", "إرسالاً")} تلقائياً هذا الشهر`}
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="hex-flat relative inline-block h-2.5 w-3 shrink-0 bg-ink">
              <span className="hex-flat absolute inset-[1.5px] bg-paper" />
            </span>
            {`${cnt(RESPONSE.manualSendsThisMonth, "إرسال يدوي", "إرسالات يدوية", "إرسالاً يدوياً")} «أرسل على واتساب» أثناء الانقطاع`}
          </span>
          <span className="text-muted">كل طلب يحمل رابطاً خاصاً بالمكتب؛ الرد يصل من الرابط لا من الرسالة.</span>
        </Section>
        <Section title="آخر الأحداث" bodyClassName="flex flex-col px-4 py-2.5 text-[12px]">
          {events.slice(0, 4).map((e, i) => (
            <div key={i} className="flex gap-2.5 border-b border-line py-1.5 last:border-b-0">
              <span className="w-[70px] shrink-0 text-muted tnum">{feedTime(e.at)}</span>
              <span>{e.text}</span>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------ phone

function PhoneCard({ kicker, tag, title, children, actions, rule }: { kicker: string; tag: ReactNode; title: string; children: ReactNode; actions: ReactNode; rule?: boolean }) {
  return (
    <article className="relative flex flex-col gap-2 border-interactive bg-paper px-3.5 py-3">
      {rule && <span aria-hidden className="absolute inset-y-0 start-0 w-[5px] bg-gold" />}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-muted">{kicker}</span>
        {tag}
      </div>
      <b className="text-[15px] font-extrabold leading-normal">{title}</b>
      <p className="text-[12px] leading-[1.6] text-ink-2">{children}</p>
      <div className="grid grid-cols-2 gap-2">{actions}</div>
    </article>
  );
}
function Tag({ children, tone }: { children: ReactNode; tone: "gold" | "goldOutline" | "inkOutline" | "ink" }) {
  return (
    <span
      className={cx(
        "px-[7px] py-0.5 text-[11px] font-extrabold",
        tone === "gold" ? "bg-gold text-ink" : tone === "ink" ? "bg-ink text-paper" : tone === "goldOutline" ? "border-[1.5px] border-gold text-gold-text" : "border-interactive text-ink",
      )}
    >
      {children}
    </span>
  );
}
const btnGold = "flex min-h-11 items-center justify-center bg-gold px-2.5 text-center text-[12px] font-extrabold leading-snug text-ink cut-s hover:bg-gold-hover";
const btnInk = "flex min-h-11 items-center justify-center bg-ink px-2.5 text-center text-[12px] font-extrabold leading-snug text-paper hover:bg-ink-2";
const btnOutline = "flex min-h-11 items-center justify-center border-interactive bg-paper px-2.5 text-center text-[12px] font-extrabold leading-snug text-ink no-underline hover:bg-sand";

function Phone() {
  const ov = useAllianceOverview();
  const { offerReqs, app, manualReq, disputes, events } = useRoomData();
  const actions = useRoomActions();
  const [rejecting, setRejecting] = useState<{ reqId: string; officeId: string } | null>(null);
  const skipped = usePatch<{ ids: string[] }>("room-skipped", "phone");
  const resent = useStore((s) => s.patches["request-manual"]);
  const radar = radarLines(1)[0];
  const mc = memberCounts();
  const skip = (id: string) => actions.patch("room-skipped", "phone", { ids: [...(skipped?.ids ?? []), id] });
  const hidden = (id: string) => skipped?.ids?.includes(id);

  const cards: ReactNode[] = [];
  for (const r of offerReqs) {
    const o = r.offers[0];
    cards.push(
      <PhoneCard
        key={r.id}
        rule
        kicker={`عرض وصل · ${agoLabel(o.repliedAt)}`}
        tag={<Tag tone="gold">قرار</Tag>}
        title={reqTitle(r)}
        actions={
          <>
            <button type="button" className={btnGold} onClick={() => actions.showToBuyer(r.id, o.officeId)}>
              اعرض على المشتري
            </button>
            <button type="button" className={btnOutline} onClick={() => setRejecting({ reqId: r.id, officeId: o.officeId })}>
              ارفض مع سبب
            </button>
          </>
        }
      >
        {`${officeShort(o.officeId)} عرض `}
        <strong>{o.priceSar ? fmtNum(o.priceSar) : ""}</strong>
        {` · ${o.areaM2 ?? ""} م² · ${o.brokered ? "عقد وساطة موثّق" : "مباشر من المالك"}. الطلب من ${r.source === "visitor" ? "زائر بلا نتائج" : "فريق SMQ"}، ميزانيته ${r.budgetMax ? fmtNum(r.budgetMax) : ""}.`}
      </PhoneCard>,
    );
  }
  if (app) {
    cards.push(
      <PhoneCard
        key={app.id}
        kicker={`طلب انضمام · ${agoLabel(app.submittedAt)}`}
        tag={<Tag tone="goldOutline">تحقق الرخصة</Tag>}
        title={`${app.officeName} · ${districtAr(app.districtSlug)}`}
        actions={
          <>
            <a href={REGA_URL} target="_blank" rel="noreferrer" className={btnInk}>
              افتح موقع الهيئة
            </a>
            <button type="button" className={btnGold} onClick={() => actions.approveApplication(app.id)}>
              تم التحقق · اعتمد
            </button>
          </>
        }
      >
        {`فال ${app.licence} · ${app.applicantRole === "مالك المكتب العقاري" ? "مالك المكتب" : app.applicantRole} · ${cnt(app.districts.length, "حي", "أحياء", "حياً")} · ${cnt(app.offersDirect + app.offersBrokered, "عرض", "عروض", "عرضاً")}. افتح موقع الهيئة، طابق الاسم، ثم أكّد.`}
      </PhoneCard>,
    );
  }
  if (manualReq && !hidden(manualReq.id)) {
    const sentTo = manualReq.sentTo.filter((s) => s.mode === "manual").map((s) => s.officeId);
    const target = sentTo[0];
    const unsent = manualReq.unsentOfficeIds ?? [];
    // another active member that handles the requested type (مكتب أ covers المحمدية but not apartments)
    const others = routingOrder(manualReq.districtSlug, manualReq.type).filter((x) => x.specialtyMatch && !sentTo.includes(x.office.id) && !unsent.includes(x.office.id));
    const done = target && resent?.[`${manualReq.id}:${target}`];
    cards.push(
      <PhoneCard
        key={manualReq.id}
        kicker="لم يُرسل · الوضع اليدوي"
        tag={<Tag tone="inkOutline">واتساب</Tag>}
        title={reqTitle(manualReq)}
        actions={
          <>
            <button type="button" className={btnGold} disabled={!!done} onClick={() => target && actions.sendManual(manualReq.id, target)}>
              {done ? `أُرسل يدوياً لمكتب ${officeById(target)?.letter ?? ""}` : `أرسل على واتساب · ${officeShort(target)} (إعادة)`}
            </button>
            <button type="button" className={btnOutline} onClick={() => skip(manualReq.id)}>
              تجاوز
            </button>
          </>
        }
      >
        {[
          target ? `أُرسل لمكتب ${officeById(target)?.letter ?? ""} يدوياً.` : null,
          unsent.length ? `المكتب الثاني (${letters(unsent)}) موقوف، فلا يُرسل له.` : null,
          others.length === 0 ? `لا مكتب آخر يغطي ${districtAr(manualReq.districtSlug)}.` : null,
        ]
          .filter(Boolean)
          .join(" ")}
      </PhoneCard>,
    );
  }
  for (const ref of disputes) {
    const a = officeById(ref.requesterOfficeId);
    const b = officeShort(ref.offerOfficeId);
    cards.push(
      <PhoneCard
        key={ref.id}
        kicker={`نزاع · ${cnt(ref.dispute?.openedDaysAgo ?? 0, "يوم", "أيام", "يوماً")}`}
        tag={<Tag tone="ink">إحالة</Tag>}
        title={`${ref.id} · ${a?.nameAr ?? ""} و${b}`}
        actions={
          <>
            <button type="button" className={btnOutline} onClick={() => actions.toast(`${a?.fullName ?? ""} · ${a?.phoneMasked ?? ""}`, { kind: "info" })}>
              {`راسل ${a?.nameAr ?? ""}`}
            </button>
            <Link href={`/admin/alliance/referrals?ref=${ref.id}`} className={btnInk + " no-underline"}>
              افصل من سطح المكتب
            </Link>
          </>
        }
      >
        {`${b} يطلب «لم تتم»؛ ${a?.nameAr ?? ""} لم يردّ. الحماية ${cnt(protectionLeft(ref), "يوم", "أيام", "يوماً")} باقية. القرار يحتاج سطح المكتب.`}
      </PhoneCard>,
    );
  }
  if (radar) {
    const seg = radarSegment(radar);
    cards.push(
      <PhoneCard
        key="radar"
        kicker="الرادار · 30 يوماً"
        tag={<Tag tone="goldOutline">فرصة</Tag>}
        title={`${radar.district.ar} · ${fmtNum(radar.sessions)} جلسة · ${unitsLabel(radar.smqUnits)}`}
        actions={
          <>
            <button type="button" className={btnGold} disabled={radar.members === 0} onClick={() => actions.sendRadarRequest(radar)}>
              أرسل للمكاتب
            </button>
            <Link href={`/admin/alliance/radar?district=${radar.district.slug}`} className={btnOutline}>
              الرادار الكامل
            </Link>
          </>
        }
      >
        {`${seg.replace(`${radar.district.ar} · `, "")}. ${radar.members ? coverLine(radar.memberIds) : "لا أعضاء يغطونه"}. أرسل طلباً مجمّعاً من بحوث الزوار بلا أي بيانات شخصية.`}
      </PhoneCard>,
    );
  }

  const memberWord = cnt(mc.members, "عضو", "أعضاء", "عضواً").split(" ").slice(1).join(" ");
  return (
    <div className="flex flex-col gap-3 pt-4 md:hidden">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-[22px] font-extrabold">التحالف · اليوم</h1>
          <span className="text-[12px] text-muted">{cnt(cards.length, "إجراء", "إجراءات", "إجراءً")}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
          <Link href="/admin/alliance/members" className="flex flex-col items-center border-interactive bg-paper px-1 py-2 text-ink no-underline">
            <b className="text-[18px] font-extrabold tnum">{fmtNum(mc.members)}</b>
            {memberWord}
          </Link>
          <Link href="/admin/alliance/requests" className="flex flex-col items-center border-interactive bg-paper px-1 py-2 text-ink no-underline">
            <b className="text-[18px] font-extrabold tnum">{fmtNum(ov.openRequests)}</b>
            مفتوحة
          </Link>
          <Link href="/admin/alliance/requests" className="flex flex-col items-center border-[1.5px] border-gold bg-paper px-1 py-2 text-ink no-underline">
            <b className="text-[18px] font-extrabold tnum text-gold-text">{fmtNum(ov.awaitingDecision)}</b>
            عروض تنتظر
          </Link>
          <Link href="/admin/alliance/referrals" className="flex flex-col items-center bg-ink px-1 py-2 text-paper no-underline">
            <b className="text-[18px] font-extrabold tnum text-gold">{fmtNum(ov.ongoingReferrals)}</b>
            إحالات
          </Link>
        </div>
        <p className="mt-1 text-[11px] leading-[1.6] text-muted">كل قرار هنا بضغطة من الجوال. التفاصيل الكاملة على سطح المكتب.</p>
      </div>
      <div className="flex flex-col gap-2.5">{cards}</div>
      <section className="flex flex-col gap-2 pt-1.5">
        <span className="text-[13px] font-extrabold">آخر ما حدث</span>
        <div className="border-interactive bg-paper text-[12px]">
          {events.slice(0, 3).map((e, i) => (
            <div key={i} className="flex gap-2.5 border-b border-line px-3 py-[9px] last:border-b-0">
              <span className="w-14 shrink-0 text-muted tnum">{feedTime(e.at)}</span>
              <span>{e.detail ? `${e.text} · ${e.detail}` : e.text}</span>
            </div>
          ))}
        </div>
        <Link href="/admin/alliance" className="self-start text-[12px] font-extrabold text-gold-text no-underline">
          غرفة التحالف الكاملة على سطح المكتب ←
        </Link>
      </section>
      <RejectDialog
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title={rejecting ? `ارفض عرض ${officeShort(rejecting.officeId)}` : ""}
        onConfirm={(reason) => {
          if (rejecting) actions.rejectOffer(rejecting.reqId, rejecting.officeId, reason);
          setRejecting(null);
        }}
      />
    </div>
  );
}

export function AllianceOverviewPage() {
  return (
    <G9Shell
      title={<RoomTitle />}
      subtitle="تحالف مكاتب جدة العقارية · كل ما يدخل ويخرج بين المكاتب يمر من هنا · الأرقام توضيحية"
      phoneHideHeader
      actions={
        <>
          <AdminLinkButton href="/admin/alliance/requests?new=1" variant="gold" size="md">
            + طلب من الفريق
          </AdminLinkButton>
          <AdminLinkButton href="/alliance" variant="outline" size="md">
            الصفحة العامة
          </AdminLinkButton>
        </>
      }
    >
      <Desktop />
      <Phone />
    </G9Shell>
  );
}

export { RejectDialog };
