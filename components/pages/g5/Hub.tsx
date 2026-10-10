"use client";
// /collaborate · «تعاون معنا» (Hub-M, Hub-D): three doors by who you are, each saying who it is for, what you get, what
// we need and how long it takes. The doors are the alliance library's DoorCard (owners gold with the big cut, offices
// ink with the honeycomb, marketers outlined with the link chip) at the large size, CTA arrow included.
import Link from "next/link";
import type { ReactNode } from "react";
import { DoorCard } from "@/components/alliance";
import { Container, Mark, MarkedText } from "@/components/ui";
import { useMarks } from "@/lib/presenter";
import { cx, waLink } from "@/lib/format";
import { HUB_FOOTER, Shell } from "./parts";

type Tone = "owners" | "offices" | "marketers";

/** Hub-D: each door is at least 520px tall and its facts sit at the bottom, above the CTA, with the free space after
 *  the description. DoorCard's text wrapper is the card's second-to-last child (the CTA is the last), so on desktop it
 *  grows into a flex column and the facts' mt-auto reaches the bottom. */
const DOOR_D = "md:min-h-130 md:[&>span>:nth-last-child(2)]:flex md:[&>span>:nth-last-child(2)]:grow md:[&>span>:nth-last-child(2)]:flex-col";
/** the description + facts column inside a door (fills the grown wrapper on desktop) */
const BODY = "flex flex-col gap-3 md:grow";

/** «تحصل على / نحتاج منك / الوقت» under a hairline: 72px / 84px key column (Hub-M / Hub-D); on desktop pinned to the
 *  bottom of the door, 14px above the CTA */
function Facts({ tone, rows }: { tone: Tone; rows: { k: string; v: ReactNode }[] }) {
  return (
    <span className={cx("mt-1 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-2.5 gap-y-1 border-t pt-2.5 text-caption leading-relaxed md:mb-1 md:mt-auto md:grid-cols-[5.25rem_minmax(0,1fr)] md:gap-x-3 md:gap-y-1.5 md:pt-3 md:text-label", tone === "offices" ? "border-ink-2" : tone === "owners" ? "border-gold-text" : "border-line")}>
      {rows.map((r) => (
        <span key={r.k} className="contents">
          <span className={cx("font-extrabold", tone === "offices" ? "text-gold" : "text-ink")}>{r.k}</span>
          <span className={cx("font-normal", tone === "offices" ? "text-paper" : "text-ink")}>{r.v}</span>
        </span>
      ))}
    </span>
  );
}

/** phone copy / desktop copy where the two boards differ */
const pd = (phone: ReactNode, desktop: ReactNode) => (
  <>
    <span className="md:hidden">{phone}</span>
    <span className="hidden md:inline">{desktop}</span>
  </>
);

/** the honeycomb of the offices door: 3 × 3 on the phone, 4 × 3 on desktop */
function Honeycomb() {
  const phone = ["ink2", "gold", "ink2", "ink2", "ink2", "", "gold", "ink2", ""];
  const desk = ["ink2", "gold", "ink2", "ink2", "ink2", "ink2", "gold", "", "gold", "ink2", "ink2", ""];
  const cell = (t: string, i: number, size: string) => <span key={i} className={cx("hex-flat", size, t === "gold" ? "bg-gold" : t === "ink2" ? "bg-ink-2" : "")} />;
  return (
    <span aria-hidden className="pointer-events-none absolute end-0 top-0 opacity-50">
      <span className="grid grid-cols-3 md:hidden">{phone.map((t, i) => cell(t, i, "size-8.5"))}</span>
      <span className="hidden grid-cols-4 md:grid">{desk.map((t, i) => cell(t, i, "size-14"))}</span>
    </span>
  );
}

export function Hub() {
  const marks = useMarks();
  return (
    <Shell footer={HUB_FOOTER}>
      <section className="bg-sand text-ink [clip-path:polygon(0_0,100%_0,100%_100%,52px_100%,0_calc(100%-30px))] md:[clip-path:polygon(0_0,100%_0,100%_100%,120px_100%,0_calc(100%-69px))]">
        <Container className="flex flex-col gap-1.5 pb-12 pt-6 md:grid md:grid-cols-2 md:items-center md:gap-10 md:pb-18 md:pt-10">
          <div className="flex flex-col gap-1.5">
            <span className="text-caption font-bold text-gold-text md:text-label">لمن يعمل مع SMQ، لا لمن يشتري منها</span>
            <h1 className="m-0 text-h1">تعاون معنا</h1>
          </div>
          <p className="m-0 text-label font-normal leading-relaxed text-ink-2 md:max-w-xl md:justify-self-end md:text-body">
            ثلاثة أبواب بحسب من أنت. كل باب يقول لمن هو، ماذا تحصل عليه، ماذا نحتاج منك، وكم يأخذ من وقتك.
            <span className="hidden md:inline"> لا حسابات ولا تسجيل، فقط النموذج ثم واتساب.</span>
          </p>
        </Container>
      </section>

      <Container className="mt-7 md:mt-9">
        <div className="flex flex-col gap-5 md:grid md:grid-cols-[1fr_1.15fr_1fr] md:items-stretch md:gap-5">
          <DoorCard
            variant="owners"
            href="/add"
            eyebrow="01 · للمُلّاك"
            title="عندك عقار؟"
            cta="أضف عقارك"
            size="l"
            className={DOOR_D}
            text={
              <span className={BODY}>
                <span className="text-label font-normal leading-relaxed md:text-body">
                  نعرضه بسعر معلن لمشترين جاهزين، بعد تحقق وتصوير، بلا تكلفة عليك.<span className="hidden md:inline"> شقة، فيلا، أو عمارة بدخل.</span>
                </span>
                <Facts
                  tone="owners"
                  rows={[
                    { k: "تحصل على", v: pd("تقييم أولي، تصوير مجاني، صفحة بسعر واضح، وفرز المشترين قبل أن يصلوك", "تقييم أولي بسعر المتر، تصوير مجاني، صفحة بسعر واضح، وفرز المشترين قبل أن يصلوك") },
                    { k: "نحتاج منك", v: "الصك أو التفويض، صور من الجوال، رقم واتساب" },
                    { k: "الوقت", v: "دقيقتان للنموذج · رد خلال 24 ساعة عمل" },
                  ]}
                />
              </span>
            }
          />
          <DoorCard
            variant="offices"
            href="/alliance"
            eyebrow="02 · للمكاتب المرخّصة · مبادرة من SMQ"
            title="عندك مكتب عقاري؟"
            cta="اعرف عن التحالف"
            icon={<Honeycomb />}
            size="l"
            className={DOOR_D}
            text={
              <span className={cx("relative", BODY)}>
                <span className="text-label font-normal leading-relaxed md:text-body">
                  {pd(
                    "تحالف مكاتب جدة العقارية: نمرّر طلبات المشترين وعروض العقارات بين المكاتب لنقفل الصفقات أسرع، وكل تعارف مسجّل.",
                    "تحالف مكاتب جدة العقارية: مكاتب مرخّصة تمرّر طلبات المشترين وعروض العقارات بينها لتقفل الصفقات أسرع، وكل تعارف مسجّل في سجل إحالة يحمي حصة كل طرف.",
                  )}
                </span>
                <Facts
                  tone="offices"
                  rows={[
                    { k: "تحصل على", v: "طلبات مشترين في أحيائك، تقرير طلب شهري، مكان في دليل الأعضاء، وسجل إحالة يحمي حصتك" },
                    { k: "نحتاج منك", v: pd("رخصة فال، عروضك، طلباتك، ورداً سريعاً", "رخصة فال سارية، عروضك، طلباتك، ورداً سريعاً على ما يصلك") },
                    { k: "الوقت", v: "5 دقائق للطلب · توثيق الرخصة خلال يومي عمل" },
                  ]}
                />
              </span>
            }
          />
          <DoorCard
            variant="marketers"
            href="/marketers"
            eyebrow="03 · للأفراد"
            title="مسوّق عقاري؟"
            cta="انضم كمسوّق"
            icon={
              marks ? (
                <span className="absolute end-5 top-5 md:end-6 md:top-6">
                  {/* Hub-M / Hub-D outline the whole «الحقول [للتأكيد]» as one chip */}
                  <Mark>الحقول للتأكيد</Mark>
                </span>
              ) : null
            }
            size="l"
            className={DOOR_D}
            text={
              <span className={BODY}>
                <span className="text-label font-normal leading-relaxed md:text-body">سوّق وحداتنا برابطك الخاص. كل زيارة وضغطة واتساب تُحسب لك، والعمولة مكتوبة قبل أن تبدأ.</span>
                <span className="flex items-center gap-2.5 bg-sand px-3 py-2.5 font-mono text-caption font-bold text-ink" dir="ltr">
                  <span aria-hidden className="inline-block size-2.5 bg-gold hex-flat" />
                  smq-re.com/r/your-name
                </span>
                <Facts
                  tone="marketers"
                  rows={[
                    { k: "تحصل على", v: <MarkedText text="رابط متابَع ورمز QR، صفحة بأرقامك، وعمولة على كل صفقة تُنسب لك [للتأكيد]" /> },
                    { k: "نحتاج منك", v: "اسمك وجوالك، رخصة فال إن وُجدت، الأحياء التي تعرفها" },
                    { k: "الوقت", v: "3 دقائق · مقابلة قصيرة خلال أسبوع" },
                  ]}
                />
              </span>
            }
          />
        </div>
        <p className="m-0 mt-6 text-caption font-normal leading-relaxed text-muted md:mt-7 md:text-label">
          {pd("لست أياً من الثلاثة وتريد شراء وحدة؟ ", "تريد شراء وحدة؟ ")}
          <Link href="/units" className="font-bold text-gold-text underline underline-offset-2 hover:text-ink">
            ابدأ من ميزانيتك
          </Link>
          {pd(". مطوّر وتريد تسويق مشروعك؟ ", " · مطوّر وتريد تسويق مشروعك؟ ")}
          <a href={waLink("مطوّر")} target="_blank" rel="noopener noreferrer" className="font-bold text-gold-text underline underline-offset-2 hover:text-ink">
            راسلنا على واتساب
          </a>
          <span className="md:hidden">.</span>
        </p>
      </Container>
    </Shell>
  );
}
