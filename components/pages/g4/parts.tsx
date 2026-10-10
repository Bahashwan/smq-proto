// G4 · small page-local pieces shared by the guide, project, projects and contact pages (token-driven).
import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { CheckIcon, Footer } from "@/components/ui";
import type { NavItem } from "@/components/ui";

/** White hexagon with the 1.5px ink ring (nested hexagons, as the library draws rings). */
export function RingHex({ children, size = "m", className }: { children: ReactNode; size?: "s" | "m" | "l"; className?: string }) {
  // s: the project milestones (36 → 40px) · m: 48px · l: the projects cards (48 → 56px)
  const outer = size === "s" ? "size-9 lg:size-10" : size === "m" ? "size-12" : "size-12 lg:size-14";
  const text = size === "s" ? "text-label" : size === "m" ? "text-label" : "text-caption";
  return (
    <span className={cx("relative inline-flex shrink-0 items-center justify-center hex-flat bg-ink font-extrabold leading-none tnum", outer, className)}>
      <span aria-hidden className="absolute inset-[1.5px] hex-flat bg-paper" />
      <span className={cx("relative px-1 text-center text-ink", text)}>{children}</span>
    </span>
  );
}

/** Gold hexagon with a value («8 متاحة») or an icon. */
export function GoldHex({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("inline-flex shrink-0 flex-col items-center justify-center hex-flat bg-gold text-ink font-extrabold leading-tight text-center tnum", className)}>{children}</span>;
}
/** Gold hexagon with the check; `className` carries the size (default 48px). */
export function CheckHex({ className = "size-12", icon = 20 }: { className?: string; icon?: number }) {
  return (
    <GoldHex className={className}>
      <CheckIcon size={icon} />
    </GoldHex>
  );
}

/** The ink numbers band (guide, project hero). Cells get a start border on ink-2 so the dividers sit between them. */
export interface BandCell {
  value: ReactNode;
  label: ReactNode;
  gold?: boolean;
}
export function StatBand({ cells, className, valueClass = "text-h2", labelClass = "text-caption", cellClass = "px-4 py-4" }: { cells: BandCell[]; className?: string; valueClass?: string; labelClass?: string; cellClass?: string }) {
  return (
    <div className={cx("grid bg-ink text-paper", className)} style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}>
      {cells.map((c, i) => (
        <div key={i} className={cx("flex min-w-0 flex-col gap-1", cellClass, i > 0 && "border-s border-ink-2")}>
          <span className={cx("font-extrabold leading-none tnum whitespace-nowrap", valueClass, c.gold && "text-gold")}>{c.value}</span>
          <span className={cx("font-normal leading-snug text-on-ink-muted", labelClass)}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}
/** «8 / 10» with the muted «/ 10» */
export function OfTotal({ n, of, className }: { n: number; of: number; className?: string }) {
  return (
    <>
      {n}
      <span className={cx("ms-1 font-semibold text-on-ink-muted", className)}>/ {of}</span>
    </>
  );
}

/** Key / value row with the hairline under it (project location, contact details). */
export function DefRow({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cx("flex items-start justify-between gap-4 border-b border-line py-3.5", className)}>
      <span className="shrink-0 text-muted">{label}</span>
      <span className="min-w-0 font-bold">{children}</span>
    </div>
  );
}

/** A plain outline action (no cut), 44px tall. */
export function OutlineLink({ href, children, className, external }: { href: string; children: ReactNode; className?: string; external?: boolean }) {
  const cls = cx("inline-flex min-h-11 items-center justify-center gap-2 px-4 border-interactive bg-paper text-ink text-label font-bold no-underline hover:bg-sand motion-hover transition-colors", className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/** Footer links per board (the phone footer lists differ from page to page). */
const L: Record<string, NavItem> = {
  units: { label: "العقارات", href: "/units" },
  guide: { label: "دليل الأسعار", href: "/guide" },
  services: { label: "الخدمات", href: "/services" },
  collab: { label: "تعاون معنا", href: "/collaborate" },
  about: { label: "من نحن", href: "/about" },
  contact: { label: "تواصل معنا", href: "/contact" },
  privacy: { label: "الخصوصية", href: "/privacy" },
};
export const FOOTER_LINKS = {
  guide: [L.units, L.services, L.collab, L.about, L.contact],
  projects: [L.units, L.guide, L.services, L.about, L.contact, L.privacy],
  project: [L.units, L.guide, L.services, L.about, L.contact],
  contact: [L.units, L.guide, L.services, L.collab, L.about],
};
/** The G4 desktop footers end at «© 2026 إس إم كيو العقارية» (no privacy link on the boards' desktop line). */
export function PageFooter({ links }: { links: NavItem[] }) {
  return <Footer compact links={links} privacy={false} />;
}
