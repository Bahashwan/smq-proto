import type { Metadata } from "next";
import { units, unitBySlug } from "@/data/units";
import { UnitPage } from "@/components/pages/g3/UnitPage";
import { realFilesFor } from "@/components/pages/g3/realFiles";

export const dynamicParams = false;

export function generateStaticParams() {
  return units.map((u) => ({ code: u.slug }));
}

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const u = unitBySlug(code);
  const title = u ? `${u.type === "roof-villa" ? "فيلا روف" : u.nameAr} · ${u.buildingNameAr} · ${u.code}` : "الوحدة";
  const og = u?.slug === "rz-a" ? "/og/unit-rz-a.png" : "/og/home.png";
  return {
    title,
    robots: { index: false, follow: false },
    openGraph: { title, images: [{ url: og, width: 1200, height: 630 }] },
  };
}

export default async function Page({ params }: Props) {
  const { code } = await params;
  return <UnitPage slug={code} realFiles={realFilesFor()} />;
}
