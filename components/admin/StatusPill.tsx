// Status pill (Components2 · 5). Colour by shape and word only: filled ink, outlined ink, gold outline on cream,
// gold outline, muted outline, filled gold (counts, «جديد»), sand («من Excel»), hairline («مخفية»).
// Unit statuses (متاح، محجوز، مباع) are never pills: they stay a hexagon + word (see UnitStatusMark).
import type { ReactNode } from "react";
import { cx } from "@/lib/format";

export type PillVariant = "ink" | "outline" | "tbc" | "goldOutline" | "muted" | "gold" | "sand" | "hairline";

export type AdminStatus =
  | "منشور"
  | "نُشر"
  | "مسودة"
  | "يحتاج تأكيداً"
  | "معلّق"
  | "جديد"
  | "بانتظار"
  | "بانتظار الموافقة"
  | "بانتظار صور"
  | "معتمد"
  | "مرفوض"
  | "بلا رد"
  | "تم الرد"
  | "مغلق"
  | "من Excel"
  | "مخفية"
  | "مخفي"
  | "تنبيه محفوظ"
  | (string & {});

const BY_STATUS: Record<string, PillVariant> = {
  "منشور": "ink",
  "نُشر": "ink",
  "تم الرد": "ink",
  "معتمد": "ink",
  "مسودة": "outline",
  "بانتظار": "outline",
  "بانتظار الموافقة": "outline",
  "بانتظار صور": "outline",
  "تنبيه محفوظ": "outline",
  "معلّق": "outline",
  "يحتاج تأكيداً": "tbc",
  "بلا رد": "goldOutline",
  "مغلق": "muted",
  "مرفوض": "muted",
  "جديد": "gold",
  "من Excel": "sand",
  "مخفية": "hairline",
  "مخفي": "hairline",
};

const VARIANT: Record<PillVariant, string> = {
  ink: "bg-ink text-paper",
  outline: "border-[1.5px] border-ink text-ink",
  tbc: "border-[1.5px] border-gold bg-cream-focus text-gold-text",
  goldOutline: "border-[1.5px] border-gold text-gold-text",
  muted: "border-[1.5px] border-muted text-muted",
  gold: "bg-gold text-ink",
  sand: "bg-sand text-ink",
  hairline: "border border-line text-ink font-semibold",
};

export function pillVariantFor(status: string): PillVariant {
  if (BY_STATUS[status]) return BY_STATUS[status];
  if (/^\d+$/.test(status.trim())) return "gold";
  return "outline";
}

export interface StatusPillProps {
  status: AdminStatus;
  /** Override the variant the status word maps to. */
  variant?: PillVariant;
  className?: string;
  children?: ReactNode;
}

export function StatusPill({ status, variant, className, children }: StatusPillProps) {
  const v = variant ?? pillVariantFor(status);
  return <span className={cx("inline-block whitespace-nowrap px-2 py-[3px] text-caption font-extrabold leading-tight tnum", VARIANT[v], className)}>{children ?? status}</span>;
}

/** Unit status as the first sheet draws it: hexagon + word. Gold = متاح, white with ink ring = محجوز, ink = مباع. */
export function UnitStatusMark({ status, className }: { status: "available" | "reserved" | "sold"; className?: string }) {
  const word = status === "available" ? "متاح" : status === "reserved" ? "محجوز" : "مباع";
  return (
    <span className={cx("inline-flex items-center gap-1 whitespace-nowrap", className)}>
      {status === "reserved" ? (
        <span className="hex-flat inline-flex size-3 items-center justify-center bg-ink" aria-hidden>
          <span className="hex-flat block size-[7px] bg-paper" />
        </span>
      ) : (
        <span className={cx("hex-flat inline-block size-3", status === "available" ? "bg-gold" : "bg-ink")} aria-hidden />
      )}
      {word}
    </span>
  );
}
