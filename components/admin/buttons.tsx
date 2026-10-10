// Admin buttons · local equivalents of the Components sheet buttons (components/ui did not exist when this
// library was written; swap for the ui exports once they land). Cuts only on the primary (gold / ink) actions.
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/format";

export type AdminButtonVariant = "gold" | "ink" | "outline" | "ghost" | "onInkOutline" | "onInkWhite";
export type AdminButtonSize = "xs" | "sm" | "md" | "lg";

const SIZE: Record<AdminButtonSize, string> = {
  xs: "h-8 px-3 text-[12px]",
  sm: "h-[38px] px-3.5 text-[12px]",
  md: "h-10 px-4 text-label",
  lg: "h-11 px-5 text-[15px]",
};

const VARIANT: Record<AdminButtonVariant, string> = {
  gold: "bg-gold text-ink font-extrabold cut-s hover:bg-gold-hover disabled:bg-sand disabled:text-disabled",
  ink: "bg-ink text-paper font-extrabold cut-s hover:bg-ink-2 disabled:bg-sand disabled:text-disabled",
  outline: "bg-paper text-ink font-bold border-interactive hover:bg-sand disabled:border-line disabled:text-disabled",
  ghost: "bg-transparent text-ink font-bold hover:bg-sand disabled:text-disabled",
  onInkOutline: "bg-transparent text-paper font-bold border-[1.5px] border-on-ink-muted hover:border-paper",
  onInkWhite: "bg-paper text-ink font-extrabold border-[1.5px] border-paper hover:bg-sand",
};

export interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  children: ReactNode;
}

export function AdminButton({ variant = "outline", size = "md", className, type = "button", children, ...rest }: AdminButtonProps) {
  return (
    <button
      type={type}
      className={cx("inline-flex items-center justify-center gap-2 whitespace-nowrap motion-hover transition-colors disabled:cursor-default", SIZE[size], VARIANT[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export interface AdminLinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
  children: ReactNode;
}

/** Same look as AdminButton, rendered as a link (internal routes via next/link, external as <a>). */
export function AdminLinkButton({ href, variant = "outline", size = "md", className, children, ...rest }: AdminLinkButtonProps) {
  const cls = cx("inline-flex items-center justify-center gap-2 whitespace-nowrap no-underline motion-hover transition-colors", SIZE[size], VARIANT[variant], className);
  if (/^(https?:|tel:|mailto:|#)/.test(href)) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

/** Text link in the admin: gold text, ink + underline on hover. */
export function TextLink({ href, className, children, ...rest }: AdminLinkButtonProps) {
  const cls = cx("text-gold-text font-bold no-underline hover:text-ink hover:underline motion-hover", className);
  if (/^(https?:|tel:|mailto:|#)/.test(href)) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
