"use client";
// /admin/users (Admin-Users-D): the admin users with the pending invite and the invite form, WhatsApp Business in
// the state the presenter `wa` switch selects (connected by default; ?wa=manual → «غير متصل · وضع يدوي», which also
// switches the send buttons of approvals and requests), the fixed roles matrix and the audit log with its filters.
import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { MarkedText } from "@/components/ui";
import { adminUsers, auditLog, rolesMatrix } from "@/data/content";
import { settings } from "@/data/settings";
import type { AdminUser } from "@/data/types";
import { usePresenter } from "@/lib/presenter";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";
import { ctl, Field } from "./controls";
import { ContentHead, G8Shell, HexYes, SAUD } from "./shell";

const ROLE_AR: Record<AdminUser["role"], string> = { manager: "مدير", editor: "محرر" };
const BTN = "flex h-[34px] cursor-pointer items-center border-[1.5px] border-ink bg-paper px-3 text-[12px] font-extrabold motion-hover transition-colors hover:bg-sand";
/** 11px muted meta words (`.m` on the board). */
const META = "text-caption font-semibold text-muted";
const PERIODS = ["آخر 30 يوماً", "آخر 90 يوماً"];

interface Row extends AdminUser {
  suspended?: boolean;
}

export function UsersPage() {
  const { state, set } = usePresenter();
  const toast = useStore((s) => s.toast);
  const manual = state.wa === "manual";
  const [users, setUsers] = useState<Row[]>(adminUsers);
  const [roleEdit, setRoleEdit] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminUser["role"]>("editor");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [who, setWho] = useState("كل المستخدمين");
  const [period, setPeriod] = useState(PERIODS[0]);

  const active = users.filter((u) => !u.pending && !u.suspended).length;
  const pending = users.filter((u) => u.pending).length;
  const people = useMemo(() => [...new Set(auditLog.map((a) => a.user).filter((u) => u !== "النظام"))], []);
  const log = auditLog.filter((a) => who === "كل المستخدمين" || a.user === who);

  const invite = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "اكتب الاسم الكامل";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "اكتب بريداً صحيحاً";
    setErrors(e);
    if (Object.keys(e).length) return;
    setUsers((prev) => [...prev, { id: `u-${Date.now().toString(36)}`, name: "دعوة معلّقة", initial: "؟", role, roleAr: role === "manager" ? "مدير" : "محرر", email: email.trim(), lastLoginAr: "أُرسلت الآن · تنتهي بعد 7 أيام", pending: true }]);
    toast(`أُرسلت الدعوة إلى ${email.trim()} بدور «${ROLE_AR[role]}» · لم يُرسل شيء فعلياً في النموذج`, { kind: "ok" });
    setName("");
    setEmail("");
  };
  const exportCsv = () => {
    const rows = [["الوقت", "المستخدم", "الإجراء"], ...log.map((a) => [a.whenAr, a.user, a.textAr])];
    const csv = "﻿" + rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "smq-audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("صُدِّر السجل إلى ملف CSV على جهازك", { kind: "ok" });
  };

  const note = settings.whatsappBusiness.disconnectedNoteAr ?? "";
  const at = note.lastIndexOf("الموافقات");
  const noteBefore = at >= 0 ? note.slice(0, at) : note;
  const noteAfter = at >= 0 ? note.slice(at + "الموافقات".length) : "";

  return (
    <G8Shell user={SAUD} active="users">
      <ContentHead
        title="الإعدادات والمستخدمون"
        subtitle="من يدخل اللوحة وماذا يستطيع، وحالة ربط واتساب بزنس. لا حسابات للزوار في أي مكان على الموقع"
        actions={
          <a href="#invite" className="flex h-10 items-center bg-ink px-4 text-label font-extrabold text-paper no-underline cut-s motion-hover transition-colors hover:bg-ink-2">
            + دعوة مستخدم
          </a>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="users-h" className="border-interactive bg-paper">
          <header className="flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-ink bg-sand px-4 py-3">
            <h2 id="users-h" className="text-[15px] font-extrabold">
              المستخدمون <span className={META}>{active} نشطون{pending ? ` · ${pending === 1 ? "دعوة معلّقة" : `${pending} دعوات معلّقة`}` : ""}</span>
            </h2>
            <span className={META}>آخر دخول بتوقيت جدة</span>
          </header>
          {users.map((u) => (
            <div key={u.id} className={cx("flex flex-wrap items-center gap-3 border-b border-line px-4 py-3", u.pending && "bg-cream-focus", u.suspended && "opacity-60")}>
              <span aria-hidden className={cx("hex-flat flex size-9 shrink-0 items-center justify-center text-label font-extrabold", u.pending ? "bg-ink" : u.role === "manager" ? "bg-gold text-ink" : "bg-ink text-paper")}>
                {u.pending ? <span className="hex-flat flex size-8 items-center justify-center bg-paper text-ink">{u.initial}</span> : u.initial}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-[14px] font-extrabold">
                  {u.name}{" "}
                  {roleEdit === u.id ? (
                    <select
                      autoFocus
                      value={u.role}
                      onChange={(e) => {
                        const r = e.target.value as AdminUser["role"];
                        setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: r, roleAr: r === "manager" ? "مدير" : u.name.endsWith("ة") ? "محررة" : "محرر" } : x)));
                        setRoleEdit(null);
                        toast(`تغيّر دور ${u.name} إلى «${ROLE_AR[r]}» · سُجّل في سجل الإجراءات`, { kind: "ok" });
                      }}
                      onBlur={() => setRoleEdit(null)}
                      aria-label={`دور ${u.name}`}
                      className={ctl("admin", "ms-1 inline-block h-8 w-auto px-2 text-[12px]")}
                    >
                      <option value="editor">محرر</option>
                      <option value="manager">مدير</option>
                    </select>
                  ) : (
                    <span className={cx("ms-1 border-[1.5px] border-ink px-2 py-px text-caption font-extrabold", u.role === "manager" && !u.pending && "bg-ink text-paper")}>{u.roleAr}</span>
                  )}
                  {u.suspended && <span className="ms-1.5 text-caption font-bold text-muted">موقوف</span>}
                </span>
                <span dir="ltr" className={cx(META, "text-right")}>
                  {u.email} · {u.lastLoginAr}
                </span>
              </div>
              {u.noteAr ? (
                <span className={META}>{u.noteAr}</span>
              ) : u.pending ? (
                <span className="flex gap-2">
                  <button type="button" className={BTN} onClick={() => toast(`أُعيد إرسال الدعوة إلى ${u.email}`, { kind: "ok" })}>
                    إعادة الإرسال
                  </button>
                  <button type="button" className={BTN} onClick={() => { setUsers((prev) => prev.filter((x) => x.id !== u.id)); toast(`أُلغيت الدعوة إلى ${u.email}`, { kind: "info" }); }}>
                    إلغاء
                  </button>
                </span>
              ) : (
                <span className="flex gap-2">
                  <button type="button" className={BTN} onClick={() => setRoleEdit(u.id)}>
                    تعديل الدور
                  </button>
                  <button type="button" className={BTN} onClick={() => { setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, suspended: !x.suspended } : x))); toast(u.suspended ? `أُعيد تفعيل ${u.name}` : `أُوقف دخول ${u.name} · يمكن إعادته في أي وقت`, { kind: "info" }); }}>
                    {u.suspended ? "إعادة التفعيل" : "إيقاف"}
                  </button>
                </span>
              )}
            </div>
          ))}
          <div id="invite" className="flex scroll-mt-20 flex-col gap-2.5 bg-cream px-4 py-4">
            <span className="text-[12px] font-extrabold">دعوة مستخدم</span>
            <div className="grid items-start gap-2.5 md:grid-cols-[1fr_1fr_150px_auto]">
              <Field label="الاسم" note={errors.name} noteTone="gold">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="الاسم الكامل" className={ctl(errors.name ? "error" : "admin", "h-11 text-label")} />
              </Field>
              <Field label="البريد" note={errors.email} noteTone="gold">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@smqre.com" dir="ltr" type="email" className={ctl(errors.email ? "error" : "admin", "h-11 text-right text-label")} />
              </Field>
              <Field label="الدور">
                <select value={role} onChange={(e) => setRole(e.target.value as AdminUser["role"])} className={ctl("admin", "h-11 cursor-pointer text-label font-bold")}>
                  <option value="editor">محرر</option>
                  <option value="manager">مدير</option>
                </select>
              </Field>
              <button type="button" onClick={invite} className="mt-[22px] flex h-11 cursor-pointer items-center justify-center bg-ink px-4 text-label font-extrabold text-paper motion-hover transition-colors hover:bg-ink-2">
                أرسل الدعوة
              </button>
            </div>
            <span className="text-[12px] text-muted">تصل الدعوة بالبريد وتصلح 7 أيام. المستخدم يضع كلمة مروره بنفسه. لا تسجيل ذاتي من صفحة الدخول.</span>
          </div>
        </section>

        {manual ? (
          <section aria-labelledby="wa-h" className="border-[1.5px] border-dashed border-ink bg-paper">
            <header className="flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-gold bg-cream-focus px-4 py-3">
              <h2 id="wa-h" className="text-[15px] font-extrabold">
                واتساب بزنس
              </h2>
              <span className="flex items-center gap-1.5 text-[12px] font-extrabold text-gold-text">
                <span aria-hidden className="hex-flat flex size-2.5 items-center justify-center bg-ink">
                  <span className="hex-flat block size-1.5 bg-paper" />
                </span>
                غير متصل · وضع يدوي
              </span>
            </header>
            <div className="flex flex-col gap-2.5 px-4 py-3.5 text-label font-normal">
              <span>
                {noteBefore}
                {at >= 0 && (
                  <Link href="/admin/approvals" className="font-extrabold text-gold-text no-underline hover:underline">
                    الموافقات
                  </Link>
                )}
                {noteAfter}
              </span>
              <button type="button" onClick={() => { set("wa", "connected"); toast("أُعيد ربط واتساب بزنس · الإرسال تلقائي من جديد", { kind: "ok" }); }} className="flex h-10 cursor-pointer items-center justify-center bg-gold px-4 text-label font-extrabold text-ink cut-s motion-hover transition-colors hover:bg-gold-hover">
                إعادة الربط الآن
              </button>
            </div>
          </section>
        ) : (
          <section aria-labelledby="wa-h" className="border-interactive bg-paper">
            <header className="flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-ink bg-sand px-4 py-3">
              <h2 id="wa-h" className="text-[15px] font-extrabold">
                واتساب بزنس
              </h2>
              <span className="flex items-center gap-1.5 text-[12px] font-extrabold">
                <span aria-hidden className="hex-flat block size-2.5 bg-gold" />
                متصل
              </span>
            </header>
            <div className="flex flex-col gap-2.5 px-4 py-3.5 text-label font-normal">
              <Line label="الرقم" value={<span dir="ltr">{settings.whatsappBusiness.number}</span>} />
              <Line label="آخر رسالة تلقائية" value={settings.whatsappBusiness.lastSync} />
              <Line label="القوالب المعتمدة" value={settings.whatsappBusiness.templatesApproved ?? ""} />
              <p className="bg-sand px-3 py-2.5 text-[12px] leading-[1.6]">
                <strong className="font-extrabold">الوضع اليدوي</strong> يعمل تلقائياً إذا انقطع الاتصال: تظهر أزرار «أرسل على واتساب» بدل الإرسال التلقائي في الموافقات والطلبات الواردة، ويُسجَّل كل إرسال يدوي في السجل.
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={BTN} onClick={() => toast("أُعيد ربط واتساب بزنس · الاتصال سليم", { kind: "ok" })}>
                  إعادة الربط
                </button>
                <button type="button" className={BTN} onClick={() => { set("wa", "manual"); toast("تحوّلت اللوحة إلى الوضع اليدوي · أزرار «أرسل على واتساب» ظاهرة في الموافقات والطلبات", { kind: "info" }); }}>
                  تحويل إلى الوضع اليدوي
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      <section aria-labelledby="roles-h" className="border-interactive bg-paper">
        <header className="flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-ink bg-sand px-4 py-3">
          <h2 id="roles-h" className="text-[15px] font-extrabold">
            الأدوار والصلاحيات
          </h2>
          <span className={META}>دوران فقط. الصلاحيات ثابتة في النسخة الأولى، تُعرض للتوضيح لا للتعديل</span>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-[12px] font-normal">
            <thead>
              <tr className="bg-cream text-[12px] font-extrabold">
                <th scope="col" className="px-3 py-2 text-start">الإجراء</th>
                <th scope="col" className="w-20 px-3 py-2 text-start">مدير</th>
                <th scope="col" className="w-20 px-3 py-2 text-start">محرر</th>
                <th scope="col" className="px-3 py-2 text-start">ملاحظة</th>
              </tr>
            </thead>
            <tbody>
              {rolesMatrix.map((r) => (
                <tr key={r.actionAr} className="border-t border-line">
                  <td className="px-3 py-2">
                    <MarkedText text={r.actionAr} />
                  </td>
                  <td className="px-3 py-2">
                    <HexYes on={r.manager} />
                  </td>
                  <td className="px-3 py-2">
                    <HexYes on={r.editor} />
                  </td>
                  <td className={cx(META, "px-3 py-2")}>{r.noteAr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="log-h" className="border-interactive bg-paper">
        <header className="flex min-h-[52px] flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-ink bg-sand px-4 py-3">
          <h2 id="log-h" className="text-[15px] font-extrabold">
            سجل الإجراءات
          </h2>
          <div className="flex flex-wrap gap-2">
            <select value={who} onChange={(e) => setWho(e.target.value)} aria-label="المستخدم" className={ctl("admin", "h-9 w-[150px] cursor-pointer text-[12px] font-bold")}>
              <option>كل المستخدمين</option>
              {people.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="الفترة" className={ctl("admin", "h-9 w-[150px] cursor-pointer text-[12px] font-bold")}>
              {PERIODS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <button type="button" onClick={exportCsv} className={BTN}>
              تصدير CSV
            </button>
          </div>
        </header>
        <div className="grid grid-cols-[120px_90px_1fr] gap-3 bg-cream px-4 py-[9px] text-caption font-extrabold text-muted">
          <span>الوقت</span>
          <span>المستخدم</span>
          <span>الإجراء</span>
        </div>
        {log.map((a) => (
          <div key={a.at + a.textAr} className="grid grid-cols-[120px_90px_1fr] gap-3 border-t border-line px-4 py-[9px] text-[12px] font-normal">
            <span>{a.whenAr}</span>
            <span>{a.user}</span>
            <span className="min-w-0 [overflow-wrap:anywhere]">{a.textAr}</span>
          </div>
        ))}
      </section>
    </G8Shell>
  );
}

function Line({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <span className={META}>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
