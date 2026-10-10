import type { Metadata } from "next";
import { contentHub } from "@/data/content";
import { PageEditorPage } from "@/components/pages/g8/PageEditorPage";

export const dynamicParams = false;
export function generateStaticParams() {
  return contentHub.pages.map((p) => ({ page: p.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params;
  const p = contentHub.pages.find((x) => x.key === page);
  return { title: `${p?.pageAr ?? "صفحة"} · المحتوى · لوحة الإدارة`, robots: { index: false, follow: false } };
}

export default async function AdminPageEditorRoute({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  return <PageEditorPage pageKey={page} />;
}
