// Copy and links shared by the public shell (header, menu, footer). Contact details and the licences come from
// data/settings (the site settings fixture); the nav labels are verbatim from the HeaderFooter / EN boards.
import { settings } from "@/data/settings";

export const BRAND_AR = "إس إم كيو العقارية";
export const BRAND_EN = "SMQ Real Estate";
export const BRAND_SHORT = "SMQ العقارية";

/** "0556607779" */
export const PHONE_DISPLAY = settings.phone;
/** "+966556607779" */
export const PHONE_TEL = `+966${settings.phone.replace(/^0/, "")}`;
export const PHONE_EN = `+966 ${settings.phone.slice(1, 3)} ${settings.phone.slice(3, 6)} ${settings.phone.slice(6)}`;
/** "0559997929" */
export const WA_DISPLAY = `0${settings.whatsapp.number.slice(3)}`;
export const WA_URL = `https://wa.me/${settings.whatsapp.number}`;
export const EMAIL = settings.email;
export const ADDRESS_AR = settings.office.addressAr;
/** «السبت إلى الخميس، 9 ص إلى 6 م» */
export const HOURS_AR = `${settings.hours.days}، ${settings.hours.from} إلى ${settings.hours.to}`;
export const TAGLINE_AR = "شريكك الموثوق في عالم العقارات. مكتب تسويق واستثمار عقاري في جدة.";
export const HANDLE = "@smq_re";
export const SITE = "smq-re.com";
export const COPYRIGHT_YEAR = 2026;

export const LICENCE = settings.licence;

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
/** Compact footer links as the unit and privacy boards list them (Privacy-M) */
export const FOOTER_COMPACT_AR: NavItem[] = [
  { label: "العقارات", href: "/units" },
  { label: "دليل الأسعار", href: "/guide" },
  { label: "الخدمات", href: "/services" },
  { label: "من نحن", href: "/about" },
  { label: "تواصل معنا", href: "/contact" },
  { label: "الخصوصية", href: "/privacy" },
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
