// The small sibling card of the unit strips (Unit-M «نماذج أخرى في روز», Unit-Reserved-M / Unit-Sold-M
// «متاح الآن بنفس الغرف», Unit-Roof-M «الروف الآخر في المشروع»): image, model line, meta line, ink price band.
import Link from "next/link";
import type { ImageTier, Unit, UnitStatus } from "@/data/types";
import { unitPpm } from "@/data/selectors";
import { bedsLabel, bathsLabel, cx, fmtArea, fmtNum } from "@/lib/format";
import { ImageSlot } from "@/components/ui";

const STATUS_AR: Record<UnitStatus, string> = { available: "متاح", reserved: "محجوز", sold: "مباع" };

export interface MiniUnitCardProps {
  unit: Unit;
  /** effective status of this sibling (store override ?? fixture) */
  status?: UnitStatus;
  tier?: ImageTier;
  src?: string;
  /** «نموذج B · روز» instead of «نموذج B» */
  withBuilding?: boolean;
  /** «… · متاح» at the end of the meta line */
  withStatus?: boolean;
  /** «5 غرف · 6 حمامات · 419 م²» (roof villas) instead of «غرفتان · 116.90 م²» */
  withBaths?: boolean;
  className?: string;
}

export function MiniUnitCard({ unit, status, tier = "generated", src, withBuilding, withStatus, withBaths, className }: MiniUnitCardProps) {
  const st = status ?? unit.status;
  const title = unit.type === "roof-villa" ? (withBuilding ? `فيلا روف · ${unit.buildingNameAr}` : "فيلا روف") : withBuilding ? `نموذج ${unit.model} · ${unit.buildingNameAr}` : `نموذج ${unit.model}`;
  const meta = [bedsLabel(unit.beds), withBaths ? bathsLabel(unit.baths) : null, `${fmtArea(unit.areaM2)} م²`, withStatus ? STATUS_AR[st] : null].filter(Boolean).join(" · ");
  return (
    <Link href={`/units/${unit.slug}`} className={cx("flex flex-col shrink-0 border-interactive bg-paper text-ink no-underline hover:bg-cream motion-hover transition-colors", className)}>
      <ImageSlot slotId={unit.images[0] ?? `IMG-UNIT-${unit.code}`} tier={tier === "typographic" ? "generated" : tier} src={src} cut="img" className="h-24 md:h-28" showId={false} label={false} sold={st === "sold"} unit={{ model: unit.model, buildingNameAr: unit.buildingNameAr, areaM2: unit.areaM2, beds: unit.beds, baths: unit.baths }} />
      <span className="flex flex-col gap-0.5 px-3 pt-2.5 pb-2">
        <span className="text-label md:text-body font-extrabold leading-snug">{title}</span>
        <span className="text-caption font-normal text-muted">{meta}</span>
      </span>
      <span className="flex items-center justify-between gap-2 px-3 py-2 bg-ink text-paper">
        <span className="text-body font-extrabold tnum leading-none">{fmtNum(unit.priceSar)}</span>
        <span className="text-caption font-semibold text-gold tnum leading-none whitespace-nowrap">{fmtNum(unitPpm(unit))} /م²</span>
      </span>
    </Link>
  );
}
