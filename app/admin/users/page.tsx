import type { Metadata } from "next";
import { UsersPage } from "@/components/pages/g8/UsersPage";

export const metadata: Metadata = { title: "الإعدادات والمستخدمون · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminUsersRoute() {
  return <UsersPage />;
}
