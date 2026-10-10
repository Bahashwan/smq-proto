"use client";
// /units/map · Results-Map-M/D: the same query as the list, hexagon pins with computed counts, the project card docked
// under the map on the phone (non-modal, as drawn) and the side list + popover on desktop. `&pin=<projectId>` selects a
// pin; the board's provider note is not rendered.
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Button, Container, Footer, Header, IconButton, ImageSlot, Mark, Pill, Price, WhatsAppIcon } from "@/components/ui";
import { SchematicMap } from "@/components/map";
import { bathsLabel, bedsLabel, cx, fmtArea, fmtNum, waLink } from "@/lib/format";
import { setQuery } from "@/lib/location";
import { unitsUrl, type SortParam, type UnitFilters } from "@/lib/url";
import { projectById } from "@/data/projects";
import { UNIT_TYPE_AR } from "@/data/units";
import { activeConstraints, listedUnits, projectStats, unitPpm, withoutConstraint, type UnitOverrides } from "@/data/selectors";
import { useResults } from "./useResults";
import { RULE_B, RULE_E, RULE_T, bedsPhrase, budgetShort, buildPins, buildingsCountWord, deliveryShort, otherUnitsNote, projectsWord, showTheUnitsLabel, typesPhrase, unitsWord, writeFilters, type ResultPin } from "./shared";
import { FiltersButton, SortControl, ViewToggle, viewHrefs } from "./ResultsToolbar";
import { FiltersSheet } from "./FiltersForm";

/** the map board's sort options, verbatim */
const MAP_SORT: { value: SortParam; label: string }[] = [
  { value: "ppm", label: "الأقل سعراً للمتر" },
  { value: "price", label: "الأقل سعراً" },
  { value: "area", label: "الأكبر مساحة" },
];

/** «الروضة · تسليم الربع 2 · 2027 [للتأكيد]» */
function Eyebrow({ pin }: { pin: ResultPin }) {
  const project = projectById(pin.pin.projectId);
  const d = deliveryShort(project);
  return (
    <span className="text-caption font-bold text-gold-text">
      {pin.pin.districtAr}
      {d && <> · {d}</>}
      {project?.deliveryLabel.tbc && d && (
        <>
          {" "}
          <Mark>[للتأكيد]</Mark>
        </>
      )}
    </span>
  );
}

/** The selected project's card: docked under the phone map (`sheet`) or the desktop popover */
function PinCard({ pin, listHref, variant, overrides }: { pin: ResultPin; listHref: string; variant: "sheet" | "popover"; overrides: UnitOverrides }) {
  const project = projectById(pin.pin.projectId);
  if (!project) return null;
  const popover = variant === "popover";
  if (pin.kind === "soon") {
    return (
      <div className={cx("flex flex-col gap-2", popover ? "p-4" : "px-4 pb-4 pt-2.5")}>
        <Eyebrow pin={pin} />
        <span className="text-h3 font-extrabold">{project.nameAr}</span>
        <Pill tone="outline" className="self-start">
          قريباً
        </Pill>
        <Button variant="ghost" size="s" href="/projects" className="mt-1 self-start">
          المشاريع
        </Button>
      </div>
    );
  }
  const stats = projectStats(project.id, overrides);
  const matched = pin.pin.matched;
  const phoneLine = `${unitsWord(matched.length)} مطابقة من ${stats.available} متاحة · ${bedsPhrase(matched)} · ${typesPhrase(matched)}`;
  const desktopLine = `${unitsWord(matched.length)} مطابقة من ${stats.available} متاحة · ${buildingsCountWord(project.buildings.length)} · ${bedsPhrase(matched)}${matched.length ? ` و${typesPhrase(matched)}` : ""}`;
  const text = (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <Eyebrow pin={pin} />
      <Link href={`/projects/${project.slug}`} className="text-h3 font-extrabold text-ink no-underline hover:underline">
        {project.nameAr}
      </Link>
      <span className="text-caption font-normal text-muted">{popover ? desktopLine : phoneLine}</span>
      {pin.pin.priceFrom != null && pin.pin.priceTo != null && (
        <span className="flex items-baseline gap-1.5 text-caption font-normal text-muted">
          من <Price value={pin.pin.priceFrom} sign={false} className={cx("font-extrabold text-ink", popover ? "text-[20px]" : "text-h3")} /> إلى <Price value={pin.pin.priceTo} sign={false} className="font-extrabold text-ink" />
        </span>
      )}
    </div>
  );
  return (
    <div className="flex flex-col">
      {popover ? (
        <>
          <ImageSlot slotId={project.images[0]} tier="generated" className="h-[130px]" cut="img" showId={false} compact />
          <div className="px-4 pt-3">{text}</div>
        </>
      ) : (
        <div className="flex gap-3 px-4 pb-3 pt-2.5">
          <ImageSlot slotId={project.images[0]} tier="generated" className="h-[84px] w-[110px] shrink-0" cut="img" showId={false} compact />
          {text}
        </div>
      )}
      <div className={cx("flex items-center gap-2", popover ? "p-4" : "px-4 pb-4")}>
        <Button variant="secondary" size="s" href={listHref} className="h-11 flex-1 text-label">
          {showTheUnitsLabel(matched.length)}
        </Button>
        <IconButton label="واتساب" tone="gold" size={44} href={waLink(project.nameAr)}>
          <WhatsAppIcon size={20} />
        </IconButton>
      </div>
    </div>
  );
}

/** Desktop side column: the matching units of the selected project, then the ones the filters leave out */
function SideList({ pin, overrides, filters }: { pin: ResultPin | null; overrides: UnitOverrides; filters: UnitFilters }) {
  const project = pin ? projectById(pin.pin.projectId) : null;
  const head = "flex items-center justify-between gap-3 bg-paper px-5 py-3.5";
  if (!pin || !project || pin.kind === "soon") {
    return (
      <aside aria-label="الوحدات في المشروع المحدد" className="flex min-h-0 flex-1 flex-col bg-cream">
        <div className={cx(head, RULE_B)}>
          <span className="text-label font-extrabold">{project ? `${project.nameAr} · قريباً` : "اختر مشروعاً على الخريطة"}</span>
        </div>
        <p className="m-0 px-5 py-4 text-caption font-normal text-muted">{project ? "لم تُدرج وحدات هذا المشروع بعد." : "الدبوس الذهبي يفتح وحدات المشروع المطابقة لفلاترك."}</p>
      </aside>
    );
  }
  const matched = pin.pin.matched;
  const others = listedUnits(overrides).filter((u) => u.projectId === project.id && u.status === "available" && !matched.some((m) => m.code === u.code));
  const note = otherUnitsNote(others, filters.max);
  return (
    <aside aria-label="الوحدات في المشروع المحدد" className="flex min-h-0 flex-1 flex-col bg-cream">
      <div className={cx(head, RULE_B)}>
        <span className="text-label font-extrabold">
          {project.nameAr} · {matched.length} مطابقة
        </span>
        <Link href={`/projects/${project.slug}`} className="text-caption font-bold text-gold-text no-underline hover:text-ink hover:underline">
          صفحة المشروع
        </Link>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-5 py-3.5">
        {matched.map((u) => (
          <Link key={u.code} href={`/units/${u.slug}`} className="flex items-center gap-3 border-interactive bg-paper p-3 text-ink no-underline outline-gold -outline-offset-2 hover:outline-2 motion-hover">
            <ImageSlot slotId={u.images[0]} tier="generated" className="h-[72px] w-24 shrink-0" cut="img" showId={false} label={false} compact />
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-label font-extrabold">
                {u.code} · {UNIT_TYPE_AR[u.type]} · {u.buildingNameAr}
              </span>
              <span className="text-caption font-normal text-muted">
                {bedsLabel(u.beds)} · {u.baths === 2 ? "2 حمام" : bathsLabel(u.baths)} · {fmtArea(u.areaM2)} م²
              </span>
              <span className="text-body font-extrabold tnum">
                {fmtNum(u.priceSar)} <span className="text-caption font-semibold text-muted">{fmtNum(unitPpm(u))} للمتر</span>
              </span>
            </span>
            <span aria-hidden="true" className="hex-flat size-6 shrink-0 bg-gold" />
          </Link>
        ))}
        {note && <span className="pt-0.5 text-caption font-normal text-muted">{note}</span>}
      </div>
    </aside>
  );
}

/** The map bars' chips: outline (the list's are sand); on desktop the budget chip is ink with «الميزانية:» */
function MapChips({ filters, size }: { filters: UnitFilters; size: "s" | "m" }) {
  const desktop = size === "m";
  return (
    <>
      {activeConstraints(filters).map((c) => {
        const ink = desktop && c.key === "max";
        return (
          <button
            key={c.key}
            type="button"
            aria-label={`إزالة ${c.chipAr}`}
            onClick={() => writeFilters({ ...filters, ...withoutConstraint(filters, c.key) }, "replace")}
            className={cx("inline-flex shrink-0 items-center gap-1.5 border-interactive px-3 text-[12px] font-bold motion-hover transition-colors", desktop ? "h-9" : "h-[34px]", ink ? "bg-ink text-paper hover:bg-ink-2" : "bg-paper text-ink hover:bg-sand")}
          >
            {ink ? `الميزانية: ${c.chipAr}` : c.chipAr} <span aria-hidden="true">×</span>
          </button>
        );
      })}
    </>
  );
}

export function MapPage() {
  const r = useResults();
  const pins = useMemo(() => buildPins(r.filters, r.overrides), [r.filters, r.overrides]);
  const selected = pins.find((p) => p.id === r.filters.pin) ?? null;
  const hrefs = viewHrefs(r.filters, "map");
  const total = r.result.available.length;
  const withMatches = pins.filter((p) => (p.count ?? 0) > 0).length;
  const budget = budgetShort(r.filters.max);
  const listHref = unitsUrl({ ...r.filters, sheet: null, pin: null });
  const close = () => setQuery({ pin: null }, "replace");
  const select = (id: string) => setQuery({ pin: id === r.filters.pin ? null : id }, "replace");
  // «موقعي» (Results-Map-M): the browser's position selects the nearest pin; without a position the map stays as it is
  const locate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const d = (p: ResultPin) => (p.pin.centre.lat - coords.latitude) ** 2 + (p.pin.centre.lng - coords.longitude) ** 2;
        const near = [...pins].sort((a, b) => d(a) - d(b))[0];
        if (near) setQuery({ pin: near.id }, "replace");
      },
      () => {},
      { timeout: 8000, maximumAge: 600_000 },
    );
  };
  const sortChange = (s: SortParam) => setQuery({ sort: s === "price" ? null : s }, "replace");
  const addChips = [!r.filters.district && "+ الحي", !r.filters.type.length && "+ النوع"].filter(Boolean) as string[];
  const hasChips = r.constraints.length > 0;

  // Esc closes the docked card
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector('[role="dialog"]')) setQuery({ pin: null }, "replace");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <>
      <Header showEn switchHref={unitsUrl({ ...r.filters, sheet: null, pin: null }, "/en/units")} />
      <main className="flex h-[calc(100dvh-64px)] min-h-[560px] flex-col md:h-auto md:min-h-0">
        {/* phone bar */}
        <div className={cx("shrink-0 bg-paper px-4 pb-3 pt-2.5 md:hidden", RULE_B)}>
          <div className="flex items-center justify-between gap-2">
            <h1 className="m-0 text-body font-extrabold">
              {unitsWord(total)}
              {budget && <> · {budget}</>}
            </h1>
            <ViewToggle active="map" gridHref={hrefs.grid} mapHref={hrefs.map} labels="map" size="s" />
          </div>
          <div className="-mx-4 mt-2 flex items-center gap-2 overflow-x-auto px-4">
            <FiltersButton variant="map" count={r.constraints.length} href={hrefs.sheet} />
            <MapChips filters={r.filters} size="s" />
          </div>
        </div>

        {/* desktop bar */}
        <div className={cx("hidden shrink-0 bg-paper md:block", RULE_B)}>
          <Container className="flex flex-wrap items-center justify-between gap-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="m-0 me-2 text-[16px] font-extrabold leading-normal">
                {unitsWord(total)} في {projectsWord(withMatches)}
              </h1>
              <MapChips filters={r.filters} size="m" />
              {addChips.map((label) => (
                <Link key={label} href={hrefs.sheet} scroll={false} className="inline-flex h-9 shrink-0 items-center border-[1.5px] border-dashed border-ink bg-paper px-3 text-[12px] font-bold text-ink no-underline hover:bg-sand motion-hover transition-colors">
                  {label}
                </Link>
              ))}
              {hasChips && (
                <Link href={unitsUrl({ sort: r.filters.sort, pin: r.filters.pin }, "/units/map")} className="ms-1.5 text-[12px] font-bold text-gold-text underline hover:text-ink">
                  مسح الكل
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-[12px] font-bold">
                ترتيب
                <SortControl value={r.filters.sort} onChange={sortChange} options={MAP_SORT} prefix={null} label="ترتيب" size="s" />
              </label>
              <ViewToggle active="map" gridHref={hrefs.grid} mapHref={hrefs.map} labels="map" size="bar" />
            </div>
          </Container>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:grid md:h-[calc(100dvh-134px)] md:min-h-[600px] md:flex-none md:grid-cols-[420px_minmax(0,1fr)]">
          <div className={cx("hidden min-h-0 md:flex md:flex-col", RULE_E)}>
            <SideList pin={selected} overrides={r.overrides} filters={r.filters} />
          </div>
          <SchematicMap variant="phone" pins={pins} selectedId={selected?.id ?? null} onSelect={select} onLocate={locate} regionLabel="جدة · شمال وسط" className="min-h-[260px] flex-1 md:hidden" />
          <SchematicMap
            variant="desktop"
            pins={pins}
            selectedId={selected?.id ?? null}
            onSelect={select}
            className="hidden h-full md:block"
            renderPopover={(pin) => {
              const p = pins.find((x) => x.id === pin.id);
              return p ? (
                <section aria-label={p.label} className="border-interactive bg-paper text-ink">
                  <PinCard pin={p} listHref={listHref} variant="popover" overrides={r.overrides} />
                </section>
              ) : null;
            }}
          />
          {selected && (
            <section aria-label={selected.kind === "owner" ? selected.label : (projectById(selected.pin.projectId)?.nameAr ?? selected.label)} className={cx("shrink-0 bg-paper md:hidden", RULE_T)}>
              <button type="button" onClick={close} aria-label="إغلاق البطاقة" className="mx-auto flex h-6 w-24 items-end justify-center">
                <span aria-hidden="true" className="block h-1 w-10 bg-line" />
              </button>
              <PinCard pin={selected} listHref={listHref} variant="sheet" overrides={r.overrides} />
            </section>
          )}
        </div>
      </main>
      <div className="hidden md:block">
        <Footer compact />
      </div>
      <FiltersSheet filters={r.filters} overrides={r.overrides} />
    </>
  );
}
