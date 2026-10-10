import type { Metadata } from "next";
import { InventoryPage } from "@/components/pages/g7/InventoryPage";

export const metadata: Metadata = { title: "الوحدات · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminUnitsRoute() {
  return <InventoryPage />;
}
