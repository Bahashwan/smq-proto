"use client";
// The filters form (Results-Filters-M sheet · Results-D left column). One form, two hosts: the phone sheet keeps a
// draft and commits on «اعرض N وحدات»; the desktop column writes the URL on every change. Sections are divided by
// hairlines as on both boards; the sheet adds the two-handle budget slider.
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { BottomSheet, Button, Chip, CountBadge, FilterChip, Segmented, SelectField, TextField } from "@/components/ui";
import { fmtNum, cx } from "@/lib/format";
import { setQuery } from "@/lib/location";
import { BUDGET_MAX, BUDGET_MIN } from "@/components/ui";
import { DEFAULT_FILTERS, type UnitFilters, type UnitTypeParam } from "@/lib/url";
import { siteDistricts } from "@/data/districts";
import { publicProjects } from "@/data/projects";
import { activeConstraints, areaRange, filterUnits, listedUnits, withoutConstraint, DELIVERY_LABELS, FEATURE_KEYS, FEATURE_LABELS, PSTATUS_LABELS, TYPE_PARAM_SINGULAR, type UnitOverrides } from "@/data/selectors";
import { RULE_B, showUnitsLabel, writeFilters } from "./shared";

const TYPES: UnitTypeParam[] = ["apt", "roof", "villa", "duplex"];
type BedsOpt = "all" | "2" | "3" | "4" | "5";
type PstatusOpt = "all" | "ready" | "construction";
const SLIDER_STEP = 10_000;

/** A numeric field that formats with thousands separators and commits on blur / Enter. */
function NumberField({ label, value, placeholder, onCommit, id, size }: { label: string; value: number | null; placeholder?: string; onCommit: (n: number | null) => void; id?: string; size: "s" | "m" }) {
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
      size={size}
      ltr
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
      className={cx("min-w-0 font-extrabold tnum", value != null && "bg-sand")}
    />
  );
}

/** The sheet's budget slider: ink knob = «الحد الأدنى», gold knob = «الحد الأعلى», the ink run between them. */
function BudgetRange({ low, high, onChange }: { low: number | null; high: number | null; onChange: (low: number | null, high: number | null) => void }) {
  const lo = Math.max(BUDGET_MIN, low ?? BUDGET_MIN);
  const hi = Math.min(BUDGET_MAX, high ?? BUDGET_MAX);
  const pct = (v: number) => ((v - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;
  const input = "pointer-events-none absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-6";
  return (
    <div className="relative mt-1 h-6 w-full">
      <div aria-hidden="true" className="absolute inset-x-0 top-[11px] h-0.5 bg-line" />
      <div aria-hidden="true" className="absolute top-[11px] h-0.5 bg-ink" style={{ insetInlineStart: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />
      <span aria-hidden="true" className="absolute top-0 size-6 -translate-x-1/2 bg-ink hex-point rtl:translate-x-1/2" style={{ insetInlineStart: `${pct(lo)}%` }} />
      <span aria-hidden="true" className="absolute top-0 size-6 -translate-x-1/2 bg-gold hex-point rtl:translate-x-1/2" style={{ insetInlineStart: `${pct(hi)}%` }} />
      <input type="range" aria-label="الحد الأدنى" min={BUDGET_MIN} max={BUDGET_MAX} step={SLIDER_STEP} value={lo} onChange={(e) => {
        const v = Math.min(parseInt(e.target.value, 10), hi - SLIDER_STEP);
        onChange(v <= BUDGET_MIN ? null : v, high);
      }} className={input} />
      <input type="range" aria-label="الحد الأعلى" min={BUDGET_MIN} max={BUDGET_MAX} step={SLIDER_STEP} value={hi} onChange={(e) => {
        const v = Math.max(parseInt(e.target.value, 10), lo + SLIDER_STEP);
        onChange(low, v >= BUDGET_MAX ? null : v);
      }} className={input} />
    </div>
  );
}

/** One section of the form: a legend and its controls, a hairline under it */
function Section({ legend, children, inset, last }: { legend: string; children: ReactNode; inset: boolean; last?: boolean }) {
  return (
    <div className={cx("py-3.5", inset && "px-4", !last && "border-b border-line")}>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-2.5 p-0 text-caption font-bold text-muted">{legend}</legend>
        <div className="flex flex-col gap-2.5">{children}</div>
      </fieldset>
    </div>
  );
}
function SubLabel({ children }: { children: string }) {
  return <p className="m-0 mt-1 text-caption font-bold text-muted">{children}</p>;
}

export interface FiltersFormProps {
  value: UnitFilters;
  onChange: (next: UnitFilters) => void;
  /** sheet: three location fields in a row, the budget slider, «حالة المشروع والتسليم» · column: stacked fields */
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
  const projects = publicProjects().filter((p) => !p.autoGroup);
  const projectOptions = [{ value: "all", label: "الكل" }, ...projects.map((p) => ({ value: p.id, label: p.nameAr }))];
  // the URL has no project key: a chosen project sets its district and reads «الكل» again once the district moves
  const [project, setProject] = useState("all");
  const projectValue = projects.find((p) => p.id === project)?.districtSlug === value.district ? project : "all";
  const beds: BedsOpt = value.beds == null ? "all" : value.beds >= 5 ? "5" : (String(value.beds) as BedsOpt);
  const pstatus: PstatusOpt = value.pstatus ?? "all";
  const toggleType = (t: UnitTypeParam) => set({ type: value.type.includes(t) ? value.type.filter((x) => x !== t) : [...value.type, t] });
  const toggleFeat = (f: string) => set({ feat: value.feat.includes(f) ? value.feat.filter((x) => x !== f) : [...value.feat, f] });
  const inset = !sheet;
  const fieldSize = sheet ? "m" : "s";

  const range = (a: "min" | "amin", b: "max" | "amax", placeholders: [string | undefined, string | undefined]) => (
    <div className={cx("grid gap-2", sheet ? "grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end" : "grid-cols-2")}>
      <NumberField id={`${uid}-${a}`} size={fieldSize} label="من" value={value[a]} placeholder={placeholders[0]} onCommit={(n) => set({ [a]: n })} />
      {sheet && <span className="pb-3 text-label font-normal text-muted">إلى</span>}
      <NumberField id={`${uid}-${b}`} size={fieldSize} label="إلى" value={value[b]} placeholder={placeholders[1]} onCommit={(n) => set({ [b]: n })} />
    </div>
  );

  return (
    <div className="flex flex-col">
      <Section legend="الموقع" inset={inset}>
        <div className={cx("grid gap-2", sheet ? "grid-cols-3" : "grid-cols-1 gap-2.5")}>
          <SelectField label="المدينة" size="s" options={[{ value: "jeddah", label: "جدة" }]} value="jeddah" onChange={() => {}} className="font-bold" />
          <SelectField label="الحي" size="s" options={districtOptions} value={value.district ?? "all"} onChange={(e) => set({ district: e.target.value === "all" ? null : e.target.value })} className={cx("font-bold", value.district && "bg-sand")} />
          <SelectField
            label="المشروع"
            size="s"
            options={projectOptions}
            value={projectValue}
            className={cx("font-bold", projectValue !== "all" && "bg-sand")}
            onChange={(e) => {
              const p = projects.find((x) => x.id === e.target.value);
              setProject(p ? p.id : "all");
              if (p) set({ district: p.districtSlug });
            }}
          />
        </div>
      </Section>

      <Section legend="نوع الوحدة" inset={inset}>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <Chip key={t} size={sheet ? "m" : "s"} active={value.type.includes(t)} onClick={() => toggleType(t)}>
              {TYPE_PARAM_SINGULAR[t]}
            </Chip>
          ))}
        </div>
        <SubLabel>الغرف</SubLabel>
        <Segmented<BedsOpt>
          label="عدد الغرف"
          stretch={!sheet}
          size={sheet ? "m" : "s"}
          className={sheet ? "self-start" : undefined}
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
      </Section>

      <Section legend="السعر بالريال" inset={inset}>
        {range("min", "max", [fmtNum(BUDGET_MIN), fmtNum(BUDGET_MAX)])}
        {sheet && <BudgetRange low={value.min} high={value.max} onChange={(min, max) => set({ min, max })} />}
        {!sheet && (
          <>
            <SubLabel>المساحة م²</SubLabel>
            {range("amin", "amax", [areaMin, areaMax])}
          </>
        )}
      </Section>

      {sheet && (
        <Section legend="المساحة م²" inset={inset}>
          {range("amin", "amax", [areaMin, areaMax])}
        </Section>
      )}

      <Section legend={sheet ? "حالة المشروع والتسليم" : "حالة المشروع"} inset={inset}>
        <div className="flex flex-wrap gap-2">
          {(["all", "ready", "construction"] as PstatusOpt[]).map((s) => (
            <Chip key={s} size={sheet ? "m" : "s"} active={pstatus === s} onClick={() => set({ pstatus: s === "all" ? null : s })}>
              {s === "all" ? "الكل" : PSTATUS_LABELS[s]}
            </Chip>
          ))}
        </div>
        <SelectField
          label="التسليم قبل"
          size="s"
          className="font-bold"
          options={[{ value: "none", label: "بدون تحديد" }, ...(Object.keys(DELIVERY_LABELS) as (keyof typeof DELIVERY_LABELS)[]).map((k) => ({ value: k, label: DELIVERY_LABELS[k] }))]}
          value={value.delivery ?? "none"}
          onChange={(e) => set({ delivery: e.target.value === "none" ? null : (e.target.value as UnitFilters["delivery"]) })}
        />
      </Section>

      <Section legend="المميزات" inset={inset} last>
        <div className="-mt-1 flex flex-col">
          {FEATURE_KEYS.map((f) => (
            <label key={f} className={cx("flex h-10 cursor-pointer items-center justify-between gap-3 font-semibold", sheet ? "text-body" : "text-label")}>
              <span>{FEATURE_LABELS[f]}</span>
              <input type="checkbox" checked={value.feat.includes(f)} onChange={() => toggleFeat(f)} className={cx("m-0 shrink-0 accent-ink", sheet ? "size-5" : "size-[18px]")} />
            </label>
          ))}
        </div>
      </Section>
    </div>
  );
}

/** The active chips with their remove buttons */
export function DraftChips({ value, onChange, className }: { value: UnitFilters; onChange: (next: UnitFilters) => void; className?: string }) {
  const chips = activeConstraints(value);
  if (!chips.length) return null;
  return (
    <div className={cx("flex gap-1.5", className)}>
      {chips.map((c) => (
        <FilterChip key={c.key} onRemove={() => onChange({ ...value, ...withoutConstraint(value, c.key) })} className="shrink-0">
          {c.chipAr}
        </FilterChip>
      ))}
    </div>
  );
}

/** the sheet panel's header rule (1.5px ink) and footer rule, as the board draws them */
const SHEET_RULES = "[&>div:first-child]:[border-block-end:var(--smq-border-interactive)] [&>div:last-child]:[border-block-start:var(--smq-border-interactive)]";

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
  const hasChips = activeConstraints(draft).length > 0;
  return (
    <BottomSheet
      open={open}
      onClose={close}
      title="الفلاتر"
      labelledBy="filters-title"
      className={SHEET_RULES}
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
      {/* initial focus lands inside the dialog without ringing «مسح الكل» (the sheet is announced by its title) */}
      <span data-autofocus tabIndex={-1} className="block outline-none" />
      {hasChips && <DraftChips value={draft} onChange={setDraft} className="sticky top-0 z-10 -mx-4 overflow-x-auto border-b border-line bg-paper px-4 py-2.5" />}
      <FiltersForm value={draft} onChange={setDraft} variant="sheet" overrides={overrides} />
    </BottomSheet>
  );
}

/** Desktop left column (Results-D): writes the URL on every change */
export function FiltersColumn({ filters, overrides, className }: { filters: UnitFilters; overrides?: UnitOverrides; className?: string }) {
  const chips = activeConstraints(filters);
  const change = (next: UnitFilters) => writeFilters({ ...next, sheet: null }, "replace");
  return (
    <form aria-label="الفلاتر" onSubmit={(e) => e.preventDefault()} className={cx("flex flex-col border-interactive bg-paper", className)}>
      <div className={cx("flex items-center justify-between gap-3 px-4 py-3", RULE_B)}>
        <span className="flex items-center gap-1.5 text-body font-extrabold">
          الفلاتر
          {chips.length > 0 && <CountBadge>{chips.length}</CountBadge>}
        </span>
        {chips.length > 0 && (
          <button type="button" onClick={() => change({ ...DEFAULT_FILTERS, sort: filters.sort })} className="h-8 px-1.5 text-caption font-bold text-gold-text underline hover:text-ink motion-hover transition-colors">
            مسح الكل
          </button>
        )}
      </div>
      {chips.length > 0 && <DraftChips value={filters} onChange={change} className="flex-wrap border-b border-line px-4 py-3" />}
      <FiltersForm value={filters} onChange={change} variant="column" overrides={overrides} />
    </form>
  );
}

