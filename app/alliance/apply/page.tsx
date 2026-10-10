import type { Metadata } from "next";
import { ApplyStep1 } from "@/components/pages/g6/apply/Step1";

export const metadata: Metadata = { title: "طلب الانضمام إلى التحالف", robots: { index: false, follow: false } };

export default function Page() {
  return <ApplyStep1 />;
}
