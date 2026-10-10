"use client";
// Presenter layer (hidden from visitors). One URL parameter per switch; the bar persists switches in
// localStorage under smq.presenter; a URL parameter always wins over the stored value.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, setQuery } from "./location";

export type Tier = "real" | "gen" | "typo";
export type UnitStatusSwitch = "available" | "reserved" | "sold" | null;
export type AppStatusSwitch = "review" | "verified" | "rejected" | null;
export type MemberRequestSwitch = "open" | "answered" | "expired" | null;
export type TourId = "buyer" | "owner" | "alliance" | null;

export interface PresenterState {
  demo: boolean; // presenter bar visible
  members: 12 | 0;
  tier: Tier;
  ustatus: UnitStatusSwitch;
  app: AppStatusSwitch;
  mreq: MemberRequestSwitch;
  wa: "connected" | "manual";
  skeleton: boolean;
  marks: boolean; // [للتأكيد] chips shown
  proof: boolean; // About proof blocks
  offline: boolean;
  empty: boolean;
  error: boolean;
  tour: TourId;
  step: number;
}

export const PRESENTER_DEFAULTS: PresenterState = {
  demo: false,
  members: 12,
  tier: "gen",
  ustatus: null,
  app: null,
  mreq: null,
  wa: "connected",
  skeleton: false,
  marks: true,
  proof: false,
  offline: false,
  empty: false,
  error: false,
  tour: null,
  step: 1,
};

export const PRESENTER_PARAMS: Record<keyof PresenterState, { values: string; label: string }> = {
  demo: { values: "1", label: "شريط العرض" },
  members: { values: "12 · 0", label: "أعضاء التحالف" },
  tier: { values: "real · gen · typo", label: "طبقة الصور" },
  ustatus: { values: "available · reserved · sold", label: "حالة الوحدة" },
  app: { values: "review · verified · rejected", label: "حالة طلب الانضمام" },
  mreq: { values: "open · answered · expired", label: "طلب العضو" },
  wa: { values: "connected · manual", label: "واتساب للأعمال" },
  skeleton: { values: "1", label: "هياكل التحميل" },
  marks: { values: "1 · 0", label: "وسوم [للتأكيد]" },
  proof: { values: "1", label: "كتل الإثبات في من نحن" },
  offline: { values: "1", label: "انقطاع الاتصال" },
  empty: { values: "1", label: "حالات فارغة في الإدارة" },
  error: { values: "1", label: "خطأ الدخول" },
  tour: { values: "buyer · owner · alliance", label: "الجولة" },
  step: { values: "1…n", label: "خطوة الجولة" },
};

export const STORAGE_KEY = "smq.presenter";
type Stored = Partial<Pick<PresenterState, "demo" | "members" | "tier" | "ustatus" | "app" | "mreq" | "wa" | "skeleton" | "marks" | "proof">>;

function readStored(): Stored {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : {};
  } catch {
    return {};
  }
}
function writeStored(s: Stored) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* private mode */
  }
}

function parse(q: URLSearchParams, stored: Stored): PresenterState {
  const s: PresenterState = { ...PRESENTER_DEFAULTS, ...stored };
  const has = (k: string) => q.has(k);
  const v = (k: string) => q.get(k) ?? "";
  if (has("demo")) s.demo = v("demo") !== "0";
  if (has("members")) s.members = v("members") === "0" ? 0 : 12;
  if (has("tier") && ["real", "gen", "typo"].includes(v("tier"))) s.tier = v("tier") as Tier;
  if (has("ustatus")) s.ustatus = (["available", "reserved", "sold"].includes(v("ustatus")) ? v("ustatus") : null) as UnitStatusSwitch;
  if (has("app")) s.app = (["review", "verified", "rejected"].includes(v("app")) ? v("app") : null) as AppStatusSwitch;
  if (has("mreq")) s.mreq = (["open", "answered", "expired"].includes(v("mreq")) ? v("mreq") : null) as MemberRequestSwitch;
  if (has("wa")) s.wa = v("wa") === "manual" ? "manual" : "connected";
  if (has("skeleton")) s.skeleton = v("skeleton") !== "0";
  if (has("marks")) s.marks = v("marks") !== "0";
  if (has("proof")) s.proof = v("proof") !== "0";
  if (has("offline")) s.offline = v("offline") !== "0";
  if (has("empty")) s.empty = v("empty") !== "0";
  if (has("error")) s.error = v("error") !== "0";
  if (has("tour")) s.tour = (["buyer", "owner", "alliance"].includes(v("tour")) ? v("tour") : null) as TourId;
  if (has("step")) s.step = Math.max(1, parseInt(v("step"), 10) || 1);
  return s;
}

interface Ctx {
  state: PresenterState;
  /** Set a switch: persists it (when persistable) and writes it to the URL so the screen map links stay honest. */
  set: <K extends keyof PresenterState>(key: K, value: PresenterState[K]) => void;
  reset: () => void;
  hydrated: boolean;
}
const PresenterContext = createContext<Ctx>({ state: PRESENTER_DEFAULTS, set: () => {}, reset: () => {}, hydrated: false });

const PERSISTED: (keyof Stored)[] = ["demo", "members", "tier", "ustatus", "app", "mreq", "wa", "skeleton", "marks", "proof"];

export function PresenterProvider({ children }: { children: ReactNode }) {
  const q = useQuery();
  const [stored, setStored] = useState<Stored>({});
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setStored(readStored());
    setHydrated(true);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.shiftKey && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        setStored((prev) => {
          const next = { ...prev, demo: !(prev.demo ?? false) };
          writeStored(next);
          return next;
        });
        setQuery({ demo: null }, "replace");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const state = useMemo(() => parse(q, stored), [q, stored]);

  const set = useCallback<Ctx["set"]>((key, value) => {
    if ((PERSISTED as string[]).includes(key)) {
      setStored((prev) => {
        const next = { ...prev, [key]: value } as Stored;
        writeStored(next);
        return next;
      });
    }
    const def = PRESENTER_DEFAULTS[key];
    const str = value === null || value === undefined ? null : typeof value === "boolean" ? (value ? "1" : "0") : String(value);
    // the URL carries the switch only while it differs from the default, except marks=0 which is explicit
    setQuery({ [key]: value === def ? null : str }, "replace");
  }, []);

  const reset = useCallback(() => {
    writeStored({});
    setStored({});
    const clear: Record<string, null> = {};
    (Object.keys(PRESENTER_PARAMS) as (keyof PresenterState)[]).forEach((k) => (clear[k] = null));
    setQuery(clear, "replace");
  }, []);

  const value = useMemo(() => ({ state, set, reset, hydrated }), [state, set, reset, hydrated]);
  return <PresenterContext.Provider value={value}>{children}</PresenterContext.Provider>;
}

export function usePresenter(): Ctx {
  return useContext(PresenterContext);
}

/** Whether [للتأكيد] / [مسودة إجابة] chips are shown. */
export function useMarks(): boolean {
  return useContext(PresenterContext).state.marks;
}
