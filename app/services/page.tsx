// /services · Services-M / Services-D: four services with anchors #buy #sell #invest #consult, the fifth door for owners.
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon, Button, Eyebrow, Footer, Header, HexNumber, Mark } from "@/components/ui";
import { ServicesNav } from "@/components/pages/g1/ServicesNav";
import { Resp, shellFooterLinks } from "@/components/pages/g1/shell";
import { cx, waLink } from "@/lib/format";

export const metadata = { title: "الخدمات" };

interface Line {
  k: string;
  m: ReactNode;
  d: ReactNode;
}
interface Service {
  id: string;
  n: string;
  nav: string;
  title: string;
  lead: string;
  lines: Line[];
  tone: "paper" | "sand" | "ink";
  framed?: boolean;
  actions: ReactNode;
}

const consultLine = (
  <>
    جلسة 60 دقيقة <Mark>[للتأكيد]</Mark>، قراءة لوضعك، وتوصية مكتوبة بالخطوات.
  </>
);

const SERVICES: Service[] = [
  {
    id: "buy",
    n: "01",
    nav: "01 الشراء",
    title: "شراء العقارات",
    lead: "تبدأ بميزانيتك لا بالإعلانات. نفلتر السوق على ما تدفعه فعلاً، نزور معك، ونرافقك حتى الإفراغ.",
    lines: [
      { k: "ماذا نفعل:", m: "قائمة مختصرة بما يناسبك من وحداتنا والسوق، زيارات مرتبة، تفاوض على السعر، متابعة التمويل والإفراغ.", d: "قائمة مختصرة بما يناسبك، زيارات مرتبة، تفاوض على السعر، متابعة التمويل والإفراغ." },
      { k: "لمن:", m: "العائلة التي تشتري بيتها الأول، والمشتري الذي يريد رأياً محايداً قبل التوقيع.", d: "العائلة التي تشتري بيتها الأول، والمشتري الذي يريد رأياً محايداً قبل التوقيع." },
      { k: "تحتاج منك:", m: "الميزانية، الحي المفضل، عدد الغرف، وموعد السكن.", d: "الميزانية، الحي المفضل، عدد الغرف، وموعد السكن." },
    ],
    tone: "paper",
    framed: true,
    actions: (
      <>
        <Button href={waLink("أريد شراء عقار")} size="s" className="h-11 px-4">
          ابدأ على واتساب
        </Button>
        <Button href="/#finder" variant="ghost" size="s" className="h-11 px-4">
          جرّب الميزانية
        </Button>
      </>
    ),
  },
  {
    id: "sell",
    n: "02",
    nav: "02 البيع",
    title: "بيع العقارات",
    lead: "تقييم واقعي بسعر المتر في حيّك، تصوير احترافي، وتسويق لعملاء جاهزين عندنا قبل أن يُنشر إعلانك.",
    lines: [
      { k: "ماذا نفعل:", m: "تقييم مكتوب، تصوير، نشر على منصتنا وقنواتنا، فرز المشترين، التفاوض، وإتمام الإفراغ.", d: "تقييم مكتوب، تصوير، نشر على منصتنا وقنواتنا، فرز المشترين، التفاوض، وإتمام الإفراغ." },
      { k: "لمن:", m: "المالك الذي يريد سعراً عادلاً وبيعاً نظيفاً بلا عشرات المكالمات.", d: "المالك الذي يريد سعراً عادلاً وبيعاً نظيفاً بلا عشرات المكالمات." },
      { k: "تحتاج منك:", m: "الصك، المساحة، والموقع. الباقي علينا.", d: "الصك، المساحة، والموقع. الباقي علينا." },
    ],
    tone: "sand",
    actions: (
      <>
        <Button href="/add" variant="secondary" size="s" className="h-11 px-4">
          أضف عقارك مجاناً
        </Button>
        <Button href={waLink("أريد بيع عقاري")} variant="ghost" size="s" className="h-11 px-4">
          واتساب
        </Button>
      </>
    ),
  },
  {
    id: "invest",
    n: "03",
    nav: "03 الاستثمار",
    title: "الاستثمار العقاري",
    lead: "فرص مدروسة بالأرقام، لا بالوعود. نحسب العائد والمدة والمخاطر قبل أن نقترح، ونقول لك أيضاً متى لا تشتري.",
    lines: [
      { k: "ماذا نفعل:", m: "دراسة الفرصة، مقارنة سعر المتر بالحي، تقدير الإيجار أو إعادة البيع، ومتابعة الصفقة.", d: "دراسة الفرصة، مقارنة سعر المتر بالحي، تقدير الإيجار أو إعادة البيع، ومتابعة الصفقة." },
      { k: "لمن:", m: "المستثمر الصغير الذي يبدأ بوحدة أو وحدتين ويريد قراراً يُحاسَب عليه بالأرقام.", d: "المستثمر الصغير الذي يبدأ بوحدة أو وحدتين ويريد قراراً يُحاسَب عليه بالأرقام." },
    ],
    tone: "paper",
    actions: (
      <Button href={waLink("أريد استشارة استثمارية")} size="s" className="h-11 px-4">
        اعرض فرصة على واتساب
      </Button>
    ),
  },
  {
    id: "consult",
    n: "04",
    nav: "04 الاستشارات",
    title: "الاستشارات العقارية",
    lead: "جلسة واحدة مع سعود معيض توفر عليك سنوات من التجربة. تأتي بسؤالك، وتخرج بقرار مكتوب ومبرر.",
    lines: [
      { k: "ماذا نفعل:", m: consultLine, d: consultLine },
      { k: "لمن:", m: "من يقف أمام قرار كبير: يشتري أم يستأجر، يبيع الآن أم ينتظر، يستثمر هنا أم هناك.", d: "من يقف أمام قرار كبير: يشتري أم يستأجر، يبيع الآن أم ينتظر." },
    ],
    tone: "ink",
    actions: (
      <Button href={waLink("أريد حجز استشارة")} size="s" className="h-11 px-4">
        احجز استشارة على واتساب
      </Button>
    ),
  },
];

function ServiceBlock({ s }: { s: Service }) {
  const ink = s.tone === "ink";
  return (
    <article
      id={s.id}
      className={cx(
        "scroll-mt-[100px] md:scroll-mt-20 flex flex-col gap-4 px-4 py-7 md:p-8 md:gap-5",
        ink ? "bg-ink text-paper cut-xl" : s.tone === "sand" ? "bg-sand" : "bg-paper",
        s.framed && "md:border-interactive",
        // the desktop grid frames the first card; the phone sections run full width
        s.tone === "paper" && !s.framed && "md:bg-sand",
      )}
    >
      <div className="flex items-center gap-3">
        <HexNumber size={40} tone="gold">
          {s.n}
        </HexNumber>
        <h2 className="m-0 text-[24px] md:text-h2 font-extrabold leading-tight">{s.title}</h2>
      </div>
      <p className={cx("m-0 text-body md:text-[15px]", ink ? "text-on-ink-muted" : "text-muted")}>{s.lead}</p>
      <div className="flex flex-col gap-2 text-label md:text-[14px] font-normal leading-relaxed">
        {s.lines.map((l) => (
          <span key={l.k}>
            <strong className="font-extrabold">{l.k}</strong> <Resp m={l.m} d={l.d} />
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2.5 mt-1">{s.actions}</div>
    </article>
  );
}

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-ink text-paper">
          <div className="container-smq py-8 md:py-14 md:grid md:grid-cols-2 md:gap-10 md:items-end">
            <div>
              <Eyebrow onInk>الخدمات</Eyebrow>
              <h1 className="m-0 mt-2 text-h1 md:text-[48px] font-extrabold leading-tight">أربع خدمات، ومستشار واحد يرد عليك</h1>
            </div>
            <p className="m-0 mt-3 md:mt-0 text-body md:text-[16px] text-on-ink-muted leading-relaxed">لا نمرر طلبك بين أقسام. اختر الخدمة، واكتب لنا على واتساب، ويتابعك الشخص نفسه من أول رسالة إلى الإفراغ.</p>
          </div>
        </section>

        <ServicesNav items={SERVICES.map((s) => ({ id: s.id, label: s.nav }))} className="md:hidden" />

        <section className="md:container-smq md:py-12 md:grid md:grid-cols-2 md:gap-5">
          {SERVICES.map((s) => (
            <ServiceBlock key={s.id} s={s} />
          ))}
        </section>

        <section className="container-smq py-8 md:pb-16 md:pt-0 flex flex-col gap-2.5">
          <Eyebrow className="md:hidden">خدمة خامسة للمُلّاك</Eyebrow>
          <Link href="/add" className="flex items-center justify-between gap-4 border-interactive p-4 md:p-6 no-underline text-ink hover:bg-sand motion-hover transition-colors">
            <span className="flex flex-col gap-1">
              <Eyebrow className="hidden md:block" as="span">
                خدمة خامسة للمُلّاك
              </Eyebrow>
              <span className="text-h3 md:text-[22px] font-extrabold leading-tight">أضف عقارك</span>
              <span className="text-caption md:text-label font-normal text-muted">أربع خطوات، نموذج قصير، ونسوقه لك مجاناً حتى البيع.</span>
            </span>
            <ArrowIcon size={22} className="shrink-0 md:hidden" />
            <span className="hidden md:inline-flex items-center gap-2 h-11 px-4 bg-ink text-paper text-label font-extrabold cut-m shrink-0">
              ابدأ الآن
              <ArrowIcon size={18} className="text-gold" />
            </span>
          </Link>
        </section>
      </main>
      <Footer compact links={shellFooterLinks("/services")} />
    </>
  );
}
