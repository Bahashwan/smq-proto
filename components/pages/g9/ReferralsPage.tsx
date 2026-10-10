"use client";
// /admin/alliance/referrals (Admin-AllianceReferrals-D, `?ref=` highlights a record and preselects it in the form).
// Every referral record (the fixtures plus the ones created in this session, e.g. REF-2026-0117 from the requests
// page) with its stage line, value, split, protection left and dispute flag; the dispute panel on REF-2026-0098 and
// the stage update form. Stage changes go to the store (setReferralStage) and recompute the tiles.
import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminButton, AdminField, AdminSelect } from "@/components/admin";
import { DisputeFlag, DisputePanel, ProtectionMeter, REFERRAL_STAGE_INDEX, REFERRAL_STAGE_WORD, StageLine } from "@/components/alliance";
import { Mark, MarkedText, Price } from "@/components/ui";
import { districtAr } from "@/data/districts";
import { officeById } from "@/data/offices";
import { REFERRAL_STAGES } from "@/data/referrals";
import { requestById } from "@/data/requests";
import { allianceSettings } from "@/data/settings";
import { effectiveReferralStage, protectionDaysLeft, referralSummary } from "@/data/selectors";
import type { Referral, ReferralStage } from "@/data/types";
import { useQuery } from "@/lib/location";
import { usePatch, useStore } from "@/lib/store";
import { cx, fmtDate, fmtNum } from "@/lib/format";
import { AllianceTabs, G9Shell, RoomTitle } from "./shell";
import { officeShort } from "./util";

const ONGOING: ReferralStage[] = ["intro", "viewing", "negotiation"];

/** «شقة 4 غرف» from the request, else from the record's summary without the district and the budget. */
function kindOf(r: Referral): string {
  const req = requestById(r.requestId);
  if (req?.typeLabelAr) return req.typeLabelAr;
  const district = districtAr(r.districtSlug);
  return r.summary
    .split(" · ")
    .filter((p) => p !== district && !p.startsWith("حتى"))
    .join(" ");
}
/** The member whose page shows the receipt: the requesting office, or the offering one when SMQ asked. */
const memberView = (r: Referral) => (r.requesterOfficeId !== "SMQ" ? r.requesterOfficeId : r.offerOfficeId);

function Tile({ label, children, rule, ink }: { label: string; children: React.ReactNode; rule?: boolean; ink?: boolean }) {
  return (
    <div className={cx("relative flex min-w-0 flex-col gap-2 px-5 py-[18px]", ink ? "cut-m bg-ink text-paper" : "border-interactive bg-paper")}>
      {rule && <span aria-hidden className="absolute inset-y-0 start-0 w-[5px] bg-gold" />}
      <small className={cx("text-[12px] font-bold", ink ? "text-on-ink-muted" : "text-muted")}>{label}</small>
      <b className={cx("whitespace-nowrap text-[20px] font-extrabold leading-none tnum xl:text-[24px]", ink && "text-gold")}>{children}</b>
    </div>
  );
}

export function ReferralsPage() {
  const q = useQuery();
  const stages = useStore((s) => s.referralStages);
  const created = useStore((s) => s.createdReferrals);
  const setReferralStage = useStore((s) => s.setReferralStage);
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const disputePatch = useStore((s) => s.patches["referral-dispute"]);
  const finals = useStore((s) => s.patches["referral-final"]);
  const splits = useStore((s) => s.patches["referral-split"]);
  const [stageFilter, setStageFilter] = useState<ReferralStage | "">("");
  const [disputesOnly, setDisputesOnly] = useState(false);
  const sum = useMemo(() => referralSummary(stages, created), [stages, created]);
  const st = (r: Referral) => effectiveReferralStage(r, stages);
  const openDispute = (r: Referral) => !!r.dispute && ONGOING.includes(st(r)) && !(disputePatch?.[r.id] as { resolved?: string } | undefined)?.resolved;
  const all = useMemo(() => [...sum.all].sort((a, b) => ((a.createdAt ?? a.introducedOn) < (b.createdAt ?? b.introducedOn) ? 1 : -1)), [sum.all]);
  const rows = all.filter((r) => (!stageFilter || st(r) === stageFilter) && (!disputesOnly || openDispute(r)));
  const refParam = q.get("ref")?.toUpperCase() ?? null;
  const ongoing = all.filter((r) => ONGOING.includes(st(r)));
  const dispute = all.find(openDispute);
  const openDisputes = all.filter(openDispute).length;

  // stage update form
  const [formId, setFormId] = useState<string | null>(null);
  const pick = all.find((r) => r.id === (formId ?? refParam));
  const current = pick && ONGOING.includes(st(pick)) ? pick : ongoing[0];
  const nextStage = (r?: Referral): ReferralStage => (r ? (REFERRAL_STAGES[Math.min(3, REFERRAL_STAGE_INDEX[st(r)] + 1)] as ReferralStage) : "negotiation");
  const [newStage, setNewStage] = useState<ReferralStage | null>(null);
  const [finalValue, setFinalValue] = useState("");
  const [confirm, setConfirm] = useState<[boolean, boolean]>([true, false]);
  const [splitEdit, setSplitEdit] = useState(false);
  const stageToSet = newStage ?? nextStage(current);
  const splitPatch = usePatch<{ split?: string }>("referral-split", dispute?.id ?? "");

  const submit = () => {
    if (!current) return;
    if (stageToSet === "transfer" && !finalValue.trim()) return;
    const note = stageToSet === "transfer" ? `أُفرغت · ${fmtNum(Number(finalValue.replace(/\D/g, "")) || 0)}` : REFERRAL_STAGE_WORD[stageToSet];
    setReferralStage(current.id, stageToSet, note);
    if (stageToSet === "transfer") patch("referral-final", current.id, { value: Number(finalValue.replace(/\D/g, "")) || 0 });
    toast(`حُدّث ${current.id} إلى «${REFERRAL_STAGE_WORD[stageToSet]}» · أُرسلت نسخة للمكتبين`);
    setNewStage(null);
    setFinalValue("");
  };

  return (
    <G9Shell
      title={<RoomTitle section="الإحالات والصفقات" />}
      subtitle={<MarkedText text="كل سجل إحالة: المرحلة، القيمة، التقسيم، أيام الحماية المتبقية، وعلم النزاع. التقسيم والحماية افتراضيان من الميثاق [للتأكيد]" />}
      actions={
        <>
          <select aria-label="المرحلة" value={stageFilter} onChange={(e) => setStageFilter(e.target.value as ReferralStage | "")} className="h-10 border-interactive bg-paper px-3 text-[12px] font-bold">
            <option value="">كل المراحل</option>
            {REFERRAL_STAGES.map((s) => (
              <option key={s} value={s}>
                {REFERRAL_STAGE_WORD[s]}
              </option>
            ))}
          </select>
          <label className="flex h-10 items-center gap-2 border-interactive bg-paper px-3 text-[12px] font-bold">
            <input type="checkbox" className="size-4 accent-ink" checked={disputesOnly} onChange={(e) => setDisputesOnly(e.target.checked)} />
            النزاعات فقط
          </label>
          <AdminButton variant="outline" size="md" onClick={() => toast("صُدّر ملف الإحالات · smq-alliance-referrals.csv")}>
            تصدير CSV
          </AdminButton>
        </>
      }
    >
      <AllianceTabs active="referrals" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Tile label="سجلات جارية">{fmtNum(sum.ongoing.length)}</Tile>
        <Tile label="قيمة الصفقات الجارية">
          <Price value={sum.ongoingValue} />
        </Tile>
        <Tile label="أُفرغت منذ الإطلاق">
          <span className="inline-flex items-baseline gap-1.5">
            {fmtNum(sum.transferred.length)} · <Price value={sum.transferredValue} />
          </span>
        </Tile>
        <Tile label="نزاعات مفتوحة" rule={openDisputes > 0}>
          {fmtNum(openDisputes)}
        </Tile>
        <Tile label="عمولة التحالف المقدّرة" ink>
          <Mark>[للتأكيد]</Mark>
        </Tile>
      </div>

      <div className="overflow-x-auto border-interactive bg-paper">
        <table className="w-full min-w-[1000px] border-collapse text-[12px]">
          <thead>
            <tr className="border-b-[1.5px] border-ink bg-sand text-[11px] font-extrabold text-muted">
              {["السجل", "الطلب والعرض", "المكتبان", "المرحلة", "القيمة", "التقسيم", "الحماية المتبقية", "نزاع", ""].map((h, i) => (
                <th key={i} scope="col" className="whitespace-nowrap px-3 py-3.5 text-start font-extrabold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const s = st(r);
              const closedRow = s === "transfer" || s === "failed";
              const disp = openDispute(r);
              const label = stages[r.id]?.note && stages[r.id]?.stage === s ? stages[r.id].note : r.stage === s ? r.stageLabelAr ?? REFERRAL_STAGE_WORD[s] : REFERRAL_STAGE_WORD[s];
              const finalPatch = finals?.[r.id] as { value?: number } | undefined;
              const value = s === "transfer" ? finalPatch?.value ?? r.finalValueSar ?? r.valueSar : r.valueSar;
              const split = (splits?.[r.id] as { split?: string } | undefined)?.split || r.split;
              const sel = refParam === r.id;
              return (
                <tr key={r.id} className={cx("border-b border-line last:border-b-0", disp ? "bg-cream-focus" : "hover:bg-cream", closedRow && "text-muted", sel && "outline-2 -outline-offset-2 outline-gold")}>
                  <td className="px-3 py-3.5">
                    <strong className="block whitespace-nowrap font-extrabold text-ink" dir="ltr" style={{ textAlign: "right" }}>
                      {r.id}
                    </strong>
                    <span className="text-muted">{fmtDate(r.introducedOn)}</span>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className={cx(!closedRow && "text-ink")}>{`${districtAr(r.districtSlug)} · ${kindOf(r)}`}</span>
                    <br />
                    <span className="text-muted">{`عرض ${r.offerAreaM2 ?? ""} م² · ${r.brokered ? "موثّق" : "مباشر من المالك"}`}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">{`${officeShort(r.requesterOfficeId)} ↔ ${officeShort(r.offerOfficeId)}`}</td>
                  <td className="px-3 py-3.5">
                    <StageLine compact current={s === "failed" ? 2 : REFERRAL_STAGE_INDEX[s]} failedAt={s === "failed" ? 2 : undefined} closed={s === "transfer"} word={label} />
                  </td>
                  <td className="px-3 py-3.5">
                    <strong className={cx("font-extrabold", s === "failed" ? "font-bold text-muted" : "text-ink")}>{r.noCommission ? fmtNum(value) : <Price value={value} />}</strong>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5">
                    {r.noCommission ? "لا عمولة" : split}
                    {r.splitTbc && !closedRow && (
                      <>
                        {" "}
                        <Mark>[للتأكيد]</Mark>
                      </>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    <ProtectionMeter daysLeft={protectionDaysLeft(r, undefined, s)} total={r.protectionDays} label={s === "transfer" ? "انتهت بالإفراغ" : s === "failed" ? "أُغلقت" : undefined} />
                  </td>
                  <td className="px-3 py-3.5">{disp && r.dispute ? <DisputeFlag days={r.dispute.openedDaysAgo} /> : null}</td>
                  <td className="px-3 py-3.5 text-end">
                    {disp ? (
                      <a href="#dispute" className="inline-flex h-9 items-center bg-ink px-3.5 text-[12px] font-extrabold text-paper no-underline hover:bg-ink-2">
                        افصل
                      </a>
                    ) : (
                      <Link href={`/member/${memberView(r)}/referrals/${r.id}`} className="inline-flex h-9 items-center border-interactive bg-paper px-3.5 text-[12px] font-extrabold text-ink no-underline hover:bg-sand">
                        افتح
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        {dispute && dispute.dispute ? (
          <div id="dispute" className="scroll-mt-24">
            <DisputePanel
              id={dispute.id}
              openedDaysAgo={dispute.dispute.openedDaysAgo}
              claimant={officeShort(dispute.offerOfficeId)}
              claim={dispute.dispute.claim}
              respondent={officeShort(dispute.requesterOfficeId)}
              counter={dispute.dispute.counter}
              note={<MarkedText text={`الميثاق: التعارف مسجّل ${fmtDate(dispute.introducedOn)}، والحماية ${dispute.protectionDays} يوماً تشمل أي صفقة على نفس العقار مع نفس المشتري [للتأكيد]. تخطّي السجل سبب للإخراج.`} />}
              actions={
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-2">
                    <AdminButton
                      variant="ink"
                      size="md"
                      onClick={() => {
                        patch("referral-dispute", dispute.id, { resolved: "kept" });
                        toast(`أُبقي السجل والتقسيم · ${dispute.id} · أُرسل القرار للمكتبين`);
                      }}
                    >
                      أبقِ السجل والتقسيم
                    </AdminButton>
                    <AdminButton variant="outline" size="md" onClick={() => setSplitEdit((v) => !v)} aria-expanded={splitEdit}>
                      عدّل التقسيم
                    </AdminButton>
                    <AdminButton
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setReferralStage(dispute.id, "failed", "لم تتم · بقرار SMQ");
                        toast(`حُوّل ${dispute.id} إلى «لم تتم»`);
                      }}
                    >
                      حوّل إلى «لم تتم»
                    </AdminButton>
                    <AdminButton
                      variant="outline"
                      size="md"
                      onClick={() => toast([dispute.requesterOfficeId, dispute.offerOfficeId].map((id) => `${officeById(id)?.nameAr ?? id} · ${officeById(id)?.phoneMasked ?? ""}`).join(" · "), { kind: "info" })}
                    >
                      راسل الطرفين
                    </AdminButton>
                  </div>
                  {splitEdit && (
                    <AdminSelect
                      label="التقسيم"
                      value={splitPatch?.split ?? dispute.split}
                      onChange={(e) => {
                        patch("referral-split", dispute.id, { split: e.target.value });
                        patch("referral-dispute", dispute.id, { split: e.target.value });
                        toast(`عُدّل التقسيم إلى ${e.target.value} · ${dispute.id}`);
                      }}
                    >
                      {allianceSettings.defaults.splitOptions.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </AdminSelect>
                  )}
                </div>
              }
            />
          </div>
        ) : (
          <div />
        )}

        <section className="flex min-w-0 flex-col border-interactive bg-paper" aria-labelledby="stage-form">
          <h2 id="stage-form" className="border-b-[1.5px] border-ink bg-sand px-3 py-3.5 text-[14px] font-extrabold">
            تحديث مرحلة سجل
          </h2>
          {current ? (
            <div className="flex flex-col gap-3 p-4 text-[12px]">
              <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
                <AdminSelect
                  label="السجل"
                  value={current.id}
                  onChange={(e) => {
                    setFormId(e.target.value);
                    setNewStage(null);
                  }}
                >
                  {ongoing.map((r) => (
                    <option key={r.id} value={r.id}>{`${r.id} · ${REFERRAL_STAGE_WORD[st(r)]}`}</option>
                  ))}
                </AdminSelect>
                <AdminSelect label="المرحلة الجديدة" value={stageToSet} onChange={(e) => setNewStage(e.target.value as ReferralStage)}>
                  {REFERRAL_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {REFERRAL_STAGE_WORD[s]}
                    </option>
                  ))}
                </AdminSelect>
                <AdminField
                  label="القيمة النهائية (عند الإفراغ)"
                  placeholder="ريال"
                  ltr
                  inputMode="numeric"
                  disabled={stageToSet !== "transfer"}
                  value={finalValue}
                  onChange={(e) => setFinalValue(e.target.value)}
                  error={stageToSet === "transfer" && !finalValue.trim() ? "اكتب القيمة النهائية" : undefined}
                />
                <fieldset className="flex flex-col gap-1.5">
                  <legend className="text-[12px] font-bold text-muted">تأكيد الطرفين</legend>
                  <span className="flex flex-wrap gap-4 pt-2">
                    {[0, 1].map((i) => (
                      <label key={i} className="flex min-h-11 items-center gap-2 font-bold" aria-label={`تأكيد ${officeShort(i === 0 ? current.requesterOfficeId : current.offerOfficeId)}`}>
                        <input
                          type="checkbox"
                          className="size-4 accent-ink"
                          checked={confirm[i]}
                          onChange={(e) => setConfirm((c) => (i === 0 ? [e.target.checked, c[1]] : [c[0], e.target.checked]))}
                        />
                        {`المكتب ${i + 1}`}
                      </label>
                    ))}
                  </span>
                </fieldset>
              </div>
              <AdminButton variant="gold" size="lg" className="self-start" disabled={stageToSet === "transfer" && !finalValue.trim()} onClick={submit}>
                حدّث وأرسل للمكتبين
              </AdminButton>
              <span className="text-muted">كل تحديث يُسجَّل باسم من حدّثه ويُرسل نسخة من السجل المحدّث للمكتبين على واتساب.</span>
            </div>
          ) : (
            <p className="p-4 text-[12px] text-muted">لا سجلات جارية</p>
          )}
        </section>
      </div>
    </G9Shell>
  );
}
