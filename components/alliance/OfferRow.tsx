import type { ReactNode } from "react";
import { Price } from "@/components/ui/Price";
import { cx, fmtArea } from "@/lib/format";
import { fmtReply } from "./lib";

/** The header words over the offer rows (Admin-AllianceRequests-D). */
export function OfferRowsHeader({ className }: { className?: string }) {
  return (
    <div className={cx("hidden items-center gap-3 bg-cream px-4 py-2 text-caption font-extrabold text-muted md:grid md:grid-cols-[36px_1fr_1fr_1.2fr_150px]", className)}>
      <span />
      <span>المكتب</span>
      <span>العرض</span>
      <span>ملاحظة</span>
      <span />
    </div>
  );
}

export interface OfferRowProps {
  /** «مكتب ط» */
  office: string;
  replyMinutes?: number;
  priceSar?: number;
  areaM2?: number;
  note?: string;
  /** «عقد وساطة موثّق» or «مباشر من المالك» */
  brokered: boolean;
  selected?: boolean;
  onSelect?: () => void;
  /** radio group name */
  name?: string;
  /** the action beside the row («أنشئ سجل إحالة») */
  action?: ReactNode;
  className?: string;
}

/** One incoming offer: radio, office + reply time, price · area + brokerage chip, the note in quotes, an action. */
export function OfferRow({ office, replyMinutes, priceSar, areaM2, note, brokered, selected, onSelect, name = "offer", action, className }: OfferRowProps) {
  const inputId = `${name}-${office}`.replace(/\s+/g, "-");
  return (
    <div className={cx("grid grid-cols-[36px_1fr] items-center gap-x-3 gap-y-2 px-4 py-2.5 text-[12px] border-hairline border-t-0 md:grid-cols-[36px_1fr_1fr_1.2fr_150px] md:gap-3", selected && "bg-cream-focus", className)}>
      <span className="flex h-11 w-9 items-center justify-center">
        <input id={inputId} type="radio" name={name} checked={Boolean(selected)} onChange={onSelect} readOnly={!onSelect} aria-label={`اختر عرض ${office}`} className="h-5 w-5" style={{ accentColor: "var(--smq-ink)" }} />
      </span>
      <label htmlFor={inputId} className="cursor-pointer">
        <strong className="font-extrabold">{office}</strong>
        {replyMinutes != null && (
          <>
            <br />
            <span className="text-muted">ردّ خلال {fmtReply(replyMinutes)}</span>
          </>
        )}
      </label>
      <span className="col-start-2 md:col-start-auto">
        {priceSar != null && <strong className="font-extrabold"><Price value={priceSar} /></strong>}
        {areaM2 != null && <span className="tnum"> · {fmtArea(areaM2)} م²</span>}
        <br />
        <span className={cx("inline-block px-1.5 text-[10px] font-extrabold", brokered ? "bg-sand" : "border-hairline")}>{brokered ? "عقد وساطة موثّق" : "مباشر من المالك"}</span>
      </span>
      <span className="col-start-2 text-ink-2 md:col-start-auto">{note ? `«${note}»` : null}</span>
      <span className="col-start-2 flex justify-start md:col-start-auto">{action}</span>
    </div>
  );
}
