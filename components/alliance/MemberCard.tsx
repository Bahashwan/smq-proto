import type { ReactNode } from "react";
import type { Office } from "@/data/types";
import { cx } from "@/lib/format";
import { A } from "./A";
import { FalBadge } from "./FalBadge";
import { HexDot } from "./HexCell";

/**
 * Directory card (Alliance-D/M): the office letter in an ink hexagon, «مكتب أ», «district · specialties», and the
 * «رخصة فال موثّقة» badge. Only verified members ever reach the directory, and only by their own choice.
 */
export interface MemberCardProps {
  office: Pick<Office, "letter" | "nameAr" | "specialties">;
  /** the first covered district in Arabic */
  district: string;
  /** overrides «district · specialties» */
  line?: string;
  href?: string;
  /** show the badge (phone directory) */
  badge?: boolean;
  /** «مؤسِّس» etc. */
  tag?: ReactNode;
  className?: string;
}

export function MemberCard({ office, district, line, href, badge, tag, className }: MemberCardProps) {
  const text = line ?? `${district} · ${office.specialties.join("، ")}`;
  const body = (
    <>
      <span className="flex size-8.5 shrink-0 items-center justify-center hex-flat bg-ink text-[13px] font-extrabold text-gold md:size-[38px] md:text-[14px]">{office.letter}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <b className="flex items-center gap-2 text-[13px] font-extrabold md:text-[14px]">
          {office.nameAr}
          {tag}
        </b>
        <span className="text-[11px] text-muted md:text-[12px]">{text}</span>
      </span>
      {badge && <FalBadge className="shrink-0" />}
    </>
  );
  // phone rows as Alliance-M draws them (about 68px); the desktop directory keeps the roomier card
  const cls = cx("flex items-center gap-2.5 bg-paper px-3 py-2.5 border-hairline text-ink no-underline md:gap-3 md:px-3.5 md:py-3", className);
  if (href) {
    return (
      <A href={href} className={cls}>
        {body}
      </A>
    );
  }
  return <div className={cls}>{body}</div>;
}

/** Launch-day directory: «الدليل يبدأ بأول مكتب موثّق». */
export function DirectoryEmpty({ title = "الدليل يبدأ بأول مكتب موثّق", text, className }: { title?: string; text?: ReactNode; className?: string }) {
  return (
    <div className={cx("flex flex-col items-center gap-2 bg-paper px-5 py-6 text-center", className)} style={{ border: "1.5px dashed var(--smq-ink)" }}>
      <HexDot size={40} tone="paper" border="ink" />
      <span className="text-[15px] font-extrabold">{title}</span>
      {text && <span className="text-[12px] text-muted">{text}</span>}
    </div>
  );
}
