import type { Metadata } from "next";
import { MapPage } from "@/components/pages/g2/MapPage";

export const metadata: Metadata = { title: "خريطة النتائج", robots: { index: false, follow: false } };

export default function UnitsMapPage() {
  return <MapPage />;
}
