"use client";
// Services-M: the sticky in-page nav («01 الشراء» …) under the header; the section in view is ink, the rest muted.
import { useEffect, useState } from "react";
import { cx } from "@/lib/format";

export interface ServicesNavItem {
  id: string;
  label: string;
}

export function ServicesNav({ items, className }: { items: ServicesNavItem[]; className?: string }) {
  const [current, setCurrent] = useState(items[0]?.id);
  useEffect(() => {
    const sections = items.map((it) => document.getElementById(it.id)).filter((el): el is HTMLElement => !!el);
    if (!sections.length || typeof IntersectionObserver === "undefined") return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        const best = items.map((it) => [it.id, visible.get(it.id) ?? 0] as const).reduce((a, b) => (b[1] > a[1] ? b : a));
        if (best[1] > 0) setCurrent(best[0]);
      },
      { rootMargin: "-100px 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="الخدمات" className={cx("sticky top-14 z-20 bg-paper border-b-[1.5px] border-ink", className)}>
      <div className="container-smq max-md:px-3 flex items-center overflow-x-auto">
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            aria-current={current === it.id ? "location" : undefined}
            onClick={() => setCurrent(it.id)}
            className={cx("shrink-0 inline-flex items-center h-12.5 px-2.5 text-label font-bold no-underline whitespace-nowrap tnum motion-hover transition-colors", current === it.id ? "text-ink border-b-[3px] border-gold" : "text-muted hover:text-ink")}
          >
            {it.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
