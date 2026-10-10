import type { Metadata } from "next";
import { SiteSettingsPage } from "@/components/pages/g8/SiteSettingsPage";

export const metadata: Metadata = { title: "إعدادات الموقع · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminSiteSettingsPageRoute() {
  return <SiteSettingsPage />;
}
