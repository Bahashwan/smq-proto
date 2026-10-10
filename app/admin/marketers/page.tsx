import type { Metadata } from "next";
import { MarketersPage } from "@/components/pages/g9/MarketersPage";

export const metadata: Metadata = { title: "المسوّقون · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminMarketersRoute() {
  return <MarketersPage />;
}
