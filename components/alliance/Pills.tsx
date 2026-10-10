import type { ReactNode } from "react";
import { cx } from "@/lib/format";
import { HexDot } from "./HexCell";
import { SOURCE_WORD, SOURCE_WORD_SHORT, type RequestSource } from "./lib";
import type { ReferralStage } from "@/data/types";
import { REFERRAL_STAGE_WORD } from "./lib";

/** The request's source, always a small tag: visitor = sand with a gold dot, staff = ink with a gold dot, member = outlined with an ink dot. */
export function SourceTag({ source, office, short, className }: { source: RequestSource; office?: string; short?: boolean; className?: string }) {
  const word = short ? SOURCE_WORD_SHORT[source] : SOURCE_WORD[source];
  const look = source === "visitor" ? "bg-sand text-ink" : source === "staff" ? "bg-ink text-paper" : "border-interactive text-ink";
  return (
    <span className={cx("inline-flex items-center gap-1 self-start whitespace-nowrap px-1.5 py-px text-[10px] font-extrabold leading-normal", look, className)}>
      <HexDot size={7} tone={source === "member" ? "ink" : "gold"} />
      {word}
      {source === "member" && office && !short ? ` · ${office}` : null}
    </span>
  );
}

export type PillTone = "gold" | "ink" | "outline" | "gold-outline" | "sand" | "line";

/** Small status word in a shape: gold block, ink block, ink outline, gold outline, sand, line. */
export function AlliancePill({ tone, children, className }: { tone: PillTone; children: ReactNode; className?: string }) {
  const look: Record<PillTone, string> = {
    gold: "bg-gold text-ink",
    ink: "bg-ink text-paper",
    outline: "border-interactive text-ink",
    "gold-outline": "text-gold-text",
    sand: "bg-sand text-ink",
    line: "border-hairline text-muted",
  };
  return (
    <span className={cx("inline-flex items-center whitespace-nowrap px-[7px] py-0.5 text-[10px] font-extrabold leading-normal", look[tone], className)} style={tone === "gold-outline" ? { border: "1.5px solid var(--smq-gold)" } : undefined}>
      {children}
    </span>
  );
}

/** Referral stage as a pill (Member-Ledger-M): معاينة gold · تفاوض ink · إفراغ outlined · تعارف sand · لم تتم line. */
export function StagePill({ stage, className }: { stage: ReferralStage; className?: string }) {
  const tone: Record<ReferralStage, PillTone> = { intro: "sand", viewing: "gold", negotiation: "ink", transfer: "outline", failed: "line" };
  return (
    <AlliancePill tone={tone[stage]} className={className}>
      {REFERRAL_STAGE_WORD[stage]}
    </AlliancePill>
  );
}
