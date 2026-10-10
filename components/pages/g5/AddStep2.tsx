"use client";
// /add/details · step 2 «التفاصيل والسعر». Apartment / villa variant (Add-Step2-M; at 1440 the Add-Step2-D layout with
// the apartment fields): rooms, baths, area, floor, age, occupancy, features, the asked price with its computed per-m²
// against the district's available range. Building variant when the step-1 type is «عمارة سكنية» / «عمارة تجارية» or
// the URL says `?type=building` (Add-Step2-Building-M, Add-Step2-D): land / build area, floors, units, the income block
// and «ما يراه فريقنا من أرقامك» (per-m² on build and land, gross yield) from ownerFormComputed().
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { Container, ErrorText, SelectField, TextField, fieldControlClass } from "@/components/ui";
import { districtPpmRange, ownerFormComputed } from "@/data/selectors";
import { cx, fmtNum } from "@/lib/format";
import { useUnitOverrides } from "@/lib/store";
import {
  AGES,
  APT_FEATURES,
  BUILDING_FEATURES,
  BUILDING_FLOORS,
  CITIES,
  CONTRACTS,
  FIELD,
  FLOORS,
  OCCUPANCY,
  OTHER_DISTRICT,
  STREETS,
  checkStep2,
  districtLabel,
  focusFirst,
  isBuilding,
  isLand,
  negotiableList,
  step1Summary,
  toNum,
  useAddDraft,
  type AddDraft,
  type Errors,
} from "./draft";
import { CheckChips, Counter, FormCard, HeroDesktopFlow, HeroPhone, MoneyField, NavRow, NumberInput, Shell, StepBar, SummaryBar, TileGroup, WaCard } from "./parts";

/** A labelled numeric text field (areas, income) with the gold error */
function AmountField({ id, label, value, onChange, error }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string }) {
  return (
    <div className={cx("flex min-w-0 flex-col gap-1 text-caption font-semibold", error ? "text-gold-text" : "text-muted")}>
      <label htmlFor={id}>{label}</label>
      <NumberInput id={id} value={value} onChange={onChange} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} className={cx(fieldControlClass({ error: !!error }), "tnum")} />
      {error && <ErrorText id={`${id}-error`}>{error}</ErrorText>}
    </div>
  );
}

const opts = (list: string[]) => list.map((v) => ({ value: v, label: v }));

function ApartmentFields({ d, update, errors }: { d: AddDraft; update: (p: Partial<AddDraft>) => void; errors: Errors }) {
  if (isLand(d.type)) {
    return (
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-3 md:gap-x-4">
        <AmountField id={FIELD.area} label="المساحة (م²)" value={d.area} onChange={(v) => update({ area: v })} error={errors[FIELD.area]} />
      </div>
    );
  }
  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-3 md:gap-x-4">
        <Counter label="غرف النوم" value={d.beds} onChange={(n) => update({ beds: n })} min={0} max={12} />
        <Counter label="الحمامات" value={d.baths} onChange={(n) => update({ baths: n })} min={0} max={12} />
        <AmountField id={FIELD.area} label="المساحة (م²)" value={d.area} onChange={(v) => update({ area: v })} error={errors[FIELD.area]} />
        <SelectField id="add-floor" label="الطابق" options={opts(FLOORS)} value={d.floor} onChange={(e) => update({ floor: e.target.value })} />
        <SelectField id="add-age" label="عمر البناء" options={opts(AGES)} value={d.age} onChange={(e) => update({ age: e.target.value })} />
        <SelectField id="add-occupancy" label="حالة الإشغال" options={opts(OCCUPANCY)} value={d.occupancy} onChange={(e) => update({ occupancy: e.target.value })} />
      </div>
      <CheckChips legend="المميزات" note="(اختر ما ينطبق)" options={APT_FEATURES} value={d.features} onChange={(v) => update({ features: v })} />
    </>
  );
}

function BuildingFields({ d, update, errors }: { d: AddDraft; update: (p: Partial<AddDraft>) => void; errors: Errors }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-3 md:gap-x-4">
        <AmountField id={FIELD.land} label="مساحة الأرض (م²)" value={d.land} onChange={(v) => update({ land: v })} error={errors[FIELD.land]} />
        <AmountField id={FIELD.build} label="مساحة البناء (م²)" value={d.build} onChange={(v) => update({ build: v })} error={errors[FIELD.build]} />
        <SelectField id="add-floors" label="عدد الأدوار" options={opts(BUILDING_FLOORS)} value={d.floors} onChange={(e) => update({ floors: e.target.value })} />
        <Counter label="عدد الوحدات" value={d.units} onChange={(n) => update({ units: n })} min={1} max={200} />
        <SelectField id="add-building-age" label="عمر العقار" options={opts(AGES)} value={d.buildingAge} onChange={(e) => update({ buildingAge: e.target.value })} />
        <SelectField id="add-street" label="عرض الشارع" options={opts(STREETS)} value={d.street} onChange={(e) => update({ street: e.target.value })} />
      </div>
      <TileGroup<"yes" | "no">
        legend="هل يوجد دخل؟"
        name="add-income"
        options={[
          { value: "yes", label: "نعم، مؤجّرة" },
          { value: "no", label: "لا" },
        ]}
        value={d.hasIncome}
        onChange={(v) => update({ hasIncome: v })}
        gridClassName="grid grid-cols-2 gap-2 md:max-w-80"
        legendClassName="text-label font-bold text-ink md:font-extrabold"
        hint={
          d.hasIncome === "yes" ? (
            <div className="relative mt-1.5 flex flex-col gap-3 border-interactive bg-cream p-3 ps-4 md:grid md:grid-cols-3 md:gap-4 md:p-4 md:ps-5">
              <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-gold" />
              <AmountField id={FIELD.income} label="الدخل السنوي (ريال)" value={d.income} onChange={(v) => update({ income: v })} error={errors[FIELD.income]} />
              <div className="grid grid-cols-2 gap-3 md:contents">
                <TextField id="add-rented" label="الوحدات المؤجّرة الآن" value={d.rented} onChange={(e) => update({ rented: e.target.value })} />
                <SelectField id="add-contracts" label="عقود الإيجار" options={opts(CONTRACTS)} value={d.contracts} onChange={(e) => update({ contracts: e.target.value })} />
              </div>
              <span className="text-caption font-normal leading-relaxed text-muted md:col-span-3">العائد يُحسب تلقائياً من الدخل والسعر ويظهر لفريقنا فقط عند المراجعة.</span>
            </div>
          ) : null
        }
      />
      <CheckChips legend="المميزات" options={BUILDING_FEATURES} value={d.buildingFeatures} onChange={(v) => update({ buildingFeatures: v })} />
    </>
  );
}

/** a «label · value» line of the computed panels */
function Line({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <span className="flex items-baseline justify-between gap-3">
      <span>{label}</span>
      <strong className="shrink-0 font-extrabold tnum">{value}</strong>
    </span>
  );
}

/** «سعر المتر المطلوب» against «نطاق المتر للمتاح في الروضة الآن», with the bar */
function ApartmentPanel({ d }: { d: AddDraft }) {
  const ov = useUnitOverrides();
  const price = toNum(d.price);
  const area = toNum(d.area);
  const asked = ownerFormComputed({ askedPriceSar: price, areaM2: area }).ppm;
  const inJeddah = d.city === CITIES[0] && d.district !== OTHER_DISTRICT;
  const range = inJeddah ? districtPpmRange(d.district, ov) : null;
  const where = districtLabel(d);
  let note = "هذا للمعلومة فقط، التقييم النهائي بعد الزيارة.";
  let pos: { lo: number; hi: number; at: number } | null = null;
  if (range && asked) {
    const span = Math.max(range.max, asked) - Math.min(range.min, asked) || 1;
    const lo = Math.min(range.min, asked) - span * 0.04;
    const hi = Math.max(range.max, asked) + span * 0.04;
    const pct = (v: number) => ((v - lo) / (hi - lo)) * 100;
    pos = { lo: pct(range.min), hi: pct(range.max), at: pct(asked) };
    note = `${asked < range.min ? "سعرك أقل من النطاق." : asked > range.max ? "سعرك أعلى من النطاق." : "سعرك داخل النطاق."} ${note}`;
  }
  return (
    <div className="flex flex-col gap-2 bg-sand p-3.5 text-caption font-normal text-ink md:p-4 md:text-label">
      <Line label="سعر المتر المطلوب" value={asked ? fmtNum(asked) : "—"} />
      <Line label={`نطاق المتر للمتاح في ${where} الآن`} value={range ? `${fmtNum(range.min)} إلى ${fmtNum(range.max)}` : "لا مرجع في الحي"} />
      {pos && (
        <span aria-hidden className="relative my-2 block h-1 bg-slot">
          <span className="absolute inset-y-0 bg-ink" style={{ right: `${pos.lo}%`, left: `${100 - pos.hi}%` }} />
          <span className="absolute top-1/2 size-3.5 -translate-y-1/2 translate-x-1/2 bg-gold hex-flat" style={{ right: `${pos.at}%` }} />
        </span>
      )}
      <span className="leading-relaxed text-muted">{note}</span>
    </div>
  );
}

/** «ما يراه فريقنا من أرقامك»: per-m² on build and land, gross yield */
function BuildingPanel({ d }: { d: AddDraft }) {
  const c = ownerFormComputed({ askedPriceSar: toNum(d.price), buildM2: toNum(d.build), landM2: toNum(d.land), incomeYearSar: d.hasIncome === "yes" ? toNum(d.income) : null });
  return (
    <div className="flex flex-col gap-2 bg-sand p-3.5 text-caption font-normal text-ink md:p-5 md:text-label">
      <span className="hidden text-caption font-extrabold md:block">ما يراه فريقنا من أرقامك</span>
      <Line label="سعر المتر على البناء" value={c.ppmBuild ? fmtNum(c.ppmBuild) : "—"} />
      <Line label="سعر المتر على الأرض" value={c.ppmLand ? fmtNum(c.ppmLand) : "—"} />
      <Line label="العائد السنوي الإجمالي" value={c.yieldPct != null ? `${c.yieldPct}%` : "—"} />
      <span className="leading-relaxed text-muted">
        <span className="hidden md:inline">هذه </span>للمعلومة فقط. التقييم النهائي بعد الزيارة ومراجعة العقود.
      </span>
    </div>
  );
}

function PriceBlock({ d, update, errors }: { d: AddDraft; update: (p: Partial<AddDraft>) => void; errors: Errors }) {
  const building = isBuilding(d.type);
  const list = negotiableList(d.type);
  const negotiable = (
    <TileGroup<string>
      legend={building ? "قابل للتفاوض؟" : "هل السعر قابل للتفاوض؟"}
      name="add-negotiable"
      options={list.map((v) => ({ value: v, label: v }))}
      value={list[d.negotiable] ?? list[0]}
      onChange={(v) => update({ negotiable: Math.max(0, list.indexOf(v)) })}
      legendClassName={building ? "text-label font-bold text-ink md:text-caption md:font-bold md:text-muted" : "text-label font-bold text-ink"}
    />
  );
  return (
    <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:items-start md:gap-6">
      <div className="flex flex-col gap-4">
        <MoneyField id={FIELD.price} label="السعر المطلوب (ريال)" value={d.price} onChange={(v) => update({ price: v })} error={errors[FIELD.price]} labelClassName="text-label font-bold text-ink md:font-extrabold" />
        <div className="md:hidden">{building ? <BuildingPanel d={d} /> : <ApartmentPanel d={d} />}</div>
        {negotiable}
      </div>
      <div className="hidden md:block">{building ? <BuildingPanel d={d} /> : <ApartmentPanel d={d} />}</div>
    </div>
  );
}

function Aside({ building }: { building: boolean }) {
  return (
    <aside className="hidden flex-col gap-4 md:sticky md:top-20 md:flex">
      {building && (
        <div className="flex flex-col gap-2 bg-ink px-5 py-5 text-paper cut-l">
          <span className="text-caption font-bold text-gold">للعمائر تحديداً</span>
          <span className="text-body font-extrabold">نعرض العمائر بالعائد لا بالسعر وحده</span>
          <span className="text-label font-normal leading-relaxed text-on-ink-muted">المشتري يرى الدخل السنوي ونسبة الإشغال ونوع العقود قبل أن يتصل. كلما كانت أرقامك موثّقة، قلّت الأسئلة.</span>
        </div>
      )}
      <div className="flex flex-col gap-2 border-interactive px-5 py-5 text-label font-normal">
        <span className="text-caption font-extrabold">ما ستحتاجه في الخطوة 3</span>
        <span>· صور أو فيديو من الجوال، 10 على الأكثر</span>
        <span>· صفتك في العرض: مالك، وكيل، مسوّق</span>
        <span>· الوكيل يرفق صورة الوكالة، والمسوّق رقم رخصة فال</span>
        <span>· التوقيت المناسب للتواصل</span>
      </div>
      <WaCard text={building ? "أرسل الصك والعقود والصور ونكمل الباقي." : "أرسل الصك والصور والسعر مباشرة ونكمل الباقي."} />
    </aside>
  );
}

export function AddStep2() {
  const router = useRouter();
  const { draft, update } = useAddDraft();
  const [tried, setTried] = useState(false);
  const building = isBuilding(draft.type);
  const errors: Errors = tried ? checkStep2(draft) : {};
  const summary = step1Summary(draft);
  const query = building ? "?type=building" : "";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = checkStep2(draft);
    setTried(true);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => focusFirst(found));
      return;
    }
    router.push(`/add/contact${query}`);
  };

  return (
    <Shell>
      <HeroPhone hub={building} />
      <HeroDesktopFlow text="ثلاث خطوات، دقيقتان. نراجع الصك والصور، ونعرض عقارك بسعر معلن بعد موافقتنا." />
      <Container className="mt-6 md:mt-8 md:grid md:grid-cols-[minmax(0,1fr)_340px] md:items-start md:gap-8">
        <form noValidate onSubmit={submit} aria-label="أضف عقارك · التفاصيل والسعر">
          <FormCard title="التفاصيل والسعر" step={2}>
            <div className="flex flex-col gap-5 px-4 pb-5 pt-3.5 md:gap-6 md:px-6 md:pb-6 md:pt-3.5">
              <StepBar current={2} query={query} />
              <SummaryBar strong={summary.strong} rest={summary.rest} editHref={`/add${query}`} />
              {building ? <BuildingFields d={draft} update={update} errors={errors} /> : <ApartmentFields d={draft} update={update} errors={errors} />}
              <PriceBlock d={draft} update={update} errors={errors} />
              <TextField id="add-deed" label="رقم الصك (اختياري الآن، مطلوب قبل النشر)" placeholder="يبدأ بـ 3 أو 9 · 12 رقماً" inputMode="numeric" value={draft.deed} onChange={(e) => update({ deed: e.target.value })} wrapperClassName="md:w-1/2" />
              <NavRow back={`/add${query}`} next="التالي: الصور وبياناتك" />
            </div>
          </FormCard>
        </form>
        <Aside building={building} />
      </Container>
      <Container className="mt-4 md:hidden">
        <p className="m-0 text-caption font-normal leading-relaxed text-muted">يُحفظ ما أدخلته على هذا الجوال 7 أيام. لا يُنشر شيء قبل تأكيد فريقنا.</p>
      </Container>
    </Shell>
  );
}

