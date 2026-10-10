import type { Metadata } from "next";
import { ReferralsPage } from "@/components/pages/g9/ReferralsPage";

export const metadata: Metadata = { title: "الإحالات والصفقات · غرفة التحالف", robots: { index: false, follow: false } };

export default function AdminAllianceReferralsRoute() {
  return <ReferralsPage />;
}
