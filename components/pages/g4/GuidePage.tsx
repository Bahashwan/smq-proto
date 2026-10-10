"use client";
// /guide · Guide-M, Guide-D. Only الروضة is live (guideTables); every other chip district is «قريباً».
// All figures are computed from the fixtures with the store's unit overrides merged in.
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon, Container, Header, Price, useVisitorCode } from "@/components/ui";
import { areaRange, guideDistricts, guideTables, listedUnits, unitDistrictSlug, type BedsRow, type TypeRow } from "@/data/selectors";
import { WA_TEMPLATES, fillTemplate } from "@/data/settings";
import { useUnitOverrides } from "@/lib/store";
import { useHasHydrated } from "@/lib/location";
import { cx, fmtNum, waLink } from "@/lib/format";
import { unitsUrl } from "@/lib/url";
import { areaRangeText, buildingsConstruct, deliveryShort, modelsWord, projectsListedWord, rangeParts, rangeText, scaleText, slashDate, unitsCount } from "./lib";
import { FOOTER_LINKS, OfTotal, PageFooter, StatBand } from "./parts";

const GUIDE_DISTRICT = "rawdah";

export function GuidePage() {
  const hydrated = useHasHydrated();
  const live = useUnitOverrides();
  const ov = hydrated ? live : undefined;
  const code = useVisitorCode();
  const g = guideTables(GUIDE_DISTRICT, ov);
  const chips = guideDistricts(ov);
  const listedArea = areaRange(listedUnits(ov).filter((u) => unitDistrictSlug(u) === GUIDE_DISTRICT));
  const general = WA_TEMPLATES.find((t) => t.id === "general");
  const wa = waLink(general ? fillTemplate(general.text, { code }) : undefined);
  const ppmTo = g.ppm ? fmtNum(g.ppm.max) : "";

  return (
    <>
      <Header />
      <main className="pb-8 lg:pb-16">
        <Container className="pt-6 lg:pt-12">
          {/* intro */}
          <section className="flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:items-end lg:gap-8">
            <div className="flex flex-col gap-2 lg:gap-2.5">
              <span className="text-caption font-bold text-gold-text lg:text-label">دليل الأسعار</span>
              <h1 className="m-0 text-h1 font-extrabold">كم يكلف السكن في جدة؟</h1>
            </div>
            <p className="m-0 max-w-lg text-label font-normal leading-relaxed text-muted lg:text-body">
              أرقام من وحداتنا المدرجة فعلاً، لا من إعلانات السوق. «يبدأ من» والنطاقات من الوحدات المتاحة فقط، والعدّاد يقول كم متاحاً من المدرج.
              <span className="hidden lg:inline"> سعر المتر = السعر ÷ المساحة الصافية.</span>
            </p>
          </section>

          {/* phone: district chips */}
          <nav aria-label="الأحياء" className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
            {chips.map(({ district, live: on, listed }) =>
              on ? (
                <a key={district.slug} href={`#${district.slug}`} aria-current="true" className="inline-flex h-10 shrink-0 items-center gap-2 bg-ink px-3.5 text-label font-bold text-paper no-underline">
                  {district.ar}
                  <span className="text-caption text-gold tnum">{listed}</span>
                </a>
              ) : (
                <span key={district.slug} className="inline-flex h-10 shrink-0 items-center gap-2 border-[1.5px] border-line px-3.5 text-label font-bold text-muted">
                  {district.ar}
                  <span className="text-caption">قريباً</span>
                </span>
              ),
            )}
          </nav>

          <div className="mt-4 lg:mt-8 lg:grid lg:grid-cols-[282px_minmax(0,1fr)] lg:items-start lg:gap-8">
            {/* desktop: district list */}
            <aside className="hidden border-interactive lg:block">
              <nav aria-label="الأحياء">
                <span className="block border-b-[1.5px] border-ink px-4 py-3.5 text-caption font-bold text-muted">الأحياء · جدة</span>
                {chips.map(({ district, live: on, listed }) =>
                  on ? (
                    <a key={district.slug} href={`#${district.slug}`} aria-current="true" className="flex min-h-15 items-center justify-between gap-3 bg-ink px-4 py-4 text-paper no-underline">
                      <span className="text-body font-extrabold">{district.ar}</span>
                      <span className="text-caption text-gold tnum">{unitsCount(listed)}</span>
                    </a>
                  ) : (
                    <span key={district.slug} className="flex min-h-15 items-center justify-between gap-3 border-t border-line px-4 py-4 text-muted">
                      <span className="text-body font-bold">{district.ar}</span>
                      <span className="text-caption">قريباً</span>
                    </span>
                  ),
                )}
              </nav>
              <div className="flex flex-col gap-2 border-t-[1.5px] border-ink p-4">
                <span className="text-label font-bold">لم تجد حيك؟</span>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 bg-gold px-4 text-label font-extrabold text-ink no-underline cut-s hover:bg-gold-hover motion-hover transition-colors">
                  أرسل ميزانيتك على واتساب
                </a>
              </div>
            </aside>

            {/* the live district */}
            <section id={g.districtSlug} aria-labelledby="guide-district" className="flex min-w-0 scroll-mt-20 flex-col">
              <div className="hidden lg:flex lg:items-baseline lg:justify-between lg:gap-4">
                <h2 id="guide-district" className="m-0 text-h2 font-extrabold">حي {g.districtAr}</h2>
                <span className="text-caption font-normal text-muted">
                  تحديث {slashDate(g.updatedAt)} · {projectsListedWord(g.byProject.length)}
                </span>
              </div>
              <h2 className="sr-only lg:hidden">حي {g.districtAr}</h2>

              {/* numbers band: phone (3 cells) / desktop (4 cells) */}
              <StatBand
                className="cut-l lg:hidden"
                cellClass="px-3.5 py-3.5"
                valueClass="text-h2"
                cells={[
                  { value: g.fromPrice != null ? fmtNum(g.fromPrice / 1000) : "—", label: "ألف ريال، يبدأ من", gold: true },
                  { value: g.ppm ? fmtNum(g.ppm.min) : "—", label: `إلى ${ppmTo} للمتر` },
                  { value: <OfTotal n={g.available} of={g.listed} className="text-label" />, label: "متاحة الآن" },
                ]}
              />
              <StatBand
                className="mt-6 hidden cut-l lg:grid"
                cellClass="px-5 py-6"
                valueClass="text-h2"
                cells={[
                  { value: g.fromPrice != null ? fmtNum(g.fromPrice) : "—", label: "يبدأ من", gold: true },
                  { value: g.ppm ? fmtNum(g.ppm.min) : "—", label: `إلى ${ppmTo} ريال للمتر` },
                  {
                    value: listedArea ? (
                      <>
                        {Math.round(listedArea.min)}
                        <span className="mx-1.5 text-label font-semibold text-on-ink-muted">إلى</span>
                        {Math.round(listedArea.max)}
                      </>
                    ) : (
                      "—"
                    ),
                    label: "م² المساحات المدرجة",
                  },
                  { value: <OfTotal n={g.available} of={g.listed} className="text-label" />, label: "وحدات متاحة الآن" },
                ]}
              />

              {/* desktop: price bars */}
              <div className="mt-6 hidden border-interactive px-6 pb-5 pt-6 lg:block">
                <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
                  <h3 className="m-0 text-body font-extrabold leading-snug">النطاق السعري حسب الغرف</h3>
                  <span className="text-caption font-normal text-muted">المقياس: {scaleText(g.scale)} ريال</span>
                </div>
                {g.byBeds.filter((r) => r.from != null).map((r) => (
                  <BarRow key={r.beds} row={r} scale={g.scale} />
                ))}
                <p className="m-0 pt-4 text-caption font-normal text-muted">المعيّن الذهبي = «يبدأ من». الشريط الأسود = النطاق المعتاد بين أقل وأعلى سعر مدرج.</p>
              </div>

              <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-6">
                <div className="flex min-w-0 flex-col gap-3.5 lg:gap-3">
                  <h3 className="m-0 text-body font-extrabold leading-snug">حسب عدد الغرف</h3>
                  <Table
                    head={["الغرف", "يبدأ من", <><span className="lg:hidden">النطاق المعتاد</span><span className="hidden lg:inline">النطاق · النماذج</span></>]}
                    rows={g.byBeds.map((r, i) => ({
                      key: String(r.beds),
                      href: unitsUrl({ district: GUIDE_DISTRICT, beds: r.beds }),
                      cells: [r.labelAr, r.from != null ? <Price value={r.from} sign={false} /> : "—", bedsNote(r, i === 0)],
                    }))}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-3.5 lg:gap-3">
                  <h3 className="m-0 text-body font-extrabold leading-snug">حسب نوع الوحدة</h3>
                  <Table
                    head={["النوع", "للمتر من", "المساحات"]}
                    rows={g.byType.map((r, i) => ({ key: r.type, cells: [r.labelAr, r.ppmFrom != null ? <Price value={r.ppmFrom} sign={false} /> : "—", typeNote(r, i === 0)] }))}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3.5 lg:gap-3">
                <h3 className="m-0 text-body font-extrabold leading-snug">حسب المشروع</h3>
                {g.byProject.map((p) => (
                  <ProjectRow key={p.project.id} item={p} />
                ))}
              </div>

              <p className="m-0 mt-5 text-caption font-normal leading-relaxed text-muted lg:hidden">
                آخر تحديث {slashDate(g.updatedAt)} · الأسعار بالريال السعودي شاملة ما يذكر في صفحة كل وحدة. سعر المتر = السعر ÷ المساحة الصافية للوحدة.
              </p>
            </section>
          </div>

          {/* phone: «لم تجد حيك؟» */}
          <section aria-labelledby="guide-ask" className="mt-7 flex flex-col gap-2.5 bg-gold p-5 text-ink [clip-path:polygon(0_0,100%_0,100%_100%,36px_100%,0_calc(100%-20px))] lg:hidden">
            <h2 id="guide-ask" className="m-0 text-h3 font-extrabold">لم تجد حيك؟</h2>
            <p className="m-0 text-label font-normal leading-relaxed text-on-gold-muted">أرسل ميزانيتك والحي الذي تفضله، ونرد عليك بما نعرفه عن السوق هناك خلال ساعات العمل.</p>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 bg-ink px-4 text-body font-extrabold text-paper no-underline hover:bg-ink-2 motion-hover transition-colors">
              أرسل طلبك على واتساب
            </a>
          </section>
        </Container>
      </main>
      <PageFooter links={FOOTER_LINKS.guide} />
    </>
  );
}

/** «459 إلى 555 ألف · 5 متاحة من 7» (phone spells «متاحة» on the first row) · «نموذج واحد · 1 من 1» */
function bedsNote(r: BedsRow, first: boolean): ReactNode {
  const counts = (
    <>
      {r.availableCount} {first && <span className="lg:hidden">متاحة </span>}من {r.listedCount}
    </>
  );
  if (r.from == null) return <>{counts}</>;
  return (
    <>
      {r.single ? "نموذج واحد" : rangeText(r.from, r.to)} · {counts}
    </>
  );
}
/** «80 إلى 147 م²» (+ «· 6 متاحة من 8» on desktop) */
function typeNote(r: TypeRow, first: boolean): ReactNode {
  return (
    <>
      {areaRangeText(r.area)}
      <span className="hidden lg:inline">
        {" "}
        · {r.availableCount} {first ? "متاحة " : ""}من {r.listedCount}
      </span>
    </>
  );
}

function Table({ head, rows }: { head: ReactNode[]; rows: { key: string; href?: string; cells: ReactNode[] }[] }) {
  const grid = "grid grid-cols-[1.2fr_1fr_1.2fr] items-baseline gap-2 px-3.5 lg:grid-cols-[1fr_1fr_1.3fr] lg:px-4";
  return (
    <div className="border-interactive">
      <div className={cx(grid, "border-b border-line py-2.5 text-caption font-bold text-muted")}>
        {head.map((h, i) => (
          <span key={i}>{h}</span>
        ))}
      </div>
      {rows.map((r, i) => {
        const inner = (
          <>
            <span className="text-body font-bold">{r.cells[0]}</span>
            <span className="text-h3 font-extrabold leading-none tnum">{r.cells[1]}</span>
            <span className="text-caption font-normal leading-relaxed text-muted lg:text-caption">{r.cells[2]}</span>
          </>
        );
        const cls = cx(grid, "py-3.5", i < rows.length - 1 && "border-b border-line");
        return r.href ? (
          <Link key={r.key} href={r.href} className={cx(cls, "text-ink no-underline hover:bg-sand motion-hover transition-colors")}>
            {inner}
          </Link>
        ) : (
          <div key={r.key} className={cls}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

function BarRow({ row, scale }: { row: BedsRow; scale: { min: number; max: number } }) {
  const span = Math.max(1, scale.max - scale.min);
  const from = row.from ?? scale.min;
  const to = row.to ?? from;
  const start = ((from - scale.min) / span) * 100;
  const width = ((to - from) / span) * 100;
  const roofOnly = row.units.length > 0 && row.units.every((u) => u.type === "roof-villa");
  const parts = rangeParts(from, row.single ? null : to);
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)_150px] items-center gap-4 border-b border-line py-4">
      <span className="text-label font-bold">
        {row.labelAr}
        {roofOnly ? "، روف" : ""}
      </span>
      <div className="relative h-4 bg-sand" aria-hidden>
        {width > 0 && <span className="absolute inset-y-0 bg-ink" style={{ insetInlineStart: `${start}%`, width: `${width}%` }} />}
        <span className="absolute top-1/2 h-4 w-3.5 -translate-y-1/2 hex-point bg-gold" style={{ insetInlineStart: `calc(${start}% - 7px)` }} />
      </div>
      <span className="text-caption font-normal text-muted">
        <strong className="font-bold text-ink tnum">{parts.a}</strong>
        {parts.b ? (
          <>
            {" "}
            إلى <strong className="font-bold text-ink tnum">{parts.b}</strong> {parts.word}
          </>
        ) : (
          <> {parts.word}{row.single ? " · نموذج واحد" : ""}</>
        )}
      </span>
    </div>
  );
}

function ProjectRow({ item }: { item: ReturnType<typeof guideTables>["byProject"][number] }) {
  const p = item.project;
  const href = `/projects/${p.slug}`;
  return (
    <>
      {/* phone card */}
      <Link href={href} className="flex items-center justify-between gap-3 border-interactive p-3.5 text-ink no-underline hover:bg-sand motion-hover transition-colors lg:hidden">
        <span className="flex min-w-0 flex-col gap-1">
          <span className="text-body font-extrabold">{p.nameAr}</span>
          <span className="text-caption font-normal leading-relaxed text-muted">
            {buildingsConstruct(p)} · {modelsWord(item.listed)} · تسليم {deliveryShort(p.deliveryLabel.value)}
          </span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-h3 font-extrabold leading-none tnum">{item.fromPrice != null ? fmtNum(item.fromPrice) : "—"}</span>
          <span className="text-caption font-normal text-muted">يبدأ من</span>
        </span>
      </Link>
      {/* desktop row */}
      <Link href={href} className="hidden grid-cols-[1.6fr_1fr_1fr_1fr_auto] items-center gap-4 border-interactive px-6 py-5 text-ink no-underline hover:bg-sand motion-hover transition-colors lg:grid">
        <span className="flex flex-col gap-1">
          <span className="text-body font-extrabold">{p.nameAr}</span>
          <span className="text-caption font-normal text-muted">
            {buildingsConstruct(p)} · {p.statusAr}
          </span>
        </span>
        <Stat value={item.fromPrice != null ? fmtNum(item.fromPrice) : "—"} label="يبدأ من" />
        <Stat value={item.ppmFrom != null ? fmtNum(item.ppmFrom) : "—"} label="للمتر من" />
        <Stat value={`${item.available} / ${item.listed}`} label="متاحة" />
        <ArrowIcon size={20} className="text-gold-text" />
      </Link>
    </>
  );
}
function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <span className="flex flex-col gap-1">
      <span className="text-h3 font-extrabold leading-none tnum">{value}</span>
      <span className="text-caption font-normal text-muted">{label}</span>
    </span>
  );
}
