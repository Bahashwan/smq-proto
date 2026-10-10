"use client";
// /add/contact · step 3 «الصور وبياناتك» (Add-M at 390, Add-Step3-D at 1440): photos with local previews, the role with
// its attachment (وكيل → صورة الوكالة الشرعية; مسوّق → رخصة فال + عقد الوساطة), name, phone, email, timing and the
// consent. An invalid submit shows the designed gold errors (the incomplete phone number) and focuses the first field;
// a valid one stores the submission in the session and opens /add/sent with the request number.
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Checkbox, Container, TextField } from "@/components/ui";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { FIELD, ROLES, TIMING, checkStep3, focusFirst, isBuilding, sentFromDraft, step2Summary, useAddDraft, type AddDraft, type Errors, type Role } from "./draft";
import { Photos } from "./Photos";
import { FileTile, FormCard, HeroDesktopFlow, HeroPhone, HowItWorks, NavRow, Shell, StepBar, SummaryBar, TileGroup, WaCard, sectionLabel } from "./parts";

const star = (
  <span className="text-gold-text" aria-hidden>
    *
  </span>
);

/** The role-dependent attachment block (gold rule at the line end) or the general note */
function RoleExtra({ d, update }: { d: AddDraft; update: (p: Partial<AddDraft>) => void }) {
  if (d.role !== "agent" && d.role !== "marketer") {
    return <span className="text-caption font-normal leading-relaxed text-muted">المالك: الصك في الخطوة 2. الوكيل: صورة الوكالة. المسوّق: رقم رخصة فال وعقد وساطة موثّق.</span>;
  }
  return (
    <div className="relative mt-1 flex flex-col gap-3 border-interactive bg-cream p-3 ps-4 md:grid md:grid-cols-2 md:gap-4 md:p-4 md:ps-5">
      <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-gold" />
      {d.role === "agent" ? (
        <>
          <FileTile id="add-poa" label="صورة الوكالة الشرعية" accept="application/pdf,image/jpeg,image/png" prompt="ارفع PDF أو صورة" file={d.poaFile} onFile={(n) => update({ poaFile: n })} />
          <TextField id="add-poa-no" label="رقم الوكالة (اختياري)" placeholder="من ناجز" value={d.poaNo} onChange={(e) => update({ poaNo: e.target.value })} />
          <span className="text-caption font-normal leading-relaxed text-muted md:col-span-2">المالك يرفق الصك في الخطوة 2. المسوّق يرفق رقم رخصة فال وعقد وساطة موثّقاً.</span>
        </>
      ) : (
        <>
          <TextField id="add-fal" label="رقم رخصة فال" inputMode="numeric" value={d.falNo} onChange={(e) => update({ falNo: e.target.value })} />
          <FileTile id="add-contract" label="عقد الوساطة الموثّق" accept="application/pdf,image/jpeg,image/png" prompt="ارفع PDF أو صورة" file={d.contractFile} onFile={(n) => update({ contractFile: n })} />
          <span className="text-caption font-normal leading-relaxed text-muted md:col-span-2">المالك يرفق الصك في الخطوة 2. الوكيل يرفق صورة الوكالة.</span>
        </>
      )}
    </div>
  );
}

export function AddStep3() {
  const router = useRouter();
  const patch = useStore((s) => s.patch);
  const { draft, update } = useAddDraft();
  const [tried, setTried] = useState(false);
  const errors: Errors = tried ? checkStep3(draft) : {};
  const building = isBuilding(draft.type);
  const query = building ? "?type=building" : "";
  const summary = step2Summary(draft);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = checkStep3(draft);
    setTried(true);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => focusFirst(found));
      return;
    }
    const sent = sentFromDraft(draft);
    patch("add", "sent", { ...sent, fresh: true });
    router.push(`/add/sent?no=${sent.no}`);
  };

  return (
    <Shell>
      <HeroPhone text="نموذج من ثلاث خطوات يأخذ دقيقتين. بعدها نتواصل معك خلال 24 ساعة، نصور، وننشر لعملاء جاهزين." textClassName="text-body" />
      <Container className="mt-7 md:hidden">
        <HowItWorks variant="phone" />
      </Container>
      <Container className="mt-6 md:hidden">
        <WaCard text="أرسل الصك والصور والسعر مباشرة ونكمل الباقي." />
      </Container>
      <HeroDesktopFlow text="الخطوة الأخيرة. بعد الإرسال يظهر رقم الطلب هنا وفي رسالة واتساب." />

      <Container className="mt-7 md:mt-8 md:grid md:grid-cols-[minmax(0,1fr)_340px] md:items-start md:gap-8">
        <form noValidate onSubmit={submit} aria-label="أضف عقارك · الصور وبياناتك">
          <FormCard
            step={3}
            title={
              <>
                <span className="md:hidden">بيانات العقار</span>
                <span className="hidden md:inline">الصور وبياناتك</span>
              </>
            }
          >
            <div className="flex flex-col gap-6 px-4 pb-5 pt-3.5 md:px-6 md:pb-6">
              <StepBar current={3} query={query} />
              <SummaryBar strong={summary.strong} rest={summary.rest} price={summary.price} editHref={`/add/details${query}`} />
              <Photos photos={draft.photos} onChange={(photos) => update({ photos })} />

              <TileGroup<Role>
                legend="صفتك في العرض"
                required
                name="add-role"
                options={ROLES}
                value={draft.role}
                onChange={(role) => update({ role })}
                gridClassName="grid grid-cols-4 gap-2"
                legendClassName="text-label font-bold text-ink md:font-extrabold"
                hint={<RoleExtra d={draft} update={update} />}
              />

              <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
                <legend className={`mb-3 p-0 md:sr-only ${sectionLabel}`}>بياناتك</legend>
                <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-x-4 md:gap-y-4">
                  <TextField
                    id={FIELD.name}
                    label={<>الاسم الكامل {star}</>}
                    aria-required
                    autoComplete="name"
                    value={draft.name}
                    onChange={(e) => update({ name: e.target.value })}
                    error={errors[FIELD.name]}
                  />
                  <TextField
                    id={FIELD.phone}
                    label={<>رقم الجوال (واتساب) {star}</>}
                    aria-required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    ltr
                    placeholder="05XXXXXXXX"
                    value={draft.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    error={errors[FIELD.phone]}
                    hint={<span className="font-normal text-gold-text md:hidden">سنرسل عليه رسالة تأكيد. الرقم مطلوب.</span>}
                  />
                  <TextField id={FIELD.email} label="البريد الإلكتروني (اختياري)" type="email" autoComplete="email" ltr value={draft.email} onChange={(e) => update({ email: e.target.value })} error={errors[FIELD.email]} />
                  <TileGroup
                    legend="التوقيت المناسب للتواصل"
                    name="add-timing"
                    options={TIMING.map((t) => ({ value: t, label: t }))}
                    value={draft.timing}
                    onChange={(t) => update({ timing: t })}
                    legendClassName="text-caption font-semibold text-muted"
                    gridClassName="grid grid-cols-3 gap-2"
                    className="gap-0"
                  />
                </div>
              </fieldset>

              <Checkbox
                id={FIELD.consent}
                checked={draft.consent}
                onChange={(e) => update({ consent: e.target.checked })}
                error={errors[FIELD.consent]}
                label={
                  <span className="font-normal text-muted md:text-ink-2">
                    <span className="md:hidden">أوافق على تواصل SMQ معي بخصوص هذا العقار، وأقر أني المالك أو مفوّض عنه.</span>
                    <span className="hidden md:inline">أوافق على تواصل SMQ معي بخصوص هذا العقار، وأقر أني المالك أو مفوّض عنه، وأن المعلومات صحيحة.</span>{" "}
                    <Link href="/privacy" className="text-gold-text underline underline-offset-2 hover:text-ink">
                      سياسة الخصوصية
                    </Link>
                  </span>
                }
              />
              <NavRow back={`/add/details${query}`} next="أرسل الطلب" />
            </div>
          </FormCard>
        </form>
        <aside className="hidden flex-col gap-4 md:sticky md:top-20 md:flex">
          <div className="flex flex-col gap-2.5 border-interactive px-5 py-5 text-label font-normal">
            <span className="text-caption font-extrabold">ماذا يحدث بعد الإرسال</span>
            <span>1 · رقم طلب فوري ورسالة واتساب بنفس الرقم</span>
            <span>2 · مراجعة الصك أو الوكالة خلال 24 ساعة عمل</span>
            <span>3 · موعد تصوير بلا تكلفة</span>
            <span>4 · نشر بوسم «من مالك» وبسعر معلن</span>
          </div>
          <div className="flex flex-col gap-1.5 bg-sand px-5 py-5 text-caption font-normal leading-relaxed text-ink-2">
            <span className="font-extrabold text-ink">رقمك لا يظهر على الموقع</span>
            <span>يصل فقط لفريق SMQ. المشترون يراسلوننا نحن، ونعرّفكم ببعض بعد الفرز.</span>
          </div>
        </aside>
      </Container>
      <Container className="mt-4 md:hidden">
        <p className="m-0 text-caption font-normal leading-relaxed text-muted">بعد الإرسال تظهر شاشة تأكيد برقم الطلب، ورسالة واتساب تلقائية بنفس الرقم خلال دقائق.</p>
      </Container>
    </Shell>
  );
}
