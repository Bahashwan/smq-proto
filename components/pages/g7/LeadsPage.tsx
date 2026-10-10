"use client";
// /admin/leads (Admin-Leads-D at 1440, Admin-Leads-M at 390). One list of everything inbound, status changed by hand
// (store: setLead). `?lead=<id>` opens the details: an inline column on desktop, a bottom sheet on the phone.
// «علّم كمردود» marks it answered; closing a lead asks for the reason (اشترى · لم يرد · غير مناسب). Notes are kept in
// memory. `?empty=1` (presenter «Admin empty states») shows the «لا طلبات بلا رد» state.
import { useId, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { AdminButton, Drawer, EmptyState, IconSearch, IconWhatsApp, PeriodToggle, StatusPill } from "@/components/admin";
import { PhoneIcon } from "@/components/ui";
import { approvalById } from "@/data/approvals";
import { CLOSE_REASONS, leadById, leads, LEAD_KIND_LABELS, LEAD_STATUS_LABELS } from "@/data/leads";
import { unitByCode } from "@/data/units";
import { agoLabel, effectiveLeadStatus, NOW, whenLabel } from "@/data/selectors";
import type { Lead, LeadKind, LeadStatus } from "@/data/types";
import { setQuery, useQuery } from "@/lib/location";
import { usePresenter } from "@/lib/presenter";
import { usePatch, useStore } from "@/lib/store";
import { cx, fmtNum } from "@/lib/format";
import { G7Shell } from "./shell";

type LeadsOv = Record<string, { status: LeadStatus; closedReason?: string }>;
type Note = Lead["notes"][number];
const PAGE = 6;
const PHONE_PAGE = 7;
const KIND_CHIPS: { kind: LeadKind | "all"; label: string }[] = [
  { kind: "all", label: "الكل" },
  { kind: "whatsapp", label: "واتساب" },
  { kind: "call", label: "اتصال" },
  { kind: "form", label: "نموذج" },
  { kind: "notify", label: "نبّهني" },
  { kind: "owner", label: "عقارات المُلّاك" },
];
const KIND_META: Record<LeadKind, string> = { whatsapp: "ضغطة واتساب", call: "ضغطة اتصال", form: "نموذج تواصل", notify: "نبّهني", owner: "عقار مالك" };

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
/** true from 768px (after hydration); the server renders the phone layout's closed sheet. */
function useWide(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia("(min-width: 768px)").matches, () => false);
}

/** «مغلق · اشترى» */
function statusWord(l: Lead, ov: LeadsOv): string {
  const st = effectiveLeadStatus(l, ov);
  if (st === "closed") {
    const reason = ov[l.id]?.closedReason ?? l.closedReason;
    return reason ? `مغلق · ${reason}` : LEAD_STATUS_LABELS.closed;
  }
  return LEAD_STATUS_LABELS[st];
}
const agoLong = (iso: string) => agoLabel(iso).replace(/ د$/, " دقيقة");

export function LeadsPage() {
  const q = useQuery();
  const { state } = usePresenter();
  const empty = state.empty;
  const wide = useWide();
  const ov = useStore((s) => s.leads);
  const [status, setStatus] = useState<LeadStatus | null>(null);
  const [kind, setKind] = useState<LeadKind | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [phoneShown, setPhoneShown] = useState(PHONE_PAGE);
  const openId = q.get("lead");
  const open = openId ? leadById(openId) : undefined;

  // Designed rows first (they carry the boards' stories), then the illustrative filler, newest first in each.
  const all = useMemo(
    () =>
      [...leads.filter((l) => !l.generated).sort((a, b) => (a.at === b.at ? (a.id < b.id ? -1 : 1) : a.at < b.at ? 1 : -1)), ...leads.filter((l) => l.generated)].filter(
        (l) => !(empty && effectiveLeadStatus(l, ov) === "unanswered"),
      ),
    [ov, empty],
  );
  const counts = {
    unanswered: all.filter((l) => effectiveLeadStatus(l, ov) === "unanswered").length,
    answered: all.filter((l) => effectiveLeadStatus(l, ov) === "answered").length,
    closed: all.filter((l) => effectiveLeadStatus(l, ov) === "closed").length,
  };
  const needle = search.trim().toLowerCase();
  const filtered = all.filter(
    (l) =>
      (!status || effectiveLeadStatus(l, ov) === status) &&
      (kind === "all" || l.kind === kind) &&
      (!needle || [l.id, l.code, l.name, l.title, l.detail, l.unitCode].filter(Boolean).join(" ").toLowerCase().includes(needle)),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const cur = Math.min(page, pages - 1);
  const pageRows = filtered.slice(cur * PAGE, cur * PAGE + PAGE);

  const showEmpty = empty && (status === null || status === "unanswered") && kind === "all" && !needle;
  const lastAnswered = all.filter((l) => effectiveLeadStatus(l, ov) === "answered").sort((a, b) => (a.at < b.at ? 1 : -1))[0];
  const emptyBlock = (
    <EmptyState
      icon="gold"
      title="لا طلبات بلا رد"
      text={lastAnswered ? `كل الطلبات الواردة مُعلَّمة. آخر طلب وصل ${agoLabel(lastAnswered.at)}${lastAnswered.team ? ` وردّت عليه ${lastAnswered.team}` : ""}.` : "كل الطلبات الواردة مُعلَّمة."}
      action={
        <button type="button" onClick={() => setStatus("answered")} className="text-[12px] font-extrabold text-gold-text no-underline hover:underline hover:text-ink">
          عرض «تم الرد» {counts.answered}
        </button>
      }
    />
  );
  const statusToggle = (stretch?: boolean) => (
    <PeriodToggle
      label="الحالة"
      className={cx(stretch && "flex w-full [&>button]:flex-1 [&>button]:h-11 [&>button]:text-label")}
      value={status ?? ("none" as LeadStatus)}
      onChange={(v) => {
        setStatus((cur) => (cur === v ? null : (v as LeadStatus)));
        setPage(0);
      }}
      options={[
        { value: "unanswered", label: `بلا رد ${counts.unanswered}` },
        { value: "answered", label: `تم الرد ${counts.answered}` },
        { value: "closed", label: `مغلق ${counts.closed}` },
      ]}
    />
  );

  const close = () => setQuery({ lead: null }, "push");
  const openLead = (id: string) => setQuery({ lead: id }, "push");

  return (
    <G7Shell
      active="leads"
      phoneActive="leads"
      phoneHideHeader
      title="الطلبات الواردة"
      subtitle="قائمة واحدة لكل ما يصل: رسائل التواصل، نقرات واتساب والاتصال، طلبات «أبلغني»، وطلبات المُلّاك · الحالة تُغيَّر يدوياً"
    >
      {/* desktop */}
      <div className="hidden flex-col gap-5 md:flex">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex h-10 items-center gap-2 border-interactive bg-paper px-3">
            <IconSearch size={16} />
            <span className="sr-only">ابحث في الطلبات</span>
            <input type="search" value={search} onChange={(e) => (setSearch(e.target.value), setPage(0))} placeholder="اسم، رمز، وحدة" className="w-[180px] bg-transparent text-label font-normal outline-none" />
          </label>
          <select aria-label="النوع" value={kind} onChange={(e) => (setKind(e.target.value as LeadKind | "all"), setPage(0))} className="h-10 border-interactive bg-paper px-3 text-[12px] font-bold">
            <option value="all">كل الأنواع</option>
            {(Object.keys(LEAD_KIND_LABELS) as LeadKind[]).map((k) => (
              <option key={k} value={k}>
                {LEAD_KIND_LABELS[k]}
              </option>
            ))}
          </select>
          {statusToggle()}
        </div>
        <div className={cx("grid items-start gap-6", open && wide && "xl:grid-cols-[minmax(0,1fr)_360px]")}>
          {showEmpty ? (
            <div className="border-interactive bg-paper">{emptyBlock}</div>
          ) : (
            <section className="min-w-0 overflow-x-auto border-interactive bg-paper" aria-label="الطلبات">
              <div role="table" aria-label="الطلبات الواردة" className="min-w-[760px]">
                <div role="row" className="grid grid-cols-[120px_1.6fr_1fr_110px_90px] gap-3 border-b-[1.5px] border-ink px-4 py-2.5 text-caption font-bold text-muted">
                  {["النوع", "الطلب", "من", "الحالة", "الوقت"].map((h) => (
                    <span key={h} role="columnheader">
                      {h}
                    </span>
                  ))}
                </div>
                {pageRows.map((l) => {
                  const st = effectiveLeadStatus(l, ov);
                  const active = open?.id === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      role="row"
                      aria-current={active || undefined}
                      onClick={() => openLead(l.id)}
                      className={cx("grid w-full grid-cols-[120px_1.6fr_1fr_110px_90px] items-center gap-3 border-b border-line px-4 py-3.5 text-start text-label font-normal last:border-b-0 hover:bg-cream", active && "bg-sand hover:bg-sand", st === "closed" && "text-muted")}
                    >
                      <span role="cell" className="flex items-center gap-2 font-bold text-ink">
                        {active && <span aria-hidden className="size-2 bg-gold hex-point" />}
                        {LEAD_KIND_LABELS[l.kind]}
                      </span>
                      <span role="cell" className="flex min-w-0 flex-col gap-0.5">
                        <span className="font-extrabold text-ink">{l.title}</span>
                        <span className="text-caption text-muted">{l.detail}</span>
                      </span>
                      <span role="cell" className="text-muted">
                        {l.source} · {l.device} · {l.city}
                      </span>
                      <span role="cell">
                        <StatusPill status={statusWord(l, ov)} variant={st === "unanswered" ? "gold" : st === "answered" ? "outline" : "ink"} />
                      </span>
                      <span role="cell" className="text-muted tnum">
                        {agoLabel(l.at)}
                      </span>
                    </button>
                  );
                })}
                {pageRows.length === 0 && <p className="px-4 py-6 text-label font-normal text-muted">لا طلبات تطابق البحث.</p>}
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-[12px] text-muted">
                <span className="tnum">{filtered.length ? `${cur * PAGE + 1} إلى ${Math.min(filtered.length, cur * PAGE + PAGE)} من ${filtered.length}` : "0"}</span>
                <span className="flex gap-2">
                  {cur > 0 && (
                    <AdminButton size="xs" onClick={() => setPage(cur - 1)}>
                      السابق
                    </AdminButton>
                  )}
                  {cur < pages - 1 && (
                    <AdminButton size="xs" onClick={() => setPage(cur + 1)}>
                      التالي
                    </AdminButton>
                  )}
                </span>
              </div>
            </section>
          )}
          {open && wide && (
            <aside className="flex flex-col border-interactive bg-paper xl:order-none" aria-label={`تفاصيل الطلب ${open.code ?? open.id}`}>
              <LeadDetails lead={open} ov={ov} onClose={close} />
            </aside>
          )}
        </div>
      </div>

      {/* phone */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-[22px] font-extrabold">الطلبات الواردة</h1>
          <span className="text-[12px] text-muted">{all.length} طلباً · آخر 90 يوماً</span>
        </div>
        {statusToggle(true)}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="النوع">
          {KIND_CHIPS.map((c) => {
            const n = c.kind === "all" ? null : all.filter((l) => l.kind === c.kind).length;
            const on = kind === c.kind;
            return (
              <button key={c.kind} type="button" aria-pressed={on} onClick={() => setKind(c.kind)} className={cx("h-9 shrink-0 whitespace-nowrap border-interactive px-3 text-[12px] font-bold", on ? "bg-ink text-paper" : "bg-paper text-ink")}>
                {c.label}
                {n !== null && ` ${n}`}
              </button>
            );
          })}
        </div>
        <p className="text-[12px] text-muted">الموقع لا يعرف إن رددتم. حين تردّون على طلب، اضغطوا «علّم كمردود».</p>
        {showEmpty ? (
          <div className="border-interactive bg-paper">{emptyBlock}</div>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {filtered.slice(0, phoneShown).map((l) => (
                <PhoneCard key={l.id} l={l} ov={ov} onDetails={() => openLead(l.id)} />
              ))}
            </ul>
            {filtered.length > phoneShown && (
              <button type="button" onClick={() => setPhoneShown((n) => n + 20)} className="h-12 border-interactive bg-paper text-[14px] font-bold">
                عرض {fmtNum(filtered.length - phoneShown)} طلباً أقدم
              </button>
            )}
          </>
        )}
      </div>
      {!wide && (
        <Drawer open={!!open} onClose={close} title={open ? `تفاصيل الطلب ${open.code ?? open.id}` : "تفاصيل الطلب"} bodyClassName="p-0">
          {open && <LeadDetails lead={open} ov={ov} onClose={close} phone />}
        </Drawer>
      )}
    </G7Shell>
  );
}

// ---------------------------------------------------------------------------- shared actions

function useLeadActions(lead: Lead) {
  const setLead = useStore((s) => s.setLead);
  const toast = useStore((s) => s.toast);
  return {
    answered() {
      setLead(lead.id, "answered");
      toast(`تم الرد · ${lead.code ?? lead.name ?? lead.id}`);
    },
    reopen() {
      setLead(lead.id, "unanswered");
      toast(`بلا رد · ${lead.code ?? lead.name ?? lead.id}`);
    },
    close(reason: string) {
      setLead(lead.id, "closed", reason);
      toast(`أُغلق الطلب · ${reason}`);
    },
  };
}

function ReasonPicker({ onPick, onCancel }: { onPick: (r: string) => void; onCancel: () => void }) {
  return (
    <div role="group" aria-label="سبب الإغلاق" className="flex flex-col gap-2 border-[1.5px] border-gold bg-cream-focus p-3">
      <span className="text-[12px] font-extrabold">سبب الإغلاق</span>
      <div className="flex flex-wrap gap-2">
        {CLOSE_REASONS.map((r) => (
          <AdminButton key={r} size="sm" onClick={() => onPick(r)}>
            {r}
          </AdminButton>
        ))}
        <AdminButton size="sm" variant="ghost" onClick={onCancel}>
          إلغاء
        </AdminButton>
      </div>
    </div>
  );
}

function Notes({ lead, phone }: { lead: Lead; phone?: boolean }) {
  const extra = usePatch<{ notes: Note[] }>("leadNotes", lead.id)?.notes ?? [];
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const [text, setText] = useState("");
  const id = useId();
  const notes = [...lead.notes, ...extra];
  function save() {
    if (!text.trim()) {
      document.getElementById(`${id}-note`)?.focus();
      return;
    }
    patch("leadNotes", lead.id, { notes: [...extra, { by: "سعود", at: NOW, text: text.trim() }] });
    setText("");
    toast("حُفظت الملاحظة");
  }
  const placeholder = phone ? "أضف ملاحظة…" : "أضف ملاحظة";
  return (
    <div className={cx("flex flex-col", phone ? "gap-1.5" : "gap-2")}>
      <span className="text-[12px] font-extrabold">ملاحظات الفريق</span>
      {notes.map((n, i) => (
        <div key={i} className={cx("flex flex-col gap-1 leading-relaxed", phone ? "border-s-[3px] border-line bg-cream px-3 py-2.5 text-[13px]" : "bg-sand px-2.5 py-2 text-[12px]")}>
          <span>{n.text}</span>
          <span className="text-caption font-normal text-muted">
            {n.by} · {whenLabel(n.at)}
          </span>
        </div>
      ))}
      <textarea
        id={`${id}-note`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cx("border-interactive bg-paper", phone ? "min-h-16 px-3 py-2.5 text-[13px]" : "px-2.5 py-2 text-[12px]")}
      />
      {(!phone || text.trim()) && (
        <AdminButton size="xs" className="self-start" onClick={save}>
          حفظ الملاحظة
        </AdminButton>
      )}
    </div>
  );
}

function LeadDetails({ lead, ov, onClose, phone }: { lead: Lead; ov: LeadsOv; onClose: () => void; phone?: boolean }) {
  const st = effectiveLeadStatus(lead, ov);
  const act = useLeadActions(lead);
  const [asking, setAsking] = useState(false);
  const toast = useStore((s) => s.toast);
  const middle = lead.detail.split(" · ").filter((p) => !(lead.code && p.includes(lead.code)) && !p.includes("ميزانية"))[0];
  const sec = phone ? undefined : "border-b border-line px-[18px] py-3 last:border-b-0";
  // Desktop board: the pressed status is gold; the phone sheet keeps the ink fill.
  const statusSeg = (
    <PeriodToggle
      label="حالة الطلب"
      tone={phone ? "ink" : "gold"}
      className="flex w-full [&>button]:flex-1"
      value={st}
      onChange={(v) => {
        if (v === "closed") setAsking(true);
        else if (v === "answered") act.answered();
        else act.reopen();
      }}
      options={[
        { value: "unanswered", label: "بلا رد" },
        { value: "answered", label: "تم الرد" },
        { value: "closed", label: "مغلق" },
      ]}
    />
  );
  return (
    <div className="flex flex-col">
      {!phone && (
        <div className="cut-m relative flex flex-col gap-1.5 bg-ink px-5 py-4 text-paper">
          <span className="text-caption text-on-ink-muted">{[LEAD_KIND_LABELS[lead.kind], middle, agoLong(lead.at)].filter(Boolean).join(" · ")}</span>
          <span className="text-[18px] font-extrabold">{lead.title}</span>
          {lead.code ? (
            <span className="text-[12px] text-on-ink-muted">
              الرمز المرجعي <strong className="text-gold">{lead.code}</strong> · ابحث عنه في محادثات واتساب لتعرف من راسلك
            </span>
          ) : (
            lead.name && <span className="text-[12px] text-on-ink-muted">{[lead.name, lead.phoneMasked].filter(Boolean).join(" · ")}</span>
          )}
          <button type="button" onClick={onClose} aria-label="إغلاق التفاصيل" className="absolute end-2 top-2 flex size-9 items-center justify-center text-[18px] text-on-ink-muted hover:text-paper">
            ×
          </button>
        </div>
      )}
      {phone && (
        <div className="flex flex-col gap-2 px-4 pt-2">
          <span className="flex items-center justify-between gap-2">
            {lead.code ? (
              <span dir="ltr" className="font-mono text-[20px] font-extrabold">
                {lead.code}
              </span>
            ) : (
              <span className="text-[20px] font-extrabold">{lead.name ?? lead.id}</span>
            )}
            <StatusPill status={statusWord(lead, ov)} variant={st === "unanswered" ? "goldOutline" : st === "answered" ? "ink" : "muted"} />
          </span>
          {lead.code && !lead.phoneMasked && (
            <>
              <p className="text-[12px] text-muted">لا رقم جوال: الزائر ضغط واتساب ولم يملأ نموذجاً. ابحثوا عن الرمز في محادثات واتساب بزنس.</p>
              <button
                type="button"
                className="flex h-11 items-center justify-center border-interactive bg-paper px-4 text-label text-ink motion-hover hover:bg-sand"
                onClick={() => {
                  navigator.clipboard?.writeText(lead.code ?? "").catch(() => {});
                  toast(`نُسخ ${lead.code}`);
                }}
              >
                انسخ {lead.code} للبحث في واتساب
              </button>
            </>
          )}
        </div>
      )}
      {!phone && st !== "closed" && (
        <div className="flex gap-2 border-b border-line px-[18px] py-3">
          {st === "unanswered" && (
            <AdminButton variant="gold" size="lg" className="flex-1" onClick={act.answered}>
              علّم كمردود
            </AdminButton>
          )}
          <AdminButton size="lg" onClick={() => setAsking(true)}>
            إغلاق
          </AdminButton>
        </div>
      )}
      <div className={cx("flex flex-col", phone && "gap-5 px-4 py-4")}>
        {asking && (
          <div className={sec}>
            <ReasonPicker
              onPick={(r) => {
                act.close(r);
                setAsking(false);
              }}
              onCancel={() => setAsking(false)}
            />
          </div>
        )}
        {lead.path.length > 0 && (
          <div className={cx("flex flex-col text-[12px]", sec)}>
            <span className="pb-1.5 font-extrabold">مسار الزائر</span>
            <ol className={cx("flex flex-col", phone && "list-decimal ps-3.5 text-[13px] font-normal leading-[1.8] text-ink-2")}>
              {lead.path.map((p, i) => (
                <li key={i} className={cx(!phone && "border-t border-sand py-[5px] leading-relaxed", i === lead.path.length - 1 && "font-bold")}>
                  {p}
                </li>
              ))}
            </ol>
          </div>
        )}
        <div className={sec}>
          <Notes lead={lead} phone={phone} />
        </div>
        <div className={cx("flex flex-col text-[12px]", phone ? "gap-2" : "gap-1.5", sec)}>
          <span className="font-extrabold">{phone ? "الحالة اليدوية" : "الحالة"}</span>
          {statusSeg}
          {phone ? (
            st === "unanswered" && (
              <AdminButton variant="gold" size="lg" className="mt-1 h-12 text-[15px]" onClick={act.answered}>
                علّم كمردود
              </AdminButton>
            )
          ) : (
            <span className="text-caption font-normal leading-relaxed text-muted">الموقع لا يستطيع معرفة ما إذا كان الرد قد حدث على واتساب. الفريق يغيّر الحالة يدوياً. عند الإغلاق، اختر السبب: اشترى، لم يرد، غير مناسب.</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------- phone card

function PhoneCard({ l, ov, onDetails }: { l: Lead; ov: LeadsOv; onDetails: () => void }) {
  const st = effectiveLeadStatus(l, ov);
  const act = useLeadActions(l);
  const [asking, setAsking] = useState(false);
  const unit = l.unitCode ? unitByCode(l.unitCode) : undefined;
  const approval = l.kind === "owner" ? approvalById(l.id) : undefined;
  const toast = useStore((s) => s.toast);
  // Today reads as the bare time on the phone board («ضغطة واتساب · 14:22»), yesterday as «أمس 21:05».
  const when = l.at >= "2026-10-09" ? whenLabel(l.at).replace(/^اليوم /, "") : agoLabel(l.at);
  const meta = `${KIND_META[l.kind]} · ${when}`;
  const pending = !!approval && st !== "closed";
  const needsAction = st === "unanswered" || pending;
  const callToast = () => toast(`${l.name ?? l.id} · ${l.phoneMasked ?? ""}`, { kind: "info" });
  const title: ReactNode =
    l.kind === "owner" && approval ? (
      <>
        طلب رقم <span dir="ltr">{approval.id}</span>
      </>
    ) : l.code ? (
      <span dir="ltr" className="font-mono">
        {l.code}
      </span>
    ) : (
      l.name ?? l.id
    );
  let body: ReactNode = null;
  if (l.kind === "owner" && approval) {
    body = <span className="text-label font-normal">{[approval.titleAr, approval.unitsCount ? `${approval.unitsCount} وحدات` : null, fmtNum(approval.askedPriceSar), approval.role === "agent" ? "وكيل" : approval.role === "marketer" ? "مسوّق" : "مالك", `${approval.photosCount} صور`].filter(Boolean).join(" · ")}</span>;
  } else if (st !== "unanswered") {
    const note = l.notes[l.notes.length - 1];
    body =
      st === "closed" && unit?.soldOn ? (
        <span className="text-[12px] text-muted">{`${unit.code} · ${unit.buildingNameAr} · بيعت ${unit.soldOn}`}</span>
      ) : (
        <span className="text-[12px] text-muted">{[l.team ? `ردّ${l.team.endsWith("ة") ? "ت" : ""} ${l.team}` : null, l.statusDetailAr ?? note?.text].filter(Boolean).join(" · ") || l.detail}</span>
      );
  } else if (l.kind === "whatsapp" && unit) {
    body = (
      <span className="text-label font-normal">
        من صفحة{" "}
        <Link href={`/units/${unit.slug}`} className="font-bold text-gold-text hover:text-ink hover:underline">
          {unit.code} · {unit.buildingNameAr} · {fmtNum(unit.priceSar)}
        </Link>{" "}
        · الرمز نفسه في أول رسالته على واتساب
      </span>
    );
  } else if (l.kind === "call") {
    body = <span className="text-label font-normal text-ink-2">{`زائر بلا رقم. ${l.detail.split(" · ").filter((p) => !(l.code && p.includes(l.code))).join(" · ")}. يُغلق تلقائياً بعد 7 أيام إن لم يُعلَّم.`}</span>;
  } else {
    body = (
      <>
        {l.phoneMasked && (
          <button type="button" dir="ltr" onClick={callToast} className="self-start text-[14px] font-bold text-gold-text tnum hover:text-ink">
            {l.phoneMasked}
          </button>
        )}
        <p className="text-label font-normal text-ink-2">{l.kind === "notify" ? l.detail.split(" · ").slice(-1)[0] : l.title}</p>
      </>
    );
  }
  const waReply = `https://wa.me/?text=${encodeURIComponent(`مرحباً ${l.name ?? ""}، معك فريق SMQ العقارية بخصوص طلبك.`)}`;
  return (
    <li
      className={cx(
        "flex flex-col border-[1.5px] px-3.5 py-3.5",
        needsAction ? "gap-2 border-ink border-s-[5px] border-s-gold bg-paper" : st === "answered" ? "gap-1.5 border-line bg-paper" : "gap-1.5 border-line bg-sand",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[12px] font-bold text-muted">
          {l.kind === "whatsapp" && <IconWhatsApp size={16} className="shrink-0 text-ink" />}
          {meta}
        </span>
        <StatusPill status={pending ? "بانتظار الموافقة" : statusWord(l, ov)} variant={pending ? "outline" : st === "unanswered" ? "goldOutline" : st === "answered" ? "ink" : "muted"} />
      </div>
      <span className={cx("font-extrabold", st === "unanswered" ? "text-[17px]" : "text-[16px]")}>{title}</span>
      {body}
      {asking && (
        <ReasonPicker
          onPick={(r) => {
            act.close(r);
            setAsking(false);
          }}
          onCancel={() => setAsking(false)}
        />
      )}
      {st === "unanswered" && l.kind !== "owner" && (
        <div className="mt-1 flex gap-2">
          {l.kind === "form" || l.kind === "notify" ? (
            <>
              <a href={waReply} target="_blank" rel="noreferrer" className="cut-s flex h-11 flex-1 items-center justify-center bg-gold text-label text-ink">
                رد على واتساب
              </a>
              {l.kind === "form" && l.phoneMasked && (
                <button type="button" aria-label="اتصال" onClick={callToast} className="flex size-11 shrink-0 items-center justify-center border-interactive bg-paper text-ink hover:bg-sand">
                  <PhoneIcon size={18} />
                </button>
              )}
              <AdminButton size="lg" onClick={act.answered}>
                علّم كمردود
              </AdminButton>
            </>
          ) : (
            <>
              <AdminButton variant="gold" size="lg" className="flex-1" onClick={act.answered}>
                علّم كمردود
              </AdminButton>
              {l.kind === "call" ? (
                <AdminButton size="lg" onClick={() => setAsking(true)}>
                  إغلاق
                </AdminButton>
              ) : (
                <AdminButton size="lg" onClick={onDetails}>
                  التفاصيل
                </AdminButton>
              )}
            </>
          )}
        </div>
      )}
      {l.kind === "owner" && approval && (
        <Link href={`/admin/approvals/${approval.id}`} className="mt-1 flex h-11 items-center justify-center border-interactive bg-paper text-label text-ink">
          افتح في الموافقات
        </Link>
      )}
    </li>
  );
}
