"use client";
// /admin/approvals/[id] (Admin-Approvals-D). The queue strip, the submission as the owner entered it, the admin
// fields that will be published (per-m² and yield recomputed from the published price), the role checklist (tabs
// مالك / وكيل / مسوّق switch it; «اعتماد ونشر» enables when it is complete), the decision panel and the request log.
// Decisions write to the store (setApproval, a log patch, the created unit) and fire a toast; owner messages go in the
// mode the presenter «WhatsApp Business» switch selects (connected = sent automatically, manual = ready to send).
import { useId, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AdminButton, Panel, PeriodToggle } from "@/components/admin";
import { Price } from "@/components/ui";
import { APPROVAL_REJECT_OPTIONS, APPROVAL_STATUS_LABELS, approvalById, approvals as openFixture, ROLE_LABELS, ROLE_NOTES } from "@/data/approvals";
import { districtAr } from "@/data/districts";
import { publicProjects } from "@/data/projects";
import { fillTemplate, WA_TEMPLATES } from "@/data/settings";
import { approvalCounts, effectiveApprovalStatus, NOW, ownerFormComputed, whenLabel } from "@/data/selectors";
import type { Approval, ApprovalRole, ApprovalStatus } from "@/data/types";
import { usePresenter } from "@/lib/presenter";
import { usePatch, useStore } from "@/lib/store";
import { cx, fmtNum, waLink } from "@/lib/format";
import { G7Shell } from "./shell";
import { approvalAge, approvalTitle, photosWord, sinceHours } from "./util";

type LogEntry = Approval["log"][number] & { created?: boolean; sent?: boolean };
const ROLES: ApprovalRole[] = ["owner", "agent", "marketer"];
const ROLE_ONLY: Record<ApprovalRole, string> = { owner: "خاص بالمالك", agent: "خاص بالوكيل", marketer: "خاص بالمسوّق" };
const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const FEATURE_LABELS: [keyof NonNullable<Approval["publishFeatures"]>, string][] = [
  ["maid", "غرفة خادمة"],
  ["driver", "غرفة سائق"],
  ["balcony", "بلكونة"],
  ["smartHome", "سمارت هوم"],
  ["parking", "موقف"],
];

/** «الخميس 8 أكتوبر، 21:14» in Jeddah time (UTC+3, no daylight saving). */
function arrivedLabel(iso: string): string {
  const d = new Date(Date.parse(iso) + 3 * 3600_000);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}، ${d.getUTCHours()}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}
/** «بقي بند واحد» · «بقي بندان» · «بقيت 3 بنود» */
function remainingWords(n: number): string {
  if (n === 1) return "بقي بند واحد في التحقق";
  if (n === 2) return "بقي بندان في التحقق";
  if (n <= 10) return `بقيت ${n} بنود في التحقق`;
  return `بقي ${n} بنداً في التحقق`;
}
/** «14 طلباً مغلقاً» */
function closedWords(n: number): string {
  if (n === 1) return "طلب واحد مغلق";
  if (n === 2) return "طلبان مغلقان";
  if (n <= 10) return `${n} طلبات مغلقة`;
  return `${n} طلباً مغلقاً`;
}
const STATUS_HEAD: Record<ApprovalStatus, string> = { new: "بانتظار المراجعة", "awaiting-photos": APPROVAL_STATUS_LABELS["awaiting-photos"], approved: APPROVAL_STATUS_LABELS.approved, rejected: APPROVAL_STATUS_LABELS.rejected };

function Id({ children }: { children: ReactNode }) {
  return (
    <span dir="ltr" className="tnum">
      {children}
    </span>
  );
}

export function ApprovalPage({ id }: { id: string }) {
  const a = approvalById(id)!;
  const { state } = usePresenter();
  const wa = state.wa;
  const approvalsOv = useStore((s) => s.approvals);
  const setApproval = useStore((s) => s.setApproval);
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const created = usePatch<{ entries: LogEntry[] }>("approvalLog", a.id)?.entries ?? [];
  const status = effectiveApprovalStatus(a, approvalsOv);
  const closed = status === "approved" || status === "rejected";
  const uid = useId();

  const [role, setRole] = useState<ApprovalRole>(a.role);
  const [checks, setChecks] = useState<Record<ApprovalRole, boolean[]>>(() => ({
    owner: a.checklist.owner.map((i) => i.done),
    agent: a.checklist.agent.map((i) => i.done),
    marketer: a.checklist.marketer.map((i) => i.done),
  }));
  const remaining = checks[role].filter((d) => !d).length;

  const [projectId, setProjectId] = useState(a.projectId ?? "ind");
  const [code, setCode] = useState(a.modelCode ?? "");
  const [price, setPrice] = useState(fmtNum(a.askedPriceSar));
  const priceNum = parseInt(price.replace(/[^\d]/g, ""), 10) || 0;
  const comp = ownerFormComputed({ askedPriceSar: priceNum, buildM2: a.buildM2, landM2: a.landM2, areaM2: a.areaM2, incomeYearSar: a.incomeYearSar });
  const [publishAs, setPublishAs] = useState<"available" | "reserved">("available");
  const [features, setFeatures] = useState(a.publishFeatures ?? { maid: false, driver: false, balcony: false, smartHome: false, parking: false });
  const [description, setDescription] = useState(a.publishedDescription ?? "");
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);
  const [teamFiles, setTeamFiles] = useState<string[]>([]);

  const queue = useMemo(() => {
    const open = openFixture.filter((x) => x.id === a.id || ["new", "awaiting-photos"].includes(effectiveApprovalStatus(x, approvalsOv)));
    return open.sort((x, y) => (x.id < y.id ? 1 : -1));
  }, [a.id, approvalsOv]);
  const counts = approvalCounts(approvalsOv);

  function addLog(entries: LogEntry[]) {
    patch("approvalLog", a.id, { entries: [...entries.map((e) => ({ ...e, created: true })), ...created] });
  }
  function message(text: string): LogEntry {
    return { by: "النظام", text: `رسالة للمالك: «${text}»`, at: NOW, mode: wa === "manual" ? "manual" : "auto", created: true };
  }
  function needReason(): boolean {
    if (reason) return false;
    setReasonError(true);
    document.getElementById(`${uid}-reason`)?.focus();
    return true;
  }
  const unitCode = code.trim() || a.id;
  function approve() {
    setApproval(a.id, "approved");
    patch("approvalUnit", a.id, { code: unitCode, titleAr: approvalTitle(a), priceSar: priceNum, status: publishAs, projectId, at: NOW });
    const msg = fillTemplate(WA_TEMPLATES.find((t) => t.id === "owner-approved")!.text, { request_no: a.id, unit_url: `smqre.com/units/${unitCode.toLowerCase()}`, price: fmtNum(priceNum) });
    addLog([message(msg), { by: "سعود", text: `اعتمد الطلب ونشر الوحدة ${unitCode}`, at: NOW }]);
    toast(`اعتُمد الطلب ${a.id} · نُشرت الوحدة ${unitCode} بحالة «${publishAs === "available" ? "متاح" : "محجوز"}»`, { action: { label: "الوحدات", href: "/admin/units" } });
  }
  function reject() {
    if (needReason()) return;
    setApproval(a.id, "rejected");
    const msg = fillTemplate(WA_TEMPLATES.find((t) => t.id === "owner-rejected")!.text, { request_no: a.id, reason });
    addLog([message(msg), { by: "سعود", text: `رفض الطلب · ${reason}`, at: NOW }]);
    toast(`رُفض الطلب ${a.id} · ${reason}`);
  }
  function requestEdit() {
    if (needReason()) return;
    const msg = fillTemplate(WA_TEMPLATES.find((t) => t.id === "owner-rejected")!.text, { request_no: a.id, reason });
    addLog([message(msg), { by: "سعود", text: `طلب تعديلاً من المالك · ${reason}`, at: NOW }]);
    toast(`طلب تعديل من المالك · ${a.id}`);
  }
  function requestPhotos() {
    setApproval(a.id, "awaiting-photos");
    addLog([{ by: "سعود", text: "طُلبت صور إضافية من المالك · تذكير تلقائي بعد 48 ساعة", at: NOW, mode: wa === "manual" ? "manual" : "auto" }]);
    toast("طُلبت صور إضافية من المالك");
  }
  function markSent(entry: LogEntry) {
    patch("approvalLog", a.id, { entries: created.map((e) => (e === entry ? { ...e, sent: true } : e)) });
  }

  const log: LogEntry[] = [...created, ...a.log];
  const district = districtAr(a.districtSlug);
  const via = a.sourceAr?.split(" · ")[0];

  return (
    <G7Shell active="approvals">
      <nav aria-label="المسار" className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
        <Link href="/admin/approvals" className="font-bold text-gold-text hover:text-ink hover:underline">
          طلبات الموافقة
        </Link>
        <span aria-hidden>/</span>
        <span aria-current="page" className="font-bold text-ink">
          طلب <Id>{a.id}</Id>
        </span>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        {queue.map((x) => {
          const active = x.id === a.id;
          const st = effectiveApprovalStatus(x, approvalsOv);
          return (
            <Link
              key={x.id}
              href={`/admin/approvals/${x.id}`}
              aria-current={active ? "page" : undefined}
              className={cx("flex w-[220px] flex-col gap-1 px-3.5 py-2.5", active ? "cut-s bg-ink text-paper" : "border-interactive bg-paper text-ink hover:bg-sand")}
            >
              <span className="truncate text-label">{approvalTitle(x)}</span>
              <span className={cx("text-caption tnum", active ? "text-on-ink-muted" : "text-muted")}>
                <Price value={x.askedPriceSar} sign={false} /> · {st === "awaiting-photos" ? APPROVAL_STATUS_LABELS["awaiting-photos"] : sinceHours(approvalAge(x))}
              </span>
            </Link>
          );
        })}
        <span className="text-[12px] text-muted">
          + {closedWords(counts.closed)} هذا الشهر: {counts.approved} منشورة، {counts.rejected} مرفوضة، {counts.withdrawn} منسحبة
        </span>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="flex min-w-0 flex-col border-interactive bg-paper" aria-labelledby={`${uid}-h`}>
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-5">
            <div className="flex min-w-0 flex-col gap-2">
              <h1 id={`${uid}-h`} className="text-[24px] font-extrabold leading-snug">
                {approvalTitle(a)} · <Price value={a.askedPriceSar} sign={false} />
              </h1>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[12px] text-muted">
                <span>
                  طلب رقم <Id>{a.id}</Id> · وصل {arrivedLabel(a.submittedAt)}
                  {via ? ` · من ال${via}` : ""}
                </span>
                <span className="border-interactive px-2 py-0.5 text-caption font-extrabold text-ink">صفة مقدم العرض: {ROLE_LABELS[a.role]}</span>
                <span className="text-caption font-bold text-gold-text">التواصل {a.timing}</span>
              </p>
            </div>
            <span className={cx("whitespace-nowrap px-2.5 py-2 text-[12px] font-extrabold", status === "new" ? "bg-gold text-ink" : status === "approved" ? "bg-ink text-paper" : status === "rejected" ? "border-hairline text-muted" : "border-interactive text-ink")}>
              {STATUS_HEAD[status]}
            </span>
          </header>

          <Photos a={a} teamFiles={teamFiles} onTeamFiles={(names) => { setTeamFiles((f) => [...f, ...names]); toast(`أُضيفت ${photosWord(names.length)} من الفريق`); }} onRequestPhotos={requestPhotos} disabled={closed} />

          <div className="grid gap-x-8 gap-y-6 border-b border-line px-5 py-5 [grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr))]">
            <OwnerColumn a={a} district={district} />
            <div className="flex min-w-0 flex-col">
              <h2 className="mb-2 text-[12px] font-extrabold text-gold-text">ما سيُنشر · حقول الإدارة</h2>
              <AdminRow label="المشروع" htmlFor={`${uid}-project`}>
                <select id={`${uid}-project`} value={projectId} onChange={(e) => setProjectId(e.target.value)} className={CONTROL}>
                  <option value="ind">بلا مشروع · عقار فردي</option>
                  {publicProjects().map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameAr}
                    </option>
                  ))}
                </select>
              </AdminRow>
              <AdminRow label="كود النموذج" htmlFor={`${uid}-code`}>
                <input id={`${uid}-code`} dir="ltr" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={cx(CONTROL, "text-right")} />
              </AdminRow>
              <AdminRow label="السعر المنشور" htmlFor={`${uid}-price`}>
                <input
                  id={`${uid}-price`}
                  inputMode="numeric"
                  dir="ltr"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onBlur={() => setPrice(priceNum ? fmtNum(priceNum) : "")}
                  className={cx(CONTROL, "text-right text-label font-extrabold")}
                />
              </AdminRow>
              <AdminRow label="سعر المتر (يُحسب)">
                <span className="text-[12px] font-extrabold text-ink tnum" aria-live="polite">
                  {a.kind === "building" ? `${fmtNum(comp.ppmBuild ?? 0)} على البناء · ${fmtNum(comp.ppmLand ?? 0)} على الأرض` : fmtNum(comp.ppm ?? 0)}
                </span>
              </AdminRow>
              {comp.yieldPct !== null && (
                <AdminRow label="العائد السنوي الإجمالي (يُحسب)">
                  <span className="flex items-center gap-2 text-[12px] font-extrabold text-ink tnum" aria-live="polite">
                    <span aria-hidden className="size-2.5 bg-gold hex-flat" />
                    {comp.yieldPct}% · {fmtNum(a.incomeYearSar ?? 0)} ÷ {fmtNum(priceNum)}
                  </span>
                </AdminRow>
              )}
              <AdminRow label="الحالة عند النشر" htmlFor={`${uid}-st`}>
                <select id={`${uid}-st`} value={publishAs} onChange={(e) => setPublishAs(e.target.value as "available" | "reserved")} className={CONTROL}>
                  <option value="available">متاح</option>
                  <option value="reserved">محجوز</option>
                </select>
              </AdminRow>
              <AdminRow label="الاتجاه · ارتفاع السقف">
                <span className="flex gap-2">
                  <input aria-label="الاتجاه" placeholder="الاتجاه" className={cx(SMALL, "w-[104px]")} />
                  <input aria-label="ارتفاع السقف بالمتر" placeholder="م" inputMode="decimal" className={cx(SMALL, "w-[88px]")} />
                </span>
              </AdminRow>
              <div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-line py-3">
                {FEATURE_LABELS.map(([k, label]) => (
                  <label key={k} className="flex min-h-8 items-center gap-2 text-[12px] font-semibold">
                    <input type="checkbox" checked={features[k]} onChange={(e) => setFeatures((f) => ({ ...f, [k]: e.target.checked }))} className="size-4 accent-ink" />
                    {label}
                  </label>
                ))}
              </div>
              <label className="flex flex-col gap-2 pt-3 text-[12px] text-muted">
                الوصف المنشور (يُحرره المدير)
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="border-interactive bg-paper px-3 py-2 text-[12px] leading-relaxed text-ink" />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[12px] font-extrabold">قائمة التحقق قبل النشر · تتغيّر مع صفة مقدم العرض</h2>
              <PeriodToggle label="الصفة" size="sm" options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))} value={role} onChange={(v) => setRole(v as ApprovalRole)} />
            </div>
            <ul className="flex flex-col">
              {a.checklist[role].map((item, i) => (
                <li key={`${role}-${i}`}>
                  <label className="flex min-h-10 items-center gap-3 text-label font-normal">
                    <input
                      type="checkbox"
                      checked={checks[role][i] ?? false}
                      disabled={closed}
                      onChange={(e) => setChecks((c) => ({ ...c, [role]: c[role].map((d, j) => (j === i ? e.target.checked : d)) }))}
                      className="size-[18px] shrink-0 accent-ink"
                    />
                    <span>
                      {item.label}
                      {item.roleOnly && <span className="ms-3 text-caption font-bold text-gold-text">{ROLE_ONLY[role]}</span>}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="grid gap-2 text-caption text-muted md:grid-cols-3">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  aria-pressed={role === r}
                  className={cx("px-3 py-2.5 text-start leading-relaxed", role === r ? "border-interactive bg-sand" : "border-hairline bg-cream")}
                >
                  <strong className="text-ink">{ROLE_LABELS[r]}:</strong> {ROLE_NOTES[r]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <section className="flex flex-col gap-2 border-interactive bg-paper p-5" aria-label="مقدم العرض">
            <span className="text-[12px] font-extrabold">مقدم العرض · {ROLE_LABELS[a.role]}</span>
            <span className="text-[16px] font-extrabold">{a.submitterName}</span>
            <span dir="ltr" className="text-end text-label font-normal tnum">
              {a.phoneMasked}
            </span>
            {a.priorRequestsAr && <span className="text-[12px] text-muted">{a.priorRequestsAr}</span>}
            <div className="mt-2 flex gap-2">
              <a href={waLink(`بخصوص طلبك ${a.id}`)} target="_blank" rel="noreferrer" className="cut-s flex h-10 flex-1 items-center justify-center bg-gold text-[12px] font-extrabold text-ink hover:bg-gold-hover">
                واتساب المالك
              </a>
              <AdminButton variant="outline" size="md" className="h-10 text-[12px]" onClick={() => toast(`${a.submitterName} · ${a.phoneMasked}`, { kind: "info" })}>
                اتصال
              </AdminButton>
            </div>
          </section>

          <section id="decision" className="cut-l flex scroll-mt-24 flex-col gap-3 bg-ink p-5 text-paper" aria-label="القرار">
            <span className="text-[12px] font-extrabold text-gold">القرار</span>
            {status === "approved" ? (
              <p className="border-[1.5px] border-gold px-3 py-3 text-label font-bold">
                اعتُمد ونُشر · {whenLabel(created.find((e) => e.text.startsWith("اعتمد"))?.at ?? NOW)} ·{" "}
                <Link href="/admin/units" className="text-gold underline">
                  الوحدات
                </Link>
              </p>
            ) : status === "rejected" ? (
              <p className="border-[1.5px] border-on-ink-muted px-3 py-3 text-label font-bold">
                {APPROVAL_STATUS_LABELS.rejected} · {a.rejectReason ?? reason}
              </p>
            ) : (
              <>
                <button
                  type="button"
                  disabled={remaining > 0}
                  onClick={approve}
                  className={cx("min-h-12 px-3 text-[14px] font-extrabold motion-hover", remaining > 0 ? "cursor-default bg-ink-2 text-disabled" : "cut-s bg-gold text-ink hover:bg-gold-hover")}
                >
                  اعتماد ونشر{remaining > 0 ? ` · ${remainingWords(remaining)}` : ""}
                </button>
                <button type="button" onClick={requestEdit} className="min-h-11 border-[1.5px] border-paper px-3 text-label font-bold text-paper hover:bg-ink-2">
                  طلب تعديل من المالك
                </button>
                <button type="button" onClick={reject} className="min-h-11 border-[1.5px] border-ink-2 px-3 text-label font-bold text-on-ink-muted hover:border-on-ink-muted">
                  رفض الطلب
                </button>
                <label htmlFor={`${uid}-reason`} className="mt-1 text-caption text-on-ink-muted">
                  سبب الرفض أو التعديل (يصل المالك على واتساب)
                </label>
                <select
                  id={`${uid}-reason`}
                  value={reason}
                  aria-invalid={reasonError || undefined}
                  aria-describedby={reasonError ? `${uid}-reason-err` : undefined}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setReasonError(false);
                  }}
                  className={cx("h-10 bg-paper px-3 text-[12px] font-bold text-ink", reasonError && "border-error")}
                >
                  <option value="">اختر سبباً</option>
                  {APPROVAL_REJECT_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {reasonError && (
                  <span id={`${uid}-reason-err`} role="alert" className="flex items-center gap-2 text-caption font-bold text-gold">
                    <span aria-hidden className="size-2 bg-gold hex-point" />
                    اختر سبباً
                  </span>
                )}
              </>
            )}
            <span className="text-caption leading-relaxed text-on-ink-muted">لا تظهر أي وحدة على الموقع قبل الاعتماد. الاعتماد يُنشئ الوحدة بحالة «متاح» ويرسل رابطها للمالك.</span>
          </section>

          <Panel title={<h2 className="text-[12px] font-extrabold">سجل الطلب</h2>} bodyClassName="px-5 pb-2">
            <ol className="flex flex-col">
              {log.map((e, i) => (
                <LogItem key={`${e.at}-${i}`} e={e} wa={wa} onSent={() => markSent(e)} />
              ))}
            </ol>
          </Panel>
        </aside>
      </div>
    </G7Shell>
  );
}

const SMALL = "h-9 max-w-full border-interactive bg-paper px-2.5 text-[12px] font-bold text-ink";
const CONTROL = `${SMALL} w-[180px]`;

function AdminRow({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[50px] flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-line py-2">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-[12px] text-muted">
          {label}
        </label>
      ) : (
        <span className="text-[12px] text-muted">{label}</span>
      )}
      {children}
    </div>
  );
}

function OwnerRow({ label, children, strong }: { label: string; children: ReactNode; strong?: boolean }) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3 border-b border-line py-2 text-label font-normal">
      <dt className="text-muted">{label}</dt>
      <dd className={cx("text-start tnum", strong ? "text-[15px] font-extrabold" : "font-bold")}>{children}</dd>
    </div>
  );
}

function OwnerColumn({ a, district }: { a: Approval; district: string }) {
  const purpose = a.purpose === "sell" ? "للبيع" : "للإيجار";
  return (
    <div className="flex min-w-0 flex-col">
      <h2 className="mb-2 text-[12px] font-extrabold">كما أدخلها المالك</h2>
      <dl className="flex flex-col">
        <OwnerRow label="النوع · الغرض">
          {a.typeLabelAr} · {purpose}
        </OwnerRow>
        <OwnerRow label="المدينة · الحي">
          {a.city} · {district}
        </OwnerRow>
        {a.kind === "building" ? (
          <>
            <OwnerRow label="الوحدات · الأدوار">
              {a.unitsCount} · {a.floors}
            </OwnerRow>
            <OwnerRow label="الأرض · البناء">
              {fmtNum(a.landM2 ?? 0)} · {fmtNum(a.buildM2 ?? 0)} م²
            </OwnerRow>
          </>
        ) : a.kind === "land" ? (
          <OwnerRow label="المساحة">{fmtNum(a.landM2 ?? 0)} م²</OwnerRow>
        ) : (
          <>
            <OwnerRow label="الغرف · الحمامات">
              {a.beds} · {a.baths}
            </OwnerRow>
            <OwnerRow label={a.floor ? "المساحة · الطابق" : "المساحة"}>
              {fmtNum(a.areaM2 ?? 0)} م²{a.floor ? ` · ${a.floor}` : ""}
            </OwnerRow>
          </>
        )}
        <OwnerRow label="السعر المطلوب" strong>
          <Price value={a.askedPriceSar} sign={false} />
        </OwnerRow>
        {a.kind === "building" ? (
          <>
            <OwnerRow label="يوجد دخل · العمر">
              {a.hasIncome ? "نعم" : "لا"} · {a.ageLabel}
            </OwnerRow>
            {a.hasIncome && (
              <OwnerRow label="الدخل السنوي · المؤجّر" strong>
                <span className="text-label font-extrabold">
                  {fmtNum(a.incomeYearSar ?? 0)} · {a.occupiedUnits} من {a.unitsCount} · {a.contractsLabel}
                </span>
              </OwnerRow>
            )}
          </>
        ) : (
          <>
            {(a.ageLabel || a.occupancy) && <OwnerRow label="العمر · الإشغال">{[a.ageLabel, a.occupancy].filter(Boolean).join(" · ")}</OwnerRow>}
            {a.features?.length ? <OwnerRow label="المزايا">{a.features.join("، ")}</OwnerRow> : null}
            {a.negotiable && <OwnerRow label="قابل للتفاوض">{a.negotiable}</OwnerRow>}
          </>
        )}
      </dl>
      {a.ownerNotes && (
        <div className="flex flex-col gap-2 py-3 text-label font-normal">
          <span className="text-muted">ملاحظات المالك</span>
          <p className="leading-relaxed">{a.ownerNotes}</p>
        </div>
      )}
    </div>
  );
}

function Photos({ a, teamFiles, onTeamFiles, onRequestPhotos, disabled }: { a: Approval; teamFiles: string[]; onTeamFiles: (names: string[]) => void; onRequestPhotos: () => void; disabled: boolean }) {
  const uid = useId();
  const names = a.photos ?? [];
  const cells = Math.max(1, a.photosCount);
  return (
    <div className="flex flex-col gap-3 border-b border-line px-5 py-5">
      <span className="text-[12px] font-bold text-muted">صور المالك · {a.photosCount} · اضغط للتكبير، اسحب لإعادة الترتيب، الأولى هي الغلاف</span>
      <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr]">
        <div className="relative h-[220px] bg-slot" role="img" aria-label={`صورة الغلاف${names[0] ? ` · ${names[0]}` : ""}`}>
          {names[0] && <span className="absolute start-2 top-2 bg-paper px-1.5 py-0.5 text-caption">{names[0]}</span>}
          <span className="absolute bottom-2 end-2 bg-gold px-1.5 py-0.5 text-caption font-bold text-ink">الغلاف</span>
        </div>
        <div className="grid grid-rows-2 gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="relative min-h-[100px] bg-slot" role="img" aria-label={i < cells ? `صورة ${i + 1}${names[i] ? ` · ${names[i]}` : ""}` : "لا صورة"} />
          ))}
        </div>
        <div className="grid grid-rows-2 gap-2">
          <label htmlFor={`${uid}-team`} className={cx("flex min-h-[100px] cursor-pointer items-center justify-center border-[1.5px] border-dashed border-ink bg-cream px-3 text-center text-[12px] font-bold hover:bg-sand", disabled && "pointer-events-none opacity-50")}>
            + رفع صور الفريق
            <input
              id={`${uid}-team`}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              className="sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length) onTeamFiles(files.map((f) => `${f.name} · ${(f.size / 1048576).toFixed(1)} MB`));
                e.target.value = "";
              }}
            />
          </label>
          <button type="button" disabled={disabled || a.status === "awaiting-photos"} onClick={onRequestPhotos} className="min-h-[100px] border-interactive bg-paper px-3 text-[12px] font-bold hover:bg-sand disabled:border-line disabled:text-disabled">
            طلب صور إضافية من المالك
          </button>
        </div>
      </div>
      {teamFiles.length > 0 && (
        <ul className="flex flex-wrap gap-2 text-caption text-muted">
          {teamFiles.map((f, i) => (
            <li key={`${f}-${i}`} className="border-hairline bg-cream px-2 py-1">
              {f}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LogItem({ e, wa, onSent }: { e: LogEntry; wa: "connected" | "manual"; onSent: () => void }) {
  const isMessage = e.by === "النظام" && !!e.mode;
  const mode = isMessage ? (e.created ? e.mode : wa === "manual" ? "manual" : "auto") : e.mode;
  const pending = isMessage && mode === "manual" && !e.sent;
  const marker = pending ? "border-interactive bg-paper" : e.by === "النظام" || e.by === "المالك" ? "bg-ink" : "bg-gold";
  const msg = e.text.match(/«(.+)»/)?.[1] ?? e.text;
  const ownerSource = e.by === "المالك" ? e.noteAr : undefined;
  return (
    <li className="flex gap-3 border-b border-line py-3.5 text-[12px] leading-relaxed last:border-b-0">
      <span aria-hidden className={cx("mt-1.5 size-2.5 shrink-0 hex-point", marker)} />
      <span className="flex min-w-0 flex-col gap-1">
        {pending ? (
          <>
            <span>الوضع اليدوي (واتساب بزنس غير متصل): الرسالة جاهزة ولم تُرسل بعد</span>
            <a
              href={waLink(msg)}
              target="_blank"
              rel="noreferrer"
              onClick={() => e.created && onSent()}
              className="self-start bg-gold px-3 py-1.5 text-[12px] font-extrabold text-ink hover:bg-gold-hover"
            >
              أرسل على واتساب
            </a>
          </>
        ) : (
          <span>
            {e.by !== "النظام" && e.by !== "المالك" && <strong>{e.by} </strong>}
            {e.text}
            {isMessage && (
              <>
                {" · "}
                {mode === "manual" ? (
                  <strong className="text-gold-text">أُرسلت يدوياً</strong>
                ) : (
                  <>
                    <strong className="text-gold-text">أُرسلت تلقائياً</strong> (واتساب بزنس متصل)
                  </>
                )}
              </>
            )}
          </span>
        )}
        <span className="text-muted">
          {whenLabel(e.at)}
          {ownerSource ? ` · ${ownerSource}` : ""}
        </span>
      </span>
    </li>
  );
}
