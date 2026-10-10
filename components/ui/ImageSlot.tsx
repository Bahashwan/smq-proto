// Image slots in three tiers · Components sheet §7 and the Unit-Tier boards. Never a raster embedded here:
// real = the file the page passes (or a neutral ink frame, no label) · generated = the file from Phase 8 when the
// page passes one, else the neutral placeholder drawing on --smq-slot, always with the white «صورة تعبيرية» label
// and the small slot id line · typographic = ink tile with the unit's numbers and «الصور تُنشر بعد التصوير».
import type { ReactNode } from "react";
import { cx, fmtArea, bedsLabel, bathsLabel } from "@/lib/format";
import type { ImageTier } from "@/data/types";
import { IllustrativeLabel } from "./Status";
import { slotFiles } from "@/lib/images";

export type SlotRatio = "3:2" | "16:9" | "4:5" | "1:1" | "21:9" | "2:3";
export type SlotCut = "none" | "img" | "img-l" | "xl";

export interface SlotUnitInfo {
  model: string;
  buildingNameAr: string;
  areaM2: number;
  beds: number;
  baths: number;
  floor?: string;
  orientation?: string;
  /** «شقة» / «فيلا روف» for the compact tile */
  typeAr?: string;
}

export interface ImageSlotProps {
  slotId: string;
  tier: ImageTier;
  ratio?: SlotRatio;
  /** file for the real or generated tier; without it the tier draws its neutral frame */
  src?: string;
  /** alias of src for the real tier (the page passes /real/<slot>.jpg when the file exists) */
  realSrc?: string;
  alt?: string;
  /** the typographic tile reads these */
  unit?: SlotUnitInfo;
  /** «صورة تعبيرية» label (generated tier; a manager can switch it off) */
  label?: boolean;
  /** the small «IMG-… · 3:2» line */
  showId?: boolean;
  /** 60° cut on the bottom line-end corner */
  cut?: SlotCut;
  /** small slot (thumbnails, strips): compact typographic tile and the small label */
  compact?: boolean;
  /** sold treatment: desaturated image, faded drawing */
  sold?: boolean;
  lang?: "ar" | "en";
  /** overlays: status badge, building tag (positioned by the caller) */
  children?: ReactNode;
  className?: string;
  as?: "figure" | "div";
}

const RATIO: Record<SlotRatio, string> = { "3:2": "aspect-[3/2]", "16:9": "aspect-[16/9]", "4:5": "aspect-[4/5]", "1:1": "aspect-square", "21:9": "aspect-[21/9]", "2:3": "aspect-[2/3]" };
const CUT: Record<SlotCut, string> = { none: "", img: "cut-img", "img-l": "cut-img-l", xl: "cut-xl" };

/** Plain <img> for slot files (static export: files are served as they are, no optimizer) */
export function SlotImage({ src, alt = "", sold, className }: { src: string; alt?: string; sold?: boolean; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer
  return <img src={src} alt={alt} className={cx("absolute inset-0 w-full h-full object-cover", sold && "img-sold", className)} loading="lazy" />;
}

/** A converted generated image (Phase 8): AVIF + WebP sets with the blur placeholder behind them. */
export function GeneratedPicture({ slotId, alt = "", sold, sizes = "(min-width: 1024px) 50vw, 100vw" }: { slotId: string; alt?: string; sold?: boolean; sizes?: string }) {
  const f = slotFiles(slotId);
  if (!f) return null;
  const set = (fmt: "avif" | "webp") => f.widths.map((w) => `/images/${slotId}/${slotId}-${w}.${fmt} ${w}w`).join(", ");
  const fallback = `/images/${slotId}/${slotId}-${f.widths.includes(1280) ? 1280 : f.widths[f.widths.length - 1]}.webp`;
  return (
    <picture className="absolute inset-0 block" style={{ backgroundImage: `url(${f.blur})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={set("webp")} sizes={sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, files are pre-sized */}
      <img src={fallback} alt={alt} width={f.width} height={f.height} loading="lazy" decoding="async" className={cx("absolute inset-0 w-full h-full object-cover", sold && "img-sold")} />
    </picture>
  );
}

/** The neutral placeholder drawing (skyline strokes); tone follows the tier */
export function PlaceholderDrawing({ tone = "slot", className }: { tone?: "slot" | "ink"; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 358 240" preserveAspectRatio="none" className={cx("absolute inset-0 w-full h-full", tone === "slot" ? "opacity-55 stroke-on-ink-muted" : "opacity-90 stroke-muted", className)} fill="none" strokeWidth={tone === "slot" ? 1 : 1.2}>
      <path d="M0 180h358M30 180V100h90v80M150 180V70h120v110M300 180v-60h58M0 60l358 20" />
      {tone === "ink" && <path d="M40 110h70M160 85h100M165 100h90" className="stroke-disabled" />}
    </svg>
  );
}

export function ImageSlot({ slotId, tier, ratio, src, realSrc, alt = "", unit, label = true, showId = true, cut = "none", compact, sold, lang = "ar", children, className, as: Tag = "figure" }: ImageSlotProps) {
  const file = src ?? realSrc;
  const base = cx("relative block overflow-hidden m-0 min-w-0", ratio && RATIO[ratio], CUT[cut], className);
  const idLine = showId && !compact && (
    <span className="absolute bottom-3 end-3 max-w-[calc(100%-8.5rem)] flex">
      <span className="block truncate px-2 py-1 bg-paper text-caption font-normal text-muted leading-none whitespace-nowrap" dir="ltr">
        {slotId}
        {ratio ? ` · ${ratio}` : ""}
      </span>
    </span>
  );

  if (tier === "typographic") {
    if (compact) {
      return (
        <Tag className={cx(base, "bg-sand text-ink flex flex-col items-start justify-end gap-0.5 p-2.5")} data-slot={slotId} data-tier={tier}>
          <span className="text-h2 font-extrabold leading-none text-gold tnum">{unit?.model ?? "·"}</span>
          {unit && (
            <span className="text-caption font-bold leading-snug">
              {unit.typeAr ?? "شقة"} · {bedsLabel(unit.beds)} · {fmtArea(unit.areaM2)} م²
            </span>
          )}
          {children}
        </Tag>
      );
    }
    return (
      <Tag className={cx(base, "bg-ink text-paper flex flex-col justify-center gap-1 px-6 py-5")} data-slot={slotId} data-tier={tier}>
        <span aria-hidden className="absolute -end-10 -top-7 size-55 hex-flat bg-ink-2" />
        {unit && (
          <>
            <span className="relative text-caption md:text-label font-bold text-gold">
              نموذج {unit.model} · {unit.buildingNameAr}
            </span>
            <span className="relative text-display font-extrabold leading-none tracking-tight tnum">
              {fmtArea(unit.areaM2)}
              <span className="ms-1.5 text-h3 font-bold text-on-ink-muted">م²</span>
            </span>
            <span className="relative text-body font-bold text-on-ink-muted">
              {bedsLabel(unit.beds)} · {bathsLabel(unit.baths)}
              {unit.floor ? ` · الطابق ${unit.floor}` : ""}
              {unit.orientation ? ` · ${unit.orientation}` : ""}
            </span>
          </>
        )}
        <span className="absolute bottom-3 start-3 text-caption font-bold text-on-ink-muted">{lang === "en" ? "Photos follow the shoot" : "الصور تُنشر بعد التصوير"}</span>
        {children}
      </Tag>
    );
  }

  if (tier === "real") {
    return (
      <Tag className={cx(base, "bg-ink-2")} data-slot={slotId} data-tier={tier}>
        {file ? <SlotImage src={file} alt={alt} sold={sold} /> : <PlaceholderDrawing tone="ink" className={cx(sold && "opacity-35")} />}
        {children}
      </Tag>
    );
  }

  return (
    <Tag className={cx(base, sold ? "bg-sand" : "bg-slot")} data-slot={slotId} data-tier={tier}>
      {file ? <SlotImage src={file} alt={alt} sold={sold} /> : slotFiles(slotId) ? <GeneratedPicture slotId={slotId} alt={alt} sold={sold} /> : <PlaceholderDrawing tone="slot" className={cx(sold && "opacity-35")} />}
      {label && !sold && <IllustrativeLabel lang={lang} size={compact ? "s" : "m"} className={cx("absolute z-[1]", compact ? "bottom-1.5 start-1.5" : "bottom-3 start-3")} />}
      {!sold && idLine}
      {children}
    </Tag>
  );
}
