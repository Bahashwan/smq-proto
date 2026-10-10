import type { Metadata } from "next";
import { EnResults } from "@/components/pages/g2/EnResults";

export const metadata: Metadata = { title: "Units in Jeddah", robots: { index: false, follow: false } };

export default function EnUnitsPage() {
  return <EnResults />;
}
