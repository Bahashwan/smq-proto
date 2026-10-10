"use client";
// The compare selection lives in the URL too (`u=rz-d,ys-d`, the /compare format): the query seeds the store when the
// page opens, and every change of the selection is mirrored back with replace, so a shared link opens with the same
// «قارن» boxes ticked. The store (and its 7-day localStorage copy) stays the source the cards and the bar read.
import { useEffect, useRef } from "react";
import { setCompare, useCompare } from "@/components/ui";
import { setQuery, useHasHydrated, useQuery } from "@/lib/location";
import { useStore } from "@/lib/store";
import { unitBySlug } from "@/data/units";

export function useCompareUrl(): void {
  const hydrated = useHasHydrated();
  const q = useQuery();
  const { slugs } = useCompare();
  const seeded = useRef(false);
  const u = q.get("u");
  useEffect(() => {
    if (!hydrated) return;
    if (!seeded.current) {
      seeded.current = true;
      if (u != null) {
        setCompare(
          u
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter((s) => !!unitBySlug(s)),
        );
        return;
      }
    }
    const current = useStore.getState().compare.join(",");
    if (current !== (u ?? "")) setQuery({ u: current || null }, "replace");
  }, [hydrated, u, slugs]);
}
