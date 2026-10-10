"use client";
// /en/units · EN-Card-M: the English results list with the designed LTR card, the same data and URL filters.
import { CompareBar, Container, EnHtmlAttrs, Footer, Header, UnitCard, useCompare } from "@/components/ui";
import { fmtDate } from "@/lib/format";
import { unitsUrl } from "@/lib/url";
import { usePresenter, type Tier } from "@/lib/presenter";
import type { ImageTier, Unit } from "@/data/types";
import { BUILDINGS, unitBySlug } from "@/data/units";
import { useResults } from "./useResults";
import { CARD_BADGE_FIX, deliveryShortEn } from "./shared";
import { useCompareUrl } from "./useCompareUrl";

const TIER: Record<Tier, ImageTier> = { real: "real", gen: "generated", typo: "typographic" };

function nameEn(u: Unit): string {
  return `${u.nameEn ?? `Apartment, model ${u.model}`} · ${BUILDINGS[u.building].nameEn}`;
}

export function EnResults() {
  const r = useResults();
  const { state } = usePresenter();
  const tier = TIER[state.tier];
  const compare = useCompare();
  useCompareUrl();
  const avail = r.result.available.length;
  const sold = r.result.sold.length;
  const cards = r.groups.flatMap((g) => g.units.map((unit) => ({ unit, project: g.project })));

  return (
    <div dir="ltr" lang="en" className="font-latin">
      <EnHtmlAttrs />
      <Header variant="en" showEn switchHref={unitsUrl({ ...r.filters, sheet: null, pin: null }, "/units")} />
      <main className="pb-6">
        <Container className="pt-5 md:pt-8">
          <h1 className="m-0 text-[26px] font-extrabold leading-tight md:text-[36px]">Units in Jeddah</h1>
          <p className="m-0 mt-1.5 text-label font-normal text-muted">
            <strong className="text-ink tnum">{avail}</strong> for sale
            {sold > 0 && (
              <>
                {" "}
                and <strong className="text-ink tnum">{sold}</strong> sold
              </>
            )}{" "}
            within your filters · Updated {fmtDate(r.updatedAt)}
          </p>
          <div className={`mt-5 flex flex-col gap-4 md:grid md:grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] ${CARD_BADGE_FIX}`}>
            {cards.map(({ unit, project }) => (
              <UnitCard key={unit.code} unit={unit} status={unit.status} tier={tier} lang="en" projectName={project.nameEn} deliveryLabel={deliveryShortEn(project)} compare={{ checked: compare.has(unit.slug), full: compare.isFull, onChange: () => compare.toggle(unit.slug) }} />
            ))}
          </div>
          {sold > 0 && (
            <>
              <div className="mt-6 flex items-center gap-3">
                <span className="shrink-0 text-caption font-bold text-muted">Sold, for reference only</span>
                <span aria-hidden="true" className="h-px flex-1 bg-line" />
              </div>
              <div className={`mt-4 flex flex-col gap-4 md:grid md:grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] ${CARD_BADGE_FIX}`}>
                {r.result.sold.map((u) => (
                  <UnitCard key={u.code} unit={u} status="sold" tier={tier} lang="en" />
                ))}
              </div>
            </>
          )}
        </Container>
      </main>
      <CompareBar lang="en" nameOf={(slug) => (unitBySlug(slug) ? nameEn(unitBySlug(slug)!) : undefined)} />
      <Footer variant="en" compact />
    </div>
  );
}
