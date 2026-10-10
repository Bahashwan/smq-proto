"use client";
// /admin/content/media (Admin-Media-D): the 32 slots of data/media by section. Every generated slot is listed as
// «تعبيرية» with the label on and locked (thumbnail from public/images when Phase 8 has dropped the file);
// IMG-FOUNDER is empty and upload-only. «استبدال» / «رفع» take a local file (object URL preview, nothing is sent):
// a real photo replaces the generated one and switches the label off, as the legend says.
import { useMemo, useRef, useState } from "react";
import { Switch, IconUpload } from "@/components/admin";
import { ImageSlot } from "@/components/ui";
import { media, mediaSections, MEDIA_TIER_LABELS, MEDIA_TIER_NOTES } from "@/data/media";
import type { MediaSlot } from "@/data/types";
import { slotSrc } from "@/lib/images";
import { useStore } from "@/lib/store";
import { cx } from "@/lib/format";
import { countWord, W } from "./model";
import { ContentHead, G8Shell, SAUD } from "./shell";

type Tier = MediaSlot["tier"];
const TIERS: Tier[] = ["real", "render", "generated", "typographic", "empty"];
const SECTION_NOTES: Record<string, string> = {
  "الهوية والهيرو": "الشعار مسموح هنا فقط",
  "تحريري · جدة": "الصفحات العامة والفراغات",
  "المشروع · جاردن الروضة": "من المطوّر حين تتوفر",
  الوحدات: "تُربط بالنماذج في محرر الوحدة",
};
const PILL: Record<Tier, string> = {
  real: "bg-ink text-paper",
  render: "bg-gold text-ink",
  generated: "border-[1.5px] border-ink bg-paper text-ink",
  typographic: "bg-sand text-ink",
  empty: "border-[1.5px] border-gold bg-cream-focus text-gold-text",
};

function TierPill({ tier, className }: { tier: Tier; className?: string }) {
  return <span className={cx("inline-block px-1.5 py-px text-caption font-extrabold leading-tight", PILL[tier], className)}>{MEDIA_TIER_LABELS[tier]}</span>;
}

interface Upload { src: string; name: string }

export function MediaPage() {
  const toast = useStore((s) => s.toast);
  const [filter, setFilter] = useState<Tier | "all">("all");
  const [uploads, setUploads] = useState<Record<string, Upload>>({});
  const target = useRef<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  const tierOf = (m: MediaSlot): Tier => (uploads[m.id] ? "real" : m.tier);
  const counts = useMemo(() => {
    const c = Object.fromEntries(TIERS.map((t) => [t, 0])) as Record<Tier, number>;
    for (const m of media) c[uploads[m.id] ? "real" : m.tier]++;
    return c;
  }, [uploads]);
  const shots = media.filter((m) => m.group !== "founder").length;

  const pick = (id: string) => {
    target.current = id;
    file.current?.click();
  };
  const onFile = (f?: File) => {
    const id = target.current;
    if (!f || !id) return;
    setUploads((prev) => ({ ...prev, [id]: { src: URL.createObjectURL(f), name: f.name } }));
    toast(`رُفعت صورة فعلية في ${id} · أُطفئ الوسم تلقائياً (معاينة محلية، لم يُرسل شيء)`, { kind: "ok" });
    if (file.current) file.current.value = "";
  };

  const sections = mediaSections()
    .map((s) => ({ ...s, slots: s.slots.filter((m) => filter === "all" || tierOf(m) === filter) }))
    .filter((s) => s.slots.length > 0);

  return (
    <G8Shell user={SAUD}>
      <ContentHead
        trail="الصور"
        title="الصور"
        subtitle={`${countWord(media.length, W.slot)}: ${shots} من قائمة اللقطات (تُولَّد أو تُصوَّر) وخانة المؤسس (رفع فقط). كل خانة لها طبقة: فعلية، رندر، تعبيرية، طباعي. الوسم «صورة تعبيرية» إجباري على التعبيرية والرندر`}
        actions={
          <div role="group" aria-label="تصفية حسب الطبقة" className="flex flex-wrap gap-2">
            <FilterChip on={filter === "all"} onClick={() => setFilter("all")} label={`الكل ${media.length}`} />
            {TIERS.map((t) => (
              <FilterChip key={t} on={filter === t} onClick={() => setFilter(t)} label={`${MEDIA_TIER_LABELS[t]} ${counts[t]}`} tone={t === "empty" ? "gold" : undefined} disabled={counts[t] === 0} />
            ))}
          </div>
        }
      />
      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-hidden tabIndex={-1} onChange={(e) => onFile(e.target.files?.[0] ?? undefined)} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 border-interactive bg-paper px-4 py-3 text-caption font-bold text-muted">
        {(["real", "render", "generated", "typographic"] as Tier[]).map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <TierPill tier={t} />
            {MEDIA_TIER_NOTES[t]}
          </span>
        ))}
        <span className="basis-full">رفع صورة فعلية يستبدل التعبيرية ويطفئ الوسم تلقائياً</span>
      </div>

      {sections.map((s) => (
        <section key={s.sectionAr} aria-label={s.sectionAr} className="flex flex-col gap-3">
          <h2 className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 text-label font-extrabold">
            {s.sectionAr}
            <span className="text-caption font-semibold text-muted">{[countWord(mediaSections().find((x) => x.sectionAr === s.sectionAr)?.slots.length ?? 0, W.slot), SECTION_NOTES[s.sectionAr]].filter(Boolean).join(" · ")}</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {s.slots.map((m) => (m.tier === "empty" && !uploads[m.id] ? <FounderCard key={m.id} slot={m} onUpload={() => pick(m.id)} /> : <SlotCard key={m.id} slot={m} upload={uploads[m.id]} onReplace={() => pick(m.id)} />))}
          </div>
        </section>
      ))}
    </G8Shell>
  );
}

function FilterChip({ on, onClick, label, tone, disabled }: { on: boolean; onClick: () => void; label: string; tone?: "gold"; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      disabled={disabled && !on}
      className={cx(
        "flex h-9 cursor-pointer items-center border-[1.5px] px-3 text-[12px] tnum motion-hover transition-colors disabled:cursor-default disabled:border-line disabled:text-disabled",
        on ? "border-ink bg-ink font-extrabold text-paper" : tone === "gold" ? "border-gold bg-cream-focus font-bold text-gold-text hover:bg-sand" : "border-ink bg-paper font-bold text-ink hover:bg-sand",
      )}
    >
      {label}
    </button>
  );
}

function SlotCard({ slot, upload, onReplace }: { slot: MediaSlot; upload?: Upload; onReplace: () => void }) {
  const toast = useStore((s) => s.toast);
  const onLabel = () =>
    toast(upload ? "الصورة الفعلية تُعرض بلا وسم" : "الوسم «صورة تعبيرية» إجباري على الصور المولّدة · يُطفأ تلقائياً عند رفع صورة فعلية", { kind: "info" });
  const tier: Tier = upload ? "real" : slot.tier;
  const src = upload?.src ?? slotSrc(slot.id, 640) ?? undefined;
  const hero = slot.id === "IMG-HERO-BRAND";
  return (
    <article className={cx("flex flex-col bg-paper", hero ? "border-2 border-gold" : "border-interactive")}>
      <ImageSlot slotId={slot.id} tier={tier === "real" ? "real" : "generated"} src={src} realSrc={upload?.src} showId={false} label={tier !== "real" && slot.labelOn} compact className="h-[72px]" alt={slot.descriptionAr}>
        <TierPill tier={tier} className="absolute bottom-2 end-2" />
      </ImageSlot>
      <div className="flex min-h-[64px] flex-col gap-1 px-2.5 py-2">
        <span dir="ltr" className="truncate text-end text-[10px] font-extrabold tracking-wide text-ink-2">
          {slot.id}
        </span>
        <span className="text-[12px] font-bold leading-[1.4]">{upload ? upload.name : slot.descriptionAr}</span>
      </div>
      <div className="mt-auto flex items-center justify-between gap-1.5 border-t border-line px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted">
          الوسم
          <Switch checked={tier !== "real" && slot.labelOn} onChange={onLabel} aria-label={tier === "real" ? "الوسم مطفأ: صورة فعلية" : "الوسم إجباري على التعبيرية"} />
        </span>
        <button type="button" onClick={onReplace} className="flex h-7 cursor-pointer items-center border-[1.5px] border-ink bg-paper px-2 text-[10px] font-extrabold hover:bg-sand">
          استبدال
        </button>
      </div>
    </article>
  );
}

function FounderCard({ slot, onUpload }: { slot: MediaSlot; onUpload: () => void }) {
  return (
    <article className="flex flex-col border-2 border-dashed border-gold bg-paper">
      <button type="button" onClick={onUpload} className="flex h-[72px] cursor-pointer flex-col items-center justify-center gap-1.5 bg-cream-focus text-ink hover:bg-sand">
        <IconUpload />
        <span className="text-caption font-extrabold">رفع فقط · لا توليد</span>
      </button>
      <div className="flex min-h-[64px] flex-col gap-1 px-2.5 py-2">
        <span dir="ltr" className="truncate text-end text-[10px] font-extrabold tracking-wide text-ink-2">
          {slot.id}
        </span>
        <span className="text-[12px] font-bold leading-[1.4]">{slot.descriptionAr}</span>
      </div>
      <div className="mt-auto flex items-center justify-between gap-1.5 border-t border-line px-2.5 py-1.5">
        <span className="text-[10px] font-bold text-gold-text">فارغة · «من نحن» تعرض بطاقة طباعية حتى الرفع</span>
        <button type="button" onClick={onUpload} className="flex h-7 shrink-0 cursor-pointer items-center border-[1.5px] border-ink bg-paper px-2 text-[10px] font-extrabold hover:bg-sand">
          رفع
        </button>
      </div>
    </article>
  );
}
