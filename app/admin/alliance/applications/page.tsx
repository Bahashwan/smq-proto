import type { Metadata } from "next";
import { ApplicationsPage } from "@/components/pages/g9/ApplicationsPage";

export const metadata: Metadata = { title: "طلبات الانضمام · غرفة التحالف", robots: { index: false, follow: false } };

export default function AdminAllianceApplicationsRoute() {
  return <ApplicationsPage />;
}
