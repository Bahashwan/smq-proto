"use client";
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx, plural, UNITS } from "@/lib/format";
import { HexPin, type PinKind } from "./HexPin";
import { SchematicDrawing } from "./Drawing";
import { districtLabel, districtPin, getGeometry, latLngToSvg, scalePoint, type LatLng, type MapVariant, type XY } from "./geometry";

export interface MapPin {
  id: string;
  /** places the pin on the board's position for that district (docs/data-model.md slugs) */
  districtSlug?: string;
  /** or an explicit point in desktop viewBox units (0…1000 × 0…800), scaled proportionally on the phone drawing */
  x?: number;
  y?: number;
  /** or a location through the fit (`latLngToSvg`) */
  latLng?: LatLng;
  /** matching units (shown in the hexagon for `available` and `owner`) */
  count?: number;
  kind: PinKind;
  /** the white chip under the hexagon, verbatim from the page's copy (e.g. «جاردن الروضة», «من مالك · الصفا») */
  label: string;
  /** accessible name; default `label · N وحدات` / `label · قريباً` */
  ariaLabel?: string;
}

export const DEFAULT_LEGEND = "السداسي الذهبي: متاح · الأبيض: من مالك أو قريباً · الرقم: الوحدات المطابقة";
export const ZOOM_MIN = 1;
export const ZOOM_MAX = 2.5;
export const ZOOM_STEP = 0.5;

export interface SchematicMapProps {
  pins: MapPin[];
  selectedId?: string | null;
  onSelect?: (id: string, pin: MapPin) => void;
  /** district labels (default true) */
  showLabels?: boolean;
  /** the «+» / «−» buttons (default true) */
  showZoom?: boolean;
  /** the white legend chip (bottom start); `null` hides it; default the board's legend without the provider note */
  legend?: string | null;
  /** the white chip at the top start, e.g. «جدة · شمال وسط» on the phone board */
  regionLabel?: string;
  /** renders the «موقعي» button of the phone board and calls back on tap */
  onLocate?: () => void;
  /** `auto` renders the phone drawing below `md` and the desktop drawing from `md` (default) */
  variant?: MapVariant | "auto";
  initialZoom?: number;
  /** what the zoom scales around: the region's centre (default, as the brief says) or the selected pin when there is one */
  zoomOrigin?: "center" | "selected";
  /** the popover for the selected pin (desktop boards): rendered under the pin with the ink pointer */
  renderPopover?: (pin: MapPin) => ReactNode;
  popoverWidth?: number;
  ariaLabel?: string;
  className?: string;
  /** anything else to overlay on the region (positioned by the caller) */
  children?: ReactNode;
}

/** The results map view of Results-Map-M/D: an interactive schematic SVG with hexagon pins. The zoom buttons scale
 *  the drawing around the centre (1 → 2.5, 120 ms); labels and pins keep their size and follow the scale. */
export function SchematicMap({ variant = "auto", initialZoom = ZOOM_MIN, ...rest }: SchematicMapProps) {
  const [zoom, setZoom] = useState(() => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, initialZoom)));
  if (variant === "auto") {
    return (
      <>
        <MapView {...rest} variant="phone" zoom={zoom} setZoom={setZoom} className={cx("md:hidden", rest.className)} />
        <MapView {...rest} variant="desktop" zoom={zoom} setZoom={setZoom} className={cx("hidden md:block", rest.className)} />
      </>
    );
  }
  return <MapView {...rest} variant={variant} zoom={zoom} setZoom={setZoom} />;
}

function resolvePin(pin: MapPin, variant: MapVariant): XY {
  if (pin.x != null && pin.y != null) return scalePoint({ x: pin.x, y: pin.y }, variant);
  if (pin.latLng) return latLngToSvg(pin.latLng, variant, true);
  if (pin.districtSlug) return districtPin(pin.districtSlug, variant);
  const g = getGeometry(variant);
  return { x: g.viewBox.w / 2, y: g.viewBox.h / 2 };
}

function pinName(pin: MapPin): string {
  if (pin.ariaLabel) return pin.ariaLabel;
  if (pin.kind === "soon") return `${pin.label} · قريباً`;
  return pin.count == null ? pin.label : `${pin.label} · ${plural(pin.count, UNITS)}`;
}

/** left/top of a drawing point as the zoom scales everything around the origin (percentages of the box) */
function placed(p: XY, w: number, h: number, zoom: number, origin: XY = { x: 50, y: 50 }): CSSProperties {
  const px = (p.x / w) * 100;
  const py = (p.y / h) * 100;
  return zoom === 1
    ? { left: `${px}%`, top: `${py}%` }
    : { left: `calc(${origin.x}% + (${px}% - ${origin.x}%) * ${zoom})`, top: `calc(${origin.y}% + (${py}% - ${origin.y}%) * ${zoom})` };
}

const FOLLOW: CSSProperties = { transition: "left var(--smq-motion-hover) var(--smq-ease), top var(--smq-motion-hover) var(--smq-ease)" };

function MapView({
  pins,
  selectedId,
  onSelect,
  showLabels = true,
  showZoom = true,
  legend = DEFAULT_LEGEND,
  regionLabel,
  onLocate,
  variant,
  zoom,
  setZoom,
  renderPopover,
  popoverWidth = 360,
  zoomOrigin = "center",
  ariaLabel = "خريطة النتائج",
  className,
  children,
}: Omit<SchematicMapProps, "variant" | "initialZoom"> & { variant: MapVariant; zoom: number; setZoom: (z: number) => void }) {
  const g = getGeometry(variant);
  const { w, h } = g.viewBox;
  const phone = variant === "phone";
  const hex = phone ? 44 : 52;
  const hexSelected = hex + 8;
  const text = phone ? 13 : 15;
  const labelSlugs = showLabels ? Object.keys(g.labels) : [];
  const selected = pins.find((p) => p.id === selectedId) ?? null;
  const originPin = zoomOrigin === "selected" && selected ? resolvePin(selected, variant) : null;
  const origin: XY = originPin ? { x: (originPin.x / w) * 100, y: (originPin.y / h) * 100 } : { x: 50, y: 50 };

  // the popover is clamped inside the region, so its width is measured (the ink pointer stays under the pin)
  const regionRef = useRef<HTMLDivElement>(null);
  const [regionW, setRegionW] = useState(0);
  useLayoutEffect(() => {
    const el = regionRef.current;
    if (!el) return;
    const read = () => setRegionW(el.clientWidth);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  let popover: ReactNode = null;
  if (selected && renderPopover) {
    const p = resolvePin(selected, variant);
    const pinLeft = regionW * (origin.x / 100 + (p.x / w - origin.x / 100) * zoom);
    const width = Math.max(0, Math.min(popoverWidth, regionW - 32));
    const half = width / 2;
    const left = regionW ? Math.min(Math.max(16 + half, pinLeft), Math.max(16 + half, regionW - 16 - half)) : pinLeft;
    const pointer = Math.min(Math.max(12, pinLeft - (left - half)), Math.max(12, width - 12));
    popover = (
      <div
        className="absolute z-[3]"
        style={{ ...placed(p, w, h, zoom, origin), ...FOLLOW, left: regionW ? left : undefined, width, maxWidth: "calc(100% - 32px)", transform: `translate(-50%, ${hexSelected / 2 + 34}px)` }}
      >
        <span aria-hidden="true" className="absolute -top-[10px] h-[10px] w-[18px] -translate-x-1/2 bg-ink" style={{ left: pointer, clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
        {renderPopover(selected)}
      </div>
    );
  }

  return (
    <div ref={regionRef} role="region" aria-label={ariaLabel} className={cx("relative isolate overflow-hidden bg-slot", className)}>
      <SchematicDrawing variant={variant} style={{ transform: `scale(${zoom})`, transformOrigin: `${origin.x}% ${origin.y}%`, transition: "transform var(--smq-motion-hover) var(--smq-ease), transform-origin var(--smq-motion-hover) var(--smq-ease)" }} />

      {/* district labels */}
      {labelSlugs.map((slug) => {
        const l = districtLabel(slug, variant)!;
        return (
          <span
            key={slug}
            aria-hidden="true"
            className={cx("absolute whitespace-nowrap font-bold text-muted", phone ? "text-[11px]" : "text-[13px]")}
            style={{ ...placed(l, w, h, zoom, origin), ...FOLLOW, transform: l.anchor === "end" ? "translateX(-100%)" : undefined }}
          >
            {DISTRICT_AR[slug] ?? slug}
          </span>
        );
      })}

      {/* pins */}
      {pins.map((pin) => {
        const p = resolvePin(pin, variant);
        const isSelected = pin.id === selectedId;
        return (
          <button
            key={pin.id}
            type="button"
            aria-label={pinName(pin)}
            aria-pressed={isSelected}
            onClick={() => onSelect?.(pin.id, pin)}
            className={cx("absolute z-[1] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center", isSelected && "z-[2]")}
            style={{ ...placed(p, w, h, zoom, origin), ...FOLLOW }}
          >
            <HexPin kind={pin.kind} count={pin.count} size={isSelected ? hexSelected : hex} textSize={isSelected ? text + 2 : text} selected={isSelected} />
            <span className={cx("absolute top-full left-1/2 -translate-x-1/2 whitespace-nowrap bg-paper font-extrabold text-ink", phone ? "mt-[2px] px-[6px] py-[2px] text-[11px]" : "mt-[3px] px-2 py-[3px] text-[11px]")}>
              {pin.label}
            </span>
          </button>
        );
      })}

      {/* popover under the selected pin (desktop card), clamped inside the region */}
      {popover}

      {regionLabel && <span className="text-caption absolute top-[10px] start-4 z-[2] bg-paper px-2 py-[3px] font-bold">{regionLabel}</span>}

      {(showZoom || onLocate) && (
        <div className="absolute bottom-4 end-4 z-[2] flex flex-col gap-[6px]">
          {showZoom && (
            <>
              <button
                type="button"
                aria-label="تكبير"
                disabled={zoom >= ZOOM_MAX}
                onClick={() => setZoom(Math.min(ZOOM_MAX, +(zoom + ZOOM_STEP).toFixed(2)))}
                className="border-interactive flex h-11 w-11 items-center justify-center bg-paper text-[20px] font-extrabold text-ink disabled:text-disabled"
              >
                +
              </button>
              <button
                type="button"
                aria-label="تصغير"
                disabled={zoom <= ZOOM_MIN}
                onClick={() => setZoom(Math.max(ZOOM_MIN, +(zoom - ZOOM_STEP).toFixed(2)))}
                className="border-interactive flex h-11 w-11 items-center justify-center bg-paper text-[20px] font-extrabold text-ink disabled:text-disabled"
              >
                −
              </button>
            </>
          )}
          {onLocate && (
            <button type="button" aria-label="موقعي" onClick={onLocate} className="border-interactive flex h-11 w-11 items-center justify-center bg-paper text-ink">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              </svg>
            </button>
          )}
        </div>
      )}

      {legend && <span className={cx("text-caption absolute bottom-4 start-4 z-[2] bg-paper font-bold", phone ? (showZoom || onLocate ? "max-w-[calc(100%-88px)] px-2 py-[3px]" : "max-w-[calc(100%-32px)] px-2 py-[3px]") : "max-w-[calc(100%-92px)] px-[10px] py-1")}>{legend}</span>}

      {children}
    </div>
  );
}

/** Arabic names of the districts the boards label (geometry keeps the full table in DISTRICTS). */
const DISTRICT_AR: Record<string, string> = {
  rawdah: "الروضة",
  safa: "الصفا",
  "obhur-north": "أبحر الشمالية",
  naeem: "النعيم",
  shati: "الشاطئ",
};
