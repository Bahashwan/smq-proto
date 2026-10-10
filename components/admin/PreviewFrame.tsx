"use client";
// Live preview frame (Admin-PageEditor-D «معاينة حية»): a 390 / 1440 toggle and an ink-framed white stage. The
// children render at the chosen width and are scaled down to fit the column, so the desktop preview is readable
// inside the editor's side column.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/format";
import { PeriodToggle } from "./PeriodToggle";

export type PreviewWidth = 390 | 1440;

export interface PreviewFrameProps {
  width?: PreviewWidth;
  onWidthChange?: (w: PreviewWidth) => void;
  children: ReactNode;
  /** Default «معاينة حية · المسودة». */
  title?: ReactNode;
  /** Muted line under the stage. */
  note?: ReactNode;
  sticky?: boolean;
  className?: string;
  /** Fixed stage height in px; by default the stage follows the scaled content. */
  height?: number;
  /** Hide the 390 / 1440 toggle (fixed-width previews). */
  showToggle?: boolean;
}

const OPTIONS: { value: "390" | "1440"; label: string }[] = [
  { value: "390", label: "390" },
  { value: "1440", label: "1440" },
];

export function PreviewFrame({ width, onWidthChange, children, title = "معاينة حية · المسودة", note, sticky, className, height, showToggle = true }: PreviewFrameProps) {
  const [internal, setInternal] = useState<PreviewWidth>(390);
  const w = width ?? internal;
  const setW = (v: PreviewWidth) => {
    if (width === undefined) setInternal(v);
    onWidthChange?.(v);
  };
  const stage = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentH, setContentH] = useState(0);

  useEffect(() => {
    const s = stage.current;
    const c = inner.current;
    if (!s || !c) return;
    const measure = () => {
      const sw = s.clientWidth;
      setScale(sw > 0 ? Math.min(1, sw / w) : 1);
      setContentH(c.offsetHeight);
    };
    // ResizeObserver fires once on observe, which is the initial measurement
    const ro = new ResizeObserver(measure);
    ro.observe(s);
    ro.observe(c);
    return () => ro.disconnect();
  }, [w]);

  return (
    <aside aria-label="معاينة حية" className={cx("flex flex-col gap-2.5", sticky && "sticky top-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-extrabold">{title}</span>
        {showToggle && <PeriodToggle size="sm" label="عرض المعاينة" options={OPTIONS} value={String(w) as "390" | "1440"} onChange={(v) => setW(Number(v) as PreviewWidth)} />}
      </div>
      <div ref={stage} className="relative w-full overflow-hidden border-interactive bg-paper" style={{ height: height ?? (contentH ? Math.ceil(contentH * scale) : undefined) }}>
        <div ref={inner} style={{ width: w, transform: `scale(${scale})`, transformOrigin: "top right" }} className="absolute top-0 right-0">
          {children}
        </div>
      </div>
      {note && <span className="text-caption font-normal leading-[1.6] text-muted">{note}</span>}
    </aside>
  );
}
