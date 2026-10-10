// /en · EN-Home-M (LTR, cuts mirrored); the wrapper, lang/dir and the Latin face come from app/en/layout.tsx.
import type { Metadata } from "next";
import { EnHome } from "@/components/pages/g1/EnHome";
import { seo } from "@/data/content";
import { fromPrice } from "@/data/selectors";
import { fmtNum } from "@/lib/format";

const row = seo.find((r) => r.key === "home");
const title = row?.titleEn ?? "SMQ Real Estate";
const description = row?.descriptionEn?.replace("{from_price}", fmtNum(fromPrice() ?? 0));

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  robots: { index: false, follow: false },
  alternates: { languages: { ar: "/" } },
  openGraph: { title, description, locale: "en_US", siteName: "SMQ Real Estate", images: [{ url: "/og/home.png", width: 1200, height: 630 }] },
};

export default function EnHomePage() {
  return <EnHome />;
}
