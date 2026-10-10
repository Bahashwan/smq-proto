import type { Metadata } from "next";
import { ContactPage } from "@/components/pages/g4/ContactPage";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "أسرع طريق: واتساب. نرد خلال ساعات العمل، السبت إلى الخميس.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ContactPage />;
}
