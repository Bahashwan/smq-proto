import Link from "next/link";
import { Accordion, Button, Eyebrow, Footer, Header, HexNumber, ImageSlot, LogoMark, Mark, Price, Row, RowGroup, SectionHeading, Tag, WhatsAppIcon, PhoneIcon, LICENCE, PHONE_DISPLAY, PHONE_TEL, WA_DISPLAY } from "@/components/ui";
import { MapEmbed } from "@/components/map";
import { HomeFinder } from "@/components/pages/g1/HomeFinder";
import { countsByStatus, guideTables, projectStats, unitPpm } from "@/data/selectors";
import { projectById } from "@/data/projects";
import { homeFaq, proofNumbers } from "@/data/content";
import { settings } from "@/data/settings";
import { fmtNum, fmtDate, waLink } from "@/lib/format";

export const metadata = {
  title: "إس إم كيو العقارية · وحدات بأسعار معلنة في جدة",
  openGraph: { title: "شقق وفلل روف بأسعار معلنة في جدة", description: "ابدأ من ميزانيتك. لا «اتصل للسعر».", images: [{ url: "/og/home.png", width: 1200, height: 630 }] },
};

const SERVICES = [
  { n: "01", title: "شراء العقارات", text: "نفلتر السوق على ميزانيتك ونرافقك حتى الإفراغ.", href: "/services#buy" },
  { n: "02", title: "بيع العقارات", text: "تقييم واقعي، تصوير، وتسويق لعملاء جاهزين.", href: "/services#sell" },
  { n: "03", title: "الاستثمار العقاري", text: "فرص مدروسة بالأرقام، لا بالوعود.", href: "/services#invest" },
  { n: "04", title: "الاستشارات العقارية", text: "جلسة واحدة توفر عليك سنوات من التجربة.", href: "/services#consult" },
];

function thousands(from: number, to: number): string {
  if (to >= 1_000_000) return `${(from / 1_000_000).toFixed(2)} إلى ${(to / 1_000_000).toFixed(2)} مليون`;
  return `${Math.round(from / 1000)} إلى ${Math.round(to / 1000)} ألف`;
}

export default function HomePage() {
  const counts = countsByStatus();
  const project = projectById("rwd-01")!;
  const stats = projectStats("rwd-01");
  const guide = guideTables("rawdah");
  const trainees = proofNumbers.find((p) => p.key === "trainees");
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

  return (
    <>
      <Header showEn />
      <main>
        {/* Hero */}
        <section className="flex flex-col md:container-smq md:grid md:grid-cols-2 md:gap-12 md:items-center md:py-16">
          <div className="order-2 md:order-1 bg-ink text-paper cut-l px-5 py-7 md:mt-0 md:mx-0 md:bg-transparent md:text-ink md:p-0 md:[clip-path:none]">
            <Eyebrow onInk className="md:hidden">مكتب تسويق واستثمار عقاري · جدة</Eyebrow>
            <Eyebrow className="hidden md:block">مكتب تسويق واستثمار عقاري · جدة</Eyebrow>
            <h1 className="mt-2 text-h1 md:text-display font-extrabold">نقودك بثقة نحو القرار العقاري الصحيح</h1>
            <p className="mt-3 text-body text-on-ink-muted md:text-muted md:text-[17px] md:leading-relaxed">
              وحدات حقيقية بأسعارها وسعر المتر، ودليل أسعار لكل حي، ومستشار يرد عليك على واتساب.<span className="hidden md:inline"> لا حسابات، لا وعود، أرقام أولاً.</span>
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href="#finder" size="m" arrow className="md:text-[16px]">ابحث بميزانيتك</Button>
              <Button href={waLink()} variant="ghost" size="m" icon={<WhatsAppIcon size={20} />} className="border-paper text-paper md:border-ink md:text-ink">
                <span className="md:hidden">واتساب</span><span className="hidden md:inline">كلّمنا على واتساب</span>
              </Button>
            </div>
            <div className="hidden md:flex mt-8 flex-wrap items-center gap-x-8 gap-y-2 text-label font-normal text-muted">
              <span><strong className="text-ink text-h3 me-1.5">{counts.available}</strong>وحدات متاحة الآن</span>
              {trainees && <span><strong className="text-ink text-h3 me-1.5">+2000</strong>متدرب مع المؤسس</span>}
              <span>مرخصون من الهيئة العامة للعقار · <span className="tnum">{LICENCE.rega}</span></span>
            </div>
          </div>
          <figure className="order-1 md:order-2 relative m-0 bg-slot h-[460px] md:h-auto md:aspect-[4/5] md:max-h-[640px] md:cut-xl">
            <ImageSlot slotId="IMG-HERO-BRAND" tier="generated" cut="none" className="absolute inset-0 h-full" as="div" label>
              <LogoMark size={96} className="absolute top-6 left-6 md:top-8 md:left-8 z-[1] opacity-95" />
            </ImageSlot>
          </figure>
        </section>
        <div className="md:hidden flex justify-between gap-3 px-4 pt-4 text-caption text-muted">
          <span>مرخصون من الهيئة العامة للعقار · <span className="tnum">{LICENCE.rega}</span></span>
          <span className="font-bold text-ink whitespace-nowrap">{counts.available} وحدات متاحة الآن</span>
        </div>

        {/* Finder */}
        <section className="mt-6 md:container-smq md:mt-10">
          <HomeFinder />
        </section>

        {/* Current project */}
        <section className="container-smq mt-10 md:mt-24">
          <SectionHeading title="المشروع الحالي" link={{ label: "كل التفاصيل والنماذج", href: `/projects/${project.slug}` }} size="l" />
          <div className="mt-4 border-interactive md:grid md:grid-cols-2">
            <Link href={`/projects/${project.slug}`} className="block">
              <ImageSlot slotId="IMG-PRJ-ROWDAH-EXT" tier="generated" cut="xl" className="h-[200px] md:h-full md:min-h-[360px]" as="div" />
            </Link>
            <div className="p-5 md:p-10 flex flex-col gap-3">
              <Eyebrow>حي الروضة، جدة · {project.statusAr}</Eyebrow>
              <h3 className="m-0 text-[22px] md:text-[36px] font-extrabold leading-tight">{project.nameAr}</h3>
              <p className="m-0 text-label font-normal md:text-body text-muted">
                <span className="md:hidden">عمارتان، روز وياسمين · {stats.listed} نماذج · شقق من غرفتين إلى 3 غرف وفلل روف</span>
                <span className="hidden md:inline">{project.descriptionAr}</span>
              </p>
              <div className="flex items-baseline justify-between gap-3 md:hidden">
                <span className="text-caption text-muted">من <Price value={stats.fromPrice ?? 0} className="text-[20px] font-extrabold text-ink" /></span>
                <span className="text-caption text-muted">{stats.available} متاحة من {stats.listed}</span>
              </div>
              <div className="hidden md:grid grid-cols-3 gap-4 mt-2">
                <div><Price value={stats.fromPrice ?? 0} className="text-[22px] font-extrabold" /><div className="text-caption text-muted">تبدأ من</div></div>
                <div><span className="text-[22px] font-extrabold tnum">{stats.available}</span> <span className="text-label text-muted">من {stats.listed}</span><div className="text-caption text-muted">وحدات متاحة</div></div>
                <div><span className="text-[22px] font-extrabold tnum">{stats.ppm ? fmtNum(stats.ppm.min) : "—"}</span><div className="text-caption text-muted">أقل سعر للمتر</div></div>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">{project.features.map((f) => <Tag key={f}>{f}</Tag>)}</div>
              <div className="hidden md:block mt-3"><Button variant="secondary" size="s" href={`/projects/${project.slug}`} arrow>صفحة المشروع</Button></div>
            </div>
          </div>
        </section>

        {/* Price guide */}
        <section className="bg-sand mt-10 md:mt-24 py-8 md:py-16">
          <div className="container-smq md:grid md:grid-cols-2 md:gap-12 md:items-start">
            <div>
              <div className="flex items-baseline justify-between md:block">
                <div>
                  <Eyebrow className="hidden md:block">دليل الأسعار</Eyebrow>
                  <h2 className="m-0 text-h2 md:text-[32px] font-extrabold"><span className="md:hidden">دليل الأسعار · {guide.districtAr}</span><span className="hidden md:inline">ماذا تدفع في {guide.districtAr}؟</span></h2>
                </div>
                <span className="text-caption text-muted md:hidden">تحديث {fmtDate(guide.updatedAt)}</span>
              </div>
              <p className="hidden md:block mt-3 text-body text-muted">أرقام من وحداتنا المدرجة، لا من إعلانات السوق. تتحدث مع كل وحدة جديدة، والتاريخ مكتوب تحت الجدول.</p>
              <div className="hidden md:block mt-5"><Button variant="ghost" size="m" href="/guide" arrow>الدليل الكامل لكل الأحياء</Button></div>
            </div>
            <div className="mt-3 md:mt-0">
              <RowGroup framed header={["النوع", "يبدأ من", "النطاق المعتاد", <span key="ppm" className="hidden md:inline">للمتر</span>]} columns="1.4fr 1fr 1fr" aria-label="دليل الأسعار" className="bg-paper md:[&>*]:grid-cols-[1.4fr_1fr_1fr_1fr]">
                {guideRows.map((r) => (
                  <Row key={r.label} cells={[<span key="l" className="font-bold">{r.label}</span>, <Price key="f" value={r.from ?? 0} className="text-[16px] md:text-h3 font-extrabold" sign={false} />, <span key="r" className="text-caption md:text-label font-normal text-muted">{r.range}</span>, <span key="p" className="hidden md:inline text-label font-normal text-muted tnum">{r.ppm}</span>]} />
                ))}
              </RowGroup>
              <p className="m-0 mt-2 text-caption text-muted">
                <span className="hidden md:inline">حي {guide.districtAr}، جدة · {guide.listed} وحدات مدرجة · تحديث {fmtDate(guide.updatedAt)}</span>
                <span className="md:hidden">سعر المتر في الحي بين <strong className="text-ink tnum">{fmtNum(guide.ppm?.min ?? minPpm)}</strong> و<strong className="text-ink tnum">{fmtNum(guide.ppm?.max ?? minPpm)}</strong> ريال، من {guide.listed} وحدات مدرجة.</span>
              </p>
              <div className="md:hidden mt-4"><Button variant="ghost" size="s" href="/guide" arrow full>الدليل الكامل لكل الأحياء</Button></div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="container-smq mt-10 md:mt-24">
          <h2 className="m-0 text-h2 md:text-[32px] font-extrabold">ماذا نفعل</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5 md:gap-4">
            {SERVICES.map((s) => (
              <Link key={s.n} href={s.href} className="flex md:flex-col gap-3 md:gap-4 border-interactive p-4 md:p-5 hover:bg-sand motion-hover transition-colors">
                <HexNumber size={40}>{s.n}</HexNumber>
                <span className="flex flex-col gap-1">
                  <span className="text-h3 font-extrabold">{s.title}</span>
                  <span className="text-label font-normal text-muted">{s.text}</span>
                </span>
              </Link>
            ))}
            <Link href="/add" className="flex md:flex-col gap-3 md:gap-4 bg-ink text-paper cut-l p-4 md:p-5 hover:bg-ink-2 motion-hover transition-colors">
              <HexNumber size={40}>05</HexNumber>
              <span className="flex flex-col gap-1">
                <span className="text-h3 font-extrabold">أضف عقارك</span>
                <span className="text-label font-normal text-on-ink-muted">تملك وحدة؟ نسوقها لك مجاناً حتى البيع.</span>
              </span>
            </Link>
          </div>
        </section>

        {/* Founder and licences */}
        <section className="container-smq mt-10 md:mt-24 grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="flex gap-5 md:gap-8">
            <div className="shrink-0 w-[140px] h-[175px] md:w-[200px] md:h-[250px] bg-slot cut-img flex items-center justify-center text-center p-3">
              <span className="text-caption text-muted leading-relaxed">صورة المؤسس<br />فعلية فقط، لا تُولَّد<br />IMG-FOUNDER · 4:5</span>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <Eyebrow>المؤسس</Eyebrow>
              <span className="text-h2 md:text-[32px] font-extrabold leading-tight">سعود معيض</span>
              <span className="text-body text-muted">خبير ومستشار عقاري</span>
              <span className="mt-2 flex items-baseline gap-2"><span className="text-price-s md:text-[36px] font-extrabold tnum">+2000</span><span className="text-label font-normal text-muted">متدرب في برامجه ودوراته المتخصصة <Mark>[للتأكيد]</Mark></span></span>
              <p className="m-0 mt-2 text-body">نؤمن أن العقار قرار استثماري يتطلب تحليلاً دقيقاً ورؤية واضحة. لذلك نعرض الأرقام أولاً، ثم نجلس معك.</p>
              <Link href="/about" className="mt-1 text-label font-bold text-ink underline underline-offset-4">قصة SMQ ومنهجها</Link>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Eyebrow>مرخصون ومنظمون</Eyebrow>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-ink text-paper cut-m p-4 md:p-5 flex flex-col gap-1"><span className="text-caption text-on-ink-muted">ترخيص الهيئة العامة للعقار</span><span className="text-[22px] font-extrabold tnum">{LICENCE.rega}</span></div>
              <div className="bg-ink text-paper cut-m p-4 md:p-5 flex flex-col gap-1"><span className="text-caption text-on-ink-muted">السجل التجاري</span><span className="text-[22px] font-extrabold tnum">{LICENCE.cr}</span></div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container-smq mt-10 md:mt-24 grid gap-5 md:grid-cols-[1fr_1.4fr] md:gap-12">
          <div>
            <h2 className="m-0 text-h2 md:text-[32px] font-extrabold">أسئلة تصلنا كثيراً</h2>
            <p className="mt-2 text-body text-muted">لم تجد سؤالك؟ اكتبه لنا على واتساب.</p>
          </div>
          <Accordion items={homeFaq.map((f, i) => ({ id: `home-faq-${i}`, q: f.q, a: f.draft ? <Mark>[مسودة إجابة]</Mark> : f.a, draft: f.draft, defaultOpen: i === 0 }))} />
        </section>

        {/* Contact */}
        <section className="bg-sand mt-10 md:mt-24 py-8 md:py-16">
          <div className="container-smq grid gap-6 md:grid-cols-2 md:gap-12">
            <div className="flex flex-col gap-3">
              <h2 className="m-0 text-h2 md:text-[32px] font-extrabold">كلّمنا الآن</h2>
              <Button href={waLink()} variant="whatsapp" size="l" between className="md:text-[17px]"><span className="flex items-center gap-2"><WhatsAppIcon size={22} />واتساب</span><span className="tnum font-bold">{WA_DISPLAY}</span></Button>
              <Button href={PHONE_TEL} variant="ghost" size="l" between className="bg-paper"><span className="flex items-center gap-2"><PhoneIcon size={20} />اتصال</span><span className="tnum">{PHONE_DISPLAY}</span></Button>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1"><span className="text-caption font-bold text-muted">ساعات العمل</span><span className="text-label font-semibold">{settings.hours.days}<br />{settings.hours.from} إلى {settings.hours.to}</span></div>
                <div className="flex flex-col gap-1"><span className="text-caption font-bold text-muted">المكتب</span><span className="text-label font-semibold">{settings.office.addressAr}</span></div>
              </div>
            </div>
            <MapEmbed lat={settings.office.lat} lng={settings.office.lng} lang="ar" title="خريطة Google بموقع المكتب" placeholder="office" forceEmbedUrl={settings.office.embedUrlAr} directionsHref={settings.office.mapsLink} className="min-h-[280px] md:min-h-[360px]" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
