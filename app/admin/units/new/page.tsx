import type { Metadata } from "next";
import { UnitEditorPage } from "@/components/pages/g7/UnitEditorPage";

export const metadata: Metadata = { title: "وحدة جديدة · الوحدات", robots: { index: false, follow: false } };

export default function AdminNewUnitRoute() {
  return <UnitEditorPage />;
}
