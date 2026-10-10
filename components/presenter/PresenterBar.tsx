"use client";
// The presenter bar (hidden from visitors): Shift+P or ?demo=1. One control per switch of docs/route-map.md.
import Link from "next/link";
import { PRESENTER_DEFAULTS, usePresenter, type PresenterState } from "@/lib/presenter";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";

type Opt<K extends keyof PresenterState> = { value: PresenterState[K]; label: string };
function Group<K extends keyof PresenterState>({ label, k, options }: { label: string; k: K; options: Opt<K>[] }) {
  const { state, set } = usePresenter();
  return (
    <div className="flex items-center gap-1 shrink-0" role="group" aria-label={label}>
      <span className="text-[10px] font-bold text-on-ink-muted whitespace-nowrap">{label}</span>
      <div className="flex border border-ink-2">
        {options.map((o) => {
          const active = state[k] === o.value;
          return (
            <button key={String(o.value)} type="button" onClick={() => set(k, o.value)} aria-pressed={active}
              className={cx("px-2 min-h-7 text-[11px] font-bold whitespace-nowrap motion-hover transition-colors", active ? "bg-gold text-ink" : "text-paper hover:bg-ink-2")}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PresenterBar() {
  const { state, set, reset } = usePresenter();
  const resetStore = useStore((s) => s.reset);
  const toast = useStore((s) => s.toast);
  if (!state.demo) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-ink text-paper border-t-2 border-gold" data-presenter-bar>
      <div className="flex items-center gap-3 px-3 py-1.5 overflow-x-auto">
        <span className="text-caption font-extrabold text-gold whitespace-nowrap">العرض</span>
        <Link href="/demo" className="text-[11px] font-bold underline whitespace-nowrap">خريطة الشاشات</Link>
        <Link href="/demo/components" className="text-[11px] font-bold underline whitespace-nowrap">المكونات</Link>
        <Group label="التحالف" k="members" options={[{ value: 12, label: "12" }, { value: 0, label: "0" }]} />
        <Group label="الصور" k="tier" options={[{ value: "gen", label: "تعبيرية" }, { value: "real", label: "فعلية" }, { value: "typo", label: "طباعي" }]} />
        <Group label="الوحدة" k="ustatus" options={[{ value: null, label: "تلقائي" }, { value: "available", label: "متاح" }, { value: "reserved", label: "محجوز" }, { value: "sold", label: "مباع" }]} />
        <Group label="الطلب" k="app" options={[{ value: null, label: "تلقائي" }, { value: "review", label: "مراجعة" }, { value: "verified", label: "موثّق" }, { value: "rejected", label: "مرفوض" }]} />
        <Group label="طلب العضو" k="mreq" options={[{ value: null, label: "تلقائي" }, { value: "open", label: "مفتوح" }, { value: "answered", label: "مُجاب" }, { value: "expired", label: "منتهٍ" }]} />
        <Group label="واتساب" k="wa" options={[{ value: "connected", label: "متصل" }, { value: "manual", label: "يدوي" }]} />
        <Group label="هياكل" k="skeleton" options={[{ value: false, label: "لا" }, { value: true, label: "نعم" }]} />
        <Group label="[للتأكيد]" k="marks" options={[{ value: true, label: "ظاهر" }, { value: false, label: "مخفي" }]} />
        <Group label="الإثبات" k="proof" options={[{ value: false, label: "لا" }, { value: true, label: "نعم" }]} />
        <Group label="انقطاع" k="offline" options={[{ value: false, label: "لا" }, { value: true, label: "نعم" }]} />
        <Group label="فارغ" k="empty" options={[{ value: false, label: "لا" }, { value: true, label: "نعم" }]} />
        <button type="button" onClick={() => { reset(); resetStore(); toast("أُعيد ضبط العرض والبيانات المؤقتة"); }} className="shrink-0 min-h-7 px-2 border border-on-ink-muted text-[11px] font-bold whitespace-nowrap">إعادة ضبط</button>
        <button type="button" onClick={() => set("demo", PRESENTER_DEFAULTS.demo)} aria-label="إخفاء شريط العرض" className="shrink-0 min-h-7 px-2 text-on-ink-muted text-label">×</button>
      </div>
    </div>
  );
}
