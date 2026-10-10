"use client";
// G8 · the content fixtures merged with the in-memory edits (store patches under "g8.*"), so the hub, the bell count
// and the editors agree after a save. Arabic counting words for the lines the boards write with numbers. Nothing here
// types a number from a board: every count comes from data/content.ts, data/media.ts or the unit selectors.
import { useMemo } from "react";
import { faq as faqFixture, needsConfirmation, partners as partnersFixture, testimonials as testimonialsFixture, TESTIMONIALS_MIN } from "@/data/content";
import type { FaqItem, Partner, Testimonial } from "@/data/types";
import { useStore } from "@/lib/store";

export const PATCH = {
  nc: "g8.nc",
  faq: "g8.faq",
  faqOrder: "g8.faqOrder",
  partner: "g8.partner",
  testimonial: "g8.testimonial",
} as const;

type Patches = Record<string, Record<string, unknown>> | undefined;

/** Counting word with the number: 1 → one, 2 → two, 3–10 → «n few», 11+ / 0 → «n many» (0 takes the few form, as the boards write «0 وحدات»). */
export function countWord(n: number, forms: { one: string; two: string; few: string; many: string }): string {
  if (n === 0) return `0 ${forms.few}`;
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;
  if (n <= 10) return `${n} ${forms.few}`;
  return `${n} ${forms.many}`;
}
export const W = {
  question: { one: "سؤال واحد", two: "سؤالان", few: "أسئلة", many: "سؤالاً" },
  logo: { one: "شعار واحد", two: "شعاران", few: "شعارات", many: "شعاراً" },
  page: { one: "صفحة واحدة", two: "صفحتان", few: "صفحات", many: "صفحة" },
  slot: { one: "خانة واحدة", two: "خانتان", few: "خانات", many: "خانة" },
  item: { one: "عنصر واحد", two: "عنصران", few: "عناصر", many: "عنصراً" },
  district: { one: "حي واحد", two: "حيّان", few: "أحياء", many: "حياً" },
  unit: { one: "وحدة واحدة", two: "وحدتان", few: "وحدات", many: "وحدة" },
};
/** «2 صفحتان» / «10 صفحات»: the SEO template rows always lead with the digit. */
export function digitWord(n: number, forms: { one: string; two: string; few: string; many: string }): string {
  const w = countWord(n, forms);
  return /^\d/.test(w) ? w : `${n} ${w}`;
}

// ---------------------------------------------------------------- needs confirmation

/** Rows still waiting (the confirmed ones are patched away) and the count the hub button shows (FAQ row = its drafts). */
export function useNeedsConfirmation() {
  const patches = useStore((s) => s.patches[PATCH.nc]) as Patches;
  const faqPatches = useStore((s) => s.patches[PATCH.faq]) as Patches;
  return useMemo(() => {
    const drafts = mergeFaq(faqPatches, undefined).filter((f) => f.draft).length;
    const rows = needsConfirmation
      .filter((r) => !patches?.[r.id]?.confirmed)
      .map((r) => (r.kind === "draft" ? { ...r, count: drafts } : r))
      .filter((r) => r.kind !== "draft" || (r.count ?? 0) > 0);
    const count = rows.reduce((n, r) => n + (r.count ?? 1), 0);
    return { rows, count };
  }, [patches, faqPatches]);
}

// ---------------------------------------------------------------- FAQ

export function mergeFaq(patches: Patches, order: string[] | undefined): FaqItem[] {
  const list = faqFixture.map((f) => ({ ...f, ...(patches?.[f.id] as Partial<FaqItem> | undefined) }));
  if (!order?.length) return list.sort((a, b) => a.order - b.order);
  const pos = new Map(order.map((id, i) => [id, i]));
  return list.sort((a, b) => (pos.get(a.id) ?? 99) - (pos.get(b.id) ?? 99));
}
export function useFaq(): FaqItem[] {
  const patches = useStore((s) => s.patches[PATCH.faq]) as Patches;
  const order = useStore((s) => s.patches[PATCH.faqOrder]?.list?.ids) as string[] | undefined;
  return useMemo(() => mergeFaq(patches, order), [patches, order]);
}
export function faqSummary(list: FaqItem[]) {
  return { total: list.length, published: list.filter((f) => f.published && !f.draft).length, drafts: list.filter((f) => f.draft).length };
}

// ---------------------------------------------------------------- partners and testimonials

export function usePartners(): Partner[] {
  const patches = useStore((s) => s.patches[PATCH.partner]) as Patches;
  return useMemo(() => partnersFixture.map((p) => ({ ...p, ...(patches?.[p.id] as Partial<Partner> | undefined) })), [patches]);
}
export function useTestimonials(): Testimonial[] {
  const patches = useStore((s) => s.patches[PATCH.testimonial]) as Patches;
  return useMemo(() => testimonialsFixture.map((t) => ({ ...t, ...(patches?.[t.id] as Partial<Testimonial> | undefined) })), [patches]);
}
export function testimonialsSummary(list: Testimonial[]) {
  const published = list.filter((t) => t.published && t.consent).length;
  return { published, min: TESTIMONIALS_MIN, shown: published >= TESTIMONIALS_MIN, missing: Math.max(0, TESTIMONIALS_MIN - published) };
}
/** «2 رأيان منشوران» as the boards write it (digit first). */
export function opinionsPublished(n: number): string {
  if (n === 1) return "1 رأي منشور";
  if (n === 2) return "2 رأيان منشوران";
  if (n >= 3 && n <= 10) return `${n} آراء منشورة`;
  return `${n} رأياً منشوراً`;
}
