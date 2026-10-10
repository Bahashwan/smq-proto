import type { Metadata } from "next";
import { marketers } from "@/data";
import { MarketerPage } from "@/components/pages/g6/MarketerPage";

export const dynamicParams = false;
export function generateStaticParams() {
  return marketers.map((m) => ({ token: m.token }));
}

export const metadata: Metadata = { title: "صفحة مسوّق", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <MarketerPage token={token} />;
}
