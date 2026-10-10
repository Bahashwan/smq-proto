import type { Metadata } from "next";
import { units, unitBySlug } from "@/data/units";
import { GalleryPage } from "@/components/pages/g3/GalleryPage";
import { realFilesFor } from "@/components/pages/g3/realFiles";

export const dynamicParams = false;

export function generateStaticParams() {
  return units.map((u) => ({ code: u.slug }));
}

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const u = unitBySlug(code);
  return { title: u ? `صور ${u.type === "roof-villa" ? "فيلا الروف" : u.nameAr} · ${u.code}` : "الصور", robots: { index: false, follow: false } };
}

export default async function Page({ params }: Props) {
  const { code } = await params;
  return <GalleryPage slug={code} realFiles={realFilesFor()} />;
}
