// «ترخيص الهيئة العامة للعقار 1200040135 · السجل التجاري 7029797433» · appears on every page (footer, OG, print).
import { cx } from "@/lib/format";
import { LICENCE } from "./constants";

export function LicenceLine({ variant = "ar", licence = LICENCE, className }: { variant?: "ar" | "en"; licence?: { rega: string; cr: string }; className?: string }) {
  if (variant === "en") {
    return (
      <span className={cx("tnum", className)}>
        REGA licence {licence.rega} · CR {licence.cr}
      </span>
    );
  }
  return (
    <span className={className}>
      ترخيص الهيئة العامة للعقار{" "}
      <span className="inline-block text-paper tnum" dir="ltr">
        {licence.rega}
      </span>{" "}
      · السجل التجاري{" "}
      <span className="inline-block text-paper tnum" dir="ltr">
        {licence.cr}
      </span>
    </span>
  );
}
