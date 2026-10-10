"use client";
// Bell + notifications dropdown (Admin-Pieces-D · 1): drops from the bell, 380 wide, last 7 days. Unread items
// carry a gold marker, read ones a hairline ring. Managers are notified of everything, editors of content and
// inbound requests only. Items come from the page (fixture data); nothing is fetched.
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/format";
import { IconBell } from "./icons";
import { Badge } from "./Counter";

export interface Notification {
  id: string;
  /** Bold lead-in, e.g. «عقار مالك جديد». */
  title?: string;
  text: ReactNode;
  /** «قبل 25 دقيقة», «أمس 17:40». */
  when: string;
  href?: string;
  linkLabel?: string;
  read?: boolean;
}

export interface NotificationsBellProps {
  items: Notification[];
  /** Called from «علّم الكل كمقروء»; the bell also keeps its own read set. */
  onMarkAllRead?: () => void;
  /** «كل الإشعارات» target, default /admin. */
  allHref?: string;
  /** 44px tap target (phone header). */
  large?: boolean;
  /** Ink-2 square behind the bell (Admin-Pieces-D header). */
  boxed?: boolean;
  className?: string;
}

export function NotificationsBell({ items, onMarkAllRead, allHref = "/admin", large, boxed, className }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const list = items.map((n) => (readIds.includes(n.id) ? { ...n, read: true } : n));
  const unread = list.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markAll = () => {
    setReadIds(items.map((n) => n.id));
    onMarkAllRead?.();
  };

  return (
    <div ref={root} className={cx("relative", className)}>
      <button
        type="button"
        aria-label={`الإشعارات، ${unread} جديدة`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
        className={cx("relative flex cursor-pointer items-center justify-center text-paper", large ? "size-11" : "size-10", boxed ? "bg-ink-2" : "bg-transparent")}
      >
        <IconBell />
        <Badge value={unread} className="absolute left-1.5 top-1.5" />
      </button>
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="الإشعارات"
          className="fixed inset-x-3 top-14 z-40 flex flex-col border-interactive bg-paper md:absolute md:inset-x-auto md:end-0 md:top-full md:mt-2.5 md:w-[380px]"
        >
          <span aria-hidden className="absolute -top-2.5 end-3.5 hidden h-2.5 w-[18px] bg-ink [clip-path:polygon(50%_0,100%_100%,0_100%)] md:block" />
          <div className="flex items-center justify-between border-b-[1.5px] border-ink px-3.5 py-3 text-label font-extrabold">
            الإشعارات
            <button type="button" onClick={markAll} className="cursor-pointer bg-transparent text-[12px] font-bold text-gold-text hover:text-ink">
              علّم الكل كمقروء
            </button>
          </div>
          <ul className="m-0 max-h-[60dvh] list-none overflow-y-auto p-0">
            {list.map((n) => (
              <li key={n.id} className="flex gap-3 border-b border-line px-3.5 py-3 text-label font-normal leading-normal last:border-b-0">
                {n.read ? (
                  <span aria-hidden className="hex-point mt-1.5 flex size-2.5 shrink-0 items-center justify-center bg-line">
                    <span className="hex-point block size-[5px] bg-paper" />
                  </span>
                ) : (
                  <span aria-hidden className="hex-point mt-1.5 size-2.5 shrink-0 bg-gold" />
                )}
                <span className="min-w-0">
                  {n.title && <strong className="font-extrabold">{n.title} </strong>}
                  {n.text}
                  <span className="block text-caption font-normal text-muted">
                    {n.when}
                    {n.href && n.linkLabel && (
                      <>
                        {" · "}
                        <Link href={n.href} className="font-bold text-gold-text hover:text-ink" onClick={() => setOpen(false)}>
                          {n.linkLabel}
                        </Link>
                      </>
                    )}
                  </span>
                </span>
              </li>
            ))}
            {list.length === 0 && <li className="px-3.5 py-3 text-label text-muted">لا إشعارات</li>}
          </ul>
          <Link href={allHref} onClick={() => setOpen(false)} className="flex justify-center border-t-[1.5px] border-ink bg-sand p-2.5 text-[12px] font-extrabold no-underline hover:bg-slot">
            كل الإشعارات
          </Link>
        </div>
      )}
    </div>
  );
}

/** The dropdown's list alone, for pages that show notifications inline («كل الإشعارات»). */
export function NotificationsList({ items, className }: { items: Notification[]; className?: string }) {
  return (
    <ul className={cx("m-0 list-none border-interactive bg-paper p-0", className)}>
      {items.map((n) => (
        <li key={n.id} className="flex gap-3 border-b border-line px-3.5 py-3 text-label font-normal leading-normal last:border-b-0">
          {n.read ? (
            <span aria-hidden className="hex-point mt-1.5 flex size-2.5 shrink-0 items-center justify-center bg-line">
              <span className="hex-point block size-[5px] bg-paper" />
            </span>
          ) : (
            <span aria-hidden className="hex-point mt-1.5 size-2.5 shrink-0 bg-gold" />
          )}
          <span className="min-w-0">
            {n.title && <strong className="font-extrabold">{n.title} </strong>}
            {n.text}
            <span className="block text-caption text-muted">
              {n.when}
              {n.href && n.linkLabel && (
                <>
                  {" · "}
                  <Link href={n.href} className="font-bold text-gold-text hover:text-ink">
                    {n.linkLabel}
                  </Link>
                </>
              )}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
