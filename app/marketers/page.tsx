import type { Metadata } from "next";
import { MarketerForm } from "@/components/pages/g5/MarketerForm";

export const metadata: Metadata = {
  title: "انضم كمسوّق",
  description: "سوّق وحدات SMQ برابطك الخاص. كل زيارة وضغطة واتساب تُحسب لك.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MarketerForm />;
}
