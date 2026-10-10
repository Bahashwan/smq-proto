"use client";
// The filters form (Results-Filters-M sheet · Results-D left column). One form, two hosts: the phone sheet keeps a
// draft and commits on «اعرض N وحدات»; the desktop column writes the URL on every change.
import { useEffect, useId, useMemo, useState } from "react";
import { BottomSheet, Button, Chip, CountBadge, FilterChip, RangeSlider, Segmented, SelectField, TextField } from "@/components/ui";
import { fmtNum, cx } from "@/lib/format";
import { setQuery } from "@/lib/location";
import { BUDGET_MAX, BUDGET_MIN } from "@/components/ui";
import { DEFAULT_FILTERS, type UnitFilters, type UnitTypeParam } from "@/lib/url";
import { siteDistricts } from "@/data/districts";
import { publicProjects } from "@/data/projects";
import { activeConstraints, areaRange, filterUnits, listedUnits, withoutConstraint, DELIVERY_LABELS, FEATURE_KEYS, FEATURE_LABELS, PSTATUS_LABELS, TYPE_PARAM_SINGULAR, type UnitOverrides } from "@/data/selectors";
import { showUnitsLabel, writeFilters } from "./shared";

const TYPES: UnitTypeParam[] = ["apt", "roof", "villa", "duplex"];
type BedsOpt = "all" | "2" | "3" | "4" | "5";
type PstatusOpt = "all" | "ready" | "construction";

/** A numeric field that formats with thousands separators and commits on blur / Enter. */
function NumberField({ label, value, placeholder, onCommit, id }: { label: string; value: number | null; placeholder?: string; onCommit: (n: number | null) => void; id?: string }) {
  const [text, setText] = useState(value == null ? "" : fmtNum(value));
  useEffect(() => setText(value == null ? "" : fmtNum(value)), [value]);
  const commit = () => {
    const digits = text.replace(/[^\d]/g, "");
    const n = digits ? parseInt(digits, 10) : null;
    onCommit(n);
    setText(n == null ? "" : fmtNum(n));
  };
  return (
    <TextField
      id={id}
      label={label}
      inputMode="numeric"
      placeholder={placeholder}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
      }}
      className={cx("font-extrabold tnum", value != null && "bg-sand")}
    />
  );
}

function Legend({ children }: { children: string }) {
  return <legend className="mb-2 p-0 text-caption font-bold text-muted">{children}</legend>;
}

export interface FiltersFormProps {
  value: UnitFilters;
  onChange: (next: UnitFilters) => void;
  /** the sheet shows the budget slider and merges the project status and delivery in one group */
  variant: "sheet" | "column";
  overrides?: UnitOverrides;
}

export function FiltersForm({ value, onChange, variant, overrides }: FiltersFormProps) {
  const uid = useId();
  const sheet = variant === "sheet";
  const set = (patch: Partial<UnitFilters>) => onChange({ ...value, ...patch });
  const area = useMemo(() => areaRange(listedUnits(overrides)), [overrides]);
  const areaMin = area ? String(Math.floor(area.min)) : undefined;
  const areaMax = area ? String(Math.ceil(area.max / 10) * 10) : undefined;
  const districtOptions = [{ value: "all", label: "الكل" }, ...siteDistricts().map((d) => ({ value: d.slug, label: d.comingSoon ? `${d.ar} · قريباً` : d.ar }))];
  const projectOptions = [{ value: "all", label: "الكل" }, ...publicProjects().filter((p) => !p.autoGroup).map((p) => ({ value: p.id, label: p.nameAr }))];
  const projectValue = projectOptions.find((o) => o.value !== "all" && publicProjects().find((p) => p.id === o.value)?.districtSlug === value.district)?.value ?? "all";
  const beds: BedsOpt = value.beds == null ? "all" : value.beds >= 5 ? "5" : (String(value.beds) as BedsOpt);
  const pstatus: PstatusOpt = value.pstatus ?? "all";
  const toggleType = (t: UnitTypeParam) => set({ type: value.type.includes(t) ? value.type.filter((x) => x !== t) : [...value.type, t] });
  const toggleFeat = (f: string) => set({ feat: value.feat.includes(f) ? value.feat.filter((x) => x !== f) : [...value.feat, f] });

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <Legend>الموقع</Legend>
        <div className="grid grid-cols-3 gap-2">
          <SelectField label="المدينة" size="s" options={[{ value: "jeddah", label: "جدة" }]} value="jeddah" onChange={() => {}} />
          <SelectField label="الحي" size="s" options={districtOptions} value={value.district ?? "all"} onChange={(e) => set({ district: e.target.value === "all" ? null : e.target.value })} className={cx("font-bold", value.district && "bg-sand")} />
          <SelectField
            label="المشروع"
            size="s"
            options={projectOptions}
            value={projectValue}
            onChange={(e) => {
              const p = publicProjects().find((x) => x.id === e.target.value);
              set({ district: p ? p.districtSlug : value.district });
            }}
          />
        </div>
      </fieldset>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <Legend>نوع الوحدة</Legend>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <Chip key={t} size="s" active={value.type.includes(t)} onClick={() => toggleType(t)}>
              {TYPE_PARAM_SINGULAR[t]}
            </Chip>
          ))}
        </div>
        <p className="mb-2 mt-4 text-caption font-bold text-muted">الغرف</p>
        <Segmented<BedsOpt>
          label="عدد الغرف"
          stretch
          size="s"
          value={beds}
          onChange={(v) => set({ beds: v === "all" ? null : parseInt(v, 10) })}
          options={[
            { value: "all", label: "الكل" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
            { value: "5", label: "5+" },
          ]}
        />
      </fieldset>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <Legend>السعر بالريال</Legend>
        <div className={cx("grid gap-2", sheet ? "grid-cols-[1fr_auto_1fr] items-end" : "grid-cols-2")}>
          <NumberField id={`${uid}-min`} label="من" value={value.min} placeholder={fmtNum(BUDGET_MIN)} onCommit={(n) => set({ min: n })} />
          {sheet && <span className="pb-3.5 text-label font-normal text-muted">إلى</span>}
          <NumberField id={`${uid}-max`} label="إلى" value={value.max} placeholder={fmtNum(BUDGET_MAX)} onCommit={(n) => set({ max: n })} />
        </div>
        {sheet && <RangeSlider className="mt-3" label="الحد الأعلى" min={BUDGET_MIN} max={BUDGET_MAX} step={10_000} value={value.max ?? BUDGET_MAX} onChange={(v) => set({ max: v >= BUDGET_MAX ? null : v })} />}
        <p className="mb-2 mt-4 text-caption font-bold text-muted">المساحة م²</p>
        <div className={cx("grid gap-2", sheet ? "grid-cols-[1fr_auto_1fr] items-end" : "grid-cols-2")}>
          <NumberField id={`${uid}-amin`} label="من" value={value.amin} placeholder={areaMin} onCommit={(n) => set({ amin: n })} />
          {sheet && <span className="pb-3.5 text-label font-normal text-muted">إلى</span>}
          <NumberField id={`${uid}-amax`} label="إلى" value={value.amax} placeholder={areaMax} onCommit={(n) => set({ amax: n })} />
        </div>
      </fieldset>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <Legend>{sheet ? "حالة المشروع والتسليم" : "حالة المشروع"}</Legend>
        <div className="flex flex-wrap gap-2">
          {(["all", "ready", "construction"] as PstatusOpt[]).map((s) => (
            <Chip key={s} size="s" active={pstatus === s} onClick={() => set({ pstatus: s === "all" ? null : s })}>
              {s === "all" ? "الكل" : PSTATUS_LABELS[s]}
            </Chip>
          ))}
        </div>
        <SelectField
          label="التسليم قبل"
          size="s"
          wrapperClassName="mt-3"
          options={[{ value: "none", label: "بدون تحديد" }, ...(Object.keys(DELIVERY_LABELS) as (keyof typeof DELIVERY_LABELS)[]).map((k) => ({ value: k, label: DELIVERY_LABELS[k] }))]}
          value={value.delivery ?? "none"}
          onChange={(e) => set({ delivery: e.target.value === "none" ? null : (e.target.value as UnitFilters["delivery"]) })}
        />
      </fieldset>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <Legend>المميزات</Legend>
        <div className="flex flex-col">
          {FEATURE_KEYS.map((f) => (
            <label key={f} className="flex min-h-11 cursor-pointer items-center justify-between gap-3 border-b border-line py-2 text-label font-semibold last:border-b-0">
              <span>{FEATURE_LABELS[f]}</span>
              <input type="checkbox" checked={value.feat.includes(f)} onChange={() => toggleFeat(f)} className="size-5 shrink-0 accent-gold" />
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

/** The active chips with their remove buttons */
export function DraftChips({ value, onChange, className }: { value: UnitFilters; onChange: (next: UnitFilters) => void; className?: string }) {
  const chips = activeConstraints(value);
  if (!chips.length) return null;
  return (
    <div className={cx("flex flex-wrap gap-2", className)}>
      {chips.map((c) => (
        <FilterChip key={c.key} onRemove={() => onChange({ ...value, ...withoutConstraint(value, c.key) })}>
          {c.chipAr}
        </FilterChip>
      ))}
    </div>
  );
}

/** Phone bottom sheet at ?sheet=filters: a draft that commits on «اعرض N وحدات» */
export function FiltersSheet({ filters, overrides }: { filters: UnitFilters; overrides?: UnitOverrides }) {
  const open = filters.sheet === "filters";
  const [draft, setDraft] = useState<UnitFilters>(filters);
  useEffect(() => {
    if (open) setDraft(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const count = useMemo(() => filterUnits(draft, overrides).available.length, [draft, overrides]);
  const close = () => setQuery({ sheet: null }, "replace");
  const clear = () => setDraft({ ...DEFAULT_FILTERS, sort: draft.sort, sheet: "filters" });
  const apply = () => writeFilters({ ...draft, sheet: null, pin: filters.pin }, "push");
  return (
    <BottomSheet
      open={open}
      onClose={close}
      title="الفلاتر"
      labelledBy="filters-title"
      actions={
        <button type="button" onClick={clear} className="h-11 px-2 text-label font-bold text-gold-text underline hover:text-ink motion-hover transition-colors">
          مسح الكل
        </button>
      }
      footer={
        <Button variant="secondary" size="l" full arrow between onClick={apply}>
          {showUnitsLabel(count)}
        </Button>
      }
    >
      <DraftChips value={draft} onChange={setDraft} className="mb-4" />
      <FiltersForm value={draft} onChange={setDraft} variant="sheet" overrides={overrides} />
    </BottomSheet>
  );
}

/** Desktop left column (Results-D): writes the URL on every change */
export function FiltersColumn({ filters, overrides, className }: { filters: UnitFilters; overrides?: UnitOverrides; className?: string }) {
  const chips = activeConstraints(filters);
  const change = (next: UnitFilters) => writeFilters({ ...next, sheet: null }, "replace");
  return (
    <form aria-label="الفلاتر" onSubmit={(e) => e.preventDefault()} className={cx("flex flex-col gap-4 border-interactive bg-paper p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-body font-extrabold">
          الفلاتر
          {chips.length > 0 && <CountBadge>{chips.length}</CountBadge>}
        </span>
        {chips.length > 0 && (
          <button type="button" onClick={() => change({ ...DEFAULT_FILTERS, sort: filters.sort })} className="text-caption font-bold text-gold-text underline hover:text-ink motion-hover transition-colors">
            مسح الكل
          </button>
        )}
      </div>
      <DraftChips value={filters} onChange={change} />
      <FiltersForm value={filters} onChange={change} variant="column" overrides={overrides} />
    </form>
  );
}
