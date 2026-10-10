// Line icons copied from the board SVGs (24-unit grid, currentColor). Decorative by default (aria-hidden);
// pass `title` when an icon stands alone.
import type { SVGProps } from "react";
import { cx } from "@/lib/format";
import type { SocialId } from "./constants";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number; title?: string };

function base({ size = 18, title, className, ...rest }: IconProps, strokeWidth: number, extra?: Partial<SVGProps<SVGSVGElement>>) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": title ? undefined : true,
    role: title ? "img" : undefined,
    className: cx("shrink-0", className),
    ...extra,
    ...rest,
  };
}

/** WhatsApp glyph (header, buttons, cards) */
export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base(props, 2.2)}>
      {props.title && <title>{props.title}</title>}
      <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 7.9 19.4z" />
      <path d="M9.2 9.1c.2 2.4 2.8 5 5.4 5.6l1.6-1.4-2-1-1 .7c-.9-.4-1.8-1.3-2.2-2.2l.7-1-1-2z" />
    </svg>
  );
}

/** Forward arrow: points to the line end (left in RTL, right in LTR). Gold on ink buttons via `className="text-gold"`. */
export function ArrowIcon(props: IconProps) {
  return (
    <svg {...base({ ...props, className: cx("ltr:-scale-x-100", props.className) }, 2.6)}>
      {props.title && <title>{props.title}</title>}
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

/** Back arrow: the opposite direction of ArrowIcon */
export function BackArrowIcon(props: IconProps) {
  return (
    <svg {...base({ ...props, className: cx("rtl:-scale-x-100", props.className) }, 2.6)}>
      {props.title && <title>{props.title}</title>}
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base({ size: 16, ...props }, 2.4)}>
      {props.title && <title>{props.title}</title>}
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base(props, 2.2)}>
      {props.title && <title>{props.title}</title>}
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base({ size: 22, ...props }, 2.4)}>
      {props.title && <title>{props.title}</title>}
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props, 2.2)}>
      {props.title && <title>{props.title}</title>}
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props, 2.6)}>
      {props.title && <title>{props.title}</title>}
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

/** Footer social glyphs, keyed by SOCIAL[].id */
export function SocialIcon({ id, ...props }: IconProps & { id: SocialId }) {
  switch (id) {
    case "instagram":
      return (
        <svg {...base(props, 2, { strokeLinecap: "butt", strokeLinejoin: "miter" })}>
          <rect x="3" y="3" width="18" height="18" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...base(props, 2, { strokeLinejoin: "miter" })}>
          <path d="M14 4v11a3.5 3.5 0 1 1-3.5-3.5M14 4c0 2.5 2 4.5 4.5 4.5" />
        </svg>
      );
    case "x":
      return (
        <svg {...base(props, 2, { strokeLinejoin: "miter" })}>
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      );
    case "snapchat":
      return (
        <svg {...base(props, 2)}>
          <path d="M7 10a5 5 0 0 1 10 0v3l2 1-2 1c0 2 2 3 3 3-1 1-3 1-4 2-1 1-2 1-4 1s-3 0-4-1c-1-1-3-1-4-2 1 0 3-1 3-3l-2-1 2-1z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...base(props, 2, { strokeLinecap: "butt" })}>
          <rect x="3" y="6" width="18" height="12" />
          <path d="M10 9.5v5l4-2.5z" />
        </svg>
      );
  }
}
