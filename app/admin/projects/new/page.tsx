import type { Metadata } from "next";
import { ProjectEditorPage } from "@/components/pages/g7/ProjectEditorPage";

export const metadata: Metadata = { title: "مشروع جديد · المشاريع", robots: { index: false, follow: false } };

export default function AdminNewProjectRoute() {
  return <ProjectEditorPage />;
}
