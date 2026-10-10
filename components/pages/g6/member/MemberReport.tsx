"use client";
// /member/[token]/report · Member-Report-M / -D (responsive): the latest published monthly demand report (September
// 2026), the same for every member. Slices under 20 sessions are hidden (reportSlices); gold bars = rows named in the
// visible opportunities («لا عرض يكفي»). All numbers come from data/analytics allianceReports.
import Link from "next/link";
import type { ReactNode } from "react";
import { allianceReports, officeNameAr, reportSlices, type AllianceReport, type PctRow } from "@/data";
import { cx, fmtDate, fmtNum } from "@/lib/format";
import { Lockup } from "@/components/ui";
import { ReportBarRow, ReportGapRow, ReportTile, fmtShort, officesCount } from "@/components/alliance";
import { HeaderLink, MemberHeader, MemberMark } from "../chrome";
import { goldRows, latestPublished } from "../data";

/** Slices under this many sessions never reach members (reportSlices, design/README). */
const REPORT_MIN = 20;

function previousMonth(r: AllianceReport): string | undefined {
  const prev = allianceReports.filter((x) => x.id < r.id).sort((a, b) => (a.id < b.id ? 1 : -1))[0];
  return prev?.monthAr.split(" ")[0];
}

function Block({ title, sub, children, className }: { title: string; sub?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cx("flex flex-col gap-2 bg-paper px-4 py-4 border-interactive md:px-5 md:py-5", className)}>
      <div className="flex items-baseline justify-between gap-3 pb-1">
        <h2 className="text-[17px] font-extrabold md:text-[18px]">{title}</h2>
        {sub && <span className="text-caption text-muted">{sub}</span>}
      </div>
      {children}
    </section>
  );
}

function Bars({ rows, report, kind }: { rows: PctRow[]; report: AllianceReport; kind: "district" | "other" }) {
  const gold = goldRows(rows, report, kind);
  const max = Math.max(...rows.map((r) => r.pct), 1);
  return (
    <div className="flex flex-col">
      {rows.map((r) => (
        <ReportBarRow key={r.key} label={r.labelAr} pct={r.pct} max={max} tone={r.key === "other" ? "muted" : gold.has(r.key) ? "gold" : "ink"} />
      ))}
    </div>
  );
}

export function MemberReport({ officeId }: { officeId: string }) {
  const report = latestPublished();
  if (!report) return null;
  const { visible } = reportSlices(report.opportunities, REPORT_MIN);
  const prev = previousMonth(report);
  const tiles = [
    { label: "جلسات بحث", value: fmtNum(report.sessions), note: report.sessionsDeltaPct != null && prev ? `${report.sessionsDeltaPct > 0 ? "+" : ""}${report.sessionsDeltaPct}% عن ${prev}` : undefined },
    { label: "الميزانية الوسيطة", value: report.medianBudget ? fmtShort(report.medianBudget) : "—", note: "ريال" },
    { label: "طلب بلا عرض", value: report.noSupplyPct != null ? `${report.noSupplyPct}%` : "—", note: "من الجلسات" },
  ];
  const sessions = fmtNum(report.sessions);
  const covering = (ids: string[] = []) => ids.map(officeNameAr).join("، ");

  return (
    <div className="min-h-dvh bg-cream text-ink">
      {/* phone header */}
      <MemberHeader className="md:hidden" subtitle="للأعضاء · بلا دخول" action={<HeaderLink href={`/member/${officeId}`}>الميزان</HeaderLink>} />
      {/* desktop header */}
      <header className="hidden bg-ink text-paper md:block">
        <div className="container-smq flex items-center justify-between gap-6 py-4">
          <div className="flex items-center gap-3">
            <MemberMark size={22} />
            <span className="flex flex-col">
              <span className="text-[15px] font-extrabold">تحالف مكاتب جدة العقارية</span>
              <span className="text-caption text-on-ink-muted">تقرير الطلب الشهري · للأعضاء · يُفتح من رابط واتساب بلا دخول</span>
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => window.print()} className="inline-flex h-11 items-center px-4 text-[12px] font-bold text-paper hover:bg-ink-2" style={{ border: "1.5px solid var(--smq-paper)" }}>
              PDF
            </button>
            <Link href={`/member/${officeId}`} className="inline-flex h-11 items-center bg-gold px-4 text-[12px] font-extrabold text-ink no-underline hover:bg-gold-hover">
              صفحة العضو
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-ink text-paper [clip-path:polygon(0_0,100%_0,100%_100%,40px_100%,0_calc(100%-23px))] md:[clip-path:polygon(0_0,100%_0,100%_100%,120px_100%,0_calc(100%-69px))]">
        <div className="container-smq grid gap-6 pt-6 pb-10 md:grid-cols-[minmax(0,1fr)_520px] md:items-center md:gap-10 md:pt-10 md:pb-24">
          <div className="flex flex-col gap-2.5 md:gap-3">
            <span className="text-[12px] font-bold text-gold md:text-[13px]">
              <span className="md:hidden">تقرير الطلب الشهري · {report.monthAr}</span>
              <span className="hidden md:inline">
                {report.monthAr} · صدر {report.publishedOn ? fmtDate(report.publishedOn) : ""}
              </span>
            </span>
            <h1 className="text-[24px] leading-tight font-extrabold md:text-[40px]">ماذا بحث عنه مشترو جدة هذا الشهر</h1>
            <p className="text-[12px] leading-relaxed text-on-ink-muted md:text-[14px]">
              <span className="md:hidden">أرقام مجمّعة من {sessions} جلسة بحث على SMQ وطلبات التحالف. لا أسماء، لا أرقام، لا أفراد. الأرقام توضيحية.</span>
              <span className="hidden md:inline">أرقام مجمّعة من {sessions} جلسة بحث على SMQ وطلبات التحالف. لا أسماء، لا أرقام، لا أفراد. أي شريحة أقل من {REPORT_MIN} جلسة لا تُعرض. كل الأرقام في هذا التصميم توضيحية.</span>
            </p>
          </div>
          <div className="hidden grid-cols-3 gap-2.5 md:grid">
            {tiles.map((t, i) => (
              <div key={t.label} className={cx("flex flex-col gap-1 px-4 py-5", i === 2 ? "bg-gold text-ink cut-s" : "text-paper")} style={i === 2 ? undefined : { border: "1.5px solid var(--smq-ink-2)" }}>
                <span className={cx("text-caption", i === 2 ? "text-on-gold-muted" : "text-on-ink-muted")}>{t.label}</span>
                <span className="text-[28px] leading-tight font-extrabold tnum">{t.value}</span>
                {t.note && <span className={cx("text-caption", i === 2 ? "text-on-gold-muted" : "text-on-ink-muted")}>{t.note}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="container-smq flex flex-col gap-4 py-5 md:gap-5 md:py-8">
        <div className="grid grid-cols-3 gap-2 md:hidden">
          {tiles.map((t, i) => (
            <ReportTile key={t.label} label={t.label} value={t.value} note={t.note} tone={i === 2 ? "ink" : "paper"} />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr] md:gap-4">
          <Block title="بالحي" sub="حصة الجلسات · الذهبي: لا عرض يكفي">
            <Bars rows={report.byDistrict} report={report} kind="district" />
          </Block>
          <Block title="بشريحة الميزانية">
            <Bars rows={report.byBudget} report={report} kind="other" />
          </Block>
          <Block title="بعدد الغرف">
            <Bars rows={report.byBeds} report={report} kind="other" />
            {report.bedsNoteAr && <span className="mt-auto hidden pt-3 text-caption leading-relaxed text-muted md:block">{report.bedsNoteAr}</span>}
          </Block>
        </div>

        {/* phone: the opportunities as numbered rows */}
        <section className="flex flex-col gap-2 pt-2 md:hidden">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[18px] font-extrabold">حيث وجد الطلب لا عرض</h2>
            <span className="text-caption text-muted">فرص الأعضاء</span>
          </div>
          {visible.map((o, i) => (
            <ReportGapRow key={o.labelAr} n={i + 1} title={o.labelAr} note={`${fmtNum(o.sessions)} جلسة · ${o.supplyAr ?? ""}${i === 0 ? " على SMQ" : ""} · ${officesCount(o.offices)} ${o.offices === 1 ? "يغطيه" : "تغطيه"}`} />
          ))}
        </section>
        {/* desktop: the same rows as a table */}
        <section className="hidden bg-paper border-interactive md:block">
          <div className="flex items-baseline justify-between gap-3 px-5 py-4">
            <h2 className="text-[20px] font-extrabold">حيث وجد الطلب لا عرض · فرص الأعضاء</h2>
            <span className="text-caption text-muted">مرتّبة بحجم الطلب</span>
          </div>
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-sand text-start text-caption font-extrabold text-muted">
                <th className="w-12 px-4 py-3" />
                <th className="px-4 py-3 text-start">الحي والشريحة</th>
                <th className="px-4 py-3 text-start">جلسات</th>
                <th className="px-4 py-3 text-start">العرض على SMQ</th>
                <th className="px-4 py-3 text-start">مكاتب تغطيه</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o, i) => (
                <tr key={o.labelAr} className="border-t border-line">
                  <td className="px-4 py-3.5">
                    <span className="relative inline-block h-7 w-7 bg-gold hex-flat align-middle">
                      <span className="absolute inset-0.5 bg-paper hex-flat" />
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold tnum">{i + 1}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-extrabold">{o.labelAr}</td>
                  <td className="px-4 py-3.5 tnum">{fmtNum(o.sessions)}</td>
                  <td className="px-4 py-3.5">{o.supplyAr}</td>
                  <td className={cx("px-4 py-3.5", o.offices === 0 && "font-extrabold text-gold-text")}>{o.offices === 0 ? "يحتاج أعضاء" : `${o.offices} · ${covering(o.officeIds)}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="flex flex-col gap-1.5 bg-sand px-4 py-4 text-caption leading-relaxed text-ink-2 md:px-5 md:text-[12px]">
            <span className="font-extrabold text-ink">عن هذه الأرقام</span>
            <span className="md:hidden">جلسة البحث: زيارة غيّرت فلتراً واحداً على الأقل. «لا عرض» يعني لا وحدة متاحة على SMQ تطابق الفلاتر. لا تُعرض أي بيانات لأقل من {REPORT_MIN} جلسة لحماية الخصوصية. يصدر التقرير أول كل شهر لكل الأعضاء بالتساوي.</span>
            <span className="hidden md:inline">جلسة البحث: زيارة غيّرت فلتراً واحداً على الأقل. «لا عرض» يعني لا وحدة متاحة على SMQ تطابق الفلاتر. لا تُعرض أي بيانات لأقل من {REPORT_MIN} جلسة. يصدر التقرير أول كل شهر لكل الأعضاء بالتساوي، ولا يُنشر للعموم.</span>
            <span className="font-bold text-gold-text md:hidden">كل الأرقام في هذا التصميم توضيحية.</span>
          </section>
          <section className="hidden flex-col gap-1.5 bg-ink px-5 py-4 text-[12px] leading-relaxed text-paper cut-m md:flex">
            <span className="font-extrabold text-gold">ماذا تفعل بهذا كعضو</span>
            <span>أرسل عرضاً عاماً في شريحة بلا عرض من صفحة الميزان، وسيُطابَق مع الطلبات القادمة تلقائياً. الأحياء الذهبية في القوائم تعني طلباً يسبق العرض.</span>
          </section>
        </div>
      </main>

      <footer className="hidden bg-ink text-on-ink-muted md:block">
        <div className="container-smq flex items-center justify-between gap-10 py-7 text-[12px]">
          <Lockup tone="white" height={32} />
          <span>تحالف مكاتب جدة العقارية · مبادرة من إس إم كيو · التقرير للأعضاء ولا يُعاد نشره</span>
        </div>
      </footer>
    </div>
  );
}
