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
  comparedToDistrict,
  comparedToProject,
  deliveryQuarterIndex,
  effectiveUnitStatus,
  listedUnits,
  otherModelsInBuilding,
  otherRoof,
  projectStats,
  similarAvailable,
  unitDistrictSlug,
  unitPpm,
  type ComparedToDistrict,
  type UnitOverrides,
} from "@/data/selectors";
import { fmtNum } from "@/lib/format";
import { usePresenter, type Tier } from "@/lib/presenter";
import { useStore } from "@/lib/store";
import { orientationWord } from "@/components/ui";

export const TIER_OF: Record<Tier, ImageTier> = { real: "real", gen: "generated", typo: "typographic" };

/** «2026-10-10» + n days */
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
/** Days a reservation holds (the boards' «14 يوماً من العربون») */
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
  projectAvailable: number;
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
  const reservedUntil = status === "reserved" ? (unit.reservedUntil ?? addDays(TODAY, RESERVATION_DAYS)) : undefined;
  const soldOn = status === "sold" ? (unit.soldOn ?? TODAY) : undefined;
  return {
    unit,
    status,
    forced,
    tier,
    ppm: unitPpm(unit),
    reservedUntil,
    soldOn,
    updatedAt: forced ? TODAY : unit.updatedAt,
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
    projectAvailable: projectStats(unit.projectId, overrides).available,
    floorWordAr: floorLabel(unit),
    facingAr: orientationWord(unit.orientation?.value),
    typeAr: UNIT_TYPE_AR[unit.type],
  };
}

/** The store's override maps as the selectors take them. */
export function useUnitOverrides(): UnitOverrides {
  const unitStatus = useStore((s) => s.unitStatus);
  const unitHidden = useStore((s) => s.unitHidden);
  return useMemo(() => ({ unitStatus, unitHidden }), [unitStatus, unitHidden]);
}

export function useUnitView(unit: Unit): UnitView {
  const overrides = useUnitOverrides();
  const { state } = usePresenter();
  return useMemo(() => buildUnitView(unit, overrides, state.ustatus, TIER_OF[state.tier]), [unit, overrides, state.ustatus, state.tier]);
}

/** «نعم» / «لا» cells */
export function yesNo(v: boolean | undefined, lang: "ar" | "en" = "ar"): string {
  return v ? (lang === "en" ? "Yes" : "نعم") : lang === "en" ? "No" : "لا";
}

/** «690,000 ريال» */
export function riyalWord(n: number): string {
  return `${fmtNum(n)} ريال`;
}

const UNIT_COUNT_WORDS = ["", "وحدة واحدة", "وحدتان", "3 وحدات", "4 وحدات", "5 وحدات", "6 وحدات", "7 وحدات", "8 وحدات", "9 وحدات", "10 وحدات"];
/** «4 وحدات» · «وحدتان» · «11 وحدة» */
export function unitsWord(n: number): string {
  return UNIT_COUNT_WORDS[n] ?? `${n} وحدة`;
}

/** The prefilled WhatsApp texts of the unit boards, with the visitor reference code appended. */
export function unitWaText(v: UnitView, code: string, lang: "ar" | "en" = "ar"): string {
  const u = v.unit;
  const project = v.project?.nameAr ?? "";
  if (lang === "en") return `Asking about model ${u.model}, ${u.building === "RZ" ? "Rose" : "Yasmin"}, ${v.project?.nameEn ?? ""} (${u.code}) · ${code}`;
  if (v.status === "reserved") return `قائمة الانتظار ${u.code} · ${code}`;
  if (v.status === "sold") return `${u.code} مباعة، ما البدائل؟ · ${code}`;
  if (u.type === "roof-villa") return `أسأل عن فيلا الروف ${u.code} · ${code}`;
  return `أرغب بالاستفسار عن ${u.nameAr} عمارة ${u.buildingNameAr} في ${project} (${u.code}) · ${code}`;
}
