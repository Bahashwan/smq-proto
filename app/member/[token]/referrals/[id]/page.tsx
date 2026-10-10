import type { Metadata } from "next";
import { memberReferralParams } from "@/components/pages/g6/data";
import { MemberReferral } from "@/components/pages/g6/member/MemberReferral";

export const dynamicParams = false;
export function generateStaticParams() {
  return memberReferralParams();
}

export const metadata: Metadata = { title: "سجل إحالة · صفحة عضو", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await params;
  return <MemberReferral officeId={token} referralId={id} />;
}
