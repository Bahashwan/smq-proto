// Literal copy and links shared by the public shell (header, menu, footer). Values are verbatim from the
// HeaderFooter / EN boards; `data/settings` can override the contact and licence fields through props.
import { WA_NUMBER } from "@/lib/format";

export const BRAND_AR = "إس إم كيو العقارية";
export const BRAND_EN = "SMQ Real Estate";
export const BRAND_SHORT = "SMQ العقارية";

export const PHONE_DISPLAY = "0556607779";
export const PHONE_TEL = "+966556607779";
export const PHONE_EN = "+966 55 660 7779";
export const WA_DISPLAY = "0559997929";
export const WA_URL = `https://wa.me/${WA_NUMBER}`;
export const EMAIL = "info@smqre.com";
export const ADDRESS_AR = "شارع السيدة خديجة، حي الفيصلية، جدة 23441";
export const HOURS_AR = "السبت إلى الخميس، 9 ص إلى 6 م";
export const TAGLINE_AR = "شريكك الموثوق في عالم العقارات. مكتب تسويق واستثمار عقاري في جدة.";
export const HANDLE = "@smq_re";
export const SITE = "smq-re.com";
export const COPYRIGHT_YEAR = 2026;

export const LICENCE = { rega: "1200040135", cr: "7029797433" };

export interface NavItem {
  label: string;
  href: string;
  /** when set, the item is active for every path under this prefix */
  match?: string;
}

/** Desktop header, Arabic (HeaderFooter / Header-Scrolled-D boards) */
export const NAV_AR: NavItem[] = [
  { label: "العقارات", href: "/units", match: "/units" },
  { label: "دليل الأسعار", href: "/guide", match: "/guide" },
  { label: "المشاريع", href: "/projects", match: "/projects" },
  { label: "الخدمات", href: "/services", match: "/services" },
  { label: "تعاون معنا", href: "/collaborate", match: "/collaborate" },
  { label: "من نحن", href: "/about", match: "/about" },
  { label: "تواصل معنا", href: "/contact", match: "/contact" },
];

/** Mobile menu and the full footer, Arabic: the project link replaces «المشاريع» as the boards draw it */
export const MENU_AR: NavItem[] = [
  { label: "العقارات", href: "/units", match: "/units" },
  { label: "دليل الأسعار", href: "/guide", match: "/guide" },
  { label: "جاردن الروضة", href: "/projects/garden-rawdah", match: "/projects/garden-rawdah" },
  { label: "الخدمات", href: "/services", match: "/services" },
  { label: "تعاون معنا", href: "/collaborate", match: "/collaborate" },
  { label: "من نحن", href: "/about", match: "/about" },
  { label: "تواصل معنا", href: "/contact", match: "/contact" },
];

/** Compact footer links (Results / Unit boards) */
export const FOOTER_COMPACT_AR: NavItem[] = [
  { label: "دليل الأسعار", href: "/guide" },
  { label: "الخدمات", href: "/services" },
  { label: "تعاون معنا", href: "/collaborate" },
  { label: "من نحن", href: "/about" },
  { label: "تواصل معنا", href: "/contact" },
];

/** English pages exist only for home, results and the unit; the rest fall back to the Arabic pages (EN-Home-M footer) */
export const NAV_EN: NavItem[] = [
  { label: "Properties", href: "/en/units", match: "/en/units" },
  { label: "Price guide", href: "/guide", match: "/guide" },
  { label: "Services", href: "/services", match: "/services" },
  { label: "About", href: "/about", match: "/about" },
  { label: "Contact", href: "/contact", match: "/contact" },
  { label: "Privacy", href: "/privacy", match: "/privacy" },
];

export const SOCIAL = [
  { id: "instagram", href: "https://instagram.com/smq_re", label: "إنستغرام", labelEn: "Instagram" },
  { id: "tiktok", href: "https://tiktok.com/@smq_re", label: "تيك توك", labelEn: "TikTok" },
  { id: "x", href: "https://x.com/smq_re", label: "إكس", labelEn: "X" },
  { id: "snapchat", href: "https://snapchat.com/add/smq_re", label: "سناب شات", labelEn: "Snapchat" },
  { id: "youtube", href: "https://youtube.com/@smq_re", label: "يوتيوب", labelEn: "YouTube" },
] as const;

export type SocialId = (typeof SOCIAL)[number]["id"];

/** Feature flags of a unit → the chip copy used on the cards and unit pages */
export const FEATURE_LABELS: { key: "maid" | "driver" | "balcony" | "smartHome" | "roofTerrace" | "privateLift" | "pool" | "privateEntrance" | "majlis"; label: string }[] = [
  { key: "maid", label: "غرفة خادمة" },
  { key: "driver", label: "غرفة سائق" },
  { key: "balcony", label: "بلكونة" },
  { key: "smartHome", label: "سمارت هوم" },
  { key: "roofTerrace", label: "تراس خاص" },
  { key: "privateLift", label: "مصعد خاص" },
  { key: "pool", label: "مسبح" },
  { key: "privateEntrance", label: "مدخل مستقل" },
  { key: "majlis", label: "مجلس خارجي" },
];

export function isExternalHref(href: string): boolean {
  return /^(https?:|tel:|mailto:|sms:|#)/.test(href);
}
