// Public footer (HeaderFooter board, Home-M, Results / Unit compact footers, EN boards). The licence line and the
// commercial register appear on every page. Contact and licence fields default to the board literals; pass
// `settings` (data/settings) to override them.
import Link from "next/link";
import { cx } from "@/lib/format";
import { Lockup } from "./Brand";
import { IconButton } from "./Button";
import { ADDRESS_AR, BRAND_AR, BRAND_EN, COPYRIGHT_YEAR, EMAIL, FOOTER_COMPACT_AR, HANDLE, HOURS_AR, LICENCE, MENU_AR, NAV_EN, PHONE_DISPLAY, SITE, SOCIAL, TAGLINE_AR, WA_DISPLAY, type NavItem } from "./constants";
import { SocialIcon } from "./icons";
import { LicenceLine } from "./LicenceLine";
import { FooterLinks, PrivacyLink } from "./FooterLinks";

export interface FooterSettings {
  phone?: string;
  whatsapp?: string;
  email?: string;
  addressAr?: string;
  hoursAr?: string;
  licence?: { rega: string; cr: string };
}

export interface FooterProps {
  variant?: "ar" | "en";
  /** the short footer of the results and unit pages */
  compact?: boolean;
  settings?: FooterSettings;
  links?: NavItem[];
  /** compact desktop line: « · الخصوصية» after the copyright (the results boards end at «© 2026 إس إم كيو العقارية») */
  privacy?: boolean;
  className?: string;
}

export function Footer({ variant = "ar", compact, settings, links, privacy = true, className }: FooterProps) {
  const en = variant === "en";
  const licence = settings?.licence ?? LICENCE;
  const phone = settings?.phone ?? PHONE_DISPLAY;
  const wa = settings?.whatsapp ?? WA_DISPLAY;
  const email = settings?.email ?? EMAIL;
  const address = settings?.addressAr ?? ADDRESS_AR;
  const hours = settings?.hoursAr ?? HOURS_AR;

  if (en) {
    const items = links ?? NAV_EN;
    return (
      <footer className={cx("bg-ink text-on-ink-muted text-caption", className)}>
        <div className="container-smq flex flex-col gap-4 py-7">
          <Link href="/en" className="self-start no-underline" aria-label={BRAND_EN}>
            <Lockup tone="white" height={32} lang="en" decorative />
          </Link>
          <nav aria-label="Pages" className="flex flex-wrap gap-x-4 gap-y-2 text-label font-normal">
            {items.map((l) => (
              <Link key={l.href} href={l.href} className="text-paper no-underline hover:underline">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="m-0 pt-3 border-t border-ink-2 leading-relaxed">
            <LicenceLine variant="en" licence={licence} />
            <br />
            {`© ${COPYRIGHT_YEAR} ${BRAND_EN}`}
            {!compact && " · English pages fall back to Arabic where a translation is missing"}
          </p>
        </div>
      </footer>
    );
  }

  if (compact) {
    const items = links ?? FOOTER_COMPACT_AR;
    return (
      <footer className={cx("bg-ink text-on-ink-muted text-caption font-normal md:pt-7 md:pb-6", className)}>
        {/* desktop: 28px of footer, the ink-2 rule, then the line 20px below it (Results-D, Contact-D) */}
        <div className="container-smq flex flex-col gap-4 py-7 md:flex-row md:items-center md:justify-between md:gap-4 md:border-t md:border-ink-2 md:pt-5 md:pb-0">
          <Link href="/" className="self-start no-underline" aria-label={BRAND_AR}>
            <Lockup tone="white" height={32} decorative className="md:h-7.5" />
          </Link>
          <FooterLinks items={items} className="flex flex-wrap gap-x-4 gap-y-2 text-label font-normal md:hidden" />
          <p className="m-0 pt-3 border-t border-ink-2 leading-relaxed md:border-0 md:pt-0">
            <LicenceLine variant="ar" licence={licence} />
            <span className="hidden md:inline"> · </span>
            <br className="md:hidden" />
            {`© ${COPYRIGHT_YEAR} ${BRAND_AR}`}
            {privacy && (
              <span className="hidden md:inline">
                {" · "}
                <PrivacyLink />
              </span>
            )}
          </p>
        </div>
      </footer>
    );
  }

  const items = links ?? MENU_AR;
  return (
    <footer className={cx("bg-ink text-paper", className)}>
      <div className="container-smq flex flex-col gap-6 py-8 md:gap-9 md:pt-12 md:pb-6">
        <div className="flex flex-col gap-6 md:grid md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8">
          <div className="flex flex-col gap-3.5">
            <Link href="/" className="self-start no-underline" aria-label={BRAND_AR}>
              <Lockup tone="white" height={40} decorative className="md:h-11" />
            </Link>
            <p className="m-0 max-w-80 text-label font-normal leading-relaxed text-on-ink-muted">{TAGLINE_AR}</p>
            <div className="hidden md:flex items-center gap-2">
              {SOCIAL.map((s) => (
                <IconButton key={s.id} label={s.label} href={s.href} tone="ghost-ink" size={40}>
                  <SocialIcon id={s.id} />
                </IconButton>
              ))}
              <span className="text-caption text-on-ink-muted" dir="ltr">
                {HANDLE}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 md:contents">
            <nav aria-label="الصفحات" className="flex flex-col gap-2.5 text-label font-normal md:gap-3">
              <span className="hidden md:block text-caption font-bold text-on-ink-muted">الصفحات</span>
              {items.map((l) => (
                <Link key={l.href} href={l.href} className="text-paper no-underline hover:underline">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2.5 text-label font-normal text-on-ink-muted md:gap-3">
              <span className="hidden md:block text-caption font-bold">تواصل</span>
              <span className="text-paper tnum" dir="ltr">
                {wa} <span className="md:inline hidden">(واتساب)</span>
              </span>
              <span className="text-paper tnum" dir="ltr">
                {phone}
              </span>
              <span className="text-paper" dir="ltr">
                {email}
              </span>
              <span className="leading-relaxed">{address}</span>
              <span>{hours}</span>
            </div>
          </div>
          <div className="hidden md:flex flex-col gap-3 text-label font-normal text-on-ink-muted">
            <span className="text-caption font-bold">مرخصون ومنظمون</span>
            <span className="flex flex-col gap-0.5">
              <span className="text-caption">ترخيص الهيئة العامة للعقار</span>
              <span className="text-paper font-bold tnum" dir="ltr">
                {licence.rega}
              </span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-caption">السجل التجاري</span>
              <span className="text-paper font-bold tnum" dir="ltr">
                {licence.cr}
              </span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          {SOCIAL.map((s) => (
            <IconButton key={s.id} label={s.label} href={s.href} tone="ghost-ink" size={40}>
              <SocialIcon id={s.id} />
            </IconButton>
          ))}
          <span className="ms-1.5 text-caption text-on-ink-muted" dir="ltr">
            {HANDLE}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 pt-4 border-t border-ink-2 text-caption text-on-ink-muted md:flex-row md:justify-between md:gap-4 md:pt-5">
          <span className="md:hidden">
            <LicenceLine variant="ar" licence={licence} />
          </span>
          <span>{`© ${COPYRIGHT_YEAR} ${BRAND_AR}. جميع الحقوق محفوظة.`}</span>
          <span className="hidden md:inline" dir="ltr">
            {SITE}
          </span>
        </div>
      </div>
    </footer>
  );
}
