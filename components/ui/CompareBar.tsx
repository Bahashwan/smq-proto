"use client";
// Sticky compare bar · Components sheet §8 and the Results boards. Appears at the first selection, sticks to the
// bottom, disappears with no selection; at three items the other «قارن» boxes read «ممتلئة».
import { cx } from "@/lib/format";
import { compareUrl } from "@/lib/url";
import { Button } from "./Button";
import { useCompare, COMPARE_MAX } from "./compare";

export interface CompareBarProps {
  /** names for the desktop line («نموذج D روز · نموذج D ياسمين») */
  nameOf?: (slug: string) => string | undefined;
  /** override the selection (default: the store) */
  slugs?: string[];
  /** fixed to the viewport instead of sticky at the end of the content */
  fixed?: boolean;
  href?: string;
  lang?: "ar" | "en";
  className?: string;
}

export function CompareBar({ nameOf, slugs: override, fixed, href, lang = "ar", className }: CompareBarProps) {
  const { slugs: stored } = useCompare();
  const slugs = override ?? stored;
  if (!slugs.length) return null;
  const names = nameOf ? slugs.map(nameOf).filter(Boolean).join(" · ") : "";
  return (
    <div className={cx(fixed ? "fixed inset-x-0 bottom-0" : "sticky bottom-0", "z-30 bg-ink text-paper border-t-2 border-gold", className)} role="region" aria-label={lang === "en" ? "Compare" : "المقارنة"}>
      <div className="container-smq flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <span className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-label font-normal">
          <span>
            <strong className="text-gold tnum">{slugs.length}</strong> {lang === "en" ? `of ${COMPARE_MAX} to compare` : `من ${COMPARE_MAX} في المقارنة`}
          </span>
          {names && <span className="hidden md:inline text-caption text-on-ink-muted">{names}</span>}
        </span>
        <Button href={href ?? compareUrl(slugs)} variant="primary" size="s" className="h-11 px-4 text-label">
          {lang === "en" ? "Compare now" : "قارن الآن"}
        </Button>
      </div>
    </div>
  );
}
