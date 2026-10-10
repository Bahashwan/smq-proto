import type { Metadata } from "next";
import { marketerById, marketers } from "@/data/marketers";
import { MarketerDetailPage } from "@/components/pages/g9/MarketerDetailPage";

export const dynamicParams = false;
export function generateStaticParams() {
  return marketers.map((m) => ({ id: m.id.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const m = marketerById(id);
  return { title: `${m?.name ?? id} · المسوّقون`, robots: { index: false, follow: false } };
}

export default async function AdminMarketerRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MarketerDetailPage id={id} />;
}
