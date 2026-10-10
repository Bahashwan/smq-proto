"use client";
// Live numbers on the statically rendered home page: the fixture value renders first (server and first paint), then
// the session store's unit overrides apply, so a unit the admin marks sold or reserved leaves the home counts too.
import { Price } from "@/components/ui";
import { countsByStatus, projectStats } from "@/data/selectors";
import { fmtNum } from "@/lib/format";
import { useUnitOverrides } from "@/lib/store";

/** «6» of «6 وحدات متاحة الآن» */
export function LiveAvailableCount() {
  const ov = useUnitOverrides();
  return <>{countsByStatus(ov).available}</>;
}

type StatField = "available" | "listed" | "ppmMin";

/** One figure of the current project block: available / listed models, the lowest price per m² */
export function LiveProjectStat({ projectId, field }: { projectId: string; field: StatField }) {
  const ov = useUnitOverrides();
  const s = projectStats(projectId, ov);
  if (field === "ppmMin") return <>{s.ppm ? fmtNum(s.ppm.min) : "—"}</>;
  return <>{s[field]}</>;
}

/** «تبدأ من 459,000» (the Home boards print the project figure without the riyal sign) */
export function LiveProjectFrom({ projectId, className, sign = true }: { projectId: string; className?: string; sign?: boolean }) {
  const ov = useUnitOverrides();
  return <Price value={projectStats(projectId, ov).fromPrice ?? 0} className={className} sign={sign} />;
}
