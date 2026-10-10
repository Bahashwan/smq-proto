// Badges and status · Components sheet §4. Status is carried by shape and word: gold hexagon «متاح», white hexagon
// with an ink ring «محجوز», ink hexagon «مباع». «قريباً» and «من مالك» use the white ring. Nothing here is red.
import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import type { UnitStatus } from "@/data/types";

export type BadgeStatus = UnitStatus | "soon" | "owner";

const WORD: Record<BadgeStatus, { ar: string; en: string }> = {
  available: { ar: "متاح", en: "For sale" },
  reserved: { ar: "محجوز", en: "Reserved" },
  sold: { ar: "مباع", en: "Sold" },
  soon: { ar: "قريباً", en: "Soon" },
  owner: { ar: "من مالك", en: "By owner" },
};

export interface StatusBadgeProps {
  status: BadgeStatus;
  /** hex size: 40 · 52 (default) · 54 · 64 (Unit-D's cover badge) */
  size?: 40 | 52 | 54 | 64;
  /** the size from md up when it differs (the unit cover: 54 on the phone, 64 on desktop) */
  mdSize?: 64;
  lang?: "ar" | "en";
  className?: string;
}

const SIZE: Record<NonNullable<StatusBadgeProps["size"]>, { outer: string; ring: string; inner: string; text: string }> = {
  40: { outer: "size-10", ring: "inset-0", inner: "inset-[1.5px]", text: "text-caption" },
  52: { outer: "size-13", ring: "inset-[3px]", inner: "inset-[5px]", text: "text-caption" },
  54: { outer: "size-13.5", ring: "inset-[3px]", inner: "inset-[5px]", text: "text-caption" },
  64: { outer: "size-16", ring: "inset-[3px]", inner: "inset-[5px]", text: "text-label" },
};
const MD64 = "md:size-16 md:text-label";

/** The status hexagon. The ring of «محجوز» is a nested hexagon (no box-shadow in this system). */
export function StatusBadge({ status, size = 52, mdSize, lang = "ar", className }: StatusBadgeProps) {
  const s = SIZE[size];
  const word = WORD[status][lang];
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className ?? "");
  const base = cx(!positioned && "relative", "inline-flex items-center justify-center shrink-0 hex-flat font-extrabold leading-none text-center", s.outer, mdSize === 64 && MD64, className);
  if (status === "available") {
    return (
      <span className={cx(base, "bg-gold text-ink", s.text, mdSize === 64 && "md:text-label")} data-status={status}>
        {word}
      </span>
    );
  }
  if (status === "sold") {
    return (
      <span className={cx(base, "bg-ink text-paper", s.text, mdSize === 64 && "md:text-label")} data-status={status}>
        {word}
      </span>
    );
  }
  return (
    <span className={cx(base, "bg-paper text-ink", s.text)} data-status={status}>
      <span aria-hidden className={cx("absolute hex-flat bg-ink", s.ring)} />
      <span aria-hidden className={cx("absolute hex-flat bg-paper", s.inner)} />
      <span className="relative px-1 whitespace-normal leading-tight">{word}</span>
    </span>
  );
}

export interface StatusDotProps {
  tone?: "gold" | "ink" | "paper" | "muted" | "line";
  /** spacing units: 2 = 8px, 3 = 12px, 3.5 = 14px, 4 = 16px */
  size?: 2 | 2.5 | 3 | 3.5 | 4;
  pulse?: boolean;
  className?: string;
}

const DOT: Record<NonNullable<StatusDotProps["size"]>, string> = { 2: "size-2", 2.5: "size-2.5", 3: "size-3", 3.5: "size-3.5", 4: "size-4" };

/** Pointed hexagon dot: error bullets, loading markers, list markers */
export function StatusDot({ tone = "gold", size = 2, pulse, className }: StatusDotProps) {
  return (
    <span
      aria-hidden
      className={cx(
        "inline-block shrink-0 hex-point",
        DOT[size],
        tone === "gold" && "bg-gold",
        tone === "ink" && "bg-ink",
        tone === "paper" && "bg-paper",
        tone === "muted" && "bg-muted",
        tone === "line" && "bg-line",
        pulse && "animate-skeleton",
        className,
      )}
    />
  );
}

export type PillTone = "ink" | "outline" | "sand" | "gold" | "line" | "gold-outline" | "muted-outline";

/** Rectangular word pills: «قيد الإنشاء» (ink), «جاهز» (outline), «8 من 10 متاحة» (sand), «+6 وحدات» (gold on ink) */
export function Pill({ tone = "outline", children, className, delta }: { tone?: PillTone; children: ReactNode; className?: string; delta?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 whitespace-nowrap text-caption font-bold leading-none",
        tone === "ink" && (delta ? "px-2 py-1.5 bg-ink text-gold font-extrabold" : "px-2.5 py-1.5 bg-ink text-paper"),
        tone === "outline" && "px-2.5 py-1.5 border-interactive",
        tone === "sand" && "px-2 py-1.5 bg-sand text-ink",
        tone === "gold" && "px-2 py-1.5 bg-gold text-ink",
        tone === "line" && "px-2 py-1.5 border-hairline text-ink font-semibold",
        tone === "gold-outline" && "px-2 py-1.5 border-[1.5px] border-gold bg-cream-focus text-gold-text",
        tone === "muted-outline" && "px-2 py-1.5 border-[1.5px] border-muted text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Small gold count («3»), min 20px */
export function CountBadge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-gold text-ink text-caption font-bold tnum leading-none", className)}>{children}</span>;
}

/** Hairline feature tag («غرفة خادمة», «تسليم الربع الثاني 2027») */
export function Tag({ children, className, size = "m" }: { children: ReactNode; className?: string; size?: "s" | "m" }) {
  return <span className={cx("inline-flex items-center whitespace-nowrap border-hairline font-semibold leading-none", size === "s" ? "px-2 py-1.5 text-caption" : "px-2.5 py-1.5 text-caption", className)}>{children}</span>;
}

/** Ink tag with the 60° cut on the line-end side: «عمارة روز», «جاردن الروضة · روز». Sits at the image's bottom end. */
export function BuildingTag({ children, href, className }: { children: ReactNode; href?: string; className?: string }) {
  const cls = cx("inline-flex items-center gap-1.5 cut-tag bg-ink text-paper text-caption font-bold leading-none no-underline py-2 ps-3 pe-3.5 hover:bg-ink-2 motion-hover transition-colors", className);
  return href ? (
    <a href={href} className={cls}>
      {children}
    </a>
  ) : (
    <span className={cls}>{children}</span>
  );
}

/** The mandatory «صورة تعبيرية» label on generated images (white, in the image corner) */
export function IllustrativeLabel({ lang = "ar", size = "m", className }: { lang?: "ar" | "en"; size?: "s" | "m"; className?: string }) {
  return <span className={cx("inline-flex items-center bg-paper text-ink font-bold leading-none whitespace-nowrap", size === "s" ? "px-1.5 py-1 text-caption" : "px-2 py-1 text-caption", className)}>{lang === "en" ? "Illustrative image" : "صورة تعبيرية"}</span>;
}
