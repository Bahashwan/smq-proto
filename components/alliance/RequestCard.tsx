import type { ReactNode } from "react";
import type { RequestStage } from "@/data/types";
import { cx } from "@/lib/format";
import { A } from "./A";
import { SourceTag } from "./Pills";
import { budgetLabel, REQUEST_STAGE_WORD, type RequestSource } from "./lib";

/**
 * «بطاقة الطلب». Board form: source tag, «REQ-0412 · الفيصلية · شقة 4 غرف», a detail line. Needs-action cards carry a
 * 5px gold rule at the inline start, the selected card a 2px gold outline, closed cards go muted with a line border.
 * Member form (phone): the gold banner «طلب جديد في حي تغطيه · …» and three tiles; never a buyer's name or number.
 */
export interface RequestCardProps {
  id: string;
  source: RequestSource;
  /** member source: the office name after «مكتب عضو ·» */
  office?: string;
  /** district name in Arabic */
  district: string;
  /** «شقة 4 غرف» · «أرض مطورة» */
  summary: string;
  budgetMin?: number;
  budgetMax?: number;
  /** preformatted budget overrides the numbers («700k إلى 1M») */
  budget?: string;
  beds?: number;
  timing?: string;
  stage?: RequestStage;
  offersCount?: number;
  /** the detail line, verbatim from the page; default: budget · stage word · offers */
  detail?: ReactNode;
  /** a third line (e.g. «أقرب تغطية: الشاطئ، مكتب ج» or an action) */
  extra?: ReactNode;
  href?: string;
  onClick?: () => void;
  needsAction?: boolean;
  selected?: boolean;
  closed?: boolean;
  /** the phone summary card for members */
  variant?: "board" | "member";
  /** narrow board columns: the id alone as the title, «district · summary» as the detail */
  compact?: boolean;
  /** member: the banner text before «· district · summary» */
  banner?: string;
  /** member tile words */
  tileLabels?: { budget?: string; beds?: string; timing?: string };
  className?: string;
}

export function RequestCard(p: RequestCardProps) {
  const { id, source, office, district, summary, budgetMin, budgetMax, budget, beds, timing, stage, offersCount, detail, extra, href, onClick, needsAction, selected, closed, variant = "board", compact, banner, tileLabels, className } = p;
  const budgetText = budget ?? budgetLabel(budgetMin, budgetMax);
  if (variant === "member") {
    const L = { budget: tileLabels?.budget ?? "الميزانية", beds: tileLabels?.beds ?? "الغرف", timing: tileLabels?.timing ?? "التوقيت" };
    return (
      <div className={cx("bg-paper border-interactive", className)}>
        <div className="bg-gold px-3 py-2.5 text-[12px] font-extrabold text-ink" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 12px 100%, 0 calc(100% - 21px))" }}>
          {banner ?? "طلب جديد في حي تغطيه"} · {district} · {summary}
        </div>
        <div className="grid grid-cols-3 gap-1.5 px-3 py-2.5 text-caption">
          <div className="bg-sand px-2 py-1.5">
            <small className="block text-muted">{L.budget}</small>
            <strong className="tnum">{budgetText}</strong>
          </div>
          <div className="bg-sand px-2 py-1.5">
            <small className="block text-muted">{L.beds}</small>
            <strong className="tnum">{beds ?? "—"}</strong>
          </div>
          <div className="bg-sand px-2 py-1.5">
            <small className="block text-muted">{L.timing}</small>
            <strong>{timing ?? "—"}</strong>
          </div>
        </div>
      </div>
    );
  }
  const line =
    detail ??
    (compact
      ? `${district} · ${summary}`
      : [budgetText, stage ? REQUEST_STAGE_WORD[stage] : null, offersCount != null && offersCount > 0 ? (offersCount === 1 ? "وصل عرض" : `${offersCount} عروض`) : null].filter(Boolean).join(" · "));
  const body = (
    <>
      <SourceTag source={source} office={office} short={compact} />
      <b className={cx("text-[13px] font-extrabold", closed && "text-ink")}>
        <span dir="ltr" className="inline-block whitespace-nowrap tnum">
          {id}
        </span>
        {!compact && <> · {district} · {summary}</>}
      </b>
      {line && <small className={cx("text-caption leading-normal", closed ? "text-muted" : "text-muted")}>{line}</small>}
      {extra && <span className="mt-1 text-caption">{extra}</span>}
    </>
  );
  const cls = cx(
    "flex flex-col gap-1 bg-paper px-3 py-2.5 text-[12px] text-start no-underline",
    closed ? "border-hairline text-muted" : "border-interactive text-ink",
    selected && "outline-2 outline-gold -outline-offset-2 outline",
    className,
  );
  const rule = needsAction ? { borderInlineStart: "5px solid var(--smq-gold)" } : undefined;
  if (onClick) {
    return (
      <button type="button" className={cx(cls, "w-full cursor-pointer")} style={rule} onClick={onClick} aria-pressed={selected ?? false}>
        {body}
      </button>
    );
  }
  if (href) {
    return (
      <A href={href} className={cls} style={rule} aria-current={selected ? "true" : undefined}>
        {body}
      </A>
    );
  }
  return (
    <div className={cls} style={rule}>
      {body}
    </div>
  );
}
