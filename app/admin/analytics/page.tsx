import type { Metadata } from "next";
import { AnalyticsPage } from "@/components/pages/g7/AnalyticsPage";

export const metadata: Metadata = { title: "تحليلات البحث · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminAnalyticsRoute() {
  return <AnalyticsPage />;
}
