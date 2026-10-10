import type { Metadata } from "next";
import { FaqPage } from "@/components/pages/g8/FaqPage";

export const metadata: Metadata = { title: "الأسئلة الشائعة · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminFaqPageRoute() {
  return <FaqPage />;
}
