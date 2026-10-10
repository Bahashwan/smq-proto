"use client";
// /r/[name] · the marketer's public tracked link: stores the attribution (smq.ref, 30 days) and replaces the URL
// with the home page. Nothing is sent anywhere; the leads board reads the attribution in the real build.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { marketerBySlug } from "@/data";
import { Lockup } from "@/components/ui";
import { REF_DAYS } from "./MarketerPage";

export const REF_KEY = "smq.ref";

export function RefRedirect({ name }: { name: string }) {
  const router = useRouter();
  useEffect(() => {
    const m = marketerBySlug(name);
    // only an active marketer's link attributes; a suspended one opens the site without attribution
    if (m && m.stage === "active") {
      const at = Date.now();
      try {
        window.localStorage.setItem(REF_KEY, JSON.stringify({ slug: m.slug, marketerId: m.id, at, expiresAt: at + REF_DAYS * 24 * 3600 * 1000 }));
      } catch {
        /* private mode: the visit is not attributed */
      }
    }
    router.replace("/");
  }, [name, router]);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink">
      <Lockup tone="goldmark-white" height={36} />
    </div>
  );
}
