"use client";
// Zero results (State-Empty-M/D): the headline constraint, the loosen-one suggestions with their computed «+n»,
// the WhatsApp request block and the alliance bridge form that creates a REQ record in the store.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { Button, ErrorText, Pill, TextField } from "@/components/ui";
import { cx, fmtNum, waLink } from "@/lib/format";
import { useStore } from "@/lib/store";
import { unitsUrl, DEFAULT_FILTERS, type UnitFilters } from "@/lib/url";
import { districtAr } from "@/data/districts";
import { bedsWord, coverageByDistrict, nextRequestNumber, TYPE_PARAM_SINGULAR, type EmptyState as EmptyStateData } from "@/data/selectors";
import { maskPhone, writeFilters } from "./shared";

/** «أبحث عن 4 غرف في الفيصلية حتى 450,000» */
export function requestWaText(f: UnitFilters): string {
  const what = f.beds != null ? bedsWord(f.beds) : f.type.length ? TYPE_PARAM_SINGULAR[f.type[0]] : "وحدة";
  return `أبحث عن ${what}${f.district ? ` في ${districtAr(f.district)}` : ""}${f.max != null ? ` حتى ${fmtNum(f.max)}` : ""}`;
}
/** «مكتب واحد موثّق» · «مكتبان موثّقان» · «3 مكاتب موثّقة» */
function officesPhrase(n: number): string {
  if (n === 1) return "مكتب واحد موثّق";
  if (n === 2) return "مكتبان موثّقان";
  if (n <= 10) return `${n} مكاتب موثّقة`;
  return `${n} مكتباً موثّقاً`;
}
/** the request chips: «الفيصلية» · «حتى 450,000» · «4 غرف» · «شقة» */
export function requestChips(f: UnitFilters): string[] {
  const out: string[] = [];
  if (f.district) out.push(districtAr(f.district));
  if (f.max != null) out.push(`حتى ${fmtNum(f.max)}`);
  if (f.beds != null) out.push(f.beds >= 5 ? "5 غرف أو أكثر" : bedsWord(f.beds));
  out.push(f.type.length ? f.type.map((t) => TYPE_PARAM_SINGULAR[t]).join("، ") : "وحدة");
  return out;
}

export function EmptyState({ filters, empty, className }: { filters: UnitFilters; empty: EmptyStateData; className?: string }) {
  const h = empty.headline;
  const clear = () => writeFilters({ ...DEFAULT_FILTERS, sort: filters.sort }, "push");
  return (
    <div className={cx("flex flex-col gap-6", className)}>
      <div className="grid gap-5 md:grid-cols-[repeat(auto-fit,minmax(min(380px,100%),1fr))] md:gap-6">
        <div className="flex flex-col gap-2 bg-gold px-5 pb-8 pt-5 text-ink cut-img md:cut-xl md:px-8 md:pb-12 md:pt-7">
          <span className="text-price font-extrabold leading-none tnum md:text-[96px]">0</span>
          <h2 className="m-0 text-h2">لا توجد وحدة تطابق كل الفلاتر</h2>
          {h && (
            <p className="m-0 text-label font-normal text-on-gold-muted md:text-body">
              القيد الذي يحذف أكثر النتائج هو <strong className="text-ink">{h.labelAr}</strong>. {h.lineAr}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="text-caption font-bold text-muted md:text-label">جرّب تخفيف قيد واحد</span>
          {empty.suggestions.map((s) => (
            <Link key={s.labelAr} href={unitsUrl({ ...s.filters, sort: filters.sort })} className="flex min-h-12 items-center justify-between gap-3 border-interactive px-3.5 py-2.5 text-ink no-underline hover:bg-sand motion-hover transition-colors">
              <span className="text-label font-bold md:text-body md:font-bold">{s.labelAr}</span>
              <Pill tone="ink" delta className="shrink-0">
                <span className="md:hidden">+{s.count}</span>
                <span className="hidden md:inline">{s.deltaAr}</span>
              </Pill>
            </Link>
          ))}
          <button type="button" onClick={clear} className="self-start py-1 text-label font-bold text-gold-text underline hover:text-ink motion-hover transition-colors md:hidden">
            مسح كل الفلاتر
          </button>
          <div className="mt-1 flex flex-col gap-3 bg-sand p-4 md:flex-row md:items-center md:justify-between">
            <span className="flex flex-col gap-1">
              <span className="text-body font-extrabold">أو أرسل لنا طلبك</span>
              <span className="text-caption font-normal text-muted md:hidden">نحفظ ميزانيتك وحيّك وعدد الغرف، ونراسلك عندما تُدرج وحدة تناسبها.</span>
              <span className="hidden text-caption font-normal text-muted md:inline">نراسلك عندما تُدرج وحدة تناسب طلبك.</span>
            </span>
            <Button variant="secondary" size="m" href={waLink(requestWaText(filters))} className="h-12 shrink-0 text-label">
              أرسل طلبك على واتساب
            </Button>
          </div>
        </div>
      </div>
      <AllianceBridge filters={filters} />
    </div>
  );
}

function HexDots({ count, className }: { count: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cx("flex items-center gap-1", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={cx("hex-flat inline-block size-4", i === 0 ? "bg-gold" : "bg-ink-2")} />
      ))}
    </span>
  );
}

/** The alliance bridge: name, phone, consent → the request lands in the store and /alliance/request/sent echoes it */
export function AllianceBridge({ filters, className }: { filters: UnitFilters; className?: string }) {
  const router = useRouter();
  const uid = useId();
  const addRequest = useStore((s) => s.addRequest);
  const patch = useStore((s) => s.patch);
  const created = useStore((s) => s.createdRequests);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; consent?: string }>({});
  const [sending, setSending] = useState(false);

  const district = filters.district;
  const coverage = district ? (coverageByDistrict()[district]?.count ?? 0) : 0;
  const dAr = district ? districtAr(district) : null;
  const intro = district
    ? coverage > 0
      ? `${officesPhrase(coverage)} يغطي ${dAr}. اترك طلبك ونمرّره له عبر SMQ. رقمك لا يصل لأي مكتب؛ نحن من يعرّفكم ببعض`
      : `لا يغطي ${dAr} عضو بعد؛ نمرّر طلبك لأقرب مكتب موثّق عبر SMQ. رقمك لا يصل لأي مكتب؛ نحن من يعرّفكم ببعض`
    : "مكاتب موثّقة في تحالف جدة تغطي أحياء المدينة. اترك طلبك ونمرّره عبر SMQ. رقمك لا يصل لأي مكتب؛ نحن من يعرّفكم ببعض";
  const chips = requestChips(filters);
  const editHref = unitsUrl({ ...filters, sheet: "filters" });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "الاسم مطلوب";
    if (!/^05\d{8}$/.test(phone.replace(/\s/g, ""))) next.phone = "رقم الجوال غير مكتمل";
    if (!consent) next.consent = "الموافقة على التواصل مطلوبة";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    setSending(true);
    const id = nextRequestNumber(created.map((r) => r.id));
    const typeLabelAr = `${filters.type.length ? TYPE_PARAM_SINGULAR[filters.type[0]] : "وحدة"}${filters.beds != null ? ` ${bedsWord(filters.beds)}` : ""}`;
    const districtSlug = district ?? "all";
    addRequest({ id, districtSlug, summaryAr: `${dAr ?? "كل جدة"} · ${typeLabelAr}`, createdAt: new Date().toISOString() });
    patch("request", id, { beds: filters.beds, budgetMax: filters.max, type: filters.type[0] ?? null, typeLabelAr, buyerPhoneMasked: maskPhone(phone), name: name.trim(), districtSlug });
    router.push(`/alliance/request/sent?req=${id}`);
  };

  return (
    <section aria-labelledby={`${uid}-title`} className={cx("grid border-interactive bg-paper md:grid-cols-[380px_minmax(0,1fr)]", className)}>
      <div className="flex flex-col gap-2 bg-ink px-4 pb-6 pt-4 text-paper cut-img md:[clip-path:none] md:px-6 md:py-6">
        <HexDots count={2} className="md:hidden" />
        <HexDots count={3} className="hidden md:flex" />
        <span className="mt-1 text-caption font-bold text-gold">مبادرة من SMQ · تحالف مكاتب جدة</span>
        <h2 id={`${uid}-title`} className="m-0 text-body font-extrabold leading-snug md:text-h2">
          مكاتب مرخصة في تحالف جدة تغطي هذا الحي
        </h2>
        <p className="m-0 hidden text-label font-normal text-on-ink-muted md:block">{intro} ونسجّل التعارف.</p>
        <Link href="/alliance" className="hidden text-caption font-bold text-gold no-underline hover:underline md:inline">
          ما التحالف؟ ←
        </Link>
      </div>
      <form noValidate onSubmit={submit} className="flex flex-col gap-4 p-4 md:p-6">
        <p className="m-0 text-caption font-normal text-ink-2 md:hidden">{intro}.</p>
        <div aria-label="طلبك كما سيُرسل" className="flex flex-wrap items-center gap-2">
          <span className="hidden text-caption font-bold text-muted md:inline">طلبك كما سيُرسل:</span>
          {chips.map((c) => (
            <Pill key={c} tone="sand" className="h-8 text-caption md:text-label">
              {c}
            </Pill>
          ))}
          <Link href={editHref} scroll={false} className="text-caption font-bold text-ink no-underline underline-offset-2 hover:underline">
            تعديل
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_1fr_180px] md:items-end">
          <TextField id={`${uid}-name`} label="الاسم" placeholder="اسمك" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <TextField id={`${uid}-phone`} label="الجوال" placeholder="05XXXXXXXX" type="tel" ltr inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
          <Button type="submit" variant="primary" size="m" loading={sending} className="hidden h-12 md:inline-flex">
            أرسل الطلب للتحالف
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <label className={cx("flex cursor-pointer items-start gap-3 bg-cream p-3 text-caption font-normal leading-relaxed text-ink md:text-label md:font-normal", errors.consent ? "border-error" : "border-interactive")}>
            <input id={`${uid}-consent`} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? `${uid}-consent-err` : undefined} className="mt-0.5 size-5 shrink-0 accent-gold" />
            <span>أوافق على أن تمرّر SMQ طلبي (الحي والميزانية والغرف فقط) إلى مكاتب عقارية مرخّصة أعضاء في التحالف. اسمي ورقمي يبقيان عند SMQ.</span>
          </label>
          {errors.consent && <ErrorText id={`${uid}-consent-err`}>{errors.consent}</ErrorText>}
        </div>
        <Button type="submit" variant="primary" size="m" full loading={sending} className="h-12 md:hidden">
          أرسل الطلب للتحالف
        </Button>
      </form>
    </section>
  );
}
