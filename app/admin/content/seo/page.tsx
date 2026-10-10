import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { SeoPage } from "@/components/pages/g8/SeoPage";

export const metadata: Metadata = { title: "عناوين البحث والمعاينة · لوحة الإدارة", robots: { index: false, follow: false } };

/** The OG PNGs present in public/og at build time (npm run og writes them). */
function ogFiles(): string[] {
  try {
    return fs.readdirSync(path.join(process.cwd(), "public", "og")).filter((f) => f.endsWith(".png"));
  } catch {
    return [];
  }
}

export default function AdminSeoRoute() {
  return <SeoPage ogFiles={ogFiles()} />;
}
