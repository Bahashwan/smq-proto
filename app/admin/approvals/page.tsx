import type { Metadata } from "next";
import { ApprovalsRedirect } from "@/components/pages/g7/ApprovalsRedirect";

export const metadata: Metadata = { title: "طلبات الموافقة · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminApprovalsRoute() {
  return <ApprovalsRedirect />;
}
