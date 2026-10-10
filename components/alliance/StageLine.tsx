import { cx } from "@/lib/format";
import { HexDot } from "./HexCell";
import { REFERRAL_STAGES } from "./lib";

/**
 * «خط المرحلة». Done = ink, current = gold, upcoming = grey outline, «لم تتم» = white with a 2px ink border that takes
 * the place of the stage where the record stopped. Always with the word under the cell.
 */
export interface StageLineProps {
  /** default: the five referral words (the last one is the failure word) */
  stages?: readonly string[];
  /** whether the last word of `stages` is the failure word; default true for the referral stages only */
  failWord?: boolean;
  /** index of the current stage; stages before it are done */
  current: number;
  /** the record failed at this slot: the failure word moves here, the rest follow greyed */
  failedAt?: number;
  /** captions under the words (dates), by slot */
  dates?: (string | undefined)[];
  /** table form: small cells without words, the word beside */
  compact?: boolean;
  /** compact: the word beside the cells (default: the current or failure word) */
  word?: string;
  /** the record is closed at `current`: its cell is ink and its word bold */
  closed?: boolean;
  className?: string;
  ariaLabel?: string;
}

type Kind = "done" | "now" | "next" | "bad";
interface Item {
  word: string;
  kind: Kind;
  bold: boolean;
}

function plan(stages: readonly string[], hasFail: boolean, current: number, failedAt: number | undefined, closed: boolean | undefined): { items: Item[]; real: number } {
  const real = hasFail ? stages.slice(0, -1) : stages.slice();
  const fail = hasFail ? stages[stages.length - 1] : undefined;
  if (failedAt != null && fail) {
    const at = Math.max(0, Math.min(real.length, failedAt));
    const items: Item[] = [
      ...real.slice(0, at).map((w) => ({ word: w, kind: "done" as Kind, bold: false })),
      { word: fail, kind: "bad", bold: true },
      ...real.slice(at).map((w) => ({ word: w, kind: "next" as Kind, bold: false })),
    ];
    return { items, real: real.length };
  }
  const items: Item[] = real.map((word, i) => {
    if (i < current) return { word, kind: "done", bold: false };
    if (i === current) return { word, kind: closed || i === real.length - 1 ? "done" : "now", bold: true };
    return { word, kind: "next", bold: false };
  });
  if (fail) items.push({ word: fail, kind: "next", bold: false });
  return { items, real: real.length };
}

function Cell({ kind, size }: { kind: Kind; size: number }) {
  if (kind === "done") return <HexDot size={size} tone="ink" />;
  if (kind === "now") return <HexDot size={size} tone="gold" />;
  if (kind === "bad") return <HexDot size={size} tone="paper" border="ink" />;
  return <HexDot size={size} tone="paper" border="line" />;
}

export function StageLine({ stages = REFERRAL_STAGES, failWord, current, failedAt, dates, compact, word, closed, className, ariaLabel }: StageLineProps) {
  const hasFail = failWord ?? stages === REFERRAL_STAGES;
  const { items, real } = plan(stages, hasFail, current, failedAt, closed);
  const currentWord = word ?? items.find((x) => x.bold)?.word ?? stages[current] ?? "";
  const label = ariaLabel ?? `المرحلة: ${currentWord}`;
  if (compact) {
    return (
      <span className={cx("inline-flex items-center gap-2", className)} role="img" aria-label={label}>
        <span className="inline-flex gap-[3px]">
          {items.slice(0, real).map((c, i) => (
            <Cell key={i} kind={c.kind} size={14} />
          ))}
        </span>
        <span className="text-caption font-bold">{currentWord}</span>
      </span>
    );
  }
  return (
    <div className={cx("relative flex items-start", className)} role="img" aria-label={label}>
      <span aria-hidden className="absolute top-[10px] h-0.5 bg-line" style={{ insetInline: "10%" }} />
      {items.map((it, i) => (
        <span key={i} className={cx("relative flex flex-1 flex-col items-center gap-1.5 text-center text-caption leading-tight", it.bold ? "font-extrabold text-ink" : "font-bold text-muted")}>
          <Cell kind={it.kind} size={22} />
          <span>{it.word}</span>
          {dates?.[i] && <span className="tnum text-[10px] font-semibold text-muted">{dates[i]}</span>}
        </span>
      ))}
    </div>
  );
}
