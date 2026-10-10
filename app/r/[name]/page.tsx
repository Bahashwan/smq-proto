import type { Metadata } from "next";
import { marketers } from "@/data";
import { RefRedirect } from "@/components/pages/g6/RefRedirect";

export const dynamicParams = false;
export function generateStaticParams() {
  return marketers.map((m) => ({ name: m.slug }));
}

export const metadata: Metadata = { title: "إس إم كيو العقارية", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <RefRedirect name={name} />;
}
