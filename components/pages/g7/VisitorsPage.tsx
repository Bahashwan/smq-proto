"use client";
// /admin/visitors (Admin-Visitors-D). Illustrative 30-day summary and the six designed visitor rows (data/visitors.ts);
// `?v=v-8f3a2` opens the visitor drawer: inline column on desktop, bottom sheet on the phone. «تحويل إلى عميل» opens
// the matching inbound lead when one exists. Anonymous ids only; nothing is stored or sent.
import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AdminButton, Drawer, Panel, PeriodToggle, ILLUSTRATIVE_NOTE } from "@/components/admin";
import { leadById } from "@/data/leads";
import { unitByCode } from "@/data/units";
import { visitorById, visitors, visitorsPeriods, visitorsSummary } from "@/data/visitors";
import { agoLabel } from "@/data/selectors";
import type { Visitor } from "@/data/types";
import { setQuery, useQuery } from "@/lib/location";
import { useStore } from "@/lib/store";
import { cx, fmtNum } from "@/lib/format";
import { G7Shell } from "./shell";
import { HBar } from "./charts";

type PeriodKey = keyof typeof visitorsPeriods;
type Filter = "all" | "whatsapp" | "zero" | "returning";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "whatsapp", label: "ضغطوا واتساب" },
  { value: "zero", label: "بحثوا بلا نتائج" },
  { value: "returning", label: "عائدون" },
];

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useWide(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia("(min-width: 768px)").matches, () => false);
}

/** «D روز» · «روف ياسمين» */
function unitWord(code: string): string {
  const u = unitByCode(code);
  if (!u) return code;
  return u.type === "roof-villa" ? `روف ${u.buildingNameAr}` : `${u.model} ${u.buildingNameAr}`;
}

export function VisitorsPage() {
  const q = useQuery();
  const wide = useWide();
  const toast = useStore((s) => s.toast);
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [filter, setFilter] = useState<Filter>("all");
  const openId = q.get("v");
  const open = openId ? visitorById(openId) : undefined;
  const pv = visitorsPeriods[period];
  const s = visitorsSummary;
  const desktopPct = 100 - pv.mobilePct;
  const rows = visitors.filter((v) => (filter === "whatsapp" ? v.whatsapp > 0 : filter === "zero" ? v.zeroResults > 0 : filter === "returning" ? !!v.returning || v.visits > 1 : true));

  function exportCsv() {
    const lines = [["visitor", "source", "device", "city", "last_search", "opened", "whatsapp", "last_seen"], ...visitors.map((v) => [v.id, v.source, v.device, v.city, v.lastSearch, v.openedUnits.join(" "), v.whatsapp, v.lastSeen])];
    const url = URL.createObjectURL(new Blob(["﻿" + lines.map((l) => l.join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `smq-visitors-${period}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`صُدّر ملف الزوار · ${pv.labelAr}`);
  }
  const close = () => setQuery({ v: null }, "push");

  return (
    <G7Shell
      active="visitors"
      phoneActive="visitors"
      title="الزوار"
      subtitle={`${pv.labelAr} · ${fmtNum(pv.visitors)} زائراً · ${fmtNum(pv.sessions)} جلسة · الهوية مجهولة حتى يرسل الزائر نموذجاً؛ نقرة واتساب تحمل رمزاً مرجعياً فقط`}
      note
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <PeriodToggle options={(Object.keys(visitorsPeriods) as PeriodKey[]).map((k) => ({ value: k, label: visitorsPeriods[k].labelAr }))} value={period} onChange={(v) => setPeriod(v as PeriodKey)} />
          <AdminButton size="md" className="text-[12px]" onClick={exportCsv}>
            تصدير CSV
          </AdminButton>
        </div>
      }
    >
      <section className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]" aria-label="ملخص الزوار">
        <Panel title={<h2 className="text-[15px] font-extrabold">من أين يأتون</h2>} bodyClassName="p-5">
          <div className="flex flex-col gap-3 text-[12px]">
            {s.sources.map((x, i) => (
              <div key={x.labelAr} className="grid grid-cols-[70px_1fr_90px] items-center gap-2">
                <span className={cx(i === 0 && "font-extrabold")}>{x.labelAr}</span>
                <HBar value={x.pct} gold={i === 0} />
                <span className="text-muted tnum">{i === 0 ? `${x.pct}% · ${x.whatsappPct.toFixed(1)}% واتساب` : `${x.pct}% · ${x.whatsappPct.toFixed(1)}%`}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-caption text-muted">النسبة الثانية = تحويل المصدر إلى واتساب. واتساب يحوّل أكثر، سناب شات يجلب أكثر.</p>
        </Panel>
        <Panel title={<h2 className="text-[15px] font-extrabold">الجهاز واللغة</h2>} bodyClassName="flex flex-col gap-3 p-5">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-0.5 bg-ink px-3.5 py-3 text-paper">
              <span className="text-[22px] font-extrabold tnum">{pv.mobilePct}%</span>
              <span className="text-caption text-on-ink-muted">{`جوال · iOS ${s.device.iosPct} · Android ${s.device.androidPct}`}</span>
            </div>
            <div className="flex flex-col gap-0.5 bg-sand px-3.5 py-3">
              <span className="text-[22px] font-extrabold tnum">{desktopPct}%</span>
              <span className="text-caption text-muted">سطح مكتب</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-0.5 border-interactive px-3.5 py-2.5">
              <span className="text-[18px] font-extrabold tnum">{s.lang.arPct}%</span>
              <span className="text-caption text-muted">عربي</span>
            </div>
            <div className="flex flex-col gap-0.5 border-[1.5px] border-line px-3.5 py-2.5">
              <span className="text-[18px] font-extrabold tnum">{s.lang.enPct}%</span>
              <span className="text-caption text-muted">EN</span>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-2 text-[12px]">
            <div className="flex flex-col">
              <dt className="text-muted">متوسط الجلسة</dt>
              <dd className="font-extrabold tnum">{s.avgSession}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-muted">صفحات لكل جلسة</dt>
              <dd className="font-extrabold tnum">{s.pagesPerSession}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-muted">عائدون</dt>
              <dd className="font-extrabold tnum">{s.returningPct}%</dd>
            </div>
          </dl>
        </Panel>
        <Panel title={<h2 className="text-[15px] font-extrabold">المدن</h2>} bodyClassName="p-5">
          <div className="flex flex-col gap-3 text-[12px]">
            {s.cities.map((c, i) => (
              <div key={c.labelAr} className="grid grid-cols-[70px_1fr_40px] items-center gap-2">
                <span className={cx(i === 0 && "font-extrabold")}>{c.labelAr}</span>
                <HBar value={c.pct} gold={i === 0} />
                <span className="text-muted tnum">{c.pct}%</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-caption text-muted">من عنوان الشبكة بتقريب المدينة فقط. لا يُخزَّن عنوان IP كاملاً.</p>
        </Panel>
      </section>

      <div className={cx("grid items-start gap-6", open && wide && "xl:grid-cols-[minmax(0,1fr)_360px]")}>
        <section className="flex min-w-0 flex-col border-interactive bg-paper" aria-labelledby="recent-h">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <h2 id="recent-h" className="text-[15px] font-extrabold">
              آخر الزوار
            </h2>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="تصفية الزوار">
              {FILTERS.map((f) => (
                <button key={f.value} type="button" aria-pressed={filter === f.value} onClick={() => setFilter(f.value)} className={cx("h-8 border-interactive px-2.5 text-[12px] font-bold", filter === f.value ? "bg-ink text-paper" : "bg-paper hover:bg-sand")}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <div role="table" aria-label="آخر الزوار" className="min-w-[680px] text-[12px]">
              <div role="row" className="grid grid-cols-[1.1fr_1fr_1.4fr_1.1fr_0.9fr_64px] gap-2.5 border-b border-line px-4 py-2.5 text-caption font-bold text-muted">
                {["الزائر", "المصدر · الجهاز · المدينة", "آخر بحث", "وحدات مفتوحة", "واتساب", "الوقت"].map((h) => (
                  <span role="columnheader" key={h}>
                    {h}
                  </span>
                ))}
              </div>
              {rows.map((v) => (
                <VisitorRow key={v.id} v={v} active={open?.id === v.id} onOpen={() => setQuery({ v: v.id }, "push")} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-[12px] text-muted">
            <span className="tnum">{rows.length ? `1 إلى ${rows.length} من ${fmtNum(filter === "all" ? pv.visitors : rows.length)}` : "0"}</span>
            <span className="flex gap-2">
              <AdminButton size="xs" disabled>
                السابق
              </AdminButton>
              <AdminButton size="xs" disabled={filter !== "all"} onClick={() => toast(ILLUSTRATIVE_NOTE, { kind: "info" })}>
                التالي
              </AdminButton>
            </span>
          </div>
        </section>
        {open && wide && (
          <aside className="flex flex-col border-interactive bg-paper" aria-label={`الزائر ${open.id}`}>
            <VisitorDetails v={open} onClose={close} />
          </aside>
        )}
      </div>
      {!wide && (
        <Drawer open={!!open} onClose={close} title={open ? `الزائر ${open.id}` : "الزائر"} bodyClassName="p-0">
          {open && <VisitorDetails v={open} onClose={close} phone />}
        </Drawer>
      )}
    </G7Shell>
  );
}

function VisitorRow({ v, active, onOpen }: { v: Visitor; active: boolean; onOpen: () => void }) {
  const compare = v.path.some((p) => p.includes("مقارنة"));
  const callOpened = v.path.some((p) => p.includes("الاتصال"));
  return (
    <button
      type="button"
      role="row"
      onClick={onOpen}
      aria-current={active || undefined}
      className={cx("grid w-full grid-cols-[1.1fr_1fr_1.4fr_1.1fr_0.9fr_64px] items-center gap-2.5 border-b border-line px-4 py-3 text-start last:border-b-0 hover:bg-cream", active && "bg-sand hover:bg-sand")}
    >
      <span role="cell" className="font-extrabold" dir="auto">
        {v.id}
        {v.code ? <span className="font-normal"> · {v.code}</span> : v.returning ? <span className="font-normal"> · عائد ×{v.visits}</span> : null}
      </span>
      <span role="cell">
        {v.source} · {v.device} · {v.city}
      </span>
      <span role="cell">
        {v.lastSearch}
        {v.zeroResults > 0 && <span className="font-bold text-gold-text"> · 0 نتائج</span>}
        {v.requestSaved && " · أرسل طلباً"}
      </span>
      <span role="cell" className={cx(!v.openedUnits.length && "text-muted")}>
        {v.openedUnits.length ? `${v.openedUnits.map(unitWord).join("، ")}${compare ? " (مقارنة)" : ""}` : "لا شيء"}
      </span>
      <span role="cell">
        {v.whatsapp > 0 && v.whatsappUnit ? (
          <span className="bg-gold px-1.5 py-0.5 font-bold text-ink">نعم · {unitWord(v.whatsappUnit)}</span>
        ) : v.requestSaved ? (
          <span className="border-interactive px-1.5 py-0.5 font-bold">طلب محفوظ</span>
        ) : (
          <span className="text-muted">{callOpened ? "لا · فتح الاتصال" : "لا"}</span>
        )}
      </span>
      <span role="cell" className="text-muted tnum">
        {agoLabel(v.lastSeen)}
      </span>
    </button>
  );
}

function VisitorDetails({ v, onClose, phone }: { v: Visitor; onClose: () => void; phone?: boolean }) {
  const toast = useStore((s) => s.toast);
  const lead = v.code ? leadById(v.code) : undefined;
  const steps = v.pathDetail ?? v.path.map((p) => ({ step: p, text: "", note: "" }));
  const facts: [string, string][] = [
    ["المصدر", v.sourceDetail ?? v.source],
    ["الجهاز", v.deviceDetail ?? v.device],
    ["المدينة", v.city],
    ["اللغة", v.lang === "ar" ? "عربي" : "English"],
    ["الزيارات", `${v.visits}${v.firstVisitLabel ? ` · ${v.firstVisitLabel}` : ""}`],
    ["مدة الجلسة", v.sessionLength],
  ];
  return (
    <div className="flex flex-col">
      {!phone && (
        <div className="cut-m relative flex flex-col gap-1 bg-ink px-5 py-4 text-paper">
          <span className="text-caption text-on-ink-muted">الزائر</span>
          <span className="text-[18px] font-extrabold">{v.id}</span>
          {v.code && <span className="text-[12px] text-on-ink-muted">{`ضغط واتساب · الرمز ${v.code} داخل الرسالة الجاهزة · لا رقم حتى تصل رسالته`}</span>}
          <button type="button" onClick={onClose} aria-label="إغلاق التفاصيل" className="absolute end-2 top-2 flex size-9 items-center justify-center text-[18px] text-on-ink-muted hover:text-paper">
            ×
          </button>
        </div>
      )}
      {phone && v.code && <p className="px-4 pt-2 text-[12px] text-muted">{`ضغط واتساب · الرمز ${v.code} داخل الرسالة الجاهزة · لا رقم حتى تصل رسالته`}</p>}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-line px-5 py-4 text-[12px]">
        {facts.map(([k, val]) => (
          <div key={k} className="flex flex-col gap-0.5">
            <dt className="text-muted">{k}</dt>
            <dd className="font-extrabold">{val}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-1 px-5 py-4 text-[12px]">
        <span className="mb-1 font-extrabold">مسار الجلسة</span>
        <ol className="flex flex-col">
          {steps.map((st, i) => {
            const wa = st.step.includes("واتساب");
            return (
              <li key={i} className="flex gap-3 py-2 leading-relaxed">
                <span aria-hidden className={cx("mt-1.5 size-2.5 shrink-0 hex-point", wa ? "bg-gold" : "bg-ink")} />
                <span>
                  <strong>{st.step}</strong> {st.text}
                  {st.note && <span className="block text-muted">{st.note}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="flex flex-wrap gap-2 px-5 pb-3">
        {v.code && (
          <AdminButton
            variant="gold"
            size="sm"
            onClick={() => {
              navigator.clipboard?.writeText(v.code ?? "").catch(() => {});
              toast(`نُسخ ${v.code}`);
            }}
          >
            انسخ {v.code} للبحث في واتساب
          </AdminButton>
        )}
        {lead ? (
          <Link href={`/admin/leads?lead=${lead.id}`} className="flex h-[38px] items-center border-interactive bg-paper px-3.5 text-[12px] font-bold text-ink hover:bg-sand">
            تحويل إلى عميل
          </Link>
        ) : (
          <AdminButton size="sm" onClick={() => toast(`سُجّل ${v.id} كعميل محتمل`, { action: { label: "الطلبات الواردة", href: "/admin/leads" } })}>
            تحويل إلى عميل
          </AdminButton>
        )}
      </div>
      <p className="px-5 pb-5 text-caption leading-relaxed text-muted">الزوار المجهولون يُحفظون 90 يوماً ثم يُحذفون. الموقع لا يعرف رقم من ضغط واتساب؛ الرسالة الجاهزة تحمل رمزاً مرجعياً يطابق الزائر عندما تصل رسالته. رقم الجوال يُخزَّن فقط عند إرسال نموذج.</p>
    </div>
  );
}
