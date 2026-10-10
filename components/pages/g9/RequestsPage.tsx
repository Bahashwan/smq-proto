"use client";
// /admin/alliance/requests?req=REQ-2026-0412 (Admin-AllianceRequests-D). The requests by stage (store overrides
// merged) and the selected request's detail: the request, the members it went to in ledger order, the sending mode,
// the offers received. Selecting مكتب ط's offer and «أنشئ سجل إحالة» creates REF-2026-0117 in memory (store
// addReferral, request → «تعارف») and opens the referrals tab. With the presenter's WhatsApp switch on manual
// (`?wa=manual`) the sending box shows «أرسل على واتساب» per office; pressing it opens the prepared message and
// records the manual send — nothing leaves the prototype. «+ طلب من الفريق» (also `?new=1`) adds a staff request.
import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminButton, AdminField, AdminSelect, AdminTextarea, Dialog, Drawer } from "@/components/admin";
import { OfferRow, OfferRowsHeader, REFERRAL_STAGE_WORD, RequestCard, StageBoard, budgetLabel, fmtReply } from "@/components/alliance";
import { districtAr, districts } from "@/data/districts";
import { activeOffices, officeById } from "@/data/offices";
import { referrals, shortReferralId } from "@/data/referrals";
import { requests, shortRequestId, SOURCE_LABELS, STAGE_LABELS, STAGE_ORDER } from "@/data/requests";
import { agoLabel, effectiveReferralStage, effectiveRequest, ledgerNet, nextRequestNumber, NOW, routingOrder, whenLabel } from "@/data/selectors";
import type { AllianceRequest, RequestStage } from "@/data/types";
import { setQuery, useQuery } from "@/lib/location";
import { usePresenter } from "@/lib/presenter";
import { useStore } from "@/lib/store";
import { cx, fmtNum } from "@/lib/format";
import { useRoomActions } from "./actions";
import { RejectDialog } from "./AllianceOverviewPage";
import { AllianceTabs, G9Shell, RoomTitle } from "./shell";
import { letters, officeShort, padTime, stamp } from "./util";
import { toOffices } from "./room";

const budgetOf = (r: Pick<AllianceRequest, "budgetMin" | "budgetMax">) => budgetLabel(r.budgetMin, r.budgetMax, r.budgetMin != null && r.budgetMax != null);

/** The card's detail line, composed from the record (the board's wording per stage). */
function cardDetail(r: AllianceRequest, refStages: Record<string, { stage: import("@/data/types").ReferralStage }>, createdRefs: import("@/data/types").Referral[]): string {
  const budget = budgetOf(r);
  if (r.stage === "new") {
    const routed = routingOrder(r.districtSlug, r.type);
    // who covers it, in abjad order (the routing order shows in the detail's «مرتّبين بالميزان»)
    return [budget, agoLabel(r.createdAt), routed.length ? `يغطيه ${letters(routed.map((x) => x.office.id).sort())}` : `لا أعضاء يغطون ${districtAr(r.districtSlug)}`].join(" · ");
  }
  if (r.stage === "sent") {
    const manual = r.sentTo.filter((s) => s.mode === "manual");
    if (manual.length) return [budget, `أُرسل يدوياً ${toOffices(manual.map((s) => s.officeId))} أثناء الانقطاع`, r.unsentOfficeIds?.length ? `${r.unsentOfficeIds.length} لم يُرسل` : null].filter(Boolean).join(" · ");
    const replied = r.sentTo.filter((s) => s.status === "replied").length;
    const first = r.sentTo[0];
    return [budget, first ? `أُرسل ${padTime(whenLabel(first.sentAt))} لـ ${letters(r.sentTo.map((s) => s.officeId))}` : null, first?.mode === "auto" ? "تلقائي" : "يدوي", replied ? `${replied} ردود` : "بلا رد بعد"].filter(Boolean).join(" · ");
  }
  if (r.stage === "offers") {
    const n = r.offers.length;
    const who = n === 1 ? `عرض من ${officeShort(r.offers[0].officeId)} ${r.offers[0].priceSar ? fmtNum(r.offers[0].priceSar) : ""} ${r.offers[0].brokered ? "موثّق" : "مباشر"}` : `${n === 2 ? "عرضان" : `${n} عروض`} من ${r.offers.map((o) => officeById(o.officeId)?.letter ?? "").join(" و")}`;
    return [budget, who, r.source === "member" ? "ينتظر رد المشتري" : "ينتظر قرار"].join(" · ");
  }
  const ref = r.referralId ? createdRefs.find((x) => x.id === r.referralId) ?? referrals.find((x) => x.id === r.referralId) : undefined;
  if (r.stage === "intro" && ref) {
    const req = ref.requesterOfficeId === "SMQ" ? "SMQ" : officeById(ref.requesterOfficeId)?.letter ?? "";
    return [ref.id, `${req} و${officeShort(ref.offerOfficeId)}`, REFERRAL_STAGE_WORD[effectiveReferralStage(ref, refStages)]].join(" · ");
  }
  if (r.stage === "closed") return [r.referralId ? shortReferralId(r.referralId) : null, r.closedReason].filter(Boolean).join(" · ");
  return budget;
}

function SendMode({ r, wa }: { r: AllianceRequest; wa: "connected" | "manual" }) {
  const { sendManual } = useRoomActions();
  const manualSends = useStore((s) => s.patches["request-manual"]);
  const [preview, setPreview] = useState<string | null>(null);
  const auto = r.sentTo.filter((s) => s.mode === "auto");
  const manual = r.sentTo.filter((s) => s.mode === "manual");
  const targets = routingOrder(r.districtSlug, r.type).map((x) => x.office.id).concat(r.unsentOfficeIds ?? []);
  const message = (officeId: string) => ({
    text: `${r.id} · ${districtAr(r.districtSlug)} · ${r.typeLabelAr ?? r.type} · ${budgetOf(r)} · ${r.timing}. ردّ من رابطك:`,
    link: `smq-re.com/member/${officeId}/requests/${r.id}`,
  });
  return (
    <div className="flex flex-col gap-1.5 bg-cream px-3 py-2.5 text-[11px] leading-relaxed">
      <span className="font-extrabold">وضع الإرسال</span>
      {wa === "manual" ? (
        <>
          <span className="flex items-start gap-2">
            <span aria-hidden className="hex-flat relative mt-1 inline-block h-2.5 w-3 shrink-0 bg-ink">
              <span className="hex-flat absolute inset-[1.5px] bg-paper" />
            </span>
            الوضع اليدوي (واتساب بزنس غير متصل): الرسالة جاهزة ولم تُرسل بعد
          </span>
          {targets.map((id) => {
            const office = officeById(id);
            const suspended = office?.status === "suspended";
            const sent = manualSends?.[`${r.id}:${id}`] as { at?: string } | undefined;
            return (
              <div key={id} className="flex flex-col gap-1.5">
                {sent ? (
                  <span className="font-bold">{`أُرسل يدوياً ${toOffices([id])} · ${padTime(whenLabel(sent.at ?? NOW))}`}</span>
                ) : (
                  <button
                    type="button"
                    disabled={suspended}
                    onClick={() => setPreview(preview === id ? null : id)}
                    aria-expanded={preview === id}
                    className="flex min-h-11 items-center justify-between gap-2 bg-gold px-3 text-start text-[12px] font-extrabold text-ink cut-s hover:bg-gold-hover disabled:bg-sand disabled:text-disabled"
                  >
                    {`أرسل على واتساب · ${office?.nameAr ?? id}${suspended ? " موقوف" : ""}`}
                  </button>
                )}
                {preview === id && !sent && (
                  <div className="flex flex-col gap-2 border-interactive bg-paper p-3">
                    <span className="text-muted">
                      {`واتساب · ${office?.fullName ?? ""} · `}
                      <bdi dir="ltr">{office?.phoneMasked ?? ""}</bdi>
                    </span>
                    <p className="flex flex-col gap-1 bg-sand p-2.5 text-[12px] text-ink">
                      <span>{message(id).text}</span>
                      <span dir="ltr" className="break-all text-start font-bold">
                        {message(id).link}
                      </span>
                    </p>
                    <span className="text-muted">كل طلب يحمل رابطاً خاصاً بالمكتب؛ الرد يصل من الرابط لا من الرسالة.</span>
                    <AdminButton
                      variant="ink"
                      size="sm"
                      className="self-start"
                      onClick={() => {
                        sendManual(r.id, id);
                        setPreview(null);
                      }}
                    >
                      تم الإرسال
                    </AdminButton>
                  </div>
                )}
              </div>
            );
          })}
        </>
      ) : (
        <>
          {auto[0] && (
            <span className="flex items-center gap-2">
              <span aria-hidden className="hex-flat inline-block h-2.5 w-3 shrink-0 bg-gold" />
              {`أُرسل تلقائياً عبر واتساب بزنس · ${stamp(auto[0].sentAt)}`}
            </span>
          )}
          {manual.map((s) => (
            <span key={s.officeId} className="flex items-center gap-2">
              <span aria-hidden className="hex-flat inline-block h-2.5 w-3 shrink-0 bg-ink" />
              {`أُرسل يدوياً ${toOffices([s.officeId])} · ${stamp(s.sentAt)}`}
            </span>
          ))}
          <span className="flex items-start gap-2 text-muted">
            <span aria-hidden className="hex-flat relative mt-1 inline-block h-2.5 w-3 shrink-0 bg-ink">
              <span className="hex-flat absolute inset-[1.5px] bg-paper" />
            </span>
            {`عند الانقطاع يظهر هنا زر «أرسل على واتساب» لكل مكتب بضغطة واحدة، كما في ${shortRequestId(requests.find((x) => x.sentTo.some((s) => s.mode === "manual"))?.id ?? r.id)}`}
          </span>
        </>
      )}
    </div>
  );
}

function Detail({ r }: { r: AllianceRequest }) {
  const { state } = usePresenter();
  const actions = useRoomActions();
  const setRequest = useStore((s) => s.setRequest);
  const [selected, setSelected] = useState<string | null>(r.offers[0]?.officeId ?? null);
  const [rejecting, setRejecting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [extra, setExtra] = useState(false);
  const [extraOffice, setExtraOffice] = useState("");
  const routed = routingOrder(r.districtSlug, r.type);
  const sentIds = new Set(r.sentTo.map((s) => s.officeId));
  const chips = [districtAr(r.districtSlug), r.type, r.beds ? (r.beds === 2 ? "غرفتان" : `${r.beds} غرف`) : null, budgetOf(r), r.timing].filter(Boolean) as string[];
  const closed = r.stage === "closed" || r.stage === "intro";
  const others = activeOffices().filter((o) => !sentIds.has(o.id));

  return (
    <section className="relative flex min-w-0 flex-col border-interactive bg-paper" aria-labelledby="req-detail">
      <span aria-hidden className="absolute inset-y-0 start-0 z-10 w-1.5 bg-gold" />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-[1.5px] border-ink bg-sand px-4 py-3">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h2 id="req-detail" className="text-[14px] font-extrabold">
            {`${r.id} · ${districtAr(r.districtSlug)} · ${r.typeLabelAr ?? r.type} · ${budgetOf(r)}`}
          </h2>
          <span className="flex items-center gap-1 bg-sand px-1.5 py-px text-[11px] font-extrabold text-ink">
            <span aria-hidden className="hex-flat inline-block h-[7px] w-[7px] bg-gold" />
            {`${SOURCE_LABELS[r.source]}${r.source === "member" && r.memberOfficeId ? ` · ${officeShort(r.memberOfficeId)}` : ""} · ${stamp(r.createdAt).replace(" ", " · ")}`}
          </span>
        </span>
        <span className="flex flex-wrap gap-2">
          <AdminButton variant="outline" size="sm" disabled={closed} onClick={() => setExtra(true)}>
            أرسل لمكتب إضافي
          </AdminButton>
          <AdminButton variant="outline" size="sm" disabled={r.stage === "closed"} onClick={() => setClosing(true)}>
            أغلق الطلب
          </AdminButton>
        </span>
      </header>
      <div className="grid lg:grid-cols-[1fr_1.6fr]">
        <div className="flex min-w-0 flex-col gap-2.5 border-line px-4 py-3.5 text-[12px] max-lg:border-b lg:border-e">
          <span className="font-extrabold">الطلب</span>
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span key={c} className="bg-sand px-[7px] py-0.5 text-[11px] font-extrabold">
                {c}
              </span>
            ))}
          </div>
          {r.source === "visitor" && (
            <span className="leading-relaxed text-muted">
              المشتري: زائر ترك اسمه ورقمه في النتائج الفارغة ووافق على التمرير. بياناته في{" "}
              <Link href="/admin/leads" className="text-gold-text underline hover:text-ink">
                الطلبات الواردة
              </Link>{" "}
              فقط ولا تُرسل لأي مكتب.
            </span>
          )}
          <span className="mt-1 font-extrabold">أُرسل إلى · مرتّبين بالميزان</span>
          <div className="flex flex-col gap-1.5">
            {routed.map((x) => {
              const s = r.sentTo.find((e) => e.officeId === x.office.id);
              const net = ledgerNet(x.office);
              const offered = r.offers.some((o) => o.officeId === x.office.id);
              const word = offered ? "ردّ بعرض" : s?.status === "none" ? "لا يوجد" : s?.status === "expired" ? "انتهت المهلة" : s ? "بلا رد بعد" : "لم يُرسل";
              return (
                <div key={x.office.id} className="flex items-center justify-between gap-3 border-interactive px-2.5 py-2">
                  <span>
                    <strong className="font-extrabold">{`${x.rank} · ${x.office.nameAr}`}</strong>
                    <br />
                    <span className="text-muted">{`يغطي ${districtAr(r.districtSlug)} · ميزان ${net.gave}/${net.received} · رد ${fmtReply(s?.replyMinutes ?? x.office.ledger.avgReplyMinutes)}`}</span>
                  </span>
                  <span className={cx("shrink-0 px-[7px] py-0.5 text-[11px] font-extrabold", offered ? "bg-gold text-ink" : "border-interactive")}>{word}</span>
                </div>
              );
            })}
            {routed.length < 2 && (
              <div className="flex items-center justify-between gap-3 border-hairline px-2.5 py-2 text-muted">
                <span>
                  <strong className="font-extrabold text-ink">{routed.length ? "لا مكتب ثانٍ" : "لا أعضاء"}</strong>
                  <br />
                  {routed.length ? `لا عضو آخر يغطي ${districtAr(r.districtSlug)}` : r.nearestCoverageAr ?? `لا أعضاء يغطون ${districtAr(r.districtSlug)}`}
                </span>
                <Link href="/admin/alliance/applications" className="shrink-0 text-[11px] font-extrabold text-gold-text underline hover:text-ink">
                  ادعُ مكتباً
                </Link>
              </div>
            )}
          </div>
          <SendMode r={r} wa={state.wa} />
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5 text-[12px] font-extrabold">
            <span>{`العروض الواردة · ${r.offers.length}`}</span>
            {r.offers.length > 0 && !closed && <span className="font-bold text-muted">اختر عرضاً لإنشاء سجل الإحالة</span>}
          </div>
          {r.offers.length > 0 ? (
            <div className="flex flex-col">
              <OfferRowsHeader />
              {r.offers.map((o) => (
                <OfferRow
                  sign={false}
                  key={o.officeId}
                  office={officeShort(o.officeId)}
                  replyMinutes={o.replyMinutes}
                  priceSar={o.priceSar}
                  areaM2={o.areaM2}
                  note={o.note}
                  brokered={o.brokered}
                  selected={selected === o.officeId}
                  onSelect={() => setSelected(o.officeId)}
                  name={`offer-${r.id}`}
                  className="border-x-0!"
                  action={
                    closed ? undefined : (
                      <AdminButton variant="gold" size="md" disabled={selected !== o.officeId} onClick={() => actions.createReferral(r.id, o.officeId)}>
                        أنشئ سجل إحالة
                      </AdminButton>
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <p className="m-4 border-hairline p-4 text-[12px] text-muted">{r.stage === "new" ? "لم يُرسل بعد" : "لا عروض بعد"}</p>
          )}
          {r.offers.length > 0 && !closed && (
            <div className="flex flex-col gap-2 px-4 py-3.5 text-[12px] leading-relaxed text-muted">
              <span>
                <strong className="text-ink">ما يحدث عند «أنشئ سجل إحالة»:</strong> يُنشأ REF برقم وتاريخ ومرحلة «تعارف»، يُرسل للمكتب وللمشتري عبر SMQ، وتبدأ فترة الحماية. المشتري يُعرض عليه العرض أولاً؛ إن رفض يُسجَّل السبب ويبقى الطلب مفتوحاً.
              </span>
              <div className="flex flex-wrap gap-2">
                <AdminButton variant="outline" size="sm" disabled={!selected} onClick={() => selected && actions.showToBuyer(r.id, selected)}>
                  اعرض على المشتري أولاً
                </AdminButton>
                <AdminButton variant="outline" size="sm" disabled={!selected} onClick={() => setRejecting(true)}>
                  ارفض العرض مع سبب
                </AdminButton>
              </div>
            </div>
          )}
          {r.referralId && (
            <Link href={`/admin/alliance/referrals?ref=${r.referralId}`} className="mx-4 my-3.5 self-start text-[12px] font-extrabold text-gold-text underline hover:text-ink">
              {`${r.referralId} ←`}
            </Link>
          )}
        </div>
      </div>

      <RejectDialog
        open={rejecting}
        onClose={() => setRejecting(false)}
        title={selected ? `ارفض عرض ${officeShort(selected)}` : ""}
        onConfirm={(reason) => {
          if (selected) actions.rejectOffer(r.id, selected, reason);
          setRejecting(false);
        }}
      />
      <Dialog
        open={closing}
        onClose={() => setClosing(false)}
        title={`أغلق الطلب ${shortRequestId(r.id)}`}
        confirmLabel="أغلق الطلب"
        destructive
        confirmDisabled={!closeReason.trim()}
        onConfirm={() => {
          setRequest(r.id, { stage: "closed" });
          setClosing(false);
          actions.toast(`أُغلق ${shortRequestId(r.id)} · ${closeReason.trim()}`);
        }}
      >
        <AdminTextarea label="السبب" rows={3} value={closeReason} onChange={(e) => setCloseReason(e.target.value)} />
      </Dialog>
      <Dialog
        open={extra}
        onClose={() => setExtra(false)}
        title="أرسل لمكتب إضافي"
        confirmLabel="أرسل"
        confirmDisabled={!extraOffice}
        onConfirm={() => {
          actions.patch("request-extra", `${r.id}:${extraOffice}`, { at: NOW });
          actions.toast(`أُرسل ${shortRequestId(r.id)} ${toOffices([extraOffice])}`);
          setExtra(false);
        }}
      >
        <AdminSelect label="المكتب" value={extraOffice} onChange={(e) => setExtraOffice(e.target.value)}>
          <option value="">اختر مكتباً</option>
          {others.map((o) => (
            <option key={o.id} value={o.id}>{`${o.nameAr} · ${o.districts.map(districtAr).join("، ")}`}</option>
          ))}
        </AdminSelect>
      </Dialog>
    </section>
  );
}

function NewRequestDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addRequest = useStore((s) => s.addRequest);
  const created = useStore((s) => s.createdRequests);
  const toast = useStore((s) => s.toast);
  const [district, setDistrict] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const submit = () => {
    if (!district || !type.trim()) return;
    const id = nextRequestNumber(created.map((c) => c.id));
    const summary = [districtAr(district), type.trim(), budget ? `حتى ${fmtNum(Number(budget.replace(/\D/g, "")) || 0)}` : null].filter(Boolean).join(" · ");
    addRequest({ id, districtSlug: district, summaryAr: summary, createdAt: NOW });
    toast(`أُنشئ ${shortRequestId(id)} · ${summary}`);
    setDistrict("");
    setType("");
    setBudget("");
    onClose();
  };
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="+ طلب من الفريق"
      footer={
        <AdminButton variant="gold" size="lg" disabled={!district || !type.trim()} onClick={submit}>
          أنشئ الطلب
        </AdminButton>
      }
    >
      <div className="flex flex-col gap-3">
        <AdminSelect label="الحي" value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">اختر حياً</option>
          {districts.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.ar}
            </option>
          ))}
        </AdminSelect>
        <AdminField label="نوع العقار" value={type} onChange={(e) => setType(e.target.value)} />
        <AdminField label="الميزانية" ltr inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} />
      </div>
    </Drawer>
  );
}

export function RequestsPage() {
  const q = useQuery();
  const reqOv = useStore((s) => s.requests);
  const refStages = useStore((s) => s.referralStages);
  const createdRefs = useStore((s) => s.createdReferrals);
  const createdRequests = useStore((s) => s.createdRequests);
  const all = useMemo(() => requests.map((r) => effectiveRequest(r, reqOv)), [reqOv]);
  const byStage = useMemo(() => {
    const out: Record<RequestStage, AllianceRequest[]> = { new: [], sent: [], offers: [], intro: [], closed: [] };
    for (const r of all) out[r.stage].push(r);
    for (const k of STAGE_ORDER) out[k].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return out;
  }, [all]);
  const reqId = q.get("req");
  const selected = (reqId && all.find((r) => r.id === reqId.toUpperCase() || shortRequestId(r.id) === reqId.toUpperCase())) || byStage.offers.find((r) => r.source !== "member") || all[0];
  const newOpen = q.get("new") === "1";

  const columns = STAGE_ORDER.map((stage) => ({
    key: stage,
    title: STAGE_LABELS[stage],
    count: byStage[stage].length + (stage === "new" ? createdRequests.length : 0),
    children: (
      <>
        {stage === "new" &&
          createdRequests.map((c) => (
            <RequestCard
              key={c.id}
              id={shortRequestId(c.id)}
              source="staff"
              district={districtAr(c.districtSlug)}
              summary={c.summaryAr.replace(`${districtAr(c.districtSlug)} · `, "")}
              detail={[agoLabel(c.createdAt), routingOrder(c.districtSlug).length ? `يغطيه ${letters(routingOrder(c.districtSlug).map((x) => x.office.id).sort())}` : `لا أعضاء يغطون ${districtAr(c.districtSlug)}`].join(" · ")}
              needsAction
            />
          ))}
        {byStage[stage].map((r) => {
          const ref = r.referralId && (stage === "intro" || stage === "closed");
          const extra = r.nearestCoverageAr ?? r.unsentNoteAr;
          return (
            <RequestCard
              key={r.id}
              id={shortRequestId(r.id)}
              source={r.source}
              office={r.memberOfficeId ? officeShort(r.memberOfficeId) : undefined}
              district={districtAr(r.districtSlug)}
              summary={r.typeLabelAr ?? r.type}
              detail={cardDetail(r, refStages, createdRefs)}
              extra={extra ? <span className="flex h-7 items-center justify-center whitespace-nowrap border-interactive bg-paper px-2 text-[11px] font-extrabold">{extra}</span> : undefined}
              href={ref ? `/admin/alliance/referrals?ref=${r.referralId}` : undefined}
              onClick={ref ? undefined : () => setQuery({ req: r.id }, "replace")}
              needsAction={stage === "new" || stage === "sent"}
              selected={selected?.id === r.id}
              closed={stage === "closed"}
            />
          );
        })}
      </>
    ),
  }));

  return (
    <G9Shell
      title={<RoomTitle section="الطلبات والمطابقات" />}
      subtitle="كل طلب يحمل مصدره. يُرسل لمن يغطي الحي مرتّبين بالميزان، وتصل عروضهم هنا، وSMQ تختار العرض وتنشئ سجل الإحالة"
      user={{ name: "نورة", role: "محررة", initial: "ن" }}
      inlineActions
      actions={
        <>
          <span className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 bg-sand px-2 py-1">
              <span aria-hidden className="hex-flat inline-block h-2 w-2.5 bg-gold" />
              {SOURCE_LABELS.visitor}
            </span>
            <span className="flex items-center gap-1.5 bg-ink px-2 py-1 text-paper">
              <span aria-hidden className="hex-flat inline-block h-2 w-2.5 bg-gold" />
              {SOURCE_LABELS.staff}
            </span>
            <span className="flex items-center gap-1.5 border-interactive px-2 py-1">
              <span aria-hidden className="hex-flat inline-block h-2 w-2.5 bg-ink" />
              {SOURCE_LABELS.member}
            </span>
          </span>
          <AdminButton variant="gold" size="md" onClick={() => setQuery({ new: "1" }, "replace")}>
            + طلب من الفريق
          </AdminButton>
        </>
      }
    >
      <AllianceTabs active="requests" />
      <StageBoard columns={columns} initial={selected?.stage ?? "offers"} />
      {selected && <Detail key={selected.id} r={selected} />}
      <NewRequestDrawer open={newOpen} onClose={() => setQuery({ new: null }, "replace")} />
    </G9Shell>
  );
}
