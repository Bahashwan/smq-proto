import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { A } from "./A";
import { HexDot } from "./HexCell";

/**
 * «بطاقة الباب» on تعاون معنا. The three doors differ by material on purpose: owners = gold block with the big
 * cut, offices = ink with the honeycomb, marketers = outlined with the link motif. Hover draws a 6px gold rule at
 * the inline start (no shadow, no motion); focus is the theme's gold outline on the unclipped anchor.
 */
export type DoorVariant = "owners" | "offices" | "marketers";

export interface DoorCardProps {
  variant: DoorVariant;
  /** «01 · للمُلّاك» */
  eyebrow: string;
  /** «عندك عقار؟» */
  title: string;
  /** «لمن · ماذا تحصل · ماذا نحتاج · الوقت» */
  text?: ReactNode;
  /** «أضف عقارك» */
  cta: string;
  href: string;
  /** decoration slot; defaults to the honeycomb (offices) or the link chip (marketers) */
  icon?: ReactNode;
  /** the big cut on the gold block (cut-l); default true for owners */
  cut?: boolean;
  className?: string;
}

export function DoorCard({ variant, eyebrow, title, text, cta, href, icon, cut, className }: DoorCardProps) {
  const useCut = cut ?? variant === "owners";
  const surface =
    variant === "owners"
      ? "bg-gold text-ink"
      : variant === "offices"
        ? "bg-ink text-paper"
        : "bg-paper text-ink border-interactive";
  const eyebrowTone = variant === "owners" ? "text-on-gold-muted" : variant === "offices" ? "text-gold" : "text-gold-text";
  const textTone = variant === "owners" ? "text-on-gold-muted" : variant === "offices" ? "text-on-ink-muted" : "text-ink-2";
  const button =
    variant === "owners"
      ? "bg-ink text-paper"
      : variant === "offices"
        ? "bg-gold text-ink cut-s"
        : "border-interactive text-ink";
  const decoration =
    icon !== undefined ? (
      icon
    ) : variant === "offices" ? (
      <span aria-hidden className="absolute end-[-8px] top-1.5 flex gap-0.5 opacity-60">
        <HexDot size={26} tone="ink2" />
        <HexDot size={26} tone="gold" />
      </span>
    ) : variant === "marketers" ? (
      <span className="self-start bg-sand px-2 py-1.5 text-caption font-bold font-latin" dir="ltr">
        smq-re.com/r/you
      </span>
    ) : null;
  return (
    <A href={href} className={cx("group relative block no-underline text-inherit", className)}>
      <span className={cx("relative flex flex-col gap-2 overflow-hidden p-4 text-[12px] leading-normal", surface, useCut && "cut-l")}>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 start-0 w-1.5 bg-gold opacity-0 group-hover:opacity-100" />
        {variant === "offices" && decoration}
        <span className={cx("text-caption font-bold", eyebrowTone)}>{eyebrow}</span>
        <b className="text-h3">{title}</b>
        {variant === "marketers" && decoration}
        {text && <span className={textTone}>{text}</span>}
        <span className={cx("mt-1 inline-flex h-9 min-h-9 items-center self-start px-3 font-extrabold", button)}>{cta}</span>
      </span>
    </A>
  );
}
