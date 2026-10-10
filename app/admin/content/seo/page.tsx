import type { Metadata } from "next";
import { SeoPage } from "@/components/pages/g8/SeoPage";

export const metadata: Metadata = { title: "عناوين البحث والمعاينة · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminSeoPageRoute() {
  return <SeoPage />;
}
