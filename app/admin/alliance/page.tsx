import type { Metadata } from "next";
import { AllianceOverviewPage } from "@/components/pages/g9/AllianceOverviewPage";

export const metadata: Metadata = { title: "غرفة التحالف · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminAllianceRoute() {
  return <AllianceOverviewPage />;
}
