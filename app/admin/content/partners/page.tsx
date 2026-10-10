import type { Metadata } from "next";
import { PartnersPage } from "@/components/pages/g8/PartnersPage";

export const metadata: Metadata = { title: "الشركاء والتمويل · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminPartnersPageRoute() {
  return <PartnersPage />;
}
