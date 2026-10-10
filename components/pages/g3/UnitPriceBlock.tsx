"use client";
// The unit page's price block (Unit-M/D, Unit-Reserved-M, Unit-Sold-M, Unit-Roof-M, EN-Unit-M): the figure with the
// riyal sign and the per-m² figure, then three cells (unit status · delivery · project status / available roofs).
// Available and reserved = ink with the large cut; sold = sand with the ink frame and «سعر البيع المعلن».
import type { ReactNode } from "react";
import { cx, fmtDate, fmtNum } from "@/lib/format";
import { Price } from "@/components/ui";
import type { UnitView } from "./view";
import { deliveryShort } from "./view";
import { HexDot, STATUS_WORD, statusTone } from "./parts";

const PROJECT_STATUS_EN: Record<string, string> = { "under-construction": "Under construction", ready: "Ready", planned: "Planned", draft: "Draft" };

function Cell({ value, caption, captionD, sold, first }: { value: ReactNode; caption: ReactNode; captionD?: ReactNode; sold?: boolean; first?: boolean }) {
  return (
    <div className={cx("flex flex-col gap-1 px-3.5 py-3 min-w-0", !first && (sold ? "border-s border-line" : "border-s border-ink-2"))}>
      <span className="text-label font-extrabold leading-snug">{value}</span>
      <span className={cx("text-caption font-normal leading-snug", sold ? "text-muted" : "text-on-ink-muted")}>
        {captionD ? (
          <>
            <span className="md:hidden">{caption}</span>
            <span className="hidden md:inline">{captionD}</span>
          </>
        ) : (
          caption
        )}
      </span>
    </div>
  );
}

export function UnitPriceBlock({ view, lang = "ar", className }: { view: UnitView; lang?: "ar" | "en"; className?: string }) {
  const { unit, status, ppm, project } = view;
  const en = lang === "en";
  const sold = status === "sold";
  const roof = unit.type === "roof-villa";

  const statusCell = (
    <Cell
      first
      sold={sold}
      value={
        status === "available" ? (
          STATUS_WORD.available[lang]
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <HexDot tone={statusTone(status, !sold)} />
            {STATUS_WORD[status][lang]}
          </span>
        )
      }
      caption={status === "reserved" && view.reservedUntil ? (en ? `Until ${fmtDate(view.reservedUntil)}` : `حتى ${fmtDate(view.reservedUntil)}`) : sold && view.soldOn ? fmtDate(view.soldOn) : en ? "Unit status" : "حالة الوحدة"}
    />
  );
  const deliveryCell = <Cell sold={sold} value={en ? deliveryShort(project, "en") : view.deliveryShort} caption={en ? "Expected delivery" : "التسليم المتوقع"} captionD={en ? undefined : "التسليم"} />;
  const thirdCell =
    roof && !en && !sold ? (
      <Cell sold={sold} value={`${view.roofs.available} من ${view.roofs.listed}`} caption="فلل الروف المتاحة" />
    ) : (
      <Cell sold={sold} value={en ? (PROJECT_STATUS_EN[project?.status ?? ""] ?? "") : view.projectStatusAr} caption={en ? "Project status" : "حالة المشروع"} captionD={en ? undefined : "المشروع"} />
    );

  return (
    <section aria-label={en ? "Price" : "السعر"} className={cx("cut-l", sold ? "bg-sand text-ink border-interactive" : "bg-ink text-paper", className)}>
      <div className="flex items-end justify-between gap-3 px-4 md:px-5 pt-5 pb-4">
        <span className="flex flex-col gap-1.5 min-w-0">
          {sold && <span className="text-caption font-bold text-muted">سعر البيع المعلن</span>}
          {en ? (
            <span className="inline-flex items-baseline gap-1.5" dir="ltr">
              <span className="text-price md:text-h1 leading-none tnum">{fmtNum(unit.priceSar)}</span>
              <span className="text-label font-semibold text-on-ink-muted">SAR</span>
            </span>
          ) : (
            /* Unit-D sets the figure at 40px: the h1 size from md, the price size on the phone */
            <Price value={unit.priceSar} className="text-price md:text-h1 leading-none" signClassName={sold ? "text-ink" : "text-gold"} />
          )}
        </span>
        <span className="flex flex-col items-end gap-0.5 text-end shrink-0">
          <span className={cx("text-h3 font-extrabold leading-none tnum", sold ? "text-ink" : "text-gold")}>{fmtNum(ppm)}</span>
          <span className={cx("text-caption font-normal", sold ? "text-muted" : "text-on-ink-muted")}>{en ? "per m²" : roof ? "للمتر مع التراس" : "للمتر المربع"}</span>
        </span>
      </div>
      <div className={cx("grid grid-cols-3 border-t", sold ? "border-line" : "border-ink-2")}>
        {statusCell}
        {deliveryCell}
        {thirdCell}
      </div>
    </section>
  );
}
