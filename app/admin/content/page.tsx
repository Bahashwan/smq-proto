import type { Metadata } from "next";
import { ContentHubPage } from "@/components/pages/g8/ContentHubPage";

export const metadata: Metadata = { title: "المحتوى والأسئلة · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminContentRoute() {
  return <ContentHubPage />;
}
