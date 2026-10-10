"use client";
// Stub: the presenter agent replaces this with the real bar (switches, reset, screen map link).
import { usePresenter } from "@/lib/presenter";

export function PresenterBar() {
  const { state } = usePresenter();
  if (!state.demo) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-ink text-paper text-caption px-4 py-2 flex gap-3 items-center" data-presenter-bar>
      <span className="font-bold">العرض</span>
      <a className="underline" href="/demo">خريطة الشاشات</a>
    </div>
  );
}
