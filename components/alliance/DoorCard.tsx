import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { ArrowIcon } from "@/components/ui/icons";
import { A } from "./A";
import { HexDot } from "./HexCell";

/**
 * «بطاقة الباب» on تعاون معنا. The three doors differ by material on purpose: owners = gold block with the big
 * cut, offices = ink with the honeycomb, marketers = outlined with the link motif. Hover draws a 6px gold rule at
 * the inline start (no shadow, no motion); focus is the theme's gold outline on the unclipped anchor. `size="l"` is
 * the hub's door (Hub-M, Hub-D): roomier padding, the h2 title, the CTA pinned to the bottom at 42/46px with its
 * arrow, and the card fills its grid row.
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
  /** s = Components3 card · l = the hub's door */
  size?: "s" | "l";
  /** the forward arrow after the CTA (default on the large door) */
  arrow?: boolean;
  className?: string;
}

export function DoorCard({ variant, eyebrow, title, text, cta, href, icon, cut, size = "s", arrow, className }: DoorCardProps) {
  const useCut = cut ?? variant === "owners";
  const large = size === "l";
  const withArrow = arrow ?? large;
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
    <A href={href} className={cx("group relative block no-underline text-inherit", large && "h-full", className)}>
      <span className={cx("relative flex flex-col overflow-hidden text-[12px] leading-normal", large ? "h-full gap-2.5 p-5 md:p-6" : "gap-2 p-4", surface, useCut && "cut-l")}>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 start-0 w-1.5 bg-gold opacity-0 group-hover:opacity-100" />
        {variant === "offices" && decoration}
        <span className={cx("relative text-caption font-bold", eyebrowTone)}>{eyebrow}</span>
        <b className={cx("relative", large ? "text-h2 leading-tight" : "text-h3")}>{title}</b>
        {variant === "marketers" && decoration}
        {text && <span className={cx("relative", textTone)}>{text}</span>}
        <span className={cx("relative inline-flex items-center gap-2 self-start font-extrabold", large ? "mt-auto h-10.5 px-4 text-label md:h-11.5 md:px-4.5" : "mt-1 h-9 min-h-9 px-3", button)}>
          {cta}
          {withArrow && <ArrowIcon size={16} className={variant === "owners" ? "text-gold" : undefined} />}
        </span>
      </span>
    </A>
  );
}
