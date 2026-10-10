// /privacy · Privacy-M / Privacy-D: short policy with a sticky contents list on desktop.
import type { ReactNode } from "react";
import { EMAIL, Eyebrow, Footer, Header, LICENCE, Mark, WA_URL } from "@/components/ui";
import { Resp, shellFooterLinks } from "@/components/pages/g1/shell";
import { settings } from "@/data/settings";

export const metadata = { title: "الخصوصية" };

const UPDATED = "2026/10/01";

interface Section {
  id: string;
  title: string;
  m: ReactNode;
  d: ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "c1",
    title: "ما نجمعه",
    m: "رقم جوالك واسمك فقط حين تكتبهما أنت: في نموذج التواصل، أو «نبّهني»، أو «أضف عقارك». ضغطة واتساب أو اتصال لا تعطينا رقمك؛ نسجّل أنها حدثت ومن أي صفحة، برمز مثل SMQ-8F3A2 لنعرف أي وحدة سألت عنها حين تراسلنا.",
    d: "رقم جوالك واسمك فقط حين تكتبهما أنت: في نموذج التواصل، أو «نبّهني»، أو «أضف عقارك». ضغطة واتساب أو اتصال لا تعطينا رقمك؛ نسجّل أنها حدثت ومن أي صفحة، برمز مثل SMQ-8F3A2 لنعرف أي وحدة سألت عنها حين تراسلنا.",
  },
  {
    id: "c2",
    title: "ما نحسبه بلا أسماء",
    m: "ما يبحث عنه الزوار: الميزانيات والأحياء والغرف، والصفحات الأكثر زيارة. أرقام مجمّعة تساعدنا على معرفة ما ينقص السوق، ولا تُربط بشخص.",
    d: "ما يبحث عنه الزوار: الميزانيات والأحياء والغرف، والصفحات الأكثر زيارة. أرقام مجمّعة تساعدنا على معرفة ما ينقص السوق، ولا تُربط بشخص. ننشر بعضها في دليل الأسعار كاتجاهات، لا كأفراد.",
  },
  {
    id: "c3",
    title: "لماذا نستخدمه",
    m: "للرد عليك، ولنرسل لك ما طلبته فقط (سعر مشروع عند إطلاقه، أو وحدة تطابق «نبّهني»). رسالة واحدة لكل طلب، وتوقف الرسائل بكلمة «توقف» على واتساب.",
    d: "للرد عليك، ولنرسل لك ما طلبته فقط: سعر مشروع عند إطلاقه، أو وحدة تطابق «نبّهني». رسالة واحدة لكل طلب، وتوقف الرسائل بكلمة «توقف» على واتساب.",
  },
  {
    id: "c4",
    title: "مع من نشاركه",
    m: "لا أحد خارج فريق SMQ، إلا مزوّد واتساب بزنس لإرسال الرسائل، ومزوّد الاستضافة لتخزينها. لا إعلانات مدفوعة تُبنى على بياناتك. المُلّاك: رقمك لا يظهر على الموقع أبداً؛ المشترون يراسلوننا نحن.",
    d: "لا أحد خارج فريق SMQ، إلا مزوّد واتساب بزنس لإرسال الرسائل، ومزوّد الاستضافة لتخزينها. لا إعلانات مدفوعة تُبنى على بياناتك. المُلّاك: رقمك لا يظهر على الموقع أبداً؛ المشترون يراسلوننا نحن ونعرّفكم ببعض بعد الفرز.",
  },
  {
    id: "c5",
    title: "كم نحتفظ به",
    m: (
      <>
        طلبات التواصل سنتين من آخر رسالة، ثم تُحذف. سجلات التصفح المجمّعة 13 شهراً. تستطيع طلب حذف بياناتك في أي وقت برسالة واتساب أو بريد إلى{" "}
        <a href={`mailto:${EMAIL}`} className="font-bold text-ink" dir="ltr">
          {EMAIL}
        </a>
        ، ونؤكد الحذف خلال 7 أيام.
      </>
    ),
    d: "طلبات التواصل سنتين من آخر رسالة، ثم تُحذف. سجلات التصفح المجمّعة 13 شهراً. تستطيع طلب حذف بياناتك في أي وقت برسالة واتساب أو بريد، ونؤكد الحذف خلال 7 أيام.",
  },
  {
    id: "c6",
    title: "الكوكيز",
    m: "كوكي واحدة لتحفظ ميزانيتك ومقارنتك على جهازك 7 أيام، وأخرى للغة. لا كوكيز تتبّع من أطراف ثالثة.",
    d: "كوكي واحدة تحفظ ميزانيتك ومقارنتك على جهازك 7 أيام، وأخرى للغة. لا كوكيز تتبّع من أطراف ثالثة، ولذلك لا شريط موافقة على الكوكيز.",
  },
  {
    id: "c7",
    title: "حقوقك",
    m: (
      <>
        تعرف ما عندنا عنك، تصحّحه، تحذفه، أو توقف الرسائل. نُطبّق نظام حماية البيانات الشخصية السعودي، وجهة الشكوى الهيئة السعودية للبيانات والذكاء الاصطناعي <Mark>[للتأكيد مع المستشار القانوني]</Mark>.
      </>
    ),
    d: (
      <>
        تعرف ما عندنا عنك، تصحّحه، تحذفه، أو توقف الرسائل. نُطبّق نظام حماية البيانات الشخصية السعودي، وجهة الشكوى الهيئة السعودية للبيانات والذكاء الاصطناعي <Mark>[للتأكيد مع المستشار القانوني]</Mark>.
      </>
    ),
  },
];

export default function PrivacyPage() {
  const company = settings.companyNameAr ?? "شركة إس إم كيو للاستثمار والتسويق العقاري";
  return (
    <>
      <Header />
      <main>
        <section className="bg-sand cut-xl">
          <div className="container-smq py-8 md:py-14 md:grid md:grid-cols-2 md:gap-12 md:items-end">
            <div className="flex flex-col gap-2">
              <Eyebrow>
                آخر تحديث <span className="tnum">{UPDATED}</span>
              </Eyebrow>
              <h1 className="m-0 text-[30px] md:text-h1 font-extrabold leading-tight">الخصوصية، بالعربي الواضح</h1>
            </div>
            <p className="m-0 mt-3 md:mt-0 text-label md:text-[14px] font-normal leading-relaxed">صفحة قصيرة لأن ما نجمعه قليل. لا حسابات على الموقع، ولا نبيع بياناتك لأحد.</p>
          </div>
        </section>

        <div className="container-smq py-8 md:py-14 md:grid md:grid-cols-[260px_minmax(0,1fr)] md:gap-12 md:items-start">
          <nav aria-label="محتويات الصفحة" className="hidden md:flex md:flex-col md:gap-1 md:sticky md:top-20">
            <span className="text-caption font-extrabold text-muted mb-2">في هذه الصفحة</span>
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="py-1.5 text-label font-semibold text-ink no-underline hover:text-gold-text hover:underline">
                {s.title}
              </a>
            ))}
            <div className="mt-5 border-interactive p-4 flex flex-col gap-1.5 text-label">
              <span className="font-extrabold">تواصل بخصوص الخصوصية</span>
              <a href={`mailto:${EMAIL}`} className="font-bold no-underline hover:underline" dir="ltr">
                {EMAIL}
              </a>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="font-bold no-underline hover:underline">
                واتساب
              </a>
            </div>
          </nav>

          <div className="flex flex-col gap-7 md:gap-9">
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-20 flex flex-col gap-2">
                <h2 className="m-0 text-h3 md:text-h2 font-extrabold">{s.title}</h2>
                <p className="m-0 text-body leading-relaxed">
                  <Resp m={s.m} d={s.d} />
                </p>
              </section>
            ))}

            <div className="md:hidden border-interactive p-4 flex flex-col gap-1.5 text-label">
              <span className="font-extrabold">تواصل بخصوص الخصوصية</span>
              <span className="font-normal leading-relaxed">
                {company} · السجل التجاري <span className="tnum">{LICENCE.cr}</span> · حي الروضة، جدة
                <br />
                <a href={`mailto:${EMAIL}`} className="font-bold" dir="ltr">
                  {EMAIL}
                </a>{" "}
                ·{" "}
                <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="font-bold">
                  واتساب
                </a>
              </span>
            </div>
            <p className="m-0 hidden md:block text-label font-normal text-muted leading-relaxed">
              {company} · السجل التجاري <span className="tnum">{LICENCE.cr}</span> · ترخيص فال <span className="tnum">{LICENCE.rega}</span> · حي الروضة، جدة. هذه الصفحة تحمل noindex ولا تظهر في نتائج البحث.
            </p>
          </div>
        </div>
      </main>
      <Footer compact links={shellFooterLinks("/privacy", [{ label: "الخصوصية", href: "/privacy" }])} />
    </>
  );
}
