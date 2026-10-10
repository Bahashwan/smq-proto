"use client";
// /admin/content/testimonials (Admin-Testimonials-D): the 3+ rule meter (the «من نحن» quotes block appears only with
// three published quotes), the quote cards where «سجّل الموافقة» records the written consent and enables publishing,
// and the proof numbers (the units number is computed and never edited; [للتأكيد] values confirm from here).
import { useMemo, useState } from "react";
import Link from "next/link";
import { Switch } from "@/components/admin";
import { MarkedText } from "@/components/ui";
import { proofNumbers } from "@/data/content";
import type { Testimonial } from "@/data/types";
import { listedUnits, TODAY } from "@/data/selectors";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";
import { ctl, Field, INPUT_H } from "./controls";
import { countWord, PATCH, testimonialsSummary, useNeedsConfirmation, useTestimonials } from "./model";
import { ContentHead, G8Shell, H2, SAUD, SaveStrip, type StripState } from "./shell";

const MODELS_W = { one: "نموذج واحد", two: "نموذجان", few: "نماذج", many: "نموذجاً" };
const CONSENT_SOURCES = ["واتساب", "بريد", "ورقي"];
const PROOF_NC: Record<string, string> = { trainees: "nc-trainees", since: "nc-since" };
const PROOF_COLS = "grid grid-cols-[160px_minmax(0,1fr)_minmax(0,1fr)_110px_90px] items-center gap-3";

interface Proof {
  key: string;
  value: string;
  descriptionAr: string;
  sourceAr: string;
  visible: boolean;
  tbc: boolean;
  computed?: boolean;
}

export function TestimonialsPage() {
  const merged = useTestimonials();
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const nc = useNeedsConfirmation();
  const unitsCount = listedUnits().length;
  const initialProof = useMemo<Proof[]>(
    () =>
      proofNumbers.map((p) => {
        const confirmed = PROOF_NC[p.key] && !nc.rows.some((r) => r.id === PROOF_NC[p.key]);
        return { ...p, value: p.computed ? countWord(unitsCount, MODELS_W) : p.value, tbc: p.tbc && !confirmed, sourceAr: p.tbc && confirmed ? p.sourceAr.replace(/^\[للتأكيد\] · /, "") : p.sourceAr };
      }),
    // the confirmations are read once, when the page opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unitsCount],
  );
  const [savedT, setSavedT] = useState<Testimonial[]>(merged);
  const [items, setItems] = useState<Testimonial[]>(merged);
  const [savedP, setSavedP] = useState<Proof[]>(initialProof);
  const [proof, setProof] = useState<Proof[]>(initialProof);
  const [phase, setPhase] = useState<"edit" | "saved">("edit");
  const [consentFor, setConsentFor] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const s = testimonialsSummary(items);
  const dirty = JSON.stringify(items) !== JSON.stringify(savedT) || JSON.stringify(proof) !== JSON.stringify(savedP);
  const state: StripState = phase === "saved" ? "saved" : dirty ? "dirty" : "clean";
  const updateT = (id: string, data: Partial<Testimonial>) => {
    setPhase("edit");
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  };
  const updateP = (key: string, data: Partial<Proof>) => {
    setPhase("edit");
    setProof((prev) => prev.map((p) => (p.key === key ? { ...p, ...data } : p)));
  };
  const confirmProof = (p: Proof) => {
    updateP(p.key, { tbc: false, sourceAr: p.sourceAr.replace(/^\[للتأكيد\] · /, "") });
    if (PROOF_NC[p.key]) patch(PATCH.nc, PROOF_NC[p.key], { confirmed: true });
    toast(`أُكِّد «${p.value}» وأُزيل الوسم من الموقع`, { kind: "ok" });
  };
  const save = () => {
    for (const t of items) patch(PATCH.testimonial, t.id, { published: t.published, consent: t.consent, consentSource: t.consentSource, text: t.text, name: t.name, role: t.role, unitCode: t.unitCode, date: t.date, ...(t.id.startsWith("t-new") ? { created: true } : {}) });
    setSavedT(items);
    setSavedP(proof);
    setPhase("saved");
    const after = testimonialsSummary(items);
    toast(after.shown ? "حُفظت الآراء · كتلة «ماذا يقول عملاؤنا» ظاهرة في من نحن" : "حُفظت الآراء", { kind: "ok", action: { label: "معاينة من نحن", href: "/about" } });
    setTimeout(() => setPhase("edit"), 6000);
  };

  return (
    <G8Shell user={SAUD} mainClassName="pb-0 md:pb-0">
      <ContentHead
        trail="آراء العملاء والأرقام"
        title="آراء العملاء والأرقام"
        subtitle="كتلة الآراء في «من نحن» تظهر فقط حين تكون 3 آراء منشورة على الأقل. الآراء نصوص حقيقية بموافقة صاحبها، بلا صور أشخاص"
        actions={
          <button type="button" onClick={() => setAdding(true)} className="flex h-11 cursor-pointer items-center bg-ink px-4 text-label font-extrabold text-paper cut-s motion-hover transition-colors hover:bg-ink-2">
            + رأي
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-4 border-2 border-gold bg-cream-focus px-4 py-3">
        <div role="meter" aria-label={`${s.published} من ${s.min} منشورة`} aria-valuemin={0} aria-valuemax={s.min} aria-valuenow={Math.min(s.published, s.min)} className="flex shrink-0 gap-1">
          {Array.from({ length: s.min }, (_, i) =>
            i < s.published ? (
              <span key={i} aria-hidden className="hex-flat block h-[22px] w-[26px] bg-gold" />
            ) : (
              <span key={i} aria-hidden className="hex-flat flex h-[22px] w-[26px] items-center justify-center bg-gold">
                <span className="hex-flat block h-[18px] w-[22px] bg-paper" />
              </span>
            ),
          )}
        </div>
        <span className="min-w-0 flex-1 text-label font-normal">
          <strong className="font-extrabold">
            {s.published} من {s.min} آراء منشورة · {s.shown ? "الكتلة ظاهرة على الموقع." : "الكتلة مخفية على الموقع."}
          </strong>{" "}
          {s.missing === 1 && "نشر رأي واحد إضافي يُظهر كتلة «ماذا يقول عملاؤنا» في من نحن تلقائياً."}
          {s.missing === 2 && "نشر رأيين إضافيين يُظهر كتلة «ماذا يقول عملاؤنا» في من نحن تلقائياً."}
          {s.missing > 2 && `نشر ${s.missing} آراء إضافية يُظهر كتلة «ماذا يقول عملاؤنا» في من نحن تلقائياً.`}
        </span>
        <Link href="/about" className="text-[12px] font-extrabold text-gold-text no-underline hover:underline">
          معاينة من نحن
        </Link>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="t-h">
        <h2 id="t-h" className="text-[16px] font-extrabold">
          الآراء
        </h2>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
          {items.map((t) => {
            const live = t.published && t.consent;
            return (
              <article key={t.id} className="flex flex-col gap-3 border-interactive bg-paper p-4">
                <header className="flex items-start justify-between gap-3 text-label">
                  <span className="font-extrabold">
                    {[t.name, t.role, t.unitCode, t.date].filter(Boolean).join(" · ")}
                    {t.sample && <span className="ms-2 inline-block border border-line px-1.5 text-caption font-semibold text-muted">نص تجريبي</span>}
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-[12px] font-bold">
                    {live ? "منشور" : <span className="border-[1.5px] border-ink px-1.5 py-px text-caption font-extrabold">مسودة</span>}
                    <Switch checked={live} disabled={!t.consent} onChange={(v) => updateT(t.id, { published: v })} aria-label={t.consent ? (live ? "منشور" : "غير منشور") : "غير منشور، بلا موافقة"} />
                  </span>
                </header>
                {editing === t.id ? (
                  <textarea value={t.text} onChange={(e) => updateT(t.id, { text: e.target.value })} rows={3} aria-label="نص الرأي" className={ctl("admin", "py-2.5 leading-relaxed")} />
                ) : (
                  <p className={cx("text-body leading-relaxed", !live && "text-muted")}>{t.text}</p>
                )}
                <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 text-[12px]">
                  {t.consent ? (
                    <span className="text-muted">موافقة كتابية: نعم · {t.consentSource}</span>
                  ) : (
                    <span className="font-bold text-gold-text">موافقة كتابية: لا. النشر معطّل حتى تُسجَّل الموافقة</span>
                  )}
                  {t.consent ? (
                    <button type="button" onClick={() => setEditing(editing === t.id ? null : t.id)} className="flex h-9 cursor-pointer items-center border-[1.5px] border-ink px-3 font-bold hover:bg-sand">
                      {editing === t.id ? "تم" : "تحرير"}
                    </button>
                  ) : (
                    <button type="button" onClick={() => setConsentFor(t.id)} className="flex h-9 cursor-pointer items-center border-[1.5px] border-ink px-3 font-bold hover:bg-sand">
                      سجّل الموافقة
                    </button>
                  )}
                </footer>
                {consentFor === t.id && <ConsentForm onCancel={() => setConsentFor(null)} onSave={(src) => {
                  updateT(t.id, { consent: true, consentSource: src });
                  setConsentFor(null);
                  toast(`سُجّلت موافقة ${t.name} · يمكن نشر الرأي الآن`, { kind: "ok" });
                }} />}
              </article>
            );
          })}
          {adding ? (
            <NewTestimonial onCancel={() => setAdding(false)} onAdd={(t) => {
              setPhase("edit");
              setItems((prev) => [...prev, t]);
              setAdding(false);
              toast("أُضيف الرأي كمسودة · سجّل الموافقة لنشره", { kind: "ok" });
            }} />
          ) : (
            <button type="button" onClick={() => setAdding(true)} className="flex cursor-pointer flex-col items-start gap-2 border-[1.5px] border-dashed border-ink bg-transparent p-4 text-start hover:bg-paper">
              <span className="text-[14px] font-extrabold">+ رأي جديد</span>
              <span className="text-[12px] text-muted">الاسم بالأحرف الأولى أو كما يفضّل العميل، رمز الوحدة إن وُجد، النص، ومصدر الموافقة.</span>
            </button>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="p-h">
        <H2 aside={<MarkedText text="تظهر في «من نحن» وفي «لماذا إس إم كيو». الرقم والوصف يُكتبان هنا، وأي رقم لم يُؤكَّد يبقى بوسم [للتأكيد] على الموقع" />}>
          <span id="p-h">أرقام الإثبات</span>
        </H2>
        <div className="overflow-x-auto border-interactive bg-paper">
          <div className="min-w-[820px]">
            <div className={cx(PROOF_COLS, "bg-sand px-4 py-2.5 text-caption font-extrabold text-muted")}>
              <span>الرقم</span>
              <span>الوصف</span>
              <span>المصدر</span>
              <span>مرئي</span>
              <span />
            </div>
            {proof.map((p) => (
              <div key={p.key} className={cx(PROOF_COLS, "border-t border-line px-4 py-3 text-label font-normal")}>
                <input value={p.value} readOnly={p.computed} onChange={(e) => updateP(p.key, { value: e.target.value })} aria-label="الرقم" className={ctl(p.computed ? "computed" : p.tbc ? "tbc" : "admin", cx(INPUT_H, "font-bold"))} />
                <input value={p.descriptionAr} onChange={(e) => updateP(p.key, { descriptionAr: e.target.value })} aria-label="الوصف" className={ctl("admin", INPUT_H)} />
                <span className={cx("text-[12px]", p.tbc ? "font-bold text-gold-text" : "text-muted")}>
                  <MarkedText text={p.sourceAr} />
                </span>
                <span>
                  <Switch checked={p.visible} onChange={(v) => updateP(p.key, { visible: v })} aria-label={p.visible ? "مرئي" : "مخفي"} />
                </span>
                <span className="flex justify-end">
                  {p.tbc ? (
                    <button type="button" onClick={() => confirmProof(p)} className="flex h-9 cursor-pointer items-center bg-ink px-3 text-[12px] font-extrabold text-paper hover:bg-ink-2">
                      أكّد
                    </button>
                  ) : p.computed ? null : (
                    <Link href="/admin/content/site-settings" className="flex h-9 items-center border-[1.5px] border-ink px-3 text-[12px] font-bold text-ink no-underline hover:bg-sand">
                      تحرير
                    </Link>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SaveStrip state={state} message={dirty ? "تغييرات غير محفوظة في الآراء والأرقام" : undefined} onDiscard={() => { setItems(savedT); setProof(savedP); }} onSave={save} savedText="حُفظت الآراء والأرقام ·" openHref="/about" openLabel="معاينة من نحن" />
    </G8Shell>
  );
}

function ConsentForm({ onSave, onCancel }: { onSave: (source: string) => void; onCancel: () => void }) {
  const [src, setSrc] = useState(CONSENT_SOURCES[0]);
  return (
    <div className="flex flex-wrap items-end gap-2 border-t border-line pt-3">
      <Field label="مصدر الموافقة" className="min-w-[140px] flex-1">
        <select value={src} onChange={(e) => setSrc(e.target.value)} className={ctl("admin", "h-10 cursor-pointer")}>
          {CONSENT_SOURCES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>
      <button type="button" onClick={() => onSave(`${src} ${TODAY}`)} className="flex h-10 cursor-pointer items-center bg-ink px-3 text-[12px] font-extrabold text-paper cut-s hover:bg-ink-2">
        حفظ الموافقة
      </button>
      <button type="button" onClick={onCancel} className="flex h-10 cursor-pointer items-center border-[1.5px] border-ink px-3 text-[12px] font-bold hover:bg-sand">
        إلغاء
      </button>
    </div>
  );
}

function NewTestimonial({ onAdd, onCancel }: { onAdd: (t: Testimonial) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [unit, setUnit] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState(false);
  return (
    <div className="flex flex-col gap-3 border-[1.5px] border-dashed border-ink bg-paper p-4">
      <span className="text-[14px] font-extrabold">+ رأي جديد</span>
      <div className="grid grid-cols-2 gap-2">
        <Field label="الاسم">
          <input value={name} onChange={(e) => setName(e.target.value)} className={ctl(err && !name.trim() ? "error" : "admin", "h-10")} />
        </Field>
        <Field label="الصفة">
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="مشترٍ" className={ctl("admin", "h-10")} />
        </Field>
        <Field label="رمز الوحدة" className="col-span-2">
          <input value={unit} onChange={(e) => setUnit(e.target.value.toUpperCase())} dir="ltr" placeholder="RZ-A" className={ctl("admin", "h-10 text-right")} />
        </Field>
      </div>
      <Field label="النص" note={err ? "اكتب الاسم والنص" : undefined} noteTone="gold">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={ctl(err && !text.trim() ? "error" : "admin", "py-2 leading-relaxed")} />
      </Field>
      <span className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (!name.trim() || !text.trim()) return setErr(true);
            onAdd({ id: `t-new-${Date.now().toString(36)}`, name: name.trim(), role: role.trim() || "مشترٍ", unitCode: unit.trim() || undefined, date: TODAY.slice(0, 7), text: `«${text.trim().replace(/^«|»$/g, "")}»`, consent: false, published: false, sample: false });
          }}
          className="flex h-10 cursor-pointer items-center bg-ink px-3 text-[12px] font-extrabold text-paper cut-s hover:bg-ink-2"
        >
          أضف كمسودة
        </button>
        <button type="button" onClick={onCancel} className="flex h-10 cursor-pointer items-center border-[1.5px] border-ink px-3 text-[12px] font-bold hover:bg-sand">
          إلغاء
        </button>
      </span>
    </div>
  );
}
