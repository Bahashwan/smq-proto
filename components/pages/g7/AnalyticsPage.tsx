"use client";
// /admin/analytics (Admin-Analytics-D). Illustrative numbers (data/analytics.ts) for 7 / 30 / 90 days; the source
// filter scales the counts by that source's share of visitors (data/visitors.ts) — shares stay as they are. «تصدير CSV»
// downloads the period's numbers; nothing is sent anywhere.
import { useState, type ReactNode } from "react";
import { AdminButton, Panel, PeriodToggle } from "@/components/admin";
import { analytics } from "@/data/analytics";
import { visitorsSummary } from "@/data/visitors";
import { supplyGapLine } from "@/data/selectors";
import type { AnalyticsPeriodKey, PctRow } from "@/data/types";
import { useStore } from "@/lib/store";
import { cx, fmtNum } from "@/lib/format";
import { G7Shell } from "./shell";
import { BudgetBars, HBar } from "./charts";
import { listedInDistrict, unitsWord } from "./util";

const ALL = analytics.sourcesAr[0];
const pctLabel = (v: number) => (v < 10 && v % 1 !== 0 ? v.toFixed(1) : String(Math.round(v)));

export function AnalyticsPage() {
  const [key, setKey] = useState<AnalyticsPeriodKey>("30d");
  const [source, setSource] = useState(ALL);
  const toast = useStore((s) => s.toast);
  const p = analytics.periods[key];
  const share = source === ALL ? 1 : (visitorsSummary.sources.find((s) => s.labelAr === source)?.pct ?? 100) / 100;
  const n = (x: number) => Math.round(x * share);
  const first = p.funnel[0].count;
  const drop = Math.round((1 - p.funnel[2].count / p.funnel[1].count) * 100);
  const gap = supplyGapLine(key);
  const peak = (() => {
    let best = 0;
    for (let i = 0; i < 23; i++) if (p.hours[i] + p.hours[i + 1] > p.hours[best] + p.hours[best + 1]) best = i;
    return best;
  })();

  function exportCsv() {
    const lines = [["metric", "value"], ["period", p.labelAr], ["source", source], ["visitors", n(p.visitors)], ["searches", n(p.searches)], ...p.funnel.map((f) => [f.labelAr, n(f.count)]), ...p.budgetBands.map((b) => [`budget ${b.labelAr}`, `${b.pct}%`])];
    const url = URL.createObjectURL(new Blob(["﻿" + lines.map((l) => l.join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `smq-analytics-${key}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`صُدّر ملف التحليلات · ${p.labelAr}`);
  }

  return (
    <G7Shell
      active="analytics"
      phoneActive="analytics"
      title="ماذا يبحث الزوار"
      subtitle={`كل عملية بحث بالميزانية والفلاتر تُسجَّل بلا بيانات شخصية · ${p.labelAr} · ${fmtNum(n(p.searches))} بحثاً من ${fmtNum(n(p.visitors))} زائراً`}
      note
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <PeriodToggle options={analytics.periodOrder.map((k) => ({ value: k, label: analytics.periods[k].labelAr }))} value={key} onChange={(v) => setKey(v as AnalyticsPeriodKey)} />
          <select aria-label="المصدر" value={source} onChange={(e) => setSource(e.target.value)} className="h-10 border-interactive bg-paper px-3 text-[12px] font-bold">
            {analytics.sourcesAr.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <AdminButton size="md" className="text-[12px]" onClick={exportCsv}>
            تصدير CSV
          </AdminButton>
        </div>
      }
    >
      <Panel title="القمع · من الزيارة إلى واتساب" bodyClassName="p-5">
        <div className="grid h-[140px] grid-cols-5 items-end gap-0.5" role="img" aria-label={p.funnel.map((f) => `${f.labelAr} ${fmtNum(n(f.count))}`).join("، ")}>
          {p.funnel.map((f, i) => {
            const last = i === p.funnel.length - 1;
            const pct = (f.count / first) * 100;
            return (
              <div key={f.labelAr} className="flex h-full flex-col justify-end gap-1">
                <span className={cx("text-[12px] font-extrabold tnum", last && "text-gold-text")}>
                  {fmtNum(n(f.count))} · {pctLabel(Math.round(pct * 10) / 10)}%
                </span>
                <span className={cx("block w-full", last ? "bg-gold" : "bg-ink")} style={{ height: `${Math.max(4, pct * 0.8)}%` }} />
              </div>
            );
          })}
        </div>
        <div className="mt-2 grid grid-cols-5 gap-0.5 border-t border-line pt-2 text-caption text-muted">
          {p.funnel.map((f) => (
            <span key={f.labelAr}>{f.labelAr}</span>
          ))}
        </div>
        <p className="mt-4 text-[12px] text-muted">أكبر تسرب بين البحث وفتح الوحدة: {drop}% من الباحثين لم يفتحوا أي وحدة.</p>
      </Panel>

      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(400px,100%),1fr))]">
        <Panel
          title="الميزانيات المبحوثة"
          action={<span className="hidden text-caption font-normal text-muted md:inline">{`الوسيط ${fmtNum(p.medianBudget / 1000)} ألف · المتوسط ${fmtNum(p.meanBudget / 1000)} ألف`}</span>}
          bodyClassName="p-5"
        >
          <p className="mb-3 text-caption text-muted md:hidden">{`الوسيط ${fmtNum(p.medianBudget / 1000)} ألف · المتوسط ${fmtNum(p.meanBudget / 1000)} ألف`}</p>
          <BudgetBars p={p} />
          <p className="mt-4 bg-sand px-3 py-2.5 text-[12px] leading-relaxed">
            <strong>فجوة المعروض:</strong> {gap.lineAr}
          </p>
        </Panel>
        <Panel title="الأحياء المطلوبة مقابل المعروض" action={<span className="text-caption font-normal text-muted">الذهبي = طلب بلا وحدات</span>} bodyClassName="p-5">
          <div className="flex flex-col gap-3">
            {p.districtsDemand.map((d) => {
              const units = d.slug === "all" ? null : listedInDistrict(d.slug);
              return (
                <div key={d.slug} className="grid grid-cols-[110px_1fr_100px] items-center gap-3 text-label font-normal">
                  <span className="font-bold">{d.labelAr}</span>
                  <HBar value={d.pct} gold={units === 0} className="h-3.5" />
                  <span className="text-[12px] text-muted tnum">{units === null ? `${d.pct}%` : `${d.pct}% · ${units ? unitsWord(units) : 0}`}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-[12px] text-muted">{p.districtNoteAr}</p>
        </Panel>
        <Panel title="الغرف والنوع والمميزات" bodyClassName="p-5">
          <div className="grid gap-5 md:grid-cols-3">
            <MiniBars title="الغرف" rows={p.rooms} labelWidth="36px" />
            <MiniBars title="نوع الوحدة" rows={p.types} labelWidth="50px" />
            <MiniBars title="مفاتيح المميزات المفعّلة" rows={p.features} labelWidth="64px" />
          </div>
        </Panel>
        <Panel
          title="عمليات بحث بلا نتائج · الأكثر تكراراً"
          action={<span className="text-caption font-normal text-muted tnum">{`${fmtNum(n(p.zeroResults.count))} بحثاً · ${p.zeroResults.pct}%`}</span>}
          bodyClassName="p-5"
        >
          <div className="flex flex-col text-label font-normal">
            {p.zeroResults.top.map((z) => (
              <div key={z.labelAr} className="grid grid-cols-[1fr_70px_110px] items-center gap-3 border-b border-line py-3 first:pt-0">
                <span>{z.labelAr}</span>
                <span className="font-extrabold tnum">{fmtNum(n(z.count))}</span>
                <span className="text-caption text-muted">{z.loosenAr}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-muted">{p.zeroResults.noteAr}</p>
        </Panel>
        <Panel title="كيف يتصفحون" bodyClassName="p-5">
          <div className="grid grid-cols-2 gap-6 text-[12px]">
            <Pairs title="الترتيب المستخدم" rows={p.sort} />
            <Pairs title="العرض والأدوات" rows={[...p.view, ...p.tools]} />
          </div>
          <h3 className="mb-3 mt-6 text-[12px] font-bold text-muted">ساعات البحث · حسب توقيت جدة</h3>
          <div className="flex h-[70px] items-end gap-px border-b border-line" role="img" aria-label={`توزيع عمليات البحث على ساعات اليوم، الذروة بين ${peak} و${peak + 2}`}>
            {p.hours.map((h, i) => (
              <span key={i} className={cx("flex-1", i === peak || i === peak + 1 ? "bg-gold" : "bg-ink")} style={{ height: `${Math.max(3, h)}%` }} />
            ))}
          </div>
          <div className="mt-1 grid text-caption text-muted tnum" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
            {[0, 6, 12, 18].map((h) => (
              <span key={h} style={{ gridColumnStart: h + 1 }}>
                {h}
              </span>
            ))}
            <span className="hidden whitespace-nowrap font-extrabold text-ink md:block" style={{ gridColumnStart: peak + 1, gridColumnEnd: 25 }}>
              {peak} إلى {peak + 2} الذروة
            </span>
          </div>
          <p className="mt-1 text-end text-caption font-extrabold md:hidden">
            {peak} إلى {peak + 2} الذروة
          </p>
          <p className="mt-3 text-[12px] text-muted">{p.hoursNoteAr}</p>
        </Panel>
      </div>
    </G7Shell>
  );
}

function MiniBars({ title, rows, labelWidth }: { title: string; rows: PctRow[]; labelWidth: string }) {
  const max = Math.max(...rows.map((r) => r.pct));
  return (
    <div className="flex flex-col gap-2 text-[12px]">
      <span className="font-bold text-muted">{title}</span>
      {rows.map((r) => (
        <div key={r.key} className="grid items-center gap-2" style={{ gridTemplateColumns: `${labelWidth} 1fr 36px` }}>
          <span className={cx(r.pct === max && "font-extrabold")}>{r.labelAr}</span>
          <HBar value={r.pct} max={max} gold={r.pct === max} className="h-2.5" />
          <span className="text-muted tnum">{r.pct}%</span>
        </div>
      ))}
    </div>
  );
}

function Pairs({ title, rows }: { title: ReactNode; rows: PctRow[] }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-bold text-muted">{title}</span>
      {rows.map((r) => (
        <span key={r.key} className="flex justify-between gap-3">
          <span>{r.labelAr}</span>
          <strong className="tnum">{r.pct}%</strong>
        </span>
      ))}
    </div>
  );
}
