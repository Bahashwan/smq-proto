"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/format";
import { MapPlaceholder } from "./placeholders";

export const OFFICE_ZOOM = 17; // street level (the brief)
export const PROJECT_ZOOM = 14; // district level: the board's chip says «خريطة Google بموقع المشروع», not a street
export const EMBED_TIMEOUT_MS = 8000;
export const DIRECTIONS_LABEL = "افتح الاتجاهات في الخرائط";

export function embedUrl(lat: number, lng: number, zoom: number, lang: "ar" | "en"): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=${lang}&output=embed`;
}

export interface MapEmbedProps {
  lat: number;
  lng: number;
  /** default 17 (office, street level); the project passes PROJECT_ZOOM */
  zoom?: number;
  lang?: "ar" | "en";
  /** iframe title (accessible name) */
  title: string;
  /** chip text rendered OUTSIDE the iframe, under the frame (e.g. «الموقع تقريبي» + the Mark chip) */
  label?: ReactNode;
  placeholder: "office" | "project";
  /** the placeholder's own white chip and ink caption; default the board copy for the kind */
  placeholderChip?: ReactNode;
  placeholderCaption?: ReactNode;
  placeholderCaptionShort?: ReactNode;
  /** Google's own «Embed a map» URL once the client pastes it (site settings embedUrlAr/embedUrlEn) */
  forceEmbedUrl?: string;
  /** renders the «افتح الاتجاهات في الخرائط» anchor under the frame; pages that put it in a heading omit this */
  directionsHref?: string;
  directionsLabel?: string;
  /** height classes of the frame; default per kind (office 220 → 380 at md · project 200 → 320) */
  frameClassName?: string;
  className?: string;
}

/** A keyless Google Maps embed: the schematic drawing shows at once; the iframe mounts when the frame scrolls into
 *  view and stays under the drawing until its load event; no load within 8 s, an error, or being offline keeps the
 *  drawing for good. The frame (1.5px ink border with the cut corner) is a stroke-only overlay on the container, so the
 *  iframe is never clipped and Google's logo and controls stay visible. */
export function MapEmbed({
  lat,
  lng,
  zoom = OFFICE_ZOOM,
  lang = "ar",
  title,
  label,
  placeholder,
  placeholderChip,
  placeholderCaption,
  placeholderCaptionShort,
  forceEmbedUrl,
  directionsHref,
  directionsLabel = DIRECTIONS_LABEL,
  frameClassName,
  className,
}: MapEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setOffline(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || loaded || failed || offline) return;
    const t = setTimeout(() => setFailed(true), EMBED_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [inView, loaded, failed, offline]);

  const src = forceEmbedUrl || embedUrl(lat, lng, zoom, lang);
  const showIframe = inView && !failed && !offline;
  const sizes = frameClassName ?? (placeholder === "office" ? "h-[220px] md:h-[380px]" : "h-[200px] md:h-[320px]");

  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <div ref={ref} className={cx("relative isolate w-full bg-paper", sizes)} data-map-state={loaded ? "loaded" : failed ? "failed" : offline ? "offline" : inView ? "loading" : "idle"}>
        {showIframe && (
          <iframe
            src={src}
            title={title}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen={false}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className="absolute inset-0 block h-full w-full border-0"
          />
        )}
        {!loaded && (
          <div className="cut-m absolute inset-0 z-[1]">
            <MapPlaceholder kind={placeholder} chip={placeholderChip} caption={placeholderCaption} captionShort={placeholderCaptionShort} />
          </div>
        )}
        <MapFrame />
      </div>
      {(label || directionsHref) && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {label ? <span className="text-caption font-bold text-muted">{label}</span> : <span />}
          {directionsHref && (
            <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="border-interactive flex h-11 items-center justify-center gap-2 bg-paper px-4 text-[13px] font-bold text-ink no-underline max-md:w-full">
              {directionsLabel}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/** The design's map frame as strokes only: a 1.5px ink border whose top-start corner is cut (cut-m, 12 × 21, mirrored
 *  under dir=ltr by the token) plus the diagonal stroke across the cut. pointer-events none, no fill anywhere. */
export function MapFrame({ className }: { className?: string }) {
  return (
    <>
      <span aria-hidden="true" className={cx("cut-m border-interactive pointer-events-none absolute inset-0 z-[2]", className)} />
      <svg aria-hidden="true" width="12" height="21" viewBox="0 0 12 21" className="pointer-events-none absolute top-0 start-0 z-[2] block ltr:-scale-x-100">
        <line x1="0" y1="0" x2="12" y2="21" stroke="var(--smq-ink)" strokeWidth="1.5" />
      </svg>
    </>
  );
}
