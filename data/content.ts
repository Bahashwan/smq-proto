// Site content: the Home page copy fields for the page editor (AR published / AR draft / EN), the FAQ, testimonials
// and proof numbers, partners, the option lists, SEO rows, the content hub, the «يحتاج تأكيداً» list, admin users
// and the audit log, notifications, and the form option lists. Copy is verbatim from the boards; numbers that the
// ten units determine are never typed here (the pages compute them with data/selectors.ts).
import type { AdminUser, CopyField, FaqItem, ListItem, NeedsConfirmationItem, PageSection, Partner, SeoRow, Testimonial } from "./types";
import { allianceSettings } from "./settings";

const f = (key: string, labelAr: string, ar: string, extra: Partial<CopyField> = {}): CopyField => ({ key, labelAr, ar, kind: "text", ...extra });

/** Home page sections. `ar` = Home-D (published), `arDraft` = Admin-PageEditor-D (unsaved draft), `en` = EN-Home-M. */
export const homePage: { pathAr: string; path: string; lastPublishedAr: string; sections: PageSection[] } = {
  pathAr: "الرئيسية",
  path: "/",
  lastPublishedAr: "آخر نشر قبل 6 أيام بواسطة سعود",
  sections: [
    {
      key: "hero",
      titleAr: "1 · الهيرو",
      visible: true,
      fields: [
        f("topline", "السطر العلوي", "مكتب تسويق واستثمار عقاري · جدة", { arDraft: "إس إم كيو العقارية · جدة", en: "SMQ Real Estate · Jeddah" }),
        f("title", "العنوان", "نقودك بثقة نحو القرار العقاري الصحيح", { kind: "textarea", arDraft: "بيتك في جدة، بالأرقام أولاً", arPrevious: "شقتك في جدة تبدأ من رقم", en: 'Real prices. Real units. No "call for price".', noteAr: "غير محفوظ · كان: «شقتك في جدة تبدأ من رقم»" }),
        f("paragraph", "الفقرة", "وحدات حقيقية بأسعارها وسعر المتر، ودليل أسعار لكل حي، ومستشار يرد عليك على واتساب. لا حسابات، لا وعود، أرقام أولاً.", {
          kind: "textarea",
          arDraft: "وحدات حقيقية بأسعار معلنة، من غير «اتصل للسعر». ابدأ من ميزانيتك وسنعرض لك ما يناسبها فقط.",
          en: "Start from your budget and see only what fits it, with the full price on every card.",
        }),
        f("primaryText", "زر أساسي (نص)", "ابحث بميزانيتك", { arDraft: "ابدأ من ميزانيتك", en: "Start from your budget" }),
        f("primaryTarget", "زر أساسي (الوجهة)", "الباحث في نفس الصفحة", { kind: "select", options: ["الباحث في نفس الصفحة", "النتائج", "واتساب"] }),
        f("secondaryText", "زر ثانوي (نص)", "كلّمنا على واتساب", { en: "WhatsApp us" }),
        f("statUnits", "شريط الأرقام · الوحدات", "وحدات متاحة الآن", { noteAr: "الرقم يُحسب من الوحدات", en: "units available now" }),
        f("statTrainees", "شريط الأرقام · المتدربون", "+2000 متدرب مع المؤسس [للتأكيد]", { en: "2000+ trainees with the founder [TBC]" }),
        f("statLicence", "شريط الأرقام · الترخيص", "مرخصون من الهيئة العامة للعقار · 1200040135", { en: "REGA licence 1200040135" }),
        f("heroImage", "صورة الهيرو", "IMG-HERO-BRAND", { kind: "image", noteAr: "IMG-HERO-BRAND · تعبيرية · 2400×1350 · يُسمح بالشعار في هذه الخانة فقط" }),
      ],
    },
    {
      key: "finder",
      titleAr: "2 · الباحث بالميزانية",
      visible: true,
      fields: [
        f("eyebrow", "السطر العلوي", "ابدأ من هنا"),
        f("title", "عنوان القسم", "كم ميزانيتك؟", { en: "What's your budget?" }),
        f("help", "نص المساعدة تحت المنزلق", "نعرض الوحدات المتاحة فعلاً في جدة، بأسعارها وسعر المتر، ثم نجلس معك على واتساب.", {
          arDraft: "السعر الكامل للوحدة. ضريبة التصرفات وتكاليف التسجيل تُحسب على حدة.",
          en: "Full unit price. Real estate transaction tax and registration fees are calculated separately.",
        }),
        f("sliderMin", "الحد الأدنى للمنزلق", "300,000", { kind: "number" }),
        f("sliderMax", "الحد الأعلى", "2,000,000", { kind: "number" }),
        f("sliderStep", "خطوة المنزلق", "50,000", { kind: "number" }),
        f("sliderDefault", "القيمة الافتراضية", "700,000", { kind: "number", noteAr: "القيم الافتراضية للميزانية تُدار من القوائم › الميزانيات." }),
        f("submit", "زر العرض", "اعرض الوحدات", { noteAr: "العدد يُحسب: «اعرض الوحدات الست»", en: "Show units" }),
      ],
    },
    {
      key: "project",
      titleAr: "المشروع الحالي",
      visible: true,
      fields: [
        f("title", "العنوان", "المشروع الحالي", { en: "Current project" }),
        f("link", "رابط التفاصيل", "كل التفاصيل والنماذج", { en: "All projects" }),
        f("cta", "زر البطاقة", "صفحة المشروع"),
      ],
    },
    {
      key: "guide",
      titleAr: "3 · دليل الأسعار (معاينة)",
      visible: true,
      fields: [
        f("eyebrow", "السطر العلوي", "دليل الأسعار", { en: "Price guide · Al Rawdah" }),
        f("title", "العنوان", "ماذا تدفع في الروضة؟", { arDraft: "الأسعار الحقيقية، قبل أن تتصل" }),
        f("paragraph", "الفقرة", "أرقام من وحداتنا المدرجة، لا من إعلانات السوق. تتحدث مع كل وحدة جديدة، والتاريخ مكتوب تحت الجدول.", {
          kind: "textarea",
          arDraft: "الأرقام تُحسب من الوحدات المتاحة الآن، وتتغير كلما بيعت وحدة.",
          en: "Computed from available units only, updated whenever a unit sells.",
        }),
        f("link", "رابط الدليل", "الدليل الكامل لكل الأحياء", { en: "Full price guide →" }),
      ],
    },
    {
      key: "services",
      titleAr: "ماذا نفعل",
      visible: true,
      fields: [
        f("title", "العنوان", "ماذا نفعل", { en: "What we do" }),
        f("s1", "01", "شراء العقارات · نفلتر السوق على ميزانيتك ونرافقك حتى الإفراغ.", { en: "Buying · We filter the market on your budget and stay with you to the deed transfer" }),
        f("s2", "02", "بيع العقارات · تقييم واقعي، تصوير، وتسويق لعملاء جاهزين.", { en: "Selling · Realistic valuation, photography, marketing to ready buyers" }),
        f("s3", "03", "الاستثمار العقاري · فرص مدروسة بالأرقام، لا بالوعود.", { en: "Investment · Opportunities studied by the numbers, not the promises" }),
        f("s4", "04", "الاستشارات العقارية · جلسة واحدة توفر عليك سنوات من التجربة.", { en: "Training · Real estate marketing courses, 2000+ graduates [TBC]" }),
        f("s5", "05", "أضف عقارك · تملك وحدة؟ نسوقها لك مجاناً حتى البيع.", { en: "List your property · Free for owners. Three steps, two minutes, we verify and publish" }),
      ],
    },
    {
      key: "founder",
      titleAr: "المؤسس",
      visible: true,
      fields: [
        f("eyebrow", "السطر العلوي", "المؤسس"),
        f("name", "الاسم", "سعود معيض"),
        f("role", "الصفة", "خبير ومستشار عقاري"),
        f("stat", "الرقم", "+2000"),
        f("statLabel", "وصف الرقم", "متدرب في برامجه ودوراته المتخصصة"),
        f("quote", "الفقرة", "نؤمن أن العقار قرار استثماري يتطلب تحليلاً دقيقاً ورؤية واضحة. لذلك نعرض الأرقام أولاً، ثم نجلس معك.", { kind: "textarea" }),
        f("link", "الرابط", "قصة SMQ ومنهجها"),
        f("licensed", "عنوان الترخيص", "مرخصون ومنظمون"),
      ],
    },
    {
      key: "why",
      titleAr: "4 · لماذا إس إم كيو",
      visible: false,
      visibleDraft: true,
      noteAr: "النقطة 3 موسومة [للتأكيد]: تبقى بالوسم على الموقع حتى يؤكدها مدير.",
      fields: [
        f("p1", "نقطة 1", "سعر معلن لكل وحدة"),
        f("p2", "نقطة 2", "رد خلال ساعات العمل"),
        f("p3", "نقطة 3", "+2000 متدرب [للتأكيد]"),
      ],
    },
    {
      key: "faq",
      titleAr: "5 · الأسئلة الشائعة (مختارات)",
      visible: true,
      visibleDraft: false,
      noteAr: "تظهر أول 4 أسئلة منشورة من الأسئلة الشائعة. القسم مخفي الآن لأن 3 أسئلة فيها [مسودة إجابة].",
      fields: [
        f("title", "العنوان", "أسئلة تصلنا كثيراً"),
        f("help", "النص المساعد", "لم تجد سؤالك؟ اكتبه لنا على واتساب."),
      ],
    },
    {
      key: "contact",
      titleAr: "كلّمنا الآن",
      visible: true,
      fields: [
        f("title", "العنوان", "كلّمنا الآن", { en: "Talk to us" }),
        f("help", "النص المساعد", "", { en: "Saturday to Thursday, 9 am to 6 pm Jeddah time. WhatsApp is fastest." }),
        f("mapLabel", "عنوان الخريطة", "خريطة Google بموقع المكتب"),
        f("mapChip", "شريحة الخريطة", "مكتب SMQ · حي الفيصلية"),
      ],
    },
  ],
};

/** The Home-D FAQ block, verbatim (round 1); the canonical list below is Admin-FAQ-D (round 2). */
export const homeFaq: { q: string; a: string; draft: boolean }[] = [
  { q: "كيف أسجل اهتمامي بوحدة؟", a: "اضغط «واتساب» على أي وحدة، تصلنا رسالة باسم المشروع والنموذج، ونرد عليك برقم مستشار خلال ساعات العمل. لا حاجة لإنشاء حساب.", draft: false },
  { q: "هل الأسعار المعروضة نهائية؟", a: "[مسودة إجابة، للتأكيد من العميل]", draft: true },
  { q: "ما مناطق التغطية؟", a: "[مسودة إجابة، للتأكيد من العميل]", draft: true },
  { q: "هل تقدمون خدمات ما بعد البيع؟", a: "[مسودة إجابة، للتأكيد من العميل]", draft: true },
  { q: "ما الاستشارات العقارية المتوفرة؟", a: "[مسودة إجابة، للتأكيد من العميل]", draft: true },
];

const faqItem = (n: number, q: string, a: string, pages: string[], extra: Partial<FaqItem> = {}): FaqItem => ({
  id: `faq-${String(n).padStart(2, "0")}`,
  q,
  a,
  draft: false,
  published: true,
  order: n,
  pages,
  ...extra,
});

/** 12 questions · 9 published · faq-05/06/07 carry [مسودة إجابة] (Admin-FAQ-D order = site order). */
export const faq: FaqItem[] = [
  faqItem(1, "هل السعر المعروض نهائي؟", "نعم. السعر المعروض هو سعر الوحدة كاملاً. ضريبة التصرفات العقارية ورسوم التسجيل تُحسب على حدة ونوضحها قبل الحجز.", ["الرئيسية", "الوحدة"], {
    qEn: "Is the listed price final?",
    aEn: "Yes. The listed price is the full unit price. Real estate transaction tax and registration fees are calculated separately and explained before booking.",
  }),
  faqItem(2, "كيف أحجز وحدة؟", "تراسلنا على واتساب برمز الوحدة، نرتّب زيارة، ثم عربون حجز يثبّت السعر 14 يوماً.", ["الرئيسية", "الوحدة"]),
  faqItem(3, "هل يمكن التمويل البنكي؟", "نعم، نساعدك في ملف التمويل مع البنوك الشريكة. الموافقة بيد البنك.", ["الرئيسية", "الوحدة"]),
  faqItem(4, "ما الفرق بين «محجوز» و«مباع»؟", "محجوز: عربون مدفوع والسعر مثبّت 14 يوماً، قد تعود الوحدة للعرض. مباع: صك منقول، لا تعود.", ["الوحدة"]),
  faqItem(5, "هل ضريبة التصرفات العقارية مشمولة في السعر؟", "[مسودة إجابة] غير مشمولة في الأسعار المعروضة؛ تُحسب 5% على حدة وقد يُعفى المشتري الأول بموجب برنامج الدعم. للتأكيد مع سعود.", ["الوحدة"], { draft: true, published: false }),
  faqItem(6, "متى موعد تسليم جاردن الروضة؟", "[مسودة إجابة] الربع الثاني 2027 بحسب جدول المقاول، ويظهر الموعد المحدّث في صفحة المشروع.", ["المشروع"], { draft: true, published: false }),
  faqItem(7, "ما الضمانات على الوحدة؟", "[مسودة إجابة] ضمان هيكلي 10 سنوات وضمان كهروميكانيكي سنة واحدة، بحسب عقد المقاول [للتأكيد].", ["الوحدة", "المشروع"], { draft: true, published: false }),
  faqItem(8, "هل تعرضون وحدات غير وحداتكم؟", "نعم، عقارات المُلّاك بعد التحقق منها، وتظهر بوسم «من مالك» وبسعر معلن مثل باقي الوحدات.", ["أضف عقارك"]),
  faqItem(9, "كيف أسجل اهتمامي بوحدة؟", "اضغط «واتساب» على أي وحدة، تصلنا رسالة باسم المشروع والنموذج، ونرد عليك برقم مستشار خلال ساعات العمل. لا حاجة لإنشاء حساب.", ["الرئيسية", "الوحدة"]),
  faqItem(10, "ما مناطق التغطية؟", "جدة فقط الآن: وحداتنا المدرجة في حي الروضة، وعقارات المُلّاك بعد التحقق في أحياء متفرقة. الأحياء الأخرى تظهر «قريباً» في دليل الأسعار.", ["الرئيسية", "أضف عقارك"]),
  faqItem(11, "هل تقدمون خدمات ما بعد البيع؟", "نعم، المستشار نفسه يتابعك من أول رسالة إلى الإفراغ: ملف التمويل، الزيارات، والتسجيل.", ["الرئيسية"]),
  faqItem(12, "ما الاستشارات العقارية المتوفرة؟", "جلسة 60 دقيقة [للتأكيد] مع سعود معيض: قراءة لوضعك، وتوصية مكتوبة بالخطوات، تُحجز على واتساب.", ["الرئيسية"]),
];
export const FAQ_PAGES = ["الرئيسية", "الوحدة", "المشروع", "أضف عقارك"];

export const testimonials: Testimonial[] = [
  { id: "t-01", name: "أحمد ع.", role: "مشترٍ", unitCode: "RZ-C", date: "2026-07", text: "«السعر اللي شفته في الموقع هو اللي دفعته. ما حد قال لي اتصل للسعر.»", consent: true, consentSource: "واتساب 2026-07-14", published: true, sample: true },
  { id: "t-02", name: "م. الحربي", role: "مشترية", unitCode: "YS-C", date: "2026-08", text: "«جهّزوا ملف التمويل كامل، وزرت الشقة مرتين قبل ما أحجز.»", consent: true, consentSource: "بريد 2026-08-02", published: true, sample: true },
  { id: "t-03", name: "خ. باعشن", role: "مشترٍ محتمل", date: "2026-10", text: "«ردّوا عليّ في نفس اليوم وأعطوني كل الأرقام قبل الزيارة.»", consent: false, published: false, sample: true },
];
/** «3+ rule»: the testimonials block appears only with at least this many published quotes. */
export const TESTIMONIALS_MIN = 3;

/** «أرقام الإثبات» (Admin-Testimonials-D). The units number is computed, never edited. */
export const proofNumbers: { key: string; value: string; descriptionAr: string; sourceAr: string; visible: boolean; tbc: boolean; computed?: boolean }[] = [
  { key: "trainees", value: "+2000 متدرب", descriptionAr: "تخرّجوا من دوراتنا في التسويق العقاري", sourceAr: "[للتأكيد] · سجلات التدريب 2021 إلى 2026", visible: true, tbc: true },
  { key: "models", value: "10 نماذج", descriptionAr: "وحدات بأسعار معلنة في جاردن الروضة", sourceAr: "تلقائي من الوحدات (لا يُحرَّر)", visible: true, tbc: false, computed: true },
  { key: "hours", value: "خلال ساعات العمل", descriptionAr: "نرد على واتساب، السبت إلى الخميس 9 إلى 6", sourceAr: "إعدادات الموقع › الساعات", visible: true, tbc: false },
  { key: "since", value: "منذ 2019", descriptionAr: "سنة تأسيس الشركة", sourceAr: "[للتأكيد] · السجل التجاري", visible: false, tbc: true },
];

export const partners: Partner[] = [
  { id: "p-rega", name: "الهيئة العامة للعقار", kind: "service", kindAr: "جهة تنظيمية", visible: false, placeholder: false, hasLogo: true, logoLabel: "شعار PNG", url: "https://rega.gov.sa", noteAr: "ترخيص فال رقم [للتأكيد]" },
  { id: "p-bank-1", name: "بنك شريك 1", kind: "bank", kindAr: "بنك", visible: false, placeholder: true, hasLogo: true, logoLabel: "شعار PNG", url: "", noteAr: "الاسم يُدخل بعد توقيع الاتفاقية [للتأكيد]" },
  { id: "p-bank-2", name: "بنك شريك 2", kind: "bank", kindAr: "بنك", visible: false, placeholder: true, hasLogo: true, logoLabel: "شعار PNG", url: "", noteAr: "[للتأكيد]" },
  { id: "p-dev", name: "مطوّر جاردن الروضة", kind: "developer", kindAr: "مطوّر", visible: false, placeholder: true, hasLogo: true, logoLabel: "شعار PNG", url: "", noteAr: "[للتأكيد]" },
  { id: "p-sakani", name: "برنامج سكني", kind: "service", kindAr: "أخرى", visible: false, placeholder: false, hasLogo: false, logoLabel: "ارفع PNG أو SVG", url: "https://sakani.sa", noteAr: "لا شعار بعد" },
];
export const PARTNER_KINDS_AR = ["جهة تنظيمية", "بنك", "مطوّر", "أخرى"];

/** Option lists (Admin-Lists-D). District unit counts and budget-chip counts are computed by the selectors. */
export const lists = {
  /** The 14 site districts in the board's order; `slug` joins data/districts. */
  districts: [
    { key: "rawdah", slug: "rawdah", labelAr: "الروضة" },
    { key: "safa", slug: "safa", labelAr: "الصفا", noteAr: "1 من مالك" },
    { key: "naeem", slug: "naeem", labelAr: "النعيم" },
    { key: "obhur-north", slug: "obhur-north", labelAr: "أبحر الشمالية", comingSoon: true, noteAr: "مشروع مسودة" },
    { key: "shati", slug: "shati", labelAr: "الشاطئ", comingSoon: true },
    { key: "mohammadiyah", slug: "mohammadiyah", labelAr: "المحمدية", comingSoon: true },
    { key: "faisaliyah", slug: "faisaliyah", labelAr: "الفيصلية" },
    { key: "nahdah", slug: "nahdah", labelAr: "النهضة" },
    { key: "zahra", slug: "zahra", labelAr: "الزهراء" },
    { key: "salamah", slug: "salamah", labelAr: "السلامة" },
    { key: "samer", slug: "samer", labelAr: "السامر" },
    { key: "harazat", slug: "harazat", labelAr: "الحرازات" },
    { key: "hamra", slug: "hamra", labelAr: "الحمراء" },
    { key: "balad", slug: "balad", labelAr: "البلد" },
  ] as ListItem[],
  districtsNoteAr: "و8 أحياء أخرى بلا وحدات (تظهر في «أضف عقارك» فقط)",
  cities: [{ key: "jeddah", labelAr: "جدة", noteAr: "افتراضية" }] as ListItem[],
  citiesNoteAr: "مدينة واحدة الآن، الفلتر مخفي حتى تُضاف ثانية",
  unitTypes: [
    { key: "apartment", labelAr: "شقة", pluralAr: "شقق" },
    { key: "roof-villa", labelAr: "فيلا روف", pluralAr: "فلل روف" },
    { key: "villa", labelAr: "فيلا", pluralAr: "فلل", noteAr: "تظهر في أضف عقارك فقط" },
  ] as ListItem[],
  /** Budget chips under the slider; the unit count per chip is computed (budgetChipCounts). */
  budgets: [
    { key: "500k", labelAr: "حتى 500 ألف", value: 500000, visible: true },
    { key: "600k", labelAr: "حتى 600 ألف", value: 600000, visible: true },
    { key: "700k", labelAr: "حتى 700 ألف", value: 700000, visible: true, noteAr: "الأكثر استخداماً" },
    { key: "1m", labelAr: "حتى مليون", value: 1000000, visible: true },
    { key: "1.7m", labelAr: "حتى 1.7 مليون", value: 1700000, visible: true },
    { key: "2m+", labelAr: "أكثر من 2 مليون", value: 2000000, visible: false, noteAr: "مخفي" },
  ] as ListItem[],
  /** The Home finder's short chips */
  finderChips: [
    { key: "500k", labelAr: "500 ألف", value: 500000 },
    { key: "700k", labelAr: "700 ألف", value: 700000 },
    { key: "1m", labelAr: "مليون", value: 1000000 },
    { key: "2m", labelAr: "2 مليون", value: 2000000 },
  ] as ListItem[],
  /** «أسباب رفض عقار مالك» with the board's usage counts */
  rejectionReasons: [
    { key: "deed", labelAr: "صك غير مطابق للمعلومات", count: 12 },
    { key: "price", labelAr: "السعر أعلى من السوق بأكثر من 20%", count: 7 },
    { key: "photos", labelAr: "صور غير كافية أو غير واضحة", count: 5 },
    { key: "scope", labelAr: "خارج نطاق عملنا (مدينة أخرى أو تجاري)", count: 3 },
    { key: "contact", labelAr: "لم نتمكن من التواصل مع المالك", count: 2 },
  ] as ListItem[],
  unsavedNoteAr: "تغييرات غير محفوظة: 3 أحياء وُسمت «قريباً»",
};

/** SEO rows (Admin-SEO-D). Template rows carry {variables}; the previews are computed from the fixtures. */
export const seo: SeoRow[] = [
  {
    key: "home",
    pageAr: "الرئيسية",
    path: "/",
    template: false,
    titleAr: "شقق وفلل روف بأسعار معلنة في جدة · إس إم كيو العقارية",
    descriptionAr: "ابدأ من ميزانيتك وشاهد الوحدات المتاحة الآن في جدة بأسعارها الكاملة. حي الروضة من {from_price} ريال. تواصل على واتساب.",
    titleEn: "Apartments and roof villas with listed prices in Jeddah · SMQ Real Estate",
    descriptionEn: "Start from your budget and see the units available now in Jeddah with their full prices. Al Rawdah from {from_price} SAR. Reach us on WhatsApp.",
    titleNoteAr: "بلا «اتصل للسعر» في العنوان",
    descriptionNoteAr: "السعر يُحدَّث تلقائياً من أقل وحدة متاحة",
    og: "OG-Home",
  },
  {
    key: "unit",
    pageAr: "الوحدة (قالب)",
    path: "/units/",
    template: true,
    pagesCount: 10,
    titleAr: "{type} {beds} غرف · {area} م² · {price} ريال · {project}",
    descriptionAr: "{type} في {district}، جدة. {beds} غرف و{baths} حمامات، {area} م²، بسعر {price} ريال {status_phrase}. تفاصيل كاملة ومخطط وتواصل مباشر على واتساب.",
    titleEn: "{type} · {beds} bed · {area} m² · {price} SAR · {project}",
    descriptionEn: "{type} in {district}, Jeddah. {beds} bedrooms and {baths} bathrooms, {area} m², {price} SAR. Full details, floor plan and direct WhatsApp contact.",
    exampleTitleAr: "مثال: شقة 3 غرف · 147 م² · 690,000 ريال · جاردن الروضة",
    descriptionNoteAr: "{status_phrase} = «متاحة الآن» أو «محجوزة» أو «مباعة»",
    og: "OG-Unit",
  },
  {
    key: "project",
    pageAr: "المشروع (قالب)",
    path: "/projects/",
    template: true,
    pagesCount: 2,
    titleAr: "{project} · {district} · من {min_price} ريال",
    descriptionAr: "{available_count} وحدة متاحة في {project}، {district}. {types_phrase}، أسعار معلنة من {min_price} إلى {max_price} ريال. التسليم {delivery}.",
    titleEn: "{project} · {district} · from {min_price} SAR",
    descriptionEn: "{available_count} units available in {project}, {district}. {types_phrase}, listed prices from {min_price} to {max_price} SAR. Delivery {delivery}.",
    exampleTitleAr: "مثال: جاردن الروضة · الروضة · من 459,000 ريال",
    descriptionNoteAr: "{delivery} يحمل [للتأكيد] حتى يُؤكَّد",
    og: "OG-Project",
  },
  {
    key: "guide",
    pageAr: "دليل الأسعار",
    path: "/guide",
    template: false,
    titleAr: "دليل أسعار الشقق في الروضة، جدة · محدَّث من الوحدات المتاحة",
    descriptionAr: "كم تكلّف شقة غرفتين أو 3 غرف في الروضة؟ نطاقات حقيقية من وحداتنا المتاحة الآن، بسعر المتر، وتتحدّث تلقائياً.",
    og: "OG-Home",
  },
  {
    key: "about",
    pageAr: "من نحن",
    path: "/about",
    template: false,
    titleAr: "من نحن · إس إم كيو للاستثمار والتسويق العقاري، جدة",
    descriptionAr: "شركة استثمار وتسويق عقاري في جدة تبدأ من الأرقام. تعرّف على قصتنا والمؤسس سعود معيض وشركائنا في التمويل.",
    og: "OG-Home (مشترك)",
    unsaved: true,
  },
  {
    key: "services",
    pageAr: "الخدمات",
    path: "/services",
    template: false,
    titleAr: "خدماتنا · شراء وبيع واستثمار واستشارات عقارية في جدة",
    descriptionAr: "أربع خدمات ومستشار واحد يرد عليك: شراء، بيع، استثمار، واستشارات عقارية. ابدأ على واتساب.",
    og: "OG-Home (مشترك)",
  },
  {
    key: "add",
    pageAr: "أضف عقارك",
    path: "/add",
    template: false,
    titleAr: "أضف عقارك · نسوقه لك مجاناً حتى البيع · إس إم كيو العقارية",
    descriptionAr: "ثلاث خطوات ودقيقتان: نوع العقار وموقعه، التفاصيل والسعر، الصور وبياناتك. نراجع الصك ونتواصل خلال 24 ساعة عمل.",
    og: "OG-Home (مشترك)",
  },
  {
    key: "contact",
    pageAr: "تواصل",
    path: "/contact",
    template: false,
    titleAr: "تواصل معنا · واتساب أو اتصال · إس إم كيو العقارية، جدة",
    descriptionAr: "أسرع طريق واتساب. نرد خلال ساعات العمل، السبت إلى الخميس من 9 ص إلى 6 م. المكتب في حي الفيصلية، جدة.",
    og: "OG-Home (مشترك)",
  },
];
export const SEO_LIMITS = { title: 60, description: 155 };

/** «يحتاج تأكيداً» (Admin-Pieces-D), 11 items counting the three FAQ drafts. */
export const needsConfirmation: NeedsConfirmationItem[] = [
  { id: "nc-delivery", fieldAr: "موعد التسليم · جاردن الروضة", valueAr: "الربع 2 · 2027 [للتأكيد]", whereAr: "المشروع، الوحدات، SEO", kind: "tbc", href: "/admin/projects/rwd-01" },
  { id: "nc-finishing", fieldAr: "مرحلة التشطيبات · جاردن الروضة", valueAr: "التشطيبات جارية [للتأكيد]", whereAr: "المشروع", kind: "tbc", href: "/admin/projects/rwd-01" },
  { id: "nc-rett", fieldAr: "ضريبة التصرفات · كل الوحدات", valueAr: "غير محدد [للتأكيد]", whereAr: "صفحة الوحدة × 10", kind: "tbc", href: "/admin/units" },
  { id: "nc-floor", fieldAr: "الطابق · RZ-A", valueAr: "الثالث [للتأكيد]", whereAr: "صفحة الوحدة", kind: "tbc", href: "/admin/units/rz-a" },
  { id: "nc-warranty", fieldAr: "الضمانات والتأمين · المشروع", valueAr: "هيكلي 10 سنوات، كهروميكانيكي سنة [للتأكيد]", whereAr: "المشروع، الوحدات، سؤال شائع", kind: "tbc", href: "/admin/projects/rwd-01" },
  { id: "nc-trainees", fieldAr: "+2000 متدرب · أرقام الإثبات", valueAr: "+2000 متدرب [للتأكيد]", whereAr: "من نحن، الرئيسية", kind: "tbc", href: "/admin/content/testimonials" },
  { id: "nc-tax", fieldAr: "الرقم الضريبي · إعدادات الموقع", valueAr: "[للتأكيد]", whereAr: "التذييل، صفحة الوحدة", kind: "tbc", disabledReasonAr: "أكّد (الحقل فارغ)", href: "/admin/content/site-settings" },
  { id: "nc-faq", fieldAr: "3 أسئلة شائعة", valueAr: "[مسودة إجابة] × 3", whereAr: "الوحدة، المشروع", kind: "draft", count: 3, href: "/admin/content/faq" },
  { id: "nc-since", fieldAr: "سنة التأسيس · أرقام الإثبات", valueAr: "منذ 2019 [للتأكيد] · مخفي", whereAr: "من نحن (مخفي)", kind: "tbc", href: "/admin/content/testimonials" },
];
/** 11 = the rows, counting the FAQ row as its three drafts. */
export function needsConfirmationCount(): number {
  return needsConfirmation.reduce((n, it) => n + (it.count ?? 1), 0);
}

/** The content hub (Admin-Content-D). Statuses: published · draft · needs-confirmation. */
export type HubStatus = "published" | "draft" | "needs-confirmation";
export const HUB_STATUS_LABELS: Record<HubStatus, string> = { published: "منشور", draft: "مسودة", "needs-confirmation": "يحتاج تأكيداً" };
export const contentHub = {
  legend: [
    { status: "published" as HubStatus, textAr: "يظهر على الموقع" },
    { status: "draft" as HubStatus, textAr: "تغييرات غير منشورة" },
    { status: "needs-confirmation" as HubStatus, textAr: "فيه حقل [للتأكيد] أو [مسودة إجابة]" },
  ],
  pages: [
    { key: "home", pageAr: "الرئيسية", path: "/", sectionsAr: "الهيرو · الباحث · دليل الأسعار · المشاريع · الأسئلة", editedAr: "أمس · نورة", status: "draft" as HubStatus, href: "/admin/content/pages/home" },
    { key: "about", pageAr: "من نحن", path: "/about", sectionsAr: "القصة · المؤسس · الشركاء · آراء العملاء", editedAr: "قبل 4 أيام · سعود", status: "needs-confirmation" as HubStatus, href: "/admin/content/pages/about" },
    { key: "services", pageAr: "الخدمات", path: "/services", sectionsAr: "للمشترين · للمُلّاك · للمطورين · التدريب", editedAr: "قبل أسبوع · نورة", status: "published" as HubStatus, href: "/admin/content/pages/services" },
    { key: "guide", pageAr: "دليل الأسعار", path: "/guide", sectionsAr: "مقدمة · القاعدة · الجداول (تلقائية)", editedAr: "قبل أسبوع · نورة", status: "published" as HubStatus, href: "/admin/content/pages/guide" },
    { key: "add", pageAr: "أضف عقارك", path: "/add", sectionsAr: "مقدمة · الخطوات · شاشة النجاح", editedAr: "قبل أسبوعين · سعود", status: "published" as HubStatus, href: "/admin/content/pages/add" },
    { key: "contact", pageAr: "تواصل", path: "/contact", sectionsAr: "الوسائل · النموذج · الموقع", editedAr: "قبل أسبوعين · سعود", status: "published" as HubStatus, href: "/admin/content/pages/contact" },
    { key: "privacy", pageAr: "الخصوصية", path: "/privacy", sectionsAr: "نص واحد", editedAr: "قبل شهر · سعود", status: "needs-confirmation" as HubStatus, href: "/admin/content/pages/privacy" },
  ],
  blocks: [
    { key: "faq", titleAr: "الأسئلة الشائعة", status: "needs-confirmation" as HubStatus, href: "/admin/content/faq" },
    { key: "partners", titleAr: "الشركاء والتمويل", status: "draft" as HubStatus, href: "/admin/content/partners" },
    { key: "testimonials", titleAr: "آراء العملاء والأرقام", status: "draft" as HubStatus, href: "/admin/content/testimonials" },
    { key: "lists", titleAr: "القوائم", status: "published" as HubStatus, href: "/admin/content/lists" },
    { key: "site-settings", titleAr: "إعدادات الموقع", status: "needs-confirmation" as HubStatus, href: "/admin/content/site-settings" },
    { key: "seo", titleAr: "عناوين البحث والمعاينة", status: "published" as HubStatus, href: "/admin/content/seo" },
    { key: "media", titleAr: "الصور", status: "draft" as HubStatus, href: "/admin/content/media" },
  ],
  recentChanges: [
    { whenAr: "أمس 11:20", textAr: "نورة عدّلت عنوان الهيرو في الرئيسية (مسودة، لم تُنشر)", actionAr: "افتح", href: "/admin/content/pages/home" },
    { whenAr: "قبل 4 أيام", textAr: "سعود نشر قسم «القصة» في من نحن", actionAr: "معاينة", href: "/about" },
    { whenAr: "قبل أسبوع", textAr: "نورة أضافت سؤالاً جديداً «هل ضريبة التصرفات مشمولة؟» بإجابة [مسودة إجابة]", actionAr: "افتح", href: "/admin/content/faq?edit=faq-05" },
  ],
};

/** Notifications (Admin-Pieces-D bell). */
export const notifications: { id: string; titleAr: string; textAr: string; whenAr: string; at: string; href?: string; linkAr?: string; unread: boolean }[] = [
  { id: "n-1", titleAr: "عقار مالك جديد", textAr: "رقم 2026-1042، عمارة سكنية بدخل في النعيم بسعر 4,800,000 · وكيل", whenAr: "قبل 25 دقيقة", at: "2026-10-10T21:35:00+03:00", href: "/admin/approvals/2026-1042", linkAr: "افتح الموافقات", unread: true },
  { id: "n-2", titleAr: "3 طلبات بلا رد", textAr: "تجاوزت 24 ساعة", whenAr: "قبل ساعة", at: "2026-10-10T21:00:00+03:00", href: "/admin/leads", linkAr: "الطلبات الواردة", unread: true },
  { id: "n-3", titleAr: "انقطع اتصال واتساب بزنس", textAr: "وتحوّلت اللوحة إلى الوضع اليدوي ثم عاد الاتصال", whenAr: "قبل 40 دقيقة", at: "2026-10-10T21:20:00+03:00", href: "/admin/users", linkAr: "الإعدادات", unread: true },
  { id: "n-4", titleAr: "", textAr: "نورة حفظت مسودة في الرئيسية › الهيرو", whenAr: "أمس 17:40", at: "2026-10-09T17:40:00+03:00", href: "/admin/content/pages/home", unread: false },
  { id: "n-5", titleAr: "", textAr: "استيراد Excel اكتمل: 10 صفوف، لا تغييرات", whenAr: "قبل 4 أيام", at: "2026-10-06T10:00:00+03:00", href: "/admin/units", unread: false },
  { id: "n-6", titleAr: "", textAr: "تنبيه «نبّهني» تطابق: ريم الزهراني تنتظر غرفتين حتى 520 ألفاً، ولا وحدة مطابقة بعد", whenAr: "قبل يومين", at: "2026-10-08T12:00:00+03:00", href: "/admin/leads?lead=notify-0118", unread: false },
];

/** Admin users and the audit log (Admin-Users-D). */
export const adminUsers: AdminUser[] = [
  { id: "u-saud", name: "سعود معيض", initial: "س", role: "manager", roleAr: "مدير", email: "saud@smqre.com", lastLoginAr: "آخر دخول اليوم 09:12", noteAr: "المالك · لا يُحذف" },
  { id: "u-noura", name: "نورة الشريف", initial: "ن", role: "editor", roleAr: "محررة", email: "noura@smqre.com", lastLoginAr: "آخر دخول أمس 17:40" },
  { id: "u-faisal", name: "فيصل الحربي", initial: "ف", role: "editor", roleAr: "محرر", email: "faisal@smqre.com", lastLoginAr: "آخر دخول قبل 6 أيام" },
  { id: "u-invite", name: "دعوة معلّقة", initial: "؟", role: "editor", roleAr: "محرر", email: "m.baeshen@smqre.com", lastLoginAr: "أُرسلت قبل 3 أيام · تنتهي بعد 4", pending: true },
];
export const rolesMatrix: { actionAr: string; manager: boolean; editor: boolean; noteAr: string }[] = [
  { actionAr: "تحرير الوحدات والمشاريع والمحتوى، حفظ كمسودة", manager: true, editor: true, noteAr: "كل التحرير متاح للمحرر" },
  { actionAr: "نشر صفحة أو وحدة", manager: true, editor: true, noteAr: "يُسجَّل باسم الناشر في السجل" },
  { actionAr: "إزالة وسم [للتأكيد] أو [مسودة إجابة]", manager: true, editor: false, noteAr: "المحرر يطلب التأكيد، والمدير يؤكد" },
  { actionAr: "الموافقة على عقار مالك أو رفضه", manager: true, editor: false, noteAr: "يمكن للمحرر الكتابة للمالك وطلب نواقص" },
  { actionAr: "تغيير حالة وحدة إلى «مباع»", manager: true, editor: false, noteAr: "«محجوز» متاح للمحرر مع تاريخ" },
  { actionAr: "استيراد Excel", manager: true, editor: true, noteAr: "المعاينة إجبارية قبل التطبيق" },
  { actionAr: "حذف وحدة أو مشروع أو سؤال", manager: true, editor: false, noteAr: "حوار تأكيد يطلب كتابة الرمز" },
  { actionAr: "رؤية بيانات الزوار والطلبات الواردة", manager: true, editor: true, noteAr: "أرقام الجوال تظهر للدورين" },
  { actionAr: "إعدادات الموقع، المستخدمون، واتساب بزنس", manager: true, editor: false, noteAr: "هذه الصفحة للمدير فقط" },
];
export const auditLog: { whenAr: string; at: string; user: string; textAr: string }[] = [
  { whenAr: "اليوم 10:04", at: "2026-10-10T10:04:00+03:00", user: "النظام", textAr: "أُرسلت تلقائياً: تأكيد استلام الطلب 2026-1042 (واتساب بزنس متصل)" },
  { whenAr: "اليوم 09:12", at: "2026-10-10T09:12:00+03:00", user: "سعود", textAr: "دخول من جدة · Chrome · iPhone" },
  { whenAr: "أمس 17:40", at: "2026-10-09T17:40:00+03:00", user: "نورة", textAr: "حفظت مسودة: الرئيسية › الهيرو › العنوان" },
  { whenAr: "أمس 16:55", at: "2026-10-09T16:55:00+03:00", user: "نورة", textAr: "علّمت الطلب SMQ-2C91E «تم الرد»" },
  { whenAr: "أمس 11:30", at: "2026-10-09T11:30:00+03:00", user: "سعود", textAr: "غيّر حالة YS-A إلى «مباع» · تاريخ البيع 2026-09-28" },
  { whenAr: "قبل 3 أيام", at: "2026-10-07T12:00:00+03:00", user: "سعود", textAr: "أرسل الدعوة إلى m.baeshen@smqre.com بدور «محرر»" },
  { whenAr: "قبل 4 أيام", at: "2026-10-06T10:00:00+03:00", user: "فيصل", textAr: "استورد ملف Excel: 10 صفوف، تغيّر سعر RZ-C من 510,000 إلى 499,000 ثم تراجع" },
  { whenAr: "قبل 6 أيام", at: "2026-10-04T15:00:00+03:00", user: "سعود", textAr: "أرسل على واتساب يدوياً: رفض الطلب 2026-1037 (الاتصال كان منقطعاً)" },
];

/** Form option lists (Add-Step1-M, Add-Step2-M, Add-Step2-Building-M, Add-Step3-D, Marketer-D). */
export const forms = {
  add: {
    propertyTypes: ["شقة", "فيلا", "فيلا روف", "دور", "عمارة سكنية", "عمارة تجارية", "أرض", "محل أو مكتب", "مستودع"],
    buildingTypes: ["عمارة سكنية", "عمارة تجارية"],
    purposes: ["للبيع", "للإيجار"],
    cities: ["جدة", "مدينة أخرى (نتواصل معك)"],
    relations: ["المالك", "مفوّض", "وسيط"],
    floors: ["أرضي", "الأول", "الثاني", "الثالث", "الرابع أو أعلى", "روف"],
    ages: ["جديد (لم يُسكن)", "1 إلى 5 سنوات", "6 إلى 10", "أكثر من 10"],
    occupancy: ["شاغرة", "أسكن فيها", "مؤجّرة"],
    apartmentFeatures: ["موقف خاص", "مصعد", "غرفة خادمة", "غرفة سائق", "مطبخ راكب", "مكيفات راكبة", "شرفة", "سمارت هوم", "مدخلان"],
    buildingFloors: ["2", "3", "4", "5 أو أكثر"],
    streetWidths: ["15 م", "20 م", "25 م", "30 م أو أكثر"],
    contracts: ["موثّقة في إيجار", "غير موثّقة", "مختلطة"],
    buildingFeatures: ["مصعد", "مواقف", "سكن سائقين", "خزان مياه", "غرفة حراسة", "محلات بالدور الأرضي", "عدادات مستقلة", "واجهتان"],
    negotiable: ["نعم، قليلاً", "لا", "أفضل عرض"],
    negotiableBuilding: ["قليلاً", "لا", "أفضل عرض"],
    roles: ["مالك", "وكيل", "مسوّق", "أخرى"],
    timing: ["صباحاً", "مساءً", "أي وقت"],
  },
  marketer: {
    years: ["أقل من سنة", "1 إلى 3", "3 إلى 5", "أكثر من 5"],
    defaultDistricts: ["rawdah", "safa"],
  },
  alliance: allianceSettings.options,
};

/** Shared copy fragments that several screens repeat and that are not page layout. */
export const copy = {
  illustrativeNumbersAr: "الأرقام توضيحية",
  generatedLabelAr: "صورة تعبيرية",
  tbcAr: "[للتأكيد]",
  draftAnswerAr: "[مسودة إجابة]",
  sampleTextAr: "نص تجريبي",
  autoSentAr: "أُرسلت تلقائياً (واتساب بزنس متصل)",
  manualSendAr: "أرسل على واتساب",
  manualModeNoteAr: "الوضع اليدوي (واتساب بزنس غير متصل): الرسالة جاهزة ولم تُرسل بعد",
  approvalManualAlt: "الوضع اليدوي (واتساب بزنس غير متصل): الرسالة جاهزة ولم تُرسل بعد",
  leadStatusNoteAr: "الموقع لا يستطيع معرفة ما إذا كان الرد قد حدث على واتساب. الفريق يغيّر الحالة يدوياً. عند الإغلاق، اختر السبب: اشترى، لم يرد، غير مناسب.",
  visitorsRetentionAr: "الزوار المجهولون يُحفظون 90 يوماً ثم يُحذفون. الموقع لا يعرف رقم من ضغط واتساب؛ الرسالة الجاهزة تحمل رمزاً مرجعياً يطابق الزائر عندما تصل رسالته. رقم الجوال يُخزَّن فقط عند إرسال نموذج.",
  charterSummaryAr: allianceSettings.charter.summary,
};

export const content = {
  homePage,
  homeFaq,
  faq,
  testimonials,
  proofNumbers,
  partners,
  lists,
  seo,
  needsConfirmation,
  contentHub,
  notifications,
  adminUsers,
  rolesMatrix,
  auditLog,
  forms,
  copy,
  /** The alliance charter and routing weights live in data/settings.ts (allianceSettings); re-exposed here. */
  charter: allianceSettings.charter,
  routingWeights: allianceSettings.routing.weights,
};
