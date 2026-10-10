import type { Metadata } from "next";
import { NeedsConfirmationPage } from "@/components/pages/g8/NeedsConfirmationPage";

export const metadata: Metadata = { title: "يحتاج تأكيداً · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminNeedsConfirmationRoute() {
  return <NeedsConfirmationPage />;
}
