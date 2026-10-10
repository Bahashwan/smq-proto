import type { Metadata } from "next";
import { officeById, offices } from "@/data/offices";
import { MemberDetailPage } from "@/components/pages/g9/MemberDetailPage";

export const dynamicParams = false;
export function generateStaticParams() {
  return offices.map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${officeById(id)?.fullName ?? id} · الأعضاء`, robots: { index: false, follow: false } };
}

export default async function AdminAllianceMemberRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MemberDetailPage id={id} />;
}
