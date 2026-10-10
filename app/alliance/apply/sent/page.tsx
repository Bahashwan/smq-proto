import type { Metadata } from "next";
import { ApplySent } from "@/components/pages/g6/apply/Sent";

export const metadata: Metadata = { title: "وصل طلب الانضمام", robots: { index: false, follow: false } };

export default function Page() {
  return <ApplySent />;
}
