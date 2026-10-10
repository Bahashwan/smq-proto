import type { Metadata } from "next";
import { LoginPage } from "@/components/pages/g7/LoginPage";

export const metadata: Metadata = { title: "تسجيل الدخول · لوحة الإدارة", robots: { index: false, follow: false } };

export default function AdminLoginRoute() {
  return <LoginPage />;
}
