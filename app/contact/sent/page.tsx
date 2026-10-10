import type { Metadata } from "next";
import { ContactSentPage } from "@/components/pages/g4/ContactSentPage";

export const metadata: Metadata = {
  title: "وصلتنا رسالتك",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ContactSentPage />;
}
