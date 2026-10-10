"use client";
// EN-Home-M budget block: slider, budget chips, bedrooms and district selects; the count and the CTA recompute from
// the fixtures as the budget moves.
import { useMemo, useState } from "react";
import { ArrowIcon, Button, Chip, RangeSlider, SelectField, BUDGET_MIN } from "@/components/ui";
import { availableUnits, unitDistrictSlug } from "@/data/selectors";
import { siteDistricts } from "@/data/districts";
import { lists } from "@/data/content";
import { useStore } from "@/lib/store";
import { fmtNum } from "@/lib/format";
import { unitsUrl } from "@/lib/url";

type BedsOption = "any" | "2plus" | "3";
const BEDS_OPTIONS: { value: BedsOption; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "2plus", label: "2 or more" },
  { value: "3", label: "3" },
];

/** 500000 → «500k», 1000000 → «1M» */
function shortEn(n: number): string {
  if (n >= 1_000_000) return `${Number.isInteger(n / 1_000_000) ? n / 1_000_000 : (n / 1_000_000).toFixed(1)}M`;
  return `${Math.round(n / 1000)}k`;
}

const SLIDER_STEP = 50_000;

export function EnFinder({ initialBudget = 700_000 }: { initialBudget?: number }) {
  const chips = useMemo(() => lists.budgets.filter((b) => b.visible !== false && (b.value ?? 0) <= 1_000_000), []);
  const sliderMax = useMemo(() => Math.max(...lists.finderChips.map((c) => c.value ?? 0)), []);
  const [budget, setBudget] = useState(initialBudget);
  const [beds, setBeds] = useState<BedsOption>("2plus");
  const [district, setDistrict] = useState<string>("all");
  const overrides = useStore((s) => ({ unitStatus: s.unitStatus, unitHidden: s.unitHidden }));

  const count = useMemo(
    () =>
      availableUnits(overrides).filter((u) => {
        if (u.priceSar > budget) return false;
        if (district !== "all" && unitDistrictSlug(u) !== district) return false;
        if (beds === "2plus" && u.beds < 2) return false;
        if (beds === "3" && u.beds !== 3) return false;
        return true;
      }).length,
    [budget, beds, district, overrides],
  );
  const href = unitsUrl({ district: district === "all" ? null : district, max: budget, beds: beds === "3" ? 3 : null }, "/en/units");
  const unitsWord = count === 1 ? "unit" : "units";

  return (
    <section id="budget" className="container-smq py-7 flex flex-col gap-4 scroll-mt-16">
      <h2 className="m-0 text-h2 font-extrabold">What&apos;s your budget?</h2>
      <div className="flex items-end justify-between gap-4">
        <span className="flex items-baseline gap-1.5">
          <output htmlFor="en-budget" className="text-[34px] font-extrabold leading-none tnum">
            {fmtNum(budget)}
          </output>
          <span className="text-[14px] font-semibold text-muted">SAR</span>
        </span>
        <span className="text-caption font-normal text-muted tnum" aria-live="polite">
          {count} {unitsWord} fit
        </span>
      </div>
      <RangeSlider value={budget} onChange={setBudget} min={BUDGET_MIN} max={sliderMax} step={SLIDER_STEP} label="Budget" />
      <div className="flex flex-wrap gap-2">
        {chips.map((b) => (
          <Chip key={b.key} size="s" active={budget === b.value} onClick={() => setBudget(b.value ?? budget)}>
            Up to {shortEn(b.value ?? 0)}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Bedrooms" value={beds} onChange={(e) => setBeds(e.target.value as BedsOption)} options={BEDS_OPTIONS} />
        <SelectField label="District" value={district} onChange={(e) => setDistrict(e.target.value)} options={[{ value: "all", label: "All of Jeddah" }, ...siteDistricts().map((d) => ({ value: d.slug, label: d.en }))]} />
      </div>
      <Button variant="secondary" size="l" href={href} between full>
        Show {count} {unitsWord}
        <ArrowIcon size={22} className="text-gold" />
      </Button>
      <span className="text-caption font-normal text-muted">Full unit price. Real estate transaction tax and registration fees are calculated separately.</span>
    </section>
  );
}
