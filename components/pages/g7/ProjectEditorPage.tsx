"use client";
// /admin/projects/[id] and /admin/projects/new (Admin-ProjectEditor-D). Opens with the fixture's unsaved description
// draft, so the save bar starts dirty; «حفظ ونشر» goes saving → «نُشر للتو» and stores the edits as a patch. The pin
// field is the schematic PinPicker with coordinate fields. AR / EN tab swaps the name and description fields.
import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DragHandle, SaveBar, Switch, fieldControlClass, type FieldSource, type SaveState } from "@/components/admin";
import { PinPicker } from "@/components/map";
import { ImageSlot, Mark } from "@/components/ui";
import { siteDistricts } from "@/data/districts";
import { projectById } from "@/data/projects";
import { projectBuildingCounts, whenLabel } from "@/data/selectors";
import type { Project } from "@/data/types";
import { usePatch, useStore, useUnitOverrides } from "@/lib/store";
import { cx, fmtDate, plural } from "@/lib/format";
import { G7Shell } from "./shell";
import { unsavedInFields } from "./util";

interface Building {
  key: string;
  letter: string;
  nameAr: string;
  code: string;
}
interface Milestone {
  key: string;
  label: string;
  date: string;
  done: boolean;
  tbc: boolean;
}
interface Form {
  nameAr: string;
  nameEn: string;
  code: string;
  district: string;
  status: "under-construction" | "ready" | "planned";
  delivery: string;
  descriptionAr: string;
  descriptionEn: string;
  buildings: Building[];
  features: string[];
  lat: number;
  lng: number;
  milestones: Milestone[];
  warranty: string;
  insurance: string;
  occupancy: string;
  published: boolean;
  featured: boolean;
}

const STATUS_OPTIONS = [
  { value: "under-construction", label: "قيد الإنشاء" },
  { value: "ready", label: "جاهز" },
  { value: "planned", label: "مخطط" },
];
const OCCUPANCY = ["بعد التسليم", "صادرة · رقم", "قيد الإصدار"];

function fromProject(p: Project | undefined): Form {
  if (!p)
    return { nameAr: "", nameEn: "", code: "", district: "rawdah", status: "planned", delivery: "", descriptionAr: "", descriptionEn: "", buildings: [], features: [], lat: 21.572, lng: 39.168, milestones: [], warranty: "", insurance: "", occupancy: "بعد التسليم", published: false, featured: false };
  return {
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    code: p.code ?? "",
    district: p.districtSlug,
    status: p.status === "draft" ? "planned" : p.status,
    delivery: p.deliveryLabel.value,
    descriptionAr: p.descriptionAr,
    descriptionEn: p.descriptionEn ?? "",
    buildings: p.buildings.map((b) => ({ key: b.code + b.letter, letter: b.letter, nameAr: b.nameAr, code: b.code })),
    features: [...p.features],
    lat: p.centre.lat,
    lng: p.centre.lng,
    milestones: p.milestones.map((m, i) => ({ key: `m${i}`, ...m })),
    warranty: "",
    insurance: "",
    occupancy: p.occupancy === "صادرة" ? "صادرة · رقم" : "بعد التسليم",
    published: p.published,
    featured: p.featured,
  };
}

export function ProjectEditorPage({ id }: { id?: string }) {
  const project = id ? projectById(id) : undefined;
  const isNew = !project;
  const router = useRouter();
  const overrides = useUnitOverrides();
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const saved = usePatch<Partial<Form>>("projectEdit", id ?? "new");
  const extraLog = usePatch<{ entries: { by: string; text: string; at: string }[] }>("projectLog", id ?? "new")?.entries ?? [];
  const initial = useMemo<Form>(() => ({ ...fromProject(project), ...(saved ?? {}) }), [project, saved]);
  // The fixture's unsaved editor draft (Admin-ProjectEditor-D): the description was edited and the pin moved, not yet
  // published («تغييرات غير محفوظة في 3 حقول»).
  const [draft, setDraft] = useState<Partial<Form>>(() =>
    saved || !project ? {} : { ...(project.descriptionDraftAr ? { descriptionAr: project.descriptionDraftAr } : {}), ...(project.pinDraft ? { lat: project.pinDraft.lat, lng: project.pinDraft.lng } : {}) },
  );
  const [phase, setPhase] = useState<"idle" | "saving" | "saved">("idle");
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [newFeature, setNewFeature] = useState("");
  const form: Form = { ...initial, ...draft };
  const changed = (Object.keys(draft) as (keyof Form)[]).filter((k) => JSON.stringify(draft[k]) !== JSON.stringify(initial[k]));
  const state: SaveState = phase === "saving" ? "saving" : phase === "saved" && !changed.length ? "saved" : changed.length ? "dirty" : "clean";
  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    if (phase === "saved") setPhase("idle");
  };

  const counts = project ? projectBuildingCounts(project.id, overrides) : [];
  const tbcFields = project?.tbcFields ?? [];
  const enMissing = [form.nameEn, form.descriptionEn, undefined, undefined, undefined].filter((v) => !v).length;
  const log = [...extraLog, ...(project?.log ?? [])];
  const last = log[0];

  function save(publish: boolean) {
    const key = id ?? (form.code.trim().toLowerCase() || "new");
    setPhase("saving");
    window.setTimeout(() => {
      patch("projectEdit", key, { ...form, published: publish ? form.published : false });
      patch("projectLog", key, { entries: [{ by: "سعود", text: publish ? `نشر ${changed.length ? plural(changed.length, { one: "تعديلاً واحداً", two: "تعديلين", few: "تعديلات", many: "تعديلاً" }) : "المشروع"}` : "حفظ مسودة", at: "2026-10-10T22:00" }, ...extraLog] });
      setDraft({});
      setPhase(publish ? "saved" : "idle");
      toast(publish ? `نُشر ${form.nameAr || "المشروع"}` : `حُفظت مسودة ${form.nameAr || "المشروع"}`, project && publish ? { action: { label: "معاينة", href: `/projects/${project.slug}` } } : undefined);
      if (isNew) router.push("/admin/projects");
    }, 900);
  }

  const subtitle = isNew
    ? "مسودة · لا يظهر على الموقع حتى يُنشر"
    : [
        form.published ? "منشور" : "مسودة",
        last ? `آخر تعديل ${last.at.includes("T") ? whenLabel(`${last.at}:00+03:00`) : fmtDate(last.at)} بواسطة ${last.by}` : null,
        tbcFields.length ? `${tbcFields.length} حقول بانتظار تأكيد المطوّر` : null,
      ]
        .filter(Boolean)
        .join(" · ");

  return (
    <G7Shell active="projects" mainClassName="pb-0 md:pb-0">
      <nav aria-label="المسار" className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
        <Link href="/admin/projects" className="font-bold text-gold-text hover:text-ink hover:underline">
          المشاريع
        </Link>
        <span aria-hidden>/</span>
        <span aria-current="page" className="font-bold text-ink">
          {project?.nameAr ?? "مشروع جديد"}
        </span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="text-[28px] font-extrabold leading-tight">{project ? `تحرير المشروع · ${project.nameAr}` : "مشروع جديد"}</h1>
          <p className="text-label font-normal text-muted">{subtitle}</p>
        </div>
        <div role="group" aria-label="اللغة" className="inline-flex border-interactive bg-paper">
          <button type="button" aria-pressed={lang === "ar"} onClick={() => setLang("ar")} className={cx("h-10 px-4 text-[12px]", lang === "ar" ? "bg-ink font-extrabold text-paper" : "font-bold hover:bg-sand")}>
            عربي
          </button>
          <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")} className={cx("h-10 border-s-[1.5px] border-ink px-4 text-[12px]", lang === "en" ? "bg-ink font-extrabold text-paper" : "font-bold hover:bg-sand")}>
            EN {enMissing > 0 && <span className={cx("font-medium", lang === "en" ? "text-on-ink-muted" : "text-muted")}>· {plural(enMissing, { one: "حقل ناقص", two: "حقلان ناقصان", few: "حقول ناقصة", many: "حقلاً ناقصاً" })}</span>}
          </button>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <form className="flex min-w-0 flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <Section title="الأساسيات">
            <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
              {lang === "ar" ? (
                <Input label="اسم المشروع" value={form.nameAr} onChange={(v) => set("nameAr", v)} />
              ) : (
                <Input label="Project name" value={form.nameEn} onChange={(v) => set("nameEn", v)} ltr />
              )}
              <Input label="رقم المشروع (مفتاح Excel)" value={form.code} onChange={(v) => set("code", v.toUpperCase())} ltr />
              <Select label="المدينة" value="jeddah" onChange={() => {}} options={[{ value: "jeddah", label: "جدة" }]} />
              <Select label="الحي" value={form.district} onChange={(v) => set("district", v)} options={siteDistricts().map((d) => ({ value: d.slug, label: d.ar }))} />
              <Select label="حالة المشروع" value={form.status} onChange={(v) => set("status", v as Form["status"])} options={STATUS_OPTIONS} />
              <Input label="التسليم المتوقع" tbc={project?.deliveryLabel.tbc ?? true} value={form.delivery} onChange={(v) => set("delivery", v)} source={project?.deliveryLabel.tbc !== false ? "tbc" : "admin"} />
            </div>
            <label className="mt-4 flex flex-col gap-1.5 text-[12px] font-bold text-muted">
              {lang === "ar" ? "الوصف (يظهر في صفحة المشروع والرئيسية)" : "Description (project page and home)"}
              {lang === "ar" ? (
                <textarea rows={3} value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} className="border-interactive bg-paper px-3 py-2.5 text-[14px] font-normal leading-relaxed text-ink" />
              ) : (
                <textarea rows={3} dir="ltr" value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} className="border-interactive bg-paper px-3 py-2.5 text-[14px] font-normal leading-relaxed text-ink" />
              )}
            </label>
          </Section>

          <Section
            title="العمارات"
            action={
              <button
                type="button"
                onClick={() => set("buildings", [...form.buildings, { key: `b${form.buildings.length}-${Date.now()}`, letter: String.fromCharCode(65 + form.buildings.length), nameAr: "", code: "" }])}
                className="h-9 border-interactive bg-paper px-3 text-[12px] font-bold hover:bg-sand"
              >
                + عمارة
              </button>
            }
          >
            {form.buildings.length === 0 && <p className="text-label font-normal text-muted">لا عمارات بعد.</p>}
            {form.buildings.map((b, i) => {
              const c = counts.find((x) => x.code === b.code);
              return (
                <div key={b.key} className="flex flex-wrap items-center gap-3 border-b border-line py-3 last:border-b-0">
                  <DragHandle aria-label={`مقبض السحب · ${b.nameAr || b.letter}`} onKeyDown={(e: KeyboardEvent) => reorder(e, i, form.buildings, (v) => set("buildings", v))} />
                  <span aria-hidden className="flex size-8 items-center justify-center bg-gold text-[12px] font-extrabold text-ink hex-flat">
                    {b.letter}
                  </span>
                  <span className="w-[160px]">
                    <input aria-label="اسم العمارة" value={b.nameAr} onChange={(e) => set("buildings", form.buildings.map((x) => (x.key === b.key ? { ...x, nameAr: e.target.value } : x)))} className={fieldControlClass("admin", "h-10 font-bold")} />
                  </span>
                  <span className="w-[90px]">
                    <input aria-label="بادئة الكود" dir="ltr" value={b.code} onChange={(e) => set("buildings", form.buildings.map((x) => (x.key === b.key ? { ...x, code: e.target.value.toUpperCase() } : x)))} className={fieldControlClass("admin", "h-10 text-center text-label font-bold")} />
                  </span>
                  <span className="text-[12px] text-muted">{c ? [`${plural(c.listed, { one: "نموذج واحد", two: "نموذجان", few: "نماذج", many: "نموذجاً" })}`, `${c.available} متاحة`, c.sold ? `${c.sold} مباعة` : null].filter(Boolean).join(" · ") : "0 نماذج"}</span>
                  <button type="button" onClick={() => set("buildings", form.buildings.filter((x) => x.key !== b.key))} className="ms-auto min-h-10 px-2 text-[12px] font-bold text-muted hover:text-ink">
                    حذف
                  </button>
                </div>
              );
            })}
          </Section>

          <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
            <Section title="مميزات المشروع">
              <div className="flex flex-wrap items-center gap-2">
                {form.features.map((f) => (
                  <span key={f} className="flex h-9 items-center gap-1 border-interactive bg-sand ps-3 text-[12px] font-bold">
                    {f}
                    <button type="button" aria-label={`إزالة ${f}`} onClick={() => set("features", form.features.filter((x) => x !== f))} className="flex h-full w-8 items-center justify-center text-[14px]">
                      ×
                    </button>
                  </span>
                ))}
                <input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const v = newFeature.trim();
                      if (v && !form.features.includes(v)) set("features", [...form.features, v]);
                      setNewFeature("");
                    }
                  }}
                  placeholder="+ ميزة، ثم Enter"
                  aria-label="ميزة جديدة"
                  className="h-9 w-[150px] border-[1.5px] border-dashed border-ink bg-paper px-2 text-[12px]"
                />
              </div>
            </Section>
            <Section title="الموقع على الخريطة">
              <PinPicker
                latLng={{ lat: form.lat, lng: form.lng }}
                coordinateFields="below"
                decimals={4}
                gridSize={30}
                hint=""
                onChange={(v) => {
                  if (Math.abs(v.lat - form.lat) > 1e-7 || Math.abs(v.lng - form.lng) > 1e-7) setDraft((d) => ({ ...d, lat: v.lat, lng: v.lng }));
                }}
              />
            </Section>
          </div>

          <Section title="مراحل التسليم والضمانات">
            <div className="flex flex-col gap-2">
              {form.milestones.map((m, i) => (
                <div key={m.key} className="grid items-center gap-2 [grid-template-columns:24px_1fr_1fr_110px_32px]">
                  <DragHandle aria-label={`مقبض السحب · ${m.label}`} onKeyDown={(e: KeyboardEvent) => reorder(e, i, form.milestones, (v) => set("milestones", v))} />
                  <input aria-label="المرحلة" value={m.label} onChange={(e) => set("milestones", form.milestones.map((x) => (x.key === m.key ? { ...x, label: e.target.value } : x)))} className={fieldControlClass(m.tbc ? "tbc" : "admin", "h-10 text-label font-bold")} />
                  <input aria-label="التاريخ" dir="ltr" value={m.date} onChange={(e) => set("milestones", form.milestones.map((x) => (x.key === m.key ? { ...x, date: e.target.value, tbc: false } : x)))} className={fieldControlClass(m.tbc ? "tbc" : "admin", "h-10 text-right text-label font-normal")} />
                  <label className="flex min-h-10 items-center gap-2 text-[12px]">
                    <input type="checkbox" checked={m.done} onChange={(e) => set("milestones", form.milestones.map((x) => (x.key === m.key ? { ...x, done: e.target.checked } : x)))} className="size-4 accent-ink" />
                    منجزة
                  </label>
                  <button type="button" aria-label={`حذف ${m.label}`} onClick={() => set("milestones", form.milestones.filter((x) => x.key !== m.key))} className="flex size-8 items-center justify-center text-[16px] text-muted hover:text-ink">
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => set("milestones", [...form.milestones, { key: `m${Date.now()}`, label: "", date: "", done: false, tbc: false }])} className="h-9 self-start border-interactive bg-paper px-3 text-[12px] font-bold hover:bg-sand">
                + مرحلة
              </button>
            </div>
            <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr))]">
              <Input label="الضمانات" tbc value={form.warranty} onChange={(v) => set("warranty", v)} source="tbc" placeholder="مثال: هيكل 10 سنوات، كهرباء وسباكة سنة" />
              <Input label="نوع التأمين" tbc value={form.insurance} onChange={(v) => set("insurance", v)} source="tbc" />
              <Select label="شهادة الإشغال" value={form.occupancy} onChange={(v) => set("occupancy", v)} options={OCCUPANCY.map((o) => ({ value: o, label: o }))} />
            </div>
          </Section>

          <Section title="صور المشروع" meta="الأولى هي الغلاف · اسحب لإعادة الترتيب · الطبقة تظهر على كل صورة">
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
              {(project?.images ?? []).map((slot, i) => (
                <figure key={slot} className="relative m-0 flex flex-col gap-1">
                  <ImageSlot slotId={slot} tier="generated" compact showId={false} className="h-[100px]" />
                  {i === 0 && <span className="absolute start-1.5 top-1.5 bg-gold px-1.5 py-0.5 text-caption font-bold text-ink">الغلاف</span>}
                  <figcaption className="text-caption font-bold text-muted">تعبيرية · بوسم</figcaption>
                </figure>
              ))}
              <label className="relative flex h-[100px] cursor-pointer items-center justify-center border-[1.5px] border-dashed border-ink text-[12px] font-bold hover:bg-sand">
                + رفع
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    const n = e.target.files?.length ?? 0;
                    if (n) toast(`أُضيفت ${plural(n, { one: "صورة واحدة", two: "صورتان", few: "صور", many: "صورة" })} · تُنشر مع الحفظ`);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </Section>
        </form>

        <aside className="flex flex-col gap-4">
          <section className="flex flex-col gap-3 border-interactive bg-paper p-5" aria-label="النشر">
            <span className="text-[12px] font-extrabold">النشر</span>
            <div className="flex items-center justify-between gap-3 text-label">
              <span id="pub-label">ظاهر على الموقع</span>
              <Switch checked={form.published} onChange={(v: boolean) => set("published", v)} aria-labelledby="pub-label" />
            </div>
            <div className="flex items-center justify-between gap-3 text-label">
              <span id="feat-label">مشروع مميز في الرئيسية</span>
              <Switch checked={form.featured} onChange={(v: boolean) => set("featured", v)} aria-labelledby="feat-label" />
            </div>
            {project && project.published && (
              <Link href={`/projects/${project.slug}`} className="flex h-10 items-center justify-center border-interactive text-[12px] font-bold text-ink hover:bg-sand">
                معاينة الصفحة العامة
              </Link>
            )}
          </section>

          {tbcFields.length > 0 && (
            <section className="flex flex-col gap-2 border-[1.5px] border-gold bg-cream-focus p-5" aria-label="حقول بانتظار التأكيد">
              <span className="text-[12px] font-extrabold text-gold-text">{tbcFields.length} حقول بانتظار تأكيد المطوّر</span>
              <span className="text-[12px] leading-relaxed">{tbcFields.join(" · ")}</span>
              <span className="text-caption leading-relaxed text-muted">
                تظهر على الموقع بوسم <Mark>[للتأكيد]</Mark> حتى تُملأ. القائمة الكاملة في{" "}
                <Link href="/admin/content/needs-confirmation" className="font-bold text-gold-text underline hover:text-ink">
                  «يحتاج تأكيداً»
                </Link>
                .
              </span>
            </section>
          )}

          {log.length > 0 && (
            <section className="flex flex-col border-interactive bg-paper p-5 text-[12px]" aria-label="سجل التغييرات">
              <span className="mb-1 font-extrabold">سجل التغييرات</span>
              {log.map((h, i) => (
                <span key={i} className="border-b border-line py-2.5 leading-relaxed last:border-b-0">
                  <strong>{h.by}</strong> {h.text} · <span className="tnum">{h.at.includes("T") ? whenLabel(`${h.at}:00+03:00`) : fmtDate(h.at)}</span>
                </span>
              ))}
            </section>
          )}
        </aside>
      </div>

      <SaveBar
        sticky
        className="-mx-4 mt-2 md:-mx-8"
        state={state}
        dirtyCount={changed.length}
        message={state === "dirty" ? unsavedInFields(changed.length) : undefined}
        onDiscard={() => setDraft({})}
        onDraft={() => save(false)}
        onSave={() => save(true)}
        labels={{ discard: "تجاهل", draft: "حفظ كمسودة", publish: "حفظ ونشر", save: "حفظ ونشر" }}
        savedText="نُشر للتو ·"
        openHref={project?.published ? `/projects/${project.slug}` : undefined}
        openLabel="معاينة"
      />
    </G7Shell>
  );
}

function reorder<T>(e: KeyboardEvent, i: number, list: T[], apply: (v: T[]) => void) {
  const to = e.key === "ArrowUp" ? i - 1 : e.key === "ArrowDown" ? i + 1 : -1;
  if (to < 0 || to >= list.length) return;
  e.preventDefault();
  const next = [...list];
  const [it] = next.splice(i, 1);
  next.splice(to, 0, it);
  apply(next);
}

function Section({ title, meta, action, children }: { title: string; meta?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="m-0 min-w-0 border-interactive bg-paper p-0">
      <legend className="float-start w-full">
        <span className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
          <span className="text-[15px] font-extrabold">{title}</span>
          {meta && <span className="text-caption text-muted">{meta}</span>}
          {action}
        </span>
      </legend>
      <div className="clear-both p-5">{children}</div>
    </fieldset>
  );
}

function Input({ label, value, onChange, ltr, tbc, source = "admin", placeholder }: { label: string; value: string; onChange: (v: string) => void; ltr?: boolean; tbc?: boolean; source?: FieldSource; placeholder?: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-[12px] font-bold text-muted">
      <span className="flex items-center gap-2">
        {label}
        {tbc && <Mark>[للتأكيد]</Mark>}
      </span>
      <input dir={ltr ? "ltr" : undefined} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={fieldControlClass(source, cx("font-bold", ltr && "text-right"))} />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-[12px] font-bold text-muted">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldControlClass("admin", "font-bold")}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

