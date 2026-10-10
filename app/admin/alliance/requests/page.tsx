import type { Metadata } from "next";
import { RequestsPage } from "@/components/pages/g9/RequestsPage";

export const metadata: Metadata = { title: "الطلبات والمطابقات · غرفة التحالف", robots: { index: false, follow: false } };

export default function AdminAllianceRequestsRoute() {
  return <RequestsPage />;
}
