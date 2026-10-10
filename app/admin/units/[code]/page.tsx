import type { Metadata } from "next";
import { units, unitBySlug } from "@/data/units";
import { UnitEditorPage } from "@/components/pages/g7/UnitEditorPage";

export const dynamicParams = false;
export function generateStaticParams() {
  return units.map((u) => ({ code: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  return { title: `${unitBySlug(code)?.code ?? code} · الوحدات`, robots: { index: false, follow: false } };
}

export default async function AdminUnitRoute({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <UnitEditorPage slug={code} />;
}
