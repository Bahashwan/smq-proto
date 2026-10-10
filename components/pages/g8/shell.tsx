"use client";
// G8 · the AdminShell every content page renders (the shared bell and live nav counters of components/admin), the
// «المحتوى والأسئلة › …» path, the page head, the save strip of the content boards and the AR / EN switch
// with the board's «4 حقول فارغة» wording.
import type { KeyboardEvent, ReactNode } from "react";
import Link from "next/link";
import { AdminShell, PageHeader, type AdminShellProps } from "@/components/admin";
import { cx, fmtNum } from "@/lib/format";

export const SAUD = { name: "سعود", role: "مدير", initial: "س" };
export const NOURA = { name: "نورة", role: "محررة", initial: "ن" };

export type G8ShellProps = Omit<AdminShellProps, "notifications" | "counts">;

export function G8Shell({ active = "content", ...props }: G8ShellProps) {
  return <AdminShell active={active} {...props} />;
}

/** «المحتوى والأسئلة › الأسئلة الشائعة» */
export function Crumbs({ trail }: { trail: string }) {
  return (
    <nav aria-label="المسار" className="text-[12px] font-bold text-muted">
      <Link href="/admin/content" className="text-gold-text no-underline hover:text-ink hover:underline">
        المحتوى والأسئلة
      </Link>{" "}
      <span>› {trail}</span>
    </nav>
  );
}

/** Path + title block of a content page. */
export function ContentHead({ trail, title, path, subtitle, actions, note }: { trail?: string; title: ReactNode; path?: string; subtitle?: ReactNode; actions?: ReactNode; note?: boolean }) {
  return (
    <div className="flex flex-col gap-5">
      {trail && <Crumbs trail={trail} />}
      <PageHeader
        title={
          <>
            {title}
            {path && (
              <span className="ms-2 text-[14px] font-semibold text-muted">
                <bdi dir="ltr">{path}</bdi>
              </span>
            )}
          </>
        }
        subtitle={subtitle ? <span className="font-normal leading-relaxed">{subtitle}</span> : undefined}
        actions={actions}
        note={note}
      />
    </div>
  );
}

/** Section title inside a content page (16px, as the boards). */
export function H2({ children, aside, className }: { children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <div className={cx("flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1", className)}>
      <h2 className="text-[16px] font-extrabold leading-tight">{children}</h2>
      {aside && <span className="text-[12px] text-muted">{aside}</span>}
    </div>
  );
}

// ------------------------------------------------------------------ save strip

export type StripState = "clean" | "dirty" | "saving" | "saved";

// 42px buttons, 16px sides (18px on the cut primary), as the content boards draw the strip
const BTN = "flex h-[42px] cursor-pointer items-center whitespace-nowrap text-label motion-hover transition-colors";
const ON_INK_OUTLINE = cx(BTN, "border-[1.5px] border-on-ink-muted bg-transparent px-4 font-bold text-paper hover:border-paper");
const ON_INK_WHITE = cx(BTN, "border-[1.5px] border-paper bg-paper px-4 font-extrabold text-ink hover:bg-sand");
const GOLD = cx(BTN, "cut-s bg-gold px-[18px] font-extrabold text-ink hover:bg-gold-hover");
const OFF = cx(BTN, "cut-s cursor-default bg-ink-2 px-[18px] font-extrabold text-on-ink-muted");

/** The ink bar at the foot of the content editors. Links stay in every state; «تجاهل» / draft / primary in the dirty one. */
export function SaveStrip({
  state,
  message,
  mark,
  links,
  onDiscard,
  onDraft,
  onSave,
  saveLabel = "حفظ",
  draftLabel,
  discardLabel = "تجاهل",
  savedText = "نُشر الآن ·",
  openHref,
  openLabel = "افتح",
  onUndo,
  undoLabel = "تراجع",
  publishedLabel,
}: {
  state: StripState;
  message?: ReactNode;
  /** gold hexagon before the message (dirty, or a clean line that still reports a [للتأكيد] field) */
  mark?: boolean;
  links?: ReactNode;
  onDiscard?: () => void;
  onDraft?: () => void;
  onSave: () => void;
  saveLabel?: string;
  draftLabel?: string;
  discardLabel?: string;
  savedText?: ReactNode;
  openHref?: string;
  openLabel?: string;
  onUndo?: () => void;
  undoLabel?: string;
  publishedLabel?: string;
}) {
  const showMark = mark ?? state === "dirty";
  return (
    <div role="region" aria-label="شريط الحفظ" className="sticky bottom-0 z-20 -mx-4 mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-t-[3px] border-gold bg-ink px-4 py-3.5 text-label text-paper md:-mx-8 md:px-8">
      <span aria-live="polite" className="flex min-w-0 items-center gap-2 font-bold">
        {state === "saved" ? (
          <>
            <span aria-hidden className="hex-flat flex size-[18px] shrink-0 items-center justify-center bg-gold text-ink">
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 6.5 5 9l5-6" />
              </svg>
            </span>
            <span>{savedText}</span>
            {openHref && (
              <Link href={openHref} className="font-extrabold text-gold no-underline hover:underline">
                {openLabel}
              </Link>
            )}
          </>
        ) : state === "saving" ? (
          <>
            <span aria-hidden className="hex-flat size-2.5 shrink-0 bg-gold" />
            <span>يُحفظ…</span>
          </>
        ) : (
          <>
            {showMark && <span aria-hidden className="hex-point size-2.5 shrink-0 bg-gold" />}
            <span className={cx(!showMark && "text-on-ink-muted")}>{message ?? "لا تغييرات غير محفوظة"}</span>
          </>
        )}
      </span>
      <span className="flex flex-wrap items-center gap-2.5">
        {state === "dirty" && onDiscard && (
          <button type="button" onClick={onDiscard} className={ON_INK_OUTLINE}>
            {discardLabel}
          </button>
        )}
        {state !== "saved" && links}
        {state === "dirty" && onDraft && draftLabel && (
          <button type="button" onClick={onDraft} className={ON_INK_WHITE}>
            {draftLabel}
          </button>
        )}
        {state === "dirty" && (
          <button type="button" onClick={onSave} className={GOLD}>
            {saveLabel}
          </button>
        )}
        {(state === "clean" || state === "saving") && (
          <button type="button" disabled className={OFF}>
            {saveLabel}
          </button>
        )}
        {state === "saved" && (
          <>
            {onUndo && (
              <button type="button" onClick={onUndo} className={ON_INK_OUTLINE}>
                {undoLabel}
              </button>
            )}
            {publishedLabel && (
              <button type="button" disabled className={OFF}>
                {publishedLabel}
              </button>
            )}
          </>
        )}
      </span>
    </div>
  );
}

/** A link styled for the ink strip («معاينة في الموقع», «معاينة من نحن»). */
export function StripLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="flex h-[42px] items-center whitespace-nowrap border-[1.5px] border-paper px-4 text-label font-bold text-paper no-underline motion-hover transition-colors hover:bg-ink-2">
      {children}
    </Link>
  );
}

// ------------------------------------------------------------------ AR / EN

/** AR / EN switch of the content editors (Components2 · 7) with the board's «4 حقول فارغة» pill. */
export function LangSwitch({ value, onChange, enEmpty, size = "m" }: { value: "ar" | "en"; onChange: (v: "ar" | "en") => void; enEmpty?: number; size?: "m" | "s" }) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      onChange(value === "ar" ? "en" : "ar");
    }
  };
  const tabs: { id: "ar" | "en"; label: string }[] = [
    { id: "ar", label: "العربية" },
    { id: "en", label: "English" },
  ];
  return (
    <div role="tablist" aria-label="اللغة" onKeyDown={onKey} className="inline-flex shrink-0 border-interactive bg-paper">
      {tabs.map((t, i) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cx(
              "flex cursor-pointer items-center gap-2 motion-hover transition-colors",
              size === "m" ? "h-11 px-4 text-label" : "h-8 px-3 text-caption",
              i > 0 && "border-s-[1.5px] border-ink",
              on ? "bg-ink font-extrabold text-paper" : "bg-paper font-bold text-ink hover:bg-sand",
            )}
          >
            <span dir={t.id === "en" ? "ltr" : undefined}>{t.label}</span>
            {t.id === "en" && !!enEmpty && enEmpty > 0 && (
              <span className={cx("border-[1.5px] border-gold px-1.5 py-px text-caption font-extrabold tnum", on ? "bg-paper text-gold-text" : "text-gold-text")}>
                {enEmpty === 1 ? "حقل واحد فارغ" : enEmpty === 2 ? "حقلان فارغان" : `${fmtNum(enEmpty)} حقول فارغة`}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Yes / no mark of the roles matrix: gold hexagon = yes, hairline square = no (status by shape). */
export function HexYes({ on, label }: { on: boolean; label?: string }) {
  return (
    // relative: keeps the sr-only word inside the table's scroller on the phone
    <span className="relative inline-flex items-center">
      {on ? <span aria-hidden className="hex-flat block size-3.5 bg-gold" /> : <span aria-hidden className="block size-3.5 border-[1.5px] border-line" />}
      {label !== undefined ? <span className="sr-only">{label}</span> : <span className="sr-only">{on ? "نعم" : "لا"}</span>}
    </span>
  );
}

/** Drag-to-reorder for a list of ids: pointer drag on the handle, plus arrow keys on the focused handle. */
export function moveId(list: string[], from: number, to: number): string[] {
  const next = [...list];
  const [it] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(next.length, to)), 0, it);
  return next;
}
