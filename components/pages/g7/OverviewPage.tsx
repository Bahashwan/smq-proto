"use client";
// /admin (Admin-Overview-D at 1440, Admin-M at 390). Every number comes from the fixtures through the selectors and
// the in-memory store: approvals queue, inbound leads («علّم كمردود» writes to the store), unit status selects,
// budget bars, district demand vs supply. The period toggle switches the tiles (today / 7 days / 30 days).
import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminButton, AdminLinkButton, IconWhatsApp, Panel, PeriodToggle, SectionHeader, StatGrid, StatTile, StatusPill, TextLink, ILLUSTRATIVE_NOTE } from "@/components/admin";
import { Price } from "@/components/ui";
import { analytics } from "@/data/analytics";
import { approvals as approvalFixture, ROLE_LABELS } from "@/data/approvals";
import { leads } from "@/data/leads";
import { units } from "@/data/units";
import { visitorsSummary } from "@/data/visitors";
import { agoLabel, approvalComputed, countsByStatus, effectiveApprovalStatus, effectiveLeadStatus, effectiveUnitStatus, leadCounts } from "@/data/selectors";
import type { AnalyticsPeriod, Approval, Lead, UnitStatus } from "@/data/types";
import { useStore, useUnitOverrides } from "@/lib/store";
import { cx, fmtNum, waLink } from "@/lib/format";
import { G7Shell } from "./shell";
import { BudgetBars } from "./charts";
import { approvalAge, approvalFacts, approvalTitle, leadLines, leadStatusWord, listedInDistrict, peakHoursLabel, pctAbove, photosWord, sinceHours, unitShort, unitsWord } from "./util";

type PeriodKey = "today" | "7d" | "30d";
const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "today", label: "اليوم" },
  { value: "7d", label: "7 أيام" },
  { value: "30d", label: "30 يوماً" },
];
const STATUS_WORD: Record<UnitStatus, string> = { available: "متاح", reserved: "محجوز", sold: "مباع" };
const pct1 = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);

export function OverviewPage() {
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const approvalsOv = useStore((s) => s.approvals);
  const leadsOv = useStore((s) => s.leads);
  const ov = analytics.overview;

  const openApprovals = useMemo(
    () => approvalFixture.filter((a) => ["new", "awaiting-photos"].includes(effectiveApprovalStatus(a, approvalsOv))).sort((a, b) => (a.id < b.id ? 1 : -1)),
    [approvalsOv],
  );
  const recentLeads = useMemo(() => [...leads].filter((l) => !l.generated).sort((a, b) => (a.at < b.at ? 1 : -1)), []);

  return (
    <G7Shell
      active="overview"
      phoneActive="approvals"
      phoneHideHeader
      title={ov.greetingAr}
      subtitle={`${ov.dateAr} · ${ov.lastSyncAr}`}
      note
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <PeriodToggle options={PERIOD_OPTIONS} value={period} onChange={(v) => setPeriod(v as PeriodKey)} />
          <AdminLinkButton href="/admin/units/new" variant="ink" size="md">
            + وحدة جديدة
          </AdminLinkButton>
        </div>
      }
    >
      <div className="hidden flex-col gap-6 md:flex">
        <DesktopTiles period={period} openApprovals={openApprovals} />
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(420px,100%),1fr))]">
          <ApprovalsPanel items={openApprovals} />
          <LeadsPanel items={recentLeads.slice(0, 4)} leadsOv={leadsOv} />
          <BudgetPanel p={analytics.periods[period === "30d" ? "30d" : "7d"]} />
          <DistrictsPanel p={analytics.periods[period === "30d" ? "30d" : "7d"]} />
        </div>
      </div>
      <PhoneOverview openApprovals={openApprovals} recentLeads={recentLeads} leadsOv={leadsOv} />
    </G7Shell>
  );
}

// ---------------------------------------------------------------------------- desktop

function DesktopTiles({ period, openApprovals }: { period: PeriodKey; openApprovals: Approval[] }) {
  const overrides = useUnitOverrides();
  const leadsOv = useStore((s) => s.leads);
  const counts = countsByStatus(overrides);
  const unanswered = leadCounts(leadsOv).unanswered;
  const p7 = analytics.periods["7d"];
  const p: AnalyticsPeriod = analytics.periods[period === "30d" ? "30d" : "7d"];
  const today = analytics.today;
  const visitors = period === "today" ? today.visitors : p.visitors;
  // Today has no search count in the fixtures: scale the 7-day searches-per-visitor ratio.
  const searches = period === "today" ? Math.round((today.visitors * p7.searches) / p7.visitors) : p.searches;
  const whatsapp = period === "today" ? today.whatsapp : p.whatsappClicks;
  const oldest = openApprovals.reduce((m, a) => Math.max(m, approvalAge(a)), 0);
  const label = period === "today" ? "زوار اليوم" : `الزوار · ${p.labelAr}`;
  return (
    <StatGrid>
      <StatTile size="lg" label={label} value={fmtNum(visitors)} delta={period === "7d" ? analytics.overview.visitorsNoteAr : undefined} />
      <StatTile size="lg" label="عمليات بحث بالميزانية" value={fmtNum(searches)} note={`${(Math.round((searches / visitors) * 10) / 10).toFixed(1)} بحث لكل زائر`} />
      <StatTile size="lg" label="نقرات واتساب" value={fmtNum(whatsapp)} note={`${pct1(whatsapp, visitors)}% من الزوار · ${unanswered} بحالة «بلا رد» (تُغيَّر يدوياً)`} />
      <StatTile size="lg" variant="ink" label="بانتظار موافقتك" value={openApprovals.length} note={openApprovals.length ? `طلبات إضافة عقار · أقدمها ${sinceHours(oldest)}` : "طلبات إضافة عقار"} />
      <StatTile
        size="lg"
        label="الوحدات"
        value={counts.available}
        suffix={`/ ${counts.listed}`}
        note={`متاحة ${counts.available} · مباعة ${counts.sold} · ${counts.reserved ? `محجوزة ${counts.reserved}` : "لا محجوزات"}`}
      />
    </StatGrid>
  );
}

function Thumb() {
  return <span aria-hidden className="h-10 w-14 shrink-0 bg-slot [clip-path:polygon(0_0,100%_0,100%_100%,12px_100%,0_calc(100%-21px))]" />;
}

function ApprovalsPanel({ items }: { items: Approval[] }) {
  return (
    <Panel title="طلبات إضافة عقار بانتظار الموافقة" action={<TextLink href="/admin/approvals">كل الطلبات</TextLink>} bodyClassName="p-0">
      {items.length === 0 && <p className="px-4 py-6 text-label text-muted">لا طلبات بانتظار الموافقة.</p>}
      {items.map((a) => (
        <div key={a.id} className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-b-0">
          <Thumb />
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[14px] font-extrabold">
              {approvalTitle(a)} · <Price value={a.askedPriceSar} sign={false} />
            </span>
            <span className="text-[12px] text-muted">
              {a.submitterName} · <span className="tnum">{a.phoneMasked}</span> · {photosWord(a.photosCount)} · {sinceHours(approvalAge(a))}
            </span>
          </span>
          <StatusPill status={a.status === "awaiting-photos" ? "بانتظار صور" : "جديد"} variant={a.status === "awaiting-photos" ? "outline" : "gold"} />
          <Link href={`/admin/approvals/${a.id}`} className="flex h-9 shrink-0 items-center bg-ink px-3 text-[12px] font-extrabold text-paper motion-hover hover:bg-ink-2">
            مراجعة
          </Link>
        </div>
      ))}
    </Panel>
  );
}

function LeadStatusCell({ lead, status }: { lead: Lead; status: Lead["status"] }) {
  const setLead = useStore((s) => s.setLead);
  const toast = useStore((s) => s.toast);
  if (status !== "unanswered") return <StatusPill status={leadStatusWord(lead, status)} variant={status === "closed" ? "ink" : "outline"} />;
  return (
    <span className="flex items-center gap-2">
      <StatusPill status="بلا رد" variant="gold" />
      <AdminButton
        variant="outline"
        size="xs"
        onClick={() => {
          setLead(lead.id, "answered");
          toast(`تم الرد · ${lead.code ?? lead.id}`, { action: { label: "التفاصيل", href: `/admin/leads?lead=${lead.id}` } });
        }}
      >
        علّم كمردود
      </AdminButton>
    </span>
  );
}

function LeadsPanel({ items, leadsOv }: { items: Lead[]; leadsOv: Record<string, { status: Lead["status"]; closedReason?: string }> }) {
  const unanswered = leadCounts(leadsOv).unanswered;
  return (
    <Panel title="آخر الطلبات الواردة" action={<TextLink href="/admin/leads">{`الكل · ${unanswered} بلا رد`}</TextLink>} bodyClassName="p-0">
      {items.map((l) => {
        const { title, detail } = leadLines(l);
        return (
          <div key={l.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-4 gap-y-1 border-b border-line px-4 py-3.5 text-[13px] last:border-b-0">
            <Link href={`/admin/leads?lead=${l.id}`} className="flex min-w-0 flex-col gap-0.5 hover:underline">
              <span className="font-extrabold">{title}</span>
              <span className="text-caption text-muted">{detail}</span>
            </Link>
            <span className="whitespace-nowrap text-muted">
              {l.source} · {l.device}
            </span>
            <span className="whitespace-nowrap text-muted">{agoLabel(l.at).replace(" د", " دقيقة")}</span>
            <LeadStatusCell lead={l} status={effectiveLeadStatus(l, leadsOv)} />
          </div>
        );
      })}
    </Panel>
  );
}

function BudgetPanel({ p }: { p: AnalyticsPeriod }) {
  const above = pctAbove(p, 850000);
  return (
    <Panel title="ماذا يبحث الزوار · الميزانية" action={<TextLink href="/admin/analytics">كل التحليلات</TextLink>}>
      <p className="mb-4 text-[12px] text-muted">
        {fmtNum(p.searches)} بحثاً خلال {p.labelAr}. الوسيط {fmtNum(p.medianBudget)} ريال. الشريط الذهبي = الشريحة الأكثر طلباً.
      </p>
      <BudgetBars p={p} />
      <p className="mt-4 text-caption text-muted">ألف ريال · فجوة واضحة: {above}% من الباحثين فوق 850 ألف ولا توجد وحدة بينها والفلل.</p>
    </Panel>
  );
}

function DistrictsPanel({ p }: { p: AnalyticsPeriod }) {
  const rows = p.districtsDemand.filter((d) => d.slug === "all" || ["rawdah", "obhur-north", "faisaliyah", "shati"].includes(d.slug) || listedInDistrict(d.slug) > 0).slice(0, 5);
  const ordered = [...rows.filter((r) => r.slug !== "all").slice(0, 4), ...rows.filter((r) => r.slug === "all")];
  return (
    <Panel title="الأحياء المطلوبة مقابل المعروض">
      <div className="flex flex-col gap-3.5">
        {ordered.map((d) => {
          const n = d.slug === "all" ? null : listedInDistrict(d.slug);
          const gap = n === 0;
          return (
            <div key={d.slug} className="grid grid-cols-[110px_1fr_90px] items-center gap-3 text-[13px]">
              <span className="font-bold">{d.labelAr}</span>
              <span className="h-3.5 bg-sand">
                <span className={cx("block h-full", gap ? "bg-gold" : "bg-ink")} style={{ width: `${d.pct}%` }} />
              </span>
              <span className="text-[12px] text-muted tnum">{n === null ? `${d.pct}%` : `${d.pct}% · ${unitsWord(n)}`}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-caption text-muted">{p.districtNoteAr}</p>
    </Panel>
  );
}

// ---------------------------------------------------------------------------- phone (Admin-M)

function PhoneOverview({ openApprovals, recentLeads, leadsOv }: { openApprovals: Approval[]; recentLeads: Lead[]; leadsOv: Record<string, { status: Lead["status"]; closedReason?: string }> }) {
  const overrides = useUnitOverrides();
  const counts = countsByStatus(overrides);
  const today = analytics.today;
  const unanswered = recentLeads.filter((l) => effectiveLeadStatus(l, leadsOv) === "unanswered");
  const total = leadCounts(leadsOv).unanswered;
  const p7 = analytics.periods["7d"];
  const topNoSupply = p7.districtsDemand.find((d) => d.slug !== "all" && listedInDistrict(d.slug) === 0);
  const mobile = visitorsSummary.device.mobilePct;
  const topSource = visitorsSummary.sources[0];
  return (
    <div className="flex flex-col gap-6 md:hidden">
      <div id="overview" className="scroll-mt-28">
      <StatGrid>
        <StatTile size="md" label="زوار اليوم" value={fmtNum(today.visitors)} />
        <StatTile
          size="md"
          label="واتساب اليوم"
          value={
            <>
              {today.whatsapp}
              <span className="text-[12px] font-bold text-gold-text"> · {today.whatsappUnanswered} بلا رد</span>
            </>
          }
        />
        <StatTile size="md" variant="ink" label="بانتظار موافقتك" value={openApprovals.length} />
        <StatTile size="md" label="الوحدات" value={counts.available} suffix={`/ ${counts.listed}`} />
      </StatGrid>
      </div>

      <section id="approvals" className="flex scroll-mt-28 flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[18px] font-extrabold">طلبات إضافة عقار</h2>
          <span className="text-caption text-muted">لا تُنشر قبل موافقتك</span>
        </div>
        {openApprovals.map((a) => (
          <PhoneApprovalCard key={a.id} a={a} />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader title="واردة بلا رد" action={<TextLink href="/admin/leads">{`الكل ${total} · علّم كمردود من التفاصيل`}</TextLink>} />
        {unanswered.slice(0, 2).map((l) => {
          const { title, detail } = leadLines(l);
          const sub = l.unitCode ? [l.source, ...detail.split(" · ").filter((s) => s.includes("ميزانية"))] : [detail];
          return (
            <Link key={l.id} href={`/admin/leads?lead=${l.id}`} className="flex items-center gap-3 border-interactive bg-paper px-4 py-3 text-ink">
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[14px] font-extrabold">{title}</span>
                <span className="text-caption text-muted">{[...sub, agoLabel(l.at)].join(" · ")}</span>
              </span>
              <span aria-hidden className="flex size-10 shrink-0 items-center justify-center bg-gold text-ink hex-flat">
                <IconWhatsApp size={18} />
              </span>
            </Link>
          );
        })}
      </section>

      <PhoneUnits />

      <section id="stats" className="flex scroll-mt-28 flex-col gap-3">
        <SectionHeader title={`ماذا يبحثون · ${p7.labelAr}`} action={<TextLink href="/admin/analytics">التفاصيل</TextLink>} />
        <div className="flex flex-col gap-4 border-interactive bg-paper p-4">
          <BudgetBars p={p7} compact />
          <dl className="flex flex-col gap-2 text-[12px]">
            {topNoSupply && (
              <div className="flex justify-between gap-3">
                <dt>الحي الأكثر طلباً بلا وحدات</dt>
                <dd className="font-extrabold text-gold-text">
                  {topNoSupply.labelAr} · {topNoSupply.pct}%
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-3">
              <dt>بحث بلا نتائج</dt>
              <dd className="font-extrabold tnum">{p7.zeroResults.pct}%</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>ذروة البحث</dt>
              <dd className="font-extrabold">{peakHoursLabel(p7.hours)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="visitors" className="flex scroll-mt-28 flex-col gap-3">
        <SectionHeader title={`الزوار · ${p7.labelAr}`} action={<TextLink href="/admin/visitors">التفاصيل</TextLink>} />
        <StatGrid columns={3} label="الزوار">
          <StatTile size="sm" label="زائر" value={fmtNum(p7.visitors)} className="flex-col-reverse" />
          <StatTile size="sm" label="جوال" value={`${mobile}%`} className="flex-col-reverse" />
          <StatTile size="sm" label={`من ${topSource.labelAr}`} value={`${topSource.pct}%`} className="flex-col-reverse" />
        </StatGrid>
        <p className="text-caption text-muted">{ILLUSTRATIVE_NOTE}</p>
      </section>
    </div>
  );
}

/** The phone card's short mask: «0559XXXXXX» → «0559…XX» (Admin-M). */
function shortMask(masked: string): string {
  const digits = masked.replace(/\s/g, "");
  const lead = digits.match(/^\d+/)?.[0] ?? "";
  return lead && digits.length > lead.length + 2 ? `${lead}…${digits.slice(-2)}` : masked;
}

function PhoneApprovalCard({ a }: { a: Approval }) {
  const awaiting = a.status === "awaiting-photos";
  const facts = approvalFacts(a);
  const c = approvalComputed(a);
  const reqLog = a.log.find((e) => e.text.startsWith("طُلبت صور"));
  let third = "";
  if (awaiting && reqLog) {
    const [what, ...rest] = reqLog.text.split(" · ");
    third = [`${what.replace(" من المالك", "")} ${agoLabel(reqLog.at)}`, ...rest].join(" · ");
  } else if (a.ownerNotes && a.ownerNotes.length < 40) third = a.ownerNotes;
  else if (a.role !== "owner") third = ROLE_LABELS[a.role];
  else if (listedInDistrict(a.districtSlug) === 0) third = `${fmtNum(analytics.zeroResultsByDistrict30d[a.districtSlug] ?? analytics.districtSessions30d[a.districtSlug] ?? 0)} بحثاً عن هذا الحي بلا نتيجة`;
  const more = Math.max(0, a.photosCount - 2);
  return (
    <article className={cx("flex flex-col bg-paper", awaiting ? "border-hairline" : "border-interactive")}>
      {!awaiting && (
        <div aria-hidden className="grid h-[120px] grid-cols-3 gap-0.5">
          <div className="col-span-2 bg-slot" />
          <div className="grid grid-rows-2 gap-0.5">
            <div className="bg-slot" />
            <div className="flex items-center justify-center bg-slot text-caption font-bold">{more > 0 ? `+${more}` : ""}</div>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-1.5 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[16px] font-extrabold">{approvalTitle(a)}</span>
          {awaiting ? <StatusPill status="بانتظار صور" variant="outline" /> : <StatusPill status="جديد" variant="gold">{`جديد · ${approvalAge(a)} س`}</StatusPill>}
        </div>
        <span className="text-[13px] font-extrabold tnum">
          <Price value={a.askedPriceSar} sign={false} />
          <span className="text-caption font-semibold text-muted"> · {(awaiting ? facts.filter((f) => f.includes("للمتر")) : facts).join(" · ") || (c.ppm ? `${fmtNum(c.ppm)} للمتر` : "")}</span>
        </span>
        <span className="text-[12px] text-muted">
          {[a.submitterName, awaiting ? null : shortMask(a.phoneMasked), third || null].filter(Boolean).join(" · ")}
        </span>
      </div>
      {!awaiting && (
        <div className="grid grid-cols-3 border-t border-line text-[13px]">
          <Link href={`/admin/approvals/${a.id}`} className="flex min-h-11 items-center justify-center bg-gold px-2 font-extrabold text-ink">
            مراجعة واعتماد
          </Link>
          <a href={waLink(`بخصوص طلبك ${a.id}`)} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center border-e border-line px-2 font-bold text-ink">
            واتساب المالك
          </a>
          <Link href={`/admin/approvals/${a.id}#decision`} className="flex min-h-11 items-center justify-center px-2 font-bold text-muted">
            رفض
          </Link>
        </div>
      )}
    </article>
  );
}

function PhoneUnits() {
  const overrides = useUnitOverrides();
  const setUnitStatus = useStore((s) => s.setUnitStatus);
  const toast = useStore((s) => s.toast);
  const top = useMemo(
    () => units.filter((u) => effectiveUnitStatus(u, overrides) !== "sold").sort((a, b) => (analytics.unitWeek[b.code]?.views ?? 0) - (analytics.unitWeek[a.code]?.views ?? 0)).slice(0, 3),
    // the list stays put while the presenter changes statuses
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    <section id="units" className="flex scroll-mt-28 flex-col gap-3">
      <SectionHeader title="تغيير حالة وحدة" action={<TextLink href="/admin/units">كل الوحدات</TextLink>} />
      <div className="flex flex-col border-interactive bg-paper">
        {top.map((u, i) => {
          const views = analytics.unitWeek[u.code]?.views ?? 0;
          const st = effectiveUnitStatus(u, overrides);
          return (
            <div key={u.code} className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0">
              <span className="flex flex-col gap-0.5">
                <span className="text-[14px] font-extrabold">{unitShort(u)}</span>
                <span className="text-caption text-muted tnum">
                  <Price value={u.priceSar} sign={false} /> · {views} مشاهدة{i === 0 ? " هذا الأسبوع" : ""}
                </span>
              </span>
              <select
                aria-label={`حالة ${unitShort(u).replace(" · ", " ")}`}
                value={st}
                onChange={(e) => {
                  const v = e.target.value as UnitStatus;
                  setUnitStatus(u.code, v);
                  toast(`حُفظت الوحدة ${u.code} · ${STATUS_WORD[v]}`, { action: { label: "معاينة", href: `/units/${u.slug}` } });
                }}
                className="h-10 border-[1.5px] border-gold bg-paper px-2 text-[12px] font-bold text-ink"
              >
                {(Object.keys(STATUS_WORD) as UnitStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_WORD[s]}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </section>
  );
}

