"use client";
// /admin/marketers/[id] (Admin-MarketerDetail-D, MK-07 عبدالله الحربي). The stage strip moves the marketer by hand
// (store setMarketer); «إيقاف» asks first and disables the link. Data, tracked link, the three 30-day numbers, the
// attributed leads and the log come from data/marketers; notes added here live in memory (store patch).
import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminButton, AdminField, AdminTextarea, Dialog, Drawer, StatTile } from "@/components/admin";
import { Mark } from "@/components/ui";
import { districtAr } from "@/data/districts";
import { leads } from "@/data/leads";
import { marketerById, MARKETER_STAGE_LABELS, MARKETER_STAGES, trackedLink } from "@/data/marketers";
import { agoLabel, effectiveMarketerStage, marketerConversion, NOW } from "@/data/selectors";
import type { Marketer } from "@/data/types";
import { usePatch, useStore } from "@/lib/store";
import { cx, fmtDate, fmtNum } from "@/lib/format";
import { G9Shell, HexAvatar, Section } from "./shell";
import { agoLong, agoShort, cnt } from "./util";
import { initial } from "./MarketersPage";

type Edit = { name?: string; phoneMasked?: string; social?: string; bio?: string; slug?: string };
type Note = { by: string; at: string; text: string };

/** «نشط منذ 2026/09/14 · الروضة، الصفا، النعيم · 3 إلى 5 سنوات · آخر زيارة عبر رابطه أمس» */
function headLine(m: Marketer, stage: Marketer["stage"]): string {
  const since =
    stage === "active"
      ? m.activeSince && `نشط منذ ${fmtDate(m.activeSince)}`
      : stage === "suspended"
        ? m.suspendedOn && `أُوقف ${fmtDate(m.suspendedOn)}`
        : stage === "accepted"
          ? m.acceptedOn && `قُبل ${fmtDate(m.acceptedOn)}`
          : stage === "interview"
            ? m.interviewAt
            : m.submittedAt && `وصل ${agoShort(m.submittedAt)}`;
  const last = leads.filter((l) => l.viaMarketer === m.id).sort((a, b) => (a.at < b.at ? 1 : -1))[0];
  return [since, m.districts.map(districtAr).join("، "), m.yearsLabel, stage === "active" && last ? `آخر زيارة عبر رابطه ${agoLabel(last.at)}` : null].filter(Boolean).join(" · ");
}

function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[96px_1fr] items-baseline gap-3 border-b border-line py-3 text-[13px] last:border-b-0">
      <span className="text-muted">{label}</span>
      <span className="min-w-0 font-bold leading-relaxed">{children}</span>
    </div>
  );
}

export function MarketerDetailPage({ id }: { id: string }) {
  const base = marketerById(id);
  const overrides = useStore((s) => s.marketers);
  const setMarketer = useStore((s) => s.setMarketer);
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const edit = usePatch<Edit>("marketer", base?.id ?? "");
  const notePatch = usePatch<{ list: Note[] }>("marketer-notes", base?.id ?? "");
  const [confirmStop, setConfirmStop] = useState(false);
  const [editing, setEditing] = useState(false);
  const [slugEdit, setSlugEdit] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const m = useMemo<Marketer | undefined>(() => (base ? { ...base, ...(edit ?? {}) } : undefined), [base, edit]);
  if (!m || !base) return null;
  const stage = effectiveMarketerStage(m, overrides);
  const conv = marketerConversion(m, overrides);
  const link = trackedLink(m);
  const notes = notePatch?.list ?? [];

  const moveTo = (s: Marketer["stage"]) => {
    if (s === stage) return;
    if (s === "suspended") return setConfirmStop(true);
    setMarketer(m.id, s);
    toast(`انتقل إلى «${MARKETER_STAGE_LABELS[s]}»${s === "active" ? ` · أُنشئ الرابط ${link}` : ""}`);
  };
  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    patch("marketer-notes", m.id, { list: [...notes, { by: "سعود", at: NOW, text }] });
    setDraft("");
    toast("أُضيفت الملاحظة");
  };

  return (
    <G9Shell>
      <nav aria-label="المسار" className="text-[12px] font-bold text-muted">
        <Link href="/admin/marketers" className="text-gold-text no-underline hover:text-ink hover:underline">
          المسوّقون
        </Link>
        {` › ${MARKETER_STAGE_LABELS[stage]} › ${m.name}`}
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <HexAvatar letter={initial(m.name)} tone={stage === "suspended" ? "muted" : stage === "active" ? "gold" : "ink"} size={56} />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-h3 font-extrabold leading-tight md:text-[28px]">
              {m.name} <span className="text-[14px] font-bold text-muted">{m.id}</span>
            </h1>
            <span className="text-caption text-muted md:text-label">{headLine(m, stage)}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AdminButton variant="outline" size="md" onClick={() => toast(`${m.name} · ${m.phoneMasked}`, { kind: "info" })}>
            راسل على واتساب
          </AdminButton>
          <AdminButton variant="outline" size="md" onClick={() => setEditing(true)}>
            تعديل البيانات
          </AdminButton>
          {stage === "suspended" ? (
            <AdminButton variant="outline" size="md" onClick={() => moveTo("active")}>
              {MARKETER_STAGE_LABELS.active}
            </AdminButton>
          ) : (
            <AdminButton variant="outline" size="md" onClick={() => setConfirmStop(true)}>
              إيقاف
            </AdminButton>
          )}
        </div>
      </div>

      <div role="group" aria-label="المرحلة" className="grid grid-cols-5 border-interactive bg-paper">
        {MARKETER_STAGES.map((s, i) => {
          const on = s === stage;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => moveTo(s)}
              className={cx("min-h-11 px-2 text-[13px] font-extrabold motion-hover", on ? "bg-ink text-paper" : "text-ink hover:bg-sand", i > 0 && "border-s border-line")}
            >
              {MARKETER_STAGE_LABELS[s]}
            </button>
          );
        })}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_1.07fr] lg:gap-5">
        <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
          <Section title="البيانات والرخصة" bodyClassName="px-4 py-1">
            <DataRow label="الجوال">
              <span dir="ltr">{m.phoneMasked}</span>
            </DataRow>
            <DataRow label="رخصة فال">
              {m.licence ? (
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="hex-flat inline-block h-2.5 w-3 shrink-0 bg-gold" />
                  <span>
                    {[m.licence, m.licenceVerifiedOn && `موثّقة ${fmtDate(m.licenceVerifiedOn)}`, m.licenceExpiresOn && `تنتهي ${fmtDate(m.licenceExpiresOn)}`].filter(Boolean).join(" · ")}
                  </span>
                </span>
              ) : (
                "بلا رخصة"
              )}
            </DataRow>
            <DataRow label="حسابات التواصل">
              <span dir="ltr" className="inline-block">
                {m.social}
              </span>
            </DataRow>
            {m.bio && (
              <DataRow label="نبذة">
                <span className="font-semibold">{m.bio}</span>
              </DataRow>
            )}
            {m.cv && (
              <DataRow label="السيرة الذاتية">
                <a href="#cv" className="text-gold-text underline hover:text-ink" dir="ltr">
                  {m.cv}
                </a>
              </DataRow>
            )}
            {m.agreementOn && (
              <DataRow label="الاتفاقية">
                {`موقّعة ${fmtDate(m.agreementOn)} · نسبة العمولة `}
                {m.commission === "tbc" && <Mark>[للتأكيد]</Mark>}
              </DataRow>
            )}
          </Section>

          <Section title="الرابط المتابَع" aside="نسبة الزيارة 30 يوماً" bodyClassName="flex flex-col gap-3 p-4">
            {stage === "active" || stage === "suspended" ? (
              <>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={link}
                    aria-label="الرابط المتابَع"
                    dir="ltr"
                    className={cx("h-11 min-w-0 flex-1 border-interactive bg-cream px-3 text-[13px] font-bold", stage === "suspended" && "text-disabled line-through")}
                  />
                  <AdminButton
                    variant="outline"
                    size="lg"
                    className="h-11 px-3.5 text-[13px]"
                    onClick={() => {
                      void navigator.clipboard?.writeText(`https://${link}`).catch(() => undefined);
                      toast(`نُسخ الرابط · ${link}`);
                    }}
                  >
                    نسخ
                  </AdminButton>
                  <Link href={`/m/${m.token}`} className="inline-flex h-11 items-center border-interactive bg-paper px-3.5 text-[13px] font-bold text-ink no-underline hover:bg-sand">
                    QR
                  </Link>
                </div>
                {slugEdit != null ? (
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const slug = slugEdit.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
                      if (slug) {
                        patch("marketer", m.id, { slug });
                        toast(`تغيّر الرابط إلى smq-re.com/r/${slug}`);
                      }
                      setSlugEdit(null);
                    }}
                  >
                    <AdminField label="الاسم المختصر" ltr value={slugEdit} onChange={(e) => setSlugEdit(e.target.value)} className="flex-1" autoFocus />
                    <AdminButton type="submit" variant="ink" size="md" className="self-end">
                      احفظ
                    </AdminButton>
                  </form>
                ) : (
                  <div className="flex flex-wrap gap-2 text-[12px]">
                    <AdminButton variant="outline" size="sm" className="font-bold" onClick={() => setSlugEdit(m.slug)}>
                      غيّر الاسم المختصر
                    </AdminButton>
                    <AdminButton variant="outline" size="sm" className="font-bold" onClick={() => toast(`أُعيد إرسال صفحته على واتساب · ${m.phoneMasked}`)}>
                      أعد إرسال صفحته على واتساب
                    </AdminButton>
                  </div>
                )}
                <span className="text-caption leading-relaxed text-muted">صفحته الشخصية تُفتح من رابط خاص في واتساب بلا دخول وتعرض الرابط والـQR وثلاثة أرقام فقط.</span>
              </>
            ) : (
              <span className="text-[13px] text-muted">قُبلت · بانتظار إنشاء الرابط</span>
            )}
          </Section>
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:gap-5">
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <StatTile label="زيارات · 30 يوماً" value={fmtNum(m.stats.visits30d)} note={m.peakNoteAr} />
            <StatTile label="ضغطات واتساب" value={fmtNum(m.stats.whatsapp30d)} note={`${conv.pct}% · متوسط المسوّقين ${conv.avgPct}%`} />
            <StatTile label="طلبات منسوبة" value={fmtNum(m.stats.leads)} note={`${cnt(m.stats.negotiating, "صفقة", "صفقات")} قيد التفاوض`} variant="ink" />
          </div>

          <Section title="الطلبات المنسوبة إليه" aside="النسبة: أول رابط خلال 30 يوماً">
            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-[110px_1fr_1fr_0.7fr_100px] gap-3 border-b border-line px-4 py-3 text-caption font-extrabold text-muted">
                  <span>الوقت</span>
                  <span>الوحدة · القناة</span>
                  <span>الحالة</span>
                  <span>الفريق</span>
                  <span>الرمز</span>
                </div>
                {m.attributedLeads.length === 0 && <p className="px-4 py-4 text-[13px] text-muted">لا طلبات منسوبة بعد</p>}
                {m.attributedLeads.map((l) => {
                  const hot = !!m.negotiatingUnit && l.unit === m.negotiatingUnit;
                  const closed = l.status.startsWith("مغلق") || l.status === "بلا رد";
                  return (
                    <div key={l.code} className={cx("grid grid-cols-[110px_1fr_1fr_0.7fr_100px] items-baseline gap-3 border-b border-line px-4 py-3.5 text-[13px] last:border-b-0", hot && "bg-cream-focus")}>
                      <span>{agoLong(l.when)}</span>
                      <span>{`${l.unit} · ${l.channel}`}</span>
                      <span className={cx(hot ? "font-extrabold text-gold-text" : closed ? "font-bold text-muted" : "font-extrabold")}>{l.status}</span>
                      <span>{l.team}</span>
                      <span className="font-bold" dir="ltr" style={{ textAlign: "right" }}>
                        {l.code}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section title="ملاحظات الفريق والسجل" bodyClassName="flex flex-col gap-2 p-4 text-[12px]">
            {m.notes && <div className="border-s-[3px] border-line bg-cream px-3 py-2.5 leading-relaxed">{m.notes}</div>}
            {notes.map((n, i) => (
              <div key={i} className="border-s-[3px] border-gold bg-cream px-3 py-2.5 leading-relaxed">{`${n.by} · ${fmtDate(n.at.slice(0, 10))}: «${n.text}»`}</div>
            ))}
            <ul className="flex flex-col">
              {m.log.map((e, i) => (
                <li key={i} className="grid grid-cols-[88px_1fr] gap-3 py-1.5 text-muted">
                  <span className="tnum">{fmtDate(e.at)}</span>
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
            <AdminTextarea
              label="أضف ملاحظة"
              className="[&>span:first-child]:sr-only"
              placeholder="أضف ملاحظة…"
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  addNote();
                }
              }}
              onBlur={addNote}
            />
          </Section>
        </div>
      </div>

      <Dialog
        open={confirmStop}
        onClose={() => setConfirmStop(false)}
        title={`إيقاف ${m.name}`}
        confirmLabel="إيقاف"
        destructive
        onConfirm={() => {
          setMarketer(m.id, "suspended");
          setConfirmStop(false);
          toast(`أُوقف ${m.name} · الرابط معطّل`);
        }}
      >
        <p className="text-[13px] leading-relaxed">الإيقاف يعطّل الرابط فوراً ويُبقي الطلبات المنسوبة سابقاً في السجل.</p>
      </Dialog>

      <Drawer
        open={editing}
        onClose={() => setEditing(false)}
        title="تعديل البيانات"
        footer={
          <AdminButton variant="ink" size="lg" onClick={() => setEditing(false)}>
            احفظ
          </AdminButton>
        }
      >
        <div className="flex flex-col gap-3">
          <AdminField label="الاسم" value={m.name} onChange={(e) => patch("marketer", m.id, { name: e.target.value })} />
          <AdminField label="الجوال" ltr value={m.phoneMasked} onChange={(e) => patch("marketer", m.id, { phoneMasked: e.target.value })} />
          <AdminField label="حسابات التواصل" ltr value={m.social} onChange={(e) => patch("marketer", m.id, { social: e.target.value })} />
          <AdminTextarea label="نبذة" rows={3} value={m.bio} onChange={(e) => patch("marketer", m.id, { bio: e.target.value })} />
        </div>
      </Drawer>
    </G9Shell>
  );
}
