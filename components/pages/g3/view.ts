"use client";
// The unit page's computed view: effective status (store override, then the presenter switch on top), image tier,
// per-m², delivery words, the «قياساً بالحي» / «قياساً بالمشروع» lines, the sibling strips and the prefilled
// WhatsApp texts. Every number comes from data/selectors.ts; the words are the boards'.
import { useMemo } from "react";
import type { District, ImageTier, Project, Unit, UnitStatus } from "@/data/types";
import { projectById } from "@/data/projects";
import { districtBySlug } from "@/data/districts";
import { floorLabel, UNIT_TYPE_AR } from "@/data/units";
import {
  TODAY,
  availableUnits,
  comparedToDistrict,
  comparedToProject,
  deliveryQuarterIndex,
  effectiveUnitStatus,
  listedUnits,
  otherModelsInBuilding,
  otherRoof,
  similarAvailable,
  unitDistrictSlug,
  unitPpm,
  type ComparedToDistrict,
  type UnitOverrides,
} from "@/data/selectors";
import { fmtNum, plural, UNITS } from "@/lib/format";
import { usePresenter, type Tier } from "@/lib/presenter";
import { useUnitOverrides } from "@/lib/store";
import { orientationWord } from "@/components/ui";

export const TIER_OF: Record<Tier, ImageTier> = { real: "real", gen: "generated", typo: "typographic" };

/** «2026-10-10» + n days */
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
/** Whole days between two ISO dates */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}
/** Days a deposit holds the price (the FAQ's «عربون حجز يثبّت السعر 14 يوماً», content faq-02 / faq-04). */
export const RESERVATION_DAYS = 14;

/** «الربع 2 · 2027» / «Q2 2027» from the project's delivery milestone */
export function deliveryShort(project: Project | undefined, lang: "ar" | "en" = "ar"): string {
  const idx = deliveryQuarterIndex(project);
  if (idx == null) return project?.deliveryLabel.value ?? "";
  const year = Math.floor((idx - 1) / 4);
  const quarter = idx - year * 4;
  return lang === "en" ? `Q${quarter} ${year}` : `الربع ${quarter} · ${year}`;
}

const ORDINAL_EN = ["Ground", "1st", "2nd", "3rd", "4th", "5th"];
/** «3» → «3rd», «4+roof» → «4th and roof» */
export function floorEn(value?: string): string | undefined {
  if (!value) return undefined;
  if (value === "4+roof") return "4th and roof";
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? value : (ORDINAL_EN[n] ?? `${n}th`);
}
const ORIENT_EN: Record<string, string> = { شمالي: "North", جنوبي: "South", شرقي: "East", غربي: "West" };
export function orientationEn(value?: string): string | undefined {
  return value
    ? value
        .split(" ")
        .map((w) => ORIENT_EN[w] ?? w)
        .join("-")
    : undefined;
}

export interface UnitView {
  unit: Unit;
  status: UnitStatus;
  /** the presenter forced this status (the fixtures stay as they are) */
  forced: boolean;
  tier: ImageTier;
  ppm: number;
  reservedUntil?: string;
  /** days the deposit holds (reservedUntil − the day it was reserved) */
  reservedDays?: number;
  soldOn?: string;
  updatedAt: string;
  project: Project | undefined;
  district: District | undefined;
  deliveryShort: string;
  deliveryLong: string;
  projectStatusAr: string;
  compared: ComparedToDistrict;
  projectLine: string;
  others: Unit[];
  similar: Unit[];
  otherRoof: Unit | null;
  roofs: { available: number; listed: number };
  /** available units of the project other than this one */
  projectAvailableOthers: number;
  /** listed units of the project (the «كل النماذج العشرة» link) */
  projectListed: number;
  floorWordAr?: string;
  facingAr?: string;
  typeAr: string;
}

/** Pure part of the view (the pages and the compare table share it). */
export function buildUnitView(unit: Unit, overrides: UnitOverrides, forcedStatus: UnitStatus | null, tier: ImageTier): UnitView {
  const fixtureStatus = effectiveUnitStatus(unit, overrides);
  const status = forcedStatus ?? fixtureStatus;
  const forced = forcedStatus !== null && forcedStatus !== fixtureStatus;
  const project = projectById(unit.projectId);
  const district = districtBySlug(unitDistrictSlug(unit));
  const listedRoofs = listedUnits(overrides).filter((u) => u.type === "roof-villa" && u.projectId === unit.projectId);
  const updatedAt = forced ? TODAY : unit.updatedAt;
  const reservedUntil = status === "reserved" ? (unit.reservedUntil ?? addDays(TODAY, RESERVATION_DAYS)) : undefined;
  const soldOn = status === "sold" ? (unit.soldOn ?? TODAY) : undefined;
  return {
    unit,
    status,
    forced,
    tier,
    ppm: unitPpm(unit),
    reservedUntil,
    reservedDays: reservedUntil ? (unit.reservedUntil ? RESERVATION_DAYS : daysBetween(TODAY, reservedUntil)) : undefined,
    soldOn,
    updatedAt,
    project,
    district,
    deliveryShort: deliveryShort(project),
    deliveryLong: project?.deliveryLabel.value ?? "",
    projectStatusAr: project?.statusAr ?? "",
    compared: comparedToDistrict(unit, overrides),
    projectLine: comparedToProject(unit, overrides).line,
    others: otherModelsInBuilding(unit, overrides),
    similar: similarAvailable(unit, overrides),
    otherRoof: otherRoof(unit, overrides),
    roofs: { available: listedRoofs.filter((u) => u.status === "available").length, listed: listedRoofs.length },
    projectAvailableOthers: availableUnits(overrides).filter((u) => u.projectId === unit.projectId && u.code !== unit.code).length,
    projectListed: listedUnits(overrides).filter((u) => u.projectId === unit.projectId).length,
    floorWordAr: floorLabel(unit),
    facingAr: orientationWord(unit.orientation?.value),
    typeAr: UNIT_TYPE_AR[unit.type],
  };
}

export { useUnitOverrides };

export function useUnitView(unit: Unit): UnitView {
  const overrides = useUnitOverrides();
  const { state } = usePresenter();
  return useMemo(() => buildUnitView(unit, overrides, state.ustatus, TIER_OF[state.tier]), [unit, overrides, state.ustatus, state.tier]);
}

/** «نعم» / «لا» cells */
export function yesNo(v: boolean | undefined, lang: "ar" | "en" = "ar"): string {
  return v ? (lang === "en" ? "Yes" : "نعم") : lang === "en" ? "No" : "لا";
}

/** «690,000 ريال» (the rows spell the word) */
export function riyalWord(n: number): string {
  return `${fmtNum(n)} ريال`;
}

/** «8 وحدات» · «وحدتان» · «11 وحدة» */
export function unitsWord(n: number): string {
  return plural(n, UNITS);
}

/** The spec line's bedroom words: «غرفتان» · «3 غرف نوم» */
export function bedsSpec(n: number): string {
  return n === 1 ? "غرفة نوم واحدة" : n === 2 ? "غرفتان" : `${n} غرف نوم`;
}
/** The tile caption under the bedroom figure: «غرفة نوم» · «غرف نوم» */
export function bedsCaption(n: number): string {
  return n === 1 ? "غرفة نوم" : "غرف نوم";
}
/** The spec line's bathroom words as the boards write them: «3 حمامات» · «2 حمامات» */
export function bathsSpec(n: number): string {
  return n === 1 ? "حمام واحد" : `${n} حمامات`;
}
/** «موقف واحد» · «موقفان» · «3 مواقف» */
export function parkingWord(n: number): string {
  return n === 1 ? "موقف واحد" : n === 2 ? "موقفان" : `${n} مواقف`;
}
const nf2 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** «147.00» · «3.20» */
export function fmt2(n: number): string {
  return nf2.format(n);
}
const nf1 = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** «42.0» */
export function fmt1(n: number): string {
  return nf1.format(n);
}

/** The prefilled WhatsApp texts of the unit boards, with the visitor reference code appended. */
export function unitWaText(v: UnitView, code: string, lang: "ar" | "en" = "ar"): string {
  const u = v.unit;
  const project = v.project?.nameAr ?? "";
  const tail = code ? ` · ${code}` : "";
  if (lang === "en") return `Asking about model ${u.model}, ${u.building === "RZ" ? "Rose" : "Yasmin"}, ${v.project?.nameEn ?? ""} (${u.code})${tail}`;
  if (v.status === "reserved") return `قائمة الانتظار ${u.code}${tail}`;
  if (v.status === "sold") return `${u.code} مباعة، ما البدائل؟${tail}`;
  if (u.type === "roof-villa") return `أسأل عن فيلا الروف ${u.code}${tail}`;
  return `أرغب بالاستفسار عن ${u.nameAr} عمارة ${u.buildingNameAr} في ${project} (${u.code})${tail}`;
}

/** «نموذج A» / «فيلا الروف»: the object of «اسأل عن …» */
export function askObject(unit: Unit): string {
  return unit.type === "roof-villa" ? "فيلا الروف" : `نموذج ${unit.model}`;
}
