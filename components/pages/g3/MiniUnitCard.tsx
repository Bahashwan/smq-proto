// The small sibling card of the unit strips (Unit-M/D «نماذج أخرى في …», Unit-Reserved-M / Unit-Sold-M «متاح الآن
// بنفس الغرف», Unit-Roof-M «الروف الآخر في المشروع»): image, model line, meta line, ink price band.
import Link from "next/link";
import type { ImageTier, Unit, UnitStatus } from "@/data/types";
import { UNIT_TYPE_AR } from "@/data/units";
import { unitPpm } from "@/data/selectors";
import { bedsLabel, cx, fmtArea, fmtNum } from "@/lib/format";
import { ImageSlot } from "@/components/ui";
import { bathsSpec } from "./view";

const STATUS_AR: Record<UnitStatus, string> = { available: "متاح", reserved: "محجوز", sold: "مباع" };

export interface MiniUnitCardProps {
  unit: Unit;
  /** effective status of this sibling (store override ?? fixture) */
  status?: UnitStatus;
  tier?: ImageTier;
  /** real photo file (real tier, when the server found one) */
  realSrc?: string;
  /** «نموذج B · روز» instead of «نموذج B» (`"md"`: from md only, as Unit-D) */
  withBuilding?: boolean | "md";
  /** «… · متاح» at the end of the meta line */
  withStatus?: boolean;
  /** «5 غرف · 6 حمامات · 419 م²» (roof villas) instead of «غرفتان · 116.90 م²» */
  withBaths?: boolean;
  className?: string;
}

export function MiniUnitCard({ unit, status, tier = "generated", realSrc, withBuilding, withStatus, withBaths, className }: MiniUnitCardProps) {
  const st = status ?? unit.status;
  const name = unit.type === "roof-villa" ? "فيلا روف" : `نموذج ${unit.model}`;
  const title = withBuilding === true ? `${name} · ${unit.buildingNameAr}` : withBuilding === "md" ? (
    <>
      {name}
      <span className="hidden md:inline"> · {unit.buildingNameAr}</span>
    </>
  ) : (
    name
  );
  const meta = [bedsLabel(unit.beds), withBaths ? bathsSpec(unit.baths) : null, `${fmtArea(unit.areaM2)} م²`, withStatus ? STATUS_AR[st] : null].filter(Boolean).join(" · ");
  return (
    <Link href={`/units/${unit.slug}`} className={cx("flex flex-col shrink-0 border-interactive bg-paper text-ink no-underline hover:bg-cream motion-hover transition-colors", className)}>
      <ImageSlot
        slotId={unit.images[0] ?? `IMG-UNIT-${unit.code}`}
        tier={tier}
        realSrc={realSrc}
        cut="img"
        compact
        className="h-24 md:h-28"
        showId={false}
        sold={st === "sold"}
        unit={{ model: unit.type === "roof-villa" ? "روف" : unit.model, buildingNameAr: unit.buildingNameAr, areaM2: unit.areaM2, beds: unit.beds, baths: unit.baths, typeAr: UNIT_TYPE_AR[unit.type] }}
      />
      <span className="flex flex-col gap-0.5 px-3 pt-2.5 pb-2.5">
        <span className="text-body font-extrabold leading-snug">{title}</span>
        <span className="text-caption font-normal text-muted">{meta}</span>
      </span>
      <span className="mt-auto flex items-center justify-between gap-2 px-3 py-2.5 bg-ink text-paper">
        <span className="text-body font-extrabold tnum leading-none">{fmtNum(unit.priceSar)}</span>
        <span className="text-caption font-semibold text-gold tnum leading-none whitespace-nowrap">{fmtNum(unitPpm(unit))} /م²</span>
      </span>
    </Link>
  );
}
