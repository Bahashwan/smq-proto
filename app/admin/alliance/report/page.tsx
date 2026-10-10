import type { Metadata } from "next";
import { ReportPage } from "@/components/pages/g9/ReportPage";

export const metadata: Metadata = { title: "التقرير الشهري · غرفة التحالف", robots: { index: false, follow: false } };

export default function AdminAllianceReportRoute() {
  return <ReportPage />;
}
