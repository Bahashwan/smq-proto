"use client";
// /alliance/status/[id] · AllianceApply-Status-M: one of three states per application — «قيد المراجعة» (default for
// review / missing / imported), «موثّق», «مرفوض مع السبب». Presenter «application status» (?app=) wins, then the
// store (an approval in the alliance room), then the fixture. ALL-2026-0031 is rejected in the fixtures.
import Link from "next/link";
import type { ReactNode } from "react";
import { applicationById, districtAr, offices, openRequestsForOffice, whenLabel, type Application } from "@/data";
import { usePresenter } from "@/lib/presenter";
import { usePatch, useStore } from "@/lib/store";
import { cx, fmtDate, waLink } from "@/lib/format";
import { APPLICATION_STEPS, AlliancePill, FalBadge, HexDot, PointDot } from "@/components/alliance";
import { designedRejection, maskedLicence, statusView, type StatusView } from "../data";
import { ApplyShell } from "./parts";

function Steps({ view, onInk }: { view: StatusView; onInk?: boolean }) {
  const words = view === "rejected" ? [APPLICATION_STEPS[0], "لم يُوثَّق", APPLICATION_STEPS[2]] : [...APPLICATION_STEPS];
  const current = view === "review" ? 1 : view === "verified" ? 2 : 1;
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="مراحل الطلب">
      {words.map((w, i) => {
        const done = i < current;
        const now = i === current && view !== "rejected";
        const failed = view === "rejected" && i === 1;
        const cell = failed ? <HexDot size={22} tone="paper" border="ink" /> : now ? <HexDot size={22} tone="gold" /> : done ? <HexDot size={22} tone="ink" /> : <HexDot size={22} tone="paper" border="line" />;
        return (
          <li key={w} className="flex flex-col items-center gap-1.5 text-center" aria-current={now || failed ? "step" : undefined}>
            {cell}
            <span className={cx("text-[11px] leading-snug", now || failed ? "font-extrabold" : "font-semibold", onInk ? (now ? "text-paper" : "text-on-ink-muted") : now || failed ? "text-ink" : "text-muted")}>{w}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Rows({ rows, onInk }: { rows: { k: string; v: ReactNode }[]; onInk?: boolean }) {
  return (
    <div className="flex flex-col">
      {rows.map((r, i) => (
        <div key={r.k} className={cx("flex items-center justify-between gap-3 py-3 text-[13px]", i > 0 && (onInk ? "border-t border-ink-2" : "border-t border-line"))}>
          <span className={onInk ? "text-on-ink-muted" : "text-muted"}>{r.k}</span>
          <span className="text-end font-extrabold tnum">{r.v}</span>
        </div>
      ))}
    </div>
  );
}

/** The member whose coverage matches the application best (the verified state's «صفحة العضو» preview). */
function closestMember(a: Application) {
  const scored = offices
    .filter((o) => o.status === "active")
    .map((o) => ({ o, n: o.districts.filter((d) => a.districts.includes(d)).length }))
    .sort((x, y) => y.n - x.n || x.o.id.localeCompare(y.o.id));
  return scored[0]?.o;
}

export function ApplicationStatus({ id }: { id: string }) {
  const base = applicationById(id);
  const patch = usePatch<{ officeName: string; phoneMasked: string; districts: string[] }>("application", id);
  const override = useStore((s) => s.applications[id]);
  const { state } = usePresenter();
  if (!base) return null;
  const a: Application = { ...base, ...(patch ?? {}) };
  const view: StatusView = state.app ?? statusView(override ?? a.status);
  const member = closestMember(a);
  const firstRequest = member ? openRequestsForOffice(member.id)[0] : undefined;
  const rejection = a.rejectReason ?? designedRejection()?.rejectReason ?? "";
  const decisionOn = a.verification?.date;

  return (
    <ApplyShell band="حالة الطلب" bandD="حالة طلب الانضمام إلى تحالف مكاتب جدة العقارية" waText={a.id}>
      <div className="flex flex-col gap-5 pb-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[22px] font-extrabold md:text-[28px]">حالة طلب الانضمام</h1>
          <span className="text-[12px] leading-relaxed text-muted md:text-[13px]">تُفتح من الرابط في رسالة واتساب، بلا دخول.</span>
        </div>

        {view === "review" && (
          <section className="flex flex-col gap-4 bg-paper px-4 py-4 border-interactive md:px-6 md:py-5" aria-label="قيد المراجعة">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[16px] font-extrabold">{a.officeName}</span>
              <AlliancePill tone="gold-outline" className="text-[11px]">
                قيد المراجعة
              </AlliancePill>
            </div>
            <Steps view="review" />
            <Rows
              rows={[
                { k: "رقم الطلب", v: <span dir="ltr">{a.id}</span> },
                { k: "أُرسل", v: whenLabel(a.submittedAt) },
                { k: "المتوقع", v: "رد خلال يومي عمل" },
              ]}
            />
            <p className="text-[12px] leading-relaxed text-ink-2">
              نتحقق من رخصة فال <span className="tnum">{maskedLicence(a.licence)}</span> في موقع الهيئة. إن احتجنا صورة الرخصة أو السجل سنراسلك على واتساب.
            </p>
            <a href={waLink(a.id)} target="_blank" rel="noopener" className="inline-flex h-12 items-center justify-center px-4 text-[13px] font-extrabold text-ink no-underline hover:bg-sand" style={{ border: "1.5px solid var(--smq-ink)" }}>
              أضف مستنداً عبر واتساب
            </a>
          </section>
        )}

        {view === "verified" && (
          <section className="flex flex-col gap-4 bg-ink px-4 py-5 text-paper cut-l md:px-6" aria-label="موثّق">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[16px] font-extrabold">{a.officeName}</span>
              <FalBadge onInk />
            </div>
            <Steps view="verified" onInk />
            <p className="text-[12px] leading-relaxed text-on-ink-muted">
              تم التحقق في موقع الهيئة بتاريخ {a.verification?.date ? fmtDate(a.verification.date) : "—"}
              {a.verification?.expiry ? ` · الرخصة سارية حتى ${fmtDate(a.verification.expiry)}` : ""} · التغطية: {a.districts.map(districtAr).join("، ")}.
            </p>
            <div className="flex flex-col gap-2.5">
              {member && (
                <Link href={`/member/${member.id}`} className="inline-flex h-12 items-center justify-center bg-gold px-4 text-[14px] font-extrabold text-ink no-underline cut-s hover:bg-gold-hover">
                  افتح صفحة العضو · الميزان
                </Link>
              )}
              {member && firstRequest && (
                <Link href={`/member/${member.id}/requests/${firstRequest.id}`} className="inline-flex h-12 items-center justify-center px-4 text-[13px] font-bold text-paper no-underline hover:bg-ink-2" style={{ border: "1.5px solid var(--smq-paper)" }}>
                  أول طلب في حيّك ينتظر رداً
                </Link>
              )}
            </div>
          </section>
        )}

        {view === "rejected" && (
          <section className="flex flex-col gap-4 bg-paper px-4 py-4 border-interactive md:px-6 md:py-5" aria-label="مرفوض">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[16px] font-extrabold">{a.officeName}</span>
              <AlliancePill tone="outline" className="text-[11px]">
                مرفوض
              </AlliancePill>
            </div>
            <Steps view="rejected" />
            <div className="flex flex-col gap-1.5 px-3.5 py-3 text-[12px] leading-relaxed border-error">
              <span className="flex items-center gap-1.5 font-extrabold">
                <PointDot size={10} /> السبب
              </span>
              <span>{rejection}</span>
            </div>
            <Rows
              rows={[
                { k: "رقم الطلب", v: <span dir="ltr">{a.id}</span> },
                { k: "القرار", v: `${decisionOn ? fmtDate(decisionOn) : "—"} · فريق التحالف` },
                { k: "يمكن إعادة التقديم", v: "نعم، فوراً" },
              ]}
            />
            <div className="grid grid-cols-[1.2fr_1fr] gap-2.5">
              <Link href="/alliance/apply" className="inline-flex h-12 items-center justify-center bg-ink px-3 text-[13px] font-extrabold text-paper no-underline cut-s hover:bg-ink-2">
                صحّح وأعد الإرسال
              </Link>
              <a href={waLink(a.id)} target="_blank" rel="noopener" className="inline-flex h-12 items-center justify-center px-3 text-[13px] font-bold text-ink no-underline hover:bg-sand" style={{ border: "1.5px solid var(--smq-ink)" }}>
                واتساب
              </a>
            </div>
          </section>
        )}
      </div>
    </ApplyShell>
  );
}
