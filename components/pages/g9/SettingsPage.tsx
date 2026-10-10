"use client";
// /admin/alliance/settings (Admin-AllianceSettings-D). The charter (full text, defaults, summary), the routing weights
// with the sum check (save stays off until they add up to 100), the option lists and the three forms with their
// open / closed switch. Edits are kept in memory (store patch «alliance-settings») when saved from the sticky bar;
// a charter text change is announced as the next version that members must accept again.
import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminField, AdminSelect, AdminTextarea, Switch } from "@/components/admin";
import { MarkedText } from "@/components/ui";
import { districts, SECTORS } from "@/data/districts";
import { allianceSettings } from "@/data/settings";
import { usePatch, useStore } from "@/lib/store";
import { cx, fmtNum } from "@/lib/format";
import { AllianceTabs, G9Shell, RoomTitle, Section } from "./shell";

type Form = {
  fullText: string;
  summary: string;
  split: string;
  protectionDays: string;
  replyDays: string;
  ledger: string;
  speed: string;
  specialty: string;
  sendTo: string;
  autoSend: boolean;
  forms: Record<string, boolean>;
};

const TBC = "[للتأكيد]";
const S = allianceSettings;
/** The charter's numbered clauses one per line, as the board shows them in the field. */
const charterLines = (t: string) => t.replace(/\s(\d)\.\s/g, "\n$1. ");
const INITIAL: Form = {
  fullText: charterLines(S.charter.fullText),
  summary: S.charter.summary,
  split: S.defaults.splitOptions.find((o) => o.startsWith(S.defaults.split)) ?? S.defaults.splitOptions[0],
  protectionDays: String(S.defaults.protectionDays),
  replyDays: String(S.defaults.replyBusinessDays),
  ledger: String(S.routing.weights.ledger),
  speed: String(S.routing.weights.speed),
  specialty: String(S.routing.weights.specialty),
  sendTo: S.routing.sendToOptions.find((o) => o.includes(String(S.routing.sendTo))) ?? S.routing.sendToOptions[0],
  autoSend: S.routing.autoSend,
  forms: Object.fromEntries(S.forms.map((f) => [f.key, f.open])),
};
const num = (s: string) => (s.trim() === "" ? NaN : Number(s.replace(/[^\d]/g, "")));
const nextVersion = (v: string) => {
  const [maj, min] = v.split(".").map((x) => parseInt(x, 10));
  return `${maj}.${(min || 0) + 1}`;
};

function Chips({ title, items, aside }: { title: string; items: React.ReactNode[]; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] font-extrabold">
        {title}
        {aside && <span className="font-semibold text-muted"> {aside}</span>}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span key={i} className="inline-flex min-h-9 items-center gap-1.5 border-interactive bg-paper px-2.5 text-[12px] font-bold">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const saved = usePatch<Partial<Form> & { version?: string }>("alliance-settings", "main");
  const patch = useStore((s) => s.patch);
  const toast = useStore((s) => s.toast);
  const base: Form = useMemo(() => ({ ...INITIAL, ...(saved ?? {}), forms: { ...INITIAL.forms, ...(saved?.forms ?? {}) } }), [saved]);
  const [draft, setDraft] = useState<Partial<Form>>({});
  const f: Form = { ...base, ...draft, forms: { ...base.forms, ...(draft.forms ?? {}) } };
  const set = (d: Partial<Form>) => setDraft((x) => ({ ...x, ...d }));
  const dirty = (Object.keys(draft) as (keyof Form)[]).some((k) => JSON.stringify(f[k]) !== JSON.stringify(base[k]));
  const weights = [num(f.ledger), num(f.speed), num(f.specialty)];
  const sum = weights.reduce((s, w) => s + (Number.isNaN(w) ? 0 : w), 0);
  const sumOk = sum === 100 && weights.every((w) => !Number.isNaN(w));
  const daysOk = num(f.protectionDays) > 0 && num(f.replyDays) > 0;
  const version = saved?.version ?? S.charter.version;
  const tbcCount = (f.fullText.match(/\[للتأكيد\]/g) ?? []).length;

  const save = () => {
    if (!dirty || !sumOk || !daysOk) return;
    const charterChanged = f.fullText !== base.fullText;
    const v = charterChanged ? nextVersion(version) : version;
    patch("alliance-settings", "main", { ...draft, forms: f.forms, version: v });
    setDraft({});
    toast(charterChanged ? `حُفظت الإعدادات · أُنشئت النسخة ${v} من الميثاق وتُطلب موافقة الأعضاء مجدداً` : "حُفظت إعدادات التحالف");
  };

  const routingRow = (label: string, key: "ledger" | "speed" | "specialty") => (
    <div className="grid grid-cols-[1fr_64px] items-center gap-3 text-[13px]">
      <label htmlFor={`w-${key}`}>{label}</label>
      <input
        id={`w-${key}`}
        inputMode="numeric"
        dir="ltr"
        value={f[key]}
        onChange={(e) => set({ [key]: e.target.value } as Partial<Form>)}
        aria-invalid={!sumOk || undefined}
        className={cx("h-10 px-2 text-center text-[13px] font-extrabold tnum focus-visible:outline-0", sumOk ? "border-interactive bg-paper focus:border-gold focus:bg-cream-focus" : "border-error")}
      />
    </div>
  );

  return (
    <G9Shell title={<RoomTitle section="الميثاق والإعدادات" />} subtitle="نص الميثاق، الافتراضيات، أوزان التوجيه، قوائم الخيارات، والتحكم في النماذج الثلاثة. التغييرات هنا تحتاج صلاحية مدير" mainClassName="pb-0 md:pb-0">
      <AllianceTabs active="settings" />

      <div className="grid items-start gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Section title="نص الميثاق" aside={`النسخة ${version} · أي تعديل ينشئ ${nextVersion(version)} ويطلب موافقة الأعضاء مجدداً`} bodyClassName="flex flex-col gap-4 p-4">
          <AdminTextarea label="الميثاق كما يظهر للمكاتب (الكامل)" source="tbc" hint={<></>} rows={9} value={f.fullText} onChange={(e) => set({ fullText: e.target.value })} />
          <div className="grid gap-3 md:grid-cols-3">
            <AdminSelect label="تقسيم العمولة الافتراضي" source="tbc" hint={<></>} value={f.split} onChange={(e) => set({ split: e.target.value })}>
              {S.defaults.splitOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </AdminSelect>
            <AdminField label="فترة الحماية (يوماً)" source="tbc" hint={<></>} ltr inputMode="numeric" value={f.protectionDays} onChange={(e) => set({ protectionDays: e.target.value })} error={num(f.protectionDays) > 0 ? undefined : "اكتب عدد الأيام"} />
            <AdminField label="مهلة الرد على الطلب (أيام عمل)" ltr inputMode="numeric" value={f.replyDays} onChange={(e) => set({ replyDays: e.target.value })} error={num(f.replyDays) > 0 ? undefined : "اكتب عدد الأيام"} />
          </div>
          <AdminTextarea label="ملخّص الميثاق (3 أسطر في الصفحة العامة)" rows={3} value={f.summary} onChange={(e) => set({ summary: e.target.value })} />
        </Section>

        <div className="flex min-w-0 flex-col gap-5">
          <Section title="أوزان التوجيه" aside="كيف يُرتَّب الأعضاء الذين يغطون الحي" bodyClassName="flex flex-col gap-3 p-4">
            {routingRow("الميزان (أعطى مقابل استقبل)", "ledger")}
            {routingRow("سرعة الرد ضمن الدوام", "speed")}
            {routingRow("تطابق التخصص مع نوع الطلب", "specialty")}
            <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-[12px]" role="status">
              <span className="text-muted">المجموع</span>
              <strong className={cx("font-extrabold tnum", !sumOk && "text-gold-text")}>{fmtNum(sum)}</strong>
            </div>
            {!sumOk && (
              <span role="alert" className="flex items-center gap-1.5 text-[12px] font-bold">
                <span aria-hidden className="hex-point size-2 shrink-0 bg-gold" />
                {`المجموع ${fmtNum(sum)} · يجب أن يساوي 100`}
              </span>
            )}
            <div className="grid grid-cols-[1fr_120px] items-center gap-3 text-[13px]">
              <label htmlFor="send-to">عدد المكاتب التي يُرسل لها الطلب</label>
              <select id="send-to" value={f.sendTo} onChange={(e) => set({ sendTo: e.target.value })} className="h-10 border-interactive bg-paper px-2 text-[13px] font-bold">
                {S.routing.sendToOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex flex-col gap-0.5 text-[13px] font-bold" id="auto-send">
                الإرسال التلقائي عبر واتساب بزنس
                <span className="text-[11px] font-semibold text-muted">مطفأ: زر «أرسل على واتساب» لكل مكتب</span>
              </span>
              <Switch checked={f.autoSend} onChange={(v) => set({ autoSend: v })} aria-labelledby="auto-send" />
            </div>
          </Section>

          <Section title="قوائم الخيارات" aside="تُستخدم في النماذج والرادار" bodyClassName="flex flex-col gap-4 p-4" id="lists">
            <Chips title={`الجهات · ${S.options.sectors.length}`} items={S.options.sectors} />
            <Chips
              title={`الأحياء · ${districts.length}`}
              aside="مرتبطة بقوائم الموقع، كل حي بجهة"
              items={[
                ...districts.slice(0, 4).map((d) => (
                  <>
                    {d.ar}
                    <span className="text-[11px] text-gold-text">{SECTORS[d.sector].ar.replace(" جدة", "")}</span>
                  </>
                )),
                <Link key="more" href="/admin/content/lists" className="text-ink no-underline hover:underline">
                  {`+ ${districts.length - 4} · تحرير`}
                </Link>,
              ]}
            />
            <Chips title={`التخصصات · ${S.options.specialties.length}`} items={S.options.specialties} />
            <Chips title={`طريقة الدوام · ${S.options.hours.length}`} items={S.options.hours} />
            <Chips title={`صفة مقدم الطلب · ${S.options.applicantRoles.length}`} items={S.options.applicantRoles} />
          </Section>
        </div>
      </div>

      <Section title="النماذج الثلاثة" aside="كانت نماذج قوقل · كل نموذج: مفتوح أو مغلق، خياراته، وتصدير">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[1.6fr_120px_140px_130px_120px] gap-3 border-b border-line bg-cream px-4 py-2.5 text-[11px] font-extrabold text-muted">
              <span>النموذج</span>
              <span>الحالة</span>
              <span>الردود</span>
              <span>الخيارات</span>
              <span>تصدير</span>
            </div>
            {S.forms.map((form) => {
              const open = f.forms[form.key];
              return (
                <div key={form.key} className="grid grid-cols-[1.6fr_120px_140px_130px_120px] items-center gap-3 border-b border-line px-4 py-3.5 text-[13px]">
                  <span>
                    <strong className="font-extrabold">{form.nameAr}</strong>
                    <br />
                    <span className="text-[11px] text-muted">
                      <MarkedText text={form.metaAr} />
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-[12px] font-bold">
                    <span id={`form-${form.key}`}>{open ? "مفتوح" : "مغلق"}</span>
                    <Switch checked={open} onChange={(v) => set({ forms: { ...(draft.forms ?? {}), [form.key]: v } })} aria-labelledby={`form-${form.key}`} />
                  </span>
                  <span className="tnum">{`${fmtNum(form.responses)}${form.imported ? ` (+${form.imported} مستورد)` : ""}`}</span>
                  <Link href={form.key === "add" ? "/admin/content/lists" : "#lists"} className="inline-flex h-10 items-center justify-center border-interactive bg-paper px-3 text-[12px] font-extrabold text-ink no-underline hover:bg-sand">
                    الخيارات
                  </Link>
                  <button type="button" onClick={() => toast(`صُدّر ملف «${form.nameAr}» · CSV`)} className="h-10 border-interactive bg-paper px-3 text-[12px] font-extrabold hover:bg-sand">
                    CSV
                  </button>
                </div>
              );
            })}
            <p className="px-4 py-3 text-[11px] text-muted">النموذج المغلق يعرض للزائر: «التسجيل متوقف مؤقتاً، اترك جوالك ونخبرك عند الفتح» بلا حذف ما سُجّل. التصدير يشمل كل الحقول وتاريخ الرد ومرحلة المراجعة.</p>
          </div>
        </div>
      </Section>

      <div aria-label="شريط الحفظ" role="region" className="sticky bottom-0 z-20 -mx-4 mt-2 flex flex-wrap items-center justify-between gap-3 border-t-2 border-gold bg-ink px-4 py-3.5 text-paper md:-mx-8 md:px-8">
        <span className="flex items-center gap-2 text-[13px] font-bold">
          <span aria-hidden className="hex-point size-2.5 shrink-0 bg-gold" />
          <span>
            {`${tbcCount} حقول بوسم `}
            <MarkedText text={TBC} />
            {` في الميثاق · ${!sumOk ? `المجموع ${fmtNum(sum)} لا يساوي 100` : dirty ? "تغييرات غير محفوظة" : "لا تغييرات غير محفوظة"}`}
          </span>
        </span>
        <span className="flex gap-2">
          <Link href="/alliance" className="inline-flex h-11 items-center border-[1.5px] border-paper px-4 text-[13px] font-bold text-paper no-underline hover:bg-ink-2">
            معاينة الصفحة العامة
          </Link>
          <button type="button" disabled={!dirty || !sumOk || !daysOk} onClick={save} className="cut-s h-11 bg-gold px-5 text-[13px] font-extrabold text-ink hover:bg-gold-hover disabled:bg-ink-2 disabled:text-on-ink-muted">
            حفظ
          </button>
        </span>
      </div>
    </G9Shell>
  );
}
