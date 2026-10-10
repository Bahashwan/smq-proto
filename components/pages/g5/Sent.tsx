"use client";
// The Add-Success pattern (Add-Success-M, Add-Success-D), shared by /add/sent and /marketers/sent: the gold hexagon
// with the check, «وصلنا طلبك», the ink request-number block with «نسخ» (clipboard), the three next steps, the gold
// WhatsApp button prefilled with the number, «العودة إلى الرئيسية», and on desktop the «ملخص ما أرسلت» box.
import { useState, type ReactNode } from "react";
import { Button, CheckIcon, Container } from "@/components/ui";
import { cx } from "@/lib/format";
import { HexBadge } from "./parts";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** «رقم الطلب · احفظه للمتابعة» + the number + «نسخ» */
export function NumberBlock({ no, line }: { no: string; line: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (await copyText(no)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <div className="flex flex-col gap-2 bg-ink px-5 py-5 text-paper cut-l md:px-6.5 md:py-6">
      <span className="text-caption font-bold text-on-ink-muted md:text-label">رقم الطلب · احفظه للمتابعة</span>
      <div className="flex items-center justify-between gap-3">
        <span className="text-h1 font-extrabold leading-none tnum" dir="ltr">
          {no}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "نُسخ الرقم" : `نسخ الرقم ${no}`}
          className="inline-flex h-11 min-w-14 shrink-0 items-center justify-center border-[1.5px] border-paper px-3 text-caption font-extrabold text-paper hover:bg-ink-2 md:text-label"
        >
          <span aria-live="polite">{copied ? "نُسخ" : "نسخ"}</span>
        </button>
      </div>
      <span className="text-caption font-normal leading-relaxed text-on-ink-muted md:text-label">{line}</span>
    </div>
  );
}

export interface SentStep {
  title: string;
  phone: ReactNode; // «الطلب عند فريق المراجعة. لا يظهر على الموقع بعد.»
  desktop: ReactNode; // «عند فريق المراجعة. لا يظهر على الموقع بعد.»
}

/** Phone: a numbered list with «الآن:» in bold; desktop: three bordered boxes */
export function SentSteps({ steps }: { steps: SentStep[] }) {
  return (
    <ol className="m-0 flex list-none flex-col p-0 md:grid md:grid-cols-3 md:gap-3.5">
      {steps.map((s, i) => (
        <li key={s.title} className={cx("flex items-start gap-3 py-3.5 md:flex-col md:gap-2 md:px-4 md:py-4", i > 0 && "max-md:border-t max-md:border-line", i === 0 ? "md:border-interactive" : "md:border md:border-line")}>
          <HexBadge tone={i === 0 ? "gold" : "outline"} className="mt-0.5 size-7 text-caption md:mt-0">
            {i + 1}
          </HexBadge>
          <span className="text-label font-normal leading-relaxed md:hidden">
            <strong className="font-extrabold">{`${s.title}:`}</strong> {s.phone}
          </span>
          <span className="hidden flex-col gap-1 md:flex">
            <span className="text-label font-extrabold">{s.title}</span>
            <span className="text-caption font-normal leading-relaxed text-muted">{s.desktop}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** «ملخص ما أرسلت» (desktop) */
export function SentSummary({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <section aria-labelledby="sent-summary" className="hidden flex-col gap-2 border-interactive px-4.5 py-4 text-label font-normal leading-relaxed md:flex">
      <h2 id="sent-summary" className="m-0 text-caption font-extrabold">
        ملخص ما أرسلت
      </h2>
      <dl className="m-0 flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-4">
            <dt className="shrink-0 text-muted">{r.label}</dt>
            <dd className="m-0 text-end tnum">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** The page body: intro, the number (phone: under the intro; desktop: the aside), steps, actions */
export function SentLayout({ text, number, steps, actions, summary }: { text: ReactNode; number: ReactNode; steps: ReactNode; actions: ReactNode; summary?: ReactNode }) {
  return (
    <Container className="pt-8 md:pt-14">
      <div className="flex flex-col gap-6 md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-x-12 md:gap-y-6">
        <div className="order-1 flex flex-col items-start gap-3 md:col-start-1 md:row-start-1 md:gap-5.5">
          <HexBadge tone="gold" className="size-14 md:size-16">
            <CheckIcon size={26} />
          </HexBadge>
          <h1 className="m-0 mt-1 text-h1 md:mt-0">وصلنا طلبك</h1>
          <p className="m-0 text-body font-normal leading-relaxed text-ink-2 md:max-w-130">{text}</p>
        </div>
        <div className="order-2 flex flex-col gap-4 md:col-start-2 md:row-span-3 md:row-start-1">
          {number}
          {summary}
        </div>
        <div className="order-3 md:col-start-1 md:row-start-2">{steps}</div>
        <div className="order-4 flex flex-col gap-2.5 md:col-start-1 md:row-start-3 md:flex-row md:items-start">{actions}</div>
      </div>
    </Container>
  );
}

export function HomeButton() {
  return (
    <Button variant="ghost" href="/" className="w-full md:w-auto">
      العودة إلى الرئيسية
    </Button>
  );
}
