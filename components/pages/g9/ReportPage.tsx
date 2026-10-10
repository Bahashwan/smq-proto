"use client";
// /admin/alliance/report (Admin-AllianceReport-D). The monthly report generated from the visitors' searches: the
// October draft by default (September and August published, from the month select), its meta, the sections switches,
// the month's word, and the preview as it will reach the members (share bars, «حيث وجد الطلب لا عرض» with slices
// under 20 sessions hidden). «انشر وأرسل» publishes in memory with a toast; «افتح كما يراه العضو» opens
// /member/office-01/report. Bar tones: gold where SMQ has no available unit for that slice.
import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminButton, Switch } from "@/components/admin";
import { ReportBarRow, membersLabel } from "@/components/alliance";
import { allianceReports } from "@/data/analytics";
import { offices } from "@/data/offices";
import { availableUnits, reportSlices, TODAY, unitDistrictSlug } from "@/data/selectors";
import type { AllianceReport, PctRow } from "@/data/types";
import { usePatch, useStore, useUnitOverrides } from "@/lib/store";
import { cx, fmtDate, fmtNum } from "@/lib/format";
import { AllianceTabs, G9Shell, RoomTitle, Section } from "./shell";
import { cnt, letters } from "./util";

const WORD_MAX = 300;
/** Budget slice keys → price range (the report's «شريحة الميزانية» rows). */
const BANDS: Record<string, [number, number]> = { b1: [0, 500000], b2: [500000, 700000], b3: [700000, 1000000], b4: [1000000, 1500000], b5: [1500000, 2500000], b6: [2500000, Infinity] };

type ReportPatch = { word?: string; sections?: Record<string, boolean>; published?: string; saved?: string };

/** The preview's compact bar rows (90px label · bar · 40px share, 11px, 10px bar) over the shared row. */
const BAR_ROW = "grid-cols-[90px_1fr_40px]! py-[3px]! text-[11px]! md:grid-cols-[90px_1fr_40px]! md:py-[3px]! md:text-[11px]! [&>div]:h-2.5! [&>div]:md:h-2.5!";

function Bars({ title, rows, gold }: { title: string; rows: PctRow[]; gold: (r: PctRow) => boolean }) {
  const max = Math.max(...rows.map((r) => r.pct), 1);
  return (
    <div className="flex min-w-0 flex-col gap-1 border-interactive bg-paper p-3">
      <span className="text-[11px] font-extrabold">{title}</span>
      {rows.map((r) => (
        <ReportBarRow key={r.key} label={r.labelAr} pct={r.pct} max={max} tone={gold(r) ? "gold" : "ink"} className={BAR_ROW} />
      ))}
    </div>
  );
}

export function ReportPage() {
  const unitOv = useUnitOverrides();
  const toast = useStore((s) => s.toast);
  const patch = useStore((s) => s.patch);
  const [id, setId] = useState(allianceReports.find((r) => r.status === "draft")?.id ?? allianceReports[0].id);
  const base = allianceReports.find((r) => r.id === id) as AllianceReport;
  const p = usePatch<ReportPatch>("report", id);
  const published = base.status === "published" || !!p?.published;
  const word = p?.word ?? base.wordAr;
  const sectionOn = (key: string) => p?.sections?.[key] ?? base.sections.find((s) => s.key === key)?.on ?? false;
  const slices = reportSlices(base.opportunities);
  const suspended = offices.filter((o) => o.status === "suspended");
  const avail = useMemo(() => availableUnits(unitOv), [unitOv]);
  const gapDistricts = new Set(base.opportunities.map((o) => o.labelAr.split(" · ")[0]));
  const goldDistrict = (r: PctRow) => gapDistricts.has(r.labelAr) && !avail.some((u) => unitDistrictSlug(u) === r.key);
  const goldBand = (r: PctRow) => {
    const band = BANDS[r.key];
    return !!band && !avail.some((u) => u.priceSar > band[0] && u.priceSar <= band[1]);
  };
  const goldBeds = (r: PctRow) => {
    const n = parseInt(r.key, 10);
    return !avail.some((u) => (n >= 5 ? u.beds >= 5 : u.beds === n));
  };
  const today = parseInt(TODAY.slice(8), 10);
  const monthWord = base.monthAr.split(" ")[0];

  return (
    <G9Shell
      title={<RoomTitle section="التقرير الشهري" />}
      subtitle="يُولَّد تلقائياً من بحوث الزوار وطلبات التحالف. معاينة، ثم نشر وإرسال للأعضاء الموثّقين كلهم بالتساوي"
      actions={
        <select aria-label="الشهر" value={id} onChange={(e) => setId(e.target.value)} className="h-10 border-interactive bg-paper px-3 text-[12px] font-bold">
          {allianceReports.map((r) => (
            <option key={r.id} value={r.id}>{`${r.monthAr} · ${r.status === "draft" ? "مسودة" : "نُشر"}`}</option>
          ))}
        </select>
      }
    >
      <AllianceTabs active="report" />

      <div className="grid items-start gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Section
            title={base.monthAr}
            aside={<span className="border-interactive px-2 py-1 text-[11px] font-extrabold text-ink">{published ? `نُشر ${fmtDate(base.publishedOn ?? p?.published ?? TODAY)}` : `مسودة · حتى اليوم ${today}`}</span>}
            bodyClassName="px-4 py-1"
          >
            {[
              [published ? "جلسات الشهر" : "جلسات حتى الآن", fmtNum(base.sessions), false],
              ["شرائح تحت 20 جلسة", `${slices.hidden.length} · ${published ? "أُخفيت" : "ستُخفى"}`, true],
              base.newDistrictsAr ? ["أحياء جديدة في التقرير", base.newDistrictsAr, false] : null,
              base.generatesOn && !published ? ["يُولَّد نهائياً", base.generatesOn, false] : null,
              ["المستلمون", `${base.recipients >= 11 ? `${base.recipients} عضواً موثّقاً` : `${base.recipients} أعضاء موثّقين`}${!published && suspended.length ? ` (${letters(suspended.map((o) => o.id))} موقوف)` : ""}`, false],
            ]
              .filter(Boolean)
              .map((row) => {
                const [k, v, gold] = row as [string, string, boolean];
                return (
                  <div key={k} className="flex items-baseline justify-between gap-3 border-b border-line py-2 text-[12px] last:border-b-0">
                    <span className="text-muted">{k}</span>
                    <span className={cx("text-end font-extrabold", gold && "text-gold-text")}>{v}</span>
                  </div>
                );
              })}
          </Section>

          <Section title="الأقسام المضمّنة" bodyClassName="flex flex-col gap-1 p-4">
            {base.sections.map((s) => (
              <div key={s.key} className="flex min-h-10 items-center justify-between gap-3 text-[13px]">
                <span id={`sec-${s.key}`}>{s.labelAr}</span>
                <Switch
                  checked={sectionOn(s.key)}
                  disabled={published}
                  aria-labelledby={`sec-${s.key}`}
                  onChange={(v) => patch("report", id, { sections: { ...(p?.sections ?? {}), [s.key]: v } })}
                />
              </div>
            ))}
            <span className="pt-1 text-[11px] leading-relaxed text-muted">أسماء الأعضاء لا تُنشر في التقرير افتراضياً؛ كل عضو يرى ترتيبه في صفحته فقط.</span>
          </Section>

          <Section title="كلمة الشهر" aside={`اختياري · ${WORD_MAX} حرف`} bodyClassName="p-4">
            <textarea
              aria-label="كلمة الشهر"
              rows={4}
              maxLength={WORD_MAX}
              disabled={published}
              value={word}
              onChange={(e) => patch("report", id, { word: e.target.value })}
              className="w-full border-interactive bg-paper px-3 py-2.5 text-[13px] leading-relaxed focus:border-gold focus:bg-cream-focus focus-visible:outline-0 disabled:text-muted"
            />
          </Section>

          <div className="flex flex-col gap-2">
            <AdminButton
              variant="gold"
              size="lg"
              className="h-12 w-full text-[14px]"
              disabled={published}
              onClick={() => {
                patch("report", id, { published: TODAY });
                toast(`نُشر تقرير ${base.monthAr} · أُرسل على واتساب لـ${cnt(base.recipients, "عضو", "أعضاء", "عضواً")}`, { action: { label: "افتح كما يراه العضو", href: "/member/office-01/report" } });
              }}
            >
              {published ? `نُشر تقرير ${monthWord}` : `انشر وأرسل للأعضاء · ${base.recipients}`}
            </AdminButton>
            <div className="grid grid-cols-2 gap-2">
              <AdminButton
                variant="outline"
                size="md"
                disabled={published}
                onClick={() => {
                  patch("report", id, { saved: TODAY });
                  toast(`حُفظت مسودة تقرير ${monthWord}`);
                }}
              >
                احفظ المسودة
              </AdminButton>
              <Link href="/member/office-01/report" className="flex h-10 items-center justify-center border-interactive bg-paper px-3 text-[13px] font-bold text-ink no-underline hover:bg-sand">
                افتح كما يراه العضو
              </Link>
            </div>
            <span className="text-[11px] leading-relaxed text-muted">النشر يرسل رابط التقرير على واتساب لكل عضو موثّق، ويثبّت نسخة لا تتغيّر. التعديل بعد النشر ينشئ نسخة 2 ويُعلم الأعضاء.</span>
          </div>
        </div>

        <Section title="معاينة · كما سيصل" aside="1440 · الجوال من نفس البيانات" bodyClassName="flex flex-col gap-4 bg-cream p-4">
          <div className="cut-img flex flex-col gap-2 bg-ink px-6 pb-9 pt-6 text-paper">
            <span className="text-[11px] font-bold text-gold">{`${base.monthAr} · ${published ? "نُشر" : "مسودة"}`}</span>
            <span className="text-[24px] font-extrabold leading-snug">ماذا بحث عنه مشترو جدة هذا الشهر</span>
            <span className="text-[12px] text-on-ink-muted">{`${fmtNum(base.sessions)} جلسة ${published ? "هذا الشهر" : "حتى اليوم"} · لا أسماء، لا أرقام · شرائح أقل من 20 جلسة لا تُعرض`}</span>
          </div>
          <div className="grid gap-2.5 md:grid-cols-3">
            {sectionOn("district") && <Bars title="بالحي" rows={base.byDistrict} gold={goldDistrict} />}
            {sectionOn("budget") && <Bars title="بشريحة الميزانية" rows={base.byBudget} gold={goldBand} />}
            {sectionOn("beds") && <Bars title="بعدد الغرف" rows={base.byBeds} gold={goldBeds} />}
          </div>
          {sectionOn("gaps") && (
            <div className="flex flex-col border-interactive bg-paper">
              <div className="border-b-[1.5px] border-ink px-3.5 py-2.5 text-[12px] font-extrabold">حيث وجد الطلب لا عرض</div>
              <div className="grid px-3.5 py-2 text-[12px] md:grid-cols-2 md:gap-x-5">
                {[...slices.visible, ...slices.hidden].map((s) => {
                  const hidden = s.sessions < 20;
                  // no member, or one office not enough for the demand: the gold row of the board
                  const short = !hidden && (s.offices === 0 || !!s.needsMembers);
                  const who = hidden ? "أقل من 20، يُخفى" : s.offices > 0 && s.needsMembers ? `${s.offices} · يحتاج أعضاء` : membersLabel(s.offices);
                  return (
                    <div key={s.labelAr} className={cx("flex items-baseline justify-between gap-3 border-b border-line py-1.5", hidden && "text-muted")}>
                      <span>{s.labelAr}</span>
                      <strong className={cx("shrink-0 font-extrabold tnum", short && "text-gold-text")}>{`${fmtNum(s.sessions)} · ${who}`}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {word.trim() && (
            <div className="border-interactive bg-paper px-4 py-3 text-[12px] leading-relaxed">
              <strong className="font-extrabold">كلمة الشهر:</strong> {word}
            </div>
          )}
        </Section>
      </div>
    </G9Shell>
  );
}
