import type { ReactNode } from "react";
import { cx, fmtNum } from "@/lib/format";
import { HexDot } from "./HexCell";
import { ledgerNetLine } from "./lib";

/**
 * «شريط الميزان · أعطى واستقبل». Gold is always «أعطى», ink always «استقبل». Bars are scaled to the highest value
 * in the card. The net is a word, not a colour: «معطٍ» · «مستقبِل» · «متوازن».
 */
export interface LedgerRow {
  label: string;
  value: number;
  /** text shown instead of the number («1 س 40 د») */
  display?: string;
  /** 0..1 override for rows that are not counts (reply time) */
  ratio?: number;
}

export interface LedgerBarProps {
  /** totals: «أعطى» (offers + requests given) and «استقبل» (requests received) */
  given: number;
  received: number;
  /** the rows of the card; default: عروض / طلبات · طلبات / ردّ */
  rows?: { given: LedgerRow[]; received: LedgerRow[] };
  labels?: { given?: string; received?: string; net?: string };
  variant?: "card" | "compact";
  /** card: header line inside the frame (Member-Ledger-M) */
  header?: { title: string; subtitle?: string };
  /** card: the net row at the bottom («صافي الميزان») */
  showNet?: boolean;
  /** card: a vertical rule between the two sides */
  divider?: boolean;
  /** card: a note under the net row */
  note?: ReactNode;
  /** compact: suspended member (line-coloured bars, muted text) */
  suspended?: boolean;
  /** compact: new member, nothing yet («بلا بيانات بعد») */
  empty?: boolean;
  className?: string;
}

function Bar({ row, max, tone, tall }: { row: LedgerRow; max: number; tone: "gold" | "ink"; tall?: boolean }) {
  const ratio = row.ratio ?? (max > 0 ? row.value / max : 0);
  return (
    <div className="flex flex-col gap-[3px]">
      <div className="flex items-baseline justify-between gap-2 text-[12px]">
        <span>{row.label}</span>
        <strong className="tnum font-extrabold">{row.display ?? fmtNum(row.value)}</strong>
      </div>
      <div className={cx("relative bg-slot", tall ? "h-3.5" : "h-3")}>
        <span className={cx("absolute top-0 start-0 h-full", tone === "gold" ? "bg-gold" : "bg-ink")} style={{ width: `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%` }} />
      </div>
    </div>
  );
}

export function LedgerBar({ given, received, rows, labels, variant = "card", header, showNet = true, divider, note, suspended, empty, className }: LedgerBarProps) {
  const L = { given: labels?.given ?? "أعطى", received: labels?.received ?? "استقبل", net: labels?.net ?? "صافي الميزان" };
  if (variant === "compact") {
    if (empty) {
      return (
        <span className={cx("inline-flex items-center gap-1 text-caption font-bold text-muted", className)}>
          <i className="inline-block h-2.5 w-[50px]" style={{ border: "1.5px solid var(--smq-line)" }} /> بلا بيانات بعد
        </span>
      );
    }
    const max = Math.max(given, received, 1);
    const w = (v: number) => (v === 0 ? 0 : Math.max(5, Math.round((v / max) * 60)));
    return (
      <span className={cx("inline-flex items-center gap-1 whitespace-nowrap text-caption font-bold tnum", suspended && "text-muted", className)} title={`${L.given} ${fmtNum(given)} · ${L.received} ${fmtNum(received)}`}>
        <i className={cx("inline-block h-2.5", suspended ? "bg-line" : "bg-gold")} style={{ width: w(given) }} />
        {fmtNum(given)}
        <b className={cx("inline-block h-2.5", suspended ? "bg-line" : "bg-ink")} style={{ width: w(received) }} />
        {fmtNum(received)}
      </span>
    );
  }
  const r = rows ?? { given: [{ label: "عروض", value: given }], received: [{ label: "طلبات", value: received }] };
  const max = Math.max(...r.given.filter((x) => x.ratio == null).map((x) => x.value), ...r.received.filter((x) => x.ratio == null).map((x) => x.value), 1);
  const tall = Boolean(header);
  return (
    <section className={cx("flex flex-col bg-paper border-interactive", className)}>
      {header && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-3" style={{ borderBottom: "1.5px solid var(--smq-ink)" }}>
          <h2 className="text-[15px] font-extrabold">{header.title}</h2>
          {header.subtitle && <span className="text-caption text-muted">{header.subtitle}</span>}
        </div>
      )}
      <div className={cx("grid grid-cols-2", !divider && "gap-3.5 p-3.5")} style={showNet && header ? { borderBottom: "1.5px solid var(--smq-ink)" } : undefined}>
        <div className={cx("flex flex-col gap-2", divider && "p-3.5 gap-2.5")} style={divider ? { borderInlineEnd: "1.5px solid var(--smq-ink)" } : undefined}>
          <span className="text-caption font-extrabold text-gold-text">{L.given}</span>
          {r.given.map((row) => (
            <Bar key={row.label} row={row} max={max} tone="gold" tall={tall} />
          ))}
        </div>
        <div className={cx("flex flex-col gap-2", divider && "p-3.5 gap-2.5")}>
          <span className="text-caption font-extrabold">{L.received}</span>
          {r.received.map((row) => (
            <Bar key={row.label} row={row} max={max} tone="ink" tall={tall} />
          ))}
        </div>
      </div>
      {showNet && (
        <div className={cx("flex items-center justify-between gap-3 bg-sand px-3.5 py-2.5 text-[12px]", !header && "mx-3.5 mb-3.5")}>
          <span>{L.net}</span>
          <span className="flex items-center gap-2 font-extrabold tnum">
            <HexDot size={12} /> {ledgerNetLine(given, received)}
          </span>
        </div>
      )}
      {note && <p className="px-3.5 py-3 text-caption text-muted">{note}</p>}
    </section>
  );
}
