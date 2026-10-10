import type { Metadata } from "next";
import { approvals } from "@/data/approvals";
import { ApprovalPage } from "@/components/pages/g7/ApprovalPage";

export const dynamicParams = false;
export function generateStaticParams() {
  return approvals.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `طلب ${id} · طلبات الموافقة`, robots: { index: false, follow: false } };
}

export default async function AdminApprovalRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ApprovalPage id={id} />;
}
