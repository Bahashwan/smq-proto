import type { Metadata } from "next";
import { Hub } from "@/components/pages/g5/Hub";

export const metadata: Metadata = {
  title: "تعاون معنا",
  description: "ثلاثة أبواب بحسب من أنت: المُلّاك، المكاتب المرخّصة، والمسوّقون.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Hub />;
}
