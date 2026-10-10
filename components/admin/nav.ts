// Admin navigation · items, order and hrefs exactly as the boards list them (Admin-Overview-D sidebar, Admin-M tabs)
// with the routes from docs/route-map.md «16–22» and «34–37».
import type { ComponentType } from "react";
import { IconAnalytics, IconApprovals, IconContent, IconLeads, IconOverview, IconProjects, IconSettings, IconUnits, IconVisitors } from "./icons";

export type NavKey = "overview" | "approvals" | "units" | "projects" | "leads" | "analytics" | "visitors" | "marketers" | "alliance" | "content" | "users";

export interface NavItem {
  key: NavKey;
  label: string;
  href: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  /** Gold = needs the manager's action; outline = informational. */
  countTone?: "gold" | "outline";
  group: "main" | "collaborate" | "bottom";
}

export const ADMIN_NAV: NavItem[] = [
  { key: "overview", label: "نظرة عامة", href: "/admin", icon: IconOverview, group: "main" },
  { key: "approvals", label: "طلبات الموافقة", href: "/admin/approvals", icon: IconApprovals, countTone: "gold", group: "main" },
  { key: "units", label: "الوحدات", href: "/admin/units", icon: IconUnits, group: "main" },
  { key: "projects", label: "المشاريع", href: "/admin/projects", icon: IconProjects, group: "main" },
  { key: "leads", label: "الطلبات الواردة", href: "/admin/leads", icon: IconLeads, countTone: "outline", group: "main" },
  { key: "analytics", label: "تحليلات البحث", href: "/admin/analytics", icon: IconAnalytics, group: "main" },
  { key: "visitors", label: "الزوار", href: "/admin/visitors", icon: IconVisitors, group: "main" },
  { key: "marketers", label: "المسوّقون", href: "/admin/marketers", countTone: "outline", group: "collaborate" },
  { key: "alliance", label: "غرفة التحالف", href: "/admin/alliance", countTone: "gold", group: "collaborate" },
  { key: "content", label: "المحتوى والأسئلة", href: "/admin/content", icon: IconContent, group: "collaborate" },
  { key: "users", label: "الإعدادات والمستخدمون", href: "/admin/users", icon: IconSettings, group: "bottom" },
];

export const COLLABORATE_GROUP_LABEL = "تعاون معنا";

export interface PhoneTab {
  key: NavKey;
  label: string;
  href: string;
}

/** Admin-M tab row: in-page anchors on /admin, الواردة → /admin/leads, التحالف → /admin/alliance. */
export const PHONE_TABS: PhoneTab[] = [
  { key: "overview", label: "نظرة عامة", href: "/admin" },
  { key: "approvals", label: "الموافقات", href: "/admin#approvals" },
  { key: "leads", label: "الواردة", href: "/admin/leads" },
  { key: "units", label: "الوحدات", href: "/admin#units" },
  { key: "analytics", label: "البحث", href: "/admin#stats" },
  { key: "visitors", label: "الزوار", href: "/admin#visitors" },
  { key: "alliance", label: "التحالف", href: "/admin/alliance" },
];

export type NavCounts = Partial<Record<NavKey, number>>;

/** The nav key for a pathname under /admin (sub-pages map to their section). */
export function navKeyFromPath(path: string): NavKey | undefined {
  if (!path.startsWith("/admin")) return undefined;
  const rest = path.slice("/admin".length);
  if (rest === "" || rest === "/") return "overview";
  const seg = rest.split("/")[1];
  return ADMIN_NAV.find((n) => n.key === seg)?.key;
}
