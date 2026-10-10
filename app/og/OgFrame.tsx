import type { ReactNode } from "react";
/** 1200×630 stage for the link-preview routes (screenshotted by scripts/shots/og.ts). */
export function OgFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden w-[1200px] h-[630px] ${className}`} dir="rtl" data-og>
      {children}
    </div>
  );
}
