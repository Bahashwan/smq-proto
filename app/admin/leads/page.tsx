import type { Metadata } from "next";
import { LeadsPage } from "@/components/pages/g7/LeadsPage";

export const metadata: Metadata = { title: "الطلبات الواردة · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminLeadsRoute() {
  return <LeadsPage />;
}
