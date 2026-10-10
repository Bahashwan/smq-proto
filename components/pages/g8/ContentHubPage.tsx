"use client";
// /admin/content (Admin-Content-D): the pages table, the shared blocks with their status chips, the recent changes
// and the «n عنصراً بانتظار التأكيد» button that opens /admin/content/needs-confirmation. Every count on the block
// cards is computed from the content fixtures merged with the in-memory edits.
import Link from "next/link";
import { StatusPill } from "@/components/admin";
import { MarkedText } from "@/components/ui";
import { contentHub, HUB_STATUS_LABELS, lists, proofNumbers, seo, type HubStatus } from "@/data/content";
import { media } from "@/data/media";
import { cx } from "@/lib/format";
import { countWord, faqSummary, opinionsPublished, testimonialsSummary, useFaq, useNeedsConfirmation, usePartners, useTestimonials, W } from "./model";
import { ContentHead, G8Shell, H2, SAUD } from "./shell";

const PILL: Record<HubStatus, "ink" | "outline" | "tbc"> = { published: "ink", draft: "outline", "needs-confirmation": "tbc" };

function HubPill({ status }: { status: HubStatus }) {
  return <StatusPill status={HUB_STATUS_LABELS[status]} variant={PILL[status]} />;
}

export function ContentHubPage() {
  const nc = useNeedsConfirmation();
  const faq = faqSummary(useFaq());
  const partners = usePartners();
  const visibleLogos = partners.filter((p) => p.visible).length;
  const t = testimonialsSummary(useTestimonials());
  const shots = media.filter((m) => m.group !== "founder");
  const real = shots.filter((m) => m.tier === "real").length;
  const soon = lists.districts.filter((d) => d.comingSoon).length;

  const blockLine: Record<string, string> = {
    faq: `${countWord(faq.total, W.question)} · ${faq.published} منشورة · ${faq.drafts} [مسودة إجابة]`,
    partners: `${countWord(partners.length, W.logo)} · ${visibleLogos} ظاهرة · ${visibleLogos ? "كتلة «من نحن» ظاهرة" : "كتلة «من نحن» مخفية حتى يظهر شعار"}`,
    testimonials: `${opinionsPublished(t.published)} من ${t.min} مطلوبة · ${t.shown ? "الكتلة ظاهرة" : "الكتلة مخفية"} · ${proofNumbers.length} أرقام إثبات`,
    lists: `الأحياء ${lists.districts.length} (${soon} قريباً) · المدن ${lists.cities.length} · أنواع الوحدات ${lists.unitTypes.length} · الميزانيات ${lists.budgets.length} · أسباب الرفض ${lists.rejectionReasons.length}`,
    "site-settings": "واتساب · الهاتف · العنوان · الساعات · الرقم الضريبي [للتأكيد] · قوالب الرسائل",
    seo: `${countWord(seo.length, W.page)} · عنوان ووصف لكل منها · صور المعاينة 1200×630`,
    media: `${countWord(shots.length, W.slot)} من قائمة اللقطات · ${real} فعلية · ${shots.length - real} تعبيرية أو طباعية`,
  };

  return (
    <G8Shell user={SAUD}>
      <ContentHead
        title="المحتوى والأسئلة"
        subtitle={<MarkedText text="كل نص على الموقع يُحرَّر من هنا. الحقول الموسومة [للتأكيد] تبقى كما هي حتى يؤكدها سعود" />}
        actions={
          <Link
            href="/admin/content/needs-confirmation"
            className="flex h-11 items-center gap-2.5 border-[1.5px] border-gold bg-cream-focus px-4 text-label font-extrabold text-ink no-underline motion-hover transition-colors hover:bg-sand"
          >
            <span aria-hidden className="hex-point size-2.5 shrink-0 bg-gold" />
            <span className="tnum">{waitingLine(nc.count)}</span>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-bold text-muted">
        {contentHub.legend.map((l) => (
          <span key={l.status} className="flex items-center gap-1.5">
            <HubPill status={l.status} />
            <MarkedText text={l.textAr} />
          </span>
        ))}
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="hub-pages">
        <h2 id="hub-pages" className="text-[16px] font-extrabold">
          الصفحات
        </h2>
        <div className="overflow-x-auto border-interactive bg-paper">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_0.9fr_160px] gap-4 border-b-[1.5px] border-ink px-4 py-3 text-caption font-extrabold text-muted">
              <span>الصفحة</span>
              <span>الأقسام</span>
              <span>آخر تعديل</span>
              <span>الحالة</span>
              <span />
            </div>
            {contentHub.pages.map((p, i) => (
              <div key={p.key} className={cx("grid grid-cols-[1.4fr_1fr_1fr_0.9fr_160px] items-center gap-4 px-4 py-4 text-label font-normal", i > 0 && "border-t border-line")}>
                <span className="font-extrabold">
                  {p.pageAr}{" "}
                  <span dir="ltr" className="font-semibold text-muted">
                    {p.path}
                  </span>
                </span>
                <span className="leading-relaxed">{p.sectionsAr}</span>
                <span>{p.editedAr}</span>
                <span>
                  <HubPill status={p.status} />
                </span>
                <span className="flex justify-end">
                  <Link
                    href={p.href}
                    aria-label={`تحرير ${p.pageAr}`}
                    className={cx(
                      "flex h-9 items-center px-4 text-[12px] font-extrabold no-underline motion-hover transition-colors",
                      p.status === "draft" ? "bg-ink text-paper hover:bg-ink-2" : "border-[1.5px] border-ink text-ink hover:bg-sand",
                    )}
                  >
                    تحرير
                  </Link>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="hub-blocks">
        <h2 id="hub-blocks" className="text-[16px] font-extrabold">
          الكتل المشتركة والقوائم
        </h2>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
          {contentHub.blocks.map((b) => (
            <Link key={b.key} href={b.href} className="flex flex-col gap-3 border-interactive bg-paper p-4 text-ink no-underline motion-hover transition-colors hover:bg-sand">
              <span className="flex items-start justify-between gap-3">
                <span className="text-[16px] font-extrabold">{b.titleAr}</span>
                <HubPill status={blockStatus(b.key, b.status, { visibleLogos, testimonialsShown: t.shown })} />
              </span>
              <span className="text-[12px] leading-relaxed text-muted">
                <MarkedText text={blockLine[b.key] ?? ""} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="hub-recent">
        <H2>
          <span id="hub-recent">آخر التغييرات</span>
        </H2>
        <ul className="border-interactive bg-paper text-label font-normal">
          {contentHub.recentChanges.map((c, i) => (
            <li key={i} className={cx("grid grid-cols-[120px_1fr_auto] items-center gap-4 px-4 py-3", i > 0 && "border-t border-line")}>
              <span className="text-muted">{c.whenAr}</span>
              <span>
                <MarkedText text={c.textAr} />
              </span>
              <Link href={c.href} className="font-bold text-gold-text no-underline hover:text-ink hover:underline">
                {c.actionAr}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </G8Shell>
  );
}

/** «11 عنصراً بانتظار التأكيد» */
export function waitingLine(n: number): string {
  if (n === 0) return "لا عناصر بانتظار التأكيد";
  return `${countWord(n, W.item)} بانتظار التأكيد`;
}

/** The block chips follow the fixture, except where an in-memory edit has published the block. */
function blockStatus(key: string, status: HubStatus, s: { visibleLogos: number; testimonialsShown: boolean }): HubStatus {
  if (key === "partners" && s.visibleLogos > 0) return "published";
  if (key === "testimonials" && s.testimonialsShown) return "published";
  return status;
}
