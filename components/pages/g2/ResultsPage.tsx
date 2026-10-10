"use client";
// /units · Results-M/D, Results-Filters-M, State-Loading-M, Results-Loading-D, State-Empty-M/D, State-Cards.
// Filters, sort and the compare selection live in the URL; everything shown is computed from the fixtures.
import Link from "next/link";
import { useState } from "react";
import { CompareBar, Container, Footer, Header, LoadMore, Pill, UnitCard, useCompare } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import { usePresenter, type Tier } from "@/lib/presenter";
import type { ImageTier, Unit } from "@/data/types";
import { unitBySlug } from "@/data/units";
import { projectStats } from "@/data/selectors";
import { useResults, type ProjectGroup } from "./useResults";
import { compareName, deliveryShort, moreUnitsLabel, projectLine } from "./shared";
import { ActiveChips, FiltersButton, SortControl, ViewToggle, viewHrefs } from "./ResultsToolbar";
import { FiltersColumn, FiltersSheet } from "./FiltersForm";
import { DesktopGridSkeleton, FiltersColumnSkeleton, LoadingStatus, PhoneListSkeleton } from "./ResultsSkeleton";
import { EmptyState } from "./EmptyState";
import { setQuery } from "@/lib/location";

const PAGE_PHONE = 4;
const PAGE_DESKTOP = 6;
const TIER: Record<Tier, ImageTier> = { real: "real", gen: "generated", typo: "typographic" };

export const RESULTS_TITLE = "الوحدات في جدة";

function ProjectRow({ group, overrides }: { group: ProjectGroup; overrides: ReturnType<typeof useResults>["overrides"] }) {
  const { project } = group;
  const stats = projectStats(project.id, overrides);
  return (
    <div className="flex items-start justify-between gap-3">
      <Link href={`/projects/${project.slug}`} className="flex min-w-0 flex-col gap-0.5 text-ink no-underline hover:underline">
        <span className="text-body font-extrabold md:text-h3">{project.nameAr}</span>
        <span className="text-caption font-normal text-muted md:hidden">{projectLine(project)}</span>
        <span className="hidden text-caption font-normal text-muted md:inline">{projectLine(project, true)}</span>
      </Link>
      <Pill tone="sand" className="shrink-0">
        {stats.available} من {stats.listed} متاحة
      </Pill>
    </div>
  );
}

export function ResultsPage() {
  const r = useResults();
  const { state: presenter } = usePresenter();
  const tier = TIER[presenter.tier];
  const compare = useCompare();
  const [visible, setVisible] = useState(PAGE_PHONE);
  const hrefs = viewHrefs(r.filters);
  const avail = r.result.available.length;
  const sold = r.result.sold.length;
  const isEmpty = !r.loading && r.empty.isEmpty && r.groups.length === 0;
  const cards: { unit: Unit; group: ProjectGroup }[] = r.groups.flatMap((g) => g.units.map((unit) => ({ unit, group: g })));
  const remainingPhone = Math.max(0, cards.length - visible);
  const remainingDesktop = Math.max(0, cards.length - Math.max(visible, PAGE_DESKTOP));
  const compareProps = (unit: Unit) => ({ checked: compare.has(unit.slug), full: compare.isFull, onChange: () => compare.toggle(unit.slug) });

  // cards are rendered once; the index decides which width shows them until «عرض … أخرى»
  const list = cards.map(({ unit, group }, i) => {
    const phoneHidden = i >= visible;
    const desktopHidden = i >= Math.max(visible, PAGE_DESKTOP);
    const first = i === 0 || cards[i - 1].group.project.id !== group.project.id;
    const cls = desktopHidden ? "hidden" : phoneHidden ? "hidden md:block" : undefined;
    return [
      first ? (
        <div key={`${group.project.id}-row`} className={cls ? `${cls} md:col-span-full` : "md:col-span-full"}>
          <ProjectRow group={group} overrides={r.overrides} />
        </div>
      ) : null,
      <div key={unit.code} className={cls}>
        <UnitCard unit={unit} status={unit.status} tier={tier} projectName={group.project.nameAr} deliveryLabel={deliveryShort(group.project)} compare={compareProps(unit)} />
      </div>,
    ];
  });

  return (
    <>
      <Header showEn />
      <main className="pb-6">
        <Container className="pt-5 md:pt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-1.5">
              <h1 className="m-0 text-[26px] font-extrabold leading-tight md:text-[36px]">{RESULTS_TITLE}</h1>
              {r.loading ? (
                <LoadingStatus />
              ) : isEmpty ? (
                <p className="m-0 text-label font-normal text-muted">
                  <strong className="text-ink tnum">0</strong> وحدات ضمن فلاترك
                </p>
              ) : (
                <p className="m-0 text-label font-normal text-muted">
                  <strong className="text-ink tnum">{avail}</strong> متاحة
                  {sold > 0 && (
                    <>
                      {" "}
                      و<strong className="text-ink tnum">{sold}</strong> مباعة
                    </>
                  )}{" "}
                  ضمن فلاترك · تحديث {fmtDate(r.updatedAt)}
                </p>
              )}
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <SortControl value={r.filters.sort} onChange={(s) => setQuery({ sort: s === "price" ? null : s }, "replace")} />
              <ViewToggle active="grid" gridHref={hrefs.grid} mapHref={hrefs.map} labels />
            </div>
          </div>

          {/* phone toolbar: sticky filters / sort / view, then the active chips */}
          <div className="sticky top-14 z-20 -mx-4 mt-4 bg-paper px-4 pb-3 pt-2 md:hidden">
            <div className="flex items-center gap-2">
              <FiltersButton count={r.constraints.length} href={hrefs.sheet} />
              <SortControl value={r.filters.sort} onChange={(s) => setQuery({ sort: s === "price" ? null : s }, "replace")} className="min-w-0 flex-1" />
              <ViewToggle active="grid" gridHref={hrefs.grid} mapHref={hrefs.map} />
            </div>
            <ActiveChips filters={r.filters} className="mt-3" />
          </div>

          <div className="mt-4 grid gap-6 md:mt-6 md:grid-cols-[300px_minmax(0,1fr)] md:items-start lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="hidden md:block">{r.loading ? <FiltersColumnSkeleton /> : <FiltersColumn filters={r.filters} overrides={r.overrides} />}</div>

            <div className="min-w-0">
              {r.loading ? (
                <>
                  <div className="md:hidden">
                    <PhoneListSkeleton />
                  </div>
                  <div className="hidden md:block">
                    <DesktopGridSkeleton />
                  </div>
                </>
              ) : isEmpty ? (
                <EmptyState filters={r.filters} empty={r.empty} />
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-4 md:grid md:grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] md:gap-4">{list}</div>
                  {sold > 0 && (
                    <>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="shrink-0 text-caption font-bold text-muted">مباعة، للمرجع فقط</span>
                        <span aria-hidden="true" className="h-px flex-1 bg-line" />
                      </div>
                      <div className="flex flex-col gap-4 md:grid md:grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))]">
                        {r.result.sold.map((u) => (
                          <UnitCard key={u.code} unit={u} status="sold" tier={tier} />
                        ))}
                      </div>
                    </>
                  )}
                  {remainingPhone > 0 && (
                    <div className="md:hidden">
                      <LoadMore label={moreUnitsLabel(remainingPhone)} onClick={() => setVisible((v) => v + PAGE_PHONE)} className="w-full" />
                    </div>
                  )}
                  {remainingDesktop > 0 && (
                    <div className="hidden md:block">
                      <LoadMore label={moreUnitsLabel(remainingDesktop)} onClick={() => setVisible((v) => Math.max(v, PAGE_DESKTOP) + PAGE_DESKTOP)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Container>
      </main>
      <CompareBar nameOf={(slug) => (unitBySlug(slug) ? compareName(unitBySlug(slug)!) : undefined)} />
      <Footer compact />
      <FiltersSheet filters={r.filters} overrides={r.overrides} />
    </>
  );
}
