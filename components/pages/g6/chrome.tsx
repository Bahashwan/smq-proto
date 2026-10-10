// Alliance and member chrome (page-local): the gold «مبادرة من SMQ» band, the alliance footers, the member header.
// Server-safe (no hooks). The public header itself is components/ui Header with «تعاون معنا» active.
import Link from "next/link";
import type { ReactNode } from "react";
import { COPYRIGHT_YEAR, LICENCE, Lockup } from "@/components/ui";
import { HexDot } from "@/components/alliance";
import { cx } from "@/lib/format";

/** The gold band above the header: «مبادرة من SMQ · …» at the start, a back link at the end. */
export function AllianceBand({ text, textD, link }: { text: ReactNode; textD?: ReactNode; link: { label: string; href: string } }) {
  return (
    <div className="bg-gold text-ink">
      <div className="container-smq flex min-h-[33px] items-center justify-between gap-1.5 py-1.5 text-[11px] font-extrabold md:min-h-8 md:gap-3 md:text-[12px]">
        <span className={cx(textD ? "md:hidden" : undefined)}>{text}</span>
        {textD && <span className="hidden md:inline">{textD}</span>}
        <Link href={link.href} className="shrink-0 whitespace-nowrap py-1 text-ink no-underline hover:underline">
          {link.label}
        </Link>
      </div>
    </div>
  );
}

const ALLIANCE_LINE = "تحالف مكاتب جدة العقارية مبادرة تديرها شركة إس إم كيو للاستثمار والتسويق العقاري. العضوية لا تعني شراكة تجارية ولا تمثيلاً قانونياً.";

/** Alliance-M / Alliance-D footer. */
export function AllianceFooter() {
  return (
    <footer className="bg-ink text-[12px] text-on-ink-muted">
      {/* phone */}
      <div className="flex flex-col gap-4 px-5 pt-8 pb-6 md:hidden">
        <Lockup tone="white" height={28} className="self-start" />
        <span className="leading-relaxed">{ALLIANCE_LINE}</span>
        <nav aria-label="روابط التحالف" className="flex flex-wrap gap-x-5 gap-y-1">
          {[
            { label: "تعاون معنا", href: "/collaborate" },
            { label: "انضم كمسوّق", href: "/marketers" },
            { label: "أضف عقارك", href: "/add" },
            { label: "الخصوصية", href: "/privacy" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="inline-flex min-h-11 items-center text-[13px] text-paper no-underline hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="border-t border-ink-2 pt-4 text-[11px] leading-relaxed">
          ترخيص الهيئة العامة للعقار {LICENCE.rega} · السجل التجاري {LICENCE.cr}
          <br />© {COPYRIGHT_YEAR} إس إم كيو العقارية
        </span>
      </div>
      {/* desktop */}
      <div className="hidden md:block">
        <div className="container-smq">
          <div className="flex items-center justify-between gap-10 border-t border-ink-2 py-7">
            <Lockup tone="white" height={32} />
            <span className="max-w-[760px] leading-relaxed">
              {ALLIANCE_LINE.replace(/\.$/, "")} · ترخيص فال {LICENCE.rega} · السجل التجاري {LICENCE.cr} · © {COPYRIGHT_YEAR}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** The short footer of the application pages (and the member report on desktop). */
export function ShortFooter({ line, lineD, className }: { line?: ReactNode; lineD?: ReactNode; className?: string }) {
  const base = `تحالف مكاتب جدة العقارية · مبادرة من إس إم كيو · ترخيص فال ${LICENCE.rega}`;
  return (
    <footer className={cx("bg-ink text-on-ink-muted", className)}>
      <div className="flex flex-col gap-3 px-5 pt-7 pb-6 text-[11px] leading-relaxed md:hidden">
        <Lockup tone="white" height={28} className="self-start" />
        <span>{line ?? base}</span>
      </div>
      <div className="hidden md:block">
        <div className="container-smq">
          <div className="flex items-center justify-between gap-10 border-t border-ink-2 py-7 text-[12px]">
            <Lockup tone="white" height={32} />
            <span>{lineD ?? `${base} · السجل التجاري ${LICENCE.cr}`}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Two small hexagons, gold then ink-2: the member pages' mark. */
export function MemberMark({ size = 16 }: { size?: number }) {
  return (
    <span className="flex shrink-0 items-center gap-0.5" aria-hidden>
      <HexDot size={size} tone="gold" />
      <HexDot size={size} tone="ink2" />
    </span>
  );
}

/** Member-* header: the mark, «تحالف مكاتب جدة» and a subtitle, an action at the end. */
export function MemberHeader({ title = "تحالف مكاتب جدة", subtitle, action, className }: { title?: string; subtitle: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <header className={cx("bg-ink text-paper", className)}>
      <div className="flex min-h-[60px] items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <MemberMark />
          <span className="flex min-w-0 flex-col">
            <span className="text-[12px] font-extrabold">{title}</span>
            <span className="text-caption text-on-ink-muted">{subtitle}</span>
          </span>
        </div>
        {action}
      </div>
    </header>
  );
}

/** Gold text link on the ink header («الميزان», «تقرير الشهر»). */
export function HeaderLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-11 shrink-0 items-center px-1 text-[12px] font-extrabold text-gold no-underline hover:underline">
      {children}
    </Link>
  );
}
