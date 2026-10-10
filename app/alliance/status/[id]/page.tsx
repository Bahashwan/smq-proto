import type { Metadata } from "next";
import { allApplications } from "@/data";
import { ApplicationStatus } from "@/components/pages/g6/apply/Status";

export const dynamicParams = false;
export function generateStaticParams() {
  return allApplications.map((a) => ({ id: a.id }));
}

export const metadata: Metadata = { title: "حالة طلب الانضمام", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApplicationStatus id={id} />;
}
