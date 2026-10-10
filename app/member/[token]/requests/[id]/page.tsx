import type { Metadata } from "next";
import { memberRequestParams } from "@/components/pages/g6/data";
import { MemberRequest } from "@/components/pages/g6/member/MemberRequest";

export const dynamicParams = false;
export function generateStaticParams() {
  return memberRequestParams();
}

export const metadata: Metadata = { title: "طلب في حي تغطيه · صفحة عضو", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ token: string; id: string }> }) {
  const { token, id } = await params;
  return <MemberRequest officeId={token} requestId={id} />;
}
