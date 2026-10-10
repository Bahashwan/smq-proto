"use client";
// About-Proof-D: the financing block, the numbers band and the three quotes, shown only with the presenter switch
// `proof=1` (route-map «About proof blocks»). Without it the About-D placeholder note stays in the licence section.
import Link from "next/link";
import type { ReactNode } from "react";
import { Eyebrow, LICENCE, Mark, MarkedText, Pill } from "@/components/ui";
import { partners, proofNumbers, testimonials, copy } from "@/data/content";
import { settings } from "@/data/settings";
import { countsByStatus, listedUnits } from "@/data/selectors";
import { usePresenter } from "@/lib/presenter";
import { fmtDateLong } from "@/lib/format";

/** «2026-07» → «يوليو 2026» */
function monthLabel(ym: string): string {
  return fmtDateLong(`${ym}-01`).replace(/^1 /, "");
}

function useProof(): boolean {
  return usePresenter().state.proof;
}

/** The About-D / About-M placeholder note for the hidden financing block (gone when the proof blocks show) */
export function FinancingPlaceholder() {
  const proof = useProof();
  if (proof) return null;
  return (
    <>
      <p className="m-0 text-caption font-normal text-muted md:hidden">خيارات التمويل مع البنوك تُعرض هنا فقط بعد تأكيد العميل للشراكات.</p>
      <div className="hidden md:flex flex-col gap-3 p-6 border-[1.5px] border-dashed border-line">
        <span className="text-label text-muted">خيارات التمويل · كتلة مخفية حتى تأكيد العميل</span>
        <p className="m-0 text-[14px] text-muted leading-relaxed">تُعرض هنا شعارات البنوك التي يوجد معها اتفاق تمويل فعلي فقط، بعنوان «يمكنك التمويل عبر» لا «شركاؤنا». بدون تأكيد، لا تُعرض الكتلة أصلاً.</p>
        <div className="grid grid-cols-3 gap-3">
          {partners
            .filter((p) => p.kind === "bank" || p.kind === "developer")
            .map((p) => (
              <span key={p.id} className="flex items-center justify-center h-14 border border-dashed border-line text-caption font-normal text-muted">
                [شعار بنك]
              </span>
            ))}
        </div>
      </div>
    </>
  );
}

export function ProofBlocks() {
  const proof = useProof();
  if (!proof) return null;
  const counts = countsByStatus();
  const trainees = proofNumbers.find((p) => p.key === "trainees");
  const traineesNumber = trainees?.value.split(" ")[0] ?? "";
  const hoursFrom = parseInt(settings.hours.from, 10);
  const hoursTo = parseInt(settings.hours.to, 10);
  const callForPrice = listedUnits().filter((u) => !u.priceSar).length;
  const logos = partners.filter((p) => p.hasLogo && (p.kind === "bank" || p.id === "p-rega"));
  const numbers: { value: string; label: ReactNode }[] = [
    { value: traineesNumber, label: <>متدرب تخرّج من دوراتنا {trainees?.tbc && <Mark>[للتأكيد]</Mark>}</> },
    { value: String(counts.listed), label: "نماذج بأسعار معلنة في جاردن الروضة" },
    { value: `${hoursFrom} إلى ${hoursTo}`, label: `نرد على واتساب، ${settings.hours.days}` },
    { value: String(callForPrice), label: "«اتصل للسعر» على الموقع" },
  ];
  return (
    <div data-proof className="flex flex-col">
      {/* financing */}
      <section className="container-smq py-10 md:py-16 grid gap-8 md:grid-cols-[380px_minmax(0,1fr)] md:gap-10">
        <div className="flex flex-col gap-2.5">
          <Eyebrow>التمويل</Eyebrow>
          <h2 className="m-0 text-h2 md:text-[30px] font-extrabold leading-tight">شركاؤنا وجهات التمويل</h2>
          <p className="m-0 text-body md:text-[14px] text-ink-2 leading-relaxed">نعمل مع بنوك مرخّصة وجهات تنظيمية. الموافقة على التمويل بيد البنك، ونحن نجهّز الملف ونتابعه معك حتى الإفراغ.</p>
          <Link href="/services" className="mt-1.5 self-start text-label font-extrabold text-gold-text no-underline hover:text-ink hover:underline">
            كيف نساعد في التمويل ←
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3.5">
            {logos.map((p) => (
              <span key={p.id} className={`flex items-center justify-center text-center h-11 px-4 bg-paper border-hairline text-caption font-extrabold text-muted leading-none ${p.kind === "bank" ? "min-w-[130px]" : "min-w-[170px]"}`}>
                <span>
                  {p.name}
                  {p.placeholder && <Mark>[للتأكيد]</Mark>}
                </span>
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 bg-sand p-3.5">
              <span className="text-caption font-normal text-muted">ترخيص فال</span>
              <span className="text-[16px] font-extrabold tnum text-right" dir="ltr">
                {LICENCE.rega}
              </span>
            </div>
            <div className="flex flex-col gap-1 bg-sand p-3.5">
              <span className="text-caption font-normal text-muted">نجهّز ملف التمويل</span>
              <span className="text-[16px] font-extrabold">بلا رسوم</span>
            </div>
            <div className="flex flex-col gap-1 bg-sand p-3.5">
              <span className="text-caption font-normal text-muted">رد البنك عادةً</span>
              <span className="text-[16px] font-extrabold">
                3 إلى 7 أيام عمل <Mark>[للتأكيد]</Mark>
              </span>
            </div>
          </div>
          <span className="text-caption font-normal text-muted">الشعارات بموافقة كتابية من كل جهة، وتُدار من لوحة الإدارة › الشركاء والتمويل. تختفي الكتلة كلها إن لم يكن شعار واحد مرئياً.</span>
        </div>
      </section>

      {/* numbers band */}
      <section className="bg-ink text-paper cut-img-l">
        <div className="container-smq pt-10 pb-16 md:pb-18 grid grid-cols-2 gap-6 md:grid-cols-4">
          {numbers.map((n) => (
            <div key={n.value} className="flex flex-col gap-1.5 border-s-[3px] border-gold ps-4">
              <span className="text-price-s md:text-[40px] font-extrabold leading-none tnum">{n.value}</span>
              <span className="text-label font-normal text-on-ink-muted leading-snug">{n.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* testimonials */}
      <section className="container-smq py-10 md:pt-16 md:pb-0 flex flex-col gap-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-6">
          <div className="flex flex-col gap-1">
            <Eyebrow>آراء العملاء</Eyebrow>
            <h2 className="m-0 text-h2 md:text-[30px] font-extrabold leading-tight">ماذا يقول من اشترى</h2>
          </div>
          <span className="text-caption font-normal text-muted">نصوص حقيقية بموافقة أصحابها · بلا صور أشخاص · تظهر الكتلة عند 3 آراء منشورة فأكثر</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((q) => ({ ...q, ...(q.proof ?? {}) })).map((t) => (
            <blockquote key={t.id} className="m-0 flex flex-col gap-3.5 px-5 py-5 md:px-6 md:py-5.5 border-interactive">
              <span aria-hidden className="size-6 hex-flat bg-gold" />
              <p className="m-0 text-body md:text-[16px] font-semibold leading-[1.8]">
                <MarkedText text={t.text} />
              </p>
              <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-line text-caption font-normal text-muted">
                <span>
                  {t.name} · {t.role}
                  {t.unitCode ? ` · ${t.unitCode}` : ""}
                </span>
                <span className="inline-flex items-center gap-2">
                  {t.date && <span className="tnum">{monthLabel(t.date)}</span>}
                  {t.sample && <Pill tone="gold-outline">{copy.sampleTextAr}</Pill>}
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    </div>
  );
}
