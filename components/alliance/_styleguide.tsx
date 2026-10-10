"use client";
// QA styleguide section for components/alliance · rendered at /demo/components#alliance.
// Every component in every state, in the order of the Components3 sheet, then the page pieces
// (honeycomb, coverage, radar, directory, report, protection, dispute, offers, board). Sample data is inline
// and illustrative; pages compute theirs from /data.
import { useState, type ReactNode } from "react";
import type { District, Office, Referral } from "@/data/types";
import {
  APPLICATION_STEPS,
  BoardColumn,
  CoverageGrid,
  DirectoryEmpty,
  DisputeFlag,
  DisputePanel,
  DistrictMultiSelect,
  DoorCard,
  FalBadge,
  HexCell,
  HexGrid,
  Honeycomb,
  LedgerBar,
  MemberCard,
  OfferRow,
  OfferRowsHeader,
  AlliancePill,
  ProtectionMeter,
  RadarGrid,
  type RadarDistrict,
  ReferralReceipt,
  ReportBarRow,
  ReportGapRow,
  ReportTile,
  RequestCard,
  StageBoard,
  StageLine,
  StagePill,
  Tbc,
} from "./index";

const D = (slug: string, ar: string, sector: District["sector"]): District => ({ slug, ar, en: slug, sector, centre: { lat: 21.5, lng: 39.2 }, comingSoon: false });
const DISTRICTS: District[] = [
  D("obhur-north", "أبحر الشمالية", "north"),
  D("shati", "الشاطئ", "north"),
  D("dhahban", "ذهبان", "north"),
  D("mohammadiyah", "المحمدية", "north"),
  D("nahdah", "النهضة", "north"),
  D("basateen", "البساتين", "north"),
  D("rawdah", "الروضة", "central"),
  D("safa", "الصفا", "central"),
  D("naeem", "النعيم", "central"),
  D("zahra", "الزهراء", "central"),
  D("salamah", "السلامة", "central"),
  D("khalidiyah", "الخالدية", "central"),
  D("harazat", "الحرازات", "east"),
  D("samer", "السامر", "east"),
  D("rehab", "الرحاب", "east"),
  D("ajaweed", "الأجاويد", "east"),
  D("bryman", "بريمان", "east"),
  D("waha", "الواحة", "east"),
  D("hamra", "الحمراء", "west"),
  D("balad", "البلد", "west"),
  D("andalus", "الأندلس", "west"),
  D("ruwais", "الرويس", "west"),
  D("sharafiyah", "الشرفية", "west"),
  D("baghdadiyah", "البغدادية", "west"),
  D("faisaliyah", "الفيصلية", "south"),
  D("muntazahat", "المنتزهات", "south"),
  D("jamiah", "الجامعة", "south"),
  D("sanabel", "السنابل", "south"),
  D("quwaizah", "قويزة", "south"),
  D("kawthar", "الكوثر", "south"),
];
const COUNTS: Record<string, number> = { "obhur-north": 2, shati: 1, mohammadiyah: 2, rawdah: 2, safa: 1, naeem: 1, samer: 1, hamra: 1, faisaliyah: 1 };
const SECTOR_MEMBERS = { north: 5, central: 4, east: 1, west: 1, south: 1 } as const;

const R = (slug: string, sessions: number, extra: Partial<RadarDistrict> = {}): RadarDistrict => {
  const d = DISTRICTS.find((x) => x.slug === slug)!;
  return { slug, ar: d.ar, sector: d.sector, sessions, ...extra };
};
const RADAR: RadarDistrict[] = [
  R("obhur-north", 318, { units: 0, members: 2, rank: 1 }),
  R("shati", 186, { units: 0, members: 2, state: "active" }),
  R("dhahban", 12),
  R("mohammadiyah", 96, { units: 0, members: 2 }),
  R("nahdah", 44, { units: 0, members: 0 }),
  R("basateen", 18),
  R("rawdah", 1060, { units: 8, members: 2 }),
  R("safa", 204, { units: 1, members: 1, rank: 2, state: "rank-2" }),
  R("naeem", 433, { units: 0, members: 0, offers: 1 }),
  R("zahra", 71, { units: 0, members: 0 }),
  R("salamah", 9),
  R("khalidiyah", 15),
  R("harazat", 58, { units: 0, members: 0 }),
  R("samer", 39, { units: 0, members: 1, state: "active" }),
  R("rehab", 7),
  R("ajaweed", 11),
  R("bryman", 4),
  R("waha", 6),
  R("hamra", 52, { units: 0, members: 1, state: "active" }),
  R("balad", 14),
  R("andalus", 22),
  R("ruwais", 8),
  R("sharafiyah", 19),
  R("baghdadiyah", 5),
  R("faisaliyah", 141, { units: 0, members: 1, rank: 3 }),
  R("muntazahat", 16),
  R("jamiah", 21),
  R("sanabel", 3),
  R("quwaizah", 9),
  R("kawthar", 13),
];

const OFFICE_A: Pick<Office, "letter" | "nameAr" | "specialties"> = { letter: "أ", nameAr: "مكتب أ", specialties: ["فلل", "أراضي مطورة"] };
const OFFICE_B: Pick<Office, "letter" | "nameAr" | "specialties"> = { letter: "ب", nameAr: "مكتب ب", specialties: ["شقق", "عماير سكنية"] };

const REF: Referral = {
  id: "REF-2026-0117",
  requestId: "REQ-2026-0412",
  requesterOfficeId: "SMQ",
  offerOfficeId: "office-09",
  districtSlug: "faisaliyah",
  summary: "شقة · 4 غرف · الفيصلية · حتى 450,000",
  offerSummary: "شقة · 165 م² · 440,000 ريال",
  brokered: true,
  valueSar: 440000,
  split: "50 / 50",
  splitTbc: true,
  protectionDays: 90,
  introducedOn: "2026-10-10",
  stage: "viewing",
  stageNote: "التعارف 2026/10/10 · المعاينة محجوزة الخميس 4 م. تُحدَّث المرحلة من فريق SMQ بعد تأكيد المكتبين.",
  createdBy: "نورة",
};

function Sec({ n, title, children }: { n: number | string; title: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <h2 className="text-h3">
        {n} · {title}
      </h2>
      {children}
    </section>
  );
}
function St({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-[10px] font-extrabold text-muted">{children}</span>;
}
function Btn({ children, tone = "outline" }: { children: ReactNode; tone?: "outline" | "ink" | "gold" }) {
  const look = tone === "ink" ? "bg-ink text-paper" : tone === "gold" ? "bg-gold text-ink cut-s" : "bg-paper border-interactive";
  return (
    <button type="button" className={`inline-flex h-[34px] items-center whitespace-nowrap px-3 text-[12px] font-extrabold ${look}`}>
      {children}
    </button>
  );
}

export function Styleguide() {
  const [picked, setPicked] = useState<string[]>(["obhur-north", "shati"]);
  const [selected, setSelected] = useState<string | null>("obhur-north");
  const [offer, setOffer] = useState(true);
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-wrap items-baseline justify-between gap-3 pb-3" style={{ borderBottom: "2px solid var(--smq-ink)" }}>
        <h2 className="text-h2">ورقة المكونات 3 · التحالف وتعاون معنا</h2>
        <span className="text-[12px] text-muted">تكمل الورقتين 1 و2 · السداسي هو شكل التحالف: خلية = مكتب أو حي · الحالة بالشكل والكلمة، لا بالألوان</span>
      </header>

      <Sec n={1} title="بطاقة الباب (تعاون معنا)">
        <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <St>owners · gold block, big cut</St>
            <DoorCard variant="owners" eyebrow="01 · للمُلّاك" title="عندك عقار؟" text="لمن · ماذا تحصل · ماذا نحتاج · الوقت" cta="أضف عقارك" href="/add" />
          </div>
          <div>
            <St>offices · ink, honeycomb</St>
            <DoorCard variant="offices" eyebrow="02 · للمكاتب · مبادرة من SMQ" title="عندك مكتب عقاري؟" text="لمن · ماذا تحصل · ماذا نحتاج · الوقت" cta="اعرف عن التحالف" href="/alliance" />
          </div>
          <div>
            <St>marketers · outlined, link motif</St>
            <DoorCard variant="marketers" eyebrow="03 · للأفراد" title="مسوّق عقاري؟" cta="انضم كمسوّق" href="/marketers" />
          </div>
          <div>
            <St>hover · gold rule appears right (hover the card)</St>
            <DoorCard variant="marketers" eyebrow="03 · للأفراد" title="مسوّق عقاري؟" text="hover: شريط ذهبي 6px يمين، لا ظل ولا حركة. focus: إطار ذهبي خارجي." cta="انضم كمسوّق" href="/marketers" icon={null} />
          </div>
        </div>
      </Sec>

      <div className="grid items-start gap-8 xl:grid-cols-2">
        <Sec n={2} title="اختيار الأحياء المتعدد">
          <div className="grid gap-3.5 md:grid-cols-2">
            <div>
              <St>selected tags · search · grouped list</St>
              <DistrictMultiSelect districts={DISTRICTS} value={picked} onChange={setPicked} note="القائمة مجموعة بالجهة ومرتّبة أبجدياً داخلها. الوسم الأسود المختار بعلامة × ذهبية. على الجوال تفتح كورقة سفلية بملء الشاشة." />
            </div>
            <div className="flex flex-col gap-2.5">
              <div>
                <St>empty</St>
                <DistrictMultiSelect districts={DISTRICTS.slice(0, 3)} value={[]} onChange={() => {}} inlineList={false} />
              </div>
              <div>
                <St>no match</St>
                <DistrictMultiSelect districts={[]} value={[]} onChange={() => {}} />
              </div>
              <div>
                <St>error · required</St>
                <DistrictMultiSelect districts={DISTRICTS.slice(0, 3)} value={[]} onChange={() => {}} error inlineList={false} />
              </div>
              <div>
                <St>disabled</St>
                <DistrictMultiSelect districts={DISTRICTS} value={[]} onChange={() => {}} sectors={[]} requireSector />
              </div>
            </div>
          </div>
        </Sec>

        <Sec n={3} title="خلية الحي السداسية">
          <div className="grid grid-cols-3 items-start gap-2.5 md:grid-cols-5">
            {(
              [
                ["no demand", <HexCell key="a" label="ذهبان" value="12" state="muted" />],
                ["demand", <HexCell key="b" label="النهضة" value="44 · لا أعضاء" state="demand" />],
                ["demand, no supply", <HexCell key="c" label="الصفا" value="204 · 1 مكتب" state="gap" />],
                ["covered by members", <HexCell key="d" label="الروضة" value="1,060 · 2" state="active" />],
                ["selected", <HexCell key="e" label="أبحر الشمالية" value="318 · 2" state="gap" selected onClick={() => {}} />],
              ] as [string, ReactNode][]
            ).map(([k, v]) => (
              <div key={k} className="flex flex-col items-center gap-1.5">
                <St>{k}</St>
                {v}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <HexGrid cells={[{ label: "A", state: "muted" }, { label: "B", state: "active" }, { label: "C", state: "gap" }]} columns={3} size={60} shift="none" />
            <span className="text-[12px] text-muted">الشبكة: صف ثم صف مُزاح نصف خلية، فجوة 5px، 6 خلايا في الصف على سطح المكتب و5 على الجوال. الخلية زر على سطح المكتب تفتح الدُّرج؛ على الصفحة العامة ليست زراً.</span>
          </div>
          <St>honeycomb rows · 6 columns, second row shifted</St>
          <HexGrid
            cells={[
              { label: "أبحر الشمالية", value: "2", valueSize: "big", state: "active" },
              { label: "الشاطئ", value: "1", valueSize: "big", state: "active" },
              { label: "ذهبان", value: "0", state: "normal" },
              { label: "المحمدية", value: "مطلوب", state: "required" },
              { label: "النهضة", value: "44 · لا أعضاء", state: "demand" },
              { label: "البساتين", value: "18", state: "muted" },
              { label: "الروضة", value: "1,060 · 2", state: "active" },
              { label: "الصفا", value: "204 · 1 مكتب", state: "rank-1" },
            ]}
            columns={6}
            columnsSm={4}
            sizeSm={60}
          />
        </Sec>
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-3">
        <Sec n={4} title="شارة «رخصة فال موثّقة»">
          <div className="flex flex-col gap-2.5">
            <div>
              <St>default</St>
              <FalBadge />
            </div>
            <div>
              <St>with expiry (admin)</St>
              <FalBadge date="2027-06-30" showDate />
            </div>
            <div>
              <St>expiring · 30 days</St>
              <FalBadge expiringInDays={24} />
            </div>
            <div>
              <St>not verified (admin only)</St>
              <FalBadge verified={false} />
            </div>
            <div>
              <St>suspended (admin only)</St>
              <FalBadge suspended />
            </div>
            <div>
              <St>on ink</St>
              <span className="inline-block bg-ink p-2">
                <FalBadge onInk />
              </span>
            </div>
          </div>
        </Sec>

        <Sec n={5} title="شريط الميزان · أعطى واستقبل">
          <LedgerBar
            given={10}
            received={9}
            rows={{
              given: [
                { label: "عروض", value: 7 },
                { label: "طلبات", value: 3 },
              ],
              received: [
                { label: "طلبات", value: 9 },
                { label: "ردّ", value: 8 },
              ],
            }}
          />
          <div className="flex flex-col gap-2">
            <div>
              <St>compact (table cell) · giver</St>
              <LedgerBar variant="compact" given={10} received={9} />
            </div>
            <div>
              <St>compact · taker</St>
              <LedgerBar variant="compact" given={2} received={12} />
            </div>
            <div>
              <St>compact · suspended</St>
              <LedgerBar variant="compact" given={1} received={8} suspended />
            </div>
            <div>
              <St>empty · new member</St>
              <LedgerBar variant="compact" given={0} received={0} empty />
            </div>
          </div>
          <St>member page card · with header, divider and note</St>
          <LedgerBar
            given={10}
            received={9}
            divider
            header={{ title: "الميزان · منذ الانضمام", subtitle: "أعطى مقابل استقبل" }}
            rows={{
              given: [
                { label: "عروض قدّمها", value: 7 },
                { label: "طلبات أرسلها", value: 3 },
                { label: "صفقات أُغلقت", value: 1 },
              ],
              received: [
                { label: "طلبات وُجّهت له", value: 9 },
                { label: "ردّ عليها", value: 8 },
                { label: "متوسط الرد", value: 100, display: "1 س 40 د", ratio: 0.8 },
              ],
            }}
            note="الميزان يرتّب من يستقبل الطلبات أولاً حين يغطي الحي أكثر من مكتب. الرد السريع و«لا يوجد» الصريح يُحسبان لك؛ الصمت يُحسب عليك."
          />
        </Sec>

        <Sec n={6} title="خط المرحلة">
          <div className="flex flex-col gap-4 bg-paper p-3.5 border-interactive">
            <div>
              <St>referral · at معاينة</St>
              <StageLine current={1} />
            </div>
            <div>
              <St>referral · closed إفراغ</St>
              <StageLine current={3} closed />
            </div>
            <div>
              <St>referral · لم تتم</St>
              <StageLine current={2} failedAt={2} />
            </div>
            <div>
              <St>application · 3 steps</St>
              <StageLine stages={APPLICATION_STEPS} current={1} />
            </div>
            <div>
              <St>with dates</St>
              <StageLine current={1} dates={["2026/10/10", "الخميس"]} />
            </div>
            <div>
              <St>compact (table) · 4 cells</St>
              <div className="flex flex-wrap gap-4">
                <StageLine current={1} compact />
                <StageLine current={3} closed compact word="إفراغ · 2026/09/30" />
                <StageLine current={2} failedAt={2} compact word="لم تتم · المشتري انسحب" />
              </div>
            </div>
          </div>
          <St>stage pills (Member-Ledger-M)</St>
          <div className="flex flex-wrap gap-2">
            <StagePill stage="intro" />
            <StagePill stage="viewing" />
            <StagePill stage="negotiation" />
            <StagePill stage="transfer" />
            <StagePill stage="failed" />
            <AlliancePill tone="gold-outline">بلا رد</AlliancePill>
          </div>
        </Sec>
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-3">
        <Sec n={7} title="بطاقة الطلب">
          <div className="flex flex-col gap-2.5">
            <div>
              <St>board card · visitor source · needs action</St>
              <RequestCard id="REQ-0412" source="visitor" district="الفيصلية" summary="شقة 4 غرف" detail="حتى 450,000 · وصل عرض · ينتظر قرار" needsAction href="/admin/alliance/requests?req=REQ-2026-0412" />
            </div>
            <div>
              <St>staff source</St>
              <RequestCard id="REQ-0414" source="staff" district="المحمدية" summary="شقة 3 غرف" detail="700k إلى 1M · أُرسل يدوياً" />
            </div>
            <div>
              <St>member source · selected</St>
              <RequestCard id="REQ-0417" source="member" office="مكتب أ" district="الروضة" summary="أرض مطورة" budgetMax={2500000} selected onClick={() => {}} />
            </div>
            <div>
              <St>closed</St>
              <RequestCard id="REQ-0401" source="visitor" district="الصفا" summary="شقة 4 غرف" detail="انتهى بلا عروض" closed />
            </div>
            <div>
              <St>computed detail · budget, stage, offers</St>
              <RequestCard id="REQ-0403" source="member" office="مكتب هـ" district="أبحر الشمالية" summary="أرض" budgetMax={1500000} stage="offers" offersCount={2} />
            </div>
            <div>
              <St>member view (phone) · summary only</St>
              <RequestCard variant="member" id="REQ-0412" source="visitor" district="الفيصلية" summary="شقة 4 غرف" budgetMax={450000} beds={4} timing="3 أشهر" />
            </div>
          </div>
        </Sec>

        <Sec n={8} title="سجل الإحالة (إيصال)">
          <ReferralReceipt compact referral={REF} requester={{ name: "SMQ", licence: "فال 1200040135" }} offerer={{ name: "مكتب ط", licence: "فال 1200XXXXXX · موثّقة" }} requestLine="شقة 4 غرف · الفيصلية" offerLine="165 م² · 440,000" time="14:35" />
          <div className="flex items-center gap-2">
            <DisputeFlag days={4} />
            <span className="text-[12px] text-muted">علم النزاع: ماسة ذهبية مع الكلمة والمدة. يظهر في الجدول وأعلى السجل.</span>
          </div>
          <St>full receipt (Member-Referral-M)</St>
          <div className="mx-auto w-full max-w-[390px]">
            <ReferralReceipt
              referral={REF}
              requester={{ name: "SMQ العقارية", licence: "فال 1200040135" }}
              offerer={{ name: "مكتب ط للعقارات", licence: "فال 1200XXXXXX · موثّقة" }}
              district="الفيصلية"
              time="14:35"
              createdBy="فريق SMQ · نورة"
              requestSource="زائر SMQ بلا نتائج"
              offerSentAt="2026/10/10 · 10:42"
              charterLine="النسخة 1.0 · وافق عليه المكتبان"
            />
          </div>
        </Sec>

        <Sec n={9} title="عمود اللوحة">
          <div className="grid items-start gap-2.5 md:grid-cols-3">
            <BoardColumn title="جديد" count={2}>
              <RequestCard compact id="REQ-0418" source="visitor" district="النهضة" summary="غرفتان" needsAction />
              <RequestCard compact id="REQ-0417" source="member" district="الروضة" summary="أرض" />
            </BoardColumn>
            <BoardColumn title="وصلت عروض" count={2} needsDecision dropTarget>
              <RequestCard compact id="REQ-0412" source="visitor" district="الفيصلية" summary="4 غرف" selected />
            </BoardColumn>
            <BoardColumn title="مغلق" count={24} more={{ label: "عرض 23 أخرى" }}>
              <RequestCard compact id="REQ-0401" source="visitor" district="الصفا" summary="شقة 4 غرف" detail="انتهى" closed />
            </BoardColumn>
          </div>
          <span className="text-[12px] text-muted">رأس العمود بحدّ أسود 2px وعدّاد كريمي؛ العمود الذي يحتاج قراراً حدّه وعدّاده ذهبيان. السحب بين الأعمدة يغيّر المرحلة ويُسجَّل. هدف الإفلات: مستطيل منقّط كريمي. على الجوال الأعمدة تبويبات.</span>
        </Sec>
      </div>

      <Sec n="9b" title="لوحة المراحل (StageBoard) · تبويبات على الجوال، خمسة أعمدة من md">
          <StageBoard
            columns={[
              { key: "new", title: "جديد", count: 2, children: <RequestCard id="REQ-0418" source="visitor" district="النهضة" summary="شقة غرفتين" detail="حتى 560,000 · قبل 20 د · لا أعضاء يغطون النهضة" needsAction /> },
              { key: "sent", title: "أُرسل", count: 2, children: <RequestCard id="REQ-0415" source="visitor" district="أبحر الشمالية" summary="فيلا" detail="حتى 2,200,000 · أُرسل اليوم 09:10 لـ أ، ك · تلقائي · بلا رد بعد" /> },
              { key: "offers", title: "وصلت عروض", count: 2, needsDecision: true, children: <RequestCard id="REQ-0412" source="visitor" district="الفيصلية" summary="شقة 4 غرف" detail="حتى 450,000 · عرض من مكتب ط 440,000 موثّق · ينتظر قرار" selected /> },
              { key: "intro", title: "تعارف", count: 1, children: <RequestCard id="REQ-0398" source="staff" district="الشاطئ" summary="فيلا" detail="REF-2026-0098 · أ ومكتب ج · تفاوض" /> },
              { key: "closed", title: "مغلق", count: 24, children: <RequestCard id="REQ-0401" source="visitor" district="الصفا" summary="شقة 4 غرف" detail="انتهى بلا عروض · 3 أيام · أُخبر الزائر" closed />, more: { label: "عرض 23 أخرى" } },
            ]}
          />
      </Sec>

      <Sec n="10" title="خلية النحل · الواجهة (Alliance-D / M / Launch)">
        <div className="grid items-start gap-4 md:grid-cols-3">
          <div className="bg-ink p-6">
            <St>desktop hero · 12 cells, fills cell by cell on load</St>
            <Honeycomb
              animate
              rows={[4, 5, 4]}
              size={56}
              cells={["ink2", "ink2", "gold", "ink2", "ink2", "gold", "ink2", "ink2", "ink2", "gold", "ink2", "ink2", "gold"]}
              caption="12 خلية = 12 مكتباً · الذهبي: انضم هذا الشهر"
            />
          </div>
          <div className="bg-ink p-6">
            <St>phone hero · 3 columns, alternate rows shifted</St>
            <Honeycomb animate align="start" columns={3} size={40} gap={4} cells={["ink2", "ink2", "gold", "ink2", "ink2", "ink2", "gold", "ink2", "ink2", "ink2", "gold", "ink2"]} />
          </div>
          <div className="bg-ink p-6">
            <St>launch day · outlined cells, one gold (SMQ)</St>
            <Honeycomb animate align="start" columns={3} size={40} gap={4} cells={["outline", "outline", "outline", "outline", "gold", "outline", "outline", "outline", "outline"]} />
          </div>
        </div>
      </Sec>

      <div className="grid items-start gap-8 xl:grid-cols-2">
        <Sec n="11" title="تغطية جدة بجهاتها الخمس (CoverageGrid)">
          <St>12 members · counts per district, members per sector</St>
          <CoverageGrid districts={DISTRICTS} counts={COUNTS} sectorMembers={SECTOR_MEMBERS} caption="الشبكة تخطيطية لا جغرافية: كل خلية حي." />
          <St>launch day · required set</St>
          <CoverageGrid districts={DISTRICTS.slice(0, 12)} counts={{}} launch required={["obhur-north", "mohammadiyah", "safa", "naeem"]} />
        </Sec>
        <Sec n="12" title="الرادار (RadarGrid)">
          <St>cells coloured by state and opportunity rank; click selects (the page opens its drawer)</St>
          <RadarGrid districts={RADAR} selected={selected} onSelect={setSelected} legend title="شبكة الأحياء" caption="الخلية: الحي · جلسات البحث · وحدات SMQ المتاحة · المكاتب التي تغطيه. انقر خلية لتفتح الدُّرج." />
          <span className="text-caption text-muted">المحدد: {selected ?? "—"}</span>
        </Sec>
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-3">
        <Sec n="13" title="دليل الأعضاء (MemberCard)">
          <St>desktop directory · two columns</St>
          <div className="grid gap-2.5 md:grid-cols-2">
            <MemberCard office={OFFICE_A} district="أبحر الشمالية" href="/member/office-01" />
            <MemberCard office={OFFICE_B} district="الروضة" />
          </div>
          <St>phone directory · with the badge · founder tag</St>
          <div className="mx-auto flex w-full max-w-[390px] flex-col gap-2.5">
            <MemberCard office={OFFICE_A} district="أبحر الشمالية" badge />
            <MemberCard office={OFFICE_B} district="الروضة" badge tag={<AlliancePill tone="gold">مؤسِّس</AlliancePill>} />
          </div>
          <St>launch day · empty directory</St>
          <DirectoryEmpty
            text={
              <>
                يظهر هنا اسم المكتب وحيّه وتخصصه وشارة «رخصة فال موثّقة»، باختيار المكتب. المكاتب المؤسِّسة تحمل وسم «مؤسِّس» دائماً <Tbc />.
              </>
            }
          />
        </Sec>
        <Sec n="14" title="تقرير الشهر (ReportTile, ReportBarRow, ReportGapRow)">
          <div className="grid grid-cols-3 gap-1.5">
            <ReportTile label="جلسات بحث" value="4,812" note="+12% عن أغسطس" />
            <ReportTile label="الميزانية الوسيطة" value="640k" note="ريال" />
            <ReportTile tone="ink" label="طلب بلا عرض" value="31%" note="من الجلسات" />
          </div>
          <div className="bg-paper px-3 py-2 border-interactive">
            <ReportBarRow label="الروضة" pct={22} max={22} />
            <ReportBarRow label="أبحر الشمالية" pct={17} max={22} tone="gold" />
            <ReportBarRow label="الصفا" pct={13} max={22} tone="gold" />
            <ReportBarRow label="أخرى" pct={18} max={22} tone="muted" />
          </div>
          <div className="flex flex-col gap-2">
            <ReportGapRow n={1} title="أبحر الشمالية · فلل 1.5 إلى 2.5M" note="318 جلسة · 0 وحدة على SMQ · 2 مكاتب تغطيه" />
            <ReportGapRow n={2} title="الصفا · شقق 4 غرف حتى 700k" note="204 جلسة · 1 وحدة من مالك · 1 مكتب يغطيه" />
          </div>
        </Sec>
        <Sec n="15" title="الحماية والنزاع (ProtectionMeter, DisputePanel)">
          <div className="flex flex-col gap-2">
            <ProtectionMeter daysLeft={90} />
            <ProtectionMeter daysLeft={70} />
            <ProtectionMeter daysLeft={0} label="انتهت بالإفراغ" />
            <ProtectionMeter daysLeft={0} label="أُغلقت" />
          </div>
          <DisputePanel
            id="REF-2026-0098"
            openedDaysAgo={4}
            claimant="مكتب ج"
            claim="«المشتري عاد إلينا مباشرة بعد المعاينة وطلب إنهاء الصفقة عبرنا دون مكتب أ. نطلب تحويل المرحلة إلى لم تتم.»"
            respondent="مكتب أ"
            counter="لم يردّ منذ 4 أيام (ذُكِّر مرتين على واتساب)."
            note={
              <>
                الميثاق: التعارف مسجّل 2026/09/21، والحماية 90 يوماً تشمل أي صفقة على نفس العقار مع نفس المشتري <Tbc />. تخطّي السجل سبب للإخراج.
              </>
            }
            actions={
              <>
                <Btn tone="ink">أبقِ السجل والتقسيم</Btn>
                <Btn>عدّل التقسيم</Btn>
                <Btn>حوّل إلى «لم تتم»</Btn>
                <Btn>راسل الطرفين</Btn>
              </>
            }
          />
        </Sec>
      </div>

      <Sec n="16" title="العروض الواردة (OfferRow)">
        <div className="bg-paper border-interactive">
          <OfferRowsHeader />
          <OfferRow office="مكتب ط" replyMinutes={72} priceSar={440000} areaM2={165} note="الدور الثاني، واجهة شمالية، بناء 2021، جاهزة للسكن" brokered selected={offer} onSelect={() => setOffer(true)} action={<Btn tone="gold">أنشئ سجل إحالة</Btn>} />
          <OfferRow office="مكتب ك" replyMinutes={120} priceSar={2050000} areaM2={480} note="واجهتان، مسبح" brokered={false} selected={!offer} onSelect={() => setOffer(false)} action={<Btn tone="gold">أنشئ سجل إحالة</Btn>} />
        </div>
      </Sec>
    </div>
  );
}
