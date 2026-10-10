import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

/** Internal paths go through next/link (client navigation keeps the in-memory store); anything else is a plain anchor. */
export function A({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
