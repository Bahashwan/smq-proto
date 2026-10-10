// Buttons · Components sheet §1. Gold carries ink text only; the arrow on the secondary button is always gold;
// cuts sit on the line-end top corner (cut-s on size s, cut-m on m and l); hover 120ms; errors never red.
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/format";
import { ArrowIcon, WhatsAppIcon } from "./icons";
import { StatusDot } from "./Status";
import { isExternalHref } from "./constants";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "whatsapp" | "link";
export type ButtonSize = "s" | "m" | "l";

interface Common {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** renders a Next Link (internal) or an anchor (external / tel / wa) instead of a button */
  href?: string;
  /** gold arrow at the line end (secondary buttons: «اعرض الوحدات») */
  arrow?: boolean;
  /** leading icon node; the whatsapp variant adds the glyph itself */
  icon?: ReactNode;
  /** busy state: pulsing ink hexagon before the label, aria-busy */
  loading?: boolean;
  disabled?: boolean;
  /** stretch to the container width */
  full?: boolean;
  /** space the label and the arrow apart (hero CTA) */
  between?: boolean;
  /** QA only: force a visual state in the styleguide */
  state?: "hover" | "focus";
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof Common | "type"> & { type?: "button" | "submit" | "reset" };
type ButtonAsAnchor = Common & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof Common>;
export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const HEIGHTS: Record<ButtonSize, { filled: string; ghost: string }> = {
  s: { filled: "h-10 px-3.5 text-label gap-1.5", ghost: "h-10 px-3.5 text-label gap-1.5" },
  m: { filled: "h-13 px-4.5 text-body font-extrabold gap-2", ghost: "h-12 px-4 text-body font-bold gap-2" },
  l: { filled: "h-14 px-5 text-body font-extrabold gap-2", ghost: "h-14 px-5 text-body font-bold gap-2" },
};

function classes({ variant = "primary", size = "m", disabled, loading, full, between, state }: Common): string {
  const filled = variant !== "ghost" && variant !== "link";
  const cut = size === "s" ? "cut-s" : "cut-m";
  const common = cx(
    "inline-flex items-center shrink-0 select-none whitespace-nowrap no-underline motion-hover transition-colors",
    between ? "justify-between" : "justify-center",
    full && "w-full",
    loading && "cursor-wait",
    disabled && !loading && "cursor-not-allowed",
  );
  if (variant === "link") {
    return cx("inline-flex items-center gap-1.5 text-label font-bold text-gold-text hover:text-ink hover:underline motion-hover transition-colors", state === "hover" && "text-ink underline", disabled && "text-disabled hover:text-disabled hover:no-underline", full && "w-full");
  }
  const h = filled ? HEIGHTS[size].filled : HEIGHTS[size].ghost;
  if (variant === "ghost") {
    return cx(
      common,
      h,
      "bg-paper text-ink border-interactive",
      disabled ? "border-line text-disabled bg-paper" : "hover:bg-sand",
      state === "hover" && !disabled && "bg-sand",
      state === "focus" && "outline-3 outline-gold outline-offset-2",
    );
  }
  const gold = variant === "primary" || variant === "whatsapp";
  return cx(
    common,
    h,
    cut,
    disabled && !loading
      ? "bg-sand text-disabled"
      : gold
        ? cx("bg-gold text-ink hover:bg-gold-hover focus-visible:outline-ink focus-visible:-outline-offset-4", state === "hover" && "bg-gold-hover")
        : cx("bg-ink text-paper hover:bg-ink-2 focus-visible:-outline-offset-4", state === "hover" && "bg-ink-2"),
    // the cut clips anything outside the shape, so the focus ring sits inside it on filled buttons
    state === "focus" && (gold ? "outline-2 outline-ink -outline-offset-4" : "outline-2 outline-gold -outline-offset-4"),
  );
}

/** Primary (gold) · secondary (ink, gold arrow) · ghost (ink outline) · whatsapp (gold + glyph) · link (gold text) */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "m", href, arrow, icon, loading, disabled, full, between, state, className, children, ...rest } = props;
  const cls = cx(classes({ variant, size, disabled, loading, full, between, state }), className);
  const inner = (
    <>
      {loading && <StatusDot tone={variant === "secondary" ? "gold" : "ink"} size={3.5} pulse />}
      {variant === "whatsapp" && !loading && <WhatsAppIcon size={size === "s" ? 16 : 18} />}
      {icon}
      {children}
      {arrow && <ArrowIcon size={size === "l" ? 22 : 18} className={variant === "secondary" ? "text-gold" : undefined} />}
    </>
  );
  if (href && !disabled) {
    const a = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    if (isExternalHref(href)) {
      const external = /^https?:/.test(href);
      return (
        <a href={href} className={cls} aria-busy={loading || undefined} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} {...a}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} aria-busy={loading || undefined} {...a}>
        {inner}
      </Link>
    );
  }
  const b = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={b.type ?? "button"} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} aria-disabled={disabled || undefined} {...b}>
      {inner}
    </button>
  );
}

export type IconButtonTone = "gold" | "ink" | "paper" | "ghost-ink" | "ghost-paper";

export interface IconButtonProps {
  /** required: the icon has no text */
  label: string;
  /** hex size in px: 40 to 64 */
  size?: 40 | 44 | 48 | 56 | 64;
  tone?: IconButtonTone;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit";
}

const HEX_SIZE: Record<NonNullable<IconButtonProps["size"]>, string> = { 40: "size-10", 44: "size-11", 48: "size-12", 56: "size-14", 64: "size-16" };

/**
 * Flat hexagon icon button (header WhatsApp, footer socials, close buttons). Ghost tones draw the ring as a nested
 * hexagon because a border would be clipped by the shape.
 */
export function IconButton({ label, size = 44, tone = "gold", href, onClick, disabled, className, children, type = "button" }: IconButtonProps) {
  const ghost = tone.startsWith("ghost");
  const outer = cx(
    "relative inline-flex items-center justify-center shrink-0 hex-flat motion-hover transition-colors no-underline",
    HEX_SIZE[size],
    tone === "gold" && "bg-gold text-ink hover:bg-gold-hover focus-visible:outline-ink focus-visible:-outline-offset-4",
    (tone === "ink" || tone === "paper") && "focus-visible:-outline-offset-4",
    tone === "ink" && "bg-ink text-paper hover:bg-ink-2",
    tone === "paper" && "bg-paper text-ink hover:bg-sand",
    tone === "ghost-ink" && "bg-ink-2 text-paper",
    tone === "ghost-paper" && "bg-ink text-ink",
    disabled && "opacity-60 cursor-not-allowed",
    className,
  );
  const fill = ghost ? (
    <span aria-hidden className={cx("absolute inset-px hex-flat", tone === "ghost-ink" ? "bg-ink group-hover:bg-ink-2" : "bg-paper group-hover:bg-sand", "motion-hover transition-colors")} />
  ) : null;
  const content = (
    <>
      {fill}
      <span className="relative inline-flex items-center justify-center">{children}</span>
    </>
  );
  if (href && !disabled) {
    const external = /^https?:/.test(href);
    return isExternalHref(href) ? (
      <a href={href} aria-label={label} title={label} className={cx("group", outer)} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
        {content}
      </a>
    ) : (
      <Link href={href} aria-label={label} title={label} className={cx("group", outer)}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} aria-label={label} title={label} onClick={onClick} disabled={disabled} className={cx("group", outer)}>
      {content}
    </button>
  );
}
