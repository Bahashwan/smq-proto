import type { Metadata } from "next";
import { RadarPage } from "@/components/pages/g9/RadarPage";

export const metadata: Metadata = { title: "الرادار · غرفة التحالف", robots: { index: false, follow: false } };

export default function AdminAllianceRadarRoute() {
  return <RadarPage />;
}
