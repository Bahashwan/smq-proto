import type { Metadata } from "next";
import { ComparePage } from "@/components/pages/g3/ComparePage";

export const metadata: Metadata = { title: "المقارنة", robots: { index: false, follow: false } };

export default function Page() {
  return <ComparePage />;
}
