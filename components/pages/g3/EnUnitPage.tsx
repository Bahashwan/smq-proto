"use client";
// /en/units/[code] · EN-Unit-M: the English unit page, LTR with the mirrored cuts. Same data as the Arabic page:
// cover and thumbs, title, price block, «The unit» / «Price» / «Features», sticky ask + compare bar.
import Link from "next/link";
import { unitBySlug } from "@/data/units";
import type { Unit } from "@/data/types";
import { cx, fmtArea, fmtDate, fmtNum } from "@/lib/format";
import { Breadcrumb, Container, EnHtmlAttrs, Footer, Header, Mark, useVisitorCode } from "@/components/ui";
import { useMarks } from "@/lib/presenter";
import { floorEn, orientationEn, unitWaText, useUnitView, yesNo, type UnitView } from "./view";
import type { RealFiles } from "./slots";
import { UnitMedia } from "./UnitMedia";
import { UnitPriceBlock } from "./UnitPriceBlock";
import { ChipOnly, CompareBox, KV, SpecSection, Tile, WaCta } from "./parts";

/** The EN boards' district words («Al Rawdah»); other districts fall back to the fixture's English name. */
const DISTRICT_EN: Record<string, string> = { rawdah: "Al Rawdah" };

const Yes = ({ v }: { v: boolean | undefined }) => <span className={v ? "font-extrabold" : "font-bold text-muted"}>{yesNo(v, "en")}</span>;
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function inDistrict(v: UnitView): string {
  const n = v.compared.sameBedsListed;
  return n === 1 ? `The only ${v.unit.beds}-bedroom model` : `One of ${n} ${v.unit.beds}-bedroom models`;
}

export function EnUnitPage({ slug, realFiles }: { slug: string; realFiles: RealFiles }) {
  const unit = unitBySlug(slug) as Unit;
  const v = useUnitView(unit);
  const code = useVisitorCode();
  const { project, district } = v;
  const roof = unit.type === "roof-villa";
  const building = unit.building === "RZ" ? "Rose" : "Yasmin";
  const districtEn = (district && DISTRICT_EN[district.slug]) ?? district?.en ?? "";
  const name = roof ? "Roof villa" : `Model ${unit.model}`;
  const projectHref = project ? `/projects/${project.slug}` : "/projects";
  const floor = floorEn(unit.floor?.value);
  const facing = orientationEn(unit.orientation?.value);
  const wa = unitWaText(v, code, "en");
  const f = unit.features;
  const marks = useMarks();

  const spec = (
    <>
      {plural(unit.beds, "bedroom", "bedrooms")} · {plural(unit.baths, "bathroom", "bathrooms")} · {fmtArea(unit.areaM2)} m²{floor ? ` · ${floor} floor` : ""}
      {unit.floor?.tbc && <Mark>TBC</Mark>}
      {facing ? ` · ${facing.toLowerCase()} facing` : ""}
    </>
  );

  return (
    <div dir="ltr" lang="en" className="font-latin">
      <EnHtmlAttrs />
      <Header variant="en" showEn />
      <main>
        <Container className="pt-3 md:pt-6 md:pb-20">
          <Breadcrumb
            label="Breadcrumb"
            items={[
              { label: "Jeddah", href: "/en/units" },
              { label: districtEn, href: "/guide" },
              { label: project?.nameEn ?? "", href: projectHref },
              { label: `${name} · ${building}` },
            ]}
          />

          <div className="mt-3 md:mt-5 flex flex-col gap-5 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] md:gap-10 lg:gap-14 md:items-start">
            <UnitMedia view={v} realFiles={realFiles} lang="en" thumbs={v.status === "available"} />
            <aside className="flex flex-col gap-4 min-w-0" aria-label="Unit summary">
              <div className="flex flex-col gap-1.5">
                <Link href={projectHref} className="self-start text-caption md:text-label font-bold text-gold-text no-underline hover:underline">
                  {project?.nameEn} · {building} building · {districtEn}
                </Link>
                <h1 className="m-0 text-h1 leading-tight">{unit.nameEn ?? name}</h1>
                <p className="m-0 text-label md:text-body font-normal leading-relaxed text-muted">{spec}</p>
                <p className="m-0 text-caption font-normal text-muted">
                  Updated {fmtDate(v.updatedAt)} · model code {unit.code}
                </p>
              </div>
              <UnitPriceBlock view={v} lang="en" />
              <div className="hidden md:flex gap-3">
                <WaCta text={wa} title={`Ask about ${roof ? "the roof villa" : `model ${unit.model}`}`} sub={`Prefilled: ${unit.code}`} className="flex-1" />
                <CompareBox slug={unit.slug} label="Compare" lang="en" unavailable={v.status !== "available"} />
              </div>
            </aside>
          </div>

          <div className="mt-9 md:mt-14 grid grid-cols-1 gap-9 md:grid-cols-3 md:gap-x-10 md:gap-y-12">
            <SpecSection title="The unit" id="en-unit">
              <div className="grid grid-cols-3 gap-2 py-3 border-b border-line">
                <Tile value={fmtArea(unit.areaM2)} caption="m²" />
                <Tile value={unit.beds} caption={unit.beds === 1 ? "bedroom" : "bedrooms"} />
                <Tile value={unit.baths} caption={unit.baths === 1 ? "bathroom" : "bathrooms"} />
              </div>
              <KV compact label="Model code">{unit.code}</KV>
              <KV compact label="Type">{roof ? "Roof villa" : "Apartment"}</KV>
              <KV compact label="Floor">
                {floor}
                {unit.floor?.tbc && <Mark>TBC</Mark>}
              </KV>
              <KV compact label="Ad licence number">{unit.adLicence ?? <ChipOnly>optional</ChipOnly>}</KV>
              <KV compact label="Orientation">
                {facing}
                {unit.orientation?.tbc && <Mark>TBC</Mark>}
              </KV>
            </SpecSection>

            <SpecSection title="Price" id="en-price">
              <KV compact label="Price" strong valueClassName="text-body">
                {fmtNum(unit.priceSar)} SAR
              </KV>
              <KV compact label="Per m²">{fmtNum(v.ppm)} SAR</KV>
              <KV compact label="Real estate transaction tax">{marks ? <ChipOnly>included / excluded, TBC</ChipOnly> : "included / excluded"}</KV>
              {v.status === "available" && !roof && <KV compact label="In the district">{inDistrict(v)}</KV>}
            </SpecSection>

            <SpecSection title="Features" id="en-features">
              <div className="grid grid-cols-2 gap-x-4">
                <KV compact label="Maid's room">
                  <Yes v={f.maid} />
                </KV>
                <KV compact label="Driver's room">
                  <Yes v={f.driver} />
                </KV>
                <KV compact label="Balcony">
                  <Yes v={f.balcony} />
                </KV>
                <KV compact label="Smart home">
                  <Yes v={f.smartHome} />
                </KV>
                <KV compact label="Kitchen">{f.kitchen === "tbc" ? <ChipOnly>TBC</ChipOnly> : f.kitchen === "open" ? "Open" : "Closed"}</KV>
                <KV compact label="Private parking">
                  <Yes v={f.parking > 0} />
                </KV>
              </div>
            </SpecSection>
          </div>
        </Container>

        <div className={cx("sticky bottom-0 z-30 mt-7 md:hidden border-t-[1.5px] border-ink bg-paper")}>
          <div className="container-smq flex items-stretch gap-2 pt-2.5 pb-3.5">
            <WaCta text={wa} title={`Ask about ${roof ? "the roof villa" : `model ${unit.model}`}`} sub={`Prefilled: ${unit.code}`} className="flex-1 min-w-0" />
            <CompareBox slug={unit.slug} label="Compare" lang="en" size="s" unavailable={v.status !== "available"} />
          </div>
        </div>
      </main>
      <Footer variant="en" compact />
    </div>
  );
}
