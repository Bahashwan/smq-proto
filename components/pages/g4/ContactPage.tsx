"use client";
// /contact · Contact-M, Contact-D (the page with the three-field form «أو اترك رسالة») and Contact-Error-M (after an
// invalid submit the form opens as «اكتب لنا» with every field it needs: the summary takes focus, gold errors under
// the fields, the typed text kept in the session store). `?offline=1` (presenter) adds the connection-lost banner.
// Nothing is sent: a valid submit stores the message in memory and opens /contact/sent.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button, Checkbox, Container, ErrorSummary, Header, IconButton, RadioGroup, SelectField, SocialIcon, TextArea, TextField, WhatsAppIcon, useVisitorCode, EMAIL, HANDLE, PHONE_TEL, SOCIAL, StatusDot } from "@/components/ui";
import { MapEmbed } from "@/components/map";
import { settings, WA_TEMPLATES, fillTemplate } from "@/data/settings";
import { usePresenter } from "@/lib/presenter";
import { usePatch, useStore } from "@/lib/store";
import { useHasHydrated } from "@/lib/location";
import { cx, waLink } from "@/lib/format";
import { checkPhone, fieldsToFix } from "./lib";
import { FOOTER_LINKS, OutlineLink, PageFooter } from "./parts";

export type ReplyMethod = "whatsapp" | "call" | "email";
export type ContactDraft = {
  name: string;
  phone: string;
  message: string;
  method: ReplyMethod;
  subject: string;
  consent: boolean;
};
export type ContactSent = Omit<ContactDraft, "phone"> & {
  phoneDigits: string;
  at: string;
};
const EMPTY: ContactDraft = { name: "", phone: "", message: "", method: "whatsapp", subject: "unit", consent: false };
const METHODS: { value: ReplyMethod; label: string }[] = [
  { value: "whatsapp", label: "واتساب" },
  { value: "call", label: "اتصال" },
  { value: "email", label: "بريد" },
];
const SUBJECTS = [
  { value: "unit", label: "أبحث عن وحدة" },
  { value: "owner", label: "عندي عقار" },
  { value: "finance", label: "تمويل" },
  { value: "training", label: "تدريب" },
  { value: "other", label: "شيء آخر" },
];
const MESSAGE_MAX = 600;
const ID = { name: "contact-name", phone: "contact-phone", message: "contact-message", consent: "contact-consent" } as const;
type Field = keyof typeof ID;
type Problem = { summary: string; message: string };

/** Field checks in form order; the three-field form has no consent box (sending is the consent there). */
function check(d: ContactDraft, full: boolean): Partial<Record<Field, Problem>> {
  const out: Partial<Record<Field, Problem>> = {};
  if (!d.name.trim()) out.name = { summary: "الاسم مطلوب", message: "اكتب اسمك حتى نعرف بمن نتواصل." };
  const p = checkPhone(d.phone);
  if (!p.ok) out.phone = { summary: p.summary, message: p.message };
  if (!d.message.trim()) out.message = { summary: "الرسالة فارغة", message: "اكتب رسالتك في سطر أو أكثر." };
  if (full && !d.consent) out.consent = { summary: "الموافقة على التواصل مطلوبة", message: "علّم الموافقة حتى نستطيع الرد عليك." };
  return out;
}

export function ContactPage() {
  const router = useRouter();
  const { state } = usePresenter();
  const hydrated = useHasHydrated();
  const saved = usePatch<ContactDraft>("contact", "draft");
  const patch = useStore((s) => s.patch);
  const code = useVisitorCode();
  const [draft, setDraft] = useState<ContactDraft>(EMPTY);
  const [mode, setMode] = useState<"quick" | "full">("quick");
  const [attempt, setAttempt] = useState(0);
  const [summary, setSummary] = useState<{ id: string; label: string }[]>([]);
  const [offlineFail, setOfflineFail] = useState(false);
  const restored = useRef(false);

  // the typed text is never lost: restore the session draft once after hydration
  useEffect(() => {
    if (!hydrated || restored.current) return;
    restored.current = true;
    if (saved && (saved.name || saved.phone || saved.message)) setDraft({ ...EMPTY, ...saved });
  }, [hydrated, saved]);

  const update = <K extends keyof ContactDraft>(k: K, v: ContactDraft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    patch("contact", "draft", { [k]: v });
  };

  const isOffline = () => state.offline || (typeof navigator !== "undefined" && navigator.onLine === false);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const offline = isOffline();
    const problems = check(draft, mode === "full");
    if (Object.keys(problems).length || (mode === "quick" && offline)) {
      // open the full form: every field it needs, the summary on top
      const full = check(draft, true);
      setMode("full");
      setSummary((Object.keys(full) as Field[]).map((f) => ({ id: ID[f], label: full[f]!.summary })));
      setOfflineFail(offline);
      setAttempt((a) => a + 1);
      return;
    }
    if (offline) {
      setSummary([]);
      setOfflineFail(true);
      setAttempt((a) => a + 1);
      return;
    }
    const sent: ContactSent = { name: draft.name.trim(), message: draft.message.trim(), method: draft.method, subject: draft.subject, consent: draft.consent, phoneDigits: checkPhone(draft.phone).digits, at: new Date().toISOString() };
    patch("contact", "last", { ...sent });
    patch("contact", "draft", { ...EMPTY });
    router.push("/contact/sent");
  };

  // live field messages: a fixed field drops its message at once; the summary stays as of the last submit
  const live = attempt > 0 ? check(draft, mode === "full") : {};
  const err = (f: Field) => (summary.some((s) => s.id === ID[f]) ? live[f]?.message : undefined);
  const general = WA_TEMPLATES.find((t) => t.id === "general");
  const waGeneral = waLink(general ? fillTemplate(general.text, { code }) : undefined);
  const waDirect = waLink(draft.message.trim() || (general ? fillTemplate(general.text, { code }) : undefined));

  if (mode === "full") {
    return (
      <>
        <Header />
        <main className="pb-12 pt-6 md:pb-16 md:pt-12">
          <Container className="md:max-w-xl">
            <h1 className="m-0 text-h1 font-extrabold">اكتب لنا</h1>
            <p className="m-0 mt-1.5 text-label font-normal text-muted">نرد خلال ساعات العمل. الحقول بالذهبي تحتاج تصحيحاً.</p>
            <form noValidate onSubmit={submit} className="mt-3.5 flex flex-col gap-3.5" aria-label="اكتب لنا">
              {summary.length > 0 && <ErrorSummary key={attempt} title={`لم تُرسل الرسالة. ${fieldsToFix(summary.length)}:`} errors={summary} />}
              <TextField id={ID.name} label="الاسم" autoComplete="name" value={draft.name} onChange={(e) => update("name", e.target.value)} error={err("name")} />
              <TextField id={ID.phone} label="رقم الجوال" type="tel" inputMode="numeric" autoComplete="tel" ltr placeholder="05XXXXXXXX" value={draft.phone} onChange={(e) => update("phone", e.target.value)} error={err("phone")} />
              <RadioGroup name="contact-method" label="طريقة الرد" options={METHODS} value={draft.method} onChange={(v) => update("method", v)} />
              <SelectField id="contact-subject" label="الموضوع" options={SUBJECTS} value={draft.subject} onChange={(e) => update("subject", e.target.value)} />
              <TextArea id={ID.message} label="رسالتك" rows={4} maxLength={MESSAGE_MAX} counterPlacement="below" value={draft.message} onChange={(e) => update("message", e.target.value)} error={err("message")} />
              <Checkbox
                id={ID.consent}
                framed
                checked={draft.consent}
                onChange={(e) => update("consent", e.target.checked)}
                error={err("consent")}
                label={
                  <span className="flex items-start justify-between gap-3">
                    <span>أوافق على أن تتواصل SMQ معي بخصوص رسالتي.</span>
                    <Link href="/privacy" className="shrink-0 font-semibold text-gold-text underline underline-offset-4 hover:text-ink">
                      سياسة الخصوصية
                    </Link>
                  </span>
                }
              />
              {offlineFail && (
                <div role="alert" className="flex items-center justify-between gap-3 border-error px-3.5 py-3 text-caption font-normal md:text-label md:font-normal">
                  <span className="flex items-center gap-2">
                    <StatusDot tone="gold" size={2} />
                    <span>
                      <strong className="block font-extrabold">تعذّر الإرسال، انقطع الاتصال.</strong>
                      رسالتك محفوظة في هذه الصفحة.
                    </span>
                  </span>
                  <button type="button" onClick={() => submit()} className="inline-flex min-h-11 shrink-0 items-center border-interactive bg-paper px-3 text-caption font-extrabold text-ink hover:bg-sand motion-hover transition-colors">
                    أعد المحاولة
                  </button>
                </div>
              )}
              <Button type="submit" id="contact-submit" variant="secondary" size="l" full>
                أرسل الرسالة
              </Button>
              <OutlineLink href={waDirect} external className="min-h-12 text-body">
                أو أرسلها على واتساب مباشرة
              </OutlineLink>
            </form>
          </Container>
        </main>
        <PageFooter links={FOOTER_LINKS.contact} />
      </>
    );
  }

  const [street, ...rest] = settings.office.addressAr.split("، ");
  const area = rest.join("، ");
  const district = rest[0] ?? "";
  const h = settings.hours;

  return (
    <>
      <Header />
      <main className="pb-9 md:pb-16">
        <Container className="pt-6 md:pt-12">
          <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:items-start md:gap-10">
            {/* details */}
            <section aria-labelledby="contact-title" className="flex min-w-0 flex-col gap-3 md:gap-4">
              <div className="flex flex-col gap-3 md:gap-4">
                <span className="text-caption font-bold text-gold-text md:text-label">تواصل معنا</span>
                <h1 id="contact-title" className="m-0 text-h1 font-extrabold">
                  أسرع طريق: واتساب
                </h1>
                <p className="m-0 text-label font-normal leading-relaxed text-muted md:text-body">
                  نرد خلال ساعات العمل، {h.days} من {h.from} إلى {h.to}. خارجها تصلك رسالة تلقائية ونعود إليك أول الدوام.
                </p>
              </div>
              <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="flex min-h-15 items-center justify-between gap-3 bg-gold px-5 text-ink no-underline cut-m hover:bg-gold-hover motion-hover transition-colors md:min-h-16">
                <span className="inline-flex items-center gap-2.5 text-h3 font-extrabold">
                  <WhatsAppIcon size={22} />
                  واتساب
                </span>
                <span dir="ltr" className="text-body font-extrabold tnum md:text-h3">
                  {settings.whatsappDisplay}
                </span>
              </a>
              <div className="grid grid-cols-2 gap-2 md:gap-2.5">
                <ContactCell href={PHONE_TEL} label="اتصال" value={settings.phone} />
                <ContactCell href={`mailto:${EMAIL}`} label="البريد" value={EMAIL} small />
              </div>
              <div className="mt-3 flex flex-col border-t-[1.5px] border-ink text-label font-normal md:mt-2 md:text-body">
                <InfoRow className="order-1" label="ساعات العمل">
                  {h.days}
                  <br className="md:hidden" />
                  <span className="hidden md:inline">، </span>
                  {h.from} إلى {h.to}
                </InfoRow>
                <InfoRow className="order-2 md:order-3" label="العنوان">
                  {street}
                  <br className="md:hidden" />
                  <span className="hidden md:inline">، </span>
                  {area}
                </InfoRow>
                <InfoRow className="order-3 md:order-2" label="الجمعة">
                  {settings.fridayAr}
                </InfoRow>
              </div>
              <Socials className="hidden md:flex" />
            </section>

            {/* phone: the office map comes before the form */}
            <section aria-label={`المكتب · ${district}`} className="flex flex-col gap-2 md:hidden">
              <MapEmbed lat={settings.office.lat} lng={settings.office.lng} title="خريطة Google بموقع مكتب SMQ" placeholder="office" forceEmbedUrl={settings.office.embedUrlAr} />
              <OutlineLink href={settings.office.mapsLink} external className="min-h-12 w-full">
                افتح الاتجاهات في الخرائط
              </OutlineLink>
            </section>

            {/* the three-field form */}
            <form noValidate onSubmit={submit} aria-labelledby="contact-form-title" className="border-interactive max-md:mt-2">
              <div className="flex flex-col gap-0.5 border-b-[1.5px] border-ink px-4 py-3.5 md:px-6 md:py-4.5">
                <h2 id="contact-form-title" className="m-0 text-h3 font-extrabold">
                  أو اترك رسالة
                </h2>
                <span className="text-caption font-normal text-muted md:text-label md:font-normal">ثلاثة حقول فقط، ونرد على واتساب.</span>
              </div>
              <div className="flex flex-col gap-3 p-4 md:gap-3.5 md:p-6">
                <TextField id={ID.name} label="الاسم" autoComplete="name" value={draft.name} onChange={(e) => update("name", e.target.value)} />
                <TextField id={ID.phone} label="رقم الجوال (واتساب)" type="tel" inputMode="numeric" autoComplete="tel" ltr placeholder="05XXXXXXXX" value={draft.phone} onChange={(e) => update("phone", e.target.value)} />
                <TextArea id={ID.message} label="رسالتك" rows={5} maxLength={MESSAGE_MAX} counter={false} className="md:min-h-48" placeholder="مثال: أبحث عن شقة 3 غرف في الروضة حتى 700 ألف" value={draft.message} onChange={(e) => update("message", e.target.value)} />
                <Button type="submit" id="contact-submit" variant="secondary" size="l" arrow full>
                  أرسل الرسالة
                </Button>
              </div>
            </form>
          </div>

          <Socials className="mt-6 md:hidden" label />

          {/* desktop: the office map */}
          <section aria-labelledby="office-title" className="mt-14 hidden flex-col gap-4 md:flex">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="office-title" className="m-0 text-h2 font-extrabold">
                المكتب · {district}
              </h2>
              <a href={settings.office.mapsLink} target="_blank" rel="noopener noreferrer" className="text-label font-bold text-gold-text no-underline hover:text-ink hover:underline">
                افتح الاتجاهات في الخرائط
              </a>
            </div>
            <MapEmbed lat={settings.office.lat} lng={settings.office.lng} title="خريطة Google بموقع مكتب SMQ" placeholder="office" forceEmbedUrl={settings.office.embedUrlAr} />
          </section>
        </Container>
      </main>
      <PageFooter links={FOOTER_LINKS.contact} />
    </>
  );
}

function ContactCell({ href, label, value, small }: { href: string; label: string; value: string; small?: boolean }) {
  return (
    <a href={href} className="flex min-h-15 flex-col justify-center gap-0.5 border-interactive px-3.5 py-2.5 text-ink no-underline hover:bg-sand motion-hover transition-colors md:min-h-16 md:px-4">
      <span className="text-caption font-normal text-muted">{label}</span>
      <span dir="ltr" className={cx("text-end font-extrabold tnum", small ? "text-label md:text-body" : "text-body md:text-h3")}>
        {value}
      </span>
    </a>
  );
}

function InfoRow({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx("flex items-start justify-between gap-3 border-b border-line py-3 md:gap-4 md:py-3.5", className)}>
      <span className="shrink-0 text-muted">{label}</span>
      <span className="min-w-0 text-end font-bold">{children}</span>
    </div>
  );
}

/** Contact-M/D list the networks with Snapchat before X (the footer boards keep the shared order). */
const SOCIAL_ORDER = ["instagram", "tiktok", "snapchat", "x", "youtube"];
const CONTACT_SOCIAL = [...SOCIAL].sort((a, b) => SOCIAL_ORDER.indexOf(a.id) - SOCIAL_ORDER.indexOf(b.id));

function Socials({ className, label }: { className?: string; label?: boolean }) {
  return (
    <div className={cx("flex flex-wrap items-center gap-2.5", label ? "flex-col items-start" : "md:mt-1", className)}>
      <span className="text-caption font-bold text-muted">
        {label && "تابعنا "}
        <span dir="ltr">{HANDLE}</span>
      </span>
      <div className="flex items-center gap-2 md:gap-2.5">
        {CONTACT_SOCIAL.map((s) => (
          <IconButton key={s.id} label={s.label} href={s.href} tone="ghost-paper" size={44}>
            <SocialIcon id={s.id} />
          </IconButton>
        ))}
      </div>
    </div>
  );
}
