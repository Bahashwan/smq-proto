import type { Metadata } from "next";
import { offices } from "@/data";
import { MemberReport } from "@/components/pages/g6/member/MemberReport";

export const dynamicParams = false;
export function generateStaticParams() {
  return offices.map((o) => ({ token: o.id }));
}

export const metadata: Metadata = { title: "تقرير الطلب الشهري · للأعضاء", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <MemberReport officeId={token} />;
}
