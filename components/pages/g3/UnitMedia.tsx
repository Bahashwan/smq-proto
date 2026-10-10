"use client";
// The unit cover and its thumbnail row (Unit-M/D, Unit-Roof-M, the three Unit-Tier boards, EN-Unit-M).
// Generated tier: the slot drawing or the converted render with «صورة تعبيرية»; real tier: /public/real file or the
// neutral ink frame, no label; typographic tier: the numbers tile, and the thumbs turn into number tiles.
// The cover opens the full-screen gallery on the same picture; thumbs switch the cover; the last tile is the plan.
import { useState } from "react";
import Link from "next/link";
import { cx, fmtArea, bathsLabel } from "@/lib/format";
import { ImageSlot, StatusBadge } from "@/components/ui";
import type { UnitView } from "./view";
import { galleryItems, unitThumbs, type RealFiles } from "./slots";
import { orientationEn } from "./view";

export interface UnitMediaProps {
  view: UnitView;
  realFiles: RealFiles;
  lang?: "ar" | "en";
  /** the thumbnail row and the tier caption (the reserved and sold boards show the cover alone) */
  thumbs?: boolean;
  className?: string;
}

export function UnitMedia({ view, realFiles, lang = "ar", thumbs: withThumbs = true, className }: UnitMediaProps) {
  const { unit, tier, status } = view;
  const en = lang === "en";
  const thumbs = unitThumbs(unit);
  const [active, setActive] = useState(0);
  const current = thumbs[active] ?? thumbs[0];
  const gallery = galleryItems(unit);
  const galleryIndex = Math.max(0, gallery.findIndex((g) => g.slotId === current?.slotId)) + 1;
  const roof = unit.type === "roof-villa";
  const planHref = `/units/${unit.slug}/plan`;
  const orientation = en ? orientationEn(unit.orientation?.value) : unit.orientation?.value;

  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <div className="relative">
        <Link href={`/units/${unit.slug}/gallery?i=${galleryIndex}`} aria-label={en ? "Open the gallery" : "افتح معرض الصور"} className="block no-underline text-inherit">
          <ImageSlot
            slotId={current?.slotId ?? `IMG-UNIT-${unit.code}`}
            tier={tier}
            realSrc={realFiles[current?.slotId ?? ""]}
            cut="img-l"
            className="h-60 md:h-auto md:aspect-[16/10]"
            showId={!en && status !== "sold" && tier === "generated"}
            lang={lang}
            unit={{ model: unit.type === "roof-villa" ? "روف" : unit.model, buildingNameAr: unit.buildingNameAr, areaM2: unit.areaM2, beds: unit.beds, baths: unit.baths, floor: en ? undefined : view.floorWordAr }}
          />
        </Link>
        <span className="absolute top-3 start-3 md:top-4 md:start-4 z-[2] flex">
          <StatusBadge status={status} size={54} lang={lang} />
        </span>
        {roof && !en && <span className="absolute top-3 end-0 z-[2] px-3.5 py-1.5 bg-ink text-paper text-caption font-bold cut-tag">فيلا روف · دوران وتراس</span>}
      </div>

      {withThumbs && (
      <Thumbs
        view={view}
        items={thumbs}
        active={active}
        onSelect={setActive}
        planHref={planHref}
        planLabel={en ? "Floor plan" : roof ? "مخططان" : "المخطط"}
        planLabelD={en ? "Floor plan" : roof ? "مخططان" : "المخطط 2D"}
        planAria={en ? "Floor plan" : roof ? "المخططان" : "المخطط"}
        orientation={orientation}
        lang={lang}
        realFiles={realFiles}
      />
      )}

      {withThumbs && tier === "generated" && !en && (
        <p className="m-0 mt-1 text-caption font-normal leading-relaxed text-muted">الصور تعبيرية مولّدة من المخطط والمواصفات، وتُستبدل بصور فعلية بعد التصوير. الأبعاد والتشطيب النهائي بحسب العقد.</p>
      )}
    </div>
  );
}

interface ThumbsProps {
  view: UnitView;
  items: ReturnType<typeof unitThumbs>;
  active: number;
  onSelect: (i: number) => void;
  planHref: string;
  planLabel: string;
  planLabelD: string;
  planAria: string;
  orientation?: string;
  lang: "ar" | "en";
  realFiles: RealFiles;
}

/** 3 image thumbs + plan on the phone, 4 + plan from md (Unit-D). */
function Thumbs({ view, items, active, onSelect, planHref, planLabel, planLabelD, planAria, orientation, lang, realFiles }: ThumbsProps) {
  const { unit, tier } = view;
  const en = lang === "en";
  const typo = tier === "typographic";
  const real = tier === "real";
  const plan = (
    <Link
      href={planHref}
      aria-label={planAria}
      className={cx(
        "flex items-center justify-center h-16 md:h-22 px-1 no-underline text-caption font-bold text-ink text-center leading-tight motion-hover transition-colors hover:bg-cream",
        typo ? "border border-gold bg-paper" : "border border-line bg-sand",
      )}
    >
      <span className="md:hidden">{planLabel}</span>
      <span className="hidden md:inline">{planLabelD}</span>
    </Link>
  );

  if (typo) {
    const tile = "flex items-center justify-center h-16 md:h-22 px-1 text-center font-extrabold leading-tight";
    return (
      <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
        <span className={cx(tile, "border-2 border-ink bg-ink text-gold text-h2 tnum")} aria-label={en ? `${unit.beds} bedrooms` : `${unit.beds} غرف نوم`}>
          {unit.beds}
        </span>
        <span className={cx(tile, "border border-line bg-sand text-label")}>{en ? `${unit.baths} bathrooms` : bathsLabel(unit.baths)}</span>
        <span className={cx(tile, "border border-line bg-sand text-label")}>{orientation ?? "·"}</span>
        <span className={cx(tile, "hidden md:flex border border-line bg-sand text-label tnum")}>
          {fmtArea(unit.areaM2)} {en ? "m²" : "م²"}
        </span>
        {plan}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 md:grid-cols-5 gap-2 md:gap-2.5">
      {items.slice(0, 4).map((it, i) => {
        const on = i === active;
        const file = real ? realFiles[it.slotId] : undefined;
        return (
          <button
            key={`${it.slotId}-${i}`}
            type="button"
            aria-label={en ? it.en : it.ar}
            aria-pressed={on}
            onClick={() => onSelect(i)}
            className={cx(
              "relative flex items-center justify-center h-16 md:h-22 px-1 overflow-hidden text-caption leading-tight motion-hover transition-colors",
              i === 3 && "hidden md:flex",
              real ? (on ? "bg-ink-2 text-paper" : "bg-muted text-paper") : "bg-slot text-muted",
              on ? "border-2 border-ink font-bold text-ink" : "border border-line font-normal hover:border-ink",
              on && real && "text-paper",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, real photos are served as they are */}
            {file && <img src={file} alt="" className="absolute inset-0 size-full object-cover" />}
            {/* the active thumb keeps its word on Unit-D and Unit-Roof-M only */}
            <span className={cx("relative", on && unit.type !== "roof-villa" && "hidden md:inline")}>{en ? it.en : it.short}</span>
          </button>
        );
      })}
      {plan}
    </div>
  );
}

