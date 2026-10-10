"use client";
// /admin/approvals has no board of its own: it opens the newest open submission (highest request number; 2026-1043
// with the fixtures). Static page, client redirect (static export has no server redirects).
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { approvals } from "@/data/approvals";
import { effectiveApprovalStatus } from "@/data/selectors";
import { useStore } from "@/lib/store";
import { G7Shell } from "./shell";

export function newestApprovalId(overrides?: Parameters<typeof effectiveApprovalStatus>[1]): string {
  const byNumber = [...approvals].sort((a, b) => (a.id < b.id ? 1 : -1));
  const open = byNumber.find((a) => ["new", "awaiting-photos"].includes(effectiveApprovalStatus(a, overrides)));
  return (open ?? byNumber[0]).id;
}

export function ApprovalsRedirect() {
  const router = useRouter();
  const overrides = useStore((s) => s.approvals);
  const target = newestApprovalId(overrides);
  useEffect(() => {
    router.replace(`/admin/approvals/${target}${window.location.search}`);
  }, [router, target]);
  return (
    <G7Shell active="approvals" title="طلبات الموافقة">
      <p className="text-label font-normal text-muted" role="status">
        يفتح أحدث طلب: <a href={`/admin/approvals/${target}`} className="font-bold text-gold-text underline" dir="ltr">{target}</a>
      </p>
    </G7Shell>
  );
}
