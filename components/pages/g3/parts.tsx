"use client";
// Small pieces the unit, gallery, plan and compare pages share: the spec section with its gold hexagon heading,
// key/value rows, value + [للتأكيد] chip, status hexagons, number tiles, the two-line WhatsApp call to action and
// the bordered «قارن» box. Tokens only.
import type { ReactNode } from "react";
import Link from "next/link";
import { cx, waLink } from "@/lib/format";
import { Mark, WhatsAppIcon, useCompare } from "@/components/ui";
import type { UnitStatus } from "@/data/types";

/** Section of the spec grid: «الموقع», «الوحدة», «السعر» … with the small gold hexagon and the ink rule. */
export function SpecSection({ title, children, className, id }: { title: string; children: ReactNode; className?: string; id?: string }) {
  return (
    <section aria-labelledby={id} className={cx("flex flex-col min-w-0", className)}>
      <h2 id={id} className="m-0 flex items-center gap-2 pb-2.5 border-b-[1.5px] border-ink text-h3 leading-tight">
        <span aria-hidden className="size-2.5 shrink-0 hex-point bg-gold" />
        {title}
      </h2>
      {children}
    </section>
  );
}

/** A key/value row: muted label at the start, bold value at the end, hairline under it (Unit-D rows are taller). */
export function KV({ label, children, strong, muted, only, stack, compact, className, valueClassName }: { label: ReactNode; children: ReactNode; strong?: boolean; muted?: boolean; /** show the row only on the phone or only from md */ only?: "phone" | "md"; /** label over the value on the phone (Unit-M «مميزات جوهرية أخرى», «مميزات إضافية») */ stack?: boolean; /** the Latin rows of EN-Unit-M: 10px padding, normal line height */ compact?: boolean; className?: string; valueClassName?: string }) {
  const display = only === "md" ? "hidden md:flex" : only === "phone" ? "flex md:hidden" : "flex";
  return (
    <div className={cx(display, stack ? "flex-col items-start gap-1 md:flex-row md:justify-between md:gap-4" : "items-start justify-between gap-4", compact ? "py-2.5" : "py-3 md:py-3.5", "border-b border-line text-label", className)}>
      <span className="shrink-0 font-normal text-muted">{label}</span>
      <span className={cx("min-w-0 tnum", compact ? "leading-normal" : "leading-relaxed", stack ? "text-start md:text-end" : "text-end", strong ? "font-extrabold" : valueClassName?.includes("font-") ? "" : "font-bold", muted && "text-muted", valueClassName)}>{children}</span>
    </div>
  );
}

/** «الثالث» + the [للتأكيد] chip when the fixture marks the value unconfirmed. */
export function Val({ text, tbc, chip = "للتأكيد" }: { text?: ReactNode; tbc?: boolean; chip?: string }) {
  return (
    <>
      {text}
      {tbc && <Mark className={text ? undefined : "ms-0"}>{chip}</Mark>}
    </>
  );
}

/** A value that is only a chip on the boards («[اختياري]», «[للتأكيد من المطوّر]»). */
export function ChipOnly({ children }: { children: string }) {
  return <Mark className="ms-0">{children}</Mark>;
}

export type HexTone = "gold" | "ink" | "paper" | "ring";
/** Status hexagon: gold = متاح, white with an ink ring = محجوز (on paper), white = محجوز (on ink), ink = مباع. */
export function HexDot({ tone, flat, dims = "size-3", className }: { tone: HexTone; /** flat-topped (the notice icons) */ flat?: boolean; /** size classes */ dims?: string; className?: string }) {
  const shape = flat ? "hex-flat" : "hex-point";
  if (tone === "ring")
    return (
      <span aria-hidden className={cx("relative inline-block shrink-0 bg-ink", dims, shape, className)}>
        <span className={cx("absolute inset-[2px] bg-paper", shape)} />
      </span>
    );
  return <span aria-hidden className={cx("inline-block shrink-0", dims, shape, tone === "gold" ? "bg-gold" : tone === "ink" ? "bg-ink" : "bg-paper", className)} />;
}

export const STATUS_WORD: Record<UnitStatus, { ar: string; en: string }> = {
  available: { ar: "متاح", en: "For sale" },
  reserved: { ar: "محجوز", en: "Reserved" },
  sold: { ar: "مباع", en: "Sold" },
};
export function statusTone(status: UnitStatus, onInk = false): HexTone {
  return status === "available" ? "gold" : status === "sold" ? (onInk ? "paper" : "ink") : onInk ? "paper" : "ring";
}

/** «متاح» with its hexagon */
export function StatusWord({ status, onInk, lang = "ar", className }: { status: UnitStatus; onInk?: boolean; lang?: "ar" | "en"; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5", className)}>
      <HexDot tone={statusTone(status, onInk)} />
      {STATUS_WORD[status][lang]}
    </span>
  );
}

/** Sand number tile with the small cut: «147» over «م²» (Unit-M «الوحدة»). */
export function Tile({ value, caption, className }: { value: ReactNode; caption: ReactNode; className?: string }) {
  return (
    <div className={cx("flex flex-col items-center justify-center gap-0.5 px-2 py-3 bg-sand cut-s text-center", className)}>
      <span className="text-h2 font-extrabold leading-none tnum">{value}</span>
      <span className="text-caption font-semibold text-muted">{caption}</span>
    </div>
  );
}

/** The two-line WhatsApp call to action: «اسأل عن نموذج A» over «رسالة جاهزة: …». */
export function WaCta({ text, title, sub, className }: { text: string; title: ReactNode; sub?: ReactNode; className?: string }) {
  return (
    <a
      href={waLink(text)}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(
        "flex items-center justify-between gap-3 min-h-14 px-4 py-2.5 bg-gold text-ink no-underline cut-m hover:bg-gold-hover motion-hover transition-colors",
        className,
      )}
    >
      <span className={cx("inline-flex items-center gap-2 font-extrabold leading-tight", "text-body")}>
        <WhatsAppIcon size={18} className="shrink-0" />
        {title}
      </span>
      {sub && <span className="min-w-0 text-caption font-semibold text-on-gold-muted leading-snug text-end">{sub}</span>}
    </a>
  );
}

/** Bordered compare box («قارن» / «أضف للمقارنة»); disabled for reserved and sold units. */
export function CompareBox({ slug, label, unavailable, size = "m", className, lang = "ar" }: { slug: string; label: string; unavailable?: boolean; /** «s»: the phone's sticky bar (Unit-M: 12px sides, 6px gap) */ size?: "s" | "m"; className?: string; lang?: "ar" | "en" }) {
  const compare = useCompare();
  const checked = compare.has(slug);
  const full = compare.isFull && !checked;
  const off = unavailable || full;
  const aria = unavailable ? (lang === "en" ? "Not available to compare" : "غير متاح للمقارنة") : checked ? (lang === "en" ? "In compare" : "في المقارنة") : lang === "en" ? "Add to compare" : "أضف إلى المقارنة";
  return (
    <label className={cx("inline-flex items-center justify-center min-h-14 border-interactive text-label font-bold select-none motion-hover transition-colors", size === "s" ? "gap-1.5 px-3" : "gap-2 px-4", off ? "border-line text-muted cursor-not-allowed" : cx("cursor-pointer", checked ? "bg-sand" : "bg-paper hover:bg-sand"), className)}>
      <input type="checkbox" className="size-4.5 m-0 accent-ink" checked={checked} disabled={off} aria-label={aria} onChange={() => compare.toggle(slug)} />
      <span>{full ? (lang === "en" ? "Full (3/3)" : "ممتلئة (3/3)") : label}</span>
    </label>
  );
}

/** Ghost (1.5px ink) link or button used beside the gold call to action. */
export function GhostLink({ href, children, className, external }: { href: string; children: ReactNode; className?: string; external?: boolean }) {
  const cls = cx("inline-flex items-center justify-center gap-2 min-h-12 px-4 border-interactive bg-paper text-ink text-label font-bold no-underline hover:bg-sand motion-hover transition-colors", className);
  if (external || /^(https?:|tel:|mailto:)/.test(href))
    return (
      <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
