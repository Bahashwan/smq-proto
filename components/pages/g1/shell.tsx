// Small helpers shared by the G1 shell pages (services, about, privacy, 404, /en).
import type { ReactNode } from "react";
import { NAV_AR, type NavItem } from "@/components/ui";

/** The phone footers of the shell boards list every main page except the current one (no «المشاريع» link). */
export function shellFooterLinks(currentHref: string, extra: NavItem[] = []): NavItem[] {
  return [...NAV_AR.filter((l) => l.href !== "/projects" && l.href !== currentHref), ...extra.filter((l) => l.href !== currentHref)];
}

/** Copy that differs slightly between the phone and desktop boards: the phone text below md, the desktop text from md. */
export function Resp({ m, d }: { m: ReactNode; d: ReactNode }) {
  if (m === d) return <>{m}</>;
  return (
    <>
      <span className="md:hidden">{m}</span>
      <span className="hidden md:inline">{d}</span>
    </>
  );
}
