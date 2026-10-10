import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { PointDot } from "./HexCell";
import { daysLabel } from "./lib";

/**
 * The dispute frame (Admin-AllianceReferrals-D): a 2px gold border, a cream-focus header with the gold diamond and
 * «نزاع · REF-…», «مفتوح منذ 4 أيام», the claim and the counter as quoted blocks, the charter note and the actions.
 */
export interface DisputePanelProps {
  id: string;
  openedDaysAgo: number;
  /** «مكتب ج» */
  claimant: string;
  claim: ReactNode;
  /** «مكتب أ» */
  respondent: string;
  counter: ReactNode;
  /** the charter line under the quotes */
  note?: ReactNode;
  /** action buttons */
  actions?: ReactNode;
  className?: string;
}

export function DisputePanel({ id, openedDaysAgo, claimant, claim, respondent, counter, note, actions, className }: DisputePanelProps) {
  return (
    <section className={cx("flex flex-col bg-paper", className)} style={{ border: "2px solid var(--smq-gold)" }} aria-label={`نزاع ${id}`}>
      <header className="flex items-center justify-between gap-3 bg-cream-focus px-4 py-3 text-[14px] font-extrabold" style={{ borderBottom: "1.5px solid var(--smq-gold)" }}>
        <span className="flex items-center gap-2">
          <PointDot size={10} /> نزاع ·{" "}
          <span dir="ltr" className="inline-block tnum">
            {id}
          </span>
        </span>
        <span className="text-caption font-bold text-gold-text">مفتوح منذ {daysLabel(openedDaysAgo)}</span>
      </header>
      <div className="flex flex-col gap-2.5 px-4 py-3.5 text-[12px]">
        <div className="bg-cream px-3 py-2.5" style={{ borderInlineStart: "3px solid var(--smq-ink)" }}>
          <strong className="font-extrabold">{claimant}:</strong> {claim}
        </div>
        <div className="bg-cream px-3 py-2.5" style={{ borderInlineStart: "3px solid var(--smq-line)" }}>
          <strong className="font-extrabold">{respondent}:</strong> {counter}
        </div>
        {note && <p className="text-muted">{note}</p>}
        {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
      </div>
    </section>
  );
}
