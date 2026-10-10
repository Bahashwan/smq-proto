// Layout helpers: the 1280px container, the centred phone column for 390-only boards, the WhatsApp link.
import type { ElementType, ReactNode } from "react";
import { cx, waLink } from "@/lib/format";
import { WhatsAppIcon } from "./icons";

export function Container({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: ElementType }) {
  return <Tag className={cx("container-smq", className)}>{children}</Tag>;
}

/** 390-only boards (member, marketer page, phone-only states) render in a centred phone-width column on desktop */
export function PhoneColumn({ children, className, framed }: { children: ReactNode; className?: string; framed?: boolean }) {
  return <div className={cx("w-full max-w-[390px] mx-auto min-h-dvh bg-paper", framed && "md:border-x md:border-line", className)}>{children}</div>;
}

export interface WhatsAppLinkProps {
  /** prefilled message (project, model code, visitor code are the caller's) */
  text?: string;
  children: ReactNode;
  icon?: boolean;
  className?: string;
  "aria-label"?: string;
}

/** A plain WhatsApp anchor through waLink(); for buttons use <Button variant="whatsapp" href={waLink(text)} /> */
export function WhatsAppLink({ text, children, icon, className, ...aria }: WhatsAppLinkProps) {
  return (
    <a href={waLink(text)} target="_blank" rel="noopener noreferrer" className={cx("inline-flex items-center gap-1.5 font-bold text-gold-text hover:text-ink hover:underline motion-hover transition-colors", className)} {...aria}>
      {icon && <WhatsAppIcon size={16} />}
      {children}
    </a>
  );
}
