"use client";
// /admin/alliance/members/[id] (Admin-AllianceMember-D, office-01 مكتب أ). The member's file: licence and data,
// coverage (with the uncovered district of its sector marked «مطلوب»), the ledger since joining, the record of
// referrals and requests it took part in, team notes and suspension. «صفحة العضو كما يراها» opens /member/[id].
// Suspension, coverage edits and notes live in memory (store patch).
import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminButton, AdminSelect, Dialog, Drawer } from "@/components/admin";
import { DistrictMultiSelect, HexCell, REFERRAL_STAGE_WORD, fmtReply } from "@/components/alliance";
import { MarkedText } from "@/components/ui";
import { analytics } from "@/data/analytics";
import { districtAr, districts, SECTORS } from "@/data/districts";
import { activeOffices, HOURS_LABELS, officeById } from "@/data/offices";
import { referralsForOffice } from "@/data/referrals";
import { requests } from "@/data/requests";
import { allianceSettings } from "@/data/settings";
import { agoLabel, coverageByDistrict, effectiveReferralStage, effectiveRequest, ledgerNet, NOW, rankInDistrict, TODAY } from "@/data/selectors";
import type { Office, Referral } from "@/data/types";
import { usePatch, useStore } from "@/lib/store";
import { cx, fmtDate, fmtNum } from "@/lib/format";
import { G9Shell, HexAvatar, Section } from "./shell";
import { daysAgo, officeShort } from "./util";

type Note = { by: string; at: string; text: string };
/** The licence reminder rule written on the applications board («يُذكَّر المدير قبل انتهاء الرخصة بـ 30 يوماً»). */
const LICENCE_REMINDER_DAYS = 30;
const roleShort = (r: string) => r.replace(" العقاري", "");

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3 text-[13px] last:border-b-0">
      <span className="shrink-0 text-muted">{k}</span>
      <span className="text-end font-extrabold">{children}</span>
    </div>
  );
}

function Bars({ title, tone, rows }: { title: string; tone: "gold" | "ink"; rows: { label: string; value: number; display?: string; ratio: number }[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <span className={cx("text-[11px] font-extrabold", tone === "gold" ? "text-gold-text" : "text-ink")}>{title}</span>
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2 text-[12px]">
            <span>{r.label}</span>
            <strong className="font-extrabold tnum">{r.display ?? fmtNum(r.value)}</strong>
          </div>
          <div className="relative h-3 bg-sand">
            <span className={cx("absolute inset-y-0 start-0", tone === "gold" ? "bg-gold" : "bg-ink")} style={{ width: `${Math.round(Math.min(1, Math.max(0, r.ratio)) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Referral stage tones: معاينة gold · تفاوض ink · إفراغ outline (Components3 stage pill), تعارف gold outline. */
const STAGE_TONE = { intro: "goldOutline", viewing: "gold", negotiation: "ink", transfer: "outline", failed: "muted" } as const;

type LogRow = { id: string; summary: string; other: string; stage: React.ReactNode; hot?: boolean; at: string };

function StageTag({ children, tone }: { children: React.ReactNode; tone: "gold" | "ink" | "outline" | "goldOutline" | "muted" }) {
  return (
    <span
      className={cx(
        "inline-flex w-[110px] justify-start px-2 py-1 text-[11px] font-extrabold",
        tone === "gold" && "bg-gold text-ink",
        tone === "ink" && "bg-ink text-paper",
        tone === "outline" && "border-interactive text-ink",
        tone === "goldOutline" && "border-[1.5px] border-gold text-gold-text",
        tone === "muted" && "border-hairline text-muted",
      )}
    >
      {children}
    </span>
  );
}

function useLog(o: Office | undefined): LogRow[] {
  const stages = useStore((s) => s.referralStages);
  const reqOv = useStore((s) => s.requests);
  const created = useStore((s) => s.createdReferrals);
  return useMemo(() => {
    if (!o) return [];
    const refs: Referral[] = [...created.filter((r) => r.requesterOfficeId === o.id || r.offerOfficeId === o.id), ...referralsForOffice(o.id).filter((r) => !created.some((c) => c.id === r.id))];
    const out: LogRow[] = refs.map((r) => {
      const st = effectiveReferralStage(r, stages);
      const mine = r.offerOfficeId === o.id;
      const kind = r.offerSummary.split(" · ")[0];
      const other = mine ? officeShort(r.requesterOfficeId) : officeShort(r.offerOfficeId);
      const dispute = !!r.dispute && ["intro", "viewing", "negotiation"].includes(st);
      return {
        id: r.id,
        at: r.createdAt ?? r.introducedOn,
        summary: `${districtAr(r.districtSlug)} · ${kind} ${fmtNum(r.valueSar)} · ${mine ? `عرضه على طلب ${other}` : `طلبه، عرض ${other}`}`,
        other,
        hot: dispute,
        stage: dispute ? <StageTag tone="ink">{`${REFERRAL_STAGE_WORD[st]} · نزاع`}</StageTag> : <StageTag tone={STAGE_TONE[st]}>{REFERRAL_STAGE_WORD[st]}</StageTag>,
      };
    });
    const refReqIds = new Set(refs.map((r) => r.requestId));
    for (const base of requests) {
      const r = effectiveRequest(base, reqOv);
      if (refReqIds.has(r.id) || r.referralId) continue;
      const entry = r.sentTo.find((s) => s.officeId === o.id);
      const asker = r.source === "member" && r.memberOfficeId === o.id;
      if (!entry && !asker) continue;
      const budget = r.budgetMin && r.budgetMax ? `${fmtNum(r.budgetMin)} إلى ${fmtNum(r.budgetMax)}` : r.budgetMax ? `حتى ${fmtNum(r.budgetMax)}` : "";
      const head = `${districtAr(r.districtSlug)} · ${r.typeLabelAr ?? r.type} ${budget}`.trim();
      if (asker) {
        out.push({ id: r.id, at: r.createdAt, summary: `${head} · طلبه`, other: r.sentTo.length ? r.sentTo.map((s) => officeShort(s.officeId)).join("، ") : "SMQ", stage: <StageTag tone="goldOutline">{r.stage === "new" ? "جديد" : "أُرسل"}</StageTag> });
        continue;
      }
      if (!entry) continue;
      const when = daysAgo(entry.sentAt) === 0 ? "اليوم" : agoLabel(entry.sentAt);
      const other = r.source === "visitor" ? "زائر SMQ" : r.source === "staff" ? "فريق SMQ" : officeShort(r.memberOfficeId ?? "");
      let summary = `${head} · وُجّه له ${when}`;
      let stage: React.ReactNode = <StageTag tone="goldOutline">بلا رد</StageTag>;
      if (entry.status === "none") {
        summary = `${head} · ردّ «لا يوجد» خلال ${entry.replyMinutes ? fmtReply(entry.replyMinutes) : ""}`;
        stage = <StageTag tone="outline">مغلق</StageTag>;
      } else if (entry.status === "replied") {
        summary = `${head} · ردّ بعرض خلال ${entry.replyMinutes ? fmtReply(entry.replyMinutes) : ""}`;
        stage = <StageTag tone="gold">وصلت عروض</StageTag>;
      } else if (entry.status === "expired" || r.stage === "closed") {
        stage = <StageTag tone="muted">مغلق</StageTag>;
      }
      out.push({ id: r.id, at: r.createdAt, summary, other, stage });
    }
    const isRef = (x: LogRow) => x.id.startsWith("REF");
    return out.sort((a, b) => (isRef(a) !== isRef(b) ? (isRef(a) ? -1 : 1) : a.at < b.at ? 1 : -1));
  }, [o, stages, reqOv, created]);
}

export function MemberDetailPage({ id }: { id: string }) {
  const base = officeById(id);
  const patchOffice = usePatch<Partial<Office>>("office", id);
  const notePatch = usePatch<{ list: Note[] }>("office-notes", id);
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const [draft, setDraft] = useState("");
  const [stopOpen, setStopOpen] = useState(false);
  const [stopReason, setStopReason] = useState("");
  const [editing, setEditing] = useState(false);
  const o: Office | undefined = useMemo(() => (base ? { ...base, ...(patchOffice ?? {}) } : undefined), [base, patchOffice]);
  const log = useLog(o);
  if (!o || !base) return null;

  const suspended = o.status === "suspended";
  const net = ledgerNet(o);
  const cov = coverageByDistrict(activeOffices());
  const sessions = analytics.districtSessions30d;
  const wanted = districts.filter((d) => d.sector === o.sector && !o.districts.includes(d.slug) && (cov[d.slug]?.count ?? 0) === 0).sort((a, b) => (sessions[b.slug] ?? 0) - (sessions[a.slug] ?? 0))[0];
  const shared = o.districts
    .map((d) => ({ d, others: (cov[d]?.officeIds ?? []).filter((x) => x !== o.id) }))
    .filter((x) => x.others.length);
  const sharedLine = shared.length
    ? `يشترك ${shared.map((x, i) => `${i === 0 ? "" : "و"}مع ${x.others.map(officeShort).join(" و")} في ${districtAr(x.d)}`).join(" ")}. الميزان ${shared.every((x) => x.others.length === 1) ? "يرتّبهما" : "يرتّبهم"}.`
    : "لا يشترك مع مكتب آخر في أحيائه.";
  const rank = o.districts[0] ? rankInDistrict(o.id, o.districts[0]) : null;
  const fastest = Math.min(...activeOffices().map((x) => x.ledger.avgReplyMinutes).filter((m) => m > 0));
  const givenMax = Math.max(o.ledger.offersGiven, o.ledger.requestsGiven, o.ledger.dealsClosed, o.ledger.requestsReceived, o.ledger.replied, 1);
  const notes = [...(o.notes ?? []), ...(notePatch?.list ?? [])];
  const stopReasons = ["تخطّي سجل إحالة", "رخصة منتهية", `بلا رد ${allianceSettings.defaults.suspendAfterNoReplyDays} يوماً`];
  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    patch("office-notes", o.id, { list: [...(notePatch?.list ?? []), { by: "سعود", at: NOW.slice(0, 10), text: `«${text}»` }] });
    setDraft("");
    toast("أُضيفت الملاحظة");
  };
  const suspend = () => {
    patch("office", o.id, { status: "suspended", suspendedOn: TODAY, suspendedReason: stopReason, inDirectory: false });
    setStopOpen(false);
    toast(`أُوقفت عضوية ${o.nameAr} · ${stopReason}`);
  };

  return (
    <G9Shell>
      <nav aria-label="المسار" className="text-[12px] font-bold text-muted">
        <Link href="/admin/alliance" className="text-gold-text no-underline hover:text-ink hover:underline">
          غرفة التحالف
        </Link>
        {" › "}
        <Link href="/admin/alliance/members" className="text-gold-text no-underline hover:text-ink hover:underline">
          الأعضاء
        </Link>
        {` › ${o.nameAr}`}
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <HexAvatar letter={o.letter} size={58} tone={suspended ? "muted" : "inkGold"} />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="flex flex-wrap items-center gap-3 text-h3 font-extrabold leading-tight md:text-[28px]">
              {o.fullName}
              <span className="inline-flex items-center gap-1.5 bg-sand px-2 py-1 text-[11px] font-extrabold">
                <span aria-hidden className={cx("hex-flat inline-block h-2 w-2.5", suspended ? "bg-muted" : "bg-gold")} />
                {suspended ? "موقوف" : "رخصة فال موثّقة"}
              </span>
            </h1>
            <span className="text-caption text-muted md:text-label">
              {[
                suspended ? `موقوف ${o.suspendedOn ? fmtDate(o.suspendedOn) : ""} · ${o.suspendedReason ?? ""}` : `عضو منذ ${fmtDate(o.memberSince)}`,
                SECTORS[o.sector].ar,
                [roleShort(o.applicantRole), o.ownerName].filter(Boolean).join(" "),
                HOURS_LABELS[o.hours],
                o.inDirectory ? "ظاهر في الدليل" : "مخفي من الدليل",
              ].join(" · ")}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/member/${o.id}`} className="inline-flex h-10 items-center border-interactive bg-paper px-4 text-label font-bold text-ink no-underline hover:bg-sand">
            صفحة العضو كما يراها
          </Link>
          <AdminButton variant="outline" size="md" onClick={() => toast(`${o.fullName} · ${o.phoneMasked ?? ""}`, { kind: "info" })}>
            راسل على واتساب
          </AdminButton>
          <AdminButton variant="outline" size="md" disabled={suspended} onClick={() => setStopOpen(true)}>
            إيقاف العضوية
          </AdminButton>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3 lg:gap-5">
        <Section title="الرخصة والبيانات" bodyClassName="px-4 py-1">
          <Row k="رقم فال">
            <span dir="ltr">{o.licence.number}</span>
          </Row>
          <Row k="تحقق">{`${fmtDate(o.licence.verifiedOn)} · ${o.licence.verifiedBy} · موقع الهيئة`}</Row>
          <Row k="تنتهي">{`${fmtDate(o.licence.expiresOn)} · تذكير قبل ${LICENCE_REMINDER_DAYS} يوماً`}</Row>
          {o.phoneMasked && (
            <Row k="التواصل">
              <span dir="ltr">{o.phoneMasked}</span>
            </Row>
          )}
          {o.mapsLink && (
            <Row k="موقع المكتب">
              <a href={o.mapsLink} target="_blank" rel="noreferrer" className="text-gold-text underline hover:text-ink">
                خرائط قوقل ←
              </a>
            </Row>
          )}
          <Row k="الميثاق">{`النسخة ${o.charterVersion ?? allianceSettings.charter.version} · ${fmtDate(allianceSettings.charter.date)}`}</Row>
        </Section>

        <Section
          title="التغطية"
          aside={
            <button type="button" onClick={() => setEditing(true)} className="min-h-9 border-interactive bg-paper px-3 text-[11px] font-extrabold text-ink hover:bg-sand">
              تعديل
            </button>
          }
          bodyClassName="flex flex-col gap-3 p-4"
        >
          <div className="flex flex-wrap items-center justify-center gap-1" style={{ ["--hex-surface" as string]: "var(--smq-paper)" }}>
            {o.districts.map((d) => (
              <HexCell key={d} label={districtAr(d)} state="active" size={52} />
            ))}
            {wanted && <HexCell label={wanted.ar} value="مطلوب" state="required" size={52} />}
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 text-[11px] font-bold">
            {o.specialties.map((s) => (
              <span key={s} className="border-hairline px-2 py-1">
                {s}
              </span>
            ))}
          </div>
          <span className="text-[11px] leading-relaxed text-muted">{sharedLine}</span>
        </Section>

        <Section title="الميزان · منذ الانضمام" bodyClassName="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-2 gap-5">
            <Bars
              title="أعطى"
              tone="gold"
              rows={[
                { label: "عروض", value: o.ledger.offersGiven, ratio: o.ledger.offersGiven / givenMax },
                { label: "طلبات", value: o.ledger.requestsGiven, ratio: o.ledger.requestsGiven / givenMax },
                { label: "صفقات", value: o.ledger.dealsClosed, ratio: o.ledger.dealsClosed / givenMax },
              ]}
            />
            <Bars
              title="استقبل"
              tone="ink"
              rows={[
                { label: "طلبات", value: o.ledger.requestsReceived, ratio: o.ledger.requestsReceived / givenMax },
                { label: "ردّ", value: o.ledger.replied, ratio: o.ledger.replied / givenMax },
                { label: "متوسط الرد", value: o.ledger.avgReplyMinutes, display: o.ledger.avgReplyMinutes ? fmtReply(o.ledger.avgReplyMinutes) : "بلا رد", ratio: o.ledger.avgReplyMinutes ? fastest / o.ledger.avgReplyMinutes : 0 },
              ]}
            />
          </div>
          <span className="text-[11px] text-muted">{`صافٍ: ${net.lineAr}${rank && o.districts[0] ? ` · ترتيبه في ${districtAr(o.districts[0])}: ${rank.rankAr}` : ""}`}</span>
        </Section>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr] lg:gap-5">
        <Section title="سجل الإحالات والطلبات">
          <div className="overflow-x-auto">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[130px_1.6fr_0.8fr_130px] gap-3 border-b border-line bg-cream px-4 py-2.5 text-[11px] font-extrabold text-muted">
                <span>الرقم</span>
                <span>الملخّص</span>
                <span>الطرف الآخر</span>
                <span>المرحلة</span>
              </div>
              {log.map((r) => {
                const href = r.id.startsWith("REF") ? `/admin/alliance/referrals?ref=${r.id}` : `/admin/alliance/requests?req=${r.id}`;
                return (
                  <Link key={r.id} href={href} className={cx("grid min-h-14 grid-cols-[130px_1.6fr_0.8fr_130px] items-center gap-3 border-b border-line px-4 py-3 text-[12px] text-ink no-underline last:border-b-0 hover:bg-sand", r.hot && "bg-cream-focus")}>
                    <span className="font-extrabold" dir="ltr" style={{ textAlign: "right" }}>
                      {r.id}
                    </span>
                    <span className="leading-relaxed">{r.summary}</span>
                    <span>{r.other}</span>
                    <span className="flex justify-start">{r.stage}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </Section>

        <Section title="ملاحظات الفريق" bodyClassName="flex flex-col gap-2.5 p-4 text-[12px]">
          {notes.map((n, i) => (
            <div key={i} className="border-s-[3px] border-line bg-cream px-3 py-2.5 leading-relaxed">{`${n.by} · ${fmtDate(n.at)}: ${n.text}`}</div>
          ))}
          <textarea
            aria-label="أضف ملاحظة"
            placeholder="أضف ملاحظة…"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={addNote}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addNote();
              }
            }}
            className="min-h-20 border-interactive bg-paper px-3 py-2.5 text-[13px] focus:border-gold focus:bg-cream-focus focus-visible:outline-0"
          />
          <div className="mt-1 flex flex-col items-start gap-2 border-t border-line pt-3">
            <span className="font-extrabold">الإيقاف</span>
            <span className="leading-relaxed text-muted">
              <MarkedText text={`يُوقف العضو عند: تخطّي سجل إحالة، أو رخصة منتهية، أو بلا رد ${allianceSettings.defaults.suspendAfterNoReplyDays} يوماً [للتأكيد]. الإيقاف يخفيه من الدليل والرادار ويُبقي سجلاته، ويُرسل له السبب.`} />
            </span>
            <AdminButton variant="outline" size="md" disabled={suspended} onClick={() => setStopOpen(true)}>
              إيقاف العضوية مع السبب
            </AdminButton>
          </div>
        </Section>
      </div>

      <Dialog open={stopOpen} onClose={() => setStopOpen(false)} title={`إيقاف العضوية · ${o.nameAr}`} confirmLabel="إيقاف العضوية مع السبب" destructive confirmDisabled={!stopReason} onConfirm={suspend}>
        <AdminSelect label="السبب" value={stopReason} onChange={(e) => setStopReason(e.target.value)}>
          <option value="">اختر سبباً من القائمة…</option>
          {stopReasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </AdminSelect>
      </Dialog>

      <Drawer
        open={editing}
        onClose={() => setEditing(false)}
        title={`التغطية · ${o.nameAr}`}
        footer={
          <AdminButton variant="ink" size="lg" onClick={() => setEditing(false)}>
            احفظ
          </AdminButton>
        }
      >
        <DistrictMultiSelect districts={districts} value={o.districts} onChange={(slugs) => patch("office", o.id, { districts: slugs })} />
      </Drawer>
    </G9Shell>
  );
}
