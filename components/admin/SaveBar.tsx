"use client";
// Save bar (Components2 · 8). Ink bar with a 3px gold top line. States: clean, dirty, saving, saved («نُشر الآن ·
// افتح» + «تراجع»), error (gold text + «اذهب للحقل»). Sticky at the bottom of the editor when `sticky` is set.
import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { IconCheck } from "./icons";

export type SaveState = "clean" | "dirty" | "saving" | "saved" | "error";

export interface SaveBarProps {
  state: SaveState;
  /** Primary action: «نشر» (or `labels.publish`). */
  onSave: () => void;
  onDiscard?: () => void;
  onDraft?: () => void;
  onUndo?: () => void;
  /** Error state: «اذهب للحقل». */
  onFix?: () => void;
  /** Builds the dirty line: «3 حقول غير محفوظة». */
  dirtyCount?: number;
  /** Overrides the dirty line entirely (e.g. «تغييرات غير محفوظة في حقل واحد · آخر نشر قبل 6 أيام بواسطة سعود»). */
  message?: ReactNode;
  /** Saved line, default «نُشر الآن ·». The page editor passes its own («نُشرت الرئيسية الآن · نورة · 14:31 ·»). */
  savedText?: ReactNode;
  /** Link after the saved line, default «افتح». */
  openHref?: string;
  openLabel?: string;
  errorText?: ReactNode;
  labels?: Partial<{ save: string; publish: string; draft: string; discard: string; undo: string; fix: string; saving: string; published: string }>;
  /** Extra actions (links, buttons) rendered before the primary ones in the dirty state. */
  extra?: ReactNode;
  sticky?: boolean;
  className?: string;
}

export function unsavedFieldsText(n: number): string {
  if (n <= 0) return "لا تغييرات غير محفوظة";
  if (n === 1) return "تغييرات غير محفوظة في حقل واحد";
  if (n === 2) return "حقلان غير محفوظان";
  if (n <= 10) return `${n} حقول غير محفوظة`;
  return `${n} حقلاً غير محفوظ`;
}

const PRIMARY = "flex h-[34px] cursor-pointer items-center px-3 text-[12px] font-extrabold cut-s motion-hover transition-colors";
const GOLD = cx(PRIMARY, "bg-gold text-ink hover:bg-gold-hover");
const DISABLED = cx(PRIMARY, "cursor-default bg-ink-2 text-disabled");
// «تجاهل»: ink-2 frame, muted words · «حفظ كمسودة»: white frame and words (Admin-ProjectEditor-D)
const ON_INK_OUTLINE = "flex h-[34px] cursor-pointer items-center border-[1.5px] border-ink-2 bg-transparent px-2.5 text-[12px] font-bold text-on-ink-muted hover:border-paper hover:text-paper";
const ON_INK_WHITE = "flex h-[34px] cursor-pointer items-center border-[1.5px] border-paper bg-transparent px-2.5 text-[12px] font-bold text-paper hover:bg-ink-2";
// the clean state of an editor with drafts: both buttons drawn disabled (Admin-UnitEditor-D)
const DRAFT_DISABLED = "flex h-[34px] cursor-default items-center border-[1.5px] border-ink-2 bg-transparent px-2.5 text-[12px] font-bold text-disabled";

export function SaveBar({ state, onSave, onDiscard, onDraft, onUndo, onFix, dirtyCount = 0, message, savedText = "نُشر الآن ·", openHref, openLabel = "افتح", errorText, labels, extra, sticky, className }: SaveBarProps) {
  const L = { save: "حفظ", publish: "نشر", draft: "مسودة", discard: "تجاهل", undo: "تراجع", fix: "اذهب للحقل", saving: "يُحفظ…", published: "منشور", ...labels };
  return (
    <div
      aria-label="شريط الحفظ"
      role="region"
      className={cx("flex items-center justify-between gap-2.5 border-t-[3px] border-gold bg-ink px-3.5 py-2.5 text-[12px] font-bold text-paper", sticky && "sticky bottom-0 z-20", className)}
    >
      <span aria-live="polite" className="flex min-w-0 items-center gap-2">
        {state === "clean" && (
          <>
            <span aria-hidden className="hex-point size-2 shrink-0 bg-on-ink-muted" />
            <span className="text-on-ink-muted">{message ?? unsavedFieldsText(0)}</span>
          </>
        )}
        {state === "dirty" && (
          <>
            <span aria-hidden className="hex-point size-2 shrink-0 bg-gold" />
            <span>{message ?? unsavedFieldsText(dirtyCount)}</span>
          </>
        )}
        {state === "saving" && (
          <>
            <span aria-hidden className="hex-flat size-2.5 shrink-0 bg-gold" />
            <span>{L.saving}</span>
          </>
        )}
        {state === "saved" && (
          <>
            <span aria-hidden className="hex-flat flex size-[18px] shrink-0 items-center justify-center bg-gold text-ink">
              <IconCheck />
            </span>
            <span>{savedText}</span>
            {openHref && (
              <a href={openHref} className="text-gold underline-offset-2 hover:underline">
                {openLabel}
              </a>
            )}
          </>
        )}
        {state === "error" && (
          <span className="flex items-center gap-2 text-gold">
            <span aria-hidden className="hex-point size-2 shrink-0 bg-gold" />
            <span>{errorText ?? message}</span>
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-1.5">
        {state === "clean" &&
          (onDraft ? (
            <>
              <button type="button" disabled className={DRAFT_DISABLED}>
                {L.draft}
              </button>
              <button type="button" disabled className={DISABLED}>
                {L.publish}
              </button>
            </>
          ) : (
            <button type="button" disabled className={DISABLED}>
              {L.save}
            </button>
          ))}
        {state === "dirty" && (
          <>
            {extra}
            {onDiscard && (
              <button type="button" onClick={onDiscard} className={ON_INK_OUTLINE}>
                {L.discard}
              </button>
            )}
            {onDraft && (
              <button type="button" onClick={onDraft} className={ON_INK_WHITE}>
                {L.draft}
              </button>
            )}
            <button type="button" onClick={onSave} className={GOLD}>
              {L.publish}
            </button>
          </>
        )}
        {state === "saving" && (
          <button type="button" disabled className={DISABLED}>
            {L.publish}
          </button>
        )}
        {state === "saved" && (
          <>
            {onUndo && (
              <button type="button" onClick={onUndo} className={ON_INK_OUTLINE}>
                {L.undo}
              </button>
            )}
            {labels?.published && (
              <button type="button" disabled className={DISABLED}>
                {L.published}
              </button>
            )}
          </>
        )}
        {state === "error" && (
          <button type="button" onClick={onFix ?? onSave} className={GOLD}>
            {L.fix}
          </button>
        )}
      </span>
    </div>
  );
}
