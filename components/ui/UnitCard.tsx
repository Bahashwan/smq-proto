"use client";
// The result card (B-Card, chosen) with its states (State-Cards): available · reserved · sold · from owner.
// Everything shown is computed from the unit record; the prefilled WhatsApp message carries the project, the model
// code and the visitor reference code.
import Link from "next/link";
import { cx, fmtArea, fmtDate, bedsLabel, bathsLabel, waLink, ppm as calcPpm } from "@/lib/format";
import type { ImageTier, Unit, UnitStatus } from "@/data/types";
import { Button } from "./Button";
import { CompareToggle } from "./Chip";
import { ImageSlot } from "./ImageSlot";
import { PriceBand } from "./PriceBand";
import { BUILDINGS } from "@/data/units";
import { Price } from "./Price";
import { BuildingTag, StatusBadge, Tag } from "./Status";
import { FEATURE_LABELS } from "./constants";
import { useVisitorCode } from "./hooks";

export interface UnitCardProps {
  unit: Unit;
  /** link of the title and image (default /units/<slug>) */
  href?: string;
  /** «جاردن الروضة» */
  projectName?: string;
  projectHref?: string;
  /** «الروضة» → «حي الروضة، جدة» on the full card */
  districtName?: string;
  /** «تسليم الربع الثاني 2027» */
  deliveryLabel?: string;
  /** «الثالث»; derived from unit.floor through the board words when omitted */
  floorLabel?: string;
  /** «شمالية»; derived from unit.orientation when omitted */
  orientationLabel?: string;
  /** effective status (store override ?? fixture); defaults to unit.status */
  status?: UnitStatus;
  /** owner listing: «من مالك» badge */
  fromOwner?: boolean;
  /** image tier (presenter switch); defaults to unit.imageTier */
  tier?: ImageTier;
  /** image file for the cover slot (Phase 8 / real photo) */
  src?: string;
  /** compare control; omit to hide it */
  compare?: { checked: boolean; disabled?: boolean; full?: boolean; onChange: (checked: boolean) => void };
  /** full = B-Card (spec cells, feature tags, 190px image) · results = the list card (meta line, 170px image) */
  variant?: "full" | "results";
  /** «آخر تحديث …» under the card */
  showUpdated?: boolean;
  waText?: string;
  lang?: "ar" | "en";
  className?: string;
}

/** floor values → the words the boards print (data/units FLOOR_WORDS prints the same) */
const FLOOR_WORDS: Record<string, string> = { "0": "الأرضي", "1": "الأول", "2": "الثاني", "3": "الثالث", "4": "الرابع", "4+roof": "الرابع والسطح" };
const ORIENTATION_F: Record<string, string> = { شمالي: "شمالية", جنوبي: "جنوبية", شرقي: "شرقية", غربي: "غربية" };

export function floorWord(value?: string): string | undefined {
  return value ? (FLOOR_WORDS[value] ?? value) : undefined;
}
/** «شمالي» → «شمالية» for the «واجهة …» line; compounds («شمالي غربي») word by word */
export function orientationWord(value?: string): string | undefined {
  return value
    ? value
        .split(" ")
        .map((w) => ORIENTATION_F[w] ?? w)
        .join(" ")
    : undefined;
}

function featureTags(unit: Unit): string[] {
  const f = unit.features as unknown as Record<string, unknown>;
  return FEATURE_LABELS.filter((x) => f[x.key] === true).map((x) => x.label);
}

export function UnitCard({ unit, href, projectName, projectHref, districtName, deliveryLabel, floorLabel, orientationLabel, status, fromOwner, tier, src, compare, variant = "results", showUpdated, waText, lang = "ar", className }: UnitCardProps) {
  const code = useVisitorCode();
  const floor = floorLabel ?? floorWord(unit.floor?.value);
  const facing = orientationLabel ?? orientationWord(unit.orientation?.value);
  const slotUnit = { model: unit.model, buildingNameAr: unit.buildingNameAr, areaM2: unit.areaM2, beds: unit.beds, baths: unit.baths, floor, orientation: unit.orientation?.value };
  const st = status ?? unit.status;
  const link = href ?? `/units/${unit.slug}`;
  const imageTier = tier ?? unit.imageTier;
  const cover = unit.images[0] ?? `IMG-UNIT-${unit.code}`;
  const perM = calcPpm(unit.priceSar, unit.areaM2);
  const en = lang === "en";
  // the result boards write «2 حمام» / «3 حمامات» and add one standout feature: maid room first, else balcony
  const bathsCard = unit.baths === 2 ? "2 حمام" : bathsLabel(unit.baths);
  const standout = unit.features.maid ? " · غرفة خادمة" : unit.features.balcony ? " · بلكونة" : "";
  const metaLine = `${bedsLabel(unit.beds)} · ${bathsCard} · ${fmtArea(unit.areaM2)} م²${standout}`;
  const metaEn = `${unit.beds} bed · ${unit.baths} bath · ${fmtArea(unit.areaM2)} m²`;

  if (st === "sold") {
    const soldOn = unit.soldOn ? fmtDate(unit.soldOn).slice(0, 7) : undefined;
    const text = waText ?? `أريد وحدة مشابهة لنموذج ${unit.model} ${unit.buildingNameAr} · ${unit.code} · ${code}`;
    return (
      <article aria-label={`${unit.nameAr}، عمارة ${unit.buildingNameAr}، مباعة`} className={cx("flex flex-col border-[1.5px] border-line bg-paper text-muted", className)}>
        <div className="relative">
          <ImageSlot slotId={cover} tier={imageTier === "typographic" ? "generated" : imageTier} src={src} sold cut="xl" className="h-30" showId={false} label={false} lang={lang} />
          <StatusBadge status="sold" lang={lang} className="absolute top-3 start-3" />
        </div>
        <div className="flex items-center justify-between gap-3 px-3.5 py-3">
          <span className="flex flex-col gap-0.5 min-w-0">
            <Link href={link} className="text-body font-extrabold text-ink no-underline hover:underline">
              {en ? `Apartment, model ${unit.model} · ${BUILDINGS[unit.building].nameEn}` : `${unit.nameAr} · ${unit.buildingNameAr}`}
            </Link>
            <span className="text-caption">{en ? metaEn : metaLine}</span>
          </span>
          <span className="flex flex-col items-end shrink-0">
            <Price value={unit.priceSar} sign={false} className="text-h3 font-extrabold line-through" />
            {soldOn && <span className="text-caption">{en ? `Sold ${soldOn}` : `بيعت ${soldOn}`}</span>}
          </span>
        </div>
        <Button variant="ghost" size="s" href={waLink(text)} className="mx-3.5 mb-3 h-11 text-label font-bold">
          {en ? "Tell me when a similar unit is listed" : "أبلغني عند توفر مشابه"}
        </Button>
      </article>
    );
  }

  if (st === "reserved") {
    const until = unit.reservedUntil ? fmtDate(unit.reservedUntil) : undefined;
    const text = waText ?? `أبلغني إن أُلغي حجز نموذج ${unit.model} ${unit.buildingNameAr} · ${unit.code} · ${code}`;
    return (
      <article className={cx("flex flex-col border-interactive bg-paper", className)}>
        <div className="relative">
          <ImageSlot slotId={cover} tier={imageTier} src={src} cut="xl" className="h-42.5" showId={false} lang={lang} unit={slotUnit} />
          <StatusBadge status="reserved" lang={lang} className="absolute top-3 start-3" />
          <BuildingTag className="absolute bottom-0 end-0">{en ? `${BUILDINGS[unit.building].nameEn} building` : `عمارة ${unit.buildingNameAr}`}</BuildingTag>
        </div>
        <div className="flex items-start justify-between gap-3 px-3.5 pt-3 pb-2">
          <Link href={link} className="flex flex-col gap-0.5 min-w-0 no-underline text-ink">
            <span className="text-h3 font-extrabold">{en ? `Apartment, model ${unit.model}` : unit.nameAr}</span>
            <span className="text-caption text-muted">{en ? metaEn : metaLine}</span>
          </Link>
          {until && <span className="shrink-0 pt-1 text-caption text-muted">{en ? `Reserved until ${until}` : `محجوز حتى ${until}`}</span>}
        </div>
        <PriceBand price={unit.priceSar} ppm={perM} variant="reserved" size="s" ppmLabel={en ? "per m²" : "للمتر"} lang={lang} />
        <div className="flex gap-2 px-3.5 pt-2.5 pb-3">
          <Button variant="ghost" size="s" href={waLink(text)} className="flex-1 h-11.5 text-label font-extrabold">
            {en ? "Tell me if the reservation is cancelled" : "أبلغني إن أُلغي الحجز"}
          </Button>
          {compare !== undefined && <CompareToggle checked={false} unavailable size="m" lang={lang} />}
        </div>
      </article>
    );
  }

  const text = waText ?? `أرغب بالاستفسار عن ${unit.nameAr}${projectName ? ` في ${projectName}` : ""} · ${unit.code} · ${code}`;
  const badge = <StatusBadge status={fromOwner ? "owner" : "available"} lang={lang} size={variant === "full" ? 54 : 52} className="absolute top-3 start-3" />;

  if (variant === "full") {
    const tags = [...featureTags(unit), ...(deliveryLabel ? [deliveryLabel] : [])];
    const place = [districtName ? (en ? districtName : `حي ${districtName}، جدة`) : null, floor ? (en ? `Floor ${unit.floor?.value ?? floor}` : `الطابق ${floor}`) : null, facing ? (en ? facing : `واجهة ${facing}`) : null].filter(Boolean).join(" · ");
    return (
      <div className={cx("flex flex-col", className)}>
        <article className="flex flex-col border-interactive bg-paper">
          <div className="relative">
            <Link href={link} className="block" aria-label={unit.nameAr}>
              <ImageSlot slotId={cover} tier={imageTier} src={src} cut="xl" className="h-47.5" lang={lang} unit={slotUnit} />
            </Link>
            {badge}
            {projectName && (
              <BuildingTag href={projectHref} className="absolute bottom-0 end-0">
                {projectName} · {en ? BUILDINGS[unit.building].nameEn : unit.buildingNameAr}
              </BuildingTag>
            )}
          </div>
          <div className="flex flex-col gap-1 px-3.5 pt-3.5 pb-2.5">
            <h3 className="m-0 text-h3 font-extrabold leading-snug">
              <Link href={link} className="no-underline text-ink hover:underline">
                {en ? `Apartment, model ${unit.model}` : unit.nameAr}
              </Link>
            </h3>
            {place && <p className="m-0 text-caption text-muted">{place}</p>}
          </div>
          <div className="grid grid-cols-3 gap-2 px-3.5 pb-3.5">
            {[
              { n: fmtArea(unit.areaM2), l: en ? "m²" : "م²" },
              { n: String(unit.beds), l: en ? "bedrooms" : "غرف نوم" },
              { n: String(unit.baths), l: en ? "bathrooms" : "حمامات" },
            ].map((c) => (
              <div key={c.l} className="flex flex-col items-center gap-0.5 px-1.5 py-2.5 bg-sand cut-s">
                <span className="text-h3 font-extrabold leading-none tnum">{c.n}</span>
                <span className="text-caption font-semibold text-muted">{c.l}</span>
              </div>
            ))}
          </div>
          <PriceBand price={unit.priceSar} ppm={perM} variant="dark" size="m" stacked ppmLabel={en ? "per m²" : "للمتر المربع"} lang={lang} />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-3.5 pt-3">
              {tags.map((t) => (
                <Tag key={t} size="s">
                  {t}
                </Tag>
              ))}
            </div>
          )}
          <div className="flex gap-2 px-3.5 pt-3 pb-3.5">
            <Button variant="whatsapp" size="m" href={waLink(text)} className="flex-1 h-12.5">
              {en ? "WhatsApp" : "واتساب"}
            </Button>
            {compare && <CompareToggle checked={compare.checked} disabled={compare.disabled} full={compare.full && !compare.checked} onChange={compare.onChange} size="l" lang={lang} />}
          </div>
        </article>
        {showUpdated && <p className="m-0 mt-2.5 px-0.5 text-caption font-semibold text-disabled">{en ? `Updated ${fmtDate(unit.updatedAt)}` : `آخر تحديث ${fmtDate(unit.updatedAt)}`}</p>}
      </div>
    );
  }

  return (
    <article className={cx("flex flex-col border-interactive bg-paper", className)}>
      <div className="relative">
        <Link href={link} className="block" aria-label={unit.nameAr}>
          <ImageSlot slotId={cover} tier={imageTier} src={src} cut="xl" className="h-42.5" showId={false} lang={lang} unit={slotUnit} />
        </Link>
        {badge}
        <BuildingTag className="absolute bottom-0 end-0">{en ? `${BUILDINGS[unit.building].nameEn} building` : `عمارة ${unit.buildingNameAr}`}</BuildingTag>
      </div>
      <div className="flex items-start justify-between gap-3 px-3.5 pt-3 pb-2">
        <Link href={link} className="flex flex-col gap-0.5 min-w-0 no-underline text-ink">
          <span className="text-h3 font-extrabold">{en ? `Apartment, model ${unit.model}` : unit.nameAr}</span>
          <span className="text-caption text-muted">{en ? metaEn : metaLine}</span>
        </Link>
        {deliveryLabel && <span className="shrink-0 pt-1 text-caption text-muted text-end">{deliveryLabel}</span>}
      </div>
      <PriceBand price={unit.priceSar} ppm={perM} variant="dark" size="s" ppmLabel={en ? "per m²" : "للمتر"} lang={lang} />
      <div className="flex gap-2 px-3.5 pt-2.5 pb-3">
        <Button variant="whatsapp" size="s" href={waLink(text)} className="flex-1 h-11.5 text-label">
          {en ? "WhatsApp" : "واتساب"}
        </Button>
        {compare && <CompareToggle checked={compare.checked} disabled={compare.disabled} full={compare.full && !compare.checked} onChange={compare.onChange} size="m" lang={lang} />}
      </div>
    </article>
  );
}
