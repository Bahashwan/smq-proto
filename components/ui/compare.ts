"use client";
// Compare selection: the store's `compare` list (session) mirrored to localStorage `smq.compare` for 7 days.
import { useCallback, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";

export const COMPARE_MAX = 3;
export const COMPARE_KEY = "smq.compare";
export const COMPARE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface Stored {
  slugs: string[];
  exp: number;
}

export function readStoredCompare(): string[] {
  try {
    const raw = window.localStorage.getItem(COMPARE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Stored;
    if (!data || !Array.isArray(data.slugs) || typeof data.exp !== "number" || data.exp < Date.now()) {
      window.localStorage.removeItem(COMPARE_KEY);
      return [];
    }
    return data.slugs.filter((s) => typeof s === "string").slice(0, COMPARE_MAX);
  } catch {
    return [];
  }
}

export function writeStoredCompare(slugs: string[]) {
  try {
    if (!slugs.length) window.localStorage.removeItem(COMPARE_KEY);
    else window.localStorage.setItem(COMPARE_KEY, JSON.stringify({ slugs, exp: Date.now() + COMPARE_TTL_MS } satisfies Stored));
  } catch {
    /* private mode */
  }
}

export function setCompare(slugs: string[]) {
  const next = Array.from(new Set(slugs)).slice(0, COMPARE_MAX);
  useStore.setState({ compare: next });
  if (typeof window !== "undefined") writeStoredCompare(next);
}

/** The compare list with add / remove / toggle; hydrates the store from localStorage once per session. */
export function useCompare() {
  const slugs = useStore((s) => s.compare);
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const stored = readStoredCompare();
    const current = useStore.getState().compare;
    if (!current.length && stored.length) useStore.setState({ compare: stored });
    else if (current.length) writeStoredCompare(current);
  }, []);
  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);
  const add = useCallback(
    (slug: string) => {
      const cur = useStore.getState().compare;
      if (cur.includes(slug) || cur.length >= COMPARE_MAX) return false;
      setCompare([...cur, slug]);
      return true;
    },
    [],
  );
  const remove = useCallback((slug: string) => setCompare(useStore.getState().compare.filter((s) => s !== slug)), []);
  const toggle = useCallback(
    (slug: string) => {
      const cur = useStore.getState().compare;
      if (cur.includes(slug)) {
        setCompare(cur.filter((s) => s !== slug));
        return false;
      }
      if (cur.length >= COMPARE_MAX) return false;
      setCompare([...cur, slug]);
      return true;
    },
    [],
  );
  const clear = useCallback(() => setCompare([]), []);
  return { slugs, count: slugs.length, max: COMPARE_MAX, isFull: slugs.length >= COMPARE_MAX, has, add, remove, toggle, clear };
}
