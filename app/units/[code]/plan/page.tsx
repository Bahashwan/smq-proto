import type { Metadata } from "next";
import { units, unitBySlug } from "@/data/units";
import { PlanPage } from "@/components/pages/g3/PlanPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return units.map((u) => ({ code: u.slug }));
}

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const u = unitBySlug(code);
  return { title: u ? `مخطط ${u.type === "roof-villa" ? "فيلا الروف" : `نموذج ${u.model}`} · ${u.code}` : "المخطط", robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const { code } = await params;
  return <PlanPage slug={code} />;
}
