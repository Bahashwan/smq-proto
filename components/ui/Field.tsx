"use client";
// Form fields · Components sheet §3 and the Contact-Error-M rules: focus = gold frame on cream-focus, error = 2px
// gold frame + cream-focus background + a worded message under the field (hexagon bullet), summary above the form
// takes focus, typed text is never lost. Labels are 11/600 muted; the required mark is a gold hexagon dot.
import { forwardRef, useEffect, useId, useRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cx } from "@/lib/format";
import { StatusDot } from "./Status";
import { ChevronDownIcon } from "./icons";

export interface FieldShellProps {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** QA only: draw the focus state */
  state?: "focus";
  className?: string;
  children: ReactNode;
  /** render the label as a plain element (when the control is not labellable, e.g. a group) */
  as?: "label" | "div";
  /** extra node at the line end of the label row (counter, link) */
  trailing?: ReactNode;
}

export function fieldControlClass({ error, disabled, state, size = "m" }: { error?: boolean; disabled?: boolean; state?: "focus"; size?: "m" | "s" }): string {
  return cx(
    "w-full min-w-0 bg-paper text-ink font-semibold outline-none motion-hover transition-colors placeholder:text-disabled",
    size === "m" ? "h-12 px-3 text-body" : "h-10 px-2.5 text-label",
    error ? "border-error" : "border-interactive focus:border-gold focus:bg-cream-focus focus-visible:outline-none",
    state === "focus" && !error && "border-gold bg-cream-focus",
    disabled && "border-line bg-cream text-disabled cursor-not-allowed",
  );
}

/** Worded error message under a field: gold hexagon bullet + text (never an icon alone) */
export function ErrorText({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <span id={id} className={cx("flex items-start gap-1.5 text-caption font-semibold text-gold-text", className)}>
      <StatusDot tone="gold" size={2} className="mt-1.5" />
      <span>{children}</span>
    </span>
  );
}

export function Hint({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <span id={id} className={cx("text-caption font-semibold text-muted", className)}>
      {children}
    </span>
  );
}

/** Label + control + hint/error, with the ids wired for assistive tech */
export function FieldShell({ id, label, hint, error, required, disabled, state, className, children, as = "label", trailing }: FieldShellProps) {
  const Wrapper = as;
  return (
    <Wrapper className={cx("flex flex-col gap-1 text-caption font-semibold", error ? "text-gold-text" : disabled ? "text-disabled" : state === "focus" ? "text-gold-text" : "text-muted", className)} {...(as === "label" ? { htmlFor: id } : {})}>
      {(label || trailing) && (
        <span className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1">
            {label}
            {required && (
              <span className="inline-flex items-center gap-1" aria-hidden>
                <StatusDot tone="gold" size={2} />
              </span>
            )}
          </span>
          {trailing}
        </span>
      )}
      {children}
      {error ? <ErrorText id={`${id}-error`}>{error}</ErrorText> : hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
    </Wrapper>
  );
}

type Shared = {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  /** force an LTR control (phone numbers, codes); digits stay right-aligned in Arabic pages */
  ltr?: boolean;
  state?: "focus";
  wrapperClassName?: string;
  size?: "m" | "s";
  trailing?: ReactNode;
};

export type TextFieldProps = Shared & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField({ label, hint, error, required, ltr, state, wrapperClassName, size, trailing, id, className, disabled, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? `f-${auto}`;
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} required={required} disabled={disabled} state={state} className={wrapperClassName} trailing={trailing}>
      <input
        ref={ref}
        id={fid}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
        aria-required={required || undefined}
        dir={ltr ? "ltr" : undefined}
        className={cx(fieldControlClass({ error: !!error, disabled, state, size }), ltr && "text-end", className)}
        {...rest}
      />
    </FieldShell>
  );
});

export type SelectFieldProps = Shared & Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & { options?: { value: string; label: string; disabled?: boolean }[]; placeholder?: string };

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField({ label, hint, error, required, state, wrapperClassName, size, trailing, id, className, disabled, options, placeholder, children, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? `f-${auto}`;
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} required={required} disabled={disabled} state={state} className={wrapperClassName} trailing={trailing}>
      <span className="relative block">
        <select
          ref={ref}
          id={fid}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
          aria-required={required || undefined}
          className={cx(fieldControlClass({ error: !!error, disabled, state, size }), "appearance-none pe-9 font-bold", size === "s" ? "text-label" : "text-label", className)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDownIcon className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink" />
      </span>
    </FieldShell>
  );
});

export type TextAreaProps = Shared & TextareaHTMLAttributes<HTMLTextAreaElement> & { rows?: number; counter?: boolean };

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({ label, hint, error, required, state, wrapperClassName, trailing, id, className, disabled, rows = 4, maxLength, counter = true, onChange, value, defaultValue, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? `f-${auto}`;
  const [count, setCount] = useState(String(value ?? defaultValue ?? "").length);
  useEffect(() => {
    if (value !== undefined) setCount(String(value).length);
  }, [value]);
  const counterNode = maxLength && counter ? <span className="text-caption font-semibold text-muted tnum" dir="ltr">{`${count} / ${maxLength}`}</span> : trailing;
  return (
    <FieldShell id={fid} label={label} hint={hint} error={error} required={required} disabled={disabled} state={state} className={wrapperClassName} trailing={counterNode}>
      <textarea
        ref={ref}
        id={fid}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
        aria-required={required || undefined}
        onChange={(e) => {
          setCount(e.target.value.length);
          onChange?.(e);
        }}
        className={cx(fieldControlClass({ error: !!error, disabled, state }), "h-auto py-3 leading-relaxed resize-y", className)}
        {...rest}
      />
    </FieldShell>
  );
});

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  error?: ReactNode;
  hint?: ReactNode;
  /** draw the error frame around the whole row (consent boxes) */
  framed?: boolean;
  wrapperClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, error, hint, framed, wrapperClassName, id, className, disabled, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? `f-${auto}`;
  return (
    <div className={cx("flex flex-col gap-1", wrapperClassName)}>
      <label htmlFor={fid} className={cx("flex items-start gap-2.5 text-caption md:text-label md:font-semibold font-semibold text-ink leading-relaxed", (framed || !!error) && "p-3", !!error && "border-error", framed && !error && "border-interactive", disabled ? "text-disabled cursor-not-allowed" : "cursor-pointer")}>
        <input ref={ref} id={fid} type="checkbox" disabled={disabled} aria-invalid={error ? true : undefined} aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined} className={cx("size-4 shrink-0 mt-0.5 accent-ink", className)} {...rest} />
        <span>{label}</span>
      </label>
      {error ? <ErrorText id={`${fid}-error`}>{error}</ErrorText> : hint ? <Hint id={`${fid}-hint`}>{hint}</Hint> : null}
    </div>
  );
});

export interface RadioOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string> {
  name: string;
  label: ReactNode;
  options: RadioOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /** tiles = bordered cells, selected filled ink (Contact «طريقة الرد»); list = plain radios */
  variant?: "tiles" | "list";
  columns?: 2 | 3 | 4;
  error?: ReactNode;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
}

/** Radio group as tiles or a list. Each option is a label wrapping a visually hidden radio. */
export function RadioGroup<T extends string>({ name, label, options, value, onChange, variant = "tiles", columns = 3, error, hint, required, className }: RadioGroupProps<T>) {
  const id = useId();
  const cols = columns === 2 ? "grid-cols-2" : columns === 4 ? "grid-cols-4" : "grid-cols-3";
  return (
    <fieldset className={cx("flex flex-col gap-1.5 border-0 p-0 m-0 min-w-0", className)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} aria-invalid={error ? true : undefined}>
      <legend className={cx("text-caption font-semibold mb-1", error ? "text-gold-text" : "text-muted")}>
        <span className="inline-flex items-center gap-1">
          {label}
          {required && <StatusDot tone="gold" size={2} />}
        </span>
      </legend>
      <div className={cx(variant === "tiles" ? cx("grid gap-2", cols) : "flex flex-col gap-2")}>
        {options.map((o) => (
          <Radio key={o.value} name={name} value={o.value} label={o.label} checked={value === o.value} disabled={o.disabled} onChange={() => onChange(o.value)} variant={variant} />
        ))}
      </div>
      {error ? <ErrorText id={`${id}-error`}>{error}</ErrorText> : hint ? <Hint id={`${id}-hint`}>{hint}</Hint> : null}
    </fieldset>
  );
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  variant?: "tiles" | "list";
}

/** One radio: tile (ink when selected) or list row */
export function Radio({ label, variant = "tiles", className, checked, disabled, ...rest }: RadioProps) {
  if (variant === "list") {
    return (
      <label className={cx("inline-flex items-center gap-2.5 min-h-11 text-label font-semibold", disabled ? "text-disabled cursor-not-allowed" : "cursor-pointer text-ink", className)}>
        <input type="radio" checked={checked} disabled={disabled} className="size-4 accent-ink" {...rest} />
        <span>{label}</span>
      </label>
    );
  }
  return (
    <label
      className={cx(
        "relative inline-flex items-center justify-center h-11 px-3 text-label whitespace-nowrap border-interactive motion-hover transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-gold has-[:focus-visible]:outline-offset-2",
        checked ? "bg-ink text-paper font-extrabold" : "bg-paper text-ink font-bold hover:bg-sand",
        disabled && "border-line text-disabled hover:bg-paper cursor-not-allowed",
        !disabled && "cursor-pointer",
        className,
      )}
    >
      <input type="radio" checked={checked} disabled={disabled} className="absolute opacity-0 size-px" {...rest} />
      <span>{label}</span>
    </label>
  );
}

export interface ErrorSummaryProps {
  /** the heading, e.g. «لم تُرسل الرسالة. حقلان يحتاجان تصحيحاً:» */
  title: ReactNode;
  errors: { id: string; label: ReactNode }[];
  className?: string;
  /** move focus to the summary when it appears or its errors change (default true) */
  autoFocus?: boolean;
}

/** Form error summary: gold frame, takes focus, each line jumps to its field */
export function ErrorSummary({ title, errors, className, autoFocus = true }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const key = errors.map((e) => e.id).join("|");
  useEffect(() => {
    if (autoFocus && errors.length) ref.current?.focus();
  }, [key, autoFocus, errors.length]);
  if (!errors.length) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert" className={cx("flex flex-col gap-2 p-3.5 border-error text-label text-ink outline-none focus-visible:outline-3 focus-visible:outline-gold", className)}>
      <span className="flex items-start gap-2 font-extrabold">
        <StatusDot tone="gold" size={2.5} className="mt-1.5" />
        <span>{title}</span>
      </span>
      <ul className="flex flex-col gap-1 ps-4.5 m-0 list-none">
        {errors.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              className="font-bold text-ink underline decoration-gold underline-offset-4 hover:text-gold-text"
              onClick={(ev) => {
                const el = document.getElementById(e.id);
                if (el) {
                  ev.preventDefault();
                  el.focus();
                  el.scrollIntoView({ block: "center" });
                }
              }}
            >
              {e.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
