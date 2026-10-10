import type { Metadata } from "next";
import { VisitorsPage } from "@/components/pages/g7/VisitorsPage";

export const metadata: Metadata = { title: "الزوار · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminVisitorsRoute() {
  return <VisitorsPage />;
}
