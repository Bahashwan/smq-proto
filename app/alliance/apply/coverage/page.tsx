import type { Metadata } from "next";
import { ApplyStep2 } from "@/components/pages/g6/apply/Step2";

export const metadata: Metadata = { title: "طلب الانضمام · التغطية والتخصص", robots: { index: false, follow: false } };

export default function Page() {
  return <ApplyStep2 />;
}
