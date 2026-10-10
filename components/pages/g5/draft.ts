"use client";
// أضف عقارك · the draft of the three steps (Add-Step1-M … Add-Step3-D) and the last submission (Add-Success-M/D).
// Both live in the session store (`patches.add.draft`, `patches.add.sent`) so a reload keeps them; nothing is sent
// anywhere. The draft starts from the apartment the boards show (approval 2026-1043, شقة في الروضة). Choosing a
// building type (or opening a step with `?type=building`) moves every field the visitor has not touched to the income
// building of approval 2026-1042 (عمارة سكنية في النعيم, وكيل), so the owner tour lands on the record the admin opens.
import { useCallback, useEffect, useMemo, useRef } from "react";
import { approvalById, approvals } from "@/data/approvals";
import { forms, lists } from "@/data/content";
import { districtAr } from "@/data/districts";
import type { Approval, ApprovalKind } from "@/data/types";
import { bedsLabel, fmtArea, fmtNum, plural, UNITS } from "@/lib/format";
import { useHasHydrated, useQuery } from "@/lib/location";
import { usePatch, useStore } from "@/lib/store";

const F = forms.add;

export type Purpose = "sell" | "rent";
export type Role = "owner" | "agent" | "marketer" | "other";
export type Pin = { x: number; y: number; lat: number; lng: number };
export interface Photo {
  id: string;
  name: string;
}

export interface AddDraft {
  // step 1 · النوع والموقع
  type: string;
  purpose: Purpose;
  city: string;
  district: string; // a slug of lists.districts, or OTHER_DISTRICT
  districtName: string; // typed when the district is «حي آخر» or the city is another city
  landmark: string;
  pin: Pin | null;
  pinMode: "pin" | "link";
  pinLink: string;
  relation: string;
  // step 2 · apartment, villa, floor, shop, warehouse (land keeps only the area)
  beds: number;
  baths: number;
  area: string;
  floor: string;
  age: string;
  occupancy: string;
  features: string[];
  // step 2 · building
  land: string;
  build: string;
  floors: string;
  units: number;
  buildingAge: string;
  street: string;
  hasIncome: "yes" | "no";
  income: string;
  rented: string;
  contracts: string;
  buildingFeatures: string[];
  // step 2 · shared
  price: string;
  negotiable: number; // index into the variant's list («نعم، قليلاً» / «قليلاً», «لا», «أفضل عرض»)
  deed: string;
  // step 3 · الصور وبياناتك
  photos: Photo[];
  role: Role;
  poaFile: string;
  poaNo: string;
  falNo: string;
  contractFile: string;
  name: string;
  phone: string;
  email: string;
  timing: string;
  consent: boolean;
}

// ---------------------------------------------------------------------------
// Option lists (data/content forms.add, the boards' lists)
// ---------------------------------------------------------------------------

export const TYPES = F.propertyTypes;
export const BUILDING_TYPES = F.buildingTypes;
export const CITIES = F.cities;
export const PURPOSES: { value: Purpose; label: string }[] = [
  { value: "sell", label: F.purposes[0] },
  { value: "rent", label: F.purposes[1] },
];
export const RELATIONS = F.relations;
export const ROLES: { value: Role; label: string }[] = (["owner", "agent", "marketer", "other"] as Role[]).map((value, i) => ({ value, label: F.roles[i] }));
export const OTHER_DISTRICT = "other";
export const DISTRICT_OPTIONS = [...lists.districts.map((d) => ({ value: d.slug ?? d.key, label: d.labelAr })), { value: OTHER_DISTRICT, label: "حي آخر" }];
export const FLOORS = F.floors;
export const AGES = F.ages;
export const OCCUPANCY = F.occupancy;
export const APT_FEATURES = F.apartmentFeatures;
export const BUILDING_FLOORS = F.buildingFloors;
export const STREETS = F.streetWidths;
export const CONTRACTS = F.contracts;
export const BUILDING_FEATURES = F.buildingFeatures;
export const TIMING = F.timing;
export const PHOTOS_MAX = 10;

/** «صلتك بالعقار» → the role it implies at step 3 */
const RELATION_ROLE: Record<string, Role> = { [RELATIONS[0]]: "owner", [RELATIONS[1]]: "agent", [RELATIONS[2]]: "marketer" };
/** the word after the place in the step-2 summary («· المالك», «· وكيل») */
const RELATION_WORD: Record<Role, string> = { owner: "المالك", agent: "وكيل", marketer: "وسيط", other: "" };

export const isBuilding = (type: string) => BUILDING_TYPES.includes(type);
export const isLand = (type: string) => type === "أرض";
export const negotiableList = (type: string) => (isBuilding(type) ? F.negotiableBuilding : F.negotiable);
export const roleLabel = (r: Role) => ROLES.find((x) => x.value === r)?.label ?? "";

export function approvalKind(type: string): ApprovalKind {
  if (isBuilding(type)) return "building";
  if (isLand(type)) return "land";
  if (type === "فيلا" || type === "فيلا روف" || type === "دور") return "villa";
  return "apartment";
}

// ---------------------------------------------------------------------------
// The two sample drafts, from the approvals fixtures
// ---------------------------------------------------------------------------

const APT = approvalById("2026-1043") as Approval;
const BLD = approvalById("2026-1042") as Approval;

function pick(options: string[], label?: string): string {
  if (!label) return options[0];
  return options.find((o) => o === label) ?? options.find((o) => label.startsWith(o)) ?? options[0];
}
const numText = (n?: number) => (n ? fmtNum(n) : "");

function step2Apartment(a: Approval) {
  return {
    beds: a.beds ?? 0,
    baths: a.baths ?? 0,
    area: numText(a.areaM2),
    floor: pick(FLOORS, a.floor),
    age: pick(AGES, a.ageLabel),
    occupancy: pick(OCCUPANCY, a.occupancy),
    features: a.features ?? [],
  };
}
function step2Building(a: Approval) {
  const floors = a.floors ?? 0;
  const contracts = a.contractsLabel ?? "";
  return {
    land: numText(a.landM2),
    build: numText(a.buildM2),
    floors: floors >= 5 ? BUILDING_FLOORS[BUILDING_FLOORS.length - 1] : pick(BUILDING_FLOORS, String(floors)),
    units: a.unitsCount ?? 0,
    buildingAge: pick(AGES, a.ageLabel),
    street: pick(STREETS, a.streetWidth),
    hasIncome: (a.hasIncome ? "yes" : "no") as "yes" | "no",
    income: numText(a.incomeYearSar),
    rented: a.occupiedUnits != null && a.unitsCount ? `${a.occupiedUnits} من ${a.unitsCount}` : "",
    contracts: /غير/.test(contracts) ? CONTRACTS[1] : /مختلط/.test(contracts) ? CONTRACTS[2] : CONTRACTS[0],
    buildingFeatures: a.buildingFeatures ?? [],
  };
}
function samplePhotos(a: Approval): Photo[] {
  if (a.photos?.length) return a.photos.map((p, i) => ({ id: `${a.id}-${i + 1}`, name: p.split(" · ")[0] }));
  return Array.from({ length: a.photosCount }, (_, i) => ({ id: `${a.id}-${i + 1}`, name: `${a.id}-${i + 1}` }));
}
function sample(a: Approval): AddDraft {
  const building = a.kind === "building";
  const neg = (building ? F.negotiableBuilding : F.negotiable).indexOf(a.negotiable ?? "");
  return {
    type: a.typeLabelAr ?? (building ? BUILDING_TYPES[0] : TYPES[0]),
    purpose: a.purpose,
    city: pick(CITIES, a.city),
    district: a.districtSlug,
    districtName: "",
    landmark: a.landmark ?? "",
    pin: null,
    pinMode: "pin",
    pinLink: "",
    relation: pick(RELATIONS, a.relation),
    ...step2Apartment(APT),
    ...step2Building(BLD),
    price: numText(a.askedPriceSar),
    negotiable: neg < 0 ? 0 : neg,
    deed: a.deedNumber ?? "",
    photos: samplePhotos(a),
    role: a.role,
    poaFile: "",
    poaNo: "",
    falNo: "",
    contractFile: "",
    name: a.submitterName,
    phone: "",
    email: "",
    timing: pick(TIMING, a.timing),
    consent: true,
  };
}

export const SAMPLE_APT = sample(APT);
export const SAMPLE_BLD = sample(BLD);
const sampleFor = (type: string) => (isBuilding(type) ? SAMPLE_BLD : SAMPLE_APT);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** The patch for a type change: crossing between the apartment and building variants moves every field still equal
 *  to the old sample to the other sample (typed values stay). */
export function typeChange(d: AddDraft, type: string): Partial<AddDraft> {
  const from = sampleFor(d.type);
  const to = sampleFor(type);
  const out: Record<string, unknown> = { type };
  if (from === to) return out as Partial<AddDraft>;
  for (const k of Object.keys(to) as (keyof AddDraft)[]) {
    if (k !== "type" && same(d[k], from[k])) out[k] = to[k];
  }
  return out as Partial<AddDraft>;
}

// ---------------------------------------------------------------------------
// The store hook
// ---------------------------------------------------------------------------

/** The draft (sample until hydration, then the session copy) and its updater. `?type=building` on any step switches an
 *  apartment draft to the building once per visit, so every step of the owner tour opens directly by URL. */
export function useAddDraft(): { draft: AddDraft; ready: boolean; update: (p: Partial<AddDraft>) => void; reset: () => void } {
  const ready = useHasHydrated();
  const stored = usePatch<AddDraft>("add", "draft");
  const patch = useStore((s) => s.patch);
  const q = useQuery();
  const draft = useMemo<AddDraft>(() => (ready && stored ? { ...SAMPLE_APT, ...stored } : SAMPLE_APT), [ready, stored]);
  const update = useCallback((p: Partial<AddDraft>) => patch("add", "draft", p as Record<string, unknown>), [patch]);
  const reset = useCallback(() => patch("add", "draft", { ...SAMPLE_APT } as unknown as Record<string, unknown>), [patch]);
  const deepLinked = useRef(false);
  const wantsBuilding = q.get("type") === "building";
  useEffect(() => {
    if (!ready || deepLinked.current || !wantsBuilding) return;
    deepLinked.current = true;
    if (!isBuilding(draft.type)) update(typeChange(draft, BUILDING_TYPES[0]));
  }, [ready, wantsBuilding, draft, update]);
  return { draft, ready, update, reset };
}

// ---------------------------------------------------------------------------
// Numbers typed in the fields
// ---------------------------------------------------------------------------

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
/** Western digits only («٦٢٠٬٠٠٠» → «620000») */
export function digits(s: string): string {
  return s.replace(/[٠-٩]/g, (c) => String(ARABIC_DIGITS.indexOf(c))).replace(/\D/g, "");
}
export const toNum = (s: string) => Number(digits(s)) || 0;
/** keep what the visitor types (digits and separators), format on blur */
export const typedNumber = (s: string) => s.replace(/[٠-٩]/g, (c) => String(ARABIC_DIGITS.indexOf(c))).replace(/[^\d,٬]/g, "");
export const formatTyped = (s: string) => (digits(s) ? fmtNum(toNum(s)) : "");

/** Saudi mobile: 10 digits starting 05 (+966 / 00966 prefixes accepted) */
export function checkPhone(s: string): { ok: boolean; empty: boolean; digits: string } {
  let d = digits(s);
  if (d.startsWith("00966")) d = `0${d.slice(5)}`;
  else if (d.startsWith("966")) d = `0${d.slice(3)}`;
  else if (d.startsWith("5") && d.length === 9) d = `0${d}`;
  return { ok: /^05\d{8}$/.test(d), empty: d.length === 0, digits: d };
}
export const PHONE_REQUIRED = "سنرسل عليه رسالة تأكيد. الرقم مطلوب.";
export const PHONE_INCOMPLETE = "الرقم غير مكتمل. 10 أرقام تبدأ بـ 05.";

// ---------------------------------------------------------------------------
// Lines the steps and the success screen print
// ---------------------------------------------------------------------------

export const purposeLabel = (p: Purpose) => PURPOSES.find((x) => x.value === p)?.label ?? "";
export function districtLabel(d: Pick<AddDraft, "city" | "district" | "districtName">): string {
  if (d.city !== CITIES[0] || d.district === OTHER_DISTRICT) return d.districtName.trim() || "—";
  return districtAr(d.district);
}
const cityShort = (city: string) => (city === CITIES[0] ? city : "مدينة أخرى");
/** «حي الروضة، جدة» */
export const placeLine = (d: Pick<AddDraft, "city" | "district" | "districtName">) => `حي ${districtLabel(d)}، ${cityShort(d.city)}`;
/** the step-2 summary: «شقة للبيع» · «حي الروضة، جدة · المالك» */
export function step1Summary(d: AddDraft): { strong: string; rest: string } {
  const who = RELATION_WORD[RELATION_ROLE[d.relation] ?? "other"];
  return { strong: `${d.type} ${purposeLabel(d.purpose)}`, rest: [placeLine(d), who].filter(Boolean).join(" · ") };
}
/** keep a number and its unit on one line («120 م²», «3 غرف») */
const nb = (s: string) => s.replace(/ /g, "\u00a0");
/** the step-3 summary: «عمارة سكنية للبيع» · «حي النعيم، جدة · 8 وحدات · دخل 312,000 سنوياً · السعر المطلوب» + price */
export function step2Summary(d: AddDraft): { strong: string; rest: string; price: string } {
  const parts = [placeLine(d)];
  if (isBuilding(d.type)) {
    if (d.units) parts.push(nb(plural(d.units, UNITS)));
    if (d.hasIncome === "yes" && toNum(d.income)) parts.push(`دخل ${fmtNum(toNum(d.income))} سنوياً`);
  } else if (isLand(d.type)) {
    if (toNum(d.area)) parts.push(nb(`${fmtArea(toNum(d.area))} م²`));
  } else {
    if (d.beds) parts.push(nb(bedsLabel(d.beds)));
    if (toNum(d.area)) parts.push(nb(`${fmtArea(toNum(d.area))} م²`));
  }
  parts.push("السعر المطلوب");
  return { strong: `${d.type} ${purposeLabel(d.purpose)}`, rest: parts.join(" · "), price: toNum(d.price) ? fmtNum(toNum(d.price)) : "—" };
}

/** step 3 → the role the step-1 relation implies, until the visitor picks one */
export const roleFromRelation = (relation: string): Role => RELATION_ROLE[relation] ?? "owner";

// ---------------------------------------------------------------------------
// Validation (gold errors under the fields)
// ---------------------------------------------------------------------------

export type Errors = Partial<Record<string, string>>;
export const FIELD = {
  districtName: "add-district-name",
  area: "add-area",
  land: "add-land",
  build: "add-build",
  income: "add-income",
  price: "add-price",
  name: "add-name",
  phone: "add-phone",
  email: "add-email",
  consent: "add-consent",
} as const;

export function checkStep1(d: AddDraft): Errors {
  const e: Errors = {};
  if ((d.city !== CITIES[0] || d.district === OTHER_DISTRICT) && !d.districtName.trim()) e[FIELD.districtName] = "اكتب اسم الحي.";
  return e;
}
export function checkStep2(d: AddDraft): Errors {
  const e: Errors = {};
  if (isBuilding(d.type)) {
    if (!toNum(d.land)) e[FIELD.land] = "اكتب مساحة الأرض بالمتر المربع.";
    if (!toNum(d.build)) e[FIELD.build] = "اكتب مساحة البناء بالمتر المربع.";
    if (d.hasIncome === "yes" && !toNum(d.income)) e[FIELD.income] = "اكتب الدخل السنوي أو اختر «لا».";
  } else if (!toNum(d.area)) e[FIELD.area] = "اكتب المساحة بالمتر المربع.";
  if (!toNum(d.price)) e[FIELD.price] = "اكتب السعر الذي تريده بالريال.";
  return e;
}
export function checkStep3(d: AddDraft): Errors {
  const e: Errors = {};
  if (!d.name.trim()) e[FIELD.name] = "اكتب اسمك حتى نعرف بمن نتواصل.";
  const p = checkPhone(d.phone);
  if (!p.ok) e[FIELD.phone] = p.empty ? PHONE_REQUIRED : PHONE_INCOMPLETE;
  if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) e[FIELD.email] = "البريد غير مكتمل. مثال: name@mail.com";
  if (!d.consent) e[FIELD.consent] = "علّم الموافقة حتى نستطيع التواصل معك.";
  return e;
}
/** focus the first field with an error (form order = DOM order) */
export function focusFirst(errors: Errors) {
  const ids = Object.keys(errors);
  if (!ids.length || typeof document === "undefined") return;
  const els = ids.map((id) => document.getElementById(id)).filter((x): x is HTMLElement => !!x);
  els.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  const first = els[0];
  if (!first) return;
  first.scrollIntoView({ block: "center" });
  first.focus({ preventScroll: true });
}

// ---------------------------------------------------------------------------
// The submission (Add-Success-M/D)
// ---------------------------------------------------------------------------

export interface AddSent {
  no: string;
  type: string;
  purpose: Purpose;
  place: string; // «حي النعيم، جدة»
  district: string; // «النعيم»
  kind: ApprovalKind;
  beds: number;
  area: number;
  units: number;
  hasIncome: boolean;
  income: number;
  price: number;
  negotiable: number;
  role: Role;
  attached: boolean;
  photos: number;
  timing: string;
  phone: string; // masked «05X XXX 4821»
}

/** The record number: the open approval of the same kind (2026-1043 apartment, 2026-1042 building …). */
export function requestNumber(type: string): string {
  const kind = approvalKind(type);
  return approvals.find((a) => a.kind === kind)?.id ?? APT.id;
}

export function sentFromDraft(d: AddDraft): AddSent {
  const p = checkPhone(d.phone);
  const role = d.role;
  return {
    no: requestNumber(d.type),
    type: d.type,
    purpose: d.purpose,
    place: placeLine(d),
    district: districtLabel(d),
    kind: approvalKind(d.type),
    beds: d.beds,
    area: toNum(d.area),
    units: d.units,
    hasIncome: d.hasIncome === "yes",
    income: toNum(d.income),
    price: toNum(d.price),
    negotiable: d.negotiable,
    role,
    attached: role === "agent" ? !!d.poaFile : role === "marketer" ? !!d.contractFile : false,
    photos: d.photos.length,
    timing: d.timing,
    phone: `05X XXX ${p.digits.slice(-4)}`,
  };
}

const APPROVAL_ROLE: Record<string, Role> = { owner: "owner", agent: "agent", marketer: "marketer" };
/** The fixture record when /add/sent opens without a submission in this session. */
export function sentFromApproval(a: Approval): AddSent {
  const building = a.kind === "building";
  const neg = (building ? F.negotiableBuilding : F.negotiable).indexOf(a.negotiable ?? "");
  const place = { city: pick(CITIES, a.city), district: a.districtSlug, districtName: "" };
  return {
    no: a.id,
    type: a.typeLabelAr ?? "",
    purpose: a.purpose,
    place: placeLine(place),
    district: districtLabel(place),
    kind: a.kind,
    beds: a.beds ?? 0,
    area: a.areaM2 ?? a.landM2 ?? 0,
    units: a.unitsCount ?? 0,
    hasIncome: !!a.hasIncome,
    income: a.incomeYearSar ?? 0,
    price: a.askedPriceSar,
    negotiable: neg < 0 ? 0 : neg,
    role: APPROVAL_ROLE[a.role] ?? "owner",
    attached: a.attachments.length > 0,
    photos: a.photosCount,
    timing: pick(TIMING, a.timing),
    phone: a.phoneLast4 ? `05X XXX ${a.phoneLast4}` : a.phoneMasked,
  };
}

/** «الصك» / «الوكالة» / «عقد الوساطة» and the second item («العقود» for an income building, else the photos) */
function docs(s: Pick<AddSent, "role" | "kind" | "hasIncome">): { first: string; second: string; secondShort: string } {
  const first = s.role === "agent" ? "الوكالة" : s.role === "marketer" ? "عقد الوساطة" : "الصك";
  const contracts = s.kind === "building" && s.hasIncome;
  return { first, second: contracts ? "العقود" : "الصور", secondShort: contracts ? "العقود" : "صوراً" };
}
const timingWord = (t: string) => (t === TIMING[0] || t === TIMING[1] ? t : "");

/** «شقة للبيع في حي الروضة بسعر 620,000 ريال. سنراجع الصك والصور ونتواصل معك على واتساب خلال 24 ساعة عمل.» */
export function sentLine(s: AddSent): string {
  const units = s.kind === "building" && s.units ? `، ${plural(s.units, UNITS)}،` : "";
  const d = docs(s);
  const when = timingWord(s.timing);
  return `${s.type} ${purposeLabel(s.purpose)} في حي ${s.district}${units} بسعر ${fmtNum(s.price)} ريال. سنراجع ${d.first} و${d.second} ونتواصل معك${when ? ` ${when}` : ""} على واتساب خلال 24 ساعة عمل.`;
}
/** «أضف الصك أو صوراً عبر واتساب» / «أضف الوكالة أو العقود عبر واتساب» */
export function sentWaLabel(s: AddSent): string {
  const d = docs(s);
  return `أضف ${d.first} أو ${d.secondShort} عبر واتساب`;
}
const NEGOTIABLE_WORDS = ["قابل للتفاوض قليلاً", "غير قابل للتفاوض", "أفضل عرض"];
/** «ملخص ما أرسلت» rows */
export function sentRows(s: AddSent): { label: string; value: string }[] {
  const rows = [
    { label: "النوع", value: `${s.type} · ${purposeLabel(s.purpose)}` },
    { label: "الموقع", value: s.place },
  ];
  if (s.kind === "building") rows.push({ label: "الوحدات والدخل", value: `${s.units} · ${s.hasIncome && s.income ? `${fmtNum(s.income)} سنوياً` : "بلا دخل"}` });
  else if (s.kind === "land") rows.push({ label: "المساحة", value: `${fmtArea(s.area)} م²` });
  else rows.push({ label: "الغرف والمساحة", value: `${bedsLabel(s.beds)} · ${fmtArea(s.area)} م²` });
  const attachedWord = s.role === "agent" ? "وكالة مرفقة" : s.role === "marketer" ? "عقد مرفق" : "";
  rows.push(
    { label: "السعر المطلوب", value: `${fmtNum(s.price)} · ${NEGOTIABLE_WORDS[s.negotiable] ?? NEGOTIABLE_WORDS[0]}` },
    { label: "صفتك", value: [roleLabel(s.role), s.attached ? attachedWord : ""].filter(Boolean).join(" · ") },
    { label: "الصور", value: String(s.photos) },
    { label: "التواصل", value: s.timing },
  );
  return rows;
}
