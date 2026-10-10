import type { Metadata } from "next";
import { AlliancePage } from "@/components/pages/g6/AlliancePage";

export const metadata: Metadata = { title: "تحالف مكاتب جدة العقارية", robots: { index: false, follow: false } };

export default function Page() {
  return <AlliancePage />;
}
