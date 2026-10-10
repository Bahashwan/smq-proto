"use client";
// /units/[code]/gallery?i=3 · Unit-Gallery-M (full screen, swipe, dots, thumb strip, WhatsApp) and Unit-Gallery-D
// (header with the «الصور · المخطط · جولة 360 [للتأكيد]» tabs, the picture beside the «كل الصور» list). Arrow keys
// move (RTL: ← next, → previous), Esc closes back to the unit page; a click on the picture toggles a 2× zoom.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { unitBySlug } from "@/data/units";
import type { Unit } from "@/data/types";
import { useQuery, setQuery } from "@/lib/location";
import { bedsLabel, cx, fmtArea, fmtNum, waLink } from "@/lib/format";
import { slotFiles } from "@/lib/images";
import { useStore } from "@/lib/store";
import { CloseIcon, ImageSlot, Lockup, Mark, WhatsAppIcon, useVisitorCode } from "@/components/ui";
import { galleryItems, type RealFiles } from "./slots";
import { askObject, useUnitView } from "./view";

function ShareIcon({ size = 20 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3M7 8l5-5 5 5M5 13v7h14v-7" />
    </svg>
  );
}
function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "right" ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
    </svg>
  );
}

export function GalleryPage({ slug, realFiles }: { slug: string; realFiles: RealFiles }) {
  const unit = unitBySlug(slug) as Unit;
  const v = useUnitView(unit);
  const router = useRouter();
  const q = useQuery();
  const code = useVisitorCode();
  const toast = useStore((s) => s.toast);
  const items = galleryItems(unit);
  const n = items.length;
  // the picture index lives in the URL (?i=3, 1-based): deep links, back/forward and the arrows all go through it
  const idx = Math.min(n, Math.max(1, parseInt(q.get("i") ?? "1", 10) || 1)) - 1;
  const [zoomAt, setZoomAt] = useState<number | null>(null);
  const zoom = zoomAt === idx;
  const touch = useRef<number | null>(null);
  const unitHref = `/units/${unit.slug}`;
  const planHref = `${unitHref}/plan`;

  const go = useCallback(
    (to: number) => {
      const next = (to + n) % n;
      setZoomAt(null);
      setQuery({ i: String(next + 1) }, "replace");
    },
    [n],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(idx + 1);
      else if (e.key === "ArrowRight") go(idx - 1);
      else if (e.key === "Escape") router.push(unitHref);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, idx, router, unitHref]);

  const item = items[idx] ?? items[0];
  const generated = v.tier === "generated";
  const file = v.tier === "real" ? realFiles[item.slotId] : undefined;
  const hasPicture = generated ? !!slotFiles(item.slotId) : !!file;
  const dims = generated ? slotFiles(item.slotId) : null;
  const price = fmtNum(unit.priceSar);
  const title = unit.type === "roof-villa" ? "فيلا روف" : unit.nameAr;
  const wa = `${unit.code}${code ? ` · ${code}` : ""}`;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${title} · ${unit.code}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast("نُسخ رابط المعرض");
    } catch {
      /* the visitor closed the share sheet */
    }
  };

  const square = "inline-flex items-center justify-center size-11 shrink-0 motion-hover transition-colors";

  return (
    <div className="flex flex-col h-dvh md:h-dvh bg-ink text-paper" aria-label={`معرض صور ${unit.type === "roof-villa" ? "فيلا الروف" : `نموذج ${unit.model}`}`}>
      {/* header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6 md:py-3.5 border-b border-ink-2 shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <Lockup tone="goldmark-white" height={30} className="hidden md:block shrink-0" decorative />
          <div className="flex flex-col min-w-0">
            <span className="text-label md:text-body font-extrabold leading-snug truncate">
              {title} · {unit.code}
              <span className="hidden md:inline"> · {v.project?.nameAr}</span>
            </span>
            <span className="text-caption md:text-label md:font-normal text-on-ink-muted leading-snug tnum">
              {idx + 1} من {n} · {item.ar}
              <span className="hidden md:inline">
                {" "}
                · {bedsLabel(unit.beds)} · {fmtArea(unit.areaM2)} م² · {price}
              </span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div role="tablist" aria-label="طريقة العرض" className="hidden md:flex border-[1.5px] border-paper text-caption font-extrabold">
            <button type="button" role="tab" aria-selected className="h-9 px-3.5 bg-paper text-ink">
              الصور {n}
            </button>
            <Link href={planHref} role="tab" aria-selected={false} className="inline-flex items-center h-9 px-3.5 border-s-[1.5px] border-paper text-paper no-underline hover:bg-ink-2">
              المخطط
            </Link>
            <button type="button" role="tab" aria-selected={false} aria-disabled className="inline-flex items-center h-9 px-3.5 border-s-[1.5px] border-paper text-on-ink-muted cursor-not-allowed">
              جولة 360
              <Mark>للتأكيد</Mark>
            </button>
          </div>
          <button type="button" aria-label="مشاركة" onClick={share} className={cx(square, "text-paper md:border-[1.5px] md:border-muted hover:bg-ink-2")}>
            <ShareIcon />
          </button>
          <Link href={unitHref} aria-label="إغلاق" className={cx(square, "border-[1.5px] border-paper text-paper no-underline hover:bg-paper hover:text-ink")}>
            <CloseIcon size={18} />
          </Link>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 min-h-0 flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_20rem]">
        <figure
          className="relative flex-1 min-h-0 m-0 bg-ink-2 overflow-hidden select-none"
          onTouchStart={(e) => (touch.current = e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            const start = touch.current;
            touch.current = null;
            const end = e.changedTouches[0]?.clientX;
            if (start == null || end == null || Math.abs(end - start) < 40) return;
            go(end > start ? idx + 1 : idx - 1); // RTL: the next picture comes from the left
          }}
        >
          <button
            type="button"
            aria-label={zoom ? "تصغير الصورة" : "تكبير الصورة"}
            onClick={() => setZoomAt(zoom ? null : idx)}
            className={cx("absolute block p-0 border-0 bg-transparent overflow-hidden", hasPicture ? "inset-x-0 top-1/2 -translate-y-1/2 aspect-[3/2] md:inset-6 md:aspect-auto md:translate-y-0" : "inset-0 md:inset-6", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
          >
            <span className={cx("absolute inset-0 block motion-hover transition-transform", zoom && "scale-200")}>
              <ImageSlot
                as="div"
                slotId={item.slotId}
                tier={v.tier}
                realSrc={file}
                label={false}
                showId={false}
                className="absolute inset-0 size-full"
                unit={{ model: unit.type === "roof-villa" ? "روف" : unit.model, buildingNameAr: unit.buildingNameAr, areaM2: unit.areaM2, beds: unit.beds, baths: unit.baths, floor: v.floorWordAr }}
              />
            </span>
          </button>

          {generated && (
            <div className="absolute inset-x-3 bottom-3 md:inset-x-9 md:bottom-9 z-[1] flex items-end justify-between gap-2 pointer-events-none">
              <figcaption className="shrink-0 px-2.5 py-1 bg-paper text-ink text-caption md:text-label font-bold leading-snug">صورة تعبيرية · لا تمثّل التشطيب النهائي</figcaption>
              <span dir="ltr" className="min-w-0 truncate px-2.5 py-1 bg-paper text-ink text-caption font-normal leading-snug">
                {item.slotId}
                {dims ? <span className="hidden md:inline">{` · ${dims.width}×${dims.height}`}</span> : null}
              </span>
            </div>
          )}
          <span className="absolute top-3 end-3 md:top-9 md:end-9 z-[1] px-2.5 py-1 bg-ink text-paper text-caption font-bold leading-snug pointer-events-none">
            <span className="md:hidden">قرّب بإصبعين · اسحب للتالي</span>
            <span className="hidden md:inline">الأسهم ← → للتنقل · Esc للإغلاق · انقر للتكبير</span>
          </span>

          <button type="button" aria-label="السابقة" onClick={() => go(idx - 1)} className="absolute top-1/2 start-2 md:start-9 z-[1] -translate-y-1/2 inline-flex items-center justify-center w-11 h-14 md:w-13 md:h-16 bg-ink text-paper hover:bg-ink-2 motion-hover transition-colors cut-s">
            <Chevron dir="right" />
          </button>
          <button type="button" aria-label="التالية" onClick={() => go(idx + 1)} className="absolute top-1/2 end-2 md:end-9 z-[1] -translate-y-1/2 inline-flex items-center justify-center w-11 h-14 md:w-13 md:h-16 bg-ink text-paper hover:bg-ink-2 motion-hover transition-colors">
            <Chevron dir="left" />
          </button>
        </figure>

        {/* phone: dots, strip, call to action */}
        <div className="md:hidden shrink-0 flex flex-col gap-3 px-4 pt-4 pb-4">
          <div className="flex justify-center gap-2" aria-hidden>
            {items.map((it, i) => (
              <span key={it.slotId} className={cx("size-2.5 hex-point", i === idx ? "bg-gold" : "bg-muted")} />
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 [scrollbar-width:none]">
            {items.map((it, i) => (
              <button
                key={it.slotId}
                type="button"
                aria-label={it.ar}
                aria-current={i === idx}
                onClick={() => go(i)}
                className={cx("flex items-center justify-center shrink-0 w-16 h-14 px-1 bg-slot text-ink text-caption leading-tight text-center", i === idx ? "border-2 border-gold font-extrabold" : "border border-muted font-normal")}
              >
                {it.gal}
              </button>
            ))}
            <Link href={planHref} aria-label="المخطط" className="flex items-center justify-center shrink-0 w-16 h-14 border border-gold bg-sand text-ink text-caption font-extrabold no-underline">
              المخطط
            </Link>
          </div>
          <a href={waLink(wa)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 min-h-12 px-4 bg-gold text-ink text-body font-extrabold no-underline cut-m hover:bg-gold-hover motion-hover transition-colors">
            <WhatsAppIcon size={18} />
            <span className="tnum">اسأل عن هذه الوحدة · {price}</span>
          </a>
        </div>

        {/* desktop: the «كل الصور» list */}
        <aside className="hidden md:flex flex-col min-h-0 border-s border-ink-2">
          <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-4">
            <div className="mb-3 text-caption font-extrabold text-on-ink-muted">كل الصور</div>
            <div className="grid grid-cols-2 gap-2.5">
              {items.map((it, i) => (
                <button
                  key={it.slotId}
                  type="button"
                  aria-label={it.ar}
                  aria-current={i === idx}
                  onClick={() => go(i)}
                  className={cx("relative h-20 p-0 bg-slot hover:opacity-90", i === idx ? "border-2 border-gold" : "border border-ink-2")}
                >
                  <span className={cx("absolute bottom-1.5 start-1.5 px-1.5 py-0.5 bg-paper text-ink text-caption leading-snug", i === idx ? "font-extrabold" : "font-semibold")}>{it.galD}</span>
                </button>
              ))}
              <Link href={planHref} aria-label="المخطط" className="relative h-20 border border-gold bg-sand no-underline">
                <span className="absolute bottom-1.5 start-1.5 px-1.5 py-0.5 bg-paper text-ink text-caption font-semibold leading-snug">المخطط</span>
              </Link>
            </div>
          </div>
          <div className="shrink-0 flex flex-col gap-2.5 px-5 pt-3.5 pb-5 border-t border-ink-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-caption font-normal text-on-ink-muted">السعر</span>
              <span className="text-h3 font-extrabold tnum">{price}</span>
            </div>
            <a href={waLink(wa)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 min-h-12 px-4 bg-gold text-ink text-body font-extrabold no-underline cut-m hover:bg-gold-hover motion-hover transition-colors">
              <WhatsAppIcon size={18} />
              اسأل عن {askObject(unit)}
            </a>
            <Link href={unitHref} className="self-center text-caption font-bold text-gold underline underline-offset-4 hover:text-paper">
              العودة إلى صفحة الوحدة
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
