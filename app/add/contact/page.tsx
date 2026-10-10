import type { Metadata } from "next";
import { AddStep3 } from "@/components/pages/g5/AddStep3";

export const metadata: Metadata = { title: "أضف عقارك · الصور وبياناتك", robots: { index: false, follow: false } };

export default function Page() {
  return <AddStep3 />;
}
