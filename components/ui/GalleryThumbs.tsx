"use client";
// The 4-up thumbnail row under the unit gallery (Unit-M, Unit-Tier boards): three image thumbs and the plan tile.
// Generated / real tiers show the slot drawing or file; the typographic tier turns the thumbs into number tiles
// (beds · baths · orientation) and keeps the plan tile with a gold frame.
import Link from "next/link";
import { cx, bathsLabel } from "@/lib/format";
import type { ImageTier } from "@/data/types";

export interface GalleryThumbItem {
  slotId: string;
  /** room name: «الصالة», «المطبخ», «غرفة النوم» */
  label: string;
  /** short label printed on the tile (defaults to label) */
  short?: string;
  src?: string;
}

export interface GalleryThumbsProps {
  items: GalleryThumbItem[];
  active: number;
  onSelect: (index: number) => void;
  tier: ImageTier;
  planHref?: string;
  planLabel?: string;
  /** numbers for the typographic tiles */
  unit?: { beds: number; baths: number; orientation?: string };
  className?: string;
}

export function GalleryThumbs({ items, active, onSelect, tier, planHref, planLabel = "المخطط", unit, className }: GalleryThumbsProps) {
  const plan = planHref ? (
    <Link href={planHref} aria-label={planLabel} className={cx("flex items-center justify-center h-16 no-underline text-caption font-bold text-ink", tier === "typographic" ? "border border-gold bg-paper" : "border border-line bg-sand", "hover:bg-cream motion-hover transition-colors")}>
      {planLabel}
    </Link>
  ) : null;

  if (tier === "typographic") {
    const tiles = [
      { key: "beds", node: <span className="text-h2 text-gold tnum">{unit?.beds ?? "·"}</span>, strong: true },
      { key: "baths", node: unit ? bathsLabel(unit.baths) : "·" },
      { key: "orientation", node: unit?.orientation ?? "·" },
    ];
    return (
      <div className={cx("grid grid-cols-4 gap-2", className)}>
        {tiles.map((t) => (
          <span key={t.key} className={cx("flex items-center justify-center h-16 font-extrabold text-label", t.strong ? "border-2 border-ink bg-ink text-gold" : "border border-line bg-sand text-ink")}>
            {t.node}
          </span>
        ))}
        {plan}
      </div>
    );
  }

  const real = tier === "real";
  return (
    <div className={cx("grid grid-cols-4 gap-2", className)}>
      {items.slice(0, 3).map((it, i) => {
        const isActive = i === active;
        return (
          <button
            key={it.slotId}
            type="button"
            aria-label={it.label}
            aria-pressed={isActive}
            onClick={() => onSelect(i)}
            className={cx(
              "relative flex items-end justify-center h-16 p-1 overflow-hidden text-caption font-semibold motion-hover transition-colors",
              real ? "bg-ink-2 text-paper" : "bg-slot text-muted",
              isActive ? "border-2 border-ink" : "border border-line hover:border-ink",
            )}
          >
            {it.src ? <img src={it.src} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" /> : null}
            {!isActive && <span className="relative leading-none">{it.short ?? it.label}</span>}
          </button>
        );
      })}
      {plan}
    </div>
  );
}
