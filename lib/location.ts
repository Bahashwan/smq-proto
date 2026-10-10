"use client";
// A tiny client-side location store. Next's App Router has no router events and useSearchParams forces
// client-side rendering up to the nearest Suspense boundary on static pages, so we patch history instead.
// On the server (and during hydration) the query is empty: pages render their default state first.
import { useSyncExternalStore } from "react";

type Listener = () => void;
const listeners = new Set<Listener>();
let patched = false;
let serverParams: URLSearchParams | null = null;

function notify() {
  listeners.forEach((l) => l());
}

function patchHistory() {
  if (patched || typeof window === "undefined") return;
  patched = true;
  const wrap = (name: "pushState" | "replaceState") => {
    const original = window.history[name];
    window.history[name] = function (this: History, ...args: Parameters<History["pushState"]>) {
      const result = original.apply(this, args);
      queueMicrotask(notify);
      return result;
    } as History["pushState"];
  };
  wrap("pushState");
  wrap("replaceState");
  window.addEventListener("popstate", notify);
  window.addEventListener("hashchange", notify);
}

function subscribe(l: Listener) {
  patchHistory();
  listeners.add(l);
  return () => listeners.delete(l);
}

let cachedSearch = "";
let cachedParams = new URLSearchParams();
function getSnapshot(): URLSearchParams {
  const s = window.location.search;
  if (s !== cachedSearch) {
    cachedSearch = s;
    cachedParams = new URLSearchParams(s);
  }
  return cachedParams;
}
function getServerSnapshot(): URLSearchParams {
  if (!serverParams) serverParams = new URLSearchParams();
  return serverParams;
}

/** Current URL query (empty during prerender and hydration). Reference-stable until the search string changes. */
export function useQuery(): URLSearchParams {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function getPath() {
  return window.location.pathname;
}
function getServerPath() {
  return "";
}
/** Current pathname ("" during prerender). */
export function useClientPath(): string {
  return useSyncExternalStore(subscribe, getPath, getServerPath);
}

/** Replace or push query parameters without a server round trip. `null` removes a key. */
export function setQuery(changes: Record<string, string | null>, mode: "push" | "replace" = "push") {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(changes)) {
    if (v === null || v === "") url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  const next = url.pathname + (url.search ? url.search : "") + url.hash;
  window.history[mode === "push" ? "pushState" : "replaceState"](window.history.state, "", next);
}

export function useHasHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
