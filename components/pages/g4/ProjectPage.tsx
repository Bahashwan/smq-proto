"use client";
// /projects/[slug] · Project-M, Project-D. Buildings and counts from projectBuildingCounts(), the models table from the
// listed units (store overrides merged), milestones with [للتأكيد], the keyless project embed at the district centre.
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Breadcrumb, Container, Header, IllustrativeLabel, ImageSlot, Mark, Price, WhatsAppIcon } from "@/components/ui";
import { MapEmbed, PROJECT_ZOOM } from "@/components/map";
import { projectBySlug } from "@/data/projects";
import { districtAr } from "@/data/districts";
import { modelLabel, UNIT_TYPE_AR } from "@/data/units";
import { directionsUrl } from "@/data/settings";
import { listedUnits, projectBuildingCounts, projectStats, unitPpm } from "@/data/selectors";
import type { Project, Unit } from "@/data/types";
import { useUnitOverrides } from "@/lib/store";
import { useHasHydrated } from "@/lib/location";
import { cx, fmtArea, fmtNum, waLink } from "@/lib/format";
import { apartmentsWithModels, area2, modelsWord, roofsWord, slashDate, soldMonth } from "./lib";
import { CheckHex, FOOTER_LINKS, GoldHex, OfTotal, PageFooter, RingHex, StatBand } from "./parts";

const SECTIONS = [
  { id: "buildings", label: "العمارتان", short: "العمارتان" },
  { id: "models", label: "النماذج", short: "النماذج" },
  { id: "location", label: "الموقع", short: "الموقع" },
  { id: "delivery", label: "التسليم والضمانات", short: "التسليم" },
] as const;
const MODEL_ORDER = ["A", "B", "C", "D", "RF"];

export function ProjectPage({ slug }: { slug: string }) {
  const p = projectBySlug(slug) as Project;
  const hydrated = useHasHydrated();
  const live = useUnitOverrides();
  const ov = hydrated ? live : undefined;
  const stats = projectStats(p.id, ov);
  const buildings = projectBuildingCounts(p.id, ov);
  const order = p.buildings.map((b) => b.code as string);
  const models = listedUnits(ov)
    .filter((u) => u.projectId === p.id)
    .sort((a, b) => order.indexOf(a.building) - order.indexOf(b.building) || MODEL_ORDER.indexOf(a.model) - MODEL_ORDER.indexOf(b.model));
  const dAr = districtAr(p.districtSlug);
  const wa = waLink(`أرغب بالاستفسار عن مشروع ${p.nameAr}`);
  const active = useActiveSection(SECTIONS.map((s) => s.id));

  const band = [
    { value: stats.fromPrice != null ? fmtNum(stats.fromPrice) : "—", label: "يبدأ من", gold: true },
    { value: stats.ppm ? fmtNum(stats.ppm.min) : "—", label: "للمتر من" },
    { value: <OfTotal n={stats.available} of={stats.listed} className="text-label" />, label: "متاحة" },
  ];

  return (
    <>
      <Header />
      <main>
        <Container className="pt-4 lg:pt-6">
          <Breadcrumb items={[{ label: "جدة", href: "/units" }, { label: dAr, href: "/guide" }, { label: p.nameAr }]} />
        </Container>

        {/* phone hero */}
        <div className="lg:hidden">
          <ImageSlot
            slotId={p.images[0]}
            tier="generated"
            ratio="3:2"
            alt={`${p.nameAr}، واجهة المشروع`}
            className="mt-3 [clip-path:polygon(0_0,100%_0,100%_100%,48px_100%,0_calc(100%-83px))]"
          >
            <span className="absolute start-4 top-4 bg-ink px-2.5 py-1.5 text-caption font-bold text-paper">{p.statusAr}</span>
          </ImageSlot>
          <Container className="flex flex-col gap-3 pt-5">
            <span className="text-caption font-bold text-gold-text">
              {dAr}، جدة · مشروع رقم {p.code}
            </span>
            <h1 className="m-0 text-h1 font-extrabold">{p.nameAr}</h1>
            <p className="m-0 text-body font-normal text-muted">{p.descriptionAr}</p>
            <StatBand className="cut-l" cellClass="px-3.5 py-3.5" valueClass="text-h3" cells={band} />
            <div className="flex flex-wrap gap-2">
              {p.features.map((f) => (
                <span key={f} className="border border-line px-2.5 py-1 text-caption font-semibold">
                  {f}
                </span>
              ))}
            </div>
          </Container>
        </div>

        {/* desktop hero */}
        <Container className="hidden lg:block lg:pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-4 bg-gold px-8 pb-10 pt-8 text-ink [clip-path:polygon(0_0,100%_0,100%_100%,64px_100%,0_calc(100%-37px))]">
              <span className="text-label font-bold text-on-gold-muted">
                {dAr}، جدة · مشروع رقم {p.code} · {p.statusAr}
              </span>
              <h1 className="m-0 text-display font-extrabold">{p.nameAr}</h1>
              <p className="m-0 text-body font-normal text-on-gold-muted">{p.descriptionAr}</p>
              <StatBand className="mt-1" cellClass="px-5 py-4" valueClass="text-h2" cells={band} />
              <div className="flex flex-wrap gap-2">
                {p.features.map((f) => (
                  <span key={f} className="border-interactive px-3 py-1.5 text-caption font-bold">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <ImageSlot
              slotId={p.images[0]}
              tier="generated"
              ratio="3:2"
              alt={`${p.nameAr}، واجهة المشروع`}
              label={false}
              showId={false}
              className="lg:aspect-auto [clip-path:polygon(0_0,100%_0,100%_calc(100%-83px),calc(100%-48px)_100%,0_100%)]"
            >
              <IllustrativeLabel className="absolute start-4 top-4 z-[1]" />
              <span dir="ltr" className="absolute end-4 top-4 z-[1] bg-paper px-2 py-1 text-caption font-normal leading-none text-muted">
                {p.images[0]} · 3:2
              </span>
            </ImageSlot>
          </div>
        </Container>

        {/* section nav */}
        <nav aria-label="أقسام الصفحة" className="sticky top-14 z-20 mt-6 border-y-[1.5px] border-ink bg-paper lg:mt-8">
          <Container className="flex items-center justify-between gap-4">
            <div className="-mx-4 flex overflow-x-auto px-4 lg:mx-0 lg:px-0">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "true" : undefined}
                  className={cx(
                    "inline-flex min-h-12 shrink-0 items-center whitespace-nowrap px-3 text-label font-bold no-underline motion-hover transition-colors lg:px-4 lg:text-body lg:font-bold",
                    active === s.id ? "-mb-[1.5px] border-b-[3px] border-gold text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  <span className="lg:hidden">{s.short}</span>
                  <span className="hidden lg:inline">{s.label}</span>
                </a>
              ))}
            </div>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="hidden min-h-10 shrink-0 items-center gap-2 bg-gold px-4 text-label font-extrabold text-ink no-underline cut-s hover:bg-gold-hover motion-hover transition-colors lg:inline-flex">
              اسأل عن المشروع على واتساب
            </a>
          </Container>
        </nav>

        <Container className="flex flex-col gap-10 pb-10 pt-8 lg:gap-16 lg:pb-16 lg:pt-14">
          {/* buildings */}
          <section id="buildings" aria-labelledby="h-buildings" className="scroll-mt-28 flex flex-col gap-4 lg:gap-6">
            <h2 id="h-buildings" className="m-0 text-h2 font-extrabold">
              العمارتان
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {buildings.map((b, i) => (
                <a key={b.code} href="#models" className="flex flex-col border-interactive text-ink no-underline hover:bg-sand motion-hover transition-colors lg:grid lg:grid-cols-[160px_minmax(0,1fr)]">
                  <ImageSlot slotId={p.images[i + 1] ?? p.images[0]} tier="generated" compact showId={false} cut="img" className="hidden lg:block lg:h-full lg:min-h-36" />
                  <span className="flex flex-col gap-1.5 p-4 lg:gap-2 lg:px-6 lg:py-5">
                    <GoldHex className="size-8 text-label">{b.letter}</GoldHex>
                    <span className="text-h3 font-extrabold">عمارة {b.nameAr}</span>
                    <span className="text-caption font-normal leading-relaxed text-muted lg:text-label lg:font-normal">
                      <span className="lg:hidden">
                        {b.apartments ? `${b.apartments} شقق` : ""}
                        {b.roofs ? ` + ${roofsWord(b.roofs)}` : ""}
                        <br />
                        {b.available} من {b.listed} متاحة
                      </span>
                      <span className="hidden lg:inline">
                        {apartmentsWithModels(b.units)}
                        {b.roofs ? ` و${roofsWord(b.roofs)}` : ""} · {b.available} من {b.listed} متاحة
                      </span>
                    </span>
                    {b.from != null && (
                      <span className="text-label font-bold lg:text-body lg:font-extrabold">
                        من {fmtNum(b.from)}
                        {b.to != null && b.to !== b.from && <span className="hidden ms-1.5 text-caption font-semibold text-muted lg:inline">إلى {fmtNum(b.to)}</span>}
                      </span>
                    )}
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* models */}
          <section id="models" aria-labelledby="h-models" className="scroll-mt-28 flex flex-col gap-4 lg:gap-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="h-models" className="m-0 text-h2 font-extrabold">
                كل النماذج
              </h2>
              <span className="text-caption font-normal text-muted">
                {modelsWord(stats.listed)} · الأسعار بالريال<span className="hidden lg:inline"> · تحديث {slashDate(stats.updatedAt)}</span>
              </span>
            </div>
            <ModelsList units={models} />
            <ModelsTable units={models} />
          </section>

          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:gap-8">
            {/* location */}
            <section id="location" aria-labelledby="h-location" className="scroll-mt-28 flex min-w-0 flex-col gap-4 lg:gap-6">
              <h2 id="h-location" className="m-0 text-h2 font-extrabold">
                الموقع
              </h2>
              <MapEmbed
                lat={p.centre.lat}
                lng={p.centre.lng}
                zoom={PROJECT_ZOOM}
                title={`خريطة موقع ${p.nameAr}`}
                placeholder="project"
                placeholderCaption={p.nameAr}
                label={
                  <>
                    الموقع تقريبي <Mark>[للتأكيد]</Mark>
                  </>
                }
                directionsHref={directionsUrl(p.centre.lat, p.centre.lng)}
              />
              <div className="flex flex-col text-label font-normal lg:text-body">
                <LocRow label="الحي">{dAr}، جدة</LocRow>
                <LocRow label="أقرب طريق رئيسي">
                  <Mark>[للتأكيد]</Mark>
                </LocRow>
                <LocRow label="الخدمات القريبة">
                  <Mark>[للتأكيد]</Mark>
                </LocRow>
              </div>
            </section>

            {/* delivery */}
            <section id="delivery" aria-labelledby="h-delivery" className="scroll-mt-28 flex min-w-0 flex-col gap-4 lg:gap-6">
              <h2 id="h-delivery" className="m-0 text-h2 font-extrabold">
                التسليم والضمانات
              </h2>
              <Delivery p={p} />
            </section>
          </div>
        </Container>

        {/* phone: the sticky WhatsApp bar */}
        <div className="sticky bottom-0 z-20 border-t border-line bg-paper px-4 py-3 lg:hidden">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-between gap-3 bg-gold px-4 text-ink no-underline cut-m">
            <span className="inline-flex items-center gap-2 text-body font-extrabold">
              <WhatsAppIcon size={20} />
              اسأل عن {p.nameAr}
            </span>
            <span className="text-caption font-semibold text-on-gold-muted">رسالة جاهزة باسم المشروع</span>
          </a>
        </div>
      </main>
      <PageFooter links={FOOTER_LINKS.project} />
    </>
  );
}

function LocRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3">
      <span className="text-muted">{label}</span>
      <span className="font-bold">{children}</span>
    </div>
  );
}

function StatusWord({ u }: { u: Unit }) {
  if (u.status === "sold") return <span className="inline-block bg-ink px-1.5 py-0.5 text-caption font-bold text-paper">مباع</span>;
  if (u.status === "reserved") return <span className="inline-block border-[1.5px] border-ink px-1.5 py-px text-caption font-bold text-ink">محجوز</span>;
  return <span className="text-caption font-bold text-gold-text lg:text-label">متاح</span>;
}

/** Project-M: the four-column list */
function ModelsList({ units }: { units: Unit[] }) {
  const grid = "grid grid-cols-[1.3fr_0.9fr_1fr_0.7fr] items-center gap-2 px-3";
  return (
    <div className="border-interactive lg:hidden">
      <div className={cx(grid, "border-b border-line py-2.5 text-caption font-bold text-muted")}>
        <span>النموذج</span>
        <span>م² · غرف</span>
        <span>السعر · للمتر</span>
        <span>الحالة</span>
      </div>
      {units.map((u, i) => {
        const sold = u.status === "sold";
        const prevBuilding = i > 0 ? units[i - 1].building : u.building;
        const cls = cx(grid, "min-h-15 py-3", i > 0 && (prevBuilding !== u.building ? "border-t-[1.5px] border-ink" : "border-t border-line"), sold ? "text-muted" : "text-ink");
        const inner = (
          <>
            <span className="flex flex-col">
              <span className="text-body font-extrabold text-ink">
                {modelLabel(u)} · {u.buildingNameAr}
              </span>
              <span className="text-caption font-normal text-muted">{UNIT_TYPE_AR[u.type]}</span>
            </span>
            <span className="text-caption font-normal tnum">
              {fmtArea(u.areaM2)} · {u.beds}
            </span>
            <span className="flex flex-col">
              <span className={cx("text-body font-extrabold tnum", sold && "line-through")}>{fmtNum(u.priceSar)}</span>
              <span className="text-caption font-normal text-muted tnum">{fmtNum(unitPpm(u))}</span>
            </span>
            <span>
              <StatusWord u={u} />
            </span>
          </>
        );
        return sold ? (
          <div key={u.code} className={cls}>
            {inner}
          </div>
        ) : (
          <Link key={u.code} href={`/units/${u.slug}`} className={cx(cls, "no-underline hover:bg-sand motion-hover transition-colors")}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}

/** Project-D: the models table */
function ModelsTable({ units }: { units: Unit[] }) {
  const th = "px-4 py-3.5 text-start text-caption font-bold text-muted";
  return (
    <div className="hidden border-interactive lg:block">
      <table className="w-full border-collapse text-body">
        <thead>
          <tr className="border-b border-line">
            <th className={th}>النموذج</th>
            <th className={th}>العمارة</th>
            <th className={th}>النوع</th>
            <th className={th}>الغرف</th>
            <th className={th}>المساحة م²</th>
            <th className={th}>السعر</th>
            <th className={th}>للمتر</th>
            <th className={th}>الحالة</th>
            <th className={th}>
              <span className="sr-only">التفاصيل</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {units.map((u, i) => {
            const sold = u.status === "sold";
            const newBuilding = i > 0 && units[i - 1].building !== u.building;
            const td = "px-4 py-3";
            return (
              <tr key={u.code} className={cx(i > 0 && (newBuilding ? "border-t-[1.5px] border-ink" : "border-t border-line"), sold ? "text-muted" : "text-ink")}>
                <td className={cx(td, "font-extrabold text-ink")}>{modelLabel(u)}</td>
                <td className={td}>{u.buildingNameAr}</td>
                <td className={td}>{UNIT_TYPE_AR[u.type]}</td>
                <td className={cx(td, "tnum")}>{u.beds}</td>
                <td className={cx(td, "tnum")}>{area2(u.areaM2)}</td>
                <td className={cx(td, "font-extrabold tnum", sold && "line-through")}>
                  <Price value={u.priceSar} sign={false} />
                </td>
                <td className={cx(td, "tnum")}>{fmtNum(unitPpm(u))}</td>
                <td className={td}>
                  <StatusWord u={u} />
                </td>
                <td className={cx(td, "text-end")}>
                  {sold ? (
                    <span className="text-caption font-normal">بيعت {soldMonth(u.soldOn)}</span>
                  ) : (
                    <Link href={`/units/${u.slug}`} className="inline-flex min-h-9 items-center border-interactive px-3 text-caption font-bold text-ink no-underline hover:bg-sand motion-hover transition-colors">
                      التفاصيل
                      <span className="sr-only"> · {u.code}</span>
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Delivery({ p }: { p: Project }) {
  const done = p.milestones.filter((m) => m.done);
  const current = p.milestones.find((m) => !m.done);
  return (
    <div className="border-interactive">
      <Milestone mark={<CheckHex className="size-11" />} title={`حالة المشروع: ${p.statusAr}`}>
        {[...done.map((m) => m.label), current ? `${current.label} جارية` : null].filter(Boolean).join(" · ")}
        {current?.tbc && <Mark>[للتأكيد]</Mark>}
      </Milestone>
      <Milestone mark={<RingHex size="s">2</RingHex>} title={`التسليم المتوقع: ${p.deliveryLabel.value}`}>
        يُحدّث عند كل مرحلة
      </Milestone>
      <Milestone mark={<RingHex size="s">3</RingHex>} title={`شهادة الإشغال: ${p.occupancy}`}>
        <Mark>الحالة الحالية للتأكيد</Mark>
      </Milestone>
      <div className="flex flex-col gap-1 bg-sand px-4 py-3.5 text-caption font-normal lg:grid lg:grid-cols-2 lg:gap-4 lg:px-5 lg:text-label lg:font-normal">
        <span className="flex flex-wrap items-center gap-x-1 lg:flex-col lg:items-start">
          <strong className="font-bold">
            الضمانات<span className="lg:hidden">:</span>
          </strong>
          {p.warranties === "tbc" ? <Mark className="ms-0">للتأكيد من المطوّر</Mark> : p.warranties}
        </span>
        <span className="flex flex-wrap items-center gap-x-1 lg:flex-col lg:items-start">
          <strong className="font-bold">
            نوع التأمين<span className="lg:hidden">:</span>
          </strong>
          {p.insurance === "tbc" ? <Mark className="ms-0">[للتأكيد]</Mark> : p.insurance}
        </span>
      </div>
    </div>
  );
}
function Milestone({ mark, title, children }: { mark: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3.5 border-b border-line px-4 py-4 lg:px-5">
      <span className="flex size-11 shrink-0 items-center justify-center">{mark}</span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-body font-extrabold">{title}</span>
        <span className="text-caption font-normal text-muted lg:text-label lg:font-normal">{children}</span>
      </span>
    </div>
  );
}

/** The section in view drives the nav's active item (the first one by default). */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join(",");
  useEffect(() => {
    const list = key.split(",");
    let raf = 0;
    const update = () => {
      raf = 0;
      let cur = list[0];
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) cur = id;
      }
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActive(atEnd ? list[list.length - 1] : cur);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [key]);
  return active;
}
