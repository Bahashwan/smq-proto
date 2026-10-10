import type { Metadata } from "next";
import { ResultsPage } from "@/components/pages/g2/ResultsPage";

export const metadata: Metadata = { title: "الوحدات في جدة", robots: { index: false, follow: false } };

export default function UnitsPage() {
  return <ResultsPage />;
}
