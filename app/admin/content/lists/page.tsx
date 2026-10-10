import type { Metadata } from "next";
import { ListsPage } from "@/components/pages/g8/ListsPage";

export const metadata: Metadata = { title: "القوائم · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminListsPageRoute() {
  return <ListsPage />;
}
