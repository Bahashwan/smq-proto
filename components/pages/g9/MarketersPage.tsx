"use client";
// /admin/marketers (Admin-Marketers-D). Applicants from «انضم كمسوّق» move through the stages by hand; the stage of
// each marketer is the store override ?? the fixture. «أنشئ الرابط وفعّل» on an accepted card moves it to «نشط»
// (store setMarketer) and its tracked link appears. Tiles and the attributed-leads table are computed from
// data/marketers + data/leads.
import { useMemo } from "react";
import Link from "next/link";
import { AdminButton, AdminLinkButton, StatTile } from "@/components/admin";
import { StageBoard } from "@/components/alliance";
import { districtAr } from "@/data/districts";
import { leads, LEAD_KIND_LABELS, LEAD_STATUS_LABELS } from "@/data/leads";
import { marketerById, MARKETER_STAGE_LABELS, MARKETER_STAGES, trackedLink } from "@/data/marketers";
import { settings } from "@/data/settings";
import { effectiveLeadStatus, marketersByStage, marketerSummary } from "@/data/selectors";
import type { Marketer, MarketerStage } from "@/data/types";
import { useStore } from "@/lib/store";
import { cx, fmtDate, fmtNum } from "@/lib/format";
import { G9Shell, HexAvatar } from "./shell";
import { agoLong, agoShort, requestsWord, visitsWord } from "./util";

/** The marketer with the most visits among the active ones carries the gold avatar and frame (MK-07 on the board). */
function leaderId(active: Marketer[]): string | null {
  return active.reduce<Marketer | null>((best, m) => (!best || m.stats.visits30d > best.stats.visits30d ? m : best), null)?.id ?? null;
}

export const marketerHref = (m: Pick<Marketer, "id">) => `/admin/marketers/${m.id.toLowerCase()}`;
export const initial = (name: string) => name.trim().charAt(0);

/** «اليوم 09:40 · الروضة، الصفا · 1 إلى 3 سنوات · بلا رخصة» */
function newLine(m: Marketer): string {
  return [m.submittedAt ? agoShort(m.submittedAt) : null, m.districts.map(districtAr).join("، "), m.yearsLabel, m.licence ? `فال ${m.licence}` : "بلا رخصة"].filter(Boolean).join(" · ");
}

function MarketerCard({ m, stage, leader, onActivate }: { m: Marketer; stage: MarketerStage; leader: boolean; onActivate: (m: Marketer) => void }) {
  const suspended = stage === "suspended";
  const active = stage === "active";
  let line: string;
  if (stage === "new") line = newLine(m);
  else if (stage === "interview") line = m.interviewAt ?? "";
  else if (stage === "accepted") line = `قُبلت ${m.acceptedOn ? fmtDate(m.acceptedOn) : ""} · بانتظار إنشاء الرابط`;
  else if (active) line = trackedLink(m);
  else line = `أُوقف ${m.suspendedOn ? fmtDate(m.suspendedOn) : ""} · ${m.suspendedReason ?? ""}`;
  return (
    <div
      className={cx(
        "relative flex flex-col gap-1.5 bg-paper px-3.5 py-3 motion-hover hover:bg-cream",
        leader && active ? "border-2 border-gold" : suspended ? "border-hairline" : "border-interactive",
      )}
    >
      {stage === "new" && <span aria-hidden className="absolute inset-y-0 start-0 w-[4px] bg-gold" />}
      <span className="flex items-center gap-2">
        <HexAvatar letter={initial(m.name)} tone={suspended ? "muted" : leader && active ? "gold" : "ink"} size={26} />
        <Link href={marketerHref(m)} className="min-w-0 text-[14px] font-extrabold leading-snug text-ink no-underline after:absolute after:inset-0 hover:underline">
          {m.name}
          {(active || suspended) && <span className="whitespace-nowrap">{` · ${m.id}`}</span>}
        </Link>
      </span>
      <small className={cx("text-[11px] leading-relaxed text-muted", active && "tnum")} dir={active ? "ltr" : undefined} style={active ? { textAlign: "right" } : undefined}>
        {line}
      </small>
      {active && (
        <span className="mt-1 grid grid-cols-3 gap-1 text-caption font-bold">
          {[visitsWord(m.stats.visits30d), `${fmtNum(m.stats.whatsapp30d)} واتساب`, requestsWord(m.stats.leads)].map((s) => {
            const [num, ...word] = s.split(" ");
            return (
              <span key={s} className="flex flex-col items-start leading-tight">
                <b className="flex items-center gap-1 font-extrabold tnum">
                  <span aria-hidden className="hex-point inline-block size-1.5 bg-gold" />
                  {num}
                </b>
                <span>{word.join(" ")}</span>
              </span>
            );
          })}
        </span>
      )}
      {stage === "accepted" && (
        <button
          type="button"
          onClick={() => onActivate(m)}
          className="relative z-10 mt-1 min-h-9 bg-sand px-3 text-caption font-extrabold text-ink motion-hover hover:bg-gold"
        >
          أنشئ الرابط وفعّل
        </button>
      )}
    </div>
  );
}

export function MarketersPage() {
  const overrides = useStore((s) => s.marketers);
  const setMarketer = useStore((s) => s.setMarketer);
  const toast = useStore((s) => s.toast);
  const leadOverrides = useStore((s) => s.leads);
  const byStage = useMemo(() => marketersByStage(overrides), [overrides]);
  const sum = useMemo(() => marketerSummary(overrides), [overrides]);
  const leader = leaderId(byStage.active);

  const activate = (m: Marketer) => {
    setMarketer(m.id, "active");
    toast(`انتقل إلى «نشط» · أُنشئ الرابط ${trackedLink(m)}`, { action: { label: m.name, href: marketerHref(m) } });
  };

  const recent = useMemo(
    () =>
      leads
        .filter((l) => l.viaMarketer)
        .sort((a, b) => (a.at < b.at ? 1 : -1))
        .slice(0, 3),
    [],
  );

  const columns = MARKETER_STAGES.map((stage) => ({
    key: stage,
    title: MARKETER_STAGE_LABELS[stage],
    count: byStage[stage].length,
    children: (
      <>
        {byStage[stage].map((m) => (
          <MarketerCard key={m.id} m={m} stage={stage} leader={m.id === leader} onActivate={activate} />
        ))}
        {stage === "suspended" && (
          <div className="p-2.5 text-caption leading-relaxed text-muted" style={{ border: "1.5px dashed var(--smq-line)" }}>
            الإيقاف يعطّل الرابط فوراً ويُبقي الطلبات المنسوبة سابقاً في السجل.
          </div>
        )}
      </>
    ),
  }));

  return (
    <G9Shell
      title="المسوّقون"
      subtitle="من «انضم كمسوّق». يتقدّم المسوّق عبر المراحل باليد؛ النشط يملك رابطاً متابَعاً وتُنسب إليه الطلبات"
      actions={
        <>
          <AdminButton variant="outline" size="md" onClick={() => toast("صُدّر ملف المسوّقين · smq-marketers.csv")}>
            تصدير CSV
          </AdminButton>
          <AdminLinkButton href="/admin/alliance/settings" variant="outline" size="md">
            {`النموذج: ${settings.switches.marketersOpen ? "مفتوح" : "مغلق"} · خياراته`}
          </AdminLinkButton>
          <AdminLinkButton href="/marketers" variant="ink" size="md">
            + مسوّق يدوياً
          </AdminLinkButton>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        <StatTile label="نشطون" value={fmtNum(sum.active)} />
        <StatTile label="زيارات من روابطهم · 30 يوماً" value={fmtNum(sum.visits30d)} />
        <StatTile label="طلبات منسوبة" value={fmtNum(sum.leads)} />
        <StatTile label="صفقات قيد التفاوض" value={fmtNum(sum.negotiating)} variant="ink" />
      </div>

      <StageBoard columns={columns} initial="new" className="[&_.md\:grid]:gap-3.5" />

      <section className="border-interactive bg-paper" aria-labelledby="mk-recent">
        <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b-[1.5px] border-ink bg-sand px-4 py-3.5">
          <h2 id="mk-recent" className="text-[14px] font-extrabold">
            آخر الطلبات المنسوبة لمسوّقين
          </h2>
          <span className="text-caption font-bold text-muted">تظهر أيضاً في الطلبات الواردة بوسم «عبر مسوّق»</span>
        </header>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[120px_1fr_1fr_1fr_110px] gap-3 border-b border-line px-4 py-3 text-caption font-extrabold text-muted">
              <span>الوقت</span>
              <span>المسوّق</span>
              <span>الوحدة · القناة</span>
              <span>الحالة في الواردة</span>
              <span>الرمز</span>
            </div>
            {recent.map((l) => {
              const m = l.viaMarketer ? marketerById(l.viaMarketer) : undefined;
              const st = effectiveLeadStatus(l, leadOverrides);
              const word = st === l.status && l.statusDetailAr ? l.statusDetailAr : LEAD_STATUS_LABELS[st];
              return (
                <Link
                  key={l.id}
                  href={`/admin/leads?lead=${encodeURIComponent(l.id)}`}
                  className="grid min-h-11 grid-cols-[120px_1fr_1fr_1fr_110px] items-center gap-3 border-b border-line px-4 py-3 text-[13px] text-ink no-underline last:border-b-0 hover:bg-sand"
                >
                  <span>{agoLong(l.at)}</span>
                  <span>{m ? `${m.name} · ${m.id}` : ""}</span>
                  <span>{`${l.unitCode ?? ""} · ${LEAD_KIND_LABELS[l.kind]}`}</span>
                  <span className={cx(word === l.statusDetailAr ? "font-extrabold text-gold-text" : st === "unanswered" ? "font-bold text-muted" : "font-extrabold")}>{word}</span>
                  <span className="font-bold" dir="ltr" style={{ textAlign: "right" }}>
                    {l.code}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </G9Shell>
  );
}

