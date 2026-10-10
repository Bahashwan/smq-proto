import type { Metadata } from "next";
import { SettingsPage } from "@/components/pages/g9/SettingsPage";

export const metadata: Metadata = { title: "الميثاق والإعدادات · غرفة التحالف", robots: { index: false, follow: false } };

export default function AdminAllianceSettingsRoute() {
  return <SettingsPage />;
}
