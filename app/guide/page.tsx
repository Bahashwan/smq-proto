import type { Metadata } from "next";
import { GuidePage } from "@/components/pages/g4/GuidePage";

export const metadata: Metadata = {
  title: "دليل الأسعار",
  description: "كم يكلف السكن في جدة؟ أرقام من وحداتنا المدرجة فعلاً، لا من إعلانات السوق.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <GuidePage />;
}
