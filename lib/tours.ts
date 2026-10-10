// Guided tours for the presenter layer · docs/route-map.md «Tour steps». Each step is a real route.
export interface TourStep {
  route: string; // without the tour parameters
  title: string;
  text: string;
  /** CSS selector to highlight on the page (optional) */
  highlight?: string;
}
export interface Tour {
  id: "buyer" | "owner" | "alliance";
  title: string;
  intro: string;
  steps: TourStep[];
}

export const TOURS: Tour[] = [
  {
    id: "buyer",
    title: "جولة المشتري",
    intro: "من الميزانية إلى رسالة واتساب جاهزة في أربع شاشات.",
    steps: [
      { route: "/", title: "ابدأ من الميزانية", text: "حرّك الميزانية بزر + أو −: عدد الوحدات والنطاقات تتغيّر فوراً من الوحدات المدرجة فعلاً.", highlight: "#finder" },
      { route: "/units?district=rawdah&max=700000", title: "النتائج والفلاتر", text: "كل فلتر وترتيب يعيش في الرابط. الوحدات المباعة تبقى للمرجع في شريطها.", highlight: "main" },
      { route: "/units/rz-a", title: "صفحة الوحدة", text: "السعر وسعر المتر والمقارنة بالحي محسوبة. المعرض والمخطط التخطيطي من هنا.", highlight: "main" },
      { route: "/compare?u=rz-d,ys-d,rz-c", title: "المقارنة", text: "الأفضل في كل صف يُعلَّم بالذهبي تلقائياً.", highlight: "main" },
      { route: "/units/rz-a", title: "اسأل على واتساب", text: "الرسالة جاهزة باسم النموذج والكود ورمز الزائر. لا يُرسل شيء في النموذج الأولي.", highlight: "a[href*='wa.me']" },
    ],
  },
  {
    id: "owner",
    title: "جولة المالك",
    intro: "عمارة بدخل: من الإضافة حتى الاعتماد في لوحة الإدارة.",
    steps: [
      { route: "/collaborate", title: "تعاون معنا", text: "ثلاثة أبواب: أضف عقارك، التحالف، المسوّقون.", highlight: "main" },
      { route: "/add?type=building", title: "الخطوة 1 · العقار", text: "اختر «عمارة سكنية» وحدد الموقع بالدبوس أو بلصق رابط خرائط.", highlight: "main" },
      { route: "/add/details?type=building", title: "الخطوة 2 · الدخل", text: "سعر المتر على البناء والأرض والعائد الإجمالي تُحسب وأنت تكتب.", highlight: "main" },
      { route: "/add/contact?type=building", title: "الخطوة 3 · التواصل", text: "الوكيل يرفق الوكالة. الخطأ في رقم الجوال يظهر بالذهبي ولا يضيع النص.", highlight: "main" },
      { route: "/add/sent?no=2026-1042", title: "وصل الطلب", text: "رقم الطلب يُنسخ ويُرسل على واتساب.", highlight: "main" },
      { route: "/admin/approvals/2026-1042", title: "الاعتماد", text: "قائمة التحقق حسب الدور؛ «اعتماد ونشر» ينشئ الوحدة في الذاكرة ويظهر توست.", highlight: "main" },
    ],
  },
  {
    id: "alliance",
    title: "جولة طلب التحالف",
    intro: "من صفر نتائج في الفيصلية إلى سجل إحالة في دفتر مكتب ط.",
    steps: [
      { route: "/units?district=faisaliyah&max=450000&beds=4&type=apt&feat=driver", title: "لا نتائج", text: "القيد الذي يحذف أكثر النتائج والاقتراحات محسوبة. نموذج الجسر يرسل الطلب لأعضاء التحالف.", highlight: "main" },
      { route: "/alliance/request/sent?req=REQ-2026-0412", title: "وصل الطلب", text: "رقم الطلب والمهلة.", highlight: "main" },
      { route: "/member/office-09/requests/REQ-2026-0412", title: "مكتب ط يجيب", text: "صفحة العضو بلا تسجيل دخول: عرض بمساحة وسعر وملاحظة.", highlight: "main" },
      { route: "/admin/alliance/requests?req=REQ-2026-0412", title: "اختيار العرض", text: "اختر عرض مكتب ط ثم «أنشئ سجل إحالة»: REF-2026-0117 يُنشأ في الذاكرة.", highlight: "main" },
      { route: "/member/office-09/referrals/REF-2026-0117", title: "سجل الإحالة", text: "الإيصال كما يراه العضو: الأطراف والقيمة والحماية 90 يوماً.", highlight: "main" },
      { route: "/member/office-09", title: "الدفتر", text: "أعطى واستقبل: الميزان يتحرك بالسجل الجديد.", highlight: "main" },
    ],
  },
];

export function tourById(id: string | null | undefined): Tour | undefined {
  return TOURS.find((t) => t.id === id);
}
export function tourHref(tour: Tour, step: number): string {
  const s = tour.steps[Math.min(Math.max(step, 1), tour.steps.length) - 1];
  const sep = s.route.includes("?") ? "&" : "?";
  return `${s.route}${sep}tour=${tour.id}&step=${step}`;
}
