"use client";
// /alliance · Alliance-M, Alliance-D, and launch day (Alliance-Launch-M) with ?members=0 (presenter «alliance members»).
// Counts, coverage, directory and the honeycomb come from the fixtures (data/offices, selectors); copy from the boards.
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { allianceSettings, offices } from "@/data";
import { usePresenter } from "@/lib/presenter";
import { cx } from "@/lib/format";
import { ArrowIcon, Header, MarkedText } from "@/components/ui";
import { CoverageGrid, DirectoryEmpty, FalBadge, HexCell, Honeycomb, MemberCard, Tbc, daysLabel, officesCount, type HoneyTone } from "@/components/alliance";
import { AllianceBand, AllianceFooter } from "./chrome";
import { CharterSheet } from "./apply/parts";
import { allianceCounts, APPLY_ID, coverageBlocks, directoryDistrict, honeycombTones, importedCount, launchGroups, launchRequired } from "./data";

const STATUS_HREF = `/alliance/status/${APPLY_ID}`;
const APPLY_HREF = "/alliance/apply";

function sectorsLabel(n: number): string {
  return n >= 3 && n <= 10 ? `${n} جهات` : n === 1 ? "جهة واحدة" : n === 2 ? "جهتان" : `${n} جهة`;
}
function officesWord(n: number): string {
  // «12 مكتباً» · «0 مكاتب» · «5 مكاتب»
  return n >= 11 ? `${n} مكتباً` : officesCount(n);
}

/** Gold CTA with the 60° corner (the boards' «سجّل مكتبك · 5 دقائق»). */
function GoldCta({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx("inline-flex h-12 items-center justify-center bg-gold px-5 text-[14px] font-extrabold text-ink no-underline cut-s hover:bg-gold-hover motion-hover transition-colors md:h-[52px] md:px-6 md:text-[15px]", className)}>
      {children}
    </Link>
  );
}

function Hero({ launch, counts }: { launch: boolean; counts: ReturnType<typeof allianceCounts> }) {
  const tones = honeycombTones();
  const launchCells: HoneyTone[] = ["outline", "outline", "outline", "outline", "gold", "outline", "outline", "outline", "outline"];
  const eyebrow = launch ? "يوم الإطلاق · الخلية الأولى SMQ، والباقي لكم" : `خلية واحدة لكل مكتب عضو · ${officesWord(counts.members)} اليوم`;
  const eyebrowD = launch ? eyebrow : `${eyebrow} في ${sectorsLabel(counts.sectors)}`;
  return (
    <section className="relative overflow-hidden bg-ink text-paper [clip-path:polygon(0_0,100%_0,100%_100%,52px_100%,0_calc(100%-30px))] md:[clip-path:polygon(0_0,100%_0,100%_100%,120px_100%,0_calc(100%-69px))]">
      {/* phone honeycomb: at the line end, partly off the edge */}
      <div className="pointer-events-none absolute top-4 -end-3 opacity-90 md:hidden">
        {launch ? <Honeycomb animate align="start" columns={3} size={40} gap={3} rowGap={3} cells={launchCells} /> : <Honeycomb animate align="start" columns={3} size={40} gap={3} rowGap={3} cells={tones} />}
      </div>
      <div className="container-smq grid gap-8 pt-7 pb-7.5 md:grid-cols-[minmax(0,1fr)_520px] md:items-center md:pt-12 md:pb-21">
        <div className="relative z-10 flex max-w-[240px] flex-col gap-3 md:max-w-none md:gap-4">
          <span className="text-[12px] font-bold text-gold md:text-[13px]">
            <span className="whitespace-nowrap md:hidden">{eyebrow}</span>
            <span className="hidden md:inline">{eyebrowD}</span>
          </span>
          <h1 className="text-[30px] leading-[1.15] font-extrabold md:text-[48px]">تحالف مكاتب جدة العقارية</h1>
          <p className="text-[14px] leading-relaxed text-on-ink-muted md:max-w-[560px] md:text-[17px]">
            <span className="md:hidden">مكاتب مرخّصة تمرّر طلبات المشترين وعروض العقارات بينها، لتقفل الصفقات أسرع، وكل تعارف مسجّل.</span>
            <span className="hidden md:inline">{launch ? "مكاتب مرخّصة تمرّر طلبات المشترين وعروض العقارات بينها، لتقفل الصفقات أسرع، وكل تعارف مسجّل." : "مكاتب مرخّصة تمرّر طلبات المشترين وعروض العقارات بينها، لتقفل الصفقات أسرع، وكل تعارف مسجّل في سجل إحالة يحمي حصة كل طرف."}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <GoldCta href={APPLY_HREF}>{launch ? "كن من المكاتب المؤسِّسة" : "سجّل مكتبك · 5 دقائق"}</GoldCta>
            {!launch && (
              <a href="#charter" className="hidden h-[52px] items-center px-5 text-[14px] font-bold text-paper no-underline hover:bg-ink-2 motion-hover transition-colors md:inline-flex" style={{ border: "1.5px solid var(--smq-paper)" }}>
                اقرأ الميثاق
              </a>
            )}
          </div>
        </div>
        <div className="hidden md:flex md:flex-col md:items-center md:gap-3 md:justify-self-end">
          {launch ? (
            <Honeycomb animate align="start" columns={3} size={84} gap={5} rowGap={5} cells={launchCells} />
          ) : (
            <Honeycomb animate align="start" columns={4} size={84} gap={5} rowGap={5} cells={tones} caption={`${counts.members} خلية = ${officesWord(counts.members)} · الذهبي: انضم هذا الشهر`} />
          )}
        </div>
      </div>
    </section>
  );
}

const STEPS: { t: string; m: string; d: string }[] = [
  { t: "سجّل مكتبك", m: "نموذج من 3 خطوات: المكتب، التغطية والتخصص، ما عندكم وما تحتاجون.", d: "نموذج من 3 خطوات: المكتب ومقدم الطلب، التغطية والتخصص، ما عندكم وما تحتاجون." },
  { t: "نوثّق الرخصة", m: "نتحقق من رخصة فال في موقع الهيئة يدوياً، خلال يومي عمل، ثم تحمل شارة «رخصة فال موثّقة».", d: "نتحقق من رخصة فال في موقع الهيئة يدوياً خلال يومي عمل، ثم يحمل المكتب شارة «رخصة فال موثّقة»." },
  { t: "تصلك طلبات في أحيائك", m: "كل طلب مشترٍ لا نغطيه، أو يطلبه عضو آخر، يُرسل لمن يغطي الحي. رد بـ «عندي عرض مطابق» أو «لا يوجد».", d: "كل طلب مشترٍ لا نغطيه، أو يطلبه عضو آخر، يُرسل لمن يغطي الحي عبر رابط واتساب. رد بـ «عندي عرض مطابق» أو «لا يوجد»." },
  { t: "كل تعارف مسجّل", m: "سجل إحالة برقم وتاريخ يحفظ حصة كل طرف طوال فترة الحماية. لا أحد يتخطّى أحداً.", d: "سجل إحالة برقم وتاريخ ومرحلة يحفظ حصة كل طرف طوال فترة الحماية. لا أحد يتخطّى أحداً." },
];

function StepHex({ n }: { n: number }) {
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-gold text-[14px] font-extrabold text-ink hex-flat tnum md:h-10 md:w-10 md:text-[15px]">{n}</span>;
}

function HowItWorks() {
  return (
    <section className="container-smq py-6 md:pt-10 md:pb-9">
      <h2 className="text-[18px] font-extrabold md:text-[26px]">كيف يعمل، في أربع خطوات</h2>
      <ol className="mt-1.5 flex flex-col md:mt-4 md:grid md:grid-cols-4 md:gap-3.5">
        {STEPS.map((s, i) => (
          <li key={s.t} className={cx("flex items-start gap-3 py-3 md:flex-col md:gap-2 md:bg-paper md:p-4.5 md:border-interactive", i > 0 && "border-t border-line md:border-t-0")}>
            <StepHex n={i + 1} />
            <span className="flex flex-col gap-1">
              <b className="text-[14px] font-extrabold md:text-[16px]">{s.t}</b>
              <span className="text-[12px] leading-[1.6] text-muted md:text-[13px] md:leading-[1.65]">
                <span className="md:hidden">{s.m}</span>
                <span className="hidden md:inline">{s.d}</span>
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function CharterRows({ framed }: { framed?: boolean }) {
  const d = allianceSettings.defaults;
  const rows: { k: string; m: ReactNode; d?: ReactNode }[] = [
    { k: "تقسيم العمولة بين المكتبين", m: d.split },
    { k: "حماية الإحالة", m: `${daysLabel(d.protectionDays)} من التعارف` },
    {
      k: "ما يُخرج العضو",
      m: `تخطّي سجل إحالة، أو رخصة منتهية، أو بلا رد ${daysLabel(d.suspendAfterNoReplyDays)}`,
      d: `تخطّي سجل إحالة، رخصة منتهية، أو بلا رد ${daysLabel(d.suspendAfterNoReplyDays)}`,
    },
  ];
  return (
    <div className={cx("flex flex-col", framed && "bg-paper border-interactive")}>
      {rows.map((r, i) => (
        <div key={r.k} className={cx("flex items-start justify-between gap-3 text-[13px]", framed ? "px-3.5 py-3" : "py-2.5", i > 0 && "border-t border-line")}>
          <span className="shrink-0 text-muted">{r.k}</span>
          <strong className={cx("text-end font-extrabold text-gold-text", r.d != null && "max-w-[180px] md:max-w-[220px]")}>
            {r.d ? (
              <>
                <span className="md:hidden">{r.m}</span>
                <span className="hidden md:inline">{r.d}</span>
              </>
            ) : (
              r.m
            )}{" "}
            <Tbc />
          </strong>
        </div>
      ))}
    </div>
  );
}

function CharterLink({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="inline-flex min-h-11 items-center gap-1 self-start text-[12px] font-bold text-gold-text hover:text-ink hover:underline">
      الميثاق الكامل، نصّ قابل للطباعة ←
    </button>
  );
}

function Values({ onCharter }: { onCharter: () => void }) {
  return (
    <>
      <section className="container-smq grid gap-4 md:grid-cols-[1fr_1fr_1.1fr] md:items-stretch md:gap-4 md:pb-10">
        <div className="relative flex flex-col gap-2 bg-paper p-4 ps-5 border-interactive md:order-1 md:gap-2.5 md:px-6 md:py-6 md:ps-7">
          <span aria-hidden className="absolute -inset-y-[1.5px] -start-[1.5px] w-[6px] bg-gold" />
          <span className="text-[14px] font-extrabold md:text-[18px]">ماذا يحصل عليه العضو</span>
          <ul className="flex list-disc flex-col ps-4 text-[13px] leading-[1.8] text-ink-2 md:ps-4.5 md:text-[14px] md:leading-[1.9]">
            <li>طلبات مشترين في الأحياء التي يغطيها</li>
            <li>
              <span className="md:hidden">تقرير طلب شهري: ماذا يبحث عنه مشترو جدة بالحي والميزانية والغرف</span>
              <span className="hidden md:inline">تقرير طلب شهري بالحي والميزانية والغرف</span>
            </li>
            <li>مكان في دليل الأعضاء، باختياره</li>
            <li>سجل إحالة يحمي حصته طوال فترة الحماية</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2 bg-ink p-4 text-paper cut-l md:order-2 md:gap-2.5 md:px-6 md:py-6">
          <span className="text-[14px] font-extrabold text-gold md:text-[18px]">ماذا يقدّم العضو</span>
          <ul className="flex list-disc flex-col ps-4 text-[13px] leading-[1.8] text-on-ink-muted md:ps-4.5 md:text-[14px] md:leading-[1.9]">
            <li>عروضه، بعقود وساطة موثّقة أو مباشرة من المُلّاك</li>
            <li>طلباته التي لا يغطيها</li>
            <li>رداً سريعاً على ما يصله: الميزان يحسب الوقت</li>
          </ul>
        </div>
        <div id="charter" className="hidden scroll-mt-20 flex-col gap-1 bg-paper p-5.5 border-interactive md:order-3 md:flex">
          <span className="text-[18px] font-extrabold">ملخّص الميثاق</span>
          <CharterRows />
          <CharterLink onOpen={onCharter} />
        </div>
      </section>
      {/* phone: the charter summary is its own section */}
      <section className="container-smq flex flex-col gap-2.5 pt-6 md:hidden" id="charter-m">
        <h2 className="text-[18px] font-extrabold">ملخّص الميثاق</h2>
        <CharterRows framed />
        <CharterLink onOpen={onCharter} />
      </section>
    </>
  );
}

function Coverage({ launch, counts, children }: { launch: boolean; counts: ReturnType<typeof allianceCounts>; children?: ReactNode }) {
  const m = coverageBlocks(5);
  const d = coverageBlocks(6);
  const toGrid = (blocks: ReturnType<typeof coverageBlocks>) => ({
    districts: blocks.flatMap((b) => b.districts.map((x) => x.district)),
    counts: Object.fromEntries(blocks.flatMap((b) => b.districts.map((x) => [x.district.slug, x.count]))) as Record<string, number>,
    sectorMembers: Object.fromEntries(blocks.map((b) => [b.sector, b.offices])),
  });
  const gm = toGrid(m);
  const gd = toGrid(d);
  const required = launch ? launchRequired() : [];
  const legend = launch ? `0 مكاتب · الذهبي: نحتاجه أولاً` : `${officesWord(counts.members)} · ${sectorsLabel(counts.sectors)} · الأسود: يغطيه أعضاء`;
  return (
    <section className="bg-paper" style={{ borderBlock: "1.5px solid var(--smq-ink)" }}>
      <div className="container-smq grid gap-10 pt-5.5 pb-6 md:grid-cols-[1.15fr_1fr] md:gap-12 md:py-9">
        <div className="flex min-w-0 flex-col gap-3.5 md:gap-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[18px] font-extrabold md:text-[26px]">
              <span className="md:hidden">تغطية جدة</span>
              <span className="hidden md:inline">{launch ? "تغطية جدة" : "تغطية جدة بجهاتها الخمس"}</span>
            </h2>
            <span className="text-caption text-muted md:text-[12px]">
              <span className="md:hidden">{legend}</span>
              <span className="hidden md:inline">{launch ? legend : "الأسود: يغطيه أعضاء · الرقم: عدد المكاتب"}</span>
            </span>
          </div>
          {launch ? (
            <LaunchGrid required={required} />
          ) : (
            <>
              <div className="md:hidden">
                <CoverageGrid districts={gm.districts} counts={gm.counts} sectorMembers={gm.sectorMembers} columns={5} columnsSm={5} size={60} sizeSm={60} />
              </div>
              <div className="hidden md:block">
                <CoverageGrid districts={gd.districts} counts={gd.counts} sectorMembers={gd.sectorMembers} columns={6} columnsSm={6} size={84} sizeSm={84} />
              </div>
            </>
          )}
          <span className="text-caption leading-relaxed text-muted md:text-[12px]">
            {launch ? (
              "الأحياء الذهبية هي حيث يبحث مشترو SMQ اليوم ولا وحدات لدينا فيها. أول مكتب يغطيها يستقبل طلباتها من أول يوم."
            ) : (
              <>
                <span className="md:hidden">الشبكة تخطيطية لا جغرافية: كل خلية حي، والرقم عدد المكاتب التي تغطيه. الأحياء الفارغة هي حيث نحتاج أعضاء أولاً.</span>
                <span className="hidden md:inline">الشبكة تخطيطية لا جغرافية: كل خلية حي. الأحياء الفارغة هي حيث نحتاج أعضاء أولاً، وهي نفسها التي يسأل عنها مشترو SMQ ولا وحدات لنا فيها.</span>
              </>
            )}
          </span>
        </div>
        {children && <div className="hidden min-w-0 md:block">{children}</div>}
      </div>
    </section>
  );
}

function LaunchGrid({ required }: { required: string[] }) {
  const groups = launchGroups();
  const rows = (size: number, shift: number) =>
    groups.map((g, gi) => (
      <div key={g.key} className="flex flex-col gap-1">
        <span className="text-caption font-extrabold text-gold-text md:text-[12px]">{g.label}</span>
        <div className="flex" style={{ gap: 4, marginInlineStart: gi % 2 === 1 ? shift : 0 }}>
          {g.districts.map((d) => {
            const want = required.includes(d.slug);
            return <HexCell key={d.slug} size={size} label={d.ar} value={want ? "مطلوب" : undefined} state={want ? "required" : "muted"} ariaLabel={want ? `${d.ar} · مطلوب` : d.ar} />;
          })}
        </div>
      </div>
    ));
  return (
    <>
      <div className="flex flex-col gap-2.5 md:hidden">{rows(60, 32)}</div>
      <div className="hidden md:block">
        <div className="flex flex-col gap-2.5">{rows(84, 44)}</div>
      </div>
    </>
  );
}

function Directory({ launch, counts, desktop }: { launch: boolean; counts: ReturnType<typeof allianceCounts>; desktop?: boolean }) {
  const list = launch ? [] : offices.filter((o) => o.status === "active" && o.inDirectory);
  return (
    <div className={cx("flex flex-col", desktop ? "gap-4" : "gap-2.5")}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className={cx("font-extrabold", desktop ? "text-[22px]" : "text-[18px]")}>دليل الأعضاء</h2>
        {!launch && <span className="text-caption text-muted md:text-[12px]">{counts.members} · يظهر من اختار الظهور</span>}
      </div>
      {launch ? (
        <DirectoryEmpty
          className="py-6.5"
          text={
            <MarkedText text="يظهر هنا اسم المكتب وحيّه وتخصصه وشارة «رخصة فال موثّقة»، باختيار المكتب. المكاتب المؤسِّسة تحمل وسم «مؤسِّس» دائماً [للتأكيد]." />
          }
        />
      ) : (
        <>
          <div className={cx("grid", desktop ? "grid-cols-2 gap-2" : "gap-1.5")}>
            {list.map((o) => (
              <MemberCard key={o.id} office={o} district={directoryDistrict(o)} badge={!desktop} className="min-h-[68px]" />
            ))}
          </div>
          {desktop ? (
            <span className="flex items-start gap-2 text-[12px] leading-relaxed text-muted">
              <FalBadge className="shrink-0" />
              كل الأعضاء الظاهرين يحملون الشارة؛ غير الموثّق لا يظهر أصلاً. الأسماء مواضع للتصميم (مكتب أ، ب).
            </span>
          ) : (
            <span className="text-caption leading-relaxed text-muted">الأسماء هنا مواضع لعرض التصميم (مكتب أ، مكتب ب). الدليل الحقيقي يعرض اسم المكتب كما في الرخصة، وبموافقته فقط.</span>
          )}
        </>
      )}
    </div>
  );
}

function Cta({ launch }: { launch: boolean }) {
  if (launch) {
    return (
      <section className="container-smq py-6 md:py-12">
        <div className="flex flex-col gap-2.5 bg-gold px-4.5 py-5 text-ink cut-l md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:px-8 md:py-9">
          <div className="flex flex-col gap-2">
            <span className="text-[20px] leading-snug font-extrabold md:text-[26px]">{importedCount()} مكتباً سجّلت في نموذج قوقل سابقاً</span>
            <span className="text-[13px] leading-relaxed text-on-gold-muted md:text-[14px]">نقلنا طلباتكم ونتحقق من الرخص الآن. سجّلتَ من قبل؟ لا تعد التسجيل، تابع الحالة برقم جوالك.</span>
          </div>
          <div className="flex flex-col items-center gap-2 md:items-stretch">
            <Link href={STATUS_HREF} className="mt-2 inline-flex h-12 w-full items-center justify-center bg-ink px-6 text-[14px] font-extrabold text-paper no-underline hover:bg-ink-2 motion-hover transition-colors md:mt-0">
              تابع حالة طلبك
            </Link>
            <Link href={APPLY_HREF} className="inline-flex min-h-11 items-center text-[12px] font-bold text-ink underline">
              مكتب جديد؟ سجّل من هنا
            </Link>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="container-smq pt-7 pb-8 md:pt-10 md:pb-14">
      <div className="flex flex-col gap-2.5 bg-gold px-4.5 py-5 text-ink [clip-path:polygon(0_0,calc(100%-16px)_0,100%_28px,100%_100%,0_100%)] md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-6 md:px-8 md:py-7 md:[clip-path:polygon(0_0,calc(100%-28px)_0,100%_48px,100%_100%,0_100%)]">
        <div className="flex flex-col gap-2">
          <span className="text-[20px] leading-snug font-extrabold md:text-[26px]">مكتبك مرخّص وتغطي حياً نحتاجه؟</span>
          <span className="text-[13px] leading-relaxed text-on-gold-muted md:text-[14px]">
            الطلب 5 دقائق، التوثيق يومان، ولا رسوم عضوية <Tbc />.
            <span className="hidden md:inline">
              {" "}
              سجّلت في نموذج قوقل سابقاً؟{" "}
              <Link href={STATUS_HREF} className="font-extrabold text-ink underline">
                تابع حالة طلبك
              </Link>
              .
            </span>
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Link href={APPLY_HREF} className="mt-2 inline-flex h-[52px] w-full items-center justify-center gap-2.5 bg-ink px-8 text-[15px] font-extrabold text-paper no-underline hover:bg-ink-2 motion-hover transition-colors md:mt-0 md:w-auto">
            سجّل مكتبك
            <ArrowIcon size={18} className="text-gold" />
          </Link>
          <Link href={STATUS_HREF} className="inline-flex min-h-11 items-center text-[12px] font-bold text-ink underline md:hidden">
            قدّمت من قبل؟ تابع حالة طلبك
          </Link>
        </div>
      </div>
    </section>
  );
}

export function AlliancePage() {
  const { state } = usePresenter();
  const launch = state.members === 0;
  const counts = allianceCounts();
  const [charterOpen, setCharterOpen] = useState(false);
  return (
    <div className="min-h-dvh bg-cream text-ink">
      <AllianceBand
        text={launch ? "مبادرة من SMQ · تنطلق الآن" : "مبادرة من SMQ · مفتوحة لكل مكتب مرخّص في جدة"}
        textD={
          launch ? (
            "مبادرة من SMQ · تنطلق الآن"
          ) : (
            <>
              مبادرة من SMQ · مفتوحة لكل مكتب عقاري مرخّص في جدة · لا رسوم عضوية <Tbc />
            </>
          )
        }
        link={{ label: "تعاون معنا ←", href: "/collaborate" }}
      />
      <Header active="/collaborate" waText="التحالف" menu={!launch} />
      <main>
        <Hero launch={launch} counts={counts} />
        {!launch && <HowItWorks />}
        {!launch && <Values onCharter={() => setCharterOpen(true)} />}
        <div className={cx(launch ? "pt-6" : "pt-7", "md:pt-0")}>
          <Coverage launch={launch} counts={counts}>
            <Directory launch={launch} counts={counts} desktop />
          </Coverage>
        </div>
        <section className="container-smq pt-6 md:hidden">
          <Directory launch={launch} counts={counts} />
        </section>
        <Cta launch={launch} />
      </main>
      <AllianceFooter />
      <CharterSheet open={charterOpen} onClose={() => setCharterOpen(false)} />
    </div>
  );
}
