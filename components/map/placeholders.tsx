import type { ReactNode } from "react";
import { cx } from "@/lib/format";

/** The boards' schematic drawings behind the keyless embeds (Contact-D/M, Project-D/M). Exact SVGs from
 *  design/preview; the phone drawing shows below `md`, the desktop drawing from `md` up. Decorative. */

type DrawingProps = { className?: string; opacity?: number };

const LINE = { fill: "none", stroke: "var(--smq-on-ink-muted)", strokeWidth: 1.5 } as const;

/** Office drawing · Contact-D (1200 × 380) and Contact-M (350 × 220): streets and one diagonal. */
export function OfficeDrawing({ className, opacity = 0.6 }: DrawingProps) {
  return (
    <>
      <svg aria-hidden="true" viewBox="0 0 350 220" preserveAspectRatio="none" className={cx("absolute inset-0 block h-full w-full md:hidden", className)} style={{ opacity }} {...LINE}>
        <path d="M0 70h350M0 140h350M0 190h350M70 0v220M175 0v220M280 0v220M0 0l350 220" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 1200 380" preserveAspectRatio="none" className={cx("absolute inset-0 hidden h-full w-full md:block", className)} style={{ opacity }} {...LINE}>
        <path d="M0 100h1200M0 220h1200M0 300h1200M200 0v380M500 0v380M800 0v380M1050 0v380M0 0l1200 380" />
      </svg>
    </>
  );
}

/** Project drawing · Project-D (600 × 320) and Project-M (358 × 200): a plain street grid. */
export function ProjectDrawing({ className, opacity = 0.6 }: DrawingProps) {
  return (
    <>
      <svg aria-hidden="true" viewBox="0 0 358 200" preserveAspectRatio="none" className={cx("absolute inset-0 block h-full w-full md:hidden", className)} style={{ opacity }} {...LINE}>
        <path d="M0 60h358M0 120h358M0 170h358M80 0v200M190 0v200M290 0v200" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 600 320" preserveAspectRatio="none" className={cx("absolute inset-0 hidden h-full w-full md:block", className)} style={{ opacity }} {...LINE}>
        <path d="M0 90h600M0 190h600M0 260h600M130 0v320M300 0v320M470 0v320" />
      </svg>
    </>
  );
}

export const OFFICE_CHIP = "خريطة Google · مكبّرة على الشارع، لا على المدينة";
export const OFFICE_CAPTION = "مكتب SMQ · شارع السيدة خديجة، حي الفيصلية";
export const OFFICE_CAPTION_SHORT = "مكتب SMQ · شارع السيدة خديجة";
export const PROJECT_CHIP = "خريطة Google بموقع المشروع";
export const PROJECT_CAPTION = "جاردن الروضة";

/** A complete placeholder: slot background, the drawing, the white chip (top start) and the gold hex-point
 *  marker over an ink caption in the centre, as the boards draw them. Fills its positioned parent. */
export function MapPlaceholder({
  kind,
  chip,
  caption,
  captionShort,
  className,
}: {
  kind: "office" | "project";
  /** the white chip at the top; default the board's copy for the kind */
  chip?: ReactNode;
  /** the ink caption under the marker; default the board's copy for the kind */
  caption?: ReactNode;
  /** phone variant of the caption (Contact-M shortens the office caption) */
  captionShort?: ReactNode;
  className?: string;
}) {
  const chipText = chip ?? (kind === "office" ? OFFICE_CHIP : PROJECT_CHIP);
  const long = caption ?? (kind === "office" ? OFFICE_CAPTION : PROJECT_CAPTION);
  const short = captionShort ?? (kind === "office" ? OFFICE_CAPTION_SHORT : long);
  return (
    <div className={cx("absolute inset-0 flex items-center justify-center overflow-hidden bg-slot", className)}>
      {kind === "office" ? <OfficeDrawing /> : <ProjectDrawing />}
      <span className="text-caption absolute top-[10px] start-[10px] bg-paper px-2 py-1 font-bold md:top-[14px] md:start-[14px] md:px-[10px] md:py-[5px]">{chipText}</span>
      <div className="relative flex flex-col items-center gap-1 md:gap-[6px]">
        <span aria-hidden="true" className="hex-point block h-[26px] w-[26px] bg-gold md:h-8 md:w-8" />
        <span className="bg-ink px-[9px] py-[5px] text-[11px] font-bold text-paper md:px-3 md:py-2 md:text-[13px]">
          {short === long ? (
            long
          ) : (
            <>
              <span className="md:hidden">{short}</span>
              <span className="hidden md:inline">{long}</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export function OfficePlaceholder(props: Omit<Parameters<typeof MapPlaceholder>[0], "kind">) {
  return <MapPlaceholder kind="office" {...props} />;
}
export function ProjectPlaceholder(props: Omit<Parameters<typeof MapPlaceholder>[0], "kind">) {
  return <MapPlaceholder kind="project" {...props} />;
}
