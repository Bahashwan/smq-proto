"use client";
// /admin/units/[code] and /admin/units/new (Admin-UnitEditor-D). Excel fields (gold hairline on sand, replaced on
// import) vs admin-only fields (ink frame); [للتأكيد] values keep the gold hairline on cream. Status with its dates and
// the hide switch live in the ink panel; edits stay a draft until «حفظ ونشر» (dirty → saving → published) writes them
// to the store (status, hidden, price, the other fields as a patch) with a history line. «حذف الوحدة نهائياً» opens
// the type-the-code dialog; deleting removes the unit from the admin list in memory (the public site is untouched).
import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, fieldControlClass, SaveBar, type FieldSource, type SaveState } from "@/components/admin";
import { ImageSlot, Mark } from "@/components/ui";
import { analytics } from "@/data/analytics";
import { districtAr } from "@/data/districts";
import { leads } from "@/data/leads";
import { projectById } from "@/data/projects";
import { unitBySlug, unitHistory, UNIT_TYPE_AR } from "@/data/units";
import { effectiveUnitStatus, isUnitHidden, TODAY, unitPpm } from "@/data/selectors";
import type { Unit, UnitStatus } from "@/data/types";
import { useStore, useUnitOverrides, usePatch } from "@/lib/store";
import { cx, fmtDate, fmtNum } from "@/lib/format";
import { G7Shell } from "./shell";
import { unsavedInFields } from "./util";

interface Form {
  building: "RZ" | "YS";
  code: string;
  typeAr: string;
  beds: string;
  baths: string;
  area: string;
  terrace: string;
  orientation: string;
  ceiling: string;
  floor: string;
  price: string;
  tax: string;
  adLicence: string;
  maid: boolean;
  driver: boolean;
  balcony: boolean;
  smartHome: boolean;
  kitchen: "tbc" | "open" | "closed";
  other: string;
  extra: string;
  warranty: string;
  insurance: string;
  occupancy: string;
  status: UnitStatus;
  reservedUntil: string;
  soldOn: string;
  hidden: boolean;
}

const ROOM: [RegExp, string][] = [
  [/LIVING/, "الصالة"],
  [/KITCHEN/, "المطبخ"],
  [/MASTER|BEDROOM/, "غرفة النوم"],
  [/BALCONY/, "البلكونة"],
  [/BATH/, "الحمام"],
  [/ROOF|TERRACE/, "السطح"],
  [/MAJLIS/, "المجلس"],
];
const roomOf = (slot: string) => ROOM.find(([re]) => re.test(slot))?.[1] ?? "صورة";
const STATUS_WORD: Record<UnitStatus, string> = { available: "متاح", reserved: "محجوز", sold: "مباع" };

function initialForm(u: Unit | undefined, edits: Partial<Form> | undefined, status: UnitStatus, hidden: boolean): Form {
  const base: Form = u
    ? {
        building: u.building,
        code: u.code,
        typeAr: UNIT_TYPE_AR[u.type],
        beds: String(u.beds),
        baths: String(u.baths),
        area: u.areaM2.toFixed(2),
        terrace: u.terraceM2?.value ? String(u.terraceM2.value) : "0",
        orientation: u.orientation?.value ?? "",
        ceiling: u.ceilingM?.value ? u.ceilingM.value.toFixed(2) : "",
        floor: u.floor?.value ?? "",
        price: fmtNum(u.priceSar),
        tax: "tbc",
        adLicence: u.adLicence ?? "",
        maid: u.features.maid,
        driver: u.features.driver,
        balcony: u.features.balcony,
        smartHome: u.features.smartHome,
        kitchen: u.features.kitchen,
        other: u.otherFeatures.join(" · "),
        extra: "",
        warranty: "",
        insurance: "",
        occupancy: "after",
        status,
        reservedUntil: u.reservedUntil ?? "",
        soldOn: u.soldOn ?? "",
        hidden,
      }
    : {
        building: "RZ",
        code: "",
        typeAr: "شقة",
        beds: "",
        baths: "",
        area: "",
        terrace: "0",
        orientation: "",
        ceiling: "",
        floor: "",
        price: "",
        tax: "tbc",
        adLicence: "",
        maid: false,
        driver: false,
        balcony: false,
        smartHome: false,
        kitchen: "tbc",
        other: "",
        extra: "",
        warranty: "",
        insurance: "",
        occupancy: "after",
        status: "available",
        reservedUntil: "",
        soldOn: "",
        hidden: true,
      };
  return { ...base, ...(edits ?? {}), status, hidden };
}

export function UnitEditorPage({ slug }: { slug?: string }) {
  const unit = slug ? unitBySlug(slug) : undefined;
  const isNew = !unit;
  const router = useRouter();
  const overrides = useUnitOverrides();
  const setUnitStatus = useStore((s) => s.setUnitStatus);
  const setUnitHidden = useStore((s) => s.setUnitHidden);
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const edits = usePatch<Partial<Form>>("unitEdit", unit?.code ?? "new");
  const pricePatch = usePatch<{ priceSar: number }>("unitPrice", unit?.code ?? "new");
  const log = usePatch<{ entries: { by: string; text: string; at: string }[] }>("unitLog", unit?.code ?? "new")?.entries ?? [];

  const status = unit ? effectiveUnitStatus(unit, overrides) : "available";
  const hidden = unit ? isUnitHidden(unit, overrides) : true;
  const initial = useMemo(() => {
    const f = initialForm(unit, edits, status, hidden);
    if (pricePatch?.priceSar) f.price = fmtNum(pricePatch.priceSar);
    return f;
  }, [unit, edits, status, hidden, pricePatch]);
  const [draft, setDraft] = useState<Partial<Form>>({});
  const form: Form = { ...initial, ...draft };
  const changed = (Object.keys(draft) as (keyof Form)[]).filter((k) => draft[k] !== initial[k]);
  const [saveState, setSaveState] = useState<SaveState>("clean");
  const state: SaveState = saveState === "saving" || saveState === "saved" ? saveState : changed.length ? "dirty" : "clean";
  const [del, setDel] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    if (saveState === "saved") setSaveState("clean");
  };

  const project = projectById(unit?.projectId ?? "rwd-01");
  const priceNum = parseInt(form.price.replace(/[^\d]/g, ""), 10) || 0;
  const areaNum = parseFloat(form.area) || 0;
  const ppmValue = priceNum && areaNum ? unitPpm({ priceSar: priceNum, areaM2: areaNum }) : null;
  const wk = unit ? analytics.unitWeek[unit.code] : undefined;
  const history = unit ? unitHistory[unit.code] : [];
  const lastHistory = history[0];
  const linked = unit ? leads.filter((l) => l.unitCode === unit.code && !l.generated).length : 0;
  const code = unit?.code ?? form.code;
  const buildingName = form.building === "RZ" ? "روز" : "ياسمين";

  function save(publish: boolean) {
    const c = (unit?.code ?? form.code.trim().toUpperCase()) || "";
    if (!c) {
      document.getElementById("f-code")?.focus();
      toast("أدخل كود النموذج أولاً", { kind: "error" });
      return;
    }
    setSaveState("saving");
    window.setTimeout(() => {
      const { status: st, hidden: hd, price: _p, ...rest } = form;
      void _p;
      if (unit) {
        setUnitStatus(unit.code, st);
        setUnitHidden(unit.code, publish ? hd : true);
        if (priceNum && priceNum !== unit.priceSar) patch("unitPrice", unit.code, { priceSar: priceNum });
        patch("unitEdit", unit.code, rest);
      } else {
        patch("createdUnit", c, { code: c, name: `${c.split("-")[1] ?? c} · ${buildingName}`, typeAr: form.typeAr, beds: parseInt(form.beds, 10) || null, areaM2: areaNum || null, priceSar: priceNum, status: st, hidden: publish ? hd : true, projectId: "rwd-01" });
      }
      const what = changed.filter((k) => k !== "status" && k !== "hidden").length;
      const text = publish ? (isNew ? "أنشأ الوحدة" : `حفظ ونشر · ${what ? `${what} ${what === 1 ? "حقل" : "حقول"}` : "الحالة"}${draft.status && draft.status !== initial.status ? ` · الحالة «${STATUS_WORD[st]}»` : ""}`) : "حفظ كمسودة";
      patch("unitLog", c, { entries: [{ by: "سعود", text, at: TODAY }, ...log] });
      setDraft({});
      setSaveState(publish ? "saved" : "clean");
      toast(publish ? `حُفظت الوحدة ${c}` : `حُفظت مسودة الوحدة ${c}`, unit ? { action: { label: "معاينة", href: `/units/${unit.slug}` } } : undefined);
      if (isNew) router.push("/admin/units");
    }, 700);
  }

  const title = unit ? `${unit.nameAr} · عمارة ${unit.buildingNameAr}` : "وحدة جديدة";
  const subtitle = unit
    ? [
        unit.code,
        form.hidden ? "مخفية عن الموقع" : `منشور و${STATUS_WORD[status]}`,
        `آخر تحديث ${fmtDate(unit.updatedAt)}${lastHistory ? ` من ${lastHistory.by === "استيراد Excel" ? "Excel" : lastHistory.by}` : ""}`,
        wk ? `${wk.views} مشاهدة و${wk.whatsapp} نقرات واتساب هذا الأسبوع` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "تُضاف بحالة «مخفي» حتى تراجعها وتنشرها";

  return (
    <G7Shell active="units" mainClassName="pb-0 md:pb-0">
      <nav aria-label="المسار" className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
        <Link href="/admin/units" className="font-bold text-gold-text hover:text-ink hover:underline">
          الوحدات
        </Link>
        <span aria-hidden>/</span>
        {project && (
          <>
            <Link href={`/admin/projects/${project.id}`} className="font-bold text-gold-text hover:text-ink hover:underline">
              {project.nameAr}
            </Link>
            <span aria-hidden>/</span>
          </>
        )}
        <span aria-current="page" className="font-bold text-ink" dir="ltr">
          {unit ? unit.code : "وحدة جديدة"}
        </span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold leading-tight">{title}</h1>
          <p className="text-label font-normal text-muted">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-3 border border-line bg-paper px-3 py-2 text-[12px]">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-3.5 border border-gold bg-sand" />
              من Excel، يُستبدل عند الاستيراد
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-3.5 border-[1.5px] border-ink bg-paper" />
              إدارة فقط
            </span>
          </span>
          {unit && (
            <Link href={`/units/${unit.slug}`} className="flex h-10 items-center border-interactive bg-paper px-3.5 text-[12px] font-bold text-ink hover:bg-sand">
              معاينة الصفحة العامة
            </Link>
          )}
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <form className="flex min-w-0 flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <Section title="الموقع" cols="200px">
            <Field label="المدينة" source="excel" value="جدة" readOnly />
            <Field label="الحي" source="excel" value={project ? districtAr(project.districtSlug) : ""} readOnly />
            <Field label="رقم المشروع" source="excel" value={project?.code ?? ""} readOnly ltr />
            <SelectField label="العمارة" source="admin" value={form.building} onChange={(v) => set("building", v as Form["building"])} options={[{ value: "RZ", label: "روز" }, { value: "YS", label: "ياسمين" }]} />
          </Section>

          <Section title="الوحدة" cols="160px">
            <Field id="f-code" label="كود النموذج" tag="Excel، مفتاح" source={isNew ? "admin" : "excel"} value={form.code} onChange={(v) => set("code", v.toUpperCase())} readOnly={!isNew} ltr bold />
            <Field label="نوع الوحدة" source="excel" value={form.typeAr} onChange={(v) => set("typeAr", v)} />
            <Field label="عدد الغرف" source="excel" value={form.beds} onChange={(v) => set("beds", v)} numeric />
            <Field label="الحمامات" source="admin" value={form.baths} onChange={(v) => set("baths", v)} numeric />
            <Field label="المساحة م²" source="excel" value={form.area} onChange={(v) => set("area", v)} numeric />
            <Field label="مساحة السطح م²" source={unit?.terraceM2?.tbc ? "tbc" : "excel"} tbc={unit?.terraceM2?.tbc} value={form.terrace} onChange={(v) => set("terrace", v)} numeric />
            <Field label="الاتجاه" source={unit?.orientation?.tbc ? "tbc" : "excel"} tbc={unit?.orientation?.tbc} value={form.orientation} onChange={(v) => set("orientation", v)} />
            <Field label="ارتفاع السقف م" source={unit?.ceilingM?.tbc ? "tbc" : "excel"} tbc={unit?.ceilingM?.tbc} value={form.ceiling} onChange={(v) => set("ceiling", v)} numeric />
            <Field label="الطابق" source="admin" value={form.floor} onChange={(v) => set("floor", v)} />
          </Section>

          <Section title="السعر" cols="200px">
            <Field label="السعر بالريال" source="excel" value={form.price} onChange={(v) => set("price", v)} onBlur={() => priceNum && set("price", fmtNum(priceNum))} numeric big />
            <div className="flex min-w-0 flex-col gap-1.5 text-[12px] font-bold text-muted">
              <span>سعر المتر (يُحسب)</span>
              <span className="invisible text-caption">·</span>
              <output aria-live="polite" className="flex h-11 items-center border border-dashed border-line px-3 text-[18px] font-extrabold text-ink tnum">
                {ppmValue ? fmtNum(ppmValue) : "—"}
              </output>
            </div>
            <SelectField
              label="ضريبة التصرفات العقارية"
              source="admin"
              value={form.tax}
              onChange={(v) => set("tax", v)}
              options={[
                { value: "tbc", label: "غير محدد [للتأكيد]" },
                { value: "incl", label: "شامل الضريبة" },
                { value: "excl", label: "غير شامل الضريبة" },
              ]}
            />
            <Field label="رقم ترخيص الإعلان (اختياري)" source="admin" value={form.adLicence} onChange={(v) => set("adLicence", v)} placeholder="رقم رخصة الإعلان من الهيئة" ltr />
          </Section>

          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
            <Section title="المميزات" meta="· Excel" cols="1fr" body="flex flex-col gap-0">
              {(
                [
                  ["maid", "غرفة عاملة/خادمة"],
                  ["driver", "غرفة سائق"],
                  ["balcony", "بلكونة"],
                  ["smartHome", "سمارت هوم"],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex min-h-11 items-center justify-between gap-3 border-b border-line text-label font-semibold">
                  {label}
                  <input type="checkbox" checked={form[k]} onChange={(e) => set(k, e.target.checked)} className="size-[18px] accent-ink" />
                </label>
              ))}
              <label className="flex min-h-12 items-center justify-between gap-3 border-b border-line text-label font-semibold">
                نوع المطبخ
                <span className="w-[96px] shrink-0">
                  <select value={form.kitchen} onChange={(e) => set("kitchen", e.target.value as Form["kitchen"])} className={fieldControlClass(form.kitchen === "tbc" ? "tbc" : "excel", "h-9 px-2 text-[12px] font-bold")}>
                    <option value="tbc">[للتأكيد]</option>
                    <option value="open">مفتوح</option>
                    <option value="closed">مغلق</option>
                  </select>
                </span>
              </label>
              <Field label="مميزات جوهرية أخرى" source="excel" value={form.other} onChange={(v) => set("other", v)} noTag className="pt-3" />
              <Field label="مميزات إضافية أخرى" source="tbc" value={form.extra} onChange={(v) => set("extra", v)} placeholder="[للتأكيد]" noTag className="pt-3" />
            </Section>
            <Section title="الضمانات" meta="· Excel، أو تُورَّث من المشروع" cols="1fr" body="flex flex-col gap-3">
              <Field label="الضمانات" source="tbc" value={form.warranty} onChange={(v) => set("warranty", v)} placeholder="[للتأكيد] · فارغ = يُورَّث من المشروع" noTag />
              <Field label="نوع التأمين" source="tbc" value={form.insurance} onChange={(v) => set("insurance", v)} placeholder="[للتأكيد]" noTag />
              <SelectField
                label="شهادة الإشغال"
                source="excel"
                noTag
                value={form.occupancy}
                onChange={(v) => set("occupancy", v)}
                options={[
                  { value: "after", label: "بعد التسليم (من المشروع)" },
                  { value: "issued", label: "صادرة" },
                ]}
              />
            </Section>
          </div>

          <Section title="الصور والمخطط" meta="· إدارة" aside="رفع صورة فعلية يستبدل التعبيرية ويزيل الوسم تلقائياً" cols="140px" fill>
            {(unit?.images ?? []).slice(0, 3).map((slot, i) => (
              <figure key={slot} className="relative m-0 flex flex-col gap-1">
                <ImageSlot slotId={slot} tier="generated" compact showId={false} className="h-[100px]" />
                {i === 0 && <span className="absolute start-1.5 top-1.5 bg-gold px-1.5 py-0.5 text-caption font-bold text-ink">الغلاف</span>}
                <figcaption className="text-caption font-bold text-muted">تعبيرية · {roomOf(slot)}</figcaption>
              </figure>
            ))}
            {unit?.plan && <div className="flex h-[100px] items-center justify-center bg-sand text-caption font-bold">المخطط 2D · PDF</div>}
            <label className="relative flex h-[100px] cursor-pointer items-center justify-center border-[1.5px] border-dashed border-ink text-[12px] font-bold hover:bg-sand">
              + رفع
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => {
                  const n = e.target.files?.length ?? 0;
                  if (n) toast(`أُضيفت ${n} ${n === 1 ? "صورة فعلية" : "صور فعلية"} · تُنشر مع الحفظ`);
                  e.target.value = "";
                }}
              />
            </label>
          </Section>
        </form>

        <aside className="flex flex-col gap-4">
          <section className="cut-l flex flex-col gap-3 bg-ink p-5 text-paper" aria-label="الحالة">
            <span className="text-[12px] font-extrabold text-gold">
              الحالة <span className="font-medium text-on-ink-muted">· Excel أو يدوي، الأحدث يفوز</span>
            </span>
            <div role="group" aria-label="حالة الوحدة" className="grid grid-cols-3 border-[1.5px] border-ink-2">
              {(["available", "reserved", "sold"] as UnitStatus[]).map((s) => (
                <button key={s} type="button" aria-pressed={form.status === s} onClick={() => set("status", s)} className={cx("h-11 text-label motion-hover", form.status === s ? "bg-gold font-extrabold text-ink" : "font-bold text-paper hover:bg-ink-2")}>
                  {STATUS_WORD[s]}
                </button>
              ))}
            </div>
            <label className="flex flex-col gap-1.5 text-caption text-on-ink-muted">
              محجوز حتى (يعود متاحاً تلقائياً بعدها)
              <input type="date" dir="ltr" disabled={form.status !== "reserved"} value={form.reservedUntil} onChange={(e) => set("reservedUntil", e.target.value)} className="h-11 bg-ink-2 px-3 text-label font-normal text-paper disabled:text-disabled" />
            </label>
            <label className="flex flex-col gap-1.5 text-caption text-on-ink-muted">
              تاريخ البيع (يظهر «بيعت في» على البطاقة)
              <input type="date" dir="ltr" disabled={form.status !== "sold"} value={form.soldOn} onChange={(e) => set("soldOn", e.target.value)} className="h-11 bg-ink-2 px-3 text-label font-normal text-paper disabled:text-disabled" />
            </label>
            <div className="flex items-center justify-between gap-3 border-t border-ink-2 pt-3 text-label font-bold">
              <span id="hide-label">إخفاء من الموقع</span>
              <button
                type="button"
                role="switch"
                aria-checked={form.hidden}
                aria-labelledby="hide-label"
                onClick={() => set("hidden", !form.hidden)}
                className={cx("relative flex h-7 w-12 shrink-0 items-center px-1 motion-hover", form.hidden ? "justify-end bg-gold" : "justify-start bg-ink-2")}
              >
                <span aria-hidden className={cx("size-5 hex-flat", form.hidden ? "bg-ink" : "bg-on-ink-muted")} />
              </button>
            </div>
            <span className="text-caption leading-relaxed text-on-ink-muted">مخفية = لا تظهر في النتائج ولا في جدول المشروع ولا في دليل الأسعار.</span>
          </section>

          <section className="flex flex-col gap-2.5 border-interactive bg-paper p-5 text-[12px]" aria-label="النشر">
            <span className="font-extrabold">النشر</span>
            <span className="flex justify-between gap-3">
              <span className="text-muted">الحالة</span>
              <strong>{isNew ? "مسودة" : hidden ? "مخفية" : "منشورة"}</strong>
            </span>
            {unit && (
              <>
                <span className="flex justify-between gap-3">
                  <span className="text-muted">آخر تحديث على الموقع</span>
                  <strong className="tnum">{fmtDate(log[0]?.at ?? unit.updatedAt)}</strong>
                </span>
                <span className="flex justify-between gap-3">
                  <span className="text-muted">الرابط</span>
                  <Link href={`/units/${unit.slug}`} dir="ltr" className="font-bold text-gold-text underline hover:text-ink">
                    /units/{unit.slug}
                  </Link>
                </span>
              </>
            )}
          </section>

          {(history.length > 0 || log.length > 0) && (
            <section className="flex flex-col border-interactive bg-paper p-5 text-[12px]" aria-label="سجل التغييرات">
              <span className="mb-1 font-extrabold">سجل التغييرات</span>
              {[...log, ...history].map((h, i) => (
                <span key={i} className="border-b border-line py-2.5 leading-relaxed last:border-b-0">
                  <strong>{h.by}</strong> · {h.text} · <span className="tnum">{fmtDate(h.at)}</span>
                </span>
              ))}
            </section>
          )}

          {unit && (
            <button type="button" onClick={() => setDel(true)} className="min-h-11 border-[1.5px] border-line bg-paper text-[12px] font-bold text-muted hover:border-ink hover:text-ink">
              حذف الوحدة نهائياً
            </button>
          )}
        </aside>
      </div>

      <SaveBar
        sticky
        className="-mx-4 mt-2 md:-mx-8"
        state={state}
        dirtyCount={changed.length}
        message={state === "dirty" ? unsavedInFields(changed.length) : undefined}
        onDraft={() => save(false)}
        onSave={() => save(true)}
        onDiscard={() => setDraft({})}
        labels={{ draft: "حفظ كمسودة", publish: "حفظ ونشر", save: "حفظ ونشر" }}
        savedText="نُشر للتو ·"
        openHref={unit ? `/units/${unit.slug}` : undefined}
        openLabel="معاينة"
      />

      {unit && (
        <Dialog
          open={del}
          onClose={() => setDel(false)}
          title={`حذف الوحدة ${code} نهائياً؟`}
          confirmLabel={`احذف ${code}`}
          destructive
          confirmCode={code}
          onConfirm={() => {
            setDel(false);
            setUnitHidden(unit.code, true);
            patch("unitDeleted", unit.code, { at: TODAY });
            toast(`حُذفت الوحدة ${unit.code}`);
            router.push("/admin/units");
          }}
          safeAlternative={
            <button
              type="button"
              className="font-bold text-gold-text underline hover:text-ink"
              onClick={() => {
                setDel(false);
                set("hidden", true);
              }}
            >
              إخفاء من الموقع
            </button>
          }
        >
          <p className="text-label font-normal leading-relaxed text-ink-2">
            تختفي من الموقع فوراً، وتُحذف صورها وسجلّ تغييراتها، ويتحوّل رابطها إلى صفحة 404.{" "}
            {linked === 1 ? "طلب وارد واحد مرتبط بها سيبقى بلا وحدة. " : linked === 2 ? "2 طلبان واردان مرتبطان بها سيبقيان بلا وحدة. " : linked > 2 ? `${linked} طلبات واردة مرتبطة بها ستبقى بلا وحدة. ` : ""}
            لا يمكن التراجع.
          </p>
        </Dialog>
      )}
    </G7Shell>
  );
}

function Section({ title, meta, aside, cols, body, fill, children }: { title: string; meta?: string; aside?: string; cols: string; body?: string; fill?: boolean; children: ReactNode }) {
  return (
    <fieldset className="m-0 min-w-0 border-interactive bg-paper p-0">
      <legend className="float-start w-full">
        <span className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <span className="flex items-center gap-2.5 text-[15px] font-extrabold">
            <span aria-hidden className="size-2.5 bg-gold hex-point" />
            {title}
            {meta && <span className="text-caption font-medium text-muted">{meta}</span>}
          </span>
          {aside && <span className="text-caption text-muted">{aside}</span>}
        </span>
      </legend>
      <div className={cx("clear-both p-5", body ?? cx("grid gap-x-4 gap-y-4", fill ? "[grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]" : ""))} style={body || fill ? undefined : { gridTemplateColumns: `repeat(auto-fit, minmax(min(${cols}, 100%), 1fr))` }}>
        {children}
      </div>
    </fieldset>
  );
}

const TAG: Record<FieldSource, string> = { excel: "Excel", admin: "إدارة", tbc: "Excel", computed: "يُحسب", error: "" };

function Field({
  label,
  source,
  value,
  onChange,
  onBlur,
  readOnly,
  ltr,
  bold,
  big,
  numeric,
  tbc,
  tag,
  noTag,
  placeholder,
  id,
  className,
}: {
  label: string;
  source: FieldSource;
  value: string;
  onChange?: (v: string) => void;
  onBlur?: () => void;
  readOnly?: boolean;
  ltr?: boolean;
  bold?: boolean;
  big?: boolean;
  numeric?: boolean;
  tbc?: boolean;
  tag?: string;
  noTag?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
}) {
  return (
    <label className={cx("flex min-w-0 flex-col gap-1.5 text-[12px] font-bold text-muted", className)}>
      <span>{label}</span>
      {!noTag && (
        <span className="flex items-center gap-2 text-caption font-medium">
          · {tag ?? TAG[source]}
          {tbc && <Mark>[للتأكيد]</Mark>}
        </span>
      )}
      <input
        id={id}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        inputMode={numeric ? "decimal" : undefined}
        dir={ltr || numeric ? "ltr" : undefined}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        className={fieldControlClass(source, cx((ltr || numeric) && "text-right", bold && "font-extrabold", big && "text-[18px] font-extrabold", "font-bold tnum"))}
      />
    </label>
  );
}

function SelectField({ label, source, value, onChange, options, noTag }: { label: string; source: FieldSource; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; noTag?: boolean }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-[12px] font-bold text-muted">
      <span>{label}</span>
      {!noTag && <span className="text-caption font-medium">· {TAG[source]}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldControlClass(source, "font-bold")}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

