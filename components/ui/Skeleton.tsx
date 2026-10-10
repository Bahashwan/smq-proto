// Loading skeletons · State-Loading-M / Results-Loading-D. Slot and sand blocks with the 1400ms pulse (0ms under
// reduced motion), a status line with the gold marker, and the card skeleton of the results list.
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/format";
import { StatusDot } from "./Status";

export interface SkeletonBlockProps {
  /** width: a Tailwind class (w-24) or a pixel number */
  w?: number | string;
  /** height: a Tailwind class (h-11) or a pixel number */
  h?: number | string;
  tone?: "slot" | "sand";
  className?: string;
  cut?: boolean;
}

export function SkeletonBlock({ w, h, tone = "slot", className, cut }: SkeletonBlockProps) {
  const style: CSSProperties = {};
  if (typeof w === "number") style.width = w;
  if (typeof h === "number") style.height = h;
  return <span aria-hidden className={cx("block shrink-0", tone === "slot" ? "skeleton" : "bg-sand animate-skeleton", typeof w === "string" && w, typeof h === "string" && h, cut && "cut-xl", className)} style={style} />;
}

/** n text lines of decreasing width */
export function SkeletonLines({ n = 3, className }: { n?: number; className?: string }) {
  const widths = ["w-full", "w-5/6", "w-2/3", "w-1/2"];
  return (
    <span aria-hidden className={cx("flex flex-col gap-2", className)}>
      {Array.from({ length: n }).map((_, i) => (
        <SkeletonBlock key={i} w={widths[i % widths.length]} h={12} tone={i % 2 ? "sand" : "slot"} />
      ))}
    </span>
  );
}

/**
 * The results-card skeleton: image with the cut, title lines, price band, actions (State-Loading-M). `grid` draws the
 * desktop grid card of Results-Loading-D instead: the hexagon badge placeholder on the image, two bars, the 46px price
 * row with its hairline, no actions.
 */
export function SkeletonCard({ className, actions = true, grid }: { className?: string; actions?: boolean; grid?: boolean }) {
  if (grid) {
    return (
      <div aria-hidden className={cx("flex flex-col border-[1.5px] border-line", className)}>
        <span className="relative block">
          <SkeletonBlock h={170} cut className="w-full" />
          <span className="absolute top-3 start-3 size-13 hex-flat bg-sand" />
        </span>
        <span className="flex flex-col gap-2 p-3.5">
          <SkeletonBlock h={18} className="w-3/5" />
          <SkeletonBlock h={14} tone="sand" className="w-4/5" />
        </span>
        <span className="flex items-center h-11.5 px-3.5 bg-sand border-t border-line">
          <span className="block h-5 w-2/5 bg-line animate-skeleton" />
        </span>
      </div>
    );
  }
  return (
    <div aria-hidden className={cx("flex flex-col border-[1.5px] border-line", className)}>
      <SkeletonBlock h={170} cut className="w-full" />
      <span className="flex flex-col gap-2 px-3.5 pt-3 pb-2.5">
        <SkeletonBlock w={140} h={18} />
        <SkeletonBlock w={200} h={12} tone="sand" />
      </span>
      <span className="flex items-center justify-between px-3.5 py-3 bg-sand">
        <SkeletonBlock w={110} h={22} />
        <SkeletonBlock w={70} h={14} />
      </span>
      {actions && (
        <span className="flex gap-2 px-3.5 pt-2.5 pb-3">
          <SkeletonBlock h={46} tone="sand" className="flex-1" />
          <SkeletonBlock w={80} h={46} tone="sand" />
        </span>
      )}
    </div>
  );
}

/** «نبحث في الوحدات المتاحة…» with the pulsing gold marker */
export function SkeletonStatus({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p role="status" aria-live="polite" className={cx("m-0 flex items-center gap-2 text-label font-normal text-muted", className)}>
      <StatusDot tone="gold" size={3} pulse />
      {children}
    </p>
  );
}

/** Filter row skeleton (three controls + chips) */
export function SkeletonFilters({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cx("flex flex-col gap-2.5", className)}>
      <span className="flex gap-2">
        <SkeletonBlock w={96} h={44} />
        <SkeletonBlock h={44} className="flex-1" />
        <SkeletonBlock w={90} h={44} />
      </span>
      <span className="flex gap-1.5">
        <SkeletonBlock w={70} h={32} tone="sand" />
        <SkeletonBlock w={110} h={32} tone="sand" />
        <SkeletonBlock w={54} h={32} tone="sand" />
      </span>
    </div>
  );
}

export const Skeleton = { Block: SkeletonBlock, Lines: SkeletonLines, Card: SkeletonCard, Status: SkeletonStatus, Filters: SkeletonFilters };
