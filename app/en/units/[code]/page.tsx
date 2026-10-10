import type { Metadata } from "next";
import { units, unitBySlug } from "@/data/units";
import { EnUnitPage } from "@/components/pages/g3/EnUnitPage";
import { realFilesFor } from "@/components/pages/g3/realFiles";

export const dynamicParams = false;

export function generateStaticParams() {
  return units.map((u) => ({ code: u.slug }));
}

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const u = unitBySlug(code);
  const title = u ? `${u.nameEn ?? u.code} · ${u.building === "RZ" ? "Rose" : "Yasmin"} · ${u.code}` : "Unit";
  return {
    title,
    robots: { index: false, follow: false },
    openGraph: { title, locale: "en_US", images: [{ url: u?.slug === "rz-a" ? "/og/unit-rz-a.png" : "/og/home.png", width: 1200, height: 630 }] },
  };
}

export default async function Page({ params }: Props) {
  const { code } = await params;
  return <EnUnitPage slug={code} realFiles={realFilesFor()} />;
}
