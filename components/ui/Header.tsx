"use client";
// Public header (HeaderFooter, Header-Scrolled-D, B-Hero boards): 72px ink bar with the gold-mark + white lockup,
// the nav, EN, the phone number and the only coloured button (WhatsApp). After 120px of scroll: 56px, mark + name,
// phone becomes an icon, a 2px gold rule, no shadow. On the phone the bar hides on scroll down and returns on scroll
// up; the menu button (and ?menu=1) opens the ink sheet from the top.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/format";
import { setQuery, useClientPath, useQuery } from "@/lib/location";
import { Lockup, LogoMark } from "./Brand";
import { Button, IconButton } from "./Button";
import { BRAND_SHORT, MENU_AR, NAV_AR, NAV_EN, PHONE_DISPLAY, PHONE_TEL, WA_URL, type NavItem } from "./constants";
import { MenuIcon, PhoneIcon, WhatsAppIcon } from "./icons";
import { useFocusTrap, usePresence, useScrollLock } from "./hooks";

export interface HeaderProps {
  variant?: "ar" | "en";
  /** show the language switch (only on /, /units, /units/[code] and their /en twins) */
  showEn?: boolean;
  /** overlay the hero: transparent until scrolled */
  transparent?: boolean;
  /** target of the language switch; computed from the path when omitted */
  switchHref?: string;
  /** force the active nav item (href prefix) */
  active?: string;
  /** QA only: render in place without the scroll listener, in the default or the scrolled state */
  demo?: "default" | "scrolled";
  /** QA only: let a demo header own the ?menu=1 sheet */
  withMenu?: boolean;
  className?: string;
}

const SCROLL_AT = 120;

function isActive(item: NavItem, path: string, forced?: string): boolean {
  const m = forced ?? item.match;
  if (!m) return false;
  if (forced !== undefined) return item.href === forced || item.match === forced;
  return path === m || path.startsWith(`${m}/`);
}

export function Header({ variant = "ar", showEn, transparent, switchHref, active, demo, withMenu, className }: HeaderProps) {
  const en = variant === "en";
  const path = useClientPath();
  const q = useQuery();
  const ownsMenu = !demo || !!withMenu;
  const menuOpen = q.get("menu") === "1" && ownsMenu;
  const [scrolledLive, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const scrolled = demo ? demo === "scrolled" : scrolledLive;

  useEffect(() => {
    if (demo) return;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > SCROLL_AT);
      const phone = window.matchMedia("(max-width: 1023px)").matches;
      if (phone) setHidden(y > SCROLL_AT && y > lastY.current);
      else setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [demo]);

  const nav = en ? NAV_EN : NAV_AR;
  const switchTo = switchHref ?? (en ? (path.startsWith("/en") ? path.slice(3) || "/" : "/") : path === "/" || path === "" ? "/en" : `/en${path}`);
  const openMenu = () => setQuery({ menu: "1" }, "push");
  const closeMenu = () => setQuery({ menu: null }, "replace");

  return (
    <>
      <header
        className={cx(
          "z-40 inset-x-0 top-0 text-paper motion-reduce:transition-none transition-[height,transform,background-color] duration-[160ms] ease-smq",
          demo ? cx("relative bg-ink", scrolled && "border-b-2 border-gold") : transparent ? (scrolled ? "fixed bg-ink border-b-2 border-gold" : "absolute bg-transparent") : cx("sticky bg-ink", scrolled && "border-b-2 border-gold"),
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
          className,
        )}
        data-scrolled={scrolled || undefined}
      >
        <div className={cx("container-smq flex items-center justify-between gap-4 lg:gap-6 motion-reduce:transition-none transition-[height] duration-[160ms]", scrolled ? "h-14" : "h-16 lg:h-18")}>
          <Link href={en ? "/en" : "/"} aria-label={en ? "SMQ Real Estate, home" : "SMQ العقارية، الصفحة الرئيسية"} className="flex items-center gap-2.5 no-underline text-paper shrink-0">
            {scrolled ? (
              <>
                <LogoMark size={28} lang={variant} />
                <span className="text-label font-extrabold tracking-wide">{en ? "SMQ Real Estate" : BRAND_SHORT}</span>
              </>
            ) : (
              <Lockup tone="goldmark-white" height={26} lang={variant} decorative className="lg:h-9" />
            )}
          </Link>

          <nav aria-label={en ? "Main" : "الرئيسية"} className="hidden lg:flex items-center gap-0.5">
            {nav.map((item) => {
              const on = isActive(item, path, active);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  className={cx(
                    "no-underline whitespace-nowrap motion-hover transition-colors hover:bg-ink-2",
                    scrolled ? "px-2.5 py-2.5 text-label" : "px-3 py-3 text-label",
                    on ? cx("text-gold font-bold", !scrolled && "border-b-[3px] border-gold") : "text-paper font-semibold",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 lg:gap-2 shrink-0">
            {showEn &&
              (en ? (
                <Link href={switchTo} lang="ar" aria-label="العربية" className="px-2 py-2.5 text-caption font-bold tracking-widest no-underline text-paper">
                  عربي
                </Link>
              ) : (
                <Link href={switchTo} lang="en" aria-label="English" className="px-2 py-2.5 text-caption font-bold tracking-widest no-underline text-paper">
                  EN
                </Link>
              ))}
            <span className="hidden lg:contents">
              {scrolled ? (
                <a href={`tel:${PHONE_TEL}`} aria-label={en ? `Call ${PHONE_DISPLAY}` : `اتصال ${PHONE_DISPLAY}`} className="inline-flex items-center justify-center size-10 border-[1.5px] border-muted text-paper no-underline hover:bg-ink-2 motion-hover transition-colors">
                  <PhoneIcon />
                </a>
              ) : (
                <a href={`tel:${PHONE_TEL}`} dir="ltr" className="inline-flex items-center px-1 py-3 text-label font-semibold no-underline text-paper tnum hover:underline">
                  {PHONE_DISPLAY}
                </a>
              )}
              <Button variant="whatsapp" size="s" href={WA_URL} className={scrolled ? "h-10 px-3.5" : "h-11 px-4.5"}>
                {en ? "WhatsApp" : "واتساب"}
              </Button>
            </span>
            <span className="contents lg:hidden">
              <IconButton label={en ? "Chat on WhatsApp" : "تواصل عبر واتساب"} href={WA_URL} tone="gold" size={44}>
                <WhatsAppIcon size={20} />
              </IconButton>
              <button type="button" aria-label={en ? "Menu" : "القائمة"} aria-expanded={menuOpen} aria-controls="smq-menu" onClick={openMenu} className="inline-flex items-center justify-center size-11 text-paper bg-transparent hover:bg-ink-2 motion-hover transition-colors">
                <MenuIcon />
              </button>
            </span>
          </div>
        </div>
      </header>
      {ownsMenu && <MobileMenu open={menuOpen} onClose={closeMenu} variant={variant} switchTo={switchTo} showEn={showEn} path={path} />}
    </>
  );
}

function MobileMenu({ open, onClose, variant, switchTo, showEn, path }: { open: boolean; onClose: () => void; variant: "ar" | "en"; switchTo: string; showEn?: boolean; path: string }) {
  const en = variant === "en";
  const [mounted, shown] = usePresence(open, 200);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);
  useScrollLock(open);
  useEffect(() => {
    if (!open) return;
    const close = () => onClose();
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [open, onClose]);
  if (!mounted) return null;
  const items = en ? NAV_EN : MENU_AR;
  return (
    <div id="smq-menu" className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <div ref={ref} role="dialog" aria-modal="true" aria-label={en ? "Menu" : "القائمة"} tabIndex={-1} className={cx("absolute inset-x-0 top-0 min-h-dvh flex flex-col bg-ink text-paper outline-none motion-sheet transition-transform", shown ? "translate-y-0" : "-translate-y-full")}>
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link href={en ? "/en" : "/"} onClick={onClose} className="no-underline" aria-label={en ? "SMQ Real Estate, home" : "SMQ العقارية، الصفحة الرئيسية"}>
            <Lockup tone="goldmark-white" height={26} lang={variant} decorative />
          </Link>
          <button type="button" onClick={onClose} aria-label={en ? "Close" : "إغلاق"} data-autofocus className="inline-flex items-center justify-center size-11 text-paper bg-transparent text-h2 leading-none hover:bg-ink-2 motion-hover transition-colors">
            ×
          </button>
        </div>
        <nav aria-label={en ? "Menu" : "القائمة"} className="flex flex-col px-4 pt-2 pb-4">
          {items.map((item, i) => {
            const on = item.match ? path === item.match || path.startsWith(`${item.match}/`) : false;
            return (
              <Link key={item.href} href={item.href} onClick={onClose} aria-current={on ? "page" : undefined} className={cx("py-3.5 text-h2 md:text-h2 font-extrabold no-underline", on ? "text-gold" : "text-paper", i < items.length - 1 && "border-b border-ink-2")}>
                {item.label}
              </Link>
            );
          })}
          <div className="flex gap-2 mt-3">
            <Button variant="primary" size="m" href={WA_URL} className="flex-1">
              {en ? "WhatsApp" : "واتساب"}
            </Button>
            <a href={`tel:${PHONE_TEL}`} className="inline-flex items-center justify-center h-13 px-4 border-[1.5px] border-paper text-paper text-label font-bold no-underline hover:bg-ink-2 motion-hover transition-colors">
              {en ? "Call" : "اتصال"}
            </a>
            {showEn && (
              <Link href={switchTo} onClick={onClose} lang={en ? "ar" : "en"} className="inline-flex items-center justify-center h-13 px-3.5 border-[1.5px] border-ink-2 text-paper text-label font-bold no-underline hover:bg-ink-2 motion-hover transition-colors">
                {en ? "عربي" : "EN"}
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
