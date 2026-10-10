"use client";
// /admin/alliance/applications?id=ALL-2026-0038 (Admin-AllianceApplications-D). The list of membership applications
// (pending first, then rejected and the Google-form imports) and the review of the selected one. The licence check
// is manual: no approval without a check date. «اعتمد كعضو موثّق» verifies the applicant in memory (store
// setApplication + toast); the applicant is مكتب م, so no duplicate of member مكتب أ is created. Missing data and
// rejection take a reason from the settings' list.
import { useMemo, useState } from "react";
import { AdminButton, AdminField, AdminSelect } from "@/components/admin";
import { allianceSettings } from "@/data/settings";
import { applicationById, APPLICATION_LIST_LABELS, APPLICATION_STATUS_LABELS, applications, importedApplications } from "@/data/applications";
import { districtAr, SECTORS } from "@/data/districts";
import { HOURS_LABELS } from "@/data/offices";
import type { Application, ApplicationStatus } from "@/data/types";
import { setQuery, useQuery } from "@/lib/location";
import { usePatch, useStore } from "@/lib/store";
import { cx, fmtDate } from "@/lib/format";
import { useRoomActions } from "./actions";
import { AllianceTabs, G9Shell, RoomTitle } from "./shell";
import { agoLong, cnt } from "./util";

type Filter = "new" | "missing" | "imported";
type Check = { checked?: boolean; date?: string; expiry?: string; name?: string };

const roleShort = (r: string) => r.replace(" العقاري", "");
const offersWord = (n: number) => cnt(n, "عرض", "عروض", "عرضاً");

function rowLine(a: Application, st: ApplicationStatus): string {
  if (st === "imported") return "مستورد · لا تاريخ تحقق · لا موافقة ميثاق";
  if (st === "rejected") return `${a.id} · مرفوض ${a.verification?.date ? fmtDate(a.verification.date) : ""} · ${(a.rejectReason ?? "").split(".")[0]}`;
  return [a.id, agoLong(a.submittedAt), roleShort(a.applicantRole), cnt(a.districts.length, "حي", "أحياء", "حياً"), offersWord(a.offersDirect + a.offersBrokered)].join(" · ");
}

function StatusTag({ st, list }: { st: ApplicationStatus; list?: boolean }) {
  const word = list ? APPLICATION_LIST_LABELS[st] : APPLICATION_STATUS_LABELS[st];
  return (
    <span
      className={cx(
        "shrink-0 whitespace-nowrap px-2 py-1 text-[11px] font-extrabold",
        st === "review" && "border-[1.5px] border-gold text-gold-text",
        st === "missing" && "border-interactive text-ink",
        st === "verified" && "bg-gold text-ink",
        st === "rejected" && "border-[1.5px] border-muted text-muted",
        st === "imported" && "border-hairline text-muted",
      )}
    >
      {word}
    </span>
  );
}

function DistrictHex({ slug, dark }: { slug: string; dark: boolean }) {
  return (
    <span className={cx("hex-flat relative flex h-[38px] w-[44px] shrink-0 items-center justify-center", dark ? "bg-ink" : "bg-line")}>
      <span className={cx("hex-flat absolute flex items-center justify-center px-1 text-center text-[9px] font-extrabold leading-tight", dark ? "inset-0 text-paper" : "inset-[1.5px] bg-paper text-ink")}>{districtAr(slug)}</span>
    </span>
  );
}

function Row({ k, v, strong = true }: { k: string; v: React.ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-[13px] last:border-b-0">
      <span className="shrink-0 text-muted">{k}</span>
      <span className={cx("max-w-[62%] text-end", strong ? "font-extrabold" : "font-semibold leading-relaxed")}>{v}</span>
    </div>
  );
}

/** The office's pin on a schematic block (no map library): grid lines and the gold hexagon, link to Google Maps. */
function MiniMap({ href }: { href?: string }) {
  return (
    <div className="relative h-[120px] overflow-hidden border-interactive bg-slot">
      <svg aria-hidden className="absolute inset-0 h-full w-full text-line" preserveAspectRatio="none">
        <defs>
          <pattern id="app-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#app-grid)" />
      </svg>
      <span aria-hidden className="hex-flat absolute start-1/2 top-1/2 h-[20px] w-[22px] -translate-x-1/2 -translate-y-1/2 bg-gold" />
      {href && (
        <a href={href} target="_blank" rel="noreferrer" className="absolute bottom-2 end-2 bg-paper px-2 py-1 text-[10px] font-bold text-gold-text no-underline hover:text-ink">
          افتح في خرائط قوقل
        </a>
      )}
    </div>
  );
}

export function ApplicationsPage() {
  const q = useQuery();
  const ov = useStore((s) => s.applications);
  const patch = useStore((s) => s.patch);
  const setApplication = useStore((s) => s.setApplication);
  const { approveApplication, toast } = useRoomActions();
  const [filter, setFilter] = useState<Filter | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);

  const st = (a: Application): ApplicationStatus => ov[a.id] ?? a.status;
  const pending = applications.filter((a) => ["review", "missing"].includes(st(a)));
  const counts = { new: pending.length, missing: applications.filter((a) => st(a) === "missing").length, imported: importedApplications.filter((a) => st(a) === "imported").length };
  const list = useMemo(() => {
    if (filter === "missing") return applications.filter((a) => (ov[a.id] ?? a.status) === "missing");
    if (filter === "imported") return importedApplications;
    const rank = (a: Application) => ({ review: 0, missing: 0, verified: 1, rejected: 2, imported: 3 })[ov[a.id] ?? a.status];
    return [...applications].sort((a, b) => rank(a) - rank(b)).concat(importedApplications.slice(0, 1));
  }, [filter, ov]);

  const selectedId = q.get("id") ?? pending[0]?.id ?? applications[0].id;
  const a = applicationById(selectedId) ?? applications[0];
  const status = st(a);
  const check = usePatch<Check>("application-check", a.id);
  const ver = { checked: check?.checked ?? !!a.verification?.date, date: check?.date ?? (a.verification?.date ? fmtDate(a.verification.date) : ""), expiry: check?.expiry ?? (a.verification?.expiry ? fmtDate(a.verification.expiry) : ""), name: check?.name ?? a.verification?.nameAtRega ?? "" };
  const canApprove = ver.checked && !!ver.date.trim() && (status === "review" || status === "missing" || status === "imported");
  const setCheck = (c: Check) => patch("application-check", a.id, c);
  const needReason = () => {
    if (reason) return true;
    setReasonError(true);
    return false;
  };

  const chip = (f: Filter, label: string, n: number, tone: string) => (
    <button
      type="button"
      aria-pressed={filter === f || (f === "new" && filter === null)}
      onClick={() => setFilter(f === "new" ? null : filter === f ? null : f)}
      className={cx("min-h-8 px-2 text-[11px] font-extrabold", filter === f || (f === "new" && filter === null) ? "bg-ink text-paper" : tone)}
    >
      {`${label} ${n}`}
    </button>
  );

  return (
    <G9Shell
      title={<RoomTitle section="طلبات الانضمام" />}
      subtitle="التحقق من رخصة فال يدوي في موقع الهيئة؛ لا موافقة بلا تاريخ تحقق. المحرر يراجع ويطلب نواقص، والمدير يعتمد أو يرفض"
      user={{ name: "نورة", role: "محررة", initial: "ن" }}
    >
      <AllianceTabs active="applications" />

      {counts.imported > 0 && (
        <div className="flex flex-wrap items-center gap-4 border-error px-5 py-4 text-[13px] leading-relaxed">
          <span aria-hidden className="hex-point size-2.5 shrink-0 bg-gold" />
          <span className="min-w-0 flex-1">
            <strong className="font-extrabold">{`استيراد ${cnt(counts.imported, "مكتب", "مكاتب", "مكتباً")} من نموذج قوقل، بانتظار التحقق.`}</strong>{" "}
            أُدرجت كطلبات بحالة «مستورد»، بلا تاريخ تحقق ولا موافقة على الميثاق. تحتاج كل منها تحقق رخصة ورسالة موافقة على الميثاق قبل أن تصبح عضواً.
          </span>
          <AdminButton variant="outline" size="md" onClick={() => setFilter("imported")}>
            {`اعرض الـ${counts.imported}`}
          </AdminButton>
          <AdminButton variant="ink" size="md" onClick={() => toast(`أُرسلت رسالة الميثاق لـ${cnt(counts.imported, "مكتب", "مكاتب", "مكتباً")} · نسخة ${allianceSettings.charter.version}`)}>
            أرسل رسالة الميثاق للجميع
          </AdminButton>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section className="flex min-w-0 flex-col border-interactive bg-paper" aria-labelledby="apps-list">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-ink bg-sand px-4 py-3">
            <h2 id="apps-list" className="text-[16px] font-extrabold">
              الطلبات
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {chip("new", "جديدة", counts.new, "")}
              {chip("missing", "نواقص", counts.missing, "border-interactive text-ink")}
              {chip("imported", "مستوردة", counts.imported, "border-hairline text-muted")}
            </div>
          </header>
          <ul className={cx("flex flex-col", filter === "imported" && "max-h-[640px] overflow-y-auto")}>
            {list.map((x) => {
              const s = st(x);
              const on = x.id === a.id;
              const quiet = s === "rejected" || s === "imported";
              return (
                <li key={x.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    aria-current={on ? "true" : undefined}
                    onClick={() => setQuery({ id: x.id }, "replace")}
                    className={cx("relative flex w-full items-center gap-3 px-4 py-4 text-start motion-hover", on ? "bg-sand" : "hover:bg-cream")}
                  >
                    {on && <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-gold" />}
                    <DistrictHex slug={x.districtSlug} dark={!quiet} />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <strong className="text-[14px] font-extrabold text-ink">{x.officeName}</strong>
                      <small className={cx("line-clamp-2 text-[11px] leading-relaxed", quiet ? "text-muted" : "text-muted")}>{rowLine(x, s)}</small>
                    </span>
                    <StatusTag st={s} list />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="flex min-w-0 flex-col border-interactive bg-paper" aria-labelledby="app-review">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-ink bg-sand px-4 py-3">
            <h2 id="app-review" className="text-[16px] font-extrabold">{`مراجعة ${a.id} · ${a.officeName}`}</h2>
            <StatusTag st={status} />
          </header>
          <div className="grid gap-6 p-4 md:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[12px] font-extrabold">المكتب ومقدم الطلب</span>
              <div className="flex flex-col">
                <Row k="اسم المكتب" v={a.officeName} />
                <Row k="رقم رخصة فال" v={<span dir="ltr">{a.licence}</span>} />
                <Row k="مقدم الطلب" v={[a.applicantName, a.applicantRole].filter(Boolean).join(" · ")} />
                <Row k="رقم التواصل" v={<span dir="ltr">{a.phoneMasked}</span>} />
                <Row k="حي المكتب" v={districtAr(a.districtSlug)} />
                <Row k="طريقة الدوام" v={HOURS_LABELS[a.hours]} />
              </div>
              <MiniMap href={a.mapsLink} />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <span className="text-[12px] font-extrabold">التغطية والتخصص</span>
              <div className="flex flex-wrap gap-1.5 text-[12px] font-bold">
                {a.sectors.map((s) => (
                  <span key={s} className="bg-ink px-2 py-1 text-paper">
                    {SECTORS[s].ar}
                  </span>
                ))}
                {a.districts.map((d) => (
                  <span key={d} className="bg-sand px-2 py-1">
                    {districtAr(d)}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 text-[12px] font-bold">
                {a.specialties.map((s) => (
                  <span key={s} className="bg-sand px-2 py-1">
                    {s}
                  </span>
                ))}
              </div>
              <span className="mt-2 text-[12px] font-extrabold">ما عندهم وما يحتاجون</span>
              <div className="flex flex-col">
                <Row k="عروض من الملاك · بعقود موثقة" v={`${a.offersDirect} · ${a.offersBrokered} · الإجمالي ${a.offersDirect + a.offersBrokered}`} />
                <Row k="طلبات في أحياء أخرى" v={a.requestsElsewhere.length ? a.requestsElsewhere.map(districtAr).join("، ") : "لا"} />
                <Row k="يريدون" v={a.wantSummary ?? a.want} strong={false} />
                <Row k="سيضيفون" v={a.addSummary ?? a.add} strong={false} />
              </div>
              <div className="flex flex-wrap gap-2 text-[12px] font-bold">
                <span className="bg-sand px-2 py-1">{`موافقة الميثاق: ${a.charterConsent ? "نعم" : "لا"}${a.charterVersion ? ` · ${a.charterVersion}` : ""}`}</span>
                <span className="bg-sand px-2 py-1">{`الظهور في الدليل: ${a.directoryConsent ? "نعم" : "لا"}`}</span>
              </div>
            </div>
          </div>

          <div className="relative mx-4 mb-4 flex flex-col gap-3 border-interactive bg-cream p-4">
            <span aria-hidden className="absolute inset-y-0 start-0 w-1 bg-gold" />
            <label className="flex min-h-11 items-center gap-3 text-[14px] font-extrabold">
              <input type="checkbox" className="size-5 accent-ink" checked={ver.checked} onChange={(e) => setCheck({ checked: e.target.checked })} />
              تم التحقق من الرخصة في موقع الهيئة
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              <AdminField label="تاريخ التحقق" ltr value={ver.date} onChange={(e) => setCheck({ date: e.target.value })} error={ver.checked && !ver.date.trim() ? "لا موافقة بلا تاريخ تحقق" : undefined} />
              <AdminField label="انتهاء الرخصة" ltr value={ver.expiry} onChange={(e) => setCheck({ expiry: e.target.value })} />
              <AdminField label="اسم المكتب في الهيئة" value={ver.name} onChange={(e) => setCheck({ name: e.target.value })} />
            </div>
            <span className="text-[11px] leading-relaxed text-muted">تحقق يدوي: افتح موقع الهيئة، ابحث بالرقم، وطابق الاسم. يُسجَّل اسم من تحقق وتاريخه، ويُذكَّر المدير قبل انتهاء الرخصة بـ 30 يوماً.</span>
          </div>

          <div className="flex flex-col gap-3 border-t-[1.5px] border-ink p-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <AdminButton variant="gold" size="lg" disabled={!canApprove} onClick={() => approveApplication(a.id)}>
                {status === "verified" ? APPLICATION_STATUS_LABELS.verified : "اعتمد كعضو موثّق"}
              </AdminButton>
              <AdminButton
                variant="outline"
                size="lg"
                disabled={status === "verified" || status === "rejected"}
                onClick={() => {
                  if (!needReason()) return;
                  setApplication(a.id, "missing");
                  toast(`طُلبت معلومات إضافية من ${a.officeName} · ${reason}`);
                }}
              >
                اطلب معلومات إضافية
              </AdminButton>
              <AdminButton
                variant="outline"
                size="lg"
                disabled={status === "verified" || status === "rejected"}
                onClick={() => {
                  if (!needReason()) return;
                  setApplication(a.id, "rejected");
                  toast(`رُفض طلب ${a.officeName} · ${reason}`);
                }}
              >
                ارفض مع السبب
              </AdminButton>
            </div>
            <span className="text-[11px] text-muted">الاعتماد يرسل واتساب برابط صفحة العضو ويضيفه للرادار فوراً</span>
            <AdminSelect
              label="سبب الرفض أو النواقص (يُرسل للمكتب كما هو)"
              value={reason}
              error={reasonError && !reason ? "اختر سبباً من القائمة…" : undefined}
              onChange={(e) => {
                setReason(e.target.value);
                setReasonError(false);
              }}
            >
              <option value="">اختر سبباً من القائمة…</option>
              {allianceSettings.rejectReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </AdminSelect>
          </div>
        </section>
      </div>
    </G9Shell>
  );
}
