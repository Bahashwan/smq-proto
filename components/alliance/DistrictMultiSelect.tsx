"use client";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import type { District, Sector } from "@/data/types";
import { cx, waLink } from "@/lib/format";
import { normalizeAr, SECTOR_LABELS, SECTOR_ORDER } from "./lib";

/**
 * «اختيار الأحياء المتعدد»: the chosen districts as ink tags with a gold ×, a search field, and the list grouped by
 * sector and sorted alphabetically inside each group. Fixed list, no free text. On phone the list opens as a
 * full-screen sheet; from md up it stays inline under the field.
 */
export interface DistrictMultiSelectProps {
  districts: District[];
  value: string[];
  onChange: (slugs: string[]) => void;
  /** limit the list to these sectors; with `requireSector` an empty list disables the field («اختر الجهة أولاً») */
  sectors?: Sector[];
  requireSector?: boolean;
  disabled?: boolean;
  /** true → «اختر حياً واحداً على الأقل»; a string shows as given */
  error?: boolean | string;
  label?: ReactNode;
  placeholder?: string;
  /** «اطلب إضافة حي» */
  requestHref?: string;
  /** note under the list */
  note?: ReactNode;
  /** phone sheet title */
  sheetTitle?: string;
  /** from md up: keep the grouped list open under the field (default true); false shows the field alone */
  inlineList?: boolean;
  className?: string;
}

const SearchIcon = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="shrink-0 text-muted">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export function DistrictMultiSelect({ districts, value, onChange, sectors, requireSector, disabled, error, label, placeholder = "ابحث عن حي", requestHref, note, sheetTitle = "الأحياء", inlineList = true, className }: DistrictMultiSelectProps) {
  const uid = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const blocked = disabled || (requireSector && (!sectors || sectors.length === 0));
  const errorText = error === true ? "اختر حياً واحداً على الأقل" : error || "";
  const showError = Boolean(errorText) && value.length === 0;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const groups = useMemo(() => {
    const nq = normalizeAr(q);
    const allowed = sectors && sectors.length ? new Set(sectors) : null;
    return SECTOR_ORDER.map((sector) => ({
      sector,
      items: districts
        .filter((d) => d.sector === sector && (!allowed || allowed.has(sector)) && (!nq || normalizeAr(d.ar).includes(nq)))
        .sort((a, b) => a.ar.localeCompare(b.ar, "ar")),
    })).filter((g) => g.items.length);
  }, [districts, sectors, q]);

  const selected = value.map((slug) => districts.find((d) => d.slug === slug)).filter((d): d is District => Boolean(d));
  const toggle = (slug: string) => onChange(value.includes(slug) ? value.filter((s) => s !== slug) : [...value, slug]);
  const remove = (slug: string) => onChange(value.filter((s) => s !== slug));

  const tags = selected.length > 0 && (
    <div className="mb-1.5 flex flex-wrap gap-1.5">
      {selected.map((d) => (
        <span key={d.slug} className="inline-flex h-8 items-center gap-1.5 bg-ink ps-2.5 text-[12px] font-bold text-paper">
          {d.ar}
          <button type="button" aria-label={`إزالة ${d.ar}`} onClick={() => remove(d.slug)} className="flex h-8 w-8 items-center justify-center text-[14px] font-extrabold text-gold">
            ×
          </button>
        </span>
      ))}
    </div>
  );

  const fieldLook = blocked ? "bg-cream text-disabled" : showError ? "border-error text-muted" : "bg-paper border-interactive";
  const field = (autoFocus?: boolean) =>
    blocked ? (
      <div className={cx("flex h-11 items-center gap-2 px-3 text-label font-normal", fieldLook)} style={{ border: "1.5px solid var(--smq-line)" }} aria-disabled="true">
        <SearchIcon />
        {requireSector && (!sectors || sectors.length === 0) ? "اختر الجهة أولاً" : placeholder}
      </div>
    ) : (
      <div className={cx("flex h-11 items-center gap-2 px-3", fieldLook)}>
        <SearchIcon />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={showError ? errorText : placeholder}
          aria-label={placeholder}
          aria-invalid={showError || undefined}
          autoFocus={autoFocus}
          className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[14px] font-semibold text-ink outline-none placeholder:text-muted"
        />
      </div>
    );

  const list = (
    <div className="bg-paper px-3 pb-1.5 border-interactive border-t-0" role="group" aria-labelledby={`${uid}-label`}>
      {groups.length === 0 ? (
        <p className="py-2.5 text-[12px] text-muted">
          لا حي بهذا الاسم. الأحياء من قائمة ثابتة؛{" "}
          <a href={requestHref ?? waLink("اطلب إضافة حي")} className="text-gold-text underline">
            اطلب إضافة حي
          </a>
          .
        </p>
      ) : (
        groups.map((g) => (
          <div key={g.sector}>
            <span className="block pt-2 pb-0.5 text-caption font-extrabold text-gold-text">{SECTOR_LABELS[g.sector]}</span>
            {g.items.map((d) => {
              const on = value.includes(d.slug);
              return (
                <label key={d.slug} className={cx("flex min-h-11 cursor-pointer items-center gap-2.5 py-2 text-[13px] hover:bg-sand has-[:focus-visible]:bg-sand", on && "font-bold")} style={{ borderBottom: "1px solid var(--smq-line)" }}>
                  <input type="checkbox" checked={on} onChange={() => toggle(d.slug)} className="m-0 h-[18px] w-[18px]" style={{ accentColor: "var(--smq-ink)" }} />
                  {d.ar}
                </label>
              );
            })}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className={cx("flex flex-col", className)}>
      {label && (
        <span id={`${uid}-label`} className="mb-1.5 block text-label">
          {label}
        </span>
      )}
      {tags}
      {/* phone: the field opens a full-screen sheet */}
      <div className="md:hidden">
        {blocked ? (
          field()
        ) : (
          <button type="button" onClick={() => setOpen(true)} className={cx("flex h-11 w-full items-center gap-2 px-3 text-start", fieldLook)} aria-haspopup="dialog" aria-expanded={open}>
            <SearchIcon />
            <span className={cx("text-[14px]", showError ? "text-muted" : "text-muted")}>{showError ? errorText : placeholder}</span>
          </button>
        )}
        {open && (
          <div role="dialog" aria-modal="true" aria-label={sheetTitle} className="fixed inset-0 z-50 flex flex-col bg-paper">
            <div className="flex h-14 shrink-0 items-center justify-between gap-3 px-4" style={{ borderBottom: "1.5px solid var(--smq-ink)" }}>
              <span className="text-h3">{sheetTitle}</span>
              <button type="button" onClick={() => setOpen(false)} className="h-11 bg-ink px-4 text-[13px] font-extrabold text-paper cut-s">
                تم
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {tags}
              {field(true)}
              {list}
              {note && <p className="mt-2 text-caption text-muted">{note}</p>}
            </div>
          </div>
        )}
      </div>
      {/* desktop: inline */}
      <div className="hidden md:block">
        {field()}
        {!blocked && inlineList && <div className="max-h-[320px] overflow-y-auto">{list}</div>}
      </div>
      {showError && <span className="mt-1 text-caption font-bold text-gold-text md:hidden">{errorText}</span>}
      {note && <p className="mt-2 hidden text-caption text-muted md:block">{note}</p>}
    </div>
  );
}
