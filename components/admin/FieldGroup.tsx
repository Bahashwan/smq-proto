// Field group and admin fields (Components2 · 2). Sources: من Excel (gold hairline on sand, replaced on import),
// إدارة فقط (ink frame), للتأكيد (gold hairline on cream-focus, keeps its mark on the site), محسوب (read-only on cream),
// خطأ (2px gold on cream-focus with the hexagon bullet). Errors are gold, never red.
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/format";

export interface FieldGroupProps {
  legend: ReactNode;
  /** Small muted line opposite the legend, e.g. «3 حقول · 1 للتأكيد». */
  meta?: ReactNode;
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
  id?: string;
}

const COLS = { 1: "grid-cols-1", 2: "grid-cols-1 md:grid-cols-2", 3: "grid-cols-1 md:grid-cols-3" } as const;

export function FieldGroup({ legend, meta, children, columns = 2, className, id }: FieldGroupProps) {
  return (
    <fieldset id={id} className={cx("m-0 min-w-0 border-interactive bg-paper p-0", className)}>
      <legend className="float-start w-full">
        <div className="flex items-center justify-between gap-3 border-b-[1.5px] border-ink bg-sand px-4 py-3 text-[14px] font-extrabold leading-tight">
          <span>{legend}</span>
          {meta && <span className="text-caption font-bold text-muted">{meta}</span>}
        </div>
      </legend>
      <div className={cx("clear-both grid gap-3.5 p-4", COLS[columns])}>{children}</div>
    </fieldset>
  );
}

export type FieldSource = "admin" | "excel" | "tbc" | "computed" | "error";

const FRAME: Record<FieldSource, string> = {
  admin: "border-interactive bg-paper",
  excel: "border border-gold bg-sand",
  tbc: "border border-gold bg-cream-focus",
  computed: "border-[1.5px] border-line bg-cream text-muted",
  error: "border-2 border-gold bg-cream-focus",
};

const DEFAULT_HINT: Partial<Record<FieldSource, ReactNode>> = {
  excel: "يُستبدل عند الاستيراد",
  tbc: <span className="text-gold-text">يبقى بالوسم على الموقع</span>,
  computed: "لا يُحرَّر",
};

export const fieldControlClass = (source: FieldSource, extra?: string) =>
  cx(
    "h-11 w-full min-w-0 px-3 text-[14px] font-semibold text-ink placeholder:text-disabled focus:border-gold focus:bg-cream-focus focus-visible:outline-0 disabled:text-disabled",
    FRAME[source],
    extra,
  );

interface FieldShellProps {
  label: ReactNode;
  source?: FieldSource;
  /** Line under the control. Defaults per source (excel / tbc / computed). */
  hint?: ReactNode;
  /** Error message: switches the frame to the error state and renders the gold bullet line. */
  error?: ReactNode;
  /** Span every column of the group. */
  span?: boolean;
  className?: string;
  children: ReactNode;
  htmlFor?: string;
  as?: "label" | "div";
}

export function FieldShell({ label, source = "admin", hint, error, span, className, children, htmlFor, as }: FieldShellProps) {
  const Tag = as ?? "label";
  const src: FieldSource = error ? "error" : source;
  const line = hint ?? DEFAULT_HINT[src];
  return (
    <Tag htmlFor={htmlFor} className={cx("flex min-w-0 flex-col gap-1.5 text-[12px] font-bold text-muted", span && "md:col-span-full", className)}>
      <span>{label}</span>
      {children}
      {error ? (
        <span role="alert" className="flex items-center gap-1.5 font-bold text-ink">
          <span aria-hidden className="hex-point size-2 shrink-0 bg-gold" />
          {error}
        </span>
      ) : (
        line && <span className="font-semibold">{line}</span>
      )}
    </Tag>
  );
}

export interface AdminFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label: ReactNode;
  source?: FieldSource;
  hint?: ReactNode;
  error?: ReactNode;
  span?: boolean;
  /** Numbers and codes: LTR text aligned to the right edge, as the boards draw them. */
  ltr?: boolean;
  className?: string;
  inputClassName?: string;
}

export function AdminField({ label, source = "admin", hint, error, span, ltr, className, inputClassName, readOnly, ...rest }: AdminFieldProps) {
  const src: FieldSource = error ? "error" : source;
  return (
    <FieldShell label={label} source={source} hint={hint} error={error} span={span} className={className}>
      <input
        readOnly={readOnly ?? source === "computed"}
        aria-invalid={error ? true : undefined}
        dir={ltr ? "ltr" : undefined}
        className={fieldControlClass(src, cx(ltr && "text-right", inputClassName))}
        {...rest}
      />
    </FieldShell>
  );
}

export interface AdminSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  label: ReactNode;
  source?: FieldSource;
  hint?: ReactNode;
  error?: ReactNode;
  span?: boolean;
  className?: string;
  selectClassName?: string;
}

export function AdminSelect({ label, source = "admin", hint, error, span, className, selectClassName, children, ...rest }: AdminSelectProps) {
  const src: FieldSource = error ? "error" : source;
  return (
    <FieldShell label={label} source={source} hint={hint} error={error} span={span} className={className}>
      <select aria-invalid={error ? true : undefined} className={fieldControlClass(src, cx("font-bold", selectClassName))} {...rest}>
        {children}
      </select>
    </FieldShell>
  );
}

export interface AdminTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  label: ReactNode;
  source?: FieldSource;
  hint?: ReactNode;
  error?: ReactNode;
  span?: boolean;
  className?: string;
  textareaClassName?: string;
}

export function AdminTextarea({ label, source = "admin", hint, error, span, className, textareaClassName, rows = 4, ...rest }: AdminTextareaProps) {
  const src: FieldSource = error ? "error" : source;
  return (
    <FieldShell label={label} source={source} hint={hint} error={error} span={span} className={className}>
      <textarea rows={rows} aria-invalid={error ? true : undefined} className={fieldControlClass(src, cx("h-auto py-2.5 leading-relaxed", textareaClassName))} {...rest} />
    </FieldShell>
  );
}

/** Bare select with the admin frame (inline tables, status selects). */
export function InlineSelect({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx("h-9 border-interactive bg-paper px-2 text-[12px] font-bold text-ink focus:border-gold focus:bg-cream-focus focus-visible:outline-0", className)} {...rest}>
      {children}
    </select>
  );
}
