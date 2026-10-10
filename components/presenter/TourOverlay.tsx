"use client";
// Guided tour overlay: a card with the step text and next / previous over the real routes (?tour=…&step=n).
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePresenter } from "@/lib/presenter";
import { tourById, tourHref } from "@/lib/tours";

export function TourOverlay() {
  const { state } = usePresenter();
  const router = useRouter();
  const tour = tourById(state.tour);
  const step = tour ? Math.min(Math.max(state.step, 1), tour.steps.length) : 1;
  const current = tour?.steps[step - 1];

  useEffect(() => {
    if (!current?.highlight) return;
    const el = document.querySelector<HTMLElement>(current.highlight);
    if (!el) return;
    el.setAttribute("data-tour-highlight", "1");
    el.scrollIntoView({ block: "start", behavior: "auto" });
    return () => el.removeAttribute("data-tour-highlight");
  }, [current]);

  if (!tour || !current) return null;
  const go = (n: number) => router.push(tourHref(tour, n));
  const exit = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("tour");
    url.searchParams.delete("step");
    router.replace(url.pathname + url.search);
  };
  return (
    <aside className="fixed z-[60] inset-x-3 bottom-3 md:inset-x-auto md:end-6 md:bottom-6 md:w-[380px] bg-ink text-paper cut-l p-4 md:p-5 flex flex-col gap-3" role="dialog" aria-label={tour.title}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-caption font-bold text-gold">{tour.title} · {step} من {tour.steps.length}</span>
        <button type="button" onClick={exit} aria-label="إنهاء الجولة" className="text-on-ink-muted text-h3 leading-none px-2 min-h-11">×</button>
      </div>
      <h2 className="m-0 text-h3 font-extrabold">{current.title}</h2>
      <p className="m-0 text-label font-normal text-on-ink-muted">{current.text}</p>
      <div className="flex gap-2 pt-1">
        <button type="button" disabled={step <= 1} onClick={() => go(step - 1)} className="min-h-11 px-4 border border-on-ink-muted text-label font-bold disabled:opacity-40">السابق</button>
        {step < tour.steps.length ? (
          <button type="button" onClick={() => go(step + 1)} className="min-h-11 px-5 bg-gold text-ink cut-s text-label font-extrabold flex-1">التالي</button>
        ) : (
          <button type="button" onClick={exit} className="min-h-11 px-5 bg-gold text-ink cut-s text-label font-extrabold flex-1">إنهاء الجولة</button>
        )}
      </div>
    </aside>
  );
}
