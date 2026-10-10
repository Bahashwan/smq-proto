// «يحتاج تأكيداً» chip (Admin-Content-D, Admin-Pieces-D): gold outline on the cream-focus background, gold text.
import { cx } from "@/lib/format";

export function ConfirmChip({ className, count }: { className?: string; count?: number }) {
  return (
    <span className={cx("inline-flex items-center gap-1 whitespace-nowrap border-[1.5px] border-gold bg-cream-focus px-2 py-[3px] text-caption font-extrabold text-gold-text tnum", className)}>
      يحتاج تأكيداً
      {typeof count === "number" && <span className="font-bold">· {count}</span>}
    </span>
  );
}
