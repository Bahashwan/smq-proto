import type { Metadata } from "next";
import { publicProjects, projectBySlug } from "@/data/projects";
import { ProjectPage } from "@/components/pages/g4/ProjectPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return publicProjects().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  const title = p ? `${p.nameAr} · مشروع رقم ${p.code}` : "المشروع";
  const og = `/og/project-${slug}.png`;
  return {
    title,
    description: p?.descriptionAr,
    robots: { index: false, follow: false },
    openGraph: { title, description: p?.descriptionAr, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [og] },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ProjectPage slug={slug} />;
}
