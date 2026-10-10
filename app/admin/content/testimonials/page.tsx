import type { Metadata } from "next";
import { TestimonialsPage } from "@/components/pages/g8/TestimonialsPage";

export const metadata: Metadata = { title: "آراء العملاء والأرقام · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminTestimonialsPageRoute() {
  return <TestimonialsPage />;
}
