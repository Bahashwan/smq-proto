// /about · About-M / About-D (default) and About-Proof-D with ?proof=1 (the presenter «About proof blocks» switch).
import { Button, Eyebrow, Footer, Header, ImageSlot, LICENCE, WA_DISPLAY } from "@/components/ui";
import { FinancingPlaceholder, ProofBlocks } from "@/components/pages/g1/AboutProof";
import { Resp, shellFooterLinks } from "@/components/pages/g1/shell";
import { proofNumbers } from "@/data/content";
import { settings } from "@/data/settings";
import { cx, waLink } from "@/lib/format";

export const metadata = { title: "من نحن" };

const PILLARS: { word: string; tone: "gold" | "ink"; text: string }[] = [
  { word: "التسويق", tone: "gold", text: "نعرض الوحدة لمن يبحث عنها فعلاً" },
  { word: "الجودة", tone: "ink", text: "معلومة مؤكدة قبل أن تُنشر" },
  { word: "السرعة", tone: "gold", text: "رد خلال ساعات العمل، لا أيام" },
];

function HexWord({ word, tone, size = "m" }: { word: string; tone: "gold" | "ink"; size?: "m" | "s" }) {
  return (
    <span className={cx("inline-flex items-center justify-center shrink-0 hex-flat font-extrabold leading-none", size === "m" ? "h-11 min-w-24 px-6 text-[15px]" : "h-9 min-w-22 px-5 text-label", tone === "gold" ? "bg-gold text-ink" : "bg-ink text-paper")}>
      {word}
    </span>
  );
}

function FounderTile({ className, long }: { className?: string; long?: boolean }) {
  return (
    <div className={cx("bg-slot cut-img flex items-center justify-center text-center p-4", className)} data-slot="IMG-FOUNDER" data-tier="empty">
      <span className="text-caption md:text-[12px] font-semibold text-muted leading-relaxed">
        صورة المؤسس
        <br />
        فعلية فقط، لا تُولَّد
        <br />
        <span dir="ltr">IMG-FOUNDER · 4:5</span>
        {long && <span className="hidden md:inline"> · إضاءة طبيعية، خلفية مكتب هادئة</span>}
      </span>
    </div>
  );
}

export default function AboutPage() {
  const trainees = proofNumbers.find((p) => p.key === "trainees");
  const traineesNumber = trainees?.value.split(" ")[0] ?? "";
  const tagline = settings.taglineAr ?? "شركة استثمار وتسويق عقاري، تبدأ من الأرقام";

  return (
    <>
      <Header />
      <main>
        {/* story */}
        <section className="container-smq py-8 md:py-14 md:grid md:grid-cols-2 md:gap-12 md:items-center">
          <div className="flex flex-col gap-3 md:gap-4">
            <Eyebrow>من نحن</Eyebrow>
            <h1 className="m-0 text-[30px] md:text-[48px] font-extrabold leading-tight">{tagline}</h1>
            <p className="m-0 text-body md:text-[16px] text-muted leading-relaxed">SMQ شركة متخصصة في الاستثمار والتسويق العقاري، تأسست على يد المستشار العقاري سعود معيض، لتقديم حلول عقارية احترافية قائمة على فهم عميق للسوق السعودي.</p>
            <p className="m-0 text-body md:text-[16px] text-muted leading-relaxed">نؤمن أن العقار قرار استثماري يتطلب تحليلاً دقيقاً ورؤية واضحة. بالمعرفة السوقية والتخطيط المدروس والتنفيذ المحترف، نمكّن عملاءنا من قرارات واثقة وقيمة مستدامة على المدى الطويل.</p>
          </div>
          <ImageSlot slotId="IMG-ED-BALAD-RAWASHEEN" tier="generated" cut="xl" label={false} className="mt-6 md:mt-0 h-[240px] md:h-full md:min-h-[420px]">
            <figcaption className="absolute bottom-3 start-3 z-[1] inline-flex items-center px-2 py-1 bg-paper text-caption font-bold text-ink leading-none whitespace-nowrap">صورة تعبيرية · البلد، جدة</figcaption>
          </ImageSlot>
        </section>

        {/* founder */}
        <section className="bg-sand">
          <div className="container-smq py-8 md:py-14 md:grid md:grid-cols-[minmax(0,1fr)_380px] md:gap-12 md:items-start">
            <div className="flex flex-col gap-3">
              <Eyebrow>المؤسس</Eyebrow>
              <div className="flex gap-4 md:block">
                <FounderTile className="shrink-0 w-[150px] h-[188px] md:hidden" />
                <div className="flex flex-col gap-1 min-w-0 md:gap-2">
                  <h2 className="m-0 text-h2 md:text-display font-extrabold leading-tight">سعود معيض</h2>
                  <span className="text-label md:text-[16px] font-normal text-muted">خبير ومستشار عقاري · مؤسس SMQ</span>
                  <span className="mt-1 flex items-baseline gap-2 md:mt-3">
                    <span className="text-[32px] md:text-display font-extrabold leading-none tnum">{traineesNumber}</span>
                    <span className="text-caption md:text-[14px] font-normal text-muted">
                      <Resp m="متدرب في برامجه" d="متدرب في برامجه ودوراته المتخصصة" />
                    </span>
                  </span>
                </div>
              </div>
              <p className="m-0 text-body md:text-[15px] leading-relaxed md:mt-2">
                <Resp
                  m="خبرة واسعة في السوق العقاري السعودي، وعشرات الاستشارات التي ساعدت مستثمرين ورواد أعمال على قرارات ناجحة. درّب وأهّل أكثر من 2000 متدرب في برامج تجمع بين الجانب العملي والخبرة المهنية. أسلوبه عملي ومركّز على النتائج."
                  d="خبرة واسعة في السوق العقاري السعودي، وعشرات الاستشارات التي ساعدت مستثمرين ورواد أعمال على قرارات ناجحة. درّب وأهّل أكثر من 2000 متدرب في برامج تجمع بين الجانب العملي والخبرة المهنية، وأسهم في إعداد كوادر تفهم السوق العقاري باحتراف. أسلوبه عملي ومركّز على النتائج."
                />
              </p>
              <div className="hidden md:block mt-2">
                <Button href={waLink()} size="s" className="h-11 px-4">
                  اسأل سعود مباشرة على واتساب
                </Button>
              </div>
            </div>
            <FounderTile long className="hidden md:flex md:min-h-[420px]" />
          </div>
        </section>

        <ProofBlocks />

        {/* vision, mission, pillars */}
        <section className="container-smq py-8 md:py-14 grid gap-3 md:grid-cols-3 md:gap-5">
          <div className="bg-ink text-paper cut-m p-5 md:p-7 flex flex-col gap-2">
            <Eyebrow onInk>رؤيتنا</Eyebrow>
            <p className="m-0 text-body md:text-[17px] leading-relaxed">أن نكون من الجهات الرائدة في القطاع العقاري بالمملكة، بحلول استثمارية وتسويقية ذكية، وتنفيذ فعّال، وخيارات موثوقة تلبي تطلعات المستثمرين.</p>
          </div>
          <div className="border-interactive p-5 md:p-7 flex flex-col gap-2">
            <Eyebrow>رسالتنا</Eyebrow>
            <p className="m-0 text-body md:text-[17px] leading-relaxed">حلول عقارية قائمة على الفهم العميق للسوق، وخبرة تُقدَّم بدقة واحتراف، لتمكين عملائنا من قرارات استثمارية وتسويقية مدروسة عبر خدمات استشارية وتنفيذية متكاملة.</p>
          </div>
          <div className="mt-5 md:mt-0 md:bg-sand md:p-7 flex flex-col gap-4">
            <h2 className="m-0 text-h2 font-extrabold md:hidden">ثلاثة مرتكزات</h2>
            <Eyebrow className="hidden md:block">ثلاثة مرتكزات</Eyebrow>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-1 md:gap-4">
              {PILLARS.map((p) => (
                <div key={p.word} className="flex flex-col items-center gap-2 text-center md:flex-row md:text-start md:gap-3">
                  <span className="md:hidden">
                    <HexWord word={p.word} tone={p.tone} />
                  </span>
                  <span className="hidden md:inline">
                    <HexWord word={p.word} tone={p.tone} size="s" />
                  </span>
                  <span className="text-caption md:text-label font-normal text-muted leading-snug">{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* licences and the hidden financing block */}
        <section className="container-smq pb-8 md:pb-16 grid gap-4 md:grid-cols-2 md:gap-12 md:items-start">
          <div className="flex flex-col gap-3">
            <Eyebrow>مرخصون ومنظمون</Eyebrow>
            <h2 className="m-0 hidden md:block text-h2 font-extrabold leading-tight">نعمل تحت رقابة الهيئة العامة للعقار</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-ink text-paper cut-m p-4 md:p-5 flex flex-col gap-1">
                <span className="text-caption font-semibold text-on-ink-muted">ترخيص الهيئة العامة للعقار</span>
                <span className="text-[16px] md:text-[22px] font-extrabold tnum" dir="ltr">
                  {LICENCE.rega}
                </span>
              </div>
              <div className="bg-ink text-paper cut-m p-4 md:p-5 flex flex-col gap-1">
                <span className="text-caption font-semibold text-on-ink-muted">السجل التجاري</span>
                <span className="text-[16px] md:text-[22px] font-extrabold tnum" dir="ltr">
                  {LICENCE.cr}
                </span>
              </div>
            </div>
          </div>
          <FinancingPlaceholder />
        </section>

        {/* phone: the gold ask block */}
        <section className="bg-gold text-ink cut-xl md:hidden">
          <div className="container-smq py-7 flex flex-col gap-2 items-start">
            <span className="text-h3 font-extrabold">اسأل سعود مباشرة</span>
            <span className="text-label font-normal text-on-gold-muted">سؤال واحد على واتساب يكفي لتعرف إن كنا الجهة المناسبة لك.</span>
            <Button href={waLink()} variant="secondary" size="s" className="mt-2 h-11 px-4">
              واتساب <span className="tnum" dir="ltr">{WA_DISPLAY}</span>
            </Button>
          </div>
        </section>
      </main>
      <Footer compact links={shellFooterLinks("/about")} />
    </>
  );
}
