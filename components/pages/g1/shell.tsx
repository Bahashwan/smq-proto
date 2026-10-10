// Small helpers shared by the G1 shell pages (services, about, privacy, 404, /en).
import type { ReactNode } from "react";
import { NAV_AR, type NavItem } from "@/components/ui";

/**
 * A frame whose 60° cut sits on the bottom line-START corner (bottom-right in RTL), as the Home and About boards draw
 * some images and the founder tile. The cut tokens draw the bottom-left corner in RTL and mirror under dir=ltr, so the
 * frame takes dir=ltr (the token mirrors) and hands rtl back to its content. Pass the cut utility in className.
 */
export function CutStart({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div dir="ltr" className={className}>
      <div dir="rtl" className="contents">
        {children}
      </div>
    </div>
  );
}

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
