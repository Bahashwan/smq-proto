import type { Metadata } from "next";
import { projectById, projects } from "@/data/projects";
import { ProjectEditorPage } from "@/components/pages/g7/ProjectEditorPage";

export const dynamicParams = false;
export function generateStaticParams() {
  return projects.filter((p) => !p.autoGroup).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${projectById(id)?.nameAr ?? id} · المشاريع`, robots: { index: false, follow: false } };
}

export default async function AdminProjectRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectEditorPage id={id} />;
}
