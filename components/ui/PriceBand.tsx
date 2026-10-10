// Price band · Components sheet §5 and the B-Card / unit page bands. Dark = ink with the gold per-m² figure,
// reserved = ink-2 with a white per-m² figure, sold = line frame, muted, struck-through price «بيعت 2026/09».
import type { ReactNode } from "react";
import { cx, fmtNum, ppm as calcPpm } from "@/lib/format";
import { Price } from "./Price";

export type PriceBandVariant = "dark" | "reserved" | "sold";

export interface PriceBandProps {
  price: number;
  /** price per m²; computed from `area` when omitted */
  ppm?: number;
  area?: number;
  variant?: PriceBandVariant;
  /** s = card band (h2 size) · m = B-Card (price-s) · l = unit page (price) */
  size?: "s" | "m" | "l";
  /** word after the per-m² figure: «للمتر» (cards) or «للمتر المربع» (unit) */
  ppmLabel?: string;
  /** sold variant caption, e.g. «بيعت 2026/09» */
  soldLabel?: string;
  /** large block cut (unit page: cut-l) */
  cut?: boolean;
  /** stacked per-m² (figure above label) as on the B-Card */
  stacked?: boolean;
  /** extra line under the band content */
  children?: ReactNode;
  className?: string;
  /** en: «690,000 SAR» as the EN boards print it (no riyal sign) */
  lang?: "ar" | "en";
}

export function PriceBand({ price, ppm, area, variant = "dark", size = "s", ppmLabel = "للمتر المربع", soldLabel, cut, stacked, children, className, lang = "ar" }: PriceBandProps) {
  const perM = ppm ?? (area ? calcPpm(price, area) : undefined);
  const priceCls = size === "s" ? "text-h2" : size === "m" ? "text-price-s" : "text-price";
  if (variant === "sold") {
    return (
      <div className={cx("flex items-center justify-between gap-3 px-3.5 py-2.5 border-[1.5px] border-line text-muted", className)}>
        <Price value={price} sign={false} className={cx("font-extrabold leading-none line-through", size === "s" ? "text-h3" : "text-h2")} />
        {soldLabel && <span className="text-caption">{soldLabel}</span>}
        {children}
      </div>
    );
  }
  const reserved = variant === "reserved";
  return (
    <div className={cx("flex items-center justify-between gap-3 px-3.5", size === "l" ? "py-5" : size === "m" ? "py-3.5" : "py-2.5", reserved ? "bg-ink-2 text-paper" : "bg-ink text-paper", cut && "cut-l", className)}>
      {lang === "en" ? (
        <span className={cx("leading-none tnum whitespace-nowrap", priceCls)} dir="ltr">
          {fmtNum(price)} <span className={cx("text-label font-bold", reserved ? "text-on-ink-muted" : "text-gold")}>SAR</span>
        </span>
      ) : (
        <Price value={price} className={cx("leading-none", priceCls)} signClassName={reserved ? "text-on-ink-muted" : "text-gold"} />
      )}
      {perM !== undefined &&
        (stacked ? (
          <span className="flex flex-col items-end leading-tight text-end">
            <span className={cx("font-extrabold tnum", size === "l" ? "text-ppm" : "text-body", reserved ? "text-paper" : "text-gold")}>{fmtNum(perM)}</span>
            <span className="text-caption text-on-ink-muted">{ppmLabel}</span>
          </span>
        ) : (
          <span className="text-caption text-on-ink-muted whitespace-nowrap">
            <strong className={cx("tnum", size === "l" ? "text-ppm" : "text-label", reserved ? "text-paper" : "text-gold")}>{fmtNum(perM)}</strong> {ppmLabel}
          </span>
        ))}
      {children}
    </div>
  );
}
