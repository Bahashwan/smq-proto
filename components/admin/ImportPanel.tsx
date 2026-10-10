// Excel import frame (Admin-Inventory-D): the column-mapping panel and the preview panel side by side. The page
// fills the mapping rows, the summary tiles and the diff rows from its fixtures; the frame carries the sheet's copy.
import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { Panel } from "./Panel";

export interface ImportPanelProps {
  /** Default «استيراد من Excel · مطابقة الأعمدة». */
  title?: ReactNode;
  /** Paragraph under the title (the sheet's rule about «كود النموذج»). */
  intro?: ReactNode;
  /** Mapping table slot (ImportMappingHead + ImportMappingRow …). */
  mapping: ReactNode;
  /** Footer actions of the mapping panel («معاينة التغييرات», «تنزيل القالب»). */
  mappingActions?: ReactNode;
  /** «معاينة الاستيراد · file.xlsx». */
  previewTitle?: ReactNode;
  /** Preview slot (ImportStat tiles + ImportDiffRow …). */
  preview?: ReactNode;
  /** Footer of the preview panel («تطبيق الاستيراد» + the log note). */
  previewActions?: ReactNode;
  className?: string;
  id?: string;
}

export function ImportPanel({ title = "استيراد من Excel · مطابقة الأعمدة", intro, mapping, mappingActions, previewTitle, preview, previewActions, className, id }: ImportPanelProps) {
  return (
    <section id={id} aria-label="استيراد من Excel" className={cx("grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr))]", className)}>
      <Panel bodyClassName="flex flex-col gap-3 p-4">
        <h2 className="text-[16px] font-extrabold leading-tight">{title}</h2>
        {intro && <p className="m-0 text-[12px] leading-relaxed text-muted">{intro}</p>}
        <div className="flex flex-col text-[12px]">{mapping}</div>
        {mappingActions && <div className="mt-1 flex flex-wrap items-center gap-2">{mappingActions}</div>}
      </Panel>
      {(preview || previewTitle) && (
        <Panel bodyClassName="flex flex-col gap-3 p-4">
          {previewTitle && <h2 className="text-[16px] font-extrabold leading-tight">{previewTitle}</h2>}
          {preview}
          {previewActions && <div className="mt-1 flex flex-wrap items-center gap-3">{previewActions}</div>}
        </Panel>
      )}
    </section>
  );
}

const MAP_GRID = "grid items-center gap-3 [grid-template-columns:1fr_1fr_80px]";

export function ImportMappingHead({ columns = ["عمود الملف", "حقل الموقع", "الحالة"] }: { columns?: [ReactNode, ReactNode, ReactNode] | ReactNode[] }) {
  return (
    <div className={cx(MAP_GRID, "border-b border-line py-2 font-bold text-muted")}>
      {columns.map((c, i) => (
        <span key={i}>{c}</span>
      ))}
    </div>
  );
}

export interface ImportMappingRowProps {
  fileColumn: ReactNode;
  /** The select (or text) for the site field. */
  children?: ReactNode;
  /** «مطابق» (gold text) / «غير مطابق» (ink). */
  status?: ReactNode;
  matched?: boolean;
  muted?: boolean;
  className?: string;
}

export function ImportMappingRow({ fileColumn, children, status, matched, muted, className }: ImportMappingRowProps) {
  return (
    <div className={cx(MAP_GRID, "border-b border-line py-2 last:border-b-0", className)}>
      <span className={cx(muted && "text-muted")}>{fileColumn}</span>
      <span className="min-w-0">{children}</span>
      <span className={cx("font-bold", matched ? "text-gold-text" : "text-ink")}>{status}</span>
    </div>
  );
}

export function ImportStat({ value, label, variant = "sand", className }: { value: ReactNode; label: ReactNode; variant?: "sand" | "ink" | "outline"; className?: string }) {
  return (
    <div className={cx("flex flex-col gap-0.5 px-3.5 py-3", variant === "ink" ? "bg-ink text-paper" : variant === "outline" ? "border-interactive bg-paper" : "bg-sand", className)}>
      <span className={cx("text-[22px] font-extrabold leading-none tnum", variant === "ink" ? "text-gold" : "text-ink")}>{value}</span>
      <span className={cx("text-caption", variant === "ink" ? "text-on-ink-muted" : "text-muted")}>{label}</span>
    </div>
  );
}

export function ImportStats({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("grid grid-cols-3 gap-2", className)}>{children}</div>;
}

export interface ImportDiffRowProps {
  code: ReactNode;
  change: ReactNode;
  result: ReactNode;
  /** Gold «تحذير» style on the change column. */
  warning?: boolean;
  className?: string;
}

export function ImportDiffRow({ code, change, result, warning, className }: ImportDiffRowProps) {
  return (
    <div className={cx("grid items-center gap-3 border-b border-line py-2 text-[12px] last:border-b-0 [grid-template-columns:70px_1fr_1fr]", className)}>
      <span className="font-bold tnum">{code}</span>
      <span className={cx(warning ? "font-bold text-gold-text" : "text-muted")}>{change}</span>
      <span className={cx(!warning && "font-extrabold")}>{result}</span>
    </div>
  );
}
