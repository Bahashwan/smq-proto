import type { Metadata } from "next";
import { AddStep1 } from "@/components/pages/g5/AddStep1";

export const metadata: Metadata = {
  title: "أضف عقارك",
  description: "خدمة مجانية للمُلّاك: نموذج من ثلاث خطوات يأخذ دقيقتين، ثم نتواصل معك خلال 24 ساعة عمل.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AddStep1 />;
}
