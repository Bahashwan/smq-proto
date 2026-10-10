import type { Metadata } from "next";
import { ApplyStep3 } from "@/components/pages/g6/apply/Step3";

export const metadata: Metadata = { title: "طلب الانضمام · ما عندكم وما تحتاجون", robots: { index: false, follow: false } };

export default function Page() {
  return <ApplyStep3 />;
}
