"use client";
// AR / EN tab (Components2 · 7). Switches the language of the editor's fields, never the panel's language.
// Empty English fields inherit the Arabic on the site; the panel shows how many are empty on the tab.
import { useId, type KeyboardEvent } from "react";
import { cx } from "@/lib/format";
import { fmtNum } from "@/lib/format";

export type Lang = "ar" | "en";

export interface LangTabsProps {
  value: Lang;
  onChange: (lang: Lang) => void;
  /** Number of empty English fields; renders the «n فارغة» pill on the English tab. */
  enEmpty?: number;
  className?: string;
  label?: string;
}

const TABS: { id: Lang; label: string }[] = [
  { id: "ar", label: "العربية" },
  { id: "en", label: "English" },
];

export function LangTabs({ value, onChange, enEmpty, className, label = "لغة الحقول" }: LangTabsProps) {
  const base = useId();
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      onChange(value === "ar" ? "en" : "ar");
    }
  };
  return (
    <div role="tablist" aria-label={label} onKeyDown={onKey} className={cx("inline-flex border-interactive bg-paper", className)}>
      {TABS.map((t, i) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            id={`${base}-${t.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={cx(
              "flex h-9 cursor-pointer items-center gap-2 px-3.5 text-[12px] motion-hover transition-colors",
              i > 0 && "border-s-[1.5px] border-ink",
              selected ? "bg-ink font-extrabold text-paper" : "bg-paper font-bold text-ink hover:bg-sand",
            )}
          >
            <span dir={t.id === "en" ? "ltr" : undefined}>{t.label}</span>
            {t.id === "en" && typeof enEmpty === "number" && enEmpty > 0 && (
              <span className={cx("border-[1.5px] border-gold px-1.5 py-px text-caption font-extrabold tnum", selected ? "bg-paper text-gold-text" : "text-gold-text")}>{enEmpty === 1 ? "حقل فارغ" : enEmpty === 2 ? "حقلان فارغان" : `${fmtNum(enEmpty)} حقول فارغة`}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
