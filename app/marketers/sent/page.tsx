import type { Metadata } from "next";
import { MarketerSent } from "@/components/pages/g5/MarketerSent";

export const metadata: Metadata = { title: "وصلنا طلبك", robots: { index: false, follow: false } };

export default function Page() {
  return <MarketerSent />;
}
