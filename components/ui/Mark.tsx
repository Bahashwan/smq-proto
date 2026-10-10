"use client";
// «[للتأكيد]» and «[مسودة إجابة]» render as a small gold-outlined chip (brackets stripped). The presenter switch
// `marks=0` hides every chip; the copy around it stays.
import type { ReactNode } from "react";
import { useMarks } from "@/lib/presenter";
import { cx } from "@/lib/format";

export const MARK_RE = /\[(للتأكيد|مسودة إجابة|TBC)\]/g;

export function Mark({ children, className }: { children: ReactNode; className?: string }) {
  const show = useMarks();
  if (!show) return null;
  const raw = typeof children === "string" || typeof children === "number" ? String(children) : null;
  const text = raw ? raw.replace(/^\s*\[/, "").replace(/\]\s*$/, "").trim() : children;
  return <span className={cx("inline-flex items-center align-middle ms-1.5 px-1.5 py-px text-caption font-bold leading-snug text-gold-text border-[1.5px] border-gold bg-cream-focus whitespace-nowrap", className)}>{text}</span>;
}

/** Renders a copy string whose `[للتأكيد]` / `[مسودة إجابة]` tokens become Mark chips */
export function MarkedText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(MARK_RE);
  if (parts.length === 1) return <span className={className}>{text}</span>;
  // punctuation right after a chip stays on its line («… 30 يوماً [للتأكيد].» never wraps the full stop alone)
  const PUNCT = /^[.,،؛:!؟)»]+/;
  const out: ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      const trail = parts[i + 1]?.match(PUNCT)?.[0] ?? "";
      if (trail) parts[i + 1] = parts[i + 1].slice(trail.length);
      out.push(
        <span key={i} className="whitespace-nowrap">
          <Mark>{parts[i]}</Mark>
          {trail}
        </span>,
      );
    } else if (parts[i]) {
      out.push(<span key={i}>{parts[i]}</span>);
    }
  }
  return <span className={className}>{out}</span>;
}
