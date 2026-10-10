import type { Metadata } from "next";
import { AddSent } from "@/components/pages/g5/AddSent";

export const metadata: Metadata = { title: "وصلنا طلبك", robots: { index: false, follow: false } };

export default function Page() {
  return <AddSent />;
}
