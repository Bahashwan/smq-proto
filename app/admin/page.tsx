import type { Metadata } from "next";
import { OverviewPage } from "@/components/pages/g7/OverviewPage";

export const metadata: Metadata = { title: "نظرة عامة · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminOverviewRoute() {
  return <OverviewPage />;
}
