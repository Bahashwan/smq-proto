"use client";
// The alliance application draft: one object for the three steps, kept on this device for 7 days
// («يُحفظ ما تكتبه على هذا الجوال 7 أيام») under smq.allianceApply. Nothing is sent anywhere; the success page
// shows ALL-2026-0038 (مكتب م للعقارات), so the draft starts from that application as the boards show it.
import { useSyncExternalStore } from "react";
import type { Office, Sector } from "@/data";
import { applyFixture } from "../data";

export interface ApplyDraft {
  officeName: string;
  licence: string;
  applicantName: string;
  phone: string;
  role: string;
  district: string;
  mapsMode: "link" | "pin";
  mapsLink: string;
  pin: { x: number; y: number; lat: number; lng: number } | null;
  sectors: Sector[];
  districts: string[];
  specialties: string[];
  hours: Office["hours"];
  offersDirect: number;
  offersBrokered: number;
  elsewhere: "yes" | "no";
  elsewhereDistricts: string[];
  want: string;
  add: string;
  notes: string;
  directoryConsent: boolean;
  charterConsent: boolean;
  /** «التالي» pressed on a step: its errors show from then on */
  attempted: { 1?: boolean; 2?: boolean; 3?: boolean };
}

export const DRAFT_KEY = "smq.allianceApply";
const TTL = 7 * 24 * 3600 * 1000;

/** Step 1 as AllianceApply-Step1-M shows it (name typed, licence half typed, link pasted), steps 2–3 from the application. */
export function initialDraft(): ApplyDraft {
  const a = applyFixture();
  return {
    officeName: a.officeName,
    licence: a.licence.replace(/\D/g, ""),
    applicantName: "",
    phone: "",
    role: a.applicantRole,
    district: a.districtSlug,
    mapsMode: "link",
    mapsLink: a.mapsLink ?? "",
    pin: null,
    sectors: a.sectors,
    districts: a.districts,
    specialties: a.specialties,
    hours: a.hours,
    offersDirect: a.offersDirect,
    offersBrokered: a.offersBrokered,
    elsewhere: a.requestsElsewhere.length ? "yes" : "no",
    elsewhereDistricts: a.requestsElsewhere,
    want: a.want,
    add: a.add,
    notes: a.notes,
    directoryConsent: a.directoryConsent,
    charterConsent: false,
    attempted: {},
  };
}

const INITIAL = initialDraft();
let current: ApplyDraft | null = null;
const listeners = new Set<() => void>();

function load(): ApplyDraft {
  if (current) return current;
  current = INITIAL;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { savedAt: number; draft: Partial<ApplyDraft> };
      if (parsed.savedAt && Date.now() - parsed.savedAt < TTL) current = { ...INITIAL, ...parsed.draft };
      else window.localStorage.removeItem(DRAFT_KEY);
    }
  } catch {
    /* private mode */
  }
  return current;
}
function save(d: ApplyDraft) {
  current = d;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), draft: d }));
  } catch {
    /* private mode */
  }
  listeners.forEach((l) => l());
}

export function updateDraft(patch: Partial<ApplyDraft>) {
  save({ ...load(), ...patch });
}
export function resetDraft() {
  current = INITIAL;
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* private mode */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === DRAFT_KEY) {
      current = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export function useApplyDraft(): ApplyDraft {
  return useSyncExternalStore(subscribe, load, () => INITIAL);
}

// ---------------------------------------------------------------------------
// Validation (worded messages under the fields, gold, as Contact-Error-M)
// ---------------------------------------------------------------------------

export type FieldErrors = Record<string, string>;

function digitsNote(n: number, want: string): string {
  return `${want} كتبت ${n === 1 ? "رقماً واحداً" : n === 2 ? "رقمين" : n <= 10 ? `${n} أرقام` : `${n} رقماً`} فقط.`;
}

export function step1Errors(d: ApplyDraft): FieldErrors {
  const e: FieldErrors = {};
  if (!d.officeName.trim()) e.officeName = "اكتب اسم المكتب كما في الرخصة.";
  const lic = d.licence.replace(/\D/g, "");
  if (lic.length !== 10) e.licence = lic.length ? digitsNote(lic.length, "رقم الرخصة 10 أرقام.") : "اكتب رقم رخصة فال للمكتب.";
  if (!d.applicantName.trim()) e.applicantName = "اكتب اسم مقدم الطلب.";
  const ph = d.phone.replace(/\D/g, "");
  if (!/^05\d{8}$/.test(ph)) e.phone = ph.length ? digitsNote(ph.length, "10 أرقام تبدأ بـ 05.") : "اكتب رقم الجوال: 10 أرقام تبدأ بـ 05.";
  if (!d.district) e.district = "اختر حي المكتب.";
  if (d.mapsMode === "link" ? !d.mapsLink.trim() : !d.pin) e.maps = d.mapsMode === "link" ? "ألصق رابط موقع المكتب، أو ضع دبوساً." : "ضع الدبوس على موقع المكتب.";
  return e;
}
export function step2Errors(d: ApplyDraft): FieldErrors {
  const e: FieldErrors = {};
  if (!d.sectors.length) e.sectors = "اختر جهة واحدة على الأقل.";
  if (!d.districts.length) e.districts = "اختر حياً واحداً على الأقل";
  return e;
}
export function step3Errors(d: ApplyDraft): FieldErrors {
  const e: FieldErrors = {};
  if (!d.want.trim()) e.want = "اكتب ما تريدونه من التحالف.";
  if (!d.add.trim()) e.add = "اكتب ما ستضيفونه للتحالف.";
  if (!d.charterConsent) e.charter = "الموافقة على الميثاق مطلوبة للانضمام.";
  return e;
}

/** «حقلان يحتاجان تصحيحاً:» (Contact-Error-M pattern) */
export function errorsTitle(n: number, lead: string): string {
  const count = n === 1 ? "حقل يحتاج" : n === 2 ? "حقلان يحتاجان" : n <= 10 ? `${n} حقول تحتاج` : `${n} حقلاً يحتاج`;
  return `${lead} ${count} تصحيحاً:`;
}
