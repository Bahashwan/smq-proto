"use client";
// The phone toolbars stick under the site header, which slides away on scroll down and back on scroll up
// (components/ui Header). This reads the header's visible bottom edge every frame while it moves, so the toolbar
// follows it instead of leaving a gap or hiding under it.
import { useEffect, useState } from "react";

export function useHeaderOffset(fallback = 64): number {
  const [top, setTop] = useState(fallback);
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header");
    if (!header) return;
    let raf = 0;
    let moving = false;
    const read = () => {
      raf = 0;
      const b = Math.max(0, Math.round(header.getBoundingClientRect().bottom));
      setTop((t) => (t === b ? t : b));
      if (moving) raf = requestAnimationFrame(read);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    const start = () => {
      moving = true;
      schedule();
    };
    const end = () => {
      moving = false;
      schedule();
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    header.addEventListener("transitionstart", start);
    header.addEventListener("transitionend", end);
    header.addEventListener("transitioncancel", end);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      header.removeEventListener("transitionstart", start);
      header.removeEventListener("transitionend", end);
      header.removeEventListener("transitioncancel", end);
    };
  }, []);
  return top;
}
