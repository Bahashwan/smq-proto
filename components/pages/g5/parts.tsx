"use client";
// Shared pieces of the G5 forms (أضف عقارك, انضم كمسوّق, تعاون معنا): the page shell with the boards' compact footers,
// the gold heroes, «كيف يسير الأمر», the step bars, the bordered form card, the summary bar, tile radios, the room
// counter, feature chips, the price field with the riyal sign, the WhatsApp card, single-file upload tiles and the
// back / next row. Tokens only: zero radius, no shadows, cuts and hexagons through clip-path, gold carries ink text.
import Link from "next/link";
import { useEffect, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Button, Container, ErrorText, Footer, Header, Radio, RiyalSign, WhatsAppIcon, type NavItem } from "@/components/ui";
import { cx, waLink } from "@/lib/format";
import { formatTyped, typedNumber } from "./draft";

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

export const ADD_FOOTER: NavItem[] = [
  { label: "العقارات", href: "/units" },
  { label: "دليل الأسعار", href: "/guide" },
  { label: "الخدمات", href: "/services" },
  { label: "من نحن", href: "/about" },
  { label: "تواصل معنا", href: "/contact" },
  { label: "الخصوصية", href: "/privacy" },
];
export const HUB_FOOTER: NavItem[] = [
  { label: "العقارات", href: "/units" },
  { label: "دليل الأسعار", href: "/guide" },
  { label: "الخدمات", href: "/services" },
  { label: "تعاون معنا", href: "/collaborate" },
  { label: "من نحن", href: "/about" },
  { label: "تواصل معنا", href: "/contact" },
];
export const MARKETER_FOOTER: NavItem[] = [
  { label: "تعاون معنا", href: "/collaborate" },
  { label: "التحالف", href: "/alliance" },
  { label: "أضف عقارك", href: "/add" },
  { label: "الخصوصية", href: "/privacy" },
];

/** Header (تعاون معنا active, as every G5 board draws it) + main + the compact footer with the board's links */
export function Shell({ children, footer = ADD_FOOTER, mainClassName }: { children: ReactNode; footer?: NavItem[]; mainClassName?: string }) {
  return (
    <>
      <Header active="/collaborate" />
      <main className={cx("pb-12 md:pb-20", mainClassName)}>{children}</main>
      <Footer compact links={footer} />
    </>
  );
}

/** true from md (768px); false on the server and before mount */
export function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desktop;
}

// ---------------------------------------------------------------------------
// Hexagons and icons
// ---------------------------------------------------------------------------

/** Flat hexagon with a number or an icon. `outline` = 1.5px ink ring (a ring hexagon under a paper fill). */
export function HexBadge({ children, tone = "ink", className }: { children?: ReactNode; tone?: "ink" | "gold" | "outline" | "outline-line"; className?: string }) {
  const ring = tone === "outline" || tone === "outline-line";
  return (
    <span
      aria-hidden
      className={cx(
        "relative inline-flex shrink-0 items-center justify-center hex-flat font-extrabold leading-none tnum",
        tone === "ink" ? "bg-ink text-paper" : tone === "gold" ? "bg-gold text-ink" : tone === "outline" ? "bg-ink text-ink" : "bg-line text-muted",
        className ?? "size-11 text-label",
      )}
    >
      {ring && <span className="absolute inset-[1.5px] hex-flat bg-paper" />}
      <span className="relative inline-flex items-center justify-center">{children}</span>
    </span>
  );
}

export function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cx("size-4 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square">
      <path d="M12 16V5M7 9.5 12 4.5l5 5M5 20h14" />
    </svg>
  );
}

/** «شقة» / «فيلا» / «فيلا روف» marks of the Add-Step1-M type tiles */
export function TypeMark({ type }: { type: string }) {
  if (type === "شقة") return <span aria-hidden className="inline-block size-3 border-2 border-current md:hidden" />;
  if (type === "فيلا") return <span aria-hidden className="inline-block h-2.5 w-3 bg-current [clip-path:polygon(0_100%,50%_0,100%_100%)] md:hidden" />;
  if (type === "فيلا روف") return <span aria-hidden className="inline-block size-3 bg-current hex-flat md:hidden" />;
  return null;
}

// ---------------------------------------------------------------------------
// Heroes
// ---------------------------------------------------------------------------

const HERO_CUT_PHONE = "[clip-path:polygon(0_0,100%_0,100%_100%,52px_100%,0_calc(100%-30px))]";
const HERO_CUT_DESKTOP = "md:[clip-path:polygon(0_0,100%_0,100%_100%,120px_100%,0_calc(100%-69px))]";

/** «خدمة مجانية للمُلّاك · تعاون معنا › أضف عقارك» */
function Eyebrow({ hub, crumb }: { hub?: boolean; crumb?: boolean }) {
  return (
    <span className="text-caption font-bold text-on-gold-muted md:text-label">
      خدمة مجانية للمُلّاك
      {hub && (
        <>
          {" · "}
          <Link href="/collaborate" className="text-on-gold-muted underline underline-offset-2 hover:text-ink">
            تعاون معنا
          </Link>
        </>
      )}
      {crumb && <span className="hidden md:inline"> › أضف عقارك</span>}
    </span>
  );
}

/** Phone hero of the add steps (Add-Step1-M / Add-Step2-M / Add-Step2-Building-M / Add-M) */
export function HeroPhone({ text, hub, className }: { text?: ReactNode; hub?: boolean; className?: string }) {
  return (
    <section className={cx("bg-gold text-ink md:hidden", HERO_CUT_PHONE, className)}>
      <Container className="flex flex-col gap-1.5 pb-11 pt-6">
        <Eyebrow hub={hub} />
        <h1 className="m-0 text-h1">أضف عقارك</h1>
        {text && <p className="m-0 text-label font-normal leading-relaxed text-on-gold-muted">{text}</p>}
      </Container>
    </section>
  );
}

/** Desktop hero of steps 2 and 3 (Add-Step2-D, Add-Step3-D): breadcrumb + h1 on the start side, the line opposite */
export function HeroDesktopFlow({ text }: { text: ReactNode }) {
  return (
    <section className={cx("hidden bg-gold text-ink md:block", HERO_CUT_DESKTOP)}>
      <Container className="grid grid-cols-2 items-center gap-10 pb-16 pt-9">
        <div className="flex flex-col gap-1">
          <Eyebrow hub crumb />
          <h1 className="m-0 text-h1">أضف عقارك</h1>
        </div>
        <p className="m-0 max-w-md justify-self-end text-body font-normal leading-relaxed text-on-gold-muted">{text}</p>
      </Container>
    </section>
  );
}

const HOW = [
  { t: "أدخل بيانات العقار", d: "النوع، الموقع، المساحة، السعر الذي تريده، وصور من جوالك." },
  { t: "نتواصل معك", d: "خلال 24 ساعة عمل، بتقييم أولي وسعر المتر في حيّك." },
  { t: "تصوير احترافي", d: "نرسل فريق تصوير لتوثيق عقارك، بلا تكلفة عليك." },
  { t: "نشر وتسويق", d: "نعرضه على منصتنا وقنواتنا، ونفرز المشترين قبل أن يصلوا إليك." },
];

/** «كيف يسير الأمر» · phone: titled list; desktop: the bordered box beside the gold hero (Add-D) */
export function HowItWorks({ variant }: { variant: "phone" | "desktop" }) {
  const phone = variant === "phone";
  return (
    <section aria-labelledby={`how-${variant}`} className={cx(phone ? "md:hidden" : "border-interactive")}>
      <h2 id={`how-${variant}`} className={cx("m-0 text-h3", phone ? "mb-3" : "sr-only")}>
        كيف يسير الأمر
      </h2>
      <ol className="m-0 flex list-none flex-col p-0">
        {HOW.map((s, i) => (
          <li key={s.t} className={cx("flex items-start gap-3.5", phone ? "py-3.5" : "px-6 py-4.5", i > 0 && "border-t border-line")}>
            <HexBadge tone={i === 0 ? "ink" : "outline"} className={phone ? "size-10 text-label" : "size-11 text-body"}>
              {i + 1}
            </HexBadge>
            <span className="flex flex-col gap-1 pt-0.5">
              <span className={cx("font-extrabold", phone ? "text-body" : "text-h3")}>{s.t}</span>
              <span className={cx("font-normal text-muted", phone ? "text-caption leading-relaxed" : "text-label")}>{s.d}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Desktop hero of step 1 (Add-D): the gold block with the WhatsApp button beside «كيف يسير الأمر» */
export function HeroDesktopIntro() {
  return (
    <Container className="hidden pt-12 md:block">
      <div className="grid grid-cols-2 items-stretch gap-8">
        <section className="flex flex-col items-start gap-2 bg-gold px-10 pb-24 pt-10 text-ink [clip-path:polygon(0_0,100%_0,100%_100%,64px_100%,0_calc(100%-37px))]">
          <Eyebrow />
          <h1 className="m-0 text-display">أضف عقارك</h1>
          <p className="m-0 max-w-xl text-body font-normal leading-relaxed text-on-gold-muted">نموذج من ثلاث خطوات يأخذ دقيقتين. بعدها نتواصل معك خلال 24 ساعة، نصور، وننشر لعملاء جاهزين.</p>
          <a href={waLink(WA_ADD)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-13 items-center gap-2.5 bg-ink px-5 text-label font-extrabold text-paper no-underline hover:bg-ink-2 motion-hover transition-colors">
            <WhatsAppIcon size={18} />
            تفضّل واتساب؟ أرسل الصك والصور مباشرة
          </a>
        </section>
        <HowItWorks variant="desktop" />
      </div>
    </Container>
  );
}

/** the boards' prefilled WhatsApp message on «تفضّل واتساب؟» */
export const WA_ADD = "أريد إضافة عقاري";

/** «تفضّل واتساب؟» bordered card with the gold hexagon */
export function WaCard({ text, className }: { text: string; className?: string }) {
  return (
    <a
      href={waLink(WA_ADD)}
      target="_blank"
      rel="noopener noreferrer"
      className={cx("flex items-center justify-between gap-4 border-interactive bg-paper px-4 py-4 text-ink no-underline hover:bg-sand motion-hover transition-colors md:px-5", className)}
    >
      <span className="flex flex-col gap-1">
        <span className="text-label font-extrabold">تفضّل واتساب؟</span>
        <span className="text-caption font-normal text-muted">{text}</span>
      </span>
      <HexBadge tone="gold" className="size-11">
        <WhatsAppIcon size={18} />
      </HexBadge>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

export const STEP_LABELS = ["النوع والموقع", "التفاصيل والسعر", "الصور وبياناتك"];
export const STEP_HREFS = ["/add", "/add/details", "/add/contact"];

/** The three bars of the phone boards and of Add-Step2-D / Add-Step3-D: done = ink + «✓» (a link back), current = gold */
export function StepBar({ current, query = "", className }: { current: 1 | 2 | 3; query?: string; className?: string }) {
  return (
    <ol aria-label="خطوات النموذج" className={cx("m-0 grid list-none grid-cols-3 gap-2 p-0", className)}>
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const on = n === current;
        const text = (
          <span className={cx("text-caption md:text-label", on ? "font-extrabold text-ink" : "font-bold text-muted")}>
            {label}
            {done && " ✓"}
          </span>
        );
        return (
          <li key={label} className="flex flex-col gap-2" aria-current={on ? "step" : undefined}>
            <span aria-hidden className={cx("h-1", done ? "bg-ink" : on ? "bg-gold" : "bg-slot")} />
            {done ? (
              <Link href={STEP_HREFS[i] + query} className="relative self-start no-underline after:absolute after:-inset-y-3 after:inset-x-0 after:content-[''] hover:underline">
                {text}
              </Link>
            ) : (
              text
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Desktop step list of Add-D (beside the form) with the autosave line */
export function StepListAside({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol aria-label="خطوات النموذج" className="m-0 hidden list-none flex-col self-start border-interactive p-0 md:flex">
      {STEP_LABELS.map((label, i) => {
        const on = i + 1 === current;
        return (
          <li key={label} aria-current={on ? "step" : undefined} className={cx("flex items-center gap-3 px-4 py-4", i > 0 && "border-t border-line", on ? "bg-ink text-paper" : "text-muted")}>
            <HexBadge tone={on ? "gold" : "outline-line"} className="size-7 text-caption">
              {i + 1}
            </HexBadge>
            <span className={cx("text-label", on ? "font-extrabold" : "font-bold")}>{label}</span>
          </li>
        );
      })}
      <li className="border-t-[1.5px] border-ink px-4 py-4 text-caption font-normal leading-relaxed text-muted">نحفظ تقدمك تلقائياً. تستطيع العودة لاحقاً من نفس الجهاز.</li>
    </ol>
  );
}

/** The bordered form section: «النوع والموقع» · «الخطوة 1 من 3» */
export function FormCard({ title, step, children, className, id }: { title: ReactNode; step: 1 | 2 | 3; children: ReactNode; className?: string; id?: string }) {
  const hid = useId();
  return (
    <section aria-labelledby={id ?? hid} className={cx("min-w-0 border-interactive bg-paper", className)}>
      <div className="flex items-center justify-between gap-3 border-b-[1.5px] border-ink px-4 py-4 md:px-6 md:py-5">
        <h2 id={id ?? hid} className="m-0 text-h3">
          {title}
        </h2>
        <span className="text-caption font-bold text-muted md:text-label">{`الخطوة ${step} من 3`}</span>
      </div>
      {children}
    </section>
  );
}

/** The sand summary line with «تعديل» */
export function SummaryBar({ strong, rest, price, editHref }: { strong: string; rest: string; price?: string; editHref: string }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-sand px-3.5 py-3 md:px-4">
      <p className="m-0 text-caption font-normal leading-relaxed text-ink md:text-label">
        <strong className="font-extrabold">{strong}</strong> · {rest}
        {price && (
          <>
            {" "}
            <strong className="font-extrabold tnum">{price}</strong>
          </>
        )}
      </p>
      <Link href={editHref} className="relative inline-flex h-8 shrink-0 items-center border-interactive bg-paper px-3 text-caption font-bold text-ink no-underline after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-[''] hover:bg-cream md:text-label">
        تعديل
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

/** Section label of the boards (13/700 ink) */
export const sectionLabel = "text-label font-bold text-ink";

/** Tile radios with the board's bold legend (the ui RadioGroup draws the 11px field label) */
export function TileGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  gridClassName = "grid grid-cols-3 gap-2",
  tileClassName = "h-12",
  legendClassName = sectionLabel,
  required,
  hint,
  className,
}: {
  legend: ReactNode;
  name: string;
  options: { value: T; label: ReactNode }[];
  value: T | null;
  onChange: (v: T) => void;
  gridClassName?: string;
  tileClassName?: string;
  legendClassName?: string;
  required?: boolean;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cx("m-0 flex min-w-0 flex-col gap-2.5 border-0 p-0", className)}>
      <legend className={cx("mb-2.5 p-0", legendClassName)}>
        {legend}
        {required && (
          <span className="text-gold-text" aria-hidden>
            {" "}
            *
          </span>
        )}
      </legend>
      <div className={gridClassName}>
        {options.map((o) => (
          <Radio key={o.value} name={name} value={o.value} label={o.label} checked={value === o.value} onChange={() => onChange(o.value)} className={tileClassName} />
        ))}
      </div>
      {hint}
    </fieldset>
  );
}

/** «−  3  +» counter of the boards (rooms, baths, units) */
export function Counter({ label, value, onChange, min = 0, max = 99, id }: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; id?: string }) {
  const auto = useId();
  const lid = id ?? `c-${auto}`;
  const btn = "inline-flex h-full items-center justify-center text-h3 font-extrabold text-ink hover:bg-sand disabled:text-disabled disabled:hover:bg-paper motion-hover transition-colors";
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span id={lid} className="text-caption font-semibold text-muted">
        {label}
      </span>
      <div role="group" aria-labelledby={lid} className="grid h-12 grid-cols-3 border-interactive bg-paper">
        <button type="button" aria-label="أقل" className={btn} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
          −
        </button>
        <output aria-live="polite" className="flex items-center justify-center border-x-[1.5px] border-ink text-body font-bold tnum text-muted">
          {value}
        </output>
        <button type="button" aria-label="أكثر" className={btn} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
          +
        </button>
      </div>
    </div>
  );
}

/** Feature chips with a checkbox («المميزات (اختر ما ينطبق)») */
export function CheckChips({ legend, note, options, value, onChange }: { legend: string; note?: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col border-0 p-0">
      <legend className={cx("mb-2.5 p-0", sectionLabel)}>
        {legend}
        {note && <span className="font-medium text-muted"> {note}</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <label
              key={o}
              className={cx(
                "inline-flex h-11 cursor-pointer items-center gap-2 border-interactive px-3 text-label font-bold text-ink motion-hover transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold",
                on ? "bg-sand" : "bg-paper hover:bg-cream",
              )}
            >
              <input type="checkbox" checked={on} onChange={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])} className="size-4 accent-ink" />
              {o}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Text field for an amount typed in digits (formats on blur); used for areas and money */
export function NumberInput({ value, onChange, className, ...rest }: { value: string; onChange: (v: string) => void } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return <input type="text" inputMode="numeric" autoComplete="off" value={value} onChange={(e) => onChange(typedNumber(e.target.value))} onBlur={() => onChange(formatTyped(value))} className={className} {...rest} />;
}

/** «السعر المطلوب (ريال)» · the big amount with the riyal sign cell at the line end */
export function MoneyField({ id, label, value, onChange, error, labelClassName = sectionLabel }: { id: string; label: string; value: string; onChange: (v: string) => void; error?: string; labelClassName?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className={cx(labelClassName, error && "text-gold-text")}>
        {label}
      </label>
      <div className={cx("flex h-14 items-stretch bg-paper", error ? "border-error bg-cream-focus" : "border-interactive has-[:focus]:border-gold has-[:focus]:bg-cream-focus")}>
        <NumberInput
          id={id}
          value={value}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-w-0 flex-1 bg-transparent px-3.5 text-h3 font-extrabold text-ink outline-none tnum"
        />
        <span className="flex w-11 shrink-0 items-center justify-center border-s-[1.5px] border-ink text-label text-muted md:w-12">
          <RiyalSign />
        </span>
      </div>
      {error && <ErrorText id={`${id}-error`}>{error}</ErrorText>}
    </div>
  );
}

/** One file chosen locally (the power of attorney, the brokerage contract, the CV): dashed tile → the file name */
export function FileTile({ id, label, accept, prompt, file, onFile, hint }: { id: string; label: ReactNode; accept: string; prompt: string; file: string; onFile: (name: string) => void; hint?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-caption font-semibold text-muted">
        {label}
      </label>
      {file ? (
        <div className="flex h-12 items-center justify-between gap-2 border-interactive bg-paper ps-3 text-label font-bold text-ink">
          <span className="truncate" dir="auto">
            {file}
          </span>
          <button type="button" onClick={() => onFile("")} aria-label={`إزالة ${file}`} className="inline-flex size-11 shrink-0 items-center justify-center text-h3 hover:bg-sand">
            ×
          </button>
        </div>
      ) : (
        <span className="relative flex h-12 cursor-pointer items-center justify-center gap-2 border-[1.5px] border-dashed border-ink bg-paper text-label font-bold text-ink hover:bg-cream has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold">
          <UploadIcon />
          {prompt}
          <input
            id={id}
            type="file"
            accept={accept}
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f.name);
              e.target.value = "";
            }}
          />
        </span>
      )}
      {hint}
    </div>
  );
}

/** «السابق» + the ink next button with the gold arrow */
export function NavRow({ back, next }: { back?: string; next: string }) {
  return (
    <div className="flex items-stretch gap-2.5">
      {back && (
        <Button variant="ghost" href={back} className="h-13 px-5">
          السابق
        </Button>
      )}
      <Button variant="secondary" type="submit" arrow className={cx(back ? "flex-1 md:flex-none" : "w-full md:w-auto")}>
        {next}
      </Button>
    </div>
  );
}
