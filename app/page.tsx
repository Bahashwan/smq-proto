import Link from "next/link";
import { Accordion, ArrowIcon, Button, Eyebrow, Footer, Header, HexNumber, IllustrativeLabel, ImageSlot, LogoMark, Mark, Price, Row, RowGroup, Tag, WhatsAppIcon, LICENCE, PHONE_DISPLAY, PHONE_TEL, WA_DISPLAY } from "@/components/ui";
import { MapEmbed } from "@/components/map";
import { HomeFinder } from "@/components/pages/g1/HomeFinder";
import { LiveAvailableCount, LiveProjectFrom, LiveProjectStat } from "@/components/pages/g1/HomeLive";
import { Resp } from "@/components/pages/g1/shell";
import { areaRange, bedsRange, bedsWord, guideTables, listedUnits, unitPpm } from "@/data/selectors";
import { projectById } from "@/data/projects";
import { homeFaq, proofNumbers } from "@/data/content";
import { settings } from "@/data/settings";
import { fmtNum, fmtDate, waLink } from "@/lib/format";

export const metadata = {
  title: "إس إم كيو العقارية · وحدات بأسعار معلنة في جدة",
  openGraph: { title: "شقق وفلل روف بأسعار معلنة في جدة", description: "ابدأ من ميزانيتك. لا «اتصل للسعر».", images: [{ url: "/og/home.png", width: 1200, height: 630 }] },
};

// The phone board prints the service lines without the closing period; the desktop cards keep it.
const SERVICES = [
  { n: "01", title: "شراء العقارات", text: "نفلتر السوق على ميزانيتك ونرافقك حتى الإفراغ", href: "/services#buy" },
  { n: "02", title: "بيع العقارات", text: "تقييم واقعي، تصوير، وتسويق لعملاء جاهزين", href: "/services#sell" },
  { n: "03", title: "الاستثمار العقاري", text: "فرص مدروسة بالأرقام، لا بالوعود", href: "/services#invest" },
  { n: "04", title: "الاستشارات العقارية", text: "جلسة واحدة توفر عليك سنوات من التجربة", href: "/services#consult" },
];

function thousands(from: number, to: number): string {
  if (to >= 1_000_000) return `${(from / 1_000_000).toFixed(2)} إلى ${(to / 1_000_000).toFixed(2)} مليون`;
  return `${Math.round(from / 1000)} إلى ${Math.round(to / 1000)} ألف`;
}

// Counted words for the project line («عمارتان»، «عشرة نماذج»، «فيلتان روف بخمس غرف»): numbers 3 to 10 take the
// form opposite to the noun's gender.
const FOR_MASC: Record<number, string> = { 3: "ثلاثة", 4: "أربعة", 5: "خمسة", 6: "ستة", 7: "سبعة", 8: "ثمانية", 9: "تسعة", 10: "عشرة" };
const FOR_FEM: Record<number, string> = { 3: "ثلاث", 4: "أربع", 5: "خمس", 6: "ست", 7: "سبع", 8: "ثماني", 9: "تسع", 10: "عشر" };
const buildingsWord = (n: number) => (n === 1 ? "عمارة" : n === 2 ? "عمارتان" : `${FOR_FEM[n] ?? n} عمارات`);
const modelsWord = (n: number) => (n === 1 ? "نموذج واحد" : n === 2 ? "نموذجان" : FOR_MASC[n] ? `${FOR_MASC[n]} نماذج` : `${n} نموذجاً`);
const villasWord = (n: number) => (n === 1 ? "فيلا روف" : n === 2 ? "فيلتان روف" : `${FOR_FEM[n] ?? n} فلل روف`);
const withRooms = (n: number) => (FOR_FEM[n] ? `ب${FOR_FEM[n]} غرف` : `بـ${n} غرف`);
/** «غرفتين» after «من» */
const bedsAfterMin = (n: number) => (n === 2 ? "غرفتين" : bedsWord(n));

export default function HomePage() {
  const project = projectById("rwd-01")!;
  const guide = guideTables("rawdah");
  const trainees = proofNumbers.find((p) => p.key === "trainees");
  const traineesNumber = trainees?.value.split(" ")[0] ?? "";
  const guideRows = [
    ...guide.byBeds.filter((r) => r.units.some((u) => u.type === "apartment")).map((r) => ({
      label: r.beds === 2 ? "شقة غرفتين" : `شقة ${r.beds} غرف`,
      from: r.from,
      range: r.single || r.from === r.to ? "نموذج واحد متاح" : r.from != null && r.to != null ? thousands(r.from, r.to) : "—",
      ppm: r.ppm ? (r.ppm.min === r.ppm.max ? fmtNum(r.ppm.min) : `${fmtNum(r.ppm.min)} إلى ${fmtNum(r.ppm.max)}`) : "—",
    })),
    ...guide.byType.filter((r) => r.type === "roof-villa").map((r) => ({
      label: `فيلا روف ${r.units[0]?.beds ?? 5} غرف`,
      from: r.from,
      range: r.from != null && r.to != null && r.from !== r.to ? thousands(r.from, r.to) : "نموذج واحد متاح",
      ppm: r.ppmFrom != null && r.ppmTo != null ? (r.ppmFrom === r.ppmTo ? fmtNum(r.ppmFrom) : `${fmtNum(r.ppmFrom)} إلى ${fmtNum(r.ppmTo)}`) : "—",
    })),
  ];
  const minPpm = Math.min(...guide.byType.flatMap((r) => r.units.filter((u) => u.status === "available").map(unitPpm)));

  // the project line, from the project's listed units
  const projectUnits = listedUnits().filter((u) => u.projectId === project.id);
  const apts = projectUnits.filter((u) => u.type === "apartment");
  const villas = projectUnits.filter((u) => u.type === "roof-villa");
  const aptBeds = bedsRange(apts);
  const aptArea = areaRange(apts);
  const villaBeds = bedsRange(villas);
  const buildingsLine = `${buildingsWord(project.buildings.length)}، ${project.buildings.map((b) => b.nameAr).join(" و")}`;
  const aptsLine = aptBeds ? `شقق من ${bedsAfterMin(aptBeds.min)} إلى ${bedsWord(aptBeds.max)}` : "";
  const projectLineD = [
    `${buildingsLine}. ${modelsWord(projectUnits.length)}: `,
    aptsLine,
    aptArea ? ` بين ${fmtNum(Math.round(aptArea.min))} و${fmtNum(Math.round(aptArea.max))} م²` : "",
    villas.length ? `، و${villasWord(villas.length)}${villaBeds ? ` ${withRooms(villaBeds.max)}` : ""}` : "",
    ".",
  ].join("");

  return (
    <>
      <Header showEn />
      <main>
        {/* Hero · phone: the ink panel rides 72px over the image foot (Home-M); desktop: text beside a square image (Home-D) */}
        <section className="flex flex-col md:container-smq md:grid md:grid-cols-2 md:gap-10 md:items-center md:pt-12">
          <div className="order-2 md:order-1 relative z-[1] -mt-18 mx-4 flex flex-col gap-3 bg-ink text-paper cut-l px-5 pt-5.5 pb-6 md:mt-0 md:mx-0 md:gap-5 md:bg-transparent md:text-ink md:px-0 md:py-2 md:[clip-path:none]">
            <Eyebrow onInk className="md:hidden">مكتب تسويق واستثمار عقاري · جدة</Eyebrow>
            <Eyebrow className="hidden md:block">مكتب تسويق واستثمار عقاري · جدة</Eyebrow>
            <h1 className="m-0 text-h1 md:text-display font-extrabold">نقودك بثقة نحو القرار العقاري الصحيح</h1>
            <p className="m-0 text-body text-on-ink-muted md:text-muted md:text-[17px] md:leading-relaxed md:max-w-[520px]">
              وحدات حقيقية بأسعارها وسعر المتر، ودليل أسعار لكل حي، ومستشار يرد عليك على واتساب.<span className="hidden md:inline"> لا حسابات، لا وعود، أرقام أولاً.</span>
            </p>
            <div className="mt-1 flex gap-2 md:mt-1.5 md:gap-3">
              <Button href="#finder" size="m" className="flex-1 md:flex-none md:h-15 md:px-6 md:text-[16px]">
                ابحث بميزانيتك
                <ArrowIcon size={20} className="hidden md:block -rotate-90" />
              </Button>
              <Button href={waLink()} variant="ghost" size="m" icon={<WhatsAppIcon size={18} />} className="h-13 max-md:bg-transparent max-md:text-paper max-md:border-paper max-md:hover:bg-ink-2 md:h-15 md:px-5.5 md:text-[16px]">
                <Resp m="واتساب" d="كلّمنا على واتساب" />
              </Button>
            </div>
            <div className="hidden md:flex mt-3 pt-4.5 border-t-[1.5px] border-ink flex-wrap items-center gap-x-5 gap-y-2 text-label font-normal text-muted">
              <span><strong className="text-ink text-h3 me-1.5"><LiveAvailableCount /></strong>وحدات متاحة الآن</span>
              {trainees && <span><strong className="text-ink text-h3 me-1.5 tnum">{traineesNumber}</strong>متدرب مع المؤسس</span>}
              <span>مرخصون من الهيئة العامة للعقار · <span className="tnum" dir="ltr">{LICENCE.rega}</span></span>
            </div>
          </div>
          <div className="order-1 md:order-2 relative h-[460px] md:h-auto md:min-h-[600px] md:self-stretch md:cut-img-l-start">
            <ImageSlot slotId="IMG-HERO-BRAND" tier="generated" cut="none" label={false} showId={false} className="h-full w-full">
              <LogoMark size={96} className="absolute top-5 left-5 md:top-7 md:left-7 z-[1] opacity-95" />
              <IllustrativeLabel className="absolute top-4 start-4 z-[1]" />
              <span className="absolute top-11 start-4 z-[1] flex"><span dir="ltr" className="px-2 py-1 bg-paper text-caption font-normal text-muted leading-none whitespace-nowrap">IMG-HERO-BRAND</span></span>
            </ImageSlot>
          </div>
        </section>
        <div className="md:hidden flex justify-between gap-3 px-4 pt-3.5 text-caption text-muted">
          <span>مرخصون من الهيئة العامة للعقار · <span className="tnum" dir="ltr">{LICENCE.rega}</span></span>
          <span className="font-bold text-ink whitespace-nowrap"><LiveAvailableCount /> وحدات متاحة الآن</span>
        </div>

        {/* Finder */}
        <section className="mt-6 md:container-smq md:mt-24">
          <HomeFinder />
        </section>

        {/* Current project */}
        <section className="container-smq mt-9 md:mt-24">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="m-0 text-h2 md:text-[32px] font-extrabold">المشروع الحالي</h2>
            <Link href={`/projects/${project.slug}`} className="shrink-0 text-[12px] md:text-[14px] font-bold text-gold-text no-underline hover:text-ink hover:underline">
              <Resp m="كل التفاصيل" d="كل التفاصيل والنماذج" />
            </Link>
          </div>
          <div className="relative mt-3 md:mt-6 border-interactive md:grid md:grid-cols-2">
            <Link href={`/projects/${project.slug}`} className="block" aria-label={project.nameAr}>
              <ImageSlot slotId="IMG-PRJ-ROWDAH-EXT" tier="generated" cut="xl" className="h-[200px] md:h-full md:min-h-[380px]" as="div" />
            </Link>
            <div className="p-3.5 pb-4 flex flex-col gap-1.5 md:px-9 md:py-8 md:gap-3.5">
              <Eyebrow>حي الروضة، جدة · {project.statusAr}</Eyebrow>
              <h3 className="m-0 text-[22px] md:text-[36px] font-extrabold leading-tight">
                <Link href={`/projects/${project.slug}`} className="no-underline text-ink max-md:after:absolute max-md:after:inset-0">{project.nameAr}</Link>
              </h3>
              <p className="m-0 text-[13px] md:text-[15px] font-normal text-muted leading-relaxed">
                <span className="md:hidden">{buildingsLine} · <LiveProjectStat projectId={project.id} field="listed" /> نماذج · {aptsLine}{villas.length ? " وفلل روف" : ""}</span>
                <span className="hidden md:inline">{projectLineD}</span>
              </p>
              <div className="mt-1.5 pt-2.5 border-t border-line flex items-baseline justify-between gap-3 md:hidden">
                <span className="flex items-baseline gap-1.5 text-[12px] text-muted">من <LiveProjectFrom projectId={project.id} sign={false} className="text-[20px] font-extrabold text-ink" /></span>
                <span className="text-[12px] text-muted"><LiveProjectStat projectId={project.id} field="available" /> متاحة من <LiveProjectStat projectId={project.id} field="listed" /></span>
              </div>
              <div className="hidden md:grid grid-cols-3 mt-1.5 border-t-[1.5px] border-t-ink border-b border-b-line">
                <div className="flex flex-col gap-0.5 py-3.5 border-e border-line">
                  <LiveProjectFrom projectId={project.id} sign={false} className="text-[22px] font-extrabold" />
                  <span className="text-caption font-normal text-muted">تبدأ من</span>
                </div>
                <div className="flex flex-col gap-0.5 py-3.5 px-4 border-e border-line">
                  <span className="text-[22px] font-extrabold tnum"><LiveProjectStat projectId={project.id} field="available" /> <span className="text-label font-semibold text-muted">من <LiveProjectStat projectId={project.id} field="listed" /></span></span>
                  <span className="text-caption font-normal text-muted">وحدات متاحة</span>
                </div>
                <div className="flex flex-col gap-0.5 py-3.5 px-4">
                  <span className="text-[22px] font-extrabold tnum"><LiveProjectStat projectId={project.id} field="ppmMin" /></span>
                  <span className="text-caption font-normal text-muted">أقل سعر للمتر</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1 md:gap-2 md:mt-0">{project.features.map((f) => <Tag key={f}>{f}</Tag>)}</div>
              <div className="hidden md:block mt-1.5"><Button variant="secondary" size="s" href={`/projects/${project.slug}`} arrow className="h-12 px-5">صفحة المشروع</Button></div>
            </div>
          </div>
        </section>

        {/* Price guide */}
        <section className="bg-sand mt-9 md:mt-24 pt-7 pb-8 md:py-16">
          <div className="container-smq md:grid md:grid-cols-2 md:gap-10 md:items-start">
            <div className="flex flex-col md:gap-3.5">
              <div className="flex items-baseline justify-between md:block">
                <div className="flex flex-col md:gap-3.5">
                  <Eyebrow className="hidden md:block">دليل الأسعار</Eyebrow>
                  <h2 className="m-0 text-h2 md:text-[32px] font-extrabold"><span className="md:hidden">{`دليل الأسعار · ${guide.districtAr}`}</span><span className="hidden md:inline">{`ماذا تدفع في ${guide.districtAr}؟`}</span></h2>
                </div>
                <span className="text-caption text-muted md:hidden">{`تحديث ${fmtDate(guide.updatedAt)}`}</span>
              </div>
              <p className="hidden md:block m-0 text-body text-muted">أرقام من وحداتنا المدرجة، لا من إعلانات السوق. تتحدث مع كل وحدة جديدة، والتاريخ مكتوب تحت الجدول.</p>
              <div className="hidden md:block"><Button variant="ghost" size="m" href="/guide" arrow className="h-12 px-5 text-[14px]">الدليل الكامل لكل الأحياء</Button></div>
            </div>
            <div className="mt-3 md:mt-0 flex flex-col gap-3 md:gap-2.5">
              <RowGroup
                framed
                header={["النوع", "يبدأ من", "النطاق المعتاد", "للمتر"]}
                aria-label="دليل الأسعار"
                className="bg-paper md:[&>*]:grid-cols-[1.4fr_1fr_1fr_1fr] max-md:[&>*>:nth-child(4)]:hidden md:[&>*]:px-5 md:[&>*]:gap-4"
              >
                {guideRows.map((r) => (
                  <Row key={r.label} className="md:py-4" cells={[<span key="l" className="font-bold md:text-[15px]">{r.label}</span>, <Price key="f" value={r.from ?? 0} className="text-[16px] md:text-h3 font-extrabold" sign={false} />, <span key="r" className="text-caption md:text-label font-normal text-muted md:whitespace-nowrap">{r.range}</span>, <span key="p" className="text-label font-normal text-muted tnum">{r.ppm}</span>]} />
                ))}
              </RowGroup>
              <p className="m-0 text-caption text-muted">
                <span className="hidden md:inline">{`حي ${guide.districtAr}، جدة · ${guide.listed} وحدات مدرجة · تحديث ${fmtDate(guide.updatedAt)}`}</span>
                <span className="md:hidden">سعر المتر في الحي بين <strong className="text-ink tnum">{fmtNum(guide.ppm?.min ?? minPpm)}</strong> و<strong className="text-ink tnum">{fmtNum(guide.ppm?.max ?? minPpm)}</strong> ريال حسب النموذج والطابق.</span>
              </p>
              <div className="md:hidden"><Button variant="ghost" size="s" href="/guide" arrow className="h-11 px-4">الدليل الكامل لكل الأحياء</Button></div>
            </div>
          </div>
        </section>

        {/* Services · phone: a hairlined list (Home-M); desktop: five cards (Home-D) */}
        <section className="container-smq mt-9 md:mt-24">
          <h2 className="m-0 text-h2 md:text-[32px] font-extrabold">ماذا نفعل</h2>
          <div className="mt-3.5 flex flex-col border-t-[1.5px] border-ink md:mt-7 md:grid md:grid-cols-5 md:gap-4 md:border-t-0">
            {SERVICES.map((s) => (
              <Link key={s.n} href={s.href} className="flex items-center gap-3.5 py-3.5 border-b border-line no-underline text-ink hover:bg-sand motion-hover transition-colors md:flex-col md:items-start md:p-6 md:min-h-[180px] md:border-interactive">
                <HexNumber size={40}>{s.n}</HexNumber>
                <span className="flex flex-col gap-0.5 md:gap-3.5">
                  <span className="text-[15px] font-bold md:text-h3 md:font-extrabold">{s.title}</span>
                  <span className="text-[12px] md:text-label font-normal text-muted leading-relaxed">
                    <Resp m={s.text} d={`${s.text}.`} />
                  </span>
                </span>
              </Link>
            ))}
            <Link href="/add" className="flex items-center gap-3.5 py-3.5 border-b-[1.5px] border-ink no-underline text-ink hover:bg-sand motion-hover transition-colors md:flex-col md:items-start md:p-6 md:min-h-[180px] md:border-b-0 md:bg-ink md:text-paper md:cut-l md:hover:bg-ink-2">
              <HexNumber size={40} tone="ink" className="md:bg-gold md:text-ink">05</HexNumber>
              <span className="flex flex-col gap-0.5 md:gap-3.5">
                <span className="text-[15px] font-bold md:text-h3 md:font-extrabold">أضف عقارك</span>
                <span className="text-[12px] md:text-label font-normal text-muted md:text-on-ink-muted leading-relaxed">
                  <Resp m="تملك وحدة؟ نسوقها لك مجاناً حتى البيع" d="تملك وحدة؟ نسوقها لك مجاناً حتى البيع." />
                </span>
              </span>
            </Link>
          </div>
        </section>

        {/* Founder and licences · desktop: founder over two columns, the two licences stacked in the third */}
        <section className="container-smq mt-9 md:mt-24 grid gap-3.5 md:grid-cols-3 md:gap-10 md:items-start">
          <div className="flex flex-col gap-3.5 md:col-span-2">
            <div className="flex items-start gap-3.5 md:gap-6">
              <div className="shrink-0 w-28 h-34 md:w-50 md:h-62.5 bg-slot cut-img-start flex items-center justify-center text-center p-2 md:p-3">
                <span className="text-caption text-muted font-semibold leading-relaxed">
                  صورة المؤسس
                  <br />
                  <Resp m="فعلية فقط" d="فعلية فقط، لا تُولَّد" />
                  <br />
                  <span dir="ltr">IMG-FOUNDER · 4:5</span>
                </span>
              </div>
              <div className="flex flex-col gap-1.5 md:gap-2.5 min-w-0">
                <Eyebrow>المؤسس</Eyebrow>
                <span className="text-[22px] md:text-[32px] font-extrabold leading-tight">سعود معيض</span>
                <span className="text-[13px] md:text-[15px] text-muted">خبير ومستشار عقاري</span>
                <span className="mt-1 md:mt-1.5 flex items-baseline gap-1.5 md:gap-2">
                  <span className="text-[26px] md:text-[36px] font-extrabold leading-none tnum">{traineesNumber}</span>
                  <span className="text-caption md:text-label font-normal text-muted">
                    <Resp m="متدرب في برامجه" d="متدرب في برامجه ودوراته المتخصصة" />
                  </span>
                </span>
                <p className="hidden md:block m-0 mt-1.5 text-[15px] leading-[1.8]">نؤمن أن العقار قرار استثماري يتطلب تحليلاً دقيقاً ورؤية واضحة. لذلك نعرض الأرقام أولاً، ثم نجلس معك.</p>
                <Link href="/about" className="hidden md:inline self-start text-[14px] font-bold text-gold-text no-underline hover:text-ink hover:underline">قصة SMQ ومنهجها</Link>
              </div>
            </div>
            <p className="md:hidden m-0 text-body">نؤمن أن العقار قرار استثماري يتطلب تحليلاً دقيقاً ورؤية واضحة. لذلك نعرض الأرقام أولاً، ثم نجلس معك.</p>
            <Link href="/about" className="md:hidden self-start text-label font-bold text-gold-text no-underline hover:text-ink hover:underline">قصة SMQ ومنهجها</Link>
          </div>
          <div className="flex flex-col gap-3">
            <Eyebrow className="hidden md:block">مرخصون ومنظمون</Eyebrow>
            <div className="mt-1.5 grid grid-cols-2 gap-2.5 md:mt-0 md:grid-cols-1 md:gap-3">
              <div className="bg-ink text-paper cut-m p-3.5 md:px-5 md:py-4.5 flex flex-col gap-1"><span className="text-caption font-semibold text-on-ink-muted leading-snug">ترخيص الهيئة العامة للعقار</span><span className="text-[16px] md:text-[22px] font-extrabold tnum text-right" dir="ltr">{LICENCE.rega}</span></div>
              <div className="bg-ink text-paper cut-m p-3.5 md:px-5 md:py-4.5 flex flex-col gap-1"><span className="text-caption font-semibold text-on-ink-muted leading-snug">السجل التجاري</span><span className="text-[16px] md:text-[22px] font-extrabold tnum text-right" dir="ltr">{LICENCE.cr}</span></div>
            </div>
          </div>
        </section>

        {/* FAQ · the draft answers carry the «مسودة إجابة» chip inside the answer, as on the boards */}
        <section className="container-smq mt-9 md:mt-24 grid gap-3.5 md:grid-cols-3 md:gap-10 md:items-start">
          <div className="flex flex-col gap-3">
            <h2 className="m-0 text-h2 md:text-[32px] font-extrabold">أسئلة تصلنا كثيراً</h2>
            <p className="hidden md:block m-0 text-body text-muted">لم تجد سؤالك؟ اكتبه لنا على واتساب.</p>
          </div>
          <Accordion
            className="md:col-span-2 [&_summary]:text-[15px] md:[&_summary]:text-[17px] [&_summary]:py-3.5 [&_details>div]:text-[13px] md:[&_details>div]:text-[14px]"
            items={homeFaq.map((f, i) => ({ id: `home-faq-${i}`, q: f.q, a: f.draft ? <Mark>{f.a}</Mark> : f.a, defaultOpen: i === 0 }))}
          />
        </section>

        {/* Contact · the office map shows on desktop only (Home-D; Home-M has none) */}
        <section className="bg-sand mt-9 md:mt-24 pt-7 pb-8 md:py-16">
          <div className="container-smq grid gap-6 md:grid-cols-2 md:gap-10">
            <div className="flex flex-col gap-3 md:gap-3.5">
              <h2 className="m-0 text-h2 md:text-[32px] font-extrabold">كلّمنا الآن</h2>
              <Button href={waLink()} size="l" between full className="md:h-15 md:text-[17px]">
                <span className="flex items-center gap-2"><WhatsAppIcon size={20} />واتساب</span>
                <span className="tnum text-[15px] md:text-[16px]" dir="ltr">{WA_DISPLAY}</span>
              </Button>
              <Button href={`tel:${PHONE_TEL}`} variant="ghost" size="l" between full className="h-13 md:h-14 md:text-[16px]">
                <span>اتصال</span>
                <span className="tnum" dir="ltr">{PHONE_DISPLAY}</span>
              </Button>
              <div className="grid grid-cols-2 gap-2.5 mt-1 md:gap-4 md:mt-1.5">
                <div className="flex flex-col gap-1"><span className="text-caption md:text-[12px] font-bold text-muted">ساعات العمل</span><span className="text-label md:text-[14px] font-semibold">{settings.hours.days}<br />{settings.hours.from} إلى {settings.hours.to}</span></div>
                <div className="flex flex-col gap-1"><span className="text-caption md:text-[12px] font-bold text-muted">المكتب</span><span className="text-label md:text-[14px] font-semibold">{settings.office.addressAr}</span></div>
              </div>
            </div>
            <div className="hidden md:block">
              <MapEmbed
                lat={settings.office.lat}
                lng={settings.office.lng}
                lang="ar"
                title="خريطة Google بموقع المكتب"
                placeholder="office"
                placeholderChip="خريطة Google بموقع المكتب"
                placeholderCaption="مكتب SMQ · حي الفيصلية"
                placeholderCaptionShort="مكتب SMQ · حي الفيصلية"
                forceEmbedUrl={settings.office.embedUrlAr}
                frameClassName="h-[300px]"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
