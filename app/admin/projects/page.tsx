import type { Metadata } from "next";
import { ProjectsPage } from "@/components/pages/g7/ProjectsPage";

export const metadata: Metadata = { title: "المشاريع · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminProjectsRoute() {
  return <ProjectsPage />;
}
