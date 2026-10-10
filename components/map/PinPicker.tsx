"use client";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { cx } from "@/lib/format";
import { PinMarker } from "./HexPin";
import { SchematicDrawing } from "./Drawing";
import {
  OFFICE,
  PICKER_WINDOW,
  clampToWindow,
  districtLabel,
  districtPin,
  districtRef,
  formatCoord,
  isMapsLink,
  latLngToSvg,
  parseMapsLink,
  svgToLatLng,
  type LatLng,
  type ViewWindow,
  type XY,
} from "./geometry";

export type PinPickerMode = "pin" | "link";
export type PinPickerChange = XY & LatLng;
export type LinkState = "empty" | "located" | "short" | "unknown";

export const PICKER_HINT = "اختياري · اسحب الدبوس";
export const PICKER_PREVIEW_HINT = "معاينة الرابط · الدبوس يُضبط من الرابط تلقائياً";
export const PICKER_LINK_PLACEHOLDER = "https://maps.app.goo.gl/…";
/** not on a board: the only invented line, shown in gold when the text is neither a maps link nor a coordinate pair */
export const PICKER_UNKNOWN = "لم نتعرّف على الرابط";

export interface PinPickerProps {
  /** controlled position in desktop viewBox units (0…1000 × 0…800) */
  value?: XY | null;
  /** or a controlled location through the fit */
  latLng?: LatLng | null;
  onChange?: (v: PinPickerChange) => void;
  /** snaps the pin to that district's board position when no value is set (and again when the slug changes) */
  districtSlug?: string;
  /** `pin` (drag) or `link` («ألصق رابطاً»); uncontrolled when omitted */
  mode?: PinPickerMode;
  onModeChange?: (mode: PinPickerMode) => void;
  /** the «ألصق رابطاً» / «ضع دبوساً» tab row of AllianceApply-Step1-M */
  showModeTabs?: boolean;
  defaultMode?: PinPickerMode;
  /** controlled link text */
  link?: string;
  onLinkChange?: (link: string) => void;
  defaultLink?: string;
  /** box height in px (boards: 150 · 110 on the alliance preview) */
  height?: number;
  /** crop of the drawing shown in the box; default PICKER_WINDOW (the upper half) */
  window?: ViewWindow;
  /** the white chip in pin mode; default «اختياري · اسحب الدبوس» */
  hint?: string;
  /** the white chip in link mode once a link is pasted; default «معاينة الرابط · الدبوس يُضبط من الرابط تلقائياً» */
  previewHint?: string;
  /** the «موقعي الحالي» button of Add-Step1-M (geolocation; falls back to the office when unavailable) */
  locateButton?: boolean;
  /** «خط العرض» / «خط الطول» fields with seven decimals (admin boards) */
  coordinateFields?: boolean | "above" | "below";
  showLabels?: boolean;
  showRoads?: boolean;
  /** grid cell in px (boards: 28 add · 24 alliance · 30 site settings) */
  gridSize?: number;
  pinSize?: "m" | "s";
  /** echo a short (unparseable) maps link under the box; AllianceApply-Step1-M has no echo */
  echoLink?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

/** One draggable hexagon pin on the schematic drawing (pointer, touch and arrow keys), with the paste-a-link mode of
 *  the alliance board and optional coordinate fields. Values are desktop viewBox units; lat/lng go through the fit. */
export function PinPicker({
  value,
  latLng,
  onChange,
  districtSlug,
  mode: modeProp,
  onModeChange,
  showModeTabs = false,
  defaultMode = "pin",
  link: linkProp,
  onLinkChange,
  defaultLink = "",
  height = 150,
  window: windowProp,
  hint = PICKER_HINT,
  previewHint = PICKER_PREVIEW_HINT,
  locateButton = false,
  coordinateFields = false,
  showLabels = false,
  showRoads = true,
  gridSize = 28,
  pinSize = "m",
  echoLink = true,
  disabled = false,
  ariaLabel = "موقع العقار على الخريطة",
  className,
}: PinPickerProps) {
  const win = windowProp ?? PICKER_WINDOW;
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // mode and link: controlled or internal
  const [internalMode, setInternalMode] = useState<PinPickerMode>(defaultMode);
  const mode = modeProp ?? internalMode;
  const setMode = (m: PinPickerMode) => {
    setInternalMode(m);
    onModeChange?.(m);
  };
  const [internalLink, setInternalLink] = useState(defaultLink);
  const link = linkProp ?? internalLink;
  const setLink = (s: string) => {
    setInternalLink(s);
    onLinkChange?.(s);
  };

  // position: controlled value / latLng, else internal (snapped to the district until the user moves it)
  const snap = useCallback((slug?: string): XY => clampToWindow(slug ? districtPin(slug, "desktop") : { x: win.x + win.w / 2, y: win.y + win.h / 2 }, win), [win]);
  const [internal, setInternal] = useState<XY>(() => snap(districtSlug));
  const touched = useRef(false);
  const lastSlug = useRef(districtSlug);
  useEffect(() => {
    if (lastSlug.current === districtSlug) return;
    lastSlug.current = districtSlug;
    touched.current = false;
    setInternal(snap(districtSlug));
  }, [districtSlug, snap]);

  const raw: XY = value ?? (latLng ? latLngToSvg(latLng, "desktop", false) : internal);
  const pos = clampToWindow(raw, win);
  const ll = useMemo(() => svgToLatLng(pos, "desktop"), [pos]);

  const commit = useCallback(
    (p: XY) => {
      const c = clampToWindow(p, win);
      touched.current = true;
      setInternal(c);
      onChangeRef.current?.({ ...c, ...svgToLatLng(c, "desktop") });
    },
    [win],
  );
  const commitLatLng = useCallback((l: LatLng) => commit(latLngToSvg(l, "desktop", false)), [commit]);

  // pointer: drag the pin, or press anywhere on the box to place it there and keep dragging
  const toSvg = (e: { clientX: number; clientY: number }): XY => {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: win.x + ((e.clientX - r.left) / r.width) * win.w, y: win.y + ((e.clientY - r.top) / r.height) * win.h };
  };
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest("[data-picker-control]")) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    commit(toSvg(e));
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    e.preventDefault();
    commit(toSvg(e));
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // keyboard: arrows move 1 % of the window (5 % with Shift)
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const f = e.shiftKey ? 0.05 : 0.01;
    const dx = win.w * f;
    const dy = win.h * f;
    const next = { ArrowLeft: { x: pos.x - dx, y: pos.y }, ArrowRight: { x: pos.x + dx, y: pos.y }, ArrowUp: { x: pos.x, y: pos.y - dy }, ArrowDown: { x: pos.x, y: pos.y + dy } }[e.key];
    if (!next) return;
    e.preventDefault();
    commit(next);
  };

  // «موقعي الحالي»: geolocation when the browser grants it, the office otherwise (the designed canned location)
  const locate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return commitLatLng(OFFICE);
    navigator.geolocation.getCurrentPosition(
      (p) => commitLatLng({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => commitLatLng(OFFICE),
      { timeout: 5000, maximumAge: 60000 },
    );
  };

  // link mode: a parseable link moves the pin; a short link keeps it and echoes the link
  const parsed = useMemo(() => parseMapsLink(link), [link]);
  const linkState: LinkState = link.trim() === "" ? "empty" : parsed ? "located" : isMapsLink(link) ? "short" : "unknown";
  const parsedLat = parsed?.lat;
  const parsedLng = parsed?.lng;
  useEffect(() => {
    if (mode !== "link" || parsedLat == null || parsedLng == null) return;
    commitLatLng({ lat: parsedLat, lng: parsedLng });
  }, [mode, parsedLat, parsedLng, commitLatLng]);
  const preview = mode === "link" && (linkState === "located" || linkState === "short");

  // coordinate fields keep their own text while being edited
  const [latText, setLatText] = useState(() => formatCoord(ll.lat));
  const [lngText, setLngText] = useState(() => formatCoord(ll.lng));
  const [editing, setEditing] = useState<null | "lat" | "lng">(null);
  useEffect(() => {
    if (editing !== "lat") setLatText(formatCoord(ll.lat));
    if (editing !== "lng") setLngText(formatCoord(ll.lng));
  }, [ll.lat, ll.lng, editing]);
  const onCoord = (which: "lat" | "lng", text: string) => {
    if (which === "lat") setLatText(text);
    else setLngText(text);
    const n = parseFloat(text);
    if (!Number.isFinite(n)) return;
    if (which === "lat" && Math.abs(n) <= 90) commitLatLng({ lat: n, lng: ll.lng });
    if (which === "lng" && Math.abs(n) <= 180) commitLatLng({ lat: ll.lat, lng: n });
  };

  const id = useId();
  const marker = pinSize === "s" ? { width: 22, height: 26 } : { width: 26, height: 30 };
  const left = `${((pos.x - win.x) / win.w) * 100}%`;
  const top = `${((pos.y - win.y) / win.h) * 100}%`;
  const district = districtSlug ? districtRef(districtSlug) : undefined;
  const pinLabel = `الدبوس${district ? ` · ${district.ar}` : ""} · اسحب أو استخدم الأسهم`;

  const fields = coordinateFields ? (
    <div className="grid grid-cols-2 gap-[10px]">
      <label className="flex flex-col gap-1 text-[11px] font-bold text-muted">
        خط العرض
        <input
          dir="ltr"
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          value={latText}
          onFocus={() => setEditing("lat")}
          onBlur={() => setEditing(null)}
          onChange={(e) => onCoord("lat", e.target.value)}
          className="border-interactive tnum h-9 w-full bg-paper px-[10px] text-[13px] text-ink disabled:text-disabled"
        />
      </label>
      <label className="flex flex-col gap-1 text-[11px] font-bold text-muted">
        خط الطول
        <input
          dir="ltr"
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          value={lngText}
          onFocus={() => setEditing("lng")}
          onBlur={() => setEditing(null)}
          onChange={(e) => onCoord("lng", e.target.value)}
          className="border-interactive tnum h-9 w-full bg-paper px-[10px] text-[13px] text-ink disabled:text-disabled"
        />
      </label>
    </div>
  ) : null;

  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {showModeTabs && (
        <div role="tablist" aria-label="طريقة تحديد الموقع" className="border-interactive flex bg-paper">
          <button
            type="button"
            role="tab"
            id={`${id}-tab-link`}
            aria-selected={mode === "link"}
            aria-controls={`${id}-panel`}
            onClick={() => setMode("link")}
            className={cx("h-[38px] flex-1 text-[12px]", mode === "link" ? "bg-ink font-extrabold text-paper" : "bg-paper font-bold text-ink")}
          >
            ألصق رابطاً
          </button>
          <button
            type="button"
            role="tab"
            id={`${id}-tab-pin`}
            aria-selected={mode === "pin"}
            aria-controls={`${id}-panel`}
            onClick={() => setMode("pin")}
            className={cx("h-[38px] flex-1 border-s-[1.5px] border-ink text-[12px]", mode === "pin" ? "bg-ink font-extrabold text-paper" : "bg-paper font-bold text-ink")}
          >
            ضع دبوساً
          </button>
        </div>
      )}
      {mode === "link" && (
        <input
          type="url"
          dir="ltr"
          inputMode="url"
          autoComplete="off"
          aria-label="رابط خرائط قوقل"
          placeholder={PICKER_LINK_PLACEHOLDER}
          value={link}
          disabled={disabled}
          onChange={(e) => setLink(e.target.value)}
          className="border-interactive h-12 w-full bg-paper px-3 text-right text-[15px] font-semibold text-ink placeholder:text-disabled disabled:text-disabled"
        />
      )}
      {coordinateFields === "above" && fields}
      <div
        id={showModeTabs ? `${id}-panel` : undefined}
        role={showModeTabs ? "tabpanel" : "group"}
        aria-labelledby={showModeTabs ? (mode === "link" ? `${id}-tab-link` : `${id}-tab-pin`) : undefined}
        aria-label={showModeTabs ? undefined : ariaLabel}
        ref={boxRef}
        className={cx("border-interactive relative select-none overflow-hidden bg-slot touch-none", disabled ? "cursor-default" : "cursor-crosshair")}
        style={{ height }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <SchematicDrawing variant="desktop" window={win} grid={gridSize} showRoads={showRoads} />
        {showLabels &&
          Object.entries(SMALL_LABELS).map(([slug, ar]) => {
            const l = districtLabel(slug, "desktop");
            if (!l || l.y < win.y || l.y > win.y + win.h) return null;
            return (
              <span
                key={slug}
                aria-hidden="true"
                className="absolute whitespace-nowrap text-[11px] font-bold text-muted"
                style={{ left: `${((l.x - win.x) / win.w) * 100}%`, top: `${((l.y - win.y) / win.h) * 100}%`, transform: l.anchor === "end" ? "translateX(-100%)" : undefined }}
              >
                {ar}
              </span>
            );
          })}
        <button
          type="button"
          aria-label={pinLabel}
          disabled={disabled}
          onKeyDown={onKeyDown}
          className={cx("absolute z-[1] flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center", disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing")}
          style={{ left, top }}
        >
          <PinMarker {...marker} />
        </button>
        {locateButton && (
          <button
            type="button"
            data-picker-control=""
            disabled={disabled}
            onClick={locate}
            className="border-interactive absolute bottom-2 start-2 z-[2] h-8 bg-paper px-[10px] text-[11px] font-bold text-ink disabled:text-disabled"
          >
            موقعي الحالي
          </button>
        )}
        <span aria-live="polite" className={cx("text-caption absolute bottom-2 z-[2] max-w-[calc(100%-16px)] truncate bg-paper px-[6px] py-[2px] font-bold", locateButton ? "end-2" : "start-2")}>
          {preview ? previewHint : hint}
        </span>
      </div>
      {echoLink && mode === "link" && linkState === "short" && (
        <span dir="ltr" className="text-caption truncate text-end text-muted">
          {link.trim()}
        </span>
      )}
      {mode === "link" && linkState === "unknown" && <span className="text-caption font-bold text-gold-text">{PICKER_UNKNOWN}</span>}
      {(coordinateFields === true || coordinateFields === "below") && fields}
    </div>
  );
}

const SMALL_LABELS: Record<string, string> = { rawdah: "الروضة", safa: "الصفا", "obhur-north": "أبحر الشمالية", naeem: "النعيم", shati: "الشاطئ" };
