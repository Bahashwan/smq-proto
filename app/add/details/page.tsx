import type { Metadata } from "next";
import { AddStep2 } from "@/components/pages/g5/AddStep2";

export const metadata: Metadata = { title: "أضف عقارك · التفاصيل والسعر", robots: { index: false, follow: false } };

export default function Page() {
  return <AddStep2 />;
}
