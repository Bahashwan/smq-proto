import type { Metadata } from "next";
import { MediaPage } from "@/components/pages/g8/MediaPage";

export const metadata: Metadata = { title: "الصور · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminMediaPageRoute() {
  return <MediaPage />;
}
