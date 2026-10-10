"use client";
// /marketers · «انضم كمسوّق» (Marketer-M, Marketer-D): what a marketer gets (tracked link + QR, numbers, commission
// [للتأكيد]), how it works, and «طلب الانضمام» with the «الحقول [للتأكيد] حتى يصل النموذج الحقيقي» note (hidden with the
// presenter's marks off). The typed values stay in the session store; a valid submit opens /marketers/sent.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { DistrictMultiSelect } from "@/components/alliance";
import { Button, Checkbox, Container, MarkedText, SelectField, TextArea, TextField } from "@/components/ui";
import { forms } from "@/data/content";
import { districts } from "@/data/districts";
import { useHasHydrated } from "@/lib/location";
import { useMarks } from "@/lib/presenter";
import { usePatch, useStore } from "@/lib/store";
import { PHONE_INCOMPLETE, PHONE_REQUIRED, checkPhone, focusFirst, type Errors } from "./draft";
import { FileTile, HexBadge, MARKETER_FOOTER, Shell } from "./parts";
import { nextMarketerNo, type MarketerSent } from "./marketer";

export interface MarketerDraft {
  name: string;
  phone: string;
  fal: string;
  districts: string[];
  years: string;
  social: string;
  bio: string;
  cv: string;
  consent: boolean;
}
const YEARS = forms.marketer.years;
export const MARKETER_EMPTY: MarketerDraft = { name: "", phone: "", fal: "", districts: forms.marketer.defaultDistricts, years: YEARS[1], social: "", bio: "", cv: "", consent: false };
const ID = { name: "mk-name", phone: "mk-phone", districts: "mk-districts", consent: "mk-consent" } as const;

function check(d: MarketerDraft): Errors {
  const e: Errors = {};
  if (!d.name.trim()) e[ID.name] = "اكتب اسمك حتى نعرف بمن نتواصل.";
  const p = checkPhone(d.phone);
  if (!p.ok) e[ID.phone] = p.empty ? PHONE_REQUIRED : PHONE_INCOMPLETE;
  if (!d.consent) e[ID.consent] = "علّم الموافقة حتى نستطيع التواصل معك.";
  return e;
}

/** The three tiles of the board: tracked link, numbers, commission */
function Tiles() {
  const tiles = [
    { hex: "gold" as const, t: "رابط متابَع", s: <>ورمز QR باسمك</> },
    { hex: "ink" as const, t: "أرقامك", s: <>زيارات، واتساب، طلبات</> },
    { hex: "outline" as const, t: "عمولة", s: <MarkedText text="النسبة [للتأكيد]" className="text-gold-text" /> },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5 md:gap-2">
      {tiles.map((x) => (
        <div key={x.t} className="flex flex-col gap-1.5 border-interactive px-3 py-3.5 md:px-3.5">
          <HexBadge tone={x.hex} className="size-5.5" />
          <span className="mt-1 text-label font-extrabold">{x.t}</span>
          <span className="text-caption font-normal leading-snug text-muted">{x.s}</span>
        </div>
      ))}
    </div>
  );
}

function LinkBar() {
  return (
    <div className="flex items-center justify-between gap-3 bg-ink px-4 py-3.5 text-paper cut-m md:px-5">
      <span className="inline-flex items-center gap-2.5 font-mono text-label" dir="ltr">
        <span aria-hidden className="inline-block size-2.5 bg-gold hex-flat" />
        smq-re.com/r/your-name
      </span>
      <span className="text-caption font-normal text-on-ink-muted md:hidden">مثال الرابط</span>
    </div>
  );
}

export function MarketerForm() {
  const router = useRouter();
  const marks = useMarks();
  const hydrated = useHasHydrated();
  const saved = usePatch<MarketerDraft>("marketer-form", "draft");
  const patch = useStore((s) => s.patch);
  const draft = useMemo<MarketerDraft>(() => (hydrated && saved ? { ...MARKETER_EMPTY, ...saved } : MARKETER_EMPTY), [hydrated, saved]);
  const update = (p: Partial<MarketerDraft>) => patch("marketer-form", "draft", p as Record<string, unknown>);
  const [tried, setTried] = useState(false);
  const errors = tried ? check(draft) : {};
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = check(draft);
    setTried(true);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => focusFirst(found));
      return;
    }
    const p = checkPhone(draft.phone);
    const sent: MarketerSent = {
      no: nextMarketerNo(),
      name: draft.name.trim(),
      phone: `05X XXX ${p.digits.slice(-4)}`,
      fal: draft.fal.trim(),
      districts: draft.districts,
      years: draft.years,
      fresh: true,
    };
    patch("marketer-form", "sent", sent as unknown as Record<string, unknown>);
    router.push("/marketers/sent");
  };

  return (
    <Shell footer={MARKETER_FOOTER}>
      <section className="bg-sand text-ink [clip-path:polygon(0_0,100%_0,100%_100%,52px_100%,0_calc(100%-30px))] md:[clip-path:polygon(0_0,100%_0,100%_100%,120px_100%,0_calc(100%-69px))]">
        <Container className="flex flex-col gap-1.5 pb-12 pt-6 md:grid md:grid-cols-2 md:items-center md:gap-10 md:pb-18 md:pt-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-caption font-bold text-gold-text md:text-label">
              <Link href="/collaborate" className="text-gold-text no-underline hover:underline">
                تعاون معنا
              </Link>{" "}
              › للأفراد
            </span>
            <h1 className="m-0 text-h1">انضم كمسوّق</h1>
          </div>
          <p className="m-0 text-label font-normal leading-relaxed text-ink-2 md:max-w-xl md:justify-self-end md:text-body">
            سوّق وحدات SMQ برابطك الخاص. كل زيارة وضغطة واتساب تُحسب لك، والعمولة مكتوبة قبل أن تبدأ.
            <span className="hidden md:inline"> لا تتعامل مع المشتري مباشرة إلا إذا طلب فريق SMQ ذلك.</span>
          </p>
        </Container>
      </section>

      <Container className="mt-6 flex flex-col gap-6 md:mt-9 md:grid md:grid-cols-[420px_minmax(0,1fr)] md:items-start md:gap-10">
        <aside className="flex flex-col gap-3.5 md:sticky md:top-20 md:gap-3.5">
          <div className="order-2 md:order-1">
            <LinkBar />
          </div>
          <div className="order-1 md:order-2">
            <Tiles />
          </div>
          <p className="order-3 m-0 text-caption font-normal leading-relaxed text-muted md:hidden">
            كيف يعمل: تنشر رابطك، الزائر يصل إلى وحدة ويضغط واتساب، الطلب يُنسب لك في لوحة SMQ، وإن أُغلقت الصفقة تُحسب عمولتك. لا تتعامل مع المشتري مباشرة إلا إذا طلب فريق SMQ ذلك.
          </p>
          <div className="order-3 hidden flex-col gap-2.5 bg-sand px-5 py-5 text-label font-normal md:flex">
            <span className="text-caption font-extrabold">كيف يعمل</span>
            <span>1 · تنشر رابطك أو رمز QR أينما تسوّق</span>
            <span>2 · الزائر يصل إلى وحدة ويضغط واتساب</span>
            <span>3 · الطلب يُنسب لك في لوحة SMQ ويظهر في صفحتك</span>
            <MarkedText text="4 · إن أُغلقت الصفقة تُحسب عمولتك [للتأكيد]" />
          </div>
          <Link href="/m/mk-07" className="order-4 hidden text-caption font-bold text-gold-text no-underline hover:text-ink hover:underline md:block">
            كيف تبدو صفحة المسوّق بعد القبول ←
          </Link>
        </aside>

        <section aria-labelledby="mk-form" className="min-w-0 border-interactive">
          <div className="flex items-center justify-between gap-3 border-b-[1.5px] border-ink px-4 py-4 md:px-6 md:py-5">
            <h2 id="mk-form" className="m-0 text-h3">
              طلب الانضمام
            </h2>
            {marks && (
              <span className="max-w-48 text-end text-caption font-extrabold leading-relaxed text-gold-text md:max-w-none md:border-[1.5px] md:border-gold md:px-2 md:py-1">
                <MarkedText text="الحقول [للتأكيد] حتى يصل النموذج الحقيقي" />
              </span>
            )}
          </div>
          <form noValidate onSubmit={submit} aria-labelledby="mk-form" className="flex flex-col gap-4 px-4 py-5 md:grid md:grid-cols-2 md:gap-x-4 md:gap-y-5 md:px-6 md:py-6">
            <TextField id={ID.name} label="الاسم" placeholder="الاسم الكامل" autoComplete="name" aria-required value={draft.name} onChange={(e) => update({ name: e.target.value })} error={errors[ID.name]} wrapperClassName="md:order-1" />
            <TextField id={ID.phone} label="رقم الجوال (واتساب)" placeholder="05XXXXXXXX" type="tel" inputMode="tel" autoComplete="tel" ltr aria-required value={draft.phone} onChange={(e) => update({ phone: e.target.value })} error={errors[ID.phone]} wrapperClassName="md:order-2" />
            <TextField id="mk-fal" label="رقم رخصة فال إن وجدت" placeholder="اختياري، يرفع أولويتك" inputMode="numeric" value={draft.fal} onChange={(e) => update({ fal: e.target.value })} wrapperClassName="md:order-3" />
            <div className="md:order-5 md:col-span-2" id={ID.districts}>
              <DistrictMultiSelect districts={districts} value={draft.districts} onChange={(v) => update({ districts: v })} label="الأحياء التي تعرفها" placeholder="أضف حياً من القائمة" inlineList={false} />
            </div>
            <SelectField id="mk-years" label="سنوات الخبرة" options={YEARS.map((y) => ({ value: y, label: y }))} value={draft.years} onChange={(e) => update({ years: e.target.value })} wrapperClassName="md:order-4" />
            <TextField id="mk-social" label="حسابات التواصل" placeholder="إكس، إنستغرام، سناب: اسم المستخدم" value={draft.social} onChange={(e) => update({ social: e.target.value })} wrapperClassName="md:order-6" />
            <TextArea id="mk-bio" label="نبذة" placeholder="سطران: أين تسوّق وكيف" rows={3} value={draft.bio} onChange={(e) => update({ bio: e.target.value })} wrapperClassName="md:order-8 md:col-span-2" />
            <div className="md:order-7">
              <FileTile id="mk-cv" label="سيرة ذاتية (اختياري)" accept="application/pdf" prompt="PDF حتى 5 MB" file={draft.cv} onFile={(n) => update({ cv: n })} />
            </div>
            <div className="md:order-9 md:col-span-2">
              <Checkbox id={ID.consent} checked={draft.consent} onChange={(e) => update({ consent: e.target.checked })} error={errors[ID.consent]} label={<MarkedText text="أوافق على تواصل SMQ معي، وعلى شروط التسويق والعمولة [للتأكيد] عند قبولي." />} />
            </div>
            <div className="flex flex-col gap-3 md:order-10 md:col-span-2">
              <Button variant="secondary" type="submit" className="w-full md:w-auto md:self-start">
                أرسل الطلب
              </Button>
              <span className="text-caption font-normal leading-relaxed text-muted">بعد الإرسال: رقم طلب، ثم مقابلة قصيرة على واتساب أو اتصال خلال أسبوع. عند القبول تصلك صفحتك ورابطك.</span>
            </div>
          </form>
        </section>
      </Container>
    </Shell>
  );
}
