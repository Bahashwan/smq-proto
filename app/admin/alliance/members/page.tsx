import type { Metadata } from "next";
import { MembersPage } from "@/components/pages/g9/MembersPage";

export const metadata: Metadata = { title: "الأعضاء · غرفة التحالف", robots: { index: false, follow: false } };

export default function AdminAllianceMembersRoute() {
  return <MembersPage />;
}
