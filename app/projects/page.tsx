import type { Metadata } from "next";
import { ProjectsPage } from "@/components/pages/g4/ProjectsPage";

export const metadata: Metadata = {
  title: "المشاريع",
  description: "كل مشروع بوحداته وأسعاره المعلنة وتاريخ تسليمه. الأرقام تتحدّث كلما بيعت وحدة.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ProjectsPage />;
}
