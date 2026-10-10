// Logo lockups from design/brand (usage rules on the HeaderFooter sheet): gold mark + white text in the header,
// full white in the footer and on dark surfaces, gold mark + ink text on light surfaces, full ink on gold,
// the mark alone for icons and the scrolled header. Imported as static assets, never re-coloured or rotated.
import lockupGoldmarkWhite from "@/design/brand/lockup-goldmark-white.png";
import lockupWhite from "@/design/brand/lockup-white.png";
import lockupGoldmarkInk from "@/design/brand/lockup-goldmark-ink.png";
import lockupInk from "@/design/brand/lockup-ink.png";
import wordmarkInk from "@/design/brand/wordmark-ink.png";
import wordmarkWhite from "@/design/brand/wordmark-white.png";
import logoMarkGold from "@/design/brand/logo-mark-gold.png";
import { cx } from "@/lib/format";
import { BRAND_AR, BRAND_EN } from "./constants";

export type LockupTone = "goldmark-white" | "white" | "goldmark-ink" | "ink" | "wordmark-ink" | "wordmark-white";

const FILES: Record<LockupTone, { src: string; width: number; height: number }> = {
  "goldmark-white": lockupGoldmarkWhite,
  white: lockupWhite,
  "goldmark-ink": lockupGoldmarkInk,
  ink: lockupInk,
  "wordmark-ink": wordmarkInk,
  "wordmark-white": wordmarkWhite,
};

export interface LockupProps {
  tone?: LockupTone;
  /** rendered height in px (minimum 24): 24 · 26 · 28 · 30 · 32 · 36 · 40 · 44 map to height classes so `className` can override per breakpoint (lg:h-9) */
  height?: number;
  lang?: "ar" | "en";
  /** decorative when the parent link already names the brand */
  decorative?: boolean;
  className?: string;
}

const HEIGHT_CLASS: Record<number, string> = { 24: "h-6", 26: "h-6.5", 28: "h-7", 30: "h-7.5", 32: "h-8", 36: "h-9", 40: "h-10", 44: "h-11" };

export function Lockup({ tone = "goldmark-white", height = 36, lang = "ar", decorative, className }: LockupProps) {
  const f = FILES[tone];
  const h = Math.max(24, height);
  const w = Math.round((f.width / f.height) * h);
  const hClass = HEIGHT_CLASS[h];
  return <img src={f.src} width={w} height={h} alt={decorative ? "" : lang === "en" ? BRAND_EN : BRAND_AR} className={cx("block shrink-0 w-auto", hClass, className)} style={hClass ? undefined : { height: h, width: "auto" }} />;
}

/** The gold mark alone (favicon, scrolled header, watermark) */
export function LogoMark({ size = 28, decorative = true, className, lang = "ar" }: { size?: number; decorative?: boolean; className?: string; lang?: "ar" | "en" }) {
  const w = Math.round((logoMarkGold.width / logoMarkGold.height) * size);
  return <img src={logoMarkGold.src} width={w} height={size} alt={decorative ? "" : lang === "en" ? BRAND_EN : BRAND_AR} className={cx("block shrink-0", className)} style={{ height: size, width: "auto" }} />;
}
