import type { ReactNode } from "react";
import type { Referral } from "@/data/types";
import { LogoMark } from "@/components/ui";
import { cx, fmtDate } from "@/lib/format";
import { HexDot, PointDot } from "./HexCell";
import { StageLine } from "./StageLine";
import { Tbc } from "./Tbc";
import { addDays, daysLabel, REFERRAL_STAGE_INDEX } from "./lib";

/** «نزاع · 4 أيام»: a gold pointed hexagon with the word and the duration; in tables and atop the record. */
export function DisputeFlag({ days, className }: { days: number; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1 whitespace-nowrap px-[7px] py-0.5 text-[10px] font-extrabold text-gold-text", className)} style={{ border: "1.5px solid var(--smq-gold)" }}>
      <PointDot size={8} /> نزاع · {daysLabel(days)}
    </span>
  );
}

export interface ReceiptParty {
  /** «SMQ العقارية» · «مكتب ط للعقارات» */
  name: string;
  /** «فال 1200040135» · «فال 1200XXXXXX · موثّقة» */
  licence: string;
}

export interface ReferralReceiptProps {
  referral: Referral;
  /** «صاحب الطلب» (SMQ or the requesting office) */
  requester: ReceiptParty;
  /** «صاحب العرض» */
  offerer: ReceiptParty;
  /** district name in Arabic (kept for pages that build their own lines) */
  district?: string;
  /** compact «الطلب» row; default `referral.summary` */
  requestLine?: string;
  /** compact «العرض» row; default `referral.offerSummary` */
  offerLine?: string;
  /** «14:35» · printed as «2026/10/10 · 14:35 · توقيت جدة» */
  time?: string;
  /** «فريق SMQ · نورة» */
  createdBy?: string;
  /** «زائر SMQ بلا نتائج» */
  requestSource?: string;
  /** «2026/10/10 · 10:42» */
  offerSentAt?: string;
  /** «موثّق في موقع الهيئة» · default from `referral.brokered` */
  brokerageLine?: string;
  /** «النسخة 1.0 · وافق عليه المكتبان» */
  charterLine?: string;
  /** note under the stage line; default `referral.stageNote` */
  stageNote?: ReactNode;
  /** the slot where a failed record stopped */
  failedAt?: number;
  /** the Components3 form: five dotted rows, no party tiles */
  compact?: boolean;
  /** brand mark slot; default: the gold logo mark from components/ui */
  mark?: ReactNode;
  /** reference date for «[للتأكيد]» marks and the compact «المكتبان» line: short office names («SMQ ↔ مكتب ط») */
  parties?: string;
  className?: string;
}

function Row({ k, v, gold }: { k: string; v: ReactNode; gold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 text-[13px]" style={{ borderBottom: "1px dashed var(--smq-line)" }}>
      <span className="text-muted">{k}</span>
      <span className={cx("text-end font-extrabold tnum", gold && "text-gold-text")}>{v}</span>
    </div>
  );
}
function Sec({ children }: { children: ReactNode }) {
  return <span className="block pt-3.5 pb-1 text-caption font-extrabold text-gold-text">{children}</span>;
}

export function ReferralReceipt(p: ReferralReceiptProps) {
  const { referral: r, requester, offerer, requestLine, offerLine, time, createdBy, requestSource, offerSentAt, brokerageLine, charterLine, stageNote, failedAt, compact, mark, parties, className } = p;
  const stageIdx = REFERRAL_STAGE_INDEX[r.stage];
  const failed = r.stage === "failed";
  const failSlot = failed ? (failedAt ?? 2) : undefined;
  const until = addDays(r.introducedOn, r.protectionDays);
  const brand = mark ?? <LogoMark size={28} />;
  const id = (
    <span dir="ltr" className="inline-block text-start tnum">
      {r.id}
    </span>
  );
  const stage = <StageLine current={Math.min(stageIdx, 3)} failedAt={failSlot} closed={r.stage === "transfer"} />;
  if (compact) {
    return (
      <article className={cx("flex flex-col bg-paper border-interactive", className)}>
        <div className="flex items-center justify-between gap-3 px-3.5 py-3" style={{ borderBottom: "2px solid var(--smq-ink)" }}>
          <span className="flex flex-col">
            <span className="text-[10px] font-bold text-gold-text">سجل إحالة · تحالف مكاتب جدة</span>
            <span className="text-h3 tnum">{id}</span>
          </span>
          {brand}
        </div>
        <div className="px-3.5 pt-1 pb-2.5 text-[12px]">
          <Row k="التاريخ" v={time ? `${fmtDate(r.introducedOn)} · ${time}` : fmtDate(r.introducedOn)} />
          <Row k="المكتبان" v={parties ?? `${requester.name} ↔ ${offerer.name}`} />
          <Row k="الطلب" v={requestLine ?? r.summary} />
          <Row k="العرض" v={offerLine ?? r.offerSummary} />
          <Row
            k="التقسيم · الحماية"
            gold
            v={
              <>
                {r.split.replace(/\s/g, "")} · {daysLabel(r.protectionDays)} {r.splitTbc && <Tbc />}
              </>
            }
          />
        </div>
        <div className="px-3.5 py-2.5" style={{ borderTop: "2px solid var(--smq-ink)" }}>
          {stage}
        </div>
        <div className="flex items-center justify-between gap-3 bg-ink px-3.5 py-1.5 text-[10px] text-on-ink-muted">
          <span>مرجع العمولة وفترة الحماية</span>
          <span className="font-extrabold text-gold">{id}</span>
        </div>
      </article>
    );
  }
  return (
    <article className={cx("flex flex-col bg-paper border-interactive", className)}>
      <div className="flex items-center justify-between gap-3 px-4 py-3.5" style={{ borderBottom: "2px solid var(--smq-ink)" }}>
        <div className="flex flex-col gap-0.5">
          <span className="text-caption font-bold text-gold-text">سجل إحالة · تحالف مكاتب جدة العقارية</span>
          <h1 className="text-[24px] font-extrabold leading-tight">{id}</h1>
        </div>
        {brand}
      </div>
      <div className="px-4 pb-3">
        <Row k="التاريخ والوقت" v={`${fmtDate(r.introducedOn)}${time ? ` · ${time}` : ""} · توقيت جدة`} />
        {createdBy && <Row k="أنشأه" v={createdBy} />}
        <Row k="مرجع الطلب" v={<span dir="ltr" className="inline-block">{r.requestId}</span>} />
        <Sec>المكتبان</Sec>
        <div className="grid items-center gap-1.5" style={{ gridTemplateColumns: "1fr 24px 1fr" }}>
          <div className="flex flex-col gap-0.5 bg-sand px-3 py-2.5">
            <span className="text-[10px] text-muted">صاحب الطلب</span>
            <span className="text-[14px] font-extrabold">{requester.name}</span>
            <span className="text-[10px] text-muted tnum">{requester.licence}</span>
          </div>
          <HexDot size={22} tone="gold" className="justify-self-center" />
          <div className="flex flex-col gap-0.5 bg-sand px-3 py-2.5">
            <span className="text-[10px] text-muted">صاحب العرض</span>
            <span className="text-[14px] font-extrabold">{offerer.name}</span>
            <span className="text-[10px] text-muted tnum">{offerer.licence}</span>
          </div>
        </div>
        <Sec>الطلب</Sec>
        <Row k="ملخّص" v={r.summary} />
        {requestSource && <Row k="المصدر" v={requestSource} />}
        <Sec>العرض</Sec>
        <Row k="ملخّص" v={r.offerSummary} />
        <Row k="عقد الوساطة" v={brokerageLine ?? (r.brokered ? "موثّق في موقع الهيئة" : "مباشر من المالك")} />
        {offerSentAt && <Row k="أُرسل العرض" v={offerSentAt} />}
        <Sec>الاتفاق</Sec>
        <Row
          k="تقسيم العمولة"
          gold
          v={
            <>
              {r.split} {r.splitTbc && <Tbc />}
            </>
          }
        />
        <Row
          k="فترة الحماية"
          gold
          v={
            <>
              {daysLabel(r.protectionDays)} حتى {fmtDate(until)} {r.splitTbc && <Tbc />}
            </>
          }
        />
        {charterLine && <Row k="الميثاق" v={charterLine} />}
      </div>
      <div className="flex flex-col gap-2.5 px-4 py-3" style={{ borderTop: "2px solid var(--smq-ink)" }}>
        <span className="text-[12px] font-extrabold">المرحلة</span>
        {stage}
        {(stageNote ?? r.stageNote) && <span className="text-caption text-muted">{stageNote ?? r.stageNote}</span>}
      </div>
      <div className="flex items-center justify-between gap-3 bg-ink px-4 py-2 text-[10px] text-on-ink-muted">
        <span>هذا السجل مرجع التحالف للعمولة وفترة الحماية. التعديل بعلم المكتبين فقط.</span>
        <span className="shrink-0 font-extrabold text-gold">{id}</span>
      </div>
    </article>
  );
}
