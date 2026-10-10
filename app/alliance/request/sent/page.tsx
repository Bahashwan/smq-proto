import type { Metadata } from "next";
import { RequestSent } from "@/components/pages/g2/RequestSent";

export const metadata: Metadata = { title: "أُرسل طلبك إلى التحالف", robots: { index: false, follow: false } };

export default function AllianceRequestSentPage() {
  return <RequestSent />;
}
