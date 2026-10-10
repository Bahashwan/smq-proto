"use client";
// Small client hooks shared by the overlay components (sheet, menu) and the cards.
import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { visitorCode } from "@/lib/format";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Traps Tab inside `ref` while `active`, closes on Escape, restores focus to the opener afterwards. */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onClose?: () => void) {
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;
    opener.current = document.activeElement as HTMLElement | null;
    const first = root.querySelector<HTMLElement>("[data-autofocus]") ?? root.querySelector<HTMLElement>(FOCUSABLE) ?? root;
    const t = window.setTimeout(() => first.focus({ preventScroll: true }), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!items.length) {
        e.preventDefault();
        root.focus();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === firstEl || document.activeElement === root)) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      opener.current?.focus?.({ preventScroll: true });
    };
  }, [ref, active, onClose]);
}

/** Locks body scroll while `active` (sheets and the mobile menu). */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

const noop = () => () => {};

/** true after hydration; lets a component render its server default first */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** The visitor reference code (SMQ-XXXXX) once the browser is available; the server placeholder before. */
export function useVisitorCode(): string {
  return useSyncExternalStore(
    noop,
    () => visitorCode(),
    () => "SMQ-XXXXX",
  );
}

type Phase = "closed" | "enter" | "open" | "leave";

/** Mounted-then-shown flags for enter/leave transitions. Returns [mounted, shown]. */
export function usePresence(open: boolean, leaveMs = 200): [boolean, boolean] {
  const [phase, setPhase] = useState<Phase>(open ? "open" : "closed");
  useEffect(() => {
    if (open) {
      let b = 0;
      const a = requestAnimationFrame(() => {
        setPhase((p) => (p === "open" ? p : "enter"));
        b = requestAnimationFrame(() => setPhase("open"));
      });
      return () => {
        cancelAnimationFrame(a);
        cancelAnimationFrame(b);
      };
    }
    const a = requestAnimationFrame(() => setPhase((p) => (p === "closed" ? p : "leave")));
    const t = window.setTimeout(() => setPhase("closed"), leaveMs + 16);
    return () => {
      cancelAnimationFrame(a);
      window.clearTimeout(t);
    };
  }, [open, leaveMs]);
  return [phase !== "closed", phase === "open"];
}
