"use client";
// The results state of /units and /units/map: filters from the URL, store overrides, the presenter's skeleton
// switch, the ~400 ms skeleton on every filter change, and the computed result set.
import { useEffect, useMemo, useRef, useState } from "react";
import { useHasHydrated, useQuery } from "@/lib/location";
import { usePresenter } from "@/lib/presenter";
import { useUnitOverrides } from "@/lib/store";
import { parseFilters, type UnitFilters } from "@/lib/url";
import { activeConstraints, emptyStateSuggestions, filterUnits, latestUpdate, type EmptyState, type FilterResult, type UnitOverrides } from "@/data/selectors";
import { projectById, projects } from "@/data/projects";
import type { Project, Unit } from "@/data/types";
import { filtersKey } from "./shared";

export const FILTER_SKELETON_MS = 400;

export interface ProjectGroup {
  project: Project;
  units: Unit[];
}

export interface ResultsState {
  filters: UnitFilters;
  overrides: UnitOverrides;
  result: FilterResult;
  groups: ProjectGroup[];
  constraints: ReturnType<typeof activeConstraints>;
  empty: EmptyState;
  updatedAt: string;
  /** presenter switch or the transient skeleton after a filter change */
  loading: boolean;
  hydrated: boolean;
  skeletonSwitch: boolean;
}

export function useResults(): ResultsState {
  const q = useQuery();
  const hydrated = useHasHydrated();
  const overrides = useUnitOverrides();
  const { state: presenter } = usePresenter();
  const filters = useMemo(() => parseFilters(q), [q]);
  const key = filtersKey(filters);

  // skeleton for ~400 ms on every filter change; the query arriving at hydration (server render = defaults) is not one
  const [transient, setTransient] = useState(false);
  const lastKey = useRef<string | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (lastKey.current === null) {
      lastKey.current = key;
      return;
    }
    if (lastKey.current === key) return;
    lastKey.current = key;
    const on = setTimeout(() => setTransient(true), 0);
    const off = setTimeout(() => setTransient(false), FILTER_SKELETON_MS);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
      setTransient(false);
    };
  }, [key, hydrated]);

  const result = useMemo(() => filterUnits(filters, overrides), [filters, overrides]);
  const groups = useMemo<ProjectGroup[]>(() => {
    const order = new Map<string, Unit[]>();
    for (const u of result.matched.filter((x) => x.status !== "sold")) {
      const list = order.get(u.projectId) ?? [];
      list.push(u);
      order.set(u.projectId, list);
    }
    return [...order.entries()]
      .map(([id, units]) => ({ project: projectById(id) ?? projects[0], units }))
      .filter((g) => !!g.project);
  }, [result.matched]);
  const constraints = useMemo(() => activeConstraints(filters), [filters]);
  const empty = useMemo(() => emptyStateSuggestions(filters, overrides), [filters, overrides]);
  const updatedAt = useMemo(() => latestUpdate(result.matched.length ? result.matched : undefined), [result.matched]);

  return {
    filters,
    overrides,
    result,
    groups,
    constraints,
    empty,
    updatedAt,
    loading: presenter.skeleton || transient,
    hydrated,
    skeletonSwitch: presenter.skeleton,
  };
}
