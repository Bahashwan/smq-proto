"use client";
// /units/map · Results-Map-M/D: the same query as the list, hexagon pins with computed counts, a bottom sheet on the
// phone and the side card + popover on desktop. `&pin=<projectId>` selects a pin; the provider note is not rendered.
import Link from "next/link";
import { useMemo } from "react";
import { BottomSheet, Button, Chip, Container, Footer, Header, IconButton, ImageSlot, Mark, Pill, Price, WhatsAppIcon } from "@/components/ui";
import { SchematicMap } from "@/components/map";
import { cx, fmtArea, fmtNum, bedsLabel, bathsLabel, waLink } from "@/lib/format";
import { setQuery } from "@/lib/location";
import { unitsUrl, type SortParam } from "@/lib/url";
import { projectById } from "@/data/projects";
import { districtAr } from "@/data/districts";
import { UNIT_TYPE_AR } from "@/data/units";
import { projectStats, unitPpm } from "@/data/selectors";
import type { Unit } from "@/data/types";
import { useResults } from "./useResults";
import { bedsPhrase, budgetShort, buildPins, buildingsCountWord, deliveryShort, projectsWord, showTheUnitsLabel, typesPhrase, unitsWord, type ResultPin } from "./shared";
import { ActiveChips, FiltersButton, SortControl, ViewToggle, viewHrefs } from "./ResultsToolbar";
import { FiltersSheet } from "./FiltersForm";

/** the map board's sort options, verbatim */
const MAP_SORT: { value: SortParam; label: string }[] = [
  { value: "ppm", label: "الأقل سعراً للمتر" },
  { value: "price", label: "الأقل سعراً" },
  { value: "area", label: "الأكبر مساحة" },
];

function eyebrow(pin: ResultPin): React.ReactNode {
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

/** The project card of the selected pin (phone sheet body · desktop popover) */
function PinCard({ pin, listHref, variant, overrides }: { pin: ResultPin; listHref: string; variant: "sheet" | "popover"; overrides: ReturnType<typeof useResults>["overrides"] }) {
  const project = projectById(pin.pin.projectId);
  if (!project) return null;
  const stats = projectStats(project.id, overrides);
  const matched = pin.pin.matched;
  const availInProject = stats.available;
  const popover = variant === "popover";
  if (pin.kind === "soon") {
    return (
      <div className={cx("flex flex-col gap-2", popover && "p-4")}>
        {eyebrow(pin)}
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
  const phoneLine = `${unitsWord(matched.length)} مطابقة من ${availInProject} متاحة · ${bedsPhrase(matched)} · ${typesPhrase(matched.length ? matched : [])}`;
  const desktopLine = `${unitsWord(matched.length)} مطابقة من ${availInProject} متاحة · ${buildingsCountWord(project.buildings.length)} · ${bedsPhrase(matched)}${matched.length ? ` و${typesPhrase(matched)}` : ""}`;
  return (
    <div className="flex flex-col">
      {popover ? (
        <ImageSlot slotId={project.images[0]} tier="generated" className="h-[130px]" cut="img" showId={false} compact />
      ) : null}
      <div className={cx("flex gap-3", popover ? "flex-col px-4 pt-3" : "items-start")}>
        {!popover && <ImageSlot slotId={project.images[0]} tier="generated" className="h-[86px] w-[112px] shrink-0" cut="img" showId={false} compact />}
        <div className="flex min-w-0 flex-col gap-1">
          {eyebrow(pin)}
          <Link href={`/projects/${project.slug}`} className="text-h3 font-extrabold text-ink no-underline hover:underline">
            {project.nameAr}
          </Link>
          <span className="text-caption font-normal text-muted md:hidden">{phoneLine}</span>
          <span className="hidden text-caption font-normal text-muted md:inline">{desktopLine}</span>
          {pin.pin.priceFrom != null && pin.pin.priceTo != null && (
            <span className="text-caption font-normal text-muted">
              من <Price value={pin.pin.priceFrom} sign={false} className="text-h3 font-extrabold text-ink" /> إلى <Price value={pin.pin.priceTo} sign={false} className="font-extrabold text-ink" />
            </span>
          )}
        </div>
      </div>
      <div className={cx("flex items-center gap-2", popover ? "p-4" : "pt-4")}>
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

/** Desktop side column: the matching units of the selected project */
function SideList({ pin, overrides, filters }: { pin: ResultPin | null; overrides: ReturnType<typeof useResults>["overrides"]; filters: ReturnType<typeof useResults>["filters"] }) {
  if (!pin || pin.kind === "soon") {
    const project = pin ? projectById(pin.pin.projectId) : null;
    return (
      <aside aria-label="الوحدات في المشروع المحدد" className="flex flex-col bg-cream">
        <div className="flex items-center justify-between gap-3 bg-paper px-4 py-3">
          <span className="text-label font-extrabold">{project ? `${project.nameAr} · قريباً` : "اختر مشروعاً على الخريطة"}</span>
        </div>
        <p className="m-0 px-4 py-4 text-caption font-normal text-muted">{project ? "لم تُدرج وحدات هذا المشروع بعد." : "الدبوس الذهبي يفتح وحدات المشروع المطابقة لفلاترك."}</p>
      </aside>
    );
  }
  const project = projectById(pin.pin.projectId)!;
  const matched = pin.pin.matched;
  const stats = projectStats(project.id, overrides);
  const others: Unit[] = stats.available - matched.length > 0 ? [] : [];
  void others;
  const rest = stats.available - matched.length;
  const roofOnly = rest > 0 && filters.max != null;
  const note = rest > 0 ? `و${unitsWord(rest)} أخرى · ${roofOnly ? "خارج الميزانية" : "خارج فلاترك"}` : null;
  return (
    <aside aria-label="الوحدات في المشروع المحدد" className="flex min-h-0 flex-col bg-cream">
      <div className="flex items-center justify-between gap-3 bg-paper px-4 py-3">
        <span className="text-label font-extrabold">
          {project.nameAr} · {matched.length} مطابقة
        </span>
        <Link href={`/projects/${project.slug}`} className="text-caption font-bold text-ink no-underline hover:underline">
          صفحة المشروع
        </Link>
      </div>
      <div className="flex flex-col gap-2 p-3">
        {matched.map((u) => (
          <Link key={u.code} href={`/units/${u.slug}`} className="flex items-center gap-3 bg-paper p-2 text-ink no-underline hover:bg-sand motion-hover transition-colors">
            <ImageSlot slotId={u.images[0]} tier="generated" className="h-14 w-[72px] shrink-0" cut="none" showId={false} label={false} compact />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-label font-extrabold">
                {u.code} · {UNIT_TYPE_AR[u.type]} · {u.buildingNameAr}
              </span>
              <span className="text-caption font-normal text-muted">
                {bedsLabel(u.beds)} · {bathsLabel(u.baths)} · {fmtArea(u.areaM2)} م²
              </span>
              <span className="text-body font-extrabold tnum">
                {fmtNum(u.priceSar)} <span className="text-caption font-semibold text-muted">{fmtNum(unitPpm(u))} للمتر</span>
              </span>
            </span>
            <span aria-hidden="true" className="hex-flat size-4 shrink-0 bg-gold" />
          </Link>
        ))}
        {note && <span className="px-1 pt-1 text-caption font-normal text-muted">{note}</span>}
      </div>
    </aside>
  );
}

export function MapPage() {
  const r = useResults();
  const pins = useMemo(() => buildPins(r.filters, r.overrides), [r.filters, r.overrides]);
  const selected = pins.find((p) => p.id === r.filters.pin) ?? null;
  const hrefs = viewHrefs(r.filters);
  const total = r.result.available.length;
  const withMatches = pins.filter((p) => (p.count ?? 0) > 0).length;
  const budget = budgetShort(r.filters.max);
  const listHref = unitsUrl({ ...r.filters, sheet: null, pin: null });
  const select = (id: string) => setQuery({ pin: id }, "replace");
  const close = () => setQuery({ pin: null }, "replace");
  const sortChange = (s: SortParam) => setQuery({ sort: s === "price" ? null : s }, "replace");
  const addChips = [!r.filters.district && { label: "+ الحي" }, !r.filters.type.length && { label: "+ النوع" }].filter(Boolean) as { label: string }[];

  return (
    <>
      <Header showEn />
      <main className="flex min-h-[calc(100dvh-64px)] flex-col bg-slot md:bg-paper">
        {/* phone bar */}
        <div className="bg-paper md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-label font-extrabold">
              {unitsWord(total)}
              {budget && <> · {budget}</>}
            </span>
            <ViewToggle active="map" gridHref={hrefs.grid} mapHref={hrefs.map} labels="map" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3">
            <FiltersButton variant="map" count={r.constraints.length} href={hrefs.sheet} className="h-9 shrink-0 text-caption" />
            <ActiveChips filters={r.filters} clearLabel={null} className="flex-nowrap" />
          </div>
        </div>
        {/* desktop bar */}
        <div className="hidden bg-paper md:block">
          <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="me-2 text-body font-extrabold">
                {unitsWord(total)} في {projectsWord(withMatches)}
              </span>
              <ActiveChips filters={r.filters} />
              {addChips.map((c) => (
                <Chip key={c.label} size="s" href={hrefs.sheet}>
                  {c.label}
                </Chip>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-caption font-bold">
                ترتيب
                <SortControl value={r.filters.sort} onChange={sortChange} options={MAP_SORT} prefix={null} label="ترتيب" className="h-10 text-caption" />
              </label>
              <ViewToggle active="map" gridHref={hrefs.grid} mapHref={hrefs.map} labels="map" className="h-10" />
            </div>
          </Container>
        </div>

        <div className="flex flex-1 flex-col md:grid md:grid-cols-[420px_minmax(0,1fr)] md:border-t md:border-line">
          <div className="hidden md:flex md:min-h-0 md:flex-col">
            <SideList pin={selected} overrides={r.overrides} filters={r.filters} />
          </div>
          <SchematicMap variant="phone" pins={pins} selectedId={selected?.id ?? null} onSelect={select} regionLabel="جدة · شمال وسط" onLocate={() => select(pins[0]?.id ?? "")} className="h-[480px] flex-1 md:hidden" />
          <SchematicMap
            variant="desktop"
            pins={pins}
            selectedId={selected?.id ?? null}
            onSelect={select}
            className="hidden h-[720px] md:block"
            renderPopover={(pin) => {
              const p = pins.find((x) => x.id === pin.id);
              return p ? (
                <section aria-label={p.label} className="border-interactive bg-paper text-ink">
                  <PinCard pin={p} listHref={listHref} variant="popover" overrides={r.overrides} />
                </section>
              ) : null;
            }}
          />
        </div>
      </main>
      <div className="hidden md:block">
        <Footer compact />
      </div>
      <div className="md:hidden">
        <BottomSheet open={!!selected} onClose={close} title={selected ? (selected.kind === "owner" ? selected.label : (projectById(selected.pin.projectId)?.nameAr ?? selected.label)) : undefined} closeLabel="إغلاق البطاقة" labelledBy="pin-sheet-title">
          {selected && <PinCard pin={selected} listHref={listHref} variant="sheet" overrides={r.overrides} />}
        </BottomSheet>
      </div>
      <FiltersSheet filters={r.filters} overrides={r.overrides} />
    </>
  );
}

export { districtAr as _districtAr };
