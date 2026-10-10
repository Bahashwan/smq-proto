// Admin icon set · paths copied from the admin boards (Admin-Overview-D, Admin-M, Components2, Admin-Pieces-D).
// Every icon is decorative (aria-hidden); the control that wraps it carries the label.
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, strokeWidth = 2, children, ...rest }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconSearch = (p: IconProps) => (
  <Svg size={16} strokeWidth={2.2} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </Svg>
);
export const IconBell = (p: IconProps) => (
  <Svg size={20} strokeWidth={2.2} {...p}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20h4" />
  </Svg>
);
export const IconMenu = (p: IconProps) => (
  <Svg size={22} strokeWidth={2.4} {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </Svg>
);
export const IconOverview = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="8" height="8" />
    <rect x="13" y="3" width="8" height="5" />
    <rect x="13" y="10" width="8" height="11" />
    <rect x="3" y="13" width="8" height="8" />
  </Svg>
);
export const IconApprovals = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 11l3 3 8-8M20 12v7H4V5h11" />
  </Svg>
);
export const IconUnits = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21V9l9-6 9 6v12zM9 21v-8h6v8" />
  </Svg>
);
export const IconProjects = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 21V7h7v14M11 21V3h9v18M7 11h1M7 15h1M15 7h1M15 11h1M15 15h1" />
  </Svg>
);
export const IconLeads = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 7.9 19.4z" />
  </Svg>
);
export const IconWhatsApp = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 7.9 19.4z" />
    <path d="M9.2 9.1c.2 2.4 2.8 5 5.4 5.6l1.6-1.4-2-1-1 .7c-.9-.4-1.8-1.3-2.2-2.2l.7-1-1-2z" />
  </Svg>
);
export const IconAnalytics = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
  </Svg>
);
export const IconVisitors = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </Svg>
);
export const IconContent = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h16M4 18h10" />
  </Svg>
);
export const IconSettings = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
  </Svg>
);
export const IconUpload = (p: IconProps) => (
  <Svg size={20} strokeWidth={2.2} {...p}>
    <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />
  </Svg>
);
/** Check mark used inside the gold hexagons (toast success, save bar «نُشر الآن»). */
export const IconCheck = ({ size = 10, ...p }: IconProps) => (
  <Svg size={size} strokeWidth={4} {...p}>
    <path d="M4 12l5 5L20 7" />
  </Svg>
);
/** Six-dot drag grip from the Components2 sheet (14×18). */
export const IconGrip = (p: SVGProps<SVGSVGElement>) => (
  <svg aria-hidden="true" width="14" height="18" viewBox="0 0 14 18" fill="currentColor" className="shrink-0" {...p}>
    <circle cx="4" cy="3" r="1.6" />
    <circle cx="10" cy="3" r="1.6" />
    <circle cx="4" cy="9" r="1.6" />
    <circle cx="10" cy="9" r="1.6" />
    <circle cx="4" cy="15" r="1.6" />
    <circle cx="10" cy="15" r="1.6" />
  </svg>
);
export const IconEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);
