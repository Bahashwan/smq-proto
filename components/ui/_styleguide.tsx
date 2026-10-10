"use client";
// QA styleguide for components/ui · rendered at /demo/components. Sections follow the Components sheet
// (1–8, titled as the sheet titles them), then the shell boards this library owns: HeaderFooter,
// Header-Scrolled-D, B-Card, B-Hero, State-Cards, State-Loading-M, Unit-Tier-*. Every number is computed from the
// fixtures (data/units, data/projects, data/districts); nothing here is typed from a board.
import { useMemo, useState, type ReactNode } from "react";
import { fmtNum, fmtArea, fmtDate, cx, bedsLabel } from "@/lib/format";
import { units, unitByCode, floorLabel } from "@/data/units";
import { projects } from "@/data/projects";
import { districtBySlug } from "@/data/districts";
import { Button, IconButton } from "./Button";
import { Chip, FilterChip, Segmented, Tabs, CompareToggle, Switch } from "./Chip";
import { TextField, SelectField, TextArea, Checkbox, RadioGroup, ErrorSummary } from "./Field";
import { Stepper, RangeSlider } from "./Stepper";
import { StatusBadge, StatusDot, Pill, CountBadge, Tag, BuildingTag, IllustrativeLabel } from "./Status";
import { PriceBand } from "./PriceBand";
import { Row, RowGroup, Accordion, Breadcrumb, Eyebrow, SectionHeading, HexNumber, LoadMore } from "./Rows";
import { Mark, MarkedText } from "./Mark";
import { Notice } from "./Notice";
import { ImageSlot } from "./ImageSlot";
import { GalleryThumbs } from "./GalleryThumbs";
import { UnitCard } from "./UnitCard";
import { CompareBar } from "./CompareBar";
import { BottomSheet } from "./BottomSheet";
import { Skeleton } from "./Skeleton";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { HeroFinder, SelectButton } from "./HeroFinder";
import { Price } from "./Price";
import { WhatsAppIcon, PhoneIcon } from "./icons";

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cx("flex flex-col gap-3", className)}>
      <h2 className="m-0 text-h3">{title}</h2>
      {children}
    </section>
  );
}
function Label({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <span className="text-caption font-bold text-muted leading-relaxed">
      {children}
      {sub && (
        <>
          <br />
          <span className="font-normal">{sub}</span>
        </>
      )}
    </span>
  );
}
function Cap({ children }: { children: ReactNode }) {
  return <span className="text-caption font-bold text-muted">{children}</span>;
}

export function Styleguide() {
  const [beds, setBeds] = useState("all");
  const [view, setView] = useState("grid");
  const [budget, setBudget] = useState(700000);
  const [heroBudget, setHeroBudget] = useState(600000);
  const [slider, setSlider] = useState(700000);
  const [reply, setReply] = useState<"wa" | "call" | "mail" | null>("wa");
  const [featured, setFeatured] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [compareOn, setCompareOn] = useState(true);

  const rzA = unitByCode("RZ-A")!;
  const rzC = unitByCode("RZ-C")!;
  const rzD = unitByCode("RZ-D")!;
  const ysA = unitByCode("YS-A")!;
  // the reserved state is a demo (the inventory has none): YS-B with a reservation date
  const ysB = { ...unitByCode("YS-B")!, status: "reserved" as const, reservedUntil: "2026-10-20" };
  const project = projects.find((p) => p.id === rzA.projectId) ?? projects[0];
  const district = districtBySlug(project.districtSlug);
  const delivery = project.deliveryLabel.value ? `تسليم ${project.deliveryLabel.value}` : undefined;
  const available = useMemo(() => units.filter((u) => u.status === "available"), []);
  const inBudget = useMemo(() => available.filter((u) => u.priceSar <= heroBudget), [available, heroBudget]);
  const fromPrice = inBudget.length ? Math.min(...inBudget.map((u) => u.priceSar)) : undefined;
  const bedsRange = inBudget.length ? [Math.min(...inBudget.map((u) => u.beds)), Math.max(...inBudget.map((u) => u.beds))] : null;
  const areaRange = inBudget.length ? [Math.min(...inBudget.map((u) => u.areaM2)), Math.max(...inBudget.map((u) => u.areaM2))] : null;
  const thumbs = rzA.images.map((slotId, i) => ({ slotId, label: ["الصالة", "المطبخ", "غرفة النوم"][i], short: ["الصالة", "المطبخ", "النوم"][i] }));

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-3.5">
        <h2 className="m-0 text-h2">ورقة المكونات · كل الحالات</h2>
        <Cap>الحالات من اليمين: افتراضي · hover · focus · disabled · loading أو خاص</Cap>
      </div>

      {/* 1 */}
      <Section title="1 · الأزرار">
        <div className="grid grid-cols-1 md:grid-cols-[140px_repeat(5,minmax(0,1fr))] gap-3 items-center">
          <Label sub="واتساب والإجراء الرئيسي فقط">أساسي · ذهبي</Label>
          <Button variant="primary">واتساب</Button>
          <Button variant="primary" state="hover">hover</Button>
          <Button variant="primary" state="focus">focus</Button>
          <Button variant="primary" disabled>disabled</Button>
          <Button variant="primary" loading>جارٍ الإرسال</Button>

          <Label sub="عرض النتائج، التالي، إرسال">ثانوي · أسود</Label>
          <Button variant="secondary" arrow>اعرض الوحدات</Button>
          <Button variant="secondary" state="hover">hover</Button>
          <Button variant="secondary" state="focus">focus</Button>
          <Button variant="secondary" disabled>disabled</Button>
          <Button variant="whatsapp">واتساب</Button>

          <Label sub="الإجراء الثالث، العودة، الاتصال">إطار</Label>
          <Button variant="ghost">اتصال</Button>
          <Button variant="ghost" state="hover">hover</Button>
          <Button variant="ghost" state="focus">focus</Button>
          <Button variant="ghost" disabled>disabled</Button>
          <Button variant="link" href="#x">رابط نصي</Button>

          <Label sub="40 إلى 64px">أيقونة سداسية</Label>
          <div className="flex flex-wrap items-center gap-2 md:col-span-5">
            <IconButton label="تواصل عبر واتساب" tone="gold" size={44}><WhatsAppIcon size={20} /></IconButton>
            <IconButton label="اتصال" tone="ink" size={44}><PhoneIcon /></IconButton>
            <IconButton label="اتصال" tone="ghost-paper" size={48}><PhoneIcon /></IconButton>
            <span className="inline-flex items-center gap-2 p-2 bg-ink"><IconButton label="إنستغرام" tone="ghost-ink" size={40}><PhoneIcon /></IconButton></span>
            <IconButton label="تواصل عبر واتساب" tone="gold" size={64}><WhatsAppIcon size={26} /></IconButton>
            <Button variant="primary" size="s">صغير</Button>
            <Button variant="secondary" size="l" arrow>كبير</Button>
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2 */}
        <Section title="2 · الشرائح والمبدّلات">
          <div className="flex flex-wrap items-center gap-2">
            <Chip>افتراضي</Chip>
            <Chip state="hover">hover</Chip>
            <Chip active>محدد</Chip>
            <Chip state="focus">focus</Chip>
            <Chip disabled>disabled</Chip>
            <FilterChip onRemove={() => {}}>فلتر نشط</FilterChip>
            <Chip active size="s">{`${fmtNum(700)} ألف`}</Chip>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Segmented label="عدد الغرف" value={beds} onChange={setBeds} options={[{ value: "all", label: "الكل" }, { value: "2", label: "2" }, { value: "3", label: "3" }, { value: "4", label: "4" }]} />
            <Segmented label="طريقة العرض" value={view} onChange={setView} size="s" options={[{ value: "grid", label: "شبكة" }, { value: "map", label: "خريطة" }]} />
            <Tabs label="تبويبات" items={[{ label: "نشط", href: "#x", active: true }, { label: "تبويب", href: "#x" }, { label: "hover", href: "#x", state: "hover" }]} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <CompareToggle checked={false} onChange={() => {}} />
            <CompareToggle checked={compareOn} onChange={setCompareOn} />
            <CompareToggle checked={false} full />
            <Switch checked={featured} onChange={setFeatured} label="مفتاح مميزة" />
          </div>
        </Section>

        {/* 3 */}
        <Section title="3 · الحقول">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField label="افتراضي" placeholder="05XXXXXXXX" ltr />
            <TextField label="focus (الإطار ذهبي، الخلفية #FFFDF6)" defaultValue="0559997929" ltr state="focus" />
            <TextField label="ممتلئ" defaultValue="محمد العمري" />
            <TextField label="خطأ (ذهبي، لا أحمر)" defaultValue="05599" ltr error="الرقم يجب أن يبدأ بـ 05 ويتكون من 10 أرقام" />
            <TextField label="disabled" defaultValue="جدة" disabled />
            <SelectField label="قائمة" defaultValue="rawdah" options={[{ value: "rawdah", label: "الروضة" }]} />
            <TextField label="مطلوب" required placeholder="الاسم" />
            <TextArea label="رسالتك" maxLength={600} defaultValue="أبحث عن شقة 3 غرف بميزانية 700 ألف، هل يمكن زيارة يوم السبت؟" rows={3} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <RadioGroup name="reply" label="طريقة الرد" value={reply} onChange={setReply} options={[{ value: "wa", label: "واتساب" }, { value: "call", label: "اتصال" }, { value: "mail", label: "بريد" }]} />
            <div className="flex flex-col gap-3">
              <Checkbox label="أوافق على أن تتواصل SMQ معي بخصوص رسالتي." />
              <Checkbox label="أوافق على أن تتواصل SMQ معي بخصوص رسالتي." error="علّم الموافقة حتى نستطيع الرد عليك." />
            </div>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Stepper value={budget} onChange={setBudget} className="md:flex-1" />
            <RangeSlider value={slider} onChange={setSlider} min={200000} max={2000000} label="الميزانية" className="md:flex-1" />
          </div>
          <ErrorSummary autoFocus={false} title="لم تُرسل الرسالة. حقلان يحتاجان تصحيحاً:" errors={[{ id: "phone", label: "رقم الجوال غير مكتمل" }, { id: "consent", label: "الموافقة على التواصل مطلوبة" }]} />
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col gap-3">
          {/* 4 */}
          <Section title="4 · الشارات والحالة">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status="available" />
              <StatusBadge status="reserved" />
              <StatusBadge status="sold" />
              <Pill tone="ink">قيد الإنشاء</Pill>
              <Pill tone="outline">جاهز</Pill>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <IllustrativeLabel className="border border-line" />
              <Tag>غرفة خادمة</Tag>
              <Pill tone="ink" delta>{`+${available.filter((u) => u.priceSar > 700000).length} وحدات`}</Pill>
              <CountBadge>{units.filter((u) => u.beds === 3).length}</CountBadge>
              <BuildingTag>عمارة روز</BuildingTag>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status="soon" />
              <StatusBadge status="owner" />
              <StatusBadge status="available" size={40} />
              <StatusDot tone="gold" size={2} />
              <StatusDot tone="ink" size={3} />
              <StatusDot tone="gold" size={4} pulse />
              <Mark>[للتأكيد]</Mark>
              <Mark>[مسودة إجابة]</Mark>
              <Pill tone="sand">{`${available.length} من ${units.length} متاحة`}</Pill>
            </div>
          </Section>
          {/* 5 */}
          <Section title="5 · شريط السعر" className="mt-3">
            <PriceBand price={rzD.priceSar} area={rzD.areaM2} variant="dark" ppmLabel="للمتر" />
            <PriceBand price={ysB.priceSar} area={ysB.areaM2} variant="reserved" ppmLabel="للمتر · محجوز" />
            <PriceBand price={ysA.priceSar} variant="sold" soldLabel={`بيعت ${fmtDate(ysA.soldOn!).slice(0, 7)}`} />
            <PriceBand price={rzA.priceSar} area={rzA.areaM2} variant="dark" size="l" cut ppmLabel="للمتر المربع" />
          </Section>
        </div>

        {/* 6 */}
        <Section title="6 · الصفوف والأكورديون">
          <RowGroup header={["رأس الجدول", "يبدأ من", "الحالة"]}>
            <Row href="#x" cells={[<strong key="a">صف قابل للنقر</strong>, <Price key="b" value={rzD.priceSar} sign={false} className="font-extrabold" />, <span key="c" className="text-gold-text font-bold">متاح</span>]} />
            <Row href="#x" state="hover" cells={[<strong key="a">hover</strong>, <Price key="b" value={rzC.priceSar} sign={false} className="font-extrabold" />, <span key="c" className="text-gold-text font-bold">متاح</span>]} />
            <Row muted divider={false} cells={[<strong key="a" className="text-ink">مباع</strong>, <Price key="b" value={ysA.priceSar} sign={false} className="font-extrabold line-through" />, <Pill key="c" tone="ink">مباع</Pill>]} />
          </RowGroup>
          <RowGroup framed={false} aria-label="المواصفات">
            <Row label="المساحة" value={`${fmtArea(rzA.areaM2)} م²`} />
            <Row label="الطابق" value={floorLabel(rzA)} tbc />
            <Row label="الغرف" value={bedsLabel(rzA.beds)} divider={false} />
          </RowGroup>
          <Accordion items={[{ id: "faq-open", q: "سؤال مفتوح", a: "الإجابة. المعيّن يتحول من إطار إلى ذهبي مملوء عند الفتح.", defaultOpen: true }, { id: "faq-closed", q: "سؤال مغلق", a: "الإجابة.", draft: true }]} />
          <Breadcrumb items={[{ label: "جدة", href: "#x" }, { label: "الروضة", href: "#x" }, { label: "جاردن الروضة" }]} />
          <div className="flex items-center gap-2">
            <LoadMore label={`عرض ${available.length - 5} وحدات أخرى`} onClick={() => {}} />
            <LoadMore label="" onClick={() => {}} done />
          </div>
          <div className="flex flex-col gap-2">
            <Eyebrow>مكتب تسويق واستثمار عقاري · جدة</Eyebrow>
            <SectionHeading size="s" title="المشروع الحالي" link={{ label: "كل التفاصيل", href: "#x" }} />
            <div className="flex items-center gap-2">
              {["01", "02", "03", "04"].map((n) => (
                <HexNumber key={n}>{n}</HexNumber>
              ))}
              <HexNumber tone="ink">05</HexNumber>
            </div>
          </div>
        </Section>

        <div className="flex flex-col gap-3">
          {/* 7 */}
          <Section title="7 · خانات الصور، الثلاث طبقات">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex flex-col gap-1.5">
                <ImageSlot slotId="IMG-UNIT-APT-3BR-LIVING" tier="real" cut="img" className="h-27.5" compact />
                <Cap>1 · فعلية · بلا وسم</Cap>
              </div>
              <div className="flex flex-col gap-1.5">
                <ImageSlot slotId="IMG-UNIT-APT-3BR-LIVING" tier="generated" cut="img" className="h-27.5" compact />
                <Cap>2 · مولّدة · صورة تعبيرية</Cap>
              </div>
              <div className="flex flex-col gap-1.5">
                <ImageSlot slotId="IMG-UNIT-APT-3BR-LIVING" tier="typographic" cut="img" className="h-27.5" compact unit={{ model: rzA.model, buildingNameAr: rzA.buildingNameAr, areaM2: rzA.areaM2, beds: rzA.beds, baths: rzA.baths, typeAr: "شقة" }} />
                <Cap>3 · طباعي</Cap>
              </div>
            </div>
          </Section>
          {/* 8 */}
          <Section title="8 · إشعارات وشريط المقارنة" className="mt-3">
            <Notice tone="ink" action={{ label: "قارن الآن", href: "/compare" }}>{`أُضيفت نموذج ${rzD.model} · ${rzD.buildingNameAr} إلى المقارنة`}</Notice>
            <Notice tone="sand" aside="تصلك رسالة واتساب خلال دقائق">تم إرسال طلبك · رقم 2026-1042</Notice>
            <div className="relative">
              <CompareBar slugs={["rz-d", "ys-d"]} nameOf={(s) => `نموذج ${unitByCode(s)?.model ?? ""} ${unitByCode(s)?.buildingNameAr ?? ""}`} className="!static" />
            </div>
            <Button variant="ghost" size="s" onClick={() => setSheet(true)} className="self-start">افتح الورقة السفلية</Button>
            <BottomSheet open={sheet} onClose={() => setSheet(false)} title="الفلاتر" actions={<Button variant="link" onClick={() => setSheet(false)} className="underline">مسح الكل</Button>}>
              <div className="flex flex-col gap-3 py-2">
                <div className="flex flex-wrap gap-2">
                  <FilterChip onRemove={() => {}}>الروضة</FilterChip>
                  <FilterChip onRemove={() => {}}>{`حتى ${fmtNum(700000)}`}</FilterChip>
                  <FilterChip onRemove={() => {}}>شقق</FilterChip>
                </div>
                <SelectField label="الحي" defaultValue="rawdah" options={[{ value: "rawdah", label: "الروضة" }, { value: "all", label: "الكل" }]} />
                <Button variant="secondary" full onClick={() => setSheet(false)}>{`اعرض ${inBudget.length} وحدات`}</Button>
              </div>
            </BottomSheet>
          </Section>
        </div>
      </div>

      {/* Shell boards */}
      <Section title="الهيدر والفوتر · HeaderFooter">
        <Cap>الهيدر · سطح المكتب · 72px</Cap>
        <Header demo="default" withMenu showEn active="/guide" />
        <Cap>عند التمرير · 56px · Header-Scrolled-D</Cap>
        <Header demo="scrolled" showEn active="/guide" />
        <Cap>الفوتر الكامل</Cap>
        <Footer />
        <Cap>الفوتر المختصر (النتائج والوحدة)</Cap>
        <Footer compact />
        <Cap>EN</Cap>
        <div dir="ltr" lang="en" className="font-latin flex flex-col gap-3">
          <Header demo="default" variant="en" showEn active="/en/units" />
          <Footer variant="en" />
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-[358px_390px] gap-8 items-start">
        <Section title="بطاقة النتيجة · B-Card">
          <UnitCard unit={rzA} variant="full" projectName={project.nameAr} projectHref={`/projects/${project.slug}`} districtName={district?.ar} deliveryLabel={delivery} compare={{ checked: false, onChange: () => {} }} showUpdated />
        </Section>
        <Section title="الهيرو والباحث · B-Hero">
          <div className="border border-line">
            <HeroFinder
              budget={{ eyebrow: "نقودك بثقة نحو القرار العقاري الصحيح", title: "كم ميزانيتك؟", value: heroBudget, onChange: setHeroBudget, size: "m", presets: [450000, 600000, 800000, 1500000].map((v) => ({ value: v, label: v >= 1000000 ? `${v / 1000000} مليون` : `${v / 1000} ألف` })) }}
              answer={{ count: inBudget.length, countLabel: "وحدات متاحة", line: "ضمن ميزانيتك في حي الروضة", from: fromPrice, ranges: bedsRange && areaRange ? `${bedsRange[0] === bedsRange[1] ? bedsLabel(bedsRange[0]) : `${bedsLabel(bedsRange[0])} إلى ${bedsLabel(bedsRange[1])}`} · ${Math.floor(areaRange[0])} إلى ${Math.ceil(areaRange[1])} م²` : undefined }}
              pickers={
                <>
                  <SelectButton label="الحي" value="الروضة" aria-haspopup="listbox" />
                  <SelectButton label="الغرف" value={bedsRange ? (bedsRange[0] === bedsRange[1] ? String(bedsRange[0]) : `${bedsRange[0]} إلى ${bedsRange[1]}`) : "الكل"} aria-haspopup="listbox" />
                </>
              }
              cta={{ label: `اعرض ${inBudget.length} وحدات`, href: "/units" }}
            />
          </div>
        </Section>
      </div>

      <Section title="حالات البطاقة · State-Cards">
        <div className="grid grid-cols-1 md:grid-cols-[358px_358px] lg:grid-cols-[358px_358px_358px] gap-6 items-start">
          <div className="flex flex-col gap-2.5">
            <Cap>محجوز</Cap>
            <UnitCard unit={ysB} compare={{ checked: false, onChange: () => {} }} />
          </div>
          <div className="flex flex-col gap-2.5">
            <Cap>مباع</Cap>
            <UnitCard unit={ysA} />
            <Cap>الشارات الثلاث</Cap>
            <div className="flex items-center gap-4">
              <StatusBadge status="available" />
              <StatusBadge status="reserved" />
              <StatusBadge status="sold" />
              <span className="text-caption text-muted leading-relaxed">
                ذهبي مملوء = متاح
                <br />
                أبيض بإطار = محجوز
                <br />
                أسود = مباع
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <Cap>من مالك · بطاقة النتائج</Cap>
            <UnitCard unit={rzD} fromOwner deliveryLabel={delivery} compare={{ checked: true, onChange: () => {} }} />
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-[390px_1fr] gap-8 items-start">
        <Section title="هياكل التحميل · State-Loading-M">
          <div className="flex flex-col gap-3.5 border border-line p-4">
            <h3 className="m-0 text-h2">الوحدات في جدة</h3>
            <Skeleton.Status>نبحث في الوحدات المتاحة…</Skeleton.Status>
            <Skeleton.Filters />
            <div className="flex items-center justify-between">
              <Skeleton.Block w={150} h={18} />
              <Skeleton.Block w={80} h={24} tone="sand" />
            </div>
            <Skeleton.Card />
            <Skeleton.Card actions={false} />
            <Skeleton.Lines n={3} />
          </div>
        </Section>
        <Section title="طبقات الصور · Unit-Tier-Real-M / Gen-M / Typo-M">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(["real", "generated", "typographic"] as const).map((tier) => (
              <div key={tier} className="flex flex-col gap-2 max-w-[358px]">
                <Cap>{tier === "real" ? "الطبقة 1 · صورة فعلية · لا وسم" : tier === "generated" ? "الطبقة 2 · صورة مولّدة · الوسم إجباري" : "الطبقة 3 · طباعي · الأرقام تملأ الخانة"}</Cap>
                <div className="relative">
                  <ImageSlot slotId={rzA.images[0]} tier={tier} ratio="3:2" cut="img-l" className="h-60" unit={{ model: rzA.model, buildingNameAr: rzA.buildingNameAr, areaM2: rzA.areaM2, beds: rzA.beds, baths: rzA.baths, floor: floorLabel(rzA) }} />
                  <StatusBadge status="available" size={54} className="absolute top-3 start-3" />
                </div>
                <GalleryThumbs items={thumbs} active={0} onSelect={() => {}} tier={tier} planHref="#plan" unit={{ beds: rzA.beds, baths: rzA.baths, orientation: rzA.orientation?.value }} />
                {tier === "generated" && <p className="m-0 text-caption text-muted">الصور تعبيرية مولّدة من المخطط والمواصفات، وتُستبدل بصور فعلية بعد التصوير. الأبعاد والتشطيب النهائي بحسب العقد.</p>}
                {tier === "typographic" && (
                  <p className="m-0 text-label text-muted">
                    <MarkedText text={`${bedsLabel(rzA.beds)} نوم · ${fmtArea(rzA.areaM2)} م² · الطابق ${floorLabel(rzA)} [للتأكيد]`} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
