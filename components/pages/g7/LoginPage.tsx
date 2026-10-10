"use client";
// /admin/login (Admin-Login-M, Admin-Login-D). Accepts anything non-empty and opens /admin; the designed error shows
// with ?error=1 (presenter «Login error») or when a field is submitted empty. No session: every admin route is open.
import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lockup } from "@/components/ui";
import { BRAND_AR, COPYRIGHT_YEAR, LICENCE } from "@/components/ui/constants";
import { adminUsers } from "@/data/content";
import { usePresenter } from "@/lib/presenter";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";

const DEMO_EMAIL = adminUsers[0]?.email ?? "";
const DEMO_PASSWORD = "smq-demo-1";

export function LoginPage() {
  const { state } = usePresenter();
  const router = useRouter();
  const toast = useStore((s) => s.toast);
  const id = useId();
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);

  const emailValue = email ?? (state.error ? DEMO_EMAIL : "");
  const passwordValue = password ?? (state.error ? DEMO_PASSWORD : "");
  const empty = !emailValue.trim() || !passwordValue;
  const error = state.error || (tried && empty);

  function submit(e: FormEvent) {
    e.preventDefault();
    setTried(true);
    if (empty) return;
    router.push("/admin");
  }

  const field = cx("h-[52px] w-full bg-paper px-4 text-[15px] font-semibold text-ink outline-none", error ? "border-error" : "border-interactive");
  return (
    <div className="flex min-h-dvh flex-col bg-cream text-ink md:grid md:grid-cols-2">
      <aside className="bg-ink px-5 pb-6 pt-7 text-paper [clip-path:polygon(0_0,100%_0,100%_100%,40px_100%,0_calc(100%-23px))] md:flex md:flex-col md:justify-between md:px-12 md:py-12 md:[clip-path:none]">
        <Lockup tone="goldmark-white" height={30} className="self-start md:h-10" />
        <div className="mt-4.5 md:mt-0">
          <p className="text-[12px] font-bold text-gold md:text-[13px]">لوحة الإدارة</p>
          <p className="mt-2.5 text-[22px] font-extrabold leading-snug md:mt-3 md:max-w-[520px] md:text-[40px] md:leading-tight">
            <span className="md:hidden">الوحدات والطلبات والأرقام، من جوالك</span>
            <span className="hidden md:inline">الوحدات، الطلبات، والأرقام، في مكان واحد</span>
          </p>
          <p className="mt-3 hidden text-[13px] text-on-ink-muted md:block">للفريق فقط. لا تسجيل جديد من هنا؛ الحسابات تُنشأ من «الإعدادات والمستخدمون».</p>
        </div>
        <p className="hidden text-[12px] text-on-ink-muted md:block">
          © {COPYRIGHT_YEAR} {BRAND_AR} · ترخيص الهيئة العامة للعقار {LICENCE.rega}
        </p>
      </aside>

      <main className="flex flex-1 flex-col justify-between px-5 pb-6 pt-6 md:items-center md:justify-center md:px-12">
        <form noValidate onSubmit={submit} className="flex flex-col gap-3.5 md:w-full md:max-w-[486px] md:gap-4 md:border-interactive md:bg-paper md:p-8" aria-labelledby={`${id}-h`}>
          <h1 id={`${id}-h`} className="text-[22px] font-extrabold leading-[normal] md:text-[24px]">
            تسجيل الدخول
          </h1>
          {error && (
            <div id={`${id}-err`} role="alert" className="flex items-start gap-3 border-error bg-cream-focus px-4 py-3 text-[13px] leading-relaxed">
              <span aria-hidden className="mt-[7px] size-2.5 shrink-0 bg-gold hex-point" />
              <span>
                <span className="md:hidden">البريد أو كلمة المرور غير صحيحة. بقيت محاولتان.</span>
                <span className="hidden md:inline">البريد أو كلمة المرور غير صحيحة. بقيت محاولتان قبل إيقاف الحساب 15 دقيقة.</span>
              </span>
            </div>
          )}
          <label className="flex flex-col gap-1.5 text-[12px] font-bold leading-[normal] text-muted">
            البريد الإلكتروني
            <input
              type="email"
              dir="ltr"
              autoComplete="username"
              value={emailValue}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error || undefined}
              aria-describedby={error ? `${id}-err` : undefined}
              className={cx(field, "text-right")}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[12px] font-bold leading-[normal] text-muted">
            كلمة المرور
            <span className={cx("flex h-[52px] items-stretch bg-paper", error ? "border-error" : "border-interactive")}>
              <input
                type={show ? "text" : "password"}
                dir="ltr"
                autoComplete="current-password"
                value={passwordValue}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={error || undefined}
                aria-describedby={error ? `${id}-err` : undefined}
                className="min-w-0 flex-1 bg-transparent px-4 text-right text-[15px] font-semibold text-ink outline-none"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                aria-pressed={show}
                className="flex w-12 shrink-0 items-center justify-center border-s border-line bg-paper text-ink"
              >
                <EyeIcon off={show} />
              </button>
            </span>
          </label>
          <label className="-my-2.5 flex min-h-11 items-center gap-2.5 text-[13px]">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="size-[18px] accent-ink" />
            <span className="md:hidden">تذكرني 30 يوماً</span>
            <span className="hidden md:inline">تذكرني على هذا الجهاز 30 يوماً</span>
          </label>
          <button type="submit" className="cut-m motion-hover h-[54px] bg-ink md:h-14 text-[16px] font-extrabold text-paper hover:bg-ink-2">
            دخول
          </button>
          <button type="button" onClick={() => toast("يصلك رابط على البريد", { kind: "info" })} className="-my-2 self-start py-2 text-[13px] font-bold text-gold-text hover:text-ink hover:underline">
            <span className="md:hidden">نسيت كلمة المرور؟</span>
            <span className="hidden md:inline">نسيت كلمة المرور؟ يصلك رابط على البريد</span>
          </button>
        </form>
        <p className="mt-10 text-caption text-muted md:hidden">للفريق فقط · لا تسجيل جديد من هنا</p>
      </main>
    </div>
  );
}

function EyeIcon({ off }: { off?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}
