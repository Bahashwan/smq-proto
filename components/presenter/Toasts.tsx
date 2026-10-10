"use client";
import { useStore } from "@/lib/store";

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 start-4 z-40 flex flex-col gap-2 max-w-[360px]" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="bg-ink text-paper cut-m px-4 py-3 text-label flex items-center gap-3">
          <span className="hex-point bg-gold size-3 shrink-0" aria-hidden />
          <span className="flex-1">{t.text}</span>
          {t.action && (
            <a href={t.action.href} className="text-gold font-bold underline">
              {t.action.label}
            </a>
          )}
          <button type="button" onClick={() => dismiss(t.id)} aria-label="إغلاق" className="text-on-ink-muted">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
