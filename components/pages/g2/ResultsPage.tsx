"use client";
// /units · Results-M/D, Results-Filters-M, State-Loading-M, Results-Loading-D, State-Empty-M/D, State-Cards.
// Filters, sort and the compare selection (`u=`) live in the URL; everything shown is computed from the fixtures.
import Link from "next/link";
import { useEffect, useState } from "react";
import { CompareBar, Container, Footer, Header, LoadMore, MENU_AR, Pill, Price, Skeleton, StatusBadge, UnitCard, useCompare } from "@/components/ui";
import { bedsLabel, cx, fmtArea, fmtDate } from "@/lib/format";
import { setQuery } from "@/lib/location";
import { usePresenter, type Tier } from "@/lib/presenter";
import { unitsUrl, type SortParam } from "@/lib/url";
import type { ImageTier, Unit } from "@/data/types";
import { unitBySlug } from "@/data/units";
import { projectStats, type UnitOverrides } from "@/data/selectors";
import { useResults, type ProjectGroup } from "./useResults";
import { RULE_B, compareName, deliveryShort, filtersKey, moreUnitsLabel, projectLine, soldMonth } from "./shared";
import { ActiveChips, FiltersButton, SortControl, ViewToggle, viewHrefs } from "./ResultsToolbar";
import { FiltersColumn, FiltersSheet } from "./FiltersForm";
import { DesktopGridSkeleton, FiltersColumnSkeleton, LoadingStatus, PhoneListSkeleton, SLOW_AFTER_MS, SlowNotice, ToolbarSkeleton } from "./ResultsSkeleton";
import { EmptyState } from "./EmptyState";
import { useCompareUrl } from "./useCompareUrl";
import { useHeaderOffset } from "./useHeaderOffset";

const PAGE_PHONE = 4;
/** the phone sold strip opens with the latest sale; the others come with «عرض … أخرى» (Results-M) */
const SOLD_FIRST_PHONE = 1;
const PAGE_DESKTOP = 6;
/** the results footer as Results-M draws it: «دليل الأسعار · الخدمات · تعاون معنا · من نحن · تواصل معنا» */
const RESULTS_FOOTER_LINKS = MENU_AR.filter((l) => ["/guide", "/services", "/collaborate", "/about", "/contact"].includes(l.href));
const TIER: Record<Tier, ImageTier> = { real: "real", gen: "generated", typo: "typographic" };

export const RESULTS_TITLE = "الوحدات في جدة";

/** true once `active` has lasted `ms` (per `round`; a new round restarts the wait) */
function useAfter(active: boolean, ms: number, round: number): boolean {
  const [done, setDone] = useState(-1);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setDone(round), ms);
    return () => clearTimeout(t);
  }, [active, ms, round]);
  return active && done === round;
}

function ProjectRow({ group, overrides, desktop }: { group: ProjectGroup; overrides: UnitOverrides; desktop?: boolean }) {
  const { project } = group;
  const stats = projectStats(project.id, overrides);
  return (
    <div className={cx("flex items-center justify-between gap-3", desktop && cx("pb-3", RULE_B))}>
      <Link href={`/projects/${project.slug}`} className="flex min-w-0 flex-col gap-0.5 text-ink no-underline hover:underline">
        <span className={cx("font-extrabold", desktop ? "text-h3" : "text-[16px] leading-snug")}>{project.nameAr}</span>
        <span className="text-caption font-normal text-muted">{projectLine(project, desktop)}</span>
      </Link>
      <Pill tone="sand" className={cx("shrink-0", desktop && "md:px-2.5 md:py-2")}>
        {stats.available} من {stats.listed} متاحة
      </Pill>
    </div>
  );
}

/** the desktop sold strip card (Results-D): badge, name, rooms · area · sale month, struck price */
function SoldRow({ unit }: { unit: Unit }) {
  const sold = soldMonth(unit);
  return (
    <article aria-label={`${unit.nameAr}، عمارة ${unit.buildingNameAr}، مباعة`} className="flex items-center justify-between gap-3 border-[1.5px] border-line bg-paper p-3.5 text-muted">
      <StatusBadge status="sold" size={40} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Link href={`/units/${unit.slug}`} className="text-body font-extrabold text-ink no-underline hover:underline">
          {unit.nameAr} · {unit.buildingNameAr}
        </Link>
        <span className="text-caption font-normal">
          {bedsLabel(unit.beds)} · {fmtArea(unit.areaM2)} م²{sold ? ` · ${sold}` : ""}
        </span>
      </span>
      <Price value={unit.priceSar} sign={false} className="shrink-0 text-body font-extrabold line-through" />
    </article>
  );
}

function SoldDivider() {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="shrink-0 text-caption font-bold text-muted">مباعة، للمرجع فقط</span>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </div>
  );
}

interface ListProps {
  groups: ProjectGroup[];
  sold: Unit[];
  overrides: UnitOverrides;
  tier: ImageTier;
}

/** consecutive cards of the same project become one block under its project row */
function regroup(cards: { unit: Unit; group: ProjectGroup }[]): { group: ProjectGroup; units: Unit[] }[] {
  const out: { group: ProjectGroup; units: Unit[] }[] = [];
  for (const c of cards) {
    const last = out[out.length - 1];
    if (last && last.group.project.id === c.group.project.id) last.units.push(c.unit);
    else out.push({ group: c.group, units: [c.unit] });
  }
  return out;
}

function flatCards(groups: ProjectGroup[]) {
  return groups.flatMap((g) => g.units.map((unit) => ({ unit, group: g })));
}

/** Results-M: project row, cards (four a page) with the delivery line, the sold strip (the latest sale first), then
 *  «عرض … أخرى» counting the cards and the sales still folded */
function PhoneList({ groups, sold, overrides, tier }: ListProps) {
  const compare = useCompare();
  const cards = flatCards(groups);
  const [pages, setPages] = useState(1);
  const shownCards = Math.min(cards.length, pages * PAGE_PHONE);
  const shownSold = pages > 1 ? sold.length : Math.min(sold.length, SOLD_FIRST_PHONE);
  const remaining = cards.length - shownCards + (sold.length - shownSold);
  return (
    <div className="flex flex-col gap-3.5">
      {regroup(cards.slice(0, shownCards)).map(({ group, units }) => (
        <section key={group.project.id} aria-label={group.project.nameAr} className="flex flex-col gap-3.5">
          <ProjectRow group={group} overrides={overrides} />
          {units.map((unit) => (
            <UnitCard key={unit.code} unit={unit} status={unit.status} tier={tier} projectName={group.project.nameAr} deliveryLabel={deliveryShort(group.project)} compare={{ checked: compare.has(unit.slug), full: compare.isFull, onChange: () => compare.toggle(unit.slug) }} />
          ))}
        </section>
      ))}
      {shownSold > 0 && (
        <>
          <SoldDivider />
          {sold.slice(0, shownSold).map((u) => (
            <UnitCard key={u.code} unit={u} status="sold" tier={tier} />
          ))}
        </>
      )}
      {remaining > 0 && <LoadMore label={moreUnitsLabel(remaining)} onClick={() => setPages((n) => n + 1)} className="w-full" />}
    </div>
  );
}

/** Results-D: project row with its rule, the card grid (six a page, no delivery line: the row carries it), sold rows */
function DesktopList({ groups, sold, overrides, tier }: ListProps) {
  const compare = useCompare();
  const cards = flatCards(groups);
  const [visible, setVisible] = useState(PAGE_DESKTOP);
  const remaining = Math.max(0, cards.length - visible);
  const grid = "grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4";
  return (
    <div className="flex flex-col gap-4">
      {regroup(cards.slice(0, visible)).map(({ group, units }) => (
        <section key={group.project.id} aria-label={group.project.nameAr} className="flex flex-col gap-4">
          <ProjectRow group={group} overrides={overrides} desktop />
          <div className={grid}>
            {units.map((unit) => (
              <UnitCard key={unit.code} unit={unit} status={unit.status} tier={tier} projectName={group.project.nameAr} compare={{ checked: compare.has(unit.slug), full: compare.isFull, onChange: () => compare.toggle(unit.slug) }} />
            ))}
          </div>
        </section>
      ))}
      {remaining > 0 && <LoadMore label={moreUnitsLabel(remaining)} onClick={() => setVisible((v) => v + PAGE_DESKTOP)} />}
      {sold.length > 0 && (
        <>
          <SoldDivider />
          <div className={grid}>
            {sold.map((u) => (
              <SoldRow key={u.code} unit={u} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function ResultsPage() {
  const r = useResults();
  const { state: presenter } = usePresenter();
  const tier = TIER[presenter.tier];
  useCompareUrl();
  const headerOffset = useHeaderOffset();
  const [round, setRound] = useState(0);
  const slow = useAfter(r.skeletonSwitch, SLOW_AFTER_MS, round);
  const loading = r.loading && !slow;
  const hrefs = viewHrefs(r.filters);
  const avail = r.result.available.length;
  const reserved = r.result.reserved.length;
  const sold = r.result.sold.length;
  const isEmpty = !r.loading && r.empty.isEmpty && r.groups.length === 0;
  const key = filtersKey(r.filters);
  const sortChange = (s: SortParam) => setQuery({ sort: s === "price" ? null : s }, "replace");

  const status = slow ? (
    <SlowNotice onRetry={() => setRound((n) => n + 1)} />
  ) : loading ? (
    <LoadingStatus />
  ) : isEmpty ? (
    <p className="m-0 text-label font-normal text-muted md:hidden">
      <strong className="text-ink tnum">0</strong> وحدات ضمن فلاترك
    </p>
  ) : (
    <p className="m-0 text-label font-normal text-muted">
      <strong className="text-ink tnum">{avail}</strong> متاحة
      {reserved > 0 && (
        <>
          {" "}
          و<strong className="text-ink tnum">{reserved}</strong> محجوزة
        </>
      )}
      {sold > 0 && (
        <>
          {" "}
          و<strong className="text-ink tnum">{sold}</strong> مباعة
        </>
      )}{" "}
      ضمن فلاترك · تحديث {fmtDate(r.updatedAt)}
    </p>
  );

  return (
    <>
      <Header showEn switchHref={unitsUrl({ ...r.filters, sheet: null, pin: null }, "/en/units")} />
      <main className="pb-10">
        <Container className="pt-5 md:pt-9">
          <div className="flex flex-col gap-1.5 md:flex-row md:items-end md:justify-between md:gap-6">
            <div className="flex min-w-0 flex-col gap-1.5">
              <h1 className="m-0 text-[26px] font-extrabold leading-tight md:text-[36px]">{RESULTS_TITLE}</h1>
              {status}
            </div>
            {!isEmpty && <div className="hidden shrink-0 items-center gap-2.5 md:flex">{loading ? <ToolbarSkeleton /> : <SortControl value={r.filters.sort} onChange={sortChange} size="l" />}{!loading && <ViewToggle active="grid" gridHref={hrefs.grid} mapHref={hrefs.map} labels size="l" />}</div>}
          </div>
          {isEmpty && <ActiveChips filters={r.filters} className={cx("mt-4 hidden pb-4 md:flex", RULE_B)} />}
        </Container>

        {/* phone toolbar: sticky under the header; filters / sort / view, then the chips on one scrolling line */}
        <div className={cx("sticky z-20 mt-3 bg-paper md:hidden", RULE_B)} style={{ top: headerOffset }}>
          <Container className="flex flex-col gap-2.5 py-3">
            {loading ? (
              <Skeleton.Filters />
            ) : isEmpty ? (
              <ActiveChips filters={r.filters} clearLabel={null} scroll />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <FiltersButton count={r.constraints.length} href={hrefs.sheet} />
                  <SortControl value={r.filters.sort} onChange={sortChange} stacked className="flex-1" />
                  <ViewToggle active="grid" gridHref={hrefs.grid} mapHref={hrefs.map} />
                </div>
                <ActiveChips filters={r.filters} scroll />
              </>
            )}
          </Container>
        </div>

        {isEmpty ? (
          <Container className="pt-4 md:pt-6">
            <EmptyState filters={r.filters} empty={r.empty} />
          </Container>
        ) : (
          <>
            <Container className="pt-4 md:hidden">{slow ? null : loading ? <PhoneListSkeleton /> : <PhoneList key={key} groups={r.groups} sold={r.sold} overrides={r.overrides} tier={tier} />}</Container>
            <Container className="hidden pt-6 md:grid md:grid-cols-[300px_minmax(0,1fr)] md:items-start md:gap-8">
              <div>{loading ? <FiltersColumnSkeleton /> : <FiltersColumn filters={r.filters} overrides={r.overrides} />}</div>
              <div className="min-w-0">{slow ? null : loading ? <DesktopGridSkeleton /> : <DesktopList key={key} groups={r.groups} sold={r.sold} overrides={r.overrides} tier={tier} />}</div>
            </Container>
          </>
        )}
      </main>
      <CompareBar nameOf={(slug) => (unitBySlug(slug) ? compareName(unitBySlug(slug)!) : undefined)} />
      <Footer compact links={RESULTS_FOOTER_LINKS} privacy={false} />
      <FiltersSheet filters={r.filters} overrides={r.overrides} />
    </>
  );
}
