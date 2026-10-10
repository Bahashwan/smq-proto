"use client";
// /alliance/apply/sent · AllianceApply-Success-M: ALL-2026-0038 (مكتب م للعقارات, decision log), the three steps ahead.
import Link from "next/link";
import { useState } from "react";
import { districtAr } from "@/data";
import { CheckIcon } from "@/components/ui";
import { HexDot } from "@/components/alliance";
import { usePatch, useStore } from "@/lib/store";
import { applyFixture, localPhone, maskedLicence } from "../data";
import { ApplyShell } from "./parts";

/** «أبحر الشمالية والشاطئ والمحمدية» */
export function joinAnd(names: string[]): string {
  return names.join(" و");
}

export function useApplication() {
  const a = applyFixture();
  const p = usePatch<{ officeName: string; phoneMasked: string; districts: string[] }>("application", a.id);
  return { ...a, ...(p ?? {}) };
}

function StepHex({ n, tone }: { n: number; tone: "gold" | "outline" }) {
  return tone === "gold" ? (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-gold text-[12px] font-extrabold text-ink hex-flat tnum">{n}</span>
  ) : (
    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center text-[12px] font-extrabold tnum">
      <span className="absolute inset-0 flex">
        <HexDot size={32} tone="paper" border="ink" />
      </span>
      <span className="relative">{n}</span>
    </span>
  );
}

export function ApplySent() {
  const a = useApplication();
  const toast = useStore((s) => s.toast);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(a.id);
    } catch {
      /* clipboard blocked */
    }
    setCopied(true);
    toast("نُسخ رقم الطلب");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <ApplyShell footer={false}>
      <div className="flex flex-col gap-5 pb-6">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="flex h-11 w-11 items-center justify-center bg-gold text-ink hex-flat">
            <CheckIcon size={20} />
          </span>
          <HexDot size={44} tone="paper" border="ink" />
          <HexDot size={44} tone="paper" border="line" />
        </div>
        <div className="flex flex-col gap-2.5">
          <h1 className="text-[26px] leading-tight font-extrabold md:text-[32px]">وصل طلب {a.officeName}</h1>
          <p className="text-[13px] leading-relaxed text-ink-2 md:text-[14px]">
            نتحقق من رخصة فال <span className="tnum">{maskedLicence(a.licence)}</span> في موقع الهيئة يدوياً خلال يومي عمل. بعد التوثيق تصلك رسالة واتساب برابط صفحة العضو وأول طلبات أحيائك.
          </p>
        </div>
        <div className="flex flex-col gap-2 bg-ink px-5 py-5 text-paper cut-l">
          <span className="text-[12px] font-bold text-on-ink-muted">رقم الطلب</span>
          <div className="flex items-center justify-between gap-3">
            <span dir="ltr" className="text-[30px] leading-none font-extrabold tnum">
              {a.id}
            </span>
            <button type="button" onClick={copy} aria-label={`نسخ رقم الطلب ${a.id}`} className="inline-flex h-11 shrink-0 items-center px-3 text-[12px] font-extrabold text-paper hover:bg-ink-2" style={{ border: "1.5px solid var(--smq-paper)" }}>
              {copied ? <CheckIcon size={16} /> : "نسخ"}
            </button>
          </div>
          <span className="text-caption leading-relaxed text-on-ink-muted">
            أُرسلت رسالة واتساب بنفس الرقم ورابط صفحة الحالة إلى <span dir="ltr" className="whitespace-nowrap tnum">{localPhone(a.phoneMasked)}</span>
          </span>
        </div>
        <ol className="flex flex-col">
          {[
            { k: "قيد المراجعة:", v: "الطلب عند فريق التحالف. لا شيء يظهر في الدليل بعد." },
            { k: "التحقق من الرخصة:", v: "في موقع الهيئة، يدوياً، خلال يومي عمل. قد نطلب صورة الرخصة." },
            { k: "موثّق:", v: `شارة «رخصة فال موثّقة»، صفحة العضو والميزان، وأول الطلبات في ${joinAnd(a.districts.map(districtAr))}.` },
          ].map((s, i) => (
            <li key={s.k} className="flex items-start gap-3 py-3 text-[13px] leading-relaxed" style={i > 0 ? { borderTop: "1px solid var(--smq-line)" } : undefined}>
              <StepHex n={i + 1} tone={i === 0 ? "gold" : "outline"} />
              <span>
                <strong className="font-extrabold">{s.k}</strong> {s.v}
              </span>
            </li>
          ))}
        </ol>
        <div className="flex flex-col gap-2.5">
          <Link href={`/alliance/status/${a.id}`} className="inline-flex h-[52px] w-full items-center justify-center bg-gold px-5 text-[15px] font-extrabold text-ink no-underline cut-m hover:bg-gold-hover">
            صفحة حالة الطلب
          </Link>
          <Link href="/alliance" className="inline-flex h-12 w-full items-center justify-center bg-paper px-5 text-[14px] font-bold text-ink no-underline hover:bg-sand" style={{ border: "1.5px solid var(--smq-ink)" }}>
            العودة إلى صفحة التحالف
          </Link>
        </div>
      </div>
    </ApplyShell>
  );
}
