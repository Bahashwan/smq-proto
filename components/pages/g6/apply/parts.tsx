"use client";
// Shared pieces of the application flow (AllianceApply-Step1/2/3, Success, Status): the page shell, the form card
// with its step line, check tiles, the offers counter, the charter sheet.
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { allianceSettings } from "@/data";
import { ArrowIcon, BottomSheet, Header, MarkedText } from "@/components/ui";
import { Tbc } from "@/components/alliance";
import { cx } from "@/lib/format";
import { AllianceBand, ShortFooter } from "../chrome";

/** The flow boards' header: logo and WhatsApp prefilled with «التحالف» (the status page sends the application id), no menu button. */
export function ApplyShell({ band = "طلب الانضمام", bandD = "طلب الانضمام إلى تحالف مكاتب جدة العقارية", children, aside, wide, footer = true, waText = "التحالف" }: { band?: string; bandD?: string; children: ReactNode; aside?: ReactNode; wide?: boolean; footer?: boolean; waText?: string }) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream text-ink">
      <AllianceBand text={`مبادرة من SMQ · ${band}`} textD={`مبادرة من SMQ · ${bandD}`} link={{ label: "عن التحالف ←", href: "/alliance" }} />
      <Header active="/collaborate" waText={waText} menu={false} />
      <main className="flex-1">
        <div className={cx("container-smq pt-6 pb-7 md:pt-8 md:pb-16", aside ? "md:grid md:grid-cols-[minmax(0,1fr)_300px] md:items-start md:gap-8 lg:grid-cols-[minmax(0,1fr)_360px]" : wide ? "" : "md:max-w-[760px]")}>
          <div className="min-w-0">{children}</div>
          {aside && <aside className="mt-6 flex flex-col gap-4 md:sticky md:top-20 md:mt-0">{aside}</aside>}
        </div>
      </main>
      {footer && <ShortFooter />}
    </div>
  );
}

const STEP_TITLES = ["المكتب ومقدم الطلب", "التغطية والتخصص", "ما عندكم وما تحتاجون"];
const DONE_SHORT = ["المكتب", "التغطية"];

/** The bordered form card: «h2 · الخطوة n من 3», the three-part step line, then the form. */
export function FormCard({ step, children, h1 }: { step: 1 | 2 | 3; children: ReactNode; h1?: boolean }) {
  const Title = h1 ? "h1" : "h2";
  return (
    <section className="bg-paper border-interactive">
      <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-6 md:py-5" style={{ borderBottom: "1.5px solid var(--smq-ink)" }}>
        <Title className="text-[16px] font-extrabold md:text-[20px]">{STEP_TITLES[step - 1]}</Title>
        <span className="shrink-0 text-[12px] font-bold text-muted md:text-[13px]">الخطوة {step} من 3</span>
      </div>
      <ol aria-label="خطوات النموذج" className="grid grid-cols-3 gap-1.5 px-4 pt-3 md:gap-2 md:px-6">
        {STEP_TITLES.map((t, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "now" : "next";
          return (
            <li key={t} className="flex flex-col gap-2" aria-current={state === "now" ? "step" : undefined}>
              <span className={cx("block h-1", state === "done" ? "bg-ink" : state === "now" ? "bg-gold" : "bg-slot")} />
              <span className={cx("text-[11px] leading-snug md:text-[12px]", state === "now" ? "font-extrabold text-ink" : "font-bold text-muted")}>
                {state === "done" ? (
                  <>
                    <span className="md:hidden">{DONE_SHORT[i]} ✓</span>
                    <span className="hidden md:inline">{t} ✓</span>
                  </>
                ) : (
                  t
                )}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-col gap-5 px-4 pt-5 pb-5 md:px-6 md:pb-6">{children}</div>
    </section>
  );
}

/** A labelled group heading in the forms' label style (11–12px muted, gold mark when required). */
export function GroupLabel({ children, required, note, id }: { children: ReactNode; required?: boolean; note?: ReactNode; id?: string }) {
  return (
    <span id={id} className="flex flex-col gap-0.5 text-caption font-semibold text-muted md:text-[12px]">
      <span>
        {children}
        {required && (
          <span className="ms-1 text-gold-text" aria-hidden>
            *
          </span>
        )}
      </span>
      {note && <span className="font-semibold">{note}</span>}
    </span>
  );
}

/** Bordered checkbox tile; checked = ink with the box in gold. */
export function CheckTile({ label, checked, onChange, name }: { label: string; checked: boolean; onChange: (v: boolean) => void; name?: string }) {
  return (
    <label className={cx("inline-flex h-10 cursor-pointer items-center gap-1.5 px-3 text-[13px] font-bold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-gold md:h-[42px] md:px-3.5", checked ? "bg-ink text-paper" : "bg-paper text-ink")} style={{ border: "1.5px solid var(--smq-ink)" }}>
      <input type="checkbox" name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} className={cx("m-0 size-4 shrink-0", checked ? "accent-gold" : "accent-ink")} />
      {label}
    </label>
  );
}

/** − n + counter (Step 3 offers). */
export function Counter({ label, value, onChange, max = 999 }: { label: string; value: number; onChange: (n: number) => void; max?: number }) {
  return (
    <div className="flex flex-col justify-between gap-2">
      <span className="text-caption font-semibold leading-snug text-muted md:text-[12px]">{label}</span>
      <div className="grid h-12 grid-cols-[44px_1fr_44px]" role="group" aria-label={label}>
        <button type="button" aria-label="أقل" disabled={value <= 0} onClick={() => onChange(Math.max(0, value - 1))} className="flex items-center justify-center bg-paper text-[20px] font-extrabold disabled:text-disabled" style={{ border: "1.5px solid var(--smq-ink)" }}>
          −
        </button>
        <span className="flex items-center justify-center bg-paper text-[18px] font-extrabold tnum" style={{ borderBlock: "1.5px solid var(--smq-ink)" }} aria-live="polite">
          {value}
        </span>
        <button type="button" aria-label="أكثر" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className="flex items-center justify-center bg-paper text-[20px] font-extrabold disabled:text-disabled" style={{ border: "1.5px solid var(--smq-ink)" }}>
          +
        </button>
      </div>
    </div>
  );
}

/** «السابق» (outlined) next to the step's main button. */
export function StepNav({ back, children }: { back?: string; children: ReactNode }) {
  return (
    <div className="flex items-stretch gap-2.5 pt-1">
      {back && (
        <Link href={back} className="inline-flex min-h-[52px] shrink-0 items-center justify-center bg-paper px-5 text-[14px] font-bold text-ink no-underline hover:bg-sand" style={{ border: "1.5px solid var(--smq-ink)" }}>
          السابق
        </Link>
      )}
      {children}
    </div>
  );
}

/** The full charter text in a sheet (the boards' «الميثاق الكامل» / «النص الكامل»). */
export function CharterSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const c = allianceSettings.charter;
  return (
    <BottomSheet open={open} onClose={onClose} title={`ميثاق التحالف · النسخة ${c.version}`} desktop="dialog">
      <div className="flex flex-col gap-3 pb-2 text-[14px] leading-loose">
        <Tbc />
        {c.fullText
          .replace(/^\[[^\]]*\]\s*/, "")
          .split(/\s(?=\d+\.\s)/)
          .map((p) => (
            <p key={p.slice(0, 16)}>
              <MarkedText text={p} />
            </p>
          ))}
        <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center justify-center self-start px-4 text-[13px] font-bold hover:bg-sand" style={{ border: "1.5px solid var(--smq-ink)" }}>
          حفظ PDF
        </button>
      </div>
    </BottomSheet>
  );
}

export function useSheet(): [boolean, () => void, () => void] {
  const [open, setOpen] = useState(false);
  return [open, () => setOpen(true), () => setOpen(false)];
}

/** The step's main button: ink («التالي: …») or gold («أرسل طلب الانضمام»), the 60° corner, the arrow at the line end. */
export function MainButton({ children, tone = "ink", type = "submit", onClick, className }: { children: ReactNode; tone?: "ink" | "gold"; type?: "submit" | "button"; onClick?: () => void; className?: string }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-[52px] flex-1 items-center justify-center gap-2.5 px-4 py-2 text-[15px] font-extrabold leading-snug cut-m motion-hover transition-colors md:flex-none md:px-8",
        tone === "ink" ? "bg-ink text-paper hover:bg-ink-2" : "bg-gold text-ink hover:bg-gold-hover",
        className,
      )}
    >
      <span>{children}</span>
      <ArrowIcon size={18} className={cx("shrink-0", tone === "ink" ? "text-gold" : "text-ink")} />
    </button>
  );
}
